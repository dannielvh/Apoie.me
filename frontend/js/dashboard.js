document.addEventListener("DOMContentLoaded", () => {
  const usuarioSalvo = localStorage.getItem("user");

  const welcomeTitle = document.getElementById("welcome-title");

  if (!usuarioSalvo) {
    welcomeTitle.textContent = "Olá 👋";
    return;
  }

  const usuario = JSON.parse(usuarioSalvo);
  const primeiroNome = usuario.nome.split(" ")[0];

  welcomeTitle.textContent = `Olá, ${primeiroNome} 👋`;
});