const express = require('express');
const cors = require('cors');

const app = express();

// Permite que o frontend acesse a API (evita bloqueio CORS)
app.use(cors());

// Permite trabalhar com JSON nas requisições
app.use(express.json());

/*
 * Rota principal para testar se a API está funcionando
 */
app.get('/', (req, res) => {
    res.send('API rodando');
});

/*
 * Endpoint GET /centros
 * 
 * - Sem parâmetro: retorna todos os centros
 * - Com ?cidade=... : filtra os centros pela cidade informada
 */
const centros = [
    { id: 1, nome: "Centro A", cidade: "Belo Horizonte" },
    { id: 2, nome: "Centro B", cidade: "Contagem" },
    { id: 3, nome: "Centro C", cidade: "Belo Horizonte" }
]; //testes

app.get('/centros', (req, res) => {
    const { cidade } = req.query;

    // Se o parâmetro cidade for informado, aplica filtro
    if (cidade) {
        const filtrados = centros.filter(c =>
            c.cidade.toLowerCase() === cidade.toLowerCase()
        );

        return res.json(filtrados);
    }

    // Caso contrário, retorna todos os centros
    res.json(centros);
});

/*
 * Inicializa o servidor na porta 3000
 */
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});