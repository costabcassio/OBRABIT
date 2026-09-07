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

// ================================================================
// CALCULADORA DE ORÇAMENTO — LÓGICA DE CÁLCULO ORIGINAL (INTOCADA)
// ================================================================

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

// >>> COLE AQUI A URL DO SEU APPS SCRIPT (Web App), depois de publicá-lo <<<
const LEAD_ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbz9a8v9uHJBdPuGgn8QvJ2VwIYLMyOyGgLt6u5IN8c7omiugy0pY_8CBqlXbc7TTRDVUg/exec";

// Guarda o resultado já calculado, esperando o envio do lead para ser exibido
let calculoPendente = null;

const calcBtn = document.getElementById("calc-btn");
const leadModal = document.getElementById("lead-modal");
const leadForm = document.getElementById("lead-form");
const leadFormBtn = document.getElementById("lead-form-btn");
const leadFormStatus = document.getElementById("lead-form-status");
const leadModalClose = document.getElementById("lead-modal-close");

if (calcBtn) {
  calcBtn.addEventListener("click", () => {
    const ambienteEl = document.getElementById("calc-ambiente");
    const metragemEl = document.getElementById("calc-metragem");

    const metragem = parseFloat(metragemEl.value);

    if (!metragem || metragem <= 0) {
      metragemEl.focus();
      metragemEl.style.borderColor = "#d9534f";
      setTimeout(() => { metragemEl.style.borderColor = ""; }, 1500);
      return;
    }

    const ambiente = ambienteEl.value;
    const preco = precosPorM2[ambiente];

    // --- CÁLCULO ORIGINAL (não alterado) ---
    const valorMin = Math.round(metragem * preco.min);
    const valorMax = Math.round(metragem * preco.max);
    // --- FIM DO CÁLCULO ORIGINAL ---

    // Guarda o resultado calculado; ele só é exibido depois que o lead
    // preencher nome, e-mail e telefone no modal.
    calculoPendente = { ambiente, preco, metragem, valorMin, valorMax };

    document.getElementById("calc-resultado").hidden = true;
    leadFormStatus.textContent = "";
    leadModal.hidden = false;
  });
}

// Formata e exibe o resultado — MESMA lógica de exibição original,
// só movida para uma função para poder ser chamada após o lead.
function exibirResultadoCalculadora(dados) {
  const resultado = document.getElementById("calc-resultado");
  const valorEl = document.getElementById("calc-valor");
  const obsEl = document.getElementById("calc-obs");
  const whatsappEl = document.getElementById("calc-whatsapp");

  const formatar = (v) => v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  });

  valorEl.textContent = `${formatar(dados.valorMin)} – ${formatar(dados.valorMax)}`;
  obsEl.textContent = `Para ${dados.metragem}m² de ${dados.preco.label}, em padrão intermediário de acabamento.`;

  const mensagem = `Olá, OBRABIT, fiz uma simulação no site e gostaria de reformar "${dados.preco.label}" na metragem "${dados.metragem}m²", valor aproximado deu "${formatar(dados.valorMin)}" à "${formatar(dados.valorMax)}".`;
  whatsappEl.href = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`;

  resultado.hidden = false;
  resultado.classList.remove("pulse");
  void resultado.offsetWidth; // reinicia a animação
  resultado.classList.add("pulse");
  resultado.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Envia nome, e-mail, telefone + resultado calculado para o Google Sheets
if (leadForm) {
  leadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!calculoPendente) {
      leadFormStatus.textContent = "Refaça o cálculo antes de continuar.";
      return;
    }

    const nome = document.getElementById("lead-nome").value.trim();
    const email = document.getElementById("lead-email").value.trim();
    const telefone = document.getElementById("lead-telefone").value.trim();

    if (!nome || !email || !telefone) {
      leadFormStatus.textContent = "Preencha todos os campos.";
      return;
    }

    leadFormBtn.disabled = true;
    leadFormBtn.textContent = "Enviando...";
    leadFormStatus.textContent = "";

    const payload = {
      nome,
      email,
      telefone,
      ambiente: calculoPendente.ambiente,
      metragem: calculoPendente.metragem,
      valorMin: calculoPendente.valorMin,
      valorMax: calculoPendente.valorMax,
      data: new Date().toISOString()
    };

    try {
      // "no-cors" porque o Apps Script Web App não responde com cabeçalhos CORS por padrão.
      // Não conseguimos ler a resposta, mas o registro na planilha acontece normalmente.
      await fetch(LEAD_ENDPOINT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error("Erro ao registrar lead:", err);
      // Mesmo se o registro falhar, seguimos mostrando o resultado ao usuário.
    }

    exibirResultadoCalculadora(calculoPendente);

    leadModal.hidden = true;
    leadForm.reset();
    leadFormBtn.disabled = false;
    leadFormBtn.textContent = "Ver minha estimativa";
    calculoPendente = null;
  });
}

// Fecha o modal sem enviar (o resultado não é exibido nesse caso)
if (leadModalClose) {
  leadModalClose.addEventListener("click", () => {
    leadModal.hidden = true;
  });
}
