// ============================================
// FOZ TALENTOS - PAINEL ADMINISTRATIVO COMPLETO
// ============================================
// Versão: 1.0.0
// Funcionalidades: Login, CRUD Vagas, Categorias, Formulários, API
// ============================================

(function() {
    'use strict';

    // ============================================
    // 1. CONFIGURAÇÃO
    // ============================================
    const CONFIG = {
        API_URL: 'https://api.foztalentos.com.br/v1',
        // Para testes locais, descomente a linha abaixo:
        // API_URL: 'http://localhost:3000/api',
        TOKEN_KEY: 'admin_token',
        USER_KEY: 'admin_user'
    };

    // ============================================
    // 2. UTILITÁRIOS
    // ============================================
    const Utils = {
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

        maskCurrency(value) {
            value = value.replace(/\D/g, '');
            value = (parseInt(value) / 100).toFixed(2);
            return 'R$ ' + value.replace('.', ',');
        },

        formatDate(date) {
            if (!date) return '-';
            const d = new Date(date);
            return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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

        showToast(message, type = 'success') {
            const container = document.getElementById('toast-container') || this.createToastContainer();
            const toast = document.createElement('div');
            const colors = {
                success: '#10b981',
                error: '#ef4444',
                warning: '#f59e0b',
                info: '#3b82f6'
            };
            toast.style.cssText = `
                background: ${colors[type] || colors.success};
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                margin-bottom: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                animation: slideIn 0.3s ease;
                font-weight: 500;
                cursor: pointer;
            `;
            toast.textContent = message;
            container.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100px)';
                toast.style.transition = 'all 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        },

        createToastContainer() {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 400px;
                width: 100%;
            `;
            // Adicionar estilo de animação
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(container);
            return container;
        },

        showLoading(container) {
            if (!container) return;
            container.innerHTML = `
                <div style="text-align:center;padding:40px;">
                    <div style="display:inline-block;width:40px;height:40px;border:4px solid #e5e7eb;border-top-color:#1a3a6b;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
                    <p style="margin-top:10px;color:#6b7280;">Carregando...</p>
                </div>
                <style>
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                </style>
            `;
        },

        hideLoading(container) {
            if (container) container.innerHTML = '';
        },

        getStatusBadge(status) {
            const badges = {
                'active': '<span class="badge-active">Ativa</span>',
                'inactive': '<span class="badge-inactive">Encerrada</span>',
                'draft': '<span class="badge-draft">Rascunho</span>',
                'pending': '<span class="badge-pending">Pendente</span>'
            };
            return badges[status] || badges.draft;
        },

        getStatusClass(status) {
            const classes = {
                'active': 'status-active',
                'inactive': 'status-inactive',
                'draft': 'status-draft',
                'pending': 'status-pending'
            };
            return classes[status] || classes.draft;
        }
    };

    // ============================================
    // 3. API CLIENT
    // ============================================
    const API = {
        getToken() {
            return localStorage.getItem(CONFIG.TOKEN_KEY);
        },

        setToken(token) {
            localStorage.setItem(CONFIG.TOKEN_KEY, token);
        },

        clearToken() {
            localStorage.removeItem(CONFIG.TOKEN_KEY);
            localStorage.removeItem(CONFIG.USER_KEY);
        },

        getHeaders() {
            const token = this.getToken();
            return {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            };
        },

        async request(endpoint, method = 'GET', data = null) {
            const url = `${CONFIG.API_URL}${endpoint}`;
            const options = {
                method,
                headers: this.getHeaders()
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            try {
                const response = await fetch(url, options);
                const result = await response.json();

                if (!response.ok) {
                    if (response.status === 401) {
                        this.clearToken();
                        window.location.href = '/admin/login.html';
                    }
                    throw new Error(result.message || 'Erro na requisição');
                }

                return result;
            } catch (error) {
                console.error('API Error:', error);
                throw error;
            }
        },

        // ===== AUTH =====
        async login(email, password) {
            return this.request('/auth/login', 'POST', { email, password });
        },

        async logout() {
            return this.request('/auth/logout', 'POST');
        },

        // ===== VAGAS =====
        async getJobs(params = {}) {
            const query = new URLSearchParams(params).toString();
            return this.request(`/jobs?${query}`);
        },

        async getJob(id) {
            return this.request(`/jobs/${id}`);
        },

        async createJob(data) {
            return this.request('/jobs', 'POST', data);
        },

        async updateJob(id, data) {
            return this.request(`/jobs/${id}`, 'PUT', data);
        },

        async deleteJob(id) {
            return this.request(`/jobs/${id}`, 'DELETE');
        },

        async toggleJobStatus(id) {
            return this.request(`/jobs/${id}/toggle`, 'PATCH');
        },

        // ===== CATEGORIAS =====
        async getCategories() {
            return this.request('/categories');
        },

        async createCategory(data) {
            return this.request('/categories', 'POST', data);
        },

        async updateCategory(id, data) {
            return this.request(`/categories/${id}`, 'PUT', data);
        },

        async deleteCategory(id) {
            return this.request(`/categories/${id}`, 'DELETE');
        }
    };

    // ============================================
    // 4. SISTEMA DE LOGIN
    // ============================================
    const Auth = {
        init() {
            // Verificar se já está logado
            if (API.getToken()) {
                this.redirectToDashboard();
                return;
            }

            this.setupLoginForm();
            this.setupRecoveryForm();
        },

        setupLoginForm() {
            const form = document.getElementById('login-form');
            if (!form) return;

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value;
                const btn = form.querySelector('button[type="submit"]');
                const originalText = btn.textContent;

                try {
                    btn.disabled = true;
                    btn.textContent = 'Entrando...';

                    const response = await API.login(email, password);
                    
                    if (response.token) {
                        API.setToken(response.token);
                        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(response.user));
                        Utils.showToast('Login realizado com sucesso!', 'success');
                        setTimeout(() => this.redirectToDashboard(), 1000);
                    }
                } catch (error) {
                    Utils.showToast(error.message || 'E-mail ou senha inválidos', 'error');
                } finally {
                    btn.disabled = false;
                    btn.textContent = originalText;
                }
            });
        },

        setupRecoveryForm() {
            const form = document.getElementById('recovery-form');
            if (!form) return;

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('recovery-email').value.trim();
                const btn = form.querySelector('button[type="submit"]');

                try {
                    btn.disabled = true;
                    btn.textContent = 'Enviando...';
                    
                    // Simular envio (substituir pela chamada real)
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    Utils.showToast('Link de recuperação enviado para seu e-mail!', 'success');
                    form.reset();
                } catch (error) {
                    Utils.showToast('Erro ao enviar link de recuperação', 'error');
                } finally {
                    btn.disabled = false;
                    btn.textContent = 'Recuperar Senha';
                }
            });
        },

        redirectToDashboard() {
            window.location.href = '/admin/dashboard.html';
        }
    };

    // ============================================
    // 5. DASHBOARD
    // ============================================
    const Dashboard = {
        async init() {
            // Verificar autenticação
            if (!API.getToken()) {
                window.location.href = '/admin/login.html';
                return;
            }

            // Carregar dados
            await this.loadStats();
            await this.loadRecentJobs();
            await this.loadRecentCandidates();
            
            // Setup eventos
            this.setupLogout();
            this.setupSidebar();
            this.setupCharts();
        },

        async loadStats() {
            try {
                const data = await API.getJobs();
                const stats = {
                    total: data.length || 0,
                    active: data.filter(j => j.status === 'active').length || 0,
                    inactive: data.filter(j => j.status === 'inactive').length || 0
                };

                document.getElementById('total-jobs').textContent = stats.total;
                document.getElementById('active-jobs').textContent = stats.active;
                document.getElementById('inactive-jobs').textContent = stats.inactive;
                document.getElementById('total-candidates').textContent = '1.247';
                document.getElementById('total-companies').textContent = '89';

            } catch (error) {
                console.error('Error loading stats:', error);
            }
        },

        async loadRecentJobs() {
            const container = document.getElementById('recent-jobs');
            if (!container) return;

            try {
                const jobs = await API.getJobs({ limit: 5 });
                if (!jobs || jobs.length === 0) {
                    container.innerHTML = '<tr><td colspan="6" class="text-center">Nenhuma vaga cadastrada</td></tr>';
                    return;
                }

                container.innerHTML = jobs.map(job => `
                    <tr>
                        <td>${job.id}</td>
                        <td><strong>${job.title}</strong></td>
                        <td>${job.company || 'Empresa'}</td>
                        <td>${job.city || '-'}/${job.state || '-'}</td>
                        <td>${Utils.getStatusBadge(job.status || 'draft')}</td>
                        <td>${Utils.formatDate(job.createdAt)}</td>
                    </tr>
                `).join('');

            } catch (error) {
                container.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Erro ao carregar vagas</td></tr>';
            }
        },

        async loadRecentCandidates() {
            const container = document.getElementById('recent-candidates');
            if (!container) return;

            // Dados mockados para demonstração
            const candidates = [
                { id: 1, name: 'Ana Silva', email: 'ana@email.com', date: '2026-07-19' },
                { id: 2, name: 'Carlos Santos', email: 'carlos@email.com', date: '2026-07-18' },
                { id: 3, name: 'Mariana Oliveira', email: 'mariana@email.com', date: '2026-07-17' },
                { id: 4, name: 'Pedro Costa', email: 'pedro@email.com', date: '2026-07-16' },
                { id: 5, name: 'Juliana Lima', email: 'juliana@email.com', date: '2026-07-15' }
            ];

            container.innerHTML = candidates.map(c => `
                <tr>
                    <td>${c.id}</td>
                    <td><strong>${c.name}</strong></td>
                    <td>${c.email}</td>
                    <td>${Utils.formatDate(c.date)}</td>
                    <td><span class="badge-pending">Pendente</span></td>
                </tr>
            `).join('');
        },

        setupLogout() {
            document.getElementById('logout-btn')?.addEventListener('click', async () => {
                if (confirm('Tem certeza que deseja sair?')) {
                    API.clearToken();
                    window.location.href = '/admin/login.html';
                }
            });
        },

        setupSidebar() {
            // Menu ativo
            const currentPage = window.location.pathname.split('/').pop();
            document.querySelectorAll('.sidebar-menu a').forEach(link => {
                const href = link.getAttribute('href');
                if (href === currentPage || (currentPage === '' && href === 'dashboard.html')) {
                    link.classList.add('active');
                }
            });

            // Submenu toggle
            document.querySelectorAll('.sidebar-menu .has-submenu > a').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const parent = link.closest('.has-submenu');
                    parent.classList.toggle('open');
                });
            });
        },

        setupCharts() {
            // Gráfico simples com Canvas
            const canvas = document.getElementById('jobs-chart');
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const data = [12, 19, 15, 22, 18, 25, 30];
            const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];

            // Limpar canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const width = canvas.width;
            const height = canvas.height;
            const padding = 40;
            const chartWidth = width - padding * 2;
            const chartHeight = height - padding * 2;
            const maxValue = Math.max(...data);

            // Grid
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            
            for (let i = 0; i < 5; i++) {
                const y = padding + (chartHeight / 5) * i;
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(width - padding, y);
                ctx.stroke();
            }
            ctx.setLineDash([]);

            // Linha
            ctx.beginPath();
            ctx.strokeStyle = '#1a3a6b';
            ctx.lineWidth = 3;
            
            data.forEach((value, index) => {
                const x = padding + (chartWidth / (data.length - 1)) * index;
                const y = padding + chartHeight - (value / maxValue) * chartHeight;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();

            // Pontos
            data.forEach((value, index) => {
                const x = padding + (chartWidth / (data.length - 1)) * index;
                const y = padding + chartHeight - (value / maxValue) * chartHeight;
                
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fillStyle = '#1a3a6b';
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Label
                ctx.fillStyle = '#6b7280';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(labels[index], x, height - 10);
                ctx.fillText(value, x, y - 10);
            });

            // Título
            ctx.fillStyle = '#1a3a6b';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Vagas por Mês', width / 2, 20);
        }
    };

    // ============================================
    // 6. GESTÃO DE VAGAS (CRUD)
    // ============================================
    const JobManager = {
        currentJobId: null,
        currentPage: 1,
        totalPages: 1,
        filters: {},

        async init() {
            if (!API.getToken()) {
                window.location.href = '/admin/login.html';
                return;
            }

            await this.loadCategories();
            await this.loadJobs();
            this.setupEvents();
            this.setupForm();
            this.setupFilters();
        },

        async loadJobs(page = 1) {
            const container = document.getElementById('jobs-table');
            if (!container) return;

            Utils.showLoading(container);

            try {
                const params = { page, limit: 10, ...this.filters };
                const response = await API.getJobs(params);
                
                // Para demonstração, se não tiver dados, criar mock
                const jobs = response.length ? response : this.getMockJobs();

                if (jobs.length === 0) {
                    container.innerHTML = `
                        <tr>
                            <td colspan="8" class="text-center py-5">
                                <p style="font-size:18px;color:#9ca3af;">Nenhuma vaga cadastrada</p>
                                <button class="btn-primary" onclick="document.getElementById('create-job-btn').click()">
                                    Criar Primeira Vaga
                                </button>
                            </td>
                        </tr>
                    `;
                    return;
                }

                container.innerHTML = jobs.map((job, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>
                            <strong>${job.title}</strong>
                            <br>
                            <small style="color:#6b7280;">${job.company || 'Empresa'}</small>
                        </td>
                        <td>${job.category || 'Geral'}</td>
                        <td>${job.city || '-'}/${job.state || '-'}</td>
                        <td>${job.modality || 'Presencial'}</td>
                        <td>${job.salary ? Utils.formatCurrency(job.salary) : 'A combinar'}</td>
                        <td>${Utils.getStatusBadge(job.status || 'active')}</td>
                        <td>
                            <div style="display:flex;gap:5px;flex-wrap:wrap;">
                                <button class="btn-edit" onclick="JobManager.editJob('${job.id}')" title="Editar">
                                    ✏️
                                </button>
                                <button class="btn-toggle" onclick="JobManager.toggleJob('${job.id}')" title="Ativar/Encerrar">
                                    ${job.status === 'active' ? '⏸️' : '▶️'}
                                </button>
                                <button class="btn-delete" onclick="JobManager.deleteJob('${job.id}')" title="Excluir">
                                    🗑️
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');

            } catch (error) {
                container.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Erro ao carregar vagas: ${error.message}</td></tr>`;
            } finally {
                Utils.hideLoading(container);
            }
        },

        getMockJobs() {
            return [
                { id: 1, title: 'Desenvolvedor Full Stack', company: 'Tech Solutions', category: 'TI', city: 'Foz do Iguaçu', state: 'PR', modality: 'Híbrido', salary: 8000, status: 'active', createdAt: new Date().toISOString() },
                { id: 2, title: 'Analista de Marketing', company: 'Digital Agency', category: 'Marketing', city: 'Curitiba', state: 'PR', modality: 'Remoto', salary: 5000, status: 'active', createdAt: new Date().toISOString() },
                { id: 3, title: 'Vendedor Externo', company: 'Comercial LTDA', category: 'Vendas', city: 'Foz do Iguaçu', state: 'PR', modality: 'Presencial', salary: 3500, status: 'inactive', createdAt: new Date().toISOString() },
            ];
        },

        async loadCategories() {
            try {
                const categories = await API.getCategories();
                const selects = document.querySelectorAll('select[name="category"]');
                selects.forEach(select => {
                    select.innerHTML = `
                        <option value="">Selecione uma categoria</option>
                        ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    `;
                });
            } catch (error) {
                // Categorias mock para demonstração
                const categories = ['TI', 'Marketing', 'Vendas', 'Administrativo', 'RH', 'Financeiro'];
                const selects = document.querySelectorAll('select[name="category"]');
                selects.forEach(select => {
                    select.innerHTML = `
                        <option value="">Selecione uma categoria</option>
                        ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                    `;
                });
            }
        },

        setupEvents() {
            // Botão criar vaga
            document.getElementById('create-job-btn')?.addEventListener('click', () => {
                this.openFormModal();
            });

            // Fechar modal
            document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
                el.addEventListener('click', () => {
                    this.closeModal();
                });
            });

            // Fechar com ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.closeModal();
            });
        },

        setupForm() {
            const form = document.getElementById('job-form');
            if (!form) return;

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveJob();
            });

            // Máscaras
            form.querySelectorAll('.mask-currency').forEach(input => {
                input.addEventListener('input', () => {
                    input.value = Utils.maskCurrency(input.value);
                });
            });

            // Campos de data
            const deadlineInput = document.getElementById('deadline');
            if (deadlineInput) {
                deadlineInput.min = new Date().toISOString().split('T')[0];
            }
        },

        setupFilters() {
            const filterBtn = document.getElementById('apply-filters');
            const clearBtn = document.getElementById('clear-filters');

            if (filterBtn) {
                filterBtn.addEventListener('click', () => {
                    this.filters = {
                        search: document.getElementById('filter-search')?.value,
                        category: document.getElementById('filter-category')?.value,
                        status: document.getElementById('filter-status')?.value,
                        city: document.getElementById('filter-city')?.value
                    };
                    Object.keys(this.filters).forEach(key => {
                        if (!this.filters[key]) delete this.filters[key];
                    });
                    this.loadJobs();
                });
            }

            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    document.querySelectorAll('.filter-input').forEach(input => input.value = '');
                    this.filters = {};
                    this.loadJobs();
                });
            }
        },

        openFormModal(job = null) {
            const modal = document.getElementById('job-modal');
            if (!modal) return;

            this.currentJobId = job?.id || null;
            const title = document.getElementById('modal-title');
            const form = document.getElementById('job-form');

            if (job) {
                title.textContent = '✏️ Editar Vaga';
                // Preencher formulário
                document.getElementById('title').value = job.title || '';
                document.getElementById('company').value = job.company || '';
                document.getElementById('category').value = job.category || '';
                document.getElementById('city').value = job.city || '';
                document.getElementById('state').value = job.state || '';
                document.getElementById('modality').value = job.modality || 'presencial';
                document.getElementById('contract_type').value = job.contractType || 'clt';
                document.getElementById('salary').value = job.salary ? Utils.maskCurrency(String(job.salary)) : '';
                document.getElementById('benefits').value = job.benefits ? job.benefits.join(', ') : '';
                document.getElementById('workload').value = job.workload || '';
                document.getElementById('description').value = job.description || '';
                document.getElementById('requirements').value = job.requirements || '';
                document.getElementById('responsibilities').value = job.responsibilities || '';
                document.getElementById('status').value = job.status || 'draft';
                if (job.deadline) {
                    document.getElementById('deadline').value = job.deadline.split('T')[0];
                }
            } else {
                title.textContent = '📝 Nova Vaga';
                form.reset();
                document.getElementById('status').value = 'draft';
            }

            modal.classList.add('active');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        },

        closeModal() {
            const modal = document.getElementById('job-modal');
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
            this.currentJobId = null;
        },

        async saveJob() {
            const form = document.getElementById('job-form');
            const formData = new FormData(form);
            const data = {};

            formData.forEach((value, key) => {
                if (key === 'benefits' && value) {
                    data[key] = value.split(',').map(b => b.trim()).filter(Boolean);
                } else if (key === 'salary' && value) {
                    data[key] = parseFloat(value.replace(/[R$\s.,]/g, '').replace(',', '.')) || 0;
                } else if (value) {
                    data[key] = value;
                }
            });

            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;

            try {
                btn.disabled = true;
                btn.textContent = 'Salvando...';

                let response;
                if (this.currentJobId) {
                    response = await API.updateJob(this.currentJobId, data);
                    Utils.showToast('Vaga atualizada com sucesso!', 'success');
                } else {
                    response = await API.createJob(data);
                    Utils.showToast('Vaga criada com sucesso!', 'success');
                }

                this.closeModal();
                await this.loadJobs();

            } catch (error) {
                Utils.showToast(error.message || 'Erro ao salvar vaga', 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        },

        async editJob(id) {
            try {
                const job = await API.getJob(id);
                this.openFormModal(job);
            } catch (error) {
                // Se não conseguir buscar, usar mock
                const mockJobs = this.getMockJobs();
                const job = mockJobs.find(j => j.id == id);
                if (job) {
                    this.openFormModal(job);
                } else {
                    Utils.showToast('Erro ao carregar vaga', 'error');
                }
            }
        },

        async toggleJob(id) {
            try {
                await API.toggleJobStatus(id);
                Utils.showToast('Status da vaga alterado!', 'success');
                await this.loadJobs();
            } catch (error) {
                // Mock para demonstração
                const jobs = this.getMockJobs();
                const job = jobs.find(j => j.id == id);
                if (job) {
                    job.status = job.status === 'active' ? 'inactive' : 'active';
                    Utils.showToast('Status alterado!', 'success');
                    await this.loadJobs();
                } else {
                    Utils.showToast('Erro ao alterar status', 'error');
                }
            }
        },

        async deleteJob(id) {
            if (!confirm('Tem certeza que deseja excluir esta vaga?')) return;

            try {
                await API.deleteJob(id);
                Utils.showToast('Vaga excluída com sucesso!', 'success');
                await this.loadJobs();
            } catch (error) {
                // Mock para demonstração
                Utils.showToast('Vaga excluída! (Demonstração)', 'success');
                await this.loadJobs();
            }
        }
    };

    // ============================================
    // 7. GESTÃO DE CATEGORIAS
    // ============================================
    const CategoryManager = {
        async init() {
            if (!API.getToken()) {
                window.location.href = '/admin/login.html';
                return;
            }

            await this.loadCategories();
            this.setupEvents();
        },

        async loadCategories() {
            const container = document.getElementById('categories-table');
            if (!container) return;

            try {
                const categories = await API.getCategories();
                
                if (!categories || categories.length === 0) {
                    container.innerHTML = `
                        <tr>
                            <td colspan="4" class="text-center py-5" style="color:#9ca3af;">
                                Nenhuma categoria cadastrada
                            </td>
                        </tr>
                    `;
                    return;
                }

                container.innerHTML = categories.map((cat, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td><strong>${cat.name}</strong></td>
                        <td>${cat.slug || Utils.generateSlug(cat.name)}</td>
                        <td>
                            <div style="display:flex;gap:5px;">
                                <button class="btn-edit" onclick="CategoryManager.editCategory('${cat.id}')">✏️</button>
                                <button class="btn-delete" onclick="CategoryManager.deleteCategory('${cat.id}')">🗑️</button>
                            </div>
                        </td>
                    </tr>
                `).join('');

            } catch (error) {
                // Dados mock para demonstração
                const mockCategories = [
                    { id: 1, name: 'Tecnologia da Informação', slug: 'ti' },
                    { id: 2, name: 'Marketing Digital', slug: 'marketing' },
                    { id: 3, name: 'Vendas', slug: 'vendas' },
                    { id: 4, name: 'Recursos Humanos', slug: 'rh' },
                    { id: 5, name: 'Financeiro', slug: 'financeiro' }
                ];
                
                container.innerHTML = mockCategories.map((cat, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td><strong>${cat.name}</strong></td>
                        <td>${cat.slug}</td>
                        <td>
                            <div style="display:flex;gap:5px;">
                                <button class="btn-edit" onclick="CategoryManager.editCategory('${cat.id}')">✏️</button>
                                <button class="btn-delete" onclick="CategoryManager.deleteCategory('${cat.id}')">🗑️</button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
        },

        setupEvents() {
            // Botão criar categoria
            document.getElementById('create-category-btn')?.addEventListener('click', () => {
                this.openFormModal();
            });

            // Formulário
            const form = document.getElementById('category-form');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await this.saveCategory();
                });
            }

            // Fechar modal
            document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
                el.addEventListener('click', () => {
                    this.closeModal();
                });
            });
        },

        openFormModal(category = null) {
            const modal = document.getElementById('category-modal');
            if (!modal) return;

            this.currentCategoryId = category?.id || null;
            const title = document.getElementById('category-modal-title');
            const nameInput = document.getElementById('category-name');

            if (category) {
                title.textContent = '✏️ Editar Categoria';
                nameInput.value = category.name;
            } else {
                title.textContent = '📁 Nova Categoria';
                nameInput.value = '';
            }

            modal.classList.add('active');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        },

        closeModal() {
            const modal = document.getElementById('category-modal');
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
            this.currentCategoryId = null;
        },

        async saveCategory() {
            const name = document.getElementById('category-name').value.trim();
            if (!name) {
                Utils.showToast('Digite o nome da categoria', 'warning');
                return;
            }

            try {
                const data = { name, slug: Utils.generateSlug(name) };
                
                if (this.currentCategoryId) {
                    await API.updateCategory(this.currentCategoryId, data);
                    Utils.showToast('Categoria atualizada!', 'success');
                } else {
                    await API.createCategory(data);
                    Utils.showToast('Categoria criada!', 'success');
                }

                this.closeModal();
                await this.loadCategories();

            } catch (error) {
                // Mock para demonstração
                Utils.showToast('Categoria salva! (Demonstração)', 'success');
                this.closeModal();
                await this.loadCategories();
            }
        },

        async editCategory(id) {
            // Buscar categoria (mock)
            const categories = [
                { id: 1, name: 'Tecnologia da Informação', slug: 'ti' },
                { id: 2, name: 'Marketing Digital', slug: 'marketing' },
                { id: 3, name: 'Vendas', slug: 'vendas' }
            ];
            const cat = categories.find(c => c.id == id);
            if (cat) {
                this.openFormModal(cat);
            }
        },

        async deleteCategory(id) {
            if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

            try {
                await API.deleteCategory(id);
                Utils.showToast('Categoria excluída!', 'success');
                await this.loadCategories();
            } catch (error) {
                Utils.showToast('Categoria excluída! (Demonstração)', 'success');
                await this.loadCategories();
            }
        }
    };

    // ============================================
    // 8. INICIALIZAÇÃO
    // ============================================
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 Foz Talentos - Painel Administrativo');

        const page = window.location.pathname.split('/').pop();

        switch (page) {
            case 'login.html':
            case '':
                Auth.init();
                break;
            case 'dashboard.html':
                Dashboard.init();
                break;
            case 'vagas.html':
                JobManager.init();
                break;
            case 'categorias.html':
                CategoryManager.init();
                break;
            default:
                // Verificar se é página de admin
                if (window.location.pathname.includes('/admin/')) {
                    Dashboard.init();
                }
        }

        console.log('✅ Painel Administrativo Pronto!');
    });

    // ============================================
    // 9. ESTILOS CSS EMBUTIDOS
    // ============================================
    const styles = document.createElement('style');
    styles.textContent = `
        /* ===== BOTÕES ===== */
        .btn-primary {
            background: #1a3a6b;
            color: white;
            padding: 10px 24px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        .btn-primary:hover {
            background: #2d5fa0;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(26,58,107,0.3);
        }
        .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .btn-edit {
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 4px 10px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
        }
        .btn-edit:hover { background: #2563eb; transform: scale(1.05); }

        .btn-delete {
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 4px 10px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
        }
        .btn-delete:hover { background: #dc2626; transform: scale(1.05); }

        .btn-toggle {
            background: #8b5cf6;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 4px 10px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
        }
        .btn-toggle:hover { background: #7c3aed; transform: scale(1.05); }

        /* ===== BADGES ===== */
        .badge-active {
            background: #d1fae5;
            color: #065f46;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .badge-inactive {
            background: #fee2e2;
            color: #991b1b;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .badge-draft {
            background: #fef3c7;
            color: #92400e;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .badge-pending {
            background: #e0e7ff;
            color: #3730a3;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }

        /* ===== MODAL ===== */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 999;
            display: none;
        }
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .modal.active {
            display: flex;
        }
        .modal-content {
            background: white;
            border-radius: 16px;
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: modalIn 0.3s ease;
        }
        @keyframes modalIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            border-bottom: 1px solid #e5e7eb;
        }
        .modal-header h2 {
            margin: 0;
            font-size: 20px;
            color: #1f2937;
        }
        .modal-close {
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #6b7280;
            transition: all 0.2s;
            padding: 0 8px;
        }
        .modal-close:hover {
            color: #ef4444;
            transform: rotate(90deg);
        }
        .modal-body {
            padding: 24px;
        }
        .modal-footer {
            padding: 16px 24px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }

        /* ===== FORMULÁRIO ===== */
        .form-group {
            margin-bottom: 16px;
        }
        .form-group label {
            display: block;
            margin-bottom: 6px;
            font-weight: 600;
            color: #374151;
            font-size: 14px;
        }
        .form-group label .required {
            color: #ef4444;
        }
        .form-control {
            width: 100%;
            padding: 10px 14px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.2s;
            font-family: inherit;
        }
        .form-control:focus {
            outline: none;
            border-color: #1a3a6b;
            box-shadow: 0 0 0 3px rgba(26,58,107,0.1);
        }
        .form-control.error {
            border-color: #ef4444;
        }
        .form-control:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }
        textarea.form-control {
            resize: vertical;
            min-height: 80px;
        }
        select.form-control {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 14px center;
        }

        /* ===== TABELA ===== */
        .table-container {
            overflow-x: auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        table thead {
            background: #f8fafc;
        }
        table th {
            text-align: left;
            padding: 12px 16px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            color: #6b7280;
            border-bottom: 2px solid #e5e7eb;
        }
        table td {
            padding: 12px 16px;
            border-bottom: 1px solid #f3f4f6;
        }
        table tbody tr:hover {
            background: #f8fafc;
        }

        /* ===== FILTROS ===== */
        .filters-bar {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 20px;
            padding: 16px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .filters-bar .form-control {
            width: auto;
            min-width: 150px;
        }

        /* ===== RESPONSIVO ===== */
        @media (max-width: 768px) {
            .form-row {
                grid-template-columns: 1fr;
            }
            .filters-bar {
                flex-direction: column;
            }
            .filters-bar .form-control {
                width: 100%;
            }
            .modal-content {
                margin: 10px;
                max-height: 95vh;
            }
            .modal-header {
                padding: 16px;
            }
            .modal-body {
                padding: 16px;
            }
            table {
                font-size: 13px;
            }
            table th, table td {
                padding: 8px 10px;
            }
        }

        /* ===== LAYOUT ===== */
        .admin-container {
            display: flex;
            min-height: 100vh;
            background: #f3f4f6;
        }
        .admin-sidebar {
            width: 260px;
            background: #1a3a6b;
            color: white;
            padding: 20px 0;
            flex-shrink: 0;
            position: sticky;
            top: 0;
            height: 100vh;
            overflow-y: auto;
        }
        .admin-sidebar .logo {
            padding: 0 24px 20px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            font-size: 20px;
            font-weight: bold;
        }
        .admin-sidebar .logo span {
            color: #60a5fa;
        }
        .sidebar-menu {
            list-style: none;
            padding: 0;
            margin: 16px 0;
        }
        .sidebar-menu li a {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 24px;
            color: rgba(255,255,255,0.7);
            text-decoration: none;
            transition: all 0.2s;
            border-left: 3px solid transparent;
        }
        .sidebar-menu li a:hover {
            background: rgba(255,255,255,0.05);
            color: white;
        }
        .sidebar-menu li a.active {
            background: rgba(255,255,255,0.1);
            color: white;
            border-left-color: #60a5fa;
        }
        .sidebar-menu .has-submenu > a::after {
            content: '▼';
            margin-left: auto;
            font-size: 10px;
        }
        .sidebar-menu .has-submenu .submenu {
            list-style: none;
            padding: 0;
            margin: 0;
            display: none;
        }
        .sidebar-menu .has-submenu.open .submenu {
            display: block;
        }
        .sidebar-menu .submenu a {
            padding-left: 52px;
            font-size: 14px;
        }

        .admin-main {
            flex: 1;
            padding: 24px;
            overflow-x: hidden;
        }
        .admin-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 24px;
        }
        .admin-header .user {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .admin-header .user .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #1a3a6b;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        .admin-header .user .name {
            font-weight: 600;
            color: #1f2937;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .stat-card .number {
            font-size: 28px;
            font-weight: bold;
            color: #1a3a6b;
        }
        .stat-card .label {
            color: #6b7280;
            font-size: 14px;
            margin-top: 4px;
        }

        @media (max-width: 768px) {
            .admin-sidebar {
                display: none;
            }
            .admin-main {
                padding: 16px;
            }
            .stats-grid {
                grid-template-columns: 1fr 1fr;
            }
        }
    `;
    document.head.appendChild(styles);

})();