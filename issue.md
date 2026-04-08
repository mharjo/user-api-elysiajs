# Fitur: Integrasi Swagger UI (Dokumentasi API Terpusat)

Dokumen ini memuat _blueprint_ atau draf panduan pengembangan untuk fitur Swagger UI pada aplikasi. Panduan ini dirancang bertahap agar mudah diterapkan.

## Tujuan Pengembangan (Objective)
Menyediakan antarmuka dokumentasi API interaktif pada aplikasi (biasanya memuat informasi *endpoint*, tipe method, skema *request/response body*, serta header) agar pengembang klien (Front-End / *Mobile Developer*) maupun user lain bisa bereksperimen menggunakan API secara *plug n play* langsung dari *browser*.

---

## Tahapan Implementasi (Todo List)

Ikuti urutan langkah kerja di bawah ini untuk mencapai perancangan yang ideal.

### Langkah 1: Instalasi Library (Dependensi)
ElysiaJS sudah memiliki arsitektur *plugin* ekosistem resmi untuk Swagger UI yang mematuhi standar OpenAPI 3.0.
1. Buka terminal (CLI) Anda, pastikan *directory* kerja yang aktif adalah pada garis utama project.
2. Tambahkan paket resmi milik elysia:
   ```bash
   bun add @elysiajs/swagger
   ```

### Langkah 2: Registrasi Plugin di Titik Utama (Entry Point)
1. Buka file utama inisialisasi aplikasi yaitu `src/index.ts`.
2. Lakukan *import* modul plugin Swagger di barisan teratas:
   ```typescript
   import { swagger } from "@elysiajs/swagger";
   ```
3. Daftarkan *middleware / plugin* tersebut ke dalam *chaining* `Elysia` instance (`app`). **Sangat Penting**: Pastikan `.use(swagger(...))` dipanggil dibagian awal / atas, sebelum `.use(usersRoute)`. Ini ditujukan agar Swagger dapat memetakan dan menyerap *metadata DTO / TypeBox* dari rute yang dideklarasikan setelahnya.
4. Jangan sekadar memanggil modul kosong, berikan pengaturan opsional agar lebih profesional. Tulis implementasi seperti blok berikut ini ke dalam tumpukan app:
   ```typescript
   export const app = new Elysia()
     .use(
       swagger({
         path: "/swagger",
         documentation: {
           info: {
             title: "User Authentication API",
             description: "Dokumentasi API untuk autentikasi dan manajemen pengguna",
             version: "1.0.0",
           },
           components: {
             securitySchemes: {
               bearerAuth: {
                 type: "http",
                 scheme: "bearer",
                 bearerFormat: "JWT",
               },
             },
           },
         },
       })
     )
     .use(usersRoute)
     // ... (.get() dan script sisa lainnya biarkan seperti sedia kala)
   ```

### Langkah 3: Ekstra Validasi dan Testing (Verification Phase)
1. Setelah menyimpan perubahan instruksi (Ctrl+S), tes apakah program bisa *compile / built up* sempurna:
   ```bash
   bun run src/index.ts
   ```
2. Buka *browser* (peramban web) favorit Anda, seperti Chrome, Edge, atau Firefox.
3. Kunjungi URL dokumentasi (*path* yang sudah kita definisikan pada blok instalasi tadi):  
   **`http://localhost:3000/swagger`**
4. *Checklist Penilaian Kesuksesan*:
   - [ ] Mengamati dan membuktikan bahwa laman HTML Swagger (Tema UI gelap/terang resmi) sudah tertampil elok tanpa *blank screen*.
   - [ ] Memeriksa bahwasanya ada sedikitnya 4 pendaftaran label API rute Anda di sana (misalnya `POST /api/users`, `POST /api/users/login`, `GET /api/users/current`, dan `DELETE /api/users/logout`).
   - [ ] Cobalah ekspansi salah satu blok misalnya **POST /login** dan lihat bahwa parameter *"email"* serta *"password"* terpapar jelas berkat perpaduan apik _Schema DTO TypeBox_ yang dulu direkatkan.
