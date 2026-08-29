/* ============================================================
   MAIN — Interações do site
   ------------------------------------------------------------
   Header, menu mobile, revelação no scroll, contadores,
   brilho do cursor, filtro do portfólio e ano do rodapé.
   ============================================================ */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;

  /* ============================================================
     HEADER — fundo ao rolar
     ============================================================ */
  const header = document.getElementById("header");

  function updateHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 30);
  }
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* ============================================================
     NAVEGAÇÃO — destaque do link ativo
     ============================================================ */
  const navLinks = document.querySelectorAll(".nav-link");

  function setActiveLink() {
    const pos = window.scrollY + header.offsetHeight + 80;
    let current = "inicio";
    document.querySelectorAll("section[id]").forEach((section) => {
      if (section.offsetTop <= pos) current = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + current);
    });
  }

  if (window.IntersectionObserver) {
    const heroSentinel = document.getElementById("inicio");
    const sections = document.querySelectorAll("section[id]");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((link) => {
              link.classList.toggle("is-active", link.getAttribute("href") === "#" + entry.target.id);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => obs.observe(s));
    void heroSentinel;
  } else {
    window.addEventListener("scroll", setActiveLink, { passive: true });
  }

  /* ============================================================
     MENU MOBILE
     ============================================================ */
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");

  function setMenu(open) {
    navToggle.classList.toggle("is-open", open);
    siteNav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("no-scroll", open);
  }

  navToggle.addEventListener("click", () => {
    setMenu(!siteNav.classList.contains("is-open"));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });

  /* ============================================================
     REVELAÇÃO NO SCROLL (IntersectionObserver)
     ============================================================ */
  const revealEls = document.querySelectorAll(".reveal, [data-reveal]");

  if (window.IntersectionObserver && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.dataset.delay || "0", 10);
            if (delay) el.style.transitionDelay = delay + "ms";
            el.classList.add("is-visible");
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  

  /* ============================================================
     CONTADORES ANIMADOS (estatísticas)
     ============================================================ */
  const counters = document.querySelectorAll("[data-count]");

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }

  if (window.IntersectionObserver && !prefersReducedMotion) {
    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => counterObserver.observe(el));
  } else {
    counters.forEach((el) => {
      el.textContent = el.dataset.count;
    });
  }

  /* ============================================================
     BRILHO DO CURSOR (apenas desktop)
     ============================================================ */
  const cursorGlow = document.querySelector(".cursor-glow");

  if (cursorGlow && isFinePointer && !prefersReducedMotion) {
    let raf = null;

    window.addEventListener(
      "pointermove",
      (e) => {
        if (!raf) {
          raf = requestAnimationFrame(() => {
            cursorGlow.style.transform =
              "translate(" + e.clientX + "px, " + e.clientY + "px) translate(-50%, -50%)";
            raf = null;
          });
        }
      },
      { passive: true }
    );

    window.addEventListener(
      "pointerenter",
      () => cursorGlow.classList.add("is-active"),
      { passive: true }
    );
    document.documentElement.addEventListener(
      "pointerleave",
      () => cursorGlow.classList.remove("is-active"),
      { passive: true }
    );
  }

  /* ============================================================
     PORTFÓLIO — renderização + filtros
     Os dados vêm de js/config.js (window.MSWEB.portfolio)
     ============================================================ */
  const portfolioGrid = document.getElementById("portfolioGrid");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const categories = window.MSWEB.portfolioCategories || {};
  const projects = window.MSWEB.portfolio || [];

  function createCard(project) {
    const card = document.createElement("article");
    card.className = "portfolio-card";
    card.dataset.category = project.category;

    const categoryLabel = categories[project.category] || project.category;

    card.innerHTML =
      '<div class="portfolio-media" aria-hidden="true">' +
        '<span class="portfolio-category">' + categoryLabel + "</span>" +
        '<img src="' + project.image + '" alt="' + project.title + ' — imagem do projeto" loading="lazy">' +
      "</div>" +
      '<div class="portfolio-body">' +
        "<h3>" + project.title + "</h3>" +
        "<p>" + project.description + "</p>" +
        '<div class="portfolio-tags">' +
          project.tags.map((tag) => "<span>" + tag + "</span>").join("") +
        "</div>" +
        
      "</div>";

    return card;
  }

  function renderPortfolio(filter) {
    portfolioGrid.innerHTML = "";
    const items = filter === "all" ? projects : projects.filter((p) => p.category === filter);
    items.forEach((p) => portfolioGrid.appendChild(createCard(p)));
  }

  if (portfolioGrid && projects.length) {
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        renderPortfolio(btn.dataset.filter);
      });
    });
    renderPortfolio("all");
  }

    /* ============================================================
     DIFERENCIAIS — interação desktop + destaque por scroll mobile
     ------------------------------------------------------------
     Desktop:
     O destaque é controlado pelo hover via CSS.

     Mobile:
     O card que estiver mais próximo do centro da tela recebe
     .is-active automaticamente.
     ============================================================ */

  const diffCards = document.querySelectorAll(".diff-card");

  if (diffCards.length && window.IntersectionObserver) {
    const isMobileDiff = window.matchMedia("(max-width: 720px)");

    let diffObserver = null;

    function setupDiffObserver() {
      /* Remove observer anterior, caso a largura da tela mude */
      if (diffObserver) {
        diffObserver.disconnect();
        diffObserver = null;
      }

      diffCards.forEach((card) => {
        card.classList.remove("is-active");
      });

      /* No desktop, o hover do CSS cuida da interação */
      if (!isMobileDiff.matches) return;

      /*
       * Cria uma região extremamente próxima do centro da tela.
       *
       * 47% em cima + 47% embaixo =
       * aproximadamente 6% da altura da tela no centro.
       */
      diffObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              diffCards.forEach((card) => {
                card.classList.remove("is-active");
              });

              entry.target.classList.add("is-active");
            }
          });
        },
        {
          root: null,
          threshold: 0,
          rootMargin: "-47% 0px -47% 0px"
        }
      );

      diffCards.forEach((card) => {
        diffObserver.observe(card);
      });
    }

    setupDiffObserver();

    isMobileDiff.addEventListener("change", setupDiffObserver);
  }

  /* ============================================================
   PORTFÓLIO — destaque do card no centro da tela
   ------------------------------------------------------------
   Mobile:
   O card que atravessar a região central da tela recebe
   .is-active automaticamente.
   ============================================================ */



if (portfolioGrid && window.IntersectionObserver) {
  const isMobilePortfolio = window.matchMedia("(max-width: 720px)");

  let portfolioObserver = null;
  let portfolioMutationObserver = null;

  function setupPortfolioObserver() {
    if (portfolioObserver) {
      portfolioObserver.disconnect();
      portfolioObserver = null;
    }

    portfolioGrid.querySelectorAll(".portfolio-card").forEach((card) => {
      card.classList.remove("is-active");
    });

    if (!isMobilePortfolio.matches) return;

    portfolioObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            portfolioGrid.querySelectorAll(".portfolio-card").forEach((card) => {
              card.classList.remove("is-active");
            });

            entry.target.classList.add("is-active");
          }
        });
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "-42% 0px -42% 0px"
      }
    );

    portfolioGrid.querySelectorAll(".portfolio-card").forEach((card) => {
      portfolioObserver.observe(card);
    });
  }

  setupPortfolioObserver();

  isMobilePortfolio.addEventListener("change", setupPortfolioObserver);

  portfolioMutationObserver = new MutationObserver(() => {
    setupPortfolioObserver();
  });

  portfolioMutationObserver.observe(portfolioGrid, {
    childList: true
  });
}

  
 /* ============================================================
   SOBRE — interação baseada no centro da tela
   ------------------------------------------------------------
   Mobile:
   - imagem aumenta quando chega ao centro;
   - card desce suavemente;
   - card recebe glow azul;
   - gráfico é desenhado novamente;
   - 01 / 02 / 03 recebem o mesmo destaque do desktop;
   - ao sair do centro, o destaque é removido.
   ============================================================ */

const aboutVisual = document.querySelector(".split-visual");
const aboutPrinciples = document.querySelectorAll(".principle");

if (
  (aboutVisual || aboutPrinciples.length) &&
  window.IntersectionObserver
) {

  const isMobileAbout = window.matchMedia("(max-width: 720px)");

  let aboutVisualObserver = null;
  let aboutPrincipleObserver = null;

  function setupAboutObservers() {

    /* Remove observers anteriores */
    if (aboutVisualObserver) {
      aboutVisualObserver.disconnect();
      aboutVisualObserver = null;
    }

    if (aboutPrincipleObserver) {
      aboutPrincipleObserver.disconnect();
      aboutPrincipleObserver = null;
    }

    /* Limpa qualquer destaque anterior */
    aboutVisual?.classList.remove("is-center-active");

    aboutPrinciples.forEach((principle) => {
      principle.classList.remove("is-center-active");
    });

    /* Desktop continua sendo controlado pelo CSS */
    if (!isMobileAbout.matches) return;

    /*
     * Região central da viewport.
     *
     * Apenas os ~10% centrais da tela são considerados
     * como a área de ativação.
     */
    const centerOptions = {
      root: null,
      threshold: 0,
      rootMargin: "-45% 0px -45% 0px"
    };

    /* --------------------------------------------------------
       IMAGEM + CARD
       -------------------------------------------------------- */

    if (aboutVisual) {

      aboutVisualObserver = new IntersectionObserver(
        (entries) => {

          entries.forEach((entry) => {

            if (entry.isIntersecting) {
              entry.target.classList.add("is-center-active");
            } else {
              entry.target.classList.remove("is-center-active");
            }

          });

        },
        centerOptions
      );

      aboutVisualObserver.observe(aboutVisual);
    }

    /* --------------------------------------------------------
       01 / 02 / 03
       -------------------------------------------------------- */

    if (aboutPrinciples.length) {

      aboutPrincipleObserver = new IntersectionObserver(
        (entries) => {

          entries.forEach((entry) => {

            if (entry.isIntersecting) {

              /* Ativa somente o princípio que está no centro */
              aboutPrinciples.forEach((principle) => {
                principle.classList.remove("is-center-active");
              });

              entry.target.classList.add("is-center-active");

            } else {

              /* Saiu do centro = perde o destaque */
              entry.target.classList.remove("is-center-active");

            }

          });

        },
        centerOptions
      );

      /*
       * IMPORTANTE:
       * aqui estavam faltando os observe().
       * Sem isso o IntersectionObserver existe,
       * mas nunca observa os 01 / 02 / 03.
       */
      aboutPrinciples.forEach((principle) => {
        aboutPrincipleObserver.observe(principle);
      });
    }
  }

  setupAboutObservers();

  isMobileAbout.addEventListener(
    "change",
    setupAboutObservers
  );
}


  /* ============================================================
     ANO DO RODAPÉ
     ============================================================ */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     ANIMAÇÃO DAS LINHAS DE CÓDIGO DO HERO (só quando visível)
     ============================================================ */
  const heroCodeLines = document.querySelectorAll(".window-code .code-line");
  if (heroCodeLines.length && window.IntersectionObserver && !prefersReducedMotion) {
    const heroVisual = document.querySelector(".hero-visual");
    const codeObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          heroCodeLines.forEach((line, i) => {
            line.style.animationDelay = 0.35 + i * 0.12 + "s";
          });
          codeObserver.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    codeObserver.observe(heroVisual);
  }
})();

const whatsappCta = document.querySelector("#whatsapp-cta");

if (whatsappCta) {
  whatsappCta.addEventListener("click", (event) => {
    const isMobile = window.matchMedia("(max-width: 720px)").matches;

    if (!isMobile) {
      event.preventDefault();
      window.open(whatsappCta.href, "_blank", "noopener,noreferrer");
    }
  });
}


/* =========================================
   WHATSAPP FLUTUANTE
========================================= */

const whatsappFloat = document.getElementById("whatsappFloat");
const contatoSection = document.getElementById("contato");

if (whatsappFloat) {

    // Controla se a intro já terminou
    let whatsappReady = false;

    // A intro terminou → libera o WhatsApp
    window.addEventListener("msIntroComplete", () => {

        whatsappReady = true;
        whatsappFloat.classList.add("show");

    });

    // Esconde ao entrar em Contato
    // e mostra novamente ao sair
    if (contatoSection) {

        const contatoObserver = new IntersectionObserver(
            (entries) => {

                entries.forEach((entry) => {

                    // Antes da intro terminar, não faz absolutamente nada
                    if (!whatsappReady) return;

                    if (entry.isIntersecting) {

                        // Entrou em Contato → esconde
                        whatsappFloat.classList.remove("show");

                    } else {

                        // Saiu de Contato → mostra novamente
                        whatsappFloat.classList.add("show");

                    }

                });

            },
            {
                threshold: 0.05
            }
        );

        contatoObserver.observe(contatoSection);
    }
}