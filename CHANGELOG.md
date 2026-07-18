# Changelog

## 2.0.0 - 2026-07-19

- Menambahkan mode release readiness dengan versi aplikasi dan schema localStorage `2.0.0`.
- Menambahkan halaman status `/offline`, `/maintenance`, dan `/fatal` untuk fallback operasional sekolah.
- Menambahkan konfigurasi environment development/production terpisah, termasuk maintenance mode dan debug flag tanpa secret frontend.
- Memperkuat global error boundary, router error fallback, offline/online event, API retry/backoff, timeout, dan abort handling.
- Memperkuat safe localStorage terhadap JSON rusak, schema lama, data sensitif, dan kegagalan tulis/kapasitas.
- Mengunci aksi async penting agar login, session, notifikasi, dokumen, dan refresh list tidak double submit.
- Memperbaiki dead button pada login, bank soal, dan toggle keamanan dengan feedback UI yang jelas.
- Memperbarui README, test release readiness, dan build metadata untuk kandidat rilis v2.0.0.

## 1.8.0 - 2026-07-18

- Mengintegrasikan konfigurasi Backend API v0.6.0 dengan `VITE_API_BASE_URL`, timeout, refresh cookie, dan fallback lokal.
- Menambahkan API client fetch terpusat dengan Bearer access token memory-only, credentials include, requestId, idempotency key, AbortController timeout, JSON/blob parsing, dan error object konsisten.
- Menambahkan auth login, refresh tunggal untuk request concurrent, logout, logout semua perangkat, daftar sesi, dan active school switch berbasis backend.
- Menambahkan bootstrap `/api/v1/bootstrap` sebagai sumber user, sekolah aktif, permissions, feature flags, subscription, quota, notification count, dan versi backend.
- Menambahkan service layer untuk auth, bootstrap, dokumen, approval, attachment, export, AI, billing, usage, audit, notification, user, school, tenant, dan membership.
- Menghubungkan dokumen ke backend saat online dengan pagination/search/filter, debounce, abort request lama, revision conflict dialog, dan fallback lokal saat network unavailable.
- Menambahkan route Phase 6B: approvals, notifications, AI, subscription, payments, usage, audit, sessions, dan migration.
- Menambahkan permission/feature guard untuk menu dan aksi dokumen.
- Menambahkan migration report, backup localStorage sebelum schema 1.8.0, marker idempotent, dan halaman migrasi opt-in.
- Menambahkan test Phase 6B, lint minimal, script `test`, dan dokumentasi operasional backend/frontend.

## 1.7.0 - 2026-07-18

- Menambahkan shell UI production dengan skip link, konteks halaman, mobile action sheet, dan sidebar sekolah aktif.
- Menambahkan `uiPreferences` idempotent untuk density, reduced motion, dan konteks halaman tanpa menyentuh data dokumen.
- Merapikan radius, focus state, empty state, reduced motion, dan responsivitas komponen utama.
- Mengganti placeholder berlabel AI menjadi template lokal agar tidak membuat AI Assistant atau integrasi backend baru.
- Menambahkan test Phase 5 untuk migrasi UI, guard label AI, shell mobile, empty state, dan versi 1.7.0.

## 1.6.0 - 2026-07-18

- Memisahkan print engine, document template, paper config, theme config, dan education level config.
- Menambahkan template cetak dinamis per jenjang dan jenis dokumen, termasuk field SD/SMA/SMK yang kontekstual.
- Menambahkan konfigurasi ukuran A4 dan F4 dengan orientasi otomatis portrait/landscape berdasarkan jenis dokumen dan kepadatan tabel.
- Menambahkan export Word berbasis template print serta print PDF browser untuk dokumen dan daftar dokumen.
- Menambahkan Kalender Pendidikan modern per sekolah aktif, jenjang, tahun ajaran, dan semester.
- Menambahkan migrasi idempotent v1.5.0 ke v1.6.0 untuk `printSettings` dan `academicCalendarEvents`.
- Menambahkan test Phase 4 untuk print config, template jenjang, kalender, dan migrasi.

## 1.5.0 - 2026-07-18

- Menambahkan schema perangkat ajar lengkap untuk CP, ACP, TP, ATP, PROTA, PROSEM, RPP, Modul Ajar, KKTP, dan Asesmen.
- Menambahkan master reference `teacherId`, `subjectId`, dan `classroomId` pada dokumen tanpa mengubah relasi internal `sourceIds`.
- Memperketat filter sumber dokumen berdasarkan `schoolId`, `educationLevel`, `teacherId`, `subjectId`, `classroomId`, fase, tahun ajaran, dan semester.
- Menambahkan migrasi idempotent v1.4.0 ke v1.5.0 untuk melengkapi ID guru, mapel, dan kelas pada data lama.
- Menambahkan seed perangkat lengkap SMK dari PROTA sampai Asesmen tanpa duplikasi.
- Menambahkan test Phase 3 untuk migrasi master refs, filter sumber berbasis ID, rantai dokumen lengkap, dan perlindungan kode `MAPEL`.

## 1.4.0 - 2026-07-18

- Menambahkan mode multi-jenjang SD, SMP, SMA, dan SMK.
- Menambahkan `educationLevel`, `schoolId`, sekolah aktif, dan pemilih sekolah di topbar.
- Menambahkan pemetaan fase otomatis per jenjang dan validasi kombinasi jenjang/kelas/fase.
- Menambahkan Data Master kelas dan mata pelajaran per jenjang.
- Menambahkan seed dokumen SD, SMP, dan SMA tanpa menghapus data SMK existing.
- Menambahkan migrasi idempotent v1.3.0 ke v1.4.0: data lama menjadi SMK dan relasi tetap memakai ID internal.
- Menambahkan filter dokumen dan sumber dokumen per sekolah/jenjang agar data tidak tercampur.
- Menambahkan field kontekstual: guru kelas hanya SD, kelompok pilihan SMA, bidang/program/konsentrasi/mitra/sertifikasi hanya SMK.
- Menambahkan test Phase 2 untuk fase, filter, migrasi, dan switching sekolah.

## 1.3.0 - 2026-07-18

- Menambahkan generator kode dokumen berbasis Data Master mata pelajaran.
- Menambahkan migrasi localStorage idempotent untuk normalisasi `TP-MAPEL-E-04` ke `TP-INF-E-04`.
- Mengubah relasi workflow agar memakai internal ID pada `sourceIds` dan `referenceIds`.
- Memperketat filter sumber dokumen berdasarkan mapel, kelas, fase, tahun ajaran, dan semester.
- Menambahkan pemilihan multi-TP pada ATP, urutan naik/turun, dan total JP otomatis.
- Menambahkan tombol lanjut tahap CP -> ACP -> TP -> ATP -> PROTA -> PROSEM -> RPP/Modul Ajar -> KKTP -> Asesmen.
- Menambahkan status dokumen draft, review, revision, approved, dan archived.
- Menambahkan proteksi hapus dokumen induk yang masih memiliki turunan.
- Menambahkan editor PROTA dari ATP dan PROSEM dari PROTA.
- Memperbarui README dan versi package ke 1.3.0.
