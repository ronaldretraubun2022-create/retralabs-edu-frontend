# RetraLabs Edu Frontend

Frontend SaaS modern untuk administrasi guru dan perangkat ajar Kurikulum Merdeka. Dibangun dengan Vite, Tailwind CSS, Vanilla JavaScript, Chart.js, Lucide Icons, Backend API v0.6.0, dan fallback localStorage aman.

Versi aplikasi: 2.0.0

Status rilis: release readiness v2.0.0 untuk validasi sekolah sebelum produksi.

## Fitur Utama

- Workflow CP -> ACP -> TP -> ATP -> PROTA -> PROSEM -> RPP/Modul Ajar -> KKTP -> Asesmen.
- Multi-jenjang SD, SMP, SMA, dan SMK dengan pemilih sekolah aktif dari backend.
- Login, refresh access token, logout, logout semua perangkat, daftar sesi, dan bootstrap aplikasi.
- Bootstrap `/api/v1/bootstrap` sebagai sumber user, activeSchool, schools, role, permissions, feature flags, subscription, quota, notification count, dan backend version.
- Permission/feature guard untuk menu dan aksi dokumen, AI, billing, usage, audit, upload, export, review, approve, archive.
- CRUD dokumen memakai API saat online dengan fallback lokal saat network unavailable.
- Revision conflict menampilkan pilihan reload server data atau simpan salinan lokal.
- Attachment/export service mendukung blob download dan filename sanitization.
- AI generations, subscription plans, payments, usage, audit logs, notifications, sessions, dan migration route.
- Migrasi localStorage 2.0.0 aman, idempotent, dengan backup dan laporan.
- Dark mode, responsive layout, toast, loading, empty state, print, kalender, export, dan workflow editor tetap dipertahankan.
- Halaman operasional `/offline`, `/maintenance`, `/fatal`, dan `/404`.
- Global runtime error boundary, unhandled promise rejection handler, offline/online state, retry UI, dan action lock untuk mencegah double submit.

## Environment

Development `.env.example`:

```text
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT_MS=30000
VITE_AUTH_REFRESH_COOKIE=true
VITE_ENABLE_LOCAL_FALLBACK=true
VITE_APP_NAME=RetraLabs Edu
VITE_APP_ENV=development
VITE_MAINTENANCE_MODE=false
VITE_ENABLE_DEBUG_LOGS=false
```

Production `.env.production.example`:

```text
VITE_APP_ENV=production
VITE_APP_NAME=RetraLabs Edu
VITE_API_BASE_URL=https://api.example.sch.id/api/v1
VITE_API_TIMEOUT_MS=30000
VITE_AUTH_REFRESH_COOKIE=true
VITE_ENABLE_LOCAL_FALLBACK=false
VITE_MAINTENANCE_MODE=false
VITE_ENABLE_DEBUG_LOGS=false
```

Tidak ada secret, password, refresh token, private key, atau API key yang boleh disimpan di `.env*`, frontend, repository, atau localStorage. Semua secret wajib berada di backend.

## Backend

Backend lokal:

```text
http://localhost:3000
```

API prefix:

```text
/api/v1
```

OpenAPI source of truth:

```text
D:\Projects\retralabs-edu-backend\openapi.yaml
```

Smoke endpoint:

```text
GET /api/v1/health
GET /api/v1/ready
POST /api/v1/auth/login
GET /api/v1/bootstrap
GET /api/v1/documents
GET /api/v1/notifications
```

## Auth dan Bootstrap

- Login memakai `POST /auth/login`.
- Access token disimpan hanya di memory API client.
- Refresh token tidak disimpan di localStorage; frontend mengandalkan HTTP-only cookie bila backend menyediakannya.
- Saat `ACCESS_TOKEN_EXPIRED`, API client menjalankan satu refresh promise untuk request concurrent lalu retry satu kali.
- Refresh gagal membersihkan session frontend dan kembali ke `/login`.
- Initial state aplikasi dimuat dari `GET /bootstrap`.
- Active school berasal dari session/token backend, bukan tenant override pada endpoint lain.

## Active School

Flow switch school:

1. Ambil sekolah dari bootstrap atau `/auth/schools`.
2. Pengguna memilih sekolah di topbar.
3. Frontend memanggil `PATCH /auth/active-school`.
4. Access token baru disimpan di memory.
5. Bootstrap dimuat ulang.
6. Cache tenant lama dibersihkan.

## Struktur Penting

```text
src/
  app/
    api.js
    backend-mappers.js
    bootstrap.js
    guards.js
    router.js
    store.js
  config/
    api.js
  services/
    api-client.js
    auth.js
    bootstrap.js
    crud-service.js
    documents.js
    domain-services.js
  pages/
    ai.js
    approvals.js
    audit.js
    documents.js
    migration.js
    notifications.js
    payments.js
    sessions.js
    subscription.js
    usage.js
```

## Permission dan Feature

Guard tersedia di `src/app/guards.js`:

```js
hasPermission(permission)
hasAnyPermission(permissions)
hasFeature(feature)
canAccessRoute(route)
canPerformAction(action)
```

Guard frontend hanya untuk UX. Backend tetap sumber keamanan final.

## LocalStorage Migration 2.0.0

- Backup otomatis dibuat sebelum schema localStorage naik ke 2.0.0.
- Marker migrasi idempotent: `retralabs-edu-migration-2.0.0`.
- Laporan migrasi tersedia di `#/settings/migration`.
- Migrasi server bersifat opt-in dan tidak menimpa data server otomatis.
- Local fallback hanya dipakai saat network unavailable atau draft lokal belum tersinkron.
- Token, password, API key, dan secret tidak dipersist ke localStorage.

## Menjalankan

```bash
npm install
npm run dev
```

Buka:

```text
http://localhost:5173
```

Login membutuhkan backend lokal aktif dan akun valid dari backend.

## Build Production

```bash
npm run build
npm run preview
```

Hasil build tersedia di folder `dist/`.

## Deployment

1. Salin `.env.production.example` menjadi `.env.production`.
2. Isi `VITE_API_BASE_URL` dengan domain backend production.
3. Pastikan backend mengaktifkan CORS untuk domain frontend production dan `credentials`.
4. Jalankan `npm run lint`, `npm run test`, dan `npm run build`.
5. Deploy isi folder `dist/` ke hosting statis.
6. Pastikan fallback SPA mengarah ke `index.html` agar route hash tetap stabil.

Mode maintenance dapat diaktifkan dari build env:

```text
VITE_MAINTENANCE_MODE=true
```

Saat aktif, semua route diarahkan ke `#/maintenance`.

## Test dan Verifikasi

```bash
npm run lint
npm run test
npm run build
npm audit --omit=dev
git diff --check
git status --short
```

Test Phase 6B:

```bash
npm run test:phase6b
```

Test mencakup API client base URL, Bearer token, credentials include, requestId, idempotency key, blob download, concurrent refresh satu kali, guard permission/feature, migrasi localStorage, dan keamanan token.

Release readiness v2.0.0 juga memverifikasi route status, safe storage, retry/backoff API, action lock, dan env production tanpa secret.

## Troubleshooting CORS

Pastikan backend mengizinkan origin Vite:

```text
http://localhost:5173
```

Aktifkan credentials/cookie pada backend karena frontend memakai `credentials: "include"`.

## Troubleshooting Backend Unavailable

Jika backend mati atau timeout:

- UI menampilkan badge Offline.
- Buka `#/offline` untuk halaman status offline.
- Data lokal tetap bisa dibuka sebagai fallback bila `VITE_ENABLE_LOCAL_FALLBACK=true`.
- localStorage tidak menjadi source of truth ketika backend tersedia kembali.

## Troubleshooting 500

UI menampilkan `requestId` bila backend mengirimkannya. Gunakan requestId untuk dukungan teknis backend.

## Troubleshooting LocalStorage

Jika data lokal rusak, schema lama, atau penyimpanan penuh:

- Aplikasi akan fallback ke state awal yang termigrasi.
- Buka `#/settings/migration` untuk melihat marker, backup, laporan migrasi, dan status storage.
- Gunakan backup JSON sebelum melakukan reset data demo.

## Checklist Sebelum Rilis

- Backend production sehat pada `GET /health` dan `GET /ready`.
- Login, refresh token, logout, logout semua perangkat, dan session expiration sudah dites dengan akun sekolah.
- Dokumen SD/SMP/SMA/SMK sudah dibuka, dibuat, dilanjutkan tahapnya, dicetak, dan diekspor.
- `npm run lint`, `npm run test`, dan `npm run build` lulus.
- Tidak ada secret di `.env*`, source code, repository, atau bundle frontend.
