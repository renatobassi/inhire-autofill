# PRD — InHire Autofill

Status: V0 aceito para uso local no Chrome.

A fonte de comportamento é este arquivo. O que ainda não foi feito está em [BACKLOG.md](BACKLOG.md).

## Propósito

A candidatura em `*.inhire.app` repete a etapa Information em todas as vagas. O V0 guarda um perfil neste navegador e preenche as etapas Information e Diversity quando a pessoa pedir.

## Escopo

Entra: nome, CPF, e-mail, LinkedIn, telefone, país de origem, cidade, currículo, pretensão salarial e tipo de contrato (CLT ou PJ). Na Diversity, entram os grupos marcados e se a candidatura é como pessoa com deficiência.

Há dois disparos, para comparar: botão flutuante na página e botão no popup.

O país de origem é o código, por exemplo `BR`. O preenchimento só escolhe esse país quando a vaga deixa o campo vazio. O país do telefone fica como a vaga já abre. A cidade é o nome, por exemplo `São Paulo`. No Brasil a página abre a lista de cidades depois do país, e o preenchimento escolhe a mais curta que começa com esse nome. No cadastro, o CPF usa a máscara `000.000.000-00` e a pretensão usa `R$ 15.000,00`. O preenchimento manda esses textos já mascarados. O currículo é um PDF ou DOCX de até 6 MB, escolhido uma vez no cadastro. O aviso dos botões mostra só quantos campos foram preenchidos. "Não pertenço a nenhum grupo" e "Prefiro não responder" substituem os outros grupos. O aceite da privacidade da vaga não entra.

O cadastro só grava o perfil depois que a pessoa marca que ele fica neste Chrome e não é enviado a um servidor. A página de opções aponta para `privacy.html`.

## Fora do V0

- Aceite da privacidade da vaga e envio do formulário.
- reCAPTCHA. A página pode pedi-lo ao receber o currículo.
- Conta, servidor e outros computadores.
- Publicação na Chrome Web Store. O print da ficha está em `store/screenshot-como-funciona.jpg`. A política em `privacy.html` ainda precisa de um endereço público, no site da Jeditech.

## Stakeholders

| Quem | Interesse neste V0 |
| --- | --- |
| Pessoa que se candidata | Preencher os campos repetidos sem reenviar o perfil a um servidor. |
| Quem mantém a extensão | Escopo fechado neste arquivo e pendências só no backlog. |
| InHire | Produto de terceiro. O formulário, o reCAPTCHA e o envio da vaga não são nossos. |
| Chrome Web Store | Canal futuro. A ficha depende da política hospedada. |

## Casos de uso

1. A pessoa salva o perfil nas opções e confirma que os dados ficam neste Chrome.
2. Ela abre uma vaga em `*.inhire.app` e clica no botão da página ou no popup.
3. Ela confere Information e Diversity e segue a candidatura por conta própria.

## Funcionalidades

| Funcionalidade | Problema que resolve |
| --- | --- |
| Perfil local com confirmação | Evita digitar de novo e deixa explícito que não há servidor. |
| Dois botões de preenchimento | Permite comparar o disparo na página e o disparo no popup. |
| Information | Cobre os campos que se repetem em toda vaga. |
| Diversity | Cobre os grupos e a candidatura como pessoa com deficiência. |
| Política em `privacy.html` | Texto único para as opções e para a ficha da loja. |

## Requisitos

Técnicos: Manifest V3, perfil em `chrome.storage.local`, conteúdo só em `https://*.inhire.app/*`, sem rede e sem dependência. O currículo aceito é PDF ou DOCX de até 6 MB.

Usabilidade: o preenchimento só começa no clique. O aviso mostra a quantidade preenchida. CPF e pretensão já saem mascarados. País de origem só entra se a vaga deixar o campo vazio.

Suporte: não há conta nem canal de atendimento. A pessoa confere os campos antes de enviar. Dúvida de escopo se resolve neste arquivo e no backlog.

## Fluxo

1. Carregar a extensão neste Chrome.
2. Salvar o perfil e marcar a confirmação de dados locais.
3. Abrir a vaga.
4. Clicar em preencher.
5. Ler a quantidade preenchida e revisar a página.

## Critérios de liberação

- [x] O perfil fica em `chrome.storage.local`.
- [x] O preenchimento só começa no clique.
- [x] Só entram os campos das etapas Information e Diversity.
- [ ] A pessoa confere os dois botões numa vaga real do InHire.

## Métricas

O V0 não tem meta numérica. O sinal de pronto é o critério ainda aberto: conferir os dois botões numa vaga real.

A extensão não é uma página indexável. Métrica de busca só passa a existir quando `privacy.html` tiver URL pública. O que já foi avaliado está em [SEO.md](SEO.md).

## Cronograma

O V0 foi definido e implementado em 24 e 25 de setembro de 2026. O detalhe está no histórico. Os marcos seguintes estão no backlog: conferir numa vaga real e publicar na Chrome Web Store.

## Decisões

| Data | Decisão |
| --- | --- |
| 2026-09-24 | V0 só na etapa Information, com salário e contrato, os dois botões, só neste Chrome. |
| 2026-09-24 | O perfil só é salvo com a confirmação de que fica neste Chrome. A política pública fica em `privacy.html`. |
| 2026-09-25 | País de origem volta ao perfil. Só é preenchido se a vaga deixar o campo vazio. O aviso mostra só a quantidade. |
| 2026-09-25 | Diversity entra no perfil. O aceite da privacidade e o envio continuam de fora. |

## Histórico

| Data | Mudança |
| --- | --- |
| 2026-09-24 | PRD inicial, sem escopo. |
| 2026-09-24 | Escopo do V0 definido e implementado. |
| 2026-09-24 | CPF no perfil e máscara de pretensão salarial no cadastro. |
| 2026-09-24 | País e país do telefone saem do perfil. A vaga já abre com eles. |
| 2026-09-24 | Currículo PDF ou DOCX entra no perfil e vai no anexo da vaga. |
| 2026-09-24 | Confirmação no cadastro e política de privacidade em `privacy.html`. |
| 2026-09-25 | País de origem volta, porque algumas vagas abrem o campo vazio. O aviso deixa de listar o que não foi achado. |
| 2026-09-25 | A etapa Diversity passa a ser preenchida com os grupos e a candidatura como pessoa com deficiência. |
| 2026-09-25 | A cidade do Brasil é escolhida na lista que abre depois do país. |
| 2026-09-25 | O currículo salvo é entregue ao anexo da própria página. |
| 2026-09-25 | PRD reorganizado no formato de propósito, escopo, stakeholders, casos de uso, requisitos, fluxo, liberação e métricas. |
