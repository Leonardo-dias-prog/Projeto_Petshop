/* loja.js - liga os produtos da página inicial aos favoritos e ao carrinho */
const estilo = document.createElement("style");
estilo.textContent = ".fav{cursor:pointer}.add-carrinho{margin-top:6px;border:0;border-radius:8px;background:var(--azul);color:#fff;padding:5px 8px;cursor:pointer;font-family:'Lilita One',Arial;font-size:13px}";
document.head.appendChild(estilo);
document.querySelectorAll(".produto").forEach(el => {
  const id = el.querySelector("img").getAttribute("src").split("/").pop().replace(".png", "").toLowerCase();
  const estrela = el.querySelector(".fav");
  const pintar = () => estrela.textContent = getFavoritos().includes(id) ? "★" : "☆";
  pintar();
  estrela.onclick = () => { toggleFavorito(id); pintar(); };
  const b = document.createElement("button");
  b.className = "add-carrinho"; b.textContent = "🛒 Adicionar";
  b.onclick = () => { addCarrinho(id); b.textContent = "✔ No carrinho"; setTimeout(() => b.textContent = "🛒 Adicionar", 1200); };
  el.appendChild(b);
});
