const token = localStorage.getItem("token");

if (!token) {
  alert("Você precisa estar logado.");
  window.location.href = "../login.html";
}

async function carregarCentro() {
  try {
    const res = await fetch("http://localhost:3000/api/centros/meu-centro", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!data.temCentro) {
      alert("Você ainda não possui um centro cadastrado.");
      window.location.href = "../dashboard.html";
      return;
    }

    const centro = data.centro;

    document.getElementById("centroNome").textContent = centro.nome;
    document.getElementById("centroStatus").textContent =
      `Status: ${formatarStatus(centro.status)}`;

    document.getElementById("statusCard").textContent =
      formatarStatus(centro.status);

    controlarAcessoPorStatus(centro.status);

  } catch (err) {
    console.error(err);
    alert("Erro ao carregar painel do centro.");
  }
}

function formatarStatus(status) {
  const statusMap = {
    pendente: "Aguardando aprovação",
    aprovado: "Aprovado",
    rejeitado: "Rejeitado",
    suspenso: "Suspenso"
  };

  return statusMap[status] || status;
}

function controlarAcessoPorStatus(status) {
  if (status !== "aprovado") {
    document.querySelector(".centro-dashboard__actions").innerHTML = `
      <div class="aviso-status">
        <h3>Centro ainda não aprovado</h3>
        <p>Você poderá criar pedidos e gerenciar voluntários após a aprovação.</p>
        <a href="../dashboard.html">Voltar ao Dashboard</a>
      </div>
    `;
  }
}

window.addEventListener("load", carregarCentro);