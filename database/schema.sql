-- ==========================================================
-- EcoLixo - Script de Criação do Banco de Dados PostgreSQL
-- Versão 1.0 | Modelo de Dados (DER Simplificado)
-- ==========================================================

-- Tabela 1: USUARIOS
CREATE TABLE IF NOT EXISTS USUARIOS (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    perfil VARCHAR(20) NOT NULL DEFAULT 'usuario' CHECK (perfil IN ('admin', 'usuario')),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela 2: PONTOS_COLETA
CREATE TABLE IF NOT EXISTS PONTOS_COLETA (
    id_ponto SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    id_admin INTEGER NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pontos_admin FOREIGN KEY (id_admin) REFERENCES USUARIOS(id_usuario) ON DELETE CASCADE
);

-- Tabela 3: MATERIAIS_ACEITOS
CREATE TABLE IF NOT EXISTS MATERIAIS_ACEITOS (
    id_material SERIAL PRIMARY KEY,
    id_ponto INTEGER NOT NULL,
    nome_material VARCHAR(100) NOT NULL,
    CONSTRAINT fk_materiais_ponto FOREIGN KEY (id_ponto) REFERENCES PONTOS_COLETA(id_ponto) ON DELETE CASCADE
);

-- Índices para otimização de busca por cidade (RNF05: resposta rápida)
CREATE INDEX IF NOT EXISTS idx_pontos_cidade ON PONTOS_COLETA (LOWER(cidade));
CREATE INDEX IF NOT EXISTS idx_materiais_ponto ON MATERIAIS_ACEITOS (id_ponto);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON USUARIOS (email);
