# Product Requirements Document (PRD)
# Sistem Informasi Terpadu BUMDes (SI-BUMDes)

| | |
|---|---|
| **Versi Dokumen** | 1.0 (Draf Awal) |
| **Tanggal** | 3 Agustus 2026 |
| **Status** | Draf — untuk direview & disesuaikan sebelum development dimulai |
| **Target Stack Development** | VS Code + Kilo AI (AI coding agent) |
| **Environment Development (saat ini)** | Windows 11 x64, localhost |
| **Environment Production (rencana)** | VPS berbasis Linux (deploy menyusul setelah fondasi & modul inti siap) |
| **Model Deployment** | Hybrid — cloud-first dengan kemampuan kerja offline |
| **Strategi Rilis** | Full system, satu rilis besar (bukan MVP bertahap ke pengguna) |

> **Catatan penggunaan dokumen ini:** Ini adalah draf awal yang dibuat berdasarkan asumsi umum kebutuhan BUMDes di Indonesia. Sebelum mulai coding, luangkan waktu membaca ulang tiap bagian dan sunting yang tidak sesuai dengan kondisi BUMDes kamu — jumlah unit usaha, jumlah pengurus, kebiasaan kerja, dll. PRD yang akurat akan sangat membantu Kilo AI menghasilkan kode yang lebih tepat karena kamu bisa menempelkan bagian-bagian dokumen ini langsung sebagai konteks prompt.

---

## 1. Ringkasan Eksekutif

SI-BUMDes adalah platform digital terpadu untuk mengelola operasional administratif dan keuangan Badan Usaha Milik Desa (BUMDes) dalam satu sistem, menggantikan pencatatan manual/tersebar (Excel, buku fisik, WhatsApp) dengan satu sumber data yang konsisten. Sistem ini mencakup lima pilar utama: **Akuntansi & Keuangan**, **Manajemen Aset**, **Surat Menyurat**, **Kearsipan Digital**, dan **Manajemen Unit Usaha**, didukung modul pelengkap seperti dashboard laporan, master data, dan notifikasi.

Sistem dirancang **cloud-first namun tetap bisa dipakai saat koneksi internet terputus** (mode offline sementara dengan sinkronisasi otomatis), mengingat kondisi jaringan di banyak kantor desa yang belum stabil.

---

## 2. Latar Belakang & Masalah

BUMDes umumnya mengelola beberapa unit usaha sekaligus (simpan pinjam, air bersih, wisata desa, sewa alat, perdagangan, dll) dengan sumber daya pengurus yang terbatas. Masalah umum yang biasanya dihadapi:

- **Pencatatan keuangan tersebar** di buku kas manual atau Excel yang mudah salah/hilang, dan sulit direkonsiliasi antar unit usaha.
- **Aset tidak terdata rapi** — tidak jelas siapa yang pegang, kondisi terkini, dan nilai bukunya (penyusutan) tidak dihitung.
- **Surat menyurat manual** — penomoran surat rawan bentrok/duplikat, sulit melacak status tindak lanjut surat masuk, tidak ada riwayat approval yang jelas.
- **Arsip fisik rawan rusak/hilang**, sulit dicari saat dibutuhkan (misal saat audit atau permintaan Dinas/Kemendes).
- **Pelaporan ke pemangku kepentingan** (Kepala Desa, BPD, Dinas PMD, Kemendes PDTT) memakan waktu lama karena data harus direkap manual dari berbagai sumber.
- **Koneksi internet tidak selalu stabil**, sehingga aplikasi berbasis cloud murni berisiko tidak bisa dipakai saat dibutuhkan.

---

## 3. Tujuan Produk

1. Menyatukan seluruh proses administratif BUMDes (keuangan, aset, surat, arsip) dalam satu platform dengan satu sumber data.
2. Menghasilkan laporan keuangan BUMDes yang **sesuai kaidah pelaporan yang berlaku** secara cepat (harian/bulanan) tanpa rekap manual.
3. Memberi visibilitas real-time atas kondisi aset dan unit usaha kepada pengurus dan pengawas (Kepala Desa/BPD).
4. Mendigitalkan alur surat-menyurat lengkap dengan penomoran otomatis, disposisi, dan riwayat approval.
5. Menyediakan arsip digital yang mudah dicari dan aman dari kerusakan/kehilangan fisik.
6. Tetap bisa dioperasikan meski internet di kantor desa terputus sementara.

---

## 4. Ruang Lingkup

### 4.1 Dalam Lingkup (Fase pembangunan penuh — sesuai pilihan "full system")
- Modul Autentikasi & Manajemen Pengguna (RBAC)
- Modul Akuntansi & Keuangan
- Modul Manajemen Aset
- Modul Surat Menyurat
- Modul Kearsipan Digital
- Modul Manajemen Unit Usaha
- Modul Dashboard & Pelaporan
- Modul Master Data (profil BUMDes, pengurus, desa)
- Modul Notifikasi & Pengingat
- Kemampuan kerja offline (PWA) + sinkronisasi otomatis
- Audit trail (log siapa mengubah apa, kapan)

### 4.2 Di Luar Lingkup (dicatat sebagai potensi pengembangan lanjutan, bukan bagian rilis ini)
- Integrasi otomatis/API resmi ke Sistem Informasi Desa (SID) Kemendes PDTT (belum tentu tersedia publik — cukup sediakan fitur *export* format yang bisa diinput manual ke SID)
- Payment gateway / pembayaran online ke pihak ketiga
- Aplikasi mobile native terpisah (cukup PWA dulu — bisa "Add to Home Screen" di HP)
- Multi-tenant (mengelola banyak BUMDes berbeda dalam satu instalasi) — sistem ini diasumsikan untuk **satu BUMDes**. Jika ke depan ingin dijadikan produk yang dipakai banyak BUMDes lain, arsitekturnya perlu disesuaikan menjadi multi-tenant.
- Modul HR/payroll penuh (cukup pencatatan honor pengurus sederhana di akuntansi)

---

## 5. Pengguna & Peran

| Peran | Deskripsi | Contoh Pengguna |
|---|---|---|
| **Admin Sistem** | Kelola akun pengguna, konfigurasi sistem, backup | Sekretaris/operator IT BUMDes |
| **Direktur/Ketua BUMDes** | Approval tingkat tinggi, akses penuh ke semua laporan | Ketua Pelaksana Operasional |
| **Bendahara/Akuntan** | Kelola seluruh modul akuntansi & keuangan | Bendahara BUMDes |
| **Sekretaris** | Kelola surat menyurat & arsip | Sekretaris BUMDes |
| **Kepala Unit Usaha** | Input transaksi & aset untuk unit usahanya, lihat laporan unit sendiri | Kepala Unit Simpan Pinjam, Kepala Unit Wisata, dll |
| **Staf/Operator** | Input data harian sesuai izin akses yang diberikan | Staf administrasi |
| **Pengawas (Read-only)** | Lihat dashboard & laporan tanpa bisa mengubah data | Kepala Desa, BPD, Penasihat |

### 5.1 Matriks Hak Akses (ringkas)

| Modul | Admin | Direktur | Bendahara | Sekretaris | Kepala Unit | Staf | Pengawas |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Manajemen Pengguna | CRUD | Lihat | - | - | - | - | - |
| Akuntansi | CRUD | Lihat+Approve | CRUD | - | Input (unit sendiri) | Input terbatas | Lihat |
| Aset | CRUD | Approve | Lihat | - | CRUD (unit sendiri) | Input | Lihat |
| Surat Menyurat | CRUD | Approve/TTD | CRUD | CRUD | Lihat | Input draf | Lihat |
| Arsip | CRUD | Lihat | Lihat | CRUD | Lihat (unit sendiri) | Upload | Lihat |
| Dashboard/Laporan | Lihat | Lihat | Lihat | Lihat | Lihat (unit sendiri) | Lihat terbatas | Lihat |

*(CRUD = Create/Read/Update/Delete. Sesuaikan detail ini dengan struktur pengurus BUMDes kamu yang sebenarnya.)*

---

## 6. Arsitektur Teknis & Rekomendasi Tech Stack

Karena kamu memilih *"serahkan ke rekomendasi terbaik"*, berikut stack yang disarankan — dipilih dengan pertimbangan: (a) satu bahasa (TypeScript) di frontend & backend agar AI coding assistant seperti Kilo lebih konsisten membantu, (b) komunitas besar & dokumentasi banyak sehingga Kilo AI punya referensi kuat, (c) bisa dijalankan baik di VPS cloud maupun di PC/mini-server lokal kantor desa dengan konfigurasi yang sama (mendukung kebutuhan hybrid kamu), dan (d) biaya hosting terjangkau untuk skala BUMDes.

| Layer | Rekomendasi | Alasan Singkat |
|---|---|---|
| Bahasa | TypeScript | Type-safety mengurangi bug, AI coding assistant lebih akurat |
| Frontend | Next.js 14+ (App Router) + React | Fullstack framework, dukungan PWA baik |
| Styling/UI | Tailwind CSS + shadcn/ui | Cepat dibangun, tampilan rapi tanpa desainer khusus |
| Backend | Next.js API Routes / Route Handlers | Satu codebase, deployment lebih sederhana untuk tim kecil |
| Database | PostgreSQL | Relasional, kuat untuk data keuangan yang butuh integritas |
| ORM | Prisma | Skema jelas, migrasi mudah, ramah AI-assisted coding |
| Autentikasi | Auth.js (NextAuth) + RBAC custom | Siap pakai, bisa dikustom sesuai peran BUMDes |
| Mode Offline | PWA (Serwist/next-pwa) + IndexedDB (Dexie.js) | Cache halaman & antrian sinkronisasi saat offline |
| Penyimpanan File | Lokal disk (mode kantor) / S3-compatible (Cloudflare R2/MinIO) di cloud | Untuk arsip surat, foto aset, dokumen |
| Cetak Surat/Laporan (PDF) | Puppeteer atau @react-pdf/renderer | Cetak surat resmi & laporan keuangan ke PDF |
| QR/Barcode Aset | library `qrcode` | Label aset fisik yang bisa dipindai |
| Hosting | VPS + Docker Compose (App + PostgreSQL + Nginx/Caddy) | Bisa dipindah/dijalankan di server lokal kantor desa jika suatu saat dibutuhkan, dengan setup yang sama |
| Reverse Proxy/SSL | Caddy (otomatis HTTPS) | Setup minim, cocok untuk tim non-DevOps |

### 6.1 Strategi Online/Offline (Hybrid)

Karena kamu memilih *"utamanya online, bisa jalan offline juga"*, pendekatan yang direkomendasikan:

- **Satu instalasi sebagai sumber kebenaran (source of truth)** di-hosting di VPS cloud — bisa diakses dari mana saja (termasuk Kepala Desa yang ingin cek laporan dari luar kantor).
- Aplikasi dibangun sebagai **PWA (Progressive Web App)**: saat internet di kantor desa terputus, staf tetap bisa membuka aplikasi (sudah ter-cache di browser) dan **tetap input data** (transaksi kas, surat masuk, dll).
- Data yang diinput saat offline disimpan sementara di **IndexedDB browser** dengan status "menunggu sinkronisasi", ditandai jelas di UI (misal badge kuning "belum tersinkron").
- Saat koneksi kembali tersedia, sistem otomatis mengirim data tertunda ke server (background sync), dengan penanganan konflik sederhana (misal: data offline tidak menimpa data yang sudah diubah orang lain di server — user diberi notifikasi untuk review manual jika terjadi bentrok).
- Pendekatan ini sengaja **dibuat lebih sederhana** daripada membangun dua server terpisah (lokal + cloud) yang saling sinkron dua arah — itu jauh lebih kompleks dan berisiko tinggi untuk dikerjakan sendiri dengan AI coding assistant. Kalau nanti kebutuhan BUMDes berkembang jadi butuh server lokal fisik + cloud yang sinkron dua arah, itu bisa jadi proyek lanjutan tersendiri.

### 6.2 Alur Development → Deployment

- **Sekarang:** seluruh coding & testing dilakukan di localhost Windows 11 x64 menggunakan VS Code + Kilo AI. PostgreSQL dijalankan lokal (installer Windows atau Docker Desktop/WSL2).
- **Nanti:** setelah fondasi & modul inti stabil, project dipindahkan ke VPS Linux (Ubuntu 24.04) — lihat urutan di Bagian 12.
- Karena stack (Next.js/Node.js/Prisma) bersifat cross-platform, perpindahan ini seharusnya mulus selama beberapa aturan diikuti sejak awal coding (lihat `AGENTS.md` Bagian 2 — kompatibilitas Windows → Linux): hindari path/import yang salah huruf besar-kecil, jangan commit `node_modules`, hindari perintah shell khas Windows di script `package.json`.
- **Disarankan** memakai Docker Desktop untuk development di Windows (bukan wajib) — container yang jalan di Windows lewat WSL2 sebenarnya sudah berbasis Linux, jadi perilakunya identik saat nanti container yang sama dijalankan di VPS. Ini mengurangi risiko bug "jalan di laptop, error di server".
- Pemindahan kode ke VPS dilakukan lewat Git (push dari Windows ke GitHub → pull di VPS), bukan copy-paste file manual. Data di database tidak ikut pindah otomatis lewat migration — kalau ada data uji coba yang perlu dibawa, perlu `pg_dump`/`pg_restore` manual.

---

## 7. Modul & Kebutuhan Fungsional

### 7.1 Modul Autentikasi & Manajemen Pengguna
- Login dengan email/username + password (hash aman, misal bcrypt/argon2).
- Role-based access control sesuai matriks di Bagian 5.
- Reset password, manajemen sesi/logout otomatis setelah idle.
- Log aktivitas login (siapa, kapan, dari perangkat/IP mana).

### 7.2 Modul Akuntansi & Keuangan
- **Chart of Account (COA)** yang bisa disesuaikan per unit usaha, mengikuti struktur akun yang lazim dipakai BUMDes (kas, bank, piutang, persediaan, aset tetap, modal desa/penyertaan modal, pendapatan per unit usaha, beban operasional, dst).
- Pencatatan **jurnal umum** (entri debit-kredit) dan jurnal otomatis dari transaksi kas masuk/keluar sehari-hari (agar pengurus non-akuntan tidak perlu paham double-entry secara manual — cukup pilih "terima uang dari..." atau "bayar untuk...").
- **Buku besar** per akun, **neraca saldo**.
- Laporan keuangan utama: **Neraca (Laporan Posisi Keuangan)**, **Laporan Laba Rugi**, **Laporan Perubahan Ekuitas**, **Laporan Arus Kas**, dan **Catatan atas Laporan Keuangan (CaLK)** sederhana — format ini merujuk pada pedoman pelaporan keuangan BUMDes yang berlaku (lihat Bagian 19).
- Perhitungan **Sisa Hasil Usaha (SHU)** dan pembagiannya (ke Pendapatan Asli Desa, cadangan, dana sosial, dll sesuai AD/ART BUMDes).
- Pelaporan per **unit usaha** (P&L per unit) selain laporan konsolidasi BUMDes secara keseluruhan.
- Rekonsiliasi kas/bank sederhana.
- Export laporan ke PDF & Excel.
- Riwayat perubahan (tidak boleh hapus jurnal yang sudah diposting — hanya bisa buat jurnal koreksi/pembalik, sesuai prinsip audit trail akuntansi).

### 7.3 Modul Manajemen Aset
- Registrasi aset: nama, kategori, tanggal & sumber perolehan, nilai perolehan, unit usaha/lokasi pemilik, kondisi (baik/rusak ringan/rusak berat), foto.
- Perhitungan **penyusutan otomatis** (metode garis lurus sebagai default) yang terhubung ke jurnal akuntansi.
- **Label QR Code/Barcode** yang bisa dicetak & ditempel ke aset fisik, untuk scan cepat saat opname/stock take aset tahunan.
- Riwayat **mutasi aset** (pindah lokasi/unit usaha, pemeliharaan, perbaikan).
- Status aset: aktif, dalam perbaikan, dihapusbukukan (write-off) dengan alur approval.
- Laporan daftar aset per unit usaha & laporan penyusutan.

### 7.4 Modul Surat Menyurat
- **Surat Masuk**: registrasi (nomor, tanggal, pengirim, perihal, lampiran scan/foto), disposisi ke pengurus terkait, pelacakan status tindak lanjut.
- **Surat Keluar**: pembuatan draf dari **template surat** (SK, undangan, surat keterangan, nota dinas, dll), **penomoran otomatis** (mencegah nomor bentrok/duplikat, mengikuti format penomoran BUMDes), alur **approval/tanda tangan berjenjang** sebelum surat dikirim/dicetak.
- Cetak surat langsung ke PDF dengan kop surat resmi BUMDes.
- Pencarian surat berdasarkan nomor, tanggal, perihal, pengirim/penerima.
- Notifikasi ke pihak terkait saat ada surat baru/butuh approval.

### 7.5 Modul Kearsipan Digital
- Upload & simpan dokumen (scan surat lama, akta pendirian, SK pengurus, laporan tahunan, kontrak kerjasama, dll) dengan kategori & tag.
- Pencarian dokumen berdasarkan judul, kategori, tanggal, kata kunci.
- Penautan otomatis arsip dengan surat menyurat & transaksi terkait (misal: bukti transaksi terlampir di jurnal akuntansi juga tersimpan di arsip).
- Pengaturan **retensi/masa simpan** dokumen (untuk pengingat kapan dokumen tertentu boleh/harus di-review ulang).
- Kontrol akses dokumen sensitif (misal dokumen keuangan hanya bisa diakses Bendahara & Direktur).

### 7.6 Modul Manajemen Unit Usaha
- Master data unit usaha (nama, jenis usaha, kepala unit, tanggal mulai operasi, modal awal).
- Pencatatan **penyertaan modal desa** per unit usaha.
- Ringkasan kinerja per unit usaha (terhubung ke modul akuntansi & aset).

### 7.7 Modul Dashboard & Pelaporan
- Dashboard ringkasan untuk Direktur & Pengawas: total pendapatan, laba, kas tersedia, jumlah aset, surat pending approval — semua bisa difilter per unit usaha & periode.
- Grafik tren pendapatan/laba per unit usaha per bulan.
- Laporan siap-ekspor untuk keperluan pertanggungjawaban ke Musyawarah Desa, Kepala Desa, BPD, dan Dinas PMD/Kemendes PDTT.

### 7.8 Modul Master Data
- Profil BUMDes (nama, alamat, NIB/nomor registrasi, nomor SK pendirian, logo/kop surat).
- Data pengurus & jabatan (untuk keperluan surat & approval workflow).
- Data desa (untuk keperluan administratif surat).

### 7.9 Modul Notifikasi & Pengingat
- Notifikasi in-app (dan opsional email) untuk: surat butuh approval, transaksi butuh verifikasi, jadwal penyusutan bulanan, tenggat pelaporan berkala, dokumen arsip mendekati masa retensi.

---

## 8. Model Data — Ringkasan Entitas Utama

Daftar ini adalah titik awal untuk skema database (Prisma). Relasi detail akan lebih jelas saat mulai desain skema teknis.

- `User`, `Role`, `Permission`
- `BUMDesProfile` (profil & pengaturan umum)
- `UnitUsaha`
- `ChartOfAccount`, `JournalEntry`, `JournalLine`, `Transaction`
- `Asset`, `AssetMutation`, `AssetDepreciationSchedule`
- `IncomingLetter`, `OutgoingLetter`, `LetterTemplate`, `ApprovalStep`
- `ArchiveDocument`, `DocumentCategory`
- `Notification`
- `AuditLog`
- `SyncQueue` (khusus untuk antrian data yang dibuat saat offline)

---

## 9. Alur Kerja Utama (Key Workflows)

**A. Pencatatan Transaksi Harian**
1. Staf/Bendahara pilih unit usaha → pilih jenis transaksi (kas masuk/keluar) → isi nominal, kategori, keterangan, lampirkan bukti (foto/scan).
2. Sistem otomatis membuat entri jurnal di balik layar sesuai COA yang dipilih.
3. Transaksi masuk ke buku besar & memperbarui saldo kas/bank & laporan real-time.

**B. Surat Keluar**
1. Sekretaris/Staf buat draf dari template → isi konten.
2. Sistem beri nomor otomatis (status: draf, belum resmi).
3. Kirim ke alur approval (Direktur/pihak berwenang) → jika disetujui, status jadi "resmi" & nomor terkunci.
4. Cetak PDF berkop surat, otomatis tersimpan ke Arsip.

**C. Registrasi Aset Baru**
1. Kepala Unit/Staf input data aset + foto.
2. Approval dari Direktur/Bendahara.
3. Sistem generate label QR Code untuk ditempel fisik & mulai jadwal penyusutan otomatis.

**D. Kerja Offline → Sinkron**
1. Koneksi internet terputus → aplikasi (PWA) tetap terbuka, staf tetap input transaksi/surat.
2. Data tersimpan lokal di browser (IndexedDB), ditandai "belum tersinkron".
3. Koneksi kembali → sistem otomatis mengirim data ke server, tandai "tersinkron" atau beri peringatan jika ada konflik data untuk direview manual.

---

## 10. Kebutuhan Non-Fungsional

- **Keamanan**: enkripsi password, HTTPS wajib, RBAC ketat terutama untuk data keuangan, audit trail untuk semua perubahan data penting (tidak bisa dihapus permanen, hanya soft-delete/dibatalkan dengan jejak).
- **Backup & Pemulihan**: backup database otomatis terjadwal (harian) ke penyimpanan terpisah dari server utama; prosedur restore yang teruji.
- **Kinerja**: waktu muat halaman utama < 2 detik pada koneksi 4G biasa; laporan keuangan bulanan ter-generate < 5 detik untuk skala data BUMDes (ribuan transaksi/tahun).
- **Ketersediaan Offline**: fungsi input data dasar (transaksi, surat, catatan aset) tetap berjalan tanpa internet, dengan sinkronisasi otomatis.
- **Auditability**: setiap transaksi/surat/aset mencatat siapa yang membuat & mengubah, kapan.
- **Kepatuhan**: format laporan keuangan & struktur akun mengacu ke pedoman pelaporan keuangan BUMDes yang berlaku (lihat Bagian 19) — perlu direview bersama Bendahara/pihak yang paham regulasi sebelum difinalisasi.
- **Kemudahan Pakai**: UI sederhana untuk pengguna non-teknis (banyak pengurus BUMDes bukan latar belakang IT/akuntansi) — hindari istilah akuntansi rumit di layar input, gunakan bahasa sehari-hari ("terima uang dari...", bukan "debit kas, kredit pendapatan").

---

## 11. Prinsip UI/UX

- Bahasa Indonesia penuh, istilah sesuai kebiasaan BUMDes (bukan istilah software generik).
- Form input transaksi sesederhana mungkin (idealnya ≤ 5 field wajib untuk transaksi harian).
- Indikator status offline/online yang jelas & tidak mengganggu (misal ikon kecil di pojok, bukan popup mengganggu).
- Dashboard ringkas dengan visual (grafik/angka besar) untuk pengguna yang jarang buka laporan detail (Kepala Desa, BPD).
- Desain responsif — banyak pengurus unit usaha mungkin mengakses dari HP, bukan hanya laptop kantor.

---

## 12. Urutan Pembangunan (Build Order)

Karena kamu memilih membangun **full system sekaligus** (bukan rilis MVP bertahap ke pengguna), urutan di bawah **bukan tahapan rilis terpisah**, melainkan **urutan teknis yang disarankan saat coding** — supaya fondasi (auth, database, master data) selesai dulu sebelum modul yang bergantung padanya, dan supaya kamu bisa memberi prompt ke Kilo AI secara bertahap & terarah per bagian ini.

1. **Fondasi**: setup project, database schema (Prisma), autentikasi & RBAC, master data (profil BUMDes, unit usaha, pengurus).
2. **Modul Inti Keuangan**: COA, jurnal, transaksi harian, buku besar, laporan keuangan dasar.
3. **Modul Aset**: registrasi aset, penyusutan, QR label, mutasi.
4. **Modul Surat & Arsip**: template surat, penomoran otomatis, approval, arsip digital.
5. **Dashboard, Notifikasi, Laporan Lanjutan**: SHU, laporan per unit usaha, dashboard pengawas.
6. **Mode Offline (PWA)**: caching, IndexedDB, antrian sinkronisasi — disarankan dikerjakan setelah modul inti stabil, karena butuh alur data yang sudah jelas dulu.
7. **Pengujian & Hardening**: uji alur end-to-end, uji offline/online, uji hak akses per peran, backup/restore.

---

## 13. Kriteria Penerimaan (tingkat tinggi)

- Bendahara bisa mencatat transaksi harian dan langsung melihat laporan keuangan (neraca, laba rugi, arus kas) tanpa rekap manual di Excel.
- Setiap aset punya catatan penyusutan otomatis & bisa dilacak lewat scan QR.
- Surat keluar tidak pernah memiliki nomor ganda, dan status approval-nya terlihat jelas.
- Dokumen arsip bisa ditemukan lewat pencarian dalam < 10 detik.
- Saat internet mati, staf tetap bisa input transaksi/surat, dan data otomatis tersinkron begitu online kembali.
- Kepala Desa/BPD bisa melihat dashboard ringkas tanpa perlu bantuan staf BUMDes.

---

## 14. Metrik Keberhasilan

- 100% transaksi keuangan tercatat di sistem (0% dobel-catat manual di Excel terpisah).
- Waktu penyusunan laporan keuangan bulanan turun dari (misal) beberapa hari menjadi < 1 hari.
- 0 kasus nomor surat ganda/bentrok setelah sistem berjalan.
- Waktu pencarian dokumen arsip turun signifikan dibanding cara manual/fisik.

---

## 15. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Kehilangan data (server rusak/human error) | Backup terjadwal otomatis + prosedur restore yang diuji berkala |
| Resistensi pengguna non-teknis | UI sederhana, bahasa sehari-hari, sesi pelatihan singkat saat rilis |
| Konflik data saat sinkronisasi offline | Deteksi konflik + alur review manual, hindari auto-overwrite |
| Ketergantungan pada satu developer (kamu) | Dokumentasikan kode & keputusan desain, simpan PRD ini sebagai referensi, pertimbangkan automated testing |
| Struktur akun/laporan tidak sesuai pedoman resmi | Review bersama Bendahara/pihak yang paham regulasi BUMDes sebelum modul akuntansi difinalisasi |
| Biaya hosting VPS jadi beban rutin | Pilih VPS murah (skala BUMDes tidak butuh spek besar), atau pertimbangkan hosting lokal jika ada infrastruktur desa |

---

## 16. Asumsi & Ketergantungan

- Sistem ini untuk **satu BUMDes** (bukan produk multi-tenant untuk banyak BUMDes lain).
- Kantor BUMDes punya minimal satu perangkat (laptop/komputer) dan koneksi internet meski tidak selalu stabil.
- Ada anggaran kecil untuk hosting VPS (kisaran murah, tergantung provider).
- Pengurus bersedia mengikuti pelatihan singkat penggunaan sistem.
- Format laporan keuangan final akan direview bersama pihak yang memahami pedoman akuntansi BUMDes yang berlaku sebelum go-live.

---

## 17. Estimasi Waktu (Kasar)

Estimasi ini sangat bergantung pada ketersediaan waktu kamu (penuh waktu vs sambilan) — angka di bawah asumsi dikerjakan sendiri dengan bantuan Kilo AI, sambilan (~15-20 jam/minggu):

| Tahapan | Estimasi Durasi |
|---|---|
| Fondasi (auth, DB, master data) | 2-3 minggu |
| Modul Akuntansi | 4-6 minggu |
| Modul Aset | 2-3 minggu |
| Modul Surat & Arsip | 3-4 minggu |
| Dashboard & Notifikasi | 2 minggu |
| Mode Offline (PWA) | 2-3 minggu |
| Pengujian & Perbaikan | 2-3 minggu |
| **Total (kasar)** | **~4-5 bulan** |

---

## 18. Cara Memakai PRD Ini dengan Kilo AI di VS Code

- Simpan file ini sebagai `PRD.md` di root repo, atau di folder `docs/`. Beberapa AI coding agent (termasuk Kilo) otomatis membaca file markdown di root/docs sebagai konteks proyek.
- Saat mulai sesi baru dengan Kilo AI, tempelkan bagian yang relevan saja (misal Bagian 7.2 + 8 + 9 untuk mengerjakan modul akuntansi) daripada seluruh dokumen sekaligus — konteks yang lebih fokus biasanya menghasilkan kode yang lebih tepat.
- Ikuti urutan di Bagian 12 sebagai daftar tugas bertahap — minta Kilo AI mengerjakan satu bagian dalam satu waktu, review hasilnya, baru lanjut ke bagian berikutnya.
- Setelah skema database (Prisma) selesai di tahap Fondasi, minta Kilo AI membuatkan ringkasannya dan simpan sebagai referensi terpisah (`SCHEMA.md`) — ini akan jadi konteks yang sangat membantu untuk semua modul berikutnya.

---

## 19. Referensi Regulasi Terkait (untuk konsultasi, bukan rujukan hukum final)

Bagian akuntansi & tata kelola BUMDes di dokumen ini disusun mengacu pada kerangka regulasi berikut. **Disarankan konsultasi dengan Bendahara/pendamping desa/pihak yang memahami regulasi ini secara langsung** sebelum struktur akun & format laporan difinalisasi, karena ketentuan teknis bisa berubah:

- Peraturan Pemerintah No. 11 Tahun 2021 tentang Badan Usaha Milik Desa.
- Peraturan Menteri Desa, PDTT No. 3 Tahun 2021 tentang Pendaftaran, Pendataan dan Pemeringkatan, Pembinaan dan Pengembangan, dan Pengadaan Barang dan/atau Jasa BUM Desa/BUM Desa Bersama.
- Keputusan Menteri Desa, PDTT No. 136 Tahun 2022 tentang Panduan Penyusunan Laporan Keuangan Bumdesa — ini menjadi acuan utama untuk struktur laporan keuangan (neraca, laba rugi, arus kas, CaLK) di modul akuntansi.

---

## 20. Lampiran: Daftar Pertanyaan Terbuka

Hal-hal ini sebaiknya dijawab/diputuskan sebelum atau selama development, karena mempengaruhi detail desain:

- [ ] Berapa jumlah unit usaha aktif saat ini, dan apa saja jenisnya?
- [ ] Apakah ada format/template surat resmi yang sudah baku dan harus diikuti persis?
- [ ] Apakah ada struktur akun (COA) yang sudah dipakai sekarang yang perlu dipertahankan?
- [ ] Berapa banyak pengguna yang akan mengakses sistem secara bersamaan?
- [ ] Apakah perlu opsi ekspor data ke format tertentu untuk pelaporan ke Dinas/Kemendes?
