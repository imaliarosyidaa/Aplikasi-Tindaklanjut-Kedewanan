# CLAUDE.md - kunjungan-trancker

Sebuah Dashboard tracker untuk mengetahui statistik perjalanan DPRD dalam kunjungannya di daerah-daerah masyarakat, terutama di Jakarta Selatan. Aplikasi ini memonitoring statistik perjalanan dan aspirasi masyarakat dengan status: Belum ditindaklanjuti, Sedang dalam tindak lanjut, dan Sudah ditindaklanjuti.

---

## Tech Stack

| Tool          | Version / Notes                             |
| ------------- | ------------------------------------------- |
| Next.js       | v14+ (App Router)                           |
| React         | v18+                                        |
| TypeScript    | Strict Mode                                 |
| Tailwind CSS  | v4.0+ (Menggunakan @custom-variant)         |
| Former Motion | Animasi / Transisi UI                       |
| next-intl     | Lokalisasi / Multi-bahasa (ID/EN)           |
| next-auth     | Autentikasi (Sesi Anggota & Admin)          |
| next-themes   | Manajemen Tema Dasar                        |
| Zustand       | Global State Management (Client-side)       |
| Subase        | PostgreSQL Database & Realtime Subscription |
| SWR           | Data Fetching & Caching                     |
| mpm           | Package Manager & Runtime                   |

---

## Comands

- Install Dependencies: npm install
- Development Server: npm dev
- Build Production: npm run build
- Start Production: npm start
- Linting: npm run lint

## Theme System

Five themes: `light`, `dark`, `yellow`, `ramadan`, `valentine`

- Config: Dikonfigurasi via Tailwind CSS v4 configuration (global.css atau tailwind.config.js).
- Types: Diperluas melalui Theme type alias dalam direktori @/types/theme.ts.
- Provider: Menggunakan ThemeProvider dari next-themes yang dibungkus dalam root layout.
- CSS variables: Ditentukan di dalam :root dan selector kelas masing-masing tema di global.css.

### Tilwind variants

```
@custom-variant dark (&:where(.dark, .dark *));
@custom-variant yellow (&:where(.yellow, .yellow *));
@custom-variant ramadan (&:where(.ramadan, .ramadan *));
@custom-variant valentine (&:where(.valentine, .valentine *));

```

Defined with `@custom-variant` in `global.css`.

### Theme-specific primary colors

- light / dark: Blue/Indigo (#2563eb) - Standar profesional pemerintahan.
- yellow: Amber/Yellow (#eab308) - Representasi khas atau fraksi - tertentu.
- ramadan: Emerald/Green (#059669) - Nuansa hijau khas Ramadan/Islami.
- valentine: Rose/Pink (#e11d48) - Nuansa merah muda/kasih sayang.

### Theme icons

| Theme       | Icon                    |
| ----------- | ----------------------- |
| light       | `MdlightMode`           |
| dark        | `MdDarkMode`            |
| yellow      | `MdOutlineWbSunny`      |
| ramadan     | `MdMosque / Md`         |
| valentine   | `MdFavorite`            |
| ----------- | ----------------------- |

## Project Structure

```

kunjungan-tracker/
├── .next/
├── src/
│   ├── app/                 # Next.js App Router (Pages, Layouts, APIs)
│   │   ├── [locale]/        # Localization routing (next-intl)
│   │   └── api/             # Backend API routes
|   |    |    ├── kunjungan/
|   |    |    │   └── route.ts      # GET: ambil data kunjungan, POST: tambah kunjungan
|   |    |    ├── aspirasi/
|   |    |    │   └── [id]/
|   |    |    │       └── route.ts  # PATCH: update status (Belum, Sedang, Sudah ditindaklanjuti)
|   |    |    └── auth/
|   |    |        └── [...nextauth]/
|   |    |            └── route.ts  # Handler untuk autentikasi next-auth
│   ├── components/          # Reusable UI Components
│   │   ├── ui/              # Base primitive components (Button, Input, dll)
│   │   ├── dashboard/       # Dashboard specific charts and tables
│   │   └── shared/          # Navbar, Sidebar, ThemeSwitcher
│   ├── hooks/               # Custom React Hooks (SWR wrappers, UI helpers)
│   ├── lib/                 # Third-party configurations (Supabase, Auth)
│   ├── store/               # Zustand global state definitions
│   ├── types/               # TypeScript interfaces & types
│   └── utils/               # Helper functions (Formatters, validators)
├── messages/                # Translation JSON files (id.json, en.json)
├── public/                  # Static assets (Logos, Icons, Images)
├── .env.example             # Template environment variables
├── global.css               # Global styles & Tailwind configs
└── package.json

```

## Core Pages

- [x] Dashboard sebagai statistik visual beruapa chart kelurahan dan kecamatan yang sudah dikunjungi per bulan, dan yang belum dikunjungi per bulan
- [x] Chart yang menampilkan total aspirasi masuk, sumber aspirasi 6 jenis yaitu Lembar aspirasi reses, lembar aspirasi sosperda, Aspirasi proposal langsung, Koordinasi dinas Terkait, usulan musrenbang dewan, dan call center dan dapat memfilter berdasarkan bulan dan tahun
- [x] Tracing Aspirasi dengan status: Belum ditindaklanjuti, Sedang dalam tindak lanjut, dan Sudah ditindaklanjuti.
- [x] Form input proses tindak lanjut aspirasi untuk input awal aspirasi dan update aspirasi dan upload file dalam bentuk excel, pdf, atau image
- [x] Form input kunjungan berisi input tanggal, jam, jalan, kelurahan, kecamatan, dan otomatis ke kota jakarta selatan. Sumber ini akan menjadi statistik kunjungan.
- [x] Form login url default
- [x] Pisahkan dashboard sekarang khusus untuk pengguna admin
- [x] Terdapat pemisahan menu untuk pengguna dan admin
- [x] Pengguna hanya bisa melihat form pengajuan aspirasi yang berisi isi pengaduan, nama pengadu, alamat, no.telp. dan menu tiket saya khusus untuk tampilan pengguna dengan tampilan sperti menu "Tracing Aspirasi" namun hanya pengguna yang input aspirasi tersebut yang hanya melihat

### Features

- [x] Aplikasi bisa masukan data dari format Excel / word / pdf / PPT / JPEG saat input aspirasi.
- [x] Saat melakukan input kelurahan mana yang sudah dikunjungi, terdapat form yang mana untuk kecamatan pada saat klik sudah otomatis kelurahanya mengikuti, terdapat 5 kecamatan Dapil 8 di Jakarta Selatan.
- [x] Terdapat perbedaan warna ketika status aspirasi, yaitu: Belum ditindaklanjuti (merah), proses tindaklanjut (orange) dan sudah ditindaklanjuti (hijau)
- [x] Status berubah warna menjadi orange ketika aspirasi menjadi prosses tindak lanjuti melalui wathsapp, atau surat menyurat dari DPRD ke dinas terkait jadi bisa upadate staus aspirasi melalui isian form.
- [x] Status berubah warna ketika hijau ketika aspirasi sudah ditindak lanjuti yaitu bisa input form lagi bukti pendukung lainya lalu ada pilihan kirim ke alamat email dan nomor telepon warga agar tahu aspirasinya sudah ditindak lanjuti.
- [x] Sumber laporan tindaklanjut ada 6 jenis, yaitu: Lembar aspirasi reses, lembar aspirasi sosperda, Aspirasi proposal langsung, Koordinasi dinas Terkait, usulan musrenbang dewan, dan call center
- [x] Ada master data wilayah yang ada di Jakarta Selatan, berisi kecamatan, kelurahan/desa . Ini akan dibandingkan dengan kec/kelurahan mana yang belum dikunjungi. sumber input adalah kec/keurahan yang pernah dikunjungi.
- [x] Ada tab wilayah kecamatan di menu daftar kegiatan tab tersbut ada keterangan di bawah '9/12 (total Kelurahan per wilayah)'. Jika kecamatan di klik, ada daftar wilayah kelurahan, ketika kelurahan diklik ada card muncul isi keterangan kegiatan. Seperti contoh ini: isi kegiatan, tanggal, jam, lokasi.
- [x] Ganti semua kata Desa menjadi Kelurahan.
- [x] Cards di Dashboard bisa diklik. Total kunjungan ketika diklik ada list kunjungan berdasarkan wilayah dapil 8 terus list wilayah yang sudah dikunjungi. Total Aspirasi diklik ke menu Tracking Aplikasi. Kelurahan Sudah Dikunjungi diklik list daftar kelurahan yang sudah dikunjungi, jangan bentuk card. Begitu juga Kelurahan yang Belum Dikunjungi jika diklik ada list kelurahan yang sudah dikunjungi.
- [x] Ganti tab di daftar kunjungan langsung nama wilayah kecamatan, Tebet, Mampang Prapatan, Pasar Minggu, Pancoran, Jagakarsa, dan keterangan jml wilayah /total wilayah yang sudah dikunjungi di bawahnya.
- [x] Terdapat data dummy Kegiatan di wilayah ketika kelurahan di klik, yaitu isi, hari, tanggal, lokasi/alamat kemudian foto kegiatan.
- [x] Pada layout Detail Aspirasi dibagi menjadi 2 kolom kanan dan kiri, kanan yaitu detail pelapor foto profil bulat dummy kemudian dibawahnya nama, email, dan telepon. Di kiri terdapat isi aspirasi isi aduan, kategori usulan, jenis usulan, jenis reses, tindak lanjut, sumber aduan dan tanggal dibuat.
- [x] Card Kegiatan bisa diklik lalu ada detail kegiatan yang isinya: ID,TANGGAL, JENIS KEGIATAN, NAMA KEGIATAN, LOKASI, LINK GMAPS, KECAMATAN, KELURAHAN, RT, RW, JUMLAH PESERTA, CATATAN
- [x] Terdapat card dibagian Dashboard berisi Kecamatan mana yang sudah dikunjungi dan yang isinya jumlah kecamatan/total kecamatan, Kecamatan yang paling banyak dikunjungi, Kecamatan yang paling sedikit dikunjungi, dan tambahi 1 lagi biar 4
- [x] Fitur Manajemen DPRD, Tim Kerja, dan Data Scoping

## 1. Pengaturan → Manage User → Add User

Tambahkan field **Linked with DPRD** pada form `Add User`.

Field ini berupa **select box** yang menampilkan daftar DPRD yang tersedia.

Tujuannya adalah untuk menentukan user tersebut bekerja di bawah/terhubung dengan DPRD tertentu.

Contoh:

- User: Ahmad
- Role: Anggota Tim
- Linked with DPRD: Hj. Yuke Yurike, ST, MM

User yang sudah dihubungkan dengan DPRD hanya dapat melihat data yang berada dalam scope DPRD tersebut, kecuali user memiliki role yang memiliki akses global.

---

## 2. Master Data DPRD

Tambahkan menu/fitur **DPRD** untuk mengelola data DPRD.

Minimal field:

- `id`
- `name`
- `description` (opsional)
- `is_active`
- `created_at`
- `updated_at`

Seeder/default data wajib membuat satu DPRD:

**Hj. Yuke Yurike, ST, MM**

Referensi:
https://jariungu.com/caleg_2024.php?idCaleg2024=20691

Data ini harus tersedia sebagai pilihan pada field **Linked with DPRD** ketika membuat user.

---

## 3. Pemisahan Data Berdasarkan DPRD

Semua fitur tetap menggunakan **UI, tombol, menu, dan workflow yang sama**.

Yang berbeda adalah **data yang ditampilkan**.

Gunakan konsep **Data Scoping** berdasarkan `dprd_id` dan `team_id`.

Contoh:

```text
DPRD A
 ├── Tim Kerja 1
 │    ├── Kegiatan
 │    ├── Relawan
 │    └── Data lainnya
 │
 └── Tim Kerja 2
      ├── Kegiatan
      ├── Relawan
      └── Data lainnya

DPRD B
 └── Tim Kerja 3
      ├── Kegiatan
      ├── Relawan
      └── Data lainnya
```

User yang terhubung ke DPRD A tidak boleh melihat data DPRD B secara default.

Tidak perlu membuat halaman/fitur berbeda untuk setiap DPRD.

**Satu fitur → banyak scope data.**

---

## 4. Team / Group ID

Gunakan `team_id` pada tabel yang datanya harus dipisahkan berdasarkan tim.

Contoh tabel:

```text
kegiatan
relawan
agenda
program
laporan
dll.
```

Struktur minimal:

```text
kegiatan
- id
- team_id
- ...
```

`team_id` digunakan sebagai salah satu dasar filtering data.

Jika data juga harus selalu terikat dengan DPRD, gunakan:

```text
dprd_id
team_id
```

Dengan demikian struktur data dapat memastikan:

```text
DPRD → Team → Data
```

---

## 5. Satu User Bisa Mengikuti Banyak Tim

Satu anggota DPRD/user dapat tergabung dalam lebih dari satu Pansus atau Tim Kerja.

Karena itu **jangan menggunakan `team_id` langsung pada tabel `users`**.

Gunakan relasi **Many-to-Many**:

```text
users
   │
   │
   └── user_teams ─── teams
```

Contoh tabel pivot:

```text
user_teams
- id
- user_id
- team_id
- role
- created_at
- updated_at
```

Contoh:

```text
User Ahmad
 ├── Tim Kerja A → ANGGOTA
 ├── Tim Kerja B → KETUA
 └── Tim Kerja C → ANGGOTA
```

---

## 6. Hierarki Role dalam Tim

Gunakan kombinasi:

```text
Role + Team ID
```

Role dalam sebuah tim minimal:

```text
KETUA
ANGGOTA
```

Contoh:

```text
user_teams

user_id | team_id | role
--------|---------|---------
1       | 10      | KETUA
1       | 20      | ANGGOTA
2       | 10      | ANGGOTA
```

Artinya satu user dapat memiliki role berbeda pada tim yang berbeda.

Role `KETUA` hanya berlaku pada team tersebut, bukan otomatis menjadi ketua semua tim.

---

## 7. Role Global

Tambahkan role global yang memiliki akses lintas tim.

Minimal:

```text
SUPER_ADMIN
SEKRETARIAT
```

Aturan:

### SUPER_ADMIN

Dapat:

- Melihat semua DPRD
- Melihat semua tim
- Melihat semua kegiatan
- Melihat semua relawan
- Mengelola user
- Mengelola DPRD
- Mengelola tim
- Mengelola seluruh data

### SEKRETARIAT

Dapat:

- Melihat semua DPRD
- Melihat semua tim
- Melihat semua kegiatan
- Melihat semua relawan
- Mengelola data sesuai permission sekretariat

Role ini **bypass filter `team_id`**.

Jika diperlukan, role ini juga dapat bypass `dprd_id`.

---

## 8. Aturan Data Access

Implementasikan filtering data secara terpusat.

### User biasa

User hanya mendapatkan data dari team yang terdapat pada:

```text
user_teams
```

Contoh:

```text
User A
Teams:
- Team 1
- Team 3
```

Maka query kegiatan harus menghasilkan:

```text
WHERE team_id IN (1, 3)
```

User tidak boleh mendapatkan data:

```text
Team 2
Team 4
Team 5
```

---

### KETUA / ANGGOTA

Role `KETUA` dan `ANGGOTA` tetap mengikuti team membership.

Contoh:

```text
User A
Team 1 → KETUA
Team 2 → ANGGOTA
```

User dapat melihat data Team 1 dan Team 2, tetapi permission/action dapat berbeda berdasarkan role masing-masing team.

---

### SUPER_ADMIN / SEKRETARIAT

Tidak menggunakan filter team membership.

Contoh:

```text
User → SUPER_ADMIN

Accessible:
DPRD A
 ├── Team 1
 ├── Team 2

DPRD B
 ├── Team 3
 └── Team 4
```

---

## 9. Relasi Database

Relasi utama yang diharapkan:

```text
DPRD
 │
 └── Teams
       │
       ├── user_teams ─── Users
       │
       └── Data
             ├── Kegiatan
             ├── Relawan
             └── ...
```

Secara konseptual:

```text
DPRD 1 ─── N Teams
Team N ─── N Users
Team 1 ─── N Kegiatan
Team 1 ─── N Relawan
```

---

## 10. Prinsip Utama Implementasi

Fitur harus mengikuti prinsip:

> **"Same UI, different data scope."**

Jangan membuat fitur terpisah untuk setiap DPRD.

Contoh:

```text
/kegiatan
```

Tetap satu halaman.

Tetapi hasil datanya berbeda berdasarkan user:

```text
User A → kegiatan Team 1 & Team 2
User B → kegiatan Team 3
Sekretariat → semua kegiatan
```

Begitu juga untuk:

```text
/relawan
/agenda
/laporan
/program
```

Semua menggunakan UI yang sama dan hanya berbeda pada **data scope**.

---

## 11. Acceptance Criteria

Fitur dianggap selesai jika:

- [x] Admin dapat menambahkan DPRD.
- [x] Seeder membuat DPRD `Hj. Yuke Yurike, ST, MM`.
- [x] Form Add User memiliki select box `Linked with DPRD`.
- [x] User dapat dihubungkan dengan DPRD.
- [x] Satu DPRD dapat memiliki banyak Team/Pansus.
- [x] Satu user dapat tergabung dalam banyak Team.
- [x] `user_teams` menggunakan relasi Many-to-Many.
- [x] User dapat memiliki role berbeda pada setiap Team.
- [x] Role `KETUA` dan `ANGGOTA` berlaku berdasarkan Team.
- [x] Data kegiatan memiliki `team_id`.
- [x] Data relawan dan data lain yang bersifat team-scoped menggunakan `team_id`.
- [x] User biasa hanya melihat data dari team yang diikutinya.
- [x] `SUPER_ADMIN` dapat melihat seluruh data.
- [x] `SEKRETARIAT` dapat melihat seluruh data.
- [x] Tidak perlu membuat UI terpisah untuk setiap DPRD.
- [x] Semua filtering data dilakukan secara konsisten pada backend/API, bukan hanya menyembunyikan data di frontend.
- [x] User tidak dapat mengakses data team lain hanya dengan mengubah `team_id` pada request/API.

---

## Code Conventions

- TypeScript strict mode = Wajib menggunakan strict mode. Dilarang keras menggunakan tipe any. Gunakan unknown jika tipe data tidak dapat diprediksi saat compile.
- Components: Menggunakan Functional Components dengan eksplisit mengetik nilai return atau props:
  interface DashboardProps { title: string; }
  export const DashboardCard = ({ title }: DashboardProps): React.JSX.Element => { ... }
- Imports: Gunakan path alias @/ untuk semua import absolut (contoh: import { Button } from '@/components/ui/button'). Urutkan import: framework/external library -> internal alias -> styles/types.
- Icons: Gunakan package react-icons/md (Material Design Icons) secara konsisten untuk menjaga keseragaman UI dashboard.
- Class Names: Gunakan utility function cn() (kombinasi clsx dan tailwind-merge) untuk penggabungan kelas Tailwind yang dinamis atau kondisional.

---

## Environment Variables

Salin .env.example menjadi .env.local dan lengkapi variabel berikut:

```

NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000

# Next-Intl
NEXT_PUBLIC_DEFAULT_LOCALE=id

```

## Do not

- Jangan melakukan direct mutation pada state Zustand atau state React.
- Jangan melakukan hardcode string untuk text UI yang bersifat statis; gunakan next-intl untuk manajemen bahasa.
- Jangan mengekspos SUPABASE_SERVICE_ROLE_KEY ke sisi client (selalu gunakan prefix NEXT_PUBLIC_ hanya untuk variabel yang aman bagi client).
- Jangan meloloskan parsing data dari input form tanpa validasi (gunakan Zod atau library validator sejenis).

## Do

- Setiap ingin merubah kodingan baca Core Pages dan Features. Jika terdapat - [ ] perbaiki kodingan lalu update README.md setiap selesai mengerjakan ubah di bagian core pages dan features menjadi [x] SUDAH SELESAI / DONE / TASK COMPLETED atau - [ ] (hanya spasi kosong) jika belum selesai.

## Testing

- Unit & Integration: Jalankan pengujian komponen dengan Jest dan React Testing Library jika dikonfigurasi.
- Command: run test

## Build

- Pastikan proses linting tidak menghasilkan error atau warning krusial sebelum melakukan build.
- Jalankan npm run build untuk memvalidasi kesesuaian tipe data TypeScript pada seluruh rute halaman sebelum naik ke production.

## Gil Rules

- Branch Naming: Gunakan format feat/nama-fitur, fix/nama-bug, atau refactor/nama-bagian.
- Commit Messages: Ikuti konvensi Conventional Commits:
- feat(dashboard): tambah grafik statistik aspirasi jakshel
- fix(theme): perbaiki warna teks pada tema ramadan
- chore: update dependencies ke versi terbaru
- Pull Request: Setiap PR wajib melalui proses review dan dipastikan berhasil melewati fase build lokal tanpa error.
