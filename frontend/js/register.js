document.getElementById('formCadastro').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const cidade = document.getElementById('cidade').value;
  const senha = document.getElementById('senha').value;

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

    // REDIRECIONA
    window.location.href = 'dashboard.html';
  } else {
    alert(data.msg);
  }
});