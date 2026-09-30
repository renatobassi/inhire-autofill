# Workflow

## Branch

Cada correção ou funcionalidade sai de uma branch nova, a partir da `main` atualizada.

- `feat/` funcionalidade
- `fix/` correção
- `docs/` só documentação
- `chore/` estrutura ou manutenção

Não há commit direto na `main`.

O modelo do pull request está em `.github/pull_request_template.md`.

## Feature nova

Feature nova ou mudança de regra segue o processo [prd-feature](processes/prd-feature.md). O código só começa com `docs/features/<slug>.md` em **pronto para build**.

Bugfix, ajuste de copy ou exploração não abrem PRD.

## Antes do PR para a main

1. Atualizar `docs/PRD.md` se o comportamento mudou.
2. Em `docs/BACKLOG.md`, marcar o que este PR fecha e deixar aberto só o que continua pendente.
3. Não abrir o PR com pendência deste próprio trabalho ainda aberta.

## Loja

O item da Chrome Web Store ainda não está no ar. O print fica em `store/`. A política pública é `privacy.html`, hospedada no site da Jeditech. O ZIP de envio não entra no Git.

## Tokens

O que já está aceito fica em `docs/PRD.md` e `docs/BACKLOG.md`. Feature nova passa antes por `docs/features/`. Ler só os arquivos da tarefa. Não criar arquivo, dependência ou permissão sem requisito no PRD da feature ou, no que já está em produção, em `docs/PRD.md`.
