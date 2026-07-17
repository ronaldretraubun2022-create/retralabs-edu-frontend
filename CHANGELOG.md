# Changelog

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
