// ===============================
// PROTEÇÃO DA PÁGINA
// ===============================
const token = localStorage.getItem("token");

if (!token) {
  alert("Você precisa estar logado.");
  window.location.href = "../login.html";
}


// ===============================
// ELEMENTOS DA PÁGINA
// ===============================
const listaCandidaturas = document.getElementById("listaCandidaturas");

const totalCandidaturas = document.getElementById("totalCandidaturas");
const totalPendentes = document.getElementById("totalPendentes");
const totalAprovadas = document.getElementById("totalAprovadas");
const totalRejeitadas = document.getElementById("totalRejeitadas");

const candidaturasAviso = document.getElementById("candidaturasAviso");

const formFiltros = document.getElementById("formFiltrosCandidaturas");
const filtroNome = document.getElementById("filtroNome");
const filtroHabilidade = document.getElementById("filtroHabilidade");
const filtroStatus = document.getElementById("filtroStatus");
const btnLimparFiltros = document.getElementById("btnLimparFiltros");


// ===============================
// ELEMENTOS DO MODAL
// ===============================
const modalCandidatura = document.getElementById("modalCandidatura");

const btnFecharModalCandidatura = document.getElementById("btnFecharModalCandidatura");
const btnCancelarModalCandidatura = document.getElementById("btnCancelarModalCandidatura");

const btnAprovarCandidatura = document.getElementById("btnAprovarCandidatura");
const btnRejeitarCandidatura = document.getElementById("btnRejeitarCandidatura");

const modalNome = document.getElementById("modalNome");
const modalEmail = document.getElementById("modalEmail");
const modalStatus = document.getElementById("modalStatus");
const modalTelefone = document.getElementById("modalTelefone");
const modalDisponibilidade = document.getElementById("modalDisponibilidade");
const modalHabilidades = document.getElementById("modalHabilidades");
const modalCentro = document.getElementById("modalCentro");
const modalData = document.getElementById("modalData");

const msgModalCandidatura = document.getElementById("msgModalCandidatura");


// ===============================
// VARIÁVEIS GLOBAIS
// ===============================
let centroLogado = null;
let candidaturasCarregadas = [];
let candidaturaSelecionadaId = null;


// ===============================
// FUNÇÕES UTILITÁRIAS
// ===============================
function normalizar(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function textoOuPadrao(valor, padrao = "-") {
  return valor && String(valor).trim() ? valor : padrao;
}

function formatarStatusCentro(status) {
  const statusMap = {
    pendente: "Aguardando aprovação",
    aprovado: "Aprovado",
    rejeitado: "Rejeitado",
    suspenso: "Suspenso"
  };

  return statusMap[status] || status || "-";
}

function formatarStatusCandidatura(status) {
  const statusMap = {
    pendente: "Pendente",
    aprovada: "Aprovada",
    rejeitada: "Rejeitada"
  };

  return statusMap[status] || status || "-";
}

function formatarData(data) {
  if (!data) return "-";

  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}


// ===============================
// CARREGAR CENTRO DO USUÁRIO LOGADO
// ===============================
async function carregarCentroLogado() {
  try {
    const res = await fetch("http://localhost:3000/api/centros/meu-centro", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.erro || "Erro ao buscar centro.");
      window.location.href = "../dashboard.html";
      return null;
    }

    if (!data.temCentro) {
      alert("Você ainda não possui um centro cadastrado.");
      window.location.href = "../dashboard.html";
      return null;
    }

    return data.centro;

  } catch (err) {
    console.error("Erro ao carregar centro:", err);
    alert("Erro ao carregar informações do centro.");
    window.location.href = "../dashboard.html";
    return null;
  }
}


// ===============================
// CONTROLAR ACESSO PELO STATUS DO CENTRO
// ===============================
function controlarAcessoCentro(centro) {
  if (!centro) return false;

  if (centro.status === "aprovado") {
    candidaturasAviso.classList.add("hidden");
    return true;
  }

  candidaturasAviso.classList.remove("hidden");

  candidaturasAviso.innerHTML = `
    <h3>Funcionalidade indisponível</h3>
    <p>
      Seu centro está com status <strong>${formatarStatusCentro(centro.status)}</strong>.
      Apenas centros aprovados podem gerenciar candidaturas de voluntários.
    </p>
  `;

  listaCandidaturas.innerHTML = `
    <div class="empty-state">
      <i class="fa-solid fa-lock"></i>
      <h3>Acesso limitado</h3>
      <p>Aguarde a aprovação do centro para visualizar candidaturas.</p>
    </div>
  `;

  atualizarCards([]);

  return false;
}


// ===============================
// CARREGAR CANDIDATURAS
// ===============================
async function carregarCandidaturas() {
  try {
    listaCandidaturas.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-spinner"></i>
        <h3>Carregando candidaturas...</h3>
        <p>Aguarde enquanto buscamos os candidatos.</p>
      </div>
    `;

    const res = await fetch("http://localhost:3000/api/candidaturas", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      listaCandidaturas.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <h3>Erro ao carregar candidaturas</h3>
          <p>${data.erro || "Tente novamente mais tarde."}</p>
        </div>
      `;
      return;
    }

    let candidaturas = Array.isArray(data) ? data : [];

    // IMPORTANTE:
    // O backend dela lista todas as candidaturas.
    // Então aqui filtramos para mostrar só as candidaturas do centro logado.
    candidaturas = candidaturas.filter((c) => {
      return Number(c.centro_id) === Number(centroLogado.id);
    });

    candidaturasCarregadas = candidaturas;

    atualizarCards(candidaturas);
    renderizarCandidaturas(candidaturas);

  } catch (err) {
    console.error("Erro ao carregar candidaturas:", err);

    listaCandidaturas.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <h3>Erro inesperado</h3>
        <p>Não foi possível carregar as candidaturas.</p>
      </div>
    `;
  }
}


// ===============================
// ATUALIZAR CARDS
// ===============================
function atualizarCards(candidaturas) {
  const total = candidaturas.length;

  const pendentes = candidaturas.filter((c) => c.status === "pendente").length;
  const aprovadas = candidaturas.filter((c) => c.status === "aprovada").length;
  const rejeitadas = candidaturas.filter((c) => c.status === "rejeitada").length;

  if (totalCandidaturas) totalCandidaturas.textContent = total;
  if (totalPendentes) totalPendentes.textContent = pendentes;
  if (totalAprovadas) totalAprovadas.textContent = aprovadas;
  if (totalRejeitadas) totalRejeitadas.textContent = rejeitadas;
}


// ===============================
// RENDERIZAR CANDIDATURAS
// ===============================
function renderizarCandidaturas(candidaturas) {
  listaCandidaturas.innerHTML = "";

  if (!candidaturas || candidaturas.length === 0) {
    listaCandidaturas.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-users-slash"></i>
        <h3>Nenhuma candidatura encontrada</h3>
        <p>Quando usuários se candidatarem ao seu centro, aparecerão aqui.</p>
      </div>
    `;
    return;
  }

  candidaturas.forEach((candidatura) => {
    const div = document.createElement("div");
    div.classList.add("candidatura-item");

    div.innerHTML = `
      <div class="candidatura-item__content">
        <div class="candidatura-item__avatar">
          <i class="fa-solid fa-user"></i>
        </div>

        <div>
          <h3>${textoOuPadrao(candidatura.usuario_nome, "Candidato")}</h3>

          <p>
            <i class="fa-solid fa-envelope"></i>
            ${textoOuPadrao(candidatura.email)}
          </p>

          <small>
            <strong>Data:</strong>
            ${formatarData(candidatura.data_candidatura)}
          </small>

          <br>

          <span class="status-pill ${candidatura.status}">
            ${formatarStatusCandidatura(candidatura.status)}
          </span>
        </div>
      </div>

      <div class="candidatura-item__actions">
        <button class="btn-detalhes" data-id="${candidatura.id}">
          Ver detalhes
        </button>

        ${
          candidatura.status === "pendente"
            ? `
              <button class="btn-aprovar" data-id="${candidatura.id}">
                Aprovar
              </button>
            `
            : ""
        }
      </div>
    `;

    listaCandidaturas.appendChild(div);
  });
}


// ===============================
// FILTRAR CANDIDATURAS NO FRONT
// ===============================
function aplicarFiltros() {
  const nome = filtroNome.value.trim();
  const habilidade = filtroHabilidade.value.trim();
  const status = filtroStatus.value.trim();

  let candidaturasFiltradas = [...candidaturasCarregadas];

  if (nome) {
    candidaturasFiltradas = candidaturasFiltradas.filter((c) =>
      normalizar(c.usuario_nome).includes(normalizar(nome))
    );
  }

  if (habilidade) {
    candidaturasFiltradas = candidaturasFiltradas.filter((c) =>
      normalizar(c.habilidades).includes(normalizar(habilidade))
    );
  }

  if (status) {
    candidaturasFiltradas = candidaturasFiltradas.filter((c) =>
      c.status === status
    );
  }

  atualizarCards(candidaturasFiltradas);
  renderizarCandidaturas(candidaturasFiltradas);
}


// ===============================
// ENCONTRAR CANDIDATURA PELO ID
// ===============================
function encontrarCandidaturaPorId(id) {
  return candidaturasCarregadas.find((c) => Number(c.id) === Number(id));
}


// ===============================
// ABRIR MODAL
// ===============================
function abrirModalCandidatura(candidatura) {
  if (!candidatura) return;

  candidaturaSelecionadaId = candidatura.id;

  modalNome.textContent = textoOuPadrao(candidatura.usuario_nome, "Candidato");
  modalEmail.textContent = textoOuPadrao(candidatura.email);

  modalStatus.textContent = formatarStatusCandidatura(candidatura.status);
  modalStatus.className = "";
  modalStatus.classList.add("status-pill", candidatura.status);

  modalTelefone.textContent = textoOuPadrao(candidatura.telefone);
  modalDisponibilidade.textContent = textoOuPadrao(candidatura.disponibilidade);
  modalHabilidades.textContent = textoOuPadrao(candidatura.habilidades);

  modalCentro.textContent = textoOuPadrao(candidatura.centro_nome);
  modalData.textContent = formatarData(candidatura.data_candidatura);

  msgModalCandidatura.textContent = "";

  // Se já foi aprovada/rejeitada, desativa os botões principais
  const estaPendente = candidatura.status === "pendente";

  btnAprovarCandidatura.disabled = !estaPendente;
  btnRejeitarCandidatura.disabled = !estaPendente;

  btnAprovarCandidatura.style.opacity = estaPendente ? "1" : "0.5";
  btnRejeitarCandidatura.style.opacity = estaPendente ? "1" : "0.5";

  modalCandidatura.classList.remove("hidden");
}


// ===============================
// FECHAR MODAL
// ===============================
function fecharModalCandidatura() {
  candidaturaSelecionadaId = null;
  msgModalCandidatura.textContent = "";
  modalCandidatura.classList.add("hidden");
}


// ===============================
// ATUALIZAR STATUS DA CANDIDATURA
// ===============================
async function atualizarStatusCandidatura(id, status) {
  if (!id) return;

  try {
    msgModalCandidatura.textContent = "Atualizando candidatura...";
    msgModalCandidatura.style.color = "#555";

    const res = await fetch(`http://localhost:3000/api/candidaturas/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    const data = await res.json();

    if (!res.ok) {
      msgModalCandidatura.textContent =
        data.erro || "Erro ao atualizar candidatura.";

      msgModalCandidatura.style.color = "red";
      return;
    }

    msgModalCandidatura.textContent =
      status === "aprovada"
        ? "Candidatura aprovada com sucesso."
        : "Candidatura rejeitada com sucesso.";

    msgModalCandidatura.style.color = "green";

    await carregarCandidaturas();

    setTimeout(() => {
      fecharModalCandidatura();
    }, 800);

  } catch (err) {
    console.error("Erro ao atualizar status:", err);

    msgModalCandidatura.textContent = "Erro na requisição.";
    msgModalCandidatura.style.color = "red";
  }
}


// ===============================
// EVENTOS DA LISTA
// ===============================
listaCandidaturas.addEventListener("click", (e) => {
  const btnDetalhes = e.target.closest(".btn-detalhes");
  const btnAprovar = e.target.closest(".btn-aprovar");

  if (btnDetalhes) {
    const id = btnDetalhes.getAttribute("data-id");
    const candidatura = encontrarCandidaturaPorId(id);

    abrirModalCandidatura(candidatura);
  }

  if (btnAprovar) {
    const id = btnAprovar.getAttribute("data-id");
    const candidatura = encontrarCandidaturaPorId(id);

    abrirModalCandidatura(candidatura);
  }
});


// ===============================
// EVENTOS DO MODAL
// ===============================
btnFecharModalCandidatura.addEventListener("click", fecharModalCandidatura);
btnCancelarModalCandidatura.addEventListener("click", fecharModalCandidatura);

modalCandidatura.addEventListener("click", (e) => {
  if (e.target === modalCandidatura) {
    fecharModalCandidatura();
  }
});

btnAprovarCandidatura.addEventListener("click", () => {
  atualizarStatusCandidatura(candidaturaSelecionadaId, "aprovada");
});

btnRejeitarCandidatura.addEventListener("click", () => {
  atualizarStatusCandidatura(candidaturaSelecionadaId, "rejeitada");
});


// ===============================
// EVENTOS DOS FILTROS
// ===============================
formFiltros.addEventListener("submit", (e) => {
  e.preventDefault();
  aplicarFiltros();
});

btnLimparFiltros.addEventListener("click", () => {
  filtroNome.value = "";
  filtroHabilidade.value = "";
  filtroStatus.value = "";

  atualizarCards(candidaturasCarregadas);
  renderizarCandidaturas(candidaturasCarregadas);
});


// ===============================
// INICIALIZAÇÃO
// ===============================
window.addEventListener("load", async () => {
  centroLogado = await carregarCentroLogado();

  const podeAcessar = controlarAcessoCentro(centroLogado);

  if (!podeAcessar) return;

  await carregarCandidaturas();
});