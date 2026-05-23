# Sistem Login & Registrasi Event IKRAM

Sistem manajemen event lengkap dengan autentikasi pengguna dan panel admin untuk organisasi IKRAM.

## STATUS: SISTEM SUDAH AKTIF ✓

Database dan authentication sudah dikonfigurasi dengan benar. Anda bisa langsung menggunakan sistem.

## Quick Start

1. **Buka `setup-admin.html`** - Buat akun admin pertama
2. **Login di `login-supabase.html`** - Gunakan kredensial admin
3. **Akses `admin-supabase.html`** - Kelola event dan pendaftaran

## Fitur Utama

### 1. Autentikasi Pengguna
- **Registrasi**: Pengguna baru dapat membuat akun
- **Login**: Akses ke dashboard personal
- **Logout**: Keluar dari sesi dengan aman

### 2. Dashboard User
- Melihat status pendaftaran event
- Statistik pendaftaran (pending, diterima, ditolak)
- Filter berdasarkan status pendaftaran

### 3. Event Management
- Melihat daftar event yang tersedia
- Mendaftar event dengan mudah
- Filter event berdasarkan kategori

### 4. Admin Panel
- Dashboard statistik
- Kelola event (tambah, edit, hapus)
- Persetujuan/penolakan pendaftaran

## Struktur File

```
├── js/
│   └── supabaseClient.js       # Konfigurasi Supabase client
├── login-supabase.html         # Halaman login
├── register-supabase.html      # Halaman registrasi
├── dashboard-supabase.html     # Dashboard user
├── event-supabase.html         # Daftar event
├── admin-supabase.html         # Panel admin
├── setup-admin.html            # Setup akun admin
└── index.html                  # Halaman utama (sudah diupdate)
```

## Cara Penggunaan

### Langkah 1: Setup Admin

1. Buka file `setup-admin.html` di browser
2. Isi form dengan kredensial admin:
   - Email: `admin@ikram.org` (atau email lain)
   - Password: Minimal 6 karakter
   - Nama: Nama lengkap admin
   - No HP: Nomor WhatsApp aktif
3. Klik "Buat Admin"
4. Setelah berhasil, Anda akan diarahkan ke halaman login

### Langkah 2: Login Admin

1. Buka `login-supabase.html`
2. Masukkan email dan password admin
3. Setelah login, akses `admin-supabase.html`

### Langkah 3: Kelola Event (Admin)

1. Di panel admin, klik "Kelola Event" di sidebar
2. Klik "Tambah Event" untuk membuat event baru
3. Isi detail event:
   - Judul event
   - Tanggal dan waktu
   - Kategori (Workshop, Seminar, Outing, Kompetisi)
   - Kuota peserta
   - Lokasi
   - Deskripsi
4. Edit atau hapus event yang ada

### Langkah 4: Persetujuan Pendaftaran (Admin)

1. Klik "Pendaftaran" di sidebar admin
2. Lihat daftar pendaftaran dengan status
3. Filter berdasarkan status (Pending, Disetujui, Ditolak)
4. Klik tombol centang untuk menyetujui
5. Klik tombol silang untuk menolak

### Langkah 5: Registrasi User

1. User membuka `register-supabase.html`
2. Isi data diri:
   - Nama lengkap
   - Email
   - No HP/WhatsApp
   - Asal institusi (opsional)
   - Password
3. Klik "Daftar Sekarang"
4. Otomatis diarahkan ke dashboard

### Langkah 6: Mendaftar Event (User)

1. Login ke akun
2. Buka `event-supabase.html`
3. Pilih event yang diminati
4. Klik "Daftar Sekarang"
5. Isi alasan mendaftar (opsional)
6. Kirim pendaftaran

### Langkah 7: Pantau Status (User)

1. Buka `dashboard-supabase.html`
2. Lihat statistik pendaftaran
3. Filter berdasarkan status
4. Tunggu persetujuan admin

## Database Schema

### Tabel `profiles`
- `id` (UUID, primary key)
- `nama` (text)
- `email` (text, unique)
- `no_hp` (text)
- `asal_institusi` (text)
- `role` (text: 'user' atau 'admin')
- `created_at`, `updated_at` (timestamp)

### Tabel `events`
- `id` (UUID, primary key)
- `judul` (text)
- `deskripsi` (text)
- `tanggal` (date)
- `waktu` (time)
- `lokasi` (text)
- `kategori` (text)
- `kuota_peserta` (integer)
- `poster` (text, URL)
- `created_by` (UUID, foreign key)
- `created_at`, `updated_at` (timestamp)

### Tabel `registrations`
- `id` (UUID, primary key)
- `event_id` (UUID, foreign key)
- `user_id` (UUID, foreign key)
- `alasan_mendaftar` (text)
- `status` (text: 'pending', 'approved', 'rejected')
- `created_at`, `updated_at` (timestamp)
- Unique constraint: (event_id, user_id)

## Keamanan

1. **Row Level Security (RLS)**: Semua tabel dilindungi dengan RLS
2. **Policies**:
   - User hanya bisa melihat dan mengubah profil sendiri
   - User bisa melihat semua event
   - User bisa membuat dan melihat pendaftaran sendiri
   - Admin bisa mengelola semua event dan pendaftaran
3. **Supabase Auth**: Autentikasi aman dengan Supabase
4. **Password Hashing**: Password di-hash otomatis oleh Supabase

## Alur Kerja Lengkap

### User Flow
1. Register → Login → Dashboard → Event → Daftar → Tunggu Persetujuan

### Admin Flow
1. Setup Admin → Login Admin → Dashboard → Kelola Event → Persetujuan Pendaftaran

### Persetujuan Flow
1. User daftar event → Status: PENDING
2. Admin lihat di panel → Setujui/Tolak
3. Status diupdate → User lihat di dashboard

## Troubleshooting

### Error: "Akses ditolak. Anda bukan admin."
- Pastikan sudah membuat admin via `setup-admin.html`
- Login dengan kredensial admin yang sudah dibuat
- Cek di database: `SELECT * FROM profiles WHERE role = 'admin';`

### Error: "Email sudah terdaftar"
- Email sudah digunakan, gunakan email lain atau login
- Jika lupa password, gunakan fitur reset password Supabase

### Error: "Password minimal 6 karakter"
- Gunakan password minimal 6 karakter

### Tidak bisa mendaftar event
- Pastikan sudah login
- Cek apakah sudah pernah mendaftar event yang sama
- Cek apakah kuota masih tersedia

### Register berhasil tapi tidak bisa login
- Cek email Anda untuk konfirmasi (jika email confirmation aktif)
- Atau langsung coba login (jika email confirmation dinonaktifkan)
- Supabase default: email confirmation DINONAKTIFKAN

### Error saat registrasi
1. Buka browser Developer Tools (F12)
2. Lihat tab Console untuk error detail
3. Cek Network tab untuk request yang gagal
4. Kirim screenshot error ke admin

## Integrasi dengan Website Lama

File-file baru dengan suffix `-supabase.html` dibuat terpisah agar tidak mengganggu sistem lama (PHP). Anda bisa:

1. Menjalankan sistem baru dan lama secara paralel
2. Membuat alias redirect jika ingin migrasi total
3. Mengganti link di `index.html` ke halaman baru

## Kontak

Jika ada pertanyaan atau masalah, hubungi tim IT IKRAM.

---

*Developed with Supabase + Modern JavaScript*
