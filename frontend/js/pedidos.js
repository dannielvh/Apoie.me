const listaNecessidades = document.getElementById("pedidos-lista");
const loadingMsg = document.getElementById("pedidos-loading");

const modalOverlay = document.getElementById("modal-overlay");
const modalFechar = document.getElementById("modal-fechar");
const btnCancelar = document.getElementById("btn-cancelar");

const modalItem = document.getElementById("modal-item");
const modalCategoria = document.getElementById("modal-categoria");
const modalQuantidadeInfo = document.getElementById("modal-quantidade-info");
const modalUrgencia = document.getElementById("modal-urgencia");
const modalDescricaoPedido = document.getElementById("modal-descricao-pedido");

const modalCentro = document.getElementById("modal-centro");
const modalCidade = document.getElementById("modal-cidade");
const modalEndereco = document.getElementById("modal-endereco");
const modalTelefone = document.getElementById("modal-telefone");
const modalHorario = document.getElementById("modal-horario");

let necessidadesCarregadas = [];


// ===============================
// CARREGAR NECESSIDADES
// ===============================
async function carregarNecessidades() {
  try {
    loadingMsg.innerHTML =
      "<i class='fa-solid fa-spinner fa-spin'></i> Carregando necessidades...";

    const res = await fetch("http://localhost:3000/api/necessidades");
    const data = await res.json();

    loadingMsg.remove();

    if (data.sucesso && data.dados.length > 0) {
      necessidadesCarregadas = data.dados;
      renderizarCards(necessidadesCarregadas);
    } else {
      listaNecessidades.innerHTML =
        "<p class='pedidos-loading'>Nenhuma necessidade encontrada.</p>";
    }

  } catch (err) {
    loadingMsg.innerHTML =
      "<i class='fa-solid fa-circle-exclamation'></i> Erro ao carregar necessidades.";

    console.error("Erro ao carregar necessidades:", err);
  }
}


// ===============================
// RENDERIZAR CARDS
// ===============================
function renderizarCards(necessidades) {
  listaNecessidades.innerHTML = "";

  necessidades.forEach((necessidade) => {
    const card = criarCard(necessidade);
    listaNecessidades.appendChild(card);
  });
}


// ===============================
// CRIAR CARD
// ===============================
function criarCard(necessidade) {
  const quantidadeAtendida = Number(necessidade.quantidadeAtendida || 0);
  const quantidadeNecessaria = Number(necessidade.quantidadeNecessaria || 0);

  const porcentagem =
    quantidadeNecessaria > 0
      ? Math.round((quantidadeAtendida / quantidadeNecessaria) * 100)
      : 0;

  const faltam = quantidadeNecessaria - quantidadeAtendida;

  const card = document.createElement("div");
  card.classList.add("pedido-card");
  card.dataset.urgencia = necessidade.urgencia;

  const textoUrgencia = {
    critica: "Crítica",
    alta: "Alta",
    media: "Média",
    baixa: "Baixa"
  };

  card.innerHTML = `
    <div class="pedido-card-header">
      <h3>${necessidade.nomeCentro || "Centro não informado"}</h3>

      <span class="urgency-badge ${necessidade.urgencia}">
        ${textoUrgencia[necessidade.urgencia] || "Média"}
      </span>
    </div>

    <p class="pedido-item">
      Item solicitado: <strong>${necessidade.item || necessidade.titulo || "-"}</strong>
    </p>

    <div class="pedido-quantidade">
      <span>${quantidadeAtendida} recebidos/</span>
      <span>${quantidadeNecessaria} necessários</span>
    </div>

    <div class="progress-bar">
      <div class="progress-fill" style="width: ${porcentagem}%"></div>
    </div>

    <p class="pedido-progresso-texto">
      ${quantidadeAtendida} de ${quantidadeNecessaria} unidades recebidas — faltam ${faltam}
    </p>

    <button class="btn-quero-ajudar" data-id="${necessidade.id}">
      <i class="fa-solid fa-circle-info"></i>
      Como doar
    </button>
  `;

  card.querySelector(".btn-quero-ajudar").addEventListener("click", () => {
    abrirModalComoDoar(necessidade);
  });

  return card;
}


// ===============================
// FILTROS
// ===============================
document.querySelectorAll(".filtro-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filtro-btn").forEach((b) => {
      b.classList.remove("active");
    });

    btn.classList.add("active");

    const filtro = btn.dataset.filtro;

    document.querySelectorAll(".pedido-card").forEach((card) => {
      if (filtro === "todos" || card.dataset.urgencia === filtro) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
  });
});


// ===============================
// ABRIR MODAL DE COMO DOAR
// ===============================
function abrirModalComoDoar(necessidade) {
  const quantidadeAtendida = Number(necessidade.quantidadeAtendida || 0);
  const quantidadeNecessaria = Number(necessidade.quantidadeNecessaria || 0);
  const faltam = quantidadeNecessaria - quantidadeAtendida;

  modalItem.innerHTML = `
    <strong>Item:</strong>
    ${necessidade.item || "-"}
  `;

  modalCategoria.innerHTML = `
    <strong>Categoria:</strong>
    ${necessidade.categoria || "Categoria não informada"}
  `;

  modalQuantidadeInfo.innerHTML = `
    <strong>Quantidade:</strong>
    faltam ${faltam} de ${quantidadeNecessaria} unidades
  `;

  modalUrgencia.innerHTML = `
    <strong>Urgência:</strong>
    ${formatarUrgencia(necessidade.urgencia)}
  `;

  modalDescricaoPedido.innerHTML = `
    <strong>Descrição:</strong>
    ${necessidade.descricao || "Nenhuma descrição informada."}
  `;

  modalCentro.innerHTML = `
    <strong>Centro:</strong>
    ${necessidade.nomeCentro || "Centro não informado"}
  `;

  modalCidade.innerHTML = `
    <strong>Cidade:</strong>
    ${necessidade.centroCidade || "Cidade não informada"}
  `;

  modalEndereco.innerHTML = `
    <strong>Endereço:</strong>
    ${necessidade.centroEndereco || "Endereço não informado"}
  `;

  modalTelefone.innerHTML = `
    <strong>Telefone:</strong>
    ${necessidade.centroTelefone || "Telefone não informado"}
  `;

  modalHorario.innerHTML = `
    <strong>Horário de atendimento:</strong>
    ${necessidade.centroHorario || "Horário não informado"}
  `;

  modalOverlay.classList.add("aberto");
}


// ===============================
// FECHAR MODAL
// ===============================
function fecharModal() {
  modalOverlay.classList.remove("aberto");
}

modalFechar.addEventListener("click", fecharModal);
btnCancelar.addEventListener("click", fecharModal);

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    fecharModal();
  }
});


// ===============================
// FORMATAR URGÊNCIA
// ===============================
function formatarUrgencia(urgencia) {
  const urgencias = {
    critica: "Crítica",
    alta: "Alta",
    media: "Média",
    baixa: "Baixa"
  };

  return urgencias[urgencia] || "Média";
}


// ===============================
// INICIALIZAÇÃO
// ===============================
window.addEventListener("load", carregarNecessidades);