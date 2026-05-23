// Event Page - Fetch events from MySQL API
let currentUserSession = null;
let allEventsData = [];

document.addEventListener('DOMContentLoaded', async () => {
    await detectUserSession();
    injectUserNavButton();
    loadEventsForDisplay();
    initializeRegistrationModal();
});

async function detectUserSession() {
    try {
        const res = await fetch('api/user_auth.php?action=me', { credentials: 'include' });
        const data = await res.json();
        currentUserSession = data.success ? data.data : null;
    } catch (e) { currentUserSession = null; }
}

function injectUserNavButton() {
    const navMenu = document.getElementById('navMenu');
    if (!navMenu) return;
    // Remove old join button to avoid duplicates
    const existing = navMenu.querySelector('.btn-join');
    if (existing) existing.remove();
    if (currentUserSession) {
        const a = document.createElement('a');
        a.href = 'dashboard.html';
        a.className = 'nav-link btn-join';
        a.setAttribute('data-testid', 'nav-dashboard');
        a.textContent = `Hi, ${currentUserSession.nama.split(' ')[0]}`;
        navMenu.appendChild(a);
    } else {
        const a = document.createElement('a');
        a.href = 'login.html';
        a.className = 'nav-link btn-join';
        a.setAttribute('data-testid', 'nav-login');
        a.textContent = 'Login / Daftar';
        navMenu.appendChild(a);
    }
}

async function loadEventsForDisplay() {
    try {
        const res = await fetch('api/events.php');
        const data = await res.json();
        const events = data.success ? data.data : [];
        allEventsData = events;
        renderEventCards(events);
        setupFilterButtons();
    } catch (e) {
        console.error('[event-api] error', e);
        renderEventCards([]);
    }
}

function renderEventCards(events) {
    const grid = document.querySelector('.events-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!events.length) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px;color:#666;">Belum ada event tersedia.</p>';
        return;
    }

    const gradients = [
        'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
        'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)',
        'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)',
        'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)',
        'linear-gradient(135deg,#fa709a 0%,#fee140 100%)',
        'linear-gradient(135deg,#11998e 0%,#38ef7d 100%)',
        'linear-gradient(135deg,#f5af19 0%,#f12711 100%)',
    ];

    events.forEach((event, idx) => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.setAttribute('data-category', event.kategori || 'workshop');
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-testid', `event-card-${event.id}`);

        const dateObj = new Date(event.tanggal + 'T00:00:00');
        const day = dateObj.getDate();
        const month = dateObj.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();
        const gradient = gradients[idx % gradients.length];
        const imageBg = event.poster
            ? `background:url('${event.poster}') center/cover;`
            : `background:${gradient};`;
        const kuota = parseInt(event.kuota_peserta || 0);
        const terisi = parseInt(event.terisi || 0);
        const sisa = Math.max(0, kuota - terisi);
        const full = sisa <= 0;

        card.innerHTML = `
            <div class="event-image" style="${imageBg}">
                <span class="event-category">${capitalizeFirst(event.kategori || 'Event')}</span>
                <div class="event-date-badge">
                    <span class="date-day">${day}</span>
                    <span class="date-month">${month}</span>
                </div>
            </div>
            <div class="event-content">
                <h3>${event.judul}</h3>
                <p class="event-meta"><i class="fas fa-map-marker-alt"></i> ${event.lokasi || 'Lokasi TBD'}</p>
                <p class="event-description">${event.deskripsi || ''}</p>
                <p class="event-meta" style="font-size:.85rem;color:#4A6D2C;font-weight:600;">
                    <i class="fas fa-users"></i> Kuota: ${terisi}/${kuota} ${full ? '<span style="color:#c0392b;">(Penuh)</span>' : `(${sisa} tersisa)`}
                </p>
                <div class="event-footer">
                    <span class="event-time"><i class="fas fa-clock"></i> ${formatTime(event.waktu)}</span>
                    <button class="btn btn-primary btn-sm register-btn" data-testid="register-btn-${event.id}"
                        ${full ? 'disabled style="opacity:.5;cursor:not-allowed;"' : ''}
                        onclick="openRegistrationModal(${event.id}, ${JSON.stringify(event.judul).replace(/"/g, '&quot;')})">
                        ${full ? 'Penuh' : 'Daftar'}
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    if (window.AOS) AOS.refresh();
}

function setupFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyAllFilters();
        });
    });

    // Date range filter
    const apply = document.getElementById('applyDateFilter');
    const clear = document.getElementById('clearDateFilter');
    if (apply) apply.addEventListener('click', applyAllFilters);
    if (clear) clear.addEventListener('click', () => {
        document.getElementById('filterFrom').value = '';
        document.getElementById('filterTo').value = '';
        applyAllFilters();
    });
}

function applyAllFilters() {
    const activeKat = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
    const from = document.getElementById('filterFrom')?.value || '';
    const to = document.getElementById('filterTo')?.value || '';

    let filtered = allEventsData.slice();
    if (activeKat !== 'all') filtered = filtered.filter(e => e.kategori === activeKat);
    if (from) filtered = filtered.filter(e => e.tanggal >= from);
    if (to) filtered = filtered.filter(e => e.tanggal <= to);

    renderEventCards(filtered);
}

function capitalizeFirst(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
function formatTime(t) { if (!t) return '-'; const [h, m] = t.split(':'); return `${h}:${m}`; }

// ========= Registration Modal =========
let currentEventId = null;

function initializeRegistrationModal() {
    if (document.getElementById('registrationModal')) return;
    const html = `
    <div id="registrationModal" class="modal" data-testid="registration-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="regModalTitle">Daftar Event</h2>
                <button type="button" class="modal-close" onclick="closeRegistrationModal()" data-testid="close-reg-modal"><i class="fas fa-times"></i></button>
            </div>
            <div id="regModalBody" class="modal-body" style="padding:24px;"></div>
        </div>
    </div>`;
    const div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div.firstElementChild);
    const modal = document.getElementById('registrationModal');
    modal.addEventListener('click', e => { if (e.target === modal) closeRegistrationModal(); });
}

function openRegistrationModal(eventId, eventTitle) {
    initializeRegistrationModal();
    currentEventId = eventId;
    document.getElementById('regModalTitle').textContent = `Daftar: ${eventTitle}`;
    const body = document.getElementById('regModalBody');

    if (!currentUserSession) {
        body.innerHTML = `
            <div style="text-align:center;padding:20px;">
                <i class="fas fa-user-lock" style="font-size:3rem;color:#8FA35F;margin-bottom:14px;"></i>
                <h3 style="margin:0 0 8px;">Login Diperlukan</h3>
                <p style="color:#666;margin:0 0 22px;">Kamu harus punya akun untuk mendaftar event ini.</p>
                <div style="display:flex;gap:10px;justify-content:center;">
                    <a href="login.html" class="btn btn-primary" data-testid="modal-login-link" style="background:#4A6D2C;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">Login</a>
                    <a href="register.html" class="btn" data-testid="modal-register-link" style="background:#f0f3e9;color:#2D4620;padding:10px 20px;border-radius:8px;text-decoration:none;">Daftar Akun</a>
                </div>
            </div>`;
    } else {
        body.innerHTML = `
            <p style="color:#666;margin:0 0 16px;">Halo <b>${currentUserSession.nama}</b>, isi alasan kamu mendaftar event ini:</p>
            <form id="quickRegForm" onsubmit="submitRegistration(event)">
                <div class="form-group" style="margin-bottom:16px;">
                    <label style="display:block;font-weight:600;margin-bottom:6px;color:#2D4620;">Alasan Mendaftar (opsional)</label>
                    <textarea name="alasan_mendaftar" rows="4" placeholder="Cerita kenapa kamu tertarik..." data-testid="reg-alasan-input"
                        style="width:100%;padding:10px;border:1.5px solid #e3e7da;border-radius:8px;font-family:inherit;resize:vertical;"></textarea>
                </div>
                <div style="display:flex;gap:10px;justify-content:flex-end;">
                    <button type="button" onclick="closeRegistrationModal()" style="padding:10px 18px;border:1.5px solid #ddd;background:#fff;border-radius:8px;cursor:pointer;font-family:inherit;">Batal</button>
                    <button type="submit" data-testid="submit-registration" style="padding:10px 22px;background:#4A6D2C;color:#fff;border:none;border-radius:8px;cursor:pointer;font-family:inherit;font-weight:600;">Kirim Pendaftaran</button>
                </div>
                <div id="regResult" style="margin-top:14px;"></div>
            </form>`;
    }
    document.getElementById('registrationModal').classList.add('active');
}

function closeRegistrationModal() {
    const modal = document.getElementById('registrationModal');
    if (modal) modal.classList.remove('active');
    currentEventId = null;
}

async function submitRegistration(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    fd.append('action', 'register');
    fd.append('event_id', currentEventId);
    const resBox = document.getElementById('regResult');
    resBox.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';

    try {
        const res = await fetch('api/registrations.php', { method: 'POST', body: fd, credentials: 'include' });
        const data = await res.json();
        if (data.success) {
            resBox.innerHTML = `<div style="background:#e6f6e0;color:#2D4620;padding:12px;border-radius:8px;">✓ ${data.message}</div>`;
            setTimeout(() => {
                closeRegistrationModal();
                loadEventsForDisplay();
            }, 1500);
        } else {
            resBox.innerHTML = `<div style="background:#fde8e8;color:#8b1a1a;padding:12px;border-radius:8px;">${data.message}</div>`;
        }
    } catch (err) {
        resBox.innerHTML = `<div style="background:#fde8e8;color:#8b1a1a;padding:12px;border-radius:8px;">Error: ${err.message}</div>`;
    }
}
