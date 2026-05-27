function validarSenha(senha) {
  return {
    maiuscula: /[A-Z]/.test(senha),
    minuscula: /[a-z]/.test(senha),
    numero: /[0-9]/.test(senha),
    especial: /[!@#$%^&*]/.test(senha),
    tamanho: senha.length >= 6
  };
}

document.getElementById('formCadastro').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const cidade = document.getElementById('cidade').value;
  const senha = document.getElementById('senha').value;

 
  const resultado = validarSenha(senha);

  if (
    !resultado.maiuscula ||
    !resultado.minuscula ||
    !resultado.numero ||
    !resultado.especial ||
    !resultado.tamanho
  ) {
    alert('Senha fraca! Use:\n- Letra maiúscula\n- Letra minúscula\n- Número\n- Caractere especial\n- Mínimo 6 caracteres');
    return;
  }


  const res = await fetch('http://localhost:3000/api/cadastro', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nome, email, cidade, senha })
  });

  const data = await res.json();

  if (res.ok) {
    alert('Cadastro realizado');
    window.location.href = 'dashboard.html';
  } else {
    alert(data.msg);
  }
});