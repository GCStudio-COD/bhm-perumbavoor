/**
 * BMH Hospital Website - Core UI Interactions
 * Custom High-Performance Navigation Drawer Controller and modern layout scripting.
 */
const lenis = new Lenis({
    autoRaf: true,
});

document.addEventListener('DOMContentLoaded', () => {


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

    // Initialize Premium Infrastructure Gallery Swiper Carousel (Mobile Only - Under 768px Viewports)
    let gallerySwiperInstance = null;

    const initGallerySwiper = () => {
        const galleryContainer = document.querySelector('.gallery-swiper');
        if (!galleryContainer) return;

        const isMobile = window.innerWidth < 768;

        if (isMobile) {
            if (!gallerySwiperInstance) {
                gallerySwiperInstance = new Swiper('.gallery-swiper', {
                    slidesPerView: 1.2,
                    spaceBetween: 16,
                    grabCursor: true,
                    loop: false,
                    scrollbar: {
                        el: '.gallery-scrollbar',
                        draggable: true,
                        snapOnRelease: true,
                    }
                });
            }
        } else {
            if (gallerySwiperInstance) {
                gallerySwiperInstance.destroy(true, true);
                gallerySwiperInstance = null;
            }
        }
    };

    // Initialize state immediately
    initGallerySwiper();

    // Debounced listener to re-evaluate Swiper bounds on viewport transitions
    let galleryResizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(galleryResizeTimeout);
        galleryResizeTimeout = setTimeout(initGallerySwiper, 150);
    });

    // Initialize Our Specialties Swiper Carousel (Common for Desktop and Mobile)
    if (document.querySelector('.specialties-swiper')) {
        const specialtiesSwiper = new Swiper('.specialties-swiper', {
            slidesPerView: 1,
            spaceBetween: 16,
            grabCursor: true,
            loop: false,
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

    // Refresh ScrollTrigger to ensure Swiper slide size changes do not affect downstream coordinates
    setTimeout(() => {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    }, 100);



    // Force ScrollTrigger refresh on window load to ensure absolute alignment accuracy
    window.addEventListener('load', () => {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    });

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

    // Premium Infrastructure Gallery Filtering System (Dynamic DOM Filtering for perfect Swiper compatibility)
    const filterButtons = document.querySelectorAll('.gallery-filters .filter-btn');
    const galleryWrapper = document.querySelector('.gallery-grid');
    const originalGalleryItems = Array.from(document.querySelectorAll('.gallery-grid .gallery-item'));

    if (filterButtons.length && galleryWrapper && originalGalleryItems.length) {
        // Add a CSS transition directly for smoother fade effects
        galleryWrapper.style.transition = 'opacity 0.25s ease';

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Toggle active button style
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const filterValue = button.getAttribute('data-filter');

                // Fade out wrapper container
                galleryWrapper.style.opacity = '0';

                setTimeout(() => {
                    // Empty the wrapper track
                    galleryWrapper.innerHTML = '';

                    // Filter only matching elements
                    const matchingItems = originalGalleryItems.filter(item => {
                        const category = item.getAttribute('data-category');
                        return filterValue === 'all' || category === filterValue;
                    });

                    // Re-append active matching cards
                    matchingItems.forEach(item => {
                        item.classList.remove('d-none');
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                        galleryWrapper.appendChild(item);
                    });

                    // Fade back in
                    galleryWrapper.style.opacity = '1';

                    // Update Swiper track and snap to first slide to avoid blank positions
                    if (gallerySwiperInstance) {
                        gallerySwiperInstance.update();
                        gallerySwiperInstance.slideTo(0, 0);
                    }
                }, 250);
            });
        });
    }

    // Dynamic Lightbox Modal Image Handlers
    const lightboxModal = document.getElementById('lightboxModal');
    if (lightboxModal) {
        lightboxModal.addEventListener('show.bs.modal', (event) => {
            const triggerButton = event.relatedTarget;
            const imgSrc = triggerButton.getAttribute('data-src');
            const imgTitle = triggerButton.getAttribute('data-title');

            const lightboxImage = lightboxModal.querySelector('#lightboxImage');
            const lightboxTitle = lightboxModal.querySelector('#lightboxTitle');

            if (lightboxImage && lightboxTitle) {
                lightboxImage.src = imgSrc;
                lightboxTitle.textContent = imgTitle;
            }
        });
    }

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
        modal.addEventListener('show.bs.modal', () => {
            if (typeof lenis !== 'undefined') {
                lenis.stop();
            }
        });
        modal.addEventListener('hidden.bs.modal', () => {
            if (typeof lenis !== 'undefined') {
                lenis.start();
            }
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
            navigation: {
                nextEl: '.attractions-next',
                prevEl: '.attractions-prev',
            },
            pagination: {
                el: '.attractions-pagination',
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
            // Refresh ScrollTrigger to adjust paths for Lenis and other GSAP animations
            setTimeout(() => {
                if (typeof ScrollTrigger !== 'undefined') {
                    ScrollTrigger.refresh();
                }
            }, 300);
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
});
