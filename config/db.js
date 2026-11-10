const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let pool = null;
let useMemoryFallback = false;

// Banco de dados com dados reais de Porto Velho - RO
const memoryDb = {
    usuarios: [
        {
            id_usuario: 1,
            nome: 'Administrador EcoLixo Porto Velho',
            email: 'admin@ecolixo.com',
            senha_hash: bcrypt.hashSync('admin123', 10),
            perfil: 'admin',
            criado_em: new Date()
        },
        {
            id_usuario: 2,
            nome: 'Cidadão Porto Velho',
            email: 'usuario@ecolixo.com',
            senha_hash: bcrypt.hashSync('usuario123', 10),
            perfil: 'usuario',
            criado_em: new Date()
        }
    ],
    pontos: [
        {
            id_ponto: 1,
            nome: 'Prefeitura de Porto Velho - Ponto SESB / SEINFRA',
            cidade: 'Porto Velho',
            endereco: 'Rua Aparício Moraes, 3186 - Bairro Industrial, Porto Velho - RO (Seg a Sex: 7h às 14h)',
            id_admin: 1,
            criado_em: new Date()
        },
        {
            id_ponto: 2,
            nome: 'Central de Logística Reversa - Cooperativa CATANORTE',
            cidade: 'Porto Velho',
            endereco: 'BR-364, KM 11 - Estrada da Rema, s/nº - Bairro Vila Princesa, Porto Velho - RO',
            id_admin: 1,
            criado_em: new Date()
        },
        {
            id_ponto: 3,
            nome: 'Porto Velho Shopping - Ecoponto PEV ABREE',
            cidade: 'Porto Velho',
            endereco: 'Av. Prefeito Chiquilito Soares, 1176 - Bairro Flodoaldo Pontes Pinto, Porto Velho - RO',
            id_admin: 1,
            criado_em: new Date()
        },
        {
            id_ponto: 4,
            nome: 'SEMA - Secretaria Municipal de Meio Ambiente',
            cidade: 'Porto Velho',
            endereco: 'Rua General Osório, 81 - Bairro Centro, Porto Velho - RO',
            id_admin: 1,
            criado_em: new Date()
        },
        {
            id_ponto: 5,
            nome: 'SEDAM - Secretaria de Estado do Desenvolvimento Ambiental',
            cidade: 'Porto Velho',
            endereco: 'Av. Farquar, 2986 - Bairro Pedrinhas (Complexo Rio Madeira), Porto Velho - RO',
            id_admin: 1,
            criado_em: new Date()
        },
        {
            id_ponto: 6,
            nome: 'IFRO Campus Porto Velho Calama - Ponto de E-Lixo',
            cidade: 'Porto Velho',
            endereco: 'Av. Calama, 4985 - Bairro Flodoaldo Pontes Pinto, Porto Velho - RO',
            id_admin: 1,
            criado_em: new Date()
        },
        {
            id_ponto: 7,
            nome: 'Ponto Coletor de Pilhas e Baterias - Zona Sul',
            cidade: 'Porto Velho',
            endereco: 'Av. Jatuarana, 4520 - Bairro Nova Floresta, Porto Velho - RO',
            id_admin: 1,
            criado_em: new Date()
        }
    ],
    materiais: [
        // Ponto 1: Prefeitura SESB
        { id_material: 1, id_ponto: 1, nome_material: 'Celulares e Carregadores' },
        { id_material: 2, id_ponto: 1, nome_material: 'Computadores e Laptops' },
        { id_material: 3, id_ponto: 1, nome_material: 'Monitores e TVs antigas' },
        { id_material: 4, id_ponto: 1, nome_material: 'Impressoras e Periféricos' },
        { id_material: 5, id_ponto: 1, nome_material: 'Cabos, Fios e Carregadores' },
        { id_material: 6, id_ponto: 1, nome_material: 'Pequenos Eletrodomésticos' },

        // Ponto 2: CATANORTE
        { id_material: 7, id_ponto: 2, nome_material: 'Computadores, Servidores e Fontes' },
        { id_material: 8, id_ponto: 2, nome_material: 'Placas Eletrônicas e Componentes' },
        { id_material: 9, id_ponto: 2, nome_material: 'Monitores LCD, LED e CRT' },
        { id_material: 10, id_ponto: 2, nome_material: 'Linha Branca e Eletrodomésticos' },
        { id_material: 11, id_ponto: 2, nome_material: 'Equipamentos de Telecomunicações' },
        { id_material: 12, id_ponto: 2, nome_material: 'Baterias Nobreak e Chumbo' },

        // Ponto 3: Porto Velho Shopping
        { id_material: 13, id_ponto: 3, nome_material: 'Celulares e Smartphones' },
        { id_material: 14, id_ponto: 3, nome_material: 'Tablets e E-readers' },
        { id_material: 15, id_ponto: 3, nome_material: 'Pilhas e Baterias Portáteis' },
        { id_material: 16, id_ponto: 3, nome_material: 'Fones de Ouvido e Cabos USB' },
        { id_material: 17, id_ponto: 3, nome_material: 'Pequenos Eletroportáteis' },

        // Ponto 4: SEMA
        { id_material: 18, id_ponto: 4, nome_material: 'Celulares e Telefones velhos' },
        { id_material: 19, id_ponto: 4, nome_material: 'Pilhas e Baterias Domésticas' },
        { id_material: 20, id_ponto: 4, nome_material: 'Carregadores e Cabos Diversos' },
        { id_material: 21, id_ponto: 4, nome_material: 'Pequenos Eletroeletrônicos' },

        // Ponto 5: SEDAM
        { id_material: 22, id_ponto: 5, nome_material: 'Computadores e Notebooks' },
        { id_material: 23, id_ponto: 5, nome_material: 'Monitores e Telas' },
        { id_material: 24, id_ponto: 5, nome_material: 'Aparelhos de Som e DVDs' },
        { id_material: 25, id_ponto: 5, nome_material: 'Materiais de Campanhas Estaduais' },

        // Ponto 6: IFRO Calama
        { id_material: 26, id_ponto: 6, nome_material: 'Computadores e Desktops' },
        { id_material: 27, id_ponto: 6, nome_material: 'Placas-Mãe e Memórias' },
        { id_material: 28, id_ponto: 6, nome_material: 'Teclados e Mouses' },
        { id_material: 29, id_ponto: 6, nome_material: 'Cabos de Rede e de Força' },
        { id_material: 30, id_ponto: 6, nome_material: 'Celulares para Ensino e Reciclagem' },

        // Ponto 7: Zona Sul
        { id_material: 31, id_ponto: 7, nome_material: 'Pilhas Comuns e Alcalinas' },
        { id_material: 32, id_ponto: 7, nome_material: 'Baterias de Celular e Íon de Lítio' },
        { id_material: 33, id_ponto: 7, nome_material: 'Baterias Recarregáveis' },
        { id_material: 34, id_ponto: 7, nome_material: 'Carregadores de Tomada' }
    ],
    nextUserId: 3,
    nextPontoId: 8,
    nextMaterialId: 35
};

async function initDb() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.log('[EcoLixo Banco] Nenhuma DATABASE_URL configurada. Usando banco em memória com pontos reais de Porto Velho - RO.');
        useMemoryFallback = true;
        return;
    }

    try {
        const isRender = process.env.RENDER || (connectionString && connectionString.includes('render.com'));
        pool = new Pool({
            connectionString,
            ssl: isRender ? { rejectUnauthorized: false } : false,
            connectionTimeoutMillis: 4000
        });

        const client = await pool.connect();
        console.log('[EcoLixo Banco] Conexão com PostgreSQL estabelecida com sucesso!');

        // Criação de tabelas
        await client.query(`
            CREATE TABLE IF NOT EXISTS USUARIOS (
                id_usuario SERIAL PRIMARY KEY,
                nome VARCHAR(150) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                senha_hash VARCHAR(255) NOT NULL,
                perfil VARCHAR(20) NOT NULL DEFAULT 'usuario' CHECK (perfil IN ('admin', 'usuario')),
                criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS PONTOS_COLETA (
                id_ponto SERIAL PRIMARY KEY,
                nome VARCHAR(150) NOT NULL,
                cidade VARCHAR(100) NOT NULL,
                endereco VARCHAR(255) NOT NULL,
                id_admin INTEGER NOT NULL REFERENCES USUARIOS(id_usuario) ON DELETE CASCADE,
                criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS MATERIAIS_ACEITOS (
                id_material SERIAL PRIMARY KEY,
                id_ponto INTEGER NOT NULL REFERENCES PONTOS_COLETA(id_ponto) ON DELETE CASCADE,
                nome_material VARCHAR(100) NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_pontos_cidade ON PONTOS_COLETA (LOWER(cidade));
            CREATE INDEX IF NOT EXISTS idx_materiais_ponto ON MATERIAIS_ACEITOS (id_ponto);
        `);

        // Semeia se vazio
        const usersCount = await client.query('SELECT COUNT(*) FROM USUARIOS');
        if (parseInt(usersCount.rows[0].count, 10) === 0) {
            const adminHash = bcrypt.hashSync('admin123', 10);
            const userHash = bcrypt.hashSync('usuario123', 10);

            const adminRes = await client.query(
                `INSERT INTO USUARIOS (nome, email, senha_hash, perfil) 
                 VALUES ($1, $2, $3, $4) RETURNING id_usuario`,
                ['Administrador EcoLixo Porto Velho', 'admin@ecolixo.com', adminHash, 'admin']
            );
            const adminId = adminRes.rows[0].id_usuario;

            await client.query(
                `INSERT INTO USUARIOS (nome, email, senha_hash, perfil) 
                 VALUES ($1, $2, $3, $4)`,
                ['Cidadão Porto Velho', 'usuario@ecolixo.com', userHash, 'usuario']
            );

            for (const p of memoryDb.pontos) {
                const pontoRes = await client.query(
                    `INSERT INTO PONTOS_COLETA (nome, cidade, endereco, id_admin) 
                     VALUES ($1, $2, $3, $4) RETURNING id_ponto`,
                    [p.nome, p.cidade, p.endereco, adminId]
                );
                const pontoId = pontoRes.rows[0].id_ponto;

                const mats = memoryDb.materiais.filter(m => m.id_ponto === p.id_ponto);
                for (const m of mats) {
                    await client.query(
                        `INSERT INTO MATERIAIS_ACEITOS (id_ponto, nome_material) VALUES ($1, $2)`,
                        [pontoId, m.nome_material]
                    );
                }
            }
            console.log('[EcoLixo Banco] Pontos de coleta de Porto Velho - RO inseridos no PostgreSQL.');
        }

        client.release();
    } catch (err) {
        console.warn('[EcoLixo Banco] Não foi possível conectar ao PostgreSQL:', err.message);
        console.warn('[EcoLixo Banco] Utilizando banco em memória com pontos reais de Porto Velho - RO.');
        useMemoryFallback = true;
    }
}

const db = {
    init: initDb,
    isMemory: () => useMemoryFallback,

    async findUserByEmail(email) {
        if (!useMemoryFallback && pool) {
            const res = await pool.query('SELECT * FROM USUARIOS WHERE LOWER(email) = LOWER($1)', [email]);
            return res.rows[0] || null;
        }
        return memoryDb.usuarios.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    },

    async findUserById(id) {
        if (!useMemoryFallback && pool) {
            const res = await pool.query('SELECT id_usuario, nome, email, perfil FROM USUARIOS WHERE id_usuario = $1', [id]);
            return res.rows[0] || null;
        }
        const user = memoryDb.usuarios.find(u => u.id_usuario === parseInt(id, 10));
        if (!user) return null;
        return { id_usuario: user.id_usuario, nome: user.nome, email: user.email, perfil: user.perfil };
    },

    async createUser({ nome, email, senha_hash, perfil = 'usuario' }) {
        if (!useMemoryFallback && pool) {
            const res = await pool.query(
                `INSERT INTO USUARIOS (nome, email, senha_hash, perfil) 
                 VALUES ($1, $2, $3, $4) 
                 RETURNING id_usuario, nome, email, perfil, criado_em`,
                [nome, email, senha_hash, perfil]
            );
            return res.rows[0];
        }
        const novoUsuario = {
            id_usuario: memoryDb.nextUserId++,
            nome,
            email,
            senha_hash,
            perfil,
            criado_em: new Date()
        };
        memoryDb.usuarios.push(novoUsuario);
        return {
            id_usuario: novoUsuario.id_usuario,
            nome: novoUsuario.nome,
            email: novoUsuario.email,
            perfil: novoUsuario.perfil,
            criado_em: novoUsuario.criado_em
        };
    },

    async getPontos({ cidade, termo } = {}) {
        if (!useMemoryFallback && pool) {
            let query = `
                SELECT 
                    p.id_ponto, p.nome, p.cidade, p.endereco, p.id_admin,
                    u.nome as admin_nome,
                    COALESCE(
                        json_agg(m.nome_material) FILTER (WHERE m.nome_material IS NOT NULL),
                        '[]'
                    ) as materiais
                FROM PONTOS_COLETA p
                LEFT JOIN USUARIOS u ON p.id_admin = u.id_usuario
                LEFT JOIN MATERIAIS_ACEITOS m ON p.id_ponto = m.id_ponto
            `;
            const conditions = [];
            const values = [];

            if (cidade && cidade.trim()) {
                values.push(`%${cidade.trim().toLowerCase()}%`);
                conditions.push(`LOWER(p.cidade) LIKE $${values.length}`);
            }

            if (termo && termo.trim()) {
                values.push(`%${termo.trim().toLowerCase()}%`);
                const idx = values.length;
                conditions.push(`(LOWER(p.nome) LIKE $${idx} OR LOWER(p.endereco) LIKE $${idx} OR LOWER(p.cidade) LIKE $${idx})`);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            query += ' GROUP BY p.id_ponto, u.nome ORDER BY p.id_ponto ASC';

            const res = await pool.query(query, values);
            return res.rows;
        }

        let result = memoryDb.pontos.map(p => {
            const admin = memoryDb.usuarios.find(u => u.id_usuario === p.id_admin);
            const materiais = memoryDb.materiais
                .filter(m => m.id_ponto === p.id_ponto)
                .map(m => m.nome_material);

            return {
                ...p,
                admin_nome: admin ? admin.nome : 'Administrador',
                materiais
            };
        });

        if (cidade && cidade.trim()) {
            const cLower = cidade.trim().toLowerCase();
            result = result.filter(p => p.cidade.toLowerCase().includes(cLower));
        }

        if (termo && termo.trim()) {
            const tLower = termo.trim().toLowerCase();
            result = result.filter(p => 
                p.nome.toLowerCase().includes(tLower) ||
                p.cidade.toLowerCase().includes(tLower) ||
                p.endereco.toLowerCase().includes(tLower)
            );
        }

        return result;
    },

    async getPontoById(id) {
        const idPonto = parseInt(id, 10);
        if (!useMemoryFallback && pool) {
            const res = await pool.query(`
                SELECT 
                    p.id_ponto, p.nome, p.cidade, p.endereco, p.id_admin,
                    u.nome as admin_nome,
                    COALESCE(
                        json_agg(m.nome_material) FILTER (WHERE m.nome_material IS NOT NULL),
                        '[]'
                    ) as materiais
                FROM PONTOS_COLETA p
                LEFT JOIN USUARIOS u ON p.id_admin = u.id_usuario
                LEFT JOIN MATERIAIS_ACEITOS m ON p.id_ponto = m.id_ponto
                WHERE p.id_ponto = $1
                GROUP BY p.id_ponto, u.nome
            `, [idPonto]);
            return res.rows[0] || null;
        }

        const ponto = memoryDb.pontos.find(p => p.id_ponto === idPonto);
        if (!ponto) return null;

        const admin = memoryDb.usuarios.find(u => u.id_usuario === ponto.id_admin);
        const materiais = memoryDb.materiais
            .filter(m => m.id_ponto === ponto.id_ponto)
            .map(m => m.nome_material);

        return {
            ...ponto,
            admin_nome: admin ? admin.nome : 'Administrador',
            materiais
        };
    },

    async getCidades() {
        if (!useMemoryFallback && pool) {
            const res = await pool.query('SELECT DISTINCT cidade FROM PONTOS_COLETA ORDER BY cidade ASC');
            return res.rows.map(r => r.cidade);
        }
        const unique = [...new Set(memoryDb.pontos.map(p => p.cidade))];
        return unique.sort();
    },

    async createPonto({ nome, cidade, endereco, id_admin, materiais = [] }) {
        if (!useMemoryFallback && pool) {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                const pontoRes = await client.query(
                    `INSERT INTO PONTOS_COLETA (nome, cidade, endereco, id_admin)
                     VALUES ($1, $2, $3, $4)
                     RETURNING id_ponto, nome, cidade, endereco, id_admin, criado_em`,
                    [nome, cidade, endereco, id_admin]
                );
                const novoPonto = pontoRes.rows[0];

                if (Array.isArray(materiais) && materiais.length > 0) {
                    for (const mat of materiais) {
                        if (mat && mat.trim()) {
                            await client.query(
                                `INSERT INTO MATERIAIS_ACEITOS (id_ponto, nome_material) VALUES ($1, $2)`,
                                [novoPonto.id_ponto, mat.trim()]
                            );
                        }
                    }
                }
                await client.query('COMMIT');
                novoPonto.materiais = materiais;
                return novoPonto;
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
            }
        }

        const novoPonto = {
            id_ponto: memoryDb.nextPontoId++,
            nome,
            cidade,
            endereco,
            id_admin: parseInt(id_admin, 10),
            criado_em: new Date()
        };
        memoryDb.pontos.push(novoPonto);

        if (Array.isArray(materiais)) {
            for (const mat of materiais) {
                if (mat && mat.trim()) {
                    memoryDb.materiais.push({
                        id_material: memoryDb.nextMaterialId++,
                        id_ponto: novoPonto.id_ponto,
                        nome_material: mat.trim()
                    });
                }
            }
        }

        return {
            ...novoPonto,
            materiais
        };
    },

    async updatePonto(id, { nome, cidade, endereco, materiais }) {
        const idPonto = parseInt(id, 10);
        if (!useMemoryFallback && pool) {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');
                const pontoRes = await client.query(
                    `UPDATE PONTOS_COLETA 
                     SET nome = $1, cidade = $2, endereco = $3, atualizado_em = CURRENT_TIMESTAMP
                     WHERE id_ponto = $4
                     RETURNING id_ponto, nome, cidade, endereco, id_admin`,
                    [nome, cidade, endereco, idPonto]
                );
                if (pontoRes.rowCount === 0) {
                    await client.query('ROLLBACK');
                    return null;
                }

                if (Array.isArray(materiais)) {
                    await client.query('DELETE FROM MATERIAIS_ACEITOS WHERE id_ponto = $1', [idPonto]);
                    for (const mat of materiais) {
                        if (mat && mat.trim()) {
                            await client.query(
                                `INSERT INTO MATERIAIS_ACEITOS (id_ponto, nome_material) VALUES ($1, $2)`,
                                [idPonto, mat.trim()]
                            );
                        }
                    }
                }
                await client.query('COMMIT');
                const pontoAtualizado = pontoRes.rows[0];
                pontoAtualizado.materiais = materiais;
                return pontoAtualizado;
            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
            }
        }

        const index = memoryDb.pontos.findIndex(p => p.id_ponto === idPonto);
        if (index === -1) return null;

        memoryDb.pontos[index].nome = nome;
        memoryDb.pontos[index].cidade = cidade;
        memoryDb.pontos[index].endereco = endereco;

        if (Array.isArray(materiais)) {
            memoryDb.materiais = memoryDb.materiais.filter(m => m.id_ponto !== idPonto);
            for (const mat of materiais) {
                if (mat && mat.trim()) {
                    memoryDb.materiais.push({
                        id_material: memoryDb.nextMaterialId++,
                        id_ponto: idPonto,
                        nome_material: mat.trim()
                    });
                }
            }
        }

        return {
            ...memoryDb.pontos[index],
            materiais: materiais || []
        };
    },

    async deletePonto(id) {
        const idPonto = parseInt(id, 10);
        if (!useMemoryFallback && pool) {
            const res = await pool.query('DELETE FROM PONTOS_COLETA WHERE id_ponto = $1', [idPonto]);
            return res.rowCount > 0;
        }
        const index = memoryDb.pontos.findIndex(p => p.id_ponto === idPonto);
        if (index === -1) return false;
        memoryDb.pontos.splice(index, 1);
        memoryDb.materiais = memoryDb.materiais.filter(m => m.id_ponto !== idPonto);
        return true;
    }
};

module.exports = db;
