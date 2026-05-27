// Importa a biblioteca jsonwebtoken.
// Ela é usada para verificar se o token enviado pelo usuário é válido.
const jwt = require("jsonwebtoken");

/*
  Middleware de autenticação.

  Middleware é uma função que roda ANTES da rota final.

  Exemplo de uso:
  router.post("/centros", autenticar, centroController.criarCentro);

  Fluxo:
  1. Usuário faz login
  2. Backend gera um token
  3. Frontend salva esse token
  4. Em rotas protegidas, frontend envia o token
  5. Esse middleware verifica se o token é válido
*/
function autenticar(req, res, next) {
  /*
    Pega o token que vem no cabeçalho da requisição.

    O frontend deve enviar assim:

    Authorization: Bearer TOKEN_AQUI

    Exemplo:
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR...
  */
  const authHeader = req.headers.authorization;

  // Se não veio o cabeçalho Authorization, o usuário não enviou token.
  if (!authHeader) {
    return res.status(401).json({ erro: "Token não informado" });
  }

  /*
    Divide o texto do Authorization.

    Exemplo:
    "Bearer abc123"

    authHeader.split(" ") vira:
    ["Bearer", "abc123"]

    Como só precisamos do token, ignoramos a primeira parte usando vírgula:
    const [, token]
  */
  const [, token] = authHeader.split(" ");

  // Se não existir token depois do Bearer, retorna erro.
  if (!token) {
    return res.status(401).json({ erro: "Token inválido" });
  }

  try {
    /*
      Verifica se o token é válido.

      "segredo" precisa ser o mesmo segredo usado na hora do login:

      jwt.sign(..., "segredo", ...)

      Se o token for válido, ele retorna os dados salvos dentro dele.
      Exemplo:
      {
        id: 1,
        email: "teste@gmail.com"
      }
    */
    const decoded = jwt.verify(token, "segredo");

    /*
      Guarda os dados do usuário dentro da requisição.

      Isso permite usar depois no controller:

      req.usuario.id
      req.usuario.email

      Exemplo:
      const usuarioId = req.usuario.id;
    */
    req.usuario = decoded;

    /*
      Libera a requisição para continuar.

      Sem o next(), a rota fica travada aqui.
    */
    next();
  } catch (err) {
    /*
      Se cair aqui, significa que:
      - token expirou
      - token foi alterado
      - token é falso
      - segredo está diferente
    */
    return res.status(401).json({ erro: "Token expirado ou inválido" });
  }
}

// Exporta o middleware para poder usar nas rotas.
module.exports = autenticar;