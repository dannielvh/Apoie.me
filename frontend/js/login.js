document.getElementById('formLogin').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  try {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, senha })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.usuario));

      alert('Login realizado com sucesso');

      window.location.href = 'dashboard.html';
    } else {
      alert(data.msg || 'Erro ao fazer login');
    }

  } catch (erro) {
    console.error('Erro no login:', erro);
    alert('Erro ao conectar com o servidor');
  }
});