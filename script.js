// ============================================================
// CONFIGURAÇÃO
// ============================================================
// Cole aqui a URL do seu Web App do Google Apps Script
// (Implantar > Nova implantação > Aplicativo da Web > URL gerada)
const GOOGLE_SHEETS_WEBHOOK_URL = "COLE_AQUI_A_URL_DO_SEU_APPS_SCRIPT";

// Tabela de preços por m² (valores aproximados — ajuste para a realidade da OBRABIT)
const TABELA_PRECOS = {
  "Banheiro": { min: 800, max: 1500 },
  "Cozinha": { min: 900, max: 1600 },
  "Sala": { min: 400, max: 700 },
  "Quarto": { min: 350, max: 650 },
  "Área externa / Varanda": { min: 500, max: 900 },
  "Reforma completa (apto/casa)": { min: 1200, max: 2200 }
};

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

document.querySelectorAll(
  ".card, .servico, .grid-galeria img"
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

// ============================================================
// CALCULADORA DE ORÇAMENTO + MODAL DE LEAD
// ============================================================
const calcBtn = document.getElementById("calc-btn");
const calcAmbiente = document.getElementById("calc-ambiente");
const calcMetragem = document.getElementById("calc-metragem");
const calcErro = document.getElementById("calc-erro");

const leadModal = document.getElementById("lead-modal");
const leadModalClose = document.getElementById("lead-modal-close");
const leadForm = document.getElementById("lead-form");
const leadErro = document.getElementById("lead-erro");
const leadSubmit = document.getElementById("lead-submit");

const resultadoBox = document.getElementById("resultado-box");
const resultadoTexto = document.getElementById("resultado-texto");

let estimativaAtual = null; // guarda ambiente/metragem/valorMin/valorMax calculados

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

    const faixa = TABELA_PRECOS[ambiente];
    const valorMin = Math.round(faixa.min * metragem);
    const valorMax = Math.round(faixa.max * metragem);

    estimativaAtual = { ambiente, metragem, valorMin, valorMax };

    abrirModal();
  });
}

if (leadModalClose) {
  leadModalClose.addEventListener("click", fecharModal);
}

// fecha clicando fora do card
if (leadModal) {
  leadModal.addEventListener("click", (e) => {
    if (e.target === leadModal) {
      fecharModal();
    }
  });
}

if (leadForm) {
  leadForm.addEventListener("submit", (e) => {
    e.preventDefault();
    leadErro.textContent = "";

    if (!estimativaAtual) {
      fecharModal();
      return;
    }

    const nome = document.getElementById("lead-nome").value.trim();
    const email = document.getElementById("lead-email").value.trim();
    const telefone = document.getElementById("lead-telefone").value.trim();
    const aceitaContatoEl = leadForm.querySelector('input[name="aceitaContato"]:checked');

    if (!nome || !email || !telefone) {
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
      nome: nome,
      email: email,
      telefone: telefone,
      ambiente: estimativaAtual.ambiente,
      metragem: estimativaAtual.metragem,
      valorMin: estimativaAtual.valorMin,
      valorMax: estimativaAtual.valorMax,
      aceitaContato: aceitaContato
    };

    leadSubmit.disabled = true;
    leadSubmit.textContent = "Enviando...";

    enviarLead(dados)
      .then(() => {
        mostrarResultado(dados);
        fecharModal();
        leadForm.reset();
      })
      .catch(() => {
        // Mesmo se o envio falhar silenciosamente (modo no-cors),
        // ainda mostramos a estimativa para não travar a experiência do usuário.
        mostrarResultado(dados);
        fecharModal();
        leadForm.reset();
      })
      .finally(() => {
        leadSubmit.disabled = false;
        leadSubmit.textContent = "Ver minha estimativa";
      });
  });
}

function enviarLead(dados) {
  if (!GOOGLE_SHEETS_WEBHOOK_URL || GOOGLE_SHEETS_WEBHOOK_URL.indexOf("COLE_AQUI") !== -1) {
    console.warn("Configure a URL do Google Apps Script em GOOGLE_SHEETS_WEBHOOK_URL.");
    return Promise.resolve();
  }

  // Content-Type text/plain evita o preflight CORS que o Apps Script não trata.
  return fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(dados)
  });
}

function mostrarResultado(dados) {
  if (!resultadoBox || !resultadoTexto) return;

  const min = Number(dados.valorMin).toLocaleString("pt-BR");
  const max = Number(dados.valorMax).toLocaleString("pt-BR");

  resultadoTexto.textContent =
    dados.ambiente + " (" + dados.metragem + " m²): entre R$ " + min + " e R$ " + max;

  resultadoBox.style.display = "block";
  resultadoBox.scrollIntoView({ behavior: "smooth", block: "center" });
}
