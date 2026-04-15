// pega elementos
const select = document.getElementById("cidade-select");
const lista = document.getElementById("pontos-lista");

// dados fake (simulando backend)
const pontos = {
  "divinopolis": [
    { 
      id: 1,
      nome: "Igreja Central", 
      tipo: "Abrigo",
      rua: "Rua A, 123",
      horario: "08:00 - 18:00"
    },
    { 
      id: 2,
      nome: "Posto Saúde A", 
      tipo: "Atendimento Médico",
      rua: "Av. Brasil, 456",
      horario: "24h"
    }
  ],
  "belo-horizonte": [
    { 
      id: 3,
      nome: "Escola BH", 
      tipo: "Abrigo",
      rua: "Rua das Flores, 789",
      horario: "07:00 - 20:00"
    }
  ],
  "itauna": [
    { 
      id: 4,
      nome: "Centro Comunitário", 
      tipo: "Doações",
      rua: "Rua Central, 101",
      horario: "09:00 - 17:00"
    }
  ]
};

// função para renderizar pontos
function renderPontos(cidade) {
  lista.innerHTML = "";

  if (!pontos[cidade]) {
    lista.innerHTML = "<p>Nenhum ponto encontrado.</p>";
    return;
  }

  pontos[cidade].forEach(p => {
    const div = document.createElement("div");
    div.classList.add("ponto");

    div.innerHTML = `
      <div class="ponto__header">
        <i class="fa-solid fa-location-dot"></i>
        <strong>${p.nome}</strong>
      </div>

      <div class="ponto__info">
        <p>${p.tipo}</p>
        <small>${p.rua}</small>
        <small>${p.horario}</small>
      </div>

      <button class="ponto__btn" data-id="${p.id}">
        Ver detalhes
      </button>
    `;

    lista.appendChild(div);
  });
}

// evento ao mudar cidade
select.addEventListener("change", () => {
  const cidade = select.value;
  renderPontos(cidade);
});

// evento clique no botão (delegação)
lista.addEventListener("click", (e) => {
  if (e.target.classList.contains("ponto__btn")) {
    const id = e.target.getAttribute("data-id");

    // aqui você decide o que fazer
    alert("Ver detalhes do ponto ID: " + id);

    // futuro:
    // window.location.href = `/ponto.html?id=${id}`;
  }
});