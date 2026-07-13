// ============================================
// FOZ TALENTOS - FRONTEND INTERACTIONS
// ============================================
// Versão: 1.0.0
// Data: 13/07/2026
// ============================================

(function() {
    'use strict';

    // ============================================
    // 1. MENU MOBILE
    // ============================================
    const MobileMenu = {
        init() {
            const menuToggle = document.querySelector('.menu-toggle');
            const mobileMenu = document.querySelector('.mobile-menu');
            const overlay = document.querySelector('.menu-overlay');

            if (!menuToggle || !mobileMenu) return;

            // Abrir/Fechar menu
            menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu(mobileMenu, overlay);
            });

            // Fechar ao clicar no overlay
            if (overlay) {
                overlay.addEventListener('click', () => {
                    this.closeMenu(mobileMenu, overlay);
                });
            }

            // Fechar ao clicar em um link do menu
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMenu(mobileMenu, overlay);
                });
            });

            // Fechar com tecla ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeMenu(mobileMenu, overlay);
                }
            });

            // Fechar ao redimensionar para desktop
            window.addEventListener('resize', () => {
                if (window.innerWidth >= 992) {
                    this.closeMenu(mobileMenu, overlay);
                }
            });
        },

        toggleMenu(menu, overlay) {
            const isOpen = menu.classList.contains('active');
            if (isOpen) {
                this.closeMenu(menu, overlay);
            } else {
                this.openMenu(menu, overlay);
            }
        },

        openMenu(menu, overlay) {
            menu.classList.add('active');
            menu.style.display = 'block';
            setTimeout(() => {
                menu.style.transform = 'translateX(0)';
                menu.style.opacity = '1';
            }, 10);
            if (overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        },

        closeMenu(menu, overlay) {
            menu.style.transform = 'translateX(-100%)';
            menu.style.opacity = '0';
            setTimeout(() => {
                menu.classList.remove('active');
                menu.style.display = 'none';
            }, 300);
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    // ============================================
    // 2. SUBMENU DROPDOWN
    // ============================================
    const DropdownMenu = {
        init() {
            // Dropdown em desktop
            document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    const parent = toggle.closest('.dropdown');
                    if (!parent) return;
                    const menu = parent.querySelector('.dropdown-menu');
                    if (!menu) return;

                    // Fechar outros dropdowns
                    document.querySelectorAll('.dropdown.open').forEach(d => {
                        if (d !== parent) {
                            d.classList.remove('open');
                            d.querySelector('.dropdown-menu').style.display = 'none';
                        }
                    });

                    const isOpen = parent.classList.contains('open');
                    if (isOpen) {
                        parent.classList.remove('open');
                        menu.style.display = 'none';
                    } else {
                        parent.classList.add('open');
                        menu.style.display = 'block';
                        menu.style.position = 'absolute';
                        menu.style.top = '100%';
                        menu.style.left = '0';
                        menu.style.zIndex = '1000';
                    }
                });
            });

            // Fechar dropdown ao clicar fora
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.dropdown')) {
                    document.querySelectorAll('.dropdown.open').forEach(d => {
                        d.classList.remove('open');
                        const menu = d.querySelector('.dropdown-menu');
                        if (menu) menu.style.display = 'none';
                    });
                }
            });

            // Dropdown hover em desktop
            if (window.innerWidth >= 992) {
                document.querySelectorAll('.dropdown').forEach(dropdown => {
                    dropdown.addEventListener('mouseenter', () => {
                        const menu = dropdown.querySelector('.dropdown-menu');
                        if (menu) {
                            menu.style.display = 'block';
                            menu.style.position = 'absolute';
                            menu.style.top = '100%';
                            menu.style.left = '0';
                            menu.style.zIndex = '1000';
                        }
                    });
                    dropdown.addEventListener('mouseleave', () => {
                        const menu = dropdown.querySelector('.dropdown-menu');
                        if (menu) {
                            menu.style.display = 'none';
                        }
                    });
                });
            }
        }
    };

    // ============================================
    // 3. CARROSSEL / SLIDER
    // ============================================
    const Carousel = {
        init(container) {
            const carousel = document.querySelector(container || '.carousel');
            if (!carousel) return;

            const slides = carousel.querySelectorAll('.carousel-slide');
            const dots = carousel.querySelectorAll('.carousel-dot');
            const prevBtn = carousel.querySelector('.carousel-prev');
            const nextBtn = carousel.querySelector('.carousel-next');
            let currentIndex = 0;
            let interval = null;
            const autoplay = carousel.dataset.autoplay !== 'false';
            const delay = parseInt(carousel.dataset.delay) || 5000;

            if (slides.length === 0) return;

            // Função para ir para um slide específico
            const goToSlide = (index) => {
                if (index < 0) index = slides.length - 1;
                if (index >= slides.length) index = 0;
                currentIndex = index;

                slides.forEach((slide, i) => {
                    slide.classList.toggle('active', i === index);
                    slide.style.display = i === index ? 'block' : 'none';
                });

                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === index);
                });
            };

            // Próximo slide
            const nextSlide = () => {
                goToSlide(currentIndex + 1);
            };

            // Slide anterior
            const prevSlide = () => {
                goToSlide(currentIndex - 1);
            };

            // Iniciar autoplay
            const startAutoplay = () => {
                if (autoplay && slides.length > 1) {
                    if (interval) clearInterval(interval);
                    interval = setInterval(nextSlide, delay);
                }
            };

            // Parar autoplay
            const stopAutoplay = () => {
                if (interval) {
                    clearInterval(interval);
                    interval = null;
                }
            };

            // Eventos dos botões
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    stopAutoplay();
                    prevSlide();
                    startAutoplay();
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    stopAutoplay();
                    nextSlide();
                    startAutoplay();
                });
            }

            // Eventos dos dots
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    stopAutoplay();
                    goToSlide(index);
                    startAutoplay();
                });
            });

            // Pausar no hover
            carousel.addEventListener('mouseenter', stopAutoplay);
            carousel.addEventListener('mouseleave', startAutoplay);

            // Inicializar
            goToSlide(0);
            startAutoplay();

            // Expor métodos
            carousel.goToSlide = goToSlide;
            carousel.nextSlide = nextSlide;
            carousel.prevSlide = prevSlide;
            carousel.startAutoplay = startAutoplay;
            carousel.stopAutoplay = stopAutoplay;

            return carousel;
        }
    };

    // ============================================
    // 4. VALIDAÇÃO DE FORMULÁRIOS
    // ============================================
    const FormValidator = {
        init() {
            document.querySelectorAll('form[validate]').forEach(form => {
                form.addEventListener('submit', (e) => {
                    if (!this.validate(form)) {
                        e.preventDefault();
                        return false;
                    }
                });

                // Validação em tempo real
                form.querySelectorAll('input, select, textarea').forEach(input => {
                    input.addEventListener('blur', () => {
                        this.validateField(input);
                    });
                    input.addEventListener('input', () => {
                        if (input.classList.contains('error')) {
                            this.validateField(input);
                        }
                    });
                });
            });
        },

        validate(form) {
            let isValid = true;
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

            inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isValid = false;
                }
            });

            return isValid;
        },

        validateField(input) {
            const value = input.value.trim();
            const errorElement = this.getErrorElement(input);
            let isValid = true;
            let message = '';

            // Remover erro anterior
            input.classList.remove('error');
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }

            // Validação por tipo
            if (input.required && !value) {
                isValid = false;
                message = 'Este campo é obrigatório.';
            } else if (value) {
                const type = input.dataset.validate || input.type;
                switch (type) {
                    case 'email':
                        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                            isValid = false;
                            message = 'Digite um e-mail válido.';
                        }
                        break;
                    case 'cpf':
                        if (!this.validateCPF(value)) {
                            isValid = false;
                            message = 'Digite um CPF válido.';
                        }
                        break;
                    case 'phone':
                        if (!/^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/.test(value)) {
                            isValid = false;
                            message = 'Digite um telefone válido.';
                        }
                        break;
                    case 'password':
                        if (value.length < 6) {
                            isValid = false;
                            message = 'A senha deve ter pelo menos 6 caracteres.';
                        }
                        break;
                    case 'confirm-password':
                        const password = input.form.querySelector('[name="password"]');
                        if (password && value !== password.value) {
                            isValid = false;
                            message = 'As senhas não coincidem.';
                        }
                        break;
                    case 'number':
                        if (isNaN(value) || value < 0) {
                            isValid = false;
                            message = 'Digite um número válido.';
                        }
                        break;
                    case 'date':
                        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
                            isValid = false;
                            message = 'Digite uma data válida (DD/MM/AAAA).';
                        }
                        break;
                    case 'url':
                        try {
                            new URL(value);
                        } catch {
                            isValid = false;
                            message = 'Digite uma URL válida.';
                        }
                        break;
                    case 'minlength':
                        const min = parseInt(input.dataset.min);
                        if (value.length < min) {
                            isValid = false;
                            message = `Mínimo de ${min} caracteres.`;
                        }
                        break;
                    case 'maxlength':
                        const max = parseInt(input.dataset.max);
                        if (value.length > max) {
                            isValid = false;
                            message = `Máximo de ${max} caracteres.`;
                        }
                        break;
                }
            }

            // Mostrar erro
            if (!isValid) {
                input.classList.add('error');
                if (errorElement) {
                    errorElement.textContent = message;
                    errorElement.style.display = 'block';
                } else {
                    // Fallback: criar elemento de erro
                    const error = document.createElement('small');
                    error.className = 'error-message text-danger';
                    error.textContent = message;
                    error.style.display = 'block';
                    input.parentNode.appendChild(error);
                }
            }

            return isValid;
        },

        validateCPF(cpf) {
            cpf = cpf.replace(/[^\d]/g, '');
            if (cpf.length !== 11) return false;
            if (/^(\d)\1+$/.test(cpf)) return false;

            let sum = 0;
            for (let i = 1; i <= 9; i++) {
                sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
            }
            let remainder = (sum * 10) % 11;
            if (remainder === 10 || remainder === 11) remainder = 0;
            if (remainder !== parseInt(cpf.substring(9, 10))) return false;

            sum = 0;
            for (let i = 1; i <= 10; i++) {
                sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
            }
            remainder = (sum * 10) % 11;
            if (remainder === 10 || remainder === 11) remainder = 0;
            if (remainder !== parseInt(cpf.substring(10, 11))) return false;

            return true;
        },

        getErrorElement(input) {
            const id = input.id + '-error';
            let error = document.getElementById(id);
            if (!error) {
                error = input.parentNode.querySelector('.error-message');
            }
            return error;
        }
    };

    // ============================================
    // 5. MÁSCARAS DE INPUT
    // ============================================
    const InputMask = {
        init() {
            document.querySelectorAll('.mask-cpf').forEach(input => {
                input.addEventListener('input', () => {
                    input.value = this.maskCPF(input.value);
                });
            });

            document.querySelectorAll('.mask-phone').forEach(input => {
                input.addEventListener('input', () => {
                    input.value = this.maskPhone(input.value);
                });
            });

            document.querySelectorAll('.mask-date').forEach(input => {
                input.addEventListener('input', () => {
                    input.value = this.maskDate(input.value);
                });
            });

            document.querySelectorAll('.mask-currency').forEach(input => {
                input.addEventListener('input', () => {
                    input.value = this.maskCurrency(input.value);
                });
            });

            document.querySelectorAll('.mask-cep').forEach(input => {
                input.addEventListener('input', () => {
                    input.value = this.maskCEP(input.value);
                });
            });
        },

        maskCPF(value) {
            return value.replace(/\D/g, '')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})/, '$1-$2')
                .replace(/(-\d{2})\d+?$/, '$1');
        },

        maskPhone(value) {
            value = value.replace(/\D/g, '');
            if (value.length <= 10) {
                return value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            } else {
                return value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            }
        },

        maskDate(value) {
            return value.replace(/\D/g, '')
                .replace(/(\d{2})(\d)/, '$1/$2')
                .replace(/(\d{2})(\d)/, '$1/$2')
                .replace(/(\d{4})\d+?$/, '$1');
        },

        maskCurrency(value) {
            value = value.replace(/\D/g, '');
            value = (parseInt(value) / 100).toFixed(2);
            return 'R$ ' + value.replace('.', ',');
        },

        maskCEP(value) {
            return value.replace(/\D/g, '')
                .replace(/(\d{5})(\d)/, '$1-$2')
                .replace(/(-\d{3})\d+?$/, '$1');
        }
    };

    // ============================================
    // 6. ACORDEÃO
    // ============================================
    const Accordion = {
        init() {
            document.querySelectorAll('.accordion').forEach(accordion => {
                const items = accordion.querySelectorAll('.accordion-item');
                const isMultiple = accordion.dataset.multiple === 'true';

                items.forEach(item => {
                    const header = item.querySelector('.accordion-header');
                    const body = item.querySelector('.accordion-body');

                    if (!header || !body) return;

                    header.addEventListener('click', () => {
                        const isOpen = item.classList.contains('active');

                        if (!isMultiple) {
                            // Fechar todos
                            items.forEach(i => {
                                i.classList.remove('active');
                                const b = i.querySelector('.accordion-body');
                                if (b) {
                                    b.style.maxHeight = '0';
                                    b.style.padding = '0 15px';
                                }
                            });
                        }

                        if (isOpen) {
                            item.classList.remove('active');
                            body.style.maxHeight = '0';
                            body.style.padding = '0 15px';
                        } else {
                            item.classList.add('active');
                            body.style.maxHeight = body.scrollHeight + 'px';
                            body.style.padding = '15px';
                        }
                    });
                });
            });
        }
    };

    // ============================================
    // 7. ABAS / TABS
    // ============================================
    const Tabs = {
        init() {
            document.querySelectorAll('.tabs').forEach(tabs => {
                const triggers = tabs.querySelectorAll('.tab-trigger');
                const contents = tabs.querySelectorAll('.tab-content');

                if (triggers.length === 0 || contents.length === 0) return;

                triggers.forEach((trigger, index) => {
                    trigger.addEventListener('click', () => {
                        // Remover ativos
                        triggers.forEach(t => t.classList.remove('active'));
                        contents.forEach(c => c.classList.remove('active'));

                        // Ativar
                        trigger.classList.add('active');
                        if (contents[index]) {
                            contents[index].classList.add('active');
                        }
                    });
                });

                // Ativar primeira aba
                if (triggers[0]) triggers[0].classList.add('active');
                if (contents[0]) contents[0].classList.add('active');
            });
        }
    };

    // ============================================
    // 8. TOOLTIP
    // ============================================
    const Tooltip = {
        init() {
            document.querySelectorAll('[data-tooltip]').forEach(element => {
                const tooltipText = element.dataset.tooltip;
                let tooltipEl = null;

                const showTooltip = (e) => {
                    if (tooltipEl) return;
                    tooltipEl = document.createElement('div');
                    tooltipEl.className = 'tooltip-custom';
                    tooltipEl.textContent = tooltipText;
                    tooltipEl.style.cssText = `
                        position: fixed;
                        background: #333;
                        color: #fff;
                        padding: 6px 12px;
                        border-radius: 6px;
                        font-size: 12px;
                        z-index: 9999;
                        pointer-events: none;
                        opacity: 0;
                        transition: opacity 0.2s;
                        max-width: 250px;
                        text-align: center;
                        white-space: nowrap;
                    `;
                    document.body.appendChild(tooltipEl);

                    const rect = element.getBoundingClientRect();
                    tooltipEl.style.left = (rect.left + rect.width / 2 - tooltipEl.offsetWidth / 2) + 'px';
                    tooltipEl.style.top = (rect.top - tooltipEl.offsetHeight - 8) + 'px';
                    tooltipEl.style.opacity = '1';
                };

                const hideTooltip = () => {
                    if (tooltipEl) {
                        tooltipEl.remove();
                        tooltipEl = null;
                    }
                };

                element.addEventListener('mouseenter', showTooltip);
                element.addEventListener('mouseleave', hideTooltip);
                element.addEventListener('click', hideTooltip);
            });
        }
    };

    // ============================================
    // 9. MODAL
    // ============================================
    const Modal = {
        init() {
            // Abrir modais
            document.querySelectorAll('[data-modal-open]').forEach(trigger => {
                trigger.addEventListener('click', () => {
                    const modalId = trigger.dataset.modalOpen;
                    const modal = document.getElementById(modalId);
                    if (modal) this.open(modal);
                });
            });

            // Fechar modais
            document.querySelectorAll('[data-modal-close]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const modal = btn.closest('.modal');
                    if (modal) this.close(modal);
                });
            });

            // Fechar ao clicar no overlay
            document.querySelectorAll('.modal').forEach(modal => {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        this.close(modal);
                    }
                });
            });

            // Fechar com ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    document.querySelectorAll('.modal.active').forEach(modal => {
                        this.close(modal);
                    });
                }
            });
        },

        open(modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            document.body.style.overflow = 'hidden';

            // Animação de entrada
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.style.transform = 'scale(0.9)';
                content.style.opacity = '0';
                setTimeout(() => {
                    content.style.transform = 'scale(1)';
                    content.style.opacity = '1';
                }, 10);
            }
        },

        close(modal) {
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.style.transform = 'scale(0.9)';
                content.style.opacity = '0';
            }
            setTimeout(() => {
                modal.classList.remove('active');
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }, 200);
        }
    };

    // ============================================
    // 10. SCROLL ANIMATIONS
    // ============================================
    const ScrollAnimation = {
        init() {
            const elements = document.querySelectorAll('[data-animate]');
            if (elements.length === 0) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const animation = el.dataset.animate;
                        const delay = parseInt(el.dataset.delay) || 0;

                        setTimeout(() => {
                            el.classList.add('animated', animation);
                        }, delay);

                        observer.unobserve(el);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            elements.forEach(el => observer.observe(el));
        }
    };

    // ============================================
    // 11. BACK TO TOP
    // ============================================
    const BackToTop = {
        init() {
            const btn = document.getElementById('back-to-top');
            if (!btn) return;

            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    btn.classList.add('visible');
                    btn.style.display = 'flex';
                } else {
                    btn.classList.remove('visible');
                    btn.style.display = 'none';
                }
            });

            btn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    };

    // ============================================
    // 12. COUNTER ANIMATION
    // ============================================
    const Counter = {
        init() {
            document.querySelectorAll('[data-counter]').forEach(counter => {
                const target = parseInt(counter.dataset.counter);
                const duration = parseInt(counter.dataset.duration) || 2000;
                const suffix = counter.dataset.suffix || '';
                const prefix = counter.dataset.prefix || '';
                let current = 0;
                const step = Math.ceil(target / (duration / 16));

                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.animate(counter, target, current, step, suffix, prefix);
                            observer.unobserve(counter);
                        }
                    });
                });

                observer.observe(counter);
            });
        },

        animate(element, target, current, step, suffix, prefix) {
            if (current >= target) {
                element.textContent = prefix + target + suffix;
                return;
            }

            current += step;
            if (current > target) current = target;
            element.textContent = prefix + current + suffix;

            requestAnimationFrame(() => {
                this.animate(element, target, current, step, suffix, prefix);
            });
        }
    };

    // ============================================
    // 13. FILTRO DE VAGAS (frontend apenas)
    // ============================================
    const JobFilter = {
        init() {
            const container = document.querySelector('.jobs-grid');
            const searchInput = document.getElementById('search-jobs');
            const filters = document.querySelectorAll('.job-filter');

            if (!container) return;

            const filterJobs = () => {
                const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
                const activeFilters = {};

                filters.forEach(filter => {
                    if (filter.value && filter.value !== '') {
                        const key = filter.dataset.filter || filter.name;
                        activeFilters[key] = filter.value;
                    }
                });

                const items = container.querySelectorAll('.job-item');
                let visibleCount = 0;

                items.forEach(item => {
                    let show = true;

                    // Busca por texto
                    if (searchTerm) {
                        const text = item.textContent.toLowerCase();
                        if (!text.includes(searchTerm)) show = false;
                    }

                    // Filtros
                    if (show && activeFilters.city) {
                        const city = item.dataset.city || '';
                        if (!city.toLowerCase().includes(activeFilters.city.toLowerCase())) show = false;
                    }

                    if (show && activeFilters.type) {
                        const type = item.dataset.type || '';
                        if (type !== activeFilters.type) show = false;
                    }

                    if (show && activeFilters.modality) {
                        const modality = item.dataset.modality || '';
                        if (modality !== activeFilters.modality) show = false;
                    }

                    if (show && activeFilters.area) {
                        const area = item.dataset.area || '';
                        if (!area.toLowerCase().includes(activeFilters.area.toLowerCase())) show = false;
                    }

                    item.style.display = show ? '' : 'none';
                    if (show) visibleCount++;
                });

                // Mostrar mensagem de nenhum resultado
                const noResults = container.querySelector('.no-results');
                if (noResults) {
                    noResults.style.display = visibleCount === 0 ? '' : 'none';
                }
            };

            // Eventos
            if (searchInput) {
                searchInput.addEventListener('input', Utils.debounce(filterJobs, 300));
            }

            filters.forEach(filter => {
                filter.addEventListener('change', filterJobs);
                filter.addEventListener('input', filterJobs);
            });

            // Botão limpar filtros
            document.querySelector('.clear-filters')?.addEventListener('click', () => {
                filters.forEach(f => f.value = '');
                if (searchInput) searchInput.value = '';
                filterJobs();
            });
        }
    };

    // ============================================
    // 14. UTILITÁRIOS (debounce, etc)
    // ============================================
    const Utils = {
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Máscaras
        maskCPF(value) {
            return value.replace(/\D/g, '')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})/, '$1-$2')
                .replace(/(-\d{2})\d+?$/, '$1');
        },

        maskPhone(value) {
            value = value.replace(/\D/g, '');
            if (value.length <= 10) {
                return value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
            } else {
                return value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            }
        },

        maskDate(value) {
            return value.replace(/\D/g, '')
                .replace(/(\d{2})(\d)/, '$1/$2')
                .replace(/(\d{2})(\d)/, '$1/$2')
                .replace(/(\d{4})\d+?$/, '$1');
        },

        maskCurrency(value) {
            value = value.replace(/\D/g, '');
            value = (parseInt(value) / 100).toFixed(2);
            return 'R$ ' + value.replace('.', ',');
        }
    };

    // ============================================
    // 15. INICIALIZAÇÃO
    // ============================================
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 Foz Talentos - Frontend Iniciado');

        // Inicializar todos os módulos
        MobileMenu.init();
        DropdownMenu.init();
        Carousel.init('.carousel');
        FormValidator.init();
        InputMask.init();
        Accordion.init();
        Tabs.init();
        Tooltip.init();
        Modal.init();
        ScrollAnimation.init();
        BackToTop.init();
        Counter.init();
        JobFilter.init();

        console.log('✅ Foz Talentos - Frontend Pronto!');
    });

})();
           
