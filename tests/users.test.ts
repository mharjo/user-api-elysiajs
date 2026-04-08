import { describe, it, expect, beforeEach } from "bun:test";
import { app } from "../src/index";
import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";
import { eq } from "drizzle-orm";

describe("Users API", () => {
  beforeEach(async () => {
    // Clear sessions then users due to FK (if any, though not strictly enforced in schema but good practice)
    await db.delete(sessions);
    await db.delete(users);
  });

  describe("POST /api/users (Register)", () => {
    it("should register a new user successfully", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Arjo",
            email: "arjo@localhost",
            password: "rahasia",
          }),
        })
      );

      const result = await response.json();
      expect(response.status).toBe(200);
      expect(result).toEqual({ data: "OK" });
    });

    it("should return 400 if email is already registered", async () => {
      // Pre-register
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Arjo",
            email: "arjo@localhost",
            password: "rahasia",
          }),
        })
      );

      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Arjo Lagi",
            email: "arjo@localhost",
            password: "rahasia",
          }),
        })
      );

      const result = await response.json();
      expect(response.status).toBe(400);
      expect(result.error).toBe("Email sudah terdaftar");
    });

    it("should return validation error if fields are missing", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Arjo",
            // email and password missing
          }),
        })
      );

      expect(response.status).toBe(422); // Elysia default for validation error
    });

    it("should return validation error if name is too long", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "A".repeat(300),
            email: "long@localhost",
            password: "test",
          }),
        })
      );

      expect(response.status).toBe(422);
    });
  });

  describe("POST /api/users/login", () => {
    beforeEach(async () => {
      // Register a user for login tests
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Arjo",
            email: "arjo@localhost",
            password: "rahasia",
          }),
        })
      );
    });

    it("should login successfully with correct credentials", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "arjo@localhost",
            password: "rahasia",
          }),
        })
      );

      const result = await response.json();
      expect(response.status).toBe(200);
      expect(result.data).toBeDefined(); // Token
    });

    it("should return 400 if user not found", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "salah@localhost",
            password: "rahasia",
          }),
        })
      );

      const result = await response.json();
      expect(response.status).toBe(400);
      expect(result.error).toBe("Email atau password salah");
    });

    it("should return 400 if password is wrong", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "arjo@localhost",
            password: "salah",
          }),
        })
      );

      const result = await response.json();
      expect(response.status).toBe(400);
      expect(result.error).toBe("Email atau password salah");
    });
  });

  describe("GET /api/users/current", () => {
    let token: string;

    beforeEach(async () => {
      // Register and login to get token
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Arjo",
            email: "arjo@localhost",
            password: "rahasia",
          }),
        })
      );

      const loginRes = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "arjo@localhost",
            password: "rahasia",
          }),
        })
      );
      const loginResult = await loginRes.json();
      token = loginResult.data;
    });

    it("should get current user profile successfully", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      const result = await response.json();
      expect(response.status).toBe(200);
      expect(result.data.name).toBe("Arjo");
      expect(result.data.email).toBe("arjo@localhost");
      expect(result.data.password).toBeUndefined(); // Password must be excluded
    });

    it("should return 401 if token is missing", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
        })
      );

      const result = await response.json();
      expect(response.status).toBe(401);
      expect(result.error).toBe("Unauthorized");
    });

    it("should return 401 if token is invalid", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: { Authorization: `Bearer salah-token` },
        })
      );

      const result = await response.json();
      expect(response.status).toBe(401);
      expect(result.error).toBe("Unauthorized");
    });
  });

  describe("DELETE /api/users/logout", () => {
    let token: string;

    beforeEach(async () => {
      // Register and login to get token
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Arjo",
            email: "arjo@localhost",
            password: "rahasia",
          }),
        })
      );

      const loginRes = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "arjo@localhost",
            password: "rahasia",
          }),
        })
      );
      const loginResult = await loginRes.json();
      token = loginResult.data;
    });

    it("should logout successfully and delete session", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      const result = await response.json();
      expect(response.status).toBe(200);
      expect(result.data).toBe("OK");

      // Verify session is gone from DB
      const session = await db.query.sessions.findFirst({
        where: eq(sessions.token, token),
      });
      expect(session).toBeUndefined();
    });

    it("should return 401 if token is missing", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
        })
      );

      const result = await response.json();
      expect(response.status).toBe(401);
      expect(result.error).toBe("Unauthorized");
    });

    it("should return 401 if token is invalid", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: { Authorization: `Bearer salah-token` },
        })
      );

      const result = await response.json();
      expect(response.status).toBe(401);
      expect(result.error).toBe("Unauthorized");
    });
  });
});
