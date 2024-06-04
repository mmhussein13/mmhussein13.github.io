/* ====================================== Script for Move to top button =====================*/

window.addEventListener("scroll", () => {
    const scrollHeight = window.pageYOffset;
    const moveTopButton = document.querySelector(".move-top");
    if (scrollHeight > 420) {
    moveTopButton.style.opacity = 1;
    moveTopButton.style.top = "85vh";
    moveTopButton.style.right = "30px";
    }else {
    moveTopButton.style.opacity = 0;
    moveTopButton.style.top = "50vh";
    moveTopButton.style.right = "20vw";
    }
});

/*================= Script for side menu on small screen. =====================*/

function openmenu() {
    document.getElementById('side-menu').style.right = '0';
}

function closemenu() {
    document.getElementById('side-menu').style.right = '-200px';
}