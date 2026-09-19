// ============================================================
// HEADER COM EFEITO AO ROLAR
// ============================================================
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

// ============================================================
// ANIMAÇÃO DE ENTRADA
// ============================================================
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, {
  threshold: 0.15
});

// OBS: ".card" e ".servico" foram removidos da animação de entrada.
// Eles usam texto essencial para a proposta de valor (pilares, serviços,
// diferenciais e compromissos) — deixar a visibilidade desse texto
// dependente de scroll + IntersectionObserver criava risco real de o
// conteúdo ficar invisível (opacity:0) em conexões lentas, navegação
// rápida ou qualquer falha de JS. Agora só as fotos da galeria animam.
document.querySelectorAll(
  ".grid-galeria img"
).forEach((el) => {
  el.classList.add("hidden");
  observer.observe(el);
});

// ============================================================
// EFEITO PULSANTE NO WHATSAPP
// ============================================================
const whatsapp = document.querySelector(".whatsapp-float");
setInterval(() => {
  whatsapp.classList.add("pulse");
  setTimeout(() => {
    whatsapp.classList.remove("pulse");
  }, 1000);
}, 3000);

// ============================================================
// SCROLL SUAVE
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// ============================================================
// CALCULADORA DE ORÇAMENTO — preço médio por m² (padrão
// intermediário, Rio de Janeiro). Ajuste conforme sua realidade.
// As chaves abaixo precisam bater com os "value" das <option>
// no <select id="calc-ambiente"> do index.html.
// ============================================================
const precosPorM2 = {
  "Banheiro":                       { min: 2500, max: 3000 },
  "Cozinha":                        { min: 2200, max: 2700 },
  "Sala":                           { min: 1300, max: 1700 },
  "Quarto":                         { min: 1400, max: 1800 },
  "Área externa / Varanda":         { min: 900,  max: 1300 },
  "Reforma completa (apto/casa)":   { min: 1700, max: 2300 }
};

const NUMERO_WHATSAPP = "5521996401147";

// URL do Web App do Apps Script (Extensões > Apps Script > Implantar)
const LEAD_ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbz6gx0UiVkvwFXDo5shBPjlEpZ6s1Qe5MV0aCIEHHFeEtz6RrDMPhFeDvkK-npaXNf7Ag/exec";

// Elementos da calculadora
const calcBtn = document.getElementById("calc-btn");
const calcAmbiente = document.getElementById("calc-ambiente");
const calcMetragem = document.getElementById("calc-metragem");
const calcErro = document.getElementById("calc-erro");
const resultadoBox = document.getElementById("resultado-box");
const resultadoTexto = document.getElementById("resultado-texto");
const resultadoWhatsapp = document.getElementById("resultado-whatsapp");

// Elementos do modal de lead
const leadModal = document.getElementById("lead-modal");
const leadModalClose = document.getElementById("lead-modal-close");
const leadForm = document.getElementById("lead-form");
const leadErro = document.getElementById("lead-erro");
const leadSubmit = document.getElementById("lead-submit");

// Guarda o cálculo feito, até o lead preencher o formulário
let estimativaAtual = null;

function abrirModal() {
  leadModal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function fecharModal() {
  leadModal.style.display = "none";
  document.body.style.overflow = "";
}

if (calcBtn) {
  calcBtn.addEventListener("click", () => {
    calcErro.textContent = "";

    const ambiente = calcAmbiente.value;
    const metragem = parseFloat(calcMetragem.value);

    if (!ambiente) {
      calcErro.textContent = "Selecione o ambiente da reforma.";
      return;
    }
    if (!metragem || metragem <= 0) {
      calcErro.textContent = "Informe uma metragem válida.";
      return;
    }

    const preco = precosPorM2[ambiente];
    const valorMin = Math.round(preco.min * metragem);
    const valorMax = Math.round(preco.max * metragem);

    estimativaAtual = { ambiente, metragem, valorMin, valorMax };

    resultadoBox.style.display = "none";
    abrirModal();
  });
}

if (leadModalClose) {
  leadModalClose.addEventListener("click", fecharModal);
}

// fecha clicando fora do card
if (leadModal) {
  leadModal.addEventListener("click", (e) => {
    if (e.target === leadModal) fecharModal();
  });
}

if (leadForm) {
  leadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    leadErro.textContent = "";

    if (!estimativaAtual) {
      fecharModal();
      return;
    }

    const nome = document.getElementById("lead-nome").value.trim();
    const email = document.getElementById("lead-email").value.trim();
    const telefone = document.getElementById("lead-telefone").value.trim();
    const cep = document.getElementById("lead-cep").value.trim();
    const aceitaContatoEl = leadForm.querySelector('input[name="aceitaContato"]:checked');

    if (!nome || !email || !telefone || !cep) {
      leadErro.textContent = "Preencha todos os campos.";
      return;
    }
    if (!aceitaContatoEl) {
      leadErro.textContent = "Selecione se deseja receber contato da OBRABIT.";
      return;
    }

    const aceitaContato = aceitaContatoEl.value; // "Sim" ou "Não"

    const dados = {
      data: new Date().toISOString(),
      nome,
      email,
      telefone,
      ambiente: estimativaAtual.ambiente,
      metragem: estimativaAtual.metragem,
      valorMin: estimativaAtual.valorMin,
      valorMax: estimativaAtual.valorMax,
      aceitaContato,
      cep
    };

    leadSubmit.disabled = true;
    leadSubmit.textContent = "Enviando...";

    try {
      // "no-cors": o Apps Script Web App não devolve cabeçalhos CORS,
      // então não conseguimos ler a resposta — mas o registro na
      // planilha e o envio dos e-mails acontecem normalmente.
      await fetch(LEAD_ENDPOINT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(dados)
      });
    } catch (err) {
      console.error("Erro ao registrar lead:", err);
      // Mesmo se o registro falhar, seguimos mostrando a estimativa.
    }

    mostrarResultado(dados);
    fecharModal();
    leadForm.reset();
    leadSubmit.disabled = false;
    leadSubmit.textContent = "Ver minha estimativa";
    estimativaAtual = null;
  });
}

function mostrarResultado(dados) {
  const formatar = (v) => Number(v).toLocaleString("pt-BR", {
    style: "currency", currency: "BRL", maximumFractionDigits: 0
  });

  resultadoTexto.textContent =
    dados.ambiente + " (" + dados.metragem + " m²): entre " + formatar(dados.valorMin) + " e " + formatar(dados.valorMax);

  if (resultadoWhatsapp) {
    const mensagem = "Olá, OBRABIT! Fiz uma simulação no site: " + dados.ambiente +
      " (" + dados.metragem + "m²), estimativa entre " + formatar(dados.valorMin) +
      " e " + formatar(dados.valorMax) + ". Gostaria de um orçamento detalhado.";
    resultadoWhatsapp.href = "https://wa.me/" + NUMERO_WHATSAPP + "?text=" + encodeURIComponent(mensagem);
  }

  resultadoBox.style.display = "block";
  resultadoBox.scrollIntoView({ behavior: "smooth", block: "center" });
}


// ============================================================
// MENU MOBILE
// ============================================================
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");

if (menuToggle && mobileMenu) {
  const fecharMenu = () => {
    mobileMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
  };

  menuToggle.addEventListener("click", () => {
    const aberto = mobileMenu.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(aberto));
    menuToggle.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", fecharMenu);
  });

  document.addEventListener("click", (event) => {
    if (!mobileMenu.contains(event.target) && !menuToggle.contains(event.target)) {
      fecharMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) fecharMenu();
  });
}
