# User Authentication API

Aplikasi backend API mandiri yang dirancang khusus untuk menangani fungsionalitas manajemen pengguna (User Management) dan sistem autentikasi. Proyek ini dibangun mengedepankan performa tinggi dengan kerangka kerja modern.

## 🚀 Technology Stack & Libraries
Aplikasi ini memanfaatkan teknologi dan *library* state-of-the-art:
- **Runtime**: [Bun](https://bun.sh/) (JavaScript runtime yang super cepat)
- **Framework**: [ElysiaJS](https://elysiajs.com/) (Web framework yang sangat dioptimalkan untuk Bun)
- **Database**: MySQL
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) (TypeScript ORM yang aman dan berorientasi *Type-Safe*)
- **Driver**: `mysql2`
- **Security**: `bcryptjs` (untuk proses enkripsi/hashing *password* pengguna)

---

## 🏗️ Arsitektur & Struktur Folder

Aplikasi ini menggunakan pola arsitektur **Service-Route**. Pola ini memisahkan secara tegas antara gerbang penerimaan *request* (Route) dengan area pemrosesan logika bisnis utama (Service).

### Struktur Direktori:
```text
📦 user-api-elysiajs
 ┣ 📂 src
 ┃ ┣ 📂 db
 ┃ ┃ ┣ 📜 index.ts        # Konfigurasi instansi dan koneksi MySQL
 ┃ ┃ ┗ 📜 schema.ts       # Definisi pemetaan tabel Drizzle ORM
 ┃ ┣ 📂 routes
 ┃ ┃ ┗ 📜 users-route.ts  # Endpoint presentasi API & Validasi DTO (TypeBox)
 ┃ ┣ 📂 services
 ┃ ┃ ┗ 📜 users-service.ts# Pure business logic & operasi database (CRUD)
 ┃ ┗ 📜 index.ts          # Entry point aplikasi (Inisialisasi server Elysia)
 ┣ 📂 tests
 ┃ ┗ 📜 users.test.ts     # File skenario otomatis Unit/Integration Test
 ┣ 📜 drizzle.config.ts   # Konfigurasi migrasi Drizzle Kit
 ┣ 📜 .env.example        # Contoh environment variables keamanan
 ┗ 📜 package.json
```

### Konvensi Penamaan (Naming Conventions):
- **Folder `routes/`**: Penulisan menggunakan format "jamak" entitas lalu spesifikasi layanannya. Contoh: `users-route.ts`. Lapisan kode disini dibatasi pada pengaturan ekstensi Elysia, Header, Validasi HTTP, dll.
- **Folder `services/`**: Penulisan seragam selayaknya route. Contoh `users-service.ts`. Berisi serangkaian *object/class* untuk memanipulasi *database*, mengecek logika bisnis, hingga validasi kata sandi.

---

## 🗄️ Database Schema

Sistem memiliki relasi database sederhana untuk mengamankan identifikasi pelacakan data pengguna dan status sesi aktif.

1. **Tabel `users`**
   - `id`: *INT* (Primary Key, Auto Increment)
   - `name`: *VARCHAR(255)* (Maksimal 255 karakter, Tidak boleh dibiarkan kosong)
   - `email`: *VARCHAR(255)* (Harus karakter unik/belum pernah ada, Tidak boleh kosong)
   - `password`: *VARCHAR(255)* (Disimpan dalam wujud *encrypted hash*, Tidak boleh kosong)
   - `created_at`: *TIMESTAMP* (Otomatis tercatat pada saat row dibuat)

2. **Tabel `sessions`**
   - `id`: *INT* (Primary Key, Auto Increment)
   - `token`: *VARCHAR(255)* (Token UUID unik pengganti session log-in)
   - `user_id`: *INT* (Terkait kuat relasi referensial terhadap field id milik tabel users)
   - `created_at`: *TIMESTAMP* (Otomatis tercatat *timestamp*-nya)

---

## 🔌 API Endpoints
Seluruh rute pada modul *Users* aplikasi tergabung menjadi satu kesatuan di prefiks utama `/api/users`.

1. **Registrasi Pelanggan Baru**
   - **Endpoint**: `POST /api/users`
   - **Body (JSON)**: `name`, `email`, `password` (Dilengkapi validasi max length string 255).
   - **Respons Sukses**: `{ "data": "OK" }`

2. **Login Pelanggan**
   - **Endpoint**: `POST /api/users/login`
   - **Body (JSON)**: `email`, `password`
   - **Respons Sukses**: `{ "data": "<UUID_TOKEN_LOGIN_BARU>" }`

3. **Get Current User (Validasi Profile)**
   - **Endpoint**: `GET /api/users/current`
   - **Headers Wajib**: `Authorization: Bearer <TOKEN>`
   - **Respons Sukses**: Menampilkan rekaman detil informasi pengguna utuh namun atribut `password` di potong. Gagal memvalidasi akan mengeluarkan pesan status tertolak Unauthorized 401.

4. **Logout (Akhiri Sesi)**
   - **Endpoint**: `DELETE /api/users/logout`
   - **Headers Wajib**: `Authorization: Bearer <TOKEN>`
   - **Respons Sukses**: `{ "data": "OK" }` (Prosedur ini akan memastikan musnahnya record token secara berbarengan di penyimpanan tabel database).

---

## 🛠️ Step by Step - Cara Setup Project

Ikuti instruksi ringkas berikut untuk membangun lingkungan aplikasi di komputer Anda (Lokal):

1. **Jalankan Instalasi Dependensi Runtime**
   Pastikan Anda berada di root direktori project Terminal Anda, ketik:
   ```bash
   bun install
   ```
2. **Environment & MySQL Setup**
   Ubah kopian master dari file koneksi `.env.example` lalu namai menjadi `.env`. Kemudian sunting dan konfigurasikan rahasia identifikasi basis data Anda dengan mantap. ***Penting: Buatlah dahulu database target di GUI MySQL secara terpisah untuk penampung datanya.***
   ```text
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=api_elysiajs
   ```
3. **Migrasikan Struktur Tabel Database**
   Pastikan kapabilitas server MySQL lokal milikmu sudah nyala seutuhnya. Dorong skema database Anda dengan perintah Drizzle:
   ```bash
   bunx drizzle-kit push
   ```

---

## 🏃 Menjalankan Aplikasi (Running The App)

Nyalakan pemroses server tunggal utama via modul pengeksekusi unggulan *bun*:

```bash
bun run src/index.ts

# Alternatif: kamu bisa menjalankan fitur pemantau instan (auto re-load / hot-reload) saat masa perkode-an:
# bun --watch run src/index.ts
```
_Aplikasi Elysia kalian akan beroperasi dan berjalan mendengarkan trafik HTTP bawaannya di port `3000`._

---

## 🧪 Menguji Mesin (Unit Testing)

Guna menekan tingkatan galat pengembangan (Bugs Detection), sistem ini dilengkapi kumpulan skenario otomatis *End to End Unit Tests* penuh. Skrip tes akan dengan aman *membersihkan rekaman-tabel (teardown)* dahulu demi sterilisasi datanya jadi jangan ragu.

Pengujian bisa dieksekusi sekejap lewat perintah:
```bash
bun test
```
