/* ========================================================= */
/* DASHBOARD.JS - APOIE.ME                                  */
/* ========================================================= */

let necessidades = [];


// ===============================
// INICIALIZAÇÃO
// ===============================
window.addEventListener("load", () => {
  configurarDropdowns();
  configurarCardAcesso();
  configurarBotaoCentro();
  carregarDashboard();
});


// ===============================
// DROPDOWNS DE COMO DOAR
// ===============================
function configurarDropdowns() {
  const toggles = document.querySelectorAll(".guide-toggle");

  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const item = toggle.closest(".guide-item");

      if (!item) return;

      item.classList.toggle("active");
    });
  });
}


// ===============================
// CARD LOGIN / USUÁRIO LOGADO
// ===============================
function configurarCardAcesso() {
  const accessCard = document.getElementById("access-card");

  if (!accessCard) return;

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    return;
  }

  const primeiroNome = user.nome ? user.nome.split(" ")[0] : "usuário";

  accessCard.innerHTML = `
    <div class="access-icon">
      <i class="fa-solid fa-circle-user"></i>
    </div>

    <div class="access-text">
      <h2>Olá, ${primeiroNome}!</h2>

      <p>
        Você está logado na Apoie.me. Agora pode acompanhar necessidades,
        visualizar centros de apoio e participar das ações sociais.
      </p>
    </div>

    <div class="access-buttons">
      <a href="../pages/perfil.html" class="login-btn">
        Meu perfil
      </a>

      <a href="../pages/cadastroCentro.html" class="register-btn">
        Cadastrar centro
      </a>
    </div>
  `;
}


// ===============================
// BOTÃO CADASTRAR CENTRO
// ===============================
function configurarBotaoCentro() {
  const btnCadastrarCentro = document.getElementById("btnCadastrarCentro");
  const modalLogin = document.getElementById("modalLogin");
  const btnIrLogin = document.getElementById("btnIrLogin");
  const btnFecharModal = document.getElementById("btnFecharModal");

  if (btnCadastrarCentro) {
    btnCadastrarCentro.addEventListener("click", () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (modalLogin) {
          modalLogin.classList.remove("hidden");
        }

        return;
      }

      window.location.href = "../pages/cadastroCentro.html";
    });
  }

  if (btnIrLogin) {
    btnIrLogin.addEventListener("click", () => {
      window.location.href = "../pages/login.html";
    });
  }

  if (btnFecharModal) {
    btnFecharModal.addEventListener("click", () => {
      if (modalLogin) {
        modalLogin.classList.add("hidden");
      }
    });
  }

  if (modalLogin) {
    modalLogin.addEventListener("click", (e) => {
      if (e.target === modalLogin) {
        modalLogin.classList.add("hidden");
      }
    });
  }
}


// ===============================
// CARREGAR DADOS DO DASHBOARD
// ===============================
async function carregarDashboard() {
  try {
    const containerNecessidades = document.querySelector(".urgent-needs-list");
    const containerAtividades = document.querySelector(".activities-list");

    if (containerNecessidades) {
      containerNecessidades.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-spinner fa-spin"></i>
          <p>Carregando necessidades...</p>
        </div>
      `;
    }

    if (containerAtividades) {
      containerAtividades.innerHTML = `
        <div class="activity-item">
          <div class="activity-icon donation">
            <i class="fa-solid fa-spinner fa-spin"></i>
          </div>

          <div class="activity-content">
            <p>Carregando atividades recentes...</p>
            <span>Aguarde</span>
          </div>
        </div>
      `;
    }

    const res = await fetch("http://localhost:3000/api/necessidades");
    const data = await res.json();

    console.log("Resposta /api/necessidades:", data);

    if (!res.ok) {
      mostrarErroDashboard();
      return;
    }

    necessidades = Array.isArray(data)
      ? data
      : Array.isArray(data.dados)
        ? data.dados
        : [];

    carregarNecessidadesUrgentes();
    carregarAtividadesRecentes();

  } catch (err) {
    console.error("Erro ao carregar dashboard:", err);
    mostrarErroDashboard();
  }
}


// ===============================
// NECESSIDADES MAIS URGENTES
// ===============================
function carregarNecessidadesUrgentes() {
  const container = document.querySelector(".urgent-needs-list");

  if (!container) return;

  container.innerHTML = "";

  const necessidadesOrdenadas = necessidades
    .filter((pedido) => pedido.status !== "cancelado")
    .sort((a, b) => {
      return pesoUrgencia(a.urgencia) - pesoUrgencia(b.urgencia);
    })
    .slice(0, 4);

  if (necessidadesOrdenadas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-box-open"></i>
        <p>Nenhuma necessidade cadastrada no momento.</p>
      </div>
    `;
    return;
  }

  necessidadesOrdenadas.forEach((necessidade) => {
    const quantidadeAtendida = Number(
      necessidade.quantidadeAtendida ||
      necessidade.quantidade_recebida ||
      0
    );

    const quantidadeNecessaria = Number(
      necessidade.quantidadeNecessaria ||
      necessidade.quantidade_necessaria ||
      0
    );

    const porcentagem =
      quantidadeNecessaria > 0
        ? Math.min(Math.round((quantidadeAtendida / quantidadeNecessaria) * 100), 100)
        : 0;

    const faltam = Math.max(quantidadeNecessaria - quantidadeAtendida, 0);

    const card = document.createElement("div");
    card.classList.add("need-card");

    card.innerHTML = `
      <div class="need-card-header">
        <h3>${necessidade.nomeCentro || necessidade.nome_centro || "Centro não informado"}</h3>

        <span class="urgency-badge ${classeUrgencia(necessidade.urgencia)}">
          ${textoUrgencia(necessidade.urgencia)}
        </span>
      </div>

      <p class="need-item">
        Item solicitado:
        <strong>${necessidade.item || necessidade.titulo || "Item não informado"}</strong>
      </p>

      <p class="need-description">
        ${necessidade.descricao || "Sem descrição informada."}
      </p>

      <div class="need-quantity">
        <span>${quantidadeAtendida} recebidos</span>
        <span>${quantidadeNecessaria} necessários</span>
      </div>

      <div class="progress-bar">
        <div class="progress-fill" style="width: ${porcentagem}%"></div>
      </div>

      <div class="need-footer">
        <span class="progress-text">${porcentagem}% concluído</span>
        <span class="deadline">Faltam ${faltam}</span>
      </div>

      <a href="../pages/pedidos.html" class="need-action">
        Ver como doar
      </a>
    `;

    container.appendChild(card);
  });
}


// ===============================
// ATIVIDADES RECENTES
// ===============================
function carregarAtividadesRecentes() {
  const container = document.querySelector(".activities-list");

  if (!container) return;

  container.innerHTML = "";

  const atividades = necessidades
    .filter((pedido) => pedido.status !== "cancelado")
    .sort((a, b) => {
      const dataA = new Date(a.atualizadoEm || a.criadoEm || a.atualizado_em || a.criado_em || 0);
      const dataB = new Date(b.atualizadoEm || b.criadoEm || b.atualizado_em || b.criado_em || 0);

      return dataB - dataA;
    })
    .slice(0, 5);

  if (atividades.length === 0) {
    container.innerHTML = `
      <div class="activity-item">
        <div class="activity-icon donation">
          <i class="fa-solid fa-box-open"></i>
        </div>

        <div class="activity-content">
          <p>Nenhuma atividade recente encontrada.</p>
          <span>Agora</span>
        </div>
      </div>
    `;
    return;
  }

  atividades.forEach((pedido) => {
    const quantidadeAtendida = Number(
      pedido.quantidadeAtendida ||
      pedido.quantidade_recebida ||
      0
    );

    const quantidadeNecessaria = Number(
      pedido.quantidadeNecessaria ||
      pedido.quantidade_necessaria ||
      0
    );

    const item = pedido.item || pedido.titulo || "Pedido de doação";
    const centro = pedido.nomeCentro || pedido.nome_centro || "centro de apoio";

    let tipo = "donation";
    let icone = "fa-box-open";
    let texto = `Novo pedido de doação: ${item} em ${centro}.`;

    if (pedido.status === "atendido" || quantidadeAtendida >= quantidadeNecessaria && quantidadeNecessaria > 0) {
      tipo = "success";
      icone = "fa-circle-check";
      texto = `Pedido atendido: ${item} em ${centro}.`;
    } else if (pedido.urgencia === "alta" || pedido.urgencia === "critica") {
      tipo = "alert";
      icone = "fa-triangle-exclamation";
      texto = `Pedido urgente cadastrado: ${item} em ${centro}.`;
    }

    const atividade = document.createElement("div");
    atividade.classList.add("activity-item");

    atividade.innerHTML = `
      <div class="activity-icon ${tipo}">
        <i class="fa-solid ${icone}"></i>
      </div>

      <div class="activity-content">
        <p>${texto}</p>
        <span>${formatarDataAtividade(pedido.atualizadoEm || pedido.criadoEm || pedido.atualizado_em || pedido.criado_em)}</span>
      </div>
    `;

    container.appendChild(atividade);
  });
}


// ===============================
// TEXTO DA URGÊNCIA
// ===============================
function textoUrgencia(urgencia) {
  const urgencias = {
    critica: "Crítica",
    alta: "Alta",
    media: "Média",
    baixa: "Baixa"
  };

  return urgencias[urgencia] || "Média";
}


// ===============================
// CLASSE DA URGÊNCIA
// ===============================
function classeUrgencia(urgencia) {
  const classes = {
    critica: "critical",
    alta: "high",
    media: "medium",
    baixa: "low"
  };

  return classes[urgencia] || "medium";
}


// ===============================
// ORDEM DA URGÊNCIA
// ===============================
function pesoUrgencia(urgencia) {
  const pesos = {
    critica: 1,
    alta: 2,
    media: 3,
    baixa: 4
  };

  return pesos[urgencia] || 5;
}


// ===============================
// FORMATAR DATA
// ===============================
function formatarDataAtividade(data) {
  if (!data) return "Recentemente";

  const dataPedido = new Date(data);

  if (isNaN(dataPedido.getTime())) {
    return "Recentemente";
  }

  const agora = new Date();

  const diferencaMs = agora - dataPedido;
  const minutos = Math.floor(diferencaMs / 1000 / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);

  if (minutos < 1) return "Agora";
  if (minutos < 60) return `Há ${minutos} min`;
  if (horas < 24) return `Há ${horas}h`;
  if (dias === 1) return "Ontem";

  return `Há ${dias} dias`;
}


// ===============================
// MOSTRAR ERRO
// ===============================
function mostrarErroDashboard() {
  const necessidadesContainer = document.querySelector(".urgent-needs-list");
  const atividadesContainer = document.querySelector(".activities-list");

  if (necessidadesContainer) {
    necessidadesContainer.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>Erro ao carregar necessidades.</p>
      </div>
    `;
  }

  if (atividadesContainer) {
    atividadesContainer.innerHTML = `
      <div class="activity-item">
        <div class="activity-icon alert">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>

        <div class="activity-content">
          <p>Erro ao carregar atividades recentes.</p>
          <span>Tente novamente</span>
        </div>
      </div>
    `;
  }
}