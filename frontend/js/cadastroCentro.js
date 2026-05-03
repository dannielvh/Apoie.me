const form = document.getElementById("form-centro");
const msg = document.getElementById("msg");
const selectTipo = document.getElementById("tipo");

const inputCidade = document.getElementById("cidade-input");
const sugestoes = document.getElementById("sugestoes");

let cidades = [];

// =======================
// TIPOS
// =======================
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
];

tipos.forEach((t) => {
  const option = document.createElement("option");
  option.value = t;
  option.textContent = t;
  selectTipo.appendChild(option);
});

// =======================
// NORMALIZAR
// =======================
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// =======================
// CARREGAR CIDADES
// =======================
async function carregarCidades() {
  try {
    const res = await fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados/MG/municipios",
    );
    cidades = await res.json();
  } catch (err) {
    console.error("Erro ao carregar cidades:", err);
  }
}

// =======================
// AUTOCOMPLETE
// =======================
inputCidade.addEventListener("input", () => {
  const valor = inputCidade.value;

  sugestoes.innerHTML = "";

  if (valor.length < 2) return;

  const filtradas = cidades.filter((c) =>
    normalizar(c.nome).includes(normalizar(valor)),
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

// =======================
// MÁSCARA CNPJ
// =======================
const inputCNPJ = document.getElementById("cnpj");

inputCNPJ.addEventListener("input", (e) => {
  let v = e.target.value.replace(/\D/g, "");

  v = v
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");

  e.target.value = v.slice(0, 18);
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
// SUBMIT
// =======================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dados = {
    nome: document.getElementById("nome").value.trim(),
    cidade: inputCidade.value.trim(),
    tipo: selectTipo.value,
    rua: document.getElementById("rua").value.trim(),
    horario: document.getElementById("horario").value.trim(),
    cnpj: inputCNPJ.value ? inputCNPJ.value.replace(/\D/g, "") : null,
    telefone: inputTel.value.trim(),
    descricao: document.getElementById("descricao").value.trim(),
  };

  if (!dados.nome || !dados.cidade || !dados.tipo || !dados.rua) {
    msg.textContent = "Preencha os campos obrigatórios";
    msg.style.color = "red";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/centros", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = data.erro || "Erro ao cadastrar";
      msg.style.color = "red";
      return;
    }

    msg.textContent = "Centro cadastrado! (aguardando aprovação)";
    msg.style.color = "green";

    form.reset();
    sugestoes.innerHTML = "";
  } catch (err) {
    msg.textContent = "Erro na requisição";
    msg.style.color = "red";
  }
});

// =======================
// INIT
// =======================
window.addEventListener("load", carregarCidades);
