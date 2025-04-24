document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a blog post page
    const isBlogPostPage = window.location.pathname.includes('/blog/');
    
    if (isBlogPostPage) {
        setupBlogPostPage();
        return;
    }
    
    // Main page functionality
    setupMainPage();
    
    /**
     * Sets up functionality specific to individual blog post pages
     */
    function setupBlogPostPage() {
        // Highlight the "Impact Stories" nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.getAttribute('href').includes('#impact')) {
                item.classList.add('nav-item-active');
            } else {
                item.classList.remove('nav-item-active');
            }
        });
        
        // Handle share buttons
        document.querySelectorAll('.share-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const url = encodeURIComponent(window.location.href);
                const title = encodeURIComponent(document.title);
                let shareUrl;
                
                // Determine which social platform to share to based on the link
                const svg = this.querySelector('svg');
                if (svg) {
                    const path = svg.querySelector('path');
                    if (path) {
                        const pathD = path.getAttribute('d');
                        if (pathD.includes('facebook')) {
                            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                        } else if (pathD.includes('twitter')) {
                            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                        } else if (pathD.includes('linkedin')) {
                            shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`;
                        }
                    }
                }
                
                if (shareUrl) {
                    window.open(shareUrl, 'share-window', 'height=450, width=550, top=' + 
                                (window.innerHeight / 2 - 225) + ', left=' + 
                                (window.innerWidth / 2 - 275));
                }
            });
        });
        
        // Add scrolling animations
        animateOnScroll();
        window.addEventListener('scroll', animateOnScroll);
    }
    
    /**
     * Sets up functionality for the main page with tabs
     */
    function setupMainPage() {
        // Tab navigation functionality
        const tabLinks = document.querySelectorAll('.nav-item');
        const tabContents = document.querySelectorAll('.tab-content');
        
        // Initialize to show home tab
        showTab('home');
        
        // Add click event to tab links
        tabLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const tabId = this.getAttribute('data-tab');
                showTab(tabId);
                
                // Update URL with hash without scrolling
                history.pushState(null, null, `#${tabId}`);
            });
        });
        
        // Handle form submission
        const volunteerForm = document.getElementById('volunteer-form');
        if (volunteerForm) {
            volunteerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // If using Formspree
                const formData = new FormData(this);
                const formAction = this.getAttribute('action');
                
                if (formAction && formAction.includes('formspree')) {
                    fetch(formAction, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Accept': 'application/json'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        // Display success message
                        document.getElementById('form-success').style.display = 'block';
                        
                        // Reset form after submission
                        volunteerForm.reset();
                        
                        // Add confetti effect
                        createConfetti();
                        
                        // Hide success message after 5 seconds
                        setTimeout(() => {
                            document.getElementById('form-success').style.display = 'none';
                        }, 5000);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('There was an error submitting your form. Please try again.');
                    });
                } else {
                    // For testing or if no formspree setup
                    document.getElementById('form-success').style.display = 'block';
                    volunteerForm.reset();
                    createConfetti();
                    setTimeout(() => {
                        document.getElementById('form-success').style.display = 'none';
                    }, 5000);
                }
            });
        }
        
        // Simple carousel functionality
        setupCarousel();
        
        // Ensure blog excerpts are properly truncated
        document.querySelectorAll('.blog-excerpt').forEach(excerpt => {
            truncateText(excerpt, 150);
        });
        
        // Set initial state for animations
        document.querySelectorAll('.card, .impact-story, .pillar-lead, .animation-container, .blog-card').forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'all 0.5s ease';
        });
        
        // Listen for scroll events
        window.addEventListener('scroll', animateOnScroll);
        
        // Run once on load
        animateOnScroll();
        
        // Handle hash navigation
        if (window.location.hash) {
            const tabId = window.location.hash.substring(1);
            if (document.getElementById(tabId)) {
                showTab(tabId);
            }
        }
        
        // Listen for tab changes to trigger animations
        tabLinks.forEach(item => {
            item.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                setTimeout(() => {
                    if (tabId === 'impact' || tabId === 'blog') {
                        animateBlogCards();
                    }
                }, 100);
            });
        });
    }
    
    /**
     * Sets up the image carousel
     */
    function setupCarousel() {
        const carouselImages = [
            "images/blog/childrens-home.jpeg",
            "images/blog/animal-shelter.jpg",
            "images/blog/orphanage.jpg",
            "images/blog/elderly-engagement.jpg"
        ];
        
        const carouselImage = document.querySelector('.carousel-image');
        if (carouselImage) {
            let currentImageIndex = 0;
            
            // Set initial image if needed
            if (!carouselImage.src.includes('tree-planting')) {
                carouselImage.src = carouselImages[0];
            }
            
            // Change image every 5 seconds
            setInterval(() => {
                currentImageIndex = (currentImageIndex + 1) % carouselImages.length;
                carouselImage.style.opacity = '0';
                
                setTimeout(() => {
                    carouselImage.src = carouselImages[currentImageIndex];
                                        carouselImage.style.opacity = '1';
                }, 500);
            }, 5000);
            
            // Add fade effect to image transitions
            carouselImage.style.transition = 'opacity 0.5s ease';
        }
    }
    
    /**
     * Shows the specified tab and hides others
     */
    function showTab(tabId) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
        });
        
        // Remove active class from all tabs
        document.querySelectorAll('.nav-item').forEach(link => {
            link.classList.remove('nav-item-active');
        });
        
        // Show the selected tab
        const selectedTab = document.getElementById(tabId);
        if (selectedTab) {
            selectedTab.style.display = 'block';
        }
        
        // Add active class to the clicked tab
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('nav-item-active');
        
        // Scroll to top when changing tabs
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    /**
     * Creates confetti animation after form submission
     */
    function createConfetti() {
        const confettiContainer = document.createElement('div');
        confettiContainer.style.position = 'fixed';
        confettiContainer.style.top = 0;
        confettiContainer.style.left = 0;
        confettiContainer.style.width = '100%';
        confettiContainer.style.height = '100%';
        confettiContainer.style.pointerEvents = 'none';
        confettiContainer.style.zIndex = 9999;
        document.body.appendChild(confettiContainer);
        
        // Create 100 confetti pieces
        for (let i = 0; i < 100; i++) {
            createConfettiPiece(confettiContainer);
        }
        
        // Remove container after animation
        setTimeout(() => {
            document.body.removeChild(confettiContainer);
        }, 4000);
    }
    
    /**
     * Creates an individual confetti piece
     */
    function createConfettiPiece(container) {
        const colors = ['#6772E5', '#8E8DFE', '#4CAF50', '#FF5722', '#FF9800'];
        const piece = document.createElement('div');
        
        // Style for confetti piece
        piece.style.position = 'absolute';
        piece.style.width = `${Math.random() * 10 + 5}px`;
        piece.style.height = `${Math.random() * 10 + 5}px`;
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.opacity = Math.random();
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        
        // Starting position
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.top = '-20px';
        
        // Animation
        piece.style.transition = `all ${Math.random() * 3 + 2}s ease-out`;
        container.appendChild(piece);
        
        // Animate falling
        setTimeout(() => {
            piece.style.top = `${Math.random() * 100 + 100}%`;
            piece.style.left = `${parseInt(piece.style.left) + (Math.random() * 40 - 20)}%`;
            piece.style.transform = `rotate(${Math.random() * 360}deg)`;
            piece.style.opacity = 0;
        }, 10);
    }
    
    /**
     * Animates blog cards with a staggered effect
     */
    function animateBlogCards() {
        const blogCards = document.querySelectorAll('.blog-card');
        
        blogCards.forEach((card, index) => {
            const cardPosition = card.getBoundingClientRect().top;
            const screenPosition = window.innerHeight;
            
            // Add a slight delay for each card based on its index
            setTimeout(() => {
                if (cardPosition < screenPosition + 100) {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }
            }, index * 100); // 100ms delay between each card
        });
    }
    
    /**
     * Animates elements as they come into view
     */
    function animateOnScroll() {
        const elements = document.querySelectorAll('.card, .impact-story, .pillar-lead, .animation-container, .blog-card');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight;
            
            // If element is in viewport
            if (elementPosition < screenPosition - 50) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
        
        // Specifically check if we're on the impact stories or blog tabs
        const impactTab = document.getElementById('impact');
        const blogTab = document.getElementById('blog');
        
        if ((impactTab && impactTab.style.display !== 'none') || 
            (blogTab && blogTab.style.display !== 'none')) {
            animateBlogCards();
        }
    }
    
    /**
     * Truncates text to a specified length and adds ellipsis
     * @param {HTMLElement} element - The element containing text to truncate
     * @param {number} maxLength - Maximum length of the text
     */
    function truncateText(element, maxLength) {
        // First check if the CSS line-clamp is working
        // We'll detect overflow by comparing scrollHeight to clientHeight
        const isOverflowing = element.scrollHeight > element.clientHeight;
        
        // If not overflowing, we don't need to truncate
        if (!isOverflowing) {
            return;
        }
        
        // If CSS isn't handling the truncation properly, use JS as fallback
        const text = element.textContent;
        if (text.length > maxLength) {
            // Find the last space within maxLength to avoid cutting words
            const truncateIndex = text.lastIndexOf(' ', maxLength);
            const actualIndex = truncateIndex > 0 ? truncateIndex : maxLength;
            element.textContent = text.substring(0, actualIndex) + '...';
        }
    }
    
    /**
     * Handles keyboard navigation for accessibility
     */
    function handleKeyboardNavigation() {
        // Add keyboard navigation for tabs
        document.querySelectorAll('.nav-item').forEach(tab => {
            tab.addEventListener('keydown', function(e) {
                // Enter or Space key
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
        
        // Add keyboard support for read more buttons
        document.querySelectorAll('.read-more-btn').forEach(btn => {
            btn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    }
    
    // Initialize keyboard navigation
    handleKeyboardNavigation();
});


