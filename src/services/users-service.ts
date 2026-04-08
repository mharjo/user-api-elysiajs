import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const UserService = {
  async register(data: typeof users.$inferInsert) {
    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (existingUser) {
      throw new Error("Email sudah terdaftar");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Save to database
    await db.insert(users).values({
      ...data,
      password: hashedPassword,
    });

    return { data: "OK" };
  },

  async login(data: Pick<typeof users.$inferInsert, "email" | "password">) {
    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (!user) {
      throw new Error("Email atau password salah");
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error("Email atau password salah");
    }

    // Generate token
    const token = crypto.randomUUID();

    // Store session
    await db.insert(sessions).values({
      token,
      userId: user.id,
    });

    return { data: token };
  },

  async getCurrentUser(token: string) {
    if (!token) {
      throw new Error("Unauthorized");
    }

    // Find session
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.token, token),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Exclude password
    const { password, ...userWithoutPassword } = user;

    return { data: userWithoutPassword };
  },
};
