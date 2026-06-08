const token = localStorage.getItem("token");

if (!token) {
  alert("Você precisa estar logado para se candidatar como voluntário.");
  window.location.href = "login.html";
}

const form = document.getElementById("form-candidatura");
const msg = document.getElementById("msg");
const selectCidade = document.getElementById("select-cidade");
const selectCentro = document.getElementById("select-centro");
const containerCandidaturas = document.getElementById("container-candidaturas");

let cidades = [];

// =======================
// CARREGAR CIDADES LOCAL DO BANCO
// =======================
async function carregarCidades() {
  try {
    const res = await fetch("http://localhost:3000/api/voluntarios/cidades", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    cidades = await res.json();
    
    selectCidade.innerHTML = '<option value="">Selecione sua Cidade</option>';
    cidades.forEach((c) => {
      const option = document.createElement("option");
      option.value = c.id_cidade;
      option.textContent = c.nome_cidade || c.nome;
      selectCidade.appendChild(option);
    });
  } catch (err) {
    console.error("Erro ao carregar cidades:", err);
  }
}

// =======================
// CARREGAMENTO DINÂMICO DE CENTROS
// =======================
selectCidade.addEventListener("change", async () => {
  const idCidade = selectCidade.value;
  
  selectCentro.innerHTML = '<option value="">Selecione um Centro de Apoio</option>';
  
  if (!idCidade) {
    selectCentro.disabled = true;
    return;
  }

  selectCentro.disabled = false;
  selectCentro.options[0].textContent = "Carregando centros...";

  try {
    const res = await fetch(`http://localhost:3000/api/voluntarios/centros/${idCidade}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const centros = await res.json();

    selectCentro.innerHTML = '<option value="">Selecione um Centro de Apoio</option>';
    
    if (centros.length === 0) {
      selectCentro.options[0].textContent = "Nenhum centro disponível nesta cidade";
      return;
    }

    centros.forEach((centro) => {
      const option = document.createElement("option");
      option.value = centro.id_centro;
      option.textContent = centro.nome;
      selectCentro.appendChild(option);
    });
  } catch (err) {
    console.error("Erro ao carregar centros:", err);
    selectCentro.options[0].textContent = "Erro ao carregar centros";
  }
});

// =======================
// MÁSCARA TELEFONE
// =======================
const inputTel = document.getElementById("telefone");

inputTel.addEventListener("input", (e) => {
  let v = e.target.value.replace(/\D/g, "");

  if (v.length <= 10) {
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d{4})(\d)/, "$1-$2");
  } else {
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d{5})(\d)/, "$1-$2");
  }

  e.target.value = v.slice(0, 15);
});

// =======================
// SUBMIT DA CANDIDATURA
// =======================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dados = {
    nome: document.getElementById("nome").value.trim(),
    email: document.getElementById("email").value.trim(),
    telefone: inputTel.value.trim(),
    id_centro: selectCentro.value,
    habilidades: document.getElementById("habilidades").value.trim()
  };

  if (!dados.nome || !dados.email || !dados.telefone || !dados.id_centro || !dados.habilidades) {
    msg.textContent = "Preencha os campos obrigatórios";
    msg.style.color = "red";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/voluntarios/candidatar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.erro || "Erro ao enviar candidatura";
      msg.style.color = "red";
      return;
    }

    msg.textContent = "Candidatura enviada com sucesso!";
    msg.style.color = "green";

    form.reset();
    selectCentro.disabled = true;
    selectCentro.innerHTML = '<option value="">Selecione um Centro de Apoio</option>';
    
    // Atualiza a listagem visual após enviar
    carregarCandidaturas();
  } catch (err) {
    msg.textContent = "Erro na requisição";
    msg.style.color = "red";
  }
});

// =======================
// VISUALIZAÇÃO DE CANDIDATURAS
// =======================
async function carregarCandidaturas() {
  if (!containerCandidaturas) return; // evita quebrar se não estiver na tela de listagem

  containerCandidaturas.innerHTML = "<p>Carregando candidaturas...</p>";

  try {
    const res = await fetch("http://localhost:3000/api/voluntarios/candidaturas", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const candidaturas = await res.json();

    if (candidaturas.length === 0) {
      containerCandidaturas.innerHTML = "<p>Nenhuma candidatura enviada ainda.</p>";
      return;
    }

    containerCandidaturas.innerHTML = "";

    candidaturas.forEach((cand) => {
      const card = document.createElement("div");
      card.className = "card-candidatura";
      
      card.innerHTML = `
        <h4>${cand.nome}</h4>
        <p><strong>Centro:</strong> ${cand.nome_centro || "Centro não identificado"}</p>
        <p><strong>Habilidades:</strong> ${cand.habilidades}</p>
        <span class="status status-${cand.status ? cand.status.toLowerCase() : "pendente"}">${cand.status || "Pendente"}</span>
      `;
      
      containerCandidaturas.appendChild(card);
    });
  } catch (err) {
    containerCandidaturas.innerHTML = "<p>Erro ao carregar candidaturas.</p>";
  }
}

// =======================
// INIT
// =======================
window.addEventListener("load", () => {
  carregarCidades();
  carregarCandidaturas();
});