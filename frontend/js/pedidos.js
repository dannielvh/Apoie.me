
// pedidos.js -> Tela de necessidades disponíveis para doaçao
// Esse arquivo cuida de tudo nessa tela:
// 1. Buscar as necessidades dos centros na API
// 2. Criar e inserir os cards no HTML dinamicamente
// 3. Filtrar os cards por nível de urgência
// 4. Abrir o modal e confirmar a doação

// Dados temp. (mock)
// se o o backend nao tiver o endpoint de necessidades pronto, usamos a lista pra testar a tela
// quando o endpoint estiver pronto -> trocar pela chamada real dentro de carregarNecessidades()

const dadosTeste = [
    {
      id: 1,
      nomeCentro: "Centro Esperança",
      item: "Cobertores",
      descricao: "Cobertores para famílias desabrigadas pelas chuvas.",
      quantidadeNecessaria: 100,
      quantidadeAtendida: 45,
      urgencia: "critica"
    },
    {
      id: 2,
      nomeCentro: "Abrigo São Lucas",
      item: "Cestas básicas",
      descricao: "Alimentos não perecíveis para famílias em abrigo temporário.",
      quantidadeNecessaria: 200,
      quantidadeAtendida: 130,
      urgencia: "alta"
    },
    {
      id: 3,
      nomeCentro: "Centro Comunitário Vila Nova",
      item: "Roupas infantis",
      descricao: "Roupas de tamanhos variados para crianças de 2 a 10 anos.",
      quantidadeNecessaria: 80,
      quantidadeAtendida: 60,
      urgencia: "media"
    },
    {
      id: 4,
      nomeCentro: "Ginásio Municipal Central",
      item: "Água mineral",
      descricao: "Garrafas de 1,5L para distribuição no abrigo.",
      quantidadeNecessaria: 500,
      quantidadeAtendida: 120,
      urgencia: "critica"
    }
  ];
  
  
  // 
  // Pegando elementos da tela:
  // document.getElementById() busca um elemento pelo id no HTML
  // Agente guarda em variaveis pra nao precisar buscar toda vez
  
  const listaNecessidades = document.getElementById("pedidos-lista");
  const loadingMsg = document.getElementById("pedidos-loading");
  const modalOverlay = document.getElementById("modal-overlay");
  const modalFechar = document.getElementById("modal-fechar");
  const btnCancelar = document.getElementById("btn-cancelar");
  const btnConfirmar = document.getElementById("btn-confirmar");
  const modalDescricao = document.getElementById("modal-descricao");
  const modalQuantidade = document.getElementById("modal-quantidade");
  
  // guarda qual necessidade o usuario quer ajudar no momento, e é preenchido quando o modal abre
  let necessidadeAtual = null;
  
  
  
  // Carregar necessidades -> função assíncrona (async) porque faz uma chamada pra API, que demora ate a resposta chegar(await)
  async function carregarNecessidades() {
    try {
  
      // com o backend estiver pronto, trocar por isso: 

      // const res = await fetch("http://localhost:3000/api/necessidades")
      // const necessidades = await res.json()
    
  
      // por enquanto usa os dados de teste direto
      const necessidades = dadosTeste;
  
      // Remove a mensagem "Carregando..." do HTML
      loadingMsg.remove();
  
      // Passa a lista pra função que cria os cards
      renderizarCards(necessidades);
  
    } catch (err) {
      // Se der qualquer erro (rede, servidor etc), mostra mensagem
      loadingMsg.innerHTML = "<i class='fa-solid fa-circle-exclamation'></i> Erro ao carregar necessidades.";
      console.error("Erro ao carregar necessidades:", err);
    }
  }
  
  
  
  // Renderizar cards
  // recebe o array de necessidades e chama criarCard() pra cada uma e insere o resultado no HTML da lista
  // forEach() -> percorre cada item do array e executa a função

  function renderizarCards(necessidades) {
    if (necessidades.length === 0) {
      listaNecessidades.innerHTML = "<p class='pedidos-loading'>Nenhuma necessidade encontrada.</p>";
      return;
    }
  
    necessidades.forEach(n => {
      const card = criarCard(n);            // cria o elemento HTML do card
      listaNecessidades.appendChild(card);  // insere no final da lista
    });
  }
  
  
  // Criar card
  // recebe um objeto de necessidade e retorna um elemento <div> criado com o HTML do card, depois é inserido nna lista pelo renderizarCards()
  
  function criarCard(necessidade) {
  
    // Calcula a porcentagem -> (atendida / necessaria) * 100 e o math.round() arredonda
    const porcentagem = Math.round((necessidade.quantidadeAtendida / necessidade.quantidadeNecessaria) * 100);
  
    // Calcula quantos itens faltam
    const faltam = necessidade.quantidadeNecessaria - necessidade.quantidadeAtendida;
  
    // Cria um elemento <div> vazio no JS
    const card = document.createElement("div");
    card.classList.add("pedido-card"); // adiciona a classe CSS
  
    // dataset -> guarda dados extras no elemento HTML
    // guardamos a urgencia pra usar no filtro depois
    // No HTML aparece como -> <div data-urgencia="critica">

    card.dataset.urgencia = necessidade.urgencia;
  
    const textoUrgencia = {
      critica: "Crítica",
      alta: "Alta",
      media: "Média"
    };
  
    // innerHTML aplica o HTML dentro do elemento
    // crases permitem usar template strings com ${variavel}

    card.innerHTML = `
      <div class="pedido-card-header">
        <h3>${necessidade.nomeCentro}</h3>
        <span class="urgency-badge ${necessidade.urgencia}">
          ${textoUrgencia[necessidade.urgencia]}
        </span>
      </div>
  
      <p class="pedido-item">
        Item solicitado: <strong>${necessidade.item}</strong>
      </p>
  
      <p class="pedido-item">${necessidade.descricao}</p>
  
      <div class="pedido-quantidade">
        <span>${necessidade.quantidadeAtendida} arrecadados</span>
        <span>${necessidade.quantidadeNecessaria} necessários</span>
      </div>
  
      <!-- A largura da barra é definida inline pelo JS com a porcentagem calculada -->
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${porcentagem}%"></div>
      </div>
  
      <p class="pedido-progresso-texto">
        ${necessidade.quantidadeAtendida} de ${necessidade.quantidadeNecessaria} — faltam ${faltam}
      </p>
  
      <button class="btn-quero-ajudar" data-id="${necessidade.id}">
        <i class="fa-solid fa-hand-holding-heart"></i>
        Quero ajudar
      </button>
    `;
  
    // adiciona o evento de clique no botão desse card 
    // querySelector() busca um elemento dentro do card (nao na pagina toda)
    card.querySelector(".btn-quero-ajudar").addEventListener("click", () => {
      abrirModal(necessidade);
    });
  
    return card;
  }
  
  
  
  // Filtros de urgencia
  // querySelectorAll() retorna todos os elementos com essa classe e pra cada botão de filtro, adiciona-se um evento de clique

  document.querySelectorAll(".filtro-btn").forEach(btn => {
    btn.addEventListener("click", () => {
  
      // Remove a classe .active de todos os botoes
      document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("active"));
  
      // Adiciona .active so no botao que foi clicado
      btn.classList.add("active");
  
      // le o atributo data/filtro do botao clicado
      const filtro = btn.dataset.filtro;
  
      // percorre todos os cards e decide quais mostrar/esconder
      document.querySelectorAll(".pedido-card").forEach(card => {
  
        // Se o filtro for "todos" ou o card tem a urgência do filtro -> mostra
        if (filtro === "todos" || card.dataset.urgencia === filtro) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
  
  
  
  // Abrir modal
  // preenche as informaçoes do modal com os dados da necessidade clicada e mostra o modal pela classe .aberto
  
  function abrirModal(necessidade) {
    necessidadeAtual = necessidade;
  
    modalDescricao.textContent =
      `Você vai contribuir com "${necessidade.item}" para o ${necessidade.nomeCentro}. Informe a quantidade que consegue doe:`;
  
    //lLimpa o campo de quantidade caso o modal ja tenha sido aberto alguma vez
    modalQuantidade.value = "";
  
    // adiciona a classe .aberto 
    modalOverlay.classList.add("aberto");
  }
  
  
  // Fechar moda;
  // remove a classe .aberto -> CSS esconde o modal novamente

  function fecharModal() {
    modalOverlay.classList.remove("aberto");
    necessidadeAtual = null; // limpa a necessidade atual
  }
  
  modalFechar.addEventListener("click", fecharModal);
  
  btnCancelar.addEventListener("click", fecharModal);
  
  // fecha ao clicar fora da caixa (no fundo escuro)
  // e.target -> elemento exato que recebeu o clique, se clicou no overlay e nao na caixa interna -> fecha

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      fecharModal();
    }
  });
  
  
  // Confirmar doacao
  // valida os dados, verifica o token JWT e envia pra API

  btnConfirmar.addEventListener("click", async () => {
  
    const quantidade = parseInt(modalQuantidade.value);
  
    if (!quantidade || quantidade <= 0) {
      alert("Informe uma quantidade válida.");
      return;
    }
  
    // verifica se o usuario ta logado
    // token JWT -> salvo no localStorage na hora do login (login.js)
    // localStorage.getItem() -> busca o valor salvo por chave

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Faça login para realizar uma doação.");
      window.location.href = "login.html"; // redireciona pra tela de login
      return;
    }
  
    try {
      // Envia a doaçao pra API via POST
      const res = await fetch("http://localhost:3000/api/doacao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token  // envia o token JWT no header pra o backend identificar o usuario
        },
        body: JSON.stringify({
          necessidadeId: necessidadeAtual.id,
          quantidade: quantidade
        })
      });
  
      const data = await res.json();
  
      // Se a resposta nao for 2xx -> mostra o erro do servidor
      if (!res.ok) {
        alert(data.msg || "Erro ao registrar doação.");
        return;
      }
  
      alert("Doação registrada! Obrigada pela sua contribuição.");
      fecharModal();
  
      // Recarrega os cards pra mostrar o progresso atualizado
      listaNecessidades.innerHTML = '<p class="pedidos-loading" id="pedidos-loading">Atualizando...</p>';
      carregarNecessidades();
  
    } catch (err) {
      alert("Erro na requisição. Tente novamente.");
      console.error("Erro ao registrar doação:", err);
    }
  });
  
  // Inicializacao
  // window "load" dispara quando a pagina termina de carregar completamente (HTML, CSS, imagens)
  // diferente do DOMContentLoaded, que dispara so quando o HTML termina (sem esperar imagens)
  
  window.addEventListener("load", carregarNecessidades);