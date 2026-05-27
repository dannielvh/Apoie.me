// ===============================
// PROTEÇÃO DA PÁGINA
// ===============================
const token = localStorage.getItem("token");

if (!token) {
  alert("Você precisa estar logado.");
  window.location.href = "../login.html";
}


// ===============================
// ELEMENTOS DO FORMULÁRIO
// ===============================
const form = document.getElementById("formMeuCentro");
const msg = document.getElementById("msg");

const inputNome = document.getElementById("nome");
const inputCidade = document.getElementById("cidade-input");
const sugestoes = document.getElementById("sugestoes");
const selectTipo = document.getElementById("tipo");

const inputRua = document.getElementById("rua");
const inputHorario = document.getElementById("horario");
const inputTelefone = document.getElementById("telefone");
const inputEmailContato = document.getElementById("email_contato");
const inputResponsavel = document.getElementById("responsavel_nome");
const inputCNPJ = document.getElementById("cnpj");
const inputDescricao = document.getElementById("descricao");

let cidades = [];


// ===============================
// TIPOS DE CENTRO
// ===============================
const tipos = [
  "Abrigo",
  "Saúde",
  "Doações",
  "Psicológico",
  "Alimentação",
  "Resgate",
  "Acolhimento",
  "Jurídico",
  "Voluntariado",
  "Emergência",
  "Pets",
  "Defesa Civil"
];

tipos.forEach((tipo) => {
  const option = document.createElement("option");
  option.value = tipo;
  option.textContent = tipo;
  selectTipo.appendChild(option);
});


// ===============================
// FUNÇÕES UTILITÁRIAS
// ===============================
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatarStatus(status) {
  const statusMap = {
    pendente: "Aguardando aprovação",
    aprovado: "Aprovado",
    rejeitado: "Rejeitado",
    suspenso: "Suspenso"
  };

  return statusMap[status] || status;
}

function formatarCNPJ(cnpj) {
  if (!cnpj) return "";

  let v = cnpj.replace(/\D/g, "");

  v = v
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");

  return v.slice(0, 18);
}

function cidadeExiste(nomeCidade) {
  return cidades.some((c) => normalizar(c.nome) === normalizar(nomeCidade));
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
inputCidade.addEventListener("input", () => {
  const valor = inputCidade.value;

  sugestoes.innerHTML = "";

  if (valor.length < 2) return;

  const filtradas = cidades.filter((c) =>
    normalizar(c.nome).includes(normalizar(valor))
  );

  filtradas.slice(0, 8).forEach((cidade) => {
    const li = document.createElement("li");
    li.textContent = cidade.nome;

    li.addEventListener("click", () => {
      inputCidade.value = cidade.nome;
      sugestoes.innerHTML = "";
    });

    sugestoes.appendChild(li);
  });
});


// ===============================
// MÁSCARA CNPJ
// ===============================
inputCNPJ.addEventListener("input", (e) => {
  let v = e.target.value.replace(/\D/g, "");

  v = v
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");

  e.target.value = v.slice(0, 18);
});


// ===============================
// MÁSCARA TELEFONE
// ===============================
inputTelefone.addEventListener("input", (e) => {
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


// ===============================
// CARREGAR DADOS DO CENTRO
// ===============================
async function carregarMeuCentro() {
  try {
    const res = await fetch("http://localhost:3000/api/centros/meu-centro", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!data.temCentro) {
      alert("Você ainda não possui um centro cadastrado.");
      window.location.href = "../dashboard.html";
      return;
    }

    const centro = data.centro;

    // Preenche formulário com dados atuais
    inputNome.value = centro.nome || "";
    inputCidade.value = centro.cidade || "";
    selectTipo.value = centro.tipo || "";
    inputRua.value = centro.rua || "";
    inputHorario.value = centro.horario || "";
    inputTelefone.value = centro.telefone || "";
    inputEmailContato.value = centro.email_contato || "";
    inputResponsavel.value = centro.responsavel_nome || "";
    inputCNPJ.value = formatarCNPJ(centro.cnpj || "");
    inputDescricao.value = centro.descricao || "";

    // Preenche card lateral, se existir no HTML
    const sidebarNome = document.getElementById("sidebarNome");
    const sidebarCidade = document.getElementById("sidebarCidade");
    const sidebarStatus = document.getElementById("sidebarStatus");

    if (sidebarNome) {
      sidebarNome.textContent = centro.nome || "Centro de apoio";
    }

    if (sidebarCidade) {
      sidebarCidade.textContent = centro.cidade || "";
    }

    if (sidebarStatus) {
      sidebarStatus.textContent = formatarStatus(centro.status);
      sidebarStatus.className = `status-pill ${centro.status}`;
    }

  } catch (err) {
    console.error(err);
    alert("Erro ao carregar informações do centro.");
  }
}


// ===============================
// SALVAR ALTERAÇÕES
// ===============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const cidade = inputCidade.value.trim();

  if (!cidadeExiste(cidade)) {
    msg.textContent = "Selecione uma cidade válida da lista.";
    msg.style.color = "red";
    return;
  }

  const dados = {
    nome: inputNome.value.trim(),
    cidade,
    tipo: selectTipo.value,
    rua: inputRua.value.trim(),
    horario: inputHorario.value.trim(),
    telefone: inputTelefone.value.trim(),
    email_contato: inputEmailContato.value.trim(),
    responsavel_nome: inputResponsavel.value.trim(),
    cnpj: inputCNPJ.value.trim()
      ? inputCNPJ.value.replace(/\D/g, "")
      : undefined,
    descricao: inputDescricao.value.trim()
  };

  try {
    const res = await fetch("http://localhost:3000/api/centros/meu-centro", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(dados)
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.erro || "Erro ao salvar alterações.";
      msg.style.color = "red";
      return;
    }

    msg.textContent = "Informações atualizadas com sucesso.";
    msg.style.color = "green";

    // Atualiza o formulário e a sidebar com os dados retornados do backend
    if (data.centro) {
      inputNome.value = data.centro.nome || "";
      inputCidade.value = data.centro.cidade || "";
      selectTipo.value = data.centro.tipo || "";
      inputRua.value = data.centro.rua || "";
      inputHorario.value = data.centro.horario || "";
      inputTelefone.value = data.centro.telefone || "";
      inputEmailContato.value = data.centro.email_contato || "";
      inputResponsavel.value = data.centro.responsavel_nome || "";
      inputCNPJ.value = formatarCNPJ(data.centro.cnpj || "");
      inputDescricao.value = data.centro.descricao || "";

      const sidebarNome = document.getElementById("sidebarNome");
      const sidebarCidade = document.getElementById("sidebarCidade");
      const sidebarStatus = document.getElementById("sidebarStatus");

      if (sidebarNome) sidebarNome.textContent = data.centro.nome || "Centro de apoio";
      if (sidebarCidade) sidebarCidade.textContent = data.centro.cidade || "";

      if (sidebarStatus) {
        sidebarStatus.textContent = formatarStatus(data.centro.status);
        sidebarStatus.className = `status-pill ${data.centro.status}`;
      }
    }

  } catch (err) {
    console.error(err);
    msg.textContent = "Erro na requisição.";
    msg.style.color = "red";
  }
});


// ===============================
// INICIALIZAÇÃO
// ===============================
window.addEventListener("load", async () => {
  await carregarCidades();
  await carregarMeuCentro();
});