// HEADER COM EFEITO AO ROLAR

const header = document.querySelector("header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {

        header.style.background = "#08111b";
        header.style.boxShadow = "0 5px 20px rgba(0,0,0,.25)";

    } else {

        header.style.background = "rgba(15,26,38,.95)";
        header.style.boxShadow = "none";

    }

});

// ANIMAÇÃO DE ENTRADA

const observer = new IntersectionObserver((entries) => {

    entries.forEach((entry) => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");

        }

    });

}, {
    threshold: 0.15
});

document.querySelectorAll(
    ".card, .servico, .grid-galeria img"
).forEach((el) => {

    el.classList.add("hidden");
    observer.observe(el);

});

// EFEITO PULSANTE NO WHATSAPP

const whatsapp = document.querySelector(".whatsapp-float");

setInterval(() => {

    whatsapp.classList.add("pulse");

    setTimeout(() => {

        whatsapp.classList.remove("pulse");

    }, 1000);

}, 3000);

// SCROLL SUAVE

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function(e) {

        e.preventDefault();

        const target = document.querySelector(
            this.getAttribute("href")
        );

        if(target){

            target.scrollIntoView({
                behavior: "smooth"
            });

        }

    });

});

/* ANIMAÇÕES */

.hidden{
    opacity:0;
    transform:translateY(40px);
    transition:all .8s ease;
}

.show{
    opacity:1;
    transform:translateY(0);
}

.pulse{
    animation:pulse 1s ease;
}

@keyframes pulse{

    0%{
        transform:scale(1);
    }

    50%{
        transform:scale(1.15);
    }

    100%{
        transform:scale(1);
    }

}
