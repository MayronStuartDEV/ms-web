/* ============================================================
   CONFIG — Dados editáveis do site
   ------------------------------------------------------------
   PORTFÓLIO: para adicionar/editar projetos reais, basta alterar
   os itens deste array. O layout é renderizado automaticamente.

   Campos de cada projeto:
     id          -> identificador único
     title       -> nome do projeto
     category    -> "institucional" | "ecommerce" | "sistemas" | "landing"
     description -> resumo curto
     tags        -> lista de tecnologias / áreas
     image       -> caminho da imagem. Hoje aponta para um placeholder
                    em assets/img/placeholders/. Troque pelo caminho
                    da imagem real (ex.: "assets/img/portfolio/projeto.jpg")
     link        -> link para o case / site (use "#" se ainda não houver)
   ============================================================ */

window.MSWEB = window.MSWEB || {};

window.MSWEB.portfolio = [
  {
    id: "projeto-1",
    title: "Plataforma Corporativa",
    category: "institucional",
    description: "Site institucional completo com identidade visual forte, CMS integrado e alto desempenho.",
    tags: ["Design", "Desenvolvimento", "CMS"],
    image: "assets/img/portfolio/plataforma-corporativa.png",
    link: "#"
  },
  {
    id: "projeto-2",
    title: "E-commerce de Moda",
    category: "ecommerce",
    description: "Loja virtual com experiência de compra fluida, checkout otimizado e gestão de catálogo simplificada.",
    tags: ["E-commerce", "UI/UX", "Performance"],
    image: "assets/img/portfolio/e-commerce..png",
    link: "#"
  },
  {
    id: "projeto-3",
    title: "Sistema de Gestão Interna",
    category: "sistemas",
    description: "Dashboard completo com controle de dados em tempo real, relatórios e áreas restritas.",
    tags: ["Sistema web", "Integrações", "Dashboards"],
    image: "assets/img/portfolio/sistema-gestao-interna.png",
    link: "#"
  },
  {
    id: "projeto-4",
    title: "Landing Page de Lançamento",
    category: "landing",
    description: "Página de alta conversão para campanha de lançamento, com captura de leads integrada ao CRM.",
    tags: ["Landing page", "Copy", "Integrações"],
    image: "assets/img/portfolio/landing-page-lancamento.png",
    link: "#"
  },
  {
    id: "projeto-5",
    title: "Portal de Serviços",
    category: "institucional",
    description: "Portal com catálogo de serviços, orçamento online e área do cliente de fácil manutenção.",
    tags: ["Portal", "UX", "SEO"],
    image: "assets/img/portfolio/portal-servicos.png",
    link: "#"
  },
  {
    id: "projeto-6",
    title: "App Web de Reservas",
    category: "sistemas",
    description: "Aplicação web para agendamento e reservas, responsiva e com painel administrativo completo.",
    tags: ["App web", "Mobile-first", "Sistema"],
    image: "assets/img/portfolio/app-reservas.png",
    link: "#"
  }
];

/* Rótulos das categorias (usados nos filtros e nos cards) */
window.MSWEB.portfolioCategories = {
  all: "Todos",
  institucional: "Institucional",
  ecommerce: "E-commerce",
  sistemas: "Sistemas",
  landing: "Landing page"
};
