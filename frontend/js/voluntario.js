// ===============================
// PROTEÇÃO DA PÁGINA
// ===============================
const token = localStorage.getItem("token");

if (!token) {
  alert("Você precisa estar logado para se candidatar como voluntário.");
  window.location.href = "login.html";
}

// ===============================
// ELEMENTOS DA PÁGINA
// ===============================
const form = document.getElementById("form-candidatura");
const msg = document.getElementById("msg");

const selectCidade = document.getElementById("select-cidade");
const selectCentro = document.getElementById("select-centro");

const containerCandidaturas = document.getElementById("container-candidaturas");

const inputNome = document.getElementById("nome");
const inputEmail = document.getElementById("email");
const inputTelefone = document.getElementById("telefone");
const inputHabilidades = document.getElementById("habilidades");

// Se esses campos existirem no HTML, o JS usa.
// Se não existirem, ele usa valores padrão.
const inputDisponibilidade = document.getElementById("disponibilidade");
const inputExperiencia = document.getElementById("experiencia");
const inputObservacao = document.getElementById("observacao");

let centrosCarregados = [];

// ===============================
// FUNÇÕES AUXILIARES
// ===============================
function mostrarMensagem(texto, cor) {
  msg.textContent = texto;
  msg.style.color = cor;
}

function normalizar(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function formatarStatus(status) {
  const statusMap = {
    pendente: "Pendente",
    aprovada: "Aprovada",
    rejeitada: "Rejeitada",
  };

  return statusMap[status] || status || "Pendente";
}

function pegarUsuarioLogado() {
  const userStorage =
    localStorage.getItem("user") || localStorage.getItem("usuario");

  if (!userStorage) return null;

  try {
    return JSON.parse(userStorage);
  } catch (err) {
    return null;
  }
}

// ===============================
// CARREGAR CENTROS
// ===============================
async function carregarCentros() {
  try {
    const res = await fetch("http://localhost:3000/api/centros", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(data.erro || "Erro ao carregar centros");
      return;
    }

    // Aceita tanto resposta em array quanto resposta dentro de dados
    centrosCarregados = Array.isArray(data) ? data : data.dados || [];

    // Mostra apenas centros aprovados, se o campo status existir
    centrosCarregados = centrosCarregados.filter((centro) => {
      if (!centro.status) return true;
      return centro.status === "aprovado";
    });

    carregarCidades();
  } catch (err) {
    console.error("Erro ao carregar centros:", err);
  }
}

// ===============================
// CARREGAR CIDADES A PARTIR DOS CENTROS
// ===============================
function carregarCidades() {
  selectCidade.innerHTML = '<option value="">Selecione sua cidade</option>';

  const cidadesUnicas = [];

  centrosCarregados.forEach((centro) => {
    const cidade = centro.cidade;

    if (!cidade) return;

    const jaExiste = cidadesUnicas.some((c) => {
      return normalizar(c) === normalizar(cidade);
    });

    if (!jaExiste) {
      cidadesUnicas.push(cidade);
    }
  });

  cidadesUnicas.sort();

  cidadesUnicas.forEach((cidade) => {
    const option = document.createElement("option");
    option.value = cidade;
    option.textContent = cidade;
    selectCidade.appendChild(option);
  });
}

// ===============================
// CARREGAR CENTROS PELA CIDADE
// ===============================
selectCidade.addEventListener("change", () => {
  const cidadeSelecionada = selectCidade.value;

  selectCentro.innerHTML =
    '<option value="">Selecione um centro de apoio</option>';

  if (!cidadeSelecionada) {
    selectCentro.disabled = true;
    return;
  }

  const centrosDaCidade = centrosCarregados.filter((centro) => {
    return normalizar(centro.cidade) === normalizar(cidadeSelecionada);
  });

  if (centrosDaCidade.length === 0) {
    selectCentro.disabled = true;
    selectCentro.innerHTML =
      '<option value="">Nenhum centro disponível nesta cidade</option>';
    return;
  }

  selectCentro.disabled = false;

  centrosDaCidade.forEach((centro) => {
    const option = document.createElement("option");

    // No backend novo o campo normalmente é id
    option.value = centro.id;

    option.textContent = centro.nome;

    selectCentro.appendChild(option);
  });
});

// ===============================
// MÁSCARA DE TELEFONE
// ===============================
if (inputTelefone) {
  inputTelefone.addEventListener("input", (e) => {
    let v = e.target.value.replace(/\D/g, "");

    if (v.length <= 10) {
      v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
      v = v.replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
      v = v.replace(/(\d{5})(\d)/, "$1-$2");
    }

    e.target.value = v.slice(0, 15);
  });
}

// ===============================
// CADASTRAR OU GARANTIR PERFIL DE VOLUNTÁRIO
// ===============================
async function salvarPerfilVoluntario(dadosVoluntario) {
  try {
    const res = await fetch("http://localhost:3000/api/voluntarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dadosVoluntario),
    });

    const data = await res.json();

    if (!res.ok) {
      const erro = data.erro || data.msg || "";

      // Se o usuário já tem perfil de voluntário, não precisa bloquear.
      // Pode seguir e criar a candidatura.
      if (
        erro.includes("já possui cadastro") ||
        erro.includes("já possui") ||
        erro.includes("já cadastrado")
      ) {
        return true;
      }

      mostrarMensagem(erro || "Erro ao salvar perfil de voluntário.", "red");
      return false;
    }

    return true;
  } catch (err) {
    console.error("Erro ao salvar perfil de voluntário:", err);
    mostrarMensagem("Erro ao salvar perfil de voluntário.", "red");
    return false;
  }
}

// ===============================
// CRIAR CANDIDATURA
// ===============================
async function criarCandidatura(centroId) {
  try {
    const res = await fetch("http://localhost:3000/api/candidaturas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        centro_id: Number(centroId),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarMensagem(
        data.erro || data.msg || "Erro ao enviar candidatura.",
        "red",
      );
      return false;
    }

    mostrarMensagem("Candidatura enviada com sucesso!", "green");
    return true;
  } catch (err) {
    console.error("Erro ao criar candidatura:", err);
    mostrarMensagem("Erro na requisição.", "red");
    return false;
  }
}

// ===============================
// SUBMIT DO FORMULÁRIO
// ===============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const cidadeSelecionada = selectCidade.value.trim();
  const centroId = selectCentro.value;

  const dadosVoluntario = {
    nome: inputNome.value.trim(),
    email: inputEmail.value.trim(),
    telefone: inputTelefone.value.trim(),
    cidade: cidadeSelecionada,

    // Campo específico para habilidades separadas por vírgula
    habilidades: inputHabilidades.value.trim(),

    // Como não temos campo separado no HTML,
    // disponibilidade fica com valor padrão
    disponibilidade: "Informada na descrição",

    // Como não temos campo separado no HTML,
    // experiência fica vazia
    experiencia: "",

    // Campo de descrição geral
    // Aqui a pessoa informa disponibilidade, experiência e observações
    observacao: inputObservacao.value.trim(),
  };

  if (
    !dadosVoluntario.nome ||
    !dadosVoluntario.email ||
    !dadosVoluntario.telefone ||
    !dadosVoluntario.cidade ||
    !centroId ||
    !dadosVoluntario.habilidades ||
    !dadosVoluntario.observacao
  ) {
    mostrarMensagem("Preencha os campos obrigatórios.", "red");
    return;
  }

  mostrarMensagem("Enviando candidatura...", "#555");

  const perfilSalvo = await salvarPerfilVoluntario(dadosVoluntario);

  if (!perfilSalvo) return;

  const candidaturaCriada = await criarCandidatura(centroId);

  if (!candidaturaCriada) return;

  form.reset();

  selectCentro.disabled = true;
  selectCentro.innerHTML =
    '<option value="">Selecione um centro de apoio</option>';

  carregarCandidaturas();
});

// ===============================
// VISUALIZAR CANDIDATURAS DO USUÁRIO
// ===============================
async function carregarCandidaturas() {
  if (!containerCandidaturas) return;

  containerCandidaturas.innerHTML = "<p>Carregando candidaturas...</p>";

  try {
    const res = await fetch("http://localhost:3000/api/candidaturas", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      containerCandidaturas.innerHTML = "<p>Erro ao carregar candidaturas.</p>";
      return;
    }

    let candidaturas = Array.isArray(data) ? data : [];

    const usuarioLogado = pegarUsuarioLogado();

    // Se tiver usuário no localStorage, filtra para mostrar só as candidaturas dele
    if (usuarioLogado && usuarioLogado.id) {
      candidaturas = candidaturas.filter((cand) => {
        return Number(cand.usuario_id) === Number(usuarioLogado.id);
      });
    }

    if (candidaturas.length === 0) {
      containerCandidaturas.innerHTML =
        "<p>Nenhuma candidatura enviada ainda.</p>";
      return;
    }

    containerCandidaturas.innerHTML = "";

    candidaturas.forEach((cand) => {
      const card = document.createElement("div");
      card.className = "card-candidatura";

      const nomeCentro = cand.centro_nome || "Centro não identificado";
      const habilidades = cand.habilidades || "Não informado";
      const status = cand.status || "pendente";

      card.innerHTML = `
        <h4>${nomeCentro}</h4>

        <p>
          <strong>Habilidades:</strong>
          ${habilidades}
        </p>

        <p>
          <strong>Status:</strong>
          <span class="status status-${status}">
            ${formatarStatus(status)}
          </span>
        </p>
      `;

      containerCandidaturas.appendChild(card);
    });
  } catch (err) {
    console.error("Erro ao carregar candidaturas:", err);
    containerCandidaturas.innerHTML = "<p>Erro ao carregar candidaturas.</p>";
  }
}

// ===============================
// INICIALIZAÇÃO
// ===============================
window.addEventListener("load", () => {
  selectCentro.disabled = true;

  carregarCentros();
  carregarCandidaturas();
});
