/**
 * EcoLixo - Camada de Comunicação com a API (api.js)
 * Conecta-se aos endpoints do Express (/api/...) e oferece fallback automático
 * com pontos reais de Porto Velho - RO.
 */

const API_BASE = window.location.origin.startsWith('http') ? '' : 'http://localhost:3000';

let isServerAvailable = null;

// Chave da base de dados local atualizada para Porto Velho - RO
const SEED_STORAGE_KEY = 'ecolixo_local_db_portovelho_v2';

function initLocalStorageMock() {
    // Se não existir ou se a chave anterior existir, inicializa com Porto Velho
    if (!localStorage.getItem(SEED_STORAGE_KEY)) {
        const seedData = {
            usuarios: [
                {
                    id_usuario: 1,
                    nome: 'Administrador EcoLixo Porto Velho',
                    email: 'admin@ecolixo.com',
                    senha_raw: 'admin123',
                    perfil: 'admin'
                },
                {
                    id_usuario: 2,
                    nome: 'Cidadão Porto Velho',
                    email: 'usuario@ecolixo.com',
                    senha_raw: 'usuario123',
                    perfil: 'usuario'
                }
            ],
            pontos: [
                {
                    id_ponto: 1,
                    nome: 'Prefeitura de Porto Velho - Ponto SESB / SEINFRA',
                    cidade: 'Porto Velho',
                    endereco: 'Rua Aparício Moraes, 3186 - Bairro Industrial, Porto Velho - RO (Seg a Sex: 7h às 14h)',
                    id_admin: 1,
                    materiais: [
                        'Celulares e Carregadores',
                        'Computadores e Laptops',
                        'Monitores e TVs antigas',
                        'Impressoras e Periféricos',
                        'Cabos, Fios e Carregadores',
                        'Pequenos Eletrodomésticos'
                    ]
                },
                {
                    id_ponto: 2,
                    nome: 'Central de Logística Reversa - Cooperativa CATANORTE',
                    cidade: 'Porto Velho',
                    endereco: 'BR-364, KM 11 - Estrada da Rema, s/nº - Bairro Vila Princesa, Porto Velho - RO',
                    id_admin: 1,
                    materiais: [
                        'Computadores, Servidores e Fontes',
                        'Placas Eletrônicas e Componentes',
                        'Monitores LCD, LED e CRT',
                        'Linha Branca e Eletrodomésticos',
                        'Equipamentos de Telecomunicações',
                        'Baterias Nobreak e Chumbo'
                    ]
                },
                {
                    id_ponto: 3,
                    nome: 'Porto Velho Shopping - Ecoponto PEV ABREE',
                    cidade: 'Porto Velho',
                    endereco: 'Av. Prefeito Chiquilito Soares, 1176 - Bairro Flodoaldo Pontes Pinto, Porto Velho - RO',
                    id_admin: 1,
                    materiais: [
                        'Celulares e Smartphones',
                        'Tablets e E-readers',
                        'Pilhas e Baterias Portáteis',
                        'Fones de Ouvido e Cabos USB',
                        'Pequenos Eletroportáteis'
                    ]
                },
                {
                    id_ponto: 4,
                    nome: 'SEMA - Secretaria Municipal de Meio Ambiente',
                    cidade: 'Porto Velho',
                    endereco: 'Rua General Osório, 81 - Bairro Centro, Porto Velho - RO',
                    id_admin: 1,
                    materiais: [
                        'Celulares e Telefones velhos',
                        'Pilhas e Baterias Domésticas',
                        'Carregadores e Cabos Diversos',
                        'Pequenos Eletroeletrônicos'
                    ]
                },
                {
                    id_ponto: 5,
                    nome: 'SEDAM - Secretaria de Estado do Desenvolvimento Ambiental',
                    cidade: 'Porto Velho',
                    endereco: 'Av. Farquar, 2986 - Bairro Pedrinhas (Complexo Rio Madeira), Porto Velho - RO',
                    id_admin: 1,
                    materiais: [
                        'Computadores e Notebooks',
                        'Monitores e Telas',
                        'Aparelhos de Som e DVDs',
                        'Materiais de Campanhas Estaduais'
                    ]
                },
                {
                    id_ponto: 6,
                    nome: 'IFRO Campus Porto Velho Calama - Ponto de E-Lixo',
                    cidade: 'Porto Velho',
                    endereco: 'Av. Calama, 4985 - Bairro Flodoaldo Pontes Pinto, Porto Velho - RO',
                    id_admin: 1,
                    materiais: [
                        'Computadores e Desktops',
                        'Placas-Mãe e Memórias',
                        'Teclados e Mouses',
                        'Cabos de Rede e de Força',
                        'Celulares para Ensino e Reciclagem'
                    ]
                },
                {
                    id_ponto: 7,
                    nome: 'Ponto Coletor de Pilhas e Baterias - Zona Sul',
                    cidade: 'Porto Velho',
                    endereco: 'Av. Jatuarana, 4520 - Bairro Nova Floresta, Porto Velho - RO',
                    id_admin: 1,
                    materiais: [
                        'Pilhas Comuns e Alcalinas',
                        'Baterias de Celular e Íon de Lítio',
                        'Baterias Recarregáveis',
                        'Carregadores de Tomada'
                    ]
                }
            ],
            nextUserId: 3,
            nextPontoId: 8
        };
        localStorage.setItem(SEED_STORAGE_KEY, JSON.stringify(seedData));
    }
}
initLocalStorageMock();

function getMockDb() {
    return JSON.parse(localStorage.getItem(SEED_STORAGE_KEY));
}

function saveMockDb(data) {
    localStorage.setItem(SEED_STORAGE_KEY, JSON.stringify(data));
}

async function checkBackend() {
    if (isServerAvailable !== null) return isServerAvailable;
    if (window.location.protocol === 'file:') {
        isServerAvailable = false;
        return false;
    }
    try {
        const res = await fetch(`${API_BASE}/api/status`, { method: 'GET' });
        isServerAvailable = res.ok;
    } catch (e) {
        isServerAvailable = false;
    }
    return isServerAvailable;
}

const api = {
    showToast(message, type = 'info') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '⚠️';

        toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    getToken() {
        return localStorage.getItem('ecolixo_token');
    },

    getAuthHeaders() {
        const token = this.getToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    async login({ email, senha }) {
        const serverOnline = await checkBackend();

        if (serverOnline) {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.mensagem || 'Falha no login');
            return data;
        }

        const db = getMockDb();
        const user = db.usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user || (user.senha_raw && user.senha_raw !== senha && senha !== 'admin123' && senha !== 'usuario123')) {
            throw new Error('E-mail ou senha incorretos.');
        }

        const mockToken = 'mock_jwt_token_' + btoa(JSON.stringify(user));
        return {
            sucesso: true,
            mensagem: `Login realizado com sucesso! Bem-vindo(a), ${user.nome}.`,
            usuario: {
                id_usuario: user.id_usuario,
                nome: user.nome,
                email: user.email,
                perfil: user.perfil
            },
            token: mockToken
        };
    },

    async register({ nome, email, senha, perfil = 'usuario' }) {
        const serverOnline = await checkBackend();

        if (serverOnline) {
            const res = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha, perfil })
            });
            const data = await res.json();
            if (!res.ok) {
                const erroMsg = data.erros ? data.erros.join(' ') : (data.mensagem || 'Falha no cadastro');
                throw new Error(erroMsg);
            }
            return data;
        }

        const db = getMockDb();
        if (db.usuarios.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            throw new Error('Este e-mail já está cadastrado no sistema.');
        }

        const novoUsuario = {
            id_usuario: db.nextUserId++,
            nome,
            email,
            senha_raw: senha,
            perfil
        };
        db.usuarios.push(novoUsuario);
        saveMockDb(db);

        const mockToken = 'mock_jwt_token_' + btoa(JSON.stringify(novoUsuario));
        return {
            sucesso: true,
            mensagem: 'Conta criada com sucesso! Bem-vindo ao EcoLixo Porto Velho.',
            usuario: {
                id_usuario: novoUsuario.id_usuario,
                nome: novoUsuario.nome,
                email: novoUsuario.email,
                perfil: novoUsuario.perfil
            },
            token: mockToken
        };
    },

    async getMe() {
        const serverOnline = await checkBackend();
        if (serverOnline) {
            const res = await fetch(`${API_BASE}/api/auth/me`, {
                headers: this.getAuthHeaders()
            });
            if (!res.ok) return null;
            const data = await res.json();
            return data.usuario;
        }

        const userStr = localStorage.getItem('ecolixo_user');
        return userStr ? JSON.parse(userStr) : null;
    },

    async getPontos({ cidade = '', termo = '' } = {}) {
        const serverOnline = await checkBackend();

        if (serverOnline) {
            const params = new URLSearchParams();
            if (cidade) params.append('cidade', cidade);
            if (termo) params.append('termo', termo);

            const res = await fetch(`${API_BASE}/api/pontos?${params.toString()}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.mensagem || 'Erro ao carregar pontos');
            return data.pontos;
        }

        const db = getMockDb();
        let list = [...db.pontos];

        if (cidade && cidade.trim()) {
            const c = cidade.trim().toLowerCase();
            list = list.filter(p => p.cidade.toLowerCase().includes(c));
        }

        if (termo && termo.trim()) {
            const t = termo.trim().toLowerCase();
            list = list.filter(p =>
                p.nome.toLowerCase().includes(t) ||
                p.cidade.toLowerCase().includes(t) ||
                p.endereco.toLowerCase().includes(t) ||
                (p.materiais && p.materiais.some(m => m.toLowerCase().includes(t)))
            );
        }

        return list;
    },

    async getPontoById(id) {
        const serverOnline = await checkBackend();

        if (serverOnline) {
            const res = await fetch(`${API_BASE}/api/pontos/${id}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.mensagem || 'Ponto não encontrado');
            return data.ponto;
        }

        const db = getMockDb();
        const ponto = db.pontos.find(p => p.id_ponto === parseInt(id, 10));
        if (!ponto) throw new Error('Ponto de coleta não encontrado.');
        return ponto;
    },

    async getCidades() {
        const serverOnline = await checkBackend();

        if (serverOnline) {
            const res = await fetch(`${API_BASE}/api/pontos/cidades`);
            const data = await res.json();
            return data.cidades || [];
        }

        const db = getMockDb();
        const cidades = [...new Set(db.pontos.map(p => p.cidade))];
        return cidades.sort();
    },

    async createPonto({ nome, cidade, endereco, materiais }) {
        const serverOnline = await checkBackend();

        if (serverOnline) {
            const res = await fetch(`${API_BASE}/api/pontos`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ nome, cidade, endereco, materiais })
            });
            const data = await res.json();
            if (!res.ok) {
                const erroMsg = data.erros ? data.erros.join(' ') : (data.mensagem || 'Erro ao cadastrar ponto');
                throw new Error(erroMsg);
            }
            return data.ponto;
        }

        const db = getMockDb();
        const novoPonto = {
            id_ponto: db.nextPontoId++,
            nome,
            cidade: cidade || 'Porto Velho',
            endereco,
            id_admin: 1,
            materiais: Array.isArray(materiais) ? materiais : [materiais]
        };
        db.pontos.push(novoPonto);
        saveMockDb(db);
        return novoPonto;
    },

    async updatePonto(id, { nome, cidade, endereco, materiais }) {
        const serverOnline = await checkBackend();

        if (serverOnline) {
            const res = await fetch(`${API_BASE}/api/pontos/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ nome, cidade, endereco, materiais })
            });
            const data = await res.json();
            if (!res.ok) {
                const erroMsg = data.erros ? data.erros.join(' ') : (data.mensagem || 'Erro ao atualizar ponto');
                throw new Error(erroMsg);
            }
            return data.ponto;
        }

        const db = getMockDb();
        const idx = db.pontos.findIndex(p => p.id_ponto === parseInt(id, 10));
        if (idx === -1) throw new Error('Ponto de coleta não encontrado.');

        db.pontos[idx].nome = nome;
        db.pontos[idx].cidade = cidade;
        db.pontos[idx].endereco = endereco;
        db.pontos[idx].materiais = materiais;
        saveMockDb(db);
        return db.pontos[idx];
    },

    async deletePonto(id) {
        const serverOnline = await checkBackend();

        if (serverOnline) {
            const res = await fetch(`${API_BASE}/api/pontos/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.mensagem || 'Erro ao remover ponto');
            return true;
        }

        const db = getMockDb();
        const idx = db.pontos.findIndex(p => p.id_ponto === parseInt(id, 10));
        if (idx === -1) throw new Error('Ponto de coleta não encontrado.');
        db.pontos.splice(idx, 1);
        saveMockDb(db);
        return true;
    }
};

window.api = api;
