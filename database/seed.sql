-- ==========================================================
-- EcoLixo - Carga Inicial de Dados Reais de Porto Velho - RO
-- Senhas padrão (bcrypt hash):
--   admin@ecolixo.com   -> admin123
--   usuario@ecolixo.com -> usuario123
-- ==========================================================

-- Usuários iniciais
INSERT INTO USUARIOS (id_usuario, nome, email, senha_hash, perfil)
VALUES 
    (1, 'Administrador EcoLixo Porto Velho', 'admin@ecolixo.com', '$2a$10$fV3qU7p7Cj6bZgZgqD58ve61zXw5KxO/4i8C/J5/2G3u3U2uK1.G.', 'admin'),
    (2, 'Cidadão Porto Velho', 'usuario@ecolixo.com', '$2a$10$fV3qU7p7Cj6bZgZgqD58ve61zXw5KxO/4i8C/J5/2G3u3U2uK1.G.', 'usuario')
ON CONFLICT (email) DO NOTHING;

-- Pontos de Coleta Reais em Porto Velho - RO (cadastrados pelo admin)
INSERT INTO PONTOS_COLETA (id_ponto, nome, cidade, endereco, id_admin)
VALUES
    (
        1, 
        'Prefeitura de Porto Velho - Ponto SESB / SEINFRA', 
        'Porto Velho', 
        'Rua Aparício Moraes, 3186 - Bairro Industrial, Porto Velho - RO (Seg a Sex: 7h às 14h)', 
        1
    ),
    (
        2, 
        'Central de Logística Reversa - Cooperativa CATANORTE', 
        'Porto Velho', 
        'BR-364, KM 11 - Estrada da Rema, s/nº - Bairro Vila Princesa, Porto Velho - RO', 
        1
    ),
    (
        3, 
        'Porto Velho Shopping - Ecoponto PEV ABREE', 
        'Porto Velho', 
        'Av. Prefeito Chiquilito Soares, 1176 - Bairro Flodoaldo Pontes Pinto, Porto Velho - RO', 
        1
    ),
    (
        4, 
        'SEMA - Secretaria Municipal de Meio Ambiente', 
        'Porto Velho', 
        'Rua General Osório, 81 - Bairro Centro, Porto Velho - RO', 
        1
    ),
    (
        5, 
        'SEDAM - Secretaria de Estado do Desenvolvimento Ambiental', 
        'Porto Velho', 
        'Av. Farquar, 2986 - Bairro Pedrinhas (Complexo Rio Madeira), Porto Velho - RO', 
        1
    ),
    (
        6, 
        'IFRO Campus Porto Velho Calama - Ponto de E-Lixo', 
        'Porto Velho', 
        'Av. Calama, 4985 - Bairro Flodoaldo Pontes Pinto, Porto Velho - RO', 
        1
    ),
    (
        7, 
        'Ponto Coletor de Pilhas e Baterias - Zona Sul', 
        'Porto Velho', 
        'Av. Jatuarana, 4520 - Bairro Nova Floresta, Porto Velho - RO', 
        1
    )
ON CONFLICT (id_ponto) DO UPDATE SET
    nome = EXCLUDED.nome,
    cidade = EXCLUDED.cidade,
    endereco = EXCLUDED.endereco;

-- Materiais Aceitos por Ponto em Porto Velho
DELETE FROM MATERIAIS_ACEITOS WHERE id_ponto IN (1, 2, 3, 4, 5, 6, 7);

INSERT INTO MATERIAIS_ACEITOS (id_ponto, nome_material)
VALUES
    -- Ponto 1: Prefeitura / SESB
    (1, 'Celulares e Carregadores'),
    (1, 'Computadores e Laptops'),
    (1, 'Monitores e TVs antigas'),
    (1, 'Impressoras e Periféricos'),
    (1, 'Cabos, Fios e Carregadores'),
    (1, 'Pequenos Eletrodomésticos'),

    -- Ponto 2: CATANORTE
    (2, 'Computadores, Servidores e Fontes'),
    (2, 'Placas Eletrônicas e Componentes'),
    (2, 'Monitores LCD, LED e CRT'),
    (2, 'Linha Branca e Eletrodomésticos'),
    (2, 'Equipamentos de Telecomunicações'),
    (2, 'Baterias Nobreak e Chumbo'),

    -- Ponto 3: Porto Velho Shopping
    (3, 'Celulares e Smartphones'),
    (3, 'Tablets e E-readers'),
    (3, 'Pilhas e Baterias Portáteis'),
    (3, 'Fones de Ouvido e Cabos USB'),
    (3, 'Pequenos Eletroportáteis'),

    -- Ponto 4: SEMA
    (4, 'Celulares e Telefones velhos'),
    (4, 'Pilhas e Baterias Domésticas'),
    (4, 'Carregadores e Cabos Diversos'),
    (4, 'Pequenos Eletroeletrônicos'),

    -- Ponto 5: SEDAM
    (5, 'Computadores e Notebooks'),
    (5, 'Monitores e Telas'),
    (5, 'Aparelhos de Som e DVDs'),
    (5, 'Materiais de Campanhas Estaduais'),

    -- Ponto 6: IFRO Calama
    (6, 'Computadores e Desktops'),
    (6, 'Placas-Mãe e Memórias'),
    (6, 'Teclados e Mouses'),
    (6, 'Cabos de Rede e de Força'),
    (6, 'Celulares para Ensino e Reciclagem'),

    -- Ponto 7: Zona Sul
    (7, 'Pilhas Comuns e Alcalinas'),
    (7, 'Baterias de Celular e Íon de Lítio'),
    (7, 'Baterias Recarregáveis'),
    (7, 'Carregadores de Tomada');

SELECT setval(pg_get_serial_sequence('USUARIOS', 'id_usuario'), COALESCE(MAX(id_usuario), 1)) FROM USUARIOS;
SELECT setval(pg_get_serial_sequence('PONTOS_COLETA', 'id_ponto'), COALESCE(MAX(id_ponto), 1)) FROM PONTOS_COLETA;
SELECT setval(pg_get_serial_sequence('MATERIAIS_ACEITOS', 'id_material'), COALESCE(MAX(id_material), 1)) FROM MATERIAIS_ACEITOS;
