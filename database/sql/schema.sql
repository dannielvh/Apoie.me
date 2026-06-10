-- Tabela de cidades
CREATE TABLE cidade (
    id_cidade SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    estado VARCHAR(50) NOT NULL
);

-- Tabela de centros de doação
CREATE TABLE centro (
    id_centro SERIAL PRIMARY KEY NOT NULL,
    nome VARCHAR(100) NOT NULL,
    endereco TEXT NOT NULL,
    id_cidade INT NOT NULL,
	
    FOREIGN KEY (id_cidade) REFERENCES cidade(id_cidade)
);

-- Tabela de doações
CREATE TABLE doacao (
    id_doacao SERIAL PRIMARY KEY NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    data TIMESTAMP NOT NULL DEFAULT CURRENT_DATE,
    id_centro INT NOT NULL,
	
    FOREIGN KEY (id_centro) REFERENCES centro(id_centro)
);

-- Tabela de voluntários
CREATE TABLE voluntario (
    id_voluntario SERIAL PRIMARY KEY NOT NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

-- Tabela de voluntariado
CREATE TABLE voluntariado (
    id_voluntario INT NOT NULL,
    id_centro INT NOT NULL,
    data_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_DATE,
	
    PRIMARY KEY (id_voluntario, id_centro),
    FOREIGN KEY (id_voluntario) REFERENCES voluntario(id_voluntario),
    FOREIGN KEY (id_centro) REFERENCES centro(id_centro)
);

-- Alterando tabela centro
ALTER TABLE centro
ADD COLUMN descricao TEXT,
ADD COLUMN categoria VARCHAR(50),
ADD COLUMN contato VARCHAR(100),
ADD COLUMN validado BOOLEAN DEFAULT FALSE;

-- tabela de necessidades
CREATE TABLE necessidade (
    id_necessidade SERIAL PRIMARY KEY,

    id_centro INT NOT NULL,

    nome_item VARCHAR(100) NOT NULL,
    descricao TEXT,

    quantidade_necessaria INT NOT NULL CHECK (quantidade_necessaria > 0),
    quantidade_arrecadada INT DEFAULT 0 CHECK (quantidade_arrecadada >= 0),

    urgencia VARCHAR(20), -- baixa, media, alta

    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_centro) REFERENCES centro(id_centro) ON DELETE CASCADE
);


-- inserindo dados das cidades
INSERT INTO cidade (nome, estado) VALUES
('Belo Horizonte', 'MG'),
('Contagem', 'MG'),
('Betim', 'MG'),
('Ribeirão das Neves', 'MG'),
('Nova Lima', 'MG');

-- inserindo dados dos centros
INSERT INTO centro (nome, endereco, id_cidade, descricao, categoria, contato, validado) VALUES

    ('Centro Solidário Vida Nova',
    'Rua das Flores, 120',
    1,
    'Apoio a famílias em situação de vulnerabilidade com distribuição de cestas básicas',
    'alimentação',
    '(31) 99999-1111',
    true),

    ('Casa de Apoio Esperança',
    'Av. Amazonas, 450',
    1,
    'Acolhimento temporário para pessoas em situação de rua',
    'social',
    '(31) 98888-2222',
    true),

    ('Instituto Luz do Amanhã',
    'Rua Central, 89',
    2,
    'Projetos educacionais para crianças e adolescentes',
    'educação',
    '(31) 97777-3333',
    true),

    ('Centro de Saúde Comunitário Bem Viver',
    'Rua Saúde, 300',
    3,
    'Atendimento básico de saúde para população carente',
    'saúde',
    '(31) 96666-4444',
    true),

    ('Projeto Mãos Unidas',
    'Rua Esperança, 50',
    4,
    'Distribuição de roupas e apoio emergencial',
    'doações',
    '(31) 95555-5555',
    false),

    ('Lar Infantil Sorriso Feliz',
    'Rua das Crianças, 200',
    1,
    'Acolhimento de crianças em situação de risco',
    'infantil',
    '(31) 94444-6666',
    true),

    ('Banco de Alimentos Solidário',
    'Av. Brasil, 780',
    2,
    'Arrecadação e redistribuição de alimentos',
    'alimentação',
    '(31) 93333-7777',
    true),

    ('Centro Educacional Futuro',
    'Rua Saber, 15',
    5,
    'Reforço escolar e inclusão digital',
    'educação',
    '(31) 92222-8888',
    false),

    ('Abrigo Noite Segura',
    'Rua Acolhimento, 90',
    4,
    'Abrigo noturno para pessoas em situação de rua',
    'social',
    '(31) 91111-9999',
    true),

    ('Clínica Popular Vida',
    'Rua Saúde Integral, 60',
    3,
    'Consultas médicas a baixo custo',
    'saúde',
    '(31) 90000-0000',
    true);


-- inserindo necessidades
INSERT INTO necessidade 
(id_centro, nome_item, descricao, quantidade_necessaria, quantidade_arrecadada, urgencia)
VALUES

    -- Centro 1
    (1, 'Cesta básica', 'Alimentos não perecíveis', 100, 40, 'alta'),
    (1, 'Leite', 'Caixas de leite integral', 200, 120, 'media'),

    -- Centro 2
    (2, 'Cobertores', 'Cobertores para inverno', 80, 20, 'alta'),
    (2, 'Produtos de higiene', 'Sabonete, pasta de dente', 150, 60, 'alta'),

    -- Centro 3
    (3, 'Material escolar', 'Cadernos, lápis, canetas', 120, 70, 'media'),

    -- Centro 4
    (4, 'Medicamentos básicos', 'Analgésicos e antitérmicos', 90, 30, 'alta'),

    -- Centro 5
    (5, 'Roupas', 'Roupas em bom estado', 200, 150, 'baixa'),

    -- Centro 6
    (6, 'Fraldas', 'Fraldas infantis', 180, 50, 'alta'),

    -- Centro 7
    (7, 'Arroz', 'Pacotes de arroz 5kg', 300, 200, 'media'),

    -- Centro 8
    (8, 'Computadores', 'Equipamentos para inclusão digital', 20, 5, 'alta'),

    -- Centro 9
    (9, 'Colchões', 'Colchões simples', 50, 10, 'alta'),

    -- Centro 10
    (10, 'Consultas médicas', 'Atendimento clínico básico', 100, 40, 'media');