# Setup dan Running Guide - IKRAM Website

## Prasyarat
- PHP 7.4+ dengan extension mysqli
- MySQL atau MariaDB
- Browser modern

## Instalasi

### 1. Setup Database

#### Option A: Menggunakan MySQL/MariaDB di Local Machine
```bash
# Login ke MySQL
mysql -u root -p

# Jalankan setup script
mysql -u root -p < api/setup.php
```

#### Option B: Akses Database Online
Jika menggunakan database hosting online, edit `api/config.php` dan ubah:
```php
define('DB_HOST', 'your-host.com');
define('DB_USER', 'your_user');
define('DB_PASS', 'your_password');
define('DB_NAME', 'ikram_db');
```

### 2. Jalankan Setup Script PHP

Buka browser dan akses:
```
http://localhost/api/setup.php
```

Atau jalankan via command line:
```bash
php api/setup.php
```

Script ini akan membuat semua tabel yang diperlukan:
- `users` - Data user (untuk login/register)
- `admin_users` - Data admin
- `events` - Data event
- `registrations` - Data pendaftaran event
- `notifications` - Data notifikasi

### 3. Setup PHP Built-in Server (Testing)

```bash
cd /path/to/ikram-project
php -S localhost:8000
```

Lalu akses: `http://localhost:8000`

## API Endpoints

### User Authentication (`api/user_auth.php`)

#### Login User
```bash
POST /api/user_auth.php
Content-Type: application/x-www-form-urlencoded

action=login&email=user@example.com&password=password123
```

**Response Success:**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user_id": 1,
    "email": "user@example.com",
    "nama": "John Doe"
  }
}
```

#### Register User
```bash
POST /api/user_auth.php
Content-Type: application/x-www-form-urlencoded

action=register&nama=John Doe&email=user@example.com&no_hp=08123456789&password=password123&asal_institusi=SMA 1
```

**Response Success:**
```json
{
  "success": true,
  "message": "Pendaftaran berhasil",
  "data": {
    "user_id": 1,
    "email": "user@example.com",
    "nama": "John Doe"
  }
}
```

#### Get User Profile
```bash
GET /api/user_auth.php?action=me
```

#### Update Profile
```bash
POST /api/user_auth.php
Content-Type: application/x-www-form-urlencoded

action=update_profile&nama=Jane Doe&no_hp=08987654321&asal_institusi=Universitas Indonesia
```

#### Logout
```bash
POST /api/user_auth.php
Content-Type: application/x-www-form-urlencoded

action=logout
```

### Events (`api/events.php`)

#### Get All Events
```bash
GET /api/events.php
```

#### Create Event (Admin)
```bash
POST /api/events.php
action=create&judul=Workshop Leadership&deskripsi=...&tanggal=2024-06-25&waktu=10:00&lokasi=Gedung Serba Guna&kategori=workshop
```

### Registrations (`api/registrations.php`)

#### Register for Event
```bash
POST /api/registrations.php
action=register&event_id=1&alasan_mendaftar=Ingin belajar tentang kepemimpinan
```

#### Get My Registrations
```bash
GET /api/registrations.php?action=mine
```

## User Credentials

### Admin
- **Username:** admin
- **Password:** admin123

### Guest Login
Gunakan link "Lihat event tanpa login" untuk browse event tanpa perlu login

## Features

### User Authentication
✅ Register baru
✅ Login dengan email
✅ Edit profil
✅ Logout
✅ Password hashing dengan bcrypt
✅ Session management

### Event Management
✅ Lihat semua event
✅ Filter event by kategori
✅ Filter event by tanggal
✅ Daftar untuk event
✅ Lihat status pendaftaran

### Dashboard
✅ Lihat semua pendaftaran user
✅ Filter by status (pending, approved, rejected)
✅ Notifikasi status pendaftaran
✅ Edit profil

## File Structure

```
ikram-project/
├── index.html              # Homepage
├── login.html              # Login page
├── register.html           # Register page
├── dashboard.html          # User dashboard
├── event.html              # Events list
├── article.html            # Articles
├── contact.html            # Contact form
├── admin.html              # Admin panel
├── api/
│   ├── config.php          # Database config
│   ├── user_auth.php       # User auth API
│   ├── auth.php            # Admin auth API
│   ├── events.php          # Events API
│   ├── registrations.php   # Registrations API
│   ├── notifications.php   # Notifications API
│   └── setup.php           # Database setup
├── assets/
│   ├── css/
│   ├── js/
│   └── icon/
└── SETUP.md                # This file
```

## Troubleshooting

### 1. "Database connection error"
- Pastikan MySQL/MariaDB running
- Check `api/config.php` - pastikan credentials benar
- Check username dan password MySQL

### 2. "Table doesn't exist"
- Jalankan `http://localhost/api/setup.php` untuk membuat tabel

### 3. Email sudah terdaftar
- Gunakan email berbeda untuk register
- Atau login dengan email yang sudah terdaftar

### 4. Login gagal
- Pastikan email dan password benar
- Case-sensitive untuk password
- Check apakah user sudah terdaftar

## Development

### Menambah Field User
1. Edit `api/setup.php` - tambah column di CREATE TABLE users
2. Edit `api/user_auth.php` - update register dan update_profile action
3. Edit `dashboard.html` - tambah input field di profile modal

### Menambah Notification
1. Insert ke tabel `notifications`:
```php
$stmt = $conn->prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)");
$stmt->bind_param("isss", $user_id, $title, $message, $type);
$stmt->execute();
```

## Security Notes

✅ Password di-hash dengan bcrypt
✅ Input di-sanitize dengan htmlspecialchars & stripslashes
✅ Session-based authentication
✅ SQL prepared statements untuk prevent SQL injection
✅ CSRF protection via session tokens

Untuk production:
- Gunakan HTTPS
- Set secure cookie flags
- Implement rate limiting
- Regular security audits

## Testing Checklist

- [ ] Database created successfully
- [ ] Can register new user
- [ ] Can login with registered user
- [ ] Can view events
- [ ] Can register for event
- [ ] Can see registration in dashboard
- [ ] Can update profile
- [ ] Can logout
- [ ] Admin can login
- [ ] Admin can create event
