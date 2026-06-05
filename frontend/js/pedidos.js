const listaNecessidades = document.getElementById("pedidos-lista");
const loadingMsg = document.getElementById("pedidos-loading");
const modalOverlay = document.getElementById("modal-overlay");
const modalFechar = document.getElementById("modal-fechar");
const btnCancelar = document.getElementById("btn-cancelar");
const btnConfirmar = document.getElementById("btn-confirmar");
const modalDescricao = document.getElementById("modal-descricao");
const modalQuantidade = document.getElementById("modal-quantidade");

let necessidadeAtual = null;

async function carregarNecessidades() {
  try {
    loadingMsg.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> Carregando necessidades...";

    const res = await fetch("http://localhost:3000/api/necessidades");
    const data = await res.json();

    loadingMsg.remove();

    if (data.sucesso && data.dados.length > 0) {
      renderizarCards(data.dados);
    } else {
      listaNecessidades.innerHTML = "<p class='pedidos-loading'>Nenhuma necessidade encontrada.</p>";
    }
  } catch (err) {
    loadingMsg.innerHTML = "<i class='fa-solid fa-circle-exclamation'></i> Erro ao carregar necessidades.";
    console.error("Erro ao carregar necessidades:", err);
  }
}

function renderizarCards(necessidades) {
  necessidades.forEach(n => {
    const card = criarCard(n);
    listaNecessidades.appendChild(card);
  });
}

function criarCard(necessidade) {
  const porcentagem = Math.round((necessidade.quantidadeAtendida / necessidade.quantidadeNecessaria) * 100);
  const faltam = necessidade.quantidadeNecessaria - necessidade.quantidadeAtendida;

  const card = document.createElement("div");
  card.classList.add("pedido-card");
  card.dataset.urgencia = necessidade.urgencia;

  const textoUrgencia = {
    critica: "Crítica",
    alta: "Alta",
    media: "Média"
  };

  card.innerHTML = `
    <div class="pedido-card-header">
      <h3>${necessidade.nomeCentro}</h3>
      <span class="urgency-badge ${necessidade.urgencia}">
        ${textoUrgencia[necessidade.urgencia]}
      </span>
    </div>

    <p class="pedido-item">
      Item solicitado: <strong>${necessidade.item}</strong>
    </p>

    <div class="pedido-quantidade">
      <span>${necessidade.quantidadeAtendida} arrecadados</span>
      <span>${necessidade.quantidadeNecessaria} necessários</span>
    </div>

    <div class="progress-bar">
      <div class="progress-fill" style="width: ${porcentagem}%"></div>
    </div>

    <p class="pedido-progresso-texto">
      ${necessidade.quantidadeAtendida} de ${necessidade.quantidadeNecessaria} unidades arrecadadas — faltam ${faltam}
    </p>

    <button class="btn-quero-ajudar" data-id="${necessidade.id}">
      <i class="fa-solid fa-hand-holding-heart"></i>
      Quero ajudar
    </button>
  `;

  card.querySelector(".btn-quero-ajudar").addEventListener("click", () => {
    abrirModal(necessidade);
  });

  return card;
}

document.querySelectorAll(".filtro-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const filtro = btn.dataset.filtro;

    document.querySelectorAll(".pedido-card").forEach(card => {
      if (filtro === "todos" || card.dataset.urgencia === filtro) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
  });
});

function abrirModal(necessidade) {
  necessidadeAtual = necessidade;
  modalDescricao.textContent =
    `Você vai contribuir com "${necessidade.item}" para o ${necessidade.nomeCentro}. Informe a quantidade que consegue doar:`;
  modalQuantidade.value = "";
  modalOverlay.classList.add("aberto");
}

function fecharModal() {
  modalOverlay.classList.remove("aberto");
  necessidadeAtual = null;
}

modalFechar.addEventListener("click", fecharModal);
btnCancelar.addEventListener("click", fecharModal);

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    fecharModal();
  }
});

btnConfirmar.addEventListener("click", async () => {
  const quantidade = parseInt(modalQuantidade.value);

  if (!quantidade || quantidade <= 0) {
    alert("Informe uma quantidade válida.");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Faça login para realizar uma doação.");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/doacoes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({
        necessidadeId: necessidadeAtual.id,
        quantidade: quantidade
      })
    });

    const data = await res.json();

    if (!res.ok || !data.sucesso) {
      alert(data.mensagem || "Erro ao registrar doação.");
      return;
    }

    alert("Doação registrada! Obrigada pela sua contribuição.");
    fecharModal();

    listaNecessidades.innerHTML = '<p class="pedidos-loading">Atualizando...</p>';
    carregarNecessidades();
  } catch (err) {
    alert("Erro na requisição. Tente novamente.");
    console.error("Erro ao registrar doação:", err);
  }
});

window.addEventListener("load", carregarNecessidades);