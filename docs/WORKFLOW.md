# Workflow

## Branch

Cada correção ou funcionalidade sai de uma branch nova, a partir da `main` atualizada.

- `feat/` funcionalidade
- `fix/` correção
- `docs/` só documentação
- `chore/` estrutura ou manutenção

Não há commit direto na `main`.

O modelo do pull request está em `.github/pull_request_template.md`.

## Antes do PR para a main

1. Atualizar `docs/PRD.md` se o comportamento mudou.
2. Em `docs/BACKLOG.md`, marcar o que este PR fecha e deixar aberto só o que continua pendente.
3. Não abrir o PR com pendência deste próprio trabalho ainda aberta.

## Loja

O item da Chrome Web Store ainda não está no ar. O print fica em `store/`. A política pública é `privacy.html`, hospedada no site da Jeditech. O ZIP de envio não entra no Git.

## Tokens

A fonte de produto é `docs/PRD.md` e `docs/BACKLOG.md`. Ler só os arquivos da tarefa. Não criar arquivo, dependência ou permissão sem requisito no PRD.
