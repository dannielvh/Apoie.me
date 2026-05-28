/* ========================================================= */
/* DASHBOARD.JS - APOIE.ME                                   */
/* ========================================================= */


/* ========================================================= */
/* DADOS MOCKADOS                                            */
/* Futuramente essas informações virão do backend/API        */
/* ========================================================= */

const necessidades = [

    {
        centro: 'Centro Esperança',
        item: 'Cobertores',
        arrecadado: 45,
        necessario: 100,
        urgencia: 'Crítica',
        classeUrgencia: 'critical',
        prazo: '25/05'
    },

    {
        centro: 'Casa do Bem',
        item: 'Cestas básicas',
        arrecadado: 30,
        necessario: 80,
        urgencia: 'Alta',
        classeUrgencia: 'high',
        prazo: '28/05'
    },

    {
        centro: 'Projeto Luz',
        item: 'Roupas infantis',
        arrecadado: 60,
        necessario: 120,
        urgencia: 'Média',
        classeUrgencia: 'medium',
        prazo: '30/05'
    },

    {
        centro: 'Lar Solidário',
        item: 'Produtos de higiene',
        arrecadado: 20,
        necessario: 70,
        urgencia: 'Alta',
        classeUrgencia: 'high',
        prazo: '02/06'
    }

];



/* ========================================================= */
/* ATIVIDADES RECENTES                                       */
/* ========================================================= */

const atividades = [

    {
        tipo: 'donation',
        icone: 'fa-hand-holding-heart',
        texto: 'Nova doação recebida para cestas básicas.',
        tempo: 'Há 10 minutos'
    },

    {
        tipo: 'alert',
        icone: 'fa-circle-exclamation',
        texto: 'Nova necessidade urgente cadastrada.',
        tempo: 'Há 30 minutos'
    },

    {
        tipo: 'success',
        icone: 'fa-circle-check',
        texto: 'Campanha de roupas parcialmente atendida.',
        tempo: 'Hoje'
    },

    {
        tipo: 'donation',
        icone: 'fa-box-open',
        texto: 'Novos itens arrecadados para o Centro Esperança.',
        tempo: 'Hoje'
    }

];



/* ========================================================= */
/* FUNÇÃO - CARREGAR NECESSIDADES                            */
/* ========================================================= */

function carregarNecessidades() {

    const container =
        document.querySelector('.urgent-needs-list');


    /* Limpa o container */
    container.innerHTML = '';



    /* Percorre cada necessidade */
    necessidades.forEach(necessidade => {

        /* Calcula porcentagem */
        const porcentagem =
            Math.round(
                (necessidade.arrecadado / necessidade.necessario) * 100
            );



        /* Estrutura HTML do card */
        const card = `

      <div class="need-card">

        <!-- TOPO -->
        <div class="need-card-header">

          <h3>${necessidade.centro}</h3>

          <span class="urgency-badge ${necessidade.classeUrgencia}">
            ${necessidade.urgencia}
          </span>

        </div>



        <!-- ITEM -->
        <p class="need-item">

          Item solicitado:
          <strong>${necessidade.item}</strong>

        </p>



        <!-- QUANTIDADES -->
        <div class="need-quantity">

          <span>
            ${necessidade.arrecadado} arrecadados
          </span>

          <span>
            ${necessidade.necessario} necessários
          </span>

        </div>



        <!-- BARRA DE PROGRESSO -->
        <div class="progress-bar">

          <div
            class="progress-fill"
            style="width: ${porcentagem}%;">
          </div>

        </div>



        <!-- RODAPÉ -->
        <div class="need-footer">

          <span class="progress-text">
            ${porcentagem}% concluído
          </span>

          <span class="deadline">
            Prazo: ${necessidade.prazo}
          </span>

        </div>

      </div>

    `;



        /* Adiciona card ao container */
        container.innerHTML += card;

    });

}



/* ========================================================= */
/* FUNÇÃO - CARREGAR ATIVIDADES                              */
/* ========================================================= */

function carregarAtividades() {

    const container =
        document.querySelector('.activities-list');


    /* Limpa conteúdo */
    container.innerHTML = '';



    /* Percorre atividades */
    atividades.forEach(atividade => {

        const item = `

      <div class="activity-item">

        <!-- ÍCONE -->
        <div class="activity-icon ${atividade.tipo}">

          <i class="fa-solid ${atividade.icone}"></i>

        </div>



        <!-- TEXTO -->
        <div class="activity-content">

          <p>${atividade.texto}</p>

          <span>${atividade.tempo}</span>

        </div>

      </div>

    `;



        /* Adiciona atividade */
        container.innerHTML += item;

    });

}



/* ========================================================= */
/* FUNÇÃO - DROPDOWNS                                        */
/* Controla abrir/fechar da seção "Como doar"                */
/* ========================================================= */

function configurarDropdowns() {

    /* Seleciona todos os botões */
    const toggles =
        document.querySelectorAll('.guide-toggle');



    /* Percorre todos */
    toggles.forEach(toggle => {

        toggle.addEventListener('click', () => {

            /* Item pai */
            const item = toggle.parentElement;


            /* Alterna classe active */
            item.classList.toggle('active');

        });

    });

}



/* ========================================================= */
/* FUNÇÃO PRINCIPAL                                          */
/* ========================================================= */

function iniciarDashboard() {

    carregarNecessidades();

    carregarAtividades();

    configurarDropdowns();

}



/* ========================================================= */
/* INICIALIZAÇÃO                                             */
/* ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    iniciarDashboard();

});





// ===============================
// ÁREA DO CENTRO NO DASHBOARD
// ===============================

// Section do dashboard onde vamos mostrar:
// - botão para cadastrar centro
// OU
// - botão para gerenciar centro já cadastrado
const sectionCentro = document.getElementById("sectionCentro");

// Modal que aparece quando o usuário tenta cadastrar centro sem estar logado
const modalLogin = document.getElementById("modalLogin");

// Botão do modal que leva para a página de login
const btnIrLogin = document.getElementById("btnIrLogin");

// Botão do modal que fecha o aviso
const btnFecharModal = document.getElementById("btnFecharModal");


// Função principal: verifica se o usuário tem centro cadastrado
async function carregarAreaCentro() {
  // Pega o token salvo no login
  const token = localStorage.getItem("token");

  // Se não tiver token, significa que o usuário não está logado
  // Então mostra a opção de cadastrar centro, mas o botão vai abrir o modal
  if (!token) {
    renderCadastrarCentro();
    return;
  }

  try {
    // Busca no backend se o usuário logado já possui um centro cadastrado
    const res = await fetch("http://localhost:3000/api/centros/meu-centro", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    // Se o backend responder que o usuário não tem centro,
    // mostra a chamada para cadastrar um centro
    if (!data.temCentro) {
      renderCadastrarCentro();
      return;
    }

    // Se o usuário já tem centro, mostra a chamada para gerenciar
    renderGerenciarCentro(data.centro);

  } catch (err) {
    // Se der erro na requisição, mostra a opção padrão de cadastrar centro
    console.error("Erro ao carregar centro:", err);
    renderCadastrarCentro();
  }
}


// Mostra a versão da section para quem ainda não tem centro cadastrado
function renderCadastrarCentro() {
  sectionCentro.innerHTML = `
    <div>
      <h2><i class="fa-solid fa-building-user"></i> Você representa um centro de apoio?</h2>
      <p>
        Cadastre seu centro para solicitar doações, abrir pedidos de voluntários
        e divulgar informações para a comunidade.
      </p>
    </div>

    <button id="btnCadastrarCentro" type="button" class="btn-centro">
      Cadastrar centro de apoio
    </button>
  `;

  // Depois que o botão é criado via innerHTML,
  // precisamos pegar ele novamente para adicionar o evento de clique
  document.getElementById("btnCadastrarCentro").addEventListener("click", () => {
    const token = localStorage.getItem("token");

    // Se clicar sem estar logado, abre o modal avisando que precisa login
    if (!token) {
      modalLogin.classList.remove("hidden");
      return;
    }

    // Se estiver logado, vai para a página de cadastro de centro
    window.location.href = "cadastroCentro.html";
  });
}


// Mostra a versão da section para quem já cadastrou um centro
function renderGerenciarCentro(centro) {
  sectionCentro.innerHTML = `
    <div>
      <h2><i class="fa-solid fa-building-user"></i> Gerencie seu centro de apoio</h2>
      <p>
        ${centro.nome} está com status: 
        <strong>${formatarStatus(centro.status)}</strong>.
      </p>
    </div>

    <button id="btnGerenciarCentro" type="button" class="btn-centro">
      Acessar painel do centro
    </button>
  `;

  // Botão para acessar o painel específico do centro
  document.getElementById("btnGerenciarCentro").addEventListener("click", () => {
    window.location.href = "painelCentro/dashboardCentro.html";
  });
}


// Converte o status do banco para um texto mais amigável na tela
function formatarStatus(status) {
  const statusMap = {
    pendente: "Aguardando aprovação",
    aprovado: "Aprovado",
    rejeitado: "Rejeitado",
    suspenso: "Suspenso"
  };

  // Se não encontrar no mapa, retorna o status original
  return statusMap[status] || status;
}


// Botão do modal: leva para login
btnIrLogin.addEventListener("click", () => {
  window.location.href = "login.html";
});


// Botão do modal: fecha o modal
btnFecharModal.addEventListener("click", () => {
  modalLogin.classList.add("hidden");
});


// Quando a página carregar, verifica qual versão da section deve aparecer
window.addEventListener("load", carregarAreaCentro);