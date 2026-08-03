# Panduan Setup PostgreSQL di Windows (Tanpa Docker)

## Langkah 1: Download PostgreSQL

1. Buka browser, kunjungi:
   https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

2. Pilih versi **16.x** untuk **Windows x86-64**

3. Download installer berformat `.exe`

## Langkah 2: Install PostgreSQL

1. Jalankan file yang sudah didownload
2. Klik **Next** sampai ketemu bagian **Password**
3. Masukkan password untuk user `postgres`: **bumdes123**
4. Port: biarkan **5432** (default)
5. Locale: pilih **Default** atau sesuai kebutuhan
6. Klik **Next** → **Next** → **Finish**

## Langkah 3: Buat Database

1. Buka **pgAdmin 4** dari Start Menu
2. Saat pertama dibuka, klik **Servers** → masukkan password `bumdes123`
3. Klik kanan pada **Databases** → **Create** → **Database**
4. Isi:
   - **Database:** `si_bumdes`
   - **Owner:** `postgres`
5. Klik **Save**

## Langkah 4: Update File .env

1. Buka folder project: `E:\MILZAM\GANGGENG\BUMDES\Sistem Informasi BUMDES`
2. Cari file `.env` (kalau belum ada, salin dari `.env.example`)
3. Buka dengan Notepad, pastikan isinya:

```
DATABASE_URL="postgresql://postgres:bumdes123@localhost:5432/si_bumdes?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="ganti_dengan_secret_yang_acak_minimal_32_karakter"
APP_NAME="SI-BUMDes Maju Langgeng"
NODE_ENV="development"
```

4. Ganti `NEXTAUTH_SECRET` dengan teks acak (misal: `rahasia-bumdes-2026-xyz-123456789`)

5. Simpan file

## Langkah 5: Test Koneksi Database

Buka PowerShell di folder project, jalankan:

```
npx prisma db push
```

Kalau berhasil, kamu akan melihat pesan:
```
🚀  Your database is now in sync with your Prisma schema.
```

## Langkah 6: Isi Data Awal (Seed)

Jalankan:
```
npm run db:seed
```

Kalau berhasil, akan muncul:
```
Seed completed
```

Ini berarti sudah terisi:
- 7 peran pengguna
- 3 unit usaha
- COA dasar
- Akun admin (username: `admin`, password: `admin123`)

## Langkah 7: Jalankan Aplikasi

Jalankan:
```
npm run dev
```

Tunggu sampai muncul tulisan:
```
✓ Ready in 7.6s
Local: http://localhost:3000
```

Buka browser, kunjungi: **http://localhost:3000**

## Langkah 8: Login Pertama Kali

Masukkan:
- **Username:** `admin`
- **Password:** `admin123**

Setelah login, kamu akan melihat halaman utama sistem.

---

## 🎯 Jika Ada Error

### Error: "password authentication failed"
- Cek kembali password di `.env` harus sama dengan password PostgreSQL (`bumdes123`)

### Error: "database does not exist"
- Pastikan kamu sudah buat database `si_bumdes` di pgAdmin 4 (Langkah 3)

### Error: "connection refused"
- Pastikan PostgreSQL service berjalan:
  1. Tekan `Windows + R`, ketik `services.msc`
  2. Cari **postgresql-x64-16** (atau versi yang kamu install)
  3. Klik kanan → **Start**

---

## ✅ Setelah Semua Berhasil

Kamu akan melihat halaman depan aplikasi dengan logo BUMDes Maju Langgeng.

**Selanjutnya:** Kabari saya, kita lanjut ke pembuatan modul **Master Data** (CRUD profil BUMDes, unit usaha, COA, pengurus).
