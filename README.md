# RetraLabs Edu Frontend

Frontend SaaS modern untuk administrasi guru dan perangkat ajar Kurikulum Merdeka. Dibangun dengan Vite, Tailwind CSS, Vanilla JavaScript, Chart.js, Lucide Icons, dan localStorage.

Versi aplikasi: 1.3.0

## Fitur Utama

- Workflow CP -> ACP -> TP -> ATP -> PROTA -> PROSEM -> RPP/Modul Ajar -> KKTP -> Asesmen.
- Generator kode dokumen berbasis Data Master mata pelajaran, fase, jenis dokumen, tahun ajaran, dan semester.
- Migrasi localStorage aman dan idempotent dari schema lama.
- Relasi dokumen memakai internal ID; kode dokumen tetap dapat diedit sebagai identifier unik.
- Filter sumber ketat berdasarkan mata pelajaran, kelas, fase, tahun ajaran, dan semester.
- ATP dapat memilih beberapa TP, mengatur urutan, dan menghitung total JP otomatis.
- Editor PROTA dari ATP dengan tabel unit dinamis.
- Editor PROSEM dari PROTA dengan distribusi bulan dan minggu efektif.
- Status dokumen: Draf, Review, Perlu Revisi, Disetujui, Diarsipkan.
- Proteksi hapus dokumen induk yang masih memiliki turunan.
- Dark mode, responsive layout, toast, validasi field, autosave, export Word/JSON, dan print PDF.

## Stack

- Vite
- Tailwind CSS
- Vanilla JavaScript ES Modules
- Chart.js
- Lucide Icons
- localStorage

## Struktur Penting

```text
src/
  app/
    api.js
    router.js
    store.js
  components/
    documentEditor.js
  data/
    demo.js
  pages/
    documents.js
    teachingTools.js
  utils/
    workflow.js
```

## Migrasi 1.3.0

Migrasi berjalan otomatis saat aplikasi membaca `localStorage`.

- `TP-MAPEL-E-04` dinormalisasi menjadi `TP-INF-E-04`.
- `sourceIds` dan `referenceIds` yang masih memakai kode lama dikonversi ke internal ID dokumen.
- Dokumen lama yang belum punya kode, tahun ajaran, semester, status, atau relasi aman dilengkapi.
- Migrasi idempotent dan tidak menghapus data pengguna.

## Menjalankan

```bash
npm install
npm run dev
```

Buka alamat Vite, biasanya:

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

## Catatan Backend

Tahap ini belum memakai backend. Integrasi API dapat dipasang di:

```text
src/app/api.js
```

Store lokal dapat diganti dengan state dari backend selama kontrak dokumen, `sourceIds`, `referenceIds`, dan metadata workflow dipertahankan.
