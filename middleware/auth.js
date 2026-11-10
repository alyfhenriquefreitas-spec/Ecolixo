const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ecolixo_chave_secreta_super_segura_2026';

// Middleware para verificar autenticação (usuário logado)
function authenticate(req, res, next) {
    let token = null;

    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    } else if (req.headers['x-access-token']) {
        token = req.headers['x-access-token'];
    }

    if (!token) {
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Acesso negado: você precisa estar autenticado para realizar esta operação.'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Sessão inválida ou expirada. Faça login novamente.'
        });
    }
}

// Middleware para garantir que apenas administradores tenham acesso (RNF03)
function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            sucesso: false,
            mensagem: 'Autenticação necessária.'
        });
    }

    if (req.user.perfil !== 'admin') {
        return res.status(403).json({
            sucesso: false,
            mensagem: 'Permissão negada: apenas administradores podem realizar esta ação (RNF03).'
        });
    }

    next();
}

// Middleware opcional (se logado, anexa usuário; se não, continua como visitante)
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    } else if (req.headers['x-access-token']) {
        token = req.headers['x-access-token'];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        } catch (e) {
            // Ignora erro no modo opcional
        }
    }
    next();
}

module.exports = {
    authenticate,
    requireAdmin,
    optionalAuth,
    JWT_SECRET
};
