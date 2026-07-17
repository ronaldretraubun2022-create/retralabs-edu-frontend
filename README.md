# RetraLabs Edu Frontend

Frontend SaaS modern untuk administrasi guru dan perangkat ajar Kurikulum Merdeka. Dibangun dengan Vite, Tailwind CSS, Vanilla JavaScript, Chart.js, Lucide Icons, dan localStorage.

Versi aplikasi: 1.6.0

## Fitur Utama

- Workflow CP -> ACP -> TP -> ATP -> PROTA -> PROSEM -> RPP/Modul Ajar -> KKTP -> Asesmen.
- Multi-jenjang SD, SMP, SMA, dan SMK dengan pemilih sekolah aktif.
- Pemetaan fase otomatis: SD A-C, SMP D, SMA/SMK E-F.
- Data Master kelas dan mata pelajaran mengikuti sekolah dan jenjang aktif.
- Field kontekstual: guru kelas hanya SD, kelompok pilihan SMA, dan bidang/program/konsentrasi/mitra/sertifikasi hanya SMK.
- Perangkat ajar lengkap: CP, ACP, TP, ATP, PROTA, PROSEM, RPP, Modul Ajar, KKTP, dan Asesmen.
- Filter sumber memakai `schoolId`, `educationLevel`, `teacherId`, `subjectId`, `classroomId`, fase, tahun ajaran, dan semester.
- Generator kode dokumen berbasis Data Master mata pelajaran, fase, jenis dokumen, tahun ajaran, dan semester.
- Migrasi localStorage aman dan idempotent dari schema lama.
- Relasi dokumen memakai internal ID; kode dokumen tetap dapat diedit sebagai identifier unik.
- Filter sumber ketat berdasarkan mata pelajaran, kelas, fase, tahun ajaran, dan semester.
- ATP dapat memilih beberapa TP, mengatur urutan, dan menghitung total JP otomatis.
- Editor PROTA dari ATP dengan tabel unit dinamis.
- Editor PROSEM dari PROTA dengan distribusi bulan dan minggu efektif.
- Status dokumen: Draf, Review, Perlu Revisi, Disetujui, Diarsipkan.
- Proteksi hapus dokumen induk yang masih memiliki turunan.
- Print engine terpisah dengan template per jenis dokumen dan jenjang.
- Export Word/JSON, print PDF via browser, ukuran A4/F4, orientasi otomatis portrait/landscape, dan tema cetak.
- Kalender Pendidikan modern per sekolah aktif, jenjang, tahun ajaran, dan semester.
- Dark mode, responsive layout, toast, validasi field, dan autosave.

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
    academicCalendar.js
    documentTemplates.js
    printConfig.js
    printEngine.js
    workflow.js
```

## Migrasi 1.6.0

Migrasi v1.5.0 ke v1.6.0 berjalan otomatis dan idempotent.

- Menambahkan `printSettings` default tanpa mengubah dokumen lama.
- Menambahkan seed `academicCalendarEvents` untuk SD, SMP, SMA, dan SMK tanpa duplikasi.
- Ukuran kertas dibatasi pada A4 dan F4.
- Orientasi cetak otomatis mengikuti jenis dokumen dan kepadatan tabel.
- Data localStorage pengguna tetap aman dan tidak dihapus.

## Migrasi 1.5.0

Migrasi v1.4.0 ke v1.5.0 berjalan otomatis dan idempotent.

- Dokumen lama dilengkapi `teacherId`, `subjectId`, dan `classroomId`.
- Relasi `sourceIds` dan `referenceIds` tetap memakai ID internal.
- Seed PROTA, PROSEM, RPP, Modul Ajar, KKTP, dan Asesmen ditambahkan tanpa duplikasi.
- Data localStorage pengguna tidak dihapus, direset, atau diganti.

## Migrasi 1.4.0

Migrasi v1.3.0 ke v1.4.0 berjalan otomatis saat aplikasi membaca `localStorage`.

- Sekolah existing dipertahankan sebagai SMK.
- Dokumen lama diberi `schoolId` SMK dan `educationLevel` SMK.
- Seed SD, SMP, dan SMA ditambahkan tanpa duplikasi.
- Relasi tetap memakai internal ID dan data localStorage pengguna tidak dihapus.
- Migrasi idempotent dan aman dijalankan berkali-kali.

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

## Test Phase 2

```bash
npm run test:phase2
```

Test mencakup pemetaan fase, filter sumber lintas sekolah, migrasi v1.3.0 ke v1.4.0, dan switching sekolah aktif.

## Test Phase 3

```bash
npm run test:phase3
```

Test mencakup migrasi master reference, filter sumber berbasis ID, rantai perangkat ajar lengkap, dan proteksi kode `MAPEL`.

## Test Phase 4

```bash
npm run test:phase4
```

Test mencakup konfigurasi A4/F4, orientasi print, template dokumen per jenjang, filter kalender, dan migrasi v1.5.0 ke v1.6.0.

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
