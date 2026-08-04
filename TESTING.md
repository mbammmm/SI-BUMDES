# Panduan Testing SI-BUMDes (Updated)

## Persiapan
1. Pastikan PostgreSQL berjalan dan aplikasi aktif di http://localhost:3000
2. Login sebagai admin: `admin` / `admin123`
3. Siapkan data test: minimal 1 unit usaha, 5 akun COA, 1 user dengan role berbeda

---

## 1. AUTH & NAVIGASI

### 1.1 Login/Logout
- [ ] Buka `/login`, login dengan `admin` / `admin123`
- [ ] **Expected:** redirect ke dashboard, navbar muncul
- [ ] Klik **Keluar** di navbar
- [ ] **Expected:** redirect ke `/login`, navbar hilang
- [ ] Coba akses `/` tanpa login
- [ ] **Expected:** redirect ke `/login`

### 1.2 RBAC - Admin
- [ ] Login sebagai admin
- [ ] Cek navbar: harus menampilkan semua menu
- [ ] Akses `/master/pengguna`, harus bisa melihat daftar pengguna

### 1.3 RBAC - Pengawas (Read-only)
- [ ] Buat user dengan role **Pengawas** (jika belum ada)
- [ ] Login sebagai Pengawas di incognito window
- [ ] **Expected:** masuk ke dashboard
- [ ] Cek navbar: harus ada Dashboard, Laporan, dll. TIDAK ada menu input
- [ ] Akses `/keuangan/transaksi`
- [ ] **Expected:** bisa melihat daftar transaksi, TIDAK ada form input
- [ ] Coba akses `/master/pengguna`
- [ ] **Expected:** redirect ke dashboard atau blank page
- [ ] Coba POST ke `/api/keuangan/transaksi` via Postman/curl
- [ ] **Expected:** 403 Forbidden

### 1.4 RBAC - Bendahara
- [ ] Login sebagai Bendahara
- [ ] Cek navbar: harus ada Transaksi, Jurnal, Laporan
- [ ] Tidak ada: Manajemen Pengguna, Manajemen Peran
- [ ] Akses `/keuangan/transaksi`
- [ ] **Expected:** bisa melihat DAN ada form input transaksi

---

## 2. MODUL KEUANGAN

### 2.1 Transaksi Harian
- [ ] Buka `/keuangan/transaksi`
- [ ] Isi form transaksi:
  - Tanggal: hari ini
  - Unit Usaha: pilih salah satu
  - Jenis: **Pemasukan**
  - Nominal: `5000000`
  - Akun: pilih `Kas` (1000)
  - Keterangan: `Setoran modal awal`
- [ ] Klik **Simpan Transaksi**
- [ ] **Expected:** pesan "Transaksi berhasil disimpan", data muncul di tabel
- [ ] Cek transaksi baru di tabel:
  - Warna hijau untuk pemasukan
  - Format: `+5.000.000`
- [ ] Tambah transaksi pengeluaran:
  - Jenis: **Pengeluaran**
  - Nominal: `1000000`
  - Akun: `Beban Operasional` (5000)
  - Keterangan: `Beban listrik`
- [ ] **Expected:** transaksi muncul dengan warna merah, format `-1.000.000`

### 2.2 Jurnal Umum
- [ ] Buka `/keuangan/jurnal`
- [ ] **Expected:** daftar jurnal muncul sesuai transaksi yang dibuat
- [ ] Setiap jurnal harus memiliki:
  - Tanggal
  - Deskripsi
  - Daftar entri debit-kredit
  - Status Diposting

### 2.3 Neraca
- [ ] Buka `/keuangan/laporan/neraca`
- [ ] Pilih tanggal per akhir bulan
- [ ] **Expected:** muncul 3 kolom: Aset, Liabilitas, Ekuitas
- [ ] Cek total: Total Aset harus = Total Liabilitas + Ekuitas

### 2.4 Laba Rugi
- [ ] Buka `/keuangan/laporan/laba-rugi`
- [ ] Pilih periode yang ada transaksi
- [ ] **Expected:** muncul Pendapatan, Beban, dan Laba/Rugi

### 2.5 Arus Kas
- [ ] Buka `/keuangan/laporan/arus-kas`
- [ ] Pilih periode
- [ ] **Expected:** muncul ringkasan pemasukan, pengeluaran, net arus kas, dan tabel breakdown harian

### 2.6 SHU
- [ ] Buka `/keuangan/shu`
- [ ] Pilih periode
- [ ] **Expected:** muncul total pendapatan, total beban, SHU, dan pembagian SHU (10%/20%/10%/60%)

---

## 3. MODUL ASET

### 3.1 Registrasi Aset
- [ ] Buka `/aset`
- [ ] Klik **Tambah Aset**
- [ ] Isi form:
  - Nama: `Traktor Tangan`
  - Kategori: `Alat Pertanian`
  - Tanggal Perolehan: `2024-01-15`
  - Unit Usaha: pilih `Pertanian`
  - Nilai Perolehan: `50000000`
  - Masa Pakai: `5` tahun
  - Nilai Sisa: `5000000`
  - Kondisi: `Baik`
- [ ] Klik **Simpan Aset**
- [ ] **Expected:** aset muncul di tabel
- [ ] Cek kolom **Penyusutan/bln**: harus ada angka
  - Rumus: `(50.000.000 - 5.000.000) / (5 * 12) = 750.000/bulan`

### 3.2 QR Code
- [ ] Di tabel aset, klik icon **QR Code** di kolom paling kanan
- [ ] **Expected:** muncul modal dengan QR code
- [ ] QR code berisi: `id`, `name`, `category` aset

---

## 4. MODUL SURAT & ARSIP

### 4.1 Surat Keluar dengan Penomoran Otomatis
- [ ] Buka `/surat`, pastikan tab **Surat Keluar** aktif
- [ ] Klik **Buat Surat**
- [ ] Isi form:
  - Perihal: `Permohonan Dana`
  - Penerima: `Kepala Desa`
  - Tanggal Keluar: hari ini
  - Approver Pertama: pilih user dengan role **Direktur** atau **Bendahara**
  - Konten: `Isi surat permohonan dana...`
- [ ] Klik **Simpan Surat**
- [ ] **Expected:**
  - Pesan "Surat berhasil disimpan dengan nomor otomatis"
  - Nomor surat terisi otomatis format: `001/BUMDes/08/2026`
  - Status: **Draft**

### 4.2 Approval Workflow
- [ ] Setelah surat keluar dibuat, klik **Lihat Approval**
- [ ] **Expected:** muncul modal dengan:
  - Step 1 dengan nama approver
  - Status: **Menunggu**
  - Tombol **Setuju** dan **Tolak**
- [ ] Klik **Setuju**
- [ ] **Expected:** status berubah ke **Disetujui**, status surat menjadi **approved**

### 4.3 Surat Masuk
- [ ] Klik tab **Surat Masuk**
- [ ] Klik **Buat Surat**
- [ ] Isi form:
  - Perihal: `Undangan Rapat`
  - Pengirim: `Dinas PMD`
  - Tanggal Masuk: hari ini
  - Konten: `Undangan rapat koordinasi...`
- [ ] Klik **Simpan Surat**
- [ ] **Expected:** nomor otomatis format `IN-001/08/2026`, status **Diterima**

### 4.4 Arsip Digital
- [ ] Buka `/arsip`
- [ ] Klik **Upload Dokumen**
- [ ] Isi form:
  - Judul: `SK Pengurus BUMDes 2026`
  - Kategori: pilih yang ada
  - Tanggal Dokumen: `2024-01-01`
  - Tags: `SK, pengurus, 2026`
  - Path File: `/uploads/sk-pengurus.pdf`
- [ ] Klik **Simpan Dokumen**
- [ ] **Expected:** dokumen muncul di tabel arsip

---

## 5. NOTIFIKASI

### 5.1 Daftar Notifikasi
- [ ] Buka `/notifikasi`
- [ ] **Expected:** daftar notifikasi muncul (jika ada)
- [ ] Klik **Tandai semua dibaca**
- [ ] **Expected:** semua notifikasi menjadi status dibaca

### 5.2 Notifikasi Badge
- [ ] Buat notifikasi baru (via API atau fitur lain)
- [ ] Cek navbar: harus ada badge merah dengan jumlah notifikasi belum dibaca
- [ ] Klik notifikasi untuk menandai dibaca
- [ ] **Expected:** badge hilang atau angka berkurang

---

## 6. DASHBOARD

### 6.1 Statistik
- [ ] Buka `/` (Dashboard)
- [ ] **Expected:** muncul 4 kartu statistik:
  - Total Transaksi
  - Total Aset
  - Total Surat
  - Surat Draft

### 6.2 Filter
- [ ] Pilih Unit Usaha tertentu
- [ ] Klik **Terapkan Filter**
- [ ] **Expected:** statistik dan data terbaru sesuai filter
- [ ] Klik **Reset**
- [ ] **Expected:** kembali ke tampilan tanpa filter

### 6.3 Transaksi Terbaru
- [ ] **Expected:** daftar 5 transaksi terbaru dengan deskripsi, tanggal, nominal

### 6.4 Surat Terbaru
- [ ] **Expected:** daftar 5 surat terbaru dengan perihal, nomor, status

---

## 7. EDGE CASES & VALIDASI

### 7.1 Validasi Form
- [ ] Coba submit form transaksi dengan nominal `0` atau negatif
- [ ] **Expected:** error "Nominal transaksi harus lebih dari 0"
- [ ] Coba submit form kosong
- [ ] **Expected:** browser validation message

### 7.2 XSS Protection
- [ ] Di form surat, isi konten dengan: `<script>alert('XSS')</script>`
- [ ] Klik simpan
- [ ] **Expected:** tidak muncul alert, tapi ditampilkan sebagai plain text

### 7.3 RBAC bypass
- [ ] Login sebagai user dengan role **Pengawas**
- [ ] Coba akses `/keuangan/transaksi` langsung di address bar
- [ ] **Expected:** bisa melihat, tapi tidak bisa input
- [ ] Coba akses `/master/pengguna` langsung
- [ ] **Expected:** redirect ke dashboard

---

## 8. RESPONSIVENESS

### 8.1 Desktop (1920x1080)
- [ ] Navbar menampilkan semua menu
- [ ] Tabel tampil penuh

### 8.2 Tablet (768px)
- [ ] Navbar menyembunyikan label menu, cuma icon
- [ ] Form tetap 2 kolom

### 8.3 Mobile (375px)
- [ ] Form menjadi 1 kolom
- [ ] Tabel bisa di-scroll horizontal

---

## HASIL TESTING

Tanggal: _______________
Tester: _______________

Total Fitur Diuji: __/__
Bug Ditemukan: __
Status: [ ] Lulus [ ] Perlu Perbaikan [ ] Gagal

Catatan:
