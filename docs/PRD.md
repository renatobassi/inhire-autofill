# PRD — InHire Autofill

Status: V0 aceito para uso local no Chrome.

## Problema

A candidatura em `*.inhire.app` repete a etapa Information em todas as vagas.

## Usuário

Quem se candidata no próprio Chrome e quer preencher esses campos com um clique.

## Objetivo

Guardar um perfil neste navegador e preencher a etapa Information quando a pessoa pedir.

## V0

Entra: nome, CPF, e-mail, LinkedIn, telefone, cidade, pretensão salarial e tipo de contrato (CLT ou PJ).

Há dois disparos, para comparar: botão flutuante na página e botão no popup.

A cidade é o nome, por exemplo `São Paulo`. No Brasil a página troca a cidade por uma lista. País e país do telefone ficam como a vaga já abre. No cadastro, o CPF usa a máscara `000.000.000-00` e a pretensão usa `R$ 15.000,00`. O preenchimento manda esses textos já mascarados.

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
| 2026-09-24 | CPF no perfil e máscara de pretensão salarial no cadastro. |
| 2026-09-24 | País e país do telefone saem do perfil. A vaga já abre com eles. |
