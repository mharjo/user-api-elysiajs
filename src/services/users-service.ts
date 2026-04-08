import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const UserService = {
  /**
   * Mendaftarkan pengguna baru ke dalam sistem.
   * Fungsi ini akan mengecek duplikasi email, melakukan hashing pada password,
   * dan menyimpan data pengguna ke tabel `users`.
   * 
   * @param data - Objek berisi `name`, `email`, dan `password`.
   * @returns Respons berhasil `{ data: "OK" }`.
   * @throws Error jika email sudah terdaftar sebelumnya.
   */
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

  /**
   * Mengautentikasi pengguna berdasarkan kombinasi email dan password.
   * Fungsi ini akan memverifikasi keberadaan email, mencocokkan hash password,
   * dan membuat token sesi (UUID) baru yang disimpan di tabel `sessions`.
   * 
   * @param data - Objek berisi `email` dan `password`.
   * @returns Respons berisi token sesi `{ data: "<UUID>" }`.
   * @throws Error "Email atau password salah" jika kredensial tidak valid.
   */
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

  /**
   * Mengambil data profil pengguna yang sedang login berdasarkan token sesi.
   * Berfungsi sekaligus memeriksa kelayakan otorisasi pengguna. Field `password`
   * akan dibuang dari objek data sebelum dikembalikan untuk alasan keamanan.
   * 
   * @param token - String token otorisasi dari header Bearer.
   * @returns Objek memuat data pengguna `{ data: userWithoutPassword }`.
   * @throws Error "Unauthorized" jika token kosong atau tidak ditemukan di database.
   */
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

  /**
   * Mengakhiri sesi pengguna aktif (Logout).
   * Menghapus secara permanen record sesi pengguna di tabel `sessions` yang 
   * memiliki token identik dengan input.
   * 
   * @param token - String token sesi milik pengguna.
   * @returns Respons konfirmasi sukses `{ data: "OK" }`.
   * @throws Error "Unauthorized" bila referensi token tidak valid.
   */
  async logout(token: string) {
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

    // Delete session
    await db.delete(sessions).where(eq(sessions.token, token));

    return { data: "OK" };
  },
};
