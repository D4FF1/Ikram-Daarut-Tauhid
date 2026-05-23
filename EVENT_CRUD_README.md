# 🎉 Event CRUD System - IKRAM Organization

Sistem Event Management yang lengkap dengan role-based access control. Admin dapat mengelola event (tambah, edit, hapus) sedangkan user biasa hanya dapat melihat dan memfilter event.

---

## 📋 Fitur Utama

### ✅ Admin Panel (`/admin.html`)
- **Login Authentication**: Username & Password sederhana (admin / admin123)
- **Dashboard**: Menampilkan statistik (Total Event, Event Mendatang)
- **Event Management**:
  - ✨ Tambah event baru
  - 📝 Edit event yang sudah ada
  - 🗑️ Hapus event
  - 📊 Tabel lengkap dengan filtering kategori
- **User Management**: Sidebar dengan info admin yang login
- **Responsive Design**: Tampil baik di desktop dan mobile

### ✅ Event Page untuk User (`/event.html`)
- **Read-Only Access**: User hanya bisa melihat, tidak bisa edit/delete
- **Dynamic Event Loading**: Events dimuat dari API/localStorage
- **Kategori Filter**: Filter events berdasarkan kategori (Workshop, Seminar, Outing, Kompetisi)
- **Event Information**:
  - Judul event
  - Tanggal & Waktu
  - Lokasi
  - Deskripsi lengkap
  - Kategori event

---

## 🏗️ Struktur Proyek

```
.
├── admin.html                    # Admin Panel Page
├── event.html                    # Event Page (User View) - UPDATED
├── index.html                    # Home Page - UPDATED
│
├── api/
│   ├── config.php               # Database & Session Config
│   ├── setup.php                # Database Setup Script
│   ├── auth.php                 # Authentication API (Login/Logout)
│   └── events.php               # Events CRUD API (Get/Post/Put/Delete)
│
├── assets/
│   ├── js/
│   │   ├── admin.js             # Admin Panel Logic (Forms, CRUD, Modals)
│   │   ├── event-api.js         # Event Loading & Rendering (NEW)
│   │   ├── script.js            # Global Scripts
│   │   └── events.js            # Event Page Scripts
│   │
│   └── css/
│       ├── admin.css            # Admin Panel Styling (NEW)
│       ├── style.css            # Global Styles
│       └── events.css           # Event Page Styles
│
├── ADMIN_SETUP.md              # Technical Setup Guide
└── EVENT_CRUD_README.md        # This file
```

---

## 🚀 Quick Start

### Demo Mode (No Database Needed)
1. Buka **admin.html** di browser
2. Login dengan:
   - Username: `admin`
   - Password: `admin123`
3. Gunakan form untuk:
   - ➕ Tambah event baru
   - ✏️ Edit event (klik icon edit)
   - ❌ Hapus event (klik icon delete)
4. Buka **event.html** untuk melihat events dari perspektif user biasa

**Data tersimpan di localStorage browser (akan hilang jika cache dihapus)**

### Production Mode (With PHP Backend)
Lihat file **ADMIN_SETUP.md** untuk setup database MySQL dan konfigurasi PHP backend.

---

## 📱 User Roles & Permissions

### 🔐 Admin
- ✅ Dapat login ke admin panel
- ✅ Dapat menambah event baru
- ✅ Dapat mengedit event yang sudah ada
- ✅ Dapat menghapus event
- ✅ Dapat melihat statistik events
- ✅ Dapat melihat semua events dalam tabel

### 👤 Regular User
- ❌ Tidak dapat login ke admin panel
- ❌ Tidak dapat menambah event
- ❌ Tidak dapat mengedit event
- ❌ Tidak dapat menghapus event
- ✅ Dapat melihat semua events
- ✅ Dapat memfilter events berdasarkan kategori
- ✅ Dapat melihat detail setiap event

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi |
|----------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Data Storage | localStorage (Demo) / MySQL (Production) |
| Backend API | PHP 7.4+ |
| Session Management | PHP Sessions + HTTP-only Cookies |
| Password Hashing | bcrypt |
| UI Framework | Custom CSS (No External Framework) |
| Icons | Font Awesome 6.4.0 |

---

## 📊 Event Fields

Setiap event memiliki fields berikut:

| Field | Type | Required | Deskripsi |
|-------|------|----------|-----------|
| id | Integer | Yes | Unique ID |
| judul | String | Yes | Judul/Nama event |
| deskripsi | Text | No | Deskripsi detail event |
| tanggal | Date | Yes | Tanggal event |
| waktu | Time | Yes | Waktu mulai event |
| lokasi | String | No | Lokasi event |
| kategori | String | No | Kategori (workshop, seminar, outing, kompetisi) |
| created_at | Timestamp | Auto | Waktu pembuatan |
| updated_at | Timestamp | Auto | Waktu update terakhir |

---

## 🎯 Use Cases

### Admin Workflow
1. Admin membuka `admin.html`
2. Login dengan username & password
3. Melihat dashboard dengan statistik
4. Klik "Kelola Event" untuk melihat daftar events
5. Klik "Tambah Event Baru" untuk membuat event
6. Isi form dan simpan
7. Edit atau hapus event sesuai kebutuhan

### User Workflow
1. User membuka `event.html`
2. Melihat semua events yang tersedia
3. Memfilter berdasarkan kategori (opsional)
4. Melihat detail setiap event
5. Klik "Daftar" untuk registrasi event

---

## 🔐 Security Features

### Current Implementation (Demo)
- Credentials stored di sessionStorage
- Input validation menggunakan HTML5
- XSS prevention dengan sanitization

### Production Recommendations
1. **Password Security**: bcrypt hashing (sudah di API)
2. **Session Security**: HTTP-only cookies + secure flags
3. **CSRF Protection**: CSRF tokens di forms
4. **Input Validation**: Server-side validation + prepared statements
5. **Access Control**: Role-based permission checks
6. **Rate Limiting**: Limit login attempts
7. **HTTPS**: Enforce encrypted connections

---

## 🎨 UI/UX Features

### Admin Panel
- 🌙 Dark sidebar dengan green accent color
- 📱 Fully responsive design
- ✨ Smooth animations & transitions
- 🔔 Toast notifications untuk user feedback
- 📊 Modal dialogs untuk form inputs
- ⌨️ Keyboard accessibility

### Event Page
- 🎨 Colorful gradient cards
- 🏷️ Category badges dengan warna berbeda
- 📅 Date badge di setiap card
- 🔍 Category filter buttons
- ⏱️ AOS animations untuk visual appeal

---

## 📈 Future Enhancements

### Phase 2 - Advanced Features
- [ ] Email notifications untuk event updates
- [ ] Event registration system dengan email confirmation
- [ ] Event attendance tracking
- [ ] User dashboard untuk lihat registered events
- [ ] Image upload untuk event banners
- [ ] Calendar view untuk melihat events

### Phase 3 - Analytics & Reporting
- [ ] Event analytics dashboard
- [ ] Attendance reports
- [ ] Event performance metrics
- [ ] Export events ke CSV/PDF
- [ ] Admin action logs

### Phase 4 - Advanced Security
- [ ] Two-factor authentication (OTP/Authenticator)
- [ ] Admin role management (Super Admin, Editor, Viewer)
- [ ] API rate limiting
- [ ] IP whitelisting untuk admin
- [ ] Audit logs untuk setiap action

---

## ⚙️ Configuration

### Demo Mode (Default)
Tidak perlu konfigurasi, sudah bisa langsung pakai!

### Production Mode
Edit `api/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'your_password');
define('DB_NAME', 'ikram_db');
```

Jalankan `api/setup.php` untuk setup database.

---

## 🐛 Troubleshooting

### Admin Login Tidak Bekerja
- Pastikan browser memungkinkan sessionStorage
- Check browser console untuk error messages
- Clear cache dan reload page

### Events Tidak Tampil
- Refresh halaman event
- Check localStorage di DevTools > Application
- Verify `event-api.js` sudah loaded

### Modal Tidak Menutup
- Klik di luar modal area
- Klik tombol X di top-right modal
- Tekan ESC key

---

## 📞 Support

### For Demo Issues
1. Buka browser DevTools (F12)
2. Check Console tab untuk error messages
3. Check Network tab untuk failed requests

### For Production Setup
Refer ke `ADMIN_SETUP.md` untuk detailed setup instructions.

---

## 📝 API Documentation

### Events Endpoints
```
GET  /api/events.php              - Get all events
POST /api/events.php              - Create new event (admin only)
PUT  /api/events.php              - Update event (admin only)
DELETE /api/events.php            - Delete event (admin only)
```

### Auth Endpoints
```
POST /api/auth.php?action=login   - Login admin
POST /api/auth.php?action=logout  - Logout admin
GET  /api/auth.php                - Check auth status
```

---

## 🎯 Testing Checklist

- [x] Admin login berhasil
- [x] Dashboard menampilkan statistik
- [x] Tambah event modal muncul dan berfungsi
- [x] Events ditampilkan di tabel
- [x] Edit event berhasil
- [x] Delete event berhasil
- [x] User page menampilkan events
- [x] Filter kategori bekerja
- [x] Responsive design OK
- [x] No edit/delete buttons untuk user

---

**Status**: ✅ Demo Ready | ⚙️ Production Ready (with backend setup)

**Last Updated**: 2024
**Version**: 1.0.0
