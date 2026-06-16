// ===============================
// PROTEÇÃO DA PÁGINA
// ===============================
const token = localStorage.getItem("token");

if (!token) {
  alert("Você precisa estar logado.");
  window.location.href = "../login.html";
}


// ===============================
// DADOS GLOBAIS
// ===============================
let pedidos = [];
let pedidosFiltrados = [];
let pedidoSelecionadoId = null;


// ===============================
// ELEMENTOS DA PÁGINA
// ===============================
const listaPedidos = document.getElementById("listaPedidos");
const pedidosAviso = document.getElementById("pedidosAviso");

const totalPedidosAtivos = document.getElementById("totalPedidosAtivos");
const totalPedidosUrgentes = document.getElementById("totalPedidosUrgentes");
const totalPedidosAtendidos = document.getElementById("totalPedidosAtendidos");


// ===============================
// FORM CRIAR PEDIDO
// ===============================
const formPedidoDoacao = document.getElementById("formPedidoDoacao");
const inputTitulo = document.getElementById("titulo");
const inputCategoria = document.getElementById("categoria");
const inputQuantidadeNecessaria = document.getElementById("quantidadeNecessaria");
const inputQuantidadeRecebida = document.getElementById("quantidadeRecebida");
const inputUnidade = document.getElementById("unidade");
const inputUrgencia = document.getElementById("urgencia");
const inputDescricao = document.getElementById("descricao");
const msgPedido = document.getElementById("msgPedido");


// ===============================
// FILTROS
// ===============================
const formFiltrosPedidos = document.getElementById("formFiltrosPedidos");
const filtroCategoria = document.getElementById("filtroCategoria");
const filtroStatus = document.getElementById("filtroStatus");
const filtroUrgencia = document.getElementById("filtroUrgencia");
const btnLimparFiltrosPedidos = document.getElementById("btnLimparFiltrosPedidos");


// ===============================
// MODAL
// ===============================
const modalPedido = document.getElementById("modalPedido");
const btnFecharModalPedido = document.getElementById("btnFecharModalPedido");

const formEditarPedido = document.getElementById("formEditarPedido");
const pedidoIdEditar = document.getElementById("pedidoIdEditar");

const modalPedidoTitulo = document.getElementById("modalPedidoTitulo");
const modalPedidoStatus = document.getElementById("modalPedidoStatus");

const modalTitulo = document.getElementById("modalTitulo");
const modalCategoria = document.getElementById("modalCategoria");
const modalQuantidadeNecessaria = document.getElementById("modalQuantidadeNecessaria");
const modalQuantidadeRecebida = document.getElementById("modalQuantidadeRecebida");
const modalUnidade = document.getElementById("modalUnidade");
const modalUrgencia = document.getElementById("modalUrgencia");
const modalDescricao = document.getElementById("modalDescricao");

const btnAtualizarRecebidos = document.getElementById("btnAtualizarRecebidos");
const btnCancelarPedido = document.getElementById("btnCancelarPedido");
const msgModalPedido = document.getElementById("msgModalPedido");


// ===============================
// FUNÇÕES UTILITÁRIAS
// ===============================
function textoStatus(status) {
  const statusMap = {
    ativo: "Ativo",
    aberto: "Aberto",
    atendido: "Atendido",
    cancelado: "Cancelado"
  };

  return statusMap[status] || status || "-";
}

function textoUrgencia(urgencia) {
  const urgenciaMap = {
    baixa: "Baixa",
    media: "Média",
    alta: "Alta",
    critica: "Crítica"
  };

  return urgenciaMap[urgencia] || urgencia || "-";
}

function calcularPorcentagem(recebida, necessaria) {
  const quantidadeRecebida = Number(recebida || 0);
  const quantidadeNecessaria = Number(necessaria || 0);

  if (!quantidadeNecessaria || quantidadeNecessaria <= 0) return 0;

  const porcentagem = (quantidadeRecebida / quantidadeNecessaria) * 100;

  return Math.min(Math.round(porcentagem), 100);
}

function encontrarPedidoPorId(id) {
  return pedidos.find((pedido) => Number(pedido.id) === Number(id));
}

function limparMensagemDepois(elemento) {
  if (!elemento) return;

  setTimeout(() => {
    elemento.textContent = "";
  }, 2500);
}

function mostrarMensagem(elemento, texto, cor = "#333") {
  if (!elemento) return;

  elemento.textContent = texto;
  elemento.style.color = cor;
}

function converterStatusParaBackend(status) {
  if (status === "aberto") return "ativo";
  return status;
}

function converterStatusParaFront(status) {
  if (status === "ativo") return "aberto";
  return status;
}

function normalizarPedido(pedido) {
  return {
    id: pedido.id,

    titulo: pedido.titulo || pedido.item || "",
    descricao: pedido.descricao || "",
    categoria: pedido.categoria || "",

    quantidade_necessaria:
      pedido.quantidade_necessaria ??
      pedido.quantidadeNecessaria ??
      0,

    quantidade_recebida:
      pedido.quantidade_recebida ??
      pedido.quantidadeAtendida ??
      0,

    unidade: pedido.unidade || "unidades",

    urgencia: pedido.urgencia || "media",

    // No backend novo o status é "ativo".
    // No front antigo era "aberto".
    // Aqui convertemos para manter seu SCSS funcionando.
    status: converterStatusParaFront(pedido.status || "ativo"),

    criado_em: pedido.criado_em || pedido.criadoEm,
    atualizado_em: pedido.atualizado_em || pedido.atualizadoEm
  };
}


// ===============================
// CARREGAR PEDIDOS DO BACKEND
// ===============================
async function carregarPedidos() {
  try {
    listaPedidos.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <h3>Carregando pedidos...</h3>
        <p>Aguarde enquanto buscamos os pedidos do centro.</p>
      </div>
    `;

    const res = await fetch("http://localhost:3000/api/pedidos-doacao/meu-centro", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok || !data.sucesso) {
      listaPedidos.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <h3>Erro ao carregar pedidos</h3>
          <p>${data.mensagem || "Não foi possível buscar os pedidos do centro."}</p>
        </div>
      `;
      return;
    }

    pedidos = Array.isArray(data.dados)
      ? data.dados.map(normalizarPedido)
      : [];

    pedidosFiltrados = [...pedidos];

    renderizarPedidos(pedidosFiltrados);
    atualizarResumo();

  } catch (err) {
    console.error("Erro ao carregar pedidos:", err);

    listaPedidos.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <h3>Erro inesperado</h3>
        <p>Não foi possível carregar os pedidos.</p>
      </div>
    `;
  }
}


// ===============================
// RENDERIZAR PEDIDOS
// ===============================
function renderizarPedidos(lista = pedidosFiltrados) {
  listaPedidos.innerHTML = "";

  if (!lista || lista.length === 0) {
    listaPedidos.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-box-open"></i>
        <h3>Nenhum pedido encontrado</h3>
        <p>Crie um pedido ou ajuste os filtros.</p>
      </div>
    `;
    return;
  }

  lista.forEach((pedido) => {
    const porcentagem = calcularPorcentagem(
      pedido.quantidade_recebida,
      pedido.quantidade_necessaria
    );

    const div = document.createElement("div");
    div.classList.add("pedido-item");

    div.innerHTML = `
      <div class="pedido-item__top">
        <div class="pedido-item__title">
          <i class="fa-solid fa-box"></i>

          <div>
            <h3>${pedido.titulo}</h3>
            <p>${pedido.descricao || "Sem descrição informada."}</p>
          </div>
        </div>

        <div class="pedido-item__badges">
          <span class="badge badge--status-${pedido.status}">
            ${textoStatus(pedido.status)}
          </span>

          <span class="badge badge--urgencia-${pedido.urgencia}">
            ${textoUrgencia(pedido.urgencia)}
          </span>
        </div>
      </div>

      <div class="pedido-item__progress">
        <small>
          ${pedido.quantidade_recebida} de ${pedido.quantidade_necessaria}
          ${pedido.unidade} recebidos • ${porcentagem}%
        </small>

        <div class="progress-bar">
          <div class="progress-bar__fill" style="width: ${porcentagem}%"></div>
        </div>
      </div>

      <div class="pedido-item__actions">
        <button class="btn-editar" data-id="${pedido.id}">
          Editar
        </button>

        <button class="btn-recebidos" data-id="${pedido.id}">
          Atualizar recebidos
        </button>

        <button class="btn-excluir" data-id="${pedido.id}">
          Excluir pedido
        </button>
      </div>
    `;

    listaPedidos.appendChild(div);
  });
}


// ===============================
// ATUALIZAR CARDS
// ===============================
function atualizarResumo() {
  const ativos = pedidos.filter((p) => p.status === "aberto").length;

  const urgentes = pedidos.filter((p) => {
    return (
      p.status === "aberto" &&
      (p.urgencia === "alta" || p.urgencia === "critica")
    );
  }).length;

  const atendidos = pedidos.filter((p) => p.status === "atendido").length;

  if (totalPedidosAtivos) totalPedidosAtivos.textContent = ativos;
  if (totalPedidosUrgentes) totalPedidosUrgentes.textContent = urgentes;
  if (totalPedidosAtendidos) totalPedidosAtendidos.textContent = atendidos;
}


// ===============================
// CRIAR PEDIDO NO BACKEND
// ===============================
formPedidoDoacao.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = inputTitulo.value.trim();
  const categoria = inputCategoria.value;
  const quantidadeNecessaria = Number(inputQuantidadeNecessaria.value);
  const quantidadeRecebida = Number(inputQuantidadeRecebida.value || 0);
  const unidade = inputUnidade ? inputUnidade.value : "unidades";
  const urgencia = inputUrgencia.value || "media";
  const descricao = inputDescricao.value.trim();

  if (!titulo || !categoria || !quantidadeNecessaria) {
    mostrarMensagem(msgPedido, "Preencha título, categoria e quantidade necessária.", "red");
    limparMensagemDepois(msgPedido);
    return;
  }

  if (quantidadeNecessaria <= 0) {
    mostrarMensagem(msgPedido, "A quantidade necessária deve ser maior que zero.", "red");
    limparMensagemDepois(msgPedido);
    return;
  }

  if (quantidadeRecebida < 0) {
    mostrarMensagem(msgPedido, "A quantidade recebida não pode ser negativa.", "red");
    limparMensagemDepois(msgPedido);
    return;
  }

  if (quantidadeRecebida > quantidadeNecessaria) {
    mostrarMensagem(msgPedido, "A quantidade recebida não pode ser maior que a necessária.", "red");
    limparMensagemDepois(msgPedido);
    return;
  }

  try {
    mostrarMensagem(msgPedido, "Criando pedido...", "#555");

    const res = await fetch("http://localhost:3000/api/pedidos-doacao", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        titulo,
        item: titulo,
        descricao,
        categoria,
        quantidadeNecessaria,
        unidade,
        urgencia
      })
    });

    const data = await res.json();

    if (!res.ok || !data.sucesso) {
      mostrarMensagem(msgPedido, data.mensagem || "Erro ao criar pedido.", "red");
      limparMensagemDepois(msgPedido);
      return;
    }

    const pedidoCriado = normalizarPedido(data.dados);

    // O backend cria com recebidos = 0.
    // Se o usuário já informou recebidos no formulário, atualiza em seguida.
    if (quantidadeRecebida > 0) {
      await atualizarRecebimentoPedido(pedidoCriado.id, quantidadeRecebida, false);
    }

    formPedidoDoacao.reset();

    if (inputUnidade) inputUnidade.value = "unidades";
    if (inputUrgencia) inputUrgencia.value = "media";

    mostrarMensagem(msgPedido, "Pedido criado com sucesso.", "green");
    limparMensagemDepois(msgPedido);

    await carregarPedidos();

  } catch (err) {
    console.error("Erro ao criar pedido:", err);
    mostrarMensagem(msgPedido, "Erro na requisição.", "red");
    limparMensagemDepois(msgPedido);
  }
});


// ===============================
// ABRIR MODAL
// ===============================
function abrirModalPedido(pedido) {
  if (!pedido) return;

  pedidoSelecionadoId = pedido.id;

  pedidoIdEditar.value = pedido.id;

  modalPedidoTitulo.textContent = pedido.titulo;
  modalPedidoStatus.textContent = `Status: ${textoStatus(pedido.status)}`;

  modalTitulo.value = pedido.titulo;
  modalCategoria.value = pedido.categoria;
  modalQuantidadeNecessaria.value = pedido.quantidade_necessaria;
  modalQuantidadeRecebida.value = pedido.quantidade_recebida;
  modalUnidade.value = pedido.unidade;
  modalUrgencia.value = pedido.urgencia;
  modalDescricao.value = pedido.descricao || "";

  msgModalPedido.textContent = "";

  modalPedido.classList.remove("hidden");
}


// ===============================
// FECHAR MODAL
// ===============================
function fecharModalPedido() {
  pedidoSelecionadoId = null;

  pedidoIdEditar.value = "";
  msgModalPedido.textContent = "";

  modalPedido.classList.add("hidden");
}


// ===============================
// EDITAR PEDIDO NO BACKEND
// ===============================
formEditarPedido.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = pedidoIdEditar.value;

  if (!id) return;

  const titulo = modalTitulo.value.trim();
  const categoria = modalCategoria.value;
  const quantidadeNecessaria = Number(modalQuantidadeNecessaria.value);
  const quantidadeRecebida = Number(modalQuantidadeRecebida.value || 0);
  const unidade = modalUnidade.value;
  const urgencia = modalUrgencia.value;
  const descricao = modalDescricao.value.trim();

  if (!titulo || !categoria || !quantidadeNecessaria) {
    mostrarMensagem(msgModalPedido, "Preencha os campos obrigatórios.", "red");
    return;
  }

  if (quantidadeNecessaria <= 0) {
    mostrarMensagem(msgModalPedido, "Quantidade necessária inválida.", "red");
    return;
  }

  if (quantidadeRecebida > quantidadeNecessaria) {
    mostrarMensagem(msgModalPedido, "Recebido não pode ser maior que necessário.", "red");
    return;
  }

  try {
    mostrarMensagem(msgModalPedido, "Salvando alterações...", "#555");

    const res = await fetch(`http://localhost:3000/api/pedidos-doacao/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        titulo,
        item: titulo,
        descricao,
        categoria,
        quantidadeNecessaria,
        unidade,
        urgencia
      })
    });

    const data = await res.json();

    if (!res.ok || !data.sucesso) {
      mostrarMensagem(msgModalPedido, data.mensagem || "Erro ao editar pedido.", "red");
      return;
    }

    // Depois de editar os dados gerais, atualiza a quantidade recebida
    const recebimentoAtualizado = await atualizarRecebimentoPedido(id, quantidadeRecebida, false);

    if (!recebimentoAtualizado) {
      mostrarMensagem(
        msgModalPedido,
        "Pedido editado, mas houve erro ao atualizar recebidos.",
        "orange"
      );

      await carregarPedidos();
      return;
    }

    mostrarMensagem(msgModalPedido, "Pedido atualizado com sucesso.", "green");

    await carregarPedidos();

    setTimeout(() => {
      fecharModalPedido();
    }, 700);

  } catch (err) {
    console.error("Erro ao editar pedido:", err);
    mostrarMensagem(msgModalPedido, "Erro na requisição.", "red");
  }
});


// ===============================
// ATUALIZAR RECEBIDOS NO BACKEND
// ===============================
async function atualizarRecebimentoPedido(id, quantidadeRecebida, mostrarMsg = true) {
  try {
    const res = await fetch(`http://localhost:3000/api/pedidos-doacao/${id}/recebimento`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        quantidadeRecebida
      })
    });

    const data = await res.json();

    if (!res.ok || !data.sucesso) {
      if (mostrarMsg) {
        mostrarMensagem(msgModalPedido, data.mensagem || "Erro ao atualizar recebidos.", "red");
      }

      return false;
    }

    if (mostrarMsg) {
      mostrarMensagem(msgModalPedido, "Quantidade recebida atualizada.", "green");
    }

    return true;

  } catch (err) {
    console.error("Erro ao atualizar recebimento:", err);

    if (mostrarMsg) {
      mostrarMensagem(msgModalPedido, "Erro na requisição.", "red");
    }

    return false;
  }
}

btnAtualizarRecebidos.addEventListener("click", async () => {
  const id = pedidoIdEditar.value;
  const pedido = encontrarPedidoPorId(id);

  if (!pedido) return;

  const quantidadeRecebida = Number(modalQuantidadeRecebida.value || 0);

  if (quantidadeRecebida < 0) {
    mostrarMensagem(msgModalPedido, "Recebido não pode ser negativo.", "red");
    return;
  }

  if (quantidadeRecebida > Number(pedido.quantidade_necessaria)) {
    mostrarMensagem(msgModalPedido, "Recebido não pode ser maior que necessário.", "red");
    return;
  }

  const atualizado = await atualizarRecebimentoPedido(id, quantidadeRecebida, true);

  if (!atualizado) return;

  await carregarPedidos();

  setTimeout(() => {
    fecharModalPedido();
  }, 700);
});


// ===============================
// EXCLUIR / CANCELAR PEDIDO NO BACKEND
// ===============================
async function excluirPedido(id) {
  try {
    const res = await fetch(`http://localhost:3000/api/pedidos-doacao/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok || !data.sucesso) {
      alert(data.mensagem || "Erro ao excluir pedido.");
      return false;
    }

    await carregarPedidos();

    return true;

  } catch (err) {
    console.error("Erro ao excluir pedido:", err);
    alert("Erro na requisição.");
    return false;
  }
}


// ===============================
// EVENTOS DA LISTA
// ===============================
listaPedidos.addEventListener("click", async (e) => {
  const btnEditar = e.target.closest(".btn-editar");
  const btnRecebidos = e.target.closest(".btn-recebidos");
  const btnExcluir = e.target.closest(".btn-excluir");

  if (btnEditar) {
    const id = btnEditar.getAttribute("data-id");
    const pedido = encontrarPedidoPorId(id);

    abrirModalPedido(pedido);
  }

  if (btnRecebidos) {
    const id = btnRecebidos.getAttribute("data-id");
    const pedido = encontrarPedidoPorId(id);

    abrirModalPedido(pedido);

    setTimeout(() => {
      modalQuantidadeRecebida.focus();
      modalQuantidadeRecebida.select();
    }, 100);
  }

  if (btnExcluir) {
    const id = btnExcluir.getAttribute("data-id");
    const pedido = encontrarPedidoPorId(id);

    if (!pedido) return;

    const confirmar = confirm(`Deseja excluir pedido "${pedido.titulo}"?`);

    if (!confirmar) return;

    await excluirPedido(id);
  }
});


// ===============================
// MODAL EVENTOS
// ===============================
btnFecharModalPedido.addEventListener("click", fecharModalPedido);

modalPedido.addEventListener("click", (e) => {
  if (e.target === modalPedido) {
    fecharModalPedido();
  }
});

btnCancelarPedido.addEventListener("click", async () => {
  const id = pedidoIdEditar.value;
  const pedido = encontrarPedidoPorId(id);

  if (!pedido) return;

  const confirmar = confirm(`Deseja excluir pedido "${pedido.titulo}"?`);

  if (!confirmar) return;

  const excluido = await excluirPedido(id);

  if (excluido) {
    fecharModalPedido();
  }
});


// ===============================
// FILTROS
// ===============================
function aplicarFiltros() {
  const categoria = filtroCategoria.value;
  let status = filtroStatus.value;
  const urgencia = filtroUrgencia.value;

  // Se no HTML ainda estiver "ativo", converte para "aberto" porque no front usamos aberto.
  if (status === "ativo") {
    status = "aberto";
  }

  pedidosFiltrados = pedidos.filter((pedido) => {
    const categoriaOk = !categoria || pedido.categoria === categoria;
    const statusOk = !status || pedido.status === status;
    const urgenciaOk = !urgencia || pedido.urgencia === urgencia;

    return categoriaOk && statusOk && urgenciaOk;
  });

  renderizarPedidos(pedidosFiltrados);
}

formFiltrosPedidos.addEventListener("submit", (e) => {
  e.preventDefault();
  aplicarFiltros();
});

btnLimparFiltrosPedidos.addEventListener("click", () => {
  filtroCategoria.value = "";
  filtroStatus.value = "";
  filtroUrgencia.value = "";

  pedidosFiltrados = [...pedidos];

  renderizarPedidos(pedidosFiltrados);
});


// ===============================
// INICIALIZAÇÃO
// ===============================
window.addEventListener("load", () => {
  carregarPedidos();
});