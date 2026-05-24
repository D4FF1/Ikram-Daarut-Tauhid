// Admin Panel JavaScript - Connected to MySQL Backend

// DOM Elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const addEventBtn = document.getElementById('addEventBtn');
const eventModal = document.getElementById('eventModal');
const eventForm = document.getElementById('eventForm');
const cancelBtn = document.getElementById('cancelBtn');
const confirmModal = document.getElementById('confirmModal');
const confirmCancelBtn = document.getElementById('confirmCancelBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const modalClose = document.querySelector('.modal-close');
const eventsTableBody = document.getElementById('eventsTableBody');
const registrationsTableBody = document.getElementById('registrationsTableBody');
const adminName = document.getElementById('adminName');
const userBadge = document.getElementById('userBadge');
const sidebarToggle = document.getElementById('sidebarToggle');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const sidebar = document.querySelector('.admin-sidebar');
const navItems = document.querySelectorAll('.nav-item');

// Global state
let currentEditingEventId = null;
let allEvents = [];
let allRegistrations = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Check authentication
function checkAuth() {
    fetch('api/admin_auth.php?action=me')
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                showDashboard(data.data);
            } else {
                showLogin();
            }
        })
        .catch(() => showLogin());
}

// Show login section
function showLogin() {
    loginSection.classList.add('active');
    dashboardSection.style.display = 'none';
}

// Show dashboard section
function showDashboard(adminData) {
    loginSection.classList.remove('active');
    dashboardSection.style.display = 'grid';
    adminName.textContent = adminData.nama;
    userBadge.textContent = adminData.nama;
    loadEvents();
    loadRegistrations();
    updateStats();
    
    // Set up registrations filter listener
    const statusFilter = document.getElementById('registrationStatusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterRegistrations);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Add event button
    if (addEventBtn) {
        addEventBtn.addEventListener('click', openAddEventModal);
    }
    
    // Event form
    if (eventForm) {
        eventForm.addEventListener('submit', handleSaveEvent);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeEventModal);
    }
    if (modalClose) {
        modalClose.addEventListener('click', closeEventModal);
    }
    
    // Confirm delete
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', handleDeleteEvent);
    }
    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener('click', closeConfirmModal);
    }
    
    // Click outside modal to close
    if (eventModal) {
        eventModal.addEventListener('click', (e) => {
            if (e.target === eventModal) closeEventModal();
        });
    }
    if (confirmModal) {
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) closeConfirmModal();
        });
    }
    
    // Navigation items
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const menu = item.dataset.menu;
            switchMenu(menu);
        });
    });
    
    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
    
    // Sidebar toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }
}

// Handle login with backend
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('username').value; // Changed to use email
    const password = document.getElementById('password').value;
    
    const fd = new FormData();
    fd.append('action', 'login');
    fd.append('email', email);
    fd.append('password', password);
    
    try {
        const res = await fetch('api/admin_auth.php', { method: 'POST', body: fd });
        const data = await res.json();
        
        if (data.success) {
            showToast('Login berhasil!', 'success');
            showDashboard(data.data);
            loginForm.reset();
        } else {
            showToast(data.message, 'error');
        }
    } catch (err) {
        showToast('Gagal login: ' + err.message, 'error');
    }
}

// Handle logout
async function handleLogout() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        try {
            const res = await fetch('api/admin_auth.php', {
                method: 'POST',
                body: new FormData(Object.assign(document.createElement('form'), {
                    elements: { action: { value: 'logout' } }
                })),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            
            // Simpler logout
            await fetch('api/admin_auth.php?action=logout');
            showLogin();
            loginForm.reset();
            showToast('Logout berhasil', 'success');
        } catch (err) {
            showToast('Gagal logout: ' + err.message, 'error');
        }
    }
}

// Load events from backend
async function loadEvents() {
    try {
        const res = await fetch('api/events.php');
        const data = await res.json();
        
        if (data.success) {
            allEvents = data.data;
        } else {
            allEvents = [];
        }
        renderEventsTable();
    } catch (err) {
        console.error('Error loading events:', err);
        showToast('Gagal memuat events', 'error');
    }
}

// Load registrations from backend
async function loadRegistrations() {
    try {
        const res = await fetch('api/registrations.php?action=all');
        const data = await res.json();
        
        if (data.success) {
            allRegistrations = data.data;
        } else {
            allRegistrations = [];
        }
        renderRegistrationsTable();
    } catch (err) {
        console.error('Error loading registrations:', err);
    }
}

// Render events table
function renderEventsTable() {
    if (!eventsTableBody) return;
    
    if (allEvents.length === 0) {
        eventsTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Tidak ada event</td></tr>';
        return;
    }
    
    let html = '';
    allEvents.forEach((event, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${event.judul}</td>
                <td>${formatDate(event.tanggal)}</td>
                <td>${event.waktu}</td>
                <td>${event.lokasi || '-'}</td>
                <td>
                    <span class="badge badge-${event.kategori || 'default'}">
                        ${event.kategori || 'N/A'}
                    </span>
                </td>
                <td class="actions">
                    <button class="btn-icon edit" onclick="openEditEventModal(${event.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="openConfirmDelete(${event.id}, '${event.judul}')" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    eventsTableBody.innerHTML = html;
}

// Render registrations table
function renderRegistrationsTable() {
    if (!registrationsTableBody) return;
    
    if (allRegistrations.length === 0) {
        registrationsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Tidak ada registrasi</td></tr>';
        return;
    }
    
    let html = '';
    allRegistrations.forEach((reg, index) => {
        const badgeClass = reg.status === 'pending' ? 'warning' : (reg.status === 'approved' ? 'success' : 'danger');
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${reg.nama}</td>
                <td>${reg.email}</td>
                <td>${reg.no_hp}</td>
                <td>${reg.event_judul}</td>
                <td>
                    <span class="badge badge-${badgeClass}">${reg.status}</span>
                </td>
                <td>${formatDate(reg.created_at)}</td>
                <td class="actions">
                    ${reg.status === 'pending' ? `
                        <button class="btn-icon approve" onclick="approveRegistration(${reg.id})" title="Setujui">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-icon reject" onclick="rejectRegistration(${reg.id})" title="Tolak">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    });
    registrationsTableBody.innerHTML = html;
}

// Update statistics
function updateStats() {
    const totalEventsEl = document.getElementById('totalEvents');
    const upcomingEventsEl = document.getElementById('upcomingEvents');
    const pendingRegistrationsEl = document.getElementById('pendingRegistrations');
    const registrationBadge = document.getElementById('registrationBadge');
    
    if (totalEventsEl) {
        const today = new Date().toISOString().split('T')[0];
        const upcomingCount = allEvents.filter(e => e.tanggal >= today).length;
        const pendingCount = allRegistrations.filter(r => r.status === 'pending').length;
        
        totalEventsEl.textContent = allEvents.length;
        if (upcomingEventsEl) upcomingEventsEl.textContent = upcomingCount;
        if (pendingRegistrationsEl) pendingRegistrationsEl.textContent = pendingCount;
        if (registrationBadge) registrationBadge.textContent = pendingCount;
    }
}

// Open add event modal
function openAddEventModal() {
    if (!eventModal || !eventForm) return;
    
    currentEditingEventId = null;
    eventForm.reset();
    document.getElementById('eventId').value = '';
    document.getElementById('modalTitle').textContent = 'Tambah Event Baru';
    document.getElementById('submitBtn').textContent = 'Tambah Event';
    eventModal.classList.add('active');
}

// Open edit event modal
function openEditEventModal(eventId) {
    if (!eventModal || !eventForm) return;
    
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    
    currentEditingEventId = eventId;
    document.getElementById('eventId').value = event.id;
    document.getElementById('eventJudul').value = event.judul;
    document.getElementById('eventTanggal').value = event.tanggal;
    document.getElementById('eventWaktu').value = event.waktu;
    document.getElementById('eventLokasi').value = event.lokasi || '';
    document.getElementById('eventKategori').value = event.kategori || '';
    document.getElementById('eventDeskripsi').value = event.deskripsi || '';
    
    document.getElementById('modalTitle').textContent = 'Edit Event';
    document.getElementById('submitBtn').textContent = 'Perbarui Event';
    eventModal.classList.add('active');
}

// Close event modal
function closeEventModal() {
    if (!eventModal) return;
    eventModal.classList.remove('active');
    if (eventForm) eventForm.reset();
    currentEditingEventId = null;
}

// Handle save event
async function handleSaveEvent(e) {
    e.preventDefault();
    
    const id = document.getElementById('eventId').value;
    const judul = document.getElementById('eventJudul').value;
    const deskripsi = document.getElementById('eventDeskripsi').value;
    const tanggal = document.getElementById('eventTanggal').value;
    const waktu = document.getElementById('eventWaktu').value;
    const lokasi = document.getElementById('eventLokasi').value;
    const kategori = document.getElementById('eventKategori').value;
    
    const fd = new FormData();
    if (id) {
        fd.append('id', id);
    }
    fd.append('judul', judul);
    fd.append('deskripsi', deskripsi);
    fd.append('tanggal', tanggal);
    fd.append('waktu', waktu);
    fd.append('lokasi', lokasi);
    fd.append('kategori', kategori);
    
    try {
        let res;
        if (id) {
            // Update
            const method = 'PUT';
            res = await fetch('api/events.php', { 
                method, 
                body: new URLSearchParams(fd),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
        } else {
            // Create
            res = await fetch('api/events.php', { method: 'POST', body: fd });
        }
        
        const data = await res.json();
        
        if (data.success) {
            showToast(id ? 'Event berhasil diperbarui' : 'Event berhasil ditambahkan', 'success');
            closeEventModal();
            loadEvents();
            updateStats();
        } else {
            showToast(data.message, 'error');
        }
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

// Open confirm delete modal
function openConfirmDelete(eventId, eventTitle) {
    if (!confirmModal) return;
    
    currentEditingEventId = eventId;
    document.getElementById('eventTitleConfirm').textContent = eventTitle;
    confirmModal.classList.add('active');
}

// Close confirm modal
function closeConfirmModal() {
    if (!confirmModal) return;
    confirmModal.classList.remove('active');
}

// Handle delete event
async function handleDeleteEvent() {
    if (!currentEditingEventId) return;
    
    try {
        const res = await fetch('api/events.php', {
            method: 'DELETE',
            body: new URLSearchParams({ id: currentEditingEventId }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        const data = await res.json();
        
        if (data.success) {
            showToast('Event berhasil dihapus', 'success');
            closeConfirmModal();
            loadEvents();
            updateStats();
        } else {
            showToast(data.message, 'error');
        }
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

// Approve registration
async function approveRegistration(registrationId) {
    const fd = new FormData();
    fd.append('action', 'approve');
    fd.append('registration_id', registrationId);
    
    try {
        const res = await fetch('api/registrations.php', { method: 'POST', body: fd });
        const data = await res.json();
        
        if (data.success) {
            showToast('Registrasi disetujui', 'success');
            loadRegistrations();
            updateStats();
        } else {
            showToast(data.message, 'error');
        }
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

// Reject registration
async function rejectRegistration(registrationId) {
    const fd = new FormData();
    fd.append('action', 'reject');
    fd.append('registration_id', registrationId);
    
    try {
        const res = await fetch('api/registrations.php', { method: 'POST', body: fd });
        const data = await res.json();
        
        if (data.success) {
            showToast('Registrasi ditolak', 'success');
            loadRegistrations();
            updateStats();
        } else {
            showToast(data.message, 'error');
        }
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

// Switch menu
function switchMenu(menu) {
    // Hide all content panels
    document.querySelectorAll('.content-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Update nav items
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected panel
    const contentPanel = document.getElementById(menu + 'Content');
    if (contentPanel) {
        contentPanel.classList.add('active');
    }
    
    // Update nav item
    const navItem = document.querySelector(`[data-menu="${menu}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        if (menu === 'dashboard') pageTitle.textContent = 'Dashboard';
        else if (menu === 'events') pageTitle.textContent = 'Kelola Event';
        else if (menu === 'registrations') pageTitle.textContent = 'Permintaan Registrasi';
    }
}

// Filter registrations
function filterRegistrations() {
    const statusFilter = document.getElementById('registrationStatusFilter');
    if (!statusFilter || !registrationsTableBody) return;
    
    const status = statusFilter.value;
    let filtered = allRegistrations;
    
    if (status) {
        filtered = allRegistrations.filter(r => r.status === status);
    }
    
    let html = '';
    if (filtered.length === 0) {
        html = '<tr><td colspan="8" class="text-center">Tidak ada registrasi</td></tr>';
    } else {
        filtered.forEach((reg, index) => {
            const badgeClass = reg.status === 'pending' ? 'warning' : (reg.status === 'approved' ? 'success' : 'danger');
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${reg.nama}</td>
                    <td>${reg.email}</td>
                    <td>${reg.no_hp}</td>
                    <td>${reg.event_judul}</td>
                    <td>
                        <span class="badge badge-${badgeClass}">${reg.status}</span>
                    </td>
                    <td>${formatDate(reg.created_at)}</td>
                    <td class="actions">
                        ${reg.status === 'pending' ? `
                            <button class="btn-icon approve" onclick="approveRegistration(${reg.id})" title="Setujui">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn-icon reject" onclick="rejectRegistration(${reg.id})" title="Tolak">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
        });
    }
    registrationsTableBody.innerHTML = html;
}

// Format date helper
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
        showToast('Logout berhasil', 'success');
    }
}

// Load events from localStorage (for demo)
function loadEvents() {
    const savedEvents = localStorage.getItem('ikram_events');
    allEvents = savedEvents ? JSON.parse(savedEvents) : getDefaultEvents();
    renderEventsTable();
}

// Get default events for demo
function getDefaultEvents() {
    return [
        {
            id: 1,
            judul: 'Workshop Leadership & Public Speaking',
            deskripsi: 'Tingkatkan skill kepemimpinan dan kemampuan berbicara di depan publik',
            tanggal: '2024-06-25',
            waktu: '14:00',
            lokasi: 'Aula Utama IKRAM, Jakarta',
            kategori: 'workshop'
        },
        {
            id: 2,
            judul: 'Seminar Industri 4.0 & Entrepreneurship',
            deskripsi: 'Insight tentang dunia startup dan strategi bisnis di era digital',
            tanggal: '2024-07-10',
            waktu: '15:00',
            lokasi: 'Gedung Serbaguna, Jakarta',
            kategori: 'seminar'
        },
        {
            id: 3,
            judul: 'Team Building & Outing IKRAM',
            deskripsi: 'Acara gathering untuk mempererat hubungan antar divisi',
            tanggal: '2024-07-20',
            waktu: '08:00',
            lokasi: 'Puncak, Bogor',
            kategori: 'outing'
        }
    ];
}

// Render events table
function renderEventsTable() {
    if (allEvents.length === 0) {
        eventsTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Tidak ada event</td></tr>';
        return;
    }
    
    let html = '';
    allEvents.forEach((event, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${event.judul}</td>
                <td>${formatDate(event.tanggal)}</td>
                <td>${event.waktu}</td>
                <td>${event.lokasi || '-'}</td>
                <td>
                    <span class="badge badge-${event.kategori || 'default'}">
                        ${event.kategori || 'N/A'}
                    </span>
                </td>
                <td class="actions">
                    <button class="btn-icon edit" onclick="openEditEventModal(${event.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="openConfirmDelete(${event.id}, '${event.judul}')" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    eventsTableBody.innerHTML = html;
}

// Update statistics
function updateStats() {
    const totalEventsEl = document.getElementById('totalEvents');
    const upcomingEventsEl = document.getElementById('upcomingEvents');
    const pendingRegistrationsEl = document.getElementById('pendingRegistrations');
    const registrationBadge = document.getElementById('registrationBadge');
    
    const today = new Date().toISOString().split('T')[0];
    const upcomingCount = allEvents.filter(e => e.tanggal >= today).length;
    const pendingCount = allRegistrations.filter(r => r.status === 'pending').length;
    
    totalEventsEl.textContent = allEvents.length;
    upcomingEventsEl.textContent = upcomingCount;
    if (pendingRegistrationsEl) {
        pendingRegistrationsEl.textContent = pendingCount;
    }
    if (registrationBadge) {
        registrationBadge.textContent = pendingCount;
    }
}

// Open add event modal
function openAddEventModal() {
    currentEditingEventId = null;
    eventForm.reset();
    document.getElementById('eventId').value = '';
    document.getElementById('modalTitle').textContent = 'Tambah Event Baru';
    document.getElementById('submitBtn').textContent = 'Tambah Event';
    eventModal.classList.add('active');
}

// Open edit event modal
function openEditEventModal(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (!event) return;
    
    currentEditingEventId = eventId;
    document.getElementById('eventId').value = event.id;
    document.getElementById('eventJudul').value = event.judul;
    document.getElementById('eventTanggal').value = event.tanggal;
    document.getElementById('eventWaktu').value = event.waktu;
    document.getElementById('eventLokasi').value = event.lokasi || '';
    document.getElementById('eventKategori').value = event.kategori || '';
    document.getElementById('eventDeskripsi').value = event.deskripsi || '';
    
    document.getElementById('modalTitle').textContent = 'Edit Event';
    document.getElementById('submitBtn').textContent = 'Perbarui Event';
    eventModal.classList.add('active');
}

// Close event modal
function closeEventModal() {
    eventModal.classList.remove('active');
    eventForm.reset();
    currentEditingEventId = null;
}

// Handle save event
function handleSaveEvent(e) {
    e.preventDefault();
    
    const id = document.getElementById('eventId').value;
    const judul = document.getElementById('eventJudul').value;
    const deskripsi = document.getElementById('eventDeskripsi').value;
    const tanggal = document.getElementById('eventTanggal').value;
    const waktu = document.getElementById('eventWaktu').value;
    const lokasi = document.getElementById('eventLokasi').value;
    const kategori = document.getElementById('eventKategori').value;
    
    if (id) {
        // Update existing event
        const eventIndex = allEvents.findIndex(e => e.id == id);
        if (eventIndex !== -1) {
            allEvents[eventIndex] = {
                id: parseInt(id),
                judul,
                deskripsi,
                tanggal,
                waktu,
                lokasi,
                kategori
            };
            showToast('Event berhasil diperbarui', 'success');
        }
    } else {
        // Create new event
        const newEvent = {
            id: allEvents.length > 0 ? Math.max(...allEvents.map(e => e.id)) + 1 : 1,
            judul,
            deskripsi,
            tanggal,
            waktu,
            lokasi,
            kategori
        };
        allEvents.push(newEvent);
        showToast('Event berhasil ditambahkan', 'success');
    }
    
    // Save to localStorage
    localStorage.setItem('ikram_events', JSON.stringify(allEvents));
    
    // Refresh table and stats
    renderEventsTable();
    updateStats();
    closeEventModal();
}

// Open confirm delete modal
function openConfirmDelete(eventId, eventTitle) {
    currentEditingEventId = eventId;
    document.getElementById('eventTitleConfirm').textContent = eventTitle;
    confirmModal.classList.add('active');
}

// Close confirm delete modal
function closeConfirmModal() {
    confirmModal.classList.remove('active');
    currentEditingEventId = null;
}

// Handle delete event
function handleDeleteEvent() {
    if (currentEditingEventId === null) return;
    
    allEvents = allEvents.filter(e => e.id !== currentEditingEventId);
    localStorage.setItem('ikram_events', JSON.stringify(allEvents));
    
    renderEventsTable();
    updateStats();
    closeConfirmModal();
    showToast('Event berhasil dihapus', 'success');
}

// Switch menu
function switchMenu(menu) {
    // Update active nav item
    navItems.forEach(item => item.classList.remove('active'));
    document.querySelector(`[data-menu="${menu}"]`).classList.add('active');
    
    // Hide all content panels
    document.querySelectorAll('.content-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Show selected panel
    const contentPanel = document.getElementById(`${menu}Content`);
    if (contentPanel) {
        contentPanel.classList.add('active');
    }
    
    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        events: 'Kelola Event',
        registrations: 'Permintaan Registrasi'
    };
    document.getElementById('pageTitle').textContent = titles[menu] || 'Dashboard';
    
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
        sidebar.classList.remove('active');
    }
}

// Format date
function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', options);
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Load registrations from localStorage (for demo)
function loadRegistrations() {
    const savedRegistrations = localStorage.getItem('ikram_registrations');
    allRegistrations = savedRegistrations ? JSON.parse(savedRegistrations) : [];
    renderRegistrationsTable();
}

// Render registrations table
function renderRegistrationsTable() {
    const registrationsTableBody = document.getElementById('registrationsTableBody');
    if (!registrationsTableBody) return;
    
    if (allRegistrations.length === 0) {
        registrationsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Tidak ada permintaan registrasi</td></tr>';
        return;
    }
    
    let html = '';
    allRegistrations.forEach((reg, index) => {
        const statusClass = `status-${reg.status}`;
        const statusLabel = {
            'pending': 'Tertunda',
            'approved': 'Disetujui',
            'rejected': 'Ditolak'
        }[reg.status] || reg.status;
        
        const eventTitle = allEvents.find(e => e.id === reg.event_id)?.judul || `Event #${reg.event_id}`;
        
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${reg.nama}</td>
                <td>${reg.email}</td>
                <td>${reg.no_hp}</td>
                <td>${eventTitle}</td>
                <td><span class="badge ${statusClass}">${statusLabel}</span></td>
                <td>${formatDate(reg.created_at.split('T')[0])}</td>
                <td class="actions">
                    ${reg.status === 'pending' ? `
                        <button class="btn-icon approve" onclick="approveRegistration(${reg.id})" title="Setujui">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-icon reject" onclick="rejectRegistration(${reg.id})" title="Tolak">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : `
                        <button class="btn-icon view" onclick="viewRegistration(${reg.id})" title="Lihat">
                            <i class="fas fa-eye"></i>
                        </button>
                    `}
                </td>
            </tr>
        `;
    });
    registrationsTableBody.innerHTML = html;
}

// Filter registrations by status
function filterRegistrations(e) {
    const status = e.target.value;
    const registrationsTableBody = document.getElementById('registrationsTableBody');
    
    const filtered = status ? allRegistrations.filter(r => r.status === status) : allRegistrations;
    
    if (filtered.length === 0) {
        registrationsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Tidak ada permintaan dengan filter ini</td></tr>';
        return;
    }
    
    let html = '';
    filtered.forEach((reg, index) => {
        const statusClass = `status-${reg.status}`;
        const statusLabel = {
            'pending': 'Tertunda',
            'approved': 'Disetujui',
            'rejected': 'Ditolak'
        }[reg.status] || reg.status;
        
        const eventTitle = allEvents.find(e => e.id === reg.event_id)?.judul || `Event #${reg.event_id}`;
        
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${reg.nama}</td>
                <td>${reg.email}</td>
                <td>${reg.no_hp}</td>
                <td>${eventTitle}</td>
                <td><span class="badge ${statusClass}">${statusLabel}</span></td>
                <td>${formatDate(reg.created_at.split('T')[0])}</td>
                <td class="actions">
                    ${reg.status === 'pending' ? `
                        <button class="btn-icon approve" onclick="approveRegistration(${reg.id})" title="Setujui">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-icon reject" onclick="rejectRegistration(${reg.id})" title="Tolak">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : `
                        <button class="btn-icon view" onclick="viewRegistration(${reg.id})" title="Lihat">
                            <i class="fas fa-eye"></i>
                        </button>
                    `}
                </td>
            </tr>
        `;
    });
    registrationsTableBody.innerHTML = html;
}

// Approve registration
function approveRegistration(registrationId) {
    const reg = allRegistrations.find(r => r.id === registrationId);
    if (!reg) return;
    
    if (confirm(`Setujui pendaftaran ${reg.nama} untuk event ini?`)) {
        reg.status = 'approved';
        localStorage.setItem('ikram_registrations', JSON.stringify(allRegistrations));
        renderRegistrationsTable();
        updateStats();
        showToast(`Pendaftaran ${reg.nama} disetujui`, 'success');
    }
}

// Reject registration
function rejectRegistration(registrationId) {
    const reg = allRegistrations.find(r => r.id === registrationId);
    if (!reg) return;
    
    if (confirm(`Tolak pendaftaran ${reg.nama} untuk event ini?`)) {
        reg.status = 'rejected';
        localStorage.setItem('ikram_registrations', JSON.stringify(allRegistrations));
        renderRegistrationsTable();
        updateStats();
        showToast(`Pendaftaran ${reg.nama} ditolak`, 'info');
    }
}

// View registration details
function viewRegistration(registrationId) {
    const reg = allRegistrations.find(r => r.id === registrationId);
    if (!reg) return;
    
    const eventTitle = allEvents.find(e => e.id === reg.event_id)?.judul || `Event #${reg.event_id}`;
    const message = `
Nama: ${reg.nama}
Email: ${reg.email}
No HP: ${reg.no_hp}
Asal Institusi: ${reg.asal_institusi || '-'}
Event: ${eventTitle}
Status: ${reg.status}

Alasan Mendaftar:
${reg.alasan_mendaftar || '-'}
    `;
    alert(message);
}

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('.admin-sidebar');
    const mobileToggle = document.getElementById('mobileMenuToggle');
    
    if (window.innerWidth < 768) {
        if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    }
});
