const express = require('express');
const router = express.Router();

router.post('/doacao', (req, res) => {
  const token = req.headers.authorization;
  const { valor } = req.body;

  if (!token) {
    return res.status(401).json({ msg: "Usuário não está logado" });
  }

  if (!valor) {
    return res.status(400).json({ msg: "Valor da doação é obrigatório" });
  }

  res.json({ msg: "Doação realizada com sucesso" });
});

module.exports = router;