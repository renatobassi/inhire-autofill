# Product SEO

Checklist usado: [Checklist de Product SEO](https://pm3.com.br/blog/checklist-de-product-seo-para-seu-produto-digital/) (PM3). Nem todo item entra neste produto. A extensão não é uma página que o Google rastreia.

## Discovery

| Pergunta | Resposta neste produto |
| --- | --- |
| Traz problema de indexação ou rastreamento? | Não na extensão. O único HTML público é `privacy.html`, e ele ainda não tem URL. |
| Muda layout, URL ou conteúdo de um site nosso? | Não. O preenchimento acontece no formulário do InHire, que não é nosso. |
| Muda tags de SEO? | Só quando a política for publicada. Hoje o arquivo já tem `lang`, título, um `h1` e `h2`. |
| Dá para projetar ganho de visita ou receita? | Não. Não há Search Console nem página no ar. Inventar essa projeção sairia do escopo. |
| Estudo de palavra-chave? | Não se aplica ao V0. A descoberta da extensão, quando existir, é a ficha da Chrome Web Store, não um cluster de busca orgânica. |

## O que fica para a validação da política pública

Quando `privacy.html` estiver no site da Jeditech:

- Conferir `index,follow` ou `noindex`, conforme a página deva aparecer na busca.
- Publicar a tag canonical com a URL final.
- Manter um único `h1` e a meta description já escrita no arquivo.
- Não há imagem, dado estruturado de preço ou FAQ, nem linkagem interna de site. Isso não entra numa política curta.
- A página é HTML estático, com viewport e largura máxima de 640px.

## Chrome Web Store

A loja não usa este checklist. A ficha ainda não está no ar. O print de 1280×800 está em `store/screenshot-como-funciona.jpg`, e o backlog marca a hospedagem de `privacy.html`. A descrição do manifesto acompanha o escopo: Information e Diversity, perfil neste Chrome.
