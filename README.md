# Panorama Eleitoral — newfront

Versão em TypeScript + D3 v7 do site de visualização das eleições municipais do Rio de Janeiro.

## Desenvolvimento

**Desenvolvimento rápido** (Vite + HMR, sem build prévio):

```bash
npm install
npm run dev       # http://localhost:4173 — recarrega ao salvar src/
```

**Build de produção** (artefato em `dist/` para GitHub Pages):

```bash
npm run build
npm run preview   # confere o dist/ antes do deploy
```

Outros comandos:

```bash
npm test
npm run typecheck
```

O `npm run dev` usa [Vite](https://vite.dev/) (esbuild interno + HMR). Turbopack é específico do Next.js e não se aplica a este site estático.

## Estrutura

| Pasta | Conteúdo |
|-------|----------|
| `index.html` | Entrada Vite (dev) |
| `src/` | TypeScript (mapa, Sankey, dados) |
| `public/` | Estáticos (CSS, ícones) |
| `data/` | JSON/CSV eleitorais (servidos em `/data/` no dev e copiados para `dist/data/` no build) |
| `dist/` | Artefato de deploy (gitignored) |
| `tests/` | Testes unitários |

## Deploy

Push em `master` dispara o workflow GitHub Actions que executa testes, build e publica `dist/` no GitHub Pages.

## Comportamento

- Mapa coroplético das prefeituras (2004–2016)
- Clique em município: Sankey da câmara apenas para **Rio de Janeiro**
- Outros municípios exibem mensagem até integração com pipeline TSE

## Legado

Os arquivos `mapa.js`, `sankey.js`, `camara.js` e `index.html` na raiz do repositório (site antigo) permanecem como referência até o merge em `master`.
