# 🚀 Quick Start Guide

## ⚡ 5 Menit Setup

### 1. Database Setup (1 menit)
```bash
# Pastikan MySQL/MariaDB sudah running, lalu:
php api/setup.php

# Atau buka di browser:
http://localhost/api/setup.php
```

Script ini akan membuat:
- Table `users` untuk user data
- Table `events` untuk event
- Table `registrations` untuk pendaftaran
- Table `notifications` untuk notifikasi
- Default admin user: `admin` / `admin123`

### 2. Start PHP Server (30 detik)
```bash
php -S localhost:8000
```

Buka browser: `http://localhost:8000`

### 3. Test API (2 menit)
Buka: `http://localhost:8000/api-test.html`

Test endpoints:
1. Register → masukkan data user
2. Login → gunakan email & password yang baru di-register
3. Get Profile → lihat data user
4. Get Events → lihat semua event

Done! ✅

## 📝 Workflow Lengkap

### User Perspective
```
1. Kunjungi index.html (home)
   ↓
2. Klik "Daftar Sekarang" → register.html
   ↓
3. Isi form register
   ↓
4. Login dengan email & password
   ↓
5. Lihat events di event.html
   ↓
6. Register untuk event
   ↓
7. Check dashboard.html untuk lihat status
```

### Admin Perspective
```
1. Kunjungi admin.html
   ↓
2. Login: admin / admin123
   ↓
3. Buat event baru
   ↓
4. Review & approve/reject registrations
```

## 🧪 Test Scenarios

### Scenario 1: Register & Login
```bash
# 1. Register
POST /api/user_auth.php
action=register
nama=John Doe
email=john@example.com
no_hp=08123456789
password=password123

# 2. Login
POST /api/user_auth.php
action=login
email=john@example.com
password=password123

# Response:
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user_id": 1,
    "email": "john@example.com",
    "nama": "John Doe"
  }
}
```

### Scenario 2: Event Registration
```bash
# 1. Get Events
GET /api/events.php

# 2. Register for Event (logged-in user)
POST /api/registrations.php
action=register
event_id=1
alasan_mendaftar=Ingin belajar

# 3. Check My Registrations
GET /api/registrations.php?action=mine
```

### Scenario 3: Update Profile
```bash
POST /api/user_auth.php
action=update_profile
nama=Jane Doe
no_hp=08987654321
asal_institusi=Universitas Indonesia
```

## 🐛 Common Issues & Solutions

### Issue: Database connection error
```
✗ Connection failed: Connection refused
```
**Solution:** 
- Pastikan MySQL running: `mysql.server start` (Mac) atau services di Windows
- Check `api/config.php` - pastikan DB_HOST, DB_USER, DB_PASS benar

### Issue: Table doesn't exist
```
✗ SQLSTATE: Base table or view not found
```
**Solution:**
- Jalankan setup script lagi: `php api/setup.php`

### Issue: Email sudah terdaftar
```
✗ Email sudah terdaftar, gunakan email lain
```
**Solution:**
- Gunakan email berbeda saat register
- Atau login dengan email yang sudah ada

### Issue: Login gagal
```
✗ Email tidak ditemukan / Password salah
```
**Solution:**
- Pastikan sudah register
- Double-check email & password (case-sensitive)
- Gunakan password yang sama saat register

### Issue: 404 di api endpoint
```
✗ GET/POST http://localhost:8000/api/user_auth.php 404
```
**Solution:**
- Pastikan file ada: `/api/user_auth.php`
- Check path di HTML file (relative path)

## 📱 File Structure

```
ikram-project/
├── index.html              👈 Start here
├── register.html           👈 Register form
├── login.html              👈 Login form
├── event.html              👈 Event listing
├── dashboard.html          👈 User dashboard
├── admin.html              👈 Admin panel
├── api/
│   ├── config.php          Database config
│   ├── user_auth.php       ✨ User auth (BARU)
│   ├── registrations.php   Registration management
│   ├── events.php          Event management
│   ├── notifications.php   ✨ Notifications (BARU)
│   └── setup.php           Database setup
├── assets/                 CSS, JS, images
├── QUICKSTART.md           📍 You are here
├── SETUP.md                Detailed setup guide
├── FIXES.md                What's been fixed
└── api-test.html           ✨ API test console (BARU)
```

## 🔑 Admin Credentials
- **Username:** admin
- **Password:** admin123

*Change password after first login!*

## 📊 Default Database

Setup script creates:
- 1 admin user (admin/admin123)
- 0 regular users (you'll create via register)
- 0 events (admin creates via dashboard)
- 0 registrations

## 🎓 Learning Path

1. **Understand the Flow**
   - Read SETUP.md - API documentation
   - Review api-test.html - how endpoints work

2. **Test Manually**
   - Use api-test.html for quick testing
   - Use Postman/curl for deeper testing

3. **Explore the Code**
   - api/user_auth.php - user authentication
   - api/registrations.php - event registration
   - dashboard.html - frontend integration

4. **Customize**
   - Add new fields to users table
   - Create custom event types
   - Add email notifications

## ✅ Final Checklist

- [ ] Database created (`php api/setup.php`)
- [ ] PHP server running (`php -S localhost:8000`)
- [ ] Can access home page (`http://localhost:8000`)
- [ ] Can register new user
- [ ] Can login with registered user
- [ ] Can view events
- [ ] Can register for event
- [ ] Can see registration in dashboard
- [ ] Can update profile
- [ ] Can logout

## 🚀 Next Steps

After testing works:
1. Deploy to production server
2. Change admin password
3. Setup custom domain
4. Configure email notifications
5. Add SSL certificate

## 📞 Need Help?

1. **Check SETUP.md** - Detailed troubleshooting guide
2. **Open api-test.html** - Interactive testing
3. **Read FIXES.md** - What was fixed and why
4. **Check console** - Browser F12 → Console tab

---

**Status:** ✅ Ready to use!  
**Last Updated:** May 24, 2026  
**Created by:** v0 AI Assistant
