# MS Web 3.0 — Intro integrada

Esta é uma cópia de teste da MS Web 3.0 com a intro aprovada integrada como overlay inicial.

## O que foi alterado

- A base do projeto continua sendo a MS Web 3.0 em HTML/CSS/JS.
- A animação Canvas 2D da intro `timing-v1` foi portada para JavaScript puro.
- O circuito e a geometria do M/S foram preservados.
- A timeline aprovada da intro foi preservada.
- A home fica por baixo da intro e aparece após a conclusão.
- A transição visual definitiva entre intro e home **ainda não foi criada**; por enquanto há apenas um fade de saída para permitir o teste da integração.

## Arquivos novos

- `js/ms-intro.js`
- `css/09-intro.css`

## Teste local

Como este projeto é HTML/CSS/JS puro, pode ser servido por um servidor local. No VS Code, por exemplo:

```bash
python -m http.server 5500
```

Depois abra `http://localhost:5500/`.

Se preferir usar o Live Server do VS Code, também funciona.

## Regra para a próxima etapa

Não alterar o desenho do circuito ou o timing da intro sem aprovação. A próxima etapa é apenas avaliar a integração e, depois, criar a transição visual definitiva da intro para a home.
