// ===============================
// PROTEÇÃO DA PÁGINA
// ===============================

// Pega o token salvo no login
const token = localStorage.getItem("token");

// Se não tiver token, o usuário não pode acessar o painel do centro
if (!token) {
  alert("Você precisa estar logado.");
  window.location.href = "../login.html";
}


// ===============================
// CARREGAR DASHBOARD DO CENTRO
// ===============================

async function carregarCentroDashboard() {
  try {
    // Busca o centro vinculado ao usuário logado
    const res = await fetch("http://localhost:3000/api/centros/meu-centro", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    // Se der erro no backend
    if (!res.ok) {
      alert(data.erro || "Erro ao buscar centro.");
      window.location.href = "../dashboard.html";
      return;
    }

    // Se o usuário não tiver centro cadastrado, volta para o dashboard normal
    if (!data.temCentro) {
      alert("Você ainda não possui um centro cadastrado.");
      window.location.href = "../dashboard.html";
      return;
    }

    const centro = data.centro;

    // Preenche os dados principais da tela
    preencherDadosCentro(centro);

    // Controla o que aparece dependendo do status do centro
    controlarStatusCentro(centro.status);

    // Busca resumo dinâmico de voluntários selecionados
    const totalVoluntariosSelecionados = await carregarResumoVoluntarios();

    // Por enquanto pedidos continuam zerados
    // Depois, quando criar pedidos de doação, esses campos virão do backend também
    preencherResumo({
      pedidosAtivos: 0,
      voluntarios: totalVoluntariosSelecionados,
      urgentes: 0,
      atendidos: 0
    });

  } catch (err) {
    console.error("Erro ao carregar painel do centro:", err);
    alert("Erro ao carregar painel do centro.");
  }
}


// ===============================
// BUSCAR RESUMO DE VOLUNTÁRIOS
// ===============================

async function carregarResumoVoluntarios() {
  try {
    const res = await fetch("http://localhost:3000/api/voluntarios/selecionados/meu-centro", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      return 0;
    }

    return Array.isArray(data) ? data.length : 0;

  } catch (err) {
    console.error("Erro ao carregar resumo de voluntários:", err);
    return 0;
  }
}


// ===============================
// PREENCHER DADOS DO CENTRO
// ===============================

function preencherDadosCentro(centro) {
  const centroNome = document.getElementById("centroNome");
  const centroDescricao = document.getElementById("centroDescricao");
  const centroStatus = document.getElementById("centroStatus");

  const infoCidade = document.getElementById("infoCidade");
  const infoTipo = document.getElementById("infoTipo");
  const infoTelefone = document.getElementById("infoTelefone");
  const infoHorario = document.getElementById("infoHorario");

  if (centroNome) {
    centroNome.textContent = centro.nome || "Meu Centro";
  }

  if (centroDescricao) {
    centroDescricao.textContent =
      centro.descricao ||
      "Gerencie informações, pedidos de doação e ações voluntárias do seu centro.";
  }

  if (centroStatus) {
    centroStatus.textContent = formatarStatus(centro.status);
    centroStatus.className = "";
    centroStatus.classList.add("status-text", centro.status);
  }

  if (infoCidade) {
    infoCidade.textContent = centro.cidade || "-";
  }

  if (infoTipo) {
    infoTipo.textContent = centro.tipo || "-";
  }

  if (infoTelefone) {
    infoTelefone.textContent = centro.telefone || "-";
  }

  if (infoHorario) {
    infoHorario.textContent = centro.horario || "-";
  }
}


// ===============================
// PREENCHER CARDS DE RESUMO
// ===============================

function preencherResumo(resumo) {
  const totalPedidos = document.getElementById("totalPedidos");
  const totalVoluntarios = document.getElementById("totalVoluntarios");
  const totalUrgentes = document.getElementById("totalUrgentes");
  const totalAtendidos = document.getElementById("totalAtendidos");

  if (totalPedidos) {
    totalPedidos.textContent = resumo.pedidosAtivos;
  }

  if (totalVoluntarios) {
    totalVoluntarios.textContent = resumo.voluntarios;
  }

  if (totalUrgentes) {
    totalUrgentes.textContent = resumo.urgentes;
  }

  if (totalAtendidos) {
    totalAtendidos.textContent = resumo.atendidos;
  }
}


// ===============================
// CONTROLE POR STATUS DO CENTRO
// ===============================

function controlarStatusCentro(status) {
  const aviso = document.getElementById("statusAviso");
  const acoes = document.getElementById("acoesRapidas");

  if (!aviso || !acoes) return;

  // Se o centro estiver aprovado, libera todas as ações
  if (status === "aprovado") {
    aviso.classList.add("hidden");
    return;
  }

  // Se não estiver aprovado, mostra aviso
  aviso.classList.remove("hidden");

  let titulo = "";
  let texto = "";

  if (status === "pendente") {
    titulo = "Seu centro está aguardando aprovação";
    texto =
      "Você já pode editar as informações básicas, mas pedidos de doação e voluntariado serão liberados após aprovação.";
  }

  if (status === "rejeitado") {
    titulo = "Cadastro do centro rejeitado";
    texto =
      "Revise as informações cadastradas e entre em contato com a administração para entender o motivo.";
  }

  if (status === "suspenso") {
    titulo = "Centro suspenso";
    texto =
      "O acesso às funcionalidades do centro foi limitado temporariamente.";
  }

  aviso.innerHTML = `
    <div>
      <h3>${titulo}</h3>
      <p>${texto}</p>
    </div>

    <a href="meuCentro.html">Revisar informações</a>
  `;

  // Se o centro não estiver aprovado, limita as ações disponíveis
  acoes.innerHTML = `
    <a href="meuCentro.html" class="quick-action">
      <i class="fa-solid fa-building"></i>
      <div>
        <strong>Meu Centro</strong>
        <span>Editar dados cadastrados</span>
      </div>
    </a>

    <a href="../dashboard.html" class="quick-action">
      <i class="fa-solid fa-arrow-left"></i>
      <div>
        <strong>Dashboard normal</strong>
        <span>Voltar para visão geral</span>
      </div>
    </a>
  `;
}


// ===============================
// FORMATAR STATUS
// ===============================

function formatarStatus(status) {
  const statusMap = {
    pendente: "Aguardando aprovação",
    aprovado: "Aprovado",
    rejeitado: "Rejeitado",
    suspenso: "Suspenso"
  };

  return statusMap[status] || status || "-";
}


// ===============================
// INICIALIZAÇÃO
// ===============================

window.addEventListener("load", carregarCentroDashboard);