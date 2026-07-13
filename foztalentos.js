// ============================================
// SISTEMA FOZ TALENTOS - JAVASCRIPT COMPLETO
// ============================================
// Versão: 1.0.0
// Data: 13/07/2026
// ============================================

// ============================================
// 1. CONFIGURAÇÃO GLOBAL
// ============================================

const APP_CONFIG = {
    ENV: window.location.hostname === 'localhost' ? 'development' : 'production',
    API: {
        development: 'http://localhost:3000/api',
        production: 'https://foztalentos.com.br/api'
    },
    INTEGRATIONS: {
        googleMapsKey: 'SUA_CHAVE_GOOGLE_MAPS',
        analyticsId: 'UA-XXXXXXXXX-X',
        captchaKey: 'SUA_CHAVE_RECAPTCHA'
    },
    SYSTEM: {
        maxFileSize: 5 * 1024 * 1024,
        allowedFileTypes: ['application/pdf'],
        sessionTimeout: 3600000,
        paginationLimit: 10,
        uploadPath: '/uploads/resumes/'
    },
    MESSAGES: {
        success: {
            login: 'Login realizado com sucesso!',
            register: 'Cadastro realizado com sucesso!',
            apply: 'Candidatura realizada com sucesso!',
            save: 'Dados salvos com sucesso!',
            delete: 'Registro excluído com sucesso!'
        },
        error: {
            login: 'E-mail ou senha inválidos.',
            register: 'Erro ao realizar cadastro.',
            apply: 'Erro ao candidatar-se à vaga.',
            save: 'Erro ao salvar dados.',
            delete: 'Erro ao excluir registro.',
            fileSize: 'Arquivo muito grande. Máximo 5MB.',
            fileType: 'Formato de arquivo não permitido. Use PDF.',
            network: 'Erro de conexão com o servidor.'
        },
        confirm: {
            delete: 'Tem certeza que deseja excluir este registro?',
            logout: 'Tem certeza que deseja sair?'
        }
    }
};

APP_CONFIG.currentApiUrl = APP_CONFIG.API[APP_CONFIG.ENV];

// ============================================
// 2. UTILITÁRIOS
// ============================================

const Utils = {
    validateCPF(cpf) {
        cpf = cpf.replace(/[^\d]/g, '');
        if (cpf.length !== 11) return false;
        if (/^(\d)\1+$/.test(cpf)) return false;
        
        let sum = 0, remainder;
        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
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

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    validatePhone(phone) {
        return /^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/.test(phone);
    },

    formatDate(date) {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    generateSlug(text) {
        return text.toString().toLowerCase().trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    },

    maskCPF(value) {
        return value.replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    },

    maskPhone(value) {
        return value.replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    },

    maskDate(value) {
        return value.replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '$1/$2')
            .replace(/(\d{2})(\d)/, '$1/$2')
            .replace(/(\d{4})\d+?$/, '$1');
    },

    validateFileSize(file) {
        return file.size <= APP_CONFIG.SYSTEM.maxFileSize;
    },

    validateFileType(file) {
        return APP_CONFIG.SYSTEM.allowedFileTypes.includes(file.type);
    },

    handleFileUpload(input, previewElement) {
        const file = input.files[0];
        if (!file) return null;
        if (!this.validateFileType(file)) {
            alert(APP_CONFIG.MESSAGES.error.fileType);
            input.value = '';
            return null;
        }
        if (!this.validateFileSize(file)) {
            alert(APP_CONFIG.MESSAGES.error.fileSize);
            input.value = '';
            return null;
        }
        if (previewElement) {
            const reader = new FileReader();
            reader.onload = (e) => { previewElement.src = e.target.result; };
            reader.readAsDataURL(file);
        }
        return file;
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => { clearTimeout(timeout); func(...args); };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    showLoading(container) {
        if (!container) return;
        container.innerHTML = `
            <div class="loading-spinner text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
            </div>
        `;
    },

    hideLoading(container) {
        if (container) container.innerHTML = '';
    },

    showToast(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0 show`;
        toast.role = 'alert';
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    },

    getStatusBadge(status) {
        const badges = {
            'curriculo_recebido': 'secondary',
            'triagem': 'info',
            'entrevista': 'warning',
            'testes': 'primary',
            'encaminhado_cliente': 'success',
            'aprovado': 'success',
            'banco_talentos': 'dark',
            'reprovado': 'danger'
        };
        return badges[status] || 'secondary';
    },

    getStatusLabel(status) {
        const labels = {
            'curriculo_recebido': '📄 Currículo Recebido',
            'triagem': '🔍 Triagem',
            'entrevista': '🗣️ Entrevista',
            'testes': '📝 Testes',
            'encaminhado_cliente': '🤝 Encaminhado Cliente',
            'aprovado': '✅ Aprovado',
            'banco_talentos': '📚 Banco de Talentos',
            'reprovado': '❌ Reprovado'
        };
        return labels[status] || status;
    }
};

// ============================================
// 3. API CLIENT
// ============================================

class ApiClient {
    constructor() {
        this.baseUrl = APP_CONFIG.currentApiUrl;
        this.token = localStorage.getItem('auth_token');
    }

    getHeaders() {
        const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
        if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
        return headers;
    }

    handleError(error) {
        console.error('API Error:', error);
        let message = APP_CONFIG.MESSAGES.error.network;
        if (error.response) {
            const status = error.response.status;
            if (status === 401) {
                message = 'Sessão expirada. Faça login novamente.';
                this.clearToken();
                if (!window.location.pathname.includes('/login.html')) {
                    window.location.href = '/login.html';
                }
            } else if (status === 403) message = 'Você não tem permissão para esta ação.';
            else if (status === 404) message = 'Recurso não encontrado.';
            else if (status === 422) {
                const data = error.response.data;
                message = data.errors ? Object.values(data.errors).flat().join('\n') : 'Dados inválidos.';
            } else if (status === 500) message = 'Erro interno do servidor.';
        }
        Utils.showToast(message, 'error');
        return { error: true, message };
    }

    async request(method, endpoint, data = null, isFormData = false) {
        try {
            const options = {
                method,
                headers: this.getHeaders()
            };

            if (data) {
                if (isFormData) {
                    delete options.headers['Content-Type'];
                    options.body = data;
                } else {
                    options.body = JSON.stringify(data);
                }
            }

            const response = await fetch(`${this.baseUrl}${endpoint}`, options);
            
            if (!response.ok) {
                const error = new Error('HTTP Error');
                error.response = { status: response.status, data: await response.json().catch(() => ({})) };
                throw error;
            }

            return await response.json();
        } catch (error) {
            return this.handleError(error);
        }
    }

    get(endpoint) { return this.request('GET', endpoint); }
    post(endpoint, data) { return this.request('POST', endpoint, data); }
    put(endpoint, data) { return this.request('PUT', endpoint, data); }
    delete(endpoint) { return this.request('DELETE', endpoint); }
    upload(endpoint, data) { return this.request('POST', endpoint, data, true); }

    setToken(token) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    isAuthenticated() { return !!this.token; }
}

// ============================================
// 4. AUTENTICAÇÃO
// ============================================

class Auth {
    constructor() {
        this.currentUser = null;
        this.userType = null;
        this.initialize();
    }

    async initialize() {
        if (api.isAuthenticated()) await this.loadUserData();
        this.setupLoginForm();
        this.setupRegisterForm();
        this.setupLogoutButton();
        this.setupForgotPasswordForm();
        this.updateUI();
    }

    async loadUserData() {
        try {
            const response = await api.get('/auth/me');
            if (!response.error) {
                this.currentUser = response.data;
                this.userType = response.data.userType;
                this.updateUI();
                return true;
            }
        } catch (error) {
            api.clearToken();
            return false;
        }
    }

    async login(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.error) {
                Utils.showToast(response.message, 'error');
                return false;
            }
            api.setToken(response.token);
            this.currentUser = response.user;
            this.userType = response.user.userType;
            Utils.showToast(APP_CONFIG.MESSAGES.success.login, 'success');
            this.updateUI();
            setTimeout(() => this.redirectAfterLogin(), 1000);
            return true;
        } catch (error) {
            Utils.showToast(APP_CONFIG.MESSAGES.error.login, 'error');
            return false;
        }
    }

    async registerCandidate(data) {
        if (!Utils.validateCPF(data.cpf)) {
            Utils.showToast('CPF inválido.', 'error');
            return false;
        }
        if (!Utils.validateEmail(data.email)) {
            Utils.showToast('E-mail inválido.', 'error');
            return false;
        }
        try {
            const response = await api.post('/auth/register/candidate', data);
            if (response.error) {
                Utils.showToast(response.message, 'error');
                return false;
            }
            Utils.showToast(APP_CONFIG.MESSAGES.success.register, 'success');
            return true;
        } catch (error) {
            Utils.showToast(APP_CONFIG.MESSAGES.error.register, 'error');
            return false;
        }
    }

    async registerCompany(data) {
        if (!Utils.validateEmail(data.email)) {
            Utils.showToast('E-mail inválido.', 'error');
            return false;
        }
        try {
            const response = await api.post('/auth/register/company', data);
            if (response.error) {
                Utils.showToast(response.message, 'error');
                return false;
            }
            Utils.showToast(APP_CONFIG.MESSAGES.success.register, 'success');
            return true;
        } catch (error) {
            Utils.showToast(APP_CONFIG.MESSAGES.error.register, 'error');
            return false;
        }
    }

    async forgotPassword(email) {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            if (response.error) {
                Utils.showToast(response.message, 'error');
                return false;
            }
            Utils.showToast('Link de recuperação enviado para seu e-mail.', 'success');
            return true;
        } catch (error) {
            Utils.showToast('Erro ao enviar link de recuperação.', 'error');
            return false;
        }
    }

    async resetPassword(token, password) {
        try {
            const response = await api.post('/auth/reset-password', { token, password });
            if (response.error) {
                Utils.showToast(response.message, 'error');
                return false;
            }
            Utils.showToast('Senha alterada com sucesso!', 'success');
            return true;
        } catch (error) {
            Utils.showToast('Erro ao resetar senha.', 'error');
            return false;
        }
    }

    logout() {
        if (!confirm(APP_CONFIG.MESSAGES.confirm.logout)) return;
        api.clearToken();
        this.currentUser = null;
        this.userType = null;
        Utils.showToast('Logout realizado com sucesso.', 'success');
        this.updateUI();
        setTimeout(() => window.location.href = '/', 1000);
    }

    redirectAfterLogin() {
        const redirects = {
            'candidate': '/area-candidato.html',
            'company': '/area-empresa.html',
            'admin': '/painel-admin.html'
        };
        window.location.href = redirects[this.userType] || '/';
    }

    updateUI() {
        const isLoggedIn = !!this.currentUser;
        document.querySelectorAll('.logged-in').forEach(el => el.style.display = isLoggedIn ? '' : 'none');
        document.querySelectorAll('.logged-out').forEach(el => el.style.display = isLoggedIn ? 'none' : '');
        
        if (isLoggedIn) {
            const nameEl = document.getElementById('user-name');
            if (nameEl) nameEl.textContent = this.currentUser.name || this.currentUser.companyName;
            const avatarEl = document.getElementById('user-avatar');
            if (avatarEl) avatarEl.src = this.currentUser.avatar || '/assets/img/default-avatar.png';
        }
    }

    setupLoginForm() {
        const form = document.getElementById('login-form');
        if (!form) return;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            await this.login(email, password);
        });
    }

    setupRegisterForm() {
        const form = document.getElementById('register-form');
        if (!form) return;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            const userType = document.getElementById('user-type')?.value || 'candidate';
            const success = userType === 'candidate' ? await this.registerCandidate(data) : await this.registerCompany(data);
            if (success) form.reset();
        });
    }

    setupForgotPasswordForm() {
        const form = document.getElementById('forgot-password-form');
        if (!form) return;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value;
            await this.forgotPassword(email);
        });
    }

    setupLogoutButton() {
        document.querySelectorAll('.logout-btn').forEach(btn => {
            btn.addEventListener('click', () => this.logout());
        });
    }
}

// ============================================
// 5. GESTÃO DE VAGAS
// ============================================

class JobManager {
    constructor() {
        this.currentJob = null;
        this.jobs = [];
        this.filters = {};
        this.initialize();
    }

    async initialize() {
        await this.loadJobs();
        this.setupSearch();
        this.setupFilters();
        this.setupPagination();
        this.setupJobForm();
        this.setupApplyButtons();
    }

    async loadJobs(filters = {}) {
        const container = document.getElementById('jobs-container');
        if (container) Utils.showLoading(container);
        
        try {
            const queryString = new URLSearchParams(filters).toString();
            const endpoint = `/jobs${queryString ? '?' + queryString : ''}`;
            const response = await api.get(endpoint);
            
            if (!response.error) {
                this.jobs = response.data;
                this.renderJobs(this.jobs);
                this.updatePagination(response.meta);
            }
        } catch (error) {
            console.error('Error loading jobs:', error);
        } finally {
            if (container) Utils.hideLoading(container);
        }
    }

    renderJobs(jobs) {
        const container = document.getElementById('jobs-container');
        if (!container) return;

        if (!jobs || jobs.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h4>Nenhuma vaga encontrada</h4>
                    <p class="text-muted">Tente ajustar os filtros de busca</p>
                </div>
            `;
            return;
        }

        container.innerHTML = jobs.map(job => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card job-card h-100 shadow-sm hover-shadow">
                    <div class="card-body">
                        <h5 class="job-title card-title">${job.title}</h5>
                        <h6 class="job-company text-primary">${job.company?.name || 'Empresa'}</h6>
                        <div class="job-location text-muted small">
                            <i class="fas fa-map-marker-alt"></i> ${job.city || ''}${job.state ? ' - ' + job.state : ''}
                        </div>
                        <div class="job-salary text-success mt-2 fw-bold">
                            ${job.salary ? Utils.formatCurrency(job.salary) : 'A combinar'}
                        </div>
                        <div class="job-tags mt-2">
                            <span class="badge bg-info me-1">${job.contractType || 'CLT'}</span>
                            <span class="badge bg-secondary">${job.modality || 'Presencial'}</span>
                        </div>
                        <p class="job-description card-text mt-3 small">${(job.description || '').substring(0, 150)}...</p>
                        <div class="job-date text-muted small">Publicado em ${Utils.formatDate(job.publishedAt)}</div>
                    </div>
                    <div class="card-footer bg-transparent border-top-0">
                        <button class="btn btn-primary w-100 apply-btn" data-job-id="${job.id}">
                            <i class="fas fa-paper-plane me-1"></i> Candidatar-se
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        this.setupApplyButtons();
    }

    setupApplyButtons() {
        document.querySelectorAll('.apply-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const jobId = btn.dataset.jobId;
                await this.applyToJob(jobId);
            });
        });
    }

    async applyToJob(jobId) {
        if (!api.isAuthenticated()) {
            Utils.showToast('Faça login para se candidatar.', 'warning');
            window.location.href = '/login.html';
            return;
        }
        try {
            const response = await api.post(`/jobs/${jobId}/apply`);
            if (!response.error) {
                Utils.showToast(APP_CONFIG.MESSAGES.success.apply, 'success');
            }
        } catch (error) {
            Utils.showToast(APP_CONFIG.MESSAGES.error.apply, 'error');
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('search-jobs');
        if (!searchInput) return;
        const debouncedSearch = Utils.debounce((value) => {
            this.filters.search = value;
            this.loadJobs(this.filters);
        }, 500);
        searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
    }

    setupFilters() {
        document.querySelectorAll('.job-filter').forEach(filter => {
            filter.addEventListener('change', (e) => {
                const key = e.target.dataset.filter;
                const value = e.target.value;
                if (value && value !== '') this.filters[key] = value;
                else delete this.filters[key];
                this.loadJobs(this.filters);
            });
        });
    }

    setupPagination() {
        const container = document.getElementById('pagination');
        if (!container) return;
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.page-link');
            if (!btn) return;
            e.preventDefault();
            const page = btn.dataset.page;
            if (page) {
                this.filters.page = page;
                this.loadJobs(this.filters);
            }
        });
    }

    updatePagination(meta) {
        const container = document.getElementById('pagination');
        if (!container || !meta || meta.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '<ul class="pagination justify-content-center">';
        html += `<li class="page-item ${meta.currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${meta.currentPage - 1}">Anterior</a></li>`;
        for (let i = 1; i <= meta.totalPages; i++) {
            html += `<li class="page-item ${i === meta.currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
        }
        html += `<li class="page-item ${meta.currentPage === meta.totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${meta.currentPage + 1}">Próximo</a></li>`;
        html += '</ul>';
        container.innerHTML = html;
    }

    setupJobForm() {
        const form = document.getElementById('job-form');
        if (!form) return;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            data.salary = parseFloat(data.salary) || null;
            data.benefits = data.benefits ? data.benefits.split(',').map(b => b.trim()) : [];
            
            const jobId = document.getElementById('job-id')?.value;
            const response = jobId ? await api.put(`/jobs/${jobId}`, data) : await api.post('/jobs', data);
            
            if (!response.error) {
                Utils.showToast('Vaga salva com sucesso!', 'success');
                form.reset();
                this.loadJobs(this.filters);
            }
        });
    }

    async loadJobForEdit(jobId) {
        try {
            const response = await api.get(`/jobs/${jobId}`);
            if (!response.error) {
                const job = response.data;
                const form = document.getElementById('job-form');
                if (!form) return;
                Object.keys(job).forEach(key => {
                    const input = form.querySelector(`[name="${key}"]`);
                    if (input) {
                        if (key === 'benefits' && Array.isArray(job[key])) {
                            input.value = job[key].join(', ');
                        } else {
                            input.value = job[key];
                        }
                    }
                });
                document.getElementById('job-id').value = jobId;
            }
        } catch (error) {
            console.error('Error loading job:', error);
        }
    }

    async deleteJob(jobId) {
        if (!confirm(APP_CONFIG.MESSAGES.confirm.delete)) return;
        try {
            const response = await api.delete(`/jobs/${jobId}`);
            if (!response.error) {
                Utils.showToast('Vaga excluída com sucesso!', 'success');
                this.loadJobs(this.filters);
            }
        } catch (error) {
            Utils.showToast(APP_CONFIG.MESSAGES.error.delete, 'error');
        }
    }
}

// ============================================
// 6. SISTEMA ATS
// ============================================

class ATS {
    constructor() {
        this.currentJob = null;
        this.candidates = [];
        this.statuses = [
            'curriculo_recebido', 'triagem', 'entrevista', 'testes',
            'encaminhado_cliente', 'aprovado', 'banco_talentos', 'reprovado'
        ];
        this.initialize();
    }

    async initialize() {
        this.setupKanban();
        this.setupSearch();
        this.setupFilters();
        this.setupCandidateModal();
        if (document.getElementById('ats-container')) {
            await this.loadCandidates();
        }
    }

    async loadCandidates(jobId = null) {
        try {
            const endpoint = jobId ? `/ats/jobs/${jobId}/candidates` : '/ats/candidates';
            const response = await api.get(endpoint);
            if (!response.error) {
                this.candidates = response.data;
                this.renderKanban(this.candidates);
            }
        } catch (error) {
            console.error('Error loading candidates:', error);
        }
    }

    renderKanban(candidates) {
        const container = document.getElementById('ats-container');
        if (!container) return;

        const grouped = {};
        this.statuses.forEach(status => {
            grouped[status] = candidates.filter(c => c.status === status);
        });

        let html = '<div class="row ats-kanban g-3">';
        this.statuses.forEach(status => {
            const items = grouped[status] || [];
            html += `
                <div class="col-md-3 mb-4">
                    <div class="card ats-column h-100">
                        <div class="card-header bg-light d-flex justify-content-between align-items-center">
                            <h6 class="mb-0">${Utils.getStatusLabel(status)}</h6>
                            <span class="badge bg-secondary">${items.length}</span>
                        </div>
                        <div class="card-body ats-items p-2" data-status="${status}">
                            ${items.map(c => this.renderCandidateCard(c)).join('')}
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;

        this.setupDragAndDrop();
        this.setupViewButtons();
    }

    renderCandidateCard(candidate) {
        return `
            <div class="ats-item card mb-2 shadow-sm" draggable="true" data-candidate-id="${candidate.id}">
                <div class="card-body p-2">
                    <div class="d-flex justify-content-between align-items-start">
                        <h6 class="mb-1 text-truncate" style="max-width:120px">${candidate.name}</h6>
                        <button class="btn btn-sm btn-outline-primary view-candidate" data-id="${candidate.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    <p class="small text-muted mb-1 text-truncate">
                        <i class="fas fa-briefcase"></i> ${candidate.experience || 'Não informado'}
                    </p>
                    <p class="small text-muted mb-0 text-truncate">
                        <i class="fas fa-map-marker-alt"></i> ${candidate.city || ''}
                    </p>
                    ${candidate.notes ? `<p class="small text-truncate mb-0"><i class="fas fa-comment"></i> ${candidate.notes}</p>` : ''}
                </div>
            </div>
        `;
    }

    setupDragAndDrop() {
        document.querySelectorAll('.ats-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('candidateId', item.dataset.candidateId);
                item.classList.add('dragging');
            });
            item.addEventListener('dragend', (e) => item.classList.remove('dragging'));
        });

        document.querySelectorAll('.ats-items').forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.classList.add('drag-over');
            });
            column.addEventListener('dragleave', (e) => column.classList.remove('drag-over'));
            column.addEventListener('drop', async (e) => {
                e.preventDefault();
                column.classList.remove('drag-over');
                const candidateId = e.dataTransfer.getData('candidateId');
                const newStatus = column.dataset.status;
                if (candidateId && newStatus) {
                    await this.updateCandidateStatus(candidateId, newStatus);
                }
            });
        });
    }

    async updateCandidateStatus(candidateId, newStatus) {
        try {
            const response = await api.put(`/ats/candidates/${candidateId}/status`, { status: newStatus });
            if (!response.error) {
                Utils.showToast('Status atualizado com sucesso!', 'success');
                await this.loadCandidates(this.currentJob);
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }

    async addNote(candidateId, note) {
        try {
            const response = await api.post(`/ats/candidates/${candidateId}/notes`, { note });
            if (!response.error) {
                Utils.showToast('Observação adicionada!', 'success');
                await this.loadCandidates(this.currentJob);
            }
        } catch (error) {
            console.error('Error adding note:', error);
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('search-candidates');
        if (!searchInput) return;
        const debouncedSearch = Utils.debounce(async (value) => {
            const response = await api.get(`/ats/candidates?search=${value}`);
            if (!response.error) {
                this.candidates = response.data;
                this.renderKanban(this.candidates);
            }
        }, 500);
        searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
    }

    setupFilters() {
        document.querySelectorAll('.ats-filter').forEach(filter => {
            filter.addEventListener('change', async () => {
                const params = new URLSearchParams();
                document.querySelectorAll('.ats-filter').forEach(f => {
                    if (f.value) params.append(f.name, f.value);
                });
                const response = await api.get(`/ats/candidates?${params.toString()}`);
                if (!response.error) {
                    this.candidates = response.data;
                    this.renderKanban(this.candidates);
                }
            });
        });
    }

    setupViewButtons() {
        document.querySelectorAll('.view-candidate').forEach(btn => {
            btn.addEventListener('click', () => {
                const candidateId = btn.dataset.id;
                this.showCandidateDetails(candidateId);
            });
        });
    }

    async showCandidateDetails(candidateId) {
        try {
            const response = await api.get(`/ats/candidates/${candidateId}`);
            if (!response.error) {
                const candidate = response.data;
                const modal = document.getElementById('candidate-modal');
                if (!modal) return;

                document.getElementById('candidate-name').textContent = candidate.name;
                document.getElementById('candidate-email').textContent = candidate.email;
                document.getElementById('candidate-phone').textContent = candidate.phone || 'Não informado';
                document.getElementById('candidate-experience').textContent = candidate.experience || 'Não informado';
                document.getElementById('candidate-skills').textContent = candidate.skills || 'Não informado';
                document.getElementById('candidate-status').textContent = Utils.getStatusLabel(candidate.status);

                const historyContainer = document.getElementById('candidate-history');
                if (candidate.history && candidate.history.length > 0) {
                    historyContainer.innerHTML = candidate.history.map(h => `
                        <div class="history-item border-bottom py-2">
                            <small class="text-muted">${Utils.formatDate(h.date)}</small>
                            <p class="mb-1">${h.action}</p>
                            ${h.note ? `<p class="small text-muted mb-0">${h.note}</p>` : ''}
                        </div>
                    `).join('');
                } else {
                    historyContainer.innerHTML = '<p class="text-muted">Nenhum histórico disponível.</p>';
                }

                const noteBtn = document.getElementById('add-note-btn');
                if (noteBtn) {
                    noteBtn.onclick = () => {
                        const note = prompt('Digite a observação:');
                        if (note) this.addNote(candidateId, note);
                    };
                }

                const statusSelect = document.getElementById('change-status');
                if (statusSelect) {
                    statusSelect.innerHTML = this.statuses.map(s => `
                        <option value="${s}" ${s === candidate.status ? 'selected' : ''}>
                            ${Utils.getStatusLabel(s)}
                        </option>
                    `).join('');
                    statusSelect.onchange = async (e) => {
                        await this.updateCandidateStatus(candidateId, e.target.value);
                        await this.showCandidateDetails(candidateId);
                    };
                }

                // Abrir modal com Bootstrap
                if (typeof bootstrap !== 'undefined') {
                    const modalInstance = new bootstrap.Modal(modal);
                    modalInstance.show();
                } else {
                    modal.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Error loading candidate details:', error);
        }
    }

    setupCandidateModal() {
        document.addEventListener('click', async (e) => {
            const btn = e.target.closest('.view-candidate');
            if (btn) {
                e.preventDefault();
                const candidateId = btn.dataset.id;
                await this.showCandidateDetails(candidateId);
            }
        });
    }
}

// ============================================
// 7. PAINEL ADMINISTRATIVO
// ============================================

class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.data = {};
        this.initialize();
    }

    async initialize() {
        if (!api.isAuthenticated() || auth.userType !== 'admin') {
            window.location.href = '/';
            return;
        }
        this.setupNavigation();
        this.loadDashboardData();
        this.setupModals();
    }

    setupNavigation() {
        document.querySelectorAll('.nav-link[data-section]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
            });
        });
    }

    showSection(section) {
        document.querySelectorAll('.admin-section').forEach(el => el.classList.add('d-none'));
        const target = document.getElementById(`section-${section}`);
        if (target) {
            target.classList.remove('d-none');
            this.currentSection = section;
            this.loadSectionData(section);
        }
    }

    async loadSectionData(section) {
        switch (section) {
            case 'dashboard': await this.loadDashboardData(); break;
            case 'companies': await this.loadCompanies(); break;
            case 'candidates': await this.loadCandidates(); break;
            case 'jobs': await this.loadJobs(); break;
            case 'users': await this.loadUsers(); break;
        }
    }

    async loadDashboardData() {
        try {
            const response = await api.get('/admin/dashboard');
            if (!response.error) {
                this.data = response.data;
                document.getElementById('total-jobs').textContent = this.data.totalJobs || 0;
                document.getElementById('total-candidates').textContent = this.data.totalCandidates || 0;
                document.getElementById('total-companies').textContent = this.data.totalCompanies || 0;
                document.getElementById('total-applications').textContent = this.data.totalApplications || 0;
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    async loadCompanies() {
        try {
            const response = await api.get('/admin/companies');
            if (!response.error) {
                const table = document.getElementById('companies-table');
                if (table) {
                    table.innerHTML = response.data.map(c => `
                        <tr>
                            <td>${c.id}</td>
                            <td>${c.name}</td>
                            <td>${c.email}</td>
                            <td>${c.phone || '-'}</td>
                            <td>${c.jobs_count || 0}</td>
                            <td>
                                <button class="btn btn-sm btn-primary edit-company" data-id="${c.id}"><i class="fas fa-edit"></i></button>
                                <button class="btn btn-sm btn-danger delete-company" data-id="${c.id}"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error loading companies:', error);
        }
    }

    async loadCandidates() {
        try {
            const response = await api.get('/admin/candidates');
            if (!response.error) {
                const table = document.getElementById('candidates-table');
                if (table) {
                    table.innerHTML = response.data.map(c => `
                        <tr>
                            <td>${c.id}</td>
                            <td>${c.name}</td>
                            <td>${c.email}</td>
                            <td>${c.phone || '-'}</td>
                            <td>${c.city || '-'}</td>
                            <td>
                                <button class="btn btn-sm btn-success download-resume" data-id="${c.id}"><i class="fas fa-download"></i></button>
                                <button class="btn btn-sm btn-danger delete-candidate" data-id="${c.id}"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error loading candidates:', error);
        }
    }

    async loadJobs() {
        try {
            const response = await api.get('/admin/jobs');
            if (!response.error) {
                const table = document.getElementById('jobs-table');
                if (table) {
                    table.innerHTML = response.data.map(j => `
                        <tr>
                            <td>${j.id}</td>
                            <td>${j.title}</td>
                            <td>${j.company_name}</td>
                            <td>${j.city} - ${j.state}</td>
                            <td>
                                <span class="badge ${j.is_active ? 'bg-success' : 'bg-danger'}">
                                    ${j.is_active ? 'Ativa' : 'Encerrada'}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-primary edit-job" data-id="${j.id}"><i class="fas fa-edit"></i></button>
                                <button class="btn btn-sm btn-warning toggle-job" data-id="${j.id}"><i class="fas ${j.is_active ? 'fa-pause' : 'fa-play'}"></i></button>
                                <button class="btn btn-sm btn-danger delete-job" data-id="${j.id}"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error loading jobs:', error);
        }
    }

    async loadUsers() {
        try {
            const response = await api.get('/admin/users');
            if (!response.error) {
                const table = document.getElementById('users-table');
                if (table) {
                    table.innerHTML = response.data.map(u => `
                        <tr>
                            <td>${u.id}</td>
                            <td>${u.name}</td>
                            <td>${u.email}</td>
                            <td>
                                <span class="badge bg-${u.user_type === 'admin' ? 'danger' : u.user_type === 'company' ? 'primary' : 'success'}">
                                    ${u.user_type}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-warning edit-user" data-id="${u.id}"><i class="fas fa-edit"></i></button>
                                ${u.user_type !== 'admin' ? `<button class="btn btn-sm btn-danger delete-user" data-id="${u.id}"><i class="fas fa-trash"></i></button>` : ''}
                            </td>
                        </tr>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    setupModals() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            if (target.classList.contains('edit-job')) {
                const id = target.dataset.id;
                if (window.jobManager) jobManager.loadJobForEdit(id);
            }
            if (target.classList.contains('delete-job')) {
                const id = target.dataset.id;
                if (window.jobManager) jobManager.deleteJob(id);
            }
            if (target.classList.contains('toggle-job')) {
                const id = target.dataset.id;
                this.toggleJobStatus(id);
            }
            if (target.classList.contains('delete-company')) {
                this.deleteCompany(target.dataset.id);
            }
            if (target.classList.contains('delete-candidate')) {
                this.deleteCandidate(target.dataset.id);
            }
            if (target.classList.contains('download-resume')) {
                this.downloadResume(target.dataset.id);
            }
        });
    }

    async toggleJobStatus(jobId) {
        try {
            const response = await api.put(`/admin/jobs/${jobId}/toggle`);
            if (!response.error) {
                Utils.showToast('Status da vaga alterado!', 'success');
                this.loadJobs();
            }
        } catch (error) {
            console.error('Error toggling job:', error);
        }
    }

    async deleteCompany(companyId) {
        if (!confirm(APP_CONFIG.MESSAGES.confirm.delete)) return;
        try {
            const response = await api.delete(`/admin/companies/${companyId}`);
            if (!response.error) {
                Utils.showToast('Empresa excluída com sucesso!', 'success');
                this.loadCompanies();
            }
        } catch (error) {
            console.error('Error deleting company:', error);
        }
    }

    async deleteCandidate(candidateId) {
        if (!confirm(APP_CONFIG.MESSAGES.confirm.delete)) return;
        try {
            const response = await api.delete(`/admin/candidates/${candidateId}`);
            if (!response.error) {
                Utils.showToast('Candidato excluído com sucesso!', 'success');
                this.loadCandidates();
            }
        } catch (error) {
            console.error('Error deleting candidate:', error);
        }
    }

    async downloadResume(candidateId) {
        try {
            window.open(`${api.baseUrl}/admin/candidates/${candidateId}/resume`, '_blank');
        } catch (error) {
            console.error('Error downloading resume:', error);
        }
    }
}

// ============================================
// 8. DASHBOARD DO CANDIDATO E EMPRESA
// ============================================

class Dashboard {
    constructor() {
        this.userType = auth.userType;
        this.initialize();
    }

    async initialize() {
        if (this.userType === 'candidate') await this.loadCandidateDashboard();
        else if (this.userType === 'company') await this.loadCompanyDashboard();
    }

    async loadCandidateDashboard() {
        try {
            const response = await api.get('/candidate/dashboard');
            if (!response.error) {
                const data = response.data;
                const elements = {
                    'candidate-name': data.name,
                    'candidate-email': data.email,
                    'candidate-phone': data.phone || 'Não informado',
                    'total-applications': data.totalApplications || 0,
                    'active-applications': data.activeApplications || 0
                };
                Object.keys(elements).forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.textContent = elements[id];
                });

                const list = document.getElementById('recent-applications');
                if (list && data.recentApplications) {
                    list.innerHTML = data.recentApplications.map(app => `
                        <div class="application-item border-bottom py-2">
                            <h6>${app.jobTitle}</h6>
                            <p class="text-muted small">${app.companyName}</p>
                            <span class="badge bg-${Utils.getStatusBadge(app.status)}">${app.status}</span>
                            <small class="text-muted float-end">${Utils.formatDate(app.date)}</small>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error loading candidate dashboard:', error);
        }
    }

    async loadCompanyDashboard() {
        try {
            const response = await api.get('/company/dashboard');
            if (!response.error) {
                const data = response.data;
                const elements = {
                    'company-name': data.name,
                    'company-email': data.email,
                    'company-phone': data.phone || 'Não informado',
                    'total-jobs': data.totalJobs || 0,
                    'total-applications': data.totalApplications || 0,
                    'total-candidates': data.totalCandidates || 0
                };
                Object.keys(elements).forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.textContent = elements[id];
                });

                const list = document.getElementById('recent-jobs');
                if (list && data.recentJobs) {
                    list.innerHTML = data.recentJobs.map(job => `
                        <div class="job-item border-bottom py-2">
                            <h6>${job.title}</h6>
                            <span class="badge bg-${job.is_active ? 'success' : 'danger'}">${job.is_active ? 'Ativa' : 'Encerrada'}</span>
                            <small class="text-muted float-end">${Utils.formatDate(job.createdAt)}</small>
                            <p class="small text-muted mb-0">${job.applications || 0} candidaturas</p>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error loading company dashboard:', error);
        }
    }
}

// ============================================
// 9. SISTEMA DE FILTROS
// ============================================

class FilterSystem {
    constructor() {
        this.filters = {};
        this.initialize();
    }

    initialize() {
        this.setupFilters();
        this.setupAutocomplete();
        this.setupRangeSlider();
        this.setupTagFilters();
    }

    setupFilters() {
        document.querySelectorAll('.filter-group').forEach(group => {
            const inputs = group.querySelectorAll('input, select');
            const applyBtn = group.querySelector('.apply-filters');
            const clearBtn = group.querySelector('.clear-filters');

            if (applyBtn) {
                applyBtn.addEventListener('click', () => {
                    this.collectFilters(group);
                    this.applyFilters();
                });
            }
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    inputs.forEach(input => input.value = '');
                    this.filters = {};
                    this.applyFilters();
                });
            }
            inputs.forEach(input => {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.addEventListener('change', () => {
                        this.collectFilters(group);
                        this.applyFilters();
                    });
                }
            });
        });
    }

    collectFilters(group) {
        const inputs = group.querySelectorAll('input, select');
        const filterData = {};
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                if (input.checked) {
                    if (!filterData[input.name]) filterData[input.name] = [];
                    filterData[input.name].push(input.value);
                }
            } else if (input.type === 'radio') {
                if (input.checked) filterData[input.name] = input.value;
            } else if (input.value && input.value !== '') {
                filterData[input.name] = input.value;
            }
        });
        this.filters = { ...this.filters, ...filterData };
        return this.filters;
    }

    applyFilters() {
        const queryString = new URLSearchParams();
        Object.keys(this.filters).forEach(key => {
            const value = this.filters[key];
            if (Array.isArray(value)) {
                value.forEach(v => queryString.append(`${key}[]`, v));
            } else {
                queryString.append(key, value);
            }
        });
        const event = new CustomEvent('filters-applied', {
            detail: { filters: this.filters, queryString: queryString.toString() }
        });
        document.dispatchEvent(event);
    }

    setupAutocomplete() {
        document.querySelectorAll('.autocomplete-input').forEach(input => {
            const datalist = document.getElementById(input.dataset.datalist);
            if (!datalist) return;
            input.addEventListener('input', async (e) => {
                const value = e.target.value;
                if (value.length < 2) return;
                const endpoint = input.dataset.endpoint || '/search/autocomplete';
                const response = await api.get(`${endpoint}?q=${value}&type=${input.dataset.type}`);
                if (!response.error) {
                    datalist.innerHTML = response.data.map(item => `<option value="${item}">`).join('');
                }
            });
        });
    }

    setupRangeSlider() {
        document.querySelectorAll('.range-slider').forEach(slider => {
            const minInput = slider.querySelector('.range-min');
            const maxInput = slider.querySelector('.range-max');
            const minDisplay = slider.querySelector('.range-min-display');
            const maxDisplay = slider.querySelector('.range-max-display');

            if (minInput && maxInput) {
                minInput.addEventListener('input', () => {
                    if (minDisplay) minDisplay.textContent = Utils.formatCurrency(parseFloat(minInput.value));
                    if (parseFloat(minInput.value) > parseFloat(maxInput.value)) {
                        maxInput.value = minInput.value;
                        if (maxDisplay) maxDisplay.textContent = Utils.formatCurrency(parseFloat(maxInput.value));
                    }
                });
                maxInput.addEventListener('input', () => {
                    if (maxDisplay) maxDisplay.textContent = Utils.formatCurrency(parseFloat(maxInput.value));
                    if (parseFloat(maxInput.value) < parseFloat(minInput.value)) {
                        minInput.value = maxInput.value;
                        if (minDisplay) minDisplay.textContent = Utils.formatCurrency(parseFloat(minInput.value));
                    }
                });
            }
        });
    }

    setupTagFilters() {
        const container = document.querySelector('.tag-filters');
        if (!container) return;
        container.addEventListener('click', (e) => {
            const tag = e.target.closest('.tag');
            if (!tag) return;
            tag.classList.toggle('active');
            const activeTags = document.querySelectorAll('.tag.active');
            this.filters.tags = Array.from(activeTags).map(t => t.dataset.value);
            this.applyFilters();
        });
    }
}

// ============================================
// 10. FUNÇÕES DE INTEGRAÇÃO
// ============================================

function initIntegrations() {
    // WhatsApp
    const whatsappBtn = document.getElementById('whatsapp-button');
    if (whatsappBtn) {
        const phone = '5545999999999';
        whatsappBtn.href = `https://wa.me/${phone}`;
    }

    // Google Analytics
    if (APP_CONFIG.INTEGRATIONS.analyticsId && typeof gtag !== 'undefined') {
        gtag('config', APP_CONFIG.INTEGRATIONS.analyticsId);
    }

    // Google Maps
    const mapElement = document.getElementById('google-map');
    if (mapElement && typeof google !== 'undefined') {
        const map = new google.maps.Map(mapElement, {
            center: { lat: -25.5407, lng: -54.5813 },
            zoom: 15,
            styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }]
        });
        new google.maps.Marker({
            position: { lat: -25.5407, lng: -54.5813 },
            map: map,
            title: 'Foz Talentos'
        });
    }

    // reCAPTCHA
    document.querySelectorAll('.g-recaptcha').forEach(el => {
        if (typeof grecaptcha !== 'undefined') {
            grecaptcha.render(el, {
                sitekey: APP_CONFIG.INTEGRATIONS.captchaKey,
                theme: 'light'
            });
        }
    });
}

// ============================================
// 11. EVENTOS GLOBAIS
// ============================================

function setupGlobalEvents() {
    // Smooth scroll para âncoras
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Botão voltar ao topo
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('show', window.scrollY > 300);
        });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Máscaras de input
    document.querySelectorAll('.mask-cpf').forEach(input => {
        input.addEventListener('input', (e) => e.target.value = Utils.maskCPF(e.target.value));
    });
    document.querySelectorAll('.mask-phone').forEach(input => {
        input.addEventListener('input', (e) => e.target.value = Utils.maskPhone(e.target.value));
    });
    document.querySelectorAll('.mask-date').forEach(input => {
        input.addEventListener('input', (e) => e.target.value = Utils.maskDate(e.target.value));
    });

    // Filtros aplicados event
    document.addEventListener('filters-applied', (e) => {
        console.log('Filtros aplicados:', e.detail);
    });
}

// ============================================
// 12. INICIALIZAÇÃO PRINCIPAL
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Foz Talentos - Sistema Iniciado');

    // Instanciar API
    window.api = new ApiClient();
    
    // Instanciar Autenticação
    window.auth = new Auth();
    
    // Instanciar Gerenciador de Vagas
    window.jobManager = new JobManager();
    
    // Instanciar ATS
    window.ats = new ATS();
    
    // Instanciar Painel Admin
    window.adminPanel = new AdminPanel();
    
    // Instanciar Dashboard
    window.dashboard = new Dashboard();
    
    // Instanciar Filtros
    window.filters = new FilterSystem();

    // Configurar eventos
    setupGlobalEvents();
    
    // Inicializar integrações
    initIntegrations();

    // Exportar para uso global
    window.FozTalentos = {
        config: APP_CONFIG,
        api: window.api,
        auth: window.auth,
        utils: Utils,
        modules: {
            jobs: window.jobManager,
            ats: window.ats,
            admin: window.adminPanel,
            dashboard: window.dashboard,
            filters: window.filters
        }
    };

    console.log('✅ Foz Talentos - Sistema Pronto!');
});

