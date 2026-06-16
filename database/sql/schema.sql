-- EXTENSÕES

-- Usada para comparar textos ignorando acentos
-- Exemplo: Divinópolis = Divinopolis
CREATE EXTENSION IF NOT EXISTS unaccent;


-- TABELA DE USUÁRIOS

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,

    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(100) NOT NULL,

    cidade VARCHAR(100),

    -- Tipos possíveis:
    -- usuario = usuário comum
    -- admin = administrador do sistema
    role VARCHAR(20) DEFAULT 'usuario',

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- TABELA DE CENTROS DE APOIO

CREATE TABLE centros (
    id SERIAL PRIMARY KEY,

    nome VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    rua VARCHAR(150) NOT NULL,
    horario_abertura TIME,
    horario_fechamento TIME,

    cnpj VARCHAR(14),
    descricao TEXT,
    telefone VARCHAR(30),

    responsavel_nome VARCHAR(100),
    email_contato VARCHAR(100),

    -- Status possíveis:
    -- pendente = aguardando aprovação
    -- aprovado = liberado para aparecer no sistema
    -- rejeitado = recusado pelo administrador
    -- suspenso = bloqueado temporariamente
    status VARCHAR(20) DEFAULT 'pendente',

    -- Usuário que solicitou/cadastrou o centro
    usuario_id INT REFERENCES usuarios(id),

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- TABELA DE VOLUNTÁRIOS

CREATE TABLE voluntarios (
    id SERIAL PRIMARY KEY,

    -- Usuário que se candidatou como voluntário
    usuario_id INT REFERENCES usuarios(id) ON DELETE CASCADE,

    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(30) NOT NULL,
    email VARCHAR(100),
    cidade VARCHAR(100) NOT NULL,

    habilidades TEXT,
    disponibilidade TEXT,
    experiencia TEXT,
    observacao TEXT,

    -- Status possíveis:
    -- ativo = disponível para ser visto pelos centros
    -- inativo = candidatura desativada
    status VARCHAR(20) DEFAULT 'ativo',

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- TABELA DE CANDIDATURAS DE VOLUNTARIOS

CREATE TABLE candidaturas (
  id SERIAL PRIMARY KEY,

  usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  centro_id INT NOT NULL REFERENCES centros(id) ON DELETE CASCADE,

  status VARCHAR(20) DEFAULT 'pendente',
  data_candidatura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_candidatura_usuario_centro UNIQUE (usuario_id, centro_id),

  CONSTRAINT check_status_candidatura
  CHECK (status IN ('pendente', 'aprovada', 'rejeitada'))
);

CREATE TABLE pedidos_doacao (
  id SERIAL PRIMARY KEY,

  centro_id INT NOT NULL REFERENCES centros(id) ON DELETE CASCADE,

  titulo VARCHAR(100) NOT NULL,
  descricao TEXT,

  categoria VARCHAR(50) NOT NULL,

  quantidade_necessaria INT NOT NULL CHECK (quantidade_necessaria > 0),
  quantidade_recebida INT DEFAULT 0 CHECK (quantidade_recebida >= 0),

  urgencia VARCHAR(20) DEFAULT 'media',
  status VARCHAR(20) DEFAULT 'ativo',

  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT check_urgencia_pedido_doacao
  CHECK (urgencia IN ('baixa', 'media', 'alta', 'critica')),

  CONSTRAINT check_status_pedido_doacao
  CHECK (status IN ('ativo', 'atendido', 'cancelado')),

  CONSTRAINT check_quantidade_recebida
  CHECK (quantidade_recebida <= quantidade_necessaria)
);

-- ÍNDICES / REGRAS DE DUPLICIDADE

-- Evita cadastrar centros com mesmo nome na mesma cidade,
-- ignorando letras maiúsculas/minúsculas e acentos.
-- CREATE UNIQUE INDEX unique_centro_nome_cidade
-- ON centros (
--   unaccent(lower(nome)),
--   unaccent(lower(cidade))
-- );


-- Evita CNPJ duplicado, mas permite vários centros sem CNPJ.
-- Importante: CNPJ vazio deve ser salvo como NULL, não como ''.
CREATE UNIQUE INDEX unique_cnpj
ON centros (cnpj)
WHERE cnpj IS NOT NULL;


-- Evita que o mesmo usuário cadastre mais de um centro.
-- Use apenas se a regra do projeto for: 1 usuário representa 1 centro.
CREATE UNIQUE INDEX unique_centro_por_usuario
ON centros (usuario_id)
WHERE usuario_id IS NOT NULL;


-- Evita que o mesmo voluntário seja selecionado mais de uma vez
-- pelo mesmo centro.
-- CREATE UNIQUE INDEX unique_voluntario_por_centro

-- ON candidaturas (voluntario_id, centro_id);




-- Evita que o mesmo usuário tenha mais de uma candidatura ativa
-- como voluntário.
CREATE UNIQUE INDEX unique_voluntario_ativo_por_usuario
ON voluntarios (usuario_id)
WHERE status = 'ativo';


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

