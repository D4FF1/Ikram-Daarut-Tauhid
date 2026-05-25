// Event Page (Public only) - no PHP/auth calls
let allEventsData = [];

document.addEventListener('DOMContentLoaded', () => {
    // Public: hanya menampilkan event (read-only).
    // Data event diambil dari file static.
    loadEventsForDisplay();
});

async function loadEventsForDisplay() {
    try {
        // Ambil dari JSON statis jika tersedia
        const res = await fetch('events.json');
        const data = await res.json();
        const events = Array.isArray(data) ? data : (data?.data || []);
        allEventsData = events;
        renderEventCards(events);
        setupFilterButtons();
    } catch (e) {
        console.warn('[event-api] events.json not found or failed to load, rendering empty list.', e);
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
                    <a class="btn btn-primary btn-sm" href="event-detail.html?eventId=${encodeURIComponent(event.id)}" data-testid="detail-btn-${event.id}">
                        Lihat detail
                    </a>
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

    if (clear) {
        clear.addEventListener('click', () => {
            document.getElementById('filterFrom').value = '';
            document.getElementById('filterTo').value = '';
            applyAllFilters();
        });
    }
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

function capitalizeFirst(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function formatTime(t) {
    if (!t) return '-';
    const [h, m] = t.split(':');
    return `${h}:${m}`;
}

