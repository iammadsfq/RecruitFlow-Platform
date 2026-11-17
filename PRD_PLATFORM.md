# Product Requirements Document (PRD): RecruitFlow-Platform
**Komponen: HR Action Control Dashboard & Core REST API Engine**  
*Repositori: `iammadsfq/RecruitFlow-Platform`*

---

## 1. Peran & Lingkup Tanggung Jawab

`RecruitFlow-Platform` adalah pusat saraf (*central nerve center*) dari ekosistem RecruitFlow yang menyediakan dua kapabilitas utama:
1. **Peladen REST API Terpusat**:
   - Melayani antarmuka publik bagi `RecruitFlow-Portal` (penerimaan lamaran berkas CV, penyerahan formulir screening, pelacakan status mandiri, dan konfirmasi kehadiran wawancara).
   - Melayani endpoint terotentikasi khusus bagi robot `RecruitFlow-RPA` (pengambilan antrean tugas, pengunduhan dokumen CV, pencatatan hasil ekstraksi teks, kalkulasi skor, pemrosesan slot kalender, telemetri log, dan detak jantung sistem).
2. **Cockpit Pengendali HR (*Human in the Lead*)**:
   - Antarmuka web modern bagi praktisi HR untuk mengonfigurasi kriteria lowongan, meninjau hasil evaluasi robot, memberikan persetujuan akhir (*approval gate*), mengelola jadwal interview, dan memonitor kesehatan operasional robot secara real-time.

---

## 2. Struktur Modul Repositori

```
RecruitFlow-Platform/
├── .gitignore                    # Isolasi node_modules, build, .env, storage, dan uploads CV
├── README.md                     # Panduan setup peladen lokal & konfigurasi env
├── PRD_PLATFORM.md               # Dokumen spesifikasi fungsional Platform (file ini)
├── src/
│   ├── api/                      # Rute REST API terfragmentasi
│   │   ├── public.routes.js      # Endpoint konsumsi RecruitFlow-Portal
│   │   ├── robot.routes.js       # Endpoint terproteksi Bearer Token untuk RecruitFlow-RPA
│   │   ├── hr.routes.js          # Endpoint kontrol dashboard internal HR
│   │   └── auth.routes.js        # Otentikasi staf & session management
│   ├── controllers/              # Logika kontroler request/response
│   ├── models/                   # Definisi entitas database (ORM / ODM)
│   ├── middleware/               # Autentikasi (JWT / Robot Token), Validasi BR-01, Audit Trail
│   ├── services/                 # Logika bisnis penegakan aturan rekrutmen
│   └── views/                    # Komponen antarmuka dashboard HR (A1 - A14)
├── database/
│   ├── migrations/               # Skema tabel relasional terstruktur
│   └── seeders/                  # Inisialisasi data awal (Admin, Lowongan Default, Template)
├── docs/                         # Spesifikasi OpenAPI / Swagger & dokumentasi payload
└── uploads/                      # Penyimpanan sementara berkas PDF CV (diisolasi dari Git)
```

---

## 3. Penegakan Aturan Bisnis Inti (Business Rules Enforcement)

Platform bertindak sebagai garda terdepan penegak kepatuhan sistem:

- **Enforcement BR-01 (Persetujuan Mutlak Manusia — HR / Hiring User)**:
  Middleware pada rute `/robot/messages` secara ketat memfilter query database:
  `WHERE status = 'PENDING' AND application.status IN ('DISETUJUI_UNDANG', 'DISETUJUI_TOLAK')`.
  Upaya robot atau API manapun untuk memicu pengiriman pesan kepada kandidat yang masih berstatus `BARU`, `MENUNGGU_KEPUTUSAN`, atau `MENUNGGU_USER` akan langsung ditolak peladen dengan status HTTP `422 Unprocessable Entity`.
- **Enforcement BR-04 (Pencegahan Duplikasi Lamaran)**:
  Pendaftaran lamaran baru memverifikasi kombinasi `email` + `nomor_telepon` pada `job_id` aktif yang sama. Bila ditemukan lamaran aktif, peladen mengembalikan pesan penolakan ramah tanpa memproses ulang berkas.
- **Enforcement BR-05 & Mitigasi Bentrok (Slot Concurrency)**:
  Tabel `slots` menerapkan *unique constraint* pada kolom `(interviewer_id, start_time)`. Transaksi penguncian slot oleh robot dibungkus dalam *database transaction lock*. Jika dua proses mencoba memesan slot yang sama pada waktu bersamaan, peladen mengembalikan kode HTTP `409 Conflict`, memicu robot untuk mengambil slot alternatif berikutnya.
- **Enforcement BR-10 (Proteksi Otoritas HR)**:
  Token otentikasi robot memiliki hak akses terisolasi. Jika payload dari robot mencoba mengubah kolom `decision`, `hr_user_id`, atau `approval_timestamp`, middleware otorisasi akan menolak request dengan HTTP `403 Forbidden`.
- **Enforcement BR-11 (Keamanan Token Tautan Kandidat)**:
  Tautan untuk melihat status lamaran (P4) dan konfirmasi interview (P5) dihasilkan menggunakan token acak aman kriptografis (32 karakter alfanumerik) dengan masa aktif terikat aturan kedaluwarsa.

---

## 4. Spesifikasi Halaman Cockpit Staf & HR (A1 - A14)

### A1 – Halaman Login Staf
- Otentikasi berbasis email dan kata sandi dengan pengamanan *hash* (Bcrypt/Argon2).
- Proteksi terhadap brute-force (pembatasan rate-limiting) dan sesi kedaluwarsa otomatis.
- Pengalihan otomatis (*role-based redirection*):
  - `HR` dan `ADMIN` diarahkan ke Dashboard A2.
  - `HIRING_USER` (User departemen pemilik posisi) diarahkan langsung ke **Tampilan Sederhana Gerbang Persetujuan (A7)** yang hanya menampilkan lowongan dan kandidat yang menjadi tanggung jawabnya tanpa menu teknis RPA atau pengaturan sistem.
  - `INTERVIEWER` diarahkan ke Jadwal Saya I1.

### A2 – Executive Dashboard
- **Metrik Utama (Real-time Cards)**:
  - Jumlah lamaran masuk hari ini & total aktif.
  - Jumlah kandidat menunggu keputusan HR (`MENUNGGU_KEPUTUSAN`).
  - Jumlah jadwal terkonfirmasi minggu ini.
  - Rasio kehadiran wawancara (*interview turnout rate*).
- **Grafik Distribusi**:
  - Tren pelamar per tanggal.
  - Komposisi evaluasi robot (*Sesuai* vs *Perlu Dicek* vs *Tidak Sesuai*).
  - Corong tahap rekrutmen (*Funnel Conversion*).
- **Panel Aksi Segera (*Action Required*)**:
  - Daftar antrean kandidat prioritas tinggi yang membutuhkan intervensi HR.
  - Notifikasi berkas pengecualian teknis robot (`PERLU_DITINJAU`).
  - Peringatan ketersediaan slot interview yang menipis.
- **Status Robot Aktif**: Menampilkan waktu detak jantung terakhir (*last heartbeat*) dan status operasional 4 proses.

### A3 – Manajemen Lowongan Kerja (Admin View)
- Tabel lowongan aktif dengan ringkasan: Judul Posisi, Departemen, Kuota Kebutuhan, Jumlah Pelamar, Jumlah Menunggu Review, Status (Draft, Dibuka, Ditutup).
- Aksi: Tambah Lowongan Baru, Sunting Lowongan, Tutup Lowongan, Duplikasi Pengaturan.

### A4 – Form Konfigurasi Lowongan & Kriteria Skoring
- **Informasi Posisi**: Judul lowongan, deskripsi pekerjaan, spesifikasi, lokasi kerja, kuota pelamar, batas waktu lamaran.
- **Alur Persetujuan & Skala Rekrutmen**:
  - `approval_mode`: Pilihan pihak pemberi persetujuan sesuai kebutuhan posisi:
    - `USER_ONLY`: Keputusan langsung oleh *Hiring User* (`MENUNGGU_KEPUTUSAN` ➔ `DISETUJUI_UNDANG`/`DISETUJUI_TOLAK`).
    - `HR_ONLY`: Keputusan langsung oleh HR.
    - `HR_AND_USER`: Persetujuan berjenjang — HR melakukan penyaringan awal (`MENUNGGU_KEPUTUSAN` ➔ `MENUNGGU_USER`), lalu *Hiring User* mengesahkan keputusan final (`DISETUJUI_UNDANG`/`DISETUJUI_TOLAK`).
  - `hiring_user_id`: Penugasan akun *Hiring User* pemilik posisi.
  - `hiring_scale`: Indikator skala batch (`MASS_HIRING` untuk ±100 kandidat/posisi vs `MANAGEMENT` untuk ±10 kandidat/posisi) untuk mengoptimalkan tampilan default tinjauan.
- **Penyusun Pertanyaan Screening**: Penambahan formulir isian terstruktur tambahan (Pilihan Ganda, Skala Angka, Ya/Tidak) yang wajib dijawab kandidat di portal.
- **Penyusun Kriteria Robot**:
  - Syarat Knock-out Mutlak: Pendidikan minimal (SMK/D3/S1), Pengalaman kerja minimal (tahun), Kesediaan relokasi/domisili.
  - Matriks Kompetensi: Daftar Keahlian Wajib (*Required Skills*) dan Keahlian Tambahan (*Preferred Skills*) beserta kamus sinonim (contoh: "React", "ReactJS", "React.js").
  - Bobot Skoring: Pengaturan persentase kontribusi komponen (Skill Wajib, Skill Tambahan, Pengalaman, Pendidikan) dengan validasi mutlak $\sum \text{Bobot} = 100\%$.
  - Ambang Batas Kelompok: Batas minimal skor *Sesuai* (default $\ge 75$) dan batas *Perlu Dicek* (default $\ge 55$).
- **Pengaturan Operasional Wawancara**: Jendela respon konfirmasi kandidat (default: 24 jam), persentase kuota *overbooking* (default: 20%), lokasi default/tautan meeting online.
- **Tombol Skor Ulang (*Rescore Engine*)**: Memungkinkan HR memicu robot untuk menghitung ulang skor seluruh pelamar lama apabila kriteria kualifikasi lowongan diperbarui (BR-12).

### A5 – Direktori Kandidat
- Tabel pelamar terpadu: Nama Kandidat, Posisi Dilamar, Nilai Skor Robot, Kelompok Rekomendasi, Ringkasan Alasan Robot (1 baris), Status Alur Kerja, Waktu Melamar.
- Filter komprehensif: Berdasarkan lowongan, kelompok evaluasi, status kandidat, dan rentang tanggal.
- Dukungan Skala Batch: Pilihan tampilan hingga **100 baris per halaman** untuk skenario *mass hiring* (~100 kandidat/posisi) agar dapat meninjau satu batch posisi dalam satu layar tanpa banyak perpindahan halaman.
- Pencarian cerdas: Berdasarkan nama, email, atau keahlian spesifik.
- Aksi: Buka Lembar Detail (A6), Aksi Massal (Seleksi banyak kandidat untuk disetujui sekaligus), dan Ekspor Data ke berkas CSV.

### A6 – Lembar Detail & Riwayat Kandidat
- **Panel Data Pelamar**: Komparasi data isian form pelamar berdampingan (*side-by-side*) dengan data hasil ekstraksi teks CV oleh robot.
- **Pratinjau CV Digital**: Penampil PDF terintegrasi (*embedded PDF viewer*) untuk memvalidasi berkas asli secara langsung tanpa perlu mengunduh manual.
- **Panel Analisis Skor Robot**:
  - Nilai skor total (skala 0–100) dan label kelompok.
  - Rincian pemenuhan per kriteria (Kompetensi yang ditemukan vs yang tidak terpenuhi).
  - Skor keyakinan ekstraksi (*extraction confidence score*).
  - Catatan alasan robot dalam bahasa manusia (contoh: *"Skill wajib terpenuhi 4 dari 5; Pengalaman kerja tercatat 2,5 tahun dari ideal 3 tahun"*).
- **Panel Jejak Audit & Riwayat**: Linimasa perubahan status lamaran, rekam jejak keputusan HR sebelumnya, dan log transmisi pesan komunikasi.
- **Tombol Keputusan Tunggal**: `Setujui Undang`, `Setujui Tolak`, `Pindahkan ke Talent Pool`, atau `Proses Ulang Robot`.

### A7 – Ruang Kendali Persetujuan Ultra-Simpel (*Review & Approval Gate*)
Dirancang agar pemilihan kandidat oleh HR maupun *Hiring User* berlangsung **sesimpel dan secepat mungkin** tanpa perlu bergantung pada Excel:
- **Mode Tampilan Adaptif Berdasarkan Skala & Peran**:
  - **Tampilan Fokus *Hiring User***: Antarmuka ringkas bebas distraksi — hanya menampilkan daftar posisi yang ditugaskan kepada User tersebut, ringkasan skor + 1 baris alasan robot, dan tombol keputusan langsung.
  - **Batch *Mass Hiring* (±100 kandidat/posisi)**: Mendukung daftar padat hingga 100 baris/halaman, pengurutan otomatis dari skor tertinggi, serta *checkbox* seleksi massal untuk menyetujui/menolak banyak kandidat sekaligus.
  - **Batch *Management* (±10 kandidat/posisi)**: Menampilkan kartu/baris lebih lapang dengan akses cepat ke pratinjau CV & catatan kualitatif sebelum persetujuan.
- **Tab Navigasi Khusus**:
  1. *Perlu Dicek (Default)*: Menampilkan kandidat dengan skor meragukan ($55 \le \text{skor} < 75$), kandidat dengan data tidak lengkap, atau yang terdeteksi selisih form vs CV. Halaman ini **TIDAK menyediakan persetujuan massal instan** guna mencegah kelalaian verifikasi manusia.
  2. *Sesuai*: Menampilkan kandidat berkualitas tinggi hasil seleksi robot (skor $\ge 75$).
  3. *Tidak Sesuai*: Menampilkan kandidat yang melanggar syarat knock-out atau memiliki skor $< 55$.
  4. *Perlu Ditinjau (Pengecualian)*: Menampilkan berkas CV yang korup atau gagal diproses robot.
  5. *Menunggu User* (khusus mode `HR_AND_USER`): Menampilkan kandidat yang telah lolos seleksi awal HR dan menunggu persetujuan final *Hiring User*.
- **Aksi Persetujuan Cepat (1-Klik)**:
  - Tombol aksi satu klik per baris kandidat (`Undang` / `Lolos ke User` / `Tolak`) dengan ringkasan alasan robot langsung terlihat di baris tanpa harus membuka halaman A6.
  - Tombol Persetujuan Massal (*Bulk Approval*): Tombol *"Setujui Semua Sesuai ➔ Undang"* (atau *"➔ Teruskan ke User"* pada mode `HR_AND_USER`) dan *"Setujui Semua Tidak Sesuai ➔ Tolak"* yang dilengkapi modal dialog konfirmasi rekapitulasi jumlah kandidat terdampak sebelum dieksekusi.

### A8 – Manajemen Template Komunikasi
- Editor dinamis untuk subjek dan isi template pesan (Undangan Wawancara, Penolakan Hangat, Pengingat Konfirmasi, Pengingat H-1, Pembaruan Jadwal).
- Penanganan variabel pintar: Dukungan token `{{nama}}`, `{{posisi}}`, `{{perusahaan}}`, `{{tanggal}}`, `{{jam}}`, `{{lokasi}}`, `{{kontak}}`, `{{link_konfirmasi}}`, `{{batas_konfirmasi}}`, dan `{{link_talent_pool}}`.
- Fitur pratinjau pesan seketika (*instant preview*) dengan simulasi data dummy sebelum template disimpan.

### A9 – Manajemen Pewawancara (*Interviewer*) & Slot Kalender
- Pendaftaran staf pewawancara (*Interviewer*) beserta alokasi durasi interview per sesi (contoh: 30 menit / 45 menit).
- Penyusunan jadwal ketersediaan berulang mingguan (hari kerja dan rentang jam aktif).
- Generator Otomatis Slot: Tombol pembuat slot waktu wawancara massal untuk rentang periode tanggal tertentu dengan status `TERSEDIA`.

### A10 – Jadwal & Kalender Wawancara
- Tampilan kalender interaktif (mode mingguan dan harian) dan tampilan tabel kronologis.
- Penanda visual status: Terkonfirmasi Hadir (Hijau), Menunggu Konfirmasi (Kuning), Minta Jadwal Lain (Biru), atau Slot Kosong (Abu-abu).
- Fitur intervensi manual: Pemindahan jadwal antar-pewawancara, pembatalan slot, dan penandaan sesi wawancara selesai.

### A11 – Ruang Pemantauan Robot (*Robot Monitoring Cockpit*)
- Panel status kesehatan real-time untuk 4 proses: `RF_CV_Screening`, `RF_Messaging`, `RF_Scheduling`, `RF_Reporting`.
- Telemetri detak jantung (*heartbeat*) terakhir, status operasional (Aktif, Standby, Terjadi Galat), dan grafik volume transaksi hari ini.
- Aliran log eksekusi langsung (*live log stream*): Waktu kejadian, nama proses, level log (INFO, WARN, ERROR), dan pesan peristiwa bisnis (tanpa data pribadi PII).
- Pusat Penanganan Pengecualian: Menampilkan daftar kegagalan proses beserta saran solusi teknis dan tombol **Coba Ulang Transaksi** (*Retry*).
- Tombol **Jalankan Sekarang** (*Trigger Manual*): Menulis permintaan eksekusi batch (*run request*) ke antrean sistem.

### A12 – Analisis & Laporan Eksekutif
- Metrik efisiensi: Perbandingan waktu pemrosesan otomatis robot versus *baseline* manual (penghematan waktu $\ge 80\%$).
- Tingkat konversi pelamar di setiap corong rekrutmen.
- Rasio absensi dan ketidakhadiran wawancara.
- Fasilitas ekspor laporan ke format lembar sebar CSV dan PDF ringkas.

### A13 – Bank Talenta (*Talent Pool*)
- Direktori pelamar potensial yang belum terpilih untuk lowongan sebelumnya namun bersedia disimpan datanya.
- Pencarian berdasarkan tag kompetensi dan keahlian untuk rekrutmen lowongan baru di masa mendatang.

### A14 – Pengaturan Sistem & Manajemen Akun
- Manajemen profil pengguna sistem dan penugasan peran (`HR`, `HIRING_USER`, `INTERVIEWER`, `ADMIN`).
- Manajemen otentikasi robot: Pembuatan, inspeksi, dan rotasi Bearer Token API Robot.
- Konfigurasi kebijakan privasi data dan jangka waktu retensi penghapusan berkas CV lama.

---

## 5. Model Data & Skema Database

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────────┐
│    users     │       │       jobs       │       │ screening_questions  │
├──────────────┤       ├──────────────────┤       ├──────────────────────┤
│ id           │       │ id               │◄──────│ id                   │
│ name         │       │ title            │       │ job_id               │
│ email        │       │ quota            │       │ question_text        │
│ role         │       │ approval_mode    │       │ question_type        │
└──────┬───────┘       │ hiring_user_id   │       └──────────────────────┘
       │               │ hiring_scale     │
       │               │ status           │
       │               └────────┬─────────┘
       │                      │
       │                      ├──────────────────────────────────────┐
       │                      ▼                                      ▼
       │               ┌──────────────┐                       ┌──────────────┐
       │               │ applications │                       │  criteria    │
       │               ├──────────────┤                       ├──────────────┤
       │               │ id           │                       │ id           │
       │               │ job_id       │                       │ job_id       │
       │               │ name         │                       │ type         │
       │               │ email        │                       │ value        │
       │               │ status       │                       │ weight       │
       │               │ group        │                       └──────────────┘
       │               │ score        │
       │               └──────┬───────┘
       ▼                      │
┌──────────────┐              ├──────────────────────┬──────────────────────┐
│  decisions   │              ▼                      ▼                      ▼
├──────────────┤       ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ id           │       │ extractions  │       │  interviews  │       │   messages   │
│ app_id       │◄──────│ app_id       │       ├──────────────┤       ├──────────────┤
│ user_id      │       │ text_content │       │ id           │       │ id           │
│ stage        │       │ parsed_data  │       │ app_id       │       │ app_id       │
│ decision     │       └──────────────┘       │ slot_id      │       │ type         │
│ notes        │                              │ status       │       │ status       │
└──────────────┘                              └──────┬───────┘       └──────────────┘
                                                     │
                                                     ▼
                                              ┌──────────────┐
                                              │    slots     │
                                              ├──────────────┤
                                              │ id           │
                                              │ interviewer  │
                                              │ start_time   │
                                              │ status       │
                                              └──────────────┘
```

---

## 6. Spesifikasi Kontrak REST API Terpadu

### 6.1 Rute Publik (Konsumsi `RecruitFlow-Portal`)
- `GET /public/jobs` : Mendapatkan daftar posisi lowongan yang dibuka.
- `GET /public/jobs/:id` : Mendapatkan detail lowongan dan daftar pertanyaan screening.
- `POST /public/applications` : Mengirim lamaran (Multipart form-data: berkas PDF CV + metadata form).
- `GET /public/applications/:token` : Melihat status proses lamaran kandidat secara mandiri.
- `GET /public/interviews/:token` : Memeriksa rincian tawaran jadwal interview kandidat.
- `POST /public/interviews/:token/confirm` : Mengonfirmasi kesediaan hadir wawancara.
- `POST /public/interviews/:token/decline` : Menolak undangan wawancara (slot otomatis dibebaskan).
- `POST /public/interviews/:token/reschedule` : Mengajukan permohonan tanggal/jam alternatif.

### 6.2 Rute Terproteksi Robot (Konsumsi `RecruitFlow-RPA`)
Header Wajib: `Authorization: Bearer <RF_Api_Token>`.
- `GET /robot/applications?status=BARU&limit=50` : Mengambil lamaran antrean awal.
- `POST /robot/applications/:id/claim` : Mengunci lamaran menjadi status `DIPROSES`.
- `GET /robot/applications/:id` : Mengambil data formulir lengkap pelamar.
- `GET /robot/applications/:id/cv` : Mengunduh berkas fisik PDF CV untuk dianalisis robot.
- `GET /robot/jobs/:jobId/criteria` : Mengambil parameter knock-out, bobot, dan sinonim kata kunci.
- `POST /robot/applications/:id/extraction` : Menyimpan teks dan entitas hasil ekstraksi robot.
- `POST /robot/applications/:id/score` : Menyimpan skor akhir, kelompok, dan rincian evaluasi (Status ➔ `MENUNGGU_KEPUTUSAN`).
- `POST /robot/applications/:id/error` : Menandai berkas bermasalah (Status ➔ `PERLU_DITINJAU`).
- `GET /robot/messages?status=PENDING&limit=100` : Mengambil pesan siap kirim yang telah disahkan HR.
- `POST /robot/messages/:id/claim` : Mengunci pesan menjadi `SENDING`.
- `GET /robot/messages/:id` : Mengambil template dan nilai variabel pengganti.
- `POST /robot/messages/:id/result` : Melaporkan status pengiriman email (`SENT` / `FAILED`).
- `GET /robot/interviews/pending-assignment` : Mengambil kandidat disetujui yang memerlukan slot interview.
- `GET /robot/slots?jobId=:id&available=true` : Mengambil slot kalender yang belum terisi.
- `POST /robot/interviews` : Mengunci slot kalender untuk kandidat (Respons: 201 Created atau 409 Conflict).
- `POST /robot/interviews/:id/release` : Membebaskan slot kalender.
- `GET /robot/interviews/expired` : Mengambil kandidat yang melewati batas waktu konfirmasi.
- `POST /robot/interviews/:id/mark-no-response` : Mengubah status menjadi `TIDAK_MERESPONS`.
- `GET /robot/interviews/due-reminder?date=YYYY-MM-DD` : Mengambil daftar interview terkonfirmasi untuk pengingat H-1.
- `GET /robot/reports/daily` : Mengambil rekapitulasi data agregat harian.
- `POST /robot/reports` : Mencatat konfirmasi laporan harian terkirim ke HR.
- `POST /robot/logs` : Menerima telemetri log real-time dari aktivitas robot.
- `POST /robot/heartbeat` : Menerima sinyal detak status operasional robot.

### 6.3 Rute Kontrol HR & Hiring User (Konsumsi Dashboard Internal)
- Rute otentikasi staf (`HR`, `HIRING_USER`, `INTERVIEWER`, `ADMIN`), operasi CRUD lowongan kerja (termasuk `approval_mode`, `hiring_user_id`, dan `hiring_scale`), daftar kandidat dengan dukungan batch hingga 100 baris (`limit=100`), review kandidat, persetujuan tunggal dan massal sesuai tahap approval (`/applications/:id/decision` dan `/applications/bulk-decision`), konfigurasi template, alokasi slot wawancara, dan visualisasi pemantauan robot.
