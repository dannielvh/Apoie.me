// Aqui ficam as funções relacionadas aos centros, tanto para o usuário comum quanto para o admin, como criar, listar, atualizar e deletar centros, além de buscar o centro do usuário logado e atualizar seus dados.
// dep
const pool = require("../config/db");

// NORMALIZAR
function normalizar(texto) {
  return texto
    ?.toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// CNPJ (básico)
function validarCNPJ(cnpj) {
  if (!cnpj) return true;

  cnpj = cnpj.replace(/\D/g, "");

  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  return true;
}



// BUSCAR CENTRO COM ID DO USUÁRIO LOGADO
exports.buscarCentroUsuario = async (req, res) => {
  const usuarioId = req.usuario.id;

  try {
    const result = await pool.query(
      `SELECT 
        id,
        nome,
        cidade,
        tipo,
        rua,
        horario,
        telefone,
        email_contato,
        responsavel_nome,
        cnpj,
        descricao,
        status
       FROM centros
       WHERE usuario_id = $1
       ORDER BY id DESC
       LIMIT 1`,
      [usuarioId]
    );

    if (result.rows.length === 0) {
      return res.json({ temCentro: false });
    }

    res.json({
      temCentro: true,
      centro: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar centro do usuário" });
  }
};

// ATUALIZAR CENTRO DO USUÁRIO LOGADO
exports.atualizarMeuCentro = async (req, res) => {
  const usuarioId = req.usuario.id;

  let {
    nome,
    cidade,
    tipo,
    rua,
    horario,
    cnpj,
    descricao,
    telefone,
    responsavel_nome,
    email_contato
  } = req.body;

  try {
    // Busca o centro do usuário logado
    const centroExiste = await pool.query(
      `SELECT * FROM centros WHERE usuario_id = $1 LIMIT 1`,
      [usuarioId]
    );

    if (centroExiste.rows.length === 0) {
      return res.status(404).json({ erro: "Centro não encontrado" });
    }

    const centroAtual = centroExiste.rows[0];

    // Se o campo veio vazio/undefined, mantém o valor antigo
    nome = nome?.trim() || centroAtual.nome;
    cidade = cidade?.trim() || centroAtual.cidade;
    tipo = tipo?.trim() || centroAtual.tipo;
    rua = rua?.trim() || centroAtual.rua;
    horario = horario?.trim() || centroAtual.horario;
    descricao = descricao?.trim() || centroAtual.descricao;
    telefone = telefone?.trim() || centroAtual.telefone;
    email_contato = email_contato?.trim() || centroAtual.email_contato;
    responsavel_nome = responsavel_nome?.trim() || centroAtual.responsavel_nome;

    // CNPJ: se vier null ou vazio, mantém o antigo
    if (cnpj === undefined || cnpj === "" || cnpj === null) {
      cnpj = centroAtual.cnpj;
    } else {
      cnpj = cnpj.replace(/\D/g, "");
    }

    // Campos que não podem ficar vazios no resultado final
    if (!nome || !cidade || !tipo || !rua || !telefone || !responsavel_nome) {
      return res.status(400).json({ erro: "Campos obrigatórios" });
    }

    if (!validarCNPJ(cnpj)) {
      return res.status(400).json({ erro: "CNPJ inválido" });
    }

    // Verifica se o novo nome+cidade já existe em outro centro
    const duplicado = await pool.query(
      `SELECT 1 FROM centros
       WHERE unaccent(lower(nome)) = unaccent(lower($1))
       AND unaccent(lower(cidade)) = unaccent(lower($2))
       AND id <> $3`,
      [nome, cidade, centroAtual.id]
    );

    if (duplicado.rows.length > 0) {
      return res.status(400).json({
        erro: "Já existe outro centro com esse nome nessa cidade"
      });
    }

    const result = await pool.query(
      `UPDATE centros
       SET nome = $1,
           cidade = $2,
           tipo = $3,
           rua = $4,
           horario = $5,
           cnpj = $6,
           descricao = $7,
           telefone = $8,
           email_contato = $9,
           responsavel_nome = $10
       WHERE id = $11
       RETURNING *`,
      [
        nome,
        cidade,
        tipo,
        rua,
        horario,
        cnpj,
        descricao,
        telefone,
        email_contato,
        responsavel_nome,
        centroAtual.id
      ]
    );

    res.json({
      msg: "Centro atualizado com sucesso",
      centro: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao atualizar centro" });
  }
};


// CRUD ADMIN
// CRIAR
exports.criarCentro = async (req, res) => {
  let {
    nome,
    cidade,
    tipo,
    rua,
    horario,
    cnpj,
    descricao,
    telefone,
    responsavel_nome,
    email_contato,
  } = req.body;

  const usuarioId = req.usuario.id; // AQUI



  let cnpjTratado = cnpj ? cnpj : null;

  try {
    const centroDoUsuario = await pool.query(
      `SELECT 1 FROM centros WHERE usuario_id = $1 LIMIT 1`,
      [usuarioId]
    );

    if (centroDoUsuario.rows.length > 0) {
      return res.status(400).json({
        erro: "Você já possui um centro cadastrado"
      });
    }

    if (
      !nome ||
      !cidade ||
      !tipo ||
      !rua ||
      !responsavel_nome ||
      !email_contato
    ) {
      return res.status(400).json({ erro: "Campos obrigatórios" });
    }

    nome = nome.trim();
    cidade = cidade.trim();

    if (!validarCNPJ(cnpj)) {
      return res.status(400).json({ erro: "CNPJ inválido" });
    }

    const existe = await pool.query(
      `SELECT 1 FROM centros 
       WHERE unaccent(lower(nome)) = unaccent(lower($1))
       AND unaccent(lower(cidade)) = unaccent(lower($2))`,
      [nome, cidade],
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ erro: "Centro já existe" });
    }

    const result = await pool.query(
      `INSERT INTO centros 
      (nome, cidade, tipo, rua, horario, cnpj, descricao, telefone, status, responsavel_nome, email_contato, usuario_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pendente',$9,$10,$11)
      RETURNING *`,
      [
        nome,
        cidade,
        tipo,
        rua,
        horario,
        cnpjTratado,
        descricao,
        telefone,
        responsavel_nome,
        email_contato,
        usuarioId,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao criar centro" });
  }
};


// LISTAR  + NECESSIDADES (NOVA MODELAGEM)
exports.listarCentros = async (req, res) => {
  let { cidade } = req.query;

  try {


    let query = `
      SELECT 
        c.id_centro,
        c.nome,
        c.descricao,
        c.categoria,
        c.endereco,
        c.contato,
        c.validado,

        n.id_necessidade,
        n.nome_item,
        n.descricao AS necessidade_descricao,
        n.quantidade_necessaria,
        n.quantidade_arrecadada,
        n.urgencia

      FROM centro c

      /*
        LEFT JOIN:
        garante que centros apareçam mesmo sem necessidades
      */
      LEFT JOIN necessidade n
        ON c.id_centro = n.id_centro

      WHERE c.validado = true
    `;

    let values = [];

    // filtro opcional por cidade
    if (cidade) {
      query += ` AND LOWER(c.endereco) LIKE LOWER($1)`;
      values.push(`%${cidade}%`);
    }

    query += ` ORDER BY c.id_centro`;

    const result = await pool.query(query, values);

    /*
      PADRÃO NOVO DE RESPOSTA DA API
    */
    return res.json({
      sucesso: true,
      mensagem: "Centros listados com necessidades",
      dados: result.rows
    });

  } catch (err) {

    console.error("Erro ao listar centros:", err);

    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao buscar centros",
      dados: null
    });
  }
};

// ATUALIZAR
exports.atualizarCentro = async (req, res) => {
  const { id } = req.params;
  let { nome, cidade, tipo, rua, horario } = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({ erro: "ID inválido" });
  }

  if (!nome || !cidade || !tipo || !rua) {
    return res.status(400).json({ erro: "Campos obrigatórios" });
  }

  try {
    const existe = await pool.query("SELECT 1 FROM centros WHERE id=$1", [id]);

    if (existe.rows.length === 0) {
      return res.status(404).json({ erro: "Centro não encontrado" });
    }

    const result = await pool.query(
      `UPDATE centros
       SET nome=$1, cidade=$2, tipo=$3, rua=$4, horario=$5
       WHERE id=$6
       RETURNING *`,
      [nome.trim(), cidade.trim(), tipo, rua, horario, id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao atualizar" });
  }
};

// DELETE
exports.deletarCentro = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM centros WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Centro nao encontrado" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao deletar centro" });
  }
};


// APROVAR
exports.aprovarCentro = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE centros SET status='aprovado' WHERE id=$1 RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Centro não encontrado" });
    }

    res.json({ msg: "Centro aprovado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao aprovar" });
  }
};
