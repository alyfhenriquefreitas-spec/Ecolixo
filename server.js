const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/auth');
const pontosRoutes = require('./routes/pontos');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares essenciais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend (HTML, CSS, JS, Imagens)
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API REST
app.use('/api/auth', authRoutes);
app.use('/api/pontos', pontosRoutes);

// Health check / Status do Sistema
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        projeto: 'EcoLixo',
        versao: '1.0.0',
        modo_banco: db.isMemory() ? 'Memória (Dev / Fallback)' : 'PostgreSQL Ativo',
        timestamp: new Date().toISOString()
    });
});

// Redirecionamento amigável para rotas HTML caso requisitadas diretamente
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
});

app.get('/pontos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pontos.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Rota padrão (Home)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicialização do servidor e banco
async function startServer() {
    try {
        console.log('[EcoLixo] Inicializando conexão com o banco de dados...');
        await db.init();

        app.listen(PORT, () => {
            console.log('====================================================');
            console.log(`🌿 EcoLixo - Sistema de Coleta de Lixo Eletrônico`);
            console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
            console.log(`📊 Status do Banco: ${db.isMemory() ? 'Banco Local em Memória' : 'PostgreSQL Conectado'}`);
            console.log(`💻 Pressione Ctrl+C para encerrar`);
            console.log('====================================================');
        });
    } catch (err) {
        console.error('[EcoLixo] Falha crítica ao iniciar o servidor:', err);
    }
}

startServer();
