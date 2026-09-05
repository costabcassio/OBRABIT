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
document.querySelectorAll('a[href^="#"]:not(#calc-whatsapp)').forEach(anchor => {
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

// CALCULADORA DE ORÇAMENTO
// Preço médio por m² (padrão intermediário, Rio de Janeiro).
// Ajuste estes números conforme sua realidade de custo e margem.
const precosPorM2 = {
  completo:     { min: 1700, max: 2300, label: "casa/apartamento completo" },
  banheiro:     { min: 2500, max: 3000, label: "banheiro" },
  cozinha:      { min: 2200, max: 2700, label: "cozinha" },
  quarto:       { min: 1400, max: 1800, label: "quarto" },
  sala:         { min: 1300, max: 1700, label: "sala" },
  area_servico: { min: 1800, max: 2300, label: "área de serviço" },
  area_externa: { min: 900,  max: 1300, label: "área externa/varanda" }
};

const NUMERO_WHATSAPP = "5521996401147";

const calcBtn = document.getElementById("calc-btn");

if (calcBtn) {
  calcBtn.addEventListener("click", () => {
    const ambienteEl = document.getElementById("calc-ambiente");
    const metragemEl = document.getElementById("calc-metragem");
    const resultado = document.getElementById("calc-resultado");
    const valorEl = document.getElementById("calc-valor");
    const obsEl = document.getElementById("calc-obs");
    const whatsappEl = document.getElementById("calc-whatsapp");

    const metragem = parseFloat(metragemEl.value);

    if (!metragem || metragem <= 0) {
      metragemEl.focus();
      metragemEl.style.borderColor = "#d9534f";
      setTimeout(() => { metragemEl.style.borderColor = ""; }, 1500);
      return;
    }

    const ambiente = ambienteEl.value;
    const preco = precosPorM2[ambiente];

    const valorMin = Math.round(metragem * preco.min);
    const valorMax = Math.round(metragem * preco.max);

    const formatar = (v) => v.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0
    });

    valorEl.textContent = `${formatar(valorMin)} – ${formatar(valorMax)}`;
    obsEl.textContent = `Para ${metragem}m² de ${preco.label}, em padrão intermediário de acabamento.`;

    const mensagem = `Olá, OBRABIT, fiz uma simulação no site e gostaria de reformar "${preco.label}" na metragem "${metragem}m²", valor aproximado deu "${formatar(valorMin)}" à "${formatar(valorMax)}".`;
    whatsappEl.href = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;

    resultado.hidden = false;
    resultado.classList.remove("pulse");
    void resultado.offsetWidth; // reinicia a animação
    resultado.classList.add("pulse");

    resultado.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}
