// ELEMENTOS
const input = document.getElementById("cidade-input");
const sugestoes = document.getElementById("sugestoes");
const lista = document.getElementById("pontos-lista");

let cidades = [];

// NORMALIZAR
function normalizar(texto) {
  return texto
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
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

// AUTOCOMPLETE (SUGESTÃO)
input.addEventListener("input", () => {
  const valor = normalizar(input.value);

  sugestoes.innerHTML = "";

  if (!valor) return;

  const filtradas = cidades.filter((c) =>
    normalizar(c.nome).includes(valor)
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

// ENTER (BUSCA REAL)
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();

    const valor = input.value.trim();

    if (!valor) return;

    // 🔥 valida cidade real
    const cidadeEncontrada = cidades.find((c) =>
      normalizar(c.nome) === normalizar(valor)
    );

    sugestoes.innerHTML = "";

    if (!cidadeEncontrada) {
      lista.innerHTML = "<p>Selecione uma cidade válida.</p>";
      return;
    }

    input.value = cidadeEncontrada.nome;

    buscarPontos(cidadeEncontrada.nome);
  }
});

// BUSCAR PONTOS (BACKEND)
async function buscarPontos(cidade) {
  try {
    lista.innerHTML = "<p>Carregando...</p>";

    const res = await fetch(
      `http://localhost:3000/api/centros?cidade=${encodeURIComponent(cidade.trim())}`
    );

    const dados = await res.json();

    renderPontos(dados);
  } catch (err) {
    console.error("Erro:", err);
    lista.innerHTML = "<p>Erro ao carregar dados.</p>";
  }
}

// RENDER
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

// INIT
window.addEventListener("load", carregarCidades);