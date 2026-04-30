const pool = require('../config/db');

exports.listarCentros = async (req, res) => {
    const { cidade } = req.query;

    try {
        let query = 'SELECT * FROM centros';
        let values = [];

        if (cidade) {
            query += ' WHERE LOWER(cidade) = LOWER($1)';
            values.push(cidade);
        }

        const result = await pool.query(query, values);

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao buscar centros' });
    }
};

exports.criarCentro = async (req, res) => {
    const { nome, cidade, tipo, rua, horario } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO centros (nome, cidade, tipo, rua, horario) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nome, cidade, tipo, rua, horario]
        );

        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao criar centro' });
    }
};

exports.atualizarCentro = async (req, res) => {
    const { id } = req.params;
    const { nome, cidade, tipo, rua, horario } = req.body;

    try {
        const result = await pool.query(
            'UPDATE centros SET nome = $1, cidade = $2, tipo = $3, rua = $4, horario = $5 WHERE id = $6 RETURNING *',
            [nome, cidade, tipo, rua, horario, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Centro nao encontrado' });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao atualizar centro' });
    }
};

exports.deletarCentro = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM centros WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ erro: 'Centro nao encontrado' });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao deletar centro' });
    }
};

