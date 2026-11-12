# RecruitFlow-Platform – HR Action Control Cockpit & Core REST API
**Automation Hackathon 2026 (#HumanInTheLead)**  
*Repositori: `iammadsfq/RecruitFlow-Platform`*

Platform ini merupakan pusat kendali operasional HR (*Human in the Lead*) sekaligus peladen REST API terpadu yang melayani antarmuka publik (`RecruitFlow-Portal`) dan pemrosesan otomatis robot latar belakang (`RecruitFlow-RPA`).

---

## 🛠️ Persyaratan Sistem & Dependensi

1. **Runtime Peladen**: Node.js v18+ (atau runtime LTS yang didukung).
2. **Basis Data**: Relational Database (PostgreSQL / MySQL / SQLite untuk dev).
3. **Penyimpanan Berkas**: Direktori lokal terisolasi (`uploads/`) atau S3-compatible storage.

---

## 🚀 Panduan Memulai Cepat (Quick Start)

### 1. Kloning & Instalasi Paket
```bash
git clone https://github.com/iammadsfq/RecruitFlow-Platform.git
cd RecruitFlow-Platform
npm install
```

### 2. Konfigurasi Lingkungan (`.env`)
Salin file konfigurasi contoh dan sesuaikan variabel rahasia:
```bash
cp .env.example .env
```

Contoh konfigurasi penting dalam `.env`:
```env
PORT=5000
NODE_ENV=development

# Basis Data
DATABASE_URL="postgresql://user:password@localhost:5432/recruitflow_db?schema=public"

# Rahasia Otentikasi
JWT_SECRET="ganti_dengan_kunci_acak_minimal_32_karakter"
ROBOT_API_TOKEN="token_khusus_robot_uipath_bearer_autentikasi"

# Batas Waktu & Jendela Konfirmasi
CONFIRMATION_WINDOW_HOURS=24
OVERBOOKING_PERCENTAGE=20

# Direktori Penyimpanan Berkas CV
UPLOAD_DIR="./uploads"
```

### 3. Migrasi & Seeder Basis Data
Jalankan migrasi skema tabel dan inisialisasi akun administrator default serta data lowongan contoh:
```bash
npm run db:migrate
npm run db:seed
```

### 4. Menjalankan Peladen
```bash
# Mode pengembangan (dengan live-reload)
npm run dev

# Mode produksi
npm run build
npm start
```
Akses Dashboard HR pada peramban: `http://localhost:5000` (atau port yang ditentukan).

---

## 🔒 Integritas Bisnis & Keamanan Lomba

1. **Pencegahan Kebocoran Kredensial**:
   File `.gitignore` telah dikonfigurasi untuk mencegah file `.env`, berkas basis data lokal, dan dokumen CV pelamar terunggah ke repositori GitHub.
2. **Penegakan Aturan Mutlak BR-01**:
   Robot UiPath tidak akan pernah menerima daftar antrean pengiriman email untuk kandidat yang belum mengantongi status persetujuan eksplisit dari HR (`DISETUJUI_UNDANG` atau `DISETUJUI_TOLAK`).

---

## 📖 Dokumentasi Lengkap
Spesifikasi lengkap seluruh antarmuka dasbor (A1–A14), skema entitas database, dan kontrak REST API terinci tersedia pada berkas **[PRD_PLATFORM.md](./PRD_PLATFORM.md)**.
