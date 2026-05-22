const token = localStorage.getItem('token');


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