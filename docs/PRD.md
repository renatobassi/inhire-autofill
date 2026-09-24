# PRD — InHire Autofill

Status: V0 aceito para uso local no Chrome.

## Problema

A candidatura em `*.inhire.app` repete a etapa Information em todas as vagas.

## Usuário

Quem se candidata no próprio Chrome e quer preencher esses campos com um clique.

## Objetivo

Guardar um perfil neste navegador e preencher a etapa Information quando a pessoa pedir.

## V0

Entra: nome, e-mail, LinkedIn, telefone, país do telefone, país, cidade, pretensão salarial e tipo de contrato (CLT ou PJ).

Há dois disparos, para comparar: botão flutuante na página e botão no popup.

País e país do telefone são o código de duas letras, por exemplo `BR`. A cidade é o nome, por exemplo `São Paulo`. No Brasil a página troca a cidade por uma lista. A pretensão é o texto como deve aparecer, por exemplo `R$ 15.000,00`.

## Fora do V0

- Etapa Diversity, aceite da privacidade e envio do formulário.
- Currículo e reCAPTCHA.
- Conta, servidor e outros computadores.
- Publicação na Chrome Web Store.

## Critérios de aceite

- [x] O perfil fica em `chrome.storage.local`.
- [x] O preenchimento só começa no clique.
- [x] Só entram os campos da etapa Information.
- [ ] A pessoa confere os dois botões numa vaga real do InHire.

## Decisões

| Data | Decisão |
| --- | --- |
| 2026-09-24 | V0 só na etapa Information, com salário e contrato, os dois botões, só neste Chrome. |

## Histórico

| Data | Mudança |
| --- | --- |
| 2026-09-24 | PRD inicial, sem escopo. |
| 2026-09-24 | Escopo do V0 definido e implementado. |
