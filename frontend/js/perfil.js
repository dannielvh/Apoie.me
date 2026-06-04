// ===============================
// PROTEÇÃO DA PÁGINA
// ===============================
const token = localStorage.getItem("token");

if (!token) {
  alert("Você precisa estar logado.");
  window.location.href = "login.html";
}


// ===============================
// ELEMENTOS
// ===============================
const formPerfil = document.getElementById("formPerfil");
const msgPerfil = document.getElementById("msgPerfil");

const inputNome = document.getElementById("nome");
const inputEmail = document.getElementById("email");
const inputCidade = document.getElementById("cidade");
const inputTelefone = document.getElementById("telefone");

const inputSenhaAtual = document.getElementById("senhaAtual");
const inputNovaSenha = document.getElementById("novaSenha");

const btnCancelarPerfil = document.getElementById("btnCancelarPerfil");

const perfilNomePreview = document.getElementById("perfilNomePreview");
const perfilEmailPreview = document.getElementById("perfilEmailPreview");

let usuarioOriginal = null;


// ===============================
// MÁSCARA DE TELEFONE
// ===============================
if (inputTelefone) {
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
}


// ===============================
// CARREGAR PERFIL
// ===============================
async function carregarPerfil() {
  try {
    const res = await fetch("http://localhost:3000/api/usuarios/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.erro || "Erro ao carregar perfil.");
      window.location.href = "dashboard.html";
      return;
    }

    usuarioOriginal = data;

    preencherFormulario(data);
    atualizarPreview(data);

  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
    alert("Erro ao carregar perfil.");
  }
}


// ===============================
// PREENCHER FORMULÁRIO
// ===============================
function preencherFormulario(usuario) {
  inputNome.value = usuario.nome || "";
  inputEmail.value = usuario.email || "";
  inputCidade.value = usuario.cidade || "";

  if (inputTelefone) {
    inputTelefone.value = usuario.telefone || "";
  }

  inputSenhaAtual.value = "";
  inputNovaSenha.value = "";
}


// ===============================
// ATUALIZAR CARD LATERAL
// ===============================
function atualizarPreview(usuario) {
  if (perfilNomePreview) {
    perfilNomePreview.textContent = usuario.nome || "Usuário";
  }

  if (perfilEmailPreview) {
    perfilEmailPreview.textContent = usuario.email || "email@email.com";
  }
}


// ===============================
// SALVAR ALTERAÇÕES
// ===============================
formPerfil.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dados = {
    nome: inputNome.value.trim(),
    email: inputEmail.value.trim(),
    cidade: inputCidade.value.trim(),
    senhaAtual: inputSenhaAtual.value.trim(),
    novaSenha: inputNovaSenha.value.trim()
  };

  // Se você adicionou telefone na tabela usuarios e no backend, mantém isso.
  // Se NÃO adicionou telefone no backend, essa informação não será salva.
  if (inputTelefone) {
    dados.telefone = inputTelefone.value.trim();
  }

  if (!dados.nome || !dados.email) {
    mostrarMensagem("Nome e email são obrigatórios.", "red");
    return;
  }

  if (dados.novaSenha && dados.novaSenha.length < 6) {
    mostrarMensagem("A nova senha deve ter no mínimo 6 caracteres.", "red");
    return;
  }

  if (dados.novaSenha && !dados.senhaAtual) {
    mostrarMensagem("Informe a senha atual para alterar a senha.", "red");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/usuarios/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(dados)
    });

    const data = await res.json();

    if (!res.ok) {
      mostrarMensagem(data.erro || "Erro ao atualizar perfil.", "red");
      return;
    }

    const usuarioAtualizado = data.usuario;

    usuarioOriginal = usuarioAtualizado;

    preencherFormulario(usuarioAtualizado);
    atualizarPreview(usuarioAtualizado);

    // Atualiza localStorage para o header mostrar o nome novo
    localStorage.setItem("user", JSON.stringify(usuarioAtualizado));

    mostrarMensagem("Perfil atualizado com sucesso.", "green");

  } catch (err) {
    console.error("Erro ao atualizar perfil:", err);
    mostrarMensagem("Erro na requisição.", "red");
  }
});


// ===============================
// CANCELAR ALTERAÇÕES
// ===============================
btnCancelarPerfil.addEventListener("click", () => {
  if (usuarioOriginal) {
    preencherFormulario(usuarioOriginal);
    atualizarPreview(usuarioOriginal);
    mostrarMensagem("Alterações descartadas.", "#555");
  }
});


// ===============================
// MENSAGEM
// ===============================
function mostrarMensagem(texto, cor) {
  msgPerfil.textContent = texto;
  msgPerfil.style.color = cor;
}


// ===============================
// INICIALIZAÇÃO
// ===============================
window.addEventListener("load", carregarPerfil);