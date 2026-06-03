/* ===================================================== */
/* CARREGAMENTO DO HEADER                               */
/* ===================================================== */

fetch("../components/header.html")
    .then(response => response.text())
    .then(data => {

        document.getElementById("header").innerHTML = data;

    });

/* ===================================================== */
/* SCROLL SUAVE PARA FUNCIONALIDADES                     */
/* ===================================================== */

const btnFuncionalidades =
    document.getElementById("btn-funcionalidades");

if (btnFuncionalidades) {

    btnFuncionalidades.addEventListener("click", () => {

        document
            .getElementById("funcionalidades")
            .scrollIntoView({
                behavior: "smooth"
            });

    });

}