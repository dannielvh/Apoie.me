// ===============================
// PROTEÇÃO DA PÁGINA
// ===============================
const token = localStorage.getItem("token");

if (!token) {
  alert("Você precisa estar logado.");
  window.location.href = "../login.html";
}


// ===============================
// ELEMENTOS DA PÁGINA
// ===============================
const listaVoluntarios = document.getElementById("listaVoluntarios");
const listaSelecionados = document.getElementById("listaSelecionados");

const totalVoluntarios = document.getElementById("totalVoluntarios");
const cidadeCentro = document.getElementById("cidadeCentro");
const totalSelecionados = document.getElementById("totalSelecionados");

const voluntariosAviso = document.getElementById("voluntariosAviso");

const sugestoesCidadeFiltro = document.getElementById("sugestoesCidadeFiltro");

let cidades = [];

const formFiltros = document.getElementById("formFiltrosVoluntarios");
const filtroHabilidade = document.getElementById("filtroHabilidade");
const filtroDisponibilidade = document.getElementById("filtroDisponibilidade");
const filtroCidade = document.getElementById("filtroCidade");
const btnLimparFiltros = document.getElementById("btnLimparFiltros");


// ===============================
// ELEMENTOS DO MODAL
// ===============================
const modalVoluntario = document.getElementById("modalVoluntario");
const btnFecharModalVoluntario = document.getElementById("btnFecharModalVoluntario");
const btnCancelarModalVoluntario = document.getElementById("btnCancelarModalVoluntario");
const btnSelecionarVoluntario = document.getElementById("btnSelecionarVoluntario");

const modalNome = document.getElementById("modalNome");
const modalCidade = document.getElementById("modalCidade");
const modalTelefone = document.getElementById("modalTelefone");
const modalEmail = document.getElementById("modalEmail");
const modalHabilidades = document.getElementById("modalHabilidades");
const modalDisponibilidade = document.getElementById("modalDisponibilidade");
const modalExperiencia = document.getElementById("modalExperiencia");
const modalObservacao = document.getElementById("modalObservacao");
const msgModalVoluntario = document.getElementById("msgModalVoluntario");


// ===============================
// VARIÁVEIS GLOBAIS
// ===============================
let centroLogado = null;
let voluntariosCarregados = [];
let voluntarioSelecionadoId = null;


// ===============================
// FUNÇÕES UTILITÁRIAS
// ===============================
function normalizar(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function textoOuPadrao(valor, padrao = "-") {
  return valor && String(valor).trim() ? valor : padrao;
}

function formatarStatus(status) {
  const statusMap = {
    pendente: "Aguardando aprovação",
    aprovado: "Aprovado",
    rejeitado: "Rejeitado",
    suspenso: "Suspenso"
  };

  return statusMap[status] || status || "-";
}

function formatarStatusSelecao(status) {
  const statusMap = {
    selecionado: "Selecionado",
    contatado: "Contatado",
    recusado: "Recusado",
    cancelado: "Cancelado"
  };

  return statusMap[status] || status || "-";
}

// CARREGAR CIDADES DE MG PARA SUGESTÕES
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
// CARREGAR CENTRO DO USUÁRIO
// ===============================
async function carregarCentroLogado() {
  try {
    const res = await fetch("http://localhost:3000/api/centros/meu-centro", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.erro || "Erro ao buscar centro.");
      window.location.href = "../dashboard.html";
      return null;
    }

    if (!data.temCentro) {
      alert("Você ainda não possui um centro cadastrado.");
      window.location.href = "../dashboard.html";
      return null;
    }

    return data.centro;

  } catch (err) {
    console.error("Erro ao carregar centro:", err);
    alert("Erro ao carregar informações do centro.");
    window.location.href = "../dashboard.html";
    return null;
  }
}


// ===============================
// CONTROLAR ACESSO PELO STATUS
// ===============================
function controlarAcessoCentro(centro) {
  if (!centro) return false;

  if (cidadeCentro) {
    cidadeCentro.textContent = centro.cidade || "-";
  }

  if (centro.status === "aprovado") {
    voluntariosAviso.classList.add("hidden");
    return true;
  }

  voluntariosAviso.classList.remove("hidden");

  voluntariosAviso.innerHTML = `
    <h3>Funcionalidade indisponível</h3>
    <p>
      Seu centro está com status <strong>${formatarStatus(centro.status)}</strong>.
      Apenas centros aprovados podem visualizar e selecionar voluntários.
    </p>
  `;

  listaVoluntarios.innerHTML = `
    <div class="empty-state">
      <i class="fa-solid fa-lock"></i>
      <h3>Acesso limitado</h3>
      <p>Aguarde a aprovação do centro para acessar voluntários.</p>
    </div>
  `;

  if (listaSelecionados) {
    listaSelecionados.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-lock"></i>
        <h3>Acesso limitado</h3>
        <p>Voluntários selecionados aparecerão após aprovação do centro.</p>
      </div>
    `;
  }

  if (totalVoluntarios) totalVoluntarios.textContent = "0";
  if (totalSelecionados) totalSelecionados.textContent = "0";

  return false;
}


// ===============================
// CARREGAR VOLUNTÁRIOS DISPONÍVEIS
// ===============================
async function carregarVoluntarios(filtros = {}) {
  try {
    listaVoluntarios.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-spinner"></i>
        <h3>Carregando voluntários...</h3>
        <p>Aguarde enquanto buscamos os candidatos disponíveis.</p>
      </div>
    `;

    const params = new URLSearchParams();

    if (filtros.cidade) {
      params.append("cidade", filtros.cidade.trim());
    }

    if (filtros.habilidade) {
      params.append("habilidade", filtros.habilidade.trim());
    }

    const url = `http://localhost:3000/api/voluntarios?${params.toString()}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      listaVoluntarios.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <h3>Erro ao carregar voluntários</h3>
          <p>${data.erro || "Tente novamente mais tarde."}</p>
        </div>
      `;
      return;
    }

    let voluntarios = Array.isArray(data) ? data : [];

    // Filtro de disponibilidade no front por enquanto
    if (filtros.disponibilidade) {
      voluntarios = voluntarios.filter((v) =>
        normalizar(v.disponibilidade).includes(normalizar(filtros.disponibilidade))
      );
    }

    voluntariosCarregados = voluntarios;

    // Mostra no máximo 10 na tela
    renderizarVoluntarios(voluntarios.slice(0, 10));

    if (totalVoluntarios) {
      totalVoluntarios.textContent = voluntarios.length;
    }

  } catch (err) {
    console.error("Erro ao carregar voluntários:", err);

    listaVoluntarios.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <h3>Erro inesperado</h3>
        <p>Não foi possível carregar os voluntários.</p>
      </div>
    `;
  }
}


// ===============================
// RENDERIZAR VOLUNTÁRIOS DISPONÍVEIS
// ===============================
function renderizarVoluntarios(voluntarios) {
  listaVoluntarios.innerHTML = "";

  if (!voluntarios || voluntarios.length === 0) {
    listaVoluntarios.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-users-slash"></i>
        <h3>Nenhum voluntário encontrado</h3>
        <p>Tente ajustar os filtros ou buscar por outra habilidade.</p>
      </div>
    `;
    return;
  }

  voluntarios.forEach((voluntario) => {
    const div = document.createElement("div");
    div.classList.add("voluntario-item");

    div.innerHTML = `
      <div class="voluntario-item__content">
        <div class="voluntario-item__avatar">
          <i class="fa-solid fa-user"></i>
        </div>

        <div>
          <h3>${textoOuPadrao(voluntario.nome, "Voluntário")}</h3>

          <p>
            <i class="fa-solid fa-location-dot"></i>
            ${textoOuPadrao(voluntario.cidade)}
          </p>

          <small>
            <strong>Habilidades:</strong>
            ${textoOuPadrao(voluntario.habilidades, "Não informado")}
          </small>
        </div>
      </div>

      <div class="voluntario-item__actions">
        <button class="btn-detalhes" data-id="${voluntario.id}">
          Ver detalhes
        </button>

        <button class="btn-selecionar" data-id="${voluntario.id}">
          Selecionar
        </button>
      </div>
    `;

    listaVoluntarios.appendChild(div);
  });
}


// ===============================
// CARREGAR VOLUNTÁRIOS SELECIONADOS
// ===============================
async function carregarSelecionados() {
  try {
    if (listaSelecionados) {
      listaSelecionados.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-spinner"></i>
          <h3>Carregando selecionados...</h3>
          <p>Buscando voluntários já escolhidos pelo centro.</p>
        </div>
      `;
    }

    const res = await fetch("http://localhost:3000/api/voluntarios/selecionados/meu-centro", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      if (totalSelecionados) totalSelecionados.textContent = "0";

      if (listaSelecionados) {
        listaSelecionados.innerHTML = `
          <div class="empty-state">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <h3>Erro ao carregar selecionados</h3>
            <p>${data.erro || "Tente novamente mais tarde."}</p>
          </div>
        `;
      }

      return;
    }

    const selecionados = Array.isArray(data) ? data : [];

    if (totalSelecionados) {
      totalSelecionados.textContent = selecionados.length;
    }

    renderizarSelecionados(selecionados);

  } catch (err) {
    console.error("Erro ao carregar selecionados:", err);

    if (totalSelecionados) totalSelecionados.textContent = "0";

    if (listaSelecionados) {
      listaSelecionados.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <h3>Erro inesperado</h3>
          <p>Não foi possível carregar os voluntários selecionados.</p>
        </div>
      `;
    }
  }
}


// ===============================
// RENDERIZAR VOLUNTÁRIOS SELECIONADOS
// ===============================
function renderizarSelecionados(selecionados) {
  if (!listaSelecionados) return;

  listaSelecionados.innerHTML = "";

  if (!selecionados || selecionados.length === 0) {
    listaSelecionados.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-user-clock"></i>
        <h3>Nenhum voluntário selecionado</h3>
        <p>Quando você selecionar voluntários, eles aparecerão aqui.</p>
      </div>
    `;
    return;
  }

  selecionados.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("selecionado-item");

    div.innerHTML = `
      <div class="selecionado-item__info">
        <i class="fa-solid fa-user-check"></i>

        <div>
          <h3>${textoOuPadrao(item.nome, "Voluntário")}</h3>
          <p>
            ${textoOuPadrao(item.cidade)}
            • ${textoOuPadrao(item.habilidades, "Sem habilidades informadas")}
          </p>
        </div>
      </div>

      <span class="selecionado-item__status ${item.status_selecao}">
        ${formatarStatusSelecao(item.status_selecao)}
      </span>
    `;

    listaSelecionados.appendChild(div);
  });
}


// ===============================
// ENCONTRAR VOLUNTÁRIO PELO ID
// ===============================
function encontrarVoluntarioPorId(id) {
  return voluntariosCarregados.find((v) => Number(v.id) === Number(id));
}


// ===============================
// ABRIR MODAL DE DETALHES
// ===============================
function abrirModalVoluntario(voluntario) {
  if (!voluntario) return;

  voluntarioSelecionadoId = voluntario.id;

  modalNome.textContent = textoOuPadrao(voluntario.nome, "Voluntário");
  modalCidade.textContent = textoOuPadrao(voluntario.cidade);

  modalTelefone.textContent = textoOuPadrao(voluntario.telefone);
  modalEmail.textContent = textoOuPadrao(voluntario.email);
  modalHabilidades.textContent = textoOuPadrao(voluntario.habilidades);
  modalDisponibilidade.textContent = textoOuPadrao(voluntario.disponibilidade);
  modalExperiencia.textContent = textoOuPadrao(voluntario.experiencia);
  modalObservacao.textContent = textoOuPadrao(voluntario.observacao);

  msgModalVoluntario.textContent = "";
  modalVoluntario.classList.remove("hidden");
}


// ===============================
// FECHAR MODAL
// ===============================
function fecharModalVoluntario() {
  voluntarioSelecionadoId = null;
  msgModalVoluntario.textContent = "";
  modalVoluntario.classList.add("hidden");
}


// ===============================
// SELECIONAR VOLUNTÁRIO
// ===============================
async function selecionarVoluntario(id) {
  if (!id) return;

  try {
    msgModalVoluntario.textContent = "Selecionando voluntário...";
    msgModalVoluntario.style.color = "#555";

    const res = await fetch(`http://localhost:3000/api/voluntarios/${id}/selecionar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        mensagem: "Seu perfil foi selecionado por um centro de apoio."
      })
    });

    const data = await res.json();

    if (!res.ok) {
      msgModalVoluntario.textContent = data.erro || "Erro ao selecionar voluntário.";
      msgModalVoluntario.style.color = "red";
      return;
    }

    msgModalVoluntario.textContent = "Voluntário selecionado com sucesso.";
    msgModalVoluntario.style.color = "green";

    await carregarSelecionados();

    setTimeout(() => {
      fecharModalVoluntario();
    }, 800);

  } catch (err) {
    console.error("Erro ao selecionar voluntário:", err);
    msgModalVoluntario.textContent = "Erro na requisição.";
    msgModalVoluntario.style.color = "red";
  }
}


// ===============================
// EVENTOS DA LISTA DE VOLUNTÁRIOS
// ===============================
listaVoluntarios.addEventListener("click", (e) => {
  const btnDetalhes = e.target.closest(".btn-detalhes");
  const btnSelecionar = e.target.closest(".btn-selecionar");

  if (btnDetalhes) {
    const id = btnDetalhes.getAttribute("data-id");
    const voluntario = encontrarVoluntarioPorId(id);

    abrirModalVoluntario(voluntario);
  }

  if (btnSelecionar) {
    const id = btnSelecionar.getAttribute("data-id");
    const voluntario = encontrarVoluntarioPorId(id);

    abrirModalVoluntario(voluntario);
  }
});


// ===============================
// EVENTOS DO MODAL
// ===============================
btnFecharModalVoluntario.addEventListener("click", fecharModalVoluntario);
btnCancelarModalVoluntario.addEventListener("click", fecharModalVoluntario);

modalVoluntario.addEventListener("click", (e) => {
  if (e.target === modalVoluntario) {
    fecharModalVoluntario();
  }
});

btnSelecionarVoluntario.addEventListener("click", () => {
  selecionarVoluntario(voluntarioSelecionadoId);
});


// ===============================
// FILTROS
// ===============================
formFiltros.addEventListener("submit", async (e) => {
  e.preventDefault();

  const filtros = {
    cidade: filtroCidade.value.trim(), // se vazio, busca todos
    habilidade: filtroHabilidade.value.trim(),
    disponibilidade: filtroDisponibilidade.value.trim()
  };

  await carregarVoluntarios(filtros);
});

btnLimparFiltros.addEventListener("click", async () => {
  filtroHabilidade.value = "";
  filtroDisponibilidade.value = "";
  filtroCidade.value = "";

  await carregarVoluntarios({});
});

filtroCidade.addEventListener("input", () => {
  const valor = filtroCidade.value.trim();

  sugestoesCidadeFiltro.innerHTML = "";

  if (valor.length < 2) return;

  const filtradas = cidades.filter((cidade) =>
    normalizar(cidade.nome).includes(normalizar(valor))
  );

  filtradas.slice(0, 8).forEach((cidade) => {
    const li = document.createElement("li");
    li.textContent = cidade.nome;

    li.addEventListener("click", () => {
      filtroCidade.value = cidade.nome;
      sugestoesCidadeFiltro.innerHTML = "";
    });

    sugestoesCidadeFiltro.appendChild(li);
  });
});


// ===============================
// INICIALIZAÇÃO
// ===============================
window.addEventListener("load", async () => {
  await carregarCidades();

  centroLogado = await carregarCentroLogado();

  const podeAcessar = controlarAcessoCentro(centroLogado);

  if (!podeAcessar) return;

  filtroCidade.value = centroLogado.cidade || "";

  await carregarVoluntarios({
    cidade: centroLogado.cidade
  });

  await carregarSelecionados();
});