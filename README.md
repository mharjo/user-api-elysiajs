# User Authentication API

Aplikasi backend API yang dirancang untuk menangani manajemen pengguna (*User Management*) dan sistem autentikasi. Proyek ini dikembangkan dengan mengutamakan performa tinggi menggunakan ekosistem pengembangan modern.

## 🚀 Teknologi Utama & *Library*
Aplikasi ini dibangun menggunakan teknologi berikut:
- **Runtime**: [Bun](https://bun.sh/) (Runtime JavaScript berkinerja tinggi)
- **Framework**: [ElysiaJS](https://elysiajs.com/) (Web framework yang dioptimalkan untuk Bun)
- **Database**: MySQL
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) (ORM TypeScript dengan dukungan *Type-Safe*)
- **Driver**: `mysql2`
- **Keamanan**: `bcryptjs` (Digunakan untuk proses *hashing password*)

---

## 🏗️ Arsitektur & Struktur Folder

Aplikasi ini secara spesifik mengadopsi pola arsitektur **Service-Route**. Pola ini secara jelas memisahkan lapisan pengaturan jalur (*Routing*) dari lapisan pemrosesan logika bisnis (*Service*).

### Struktur Direktori:
```text
📦 user-api-elysiajs
 ┣ 📂 src
 ┃ ┣ 📂 db
 ┃ ┃ ┣ 📜 index.ts        # Konfigurasi instansi dan koneksi MySQL
 ┃ ┃ ┗ 📜 schema.ts       # Definisi skema tabel Drizzle ORM
 ┃ ┣ 📂 routes
 ┃ ┃ ┗ 📜 users-route.ts  # Definisi Endpoint API & Validasi DTO (TypeBox)
 ┃ ┣ 📂 services
 ┃ ┃ ┗ 📜 users-service.ts# Logika bisnis utama & operasi database (CRUD)
 ┃ ┗ 📜 index.ts          # Entry point aplikasi (Inisialisasi server Elysia)
 ┣ 📂 tests
 ┃ ┗ 📜 users.test.ts     # Skenario pengujian penuh (Unit Test & Integration Test)
 ┣ 📜 drizzle.config.ts   # Konfigurasi Drizzle Kit untuk migrasi database
 ┣ 📜 .env.example        # Berkas contoh konfigurasi environment variables
 ┗ 📜 package.json
```

### Konvensi Penamaan (*Naming Conventions*):
- **Folder `routes/`**: Menggunakan format *plural* atau jamak untuk entitas (contoh: `users-route.ts`). Lapisan kode ini difokuskan pada pengaturan respons API, ekstraksi Header, pengembalian kode status HTTP, dan perlindungan masukan DTO.
- **Folder `services/`**: Menyesuaikan dengan format *routes* (contoh: `users-service.ts`). File berisi kumpulan logika terisolasi untuk memanipulasi operasi basis data dan pengecekan keamanan utama.


---

## 🗄️ Skema Database

Sistem ini memiliki dua tabel utama untuk menyimpan data otentikasi serta status sesi.

1. **Tabel `users`**
   - `id`: *INT* (*Primary Key*, Auto Increment)
   - `name`: *VARCHAR(255)* (Wajib diisi)
   - `email`: *VARCHAR(255)* (Wajib diisi dan nilainya harus bersifat unik)
   - `password`: *VARCHAR(255)* (Disimpan melalui algoritma enkripsi satu arah, wajib diisi)
   - `created_at`: *TIMESTAMP* (Dicatat secara otomatis oleh sistem waktu basis data)

2. **Tabel `sessions`**
   - `id`: *INT* (*Primary Key*, Auto Increment)
   - `token`: *VARCHAR(255)* (Token berformat UUID sebagai tanda pengenal sesi valid pengguna)
   - `user_id`: *INT* (*Foreign Key* merujuk pada tabel `users`)
   - `created_at`: *TIMESTAMP*

---

## 🔌 Dokumentasi REST API (*Endpoints*)
Seluruh titik akses API dikelompokkan di bawah parameter prefiks utama `/api/users`. Anda juga dapat menjelajahi fungsionalitasnya secara GUI melalui fitur interaktif **Swagger**.

1. **Registrasi Pengguna**
   - **Metode & Endpoint**: `POST /api/users`
   - **Body (JSON)**: `name`, `email`, `password` (Dilengkapi validasi *maximum length* sebesar 255 karakter).
   - **Respons Berhasil**: `{ "data": "OK" }`

2. **Login Pengguna**
   - **Metode & Endpoint**: `POST /api/users/login`
   - **Body (JSON)**: `email`, `password`
   - **Respons Berhasil**: `{ "data": "<UUID_TOKEN>" }`

3. **Memeriksa Profil Pengguna (*Get Current User*)**
   - **Metode & Endpoint**: `GET /api/users/current`
   - **Header Wajib**: `Authorization: Bearer <TOKEN>`
   - **Respons Berhasil**: Menampilkan data detail informasi profil pengguna murni dari basis data tanpa mengekspos atribut kata sandi. Kegagalan token memicu respons standar `401 Unauthorized`.

4. **Logout**
   - **Metode & Endpoint**: `DELETE /api/users/logout`
   - **Header Wajib**: `Authorization: Bearer <TOKEN>`
   - **Respons Berhasil**: `{ "data": "OK" }` (Proses eksekusi ini akan menghapus eksistensi sesi token yang aktif secara merata di dalam server *database*).

---

## 🛠️ Panduan Instalasi (*Project Setup*)

Ikuti petunjuk di bawah ini untuk mengonfigurasi proyek secara lokal:

1. **Instalasi Dependensi**
   Buka *terminal* Anda pada dasar direktori proyek, kemudian eksekusikan perintah:
   ```bash
   bun install
   ```
2. **Konfigurasi Environment**
   Salin *file* konfigurasi pelataran utama dari `.env.example` lalu simpanlah dengan ekstensi menjadi `.env`. Sunting keterangan nilai koneksi *database* sesuai spesifikasi server MySQL Anda. (Perhatian: Pastikan *database* kosongan sudah Anda sediakan sebelumnya).
   ```text
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=api_elysiajs
   ```
3. **Migrasi Database Terstruktur**
   Apabila *service* MySQL lokal Anda sudah terhubung, eksekusi migrasi skema tabel Drizzle menggunakan instruksi:
   ```bash
   bunx drizzle-kit push
   ```

---

## 🏃 Menjalankan Aplikasi (*Running The Application*)

Eksekusikan perintah berikut pada terminal CLI untuk menjalankan server perantara program:

```bash
bun run src/index.ts

# Gunakan argumen --watch untuk mengaktifkan pemuatan ulang server otomatis (Hot Reload / Watch Mode):
# bun --watch run src/index.ts
```
*Server API framework Elysia akan mengudara (Listen) standar pada port `3000`.* Kunjungi pustaka antarmuka pengguna interaktif pada rute URL `http://localhost:3000/swagger`.

---

## 🧪 Eksekusi Pengujian Otomatis (*Unit Testing*)

Aplikasi ini dibekali dengan modul fungsionalitas otomasi kode uji berformat *End-to-End* berskala penuh. Pengecekan teknis dirancang secara disiplin untuk menjaga konsistensi perbaikan (*Teardown Database*) sehingga keamanan statusnya dijamin bersih dari redundansi persilangan data.

Lakukan identifikasi pengujian perangkat dengan menjalankan kode ini:
```bash
bun test
```
