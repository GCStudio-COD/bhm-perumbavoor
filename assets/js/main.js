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

            // Prepare FormData
            const formData = new FormData();
            formData.append('fullName', document.getElementById('modalFullName').value);
            formData.append('phone', document.getElementById('modalPhone').value);
            formData.append('email', document.getElementById('modalEmail').value);
            formData.append('position', document.getElementById('modalPosition').value);
            formData.append('experience', document.getElementById('modalExperience').value);
            formData.append('message', document.getElementById('modalMessage').value);
            formData.append('resume', document.getElementById('modalResume').files[0]);

            fetch(`${API_URL}/applications`, {
                method: 'POST',
                body: formData
            })
            .then(async (res) => {
                if (res.ok) {
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
                } else {
                    const errData = await res.json();
                    alert(errData.message || 'Error submitting application.');
                    submitButton.disabled = false;
                    submitButton.innerHTML = `Submit Application <i class="fa-solid fa-paper-plane ms-2"></i>`;
                }
            })
            .catch((err) => {
                console.error(err);
                alert('Connection error submitting application. Please try again.');
                submitButton.disabled = false;
                submitButton.innerHTML = `Submit Application <i class="fa-solid fa-paper-plane ms-2"></i>`;
            });
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

        // Prepare FormData
        const formData = new FormData();
        formData.append('fullName', document.getElementById('careersName').value);
        formData.append('phone', document.getElementById('careersPhone').value);
        formData.append('email', document.getElementById('careersEmail').value);
        formData.append('position', 'General CV Upload (Careers Section)');
        formData.append('experience', 'Not Specified');
        formData.append('message', document.getElementById('careersMessage').value);
        formData.append('resume', document.getElementById('careersFile').files[0]);

        fetch(`${API_URL}/applications`, {
            method: 'POST',
            body: formData
        })
        .then(async (res) => {
            if (res.ok) {
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
            } else {
                const errData = await res.json();
                alert(errData.message || 'Error submitting application.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = `Submit Application <i class="fa-solid fa-arrow-right"></i>`;
            }
        })
        .catch((err) => {
            console.error(err);
            alert('Connection error submitting application. Please try again.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = `Submit Application <i class="fa-solid fa-arrow-right"></i>`;
        });
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
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.port !== '') ? 'http://localhost:5000/api' : '/api';

const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('assets/')) {
        return url;
    }
    const origin = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.port !== '') ? 'http://localhost:5000' : '';
    return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Gallery variables
let originalSlides = [];
let gallerySwiperInstance = null;

async function loadCMSData() {
    try {
        console.log("Fetching dynamic page data from CMS API...");
        const res = await fetch(`${API_URL}/homepage`);
        if (!res.ok) throw new Error('Failed to fetch homepage data');
        const data = await res.json();
        const { config, heroes, facilities, specialties, gallery, events, attractions, reachModes, jobPositions } = data;

        // Populate Positions Dropdown
        if (jobPositions && jobPositions.length > 0) {
            const modalPositionSelect = document.getElementById('modalPosition');
            if (modalPositionSelect) {
                modalPositionSelect.innerHTML = `
                    <option value="" selected disabled>Choose position...</option>
                    ${jobPositions.map(pos => `<option value="${pos.title}">${pos.title}</option>`).join('')}
                `;
            }
        }

        // 1. Populate Config Texts
        if (config) {
            // About Section
            const badgeTag = document.querySelector('.about-badge-tag');
            if (badgeTag) badgeTag.innerHTML = config.about_badge || 'overview';
            
            const aboutTitle = document.querySelector('.about-title');
            if (aboutTitle) aboutTitle.innerHTML = config.about_title || '';
            
            const aboutImg = document.querySelector('.about-image-container-wide img');
            if (aboutImg) aboutImg.src = getImageUrl(config.about_image);
            
            const aboutParas = document.querySelectorAll('.about-section p.text-16');
            if (aboutParas.length >= 3) {
                // If there are standard paragraph elements
                const leadPara = document.querySelector('.about-section p.fw-medium');
                if (leadPara) leadPara.innerHTML = config.about_lead || '';
                
                aboutParas[0].innerHTML = config.about_paragraph1 || '';
                aboutParas[1].innerHTML = config.about_paragraph2 || '';
            }

            const collapsibleInner = document.querySelector('.about-collapsible-inner');
            if (collapsibleInner) {
                // Populate collapsible paragraphs
                const pElements = collapsibleInner.querySelectorAll('p.text-16');
                if (pElements.length >= 3) {
                    pElements[0].innerHTML = config.about_collapsible_p1 || '';
                    pElements[1].innerHTML = config.about_collapsible_p2 || '';
                    pElements[2].innerHTML = config.about_collapsible_p3 || '';
                }

                // Render features list dynamically
                let features = [];
                try {
                    features = typeof config.about_features === 'string' ? JSON.parse(config.about_features) : config.about_features;
                } catch(e) {}

                if (Array.isArray(features) && features.length > 0) {
                    const checklistGrid = collapsibleInner.querySelector('.row.g-3');
                    if (checklistGrid) {
                        checklistGrid.innerHTML = features.map(feat => `
                            <div class="col-12 col-md-6">
                                <div class="d-flex align-items-start p-3 bg-light rounded-4 h-100">
                                    <i class="fa-solid fa-circle-check text-secondary me-3 mt-1 fs-5"></i>
                                    <p class="fw-bold text-slate-800 mb-0">${feat.text}</p>
                                </div>
                            </div>
                        `).join('');
                    }
                }
            }

            // Stats counter
            let stats = [];
            try {
                stats = typeof config.about_stats === 'string' ? JSON.parse(config.about_stats) : config.about_stats;
            } catch(e) {}
            if (Array.isArray(stats) && stats.length > 0) {
                const statsRow = document.querySelector('.about-stats-2x2');
                if (statsRow) {
                    statsRow.innerHTML = stats.map((stat, idx) => `
                        <div class="stat-grid-item" data-aos="fade-up" data-aos-delay="${idx * 100}">
                            <div class="stat-grid-icon-box">
                                <div class="bg-secondary" style="width: 36px; height: 36px; -webkit-mask: url('${getImageUrl('assets/images/' + stat.icon)}') center/contain no-repeat; mask: url('${getImageUrl('assets/images/' + stat.icon)}') center/contain no-repeat;"></div>
                            </div>
                            <div class="stat-grid-info">
                                <div class="stat-grid-num-wrapper">
                                    <span class="stat-number stat-grid-number" data-target="${stat.target}">0</span>
                                    <span class="stat-grid-plus">${stat.suffix || ''}</span>
                                </div>
                                <span class="stat-grid-label">${stat.label}</span>
                            </div>
                        </div>
                    `).join('');
                }
            }

            // Facilities & Specialties Headers
            const facTitle = document.querySelector('.facilities-title');
            if (facTitle) facTitle.innerHTML = config.facilities_title || '';
            const facSubtitle = document.querySelector('.facilities-subtitle');
            if (facSubtitle) facSubtitle.innerHTML = config.facilities_subtitle || '';

            const specTitle = document.querySelector('.specialties-section .ttl-h2');
            if (specTitle) specTitle.innerHTML = config.specialties_title || '';
            const specSubtitle = document.querySelector('.specialties-subtitle');
            if (specSubtitle) specSubtitle.innerHTML = config.specialties_subtitle || '';

            // Gallery Header
            const galTitle = document.querySelector('.gallery-title');
            if (galTitle) galTitle.innerHTML = config.gallery_title || '';
            const galSubtitle = document.querySelector('.gallery-subtitle');
            if (galSubtitle) galSubtitle.innerHTML = config.gallery_subtitle || '';

            // Events Header
            const evTitle = document.querySelector('.events-title');
            if (evTitle) evTitle.innerHTML = config.events_title || '';
            const evSubtitle = document.querySelector('.events-subtitle');
            if (evSubtitle) evSubtitle.innerHTML = config.events_subtitle || '';

            // Careers Header
            const carTitle = document.querySelector('.careers-main-title');
            if (carTitle) carTitle.innerHTML = config.careers_title || '';
            const carDesc = document.querySelector('.careers-desc');
            if (carDesc) carDesc.innerHTML = config.careers_description || '';

            // Careers Benefits
            let benefits = [];
            try {
                benefits = typeof config.careers_benefits === 'string' ? JSON.parse(config.careers_benefits) : config.careers_benefits;
            } catch(e) {}
            if (Array.isArray(benefits) && benefits.length > 0) {
                const benefitsBox = document.querySelector('.careers-info-boxes');
                if (benefitsBox) {
                    benefitsBox.innerHTML = benefits.map((b, idx) => `
                        <div class="careers-info-box d-flex align-items-center ${idx < benefits.length - 1 ? 'mb-4' : ''}">
                            <div class="info-box-icon me-3 d-flex align-items-center justify-content-center">
                                <i class="${b.icon_class} text-primary"></i>
                            </div>
                            <div>
                                <span class="info-box-label text-muted d-block text-uppercase" style="font-size: 11px; letter-spacing: 0.5px;">${b.label}</span>
                                <strong class="info-box-value text-slate-800" style="font-size: 15px;">${b.value}</strong>
                            </div>
                        </div>
                    `).join('');
                }
            }

            // Attractions Header
            const attrTitle = document.querySelector('.attractions-section .ttl-h2');
            if (attrTitle) attrTitle.innerHTML = config.attractions_title || '';
            const attrSubtitle = document.querySelector('.attractions-subtitle');
            if (attrSubtitle) attrSubtitle.innerHTML = config.attractions_subtitle || '';

            // Reach Header
            const reachTitle = document.querySelector('.reach-title');
            if (reachTitle) reachTitle.innerHTML = config.reach_title || '';
            const reachSubtitle = document.querySelector('.reach-subtitle');
            if (reachSubtitle) reachSubtitle.innerHTML = config.reach_subtitle || '';

            // Footer Section
            const footerAbout = document.querySelector('.footer-about-text');
            if (footerAbout) footerAbout.innerHTML = config.footer_about || '';
            
            const contactItems = document.querySelectorAll('.footer-contact-list li');
            if (contactItems.length >= 3) {
                contactItems[0].innerHTML = `<i class="fa-solid fa-location-dot contact-icon me-3 mt-1"></i><span class="contact-text">${config.footer_address || ''}</span>`;
                contactItems[1].innerHTML = `<i class="fa-solid fa-calendar-check contact-icon me-3 mt-1"></i><span class="contact-text"><strong class="text-white d-block">Appointments:</strong><a href="tel:${config.footer_phone}" class="contact-link">${config.footer_phone || ''}</a></span>`;
                contactItems[2].innerHTML = `<i class="fa-solid fa-envelope contact-icon me-3 mt-1"></i><span class="contact-text"><strong class="text-white d-block">Email Support:</strong><a href="mailto:${config.footer_email}" class="contact-link">${config.footer_email || ''}</a></span>`;
            }

            // Footer Social Links
            const fbLink = document.querySelector('.footer-social-links a[href*="facebook"]');
            if (fbLink) fbLink.href = config.footer_facebook || '#';
            const igLink = document.querySelector('.footer-social-links a[href*="instagram"]');
            if (igLink) igLink.href = config.footer_instagram || '#';
            const twLink = document.querySelector('.footer-social-links a[href*="twitter"], .footer-social-links a .fa-x-twitter');
            if (twLink) {
                const anchor = twLink.tagName === 'A' ? twLink : twLink.closest('a');
                if (anchor) anchor.href = config.footer_twitter || '#';
            }
            const liLink = document.querySelector('.footer-social-links a[href*="linkedin"], .footer-social-links a .fa-linkedin-in');
            if (liLink) {
                const anchor = liLink.tagName === 'A' ? liLink : liLink.closest('a');
                if (anchor) anchor.href = config.footer_linkedin || '#';
            }
        }

        // 2. Render Hero Banner
        const activeHeroes = heroes.filter(h => h.is_active);
        if (activeHeroes.length > 0) {
            const wrapper = document.querySelector('#heroCarousel .carousel-inner');
            if (wrapper) {
                wrapper.innerHTML = activeHeroes.map((h, index) => `
                    <div class="carousel-item ${index === 0 ? 'active' : ''}" style="background-image: url('${getImageUrl(h.image_url)}');">
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

        // 3. Render Facilities swiper
        if (facilities.length > 0) {
            const wrapper = document.querySelector('.facilities-swiper .swiper-wrapper');
            if (wrapper) {
                wrapper.innerHTML = facilities.map(f => `
                    <div class="swiper-slide">
                        <div class="facility-card" style="background-image: url('${getImageUrl(f.image_url)}');">
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

        // 4. Render Specialties swiper
        if (specialties.length > 0) {
            const wrapper = document.querySelector('.specialties-swiper .swiper-wrapper');
            if (wrapper) {
                wrapper.innerHTML = specialties.map(s => `
                    <div class="swiper-slide">
                        <div class="bento-card h-100">
                            <div class="bento-card-bg" style="background-image: url('${getImageUrl(s.image_url)}');"></div>
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

        // 5. Render Events swiper
        if (events.length > 0) {
            const wrapper = document.querySelector('.events-swiper .swiper-wrapper');
            if (wrapper) {
                wrapper.innerHTML = events.map(e => `
                    <div class="swiper-slide h-auto">
                        <div class="event-card">
                            <div class="event-card-img-wrapper">
                                <span class="event-card-badge">${e.category}</span>
                                <img loading="lazy" src="${getImageUrl(e.image_url)}" alt="${e.title}" class="event-card-img" />
                            </div>
                            <div class="event-card-body">
                                <div class="event-card-meta">
                                    <i class="fa-regular fa-calendar"></i>
                                    <span>${e.event_date}</span>
                                </div>
                                <h4 class="event-card-title ttl-h4">${e.title}</h4>
                                <p class="event-card-text">${e.description}</p>
                            </div>
                        </div>
                    </div>
                `).join('');

                const swiperEl = document.querySelector('.events-swiper');
                if (swiperEl && swiperEl.swiper) {
                    swiperEl.swiper.update();
                }
            }
        }

        // 6. Render Nearby Attractions swiper
        if (attractions.length > 0) {
            const wrapper = document.querySelector('.attractions-swiper .swiper-wrapper');
            if (wrapper) {
                wrapper.innerHTML = attractions.map(a => `
                    <div class="swiper-slide h-auto">
                        <div class="attraction-card">
                            <div class="attraction-img-wrapper">
                                <img loading="lazy" src="${getImageUrl(a.image_url)}" alt="${a.title}" class="attraction-img" />
                            </div>
                            <div class="attraction-card-body">
                                <span class="attraction-tag">${a.tag}</span>
                                <div class="d-flex justify-content-between align-items-center w-100">
                                    <h4 class="attraction-title ttl-h4">${a.title}</h4>
                                    <span class="attraction-distance"><i class="fa-solid fa-location-dot me-1"></i>${a.distance}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');

                const swiperEl = document.querySelector('.attractions-swiper');
                if (swiperEl && swiperEl.swiper) {
                    swiperEl.swiper.update();
                }
            }
        }

        // 7. Render Reach Modes
        if (reachModes.length > 0) {
            const wrapper = document.querySelector('.reach-section .row.g-4');
            if (wrapper) {
                const iconMap = {
                    'Air': 'fa-solid fa-plane-departure',
                    'Rail': 'fa-solid fa-train',
                    'Road': 'fa-solid fa-bus',
                    'Metro': 'fa-solid fa-train-subway'
                };
                wrapper.innerHTML = reachModes.map((r, idx) => `
                    <div class="col-xl-3 col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="${idx * 100}">
                        <div class="reach-card h-100 p-4 rounded-4 shadow-sm bg-white border border-light text-center d-flex flex-column align-items-center">
                            <div class="reach-card-icon mx-auto mb-3 d-flex align-items-center justify-content-center">
                                <i class="${iconMap[r.mode] || 'fa-solid fa-route'}"></i>
                            </div>
                            <h5 class="reach-card-title ttl-h5 mb-2">${r.title || ''}</h5>
                            <h6 class="reach-card-subtitle ttl-h6 mb-3 text-muted">${r.subtitle || ''}</h6>
                            <p class="reach-card-desc text-muted mb-4">${r.description || ''}</p>
                            <div class="reach-card-badge mt-auto d-inline-flex align-items-center">
                                <i class="fa-solid fa-route me-1"></i>
                                <span>${r.badge_info || ''}</span>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }

        // 8. Render Dynamic Gallery
        if (gallery.length > 0) {
            initDynamicGallery(gallery);
        }

        // Re-run counter checker & animations
        startCounters();
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
        if (typeof lenis !== 'undefined') {
            lenis.resize();
        }

        console.log("CMS dynamic data successfully loaded and pages rendered.");
    } catch (err) {
        console.error('Error loading CMS data:', err);
    }
}

// Function to construct and handle gallery pagination/filtering
function initDynamicGallery(items) {
    const swiperEl = document.querySelector('.gallery-swiper');
    if (!swiperEl) return;

    const catMap = {
        'infra': 'Infrastructure',
        'tech': 'Medical Tech',
        'rooms': 'Wards & Lobbies'
    };

    // Construct original slides array
    originalSlides = items.map(item => {
        const div = document.createElement('div');
        div.className = 'swiper-slide';
        div.setAttribute('data-category', item.category);
        div.innerHTML = `
            <div class="gallery-card">
                <div class="gallery-img-wrapper">
                    <img loading="lazy" src="${getImageUrl(item.image_url)}" alt="${item.title}" class="gallery-img" />
                    <div class="gallery-overlay">
                        <div class="gallery-info text-center p-3">
                            <span class="gallery-item-category">${catMap[item.category] || item.category}</span>
                            <h4 class="gallery-item-title">${item.title}</h4>
                            <button class="gallery-zoom-btn mt-3" data-bs-toggle="modal" data-bs-target="#lightboxModal" data-src="${getImageUrl(item.image_url)}" data-title="${item.title}">
                                <i class="fa-solid fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return div;
    });

    const swiperWrapper = swiperEl.querySelector('.swiper-wrapper');
    if (swiperWrapper) {
        swiperWrapper.innerHTML = '';
        originalSlides.forEach(slide => swiperWrapper.appendChild(slide.cloneNode(true)));
    }

    initGallerySwiper();
    if (gallerySwiperInstance) {
        gallerySwiperInstance.update();
        gallerySwiperInstance.slideTo(0, 0);
    }
}

function initGallerySwiper() {
    const swiperEl = document.querySelector('.gallery-swiper');
    if (!swiperEl) return;

    const swiperWrapper = swiperEl.querySelector('.swiper-wrapper');
    if (!swiperWrapper) return;

    // Collect original slides from static HTML if they haven't been stored/loaded yet
    if (originalSlides.length === 0 && swiperWrapper.children.length > 0) {
        originalSlides = Array.from(swiperWrapper.children).map(child => child.cloneNode(true));
    }

    if (!gallerySwiperInstance) {
        gallerySwiperInstance = new Swiper('.gallery-swiper', {
            slidesPerView: 1.2,
            spaceBetween: 16,
            grabCursor: true,
            loop: false,
            touchReleaseOnEdges: true,
            observer: true,
            observeParents: true,
            navigation: {
                nextEl: '.gallery-next',
                prevEl: '.gallery-prev',
            },
            pagination: {
                el: '.gallery-pagination',
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
                    spaceBetween: 24,
                },
                1200: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                }
            }
        });
    }
}

// Initialize Filters
const galleryFilterBtns = document.querySelectorAll('.gallery-filters .filter-btn');
if (galleryFilterBtns.length) {
    galleryFilterBtns.forEach(button => {
        button.addEventListener('click', () => {
            galleryFilterBtns.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');
            const swiperWrapper = document.querySelector('.gallery-swiper .swiper-wrapper');

            if (swiperWrapper) {
                swiperWrapper.style.opacity = '0';
                setTimeout(() => {
                    swiperWrapper.innerHTML = '';
                    const matchingSlides = originalSlides.filter(item => {
                        const category = item.getAttribute('data-category');
                        return filterValue === 'all' || category === filterValue;
                    });
                    matchingSlides.forEach(item => swiperWrapper.appendChild(item.cloneNode(true)));
                    swiperWrapper.style.opacity = '1';
                    if (gallerySwiperInstance) {
                        gallerySwiperInstance.update();
                        gallerySwiperInstance.slideTo(0, 0);
                    }
                    if (typeof lenis !== 'undefined') lenis.resize();
                }, 200);
            }
        });
    });
}

// Initialize static gallery swiper on page load
initGallerySwiper();

// Call CMS Load on startup
loadCMSData();

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
