# Panorama Eleitoral — newfront

Versão em TypeScript + D3 v7 do site de visualização das eleições municipais do Rio de Janeiro.

## Desenvolvimento

```bash
npm install
npm test          # Vitest
npm run typecheck
npm run build     # gera dist/
npm run preview   # serve dist/ em http://localhost:4173
```

Abra `dist/index.html` via servidor estático (o `preview` ou extensão Live Server) para carregar `data/` corretamente.

## Estrutura

| Pasta | Conteúdo |
|-------|----------|
| `src/` | TypeScript (mapa, Sankey, dados) |
| `public/` | HTML e CSS servidos em produção |
| `data/` | JSON/CSV eleitorais (legado) |
| `dist/` | Artefato de deploy (gitignored) |
| `tests/` | Testes unitários |

## Deploy

Push em `master` dispara o workflow GitHub Actions que executa testes, build e publica `dist/` no GitHub Pages.

## Comportamento

- Mapa coroplético das prefeituras (2004–2016)
- Clique em município: Sankey da câmara apenas para **Rio de Janeiro**
- Outros municípios exibem mensagem até integração com pipeline TSE

## Legado

Os arquivos `mapa.js`, `sankey.js`, `camara.js` e `index.html` na raiz permanecem como referência até o merge em `dev`/`master`.
