// ELEMENTOS
const input = document.getElementById("cidade-input");
const sugestoes = document.getElementById("sugestoes");
const lista = document.getElementById("pontos-lista");

let cidades = [];
let centroSelecionado = null;

// NORMALIZAR
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// CARREGAR CIDADES
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

// AUTOCOMPLETE (SÓ MOSTRA, NÃO BUSCA)
input.addEventListener("input", () => {
  const valor = input.value;

  sugestoes.innerHTML = "";

  if (!valor) return;

  const filtradas = cidades.filter((c) =>
    normalizar(c.nome).includes(normalizar(valor))
  );

  filtradas.slice(0, 10).forEach((cidade) => {
    const li = document.createElement("li");
    li.textContent = cidade.nome;

    li.addEventListener("click", () => {
      input.value = cidade.nome;
      sugestoes.innerHTML = "";

      buscarPontos(cidade.nome); // 🔥 só aqui chama API
    });

    sugestoes.appendChild(li);
  });
});

// BUSCAR PONTOS
async function buscarPontos(cidade) {
  try {
    lista.innerHTML = "<p>Carregando...</p>";

    const res = await fetch(
      `http://localhost:3000/api/centros?cidade=${encodeURIComponent(cidade)}`
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

  // limpa lista antes de renderizar novamente
  lista.innerHTML = "";

  // verifica se existem pontos
  if (!pontos || pontos.length === 0) {
    lista.innerHTML = "<p>Nenhum ponto encontrado.</p>";
    return;
  }

  // percorre todos os pontos recebidos da API
  pontos.forEach((p) => {

    // cria container do ponto
    const div = document.createElement("div");

    // adiciona classe padrão
    div.classList.add("ponto");

    // estrutura HTML do card
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
        Selecionar
      </button>
    `;

    // adiciona card na tela
    lista.appendChild(div);

    // pega botão do card criado
    const btn = div.querySelector(".ponto__btn");

    // evento de clique para selecionar centro
    btn.addEventListener("click", () => {

      // remove destaque de todos os cards
      document.querySelectorAll(".ponto").forEach(el => {
        el.classList.remove("selecionado");
      });

      // adiciona destaque no card atual
      div.classList.add("selecionado");

      // salva centro selecionado na variável global
      centroSelecionado = p;

      // salva no localStorage
      // isso impede perder seleção ao recarregar página
      localStorage.setItem(
        "centroSelecionado",
        JSON.stringify(p)
      );

      // feedback simples para usuário
      alert(`Centro selecionado: ${p.nome}`);
    });
  });
}

// INIT
window.addEventListener("load", carregarCidades);

