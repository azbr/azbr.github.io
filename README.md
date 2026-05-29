# Panorama Eleitoral — newfront

Versão em TypeScript + D3 v7 do site de visualização das eleições municipais do Rio de Janeiro.

## Desenvolvimento

Fluxo recomendado (dados carregados via HTTP a partir de `dist/data/`):

```bash
npm install
npm run build
npm run preview   # http://localhost:4173
```

Outros comandos:

```bash
npm test
npm run typecheck
npm run watch     # rebuild ao editar src/
```

**Não abra `dist/index.html` direto no navegador (`file://`).** O `fetch` dos arquivos em `data/` exige um servidor estático — use sempre `npm run preview` após o build.

## Estrutura

| Pasta | Conteúdo |
|-------|----------|
| `src/` | TypeScript (mapa, Sankey, dados) |
| `public/` | HTML e CSS servidos em produção |
| `data/` | JSON/CSV eleitorais (copiados para `dist/data/` no build) |
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
