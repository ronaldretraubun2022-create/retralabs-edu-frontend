# Changelog

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
