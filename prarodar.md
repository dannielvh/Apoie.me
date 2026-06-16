
# 🚀 Como rodar o projeto Apoie.me

Este guia mostra o passo a passo para rodar o projeto localmente.

---

## 1. Programas necessários

Antes de começar, instale:

- Node.js
- PostgreSQL
- pgAdmin
- VS Code
- Extensão Live Server no VS Code

---

## 2. Baixar o projeto

Clone o repositório:

```bash
git clone LINK_DO_REPOSITORIO
````

Entre na pasta do projeto:

```bash
cd NOME_DA_PASTA_DO_PROJETO
```

---

## 3. Instalar dependências do backend

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

---

## 4. Criar o banco de dados

Abra o pgAdmin.

Crie um banco com o nome:

```sql
CREATE DATABASE mapa_apoio;
```

Depois selecione esse banco e abra o **Query Tool**.

---

## 5. Criar as tabelas

Execute este SQL no banco `mapa_apoio`:

```sql

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
    horario VARCHAR(50),

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



```

---

## 6. Criar índices do banco

Execute também:

```sql
-- ÍNDICES / REGRAS DE DUPLICIDADE

-- Evita cadastrar centros com mesmo nome na mesma cidade,
-- ignorando letras maiúsculas/minúsculas e acentos.
CREATE UNIQUE INDEX unique_centro_nome_cidade
ON centros (
  unaccent(lower(nome)),
  unaccent(lower(cidade))
);


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
CREATE UNIQUE INDEX unique_voluntario_por_centro

ON candidaturas (voluntario_id, centro_id);




-- Evita que o mesmo usuário tenha mais de uma candidatura ativa
-- como voluntário.
CREATE UNIQUE INDEX unique_voluntario_ativo_por_usuario
ON voluntarios (usuario_id)
WHERE status = 'ativo';




```

---

## 7. Configurar conexão com o banco

Abra o arquivo:

```txt
backend/config/db.js
```

Deixe parecido com isso:

```js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mapa_apoio',
  password: 'SUA_SENHA_DO_POSTGRES',
  port: 5432,
});

module.exports = pool;
```

Troque:

```txt
SUA_SENHA_DO_POSTGRES
```

pela senha do seu PostgreSQL.

---

## 8. Rodar o backend

Dentro da pasta `backend`, rode:

```bash
node server.js
```

Se tiver script configurado, também pode usar:

```bash
npm start
```

O backend deve rodar em:

```txt
http://localhost:3000
```

Se aparecer algo como:

```txt
Servidor iniciado na porta 3000
```

deu certo.

---

## 9. Rodar o frontend

Abra o projeto no VS Code.

Entre na pasta:

```txt
frontend
```

Abra uma página, por exemplo:

```txt
frontend/pages/dashboard.html
```

Clique com o botão direito e escolha:

```txt
Open with Live Server
```

O frontend normalmente vai abrir em:

```txt
http://127.0.0.1:5500
```

---

## 10. Criar usuário pelo sistema

No frontend:

1. Abra a página de cadastro
2. Crie uma conta
3. Faça login
4. O token será salvo no navegador

---

## 11. Cadastrar centro de apoio

Depois de logar:

1. Vá para o dashboard
2. Clique em “Cadastrar centro de apoio”
3. Preencha o formulário
4. O centro será salvo com status:

```txt
pendente
```

---

## 12. Aprovar centro manualmente no banco

Enquanto ainda não existe painel admin, aprove manualmente pelo pgAdmin:

```sql
UPDATE centros
SET status = 'aprovado'
WHERE id = 1;
```

Troque o `id = 1` pelo id do centro criado.

Para ver os centros:

```sql
SELECT * FROM centros;
```

---

## 13. Testar painel do centro

Depois de aprovar o centro:

1. Volte para o dashboard
2. O botão deve mudar para gerenciar o centro
3. Acesse o painel do centro
4. Edite os dados em “Meu Centro”

---

## 14. Comandos úteis

Ver usuários:

```sql
SELECT * FROM usuarios;
```

Ver centros:

```sql
SELECT * FROM centros;
```

Ver centro de um usuário:

```sql
SELECT *
FROM centros
WHERE usuario_id = 1;
```

Limpar CNPJ vazio, se necessário:

```sql
UPDATE centros
SET cnpj = NULL
WHERE cnpj = '';
```

---

## 15. Erros comuns

### Backend não conecta no banco

Verifique o arquivo:

```txt
backend/config/db.js
```

Confira:

* nome do banco
* usuário
* senha
* PostgreSQL aberto

---

### Token não informado

Faça login novamente no sistema.

---

### Centro não aparece no mapa

Verifique se o centro está aprovado:

```sql
SELECT id, nome, status
FROM centros;
```

Se estiver `pendente`, aprove:

```sql
UPDATE centros
SET status = 'aprovado'
WHERE id = ID_DO_CENTRO;
```

---

### CNPJ duplicado

Se o CNPJ estiver vazio, ele precisa ser `NULL`, não string vazia.

Rode:

```sql
UPDATE centros
SET cnpj = NULL
WHERE cnpj = '';
```

---

## 16. Resumo rápido

```txt
1. cd backend
2. npm install
3. criar banco mapa_apoio
4. criar tabelas no pgAdmin
5. configurar backend/config/db.js
6. rodar node server.js
7. abrir frontend com Live Server
8. criar usuário
9. cadastrar centro
10. aprovar centro no banco
11. acessar painel do centro
```
