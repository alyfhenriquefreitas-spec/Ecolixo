/**
 * EcoLixo - Gerenciamento de Sessão e Autenticação no Frontend (auth.js)
 */

const auth = {
    getUser() {
        const str = localStorage.getItem('ecolixo_user');
        try {
            return str ? JSON.parse(str) : null;
        } catch (e) {
            return null;
        }
    },

    setUser(user, token) {
        if (user) {
            localStorage.setItem('ecolixo_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('ecolixo_user');
        }

        if (token) {
            localStorage.setItem('ecolixo_token', token);
        } else {
            localStorage.removeItem('ecolixo_token');
        }
    },

    isAuthenticated() {
        return !!this.getUser();
    },

    isAdmin() {
        const user = this.getUser();
        return user && user.perfil === 'admin';
    },

    logout() {
        localStorage.removeItem('ecolixo_user');
        localStorage.removeItem('ecolixo_token');
        if (window.api) {
            window.api.showToast('Você saiu do sistema com sucesso.', 'info');
        }
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 300);
    },

    // Atualiza a barra de navegação com base no usuário logado
    renderNavbar() {
        const navAuth = document.getElementById('nav-auth-container');
        const adminNavLink = document.getElementById('nav-admin-link');
        const user = this.getUser();

        // Exibe ou oculta link de Admin na barra
        if (adminNavLink) {
            adminNavLink.style.display = this.isAdmin() ? 'inline-block' : 'none';
        }

        if (!navAuth) return;

        if (user) {
            const roleBadge = user.perfil === 'admin' 
                ? '<span class="user-role-tag admin">Administrador</span>' 
                : '<span class="user-role-tag">Usuário</span>';

            navAuth.innerHTML = `
                <div class="user-badge">
                    <span>👤 ${user.nome.split(' ')[0]}</span>
                    ${roleBadge}
                </div>
                <button id="btn-logout" class="btn btn-secondary btn-sm" title="Sair da conta">
                    Sair
                </button>
            `;

            const btnLogout = document.getElementById('btn-logout');
            if (btnLogout) {
                btnLogout.addEventListener('click', () => this.logout());
            }
        } else {
            navAuth.innerHTML = `
                <a href="login.html" class="btn btn-secondary btn-sm">Entrar</a>
                <a href="cadastro.html" class="btn btn-primary btn-sm">Cadastre-se</a>
            `;
        }
    },

    // Configura o menu responsivo mobile
    setupMobileMenu() {
        const toggleBtn = document.getElementById('menu-toggle');
        const navMenu = document.getElementById('nav-menu');
        if (toggleBtn && navMenu) {
            toggleBtn.addEventListener('click', () => {
                navMenu.classList.toggle('open');
            });
        }
    },

    // Proteção de rotas restritas (ex: admin.html)
    requireAdminPage() {
        if (!this.isAdmin()) {
            alert('Acesso restrito: Esta página exige permissão de Administrador (RNF03). Você será redirecionado para o login.');
            window.location.href = 'login.html?redirect=admin.html';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    auth.renderNavbar();
    auth.setupMobileMenu();
});

window.auth = auth;
