// ===============================
// ELEMENTOS PRINCIPAIS
// ===============================
const input = document.getElementById("cidade-input");
const sugestoes = document.getElementById("sugestoes");
const lista = document.getElementById("pontos-lista");

const totalCentros = document.getElementById("total-centros");
const cidadeAtual = document.getElementById("cidade-atual");

let cidades = [];


// ===============================
// NORMALIZAR TEXTO
// ===============================
function normalizar(texto) {
  return texto
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}


// ===============================
// CARREGAR CIDADES DO IBGE
// ===============================
async function carregarCidades() {
  try {
    const res = await fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados/MG/municipios"
    );

    cidades = await res.json();

  } catch (err) {
    console.error("Erro ao carregar cidades:", err);
  }
}


// ===============================
// AUTOCOMPLETE DE CIDADE
// ===============================
input.addEventListener("input", () => {
  const valor = normalizar(input.value);

  sugestoes.innerHTML = "";

  if (!valor) return;

  const filtradas = cidades.filter((cidade) =>
    normalizar(cidade.nome).includes(valor)
  );

  filtradas.slice(0, 10).forEach((cidade) => {
    const li = document.createElement("li");
    li.textContent = cidade.nome;

    li.addEventListener("click", () => {
      input.value = cidade.nome;
      sugestoes.innerHTML = "";

      buscarPontos(cidade.nome);
    });

    sugestoes.appendChild(li);
  });
});


// ===============================
// BUSCAR COM ENTER
// ===============================
input.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  e.preventDefault();

  const valor = input.value.trim();

  if (!valor) return;

  const cidadeEncontrada = cidades.find((cidade) =>
    normalizar(cidade.nome) === normalizar(valor)
  );

  sugestoes.innerHTML = "";

  if (!cidadeEncontrada) {
    lista.innerHTML = `
      <div class="empty-list">
        <i class="fa-solid fa-circle-exclamation"></i>
        <p>Selecione uma cidade válida da lista.</p>
      </div>
    `;

    atualizarResumo(0, "-");
    return;
  }

  input.value = cidadeEncontrada.nome;

  buscarPontos(cidadeEncontrada.nome);
});


// ===============================
// BUSCAR CENTROS NO BACKEND
// ===============================
async function buscarPontos(cidade) {
  try {
    lista.innerHTML = `
      <div class="empty-list">
        <i class="fa-solid fa-spinner"></i>
        <p>Carregando centros de apoio...</p>
      </div>
    `;

    const res = await fetch(
      `http://localhost:3000/api/centros?cidade=${encodeURIComponent(cidade.trim())}`
    );

    const dados = await res.json();

    atualizarResumo(dados.length, cidade);
    renderPontos(dados);

  } catch (err) {
    console.error("Erro ao carregar centros:", err);

    lista.innerHTML = `
      <div class="empty-list">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>Erro ao carregar centros de apoio.</p>
      </div>
    `;

    atualizarResumo(0, "-");
  }
}


// ===============================
// ATUALIZAR RESUMO DA BUSCA
// ===============================
function atualizarResumo(total, cidade) {
  if (totalCentros) {
    totalCentros.textContent = total;
  }

  if (cidadeAtual) {
    cidadeAtual.textContent = cidade || "-";
  }
}


// ===============================
// RENDERIZAR CENTROS
// ===============================
function renderPontos(pontos) {
  lista.innerHTML = "";

  if (!pontos || pontos.length === 0) {
    lista.innerHTML = `
      <div class="empty-list">
        <i class="fa-solid fa-location-dot"></i>
        <p>Nenhum centro de apoio encontrado para essa cidade.</p>
      </div>
    `;
    return;
  }

  pontos.forEach((ponto) => {
    const div = document.createElement("div");
    div.classList.add("ponto");

    div.innerHTML = `
      <div class="ponto__header">
        <i class="fa-solid fa-location-dot"></i>
        <strong>${ponto.nome}</strong>
      </div>

      <div class="ponto__info">
        <p>${ponto.tipo || "Tipo não informado"}</p>

        <small>
          <i class="fa-solid fa-map-pin"></i>
          ${ponto.rua || "Endereço não informado"}
        </small>

        <small>
          <i class="fa-solid fa-clock"></i>
          ${ponto.horario || "Horário não informado"}
        </small>

        <small>
          <i class="fa-solid fa-phone"></i>
          ${ponto.telefone || "Telefone não informado"}
        </small>
      </div>

      <button class="ponto__btn" type="button">
        Ver detalhes
      </button>
    `;

    const btn = div.querySelector(".ponto__btn");

    btn.addEventListener("click", () => {
      abrirModalCentro(ponto);
    });

    lista.appendChild(div);
  });
}


// ===============================
// MODAL DE DETALHES DO CENTRO
// ===============================
function abrirModalCentro(centro) {
  document.getElementById("modalCentroTipo").textContent =
    centro.tipo || "Tipo não informado";

  document.getElementById("modalCentroNome").textContent =
    centro.nome || "Centro de apoio";

  document.getElementById("modalCentroDescricao").textContent =
    centro.descricao || "Este centro ainda não possui descrição cadastrada.";

  document.getElementById("modalCentroCidade").textContent =
    centro.cidade || "-";

  document.getElementById("modalCentroRua").textContent =
    centro.rua || "-";

  document.getElementById("modalCentroHorario").textContent =
    centro.horario || "-";

  document.getElementById("modalCentroTelefone").textContent =
    centro.telefone || "-";

  renderPedidosCentro([]);

  document.getElementById("modalCentro").classList.remove("hidden");
}


function fecharModalCentro() {
  document.getElementById("modalCentro").classList.add("hidden");
}


// ===============================
// PEDIDOS DO CENTRO
// ===============================
// Por enquanto fica vazio.
// Depois, quando existir backend de pedidos, essa função recebe os pedidos reais.
function renderPedidosCentro(pedidos) {
  const container = document.getElementById("modalCentroPedidos");

  if (!container) return;

  if (!pedidos || pedidos.length === 0) {
    container.innerHTML = `
      <p>Nenhum pedido de doação cadastrado no momento.</p>
    `;
    return;
  }

  container.innerHTML = "";

  pedidos.forEach((pedido) => {
    const div = document.createElement("div");
    div.classList.add("pedido-modal");

    div.innerHTML = `
      <strong>${pedido.titulo}</strong>
      <span>${pedido.quantidade_atual || 0} / ${pedido.quantidade_necessaria || 0}</span>
    `;

    container.appendChild(div);
  });
}


// ===============================
// EVENTOS DO MODAL
// ===============================
const modalCentro = document.getElementById("modalCentro");
const fecharModalBtn = document.getElementById("fecharModalCentro");

if (fecharModalBtn) {
  fecharModalBtn.addEventListener("click", fecharModalCentro);
}

if (modalCentro) {
  modalCentro.addEventListener("click", (e) => {
    if (e.target === modalCentro) {
      fecharModalCentro();
    }
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalCentro && !modalCentro.classList.contains("hidden")) {
    fecharModalCentro();
  }
});


// ===============================
// INICIALIZAÇÃO
// ===============================
window.addEventListener("load", carregarCidades);