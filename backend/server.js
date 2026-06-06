/**
 * ============================================================================
 * APOIE.ME - SERVIDOR PRINCIPAL (BACKEND)
 * ============================================================================
 * Arquivo de inicialização da API RESTful, responsável pela configuração do 
 * ecossistema Express, middlewares globais, roteamento modular e injeção de 
 * dependências para integração de serviços.
 */

const express = require('express');
const cors = require('cors');

const app = express();

// ==========================================
// MIDDLEWARES GLOBAIS
// ==========================================

// Permite requisições de origens diferentes (CORS), essencial para a comunicação Front-to-Back local
app.use(cors());

// Habilita o parse automático de payloads em formato JSON no corpo das requisições (req.body)
app.use(express.json());

// ==========================================
// DEFINIÇÃO DE ROTAS MODULARES (ENDPOINTS)
// ==========================================

/**
 * Rotas de Autenticação e Usuários
 * @path /api
 */
const usuarioRoutes = require('./routes/usuarioRoutes');
app.use('/api', usuarioRoutes);

/**
 * Rotas de Gerenciamento e Cadastro de Centros de Apoio
 * @path /api
 */
const centroRoutes = require('./routes/centroRoutes');
app.use('/api', centroRoutes);

/**
 * Rotas do Programa de Voluntariado
 * Gerencia a busca de localidades, carregamento dinâmico de postos e submissão de candidaturas
 * @path /api/voluntarios
 */
const voluntarioRoutes = require('./routes/voluntarioRoutes');
app.use('/api/voluntarios', voluntarioRoutes); 

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR HTTP
// ==========================================

const PORT = 3000;
app.listen(PORT, () => {
     console.log(`[SERVER] Servidor rodando com sucesso e escutando na porta ${PORT}`);
});