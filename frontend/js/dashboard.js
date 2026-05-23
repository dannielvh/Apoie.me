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
// BOTÃO DE CADASTRAR CENTRO
// ===============================

// Pega o botão "Cadastrar Centro de Apoio"
const btnCadastrarCentro = document.getElementById("btnCadastrarCentro");

// Pega o modal que avisa que precisa fazer login
const modalLogin = document.getElementById("modalLogin");

// Pega o botão dentro do modal que leva para a tela de login
const btnIrLogin = document.getElementById("btnIrLogin");

// Pega o botão para fechar o modal
const btnFecharModal = document.getElementById("btnFecharModal");


// Quando clicar em "Cadastrar Centro de Apoio"
btnCadastrarCentro.addEventListener("click", (e) => {
  // Impede o comportamento padrão do link/botão
  // Exemplo: impede de navegar automaticamente
  e.preventDefault();

  // Verifica se existe token salvo
  // Se existe token, o usuário está logado
  const token = localStorage.getItem("token");

  // Se não tiver token, mostra o modal pedindo login
  if (!token) {
    modalLogin.classList.remove("hidden");
    return;
  }

  // Se tiver token, redireciona para a tela de cadastro de centro
  window.location.href = "cadastroCentro.html";
});


// Quando clicar no botão "Ir para login" dentro do modal
btnIrLogin.addEventListener("click", () => {
  window.location.href = "login.html";
});


// Quando clicar no botão de fechar modal
btnFecharModal.addEventListener("click", () => {
  modalLogin.classList.add("hidden");
});