import { supabase } from './supabase'

type Category = {
  id: string
  name: string
  sort_order: number
  is_active: boolean
}

type Product = {
  id: string
  article_number: number
  name: string
  description: string
  price: number | null
  image_path: string
  category_id: string
  sort_order: number
  is_active: boolean
  ask_fragrances: boolean
}

const css = `
#admin-panel{min-height:100vh;background:#111522;color:#f5f2ec;padding:18px;font-family:Arial,sans-serif}
#admin-panel *{box-sizing:border-box}
.ad-wrap{max-width:1100px;margin:auto}
.ad-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:22px}
.ad-head h1{font-size:23px;margin:0 0 6px}
.ad-muted{color:#b9c1d0}
.ad-card{background:#1c2334;border:1px solid #39445b;border-radius:13px;padding:18px;margin-bottom:18px}
.ad-card h2{font-size:19px;margin:0 0 16px}
.ad-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
.ad-field label{display:block;margin:10px 0 6px;font-size:14px}
.ad-field input,.ad-field textarea,.ad-field select{width:100%;padding:12px;border-radius:8px;border:1px solid #59647a;background:#101624;color:white;font-size:15px}
.ad-field textarea{min-height:75px;resize:vertical}
.ad-check{display:flex;align-items:center;gap:9px;margin:15px 0}
.ad-check input{width:18px;height:18px}
.ad-btn{padding:11px 15px;border:0;border-radius:8px;background:#c5a66b;color:#171717;font-weight:bold;cursor:pointer}
.ad-btn.secondary{background:#39445b;color:white}
.ad-btn.danger{background:#8f3e48;color:white}
.ad-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.ad-status{color:#f0c879;min-height:22px;line-height:1.4}
.ad-products{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px}
.ad-product{background:#141b2a;border:1px solid #39445b;border-radius:10px;padding:12px;min-width:0}
.ad-product img{width:100%;height:155px;object-fit:contain;background:#fff;border-radius:7px}
.ad-product h3{font-size:16px;margin:10px 0 5px}
.ad-product p{font-size:13px;color:#bdc5d2;margin:5px 0;overflow-wrap:anywhere}
.ad-tag{font-size:12px;color:#d9bd86}
.ad-category{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid #39445b}
.ad-toplink{color:#c5a66b}
@media(max-width:480px){#admin-panel{padding:12px}.ad-card{padding:14px}.ad-head h1{font-size:20px}}
`

export async function initAdmin(root: HTMLElement) {
  root.innerHTML = `<style>${css}</style><section id="admin-panel"><div id="admin-view" class="ad-wrap"></div></section>`
  const view = root.querySelector<HTMLDivElement>('#admin-view')!

  let categories: Category[] = []
  let products: Product[] = []

  const esc = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char] ?? char))

  const status = (message: string) => {
    const el = view.querySelector<HTMLElement>('#ad-status')
    if (el) el.textContent = message
  }

  function login(message = '') {
    view.innerHTML = `
      <div class="ad-card" style="max-width:460px;margin:55px auto">
        <h1>Fragancias de lo Alto</h1>
        <p class="ad-muted">Administración privada de la tienda</p>
        <form id="ad-login">
          <div class="ad-field"><label>Correo electrónico</label>
            <input id="ad-email" type="email" autocomplete="username" required></div>
          <div class="ad-field"><label>Contraseña</label>
            <input id="ad-password" type="password" autocomplete="current-password" required></div>
          <button class="ad-btn" style="width:100%;margin-top:18px">INGRESAR</button>
        </form>
        <p id="ad-status" class="ad-status">${esc(message)}</p>
        <a class="ad-toplink" href="/">Volver a la tienda</a>
      </div>`

    view.querySelector('#ad-login')!.addEventListener('submit', async event => {
      event.preventDefault()
      const email = view.querySelector<HTMLInputElement>('#ad-email')!.value.trim()
      const password = view.querySelector<HTMLInputElement>('#ad-password')!.value
      status('Verificando acceso...')

      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error || !data.user) {
        status(error?.message || 'No se pudo iniciar sesión.')
        return
      }
      await verifyRole(data.user.id)
    })
  }

  async function verifyRole(userId: string) {
    const { data, error } = await supabase.from('user_roles')
      .select('role').eq('user_id', userId).maybeSingle()

    if (error || !data || !['owner', 'admin'].includes(data.role)) {
      await supabase.auth.signOut()
      login('Esta cuenta no tiene permisos de administración.')
      return
    }
    await dashboard(data.role)
  }

  async function loadData() {
    const [catResult, productResult] = await Promise.all([
      supabase.from('categories')
        .select('id,name,sort_order,is_active')
        .order('sort_order'),
      supabase.from('products')
        .select('id,article_number,name,description,price,image_path,category_id,sort_order,is_active,ask_fragrances')
        .order('sort_order')
    ])
    if (catResult.error) throw catResult.error
    if (productResult.error) throw productResult.error
    categories = (catResult.data || []) as Category[]
    products = (productResult.data || []) as Product[]
  }

  function categoryOptions(selected = '') {
    return categories.map(c =>
      `<option value="${c.id}" ${c.id === selected ? 'selected' : ''}>${esc(c.name)}${c.is_active ? '' : ' (inactiva)'}</option>`
    ).join('')
  }

  function productCards() {
    if (!products.length) return '<p class="ad-muted">Todavía no hay productos.</p>'
    return products.map(p => {
      const image = supabase.storage.from('catalogo').getPublicUrl(p.image_path).data.publicUrl
      const cat = categories.find(c => c.id === p.category_id)?.name || 'Sin categoría'
      return `
        <article class="ad-product">
          <img src="${esc(image)}" alt="Artículo ${p.article_number}">
          <span class="ad-tag">ARTÍCULO ${p.article_number} · ${esc(cat)}</span>
          <h3>${esc(p.name || 'Producto sin nombre')}</h3>
          <p>${esc(p.description)}</p>
          <p><strong>${p.price == null ? 'Precio a consultar' : '$ ' + Number(p.price).toLocaleString('es-AR')}</strong></p>
          <p>${p.is_active ? '✓ Visible en la tienda' : '⏸ Oculto de la tienda'}</p>
          ${p.ask_fragrances ? '<p>Consulta de fragancia requerida</p>' : ''}
          <div class="ad-actions">
            <button class="ad-btn" data-edit="${p.id}">EDITAR</button>
            <button class="ad-btn secondary" data-toggle="${p.id}">${p.is_active ? 'DESACTIVAR' : 'ACTIVAR'}</button>
            <button class="ad-btn danger" data-delete="${p.id}">ELIMINAR</button>
          </div>
        </article>`
    }).join('')
  }

  function renderDashboard(role: string) {
    view.innerHTML = `
      <header class="ad-head">
        <div><h1>Panel de administración</h1><span class="ad-muted">Fragancias de lo Alto · ${esc(role)}</span></div>
        <button id="ad-logout" class="ad-btn secondary">CERRAR SESIÓN</button>
      </header>

      <section class="ad-card">
        <h2 id="ad-form-title">Agregar producto</h2>
        <form id="ad-product-form">
          <input type="hidden" id="ad-product-id">
          <div class="ad-grid">
            <div class="ad-field"><label>Número de artículo</label><input id="ad-number" type="number" min="1" required></div>
            <div class="ad-field"><label>Nombre del producto</label><input id="ad-name" type="text"></div>
            <div class="ad-field"><label>Precio (dejar vacío si se consulta)</label><input id="ad-price" type="number" min="0" step="0.01"></div>
            <div class="ad-field"><label>Categoría</label><select id="ad-category" required>${categoryOptions()}</select></div>
            <div class="ad-field"><label>Orden de aparición</label><input id="ad-order" type="number" value="0"></div>
            <div class="ad-field"><label>Fotografía ${products.length ? '(opcional al editar)' : ''}</label><input id="ad-image" type="file" accept="image/*"></div>
          </div>
          <div class="ad-field"><label>Descripción</label><textarea id="ad-description"></textarea></div>
          <label class="ad-check"><input id="ad-active" type="checkbox" checked> Producto visible en la tienda</label>
          <label class="ad-check"><input id="ad-fragrance" type="checkbox"> Consultar fragancia por WhatsApp</label>
          <div class="ad-actions">
            <button class="ad-btn" type="submit">GUARDAR PRODUCTO</button>
            <button class="ad-btn secondary" type="button" id="ad-cancel">LIMPIAR FORMULARIO</button>
          </div>
          <p id="ad-status" class="ad-status"></p>
        </form>
      </section>

      <section class="ad-card">
        <h2>Categorías</h2>
        <form id="ad-category-form" class="ad-grid">
          <div class="ad-field"><label>Nueva categoría</label><input id="ad-category-name" required placeholder="Nombre de categoría"></div>
          <div class="ad-field"><label>Orden</label><input id="ad-category-order" type="number" value="${categories.length + 1}"></div>
          <div style="align-self:end"><button class="ad-btn">AGREGAR CATEGORÍA</button></div>
        </form>
        <div id="ad-categories">
          ${categories.map(c => `
            <div class="ad-category">
              <span>${esc(c.name)} · ${c.is_active ? 'Activa' : 'Inactiva'}</span>
              <button class="ad-btn secondary" data-category-toggle="${c.id}">${c.is_active ? 'DESACTIVAR' : 'ACTIVAR'}</button>
            </div>`).join('')}
        </div>
      </section>

      <section class="ad-card">
        <h2>Catálogo completo (${products.length} productos)</h2>
        <div class="ad-field"><label>Buscar por número o nombre</label><input id="ad-search" type="search" placeholder="Buscar producto..."></div>
        <div id="ad-products" class="ad-products">${productCards()}</div>
      </section>
      <p><a class="ad-toplink" href="/">← Volver a la tienda</a></p>
    `

    view.querySelector('#ad-logout')!.addEventListener('click', async () => {
      await supabase.auth.signOut()
      login('Sesión cerrada.')
    })

    view.querySelector('#ad-product-form')!.addEventListener('submit', saveProduct)
    view.querySelector('#ad-cancel')!.addEventListener('click', () => {
      ;(view.querySelector('#ad-product-form') as HTMLFormElement).reset()
      ;(view.querySelector<HTMLInputElement>('#ad-product-id')!).value = ''
      ;(view.querySelector<HTMLInputElement>('#ad-order')!).value = '0'
      view.querySelector('#ad-form-title')!.textContent = 'Agregar producto'
      status('')
    })

    view.querySelector('#ad-category-form')!.addEventListener('submit', addCategory)

    view.querySelector('#ad-products')!.addEventListener('click', async event => {
      const target = event.target as HTMLElement
      const edit = target.closest<HTMLElement>('[data-edit]')
      const toggle = target.closest<HTMLElement>('[data-toggle]')
      const remove = target.closest<HTMLElement>('[data-delete]')

      if (edit) editProduct(edit.dataset.edit!)
      if (toggle) await toggleProduct(toggle.dataset.toggle!)
      if (remove) await deleteProduct(remove.dataset.delete!)
    })

    view.querySelector('#ad-categories')!.addEventListener('click', async event => {
      const button = (event.target as HTMLElement).closest<HTMLElement>('[data-category-toggle]')
      if (button) await toggleCategory(button.dataset.categoryToggle!)
    })

    view.querySelector<HTMLInputElement>('#ad-search')!.addEventListener('input', event => {
      const term = (event.target as HTMLInputElement).value.toLowerCase()
      const filtered = products.filter(p =>
        String(p.article_number).includes(term) || p.name.toLowerCase().includes(term)
      )
      view.querySelector('#ad-products')!.innerHTML = filtered.length
        ? filtered.map(p => {
            const image = supabase.storage.from('catalogo').getPublicUrl(p.image_path).data.publicUrl
            const cat = categories.find(c => c.id === p.category_id)?.name || 'Sin categoría'
            return `<article class="ad-product">
              <img src="${esc(image)}" alt="Artículo ${p.article_number}">
              <span class="ad-tag">ARTÍCULO ${p.article_number} · ${esc(cat)}</span>
              <h3>${esc(p.name || 'Producto sin nombre')}</h3>
              <p>${esc(p.description)}</p>
              <p><strong>${p.price == null ? 'Precio a consultar' : '$ ' + Number(p.price).toLocaleString('es-AR')}</strong></p>
              <p>${p.is_active ? '✓ Visible en la tienda' : '⏸ Oculto de la tienda'}</p>
              <div class="ad-actions">
                <button class="ad-btn" data-edit="${p.id}">EDITAR</button>
                <button class="ad-btn secondary" data-toggle="${p.id}">${p.is_active ? 'DESACTIVAR' : 'ACTIVAR'}</button>
                <button class="ad-btn danger" data-delete="${p.id}">ELIMINAR</button>
              </div>
            </article>`
          }).join('')
        : '<p class="ad-muted">No se encontraron productos.</p>'
    })
  }

  async function dashboard(role: string) {
    view.innerHTML = '<div class="ad-card">Cargando catálogo...</div>'
    try {
      await loadData()
      renderDashboard(role)
    } catch (error) {
      view.innerHTML = `<div class="ad-card"><p>Error al cargar datos: ${esc((error as Error).message)}</p><button id="ad-retry" class="ad-btn">REINTENTAR</button></div>`
      view.querySelector('#ad-retry')?.addEventListener('click', () => dashboard(role))
    }
  }

  function editProduct(id: string) {
    const p = products.find(item => item.id === id)
    if (!p) return
    ;(view.querySelector<HTMLInputElement>('#ad-product-id')!).value = p.id
    ;(view.querySelector<HTMLInputElement>('#ad-number')!).value = String(p.article_number)
    ;(view.querySelector<HTMLInputElement>('#ad-name')!).value = p.name || ''
    ;(view.querySelector<HTMLInputElement>('#ad-price')!).value = p.price == null ? '' : String(p.price)
    ;(view.querySelector<HTMLSelectElement>('#ad-category')!).innerHTML = categoryOptions(p.category_id)
    ;(view.querySelector<HTMLInputElement>('#ad-order')!).value = String(p.sort_order)
    ;(view.querySelector<HTMLTextAreaElement>('#ad-description')!).value = p.description || ''
    ;(view.querySelector<HTMLInputElement>('#ad-active')!).checked = p.is_active
    ;(view.querySelector<HTMLInputElement>('#ad-fragrance')!).checked = p.ask_fragrances
    view.querySelector('#ad-form-title')!.textContent = `Editar artículo ${p.article_number}`
    view.querySelector('#ad-product-form')?.scrollIntoView({ behavior: 'smooth' })
    status('Editando producto. Si no elegís otra foto, se conserva la actual.')
  }

  async function saveProduct(event: Event) {
    event.preventDefault()
    const id = (view.querySelector<HTMLInputElement>('#ad-product-id')!).value
    const articleNumber = Number((view.querySelector<HTMLInputElement>('#ad-number')!).value)
    const categoryId = (view.querySelector<HTMLSelectElement>('#ad-category')!).value
    const file = (view.querySelector<HTMLInputElement>('#ad-image')!).files?.[0]

    if (!categoryId) return status('Primero necesitás crear una categoría.')
    if (!Number.isInteger(articleNumber) || articleNumber < 1) return status('Ingresá un número de artículo válido.')

    const existing = products.find(p => p.id === id)
    let imagePath = existing?.image_path || ''

    status('Guardando producto...')
    try {
      if (file) {
        if (!file.type.startsWith('image/')) throw new Error('El archivo seleccionado no es una imagen.')
        const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]/g, '-')
        const newPath = `products/${Date.now()}-${safeName}`
        const { error: uploadError } = await supabase.storage.from('catalogo')
          .upload(newPath, file, { contentType: file.type, upsert: false })
        if (uploadError) throw uploadError
        imagePath = newPath
      }
      if (!imagePath) throw new Error('Seleccioná una fotografía para el producto.')

      const payload = {
        article_number: articleNumber,
        name: (view.querySelector<HTMLInputElement>('#ad-name')!).value.trim(),
        description: (view.querySelector<HTMLTextAreaElement>('#ad-description')!).value.trim(),
        price: (view.querySelector<HTMLInputElement>('#ad-price')!).value === ''
          ? null : Number((view.querySelector<HTMLInputElement>('#ad-price')!).value),
        category_id: categoryId,
        sort_order: Number((view.querySelector<HTMLInputElement>('#ad-order')!).value) || 0,
        is_active: (view.querySelector<HTMLInputElement>('#ad-active')!).checked,
        ask_fragrances: (view.querySelector<HTMLInputElement>('#ad-fragrance')!).checked,
        image_path: imagePath
      }

      const result = id
        ? await supabase.from('products').update(payload).eq('id', id)
        : await supabase.from('products').insert(payload)

      if (result.error) {
        if (file) await supabase.storage.from('catalogo').remove([imagePath])
        throw result.error
      }

      if (file && existing?.image_path) {
        await supabase.storage.from('catalogo').remove([existing.image_path])
      }

      await dashboard('admin')
      status('Producto guardado correctamente.')
    } catch (error) {
      status('No se pudo guardar: ' + (error as Error).message)
    }
  }

  async function toggleProduct(id: string) {
    const p = products.find(item => item.id === id)
    if (!p) return
    const { error } = await supabase.from('products').update({ is_active: !p.is_active }).eq('id', id)
    if (error) return status('Error: ' + error.message)
    await dashboard('admin')
  }

  async function deleteProduct(id: string) {
    const p = products.find(item => item.id === id)
    if (!p || !confirm(`¿Eliminar definitivamente el artículo ${p.article_number}?`)) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return status('No se pudo eliminar: ' + error.message)
    await supabase.storage.from('catalogo').remove([p.image_path])
    await dashboard('admin')
    status('Producto eliminado.')
  }

  async function addCategory(event: Event) {
    event.preventDefault()
    const name = (view.querySelector<HTMLInputElement>('#ad-category-name')!).value.trim()
    const order = Number((view.querySelector<HTMLInputElement>('#ad-category-order')!).value) || 0
    if (!name) return
    const { error } = await supabase.from('categories').insert({
      name, sort_order: order, is_active: true
    })
    if (error) return status('No se pudo crear la categoría: ' + error.message)
    await dashboard('admin')
    status('Categoría creada.')
  }

  async function toggleCategory(id: string) {
    const category = categories.find(c => c.id === id)
    if (!category) return
    const { error } = await supabase.from('categories')
      .update({ is_active: !category.is_active }).eq('id', id)
    if (error) return status('No se pudo actualizar: ' + error.message)
    await dashboard('admin')
  }

  const { data, error } = await supabase.auth.getSession()
  if (error) {
    login('No se pudo verificar la sesión: ' + error.message)
  } else if (data.session?.user) {
    await verifyRole(data.session.user.id)
  } else {
    login()
  }
}
