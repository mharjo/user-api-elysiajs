import { Elysia, t } from "elysia";
import { UserService } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api/users" })
  .derive(({ headers }) => {
    const authHeader = headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return {
        token: authHeader.substring(7),
      };
    }
    return {
      token: null,
    };
  })
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
        name: t.String({ maxLength: 255, minLength: 1 }),
        email: t.String({ maxLength: 255 }),
        password: t.String({ maxLength: 255 }),
      }),
      response: {
        200: t.Object({ data: t.String() }),
        400: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
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
        email: t.String({ maxLength: 255 }),
        password: t.String({ maxLength: 255 }),
      }),
      response: {
        200: t.Object({ data: t.String() }),
        400: t.Object({ error: t.String() }),
        500: t.Object({ error: t.String() }),
      },
    }
  )
  .get("/current", async ({ token, set }) => {
    try {
      if (!token) {
        throw new Error("Unauthorized");
      }
      return await UserService.getCurrentUser(token);
    } catch (error: any) {
      if (error.message === "Unauthorized") {
        set.status = 401;
        return { error: error.message };
      }
      set.status = 500;
      return { error: "Terjadi kesalahan pada server" };
    }
  }, {
    response: {
      200: t.Object({
        data: t.Object({
          id: t.Number(),
          name: t.String(),
          email: t.String(),
          createdAt: t.Any(),
        })
      }),
      401: t.Object({ error: t.String() }),
      500: t.Object({ error: t.String() }),
    }
  })
  .delete("/logout", async ({ token, set }) => {
    try {
      if (!token) {
        throw new Error("Unauthorized");
      }
      return await UserService.logout(token);
    } catch (error: any) {
      if (error.message === "Unauthorized") {
        set.status = 401;
        return { error: error.message };
      }
      set.status = 500;
      return { error: "Terjadi kesalahan pada server" };
    }
  }, {
    response: {
      200: t.Object({ data: t.String() }),
      401: t.Object({ error: t.String() }),
      500: t.Object({ error: t.String() }),
    }
  });
