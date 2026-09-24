// script.js
let siteData = null;
let currentReview = 0;
let reviewsCount = 0;
let galleryImages = [];
let currentLightboxIndex = 0;
let autoSlideInterval = null;

// ===== Load data from JSON =====
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        siteData = await response.json();
        initSite();
    } catch (error) {
        console.error('Ошибка загрузки data.json:', error);
        // Fallback данные на случай ошибки
        siteData = {
            name: "KOLYA AUto",
            phone: "+7 (999) 123-45-67",
            whatsapp: "79991234567",
            address: "г. Москва, ул. Автодорожная, 15",
            about: "Премиальная автошкола с индивидуальным подходом к каждому ученику.",
            categories: [],
            prices: [],
            instructors: [],
            cars: [],
            reviews: [],
            gallery: [],
            socials: []
        };
        initSite();
    }
}

// ===== Initialize site =====
function initSite() {
    if (!siteData) return;

    // Header & Hero
    document.getElementById('logoText').textContent = siteData.name;
    document.getElementById('heroTitle').textContent = siteData.name;
    document.getElementById('heroSubtitle').textContent = siteData.tagline || 'Получи водительские права уверенно';
    document.getElementById('heroDesc').textContent = siteData.heroDesc || 'Теория + практика + подготовка к экзамену.';

    // WhatsApp links
    const waLink = `https://wa.me/${siteData.whatsapp}`;
    document.getElementById('headerWhatsapp').href = waLink;
    document.getElementById('whatsappFloat').href = waLink;

    // About
    const aboutEl = document.getElementById('aboutContent');
    aboutEl.innerHTML = `
        <div class="about__text">
            <h3>${siteData.aboutTitle || 'О школе'}</h3>
            <p>${siteData.about}</p>
            <p>${siteData.aboutExtra || ''}</p>
        </div>
        <div class="about__stats">
            <div class="stat"><span class="stat__number">${siteData.stats?.years || '10'}+</span><span class="stat__label">Лет опыта</span></div>
            <div class="stat"><span class="stat__number">${siteData.stats?.graduates || '5000'}+</span><span class="stat__label">Выпускников</span></div>
            <div class="stat"><span class="stat__number">${siteData.stats?.success || '98'}%</span><span class="stat__label">Сдают с первого раза</span></div>
        </div>
    `;

    // Categories
    const catGrid = document.getElementById('categoriesGrid');
    catGrid.innerHTML = (siteData.categories || []).map(cat => `
        <div class="card reveal">
            <span class="card__icon">${cat.icon || '🚗'}</span>
            <h3 class="card__title">${cat.name}</h3>
            <p class="card__text">${cat.description}</p>
        </div>
    `).join('');

    // Program
    const progGrid = document.getElementById('programGrid');
    progGrid.innerHTML = (siteData.program || []).map(item => `
        <div class="program__item reveal">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <span class="hours">${item.hours} ч.</span>
        </div>
    `).join('');

    // Cars
    const carsGrid = document.getElementById('carsGrid');
    carsGrid.innerHTML = (siteData.cars || []).map(car => `
        <div class="car-card reveal">
            <img src="${car.image}" alt="${car.name}" class="car-card__img" loading="lazy">
            <div class="car-card__body">
                <h3 class="car-card__title">${car.name}</h3>
                <p class="car-card__desc">${car.description}</p>
            </div>
        </div>
    `).join('');

    // Instructors
    const instrGrid = document.getElementById('instructorsGrid');
    instrGrid.innerHTML = (siteData.instructors || []).map(inst => `
        <div class="instructor-card reveal">
            <img src="${inst.image}" alt="${inst.name}" class="instructor-card__img" loading="lazy">
            <h3 class="instructor-card__name">${inst.name}</h3>
            <p class="instructor-card__exp">Опыт: ${inst.experience}</p>
            <p class="instructor-card__desc">${inst.description}</p>
        </div>
    `).join('');

    // Prices
    const pricesGrid = document.getElementById('pricesGrid');
    pricesGrid.innerHTML = (siteData.prices || []).map(price => `
        <div class="price-card ${price.popular ? 'price-card--popular' : ''} reveal">
            <h3 class="price-card__name">${price.name}</h3>
            <div class="price-card__price">${price.price} ₽</div>
            <ul class="price-card__features">
                ${(price.features || []).map(f => `<li>${f}</li>`).join('')}
            </ul>
            <a href="#form" class="btn btn--primary btn--full">Записаться</a>
        </div>
    `).join('');

    // Reviews
    initReviews();

    // Gallery
    initGallery();

    // Contacts
    const contactsInfo = document.getElementById('contactsInfo');
    contactsInfo.innerHTML = `
        <div class="contact-item">
            <div class="contact-item__icon"><i class="fas fa-map-marker-alt"></i></div>
            <div>
                <div class="contact-item__label">Адрес</div>
                <div class="contact-item__value">${siteData.address}</div>
            </div>
        </div>
        <div class="contact-item">
            <div class="contact-item__icon"><i class="fas fa-phone"></i></div>
            <div>
                <div class="contact-item__label">Телефон</div>
                <a href="tel:${siteData.phone.replace(/[^+\d]/g, '')}" class="contact-item__value">${siteData.phone}</a>
            </div>
        </div>
        <div class="contact-item">
            <div class="contact-item__icon"><i class="fab fa-whatsapp"></i></div>
            <div>
                <div class="contact-item__label">WhatsApp</div>
                <a href="https://wa.me/${siteData.whatsapp}" target="_blank" class="contact-item__value">Написать в WhatsApp</a>
            </div>
        </div>
        <div class="contact-item">
            <div class="contact-item__icon"><i class="fas fa-envelope"></i></div>
            <div>
                <div class="contact-item__label">Email</div>
                <a href="mailto:${siteData.email || 'info@kolya-auto.ru'}" class="contact-item__value">${siteData.email || 'info@kolya-auto.ru'}</a>
            </div>
        </div>
    `;

    // Map
    document.getElementById('contactsMap').innerHTML = `
        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2245.0!2d37.6173!3d55.7558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTXCsDQ1JzIxLjAiTiAzN8KwMzcnMDIuMyJF!5e0!3m2!1sru!2sru!4v1600000000000" allowfullscreen="" loading="lazy"></iframe>
    `;

    // Footer
    document.getElementById('footerText').textContent = `© ${new Date().getFullYear()} ${siteData.name}. Все права защищены.`;
    document.getElementById('footerSocials').innerHTML = (siteData.socials || []).map(s => `
        <a href="${s.url}" target="_blank" aria-label="${s.name}"><i class="${s.icon}"></i></a>
    `).join('');

    // Form category select
    const catSelect = document.getElementById('category');
    catSelect.innerHTML = '<option value="">Выберите категорию</option>' + 
        (siteData.categories || []).map(c => `<option value="${c.name}">${c.name}</option>`).join('');

    // Initialize scroll animations
    initScrollAnimations();
}

// ===== Reviews Slider =====
function initReviews() {
    const reviews = siteData.reviews || [];
    reviewsCount = reviews.length;
    if (reviewsCount === 0) return;

    const track = document.getElementById('reviewsTrack');
    track.innerHTML = reviews.map(r => `
        <div class="review-card">
            <div class="review-card__inner">
                <div class="review-card__stars">${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}</div>
                <p class="review-card__text">"${r.text}"</p>
                <div class="review-card__author">${r.author}</div>
            </div>
        </div>
    `).join('');

    // Dots
    const dots = document.getElementById('sliderDots');
    dots.innerHTML = reviews.map((_, i) => `<button class="slider__dot ${i === 0 ? 'active' : ''}" data-index="${i}"></button>`).join('');

    // Buttons
    document.getElementById('prevReview').onclick = () => changeReview(-1);
    document.getElementById('nextReview').onclick = () => changeReview(1);

    // Dots click
    dots.querySelectorAll('.slider__dot').forEach(dot => {
        dot.onclick = () => {
            currentReview = parseInt(dot.dataset.index);
            updateReviewSlider();
        };
    });

    // Auto slide
    startAutoSlide();
}

function changeReview(dir) {
    currentReview = (currentReview + dir + reviewsCount) % reviewsCount;
    updateReviewSlider();
    startAutoSlide();
}

function updateReviewSlider() {
    const track = document.getElementById('reviewsTrack');
    track.style.transform = `translateX(-${currentReview * 100}%)`;
    document.querySelectorAll('.slider__dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentReview);
    });
}

function startAutoSlide() {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => {
        currentReview = (currentReview + 1) % reviewsCount;
        updateReviewSlider();
    }, 5000);
}

// ===== Gallery & Lightbox =====
function initGallery() {
    galleryImages = siteData.gallery || [];
    if (galleryImages.length === 0) return;

    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = galleryImages.map((img, i) => `
        <div class="gallery__item reveal" data-index="${i}">
            <img src="${img}" alt="Галерея ${i + 1}" loading="lazy">
        </div>
    `).join('');

    grid.querySelectorAll('.gallery__item').forEach(item => {
        item.onclick = () => openLightbox(parseInt(item.dataset.index));
    });

    // Lightbox controls
    document.getElementById('lightboxClose').onclick = closeLightbox;
    document.getElementById('lightboxPrev').onclick = () => navigateLightbox(-1);
    document.getElementById('lightboxNext').onclick = () => navigateLightbox(1);

    document.addEventListener('keydown', (e) => {
        const lb = document.getElementById('lightbox');
        if (!lb.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });
}

function openLightbox(index) {
    currentLightboxIndex = index;
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    img.src = galleryImages[currentLightboxIndex];
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = '';
}

function navigateLightbox(dir) {
    currentLightboxIndex = (currentLightboxIndex + dir + galleryImages.length) % galleryImages.length;
    document.getElementById('lightboxImg').src = galleryImages[currentLightboxIndex];
}

// ===== Mobile Menu =====
function initMobileMenu() {
    const burger = document.getElementById('burgerBtn');
    const nav = document.getElementById('nav');

    burger.onclick = () => {
        burger.classList.toggle('active');
        nav.classList.toggle('open');
        document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    };

    // Close on link click
    nav.querySelectorAll('.nav__link').forEach(link => {
        link.onclick = () => {
            burger.classList.remove('active');
            nav.classList.remove('open');
            document.body.style.overflow = '';
        };
    });
}

// ===== Header scroll effect =====
function initHeaderScroll() {
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('header--scrolled', window.scrollY > 50);
    });
}

// ===== Scroll animations =====
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ===== Form validation =====
function initForm() {
    const form = document.getElementById('bookingForm');
    if (!form) return;

    form.onsubmit = (e) => {
        e.preventDefault();
        let isValid = true;

        const name = document.getElementById('name');
        const phone = document.getElementById('phone');

        // Name validation
        if (name.value.trim().length < 2) {
            name.classList.add('error');
            document.getElementById('nameError').textContent = 'Введите имя (минимум 2 символа)';
            isValid = false;
        } else {
            name.classList.remove('error');
            document.getElementById('nameError').textContent = '';
        }

        // Phone validation
        const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,6}$/;
        if (!phoneRegex.test(phone.value.trim()) || phone.value.trim().length < 10) {
            phone.classList.add('error');
            document.getElementById('phoneError').textContent = 'Введите корректный номер телефона';
            isValid = false;
        } else {
            phone.classList.remove('error');
            document.getElementById('phoneError').textContent = '';
        }

        if (isValid) {
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            const category = document.getElementById('category').value || 'не выбрана';
            const message = document.getElementById('message').value.trim() || '—';
            const whatsappMessage = encodeURIComponent(
                `Здравствуйте! Хочу записаться на обучение.\nИмя: ${name.value.trim()}\nТелефон: ${phone.value.trim()}\nКатегория: ${category}\nСообщение: ${message}`
            );

            btn.textContent = 'Отправка...';
            btn.disabled = true;

            if (siteData && siteData.whatsapp) {
                window.open(`https://wa.me/${siteData.whatsapp}?text=${whatsappMessage}`, '_blank');
            }

            const success = document.createElement('div');
            success.className = 'form__success';
            success.textContent = 'Заявка подготовлена. Открылся WhatsApp для отправки сообщения.';
            form.appendChild(success);

            btn.textContent = originalText;
            btn.disabled = false;
            form.reset();
            setTimeout(() => success.remove(), 5000);
        }
    };

    // Real-time validation
    document.getElementById('name').oninput = function() {
        if (this.value.trim().length >= 2) {
            this.classList.remove('error');
            document.getElementById('nameError').textContent = '';
        }
    };

    document.getElementById('phone').oninput = function() {
        if (this.value.trim().length >= 10) {
            this.classList.remove('error');
            document.getElementById('phoneError').textContent = '';
        }
    };
}

// ===== Smooth scroll for anchor links =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== Active nav link on scroll =====
function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ===== Initialize everything on DOM ready =====
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initMobileMenu();
    initHeaderScroll();
    initForm();
    initSmoothScroll();
    initActiveNav();
});