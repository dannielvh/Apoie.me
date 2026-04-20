// ELEMENTOS
const input = document.getElementById("cidade-input");
const sugestoes = document.getElementById("sugestoes");
const lista = document.getElementById("pontos-lista");

let cidades = [];
let timeout;

// NORMALIZAR TEXTO (remove acento)
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// CARREGAR CIDADES (IBGE)
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

// AUTOCOMPLETE + BUSCA
input.addEventListener("input", () => {
  const valor = input.value;

  sugestoes.innerHTML = "";
  clearTimeout(timeout);

  // 🔥 evita lixo de requisição
  if (!valor || valor.length < 3) return;

  // FILTRAR CIDADES
  const filtradas = cidades.filter((c) =>
    normalizar(c.nome).includes(normalizar(valor))
  );

  // MOSTRAR SUGESTÕES
  filtradas.slice(0, 10).forEach((cidade) => {
    const li = document.createElement("li");
    li.textContent = cidade.nome;

    li.addEventListener("click", () => {
      input.value = cidade.nome;
      sugestoes.innerHTML = "";

      clearTimeout(timeout); // 🔥 evita requisição duplicada

      buscarPontos(cidade.nome);
    });

    sugestoes.appendChild(li);
  });

  // 🔥 BUSCA AUTOMÁTICA (debounce)
  timeout = setTimeout(() => {
    if (valor.length >= 3) {
      buscarPontos(valor);
    }
  }, 500);
});

// BUSCAR PONTOS NO BACKEND
async function buscarPontos(cidade) {
  try {
    lista.innerHTML = "<p>Carregando...</p>";

    const res = await fetch(
      `http://localhost:3000/api/centros?cidade=${encodeURIComponent(cidade)}`
    );

    const dados = await res.json();

    renderPontos(dados);
  } catch (err) {
    console.error("Erro ao buscar pontos:", err);
    lista.innerHTML = "<p>Erro ao carregar dados.</p>";
  }
}

// RENDERIZAR PONTOS
function renderPontos(pontos) {
  lista.innerHTML = "";

  if (!pontos || pontos.length === 0) {
    lista.innerHTML = "<p>Nenhum ponto encontrado.</p>";
    return;
  }

  pontos.forEach((p) => {
    const div = document.createElement("div");
    div.classList.add("ponto");

    div.innerHTML = `
      <div class="ponto__header">
        <i class="fa-solid fa-location-dot"></i>
        <strong>${p.nome}</strong>
      </div>

      <div class="ponto__info">
        <p>${p.tipo || ""}</p>
        <small>${p.rua || ""}</small>
        <small>${p.horario || ""}</small>
      </div>

      <button class="ponto__btn" data-id="${p.id}">
        Ver detalhes
      </button>
    `;

    lista.appendChild(div);
  });
}

// EVENTO BOTÃO DETALHES
lista.addEventListener("click", (e) => {
  if (e.target.classList.contains("ponto__btn")) {
    const id = e.target.getAttribute("data-id");

    alert("Ver detalhes do ponto ID: " + id);

    // futuro:
    // window.location.href = `/ponto.html?id=${id}`;
  }
});

// INICIALIZAÇÃO
window.addEventListener("load", () => {
  carregarCidades();
});