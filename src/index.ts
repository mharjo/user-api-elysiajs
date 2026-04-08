import { Elysia } from "elysia";
import { usersRoute } from "./routes/users-route";

export const app = new Elysia()
  .use(usersRoute)
  .get("/", () => ({ status: "ok", message: "Elysia + Drizzle + MySQL is running" }));

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
