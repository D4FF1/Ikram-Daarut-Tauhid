// Admin Panel JavaScript

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
const adminName = document.getElementById('adminName');
const userBadge = document.getElementById('userBadge');
const sidebarToggle = document.getElementById('sidebarToggle');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const sidebar = document.querySelector('.admin-sidebar');
const navItems = document.querySelectorAll('.nav-item');

// Global state
let currentEditingEventId = null;
let allEvents = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Check authentication
function checkAuth() {
    // Simulate checking auth from PHP session
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
    
    if (isLoggedIn) {
        const adminUsername = sessionStorage.getItem('admin_username');
        showDashboard(adminUsername);
    } else {
        showLogin();
    }
}

// Show login section
function showLogin() {
    loginSection.classList.add('active');
    dashboardSection.style.display = 'none';
}

// Show dashboard section
function showDashboard(username) {
    loginSection.classList.remove('active');
    dashboardSection.style.display = 'grid';
    adminName.textContent = username;
    userBadge.textContent = username;
    loadEvents();
    updateStats();
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Add event button
    addEventBtn.addEventListener('click', openAddEventModal);
    
    // Event form
    eventForm.addEventListener('submit', handleSaveEvent);
    cancelBtn.addEventListener('click', closeEventModal);
    modalClose.addEventListener('click', closeEventModal);
    
    // Confirm delete
    confirmDeleteBtn.addEventListener('click', handleDeleteEvent);
    confirmCancelBtn.addEventListener('click', closeConfirmModal);
    
    // Click outside modal to close
    eventModal.addEventListener('click', (e) => {
        if (e.target === eventModal) closeEventModal();
    });
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) closeConfirmModal();
    });
    
    // Navigation items
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const menu = item.dataset.menu;
            switchMenu(menu);
        });
    });
    
    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
    
    // Sidebar toggle
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // For demo, we'll simulate login
    // In production, this should validate against the PHP backend
    if (username === 'admin' && password === 'admin123') {
        sessionStorage.setItem('admin_logged_in', 'true');
        sessionStorage.setItem('admin_username', username);
        
        // Reset form
        loginForm.reset();
        
        // Show dashboard
        showDashboard(username);
        
        showToast('Login berhasil!', 'success');
    } else {
        showToast('Username atau password salah', 'error');
    }
}

// Handle logout
function handleLogout() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        sessionStorage.removeItem('admin_logged_in');
        sessionStorage.removeItem('admin_username');
        showLogin();
        loginForm.reset();
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
    
    const today = new Date().toISOString().split('T')[0];
    const upcomingCount = allEvents.filter(e => e.tanggal >= today).length;
    
    totalEventsEl.textContent = allEvents.length;
    upcomingEventsEl.textContent = upcomingCount;
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
        events: 'Kelola Event'
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
