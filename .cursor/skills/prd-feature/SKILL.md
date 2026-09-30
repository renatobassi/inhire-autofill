---
name: prd-feature
description: Entrevista curta CRIA e PRD em docs/features antes de desenvolver. Use when the user pede feature nova, requisito, PRD, planejamento de produto, ou implementação de funcionalidade ainda sem PRD pronto para build.
---

# PRD de feature (barato em token)

Gate: **não escreva código de feature** enquanto `docs/features/<slug>.md` não existir com status **pronto para build**.

Leia só: este skill + `docs/processes/prd-feature.md` + `docs/features/_template.md`. Não releia visão, personas ou índice inteiros a cada pergunta. Se o projeto tiver persona documentada e ela não existir, cite a lacuna.

## Condução

Uma fase por resposta. Máximo **5 perguntas**. Numeradas. Aceite bullets. Não gere o PRD até a fase A.

Se o usuário já despejou contexto, **não repita** o que já está claro. Liste só lacunas.

### C — Contexto

Não escreva o PRD. Devolva: (1) 5–8 bullets do que entendeu (2) lacunas (3) até 5 perguntas.

Pergunte só o que faltar: problema (efeito, não tela), quem usa e em que momento, como é hoje, o que não pode quebrar, 1–3 sinais de sucesso.

### R — Requisitos

Tabela mental P0/P1/P2 em funcionalidade + restrição numa linha. Sem UI, sem SQL, sem nome de arquivo. Confirme com o usuário.

### I — Iteração

5 linhas no máximo: inflação de escopo, edge cases da v1, o que cortar. Espere o corte. Você não decide o corte sozinho.

### A — Aceite

Critérios Dado/Quando/Então **só P0**. Aí copie o template para `docs/features/<slug>.md`, preencha só fato combinado, status **pronto para build**. Termo novo de domínio → glossário do projeto, se existir. Não catalogue o PRD num índice de pastas.

Só depois pergunte: “Posso começar o desenvolvimento?”

## Não fazer

- PRD de 10 páginas, cronograma, GTM, stack.
- Inventar métrica, persona ou regra.
- Misturar três features num arquivo.
- Reler índice, visão ou o PRD inteiro em follow-up; só a seção que falta.
