import { db } from "../db";
import { users } from "../db/schema";
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
};
