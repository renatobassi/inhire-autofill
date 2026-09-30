# Processo: PRD de feature

- Dono: produto (você) + IA como par de raciocínio
- Trigger: pedido de feature nova ou mudança de regra de negócio
- Resultado: arquivo em `docs/features/` no status **pronto para build**; só então começa código

O PRD alinha **o quê** e **por quê**. Não descreve como implementar (UI pixel, schema, queries). Isso entra depois, no build.

## Passos (CRIA, um turno por fase)

Cada fase: **no máximo 5 perguntas**. Respostas podem ser bullets soltos. A IA não gera o PRD completo até o Aceite.

### C — Contexto

Você despeja o bruto (dor, quem sofre, restrição). A IA só organiza e lista **lacunas**. Não escreve o documento ainda.

Perguntas-padrão (pular as que já foram respondidas):

1. Qual problema (efeito no trabalho da pessoa), não a falta de tela?
2. Quem usa, e em que momento?
3. O que a pessoa faz hoje sem isso?
4. O que **não** pode quebrar?
5. Como saberemos que melhorou (1–3 sinais, mesmo qualitativos)?

### R — Requisitos

Lista P0 / P1 / P2 em linguagem de funcionalidade.

- P0 = sem isso a v1 não vale usar
- P1 = deixa a v1 decente
- P2 = depois

Cada P0: restrição de negócio numa linha. Sem layout, sem tabela SQL.

### I — Iteração

A IA critica como engenheiro cético:

- Onde o escopo inflou?
- Quais casos extremos a v1 ignora de propósito?
- O que cortar para caber numa entrega vertical?

Você decide o corte. A IA não decide sozinha.

### A — Aceite

Só P0, formato **Dado / Quando / Então**. Aí a IA preenche `docs/features/` a partir de `_template.md` e marca **pronto para build**.

Se faltar tela ou fluxo operacional, rascunho em `docs/pages/` ou `docs/processes/` **depois** do PRD, não no meio da entrevista.

## Exceções

- Bugfix ou ajuste de copy: não precisa de PRD; teste + doc da feature existente.
- Exploração (“será que…?”): 1 parágrafo de hipótese, sem PRD, sem código de feature.
- Feature já com PRD **pronto para build**: pular entrevista; só confirmar se o problema ainda vale.

## Regras

Uma feature = um PRD. Não acumular três ideias no mesmo arquivo.
