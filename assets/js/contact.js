// ============================================
// CONTACT FORM HANDLING
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            console.log('[v0] Contact form submitted:', data);
            
            // Show success message
            showNotification('Terima kasih! Pesan Anda telah terkirim. Kami akan segera menghubungi Anda.', 'success');
            
            // Reset form
            this.reset();
        });
    }

    // FAQ Accordion
    const faqCards = document.querySelectorAll('.faq-card');
    
    faqCards.forEach(card => {
        const header = card.querySelector('.faq-header');
        
        header.addEventListener('click', function() {
            // Close other cards
            faqCards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.classList.remove('active');
                }
            });
            
            // Toggle current card
            card.classList.toggle('active');
        });
    });
});

console.log('[v0] Contact page initialized');
