// ELEMENTOS
const select = document.getElementById("cidade-select");
const lista = document.getElementById("pontos-lista");


// CARREGAR CIDADES (IBGE)
async function carregarCidades() {
  try {
    const res = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados/MG/municipios');
    const cidades = await res.json();

    cidades.forEach(cidade => {
      const option = document.createElement("option");

      option.value = cidade.nome.toLowerCase();
      option.textContent = cidade.nome;

      select.appendChild(option);
    });

  } catch (err) {
    console.error("Erro ao carregar cidades:", err);
  }
}


// RENDERIZAR PONTOS
function renderPontos(pontos) {
  lista.innerHTML = "";

  if (!pontos || pontos.length === 0) {
    lista.innerHTML = "<p>Nenhum ponto encontrado.</p>";
    return;
  }

  pontos.forEach(p => {
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


// BUSCAR PONTOS NO BACKEND
async function buscarPontos(cidade) {
  try {
    const res = await fetch(`http://localhost:3000/api/centros?cidade=${cidade}`);
    const dados = await res.json();

    renderPontos(dados);

  } catch (err) {
    console.error("Erro ao buscar pontos:", err);
    lista.innerHTML = "<p>Erro ao carregar dados.</p>";
  }
}


// EVENTOS
select.addEventListener("change", () => {
  const cidade = select.value;

  if (!cidade) return;

  buscarPontos(cidade);
});

// botão detalhes (delegação)
lista.addEventListener("click", (e) => {
  if (e.target.classList.contains("ponto__btn")) {
    const id = e.target.getAttribute("data-id");

    alert("Ver detalhes do ponto ID: " + id);

    // futuro:
    // window.location.href = `/ponto.html?id=${id}`;
  }
});

// =============================
// INICIALIZAÇÃO
// =============================
window.addEventListener("load", () => {
  carregarCidades();
});