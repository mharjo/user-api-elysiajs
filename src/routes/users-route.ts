import { Elysia, t } from "elysia";
import { UserService } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api/users" })
  .post(
    "/",
    async ({ body, set }) => {
      try {
        return await UserService.register(body);
      } catch (error: any) {
        if (error.message === "Email sudah terdaftar") {
          set.status = 400;
          return { error: error.message };
        }
        set.status = 500;
        return { error: "Terjadi kesalahan pada server" };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .post(
    "/login",
    async ({ body, set }) => {
      try {
        return await UserService.login(body);
      } catch (error: any) {
        if (error.message === "Email atau password salah") {
          set.status = 400;
          return { error: error.message };
        }
        set.status = 500;
        return { error: "Terjadi kesalahan pada server" };
      }
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .get("/current", async ({ headers, set }) => {
    try {
      const authHeader = headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Unauthorized");
      }

      const token = authHeader.replace("Bearer ", "");
      return await UserService.getCurrentUser(token);
    } catch (error: any) {
      if (error.message === "Unauthorized") {
        set.status = 401;
        return { error: error.message };
      }
      set.status = 500;
      return { error: "Terjadi kesalahan pada server" };
    }
  });
