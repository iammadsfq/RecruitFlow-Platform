# RecruitFlow-Platform – HR Action Control Cockpit & Core REST API
**Automation Hackathon 2026 (#HumanInTheLead)**  
*Repositori: `iammadsfq/RecruitFlow-Platform`*

Platform ini merupakan pusat kendali operasional HR (*Human in the Lead*) sekaligus peladen REST API terpadu yang melayani antarmuka publik (`RecruitFlow-Portal`) dan pemrosesan otomatis robot latar belakang (`RecruitFlow-RPA`).

Repositori ini terstruktur ke dalam dua direktori independen:
- **`backend/`** : Peladen REST API murni (Node.js/Express, SQLite/PostgreSQL, endpoint Robot, Public, dan HR).
- **`frontend/`**: Dasbor Web Kontrol Aksi HR (React/Vite/Tailwind).

---

## 🛠️ Persyaratan Sistem & Dependensi

1. **Runtime Peladen**: Node.js v18+ (Node.js v24 direkomendasikan dengan dukungan native `node:sqlite`).
2. **Basis Data**: Relational Database (SQLite native untuk dev cepat, PostgreSQL untuk produksi).
3. **Penyimpanan Berkas**: Direktori lokal terisolasi (`backend/uploads/`).

---

## 🚀 Panduan Memulai Cepat (Quick Start Backend)

### 1. Masuk ke Direktori Backend & Instalasi Dependensi
```bash
cd RecruitFlow-Platform/backend
npm install
```

### 2. Konfigurasi Lingkungan (`backend/.env`)
Salin file konfigurasi contoh:
```bash
cp .env.example .env
```

Nilai bawaan aman untuk pengembangan lokal:
- `PORT=5000`
- `ROBOT_API_TOKEN=rf_robot_bearer_token_dev_secret_key_123456`
- `CONFIRMATION_WINDOW_HOURS=24`
- `OVERBOOKING_PERCENTAGE=20`

### 3. Inisialisasi & Seeder Data Awal
Eksekusi seeder untuk membuat tabel relasional, akun HR default, lowongan acuan lomba (*Junior Software Engineer*), kriteria knock-out, slot kalender wawancara, serta 50 pelamar awal (tersambung dengan dataset PDF CV):
```bash
npm run seed
```

### 4. Menjalankan Peladen API
```bash
# Mode pengembangan (live reload)
npm run dev

# Mode produksi
npm start
```

Peladen API aktif di:
- **Healthcheck**: `http://localhost:5000/`
- **Robot Endpoints**: `http://localhost:5000/robot/heartbeat` (Header: `Authorization: Bearer rf_robot_bearer_token_dev_secret_key_123456`)
- **Public Endpoints**: `http://localhost:5000/public/jobs`
- **HR Cockpit Endpoints**: `http://localhost:5000/hr/dashboard` (Header: `X-Dev-User: usr_admin_01`)

---

## 🔒 Integritas Bisnis & Keamanan Lomba

1. **Pencegahan Kebocoran Kredensial**:
   File `.gitignore` telah dikonfigurasi untuk mencegah file `.env`, basis data lokal `*.sqlite`, dan berkas unggahan CV terunggah ke repositori Git.
2. **Penegakan Aturan Mutlak BR-01**:
   Robot UiPath tidak akan pernah menerima daftar antrean pengiriman email untuk kandidat yang belum mengantongi status persetujuan eksplisit dari HR (`DISETUJUI_UNDANG` atau `DISETUJUI_TOLAK`).
3. **Pencegahan Jadwal Bentrok (BR-05 & Concurrency 409)**:
   Alokasi slot kalender dibungkus dalam transaksi database atomik. Jika terjadi tabrakan pemesanan slot yang sama, peladen mengembalikan status HTTP `409 Conflict`, memicu robot UiPath untuk mengambil slot alternatif berikutnya.

---

## 📖 Dokumentasi Lengkap
Spesifikasi lengkap seluruh antarmuka dasbor (A1–A14), skema entitas database, dan kontrak REST API terinci tersedia pada berkas **[PRD_PLATFORM.md](./PRD_PLATFORM.md)**.
