// ===============================
// DADOS FAKE
// ===============================
// Depois, isso será substituído por dados vindos do backend.

let pedidos = [
  {
    id: 1,
    titulo: "Precisamos de água potável",
    descricao: "Água para famílias que estão em abrigo temporário.",
    categoria: "Água",
    quantidade_necessaria: 100,
    quantidade_recebida: 35,
    unidade: "litros",
    urgencia: "alta",
    status: "aberto"
  },
  {
    id: 2,
    titulo: "Arrecadação de alimentos",
    descricao: "Alimentos não perecíveis para montagem de cestas básicas.",
    categoria: "Alimentos",
    quantidade_necessaria: 80,
    quantidade_recebida: 80,
    unidade: "unidades",
    urgencia: "media",
    status: "atendido"
  },
  {
    id: 3,
    titulo: "Produtos de higiene",
    descricao: "Sabonete, pasta de dente, papel higiênico e absorventes.",
    categoria: "Produtos de higiene",
    quantidade_necessaria: 50,
    quantidade_recebida: 10,
    unidade: "unidades",
    urgencia: "critica",
    status: "aberto"
  }
];

let proximoId = 4;
let pedidosFiltrados = [...pedidos];


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
    aberto: "Aberto",
    atendido: "Atendido",
    cancelado: "Cancelado"
  };

  return statusMap[status] || status;
}

function textoUrgencia(urgencia) {
  const urgenciaMap = {
    baixa: "Baixa",
    media: "Média",
    alta: "Alta",
    critica: "Crítica"
  };

  return urgenciaMap[urgencia] || urgencia;
}

function calcularPorcentagem(recebida, necessaria) {
  if (!necessaria || necessaria <= 0) return 0;

  const porcentagem = (recebida / necessaria) * 100;

  return Math.min(Math.round(porcentagem), 100);
}

function encontrarPedidoPorId(id) {
  return pedidos.find((pedido) => Number(pedido.id) === Number(id));
}

function limparMensagemDepois(elemento) {
  setTimeout(() => {
    elemento.textContent = "";
  }, 2500);
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

  const urgentes = pedidos.filter(
    (p) =>
      p.status === "aberto" &&
      (p.urgencia === "alta" || p.urgencia === "critica")
  ).length;

  const atendidos = pedidos.filter((p) => p.status === "atendido").length;

  totalPedidosAtivos.textContent = ativos;
  totalPedidosUrgentes.textContent = urgentes;
  totalPedidosAtendidos.textContent = atendidos;
}


// ===============================
// CRIAR PEDIDO
// ===============================
formPedidoDoacao.addEventListener("submit", (e) => {
  e.preventDefault();

  const titulo = inputTitulo.value.trim();
  const categoria = inputCategoria.value;
  const quantidadeNecessaria = Number(inputQuantidadeNecessaria.value);
  const quantidadeRecebida = Number(inputQuantidadeRecebida.value || 0);
  const unidade = inputUnidade.value;
  const urgencia = inputUrgencia.value;
  const descricao = inputDescricao.value.trim();

  if (!titulo || !categoria || !quantidadeNecessaria) {
    msgPedido.textContent = "Preencha título, categoria e quantidade necessária.";
    msgPedido.style.color = "red";
    limparMensagemDepois(msgPedido);
    return;
  }

  if (quantidadeNecessaria <= 0) {
    msgPedido.textContent = "A quantidade necessária deve ser maior que zero.";
    msgPedido.style.color = "red";
    limparMensagemDepois(msgPedido);
    return;
  }

  if (quantidadeRecebida < 0) {
    msgPedido.textContent = "A quantidade recebida não pode ser negativa.";
    msgPedido.style.color = "red";
    limparMensagemDepois(msgPedido);
    return;
  }

  if (quantidadeRecebida > quantidadeNecessaria) {
    msgPedido.textContent = "A quantidade recebida não pode ser maior que a necessária.";
    msgPedido.style.color = "red";
    limparMensagemDepois(msgPedido);
    return;
  }

  const status = quantidadeRecebida === quantidadeNecessaria ? "atendido" : "aberto";

  const novoPedido = {
    id: proximoId++,
    titulo,
    descricao,
    categoria,
    quantidade_necessaria: quantidadeNecessaria,
    quantidade_recebida: quantidadeRecebida,
    unidade,
    urgencia,
    status
  };

  pedidos.unshift(novoPedido);

  formPedidoDoacao.reset();

  inputUnidade.value = "unidades";
  inputUrgencia.value = "media";

  msgPedido.textContent = "Pedido criado com sucesso.";
  msgPedido.style.color = "green";
  limparMensagemDepois(msgPedido);

  aplicarFiltros();
  atualizarResumo();
});


// ===============================
// ABRIR MODAL
// ===============================
function abrirModalPedido(pedido) {
  if (!pedido) return;

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
  pedidoIdEditar.value = "";
  msgModalPedido.textContent = "";
  modalPedido.classList.add("hidden");
}


// ===============================
// EDITAR PEDIDO
// ===============================
formEditarPedido.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = pedidoIdEditar.value;
  const pedido = encontrarPedidoPorId(id);

  if (!pedido) return;

  const titulo = modalTitulo.value.trim();
  const categoria = modalCategoria.value;
  const quantidadeNecessaria = Number(modalQuantidadeNecessaria.value);
  const quantidadeRecebida = Number(modalQuantidadeRecebida.value || 0);
  const unidade = modalUnidade.value;
  const urgencia = modalUrgencia.value;
  const descricao = modalDescricao.value.trim();

  if (!titulo || !categoria || !quantidadeNecessaria) {
    msgModalPedido.textContent = "Preencha os campos obrigatórios.";
    msgModalPedido.style.color = "red";
    return;
  }

  if (quantidadeRecebida > quantidadeNecessaria) {
    msgModalPedido.textContent = "Recebido não pode ser maior que necessário.";
    msgModalPedido.style.color = "red";
    return;
  }

  pedido.titulo = titulo;
  pedido.categoria = categoria;
  pedido.quantidade_necessaria = quantidadeNecessaria;
  pedido.quantidade_recebida = quantidadeRecebida;
  pedido.unidade = unidade;
  pedido.urgencia = urgencia;
  pedido.descricao = descricao;
  pedido.status = quantidadeRecebida === quantidadeNecessaria ? "atendido" : "aberto";

  msgModalPedido.textContent = "Pedido atualizado com sucesso.";
  msgModalPedido.style.color = "green";

  aplicarFiltros();
  atualizarResumo();

  setTimeout(() => {
    fecharModalPedido();
  }, 700);
});


// ===============================
// ATUALIZAR RECEBIDOS
// ===============================
btnAtualizarRecebidos.addEventListener("click", () => {
  const id = pedidoIdEditar.value;
  const pedido = encontrarPedidoPorId(id);

  if (!pedido) return;

  const quantidadeRecebida = Number(modalQuantidadeRecebida.value || 0);

  if (quantidadeRecebida < 0) {
    msgModalPedido.textContent = "Recebido não pode ser negativo.";
    msgModalPedido.style.color = "red";
    return;
  }

  if (quantidadeRecebida > pedido.quantidade_necessaria) {
    msgModalPedido.textContent = "Recebido não pode ser maior que necessário.";
    msgModalPedido.style.color = "red";
    return;
  }

  pedido.quantidade_recebida = quantidadeRecebida;
  pedido.status =
    quantidadeRecebida === pedido.quantidade_necessaria ? "atendido" : "aberto";

  msgModalPedido.textContent = "Quantidade recebida atualizada.";
  msgModalPedido.style.color = "green";

  aplicarFiltros();
  atualizarResumo();

  setTimeout(() => {
    fecharModalPedido();
  }, 700);
});


// ===============================
// EXCLUIR PEDIDO
// ===============================
btnCancelarPedido.addEventListener("click", () => {
  const id = pedidoIdEditar.value;
  const pedido = encontrarPedidoPorId(id);

  if (!pedido) return;

  const confirmar = confirm(`Deseja excluir pedido "${pedido.titulo}"?`);

  if (!confirmar) return;

  pedidos = pedidos.filter((p) => Number(p.id) !== Number(id));

  msgModalPedido.textContent = "Pedido excluído com sucesso.";
  msgModalPedido.style.color = "green";

  aplicarFiltros();
  atualizarResumo();

  setTimeout(() => {
    fecharModalPedido();
  }, 700);
});


// ===============================
// EVENTOS DA LISTA
// ===============================
listaPedidos.addEventListener("click", (e) => {
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

    pedidos = pedidos.filter((p) => Number(p.id) !== Number(id));

    aplicarFiltros();
    atualizarResumo();
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


// ===============================
// FILTROS
// ===============================
function aplicarFiltros() {
  const categoria = filtroCategoria.value;
  const status = filtroStatus.value;
  const urgencia = filtroUrgencia.value;

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

  aplicarFiltros();
});


// ===============================
// INICIALIZAÇÃO
// ===============================
window.addEventListener("load", () => {
  renderizarPedidos(pedidos);
  atualizarResumo();
});