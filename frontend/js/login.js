document.getElementById('formLogin').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  const res = await fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, senha })
  });

  const data = await res.json();

  if (res.ok && data.token) {
    // salva token
    localStorage.setItem('token', data.token);

    alert('Login realizado');

    // REDIRECIONA
    window.location.href = 'dashboard.html';
  } else {
    alert(data.msg);
  }
});