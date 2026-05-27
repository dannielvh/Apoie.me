const token = localStorage.getItem('token');

// verifica se está logado
if (!token) {
  alert('Você precisa estar logado');
  window.location.href = 'login.html';
}

//  função de doação
async function fazerDoacao(valor) {
  const token = localStorage.getItem('token');

  const res = await fetch('http://localhost:3000/api/doacao', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify({ valor })
  });

  const data = await res.json();
  alert(data.msg);
}