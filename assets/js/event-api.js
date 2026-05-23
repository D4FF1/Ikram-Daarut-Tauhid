// Event Page - Fetch events from API or localStorage

document.addEventListener('DOMContentLoaded', () => {
    loadEventsForDisplay();
});

async function loadEventsForDisplay() {
    try {
        // Get events from localStorage (which is managed by admin panel)
        const savedEvents = localStorage.getItem('ikram_events');
        const events = savedEvents ? JSON.parse(savedEvents) : getDefaultEvents();
        
        console.log('[v0] Events loaded:', events);
        renderEventCards(events);
        setupFilterButtons(events);
    } catch (error) {
        console.error('[v0] Error loading events:', error);
        // Fallback to default events if localStorage is empty
        const defaultEvents = getDefaultEvents();
        renderEventCards(defaultEvents);
        setupFilterButtons(defaultEvents);
    }
}

// Get default events (same as admin.js)
function getDefaultEvents() {
    return [
        {
            id: 1,
            judul: 'Workshop Leadership & Public Speaking',
            deskripsi: 'Tingkatkan skill kepemimpinan dan kemampuan berbicara di depan publik bersama mentor profesional dari industri. Sesi interaktif dengan simulasi real-world.',
            tanggal: '2024-06-25',
            waktu: '14:00',
            lokasi: 'Aula Utama IKRAM, Jakarta',
            kategori: 'workshop'
        },
        {
            id: 2,
            judul: 'Seminar Industri 4.0 & Entrepreneurship',
            deskripsi: 'Menghadirkan pembicara dari startup terkemuka untuk membagikan insight tentang dunia startup, inovasi, dan strategi bisnis di era digital.',
            tanggal: '2024-07-10',
            waktu: '15:00',
            lokasi: 'Gedung Serbaguna, Jakarta',
            kategori: 'seminar'
        },
        {
            id: 3,
            judul: 'Team Building & Outing IKRAM',
            deskripsi: 'Acara gathering untuk mempererat hubungan antar divisi dan merayakan pencapaian bersama. Aktivitas out-bound, games, dan quality time.',
            tanggal: '2024-07-20',
            waktu: '08:00',
            lokasi: 'Puncak, Bogor',
            kategori: 'outing'
        },
        {
            id: 4,
            judul: 'Seminar Digital Marketing & Personal Branding',
            deskripsi: 'Pelajari strategi digital marketing terkini dan cara membangun personal branding yang kuat di era media sosial dan digital.',
            tanggal: '2024-08-05',
            waktu: '15:00',
            lokasi: 'Conference Room, Jakarta',
            kategori: 'seminar'
        },
        {
            id: 5,
            judul: 'Workshop Design Thinking & Innovation',
            deskripsi: 'Workshop intensif tentang metodologi design thinking untuk menciptakan solusi inovatif terhadap berbagai permasalahan di masyarakat.',
            tanggal: '2024-08-15',
            waktu: '10:00',
            lokasi: 'Studio Kreatif, Jakarta',
            kategori: 'workshop'
        },
        {
            id: 6,
            judul: 'IKRAM Debate Competition 2024',
            deskripsi: 'Kompetisi debat antar divisi dan institusi dengan tema-tema kontroversial yang relevan dengan isu sosial dan pendidikan terkini.',
            tanggal: '2024-09-01',
            waktu: '09:00',
            lokasi: 'Auditorium Utama, Jakarta',
            kategori: 'kompetisi'
        },
        {
            id: 7,
            judul: 'Workshop Project Management & Agile Methods',
            deskripsi: 'Pelajari metodologi project management modern dan agile untuk mengelola proyek organisasi dengan efisien dan efektif.',
            tanggal: '2024-09-10',
            waktu: '14:00',
            lokasi: 'Meeting Room, Jakarta',
            kategori: 'workshop'
        },
        {
            id: 8,
            judul: 'Seminar Career Development & Networking',
            deskripsi: 'Kesempatan networking dengan profesional dan perusahaan besar, serta pembahasan strategi pengembangan karir yang tepat.',
            tanggal: '2024-09-20',
            waktu: '16:00',
            lokasi: 'Convention Hall, Jakarta',
            kategori: 'seminar'
        },
        {
            id: 9,
            judul: 'IKRAM Innovation Challenge',
            deskripsi: 'Kompetisi inovasi dengan hadiah menarik untuk ide-ide terbaik dalam mengembangkan solusi sosial dan teknologi.',
            tanggal: '2024-10-05',
            waktu: '09:00',
            lokasi: 'Innovation Hub, Jakarta',
            kategori: 'kompetisi'
        }
    ];
}

function renderEventCards(events) {
    const eventsGrid = document.querySelector('.events-grid');
    if (!eventsGrid) return;
    
    // Clear existing cards
    eventsGrid.innerHTML = '';
    
    if (events.length === 0) {
        eventsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">Belum ada event tersedia.</p>';
        return;
    }
    
    // Create color gradients for event cards
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
    ];
    
    events.forEach((event, index) => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.setAttribute('data-category', event.kategori || 'workshop');
        eventCard.setAttribute('data-aos', 'fade-up');
        
        const gradient = gradients[index % gradients.length];
        const dateObj = new Date(event.tanggal + 'T00:00:00');
        const day = dateObj.getDate();
        const month = dateObj.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();
        
        const eventHTML = `
            <div class="event-image" style="background: ${gradient};">
                <span class="event-category">${capitalizeFirst(event.kategori || 'Event')}</span>
                <div class="event-date-badge">
                    <span class="date-day">${day}</span>
                    <span class="date-month">${month}</span>
                </div>
            </div>
            <div class="event-content">
                <h3>${event.judul}</h3>
                <p class="event-meta">
                    <i class="fas fa-map-marker-alt"></i> ${event.lokasi || 'Lokasi TBD'}
                </p>
                <p class="event-description">${event.deskripsi || 'Deskripsi event tersedia di halaman detail'}</p>
                <div class="event-footer">
                    <span class="event-time">
                        <i class="fas fa-clock"></i> ${formatTime(event.waktu)}
                    </span>
                    <button class="btn btn-primary btn-sm">Daftar</button>
                </div>
            </div>
        `;
        
        eventCard.innerHTML = eventHTML;
        eventsGrid.appendChild(eventCard);
    });
    
    // Re-initialize AOS if available
    if (window.AOS) {
        AOS.refresh();
    }
}

function setupFilterButtons(events) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length === 0) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter and display events
            const filteredEvents = filter === 'all' 
                ? events 
                : events.filter(e => e.kategori === filter);
            
            filterEventCards(filter);
        });
    });
}

function filterEventCards(category) {
    const eventCards = document.querySelectorAll('.event-card');
    
    eventCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = '';
            setTimeout(() => card.style.opacity = '1', 10);
        } else {
            card.style.display = 'none';
            card.style.opacity = '0';
        }
    });
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatTime(timeStr) {
    if (!timeStr) return '-';
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
}

// Add link to admin panel in navigation or footer
document.addEventListener('DOMContentLoaded', () => {
    // Optionally add admin link to nav menu
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        // Check if admin link already exists
        const existingAdminLink = navMenu.querySelector('a[href="admin.html"]');
        if (!existingAdminLink) {
            // Don't add it automatically - let user manually add if needed
        }
    }
});
