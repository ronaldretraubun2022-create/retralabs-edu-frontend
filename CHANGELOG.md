# Changelog

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
