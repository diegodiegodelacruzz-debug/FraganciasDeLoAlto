import './style.css'
import { createClient } from "@supabase/supabase-js"
import { products } from './products'

const app = document.querySelector<HTMLDivElement>('#app')!

const PHONE = '5491158685179'
const socials = {
  instagram: 'https://www.instagram.com/fragancias_de_lo_alto/',
  facebook: 'https://www.facebook.com/share/1Dz4Xs7AgN/',
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
        ${p.file.startsWith('desodorante-piso') ? '<span class="fragrance-tag">CONSULTAR FRAGANCIAS</span>' : ''}
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

// RECUPERACIÓN DE CONTRASEÑA SUPABASE
const recoveryClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      detectSessionInUrl: false,
      persistSession: true,
      autoRefreshToken: true
    }
  }
)

const RECOVERY_EMAIL = 'diegodiegodelacruzz@gmail.com'

function showRecovery(mode: 'password' | 'expired' | 'success') {
  let panel = document.querySelector<HTMLDivElement>('#supabase-recovery')

  if (!panel) {
    panel = document.createElement('div')
    panel.id = 'supabase-recovery'
    document.body.appendChild(panel)
  }

  panel.style.cssText = `
    position:fixed;inset:0;z-index:99999;
    background:rgba(10,12,20,.94);
    display:flex;align-items:center;justify-content:center;
    padding:20px;font-family:Arial,sans-serif;
  `

  panel.innerHTML = `
    <div style="background:#fff;color:#222;width:100%;max-width:430px;
      padding:30px;border-radius:18px;box-sizing:border-box">
      <h2 style="margin-top:0;color:#171b2b">Fragancias De Lo Alto</h2>
      <div id="recovery-content"></div>
      <p id="recovery-status" style="font-size:14px;line-height:1.5"></p>
    </div>
  `

  const content = panel.querySelector<HTMLDivElement>('#recovery-content')!
  const status = panel.querySelector<HTMLParagraphElement>('#recovery-status')!

  if (mode === 'expired') {
    content.innerHTML = `
      <h3>El enlace venció</h3>
      <p>El enlace de recuperación ya no es válido. Podés solicitar uno nuevo.</p>
      <button id="resend-recovery" style="width:100%;padding:14px;
        background:#202b48;color:white;border:0;border-radius:8px">
        ENVIAR NUEVO ENLACE
      </button>
    `

    content.querySelector('#resend-recovery')?.addEventListener('click', async () => {
      status.textContent = 'Enviando correo...'
      const { error } = await recoveryClient.auth.resetPasswordForEmail(
        RECOVERY_EMAIL,
        { redirectTo: window.location.origin + '/' }
      )
      status.textContent = error
        ? 'Error: ' + error.message
        : 'Correo enviado. Abrí el enlace más reciente para continuar.'
    })
    return
  }

  if (mode === 'success') {
    content.innerHTML = `
      <h3>Contraseña actualizada</h3>
      <p>Tu contraseña se guardó correctamente. Ya podés continuar.</p>
      <button id="finish-recovery" style="width:100%;padding:14px;
        background:#202b48;color:white;border:0;border-radius:8px">
        VOLVER A LA TIENDA
      </button>
    `
    content.querySelector('#finish-recovery')?.addEventListener('click', () => {
      panel?.remove()
      history.replaceState(null, '', window.location.pathname)
    })
    return
  }

  content.innerHTML = `
    <h3>Crear nueva contraseña</h3>
    <p>Ingresá tu nueva contraseña para acceder a la administración.</p>
    <form id="recovery-form">
      <label style="display:block;margin:14px 0 6px">Nueva contraseña</label>
      <input id="new-password" type="password" minlength="8"
        autocomplete="new-password" required
        style="width:100%;padding:13px;box-sizing:border-box;border:1px solid #ccc;border-radius:8px">
      <label style="display:block;margin:14px 0 6px">Repetir contraseña</label>
      <input id="confirm-password" type="password" minlength="8"
        autocomplete="new-password" required
        style="width:100%;padding:13px;box-sizing:border-box;border:1px solid #ccc;border-radius:8px">
      <button type="submit" style="width:100%;padding:14px;margin-top:18px;
        background:#202b48;color:white;border:0;border-radius:8px">
        GUARDAR CONTRASEÑA
      </button>
    </form>
  `

  content.querySelector<HTMLFormElement>('#recovery-form')!
    .addEventListener('submit', async event => {
      event.preventDefault()

      const password = content.querySelector<HTMLInputElement>('#new-password')!.value
      const confirm = content.querySelector<HTMLInputElement>('#confirm-password')!.value

      if (password.length < 8) {
        status.textContent = 'La contraseña debe tener al menos 8 caracteres.'
        return
      }

      if (password !== confirm) {
        status.textContent = 'Las contraseñas no coinciden.'
        return
      }

      status.textContent = 'Guardando contraseña...'

      const { error } = await recoveryClient.auth.updateUser({ password })

      if (error) {
        status.textContent = 'No se pudo actualizar: ' + error.message
        return
      }

      showRecovery('success')
    })
}


async function initializeRecovery() {
  const params = new URLSearchParams(
    window.location.hash.replace(/^#/, '')
  );

  const errorCode = params.get('error_code');
  const authError = params.get('error');

  if (errorCode || authError) {
    showRecovery('expired');
    return;
  }

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const recoveryType = params.get('type');

  const code = new URLSearchParams(window.location.search).get('code');

  if (recoveryType !== 'recovery' && !code) return;

  showRecovery('password');

  const status = document.querySelector<HTMLParagraphElement>(
    '#supabase-recovery #recovery-status'
  );

  if (status) status.textContent = 'Validando enlace de recuperación...';

  let error = null;

  if (recoveryType === 'recovery' && accessToken && refreshToken) {
    const result = await recoveryClient.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    error = result.error;
  } else if (code) {
    const result = await recoveryClient.auth.exchangeCodeForSession(code);
    error = result.error;
  } else {
    showRecovery('expired');
    return;
  }

  if (error) {
    showRecovery('expired');
    const message = document.querySelector<HTMLParagraphElement>(
      '#supabase-recovery #recovery-status'
    );
    if (message) message.textContent = 'No se pudo validar el enlace: ' + error.message;
    return;
  }

  history.replaceState(null, '', window.location.pathname);

  const finalStatus = document.querySelector<HTMLParagraphElement>(
    '#supabase-recovery #recovery-status'
  );
  if (finalStatus) finalStatus.textContent = '';
}

initializeRecovery().catch(error => {
  console.error('Error de recuperación:', error);
  showRecovery('expired');
  const status = document.querySelector<HTMLParagraphElement>(
    '#supabase-recovery #recovery-status'
  );
  if (status) status.textContent = 'Error inesperado: ' + String(error);
});
