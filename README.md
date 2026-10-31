# Volt

Felipe Theodoro de Paula - SP3199151

Sistema de catálogo de produtos feito com HTML, CSS e JavaScript puro. 

## Como executar

1. Extraia o arquivo ZIP.
2. Mantenha `index.html`, `app.js` e`style.css` juntos.
3. Abra `index.html` no navegador.

## Estrutura

```text
index.html      Estrutura das quatro seções e formulários
app.js          Constantes, classes, funções e eventos
style.css       Cores, componentes e layout responsivo
README.md       Orientações de uso
```

## Classes

- **Produto:** nome, descrição, preço, categoria e imagem.
- **BdProdutos:** cadastrar, consultar, editar e excluir produtos; salvar e recuperar o catálogo.
- **ItemCarrinho:** produto, quantidade e total do item.
- **Carrinho:** itens, atendimento, subtotal, taxa e total.
- **Pedido:** cliente, cópia do carrinho, atendimento, endereço, status e data.
- **BdPedidos:** cadastrar, consultar, editar e excluir pedidos; salvar e recuperar o histórico.

As relações usam composição: um carrinho contém itens e um item contém um produto. Um pedido guarda uma cópia de seus produtos para preservar nome e preço mesmo após alterar o cardápio.

## Funcionalidades

- **Catálogo:** doze produtos iniciais, carrossel manual com imagem/nome/preço, busca e filtro por categoria.
- **Carrinho:** adicionar, aumentar/diminuir quantidades, remover e limpar com confirmação, totais atualizados automaticamente.
- **Atendimento:** Retirada ou entrega. A taxa de R$ 9,90 é cobrada uma vez por entrega caso o pedido não ultrapasse 199; nos demais casos não há taxa.
- **Finalização:** nome obrigatório, endereço obrigatório para entrega e bloqueio de pedido vazio.
- **Gerenciar:** cadastro, edição e exclusão de produtos; imagem opcional PNG/JPEG/WebP até 350 KB.
- **Pedidos:** histórico com data, itens, status, subtotal, taxa e total; edição de cliente, atendimento, endereço e status, além de exclusão com confirmação. Itens e preços originais são preservados.
- **Persistência:** produtos, carrinho, pedidos e contadores de ID salvos no localStorage. Atualizações de outra aba são recebidas pelo evento `storage` quando suportado pelo navegador.

Os dados de demonstração são cadastrados somente quando não há cardápio salvo. Excluir todos os produtos não os recria ao recarregar. As chaves começam com `volt:` e não sobrescrevem os dados das versões anteriores.

## Pagamento

Para retirada, a forma de pagamento é **Pagamento na retirada** e o pedido é registrado ao finalizar. Para entrega, preencha nome e endereço e selecione **Pix** para abrir o modal. Se selecionar Pix antes de preencher os dados, conclua o formulário e clique em **Finalizar pedido**.

O modal mostra o total com a taxa de entrega, QR Code gerado pela API [goQR.me](https://goqr.me/api/doc/create-qr-code/) e contador de 15 minutos. A imagem depende de conexão com a internet. Cancelar, pressionar Escape ou deixar o prazo expirar fecha o modal, preserva o carrinho e exibe a mensagem de pagamento não recebido. Uma nova tentativa começa com 15 minutos.

**Já realizei o pagamento** registra um único pedido e limpa o carrinho. A forma de pagamento fica salva no histórico e é preservada ao editar o pedido. Pedidos anteriores à alteração aparecem com pagamento **Não informado**. Alterações no carrinho ou no catálogo em outra aba encerram a tentativa para permitir conferir os dados novamente.

Este projeto funciona apenas no navegador e não possui chave Pix ou provedor de pagamento. O QR Code é de demonstração, contém o total e a validade da tentativa e não é uma cobrança Pix válida. O clique no botão não valida o recebimento do Pix. Para confirmação real, é necessário integrar um backend a um provedor de pagamentos, gerar uma cobrança válida e verificar seu status no servidor, por consulta ou webhook.

## Boas práticas e IHC

Nomes claros, funções por responsabilidade, constantes nomeadas, `const` por padrão, `let` para reatribuição e comparações estritas. Formulários têm rótulos e validação; exclusões exigem confirmação; ações exibem feedback. O CSS mantém estilos consistentes, foco visível e adaptação ao celular. Valores são multiplicados e somados em centavos para reduzir erros de precisão.

A leitura de uma imagem usa `FileReader` com `onload` e `onerror`. É um único callback de operação assíncrona: o produto só é gravado quando a leitura termina. Não há encadeamento de Promises.

## Design

Modo claro: paleta de cores "pastelizadas" para dar aparência de conforto, fontes seguindo essa mesma estética e imagens geradas por svg com base na cor da categoria e primeira letra da categoria.

Modo escuro: paleta de cores neon para dar aparência de tecnologia e modernidade, fontes padrões do modo claro e imagens geradas por svg com base na cor da categoria e primeira letra da categoria.