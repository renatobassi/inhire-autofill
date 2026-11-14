# InHire Autofill

Extensão Chrome (Manifest V3) que guarda um perfil neste navegador e preenche as etapas Information e Diversity das vagas em `*.inhire.app` quando a pessoa pede. Sem servidor. Comportamento em `docs/PRD.md`.

## Stack

JavaScript, HTML e CSS puros. Manifest V3 e `chrome.storage.local`. Sem bundler, sem npm e sem dependência.

## Pastas

- `src/content` — preenchimento na vaga (`*.inhire.app`)
- `src/popup` — botão do popup
- `src/options` — cadastro do perfil
- `icons` — ícones da extensão
- `docs` — PRD, backlog e workflow
- `store` — material da Chrome Web Store
- `privacy.html` — política de privacidade
- `dist` — artefato; não editar

## Comandos

Não há install, lint, test nem build. O `vercel.json` só ecoa `skip-install` e `skip-build`.

Uso local: `chrome://extensions`, modo do desenvolvedor, carregar sem compactação esta pasta.

Checagem do CI (`.github/workflows/ci.yml`): `node` valida `manifest.json` (Manifest V3, `name`, `version`) e `node --check` em cada `.js`.

## Regras para agentes

- Mudança pequena. Sem arquivo, dependência ou permissão sem requisito no PRD.
- Não ler `node_modules`, builds (`dist`, `.next`, `build`, `out`, `coverage`) nem lockfiles.
- Não fazer merge. Branch a partir da `main` (`feat/`, `fix/`, `docs/`, `chore/`). Sem commit direto na `main`.
- Feature nova: `docs/features/<slug>.md` pronto para build antes do código.
