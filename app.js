const CHAVE_PRODUTOS = 'volt:loja:produtos';
const CHAVE_ID_PRODUTOS = 'volt:loja:id-produtos';
const CHAVE_CARRINHO = 'volt:loja:carrinho';
const CHAVE_PEDIDOS = 'volt:loja:pedidos';
const CHAVE_ID_PEDIDOS = 'volt:loja:id-pedidos';
const CHAVE_TEMA = 'volt:tema';
const CHAVE_NEWSLETTER = 'volt:newsletter';
const TAXA_ENTREGA = 9.90;
const TEMPO_PAGAMENTO_PIX = 15 * 60 * 1000;
const API_QR_CODE = 'https://api.qrserver.com/v1/create-qr-code/';
const FORMAS_PAGAMENTO = ['Pagamento na retirada', 'Pix', 'Não informado'];
const LARGURA_IMAGEM_PRODUTO = 400;
const ALTURA_IMAGEM_PRODUTO = 220;
const TAMANHO_LETRA_IMAGEM = 154;
const COR_CATEGORIA_PADRAO = '#999999';
const QUANTIDADE_MAXIMA = 99;
const TAMANHO_MAXIMO_IMAGEM = 350 * 1024;
const IMAGEM_PADRAO = 'imagens/padrao.png';
const CATEGORIAS = ['Áudio', 'Acessórios', 'Casa', 'Vestível'];
const TIPOS_ENTREGA = ['Retirada', 'Entrega'];
const STATUS_PEDIDOS = ['Pendente', 'Em preparo', 'Pronto', 'Finalizado', 'Cancelado'];
const TEMA_ESCURO = 'dark';
const TEMA_CLARO = 'light';

const CORES_POR_CATEGORIA = {
  'Áudio': '#1258B6',
  'Acesórios': '#107C10',
  'Casa': '#C81D25',
  'Vestível': '#6D42C1',
};

class Produto {
  constructor(nome, descricao, preco, categoria, imagem) {
    this.nome = nome;
    this.descricao = descricao;
    this.preco = preco;
    this.categoria = categoria;
    this.imagem = imagem;
  }

  get id() { return this._id; }
  set id(id) { this._id = Number(id); }

  get nome() { return this._nome; }
  set nome(nome) {
    const texto = String(nome).trim();
    if (texto === '') throw new Error('Informe o nome do produto.');
    if (texto.length > 80) throw new Error('O nome deve ter até 80 caracteres.');
    this._nome = texto;
  }

  get descricao() { return this._descricao; }
  set descricao(descricao) {
    const texto = String(descricao).trim();
    if (texto === '') throw new Error('Informe a descrição do produto.');
    if (texto.length > 300) throw new Error('A descrição deve ter até 300 caracteres.');
    this._descricao = texto;
  }

  get preco() { return this._preco; }
  set preco(preco) {
    const numero = Number(preco);
    if (!Number.isFinite(numero) || numero <= 0 || numero > 10000) {
      throw new Error('Informe um preço maior que zero e até R$ 10.000,00.');
    }
    this._preco = Math.round(numero * 100) / 100;
  }

  get categoria() { return this._categoria; }
  set categoria(categoria) {
    if (!CATEGORIAS.includes(categoria)) throw new Error('Selecione uma categoria válida.');
    this._categoria = categoria;
  }

  get imagem() { return this._imagem; }
  set imagem(imagem) { this._imagem = imagem || IMAGEM_PADRAO; }
}

class BdProdutos {
  constructor() {
    this._produtos = [];
    this.carregarDoLocalStorage();
  }

  get produtos() { return this._produtos; }

  getProximoId() {
    let ultimoId = Number(localStorage.getItem(CHAVE_ID_PRODUTOS)) || 0;
    this._produtos.forEach((produto) => {
      if (produto.id > ultimoId) ultimoId = produto.id;
    });
    return ultimoId + 1;
  }

  adicionarProduto(produto) {
    produto.id = this.getProximoId();
    const novaLista = this._produtos.slice();
    novaLista.push(produto);
    localStorage.setItem(CHAVE_ID_PRODUTOS, produto.id);
    salvarDados(CHAVE_PRODUTOS, novaLista);
    this._produtos = novaLista;
  }

  buscarProdutoPorId(id) {
    return this._produtos.find((produto) => produto.id === Number(id));
  }

  editarProduto(id, produtoEditado) {
    if (!this.buscarProdutoPorId(id)) throw new Error('Produto não encontrado.');
    produtoEditado.id = id;
    const novaLista = this._produtos.slice();
    novaLista.forEach((produto, indice) => {
      if (produto.id === Number(id)) novaLista[indice] = produtoEditado;
    });
    salvarDados(CHAVE_PRODUTOS, novaLista);
    this._produtos = novaLista;
  }

  removerProduto(id) {
    if (!this.buscarProdutoPorId(id)) throw new Error('Produto não encontrado.');
    const novaLista = this._produtos.filter((produto) => produto.id !== Number(id));
    salvarDados(CHAVE_PRODUTOS, novaLista);
    this._produtos = novaLista;
  }

  carregarDoLocalStorage() {
    const dados = lerDados(CHAVE_PRODUTOS);
    this._produtos = [];
    if (dados === null) {
      this.cadastrarProdutosIniciais();
      return;
    }
    if (!Array.isArray(dados)) throw new Error('O carrinho salvo tem formato inválido.');
    dados.forEach((dadosProduto) => {
      this._produtos.push(recriarProduto(dadosProduto));
    });
  }

  cadastrarProdutosIniciais() {
    this.adicionarProduto(new Produto('HyperX Cloud Stinger 2', 'Fone com fio e microfone.', 59.90, 'Áudio', 'imagens/hyperx.webp'));
    this.adicionarProduto(new Produto('Teclado compacto', 'Teclado para estudar e trabalhar.', 139.90, 'Acessórios', 'imagens/compacto.webp'));
    this.adicionarProduto(new Produto('Monitor 24"', 'Full HD 120hz.', 59.90, 'Casa', 'imagens/monitor24.webp'));
    this.adicionarProduto(new Produto('Mouse com fio', 'Mouse com fio RGB.', 99.90, 'Acessórios', 'imagens/mousecomfio.webp'));
    this.adicionarProduto(new Produto('Galaxy Ring', 'Anel inteligente.', 89.90, 'Vestível', 'imagens/galaxyring.webp'));
    this.adicionarProduto(new Produto('Galaxy Fit3', 'Relógio inteligente.', 159.90, 'Vestível', 'imagens/galaxyfit.jpg'));
    
    this.adicionarProduto(new Produto('Pulse 3D', 'Fone sem fio.', 59.90, 'Áudio', 'imagens/pulse3d.jpg'));
    this.adicionarProduto(new Produto('Teclado grande', 'Teclado para estudar e trabalhar.', 119.90, 'Áudio', 'imagens/grande.jpg'));
    this.adicionarProduto(new Produto('Monitor 27"', 'Quad HD 180hz.', 39.90, 'Casa', 'imagens/monitor27.webp'));
    this.adicionarProduto(new Produto('Mouse sem fio', 'Mouse bluetooth.', 89.90, 'Acessórios', 'imagens/mousesemfio.jpg'));
    this.adicionarProduto(new Produto('Monitor 32"', '4k 60hz.', 79.90, 'Casa', 'imagens/monitor32.webp'));
    this.adicionarProduto(new Produto('Apple Watch', 'Relógio inteligente premium.', 49.90, 'Vestível', 'imagens/applewatch.png'));
}
}

class ItemCarrinho {
  constructor(produto, quantidade) {
    this._produto = produto;
    this.quantidade = quantidade;
  }

  get produto() { return this._produto; }
  get quantidade() { return this._quantidade; }
  set quantidade(quantidade) {
    const numero = Number(quantidade);
    if (!Number.isInteger(numero) || numero < 1 || numero > QUANTIDADE_MAXIMA) {
      throw new Error('A quantidade deve ser um inteiro entre 1 e 99.');
    }
    this._quantidade = numero;
  }

  calcularTotal() {
    return Math.round(this.produto.preco * 100) * this.quantidade / 100;
  }
}

class Carrinho {
  constructor() {
    this._itensCarrinho = [];
    this.tipoEntrega = 'Retirada';
  }

  get itensCarrinho() { return this._itensCarrinho; }
  get tipoEntrega() { return this._tipoEntrega; }
  set tipoEntrega(tipoEntrega) {
    if (!TIPOS_ENTREGA.includes(tipoEntrega)) throw new Error('Escolha um tipo de atendimento válido.');
    this._tipoEntrega = tipoEntrega;
  }

  adicionarItemAoCarrinho(produto, quantidade = 1) {
    const novoItem = new ItemCarrinho(produto, quantidade);
    const existente = this._itensCarrinho.find((item) => item.produto.id === produto.id);
    if (existente) existente.quantidade = existente.quantidade + novoItem.quantidade;
    else this._itensCarrinho.push(novoItem);
  }

  alterarQuantidade(id, quantidade) {
    const item = this._itensCarrinho.find((item) => item.produto.id === Number(id));
    if (!item) throw new Error('Item não encontrado no carrinho.');
    item.quantidade = quantidade;
  }

  removerItemDoCarrinho(id) {
    this._itensCarrinho = this._itensCarrinho.filter((item) => item.produto.id !== Number(id));
  }

  limparCarrinho() { this._itensCarrinho = []; }

  calcularSubtotal() {
    let totalCentavos = 0;
    this._itensCarrinho.forEach((item) => {
      totalCentavos += Math.round(item.calcularTotal() * 100);
    });
    return totalCentavos / 100;
  }

  calcularEntrega() {
    if (this.tipoEntrega === 'Entrega' && this.itensCarrinho.length > 0 && this.calcularSubtotal() <= 199) return TAXA_ENTREGA;
    return 0;
  }

  calcularTotal() {
    return (Math.round(this.calcularSubtotal() * 100) + Math.round(this.calcularEntrega() * 100)) / 100;
  }

  contarItens() {
    let quantidade = 0;
    this._itensCarrinho.forEach((item) => { quantidade += item.quantidade; });
    return quantidade;
  }

  salvarNoLocalStorage() {
    const dadosItens = [];
    this._itensCarrinho.forEach((item) => {
      dadosItens.push({ produtoId: item.produto.id, quantidade: item.quantidade });
    });
    salvarDados(CHAVE_CARRINHO, { itens: dadosItens, tipoEntrega: this.tipoEntrega });
  }

  carregarDoLocalStorage(bancoProdutos) {
    const dados = lerDados(CHAVE_CARRINHO);
    this._itensCarrinho = [];
    if (dados === null) return;
    this.tipoEntrega = dados.tipoEntrega;
    dados.itens.forEach((dadosItem) => {
      const produto = bancoProdutos.buscarProdutoPorId(dadosItem.produtoId);
      if (produto) this.adicionarItemAoCarrinho(produto, dadosItem.quantidade);
    });
  }

  atualizarProdutos(bancoProdutos) {
    const itensAtualizados = [];
    this._itensCarrinho.forEach((item) => {
      const produto = bancoProdutos.buscarProdutoPorId(item.produto.id);
      if (produto) itensAtualizados.push(new ItemCarrinho(produto, item.quantidade));
    });
    this._itensCarrinho = itensAtualizados;
  }
}

class Pedido {
  constructor(nomeCliente, carrinho, tipoEntrega, endereco = '', status = 'Pendente', data = new Date(), formaPagamento = 'Não informado') {
    if (carrinho.itensCarrinho.length === 0) throw new Error('O pedido precisa ter pelo menos um item.');
    this.nomeCliente = nomeCliente;
    this.tipoEntrega = tipoEntrega;
    this.endereco = endereco;
    this.status = status;
    this.formaPagamento = formaPagamento;
    this._data = new Date(data);
    if (Number.isNaN(this._data.getTime())) throw new Error('Data do pedido inválida.');
    this._carrinho = new Carrinho();
    this._carrinho.tipoEntrega = tipoEntrega;
    carrinho.itensCarrinho.forEach((item) => {
      const produto = copiarProduto(item.produto);
      this._carrinho.adicionarItemAoCarrinho(produto, item.quantidade);
    });
  }

  get id() { return this._id; }
  set id(id) { this._id = Number(id); }
  get nomeCliente() { return this._nomeCliente; }
  set nomeCliente(nomeCliente) {
    const nome = String(nomeCliente).trim();
    if (nome === '') throw new Error('Informe o nome do cliente.');
    if (nome.length > 80) throw new Error('O nome do cliente deve ter até 80 caracteres.');
    this._nomeCliente = nome;
  }
  get tipoEntrega() { return this._tipoEntrega; }
  set tipoEntrega(tipoEntrega) {
    if (!TIPOS_ENTREGA.includes(tipoEntrega)) throw new Error('Tipo de atendimento inválido.');
    this._tipoEntrega = tipoEntrega;
  }
  get endereco() { return this._endereco; }
  set endereco(endereco) {
    const texto = String(endereco).trim();
    if (this.tipoEntrega === 'Entrega' && texto === '') throw new Error('Informe o endereço para entrega.');
    if (texto.length > 250) throw new Error('O endereço deve ter até 250 caracteres.');
    this._endereco = texto;
  }
  get status() { return this._status; }
  set status(status) {
    if (!STATUS_PEDIDOS.includes(status)) throw new Error('Selecione um status válido.');
    this._status = status;
  }
  get formaPagamento() { return this._formaPagamento; }
  set formaPagamento(formaPagamento) {
    if (!FORMAS_PAGAMENTO.includes(formaPagamento)) throw new Error('Selecione uma forma de pagamento válida.');
    this._formaPagamento = formaPagamento;
  }
  get data() { return this._data; }
  get carrinho() { return this._carrinho; }
  calcularSubtotal() { return this.carrinho.calcularSubtotal(); }
  calcularEntrega() { return this.carrinho.calcularEntrega(); }
  calcularTotal() { return this.carrinho.calcularTotal(); }
}

class BdPedidos {
  constructor() {
    this._pedidos = [];
    this.carregarDoLocalStorage();
  }

  get pedidos() { return this._pedidos; }

  getProximoId() {
    let ultimoId = Number(localStorage.getItem(CHAVE_ID_PEDIDOS)) || 0;
    this._pedidos.forEach((pedido) => {
      if (pedido.id > ultimoId) ultimoId = pedido.id;
    });
    return ultimoId + 1;
  }

  adicionarPedido(pedido) {
    pedido.id = this.getProximoId();
    const novaLista = this._pedidos.slice();
    novaLista.unshift(pedido);
    localStorage.setItem(CHAVE_ID_PEDIDOS, pedido.id);
    salvarDados(CHAVE_PEDIDOS, novaLista);
    this._pedidos = novaLista;
  }

  buscarPedidoPorId(id) {
    return this._pedidos.find((pedido) => pedido.id === Number(id));
  }

  editarPedido(id, pedidoEditado) {
    if (!this.buscarPedidoPorId(id)) throw new Error('Pedido não encontrado.');
    pedidoEditado.id = id;
    const novaLista = this._pedidos.slice();
    novaLista.forEach((pedido, indice) => {
      if (pedido.id === Number(id)) novaLista[indice] = pedidoEditado;
    });
    salvarDados(CHAVE_PEDIDOS, novaLista);
    this._pedidos = novaLista;
  }

  removerPedido(id) {
    const novaLista = this._pedidos.filter((pedido) => pedido.id !== Number(id));
    salvarDados(CHAVE_PEDIDOS, novaLista);
    this._pedidos = novaLista;
  }

  carregarDoLocalStorage() {
    const dados = lerDados(CHAVE_PEDIDOS) || [];
    if (!Array.isArray(dados)) throw new Error('Os pedidos salvos têm formato inválido.');
    this._pedidos = [];
    dados.forEach((dadosPedido) => {
      const carrinhoSalvo = new Carrinho();
      dadosPedido._carrinho._itensCarrinho.forEach((dadosItem) => {
        const produto = recriarProduto(dadosItem._produto);
        carrinhoSalvo.adicionarItemAoCarrinho(produto, dadosItem._quantidade);
      });
      const pedido = new Pedido(
        dadosPedido._nomeCliente, carrinhoSalvo, dadosPedido._tipoEntrega,
        dadosPedido._endereco, dadosPedido._status, dadosPedido._data, dadosPedido._formaPagamento
      );
      pedido.id = dadosPedido._id;
      this._pedidos.push(pedido);
    });
  }
}

let bdProdutos;
let bdPedidos;
let carrinho;
let indiceDestaque = 0;
let idProdutoEditando = null;
let idPedidoEditando = null;
let salvandoProduto = false;
let pedidoPix = null;
let prazoPix = 0;
let intervaloPix = null;
let dadosCarrinhoPix = null;

function lerDados(chave) {
  try {
    const texto = localStorage.getItem(chave);
    if (texto === null) return null;
    return JSON.parse(texto);
  } catch (erro) {
    throw new Error('Não foi possível ler os dados salvos. Verifique o armazenamento do navegador.');
  }
}

function salvarDados(chave, dados) {
  try {
    localStorage.setItem(chave, JSON.stringify(dados));
  } catch (erro) {
    throw new Error('Não foi possível salvar. O armazenamento pode estar cheio ou bloqueado.');
  }
}

function recriarProduto(dados) {
  const produto = new Produto(dados._nome, dados._descricao, dados._preco, dados._categoria, dados._imagem);
  produto.id = dados._id;
  return produto;
}

function copiarProduto(produto) {
  const copia = new Produto(produto.nome, produto.descricao, produto.preco, produto.categoria, produto.imagem);
  copia.id = produto.id;
  return copia;
}

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function mostrarMensagem(texto, erro = false) {
  const mensagem = document.getElementById('mensagem');
  mensagem.textContent = texto;
  mensagem.classList.toggle('mensagem--erro', erro);
  mensagem.hidden = false;
}

function criarBotao(texto, acao) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.textContent = texto;
  botao.addEventListener('click', acao);
  return botao;
}

function criarImagem(produto) {
  const imagem = document.createElement('img');
  imagem.src = produto.imagem;
  imagem.alt = produto.nome;
  imagem.width = 480;
  imagem.height = 320;
  if (imagem.src.endsWith('/' + IMAGEM_PADRAO)) imagem.src = gerarImagemSvgProduto(produto);
  imagem.addEventListener('error', () => {
    if (!imagem.src.endsWith('/' + IMAGEM_PADRAO)) imagem.src = gerarImagemSvgProduto(produto);
  });
  return imagem;
}

function gerarImagemSvgProduto(produto) {
    const corDeFundo = CORES_POR_CATEGORIA[produto.categoria] ?? COR_CATEGORIA_PADRAO;
  
    const letraDaCategoria = produto.categoria.charAt(0).toUpperCase();
  
    const svg = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 ${LARGURA_IMAGEM_PRODUTO} ${ALTURA_IMAGEM_PRODUTO}"
      >
        <defs>
          <linearGradient id="fundo" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="${corDeFundo}" />
            <stop offset="100%" stop-color="#111827" />
          </linearGradient>
          <pattern id="grade" width="26" height="26" patternUnits="userSpaceOnUse">
            <path d="M 26 0 L 0 0 0 26" fill="none" stroke="#ffffff" stroke-opacity="0.12" />
          </pattern>
        </defs>
        <rect
          width="${LARGURA_IMAGEM_PRODUTO}"
          height="${ALTURA_IMAGEM_PRODUTO}"
          fill="url(#fundo)"
        />
        <rect width="${LARGURA_IMAGEM_PRODUTO}" height="${ALTURA_IMAGEM_PRODUTO}" fill="url(#grade)" />
        <path d="M 0 184 L 400 115" stroke="#ffffff" stroke-opacity="0.11" stroke-width="2" />
        <text
          x="50%"
          y="52%"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="${TAMANHO_LETRA_IMAGEM}"
          font-family="Arial, sans-serif"
          font-weight="bold"
          fill="white"
        >
          ${letraDaCategoria}
        </text>
      </svg>
    `;
  
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

function mostrarEstadoVazio(container, texto) {
  const mensagem = document.createElement('p');
  mensagem.className = 'estado-vazio';
  mensagem.textContent = texto;
  container.appendChild(mensagem);
}

function atualizarContadorCarrinho() {
  document.getElementById('contadorCarrinho').textContent = carrinho.contarItens();
}

function exibirPagina(nomePagina) {
  const paginas = document.querySelectorAll('.pagina');
  paginas.forEach((pagina) => { pagina.hidden = pagina.id !== nomePagina; });
  const links = document.querySelectorAll('.link-pagina');
  links.forEach((link) => {
    if (link.dataset.pagina === nomePagina) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.getElementById(nomePagina).querySelector('h1').focus();
}

function criarNavegacaoEventListeners() {
  const links = document.querySelectorAll('.link-pagina');
  links.forEach((link) => {
    link.addEventListener('click', (evento) => {
      evento.preventDefault();
      exibirPagina(link.dataset.pagina);
    });
  });
}

function obterProdutosFiltrados() {
  const categoria = document.querySelector('input[name="categoria"]:checked').value;
  const busca = document.getElementById('buscaPorNome').value.trim().toLowerCase();
  return bdProdutos.produtos.filter((produto) => {
    const pertenceCategoria = categoria === '' || produto.categoria === categoria;
    const correspondeBusca = produto.nome.toLowerCase().includes(busca);
    return pertenceCategoria && correspondeBusca;
  });
}

function exibirCardapio() {
  const lista = document.getElementById('listaProdutos');
  lista.replaceChildren();
  const produtos = obterProdutosFiltrados();
  produtos.forEach((produto) => lista.appendChild(criarCardProduto(produto, false)));
  document.getElementById('resultadoBusca').textContent = produtos.length + ' produtos encontrados';
  if (produtos.length === 0) mostrarEstadoVazio(lista, 'Nenhum produto encontrado. Tente outra busca ou categoria.');
}

function criarCardProduto(produto, gerenciar) {
  const card = document.createElement('article');
  card.className = 'card-produto';
  const corDaCategoria = CORES_POR_CATEGORIA[produto.categoria] ?? COR_CATEGORIA_PADRAO;
  card.style.setProperty('--cor-categoria', corDaCategoria);
  const imagem = criarImagem(produto);
  const conteudo = document.createElement('div');
  conteudo.className = 'card-produto__conteudo';
  const categoria = document.createElement('span');
  categoria.className = 'categoria';
  categoria.textContent = produto.categoria;
  const nome = document.createElement('h3');
  nome.textContent = produto.nome;
  const descricao = document.createElement('p');
  descricao.className = 'descricao';
  descricao.textContent = produto.descricao;
  const preco = document.createElement('strong');
  preco.className = 'preco';
  preco.textContent = formatarMoeda(produto.preco);
  const acoes = document.createElement('div');
  acoes.className = 'acoes';
  if (gerenciar) {
    const editar = criarBotao('Editar', () => preencherFormularioProduto(produto));
    editar.setAttribute('aria-label', 'Editar ' + produto.nome);
    const excluir = criarBotao('Excluir', () => excluirProduto(produto.id));
    excluir.className = 'botao-perigo';
    excluir.setAttribute('aria-label', 'Excluir ' + produto.nome);
    acoes.append(editar, excluir);
  } else {
    const adicionar = criarBotao('+ Adicionar', () => adicionarProdutoAoCarrinho(produto.id));
    adicionar.className = 'botao-principal';
    adicionar.setAttribute('aria-label', 'Adicionar ' + produto.nome + ' ao carrinho');
    acoes.appendChild(adicionar);
  }
  conteudo.append(categoria, nome, descricao, preco, acoes);
  card.append(imagem, conteudo);
  return card;
}

function exibirDestaque() {
  const container = document.getElementById('destaque');
  container.replaceChildren();
  const produtos = bdProdutos.produtos;
  if (produtos.length === 0) {
    mostrarEstadoVazio(container, 'Cadastre um produto para exibi-lo no carrossel.');
    document.getElementById('posicaoDestaque').textContent = '0 / 0';
    document.getElementById('buttonAnterior').disabled = true;
    document.getElementById('buttonProximo').disabled = true;
    return;
  }
  if (indiceDestaque >= produtos.length) indiceDestaque = 0;
  if (indiceDestaque < 0) indiceDestaque = produtos.length - 1;
  const produto = produtos[indiceDestaque];
  const conteudo = document.createElement('div');
  conteudo.className = 'destaque__conteudo';
  const categoria = document.createElement('p');
  categoria.className = 'etiqueta';
  categoria.textContent = 'PRODUTO EM DESTAQUE / ' + produto.categoria;
  const nome = document.createElement('h2');
  nome.textContent = produto.nome;
  const descricao = document.createElement('p');
  descricao.textContent = produto.descricao;
  const preco = document.createElement('strong');
  preco.textContent = formatarMoeda(produto.preco);
  const adicionar = criarBotao('Adicionar ao carrinho', () => adicionarProdutoAoCarrinho(produto.id));
  adicionar.className = 'botao-principal';
  conteudo.append(categoria, nome, descricao, preco, adicionar);
  container.append(conteudo, criarImagem(produto));
  document.getElementById('posicaoDestaque').textContent = (indiceDestaque + 1) + ' / ' + produtos.length;
  document.getElementById('buttonAnterior').disabled = produtos.length < 2;
  document.getElementById('buttonProximo').disabled = produtos.length < 2;
}

function criarCardapioEventListeners() {
  document.getElementById('buscaPorNome').addEventListener('input', exibirCardapio);
  document.querySelectorAll('input[name="categoria"]').forEach((categoria) => {
    categoria.addEventListener('change', exibirCardapio);
  });
  document.getElementById('buttonAnterior').addEventListener('click', () => {
    indiceDestaque -= 1;
    exibirDestaque();
  });
  document.getElementById('buttonProximo').addEventListener('click', () => {
    indiceDestaque += 1;
    exibirDestaque();
  });
}

function atualizarTelas() {
  exibirCardapio();
  exibirDestaque();
  exibirCarrinho();
  exibirGerenciamento();
  exibirPedidos();
  atualizarContadorCarrinho();
}

function adicionarProdutoAoCarrinho(id) {
  try {
    const produto = bdProdutos.buscarProdutoPorId(id);
    carrinho.adicionarItemAoCarrinho(produto);
    carrinho.salvarNoLocalStorage();
    exibirCarrinho();
    atualizarContadorCarrinho();
    document.getElementById('pedidoSucesso').hidden = true;
    mostrarMensagem(produto.nome + ' adicionado ao carrinho.');
  } catch (erro) {
    carrinho.carregarDoLocalStorage(bdProdutos);
    mostrarMensagem(erro.message, true);
  }
}

function exibirCarrinho() {
  const lista = document.getElementById('listaCarrinho');
  lista.replaceChildren();
  carrinho.itensCarrinho.forEach((item) => lista.appendChild(criarCardItemCarrinho(item)));
  if (carrinho.itensCarrinho.length === 0) mostrarEstadoVazio(lista, 'Seu carrinho está vazio. Adicione um produto no carrinho.');
  atualizarResumo();
}

function criarCardItemCarrinho(item) {
  const card = document.createElement('article');
  card.className = 'item-carrinho';
  const conteudo = document.createElement('div');
  const nome = document.createElement('h3');
  nome.textContent = item.produto.nome;
  const preco = document.createElement('p');
  preco.textContent = formatarMoeda(item.produto.preco) + ' por unidade';
  const total = document.createElement('strong');
  total.textContent = 'Total: ' + formatarMoeda(item.calcularTotal());
  conteudo.append(nome, preco, total);
  const acoes = document.createElement('div');
  acoes.className = 'item-carrinho__acoes';
  const quantidade = document.createElement('div');
  quantidade.className = 'quantidade';
  const diminuir = criarBotao('−', () => alterarQuantidadeItem(item.produto.id, item.quantidade - 1));
  diminuir.setAttribute('aria-label', 'Diminuir quantidade de ' + item.produto.nome);
  diminuir.disabled = item.quantidade <= 1;
  const numero = document.createElement('span');
  numero.textContent = item.quantidade;
  const aumentar = criarBotao('+', () => alterarQuantidadeItem(item.produto.id, item.quantidade + 1));
  aumentar.setAttribute('aria-label', 'Aumentar quantidade de ' + item.produto.nome);
  aumentar.disabled = item.quantidade >= QUANTIDADE_MAXIMA;
  quantidade.append(diminuir, numero, aumentar);
  const remover = criarBotao('Remover', () => removerItemCarrinho(item.produto.id));
  remover.className = 'botao-perigo';
  remover.setAttribute('aria-label', 'Remover ' + item.produto.nome);
  acoes.append(quantidade, remover);
  card.append(criarImagem(item.produto), conteudo, acoes);
  return card;
}

function atualizarResumo() {
  document.getElementById('subtotal').textContent = formatarMoeda(carrinho.calcularSubtotal());
  document.getElementById('taxaEntrega').textContent = formatarMoeda(carrinho.calcularEntrega());
  document.getElementById('total').textContent = formatarMoeda(carrinho.calcularTotal());
  document.getElementById('tipoEntrega').value = carrinho.tipoEntrega;
  const entrega = carrinho.tipoEntrega === 'Entrega';
  document.getElementById('campoEndereco').hidden = !entrega;
  document.getElementById('enderecoCliente').required = entrega;
  const pagamento = document.getElementById('formaPagamento');
  pagamento.querySelector('[value="Pagamento na retirada"]').disabled = entrega;
  pagamento.querySelector('[value="Pix"]').disabled = !entrega;
  if (!entrega) pagamento.value = 'Pagamento na retirada';
  else if (pagamento.value !== 'Pix') pagamento.value = '';
  const vazio = carrinho.itensCarrinho.length === 0;
  document.getElementById('buttonFinalizar').disabled = vazio;
  document.getElementById('buttonLimparCarrinho').disabled = vazio;
}

function alterarQuantidadeItem(id, quantidade) {
  try {
    carrinho.alterarQuantidade(id, quantidade);
    carrinho.salvarNoLocalStorage();
    exibirCarrinho();
    atualizarContadorCarrinho();
    mostrarMensagem('Quantidade e total atualizados.');
  } catch (erro) {
    carrinho.carregarDoLocalStorage(bdProdutos);
    exibirCarrinho();
    mostrarMensagem(erro.message, true);
  }
}

function removerItemCarrinho(id) {
  const confirmado = window.confirm('Remover este item do carrinho?');
  if (!confirmado) return;
  try {
    carrinho.removerItemDoCarrinho(id);
    carrinho.salvarNoLocalStorage();
    exibirCarrinho();
    atualizarContadorCarrinho();
    mostrarMensagem('Item removido do carrinho.');
  } catch (erro) {
    carrinho.carregarDoLocalStorage(bdProdutos);
    exibirCarrinho();
    mostrarMensagem(erro.message, true);
  }
}

function limparCarrinho() {
  if (!window.confirm('Remover todos os itens do carrinho?')) return;
  try {
    carrinho.limparCarrinho();
    carrinho.salvarNoLocalStorage();
    exibirCarrinho();
    atualizarContadorCarrinho();
    mostrarMensagem('Carrinho limpo.');
  } catch (erro) {
    carrinho.carregarDoLocalStorage(bdProdutos);
    exibirCarrinho();
    mostrarMensagem(erro.message, true);
  }
}

function finalizarPedido(evento) {
  evento.preventDefault();
  if (pedidoPix) return;
  try {
    bdProdutos.carregarDoLocalStorage();
    let cardapioAlterado = false;
    carrinho.itensCarrinho.forEach((item) => {
      const atual = bdProdutos.buscarProdutoPorId(item.produto.id);
      if (!atual || atual.preco !== item.produto.preco || atual.nome !== item.produto.nome || atual.categoria !== item.produto.categoria) {
        cardapioAlterado = true;
      }
    });
    if (cardapioAlterado) {
      carrinho.atualizarProdutos(bdProdutos);
      carrinho.salvarNoLocalStorage();
      atualizarTelas();
      mostrarMensagem('O carrinho mudou. Confira os itens e valores antes de finalizar novamente.', true);
      return;
    }
    const nome = document.getElementById('nomeCliente').value;
    const endereco = document.getElementById('enderecoCliente').value;
    const pagamento = document.getElementById('formaPagamento').value;
    if (carrinho.tipoEntrega === 'Entrega' && pagamento !== 'Pix') throw new Error('Selecione Pix para entrega.');
    if (carrinho.tipoEntrega === 'Retirada' && pagamento !== 'Pagamento na retirada') throw new Error('Selecione pagamento na retirada.');
    const pedido = new Pedido(nome, carrinho, carrinho.tipoEntrega, endereco, 'Pendente', new Date(), pagamento);
    if (pagamento === 'Pix') abrirPagamentoPix(pedido);
    else registrarPedido(pedido);
  } catch (erro) { mostrarMensagem(erro.message, true); }
}

function registrarPedido(pedido) {
  bdPedidos.carregarDoLocalStorage();
  bdPedidos.adicionarPedido(pedido);
  const itensAnteriores = carrinho.itensCarrinho.slice();
  try {
    carrinho.limparCarrinho();
    carrinho.salvarNoLocalStorage();
  } catch (erro) {
    itensAnteriores.forEach((item) => carrinho.adicionarItemAoCarrinho(item.produto, item.quantidade));
    bdPedidos.removerPedido(pedido.id);
    throw erro;
  }
  document.getElementById('formFinalizarPedido').reset();
  document.getElementById('pedidoSucesso').hidden = false;
  document.getElementById('pedidoSucesso').textContent = 'Pedido #' + pedido.id + ' de ' + formatarMoeda(pedido.calcularTotal()) + ' registrado! Consulte a seção Pedidos.';
  atualizarTelas();
  mostrarMensagem('Pedido finalizado com sucesso.');
}

function abrirPagamentoPix(pedido) {
  const modal = document.getElementById('modalPagamentoPix');
  dadosCarrinhoPix = localStorage.getItem(CHAVE_CARRINHO);
  modal.showModal();
  pedidoPix = pedido;
  prazoPix = Date.now() + TEMPO_PAGAMENTO_PIX;
  document.getElementById('totalPix').textContent = formatarMoeda(pedido.calcularTotal());
  document.getElementById('estadoQrCode').hidden = false;
  document.getElementById('buttonConfirmarPagamento').disabled = true;
  const imagem = document.getElementById('qrCodePix');
  imagem.hidden = true;
  const dados = 'Pix  Volt - Total: ' + pedido.calcularTotal().toFixed(2) + ' - Validade: ' + prazoPix;
  imagem.src = API_QR_CODE + '?size=240x240&qzone=4&data=' + encodeURIComponent(dados);
  atualizarContadorPix();
  intervaloPix = window.setInterval(atualizarContadorPix, 1000);
}

function atualizarContadorPix() {
  if (!pedidoPix) return;
  const restante = Math.max(0, Math.ceil((prazoPix - Date.now()) / 1000));
  const minutos = String(Math.floor(restante / 60)).padStart(2, '0');
  const segundos = String(restante % 60).padStart(2, '0');
  document.getElementById('contadorPix').textContent = minutos + ':' + segundos;
  if (restante === 0) cancelarPagamentoPix();
}

function fecharPagamentoPix() {
  window.clearInterval(intervaloPix);
  intervaloPix = null;
  pedidoPix = null;
  prazoPix = 0;
  dadosCarrinhoPix = null;
  document.getElementById('modalPagamentoPix').close();
  document.getElementById('qrCodePix').removeAttribute('src');
  document.getElementById('buttonConfirmarPagamento').disabled = true;
}

function cancelarPagamentoPix(texto = 'Pagamento não recebido. Tente novamente ou mude a forma de pagamento.') {
  if (!pedidoPix) return;
  fecharPagamentoPix();
  document.getElementById('pedidoSucesso').hidden = true;
  exibirPagina('carrinho');
  mostrarMensagem(texto, true);
}

function confirmarPagamentoPix() {
  if (!pedidoPix) return;
  if (Date.now() >= prazoPix) {
    cancelarPagamentoPix();
    return;
  }
  document.getElementById('buttonConfirmarPagamento').disabled = true;
  try {
    bdProdutos.carregarDoLocalStorage();
    const produtosAlterados = pedidoPix.carrinho.itensCarrinho.some((item) => {
      const atual = bdProdutos.buscarProdutoPorId(item.produto.id);
      return !atual || atual.preco !== item.produto.preco || atual.nome !== item.produto.nome || atual.categoria !== item.produto.categoria;
    });
    if (produtosAlterados || localStorage.getItem(CHAVE_CARRINHO) !== dadosCarrinhoPix) {
      carrinho.carregarDoLocalStorage(bdProdutos);
      carrinho.atualizarProdutos(bdProdutos);
      carrinho.salvarNoLocalStorage();
      atualizarTelas();
      cancelarPagamentoPix('Pagamento não recebido. O carrinho mudou. Confira os itens e tente novamente.');
      return;
    }
    registrarPedido(pedidoPix);
    fecharPagamentoPix();
  } catch (erro) { cancelarPagamentoPix(erro.message + ' Pagamento não recebido. Tente novamente ou mude a forma de pagamento.'); }
}

function criarPagamentoEventListeners() {
  document.getElementById('formaPagamento').addEventListener('change', () => {
    const formulario = document.getElementById('formFinalizarPedido');
    if (document.getElementById('formaPagamento').value === 'Pix' && formulario.reportValidity()) formulario.requestSubmit();
  });
  document.getElementById('buttonCancelarPagamento').addEventListener('click', () => cancelarPagamentoPix());
  document.getElementById('buttonConfirmarPagamento').addEventListener('click', confirmarPagamentoPix);
  document.getElementById('modalPagamentoPix').addEventListener('cancel', (evento) => {
    evento.preventDefault();
    cancelarPagamentoPix();
  });
  document.getElementById('modalPagamentoPix').addEventListener('close', () => {
    if (pedidoPix && !document.getElementById('modalPagamentoPix').open) cancelarPagamentoPix();
  });
  document.getElementById('qrCodePix').addEventListener('load', () => {
    if (!pedidoPix) return;
    document.getElementById('qrCodePix').hidden = false;
    document.getElementById('estadoQrCode').hidden = true;
    document.getElementById('buttonConfirmarPagamento').disabled = false;
  });
  document.getElementById('qrCodePix').addEventListener('error', () => {
    cancelarPagamentoPix('Não foi possível carregar o QR Code. Pagamento não recebido. Tente novamente ou mude a forma de pagamento.');
  });
  document.addEventListener('visibilitychange', atualizarContadorPix);
  window.addEventListener('focus', atualizarContadorPix);
}

function criarCarrinhoEventListeners() {
  document.getElementById('buttonLimparCarrinho').addEventListener('click', limparCarrinho);
  document.getElementById('formFinalizarPedido').addEventListener('submit', finalizarPedido);
  document.getElementById('tipoEntrega').addEventListener('change', () => {
    try {
      carrinho.tipoEntrega = document.getElementById('tipoEntrega').value;
      carrinho.salvarNoLocalStorage();
      mostrarMensagem('Tipo de atendimento atualizado.');
    } catch (erro) {
      carrinho.carregarDoLocalStorage(bdProdutos);
      mostrarMensagem(erro.message, true);
    }
    atualizarResumo();
  });
}

function exibirGerenciamento() {
  const lista = document.getElementById('listaGerenciamento');
  lista.replaceChildren();
  bdProdutos.produtos.forEach((produto) => lista.appendChild(criarCardProduto(produto, true)));
  if (bdProdutos.produtos.length === 0) mostrarEstadoVazio(lista, 'Nenhum produto cadastrado. Use o formulário acima.');
}

function preencherFormularioProduto(produto) {
  idProdutoEditando = produto.id;
  document.getElementById('tituloFormularioProduto').textContent = 'Editar produto';
  document.getElementById('nomeProduto').value = produto.nome;
  document.getElementById('descricaoProduto').value = produto.descricao;
  document.getElementById('precoProduto').value = produto.preco;
  document.getElementById('categoriaProduto').value = produto.categoria;
  document.getElementById('imagemProduto').value = '';
  document.getElementById('buttonSalvarProduto').textContent = 'Salvar alterações';
  document.getElementById('buttonCancelarProduto').hidden = false;
  document.getElementById('nomeProduto').focus();
}

function limparFormularioProduto() {
  idProdutoEditando = null;
  document.getElementById('formProduto').reset();
  document.getElementById('tituloFormularioProduto').textContent = 'Cadastrar produto';
  document.getElementById('buttonSalvarProduto').textContent = 'Cadastrar produto';
  document.getElementById('buttonCancelarProduto').hidden = true;
}

function terminarSalvamentoProduto() {
  salvandoProduto = false;
  document.getElementById('buttonSalvarProduto').disabled = false;
  document.getElementById('buttonCancelarProduto').disabled = false;
}

function gravarProduto(imagem) {
  try {
    const produto = new Produto(
      document.getElementById('nomeProduto').value,
      document.getElementById('descricaoProduto').value,
      document.getElementById('precoProduto').value,
      document.getElementById('categoriaProduto').value,
      imagem
    );
    bdProdutos.carregarDoLocalStorage();
    if (idProdutoEditando === null) bdProdutos.adicionarProduto(produto);
    else bdProdutos.editarProduto(idProdutoEditando, produto);
    carrinho.atualizarProdutos(bdProdutos);
    limparFormularioProduto();
    atualizarTelas();
    mostrarMensagem('Produto salvo com sucesso.');
  } catch (erro) { mostrarMensagem(erro.message, true); }
  terminarSalvamentoProduto();
}

function salvarProduto(evento) {
  evento.preventDefault();
  if (salvandoProduto) return;
  salvandoProduto = true;
  document.getElementById('buttonSalvarProduto').disabled = true;
  document.getElementById('buttonCancelarProduto').disabled = true;
  const arquivo = document.getElementById('imagemProduto').files[0];
  let imagemAtual = IMAGEM_PADRAO;
  if (idProdutoEditando !== null) {
    const produtoAtual = bdProdutos.buscarProdutoPorId(idProdutoEditando);
    if (produtoAtual) imagemAtual = produtoAtual.imagem;
  }
  if (!arquivo) {
    gravarProduto(imagemAtual);
    return;
  }
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(arquivo.type)) {
    mostrarMensagem('Escolha uma imagem PNG, JPEG ou WebP.', true);
    terminarSalvamentoProduto();
    return;
  }
  if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) {
    mostrarMensagem('Escolha uma imagem de até 350 KB.', true);
    terminarSalvamentoProduto();
    return;
  }
  const leitor = new FileReader();
  leitor.onload = () => { gravarProduto(leitor.result); };
  leitor.onerror = () => {
    mostrarMensagem('Não foi possível ler a imagem.', true);
    terminarSalvamentoProduto();
  };
  leitor.onabort = () => {
    mostrarMensagem('A leitura da imagem foi cancelada.', true);
    terminarSalvamentoProduto();
  };
  leitor.readAsDataURL(arquivo);
}

function excluirProduto(id) {
  if (!window.confirm('Excluir este produto do carrinho? Ele também sairá do carrinho. Os pedidos antigos serão preservados.')) return;
  try {
    bdProdutos.carregarDoLocalStorage();
    bdProdutos.removerProduto(id);
    carrinho.atualizarProdutos(bdProdutos);
    carrinho.salvarNoLocalStorage();
    if (idProdutoEditando === id) limparFormularioProduto();
    atualizarTelas();
    mostrarMensagem('Produto excluído.');
  } catch (erro) { mostrarMensagem(erro.message, true); }
}

function criarGerenciamentoEventListeners() {
  document.getElementById('formProduto').addEventListener('submit', salvarProduto);
  document.getElementById('buttonCancelarProduto').addEventListener('click', limparFormularioProduto);
}

function exibirPedidos() {
  const lista = document.getElementById('listaPedidos');
  lista.replaceChildren();
  const status = document.getElementById('filtroStatus').value;
  const pedidos = bdPedidos.pedidos.filter((pedido) => status === '' || pedido.status === status);
  pedidos.forEach((pedido) => lista.appendChild(criarCardPedido(pedido)));
  if (pedidos.length === 0) mostrarEstadoVazio(lista, 'Nenhum pedido encontrado. Finalize um pedido no carrinho ou escolha outro status.');
}

function criarCardPedido(pedido) {
  const card = document.createElement('article');
  card.className = 'card-pedido';
  const numero = document.createElement('span');
  numero.className = 'categoria';
  numero.textContent = 'PEDIDO #' + pedido.id;
  const cliente = document.createElement('h3');
  cliente.textContent = pedido.nomeCliente;
  const status = document.createElement('p');
  status.className = 'status-pedido';
  status.textContent = pedido.status;
  const informacoes = document.createElement('p');
  informacoes.textContent = pedido.data.toLocaleString('pt-BR') + ' · ' + pedido.tipoEntrega;
  const pagamento = document.createElement('p');
  pagamento.textContent = 'Pagamento: ' + pedido.formaPagamento;
  card.append(numero, cliente, status, informacoes, pagamento);
  if (pedido.tipoEntrega === 'Entrega') {
    const endereco = document.createElement('p');
    endereco.textContent = 'Endereço: ' + pedido.endereco;
    card.appendChild(endereco);
  }
  const lista = document.createElement('ul');
  pedido.carrinho.itensCarrinho.forEach((item) => {
    const linha = document.createElement('li');
    linha.textContent = item.quantidade + '× ' + item.produto.nome + ' — ' + formatarMoeda(item.calcularTotal());
    lista.appendChild(linha);
  });
  const valores = document.createElement('p');
  valores.textContent = 'Subtotal: ' + formatarMoeda(pedido.calcularSubtotal()) + ' · Entrega: ' + formatarMoeda(pedido.calcularEntrega());
  const total = document.createElement('strong');
  total.className = 'preco';
  total.textContent = 'Total: ' + formatarMoeda(pedido.calcularTotal());
  const acoes = document.createElement('div');
  acoes.className = 'acoes';
  const editar = criarBotao('Editar pedido', () => preencherFormularioPedido(pedido));
  editar.setAttribute('aria-label', 'Editar pedido ' + pedido.id);
  const excluir = criarBotao('Excluir', () => excluirPedido(pedido.id));
  excluir.className = 'botao-perigo';
  excluir.setAttribute('aria-label', 'Excluir pedido ' + pedido.id);
  acoes.append(editar, excluir);
  card.append(lista, valores, total, acoes);
  return card;
}

function preencherFormularioPedido(pedido) {
  idPedidoEditando = pedido.id;
  document.getElementById('editarPedido').hidden = false;
  document.getElementById('tituloEditarPedido').textContent = 'Editar pedido #' + pedido.id;
  document.getElementById('editarNomeCliente').value = pedido.nomeCliente;
  document.getElementById('editarTipoEntrega').value = pedido.tipoEntrega;
  document.getElementById('editarEndereco').value = pedido.endereco;
  document.getElementById('editarStatus').value = pedido.status;
  document.getElementById('editarNomeCliente').focus();
}

function cancelarEdicaoPedido() {
  idPedidoEditando = null;
  document.getElementById('editarPedido').hidden = true;
}

function salvarPedidoEditado(evento) {
  evento.preventDefault();
  try {
    bdPedidos.carregarDoLocalStorage();
    const original = bdPedidos.buscarPedidoPorId(idPedidoEditando);
    if (!original) throw new Error('Esse pedido não está mais disponível.');
    const editado = new Pedido(
      document.getElementById('editarNomeCliente').value, original.carrinho,
      document.getElementById('editarTipoEntrega').value,
      document.getElementById('editarEndereco').value,
      document.getElementById('editarStatus').value, original.data, original.formaPagamento
    );
    bdPedidos.editarPedido(original.id, editado);
    cancelarEdicaoPedido();
    exibirPedidos();
    mostrarMensagem('Pedido atualizado.');
  } catch (erro) { mostrarMensagem(erro.message, true); }
}

function excluirPedido(id) {
  if (!window.confirm('Excluir definitivamente o pedido #' + id + '?')) return;
  try {
    bdPedidos.carregarDoLocalStorage();
    bdPedidos.removerPedido(id);
    if (idPedidoEditando === id) cancelarEdicaoPedido();
    exibirPedidos();
    mostrarMensagem('Pedido excluído.');
  } catch (erro) { mostrarMensagem(erro.message, true); }
}

function aplicarTema(tema) {
  document.documentElement.dataset.theme = tema;

  const buttonTema = document.getElementById('buttonTema');

  if (!buttonTema) {
    return;
  }

  buttonTema.textContent = tema === TEMA_ESCURO ? '☀ Claro' : '☾ Escuro';
}

function obterTemaSalvo() {
  const temaSalvo = localStorage.getItem(CHAVE_TEMA);

  if (temaSalvo === TEMA_ESCURO || temaSalvo === TEMA_CLARO) {
    return temaSalvo;
  }

  return null;
}

function aplicarTemaDoSistema(preferenciaTemaEscuro) {
  if (obterTemaSalvo() !== null) {
    return;
  }

  aplicarTema(preferenciaTemaEscuro.matches ? TEMA_ESCURO : TEMA_CLARO);
}

function inicializarTema() {
  const preferenciaTemaEscuro = window.matchMedia('(prefers-color-scheme: dark)');
  const temaSalvo = obterTemaSalvo();

  aplicarTema(temaSalvo ?? (preferenciaTemaEscuro.matches ? TEMA_ESCURO : TEMA_CLARO));
  preferenciaTemaEscuro.addEventListener('change', aplicarTemaDoSistema);
}

function alternarTema() {
  const temaAtual = document.documentElement.dataset.theme;
  const proximoTema = temaAtual === TEMA_ESCURO ? TEMA_CLARO : TEMA_ESCURO;

  aplicarTema(proximoTema);
  localStorage.setItem(CHAVE_TEMA, proximoTema);
}

function criarTemaEventListener() {
  const buttonTema = document.getElementById('buttonTema');

  if (!buttonTema) {
    return;
  }

  buttonTema.addEventListener('click', alternarTema);
}

function assinarNewsletter(evento) {
  evento.preventDefault();

  const inputEmail = document.getElementById('emailNewsletter');
  const mensagem = document.getElementById('mensagemNewsletter');

  if (!inputEmail || !mensagem) {
    return;
  }

  if (!inputEmail.checkValidity()) {
    inputEmail.reportValidity();
    return;
  }

  const email = inputEmail.value.trim().toLowerCase();

  const emailsSalvos = JSON.parse(
    localStorage.getItem(CHAVE_NEWSLETTER) ?? '[]'
  );

  const emailJaCadastrado = emailsSalvos.includes(email);

  if (emailJaCadastrado) {
    mensagem.textContent = 'Esse e-mail já está na lista.';
    return;
  }

  emailsSalvos.push(email);

  localStorage.setItem(CHAVE_NEWSLETTER, JSON.stringify(emailsSalvos));

  mensagem.textContent = 'Obrigado! Você receberá o cupom em seu e-mail.';

  inputEmail.value = '';
}

function criarNewsletterEventListener() {
  const formNewsletter = document.getElementById('formNewsletter');

  if (!formNewsletter) {
    return;
  }

  formNewsletter.addEventListener('submit', assinarNewsletter);
}

function criarPedidosEventListeners() {
  document.getElementById('filtroStatus').addEventListener('change', exibirPedidos);
  document.getElementById('formEditarPedido').addEventListener('submit', salvarPedidoEditado);
  document.getElementById('buttonCancelarPedido').addEventListener('click', cancelarEdicaoPedido);
}

function criarArmazenamentoEventListener() {
  window.addEventListener('storage', (evento) => {
    if (evento.key !== CHAVE_PRODUTOS && evento.key !== CHAVE_CARRINHO && evento.key !== CHAVE_PEDIDOS && evento.key !== null) return;
    try {
      bdProdutos.carregarDoLocalStorage();
      bdPedidos.carregarDoLocalStorage();
      carrinho.carregarDoLocalStorage(bdProdutos);
      atualizarTelas();
      if (pedidoPix && evento.key !== CHAVE_PEDIDOS) {
        cancelarPagamentoPix('Pagamento não recebido. Os dados mudaram em outra aba. Confira o carrinho e tente novamente.');
      } else mostrarMensagem('Dados atualizados a partir de outra aba.');
    } catch (erro) { mostrarMensagem(erro.message, true); }
  });
}

function inicializarAplicacao() {
  try {
    bdProdutos = new BdProdutos();
    bdPedidos = new BdPedidos();
    carrinho = new Carrinho();
    carrinho.carregarDoLocalStorage(bdProdutos);
    inicializarTema();
    criarNewsletterEventListener();
    criarNavegacaoEventListeners();
    criarCardapioEventListeners();
    criarCarrinhoEventListeners();
    criarPagamentoEventListeners();
    criarGerenciamentoEventListeners();
    criarPedidosEventListeners();
    criarArmazenamentoEventListener();
    criarTemaEventListener();
    atualizarTelas();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
    document.getElementById('aplicacao').hidden = true;
  }
}

document.addEventListener('DOMContentLoaded', inicializarAplicacao);
