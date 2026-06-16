// =====================================================
// LIMITAR PEDIDOS - PÁGINA DE DOAÇÕES
// arquivo: limitarPedidos.js
// =====================================================

const LIMITE_INICIAL_PEDIDOS = 6;
const QUANTIDADE_POR_CLIQUE = 6;

let limiteAtualPedidos = LIMITE_INICIAL_PEDIDOS;
let filtroAtualPedidos = "todos";

document.addEventListener("DOMContentLoaded", () => {
  iniciarLimitadorPedidos();
});

function iniciarLimitadorPedidos() {
  criarBotaoVerMais();
  configurarCliqueVerMais();
  configurarFiltrosComLimite();

  // Espera o pedidos.js carregar os cards vindos do backend
  setTimeout(() => {
    aplicarLimitePedidos();
  }, 800);
}

// =====================================================
// CRIAR BOTÃO, SE NÃO EXISTIR NO HTML
// =====================================================
function criarBotaoVerMais() {
  const lista = document.getElementById("pedidos-lista");

  if (!lista) return;

  let container = document.querySelector(".pedidos-ver-mais");

  if (container) return;

  container = document.createElement("div");
  container.classList.add("pedidos-ver-mais");

  container.innerHTML = `
    <button id="btn-ver-mais-pedidos" type="button">
      Ver mais pedidos
    </button>
  `;

  lista.insertAdjacentElement("afterend", container);
}

// =====================================================
// CLIQUE NO BOTÃO VER MAIS
// =====================================================
function configurarCliqueVerMais() {
  document.addEventListener("click", (e) => {
    const botao = e.target.closest("#btn-ver-mais-pedidos");

    if (!botao) return;

    limiteAtualPedidos += QUANTIDADE_POR_CLIQUE;
    aplicarLimitePedidos();
  });
}

// =====================================================
// FILTROS
// =====================================================
function configurarFiltrosComLimite() {
  const filtros = document.querySelectorAll(".filtro-btn");

  filtros.forEach((btn) => {
    btn.addEventListener("click", () => {
      filtroAtualPedidos = btn.dataset.filtro || "todos";
      limiteAtualPedidos = LIMITE_INICIAL_PEDIDOS;

      setTimeout(() => {
        aplicarLimitePedidos();
      }, 100);
    });
  });
}

// =====================================================
// APLICAR LIMITE
// =====================================================
function aplicarLimitePedidos() {
  const cards = Array.from(document.querySelectorAll(".pedido-card"));
  const containerBotao = document.querySelector(".pedidos-ver-mais");

  if (!cards.length) {
    if (containerBotao) {
      containerBotao.classList.add("hidden");
    }

    return;
  }

  const cardsDoFiltro = cards.filter((card) => {
    if (filtroAtualPedidos === "todos") return true;

    return card.dataset.urgencia === filtroAtualPedidos;
  });

  let contador = 0;

  cards.forEach((card) => {
    const pertenceAoFiltro =
      filtroAtualPedidos === "todos" ||
      card.dataset.urgencia === filtroAtualPedidos;

    if (!pertenceAoFiltro) {
      card.style.display = "none";
      return;
    }

    if (contador < limiteAtualPedidos) {
      card.style.display = "flex";
      contador++;
    } else {
      card.style.display = "none";
    }
  });

  if (containerBotao) {
    if (cardsDoFiltro.length > limiteAtualPedidos) {
      containerBotao.classList.remove("hidden");
    } else {
      containerBotao.classList.add("hidden");
    }
  }
}