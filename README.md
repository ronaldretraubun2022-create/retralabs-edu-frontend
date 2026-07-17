# RetraLabs Edu Frontend

Frontend SaaS modern untuk administrasi guru dan perangkat ajar Kurikulum Merdeka. Dibangun dengan Vite, Tailwind CSS, Vanilla JavaScript, Chart.js, dan Lucide Icons.

## Fitur

- Dashboard responsif dan mobile-first
- Sidebar modern dan topbar
- Dark mode tersimpan otomatis
- Struktur CP → ACP → TP → ATP → PROTA → PROSEM → RPP → Modul Ajar → KKTP
- Editor perangkat ajar dengan validasi form
- AI Assistant mock untuk membuat draf awal
- Auto save draf ke localStorage
- Manajemen dokumen dan pencarian realtime
- Filter status dan jenis dokumen
- Export Word dan JSON
- Print / simpan PDF melalui browser
- Bank soal dan asesmen
- Profil sekolah dan pengaturan dokumen
- Backup data lokal
- Toast notification, loading state, error handling
- Login demo

## Stack

- Vite
- Tailwind CSS
- Vanilla JavaScript ES Modules
- Chart.js
- Lucide Icons
- localStorage untuk data demo

## Struktur Folder

```text
retralabs-edu-frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── api.js
│   │   ├── router.js
│   │   └── store.js
│   ├── assets/
│   │   └── logo.svg
│   ├── components/
│   │   ├── documentEditor.js
│   │   ├── layout.js
│   │   ├── loading.js
│   │   ├── modal.js
│   │   ├── sidebar.js
│   │   ├── toast.js
│   │   └── topbar.js
│   ├── data/
│   │   └── demo.js
│   ├── pages/
│   │   ├── assessment.js
│   │   ├── curriculum.js
│   │   ├── dashboard.js
│   │   ├── documents.js
│   │   ├── help.js
│   │   ├── login.js
│   │   ├── notFound.js
│   │   ├── settings.js
│   │   └── teachingTools.js
│   ├── styles/
│   │   └── app.css
│   ├── utils/
│   │   ├── format.js
│   │   └── validators.js
│   └── main.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## Cara Menjalankan

Pastikan Node.js 20 atau lebih baru sudah terpasang.

```bash
npm install
npm run dev
```

Buka alamat yang ditampilkan Vite, biasanya:

```text
http://localhost:5173
```

## Build Production

```bash
npm run build
npm run preview
```

Hasil build tersedia di folder `dist/`.

## Akun Demo

```text
Email    : admin@retralabs.id
Password : retralabs123
```

Aplikasi langsung membuka dashboard. Halaman login dapat dibuka melalui:

```text
#/login
```

## Menghubungkan Backend

Ganti fungsi mock pada:

```text
src/app/api.js
```

Contoh struktur endpoint yang dapat digunakan:

```text
POST   /api/auth/login
GET    /api/documents
POST   /api/documents
PATCH  /api/documents/:id
DELETE /api/documents/:id
POST   /api/ai/generate
GET    /api/curriculum
GET    /api/assessments
```

Gunakan token JWT atau session cookie pada layer API. Store lokal dapat diganti dengan state dari backend tanpa mengubah komponen UI utama.

## Catatan

- Data saat ini adalah data demo dan disimpan di localStorage browser.
- Tombol AI menggunakan generator mock agar frontend dapat dijalankan tanpa API key.
- Export Word menggunakan dokumen HTML berformat `.doc` yang dapat dibuka di Microsoft Word.
- Print PDF menggunakan dialog cetak browser.
