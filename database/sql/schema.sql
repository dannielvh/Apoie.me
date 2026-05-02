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