# 🤖 AI Coding Agent Guidelines
Dokumen ini berisi standar kerja & aturan wajib bagi AI Agent (Kilo AI) di repository proyek **SI-BUMDes (Sistem Informasi Terpadu BUMDes)**.

---

## 1. Project Context & Environment
- **Development Environment (saat ini):** Windows 11 x64, coding & testing dilakukan secara lokal (`localhost`) di PC desktop menggunakan VS Code + Kilo AI.
- **Target Production Environment (rencana deploy):** VPS berbasis Linux (Ubuntu 24.04 disarankan). Kode **harus ditulis cross-platform** sejak sekarang — lihat aturan kompatibilitas di Bagian 2 — supaya proses pindah ke VPS nanti mulus tanpa perlu tulis ulang.
- **Runtime:** Node.js (LTS) — versi yang sama dipakai baik di Windows (sekarang) maupun Linux (nanti).
- **Database:** PostgreSQL — sekarang jalan lokal di Windows (installer resmi atau Docker Desktop/WSL2). Saat deploy ke VPS, database diinstal ulang sebagai service Linux dan skema dibuat lewat `prisma migrate deploy` — **bukan** hasil copy file database dari Windows.
- **Project Type:** Web Application berbasis Next.js (TypeScript, App Router) — PWA dengan dukungan mode offline (kerja offline + sinkronisasi otomatis saat koneksi tersedia lagi).
- **Dokumen Acuan Wajib:** Sebelum mengerjakan tugas apa pun, agent **WAJIB** membaca `PRD_Sistem_Informasi_BUMDes.md` (dan `SCHEMA.md` jika sudah tersedia) sebagai acuan kebutuhan fungsional, hak akses per peran, dan struktur data. Jangan berasumsi sendiri jika ada di PRD.
Use environment variables (`.env`) untuk data sensitif (`DATABASE_URL`, secret auth, dll). Jangan pernah simpan kredensial/API key langsung di dalam kode.

- Email notifikasi opsional: konfigurasi via variabel `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `EMAIL_FROM` di `.env`. Jika `SMTP_HOST` tidak diisi, sistem notifikasi tetap berfungsi via in-app notifications saja.

---

## 2. Code Quality & Security
- Tulis kode yang modular, mudah dibaca, dan konsisten dengan struktur project (Next.js App Router, Prisma schema).
- Gunakan TypeScript secara ketat (`strict: true`) — hindari `any` kecuali benar-benar diperlukan dan beri komentar alasannya.
- Semua akses database **WAJIB** lewat Prisma (parameterized query) — dilarang menulis raw SQL string tanpa alasan kuat, untuk mencegah SQL Injection.
- Validasi & sanitasi semua input dari form (terutama input transaksi keuangan, surat, dan data aset) untuk mencegah XSS/injection.
- Setiap endpoint/route handler yang mengubah data (create/update/delete) **WAJIB** memeriksa role & permission pengguna (RBAC) sesuai matriks hak akses di PRD Bagian 5 — jangan pernah asumsikan pembatasan di sisi frontend saja sudah cukup aman.
- Data transaksi keuangan, aset, dan surat yang sudah diposting **tidak boleh dihapus permanen** (hard delete) — gunakan soft-delete/pembatalan dengan audit trail, sesuai PRD Bagian 10.
- Sebelum menyelesaikan tugas, pastikan kode telah divalidasi dan bebas dari kesalahan (`npx tsc --noEmit`, `npm run lint`, dan `npm run build`), serta jalankan unit test jika tersedia.

**Kompatibilitas Windows → Linux (WAJIB diperhatikan sejak Fondasi):**
- Perhatikan huruf besar/kecil pada nama file & path import (mis. `./Button` vs `button.tsx`) — aman di Windows, tapi **error di Linux** karena Linux case-sensitive.
- Jangan commit folder `node_modules`, `.next`, atau `.env` ke Git — pastikan sudah masuk `.gitignore`. Saat deploy ke VPS, dependency di-install ulang lewat `npm install`, bukan disalin dari Windows.
- Hindari perintah shell spesifik Windows di dalam script `package.json` (mis. `del`, `copy`) — gunakan tool cross-platform (`rimraf`, `cross-env`, dll) supaya script yang sama jalan juga di Linux.

---

## 3. Git Workflow & CI/CD Trigger (WAJIB)
1. **Granular Commit:** Lakukan `git commit` untuk setiap 1 tugas/fitur kecil yang selesai dikerjakan. Gunakan format konvensi pesan commit (contoh: `feat: ...` atau `fix: ...`).
2. **Push ke Remote:** Setelah komit berhasil dan dipastikan bebas error, kamu **WAJIB** menjalankan perintah:
   `git push origin main`

   > ⚠️ **Catatan Penting (Fase Saat Ini):** VPS belum disewa & pipeline CI/CD belum dikonfigurasi, jadi untuk saat ini `git push` berfungsi sebagai **backup kode ke remote repository (GitHub)**. Begitu VPS sudah aktif dan GitHub Actions dikonfigurasi, `git push origin main` akan menjadi pemicu (*trigger*) otomatis untuk deploy ke VPS — pertahankan kebiasaan commit & push granular ini dari sekarang supaya transisinya mulus nanti.
3. **Deploy Lokal (Manual, untuk sekarang):** Setelah push, jalankan build & (re)start aplikasi secara manual di PC lokal — misal `npm run build` lalu `npm run start` (atau restart container jika memakai Docker Desktop).

---

## 4. Restrictions (Yang Dilarang)
- ❌ Dilarang melakukan `git push` jika kodingan masih bermasalah/error.
- ❌ Dilarang menjalankan perintah terminal berskala destruktif (mis. `Remove-Item -Recurse -Force` di root drive/PowerShell, `rm -rf` di Git Bash/WSL, `DROP DATABASE`, `prisma migrate reset --force`, dll) tanpa persetujuan.
- ❌ Dilarang mengubah struktur folder utama aplikasi tanpa instruksi spesifik.
- ❌ Dilarang menghapus atau melewati (bypass) pencatatan audit trail dan pengecekan RBAC demi mempercepat pengerjaan fitur.
- ❌ Dilarang mengubah `schema.prisma` yang sudah berjalan di production tanpa membuat migration terpisah yang aman (tidak boleh menyebabkan kehilangan data).

---

## 5. Database Backup & Cron
- Setiap VPS deployment wajib memiliki script backup database otomatis harian.
- Script backup: `scripts/backup-db.sh` (Linux) — melakukan `pg_dump` dan kompresi gzip.
- Setup cron: jalankan `bash scripts/setup-cron.sh` di VPS untuk menambahkan job harian pukul 02:00.
- Backup disimpan di `/var/backups/si-bumdes/` dan otomatis dihapus setelah 30 hari.
- Untuk trigger manual backup via UI: login sebagai Admin Sistem, buka `/backup`.
- CRITICAL: Jalankan `npx prisma generate` dan `npx prisma migrate deploy` setelah pull sebelum build & restart.
