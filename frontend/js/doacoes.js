// TESTE PARA PARAR DE DIRECIONAR AUTOMATICAMENTE PARA A TELA DE LOGIN
// QUANDO TENTO OLHAR A DASHBOARD SEM ESTAR LOGADO
/*const token = localStorage.getItem('token');

// verifica se está logado
if (!token) {
  alert('Você precisa estar logado');
  window.location.href = 'login.html';
}*/

// função de doação
async function fazerDoacao(valor) {

  // verifica login SOMENTE ao doar
  const token = localStorage.getItem('token');

  if (!token) {
    alert('Faça login para realizar uma doação.');
    window.location.href = 'login.html';
    return;
  }

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

//  função de doação
/*async function fazerDoacao(valor) {
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
}*/