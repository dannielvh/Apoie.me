function validarSenha(senha) {
  return {
    maiuscula: /[A-Z]/.test(senha),
    minuscula: /[a-z]/.test(senha),
    numero: /[0-9]/.test(senha),
    especial: /[!@#$%^&*]/.test(senha),
    tamanho: senha.length >= 6,
  };
}

const senhaInput = document.getElementById("senha");

senhaInput.addEventListener("input", () => {
  const resultado = validarSenha(senhaInput.value);

  atualizarRequisito(
    "req-maiuscula",
    resultado.maiuscula,
    "Pelo menos uma letra maiúscula",
  );

  atualizarRequisito(
    "req-minuscula",
    resultado.minuscula,
    "Pelo menos uma letra minúscula",
  );

  atualizarRequisito("req-numero", resultado.numero, "Pelo menos um número");

  atualizarRequisito(
    "req-especial",
    resultado.especial,
    "Pelo menos um caractere especial",
  );

  atualizarRequisito(
    "req-tamanho",
    resultado.tamanho,
    "Pelo menos 6 caracteres",
  );
});

function atualizarRequisito(id, valido, texto) {
  const elemento = document.getElementById(id);

  if (valido) {
    elemento.innerHTML = "✓ " + texto;
    elemento.classList.add("ok");
  } else {
    elemento.innerHTML = "✗ " + texto;
    elemento.classList.remove("ok");
  }
}

// ==========================
// VERIFICAÇÃO DAS SENHAS
// ==========================
const confirmarInput = document.getElementById("confirmarSenha");
const mensagem = document.getElementById("mensagem-confirmacao");

function verificarSenhas() {
  if (!confirmarInput.value) {
    mensagem.innerHTML = "";
    return;
  }

  if (senhaInput.value === confirmarInput.value) {
    mensagem.innerHTML = "✓ As senhas coincidem";
    mensagem.style.color = "#16a34a";
  } else {
    mensagem.innerHTML = "✗ As senhas não coincidem";
    mensagem.style.color = "#dc2626";
  }
}

senhaInput.addEventListener("input", verificarSenhas);
confirmarInput.addEventListener("input", verificarSenhas);

document
  .getElementById("formCadastro")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const cidade = document.getElementById("cidade").value;
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    if (senha !== confirmarSenha) {
      mensagem.textContent = "✗ As senhas não coincidem";
      mensagem.style.color = "red";

      return;
    }

    const resultado = validarSenha(senha);

    if (
      !resultado.maiuscula ||
      !resultado.minuscula ||
      !resultado.numero ||
      !resultado.especial ||
      !resultado.tamanho
    ) {
      return;
    }

    const res = await fetch("http://localhost:3000/api/cadastro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nome, email, cidade, senha }),
    });

    const data = await res.json();

    if (res.ok) {
      // Depois de cadastrar, faz login automaticamente
      const loginRes = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        alert(
          "Cadastro realizado, mas não foi possível entrar automaticamente. Faça login manualmente.",
        );
        window.location.href = "login.html";
        return;
      }

      // Salva o token e o usuário no localStorage
      localStorage.setItem("token", loginData.token);
      localStorage.setItem("user", JSON.stringify(loginData.usuario));

      alert("Cadastro realizado com sucesso!");
      window.location.href = "dashboard.html";
    } else {
      alert(data.erro || data.msg || data.mensagem || "Erro ao cadastrar.");
    }
  });
