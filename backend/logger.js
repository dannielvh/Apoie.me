const logsDeUso = [];
const logsDeErro = [];

function registrarUso(usuarioId, acao) {
  logsDeUso.push({
    id: logsDeUso.length + 1,
    usuarioId,
    acao,
    data: new Date().toISOString()
  });
}

function registrarErro(usuarioId, acao, mensagemErro) {
  logsDeErro.push({
    id: logsDeErro.length + 1,
    usuarioId,
    acao,
    mensagemErro,
    data: new Date().toISOString()
  });
}

function obterLogsDeUso() {
  return logsDeUso;
}

function obterLogsDeErro() {
  return logsDeErro;
}

module.exports = { registrarUso, registrarErro, obterLogsDeUso, obterLogsDeErro };
