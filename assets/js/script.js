/*==========================================
        CARDS FLUTUANTES
==========================================*/





/*==========================================
        DADOS DOS CARDS
==========================================*/
const floatingCards = [

    {
        icon: "fa-mobile-screen-button",
        text: "100% Responsivo"
    },

    {
        icon: "fa-bolt",
        text: "Alta Performance"
    },

    {
        icon: "fa-magnifying-glass",
        text: "SEO Otimizado"
    },

    {
        icon: "fa-palette",
        text: "Design Exclusivo"
    },

    {
        icon: "fa-rocket",
        text: "Carregamento Rápido"
    },

    {
        icon: "fa-code",
        text: "Código Limpo"
    },

    {
        icon: "fa-chart-line",
        text: "Foco em Conversão"
    },

    {
        icon: "fa-shield-halved",
        text: "Segurança Avançada"
    }

];

/*==========================================
        ELEMENTOS DOS CARDS
==========================================*/

const cardElements = [

    document.querySelector(".card-1"),
    document.querySelector(".card-2"),
    document.querySelector(".card-3"),
    document.querySelector(".card-4")

];
/*==========================================
        CONTROLE DOS CARDS
==========================================*/

// Índices dos cards atualmente exibidos
let activeCards = [0, 1, 2, 3];

// Última posição alterada
let lastChangedCard = -1;

// Histórico dos últimos cards exibidos
const recentCards = [];

/*==========================================
        ATUALIZAR CARD
==========================================*/

function updateCard(cardElement, cardData){

    if (!cardElement) return;

    const icon = cardElement.querySelector("i");

    const text = cardElement.querySelector("span");

    icon.className = `fa-solid ${cardData.icon}`;

    text.textContent = cardData.text;

}
/*==========================================
        SORTEAR NOVO CARD
==========================================*/

function getRandomCardIndex(excludedIndexes){

    let randomIndex;

    do{

        randomIndex = Math.floor(Math.random() * floatingCards.length);

    }while(

        excludedIndexes.includes(randomIndex) ||

        recentCards.includes(randomIndex)

    );

    return randomIndex;

}
/*==========================================
        SORTEAR POSIÇÃO
==========================================*/

function getRandomCardPosition(){

    let position;

    do{

        position = Math.floor(Math.random() * cardElements.length);

    }while(position === lastChangedCard);

    return position;

}
/*==========================================
        TROCAR CARD
==========================================*/

function changeRandomCard(){

    // Escolhe uma posição diferente da última
    const position = getRandomCardPosition();

    // Escolhe um card que ainda não esteja visível
    const newCardIndex = getRandomCardIndex(activeCards);

    // Card da tela
    const card = cardElements[position];

    // Inicia animação de saída
    card.classList.add("changing-out");

    setTimeout(() => {

        // Atualiza conteúdo
        updateCard(card, floatingCards[newCardIndex]);

        // Atualiza controle
        activeCards[position] = newCardIndex;

        // Guarda o card no histórico
recentCards.push(newCardIndex);

// Mantém apenas os 3 últimos
if(recentCards.length > 3){

    recentCards.shift();

}

        // Salva última posição alterada
        lastChangedCard = position;

        // Remove animação de saída
        card.classList.remove("changing-out");

        // Executa animação de entrada
        card.classList.add("changing-in");

        // Remove classe após finalizar
        setTimeout(() => {

            card.classList.remove("changing-in");

        },300);

    },300);

}
/*==========================================
        AGENDAR PRÓXIMA TROCA
==========================================*/

function scheduleNextChange(){

    // Tempo aleatório entre 4 e 6 segundos
    const randomTime = Math.floor(Math.random() * 2000) + 4000;

    setTimeout(() => {

        changeRandomCard();

        scheduleNextChange();

    }, randomTime);

}
/*==========================================
        INICIALIZAÇÃO
==========================================*/

if (cardElements.every(card => card)) {
    scheduleNextChange();
}

/* ==========================================
   MENU MOBILE
========================================== */

const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

// Cria o overlay automaticamente
const overlay = document.createElement("div");
overlay.classList.add("menu-overlay");
document.body.appendChild(overlay);

// Abrir / Fechar menu
menuToggle.addEventListener("click", () => {

    menuToggle.classList.toggle("active");
    mobileMenu.classList.toggle("active");
    overlay.classList.toggle("active");

    document.body.classList.toggle("menu-open");

});

// Fechar ao clicar no overlay
overlay.addEventListener("click", fecharMenu);

// Fechar ao clicar em qualquer link
document.querySelectorAll(".mobile-menu a").forEach(link => {

    link.addEventListener("click", fecharMenu);

});

function fecharMenu(){

    menuToggle.classList.remove("active");
    mobileMenu.classList.remove("active");
    overlay.classList.remove("active");

    document.body.classList.remove("menu-open");

}

/* =========================================
   WHATSAPP FLUTUANTE
========================================= */

const whatsappFloat = document.getElementById("whatsappFloat");
const portfolioSection = document.getElementById("portfolio");

function toggleWhatsapp() {

    if (!portfolioSection || !whatsappFloat) return;

    const portfolioTop = portfolioSection.getBoundingClientRect().top;

    if (portfolioTop <= 120) {

        whatsappFloat.classList.add("show");

    } else {

        whatsappFloat.classList.remove("show");

    }

}

window.addEventListener("scroll", toggleWhatsapp);

toggleWhatsapp();