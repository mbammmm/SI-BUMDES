# Panduan Testing Mendalam SI-BUMDes

## Persiapan
1. Pastikan PostgreSQL berjalan dan aplikasi aktif di http://localhost:3000
2. Login sebagai admin: `admin` / `admin123`
3. Siapkan data test: minimal 1 unit usaha, 5 akun COA, 1 user dengan role berbeda

---

## 1. TEST MASTER DATA

### 1.1 Profil BUMDes
- [ v ] Buka `/master/profil`
- [ v ] Edit nama BUMDes, alamat, telepon, email, NIB, nomor SK
- [ v ] Klik **Simpan**
- [ v ] **Expected:** muncul pesan "Profil berhasil disimpan"
- [ v ] Refresh halaman — data harus tetap ada

### 1.2 Unit Usaha
- [ v ] Buka `/master/unit-usaha`
- [ v ] Klik **Tambah Unit Usaha**
- [ v ] Isi form: nama, jenis, tanggal mulai, modal awal
- [ v ] Klik **Simpan**
- [ v ] **Expected:** unit usaha muncul di tabel bawah
- [ v ] Coba tambah 2 unit lagi (misal: Simpan Pinjam, Wisata)
- [ v ] **Expected:** total 5 unit usaha (3 default + 2 baru)

### 1.3 Chart of Account
- [ v ] Buka `/master/coa`
- [ v ] Tambah akun baru: kode `1101`, nama `Bank BCA`, kategori `Aset`, tipe `Debit`
- [ v ] **Expected:** akun muncul di tabel
- [ v ] Tambah akun: kode `4001`, nama `Pendapatan Simpan Pinjam`, kategori `Pendapatan`, tipe `Kredit`
- [ v ] **Expected:** akun muncul di tabel

---

## 2. TEST MODUL KEUANGAN

### 2.1 Transaksi Harian
- [ v ] Buka `/keuangan/transaksi`
- [ v ] Isi form transaksi:
  - Tanggal: hari ini
  - Unit Usaha: pilih salah satu
  - Jenis: **Pemasukan**
  - Nominal: `5000000`
  - Akun: pilih `Kas` (1000)
  - Keterangan: `Setoran modal awal`
- [ x ] Klik **Simpan Transaksi**
- [ x ] **Expected:** pesan "Transaksi berhasil disimpan", data muncul di tabel
- [ x ] Tambah transaksi lagi:
  - Jenis: **Pengeluaran**
  - Nominal: `1000000`
  - Akun: `Beban Operasional` (5000)
  - Keterangan: `Beban listrik`
- [ x ] **Expected:** transaksi kedua muncul di tabel dengan badge warna hijau/merah sesuai jenis
      !!! gagal simpan transaksi, error, devtool menunjukkan:
      main-app.js?v=1785768319245:1847 Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
    app-index.js:33 Warning: `value` prop on `input` should not be null. Consider using an empty string to clear the component or `undefined` for uncontrolled components.
    at input
    at div
    at div
    at form
    at div
    at ProfilPage (webpack-internal:///(app-pages-browser)/./src/app/master/profil/page.tsx:13:76)
    at ClientPageRoot (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/client-page.js:14:11)
    at InnerLayoutRouter (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:243:11)
    at RedirectErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:74:9)
    at RedirectBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:82:11)
    at NotFoundBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/not-found-boundary.js:84:11)
    at LoadingBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:349:11)
    at ErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/error-boundary.js:160:11)
    at InnerScrollAndFocusHandler (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:153:9)
    at ScrollAndFocusHandler (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:228:11)
    at RenderFromTemplateContext (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/render-from-template-context.js:16:44)
    at OuterLayoutRouter (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:370:11)
    at InnerLayoutRouter (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:243:11)
    at RedirectErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:74:9)
    at RedirectBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:82:11)
    at NotFoundBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/not-found-boundary.js:84:11)
    at LoadingBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:349:11)
    at ErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/error-boundary.js:160:11)
    at InnerScrollAndFocusHandler (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:153:9)
    at ScrollAndFocusHandler (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:228:11)
    at RenderFromTemplateContext (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/render-from-template-context.js:16:44)
    at OuterLayoutRouter (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:370:11)
    at InnerLayoutRouter (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:243:11)
    at RedirectErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:74:9)
    at RedirectBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:82:11)
    at NotFoundErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/not-found-boundary.js:76:9)
    at NotFoundBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/not-found-boundary.js:84:11)
    at LoadingBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:349:11)
    at ErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/error-boundary.js:160:11)
    at InnerScrollAndFocusHandler (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:153:9)
    at ScrollAndFocusHandler (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:228:11)
    at RenderFromTemplateContext (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/render-from-template-context.js:16:44)
    at OuterLayoutRouter (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:370:11)
    at main
    at div
    at body
    at html
    at RootLayout (Server)
    at RedirectErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:74:9)
    at RedirectBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:82:11)
    at NotFoundErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/not-found-boundary.js:76:9)
    at NotFoundBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/not-found-boundary.js:84:11)
    at DevRootNotFoundBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/dev-root-not-found-boundary.js:33:11)
    at ReactDevOverlay (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/react-dev-overlay/app/ReactDevOverlay.js:87:9)
    at HotReload (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/react-dev-overlay/app/hot-reloader-client.js:321:11)
    at Router (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/app-router.js:207:11)
    at ErrorBoundaryHandler (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/error-boundary.js:113:9)
    at ErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/error-boundary.js:160:11)
    at AppRouter (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/app-router.js:585:13)
    at ServerRoot (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/app-index.js:112:27)
    at Root (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/app-index.js:117:11)
window.console.error @ app-index.js:33
console.error @ hydration-error-info.js:63
printWarning @ react-dom.development.js:94
error @ react-dom.development.js:68
validateProperties$1 @ react-dom.development.js:5502
validatePropertiesInDevelopment @ react-dom.development.js:32621
setInitialProperties @ react-dom.development.js:33389
finalizeInitialChildren @ react-dom.development.js:35515
completeWork @ react-dom.development.js:19782
completeUnitOfWork @ react-dom.development.js:25963
performUnitOfWork @ react-dom.development.js:25759
workLoopSync @ react-dom.development.js:25464
renderRootSync @ react-dom.development.js:25419
performConcurrentWorkOnRoot @ react-dom.development.js:24504
workLoop @ scheduler.development.js:256
flushWork @ scheduler.development.js:225
performWorkUntilDeadline @ scheduler.development.js:534
hot-reloader-client.js:187 [Fast Refresh] rebuilding
hot-reloader-client.js:44 [Fast Refresh] done in 681ms
hot-reloader-client.js:187 [Fast Refresh] rebuilding
hot-reloader-client.js:44 [Fast Refresh] done in 661ms
hot-reloader-client.js:187 [Fast Refresh] rebuilding
hot-reloader-client.js:44 [Fast Refresh] done in 3755ms
:3000/api/keuangan/transaksi:1  Failed to load resource: the server responded with a status of 500 (Internal Server Error)
:3000/api/keuangan/transaksi:1  Failed to load resource: the server responded with a status of 500 (Internal Server Error)
:3000/api/keuangan/transaksi:1  Failed to load resource: the server responded with a status of 500 (Internal Server Error)


### 2.2 Jurnal Umum
- [ v ] Buka `/keuangan/jurnal`
- [ x ] **Expected:** daftar jurnal muncul (jika ada transaksi yang sudah diinput)
- [ x ] Setiap jurnal harus memiliki:
  - Tanggal
  - Deskripsi
  - Daftar entri debit-kredit
  - Status Draft/Diposting
    !!! tidak tampil karena gagal simpan transaksi

### 2.3 Laporan Keuangan

#### Neraca
- [ v ] Buka `/keuangan/laporan/neraca`
- [ v ] Pilih tanggal **per akhir bulan**
- [ v ] **Expected:** muncul 3 kolom:
  - Aset (Debit)
  - Liabilitas (Kredit)
  - Ekuitas (Kredit)
- [ v ] Cek total: **Total Aset harus = Total Liabilitas + Ekuitas**
- [ v ] Jika tidak seimbang, ada pesan "⚠ Neraca tidak seimbang"

#### Laba Rugi
- [ v ] Buka `/keuangan/laporan/laba-rugi`
- [ v ] Pilih periode: **1 bulan terakhir**
- [ v ] **Expected:** muncul 2 bagian:
  - Pendapatan (total kredit)
  - Beban (total debit)
  - **Laba/Rugi** = Pendapatan - Beban
- [ x ] Coba dengan periode yang ada transaksi
    !!! belum bisa coba dengan periode transaksi, karena gagal simpan transaksi

#### Arus Kas
- [ v ] Buka `/keuangan/laporan/arus-kas`
- [ v ] Pilih periode: **1 bulan terakhir**
- [ v ] **Expected:** muncul ringkasan:
  - Total Pemasukan
  - Total Pengeluaran
  - Net Arus Kas
  - Tabel breakdown harian

---

## 3. TEST MODUL ASET

### 3.1 Registrasi Aset
- [ v ] Buka `/aset`
- [ v ] Klik **Tambah Aset**
- [ v ] Isi form:
  - Nama: `Traktor Tangan`
  - Kategori: `Alat Pertanian`
  - Tanggal Perolehan: `2024-01-15`
  - Unit Usaha: pilih `Pertanian`
  - Nilai Perolehan: `50000000`
  - Masa Pakai: `5` tahun
  - Nilai Sisa: `5000000`
  - Kondisi: `Baik`
- [ v ] Klik **Simpan Aset**
- [ x ] **Expected:** aset muncul di tabel
- [ x ] Cek kolom **Penyusutan/bln**: harus ada angka (garis lurus)
  - Rumus: `(50.000.000 - 5.000.000) / (5 * 12) = 750.000/bulan`
    !!! gagal menambah aset, devtool menunjukkan:
    Failed to load resource: the server responded with a status of 500 (Internal Server Error)

### 3.2 QR Code
- [ x ] Di tabel aset, klik icon **QR Code** di kolom paling kanan
- [ x ] **Expected:** muncul modal dengan QR code
- [ x ] QR code berisi: `id`, `name`, `category` aset
  !!! belum muncul karena gagal simpan aset
---

## 4. TEST MODUL SURAT & ARSIP

### 4.1 Surat Keluar dengan Penomoran Otomatis
- [ v ] Buka `/surat`, pastikan tab **Surat Keluar** aktif
- [ v ] Klik **Buat Surat**
- [ v ] Isi form:
  - Perihal: `Permohonan Dana`
  - Penerima: `Kepala Desa`
  - Tanggal Keluar: hari ini
  - Approver Pertama: pilih user dengan role **Direktur** atau **Bendahara**
  - Konten: `Isi surat permohonan dana...`
- [ v ] Klik **Simpan Surat**
- [ x ] **Expected:**
  - Pesan "Surat berhasil disimpan dengan nomor otomatis"
  - Nomor surat terisi otomatis format: `001/BUMDes/08/2026`
  - Status: **Draft**
  !!! gagal menambah surat, devtool menunjukkan:
  Failed to load resource: the server responded with a status of 500 (Internal Server Error)

### 4.2 Approval Workflow
- [ x ] Setelah surat keluar dibuat, klik **Lihat Approval**
- [ x ] **Expected:** muncul modal dengan:
  - Step 1 dengan nama approver
  - Status: **Menunggu**
  - Tombol **Setuju** dan **Tolak**
- [ x ] Klik **Setuju**
- [ x ] **Expected:** status berubah ke **Disetujui**, status surat menjadi **approved**
  !!! belum bisa karena gagal menambah surat

### 4.3 Surat Masuk
- [ v ] Klik tab **Surat Masuk**
- [ v ] Klik **Buat Surat**
- [ v ] Isi form:
  - Perihal: `Undangan Rapat`
  - Pengirim: `Dinas PMD`
  - Tanggal Masuk: hari ini
  - Konten: `Undangan rapat koordinasi...`
- [ v ] Klik **Simpan Surat**
- [ x ] **Expected:** nomor otomatis format `IN-001/08/2026`, status **Diterima**
  !!! gagal menambah surat, devtool menunjukkan:
  Failed to load resource: the server responded with a status of 500 (Internal Server Error)

### 4.4 Arsip Digital
- [ v ] Buka `/arsip`
- [ v ] Klik **Upload Dokumen**
- [ v ] Isi form:
  - Judul: `SK Pengurus BUMDes 2026`
  - Kategori: pilih yang ada
  - Tanggal Dokumen: `2024-01-01`
  - Tags: `SK, pengurus, 2026`
  - Path File: `/uploads/sk-pengurus.pdf`
- [ x ] Klik **Simpan Dokumen**
- [ x ] **Expected:** dokumen muncul di tabel arsip
  !!! gagal menambah asset karena dropdown kategori tidak ada pilihan, sehingga tidak bisa di input
---

## 5. TEST MANAJEMEN PENGGUNA & RBAC

### 5.1 Tambah User Baru
- [ v ] Buka `/master/pengguna`
- [ v ] Klik **Tambah Pengguna**
- [ v ] Isi form:
  - Username: `bendahara`
  - Email: `bendahara@bumdes.test`
  - Nama: `Bendahara Test`
  - Password: `bendahara123`
  - Peran: pilih **Bendahara/Akuntan**
  - Status: Aktif
- [ v ] Klik **Simpan**
- [ v ] **Expected:** user baru muncul di tabel

### 5.2 Test RBAC - Login sebagai Bendahara
- [ v ] Buka `/login` di **Incognito Window**
- [ v ] Login: `bendahara` / `bendahara123`
- [ v ] **Expected:** masuk ke dashboard
- [ x ] Cek menu navbar:
  - Harus ada: **Transaksi, Jurnal, Laporan**
  - Tidak ada: **Manajemen Pengguna, Manajemen Peran**
- [ x ] Coba akses `/master/pengguna` langsung di address bar
- [ x ] **Expected:** di-redirect ke `/` atau tampil error 403
  !!! di navbar masih ada manajemen pengguna, manajemen peran dan lain2 (lengkap)
  !!! akses /master/pengguna masih bisa akses/terbuka halaman pengguna
  !!! saat buka halaman pengguna, tidak ada data yang ditampilkan (belum ada pengguna), padahal di akun admin sudah ada daftar pengguna.

### 5.3 Edit Role
- [ v ] Login kembali sebagai **admin**
- [ v ] Buka `/master/roles`
- [ v ] Klik edit pada role **Bendahara/Akuntan**
- [ v ] Ubah hak akses **Akuntansi** menjadi **Lihat** (hanya baca)
- [ v ] Klik **Perbarui**
- [ v ] **Expected:** role berhasil diperbarui
- [ v ] Login kembali sebagai `bendahara`, coba akses `/keuangan/transaksi`
- [ x ] **Expected:** tidak bisa menambah transaksi (hanya bisa lihat)
  !!! setelah role di perbarui, hak akses masih tetap. tidak berubah dan masih bisa mengakses fitur

### 5.4 Test Role Pengawas
- [ v ] Buat user baru dengan role **Pengawas**
- [ v ] Login sebagai Pengawas
- [ x ] **Expected:**
  - Bisa lihat dashboard
  - Bisa lihat laporan
  - Tidak ada menu tambah/edit/apakah ada form input
  - Tidak bisa akses halaman input transaksi, aset, surat
  !!! akses masih sama seperti admin
---

## 6. TEST DASHBOARD

### 6.1 Statistik
- [ v ] Buka `/` (Dashboard)
- [ v ] **Expected:** muncul 4 kartu statistik:
  - Total Transaksi (angka sesuai yang diinput)
  - Total Aset (angka sesuai yang didaftarkan)
  - Total Surat (angka sesuai yang dibuat)
  - Surat Draft (angka surat dengan status draft)

### 6.2 Transaksi Terbaru
- [ x ] **Expected:** daftar 5 transaksi terbaru dengan:
  - Deskripsi
  - Tanggal
  - Nominal dengan warna hijau/merah
    !!! kosong, karena tadi tidak bisa menambah transaksi

### 6.3 Surat Terbaru
- [ x ] **Expected:** daftar 5 surat terbaru dengan:
  - Perihal
  - Nomor surat
  - Status badge
    !!! kosong karena tadi tidak bisa menambah surat

---

## 7. TEST EDGE CASES & VALIDASI

### 7.1 Validasi Form
- [ v ] Coba submit form **kosong** (tanpa isi field)
- [ v ] **Expected:** browser showing "Please fill out this field"
- [ x ] Coba input transaksi dengan nominal **negatif**
- [ v ] Coba input akun dengan kode **duplikat**
  !!! poin nomor 3 tidak bisa, karena memang selalu gagal menambah transaksi

### 7.2 Soft Delete (Opsional)
- [ x ] Coba hapus unit usaha yang sedang dipakai di transaksi
- [ x ] **Expected:** error "Cannot delete or update a parent row"
  !!! tidak ada opsi hapus unit usaha

### 7.3 Audit Trail
- [ x ] Cek database: tabel `audit_logs`
- [ x ] **Expected:** harus tercatat setiap aksi create/update/delete
  !!! tidak bisa akses database, di pgAdmin 4, menunjukkan:
  failed to resolve host 'http://localhost:3000': [Errno 11001] getaddrinfo failed

### 7.4 XSS Protection
- [ x ] Di form surat, isi konten dengan: `<script>alert('XSS')</script>`
- [ x ] Klik simpan
- [ x ] **Expected:** tidak muncul alert, tapi ditampilkan sebagai plain text
  !!! gagal menambah surat karena error
---

## 8. TEST RESPONSIVENESS

### 8.1 Desktop
- [ x ] Resolusi 1920x1080
- [ x ] **Expected:** navbar menampilkan semua menu
- [ x ] Tabel tampil penuh
  !!! navbar terpotong tidak jelas

### 8.2 Tablet
- [ x ] Resolusi 768px width (DevTools)
- [ x ] **Expected:** navbar menyembunyikan label menu, cuma icon
- [ x ] Form tetap 2 kolom
  !!! navbar terpotong tidak jelas. dan tampilan persis seperti desktop

### 8.3 Mobile
- [ v ] Resolusi 375px width (DevTools)
- [ x ] **Expected:**
  - Navbar menumpuk icon
  - Form menjadi 1 kolom
  - Tabel bisa di-scroll horizontal
  !!! navbar tidak jelas ada yang terlewat batas seperti desktop

---

## 9. TEST CROSS-BROWSER

- [ v ] Chrome/Edge (Chromium)
- [ x ] Firefox
- [ x ] Safari (jika ada)
!!! bukan tidak bisa, tapi karena aku tidak punya aplikasi tersebut

---

## 10. LAPORAN BUG

Jika menemukan bug, catat dengan format:
```
[Tingkat: Kritis/Tinggi/Sedang/Rendah]
[Modul: Master Data/Keuangan/Aset/Surat/Arsip/Pengguna]
[Langkah reproduksi: 1. ... 2. ... 3. ...]
[Expected: ...]
[Actual: ...]
[Screenshot: ...]
```

---

## HASIL TESTING

Tanggal: _______________
Tester: _______________

Total Fitur Diuji: 50/50
Bug Ditemukan: banyak
Status: [ ] Lulus [ v ] Perlu Perbaikan [ ] Gagal

Catatan:
sangat banyak yang perlu di perbaiki. catatan bug setiap fitur aku tambahkan di bawah keterangan test fitur. dengan awalan tanda !!!.
tambahan: di halaman login tampil navbar. seharusnya tidak ada tampilan navbar di halaman login. saat navbar logout di klik. belum langsung menuju halaman login.


Ini error yang ditampilkan devtool. mungkin ada yang sudah terpotong:
react-dom.development.js:38560 Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
<meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
(index):1 <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
:3000/master/profil:1 <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
:3000/master/unit-usaha:1 <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
:3000/master/coa:1 <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
(index):1 <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
:3000/master/profil:1 <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
:3000/master/unit-usaha:1 <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
:3000/master/coa:1 <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
:3000/master/roles:1 <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
:3000/keuangan/laporan/laba-rugi:1 <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
:3000/keuangan/laporan/arus-kas:1 <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
:3000/keuangan/jurnal:1 <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
:3000/keuangan/transaksi:1 <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
:3000/master/roles:1 <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
:3000/master/pengguna:1 <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
:3000/master/coa:1 <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
:3000/arsip:1 <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. Please include <meta name="mobile-web-app-capable" content="yes">
app-index.js:33 Warning: `value` prop on `input` should not be null. Consider using an empty string to clear the component or `undefined` for uncontrolled components.
    at input
    at div
    at div
    at form
    at div
    at ProfilPage (webpack-internal:///(app-pages-browser)/./src/app/master/profil/page.tsx:13:76)
    at ClientPageRoot (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/client-page.js:14:11)
    at InnerLayoutRouter (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:243:11)
    at RedirectErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:74:9)
    at RedirectBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:82:11)
    at NotFoundBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/not-found-boundary.js:84:11)
    at LoadingBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:349:11)
    at ErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/error-boundary.js:160:11)
    at InnerScrollAndFocusHandler (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:153:9)
    at ScrollAndFocusHandler (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:228:11)
    at RenderFromTemplateContext (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/render-from-template-context.js:16:44)
    at OuterLayoutRouter (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:370:11)
    at InnerLayoutRouter (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:243:11)
    at RedirectErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:74:9)
    at RedirectBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:82:11)
    at NotFoundBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/not-found-boundary.js:84:11)
    at LoadingBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:349:11)
    at ErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/error-boundary.js:160:11)
    at InnerScrollAndFocusHandler (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:153:9)
    at ScrollAndFocusHandler (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:228:11)
    at RenderFromTemplateContext (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/render-from-template-context.js:16:44)
    at OuterLayoutRouter (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:370:11)
    at InnerLayoutRouter (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:243:11)
    at RedirectErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:74:9)
    at RedirectBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:82:11)
    at NotFoundErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/not-found-boundary.js:76:9)
    at NotFoundBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/not-found-boundary.js:84:11)
    at LoadingBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:349:11)
    at ErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/error-boundary.js:160:11)
    at InnerScrollAndFocusHandler (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:153:9)
    at ScrollAndFocusHandler (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:228:11)
    at RenderFromTemplateContext (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/render-from-template-context.js:16:44)
    at OuterLayoutRouter (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/layout-router.js:370:11)
    at main
    at div
    at body
    at html
    at RootLayout (Server)
    at RedirectErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:74:9)
    at RedirectBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/redirect-boundary.js:82:11)
    at NotFoundErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/not-found-boundary.js:76:9)
    at NotFoundBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/not-found-boundary.js:84:11)
    at DevRootNotFoundBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/dev-root-not-found-boundary.js:33:11)
    at ReactDevOverlay (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/react-dev-overlay/app/ReactDevOverlay.js:87:9)
    at HotReload (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/react-dev-overlay/app/hot-reloader-client.js:321:11)
    at Router (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/app-router.js:207:11)
    at ErrorBoundaryHandler (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/error-boundary.js:113:9)
    at ErrorBoundary (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/error-boundary.js:160:11)
    at AppRouter (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/components/app-router.js:585:13)
    at ServerRoot (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/app-index.js:112:27)
    at Root (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/client/app-index.js:117:11)
window.console.error @ app-index.js:33
hot-reloader-client.js:187 [Fast Refresh] rebuilding
hot-reloader-client.js:44 [Fast Refresh] done in 95ms
page.tsx:45  GET http://localhost:3000/api/master/pengguna 403 (Forbidden)
(anonymous) @ page.tsx:45
commitHookEffectListMount @ react-dom.development.js:21102
commitHookPassiveMountEffects @ react-dom.development.js:23154
commitPassiveMountOnFiber @ react-dom.development.js:23259
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23256
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23370
recursivelyTraversePassiveMountEffects @ react-dom.development.js:23237
commitPassiveMountOnFiber @ react-dom.development.js:23267
commitPassiveMountEffects @ react-dom.development.js:23225
flushPassiveEffectsImpl @ react-dom.development.js:26497
flushPassiveEffects @ react-dom.development.js:26438
eval @ react-dom.development.js:26172
workLoop @ scheduler.development.js:256
flushWork @ scheduler.development.js:225
performWorkUntilDeadline @ scheduler.development.js:534
postMessage
schedulePerformWorkUntilDeadline @ scheduler.development.js:572
requestHostCallback @ scheduler.development.js:585
unstable_scheduleCallback @ scheduler.development.js:444
scheduleCallback$2 @ react-dom.development.js:7990
scheduleTaskForRootDuringMicrotask @ react-dom.development.js:7954
processRootScheduleInMicrotask @ react-dom.development.js:7827
eval @ react-dom.development.js:8034
postMessage
schedulePerformWorkUntilDeadline @ scheduler.development.js:572
requestHostCallback @ scheduler.development.js:585
unstable_scheduleCallback @ scheduler.development.js:444
scheduleCallback$2 @ react-dom.development.js:7990
scheduleTaskForRootDuringMicrotask @ react-dom.development.js:7954
processRootScheduleInMicrotask @ react-dom.development.js:7827
eval @ react-dom.development.js:8034
setTimeout
InnerLayoutRouter @ layout-router.js:314
renderWithHooksAgain @ react-dom.development.js:11272
replaySuspendedComponentWithHooks @ react-dom.development.js:11219
replayFunctionComponent @ react-dom.development.js:16324
replaySuspendedUnitOfWork @ react-dom.development.js:25806
renderRootConcurrent @ react-dom.development.js:25578
performConcurrentWorkOnRoot @ react-dom.development.js:24504
workLoop @ scheduler.development.js:256
flushWork @ scheduler.development.js:225
performWorkUntilDeadline @ scheduler.development.js:534
postMessage
schedulePerformWorkUntilDeadline @ scheduler.development.js:572
requestHostCallback @ scheduler.development.js:585
unstable_scheduleCallback @ scheduler.development.js:444
scheduleCallback$2 @ react-dom.development.js:7990
scheduleTaskForRootDuringMicrotask @ react-dom.development.js:7954
processRootScheduleInMicrotask @ react-dom.development.js:7827
eval @ react-dom.development.js:8034
PendingScript
__webpack_require__.l @ webpack.js?v=1785770084092:257
__webpack_require__.f.j @ webpack.js?v=1785770084092:868
(anonymous) @ webpack.js?v=1785770084092:155
__webpack_require__.e @ webpack.js?v=1785770084092:154
fn.e @ webpack.js?v=1785770084092:391
loadChunk @ react-server-dom-webpack-client.browser.development.js:251
preloadModule @ react-server-dom-webpack-client.browser.development.js:173
resolveModule @ react-server-dom-webpack-client.browser.development.js:1819
processFullRow @ react-server-dom-webpack-client.browser.development.js:1908
processBinaryChunk @ react-server-dom-webpack-client.browser.development.js:2078
progress @ react-server-dom-webpack-client.browser.development.js:2159
Promise.then
startReadingFromStream @ react-server-dom-webpack-client.browser.development.js:2167
eval @ react-server-dom-webpack-client.browser.development.js:2179
Promise.then
createFromFetch @ react-server-dom-webpack-client.browser.development.js:2178
fetchServerResponse @ fetch-server-response.js:81
await in fetchServerResponse
InnerLayoutRouter @ layout-router.js:305
renderWithHooks @ react-dom.development.js:11121
mountIndeterminateComponent @ react-dom.development.js:16869
beginWork$1 @ react-dom.development.js:18458
beginWork @ react-dom.development.js:26927
performUnitOfWork @ react-dom.development.js:25748
workLoopConcurrent @ react-dom.development.js:25734
renderRootConcurrent @ react-dom.development.js:25690
performConcurrentWorkOnRoot @ react-dom.development.js:24504
workLoop @ scheduler.development.js:256
flushWork @ scheduler.development.js:225
performWorkUntilDeadline @ scheduler.development.js:534
postMessage
schedulePerformWorkUntilDeadline @ scheduler.development.js:572
requestHostCallback @ scheduler.development.js:585
unstable_scheduleCallback @ scheduler.development.js:444
scheduleCallback$2 @ react-dom.development.js:7990
scheduleTaskForRootDuringMicrotask @ react-dom.development.js:7954
processRootScheduleInMicrotask @ react-dom.development.js:7827
eval @ react-dom.development.js:8034
page.tsx:45  GET http://localhost:3000/api/master/pengguna 403 (Forbidden)
(anonymous) @ page.tsx:45
commitHookEffectListMount @ react-dom.development.js:21102
invokePassiveEffectMountInDEV @ react-dom.development.js:23980
invokeEffectsInDev @ react-dom.development.js:26852
legacyCommitDoubleInvokeEffectsInDEV @ react-dom.development.js:26835
commitDoubleInvokeEffectsInDEV @ react-dom.development.js:26816
flushPassiveEffectsImpl @ react-dom.development.js:26514
flushPassiveEffects @ react-dom.development.js:26438
eval @ react-dom.development.js:26172
workLoop @ scheduler.development.js:256
flushWork @ scheduler.development.js:225
performWorkUntilDeadline @ scheduler.development.js:534
postMessage
schedulePerformWorkUntilDeadline @ scheduler.development.js:572
requestHostCallback @ scheduler.development.js:585
unstable_scheduleCallback @ scheduler.development.js:444
scheduleCallback$2 @ react-dom.development.js:7990
scheduleTaskForRootDuringMicrotask @ react-dom.development.js:7954
processRootScheduleInMicrotask @ react-dom.development.js:7827
eval @ react-dom.development.js:8034
postMessage
schedulePerformWorkUntilDeadline @ scheduler.development.js:572
requestHostCallback @ scheduler.development.js:585
unstable_scheduleCallback @ scheduler.development.js:444
scheduleCallback$2 @ react-dom.development.js:7990
scheduleTaskForRootDuringMicrotask @ react-dom.development.js:7954
processRootScheduleInMicrotask @ react-dom.development.js:7827
eval @ react-dom.development.js:8034
setTimeout
InnerLayoutRouter @ layout-router.js:314
renderWithHooksAgain @ react-dom.development.js:11272
replaySuspendedComponentWithHooks @ react-dom.development.js:11219
replayFunctionComponent @ react-dom.development.js:16324
replaySuspendedUnitOfWork @ react-dom.development.js:25806
renderRootConcurrent @ react-dom.development.js:25578
performConcurrentWorkOnRoot @ react-dom.development.js:24504
workLoop @ scheduler.development.js:256
flushWork @ scheduler.development.js:225
performWorkUntilDeadline @ scheduler.development.js:534
postMessage
schedulePerformWorkUntilDeadline @ scheduler.development.js:572
requestHostCallback @ scheduler.development.js:585
unstable_scheduleCallback @ scheduler.development.js:444
scheduleCallback$2 @ react-dom.development.js:7990
scheduleTaskForRootDuringMicrotask @ react-dom.development.js:7954
processRootScheduleInMicrotask @ react-dom.development.js:7827
eval @ react-dom.development.js:8034
PendingScript
__webpack_require__.l @ webpack.js?v=1785770084092:257
__webpack_require__.f.j @ webpack.js?v=1785770084092:868
(anonymous) @ webpack.js?v=1785770084092:155
__webpack_require__.e @ webpack.js?v=1785770084092:154
fn.e @ webpack.js?v=1785770084092:391
loadChunk @ react-server-dom-webpack-client.browser.development.js:251
preloadModule @ react-server-dom-webpack-client.browser.development.js:173
resolveModule @ react-server-dom-webpack-client.browser.development.js:1819
processFullRow @ react-server-dom-webpack-client.browser.development.js:1908
processBinaryChunk @ react-server-dom-webpack-client.browser.development.js:2078
progress @ react-server-dom-webpack-client.browser.development.js:2159
Promise.then
startReadingFromStream @ react-server-dom-webpack-client.browser.development.js:2167
eval @ react-server-dom-webpack-client.browser.development.js:2179
Promise.then
createFromFetch @ react-server-dom-webpack-client.browser.development.js:2178
fetchServerResponse @ fetch-server-response.js:81
await in fetchServerResponse
InnerLayoutRouter @ layout-router.js:305
renderWithHooks @ react-dom.development.js:11121
mountIndeterminateComponent @ react-dom.development.js:16869
beginWork$1 @ react-dom.development.js:18458
beginWork @ react-dom.development.js:26927
performUnitOfWork @ react-dom.development.js:25748
workLoopConcurrent @ react-dom.development.js:25734
renderRootConcurrent @ react-dom.development.js:25690
performConcurrentWorkOnRoot @ react-dom.development.js:24504
workLoop @ scheduler.development.js:256
flushWork @ scheduler.development.js:225
performWorkUntilDeadline @ scheduler.development.js:534
postMessage
schedulePerformWorkUntilDeadline @ scheduler.development.js:572
requestHostCallback @ scheduler.development.js:585
unstable_scheduleCallback @ scheduler.development.js:444
scheduleCallback$2 @ react-dom.development.js:7990
scheduleTaskForRootDuringMicrotask @ react-dom.development.js:7954
processRootScheduleInMicrotask @ react-dom.development.js:7827
eval @ react-dom.development.js:8034
