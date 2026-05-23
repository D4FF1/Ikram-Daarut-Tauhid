# Admin Panel & Event CRUD System - Setup Guide

## Gambaran Umum
Sistem CRUD Event Management untuk IKRAM dengan fitur:
- ✅ Admin Panel untuk mengelola event (Add/Edit/Delete)
- ✅ User biasa hanya bisa melihat event, tidak bisa edit/delete
- ✅ Authentication sederhana (Username & Password)
- ✅ Data disimpan di localStorage (untuk demo) atau PHP Backend (untuk production)

---

## Struktur File

```
project/
├── api/
│   ├── config.php          # Database configuration & helpers
│   ├── setup.php           # Database setup script
│   ├── auth.php            # Authentication API
│   └── events.php          # Events CRUD API
├── admin.html              # Admin Panel
├── event.html              # Event Page (User View)
├── assets/
│   ├── js/
│   │   ├── admin.js        # Admin Panel Logic
│   │   └── event-api.js    # Event API Integration
│   └── css/
│       └── admin.css       # Admin Panel Styling
└── ADMIN_SETUP.md          # Setup Guide (file ini)
```

---

## Setup Instructions

### Opsi 1: Demo Mode (Menggunakan localStorage - Untuk Testing)
**Tidak perlu database setup, bisa langsung pakai untuk testing!**

1. Buka file `admin.html` di browser
2. Login dengan:
   - Username: `admin`
   - Password: `admin123`
3. Gunakan form untuk menambah event baru
4. Events tersimpan di localStorage browser Anda

**Catatan:** Data akan hilang jika cache browser dihapus

### Opsi 2: Production Mode (Menggunakan PHP Backend & Database)

#### Step 1: Database Setup
1. Buat database MySQL baru dengan nama `ikram_db`
   ```sql
   CREATE DATABASE ikram_db;
   ```

2. Buka file `api/setup.php` di browser: `http://localhost/path/to/api/setup.php`
   - File ini akan otomatis membuat:
     - Table `admin_users` dengan default user (admin/admin123)
     - Table `events` untuk menyimpan event

3. Atau jalankan manual SQL:
   ```sql
   CREATE TABLE admin_users (
     id INT PRIMARY KEY AUTO_INCREMENT,
     username VARCHAR(50) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE events (
     id INT PRIMARY KEY AUTO_INCREMENT,
     judul VARCHAR(255) NOT NULL,
     deskripsi TEXT,
     tanggal DATE NOT NULL,
     waktu TIME NOT NULL,
     lokasi VARCHAR(255),
     kategori VARCHAR(50),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );

   INSERT INTO admin_users (username, password) VALUES 
   ('admin', '$2y$10$hash_dari_bcrypt_admin123');
   ```

#### Step 2: Konfigurasi Database
Edit file `api/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');        // Username MySQL Anda
define('DB_PASS', '');            // Password MySQL Anda
define('DB_NAME', 'ikram_db');    // Nama database
```

#### Step 3: Switch ke Backend Mode
Edit file `assets/js/admin.js`, ubah fungsi `handleLogin`:
```javascript
// Current (localStorage mode):
if (username === 'admin' && password === 'admin123') {
    // Demo mode

// Change to (Backend mode):
async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('action', 'login');
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await fetch('api/auth.php', {
        method: 'POST',
        body: formData
    });
    // ... handle response
}
```

---

## API Endpoints

### Authentication
```
POST /api/auth.php
  - action: 'login' | 'logout' | 'check'
  - username: string
  - password: string
```

### Events CRUD
```
GET /api/events.php
  - Returns: Array of all events

POST /api/events.php (Admin only)
  - judul: string (required)
  - deskripsi: text
  - tanggal: date (required)
  - waktu: time (required)
  - lokasi: string
  - kategori: string

PUT /api/events.php (Admin only)
  - id: integer (required)
  - judul, deskripsi, tanggal, waktu, lokasi, kategori

DELETE /api/events.php (Admin only)
  - id: integer (required)
```

---

## Penggunaan

### Untuk Admin:
1. Akses: `http://localhost/admin.html`
2. Login: admin / admin123
3. Kelola event:
   - Klik "Tambah Event Baru" untuk membuat event
   - Klik icon edit untuk mengubah event
   - Klik icon delete untuk menghapus event

### Untuk User Biasa:
1. Akses: `http://localhost/event.html`
2. Hanya bisa melihat events dan filter berdasarkan kategori
3. Tidak ada tombol edit/delete

---

## Security Notes

### Current (Demo Mode):
- Credentials hardcoded di JavaScript
- Suitable untuk development/demo only
- Data di localStorage dapat diakses user

### Production Recommendations:
1. **Password Hashing**: Gunakan bcrypt (sudah di setup.php)
2. **Session Management**: PHP sessions + HTTP-only cookies
3. **CSRF Protection**: Implementasi CSRF tokens
4. **Input Validation**: Prepared statements (sudah di api/events.php)
5. **Access Control**: Check admin status di setiap API call
6. **HTTPS**: Gunakan HTTPS di production
7. **Rate Limiting**: Implementasi rate limiter untuk login

---

## Troubleshooting

### Login tidak bekerja
- **Demo Mode**: Pastikan localStorage tidak diblock di browser settings
- **Backend Mode**: Check database connection di `api/config.php`
- Buka browser console (F12) untuk melihat error messages

### Events tidak tampil
- **Demo Mode**: Check localStorage di DevTools > Application > Local Storage
- **Backend Mode**: Pastikan database dan API endpoint sudah benar

### Database connection error
- Pastikan MySQL service running
- Verify credentials di `api/config.php`
- Create database: `CREATE DATABASE ikram_db;`

### API calls return 403
- User belum login dengan akun admin
- Session sudah expired, perlu login ulang

---

## Next Steps / Future Enhancements

1. **Email Notifications**: Kirim email ke peserta saat ada event baru
2. **Event Registration**: Peserta bisa register untuk event
3. **File Upload**: Upload gambar/banner untuk event
4. **Analytics**: Dashboard statistik event
5. **Calendar View**: Tampilkan events dalam bentuk calendar
6. **Export**: Export events ke CSV/PDF
7. **Two-Factor Auth**: OTP atau authenticator app
8. **Role Management**: Multiple admin roles (Admin, Editor, Viewer)

---

## Support & Documentation

### Files Reference:
- **admin.html** - UI untuk admin panel
- **admin.css** - Styling admin panel
- **admin.js** - Logic untuk forms, modal, API calls
- **event-api.js** - Fetch & render events untuk user
- **api/config.php** - Database & session setup
- **api/events.php** - CRUD operations
- **api/auth.php** - Login/logout
- **api/setup.php** - Database initialization

### Technology Stack:
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: PHP 7.4+
- **Database**: MySQL / MariaDB
- **Session**: PHP Sessions
- **Password**: bcrypt hashing

---

**Last Updated**: 2024
**Status**: Demo Ready ✅ | Production Ready (dengan setup backend) ⚙️
