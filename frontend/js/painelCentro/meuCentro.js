const token = localStorage.getItem("token");

if (!token) {
  alert("Você precisa estar logado.");
  window.location.href = "../login.html";
}

const form = document.getElementById("formMeuCentro");
const msg = document.getElementById("msg");

const inputCidade = document.getElementById("cidade-input");
const sugestoes = document.getElementById("sugestoes");
const selectTipo = document.getElementById("tipo");

const inputCNPJ = document.getElementById("cnpj");
const inputTelefone = document.getElementById("telefone");

let cidades = [];

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

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

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

inputCNPJ.addEventListener("input", (e) => {
  let v = e.target.value.replace(/\D/g, "");

  v = v
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");

  e.target.value = v.slice(0, 18);
});

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

    document.getElementById("nome").value = centro.nome || "";
    inputCidade.value = centro.cidade || "";
    selectTipo.value = centro.tipo || "";
    document.getElementById("rua").value = centro.rua || "";
    document.getElementById("horario").value = centro.horario || "";
    inputTelefone.value = centro.telefone || "";
    document.getElementById("email_contato").value = centro.email_contato || "";
    document.getElementById("responsavel_nome").value = centro.responsavel_nome || "";
    inputCNPJ.value = formatarCNPJ(centro.cnpj || "");
    document.getElementById("descricao").value = centro.descricao || "";

  } catch (err) {
    console.error(err);
    alert("Erro ao carregar informações do centro.");
  }
}

function cidadeExiste(nomeCidade) {
  return cidades.some((c) => normalizar(c.nome) === normalizar(nomeCidade));
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const cidade = inputCidade.value.trim();

  if (!cidadeExiste(cidade)) {
    msg.textContent = "Selecione uma cidade válida da lista.";
    msg.style.color = "red";
    return;
  }

  const dados = {
    nome: document.getElementById("nome").value.trim(),
    cidade,
    tipo: selectTipo.value,
    rua: document.getElementById("rua").value.trim(),
    horario: document.getElementById("horario").value.trim(),
    telefone: inputTelefone.value.trim(),
    email_contato: document.getElementById("email_contato").value.trim(),
    responsavel_nome: document.getElementById("responsavel_nome").value.trim(),
    cnpj: inputCNPJ.value ? inputCNPJ.value.replace(/\D/g, "") : null,
    descricao: document.getElementById("descricao").value.trim()
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

  } catch (err) {
    console.error(err);
    msg.textContent = "Erro na requisição.";
    msg.style.color = "red";
  }
});

window.addEventListener("load", async () => {
  await carregarCidades();
  await carregarMeuCentro();
});