# 🚀 Quick Start - Event CRUD System

Mulai menggunakan Event CRUD System dalam 5 menit!

---

## ⚡ 5-Minute Setup

### Option 1: Demo Mode (No Setup Needed) ✨

1. **Buka Admin Panel**
   ```
   http://localhost/admin.html
   ```

2. **Login dengan default credentials:**
   - Username: `admin`
   - Password: `admin123`

3. **Mulai mengelola events:**
   - Klik "Tambah Event Baru" untuk menambah event
   - Klik icon edit untuk mengubah event
   - Klik icon delete untuk menghapus event

4. **Lihat events dari user perspective:**
   ```
   http://localhost/event.html
   ```

5. **Filter events:**
   - Klik kategori buttons (Workshop, Seminar, etc.)
   - Hanya user yang login ke admin bisa edit/delete

**That's it! 🎉**

---

### Option 2: Production Mode (With Database)

#### Prerequisites
- PHP 7.4+ dengan MySQL support
- MySQL server running
- Akses ke database

#### Setup Steps

1. **Edit database config**
   ```php
   // api/config.php
   define('DB_HOST', 'localhost');
   define('DB_USER', 'root');
   define('DB_PASS', 'your_password');
   define('DB_NAME', 'ikram_db');
   ```

2. **Run setup script**
   ```
   http://localhost/api/setup.php
   ```
   Ini akan create database dan tables otomatis

3. **Update admin.js untuk gunakan API**
   ```javascript
   // Di assets/js/admin.js
   // Ubah handleLogin function untuk call api/auth.php
   ```

4. **Done!** 🎉

---

## 🎯 Common Tasks

### ➕ Add a New Event (Admin)

1. Login ke admin panel
2. Klik "Kelola Event" di sidebar
3. Klik "Tambah Event Baru" button
4. Isi form:
   - Judul: Event title
   - Tanggal: Event date
   - Waktu: Event start time
   - Lokasi: Event location (optional)
   - Kategori: Workshop/Seminar/Outing/Kompetisi
   - Deskripsi: Event description (optional)
5. Klik "Tambah Event" button
6. Success notification akan muncul ✅

### ✏️ Edit an Event (Admin)

1. Login ke admin panel
2. Klik "Kelola Event"
3. Klik icon edit (pencil) di event yang ingin diubah
4. Form akan terisi dengan data event sebelumnya
5. Ubah data yang ingin dimodifikasi
6. Klik "Perbarui Event"
7. Success notification ✅

### 🗑️ Delete an Event (Admin)

1. Login ke admin panel
2. Klik "Kelola Event"
3. Klik icon delete (trash) di event yang ingin dihapus
4. Confirm dialog akan muncul
5. Klik "Hapus" untuk confirm
6. Event akan dihapus ✅

### 👤 View Events (User)

1. Buka event.html
2. Scroll untuk melihat semua events
3. Klik kategori buttons untuk filter:
   - Semua Event: Show all
   - Workshop: Show workshops only
   - Seminar: Show seminars only
   - Outing: Show outings only
   - Kompetisi: Show competitions only
4. Klik "Daftar" untuk registrasi (if available)

---

## 🔑 Default Credentials

```
Username: admin
Password: admin123
```

**Note**: Change these di production! 🔐

---

## 📱 Responsive Design

Sistem ini fully responsive untuk:
- 📱 Mobile phones (320px+)
- 📱 Tablets (768px+)
- 🖥️ Desktops (1024px+)

Test dengan mengubah browser window size atau gunakan DevTools.

---

## 🐛 Troubleshooting

### Login tidak bekerja?
- Clear browser cache
- Try again dengan correct credentials
- Check browser console (F12) untuk error messages

### Events tidak muncul?
- Refresh page
- Check localStorage (DevTools > Application > Local Storage)
- Di production, verify database connection

### Modal tidak tutup?
- Klik area luar modal
- Tekan ESC key
- Refresh page

### Styling terlihat aneh?
- Clear cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)
- Check browser console untuk CSS errors

---

## 🎨 Customization

### Change colors
Edit `assets/css/admin.css`:
```css
:root {
    --primary-color: #4A6D2C;  /* Change this */
    --danger-color: #dc3545;
    /* ... more colors ... */
}
```

### Change brand name
Edit `admin.html`:
```html
<h2>Your Organization Name Here</h2>
```

### Add more categories
Edit `admin.html` dan `assets/js/admin.js`:
```html
<option value="your-category">Your Category</option>
```

---

## 📚 Full Documentation

Untuk info lebih detail, lihat:
- **EVENT_CRUD_README.md** - Full feature documentation
- **ADMIN_SETUP.md** - Technical setup & configuration
- **IMPLEMENTATION_SUMMARY.md** - Implementation details
- **CRUD_FILE_INDEX.md** - File reference guide

---

## ✨ Features Checklist

Admin Panel:
- ✅ Login/Logout
- ✅ Dashboard dengan statistics
- ✅ Add events
- ✅ Edit events
- ✅ Delete events
- ✅ Events table
- ✅ Toast notifications
- ✅ Responsive design

Event Page:
- ✅ View all events
- ✅ Filter by category
- ✅ Event details
- ✅ Read-only access
- ✅ Responsive design

---

## 🚀 Next Steps

1. **Explore the features:**
   - Try add/edit/delete events
   - Test filtering
   - Check responsive design

2. **Customize for your needs:**
   - Change colors & branding
   - Add more categories
   - Customize event fields

3. **Setup production environment:**
   - Configure database
   - Update API endpoints
   - Deploy to server

4. **Add more features:**
   - User registration
   - Email notifications
   - Event analytics

---

## 📞 Help & Support

### Documentation
- Quick questions? Check **QUICK_START.md** (this file)
- Setup issues? Check **ADMIN_SETUP.md**
- Feature questions? Check **EVENT_CRUD_README.md**
- File reference? Check **CRUD_FILE_INDEX.md**

### Technical Issues
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab untuk API calls
4. Read error messages carefully

### Common Errors

**"Unauthorized"**
- Admin only feature used by non-admin
- Solution: Login dengan admin account

**"Connection refused"**
- PHP server not running
- Solution: Start your PHP/Apache server

**"Events not loading"**
- localStorage clear
- Solution: Add event dari admin panel dulu

---

## 🎉 You're All Set!

Admin panel ready! Start mengelola events Anda sekarang:

```
Admin Panel:  http://localhost/admin.html
Event Page:   http://localhost/event.html
Home:         http://localhost/index.html
```

Happy event managing! 🚀

---

**Questions?** Refer ke full documentation files atau check browser console untuk detailed error messages.

**Ready for production?** Follow setup instructions di ADMIN_SETUP.md untuk configure database dan deploy.

---

**Version**: 1.0.0
**Last Updated**: 2024
