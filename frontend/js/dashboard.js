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