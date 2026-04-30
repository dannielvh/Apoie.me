# 🚀 SETUP DO PROJETO


## 1. INSTALAR DEPENDÊNCIAS

```bash
cd backend
npm install
```

---

## 2. CONFIGURAR POSTGRESQL

👉 abre o PostgreSQL (pgAdmin ou terminal)

### criar banco (se não tiver)

```sql
CREATE DATABASE mapa_apoio;
```

---

## 3. CRIAR TABELAS

### 🔹 tabela de usuários

```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    senha VARCHAR(100),
    cidade VARCHAR(100)
);
```

---

### 🔹 tabela de centros (NOVO)

```sql
CREATE TABLE centros (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    cidade VARCHAR(100),
    tipo VARCHAR(100),
    rua VARCHAR(150),
    horario VARCHAR(50)
);
```

---

### 🔹 inserir dados fake (IMPORTANTE pra testar)

```sql
INSERT INTO centros (nome, cidade, tipo, rua, horario) VALUES
('Centro Apoio Divinópolis', 'Divinópolis', 'Abrigo', 'Rua A, 123', '08h-18h'),
('Posto Saúde BH', 'Belo Horizonte', 'Saúde', 'Av Brasil, 456', '24h'),
('Centro Itaúna', 'Itaúna', 'Doações', 'Rua Central, 101', '09h-17h');
```

---

## 5. CONFIGURAR CONEXÃO COM BANCO

📁 `backend/config/db.js`

👉 troca usuário e senha:

```js
const pool = new Pool({
  user: 'seu_usuario',
  host: 'localhost',
  database: 'mapa_apoio',
  password: 'sua_senha',
  port: 5432,
});
```

---

## 6. RODAR BACKEND

```bash
cd backend
node server.js
```

👉 servidor rodando em:

```
http://localhost:3000
```

---

## 7. FRONTEND

👉 abre a pasta `frontend`

👉 roda com **Live Server**

---

## 8. COMO FUNCIONA AGORA

### 🔹 cidades

* vêm da API do IBGE automaticamente
* não precisa salvar no banco

---

### 🔹 centros

* vêm do seu banco PostgreSQL
* filtrados por cidade

---

### 🔹 busca inteligente

* funciona sem acento
* funciona digitando
* funciona clicando

---

# ⚠️ ERROS COMUNS (FOCA AQUI)

* ❌ esquecer de ligar o PostgreSQL
* ❌ senha errada no `db.js`
* ❌ backend não rodando
* ❌ porta errada no fetch

---

# 🎯 RESUMO

👉 IBGE → lista de cidades
👉 PostgreSQL → centros
👉 Backend → filtra
👉 Front → busca + renderiza

