/**
 * BMH Hospital Website - Core UI Interactions
 * Custom High-Performance Navigation Drawer Controller and modern layout scripting.
 */

console.log("BMH Core UI Script initialized");

// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
    autoRaf: false,
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth easing
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

// Run a manual requestAnimationFrame loop for reliable scroll ticks
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);


const toggler = document.querySelector('.navbar-toggler');
const collapse = document.querySelector('.navbar-collapse');

if (toggler && collapse) {
    // Toggle active classes on click
    toggler.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = toggler.getAttribute('aria-expanded') === 'true';
        toggler.setAttribute('aria-expanded', !isExpanded);
        collapse.classList.toggle('show');
    });

    // Closes drawer on clicking anywhere outside
    document.addEventListener('click', (e) => {
        if (toggler.getAttribute('aria-expanded') === 'true' &&
            !collapse.contains(e.target) &&
            !toggler.contains(e.target)) {
            toggler.setAttribute('aria-expanded', 'false');
            collapse.classList.remove('show');
        }
    });
}

// High-performance animated counter function
const startCounters = () => {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200;

    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const inc = target / speed;

            if (count < target) {
                counter.innerText = Math.ceil(count + inc);
                setTimeout(updateCount, 15);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
};

// IntersectionObserver to trigger counter when visible
const statsSection = document.querySelector('.about-stats-row');
if (statsSection) {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounters();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    observer.observe(statsSection);
}

// Initialize World-Class Facilities Swiper Carousel (Always active - Desktop & Mobile)
if (document.querySelector('.facilities-swiper')) {
    new Swiper('.facilities-swiper', {
        slidesPerView: 1,
        spaceBetween: 10,
        grabCursor: true,
        loop: false,
        touchReleaseOnEdges: true,
        observer: true,
        observeParents: true,
        pagination: {
            el: '.facilities-pagination',
            clickable: true,
            dynamicBullets: true,
        },
        navigation: {
            nextEl: '.facilities-next',
            prevEl: '.facilities-prev',
        },
        breakpoints: {
            576: {
                slidesPerView: 1.8,
                spaceBetween: 20,
            },
            768: {
                slidesPerView: 2.3,
                spaceBetween: 24,
            },
            992: {
                slidesPerView: 3,
                spaceBetween: 30,
            }
        }
    });
}





// Initialize Our Specialties Swiper Carousel (Common for Desktop and Mobile)
if (document.querySelector('.specialties-swiper')) {
    const specialtiesSwiper = new Swiper('.specialties-swiper', {
        slidesPerView: 1,
        spaceBetween: 16,
        grabCursor: true,
        loop: false,
        touchReleaseOnEdges: true,
        observer: true,
        observeParents: true,
        navigation: {
            nextEl: '.specialties-next, .specialties-mobile-next',
            prevEl: '.specialties-prev, .specialties-mobile-prev',
        },
        breakpoints: {
            576: {
                slidesPerView: 1.8,
                spaceBetween: 20,
            },
            768: {
                slidesPerView: 2.3,
                spaceBetween: 24,
            },
            992: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
            1200: {
                slidesPerView: 4,
                spaceBetween: 30,
            }
        }
    });
}


// Form Validation and Submission Handling for Appointment Modal
const appointmentForm = document.getElementById('appointmentForm');
if (appointmentForm) {
    appointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (appointmentForm.checkValidity()) {
            const submitButton = appointmentForm.querySelector('button[type="submit"]');

            // Show a modern submitting spinner
            submitButton.disabled = true;
            submitButton.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin me-2"></i> Submitting...`;

            setTimeout(() => {
                const modalBody = appointmentForm.closest('.modal-body');

                appointmentForm.style.transition = 'opacity 0.3s';
                appointmentForm.style.opacity = '0';

                setTimeout(() => {
                    appointmentForm.classList.add('d-none');

                    const successAlert = document.createElement('div');
                    successAlert.className = 'text-center py-5';
                    successAlert.innerHTML = `
                        <div class="mb-4">
                            <i class="fa-regular fa-circle-check text-success" style="font-size: 64px;"></i>
                        </div>
                        <h3 class="text-white font-weight-bold mb-3" style="font-family: 'Montserrat', sans-serif;">Application Submitted!</h3>
                        <p class="text-muted mx-auto mb-4" style="max-width: 450px;">Thank you for your interest in BMH Perumbavoor. Our Human Resources team will review your credentials and contact you shortly.</p>
                        <button type="button" class="btn btn-primary rounded-pill px-5 py-2" data-bs-dismiss="modal">Close Window</button>
                    `;
                    modalBody.appendChild(successAlert);
                }, 300);
            }, 1500);
        }

        appointmentForm.classList.add('was-validated');
    }, false);
}

// Dynamic Lightbox Modal Image Handlers - Managed robustly by initLightbox() event delegation above.

// Custom Date Picker Calendar Logic
const datepickerWrapper = document.getElementById('datepickerWrapper');
const modalDateInput = document.getElementById('modalDateInput');
const customCalendarPopover = document.getElementById('customCalendarPopover');
const calendarMonthYear = document.getElementById('calendarMonthYear');
const calendarDaysGrid = document.getElementById('calendarDaysGrid');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');

if (datepickerWrapper && modalDateInput && customCalendarPopover) {
    let currentDate = new Date();
    let selectedDate = null;

    // Toggle popover visibility
    modalDateInput.addEventListener('click', (e) => {
        e.stopPropagation();
        customCalendarPopover.classList.toggle('d-none');
        renderCalendar(currentDate);
    });

    datepickerWrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        customCalendarPopover.classList.remove('d-none');
        renderCalendar(currentDate);
    });

    // Hide popover when clicking outside
    document.addEventListener('click', (e) => {
        if (!datepickerWrapper.contains(e.target) && !customCalendarPopover.contains(e.target)) {
            customCalendarPopover.classList.add('d-none');
        }
    });

    // Month navigation
    prevMonthBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextMonthBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();

        calendarMonthYear.textContent = `${months[month]} ${year}`;

        // Clear days grid
        calendarDaysGrid.innerHTML = '';

        // First day of the month (0 = Sunday, 6 = Saturday)
        const firstDayIndex = new Date(year, month, 1).getDay();

        // Total days in current month
        const totalDays = new Date(year, month + 1, 0).getDate();

        // Render empty cells for leading weekday padding
        for (let i = 0; i < firstDayIndex; i++) {
            const emptyCell = document.createElement('div');
            calendarDaysGrid.appendChild(emptyCell);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Render actual calendar days
        for (let day = 1; day <= totalDays; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'calendar-day';
            dayCell.textContent = day;

            const cellDate = new Date(year, month, day);
            cellDate.setHours(0, 0, 0, 0);

            // Disable past dates
            if (cellDate < today) {
                dayCell.classList.add('disabled');
            } else {
                // Check if selected
                if (selectedDate && cellDate.getTime() === selectedDate.getTime()) {
                    dayCell.classList.add('selected');
                }
                // Check if today
                if (cellDate.getTime() === today.getTime()) {
                    dayCell.classList.add('today');
                }

                dayCell.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectedDate = cellDate;

                    // Format: YYYY-MM-DD
                    const formattedDay = String(day).padStart(2, '0');
                    const formattedMonth = String(month + 1).padStart(2, '0');
                    modalDateInput.value = `${year}-${formattedMonth}-${formattedDay}`;

                    customCalendarPopover.classList.add('d-none');

                    // Force Bootstrap validation check
                    modalDateInput.dispatchEvent(new Event('input'));
                });
            }

            calendarDaysGrid.appendChild(dayCell);
        }
    }
}
// Stop background scroll (Lenis) when any Bootstrap modal is opened
const allModals = document.querySelectorAll('.modal');
allModals.forEach(modal => {
    // Prevent Lenis from hijacking scroll events originating inside the modal
    modal.setAttribute('data-lenis-prevent', 'true');

    modal.addEventListener('show.bs.modal', () => {
        if (typeof lenis !== 'undefined') {
            lenis.stop();
        }
        // Force overflow hidden on html and body for robust mobile support
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
    });

    modal.addEventListener('hidden.bs.modal', () => {
        if (typeof lenis !== 'undefined') {
            lenis.start();
        }
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
    });
});
// Careers / Work With Us File Attachment & Submission Logic (Dummy Underline Sync)
const careersFileWrapper = document.getElementById('careersFileWrapper');
const careersFile = document.getElementById('careersFile');
const careersFileDummy = document.getElementById('careersFileDummy');

if (careersFileWrapper && careersFile && careersFileDummy) {
    // Click wrapper triggers the hidden native file input
    careersFileWrapper.addEventListener('click', (e) => {
        if (e.target !== careersFile) {
            careersFile.click();
        }
    });

    // Mirror the chosen file name to the custom read-only underline field
    careersFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const fileName = e.target.files[0].name;
            careersFileDummy.value = fileName;
            // Trigger input event to update validation state
            careersFileDummy.dispatchEvent(new Event('input'));
        } else {
            careersFileDummy.value = '';
        }
    });
}

// Modal Work With Us Resume Attachment Trigger
const modalResumeWrapper = document.getElementById('modalResumeWrapper');
const modalResume = document.getElementById('modalResume');
const modalResumeDummy = document.getElementById('modalResumeDummy');

if (modalResumeWrapper && modalResume && modalResumeDummy) {
    modalResumeWrapper.addEventListener('click', (e) => {
        if (e.target !== modalResume) {
            modalResume.click();
        }
    });

    modalResume.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const fileName = e.target.files[0].name;
            modalResumeDummy.value = fileName;
            modalResumeDummy.dispatchEvent(new Event('input'));
        } else {
            modalResumeDummy.value = '';
        }
    });
}

const careersForm = document.getElementById('careersForm');
const careersFormContainer = document.getElementById('careersFormContainer');
const careersSuccessState = document.getElementById('careersSuccessState');

if (careersForm && careersFormContainer && careersSuccessState) {
    careersForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!careersForm.checkValidity()) {
            careersForm.classList.add('was-validated');
            return;
        }

        const submitBtn = careersForm.querySelector('button[type="submit"]');

        // Trigger premium loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Submitting CV...`;

        setTimeout(() => {
            // Fade out form and fade in success tick card
            careersFormContainer.style.transition = 'opacity 0.4s ease';
            careersFormContainer.style.opacity = '0';

            setTimeout(() => {
                careersFormContainer.classList.add('d-none');
                careersSuccessState.classList.remove('d-none');
                careersSuccessState.style.opacity = '0';
                careersSuccessState.style.transition = 'opacity 0.4s ease';

                setTimeout(() => {
                    careersSuccessState.style.opacity = '1';
                }, 50);
            }, 400);

        }, 1800);
    });
}

// Initialize Events Swiper (Common for Desktop and Mobile)
if (document.querySelector('.events-swiper')) {
    new Swiper('.events-swiper', {
        slidesPerView: 1,
        spaceBetween: 16,
        grabCursor: true,
        loop: false,
        touchReleaseOnEdges: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        navigation: {
            nextEl: '.events-next',
            prevEl: '.events-prev',
        },
        pagination: {
            el: '.events-pagination',
            clickable: true,
            dynamicBullets: true,
        },
        breakpoints: {
            576: {
                slidesPerView: 1.8,
                spaceBetween: 20,
            },
            768: {
                slidesPerView: 2.3,
                spaceBetween: 24,
            },
            992: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
            1200: {
                slidesPerView: 3,
                spaceBetween: 30,
            }
        }
    });
}

// Initialize Nearby Attractions Swiper (Common for Desktop and Mobile)
if (document.querySelector('.attractions-swiper')) {
    new Swiper('.attractions-swiper', {
        slidesPerView: 1,
        spaceBetween: 16,
        grabCursor: true,
        loop: false,
        touchReleaseOnEdges: true,
        breakpoints: {
            576: {
                slidesPerView: 1.8,
                spaceBetween: 20,
            },
            768: {
                slidesPerView: 2.3,
                spaceBetween: 24,
            },
            992: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
            1200: {
                slidesPerView: 3,
                spaceBetween: 30,
            }
        }
    });
}

// About read more collapsible toggle
const readMoreToggle = document.getElementById('about-read-more-toggle');
const collapsibleDetails = document.getElementById('about-collapsible-details');
if (readMoreToggle && collapsibleDetails) {
    readMoreToggle.addEventListener('click', () => {
        const isCollapsed = collapsibleDetails.classList.contains('collapsed');
        if (isCollapsed) {
            collapsibleDetails.classList.remove('collapsed');
            readMoreToggle.classList.add('expanded');
            const textSpan = readMoreToggle.querySelector('.toggle-text');
            if (textSpan) {
                textSpan.textContent = 'Less';
            } else {
                readMoreToggle.innerHTML = 'Less&lt;&lt;';
            }
        } else {
            collapsibleDetails.classList.add('collapsed');
            readMoreToggle.classList.remove('expanded');
            const textSpan = readMoreToggle.querySelector('.toggle-text');
            if (textSpan) {
                textSpan.textContent = 'More';
            } else {
                readMoreToggle.innerHTML = 'More&gt;&gt;';
            }
        }
    });
}
// Initialize AOS Animation Library
if (typeof AOS !== 'undefined') {
    AOS.init({
        duration: 800,
        once: true,
        offset: 100,
        easing: 'ease-out-cubic'
    });
}

// --- CMS API Integration ---
const API_URL = 'http://localhost:5000/api';

const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('assets/')) {
        return url;
    }
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
};

async function loadCMSData() {
    try {
        console.log("Fetching dynamic data from CMS API...");

        // Fetch Heroes
        const heroRes = await fetch(`${API_URL}/heroes`);
        if (heroRes.ok) {
            const heroes = await heroRes.json();
            const activeHeroes = heroes.filter(h => h.isActive);
            if (activeHeroes.length > 0) {
                const wrapper = document.querySelector('#heroCarousel .carousel-inner');
                if (wrapper) {
                    wrapper.innerHTML = activeHeroes.map((h, index) => `
                        <div class="carousel-item ${index === 0 ? 'active' : ''}" style="background-image: url('${getImageUrl(h.imageUrl)}');">
                            <div class="hero-overlay"></div>
                            <div class="container h-100 position-relative">
                                <div class="carousel-caption hero-caption">
                                    <h1 class="ttl-h1 hero-title mb-3">${h.title}</h1>
                                    <p class="hero-text">${h.subtitle || ''}</p>
                                </div>
                            </div>
                        </div>
                    `).join('');
                }
            }
        }

        // Fetch Facilities
        const facRes = await fetch(`${API_URL}/facilities`);
        if (facRes.ok) {
            const facilities = await facRes.json();
            if (facilities.length > 0) {
                const wrapper = document.querySelector('.facilities-swiper .swiper-wrapper');
                if (wrapper) {
                    wrapper.innerHTML = facilities.map(f => `
                        <div class="swiper-slide">
                            <div class="facility-card" style="background-image: url('${getImageUrl(f.imageUrl)}');">
                                <div class="facility-content">
                                    <h4 class="facility-card-title ttl-h4">${f.title}</h4>
                                    <p class="facility-card-desc">${f.description}</p>
                                </div>
                            </div>
                        </div>
                    `).join('');

                    const swiperEl = document.querySelector('.facilities-swiper');
                    if (swiperEl && swiperEl.swiper) {
                        swiperEl.swiper.update();
                    }
                }
            }
        }

        // Fetch Specialties
        const specRes = await fetch(`${API_URL}/specialties`);
        if (specRes.ok) {
            const specialties = await specRes.json();
            if (specialties.length > 0) {
                const wrapper = document.querySelector('.specialties-swiper .swiper-wrapper');
                if (wrapper) {
                    wrapper.innerHTML = specialties.map(s => `
                        <div class="swiper-slide">
                            <div class="bento-card h-100">
                                <div class="bento-card-bg" style="background-image: url('${getImageUrl(s.imageUrl)}');"></div>
                                <div class="bento-card-body">
                                    <h4 class="bento-card-title ttl-h4">${s.title}</h4>
                                    <p class="bento-card-text">${s.description}</p>
                                </div>
                            </div>
                        </div>
                    `).join('');

                    const swiperEl = document.querySelector('.specialties-swiper');
                    if (swiperEl && swiperEl.swiper) {
                        swiperEl.swiper.update();
                    }
                }
            }
        }

        console.log("CMS dynamic data successfully loaded and applied.");
        if (typeof lenis !== 'undefined') {
            lenis.resize();
        }
    } catch (err) {
        console.error('Error loading CMS data:', err);
    }
}

// Call the CMS loading function
loadCMSData();

// Initialize Gallery (Grid for Desktop, Swiper for Mobile)
const galleryFilterBtns = document.querySelectorAll('.gallery-filters .filter-btn');
const galleryDesktopGrid = document.querySelector('.gallery-desktop-grid');
const galleryMobileSwiper = document.querySelector('.gallery-mobile-swiper');

if (galleryDesktopGrid && galleryMobileSwiper) {
    const originalDesktopItems = Array.from(galleryDesktopGrid.querySelectorAll('.gallery-item'));
    const originalMobileSlides = Array.from(galleryMobileSwiper.querySelectorAll('.swiper-slide'));

    let gallerySwiperInstance = null;

    function initGalleryMobileSwiper() {
        if (window.innerWidth < 992) {
            if (!gallerySwiperInstance) {
                gallerySwiperInstance = new Swiper('.gallery-mobile-swiper', {
                    slidesPerView: 1.2,
                    spaceBetween: 16,
                    grabCursor: true,
                    loop: false,
                    touchReleaseOnEdges: true,
                    observer: true,
                    observeParents: true,
                    pagination: {
                        el: '.gallery-pagination',
                        clickable: true,
                    },
                    breakpoints: {
                        576: {
                            slidesPerView: 1.5,
                            spaceBetween: 20,
                        },
                        768: {
                            slidesPerView: 2.2,
                            spaceBetween: 24,
                        }
                    }
                });
            }
        } else {
            if (gallerySwiperInstance) {
                gallerySwiperInstance.destroy(true, true);
                gallerySwiperInstance = null;
            }
        }
    }

    // Initialize on load and adjust on resize
    initGalleryMobileSwiper();
    window.addEventListener('resize', initGalleryMobileSwiper);

    if (galleryFilterBtns.length) {
        galleryFilterBtns.forEach(button => {
            button.addEventListener('click', () => {
                // Toggle active class on buttons
                galleryFilterBtns.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filterValue = button.getAttribute('data-filter');

                // Filter Desktop Grid
                galleryDesktopGrid.style.opacity = '0';
                setTimeout(() => {
                    galleryDesktopGrid.innerHTML = '';
                    const matchingDesktop = originalDesktopItems.filter(item => {
                        const category = item.getAttribute('data-category');
                        return filterValue === 'all' || category === filterValue;
                    });
                    matchingDesktop.forEach(item => {
                        galleryDesktopGrid.appendChild(item);
                    });
                    galleryDesktopGrid.style.opacity = '1';

                    // Recalculate Lenis scroll dimensions
                    if (typeof lenis !== 'undefined') {
                        lenis.resize();
                    }
                }, 200);

                // Filter Mobile Swiper
                const swiperWrapper = galleryMobileSwiper.querySelector('.swiper-wrapper');
                if (swiperWrapper) {
                    swiperWrapper.style.opacity = '0';
                    setTimeout(() => {
                        swiperWrapper.innerHTML = '';
                        const matchingMobile = originalMobileSlides.filter(item => {
                            const category = item.getAttribute('data-category');
                            return filterValue === 'all' || category === filterValue;
                        });
                        matchingMobile.forEach(item => {
                            swiperWrapper.appendChild(item);
                        });
                        swiperWrapper.style.opacity = '1';
                        if (gallerySwiperInstance) {
                            gallerySwiperInstance.update();
                            gallerySwiperInstance.slideTo(0, 0);
                        }

                        // Recalculate Lenis scroll dimensions
                        if (typeof lenis !== 'undefined') {
                            lenis.resize();
                        }
                    }, 200);
                }
            });
        });
    }
}

// Lightbox Modal Dynamic Image Loading
const lightboxModalEl = document.getElementById('lightboxModal');
if (lightboxModalEl) {
    lightboxModalEl.addEventListener('show.bs.modal', (event) => {
        const triggerButton = event.relatedTarget;
        const imgSrc = triggerButton.getAttribute('data-src');
        const imgTitle = triggerButton.getAttribute('data-title');

        const lightboxImage = lightboxModalEl.querySelector('#lightboxImage');
        const lightboxTitle = lightboxModalEl.querySelector('#lightboxTitle');

        if (lightboxImage && lightboxTitle) {
            lightboxImage.src = imgSrc;
            lightboxTitle.textContent = imgTitle;
        }
    });
}

// Prevent downloading of images via right-click and drag
document.addEventListener('contextmenu', (e) => {
    // Target <img> tags and specific elements that use background-images
    if (e.target.tagName === 'IMG' || (e.target.classList && (e.target.classList.contains('carousel-item') || e.target.classList.contains('facility-card') || e.target.classList.contains('hero-overlay')))) {
        e.preventDefault();
    }
});

document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

// Prevent saving the webpage (Ctrl+S / Cmd+S) and common developer tool shortcuts
document.addEventListener('keydown', (e) => {
    // Prevent Ctrl+S / Cmd+S
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        alert('Saving this page is disabled to protect website assets.');
    }

    // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if (e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
        ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u'))) {
        e.preventDefault();
    }
});
