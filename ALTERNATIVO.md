# Canal alternativo

Este repositório é o espelho alternativo de **Hangar — AI Cockpit**.
O repositório principal é `hangar-ai-cockpit`.

## Porque existe

- Distribuição sem instalador: o binário portátil corre a partir de qualquer
  pasta, incluindo unidades amovíveis.
- Cópia de segurança do código, independente do repositório principal.
- Ponto de partida para quem quiser construir a aplicação a partir do código sem
  descarregar binários.

## O que contém

O mesmo código da aplicação: `main.js`, `preload.js`, `server.js`, `public/`,
`build/`, `tools/`, `package.json`, `LICENSE`, `NOTICE.md` e `README.md`.

Não contém vídeos, apresentações, imagens de perfil, `node_modules`, `dist` nem
a pasta `data`.

## Como usar

```bash
npm install
npm start
```

Ou `start.bat` no Windows, que instala dependências se faltarem.

Para gerar os binários:

```bash
npm run dist
```

## Licenciamento

Código sob licença MIT. Conceito, design e fluxo de funcionamento são propriedade
intelectual da ALDACO, Alexandre da Costa, com atribuição obrigatória em qualquer
reutilização ou apresentação pública. Ver `LICENSE` e `NOTICE.md`.
