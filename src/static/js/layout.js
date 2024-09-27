let navbar = document.querySelector(".navmenu");
let btnToggle = document.querySelector("#btn-menu");
let search = document.querySelector(".bx-search");

// ABRE MENU AL CLICK Y CAMBIA DE ICONO
btnToggle.addEventListener("click", () => {
    navbar.classList.toggle("open");
    menuBtnChange()
});

// ABRE MENU AL CLICK EN INPUT Y CAMBIA ICONO
search.addEventListener("click", () => {
    navbar.classList.toggle("open");
    menuBtnChange()
});


// FUNCION CAMBIAR ICONO
function menuBtnChange() {
    if (navbar.classList.contains("open")) {
        btnToggle.classList.replace("bx-menu", "bx-left-arrow");
    } else {
        btnToggle.classList.replace("bx-left-arrow", "bx-menu");
    }
}