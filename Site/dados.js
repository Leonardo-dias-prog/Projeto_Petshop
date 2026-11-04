/* dados.js - ÚNICO arquivo que mexe com armazenamento.
   Hoje usa o localStorage do navegador. Quando a API/MySQL do seu amigo estiver pronta,
   troque o conteúdo das funções abaixo por fetch() e as páginas continuam iguais. */
const FRETE = 12;
// [arquivo (sem .png), nome, preço, preço assinante (opcional)] - preços de exemplo, edite aqui
const PRODUTOS = [
  ["racao-special-dog","Special Dog Adultos Premium",39.90,28.80],["racao-golden-gatos","Ração gato castrado",32.90,23.80],
  ["racao-carpas","Ração para carpas",14.90],["racao-golden-gatos2","Ração gato castrado (2)",34.90],
  ["milbemax","Milbemax para cães",29.90],["inflamatorio","Anti-inflamatório para cães",24.90],["spray","Spray antipulgas",27.90],
  ["biscrok","Sachê Especial Dog Ultralife",5.90],["churu","Petisco Churu",19.90,13.80],["petisco-carne","Petisco de carne",12.90],
  ["good-times","Petisco Good Times",18.90],["caixa-transporte","Caixa de transporte",89.90],["bolsa-gato","Bolsa de Gato",119.90],
  ["peitoral","Peitoral",39.90],["sacos","Sacos de coleta",9.90],["bola","Brinquedo bola elétrica",20.90,15.50],
  ["macaco","Pelúcia de brinquedo",16.90],["playground","Playground para gato",149.90],["ratinhos","Ratinhos de brinquedo",8.90]
].map(([id, nome, preco, a]) => ({ id, nome, preco, assin: a || +(preco * 0.72).toFixed(2), img: "imagens/" + id + ".png" }));
const prod = id => PRODUTOS.find(p => p.id === id);
const moeda = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const ler = (k, padrao) => { try { return JSON.parse(localStorage.getItem("hp:" + k)) ?? padrao; } catch (e) { return padrao; } };
const salvar = (k, v) => localStorage.setItem("hp:" + k, JSON.stringify(v));

// Favoritos
const getFavoritos = () => ler("favoritos", []);
function toggleFavorito(id) { const f = getFavoritos(); const i = f.indexOf(id); i < 0 ? f.push(id) : f.splice(i, 1); salvar("favoritos", f); }

// Carrinho: lista de { id, qtd }
const getCarrinho = () => ler("carrinho", []);
function addCarrinho(id, qtd = 1) { const c = getCarrinho(); const i = c.find(x => x.id === id); i ? i.qtd += qtd : c.push({ id, qtd }); salvar("carrinho", c); }
function setQtd(id, qtd) { const c = getCarrinho(); const i = c.find(x => x.id === id); if (i && qtd >= 1) i.qtd = qtd; salvar("carrinho", c); }
const removerCarrinho = id => salvar("carrinho", getCarrinho().filter(x => x.id !== id));

// Usuários (senha guardada como hash SHA-256, nunca em texto puro)
async function hash(s) {
  const c = globalThis.crypto;
  if (!c || !c.subtle) return "x" + s;
  const b = await c.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
}
function usuarioAtual() { const id = ler("sessao", null); const u = id && ler("usuarios", {})[id]; return u ? { id, nome: u.nome } : null; }
async function cadastrar(nome, id, senha) {
  id = id.trim().toLowerCase(); const us = ler("usuarios", {});
  if (!nome.trim() || !id || senha.length < 4) return "Preencha nome, e-mail/CPF/CNPJ e uma senha de pelo menos 4 caracteres.";
  if (us[id]) return "Esse usuário já está cadastrado.";
  us[id] = { nome: nome.trim(), hash: await hash(senha) }; salvar("usuarios", us); salvar("sessao", id); return true;
}
async function entrar(id, senha) {
  id = id.trim().toLowerCase(); const u = ler("usuarios", {})[id];
  if (!u || u.hash !== await hash(senha)) return "Usuário ou senha incorretos.";
  salvar("sessao", id); return true;
}
const sair = () => localStorage.removeItem("hp:sessao");

// Pedidos (ligados ao usuário logado)
const proximoPedido = () => (ler("contador", 876)) + 1;
const getPedidos = () => { const u = usuarioAtual(); return u ? ler("pedidos:" + u.id, []) : []; };
function criarPedido(pagamento) {
  const u = usuarioAtual(), c = getCarrinho(); if (!u || !c.length) return null;
  const itens = c.map(i => ({ nome: prod(i.id).nome, preco: prod(i.id).preco, qtd: i.qtd }));
  const subtotal = itens.reduce((s, i) => s + i.preco * i.qtd, 0);
  const ped = { numero: proximoPedido(), itens, subtotal, frete: FRETE, total: subtotal + FRETE, pagamento, criadoEm: Date.now() };
  salvar("contador", ped.numero); salvar("pedidos:" + u.id, [...getPedidos(), ped]); salvar("carrinho", []); return ped;
}
// Rastreio simulado: o pedido avança uma etapa a cada 2 minutos (etapa 1 = pagamento já feito)
const etapaDoPedido = p => Math.min(5, 1 + Math.floor((Date.now() - p.criadoEm) / 60000));
