// Espera o HTML carregar completamente antes de executar o código
document.addEventListener("DOMContentLoaded", () => {
  // Busca no localStorage os dados do usuário salvo após o login
  // OBS: precisa conferir se no login vocês salvaram como "user" ou "usuario"
  const usuarioSalvo = localStorage.getItem("user");

  // Pega o elemento do título de boas-vindas no HTML
  const welcomeTitle = document.getElementById("welcome-title");

  // Se não existir usuário salvo, significa que ninguém está logado
  if (!usuarioSalvo) {
    // Mostra um título genérico
    welcomeTitle.textContent = "Painel Geral";
    return;
  }

  // Converte o usuário de texto JSON para objeto JavaScript
  const usuario = JSON.parse(usuarioSalvo);

  // Pega apenas o primeiro nome do usuário
  // Exemplo: "Jean Pedro" vira "Jean"
  const primeiroNome = usuario.nome.split(" ")[0];

  // Atualiza o título com o nome do usuário
  welcomeTitle.textContent = `Olá, ${primeiroNome} 👋`;
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
      <h2>Você representa um centro de apoio?</h2>
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
      <h2>Gerencie seu centro de apoio</h2>
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