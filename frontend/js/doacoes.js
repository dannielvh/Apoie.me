// Função responsável por exibir mensagens na tela (sucesso, erro, loading)
function mostrarMensagem(texto, tipo) {
  const msg = document.getElementById("mensagem");

  if (!msg) return; // evita erro se não existir no HTML

  msg.className = "mensagem";
  msg.classList.add(tipo);
  msg.innerText = texto;
}

const token = localStorage.getItem('token');

<<<<<<< HEAD
=======
// verifica se está logado
if (!token) {
  mostrarMensagem("Você precisa estar logado", "erro");//mensagem de erro
  window.location.href = 'login.html';
}
>>>>>>> origin/feature/mensagens-usuario

// função de doação
async function fazerDoacao(valor) {
  const token = localStorage.getItem('token');

  if (!token) {
    alert('Faça login para realizar uma doação.');
    window.location.href = 'login.html';
    return;
  }

  // mensagem de carregamento
  mostrarMensagem("Enviando doação...", "loading");

  try {
    const res = await fetch('http://localhost:3000/api/doacao', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ valor })
    });

    const data = await res.json();

    // verifica erro na resposta
    if (!res.ok) {
      throw new Error(data.msg);
    }

    // sucesso
    mostrarMensagem(data.msg, "sucesso");

  } catch (error) {
    // erro
    mostrarMensagem(error.message || "Erro ao realizar doação", "erro");
  }
}
