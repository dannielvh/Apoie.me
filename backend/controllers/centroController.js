const pool = require('../config/db');

exports.listarCentros = async (req, res) => {
    const { cidade } = req.query;

    try {
        let query = 'SELECT * FROM centros';
        let values = [];

        if (cidade) {
            query += `
                WHERE unaccent(lower(cidade)) 
                LIKE unaccent(lower($1))
            `;
            values.push(`%${cidade}%`);
        }

        const result = await pool.query(query, values);

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao buscar centros' });
    }
};