fetch("../components/header.html")
   .then((res) => res.text())
  .then(async (data) => {
    document.getElementById("header").innerHTML = data;

    // ===============================
    // MENU MOBILE
    // ===============================
    const toggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("menu");

    if (toggle && menu) {
      toggle.addEventListener("click", () => {
        menu.classList.toggle("active");
      });
    }

    // ===============================
    // LINK ATIVO
    // ===============================
    const links = document.querySelectorAll(".header__nav a");
    const currentPage = window.location.pathname.split("/").pop();

    links.forEach((link) => {
      const linkPage = link.getAttribute("href").split("/").pop();

      if (currentPage === linkPage) {
        link.classList.add("active");
      }
    });

    // ===============================
    // USUÁRIO LOGADO / DROPDOWN
    // ===============================
    const areaUsuario = document.getElementById("area-usuario");
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!areaUsuario) return;

    if (token && user) {
      const primeiroNome = user.nome.split(" ")[0];

      let temCentro = false;

      try {
        const res = await fetch("http://localhost:3000/api/centros/meu-centro", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const dataCentro = await res.json();
        temCentro = dataCentro.temCentro;
      } catch (err) {
        console.error("Erro ao verificar centro do usuário:", err);
      }

      areaUsuario.innerHTML = `
        <div class="header__user">
          <button class="header__user-button" id="user-dropdown-btn">
            <i class="fa-solid fa-user"></i>
            <span>${primeiroNome}</span>
            <i class="fa-solid fa-chevron-down"></i>
          </button>

          <div class="header__dropdown" id="user-dropdown">
            <a href="../pages/perfil.html">
              <i class="fa-solid fa-id-card"></i>
              Meu perfil
            </a>

            ${
              temCentro
                ? `
                  <a href="../pages/painelCentro/dashboardCentro.html">
                    <i class="fa-solid fa-hand-holding-heart"></i>
                    Centro de apoio
                  </a>
                `
                : ""
            }

            <button id="btn-sair">
              <i class="fa-solid fa-right-from-bracket"></i>
              Sair
            </button>
          </div>
        </div>
      `;

      const dropdownBtn = document.getElementById("user-dropdown-btn");
      const dropdown = document.getElementById("user-dropdown");
      const btnSair = document.getElementById("btn-sair");

      dropdownBtn.addEventListener("click", () => {
        dropdown.classList.toggle("active");
      });

      btnSair.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        location.reload();
      });

      document.addEventListener("click", (e) => {
        if (!areaUsuario.contains(e.target)) {
          dropdown.classList.remove("active");
        }
      });
    } else {
      areaUsuario.innerHTML = `
        <a href="../pages/login.html" class="login-link">
          <i class="fa-solid fa-right-to-bracket"></i>
          Login
        </a>
      `;
    }
  })
  .catch((error) => {
    console.error("Erro ao carregar header:", error);
  });