import './style.css'
import { products } from './products'

const app = document.querySelector<HTMLDivElement>('#app')!

const PHONE = '5491158685179'
const socials = {
  instagram: 'https://www.instagram.com/fragancias_de_lo_alto/',
  facebook: 'https://www.facebook.com/search/top?q=fragancias%20de%20lo%20alto',
  tiktok: 'https://www.tiktok.com/@fragancias_de_lo_alto_quimica'
}

type Cart = Record<number, number>
let cart: Cart = {}
try {
  cart = JSON.parse(localStorage.getItem('fragancias-cart') || '{}')
} catch {
  cart = {}
}

let category = 'todos'
let search = ''

const totalItems = () => Object.values(cart).reduce((a, b) => a + b, 0)

function saveCart() {
  localStorage.setItem('fragancias-cart', JSON.stringify(cart))
}

function productCard(p: typeof products[number]) {
  const qty = cart[p.id] || 0
  return `
    <article class="product-card">
      <div class="product-photo">
        <img src="/images/${p.file}" alt="Artículo número ${p.id}" loading="lazy">
        <span class="number-tag">ARTÍCULO NRO. ${p.id}</span>
        ${qty ? `<span class="selected-tag">${qty} en carrito</span>` : ''}
      </div>
      <div class="product-info">
        <span class="product-category">${p.category === 'limpieza' ? 'LIMPIEZA' : 'BAZAR'}</span>
        <h3>Artículo NRO. ${p.id}</h3>
        <div class="product-actions">
          <button class="add-button" data-add="${p.id}">
            ${qty ? '＋ AGREGAR MÁS' : '＋ AGREGAR AL CARRITO'}
          </button>
          ${qty ? `<div class="quantity-control">
            <button data-minus="${p.id}" aria-label="Quitar una unidad">−</button>
            <strong>${qty}</strong>
            <button data-add="${p.id}" aria-label="Agregar una unidad">+</button>
          </div>` : ''}
        </div>
      </div>
    </article>`
}

function renderProducts() {
  const filtered = products.filter(p => {
    const categoryMatch = category === 'todos' || p.category === category
    const searchMatch = `articulo ${p.id} ${p.file}`.toLowerCase().includes(search.toLowerCase())
    return categoryMatch && searchMatch
  })
  const grid = document.querySelector('#product-grid')
  if (!grid) return
  grid.innerHTML = filtered.length
    ? filtered.map(productCard).join('')
    : '<div class="empty-state">No encontramos artículos con esa búsqueda.</div>'
  const count = document.querySelector('#result-count')
  if (count) count.textContent = `${filtered.length} artículos disponibles`
}

function renderCart() {
  const count = document.querySelector('#cart-count')
  if (count) count.textContent = String(totalItems())

  const list = document.querySelector('#cart-list')
  const total = document.querySelector('#cart-total')
  if (!list || !total) return

  const selected = products.filter(p => (cart[p.id] || 0) > 0)
  list.innerHTML = selected.length ? selected.map(p => `
    <div class="cart-line">
      <img src="/images/${p.file}" alt="">
      <div class="cart-line-info">
        <strong>Artículo NRO. ${p.id}</strong>
        <small>${p.category === 'limpieza' ? 'Limpieza' : 'Bazar'}</small>
      </div>
      <div class="quantity-control">
        <button data-minus="${p.id}">−</button>
        <strong>${cart[p.id]}</strong>
        <button data-add="${p.id}">+</button>
      </div>
    </div>`).join('') :
    '<div class="empty-cart">🛍️<br>Tu carrito está vacío.<br>¡Descubrí nuestros productos!</div>'

  total.textContent = `${totalItems()} unidades`
  saveCart()
}

function updateCart(id: number, delta: number) {
  cart[id] = Math.max(0, (cart[id] || 0) + delta)
  if (!cart[id]) delete cart[id]
  renderProducts()
  renderCart()
}

function openWhatsApp() {
  const selected = products.filter(p => cart[p.id] > 0)
  if (!selected.length) {
    alert('Primero agregá artículos a tu carrito.')
    return
  }

  const lines = selected.map(p =>
    `• ARTÍCULO NRO. ${p.id} — ${cart[p.id]} unidad(es)`
  ).join('\n')

  const message =
`¡Hola! Quiero realizar un pedido a FRAGANCIAS DE LO ALTO.

${lines}

TOTAL: ${totalItems()} unidades.

Quisiera consultar disponibilidad y coordinar la entrega.

Muchas gracias!`

  window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`, '_blank')
}

app.innerHTML = `
  <header class="top-header">
    <img class="main-logo" src="/images/logo-principal.jpg" alt="Fragancias de lo Alto">
    <div class="header-strip">
      <span>✨ CALIDAD · VARIEDAD · ATENCIÓN PERSONALIZADA</span>
      <a href="https://wa.me/${PHONE}" target="_blank">CONSULTAS POR WHATSAPP ↗</a>
    </div>
  </header>

  <nav class="main-nav">
    <a href="#inicio" class="brand-mini">FRAGANCIAS <b>DE LO ALTO</b></a>
    <div class="nav-links">
      <a href="#limpieza">Limpieza</a>
      <a href="#bazar">Bazar</a>
      <a href="#regaleria">Regalería</a>
    </div>
    <button class="cart-button" id="open-cart">🛒 <span id="cart-count">0</span></button>
  </nav>

  <main id="inicio">
    <section class="hero">
      <div class="hero-content">
        <span class="eyebrow">BIENVENIDOS A NUESTRA TIENDA</span>
        <h1>Todo lo que buscás.<br><em>En un solo lugar.</em></h1>
        <p>Limpieza, bazar y mucho más. Descubrí nuestra variedad de productos y armá tu pedido desde el celular.</p>
        <a class="hero-cta" href="#catalogo">EXPLORAR PRODUCTOS <span>→</span></a>
        <div class="hero-points">
          <span>✓ Comprá fácilmente</span>
          <span>✓ Atención por WhatsApp</span>
        </div>
      </div>
      <div class="hero-decoration">
        <div class="hero-orbit"></div>
        <div class="hero-symbol">✦</div>
        <div class="hero-caption">TU HOGAR<br><b>MERECE LO MEJOR</b></div>
      </div>
    </section>

    <section class="benefits">
      <div><span>✦</span><strong>GRAN VARIEDAD</strong><small>Muchas opciones para elegir</small></div>
      <div><span>♡</span><strong>ATENCIÓN PERSONAL</strong><small>Estamos para ayudarte</small></div>
      <div><span>⌂</span><strong>COMPRA FÁCIL</strong><small>Tu pedido por WhatsApp</small></div>
    </section>

    <section class="category-section" id="limpieza">
      <div class="category-copy cleaning-copy">
        <span class="eyebrow">CUIDADO PARA CADA ESPACIO</span>
        <h2>Un hogar limpio.<br><em>Una sensación única.</em></h2>
        <p>Encontrá productos para la limpieza diaria, el cuidado de tus prendas y esos aromas que hacen que cada ambiente se sienta especial.</p>
        <button class="category-cta" data-category="limpieza">VER ARTÍCULOS DE LIMPIEZA →</button>
      </div>
      <div class="category-art cleaning-art">
        <span class="art-spark">✦</span>
        <span class="art-word">FRESCURA</span>
        <span class="art-sub">CUIDADO · LIMPIEZA · BIENESTAR</span>
      </div>
    </section>

    <section class="category-section reverse" id="bazar">
      <div class="category-copy bazaar-copy">
        <span class="eyebrow">DETALLES QUE HACEN LA DIFERENCIA</span>
        <h2>Tu casa, tu estilo.<br><em>Tu lugar favorito.</em></h2>
        <p>Descubrí artículos de bazar, accesorios y soluciones prácticas para acompañarte todos los días. Siempre hay algo nuevo para encontrar.</p>
        <button class="category-cta" data-category="bazar">DESCUBRIR EL BAZAR →</button>
      </div>
      <div class="category-art bazaar-art">
        <span class="art-spark">✧</span>
        <span class="art-word">INSPIRACIÓN</span>
        <span class="art-sub">HOGAR · COCINA · DETALLES</span>
      </div>
    </section>

    <section class="gift-section" id="regaleria">
      <div class="gift-content">
        <span class="eyebrow">MUY PRONTO</span>
        <h2>Regalos para<br><em>momentos especiales.</em></h2>
        <p>Estamos preparando una selección de artículos de regalería para sorprender, compartir y disfrutar.</p>
        <a href="https://wa.me/${PHONE}?text=${encodeURIComponent('Hola, quisiera consultar por los próximos productos de regalería.')}" target="_blank">CONSULTAR POR WHATSAPP ↗</a>
      </div>
      <div class="gift-decoration">♡<span>REGALERÍA</span>✦</div>
    </section>

    <section class="catalog-section" id="catalogo">
      <div class="section-heading">
        <span class="eyebrow">ELEGÍ TUS FAVORITOS</span>
        <h2>Nuestro <em>catálogo</em></h2>
        <p>Seleccioná los artículos que necesitás y agregalos a tu carrito.</p>
      </div>
      <div class="catalog-tools">
        <div class="filters">
          <button class="filter active" data-filter="todos">Todos</button>
          <button class="filter" data-filter="limpieza">Limpieza</button>
          <button class="filter" data-filter="bazar">Bazar</button>
        </div>
        <input id="search" type="search" placeholder="Buscar por número de artículo...">
      </div>
      <div class="result-count" id="result-count"></div>
      <div class="product-grid" id="product-grid"></div>
    </section>

    <section class="closing-banner">
      <span>✨</span>
      <h2>Tu próximo pedido<br>empieza acá.</h2>
      <p>Elegí tus productos y enviá tu lista directamente por WhatsApp.</p>
      <button id="closing-cart">ARMAR MI PEDIDO →</button>
    </section>
  </main>

  <footer>
    <img src="/images/logo-principal.jpg" alt="Fragancias de lo Alto">
    <h3>FRAGANCIAS DE LO ALTO</h3>
    <p>Limpieza · Bazar · Regalería</p>
    <div class="social-links">
      <a href="${socials.instagram}" target="_blank">Instagram</a>
      <a href="${socials.facebook}" target="_blank">Facebook</a>
      <a href="${socials.tiktok}" target="_blank">TikTok</a>
      <a href="https://wa.me/${PHONE}" target="_blank">WhatsApp</a>
    </div>
    <p class="address">📍 Cachi 801 · Pompeya · CABA</p>
    <small>© ${new Date().getFullYear()} Fragancias de lo Alto. Todos los derechos reservados.</small>
  </footer>

  <button class="floating-cart" id="floating-cart">🛒 <span id="floating-count">0</span></button>
  <a class="floating-whatsapp" href="https://wa.me/${PHONE}" target="_blank" aria-label="WhatsApp">◉</a>

  <div class="cart-overlay" id="cart-overlay"></div>
  <aside class="cart-drawer" id="cart-drawer">
    <div class="cart-header">
      <div><span class="eyebrow">TU SELECCIÓN</span><h2>Mi carrito 🛒</h2></div>
      <button id="close-cart" aria-label="Cerrar">✕</button>
    </div>
    <div id="cart-list" class="cart-list"></div>
    <div class="cart-footer">
      <div class="cart-total"><span>Total de unidades</span><strong id="cart-total">0 unidades</strong></div>
      <p>Los precios y la disponibilidad se confirman por WhatsApp.</p>
      <button id="checkout">ENVIAR PEDIDO POR WHATSAPP ↗</button>
      <button class="continue-shopping" id="continue-shopping">SEGUIR COMPRANDO</button>
    </div>
  </aside>
`

function showCart() {
  document.querySelector('#cart-drawer')?.classList.add('visible')
  document.querySelector('#cart-overlay')?.classList.add('visible')
}
function hideCart() {
  document.querySelector('#cart-drawer')?.classList.remove('visible')
  document.querySelector('#cart-overlay')?.classList.remove('visible')
}

document.addEventListener('click', e => {
  const target = e.target as HTMLElement
  const add = target.closest<HTMLElement>('[data-add]')
  const minus = target.closest<HTMLElement>('[data-minus]')
  const filter = target.closest<HTMLElement>('[data-filter]')
  const categoryButton = target.closest<HTMLElement>('[data-category]')

  if (add) updateCart(Number(add.dataset.add), 1)
  if (minus) updateCart(Number(minus.dataset.minus), -1)

  if (filter) {
    category = filter.dataset.filter || 'todos'
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'))
    filter.classList.add('active')
    renderProducts()
  }

  if (categoryButton) {
    category = categoryButton.dataset.category || 'todos'
    document.querySelectorAll('.filter').forEach(b => {
      b.classList.toggle('active', (b as HTMLElement).dataset.filter === category)
    })
    renderProducts()
    document.querySelector('#catalogo')?.scrollIntoView({ behavior: 'smooth' })
  }
})

document.querySelector<HTMLInputElement>('#search')?.addEventListener('input', e => {
  search = (e.target as HTMLInputElement).value
  renderProducts()
})

document.querySelector('#open-cart')?.addEventListener('click', showCart)
document.querySelector('#floating-cart')?.addEventListener('click', showCart)
document.querySelector('#closing-cart')?.addEventListener('click', showCart)
document.querySelector('#close-cart')?.addEventListener('click', hideCart)
document.querySelector('#continue-shopping')?.addEventListener('click', hideCart)
document.querySelector('#cart-overlay')?.addEventListener('click', hideCart)
document.querySelector('#checkout')?.addEventListener('click', openWhatsApp)

function refreshCounters() {
  const value = String(totalItems())
  const floating = document.querySelector('#floating-count')
  if (floating) floating.textContent = value
  const header = document.querySelector('#cart-count')
  if (header) header.textContent = value
}

renderProducts()
renderCart()
refreshCounters()
