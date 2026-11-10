const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

// Validação simples de e-mail (RNF02: validação no servidor)
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// ==========================================================
// UC01 / RF01 - Criar Conta (Visitante)
// CA01 - Criar conta no banco com dados válidos e hash seguro
// ==========================================================
router.post('/register', async (req, res) => {
    try {
        const { nome, email, senha, perfil } = req.body;

        // RNF02: Validação rigorosa no servidor
        const erros = [];

        if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
            erros.push('O nome deve conter pelo menos 3 caracteres.');
        }

        if (!email || !isValidEmail(email)) {
            erros.push('Informe um e-mail válido.');
        }

        if (!senha || typeof senha !== 'string' || senha.length < 6) {
            erros.push('A senha deve ter pelo menos 6 caracteres.');
        }

        if (erros.length > 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Erro de validação nos dados enviados.',
                erros
            });
        }

        const emailNormalizado = email.trim().toLowerCase();

        // Verifica se e-mail já existe
        const usuarioExistente = await db.findUserByEmail(emailNormalizado);
        if (usuarioExistente) {
            return res.status(409).json({
                sucesso: false,
                mensagem: 'Este e-mail já está cadastrado no sistema.'
            });
        }

        // RNF01: Senhas nunca serão salvas em texto puro: usar hash seguro
        const saltRounds = 10;
        const senha_hash = await bcrypt.hash(senha, saltRounds);

        // Perfil: padrão 'usuario' (visitantes não podem se auto-promover a 'admin' via cadastro comum)
        const perfilFinal = (perfil === 'admin') ? 'admin' : 'usuario';

        const novoUsuario = await db.createUser({
            nome: nome.trim(),
            email: emailNormalizado,
            senha_hash,
            perfil: perfilFinal
        });

        // Gera token automaticamente para permitir login direto
        const token = jwt.sign(
            {
                id_usuario: novoUsuario.id_usuario,
                nome: novoUsuario.nome,
                email: novoUsuario.email,
                perfil: novoUsuario.perfil
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Conta criada com sucesso! Bem-vindo ao EcoLixo.',
            usuario: {
                id_usuario: novoUsuario.id_usuario,
                nome: novoUsuario.nome,
                email: novoUsuario.email,
                perfil: novoUsuario.perfil
            },
            token
        });

    } catch (err) {
        console.error('Erro ao registrar usuário:', err);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao criar conta. Tente novamente mais tarde.'
        });
    }
});

// ==========================================================
// UC02 / RF02 - Fazer Login (Usuário e Administrador)
// CA02 - Informar e-mail e senha corretos e entrar no sistema
// ==========================================================
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        // RNF02: Validação no servidor
        if (!email || !senha) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Preencha o e-mail e a senha.'
            });
        }

        const emailNormalizado = email.trim().toLowerCase();
        const usuario = await db.findUserByEmail(emailNormalizado);

        if (!usuario) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'E-mail ou senha incorretos.'
            });
        }

        // RNF01: Compara com o hash bcrypt seguro
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaCorreta) {
            return res.status(401).json({
                sucesso: false,
                mensagem: 'E-mail ou senha incorretos.'
            });
        }

        // Emite token JWT
        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            sucesso: true,
            mensagem: `Login realizado com sucesso! Bem-vindo(a), ${usuario.nome}.`,
            usuario: {
                id_usuario: usuario.id_usuario,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil
            },
            token
        });

    } catch (err) {
        console.error('Erro no login:', err);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao realizar login. Tente novamente mais tarde.'
        });
    }
});

// ==========================================================
// Consulta dados do usuário autenticado (sessão ativa)
// ==========================================================
router.get('/me', authenticate, async (req, res) => {
    try {
        const usuario = await db.findUserById(req.user.id_usuario);
        if (!usuario) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Usuário não encontrado.'
            });
        }
        return res.status(200).json({
            sucesso: true,
            usuario
        });
    } catch (err) {
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao consultar dados da sessão.'
        });
    }
});

module.exports = router;
