# PRD — InHire Autofill

Status: V0 aceito para uso local no Chrome.

## Problema

A candidatura em `*.inhire.app` repete a etapa Information em todas as vagas.

## Usuário

Quem se candidata no próprio Chrome e quer preencher esses campos com um clique.

## Objetivo

Guardar um perfil neste navegador e preencher as etapas Information e Diversity quando a pessoa pedir.

## V0

Entra: nome, CPF, e-mail, LinkedIn, telefone, país de origem, cidade, currículo, pretensão salarial e tipo de contrato (CLT ou PJ). Na Diversity, entram os grupos marcados e se a candidatura é como pessoa com deficiência.

Há dois disparos, para comparar: botão flutuante na página e botão no popup.

O país de origem é o código, por exemplo `BR`. O preenchimento só escolhe esse país quando a vaga deixa o campo vazio. O país do telefone fica como a vaga já abre. A cidade é o nome, por exemplo `São Paulo`. No Brasil a página abre a lista de cidades depois do país, e o preenchimento escolhe a mais curta que começa com esse nome. No cadastro, o CPF usa a máscara `000.000.000-00` e a pretensão usa `R$ 15.000,00`. O preenchimento manda esses textos já mascarados. O currículo é um PDF ou DOCX de até 6 MB, escolhido uma vez no cadastro. O aviso dos botões mostra só quantos campos foram preenchidos. "Não pertenço a nenhum grupo" e "Prefiro não responder" substituem os outros grupos. O aceite da privacidade da vaga não entra.

## Fora do V0

- Aceite da privacidade da vaga e envio do formulário.
- reCAPTCHA. A página pode pedi-lo ao receber o currículo.
- Conta, servidor e outros computadores.
- Publicação na Chrome Web Store.

## Critérios de aceite

- [x] O perfil fica em `chrome.storage.local`.
- [x] O preenchimento só começa no clique.
- [x] Só entram os campos das etapas Information e Diversity.
- [ ] A pessoa confere os dois botões numa vaga real do InHire.

## Decisões

| Data | Decisão |
| --- | --- |
| 2026-09-24 | V0 só na etapa Information, com salário e contrato, os dois botões, só neste Chrome. |
| 2026-09-25 | País de origem volta ao perfil. Só é preenchido se a vaga deixar o campo vazio. O aviso mostra só a quantidade. |
| 2026-09-25 | Diversity entra no perfil. O aceite da privacidade e o envio continuam de fora. |

## Histórico

| Data | Mudança |
| --- | --- |
| 2026-09-24 | PRD inicial, sem escopo. |
| 2026-09-24 | Escopo do V0 definido e implementado. |
| 2026-09-24 | CPF no perfil e máscara de pretensão salarial no cadastro. |
| 2026-09-24 | País e país do telefone saem do perfil. A vaga já abre com eles. |
| 2026-09-25 | País de origem volta, porque algumas vagas abrem o campo vazio. O aviso deixa de listar o que não foi achado. |
| 2026-09-25 | A etapa Diversity passa a ser preenchida com os grupos e a candidatura como pessoa com deficiência. |
| 2026-09-25 | A cidade do Brasil é escolhida na lista que abre depois do país. |
| 2026-09-25 | O anexo do currículo volta ao perfil e à etapa Information. |
