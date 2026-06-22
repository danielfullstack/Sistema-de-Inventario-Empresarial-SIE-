import './style.css'
import { renderAlmacenes, renderAlmacenRows } from './components/almacenesView.js'
import { renderAuditFilterOptions, renderAuditoria, renderAuditoriaRows, renderAuditoriaSummaryCards } from './components/auditoriaView.js'
import { renderLogin } from './components/loginView.js'
import { renderDashboard, renderDashboardLowStock, renderDashboardMetrics, renderDashboardMovements, renderDashboardOrders } from './components/dashboardView.js'
import { renderCategorias, renderCategoriaRows, renderParentOptions } from './components/categoriasView.js'
import { renderKardex, renderKardexProductOptions, renderKardexRows, renderKardexSummaryCards, renderKardexWarehouseOptions } from './components/kardexView.js'
import { getMovimientoSummary, renderMovimientoAlmacenOptions, renderMovimientoProductoOptions, renderMovimientoRows, renderMovimientos, renderMovimientoSummaryCards } from './components/movimientosView.js'
import { renderOrdenCompraHistory, renderOrdenCompraRows, renderOrdenDetalleFormRow, renderOrdenesCompra, renderProveedorOrdenOptions } from './components/ordenesCompraView.js'
import { renderCategoriaOptions, renderProductoRows, renderProductos } from './components/productosView.js'
import { renderProveedorRows, renderProveedores } from './components/proveedoresView.js'
import { renderComprasProveedorRows, renderMovimientosFechaRows, renderProductosUsadosRows, renderReportes, renderReporteSummaryCards, renderStockActualRows, renderStockBajoRows } from './components/reportesView.js'
import { getStockSummary, renderStock, renderStockAlmacenOptions, renderStockRows, renderStockSummaryCards } from './components/stockView.js'
import { renderAlmacenOptions, renderUbicacionRows, renderUbicaciones } from './components/ubicacionesView.js'
import { renderUsuarioRows, renderUsuarios, renderUsuarioSummaryCards } from './components/usuariosView.js'
import { createAlmacen, deleteAlmacen, getAlmacenes, reactivateAlmacen, updateAlmacen } from './services/almacenService.js'
import { getAuditorias } from './services/auditoriaService.js'
import { login, logout } from './services/authService.js'
import { createCategoria, deleteCategoria, getCategorias, reactivateCategoria, updateCategoria } from './services/categoriaService.js'
import { getDashboardData } from './services/dashboardService.js'
import { downloadExport } from './services/exportService.js'
import { getKardexByProducto } from './services/kardexService.js'
import { createMovimiento, getMovimientos, getMovimientosByAlmacen, getMovimientosByProducto } from './services/movimientoService.js'
import { createOrdenCompra, getOrdenCompra, getOrdenesCompra, getOrdenesCompraByEstado, getOrdenesCompraByProveedor, updateOrdenCompraEstado } from './services/ordenCompraService.js'
import { createProducto, deleteProducto, getProductos, getProductosByCategoria, reactivateProducto, updateProducto } from './services/productoService.js'
import { createProveedor, deleteProveedor, getProveedores, reactivateProveedor, updateProveedor } from './services/proveedorService.js'
import { getReportes } from './services/reporteService.js'
import { canAccessPath, getUsuario, saveUsuario, clearUsuario } from './services/sessionService.js'
import { getStock, getStockByAlmacen } from './services/stockService.js'
import { createUbicacion, deleteUbicacion, getUbicaciones, getUbicacionesByAlmacen, reactivateUbicacion, updateUbicacion } from './services/ubicacionService.js'
import { createUsuario, deleteUsuario, getUsuarios, reactivateUsuario, updateUsuario, updateUsuarioEstado } from './services/usuarioService.js'
import { validateLogin } from './utils/validators.js'

const app = document.querySelector('#app')
let categoriasState = []
let productosState = []
let productosBaseState = []
let almacenesState = []
let ubicacionesState = []
let stockState = []
let kardexState = []
let movimientosState = []
let proveedoresState = []
let ordenesCompraState = []
let usuariosState = []
let auditoriasState = []

function redirectTo(path) {
  window.history.pushState({}, '', path)
  renderApp()
}

function setStatus(message, type = 'info') {
  const statusMessage = document.querySelector('[data-status-message]')

  if (!statusMessage) {
    return
  }

  statusMessage.textContent = message
  statusMessage.dataset.type = type
}

async function handleExport(moduleName, format, params = {}, setModuleStatus = setStatus) {
  try {
    setModuleStatus(`Generando ${format === 'pdf' ? 'PDF' : 'Excel'}...`, 'info')
    await downloadExport(moduleName, format, params)
    setModuleStatus('Exportacion generada correctamente.', 'success')
  } catch (error) {
    setModuleStatus(error.message, 'error')
  }
}

function renderFieldErrors(errors) {
  document.querySelectorAll('[data-error-for]').forEach((element) => {
    const field = element.dataset.errorFor
    element.textContent = errors[field] || ''
  })
}

function setupLogin() {
  const form = document.querySelector('[data-login-form]')
  const submitButton = document.querySelector('[data-submit-button]')

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const formData = new FormData(form)
    const payload = {
      correo: String(formData.get('correo') || '').trim(),
      password: String(formData.get('password') || '').trim()
    }
    const errors = validateLogin(payload)

    renderFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      setStatus('Revisa los datos marcados antes de continuar.', 'error')
      return
    }

    submitButton.disabled = true
    setStatus('Validando credenciales...', 'info')

    try {
      const data = await login(payload)

      if (data.success !== true) {
        throw new Error(data.message || 'No se pudo iniciar sesion.')
      }

      saveUsuario(data.usuario, data.token)
      redirectTo('/dashboard')
    } catch (error) {
      setStatus(error.message, 'error')
    } finally {
      submitButton.disabled = false
    }
  })
}

function setupAuthenticatedNavigation() {
  const logoutButton = document.querySelector('[data-logout-button]')

  logoutButton.addEventListener('click', async () => {
    await logout()
    clearUsuario()
    redirectTo('/')
  })

  document.querySelectorAll('a[href^="/"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault()
      redirectTo(link.getAttribute('href'))
    })
  })
}

function setDashboardStatus(message, type = 'info') {
  const status = document.querySelector('[data-dashboard-status]')

  if (!status) {
    return
  }

  status.textContent = message
  status.dataset.type = type
}

function renderDashboardData(data) {
  const metrics = document.querySelector('[data-dashboard-metrics]')
  const movements = document.querySelector('[data-dashboard-movements]')
  const orders = document.querySelector('[data-dashboard-orders]')
  const lowStock = document.querySelector('[data-dashboard-low-stock]')

  if (metrics) {
    metrics.innerHTML = renderDashboardMetrics(data.summary || {})
  }

  if (movements) {
    movements.innerHTML = renderDashboardMovements(data.recentMovements || [])
  }

  if (orders) {
    orders.innerHTML = renderDashboardOrders(data.recentOrders || [])
  }

  if (lowStock) {
    lowStock.innerHTML = renderDashboardLowStock(data.lowStock || [])
  }
}

async function setupDashboard() {
  setupAuthenticatedNavigation()
  setDashboardStatus('Cargando indicadores...', 'info')

  try {
    const data = await getDashboardData()
    renderDashboardData(data)
    setDashboardStatus('Indicadores actualizados.', 'success')
  } catch (error) {
    setDashboardStatus(error.message, 'error')
  }
}

function setCategoryStatus(message, type = 'info') {
  const status = document.querySelector('[data-category-status]')

  if (!status) {
    return
  }

  status.textContent = message
  status.dataset.type = type
}

function setCategoryFormStatus(message, type = 'info') {
  const status = document.querySelector('[data-category-form-status]')

  if (!status) {
    return
  }

  status.textContent = message
  status.dataset.type = type
}

function getCategoryById(idCategoria) {
  return categoriasState.find((categoria) => categoria.id_categoria === Number(idCategoria))
}

function renderCategoryTable(categorias = categoriasState) {
  const tbody = document.querySelector('[data-category-table-body]')

  if (!tbody) {
    return
  }

  tbody.innerHTML = renderCategoriaRows(categorias)
}

function filterCategories(searchTerm) {
  const normalizedSearch = searchTerm.trim().toLowerCase()

  if (!normalizedSearch) {
    renderCategoryTable()
    return
  }

  renderCategoryTable(
    categoriasState.filter((categoria) =>
      categoria.nombre.toLowerCase().includes(normalizedSearch)
    )
  )
}

async function loadCategories() {
  setCategoryStatus('Cargando categorias...', 'info')
  const estado = document.querySelector('[data-category-status-filter]')?.value || 'activo'
  categoriasState = await getCategorias(estado)
  renderCategoryTable()
  setCategoryStatus(`${categoriasState.length} categorias registradas.`, 'success')
}

function openCategoryModal(categoria = null) {
  const modal = document.querySelector('[data-category-modal]')
  const form = document.querySelector('[data-category-form]')
  const title = document.querySelector('[data-category-modal-title]')
  const parentSelect = document.querySelector('[data-category-parent]')
  const currentId = categoria?.id_categoria || null
  const selectedParentId = categoria?.id_categoria_padre || null

  form.reset()
  form.elements.id_categoria.value = currentId || ''
  form.elements.nombre.value = categoria?.nombre || ''
  form.elements.descripcion.value = categoria?.descripcion || ''
  parentSelect.innerHTML = renderParentOptions(categoriasState, currentId, selectedParentId)
  title.textContent = categoria ? 'Editar Categoria' : 'Nueva Categoria'
  setCategoryFormStatus('', 'info')
  document.querySelector('[data-category-error="nombre"]').textContent = ''
  modal.hidden = false
  form.elements.nombre.focus()
}

function closeCategoryModal() {
  const modal = document.querySelector('[data-category-modal]')

  modal.hidden = true
}

function getCategoryPayload(form) {
  const formData = new FormData(form)
  const idCategoriaPadre = String(formData.get('id_categoria_padre') || '').trim()

  return {
    nombre: String(formData.get('nombre') || '').trim(),
    descripcion: String(formData.get('descripcion') || '').trim(),
    id_categoria_padre: idCategoriaPadre || null
  }
}

async function handleCategorySubmit(event) {
  event.preventDefault()

  const form = event.currentTarget
  const saveButton = document.querySelector('[data-save-category]')
  const idCategoria = form.elements.id_categoria.value
  const payload = getCategoryPayload(form)
  const nameError = document.querySelector('[data-category-error="nombre"]')

  nameError.textContent = ''

  if (!payload.nombre) {
    nameError.textContent = 'El nombre de la categoria es obligatorio.'
    return
  }

  saveButton.disabled = true
  setCategoryFormStatus('Guardando categoria...', 'info')

  try {
    if (idCategoria) {
      await updateCategoria(idCategoria, payload)
      setCategoryStatus('Categoria actualizada correctamente.', 'success')
    } else {
      await createCategoria(payload)
      setCategoryStatus('Categoria creada correctamente.', 'success')
    }

    closeCategoryModal()
    await loadCategories()
  } catch (error) {
    setCategoryFormStatus(error.message, 'error')
  } finally {
    saveButton.disabled = false
  }
}

async function handleCategoryTableClick(event) {
  const editButton = event.target.closest('[data-edit-category]')
  const deleteButton = event.target.closest('[data-delete-category]')
  const reactivateButton = event.target.closest('[data-reactivate-category]')

  if (editButton) {
    openCategoryModal(getCategoryById(editButton.dataset.editCategory))
    return
  }

  if (reactivateButton) {
    const categoria = getCategoryById(reactivateButton.dataset.reactivateCategory)

    if (!categoria || !window.confirm(`¿Reactivar la categoria "${categoria.nombre}"?`)) {
      return
    }

    try {
      await reactivateCategoria(categoria.id_categoria)
      await loadCategories()
      setCategoryStatus('Categoria reactivada correctamente.', 'success')
    } catch (error) {
      setCategoryStatus(error.message, 'error')
    }

    return
  }

  if (!deleteButton) {
    return
  }

  const categoria = getCategoryById(deleteButton.dataset.deleteCategory)

  if (!categoria) {
    return
  }

  const confirmed = window.confirm(`¿Desactivar la categoria "${categoria.nombre}"?`)

  if (!confirmed) {
    return
  }

  try {
    await deleteCategoria(categoria.id_categoria)
    await loadCategories()
    setCategoryStatus('Categoria desactivada correctamente.', 'success')
  } catch (error) {
    setCategoryStatus(error.message, 'error')
  }
}

async function setupCategorias() {
  setupAuthenticatedNavigation()

  document.querySelector('[data-open-category-modal]').addEventListener('click', () => {
    openCategoryModal()
  })
  document.querySelectorAll('[data-close-category-modal]').forEach((button) => {
    button.addEventListener('click', closeCategoryModal)
  })
  document.querySelector('[data-category-form]').addEventListener('submit', handleCategorySubmit)
  document.querySelector('[data-category-table-body]').addEventListener('click', handleCategoryTableClick)
  document.querySelector('[data-category-search]').addEventListener('input', (event) => {
    filterCategories(event.target.value)
  })
  document.querySelector('[data-category-status-filter]').addEventListener('change', async () => {
    try {
      await loadCategories()
      filterCategories(document.querySelector('[data-category-search]').value)
    } catch (error) {
      setCategoryStatus(error.message, 'error')
      renderCategoryTable([])
    }
  })

  try {
    await loadCategories()
  } catch (error) {
    setCategoryStatus(error.message, 'error')
    renderCategoryTable([])
  }
}

function setProductStatus(message, type = 'info') {
  const status = document.querySelector('[data-product-status]')

  if (!status) {
    return
  }

  status.textContent = message
  status.dataset.type = type
}

function setProductFormStatus(message, type = 'info') {
  const status = document.querySelector('[data-product-form-status]')

  if (!status) {
    return
  }

  status.textContent = message
  status.dataset.type = type
}

function getProductById(idProducto) {
  return productosState.find((producto) => producto.id_producto === Number(idProducto))
}

function renderProductTable(productos = productosState) {
  const tbody = document.querySelector('[data-product-table-body]')

  if (!tbody) {
    return
  }

  tbody.innerHTML = renderProductoRows(productos)
}

function filterProducts(searchTerm) {
  const normalizedSearch = searchTerm.trim().toLowerCase()

  if (!normalizedSearch) {
    renderProductTable(productosState)
    return
  }

  renderProductTable(
    productosState.filter((producto) =>
      producto.codigo_producto.toLowerCase().includes(normalizedSearch) ||
      producto.nombre.toLowerCase().includes(normalizedSearch)
    )
  )
}

async function loadProductCategories() {
  categoriasState = await getCategorias('activo')
  const filter = document.querySelector('[data-product-category-filter]')

  if (filter) {
    filter.innerHTML = renderCategoriaOptions(categoriasState, null, true)
  }
}

async function loadProducts(idCategoria = '') {
  setProductStatus('Cargando productos...', 'info')
  const estado = document.querySelector('[data-product-status-filter]')?.value || 'activo'
  productosBaseState = idCategoria ? await getProductosByCategoria(idCategoria, estado) : await getProductos(estado)
  productosState = productosBaseState
  renderProductTable()
  setProductStatus(`${productosState.length} productos registrados.`, 'success')
}

function clearProductErrors() {
  document.querySelectorAll('[data-product-error]').forEach((element) => {
    element.textContent = ''
  })
}

function openProductModal(producto = null) {
  const modal = document.querySelector('[data-product-modal]')
  const form = document.querySelector('[data-product-form]')
  const title = document.querySelector('[data-product-modal-title]')
  const categorySelect = document.querySelector('[data-product-category]')

  form.reset()
  form.elements.id_producto.value = producto?.id_producto || ''
  form.elements.codigo_producto.value = producto?.codigo_producto || ''
  form.elements.nombre.value = producto?.nombre || ''
  form.elements.descripcion.value = producto?.descripcion || ''
  form.elements.precio_unitario.value = producto?.precio_unitario || ''
  form.elements.unidad_medida.value = producto?.unidad_medida || ''
  form.elements.stock_minimo.value = producto?.stock_minimo ?? 0
  form.elements.stock_maximo.value = producto?.stock_maximo ?? 0
  form.elements.estado.value = String(producto?.estado || 'activo').toLowerCase()
  categorySelect.innerHTML = renderCategoriaOptions(categoriasState, producto?.id_categoria || null)
  title.textContent = producto ? 'Editar Producto' : 'Nuevo Producto'
  clearProductErrors()
  setProductFormStatus('', 'info')
  modal.hidden = false
  form.elements.codigo_producto.focus()
}

function closeProductModal() {
  document.querySelector('[data-product-modal]').hidden = true
}

function getProductPayload(form) {
  const formData = new FormData(form)

  return {
    codigo_producto: String(formData.get('codigo_producto') || '').trim(),
    nombre: String(formData.get('nombre') || '').trim(),
    descripcion: String(formData.get('descripcion') || '').trim(),
    precio_unitario: String(formData.get('precio_unitario') || '').trim(),
    unidad_medida: String(formData.get('unidad_medida') || '').trim(),
    stock_minimo: String(formData.get('stock_minimo') || '0').trim(),
    stock_maximo: String(formData.get('stock_maximo') || '0').trim(),
    id_categoria: String(formData.get('id_categoria') || '').trim(),
    estado: String(formData.get('estado') || 'activo').trim()
  }
}

function validateProductPayload(payload) {
  const errors = {}
  const precio = Number(payload.precio_unitario)
  const stockMinimo = Number(payload.stock_minimo)
  const stockMaximo = Number(payload.stock_maximo)

  if (!payload.codigo_producto) {
    errors.codigo_producto = 'El codigo es obligatorio.'
  }

  if (!payload.nombre) {
    errors.nombre = 'El nombre es obligatorio.'
  }

  if (!payload.precio_unitario || !Number.isFinite(precio) || precio < 0) {
    errors.precio_unitario = 'Ingresa un precio valido.'
  }

  if (!payload.id_categoria) {
    errors.id_categoria = 'Selecciona una categoria.'
  }

  if (!Number.isInteger(stockMinimo) || stockMinimo < 0) {
    errors.stock_minimo = 'Stock minimo invalido.'
  }

  if (!Number.isInteger(stockMaximo) || stockMaximo < stockMinimo) {
    errors.stock_maximo = 'Stock maximo invalido.'
  }

  return errors
}

function renderProductErrors(errors) {
  clearProductErrors()

  Object.entries(errors).forEach(([field, message]) => {
    const element = document.querySelector(`[data-product-error="${field}"]`)

    if (element) {
      element.textContent = message
    }
  })
}

async function handleProductSubmit(event) {
  event.preventDefault()

  const form = event.currentTarget
  const saveButton = document.querySelector('[data-save-product]')
  const idProducto = form.elements.id_producto.value
  const payload = getProductPayload(form)
  const errors = validateProductPayload(payload)

  renderProductErrors(errors)

  if (Object.keys(errors).length > 0) {
    return
  }

  saveButton.disabled = true
  setProductFormStatus('Guardando producto...', 'info')

  try {
    if (idProducto) {
      await updateProducto(idProducto, payload)
      setProductStatus('Producto actualizado correctamente.', 'success')
    } else {
      await createProducto(payload)
      setProductStatus('Producto creado correctamente.', 'success')
    }

    closeProductModal()
    await loadProducts(document.querySelector('[data-product-category-filter]').value)
    filterProducts(document.querySelector('[data-product-search]').value)
  } catch (error) {
    setProductFormStatus(error.message, 'error')
  } finally {
    saveButton.disabled = false
  }
}

async function handleProductTableClick(event) {
  const editButton = event.target.closest('[data-edit-product]')
  const deleteButton = event.target.closest('[data-delete-product]')
  const reactivateButton = event.target.closest('[data-reactivate-product]')

  if (editButton) {
    openProductModal(getProductById(editButton.dataset.editProduct))
    return
  }

  if (reactivateButton) {
    const producto = getProductById(reactivateButton.dataset.reactivateProduct)

    if (!producto || !window.confirm(`¿Reactivar el producto "${producto.nombre}"?`)) {
      return
    }

    try {
      await reactivateProducto(producto.id_producto)
      await loadProducts(document.querySelector('[data-product-category-filter]').value)
      setProductStatus('Producto reactivado correctamente.', 'success')
    } catch (error) {
      setProductStatus(error.message, 'error')
    }

    return
  }

  if (!deleteButton) {
    return
  }

  const producto = getProductById(deleteButton.dataset.deleteProduct)

  if (!producto) {
    return
  }

  const confirmed = window.confirm(`¿Desactivar el producto "${producto.nombre}"?`)

  if (!confirmed) {
    return
  }

  try {
    await deleteProducto(producto.id_producto)
    await loadProducts(document.querySelector('[data-product-category-filter]').value)
    setProductStatus('Producto desactivado correctamente.', 'success')
  } catch (error) {
    setProductStatus(error.message, 'error')
  }
}

async function setupProductos() {
  setupAuthenticatedNavigation()

  document.querySelector('[data-open-product-modal]').addEventListener('click', () => {
    openProductModal()
  })
  document.querySelectorAll('[data-close-product-modal]').forEach((button) => {
    button.addEventListener('click', closeProductModal)
  })
  document.querySelector('[data-product-form]').addEventListener('submit', handleProductSubmit)
  document.querySelector('[data-product-table-body]').addEventListener('click', handleProductTableClick)
  document.querySelector('[data-product-search]').addEventListener('input', (event) => {
    filterProducts(event.target.value)
  })
  document.querySelector('[data-product-category-filter]').addEventListener('change', async (event) => {
    try {
      await loadProducts(event.target.value)
      filterProducts(document.querySelector('[data-product-search]').value)
    } catch (error) {
      setProductStatus(error.message, 'error')
      renderProductTable([])
    }
  })
  document.querySelector('[data-product-status-filter]').addEventListener('change', async () => {
    try {
      await loadProducts(document.querySelector('[data-product-category-filter]').value)
      filterProducts(document.querySelector('[data-product-search]').value)
    } catch (error) {
      setProductStatus(error.message, 'error')
      renderProductTable([])
    }
  })

  try {
    await loadProductCategories()
    await loadProducts()
  } catch (error) {
    setProductStatus(error.message, 'error')
    renderProductTable([])
  }
}

function setWarehouseStatus(message, type = 'info') {
  const status = document.querySelector('[data-warehouse-status]')

  if (!status) {
    return
  }

  status.textContent = message
  status.dataset.type = type
}

function setWarehouseFormStatus(message, type = 'info') {
  const status = document.querySelector('[data-warehouse-form-status]')

  if (!status) {
    return
  }

  status.textContent = message
  status.dataset.type = type
}

function getWarehouseById(idAlmacen) {
  return almacenesState.find((almacen) => almacen.id_almacen === Number(idAlmacen))
}

function renderWarehouseTable(almacenes = almacenesState) {
  const tbody = document.querySelector('[data-warehouse-table-body]')

  if (!tbody) {
    return
  }

  tbody.innerHTML = renderAlmacenRows(almacenes)
}

function filterWarehouses(searchTerm) {
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const source = Array.isArray(almacenesState) ? almacenesState : []

  if (!normalizedSearch) {
    renderWarehouseTable(source)
    return
  }

  renderWarehouseTable(
    source.filter((almacen) =>
      String(almacen.nombre || '').toLowerCase().includes(normalizedSearch) ||
      String(almacen.tipo || '').toLowerCase().includes(normalizedSearch)
    )
  )
}

async function loadWarehouses() {
  setWarehouseStatus('Cargando almacenes...', 'info')
  const estado = document.querySelector('[data-warehouse-status-filter]')?.value || 'activo'
  const almacenes = await getAlmacenes(estado)

  if (!Array.isArray(almacenes)) {
    throw new Error('La API de almacenes no devolvio una lista valida.')
  }

  almacenesState = almacenes
  renderWarehouseTable()
  setWarehouseStatus(`${almacenesState.length} almacenes registrados.`, 'success')
}

function clearWarehouseErrors() {
  document.querySelectorAll('[data-warehouse-error]').forEach((element) => {
    element.textContent = ''
  })
}

function openWarehouseModal(almacen = null) {
  const modal = document.querySelector('[data-warehouse-modal]')
  const form = document.querySelector('[data-warehouse-form]')
  const title = document.querySelector('[data-warehouse-modal-title]')

  form.reset()
  form.elements.id_almacen.value = almacen?.id_almacen || ''
  form.elements.nombre.value = almacen?.nombre || ''
  form.elements.direccion.value = almacen?.direccion || ''
  form.elements.capacidad_total.value = almacen?.capacidad_total ?? 0
  form.elements.tipo.value = almacen?.tipo || 'Principal'
  title.textContent = almacen ? 'Editar Almacen' : 'Nuevo Almacen'
  clearWarehouseErrors()
  setWarehouseFormStatus('', 'info')
  modal.hidden = false
  form.elements.nombre.focus()
}

function closeWarehouseModal() {
  document.querySelector('[data-warehouse-modal]').hidden = true
}

function getWarehousePayload(form) {
  const formData = new FormData(form)

  return {
    nombre: String(formData.get('nombre') || '').trim(),
    direccion: String(formData.get('direccion') || '').trim(),
    capacidad_total: String(formData.get('capacidad_total') || '0').trim(),
    tipo: String(formData.get('tipo') || '').trim()
  }
}

function validateWarehousePayload(payload) {
  const errors = {}
  const capacidadTotal = Number(payload.capacidad_total)

  if (!payload.nombre) {
    errors.nombre = 'El nombre del almacen es obligatorio.'
  }

  if (!Number.isInteger(capacidadTotal) || capacidadTotal < 0) {
    errors.capacidad_total = 'La capacidad total debe ser mayor o igual a 0.'
  }

  return errors
}

function renderWarehouseErrors(errors) {
  clearWarehouseErrors()

  Object.entries(errors).forEach(([field, message]) => {
    const element = document.querySelector(`[data-warehouse-error="${field}"]`)

    if (element) {
      element.textContent = message
    }
  })
}

async function handleWarehouseSubmit(event) {
  event.preventDefault()

  const form = event.currentTarget
  const saveButton = document.querySelector('[data-save-warehouse]')
  const idAlmacen = form.elements.id_almacen.value
  const payload = getWarehousePayload(form)
  const errors = validateWarehousePayload(payload)

  renderWarehouseErrors(errors)

  if (Object.keys(errors).length > 0) {
    return
  }

  saveButton.disabled = true
  setWarehouseFormStatus('Guardando almacen...', 'info')

  try {
    if (idAlmacen) {
      await updateAlmacen(idAlmacen, payload)
      setWarehouseStatus('Almacen actualizado correctamente.', 'success')
    } else {
      await createAlmacen(payload)
      setWarehouseStatus('Almacen creado correctamente.', 'success')
    }

    closeWarehouseModal()
    await loadWarehouses()
    filterWarehouses(document.querySelector('[data-warehouse-search]').value)
  } catch (error) {
    setWarehouseFormStatus(error.message, 'error')
  } finally {
    saveButton.disabled = false
  }
}

async function handleWarehouseTableClick(event) {
  const editButton = event.target.closest('[data-edit-warehouse]')
  const deleteButton = event.target.closest('[data-delete-warehouse]')
  const reactivateButton = event.target.closest('[data-reactivate-warehouse]')

  if (editButton) {
    openWarehouseModal(getWarehouseById(editButton.dataset.editWarehouse))
    return
  }

  if (reactivateButton) {
    const almacen = getWarehouseById(reactivateButton.dataset.reactivateWarehouse)

    if (!almacen || !window.confirm(`¿Reactivar el almacen "${almacen.nombre}"?`)) {
      return
    }

    try {
      await reactivateAlmacen(almacen.id_almacen)
      await loadWarehouses()
      setWarehouseStatus('Almacen reactivado correctamente.', 'success')
    } catch (error) {
      setWarehouseStatus(error.message, 'error')
    }

    return
  }

  if (!deleteButton) {
    return
  }

  const almacen = getWarehouseById(deleteButton.dataset.deleteWarehouse)

  if (!almacen) {
    return
  }

  const confirmed = window.confirm(`¿Desactivar el almacen "${almacen.nombre}"?`)

  if (!confirmed) {
    return
  }

  try {
    await deleteAlmacen(almacen.id_almacen)
    await loadWarehouses()
    setWarehouseStatus('Almacen desactivado correctamente.', 'success')
  } catch (error) {
    setWarehouseStatus(error.message, 'error')
  }
}

async function setupAlmacenes() {
  setupAuthenticatedNavigation()

  document.querySelector('[data-open-warehouse-modal]').addEventListener('click', () => {
    openWarehouseModal()
  })
  document.querySelectorAll('[data-close-warehouse-modal]').forEach((button) => {
    button.addEventListener('click', closeWarehouseModal)
  })
  document.querySelector('[data-warehouse-form]').addEventListener('submit', handleWarehouseSubmit)
  document.querySelector('[data-warehouse-table-body]').addEventListener('click', handleWarehouseTableClick)
  document.querySelector('[data-warehouse-search]').addEventListener('input', (event) => {
    filterWarehouses(event.target.value)
  })
  document.querySelector('[data-warehouse-status-filter]').addEventListener('change', async () => {
    try {
      await loadWarehouses()
      filterWarehouses(document.querySelector('[data-warehouse-search]').value)
    } catch (error) {
      setWarehouseStatus(error.message, 'error')
      renderWarehouseTable([])
    }
  })

  try {
    await loadWarehouses()
  } catch (error) {
    setWarehouseStatus(error.message, 'error')
    renderWarehouseTable([])
  }
}

function setLocationStatus(message, type = 'info') {
  const status = document.querySelector('[data-location-status]')

  if (!status) {
    return
  }

  status.textContent = message
  status.dataset.type = type
}

function setLocationFormStatus(message, type = 'info') {
  const status = document.querySelector('[data-location-form-status]')

  if (!status) {
    return
  }

  status.textContent = message
  status.dataset.type = type
}

function getLocationById(idUbicacion) {
  return ubicacionesState.find((ubicacion) => ubicacion.id_ubicacion === Number(idUbicacion))
}

function renderLocationTable(ubicaciones = ubicacionesState) {
  const tbody = document.querySelector('[data-location-table-body]')

  if (!tbody) {
    return
  }

  tbody.innerHTML = renderUbicacionRows(ubicaciones)
}

function filterLocations(searchTerm) {
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const source = Array.isArray(ubicacionesState) ? ubicacionesState : []

  if (!normalizedSearch) {
    renderLocationTable(source)
    return
  }

  renderLocationTable(
    source.filter((ubicacion) =>
      String(ubicacion.codigo || '').toLowerCase().includes(normalizedSearch) ||
      String(ubicacion.pasillo || '').toLowerCase().includes(normalizedSearch) ||
      String(ubicacion.estante || '').toLowerCase().includes(normalizedSearch)
    )
  )
}

async function loadLocationWarehouses() {
  almacenesState = await getAlmacenes('activo')
  const filter = document.querySelector('[data-location-warehouse-filter]')

  if (filter) {
    filter.innerHTML = renderAlmacenOptions(almacenesState, null, true)
  }
}

async function loadLocations(idAlmacen = '') {
  setLocationStatus('Cargando ubicaciones...', 'info')
  const estado = document.querySelector('[data-location-status-filter]')?.value || 'activo'
  const ubicaciones = idAlmacen ? await getUbicacionesByAlmacen(idAlmacen, estado) : await getUbicaciones(estado)

  if (!Array.isArray(ubicaciones)) {
    throw new Error('La API de ubicaciones no devolvio una lista valida.')
  }

  ubicacionesState = ubicaciones
  renderLocationTable()
  setLocationStatus(`${ubicacionesState.length} ubicaciones registradas.`, 'success')
}

function clearLocationErrors() {
  document.querySelectorAll('[data-location-error]').forEach((element) => {
    element.textContent = ''
  })
}

function openLocationModal(ubicacion = null) {
  const modal = document.querySelector('[data-location-modal]')
  const form = document.querySelector('[data-location-form]')
  const title = document.querySelector('[data-location-modal-title]')
  const warehouseSelect = document.querySelector('[data-location-warehouse]')

  form.reset()
  form.elements.id_ubicacion.value = ubicacion?.id_ubicacion || ''
  form.elements.codigo.value = ubicacion?.codigo || ''
  form.elements.pasillo.value = ubicacion?.pasillo || ''
  form.elements.estante.value = ubicacion?.estante || ''
  form.elements.nivel.value = ubicacion?.nivel || ''
  form.elements.capacidad.value = ubicacion?.capacidad ?? 0
  warehouseSelect.innerHTML = renderAlmacenOptions(almacenesState, ubicacion?.id_almacen || null)
  title.textContent = ubicacion ? 'Editar Ubicacion' : 'Nueva Ubicacion'
  clearLocationErrors()
  setLocationFormStatus('', 'info')
  modal.hidden = false
  warehouseSelect.focus()
}

function closeLocationModal() {
  document.querySelector('[data-location-modal]').hidden = true
}

function getLocationPayload(form) {
  const formData = new FormData(form)

  return {
    id_almacen: String(formData.get('id_almacen') || '').trim(),
    codigo: String(formData.get('codigo') || '').trim(),
    pasillo: String(formData.get('pasillo') || '').trim(),
    estante: String(formData.get('estante') || '').trim(),
    nivel: String(formData.get('nivel') || '').trim(),
    capacidad: String(formData.get('capacidad') || '0').trim()
  }
}

function validateLocationPayload(payload) {
  const errors = {}
  const capacidad = Number(payload.capacidad)

  if (!payload.id_almacen) {
    errors.id_almacen = 'Selecciona un almacen.'
  }

  if (!payload.codigo) {
    errors.codigo = 'El codigo es obligatorio.'
  }

  if (!Number.isInteger(capacidad) || capacidad < 0) {
    errors.capacidad = 'La capacidad debe ser mayor o igual a 0.'
  }

  return errors
}

function renderLocationErrors(errors) {
  clearLocationErrors()

  Object.entries(errors).forEach(([field, message]) => {
    const element = document.querySelector(`[data-location-error="${field}"]`)

    if (element) {
      element.textContent = message
    }
  })
}

async function handleLocationSubmit(event) {
  event.preventDefault()

  const form = event.currentTarget
  const saveButton = document.querySelector('[data-save-location]')
  const idUbicacion = form.elements.id_ubicacion.value
  const payload = getLocationPayload(form)
  const errors = validateLocationPayload(payload)

  renderLocationErrors(errors)

  if (Object.keys(errors).length > 0) {
    return
  }

  saveButton.disabled = true
  setLocationFormStatus('Guardando ubicacion...', 'info')

  try {
    if (idUbicacion) {
      await updateUbicacion(idUbicacion, payload)
      setLocationStatus('Ubicacion actualizada correctamente.', 'success')
    } else {
      await createUbicacion(payload)
      setLocationStatus('Ubicacion creada correctamente.', 'success')
    }

    closeLocationModal()
    await loadLocations(document.querySelector('[data-location-warehouse-filter]').value)
    filterLocations(document.querySelector('[data-location-search]').value)
  } catch (error) {
    setLocationFormStatus(error.message, 'error')
  } finally {
    saveButton.disabled = false
  }
}

async function handleLocationTableClick(event) {
  const editButton = event.target.closest('[data-edit-location]')
  const deleteButton = event.target.closest('[data-delete-location]')
  const reactivateButton = event.target.closest('[data-reactivate-location]')

  if (editButton) {
    openLocationModal(getLocationById(editButton.dataset.editLocation))
    return
  }

  if (reactivateButton) {
    const ubicacion = getLocationById(reactivateButton.dataset.reactivateLocation)

    if (!ubicacion || !window.confirm(`¿Reactivar la ubicacion "${ubicacion.codigo}"?`)) {
      return
    }

    try {
      await reactivateUbicacion(ubicacion.id_ubicacion)
      await loadLocations(document.querySelector('[data-location-warehouse-filter]').value)
      setLocationStatus('Ubicacion reactivada correctamente.', 'success')
    } catch (error) {
      setLocationStatus(error.message, 'error')
    }

    return
  }

  if (!deleteButton) {
    return
  }

  const ubicacion = getLocationById(deleteButton.dataset.deleteLocation)

  if (!ubicacion) {
    return
  }

  const confirmed = window.confirm(`¿Desactivar la ubicacion "${ubicacion.codigo}"?`)

  if (!confirmed) {
    return
  }

  try {
    await deleteUbicacion(ubicacion.id_ubicacion)
    await loadLocations(document.querySelector('[data-location-warehouse-filter]').value)
    setLocationStatus('Ubicacion desactivada correctamente.', 'success')
  } catch (error) {
    setLocationStatus(error.message, 'error')
  }
}

async function setupUbicaciones() {
  setupAuthenticatedNavigation()

  document.querySelector('[data-open-location-modal]').addEventListener('click', () => {
    openLocationModal()
  })
  document.querySelectorAll('[data-close-location-modal]').forEach((button) => {
    button.addEventListener('click', closeLocationModal)
  })
  document.querySelector('[data-location-form]').addEventListener('submit', handleLocationSubmit)
  document.querySelector('[data-location-table-body]').addEventListener('click', handleLocationTableClick)
  document.querySelector('[data-location-search]').addEventListener('input', (event) => {
    filterLocations(event.target.value)
  })
  document.querySelector('[data-location-warehouse-filter]').addEventListener('change', async (event) => {
    try {
      await loadLocations(event.target.value)
      filterLocations(document.querySelector('[data-location-search]').value)
    } catch (error) {
      setLocationStatus(error.message, 'error')
      renderLocationTable([])
    }
  })
  document.querySelector('[data-location-status-filter]').addEventListener('change', async () => {
    try {
      await loadLocations(document.querySelector('[data-location-warehouse-filter]').value)
      filterLocations(document.querySelector('[data-location-search]').value)
    } catch (error) {
      setLocationStatus(error.message, 'error')
      renderLocationTable([])
    }
  })

  try {
    await loadLocationWarehouses()
    await loadLocations()
  } catch (error) {
    setLocationStatus(error.message, 'error')
    renderLocationTable([])
  }
}

function setStockStatus(message, type = 'info') {
  const status = document.querySelector('[data-stock-status]')

  if (!status) {
    return
  }

  status.textContent = message
  status.dataset.type = type
}

function setKardexStatus(message, type = 'info') {
  const status = document.querySelector('[data-kardex-status]')

  if (!status) {
    return
  }

  status.textContent = message
  status.dataset.type = type
}

function renderKardexTable(items = kardexState) {
  const tbody = document.querySelector('[data-kardex-table-body]')

  if (tbody) {
    tbody.innerHTML = renderKardexRows(items)
  }
}

function renderKardexSummary(summary = {}) {
  const element = document.querySelector('[data-kardex-summary]')

  if (element) {
    element.innerHTML = renderKardexSummaryCards(summary)
  }
}

async function loadKardexCatalogs() {
  const [productos, almacenes] = await Promise.all([
    getProductos('activo'),
    getAlmacenes('activo')
  ])

  productosState = productos
  almacenesState = almacenes
  document.querySelector('[data-kardex-product-filter]').innerHTML = renderKardexProductOptions(productosState)
  document.querySelector('[data-kardex-warehouse-filter]').innerHTML = renderKardexWarehouseOptions(almacenesState)
}

async function loadKardex() {
  const idProducto = String(document.querySelector('[data-kardex-product-filter]')?.value || '').trim()
  const idAlmacen = String(document.querySelector('[data-kardex-warehouse-filter]')?.value || '').trim()
  const fechaInicio = String(document.querySelector('[data-kardex-start-date]')?.value || '').trim()
  const fechaFin = String(document.querySelector('[data-kardex-end-date]')?.value || '').trim()

  if (!idProducto) {
    kardexState = []
    renderKardexSummary()
    document.querySelector('[data-kardex-table-body]').innerHTML = `
      <tr>
        <td colspan="9">Seleccione un producto para visualizar el Kardex.</td>
      </tr>
    `
    setKardexStatus('Seleccione un producto para visualizar el Kardex.', 'info')
    return
  }

  setKardexStatus('Consultando Kardex...', 'info')
  const response = await getKardexByProducto(idProducto, {
    idAlmacen,
    fechaInicio,
    fechaFin
  })

  kardexState = response.data || []
  renderKardexSummary(response.summary || {})
  renderKardexTable()
  setKardexStatus(`${kardexState.length} movimientos encontrados.`, 'success')
}

async function setupKardex() {
  setupAuthenticatedNavigation()

  const getKardexExportParams = () => ({
    id_producto: String(document.querySelector('[data-kardex-product-filter]')?.value || '').trim(),
    id_almacen: String(document.querySelector('[data-kardex-warehouse-filter]')?.value || '').trim(),
    fechaInicio: String(document.querySelector('[data-kardex-start-date]')?.value || '').trim(),
    fechaFin: String(document.querySelector('[data-kardex-end-date]')?.value || '').trim()
  })

  document.querySelector('[data-export-kardex-pdf]').addEventListener('click', () => {
    handleExport('kardex', 'pdf', getKardexExportParams(), setKardexStatus)
  })
  document.querySelector('[data-export-kardex-excel]').addEventListener('click', () => {
    handleExport('kardex', 'excel', getKardexExportParams(), setKardexStatus)
  })

  document.querySelector('[data-kardex-product-filter]').addEventListener('change', async () => {
    try {
      await loadKardex()
    } catch (error) {
      setKardexStatus(error.message, 'error')
      renderKardexTable([])
    }
  })
  document.querySelector('[data-kardex-warehouse-filter]').addEventListener('change', async () => {
    try {
      await loadKardex()
    } catch (error) {
      setKardexStatus(error.message, 'error')
      renderKardexTable([])
    }
  })
  document.querySelector('[data-kardex-start-date]').addEventListener('change', async () => {
    try {
      await loadKardex()
    } catch (error) {
      setKardexStatus(error.message, 'error')
      renderKardexTable([])
    }
  })
  document.querySelector('[data-kardex-end-date]').addEventListener('change', async () => {
    try {
      await loadKardex()
    } catch (error) {
      setKardexStatus(error.message, 'error')
      renderKardexTable([])
    }
  })

  try {
    await loadKardexCatalogs()
    await loadKardex()
  } catch (error) {
    setKardexStatus(error.message, 'error')
    renderKardexTable([])
  }
}

function renderStockTable(stockItems = stockState) {
  const tbody = document.querySelector('[data-stock-table-body]')
  const summary = document.querySelector('[data-stock-summary]')

  if (tbody) {
    tbody.innerHTML = renderStockRows(stockItems)
  }

  if (summary) {
    summary.innerHTML = renderStockSummaryCards(getStockSummary(stockItems))
  }
}

function getFilteredStock() {
  const search = String(document.querySelector('[data-stock-search]')?.value || '').trim().toLowerCase()
  const productSearch = String(document.querySelector('[data-stock-product-filter]')?.value || '').trim().toLowerCase()
  const source = Array.isArray(stockState) ? stockState : []

  return source.filter((item) => {
    const code = String(item.codigo_producto || '').toLowerCase()
    const name = String(item.producto_nombre || '').toLowerCase()
    const generalMatches = !search || code.includes(search) || name.includes(search)
    const productMatches = !productSearch || name.includes(productSearch) || code.includes(productSearch)

    return generalMatches && productMatches
  })
}

function filterStock() {
  renderStockTable(getFilteredStock())
}

async function loadStockWarehouses() {
  almacenesState = await getAlmacenes()
  const filter = document.querySelector('[data-stock-warehouse-filter]')

  if (filter) {
    filter.innerHTML = renderStockAlmacenOptions(almacenesState)
  }
}

async function loadStock(idAlmacen = '') {
  setStockStatus('Cargando stock...', 'info')
  const stock = idAlmacen ? await getStockByAlmacen(idAlmacen) : await getStock()

  if (!Array.isArray(stock)) {
    throw new Error('La API de stock no devolvio una lista valida.')
  }

  stockState = stock
  renderStockTable()
  setStockStatus(`${stockState.length} registros de stock.`, 'success')
}

async function setupStock() {
  setupAuthenticatedNavigation()

  document.querySelector('[data-export-stock-pdf]').addEventListener('click', () => {
    handleExport('stock', 'pdf', {}, setStockStatus)
  })
  document.querySelector('[data-export-stock-excel]').addEventListener('click', () => {
    handleExport('stock', 'excel', {}, setStockStatus)
  })

  document.querySelector('[data-stock-search]').addEventListener('input', filterStock)
  document.querySelector('[data-stock-product-filter]').addEventListener('input', filterStock)
  document.querySelector('[data-stock-warehouse-filter]').addEventListener('change', async (event) => {
    try {
      await loadStock(event.target.value)
      filterStock()
    } catch (error) {
      setStockStatus(error.message, 'error')
      renderStockTable([])
    }
  })

  try {
    await loadStockWarehouses()
    await loadStock()
  } catch (error) {
    setStockStatus(error.message, 'error')
    renderStockTable([])
  }
}

function setMovementStatus(message, type = 'info') {
  const status = document.querySelector('[data-movement-status]')

  if (!status) {
    return
  }

  status.textContent = message
  status.dataset.type = type
}

function setMovementFormStatus(message, type = 'info') {
  const status = document.querySelector('[data-movement-form-status]')

  if (!status) {
    return
  }

  status.textContent = message
  status.dataset.type = type
}

function renderMovementTable(movimientos = movimientosState) {
  const tbody = document.querySelector('[data-movement-table-body]')
  const summary = document.querySelector('[data-movement-summary]')

  if (tbody) {
    tbody.innerHTML = renderMovimientoRows(movimientos)
  }

  if (summary) {
    summary.innerHTML = renderMovimientoSummaryCards(getMovimientoSummary(movimientos))
  }
}

function getFilteredMovements() {
  const search = String(document.querySelector('[data-movement-search]')?.value || '').trim().toLowerCase()
  const type = String(document.querySelector('[data-movement-type-filter]')?.value || '').trim()
  const date = String(document.querySelector('[data-movement-date-filter]')?.value || '').trim()
  const source = Array.isArray(movimientosState) ? movimientosState : []

  return source.filter((movimiento) => {
    const code = String(movimiento.codigo_producto || '').toLowerCase()
    const product = String(movimiento.producto_nombre || '').toLowerCase()
    const reference = String(movimiento.referencia || '').toLowerCase()
    const reason = String(movimiento.motivo || '').toLowerCase()
    const movementDate = String(movimiento.fecha || movimiento.created_at || '').slice(0, 10)
    const searchMatches = !search || code.includes(search) || product.includes(search) || reference.includes(search) || reason.includes(search)
    const typeMatches = !type || movimiento.tipo === type
    const dateMatches = !date || movementDate === date

    return searchMatches && typeMatches && dateMatches
  })
}

function filterMovements() {
  renderMovementTable(getFilteredMovements())
}

async function loadMovementCatalogs() {
  const [productos, almacenes] = await Promise.all([
    getProductos(),
    getAlmacenes()
  ])

  productosState = productos
  almacenesState = almacenes

  document.querySelector('[data-movement-product-filter]').innerHTML = renderMovimientoProductoOptions(productosState, null, true)
  document.querySelector('[data-movement-warehouse-filter]').innerHTML = renderMovimientoAlmacenOptions(almacenesState, null, true)
}

async function loadMovements() {
  const productFilter = String(document.querySelector('[data-movement-product-filter]')?.value || '').trim()
  const warehouseFilter = String(document.querySelector('[data-movement-warehouse-filter]')?.value || '').trim()

  setMovementStatus('Cargando movimientos...', 'info')

  if (productFilter) {
    movimientosState = await getMovimientosByProducto(productFilter)
  } else if (warehouseFilter) {
    movimientosState = await getMovimientosByAlmacen(warehouseFilter)
  } else {
    movimientosState = await getMovimientos()
  }

  if (warehouseFilter && productFilter) {
    movimientosState = movimientosState.filter((movimiento) => String(movimiento.id_almacen) === warehouseFilter)
  }

  renderMovementTable()
  setMovementStatus(`${movimientosState.length} movimientos registrados.`, 'success')
}

function clearMovementErrors() {
  document.querySelectorAll('[data-movement-error]').forEach((element) => {
    element.textContent = ''
  })
}

function openMovementModal() {
  const modal = document.querySelector('[data-movement-modal]')
  const form = document.querySelector('[data-movement-form]')

  form.reset()
  document.querySelector('[data-movement-product]').innerHTML = renderMovimientoProductoOptions(productosState)
  document.querySelector('[data-movement-warehouse]').innerHTML = renderMovimientoAlmacenOptions(almacenesState)
  clearMovementErrors()
  setMovementFormStatus('', 'info')
  modal.hidden = false
  form.elements.id_producto.focus()
}

function closeMovementModal() {
  document.querySelector('[data-movement-modal]').hidden = true
}

function getMovementPayload(form) {
  const formData = new FormData(form)
  const usuario = getUsuario()

  return {
    id_producto: String(formData.get('id_producto') || '').trim(),
    id_almacen: String(formData.get('id_almacen') || '').trim(),
    id_usuario: usuario?.id || 1,
    tipo: String(formData.get('tipo') || '').trim(),
    cantidad: String(formData.get('cantidad') || '').trim(),
    referencia: String(formData.get('referencia') || '').trim(),
    motivo: String(formData.get('motivo') || '').trim()
  }
}

function validateMovementPayload(payload) {
  const errors = {}
  const quantity = Number(payload.cantidad)

  if (!payload.id_producto) {
    errors.id_producto = 'Selecciona un producto.'
  }

  if (!payload.id_almacen) {
    errors.id_almacen = 'Selecciona un almacen.'
  }

  if (!['ENTRADA', 'SALIDA', 'AJUSTE'].includes(payload.tipo)) {
    errors.tipo = 'Selecciona un tipo valido.'
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    errors.cantidad = 'La cantidad debe ser mayor a 0.'
  }

  return errors
}

function renderMovementErrors(errors) {
  clearMovementErrors()

  Object.entries(errors).forEach(([field, message]) => {
    const element = document.querySelector(`[data-movement-error="${field}"]`)

    if (element) {
      element.textContent = message
    }
  })
}

async function handleMovementSubmit(event) {
  event.preventDefault()

  const form = event.currentTarget
  const saveButton = document.querySelector('[data-save-movement]')
  const payload = getMovementPayload(form)
  const errors = validateMovementPayload(payload)

  renderMovementErrors(errors)

  if (Object.keys(errors).length > 0) {
    return
  }

  saveButton.disabled = true
  setMovementFormStatus('Registrando movimiento...', 'info')

  try {
    await createMovimiento(payload)
    closeMovementModal()
    await loadMovements()
    filterMovements()
    setMovementStatus('Movimiento registrado correctamente.', 'success')
  } catch (error) {
    setMovementFormStatus(error.message, 'error')
  } finally {
    saveButton.disabled = false
  }
}

async function setupMovimientos() {
  setupAuthenticatedNavigation()

  document.querySelector('[data-export-movements-pdf]').addEventListener('click', () => {
    handleExport('movimientos', 'pdf', {}, setMovementStatus)
  })
  document.querySelector('[data-export-movements-excel]').addEventListener('click', () => {
    handleExport('movimientos', 'excel', {}, setMovementStatus)
  })

  document.querySelector('[data-open-movement-modal]').addEventListener('click', openMovementModal)
  document.querySelectorAll('[data-close-movement-modal]').forEach((button) => {
    button.addEventListener('click', closeMovementModal)
  })
  document.querySelector('[data-movement-form]').addEventListener('submit', handleMovementSubmit)
  document.querySelector('[data-movement-search]').addEventListener('input', filterMovements)
  document.querySelector('[data-movement-type-filter]').addEventListener('change', filterMovements)
  document.querySelector('[data-movement-date-filter]').addEventListener('change', filterMovements)
  document.querySelector('[data-movement-product-filter]').addEventListener('change', async () => {
    try {
      await loadMovements()
      filterMovements()
    } catch (error) {
      setMovementStatus(error.message, 'error')
      renderMovementTable([])
    }
  })
  document.querySelector('[data-movement-warehouse-filter]').addEventListener('change', async () => {
    try {
      await loadMovements()
      filterMovements()
    } catch (error) {
      setMovementStatus(error.message, 'error')
      renderMovementTable([])
    }
  })

  try {
    await loadMovementCatalogs()
    await loadMovements()
  } catch (error) {
    setMovementStatus(error.message, 'error')
    renderMovementTable([])
  }
}

function setSupplierStatus(message, type = 'info') {
  const status = document.querySelector('[data-supplier-status]')

  if (!status) {
    return
  }

  status.textContent = message
  status.dataset.type = type
}

function setSupplierFormStatus(message, type = 'info') {
  const status = document.querySelector('[data-supplier-form-status]')

  if (!status) {
    return
  }

  status.textContent = message
  status.dataset.type = type
}

function getSupplierById(idProveedor) {
  return proveedoresState.find((proveedor) => proveedor.id_proveedor === Number(idProveedor))
}

function renderSupplierTable(proveedores = proveedoresState) {
  const tbody = document.querySelector('[data-supplier-table-body]')

  if (!tbody) {
    return
  }

  tbody.innerHTML = renderProveedorRows(proveedores)
}

function filterSuppliers(searchTerm = '') {
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const source = Array.isArray(proveedoresState) ? proveedoresState : []

  if (!normalizedSearch) {
    renderSupplierTable(source)
    return
  }

  renderSupplierTable(
    source.filter((proveedor) =>
      String(proveedor.razon_social || '').toLowerCase().includes(normalizedSearch) ||
      String(proveedor.ruc || '').toLowerCase().includes(normalizedSearch)
    )
  )
}

async function loadSuppliers() {
  setSupplierStatus('Cargando proveedores...', 'info')
  const estado = document.querySelector('[data-supplier-status-filter]')?.value || 'activo'
  const proveedores = await getProveedores(estado)

  if (!Array.isArray(proveedores)) {
    throw new Error('La API de proveedores no devolvio una lista valida.')
  }

  proveedoresState = proveedores
  renderSupplierTable()
  setSupplierStatus(`${proveedoresState.length} proveedores registrados.`, 'success')
}

function clearSupplierErrors() {
  document.querySelectorAll('[data-supplier-error]').forEach((element) => {
    element.textContent = ''
  })
}

function openSupplierModal(proveedor = null) {
  const modal = document.querySelector('[data-supplier-modal]')
  const form = document.querySelector('[data-supplier-form]')
  const title = document.querySelector('[data-supplier-modal-title]')

  form.reset()
  form.elements.id_proveedor.value = proveedor?.id_proveedor || ''
  form.elements.razon_social.value = proveedor?.razon_social || ''
  form.elements.ruc.value = proveedor?.ruc || ''
  form.elements.telefono.value = proveedor?.telefono || ''
  form.elements.email.value = proveedor?.email || ''
  form.elements.direccion.value = proveedor?.direccion || ''
  form.elements.estado.value = String(proveedor?.estado || 'activo').toLowerCase()
  title.textContent = proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'
  clearSupplierErrors()
  setSupplierFormStatus('', 'info')
  modal.hidden = false
  form.elements.razon_social.focus()
}

function closeSupplierModal() {
  document.querySelector('[data-supplier-modal]').hidden = true
}

function getSupplierPayload(form) {
  const formData = new FormData(form)

  return {
    razon_social: String(formData.get('razon_social') || '').trim(),
    ruc: String(formData.get('ruc') || '').trim(),
    telefono: String(formData.get('telefono') || '').trim(),
    email: String(formData.get('email') || '').trim(),
    direccion: String(formData.get('direccion') || '').trim(),
    estado: String(formData.get('estado') || 'activo').trim()
  }
}

function validateSupplierPayload(payload) {
  const errors = {}

  if (!payload.razon_social) {
    errors.razon_social = 'La razon social es obligatoria.'
  }

  if (!/^\d{11}$/.test(payload.ruc)) {
    errors.ruc = 'El RUC debe tener exactamente 11 digitos.'
  }

  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.email = 'Ingresa un email valido.'
  }

  return errors
}

function renderSupplierErrors(errors) {
  clearSupplierErrors()

  Object.entries(errors).forEach(([field, message]) => {
    const element = document.querySelector(`[data-supplier-error="${field}"]`)

    if (element) {
      element.textContent = message
    }
  })
}

async function handleSupplierSubmit(event) {
  event.preventDefault()

  const form = event.currentTarget
  const saveButton = document.querySelector('[data-save-supplier]')
  const idProveedor = form.elements.id_proveedor.value
  const payload = getSupplierPayload(form)
  const errors = validateSupplierPayload(payload)

  renderSupplierErrors(errors)

  if (Object.keys(errors).length > 0) {
    return
  }

  saveButton.disabled = true
  setSupplierFormStatus('Guardando proveedor...', 'info')

  try {
    if (idProveedor) {
      await updateProveedor(idProveedor, payload)
      setSupplierStatus('Proveedor actualizado correctamente.', 'success')
    } else {
      await createProveedor(payload)
      setSupplierStatus('Proveedor creado correctamente.', 'success')
    }

    closeSupplierModal()
    await loadSuppliers()
    filterSuppliers(document.querySelector('[data-supplier-search]').value)
  } catch (error) {
    setSupplierFormStatus(error.message, 'error')
  } finally {
    saveButton.disabled = false
  }
}

async function handleSupplierTableClick(event) {
  const editButton = event.target.closest('[data-edit-supplier]')
  const deleteButton = event.target.closest('[data-delete-supplier]')
  const reactivateButton = event.target.closest('[data-reactivate-supplier]')

  if (editButton) {
    openSupplierModal(getSupplierById(editButton.dataset.editSupplier))
    return
  }

  if (reactivateButton) {
    const proveedor = getSupplierById(reactivateButton.dataset.reactivateSupplier)

    if (!proveedor || !window.confirm(`¿Reactivar el proveedor "${proveedor.razon_social}"?`)) {
      return
    }

    try {
      await reactivateProveedor(proveedor.id_proveedor)
      await loadSuppliers()
      filterSuppliers(document.querySelector('[data-supplier-search]').value)
      setSupplierStatus('Proveedor reactivado correctamente.', 'success')
    } catch (error) {
      setSupplierStatus(error.message, 'error')
    }

    return
  }

  if (!deleteButton) {
    return
  }

  const proveedor = getSupplierById(deleteButton.dataset.deleteSupplier)

  if (!proveedor) {
    return
  }

  const confirmed = window.confirm(`¿Desactivar el proveedor "${proveedor.razon_social}"?`)

  if (!confirmed) {
    return
  }

  try {
    await deleteProveedor(proveedor.id_proveedor)
    await loadSuppliers()
    filterSuppliers(document.querySelector('[data-supplier-search]').value)
    setSupplierStatus('Proveedor desactivado correctamente.', 'success')
  } catch (error) {
    setSupplierStatus(error.message, 'error')
  }
}

async function setupProveedores() {
  setupAuthenticatedNavigation()

  document.querySelector('[data-open-supplier-modal]').addEventListener('click', () => {
    openSupplierModal()
  })
  document.querySelectorAll('[data-close-supplier-modal]').forEach((button) => {
    button.addEventListener('click', closeSupplierModal)
  })
  document.querySelector('[data-supplier-form]').addEventListener('submit', handleSupplierSubmit)
  document.querySelector('[data-supplier-table-body]').addEventListener('click', handleSupplierTableClick)
  document.querySelector('[data-supplier-search]').addEventListener('input', (event) => {
    filterSuppliers(event.target.value)
  })
  document.querySelector('[data-supplier-status-filter]').addEventListener('change', async () => {
    try {
      await loadSuppliers()
      filterSuppliers(document.querySelector('[data-supplier-search]').value)
    } catch (error) {
      setSupplierStatus(error.message, 'error')
      renderSupplierTable([])
    }
  })

  try {
    await loadSuppliers()
  } catch (error) {
    setSupplierStatus(error.message, 'error')
    renderSupplierTable([])
  }
}

function setPurchaseOrderStatus(message, type = 'info') {
  const status = document.querySelector('[data-purchase-order-status]')

  if (!status) {
    return
  }

  status.textContent = message
  status.dataset.type = type
}

function setPurchaseOrderFormStatus(message, type = 'info') {
  const status = document.querySelector('[data-purchase-order-form-status]')

  if (!status) {
    return
  }

  status.textContent = message
  status.dataset.type = type
}

function renderPurchaseOrderTable(ordenes = ordenesCompraState) {
  const tbody = document.querySelector('[data-purchase-order-table-body]')

  if (!tbody) {
    return
  }

  tbody.innerHTML = renderOrdenCompraRows(ordenes)
}

function filterPurchaseOrders() {
  const search = String(document.querySelector('[data-purchase-order-search]')?.value || '').trim().toLowerCase()
  const providerFilter = String(document.querySelector('[data-purchase-order-provider-filter]')?.value || '').trim()
  const statusFilter = String(document.querySelector('[data-purchase-order-status-filter]')?.value || '').trim().toLowerCase()
  const source = Array.isArray(ordenesCompraState) ? ordenesCompraState : []

  renderPurchaseOrderTable(
    source.filter((orden) => {
      const matchesSearch = !search ||
        String(orden.id_orden || '').includes(search) ||
        String(orden.proveedor_nombre || '').toLowerCase().includes(search) ||
        String(orden.proveedor_ruc || '').toLowerCase().includes(search)
      const matchesProvider = !providerFilter || String(orden.id_proveedor) === providerFilter
      const matchesStatus = !statusFilter || String(orden.estado || '').toLowerCase() === statusFilter

      return matchesSearch && matchesProvider && matchesStatus
    })
  )
}

async function loadPurchaseOrderCatalogs() {
  const [proveedores, productos] = await Promise.all([
    getProveedores(),
    getProductos()
  ])

  proveedoresState = proveedores
  productosBaseState = productos

  const providerFilter = document.querySelector('[data-purchase-order-provider-filter]')
  const providerSelect = document.querySelector('[data-purchase-order-provider]')

  if (providerFilter) {
    providerFilter.innerHTML = renderProveedorOrdenOptions(proveedoresState, null, true)
  }

  if (providerSelect) {
    providerSelect.innerHTML = renderProveedorOrdenOptions(proveedoresState)
  }
}

async function loadPurchaseOrders() {
  const providerFilter = String(document.querySelector('[data-purchase-order-provider-filter]')?.value || '').trim()
  const statusFilter = String(document.querySelector('[data-purchase-order-status-filter]')?.value || '').trim()

  setPurchaseOrderStatus('Cargando ordenes...', 'info')

  if (providerFilter && !statusFilter) {
    ordenesCompraState = await getOrdenesCompraByProveedor(providerFilter)
  } else if (statusFilter && !providerFilter) {
    ordenesCompraState = await getOrdenesCompraByEstado(statusFilter)
  } else {
    ordenesCompraState = await getOrdenesCompra()
  }

  if (!Array.isArray(ordenesCompraState)) {
    throw new Error('La API de ordenes de compra no devolvio una lista valida.')
  }

  renderPurchaseOrderTable()
  setPurchaseOrderStatus(`${ordenesCompraState.length} ordenes registradas.`, 'success')
}

function clearPurchaseOrderErrors() {
  document.querySelectorAll('[data-purchase-order-error]').forEach((element) => {
    element.textContent = ''
  })
}

function addPurchaseOrderDetailRow() {
  const list = document.querySelector('[data-purchase-order-detail-list]')

  if (!list) {
    return
  }

  list.insertAdjacentHTML('beforeend', renderOrdenDetalleFormRow(productosBaseState, list.children.length))
}

function updatePurchaseOrderDetailPrice(select) {
  const row = select.closest('[data-purchase-order-detail-row]')
  const priceInput = row?.querySelector('input[name="precio_unitario"]')
  const selectedOption = select.selectedOptions[0]
  const price = selectedOption?.dataset.price

  if (priceInput && price !== undefined && priceInput.value === '') {
    priceInput.value = Number(price || 0).toFixed(2)
  }
}

function openPurchaseOrderModal() {
  const modal = document.querySelector('[data-purchase-order-modal]')
  const form = document.querySelector('[data-purchase-order-form]')
  const list = document.querySelector('[data-purchase-order-detail-list]')

  form.reset()
  form.elements.fecha_emision.value = new Date().toISOString().slice(0, 10)
  form.elements.estado.value = 'Pendiente'
  list.innerHTML = ''
  addPurchaseOrderDetailRow()
  clearPurchaseOrderErrors()
  setPurchaseOrderFormStatus('', 'info')
  modal.hidden = false
  form.elements.id_proveedor.focus()
}

function closePurchaseOrderModal() {
  document.querySelector('[data-purchase-order-modal]').hidden = true
}

function closePurchaseOrderHistoryModal() {
  document.querySelector('[data-purchase-order-history-modal]').hidden = true
}

function getPurchaseOrderPayload(form) {
  const formData = new FormData(form)
  const detalles = Array.from(document.querySelectorAll('[data-purchase-order-detail-row]')).map((row) => ({
    id_producto: String(row.querySelector('[name="id_producto"]')?.value || '').trim(),
    cantidad_solicitada: String(row.querySelector('[name="cantidad_solicitada"]')?.value || '').trim(),
    precio_unitario: String(row.querySelector('[name="precio_unitario"]')?.value || '').trim()
  }))

  return {
    id_proveedor: String(formData.get('id_proveedor') || '').trim(),
    fecha_emision: String(formData.get('fecha_emision') || '').trim(),
    fecha_entrega_esperada: String(formData.get('fecha_entrega_esperada') || '').trim(),
    estado: String(formData.get('estado') || 'Pendiente').trim(),
    observaciones: String(formData.get('observaciones') || '').trim(),
    created_by: getUsuario()?.id || getUsuario()?.id_usuario || 1,
    detalles
  }
}

function validatePurchaseOrderPayload(payload) {
  const errors = {}

  if (!payload.id_proveedor) {
    errors.id_proveedor = 'Selecciona un proveedor.'
  }

  if (!payload.fecha_emision) {
    errors.fecha_emision = 'La fecha de emision es obligatoria.'
  }

  if (!Array.isArray(payload.detalles) || payload.detalles.length === 0) {
    errors.detalles = 'Agrega al menos un producto.'
    return errors
  }

  const hasInvalidDetail = payload.detalles.some((detalle) => {
    const cantidad = Number(detalle.cantidad_solicitada)
    const precio = Number(detalle.precio_unitario)

    return !detalle.id_producto ||
      !Number.isInteger(cantidad) ||
      cantidad <= 0 ||
      !Number.isFinite(precio) ||
      precio < 0
  })

  if (hasInvalidDetail) {
    errors.detalles = 'Cada detalle debe tener producto, cantidad mayor a 0 y precio valido.'
  }

  return errors
}

function renderPurchaseOrderErrors(errors) {
  clearPurchaseOrderErrors()

  Object.entries(errors).forEach(([field, message]) => {
    const element = document.querySelector(`[data-purchase-order-error="${field}"]`)

    if (element) {
      element.textContent = message
    }
  })
}

async function handlePurchaseOrderSubmit(event) {
  event.preventDefault()

  const form = event.currentTarget
  const saveButton = document.querySelector('[data-save-purchase-order]')
  const payload = getPurchaseOrderPayload(form)
  const errors = validatePurchaseOrderPayload(payload)

  renderPurchaseOrderErrors(errors)

  if (Object.keys(errors).length > 0) {
    return
  }

  saveButton.disabled = true
  setPurchaseOrderFormStatus('Guardando orden de compra...', 'info')

  try {
    await createOrdenCompra(payload)
    closePurchaseOrderModal()
    await loadPurchaseOrders()
    filterPurchaseOrders()
    setPurchaseOrderStatus('Orden de compra creada correctamente.', 'success')
  } catch (error) {
    setPurchaseOrderFormStatus(error.message, 'error')
  } finally {
    saveButton.disabled = false
  }
}

async function handlePurchaseOrderTableClick(event) {
  const viewButton = event.target.closest('[data-view-purchase-order]')

  if (!viewButton) {
    return
  }

  try {
    const orden = await getOrdenCompra(viewButton.dataset.viewPurchaseOrder)
    document.querySelector('[data-purchase-order-history-title]').textContent = `OC-${String(orden.id_orden).padStart(4, '0')}`
    document.querySelector('[data-purchase-order-history-content]').innerHTML = renderOrdenCompraHistory(orden)
    document.querySelector('[data-purchase-order-history-modal]').hidden = false
  } catch (error) {
    setPurchaseOrderStatus(error.message, 'error')
  }
}

async function handlePurchaseOrderStateChange(event) {
  const select = event.target.closest('[data-update-purchase-order-state]')

  if (!select) {
    return
  }

  select.disabled = true

  try {
    await updateOrdenCompraEstado(select.dataset.updatePurchaseOrderState, select.value)
    await loadPurchaseOrders()
    filterPurchaseOrders()
    setPurchaseOrderStatus('Estado actualizado correctamente.', 'success')
  } catch (error) {
    setPurchaseOrderStatus(error.message, 'error')
  } finally {
    select.disabled = false
  }
}

async function setupOrdenesCompra() {
  setupAuthenticatedNavigation()

  document.querySelector('[data-open-purchase-order-modal]').addEventListener('click', openPurchaseOrderModal)
  document.querySelectorAll('[data-close-purchase-order-modal]').forEach((button) => {
    button.addEventListener('click', closePurchaseOrderModal)
  })
  document.querySelectorAll('[data-close-purchase-order-history]').forEach((button) => {
    button.addEventListener('click', closePurchaseOrderHistoryModal)
  })
  document.querySelector('[data-add-purchase-order-detail]').addEventListener('click', addPurchaseOrderDetailRow)
  document.querySelector('[data-purchase-order-detail-list]').addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-remove-purchase-order-detail]')

    if (removeButton) {
      const rows = document.querySelectorAll('[data-purchase-order-detail-row]')

      if (rows.length > 1) {
        removeButton.closest('[data-purchase-order-detail-row]').remove()
      }
    }
  })
  document.querySelector('[data-purchase-order-detail-list]').addEventListener('change', (event) => {
    const productSelect = event.target.closest('[data-detail-product]')

    if (productSelect) {
      updatePurchaseOrderDetailPrice(productSelect)
    }
  })
  document.querySelector('[data-purchase-order-form]').addEventListener('submit', handlePurchaseOrderSubmit)
  document.querySelector('[data-purchase-order-table-body]').addEventListener('click', handlePurchaseOrderTableClick)
  document.querySelector('[data-purchase-order-table-body]').addEventListener('change', handlePurchaseOrderStateChange)
  document.querySelector('[data-purchase-order-search]').addEventListener('input', filterPurchaseOrders)
  document.querySelector('[data-purchase-order-provider-filter]').addEventListener('change', async () => {
    try {
      await loadPurchaseOrders()
      filterPurchaseOrders()
    } catch (error) {
      setPurchaseOrderStatus(error.message, 'error')
      renderPurchaseOrderTable([])
    }
  })
  document.querySelector('[data-purchase-order-status-filter]').addEventListener('change', async () => {
    try {
      await loadPurchaseOrders()
      filterPurchaseOrders()
    } catch (error) {
      setPurchaseOrderStatus(error.message, 'error')
      renderPurchaseOrderTable([])
    }
  })

  try {
    await loadPurchaseOrderCatalogs()
    await loadPurchaseOrders()
  } catch (error) {
    setPurchaseOrderStatus(error.message, 'error')
    renderPurchaseOrderTable([])
  }
}

function setUserStatus(message, type = 'info') {
  const status = document.querySelector('[data-user-status]')

  if (!status) {
    return
  }

  status.textContent = message
  status.dataset.type = type
}

function setUserFormStatus(message, type = 'info') {
  const status = document.querySelector('[data-user-form-status]')

  if (!status) {
    return
  }

  status.textContent = message
  status.dataset.type = type
}

function getUserById(idUsuario) {
  return usuariosState.find((usuario) => usuario.id === Number(idUsuario))
}

function renderUserTable(usuarios = usuariosState) {
  const tbody = document.querySelector('[data-user-table-body]')
  const summary = document.querySelector('[data-user-summary]')

  if (tbody) {
    tbody.innerHTML = renderUsuarioRows(usuarios)
  }

  if (summary) {
    summary.innerHTML = renderUsuarioSummaryCards(usuariosState)
  }
}

function filterUsers() {
  const search = String(document.querySelector('[data-user-search]')?.value || '').trim().toLowerCase()
  const filter = String(document.querySelector('[data-user-filter]')?.value || '').trim().toLowerCase()
  const source = Array.isArray(usuariosState) ? usuariosState : []

  renderUserTable(
    source.filter((usuario) => {
      const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim().toLowerCase()
      const matchesSearch = !search ||
        nombreCompleto.includes(search) ||
        String(usuario.correo || '').toLowerCase().includes(search)
      const normalizedRole = String(usuario.rol || '').toLowerCase() === 'admin'
        ? 'administrador'
        : String(usuario.rol || '').toLowerCase()
      const matchesFilter = !filter ||
        normalizedRole === filter ||
        String(usuario.estado || '').toLowerCase() === filter

      return matchesSearch && matchesFilter
    })
  )
}

async function loadUsers() {
  setUserStatus('Cargando usuarios...', 'info')
  const usuarios = await getUsuarios('todos')

  if (!Array.isArray(usuarios)) {
    throw new Error('La API de usuarios no devolvio una lista valida.')
  }

  usuariosState = usuarios
  renderUserTable()
  setUserStatus(`${usuariosState.length} usuarios registrados.`, 'success')
}

function clearUserErrors() {
  document.querySelectorAll('[data-user-error]').forEach((element) => {
    element.textContent = ''
  })
}

function hideTemporaryPassword() {
  const element = document.querySelector('[data-temporary-password]')

  if (!element) {
    return
  }

  element.hidden = true
  element.textContent = ''
}

function showTemporaryPassword(password) {
  const element = document.querySelector('[data-temporary-password]')

  if (!element) {
    return
  }

  element.hidden = false
  element.textContent = `Password temporal generado: ${password}`
}

function openUserModal(usuario = null) {
  const modal = document.querySelector('[data-user-modal]')
  const form = document.querySelector('[data-user-form]')
  const title = document.querySelector('[data-user-modal-title]')

  form.reset()
  form.elements.id.value = usuario?.id || ''
  form.elements.nombre.value = usuario?.nombre || ''
  form.elements.apellido.value = usuario?.apellido || ''
  form.elements.correo.value = usuario?.correo || ''
  form.elements.rol.value = usuario?.rol === 'admin' ? 'Administrador' : (usuario?.rol || 'Operador')
  title.textContent = usuario ? 'Editar Usuario' : 'Nuevo Usuario'
  clearUserErrors()
  hideTemporaryPassword()
  setUserFormStatus('', 'info')
  modal.hidden = false
  form.elements.nombre.focus()
}

function closeUserModal() {
  document.querySelector('[data-user-modal]').hidden = true
}

function getUserPayload(form) {
  const formData = new FormData(form)

  return {
    nombre: String(formData.get('nombre') || '').trim(),
    apellido: String(formData.get('apellido') || '').trim(),
    correo: String(formData.get('correo') || '').trim(),
    rol: String(formData.get('rol') || '').trim()
  }
}

function validateUserPayload(payload) {
  const errors = {}

  if (!payload.nombre) {
    errors.nombre = 'El nombre es obligatorio.'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.correo)) {
    errors.correo = 'Ingresa un correo valido.'
  }

  if (!['Administrador', 'Supervisor', 'Operador'].includes(payload.rol)) {
    errors.rol = 'Selecciona un rol valido.'
  }

  return errors
}

function renderUserErrors(errors) {
  clearUserErrors()

  Object.entries(errors).forEach(([field, message]) => {
    const element = document.querySelector(`[data-user-error="${field}"]`)

    if (element) {
      element.textContent = message
    }
  })
}

async function handleUserSubmit(event) {
  event.preventDefault()

  const form = event.currentTarget
  const saveButton = document.querySelector('[data-save-user]')
  const idUsuario = form.elements.id.value
  const payload = getUserPayload(form)
  const errors = validateUserPayload(payload)

  renderUserErrors(errors)

  if (Object.keys(errors).length > 0) {
    return
  }

  saveButton.disabled = true
  setUserFormStatus('Guardando usuario...', 'info')

  try {
    if (idUsuario) {
      await updateUsuario(idUsuario, payload)
      closeUserModal()
      setUserStatus('Usuario actualizado correctamente.', 'success')
    } else {
      const response = await createUsuario(payload)
      showTemporaryPassword(response.temporaryPassword)
      setUserFormStatus('Usuario creado correctamente. Guarda el password temporal antes de cerrar.', 'success')
    }

    await loadUsers()
    filterUsers()
  } catch (error) {
    setUserFormStatus(error.message, 'error')
  } finally {
    saveButton.disabled = false
  }
}

async function handleUserTableClick(event) {
  const editButton = event.target.closest('[data-edit-user]')
  const toggleButton = event.target.closest('[data-toggle-user-state]')

  if (editButton) {
    openUserModal(getUserById(editButton.dataset.editUser))
    return
  }

  if (!toggleButton) {
    return
  }

  const usuario = getUserById(toggleButton.dataset.toggleUserState)

  if (!usuario) {
    return
  }

  const nextState = toggleButton.dataset.nextState
  const action = nextState === 'activo' ? 'reactivar' : 'desactivar'
  const confirmed = window.confirm(`Confirmar ${action} usuario "${usuario.nombre}"?`)

  if (!confirmed) {
    return
  }

  try {
    if (nextState === 'inactivo') {
      await deleteUsuario(usuario.id)
      setUserStatus('Usuario desactivado correctamente.', 'success')
    } else {
      await reactivateUsuario(usuario.id)
      setUserStatus('Usuario reactivado correctamente.', 'success')
    }

    await loadUsers()
    filterUsers()
  } catch (error) {
    setUserStatus(error.message, 'error')
  }
}

async function setupUsuarios() {
  setupAuthenticatedNavigation()

  document.querySelector('[data-open-user-modal]').addEventListener('click', () => {
    openUserModal()
  })
  document.querySelectorAll('[data-close-user-modal]').forEach((button) => {
    button.addEventListener('click', closeUserModal)
  })
  document.querySelector('[data-user-form]').addEventListener('submit', handleUserSubmit)
  document.querySelector('[data-user-table-body]').addEventListener('click', handleUserTableClick)
  document.querySelector('[data-user-search]').addEventListener('input', filterUsers)
  document.querySelector('[data-user-filter]').addEventListener('change', filterUsers)

  try {
    await loadUsers()
  } catch (error) {
    setUserStatus(error.message, 'error')
    renderUserTable([])
  }
}

function setReportStatus(message, type = 'info') {
  const status = document.querySelector('[data-report-status]')

  if (!status) {
    return
  }

  status.textContent = message
  status.dataset.type = type
}

function renderReportData(data) {
  const summary = document.querySelector('[data-report-summary]')
  const stockActual = document.querySelector('[data-report-stock-current]')
  const stockBajo = document.querySelector('[data-report-stock-low]')
  const movimientosFecha = document.querySelector('[data-report-movements-date]')
  const productosUsados = document.querySelector('[data-report-products-used]')
  const comprasProveedor = document.querySelector('[data-report-purchases-supplier]')

  if (summary) {
    summary.innerHTML = renderReporteSummaryCards(data)
  }

  if (stockActual) {
    stockActual.innerHTML = renderStockActualRows(data.stockActual)
  }

  if (stockBajo) {
    stockBajo.innerHTML = renderStockBajoRows(data.stockBajo)
  }

  if (movimientosFecha) {
    movimientosFecha.innerHTML = renderMovimientosFechaRows(data.movimientosPorFecha)
  }

  if (productosUsados) {
    productosUsados.innerHTML = renderProductosUsadosRows(data.productosMasUsados)
  }

  if (comprasProveedor) {
    comprasProveedor.innerHTML = renderComprasProveedorRows(data.comprasPorProveedor)
  }
}

async function loadReports() {
  const fechaInicio = String(document.querySelector('[data-report-start-date]')?.value || '').trim()
  const fechaFin = String(document.querySelector('[data-report-end-date]')?.value || '').trim()

  setReportStatus('Generando reportes...', 'info')
  const data = await getReportes({ fechaInicio, fechaFin })
  renderReportData(data)
  setReportStatus('Reportes actualizados.', 'success')
}

async function setupReportes() {
  setupAuthenticatedNavigation()

  const getReportExportParams = () => ({
    fechaInicio: String(document.querySelector('[data-report-start-date]')?.value || '').trim(),
    fechaFin: String(document.querySelector('[data-report-end-date]')?.value || '').trim()
  })

  document.querySelector('[data-export-reports-pdf]').addEventListener('click', () => {
    handleExport('reportes', 'pdf', getReportExportParams(), setReportStatus)
  })
  document.querySelector('[data-export-reports-excel]').addEventListener('click', () => {
    handleExport('reportes', 'excel', getReportExportParams(), setReportStatus)
  })

  document.querySelector('[data-refresh-reports]').addEventListener('click', async () => {
    try {
      await loadReports()
    } catch (error) {
      setReportStatus(error.message, 'error')
    }
  })
  document.querySelector('[data-report-start-date]').addEventListener('change', async () => {
    try {
      await loadReports()
    } catch (error) {
      setReportStatus(error.message, 'error')
    }
  })
  document.querySelector('[data-report-end-date]').addEventListener('change', async () => {
    try {
      await loadReports()
    } catch (error) {
      setReportStatus(error.message, 'error')
    }
  })

  try {
    await loadReports()
  } catch (error) {
    setReportStatus(error.message, 'error')
  }
}

function setAuditStatus(message, type = 'info') {
  const status = document.querySelector('[data-audit-status]')

  if (!status) {
    return
  }

  status.textContent = message
  status.dataset.type = type
}

function renderAuditTable(items = auditoriasState) {
  const tbody = document.querySelector('[data-audit-table-body]')
  const summary = document.querySelector('[data-audit-summary]')

  if (tbody) {
    tbody.innerHTML = renderAuditoriaRows(items)
  }

  if (summary) {
    summary.innerHTML = renderAuditoriaSummaryCards(auditoriasState)
  }
}

function filterAudits() {
  const search = String(document.querySelector('[data-audit-search]')?.value || '').trim().toLowerCase()
  const user = String(document.querySelector('[data-audit-user-filter]')?.value || '').trim()
  const moduleName = String(document.querySelector('[data-audit-module-filter]')?.value || '').trim()
  const action = String(document.querySelector('[data-audit-action-filter]')?.value || '').trim()
  const date = String(document.querySelector('[data-audit-date-filter]')?.value || '').trim()

  renderAuditTable(
    auditoriasState.filter((item) => {
      const matchesSearch = !search ||
        String(item.usuario_nombre || '').toLowerCase().includes(search) ||
        String(item.modulo || '').toLowerCase().includes(search) ||
        String(item.accion || '').toLowerCase().includes(search) ||
        String(item.descripcion || '').toLowerCase().includes(search)
      const matchesUser = !user || item.usuario_nombre === user
      const matchesModule = !moduleName || item.modulo === moduleName
      const matchesAction = !action || item.accion === action
      const matchesDate = !date || String(item.fecha || '').slice(0, 10) === date

      return matchesSearch && matchesUser && matchesModule && matchesAction && matchesDate
    })
  )
}

async function loadAudits() {
  setAuditStatus('Cargando auditoria...', 'info')
  auditoriasState = await getAuditorias()
  renderAuditTable()

  const userFilter = document.querySelector('[data-audit-user-filter]')
  const moduleFilter = document.querySelector('[data-audit-module-filter]')

  if (userFilter) {
    userFilter.innerHTML = renderAuditFilterOptions(auditoriasState.map((item) => item.usuario_nombre), 'Todos los usuarios')
  }

  if (moduleFilter) {
    moduleFilter.innerHTML = renderAuditFilterOptions(auditoriasState.map((item) => item.modulo), 'Todos los modulos')
  }

  setAuditStatus(`${auditoriasState.length} registros de auditoria.`, 'success')
}

async function setupAuditoria() {
  setupAuthenticatedNavigation()

  document.querySelector('[data-export-audit-pdf]').addEventListener('click', () => {
    handleExport('auditoria', 'pdf', {}, setAuditStatus)
  })
  document.querySelector('[data-export-audit-excel]').addEventListener('click', () => {
    handleExport('auditoria', 'excel', {}, setAuditStatus)
  })

  document.querySelector('[data-audit-search]').addEventListener('input', filterAudits)
  document.querySelector('[data-audit-user-filter]').addEventListener('change', filterAudits)
  document.querySelector('[data-audit-module-filter]').addEventListener('change', filterAudits)
  document.querySelector('[data-audit-action-filter]').addEventListener('change', filterAudits)
  document.querySelector('[data-audit-date-filter]').addEventListener('change', filterAudits)

  try {
    await loadAudits()
  } catch (error) {
    setAuditStatus(error.message, 'error')
    renderAuditTable([])
  }
}

function renderApp() {
  const path = window.location.pathname
  const usuario = getUsuario()
  const protectedPaths = ['/dashboard', '/categorias', '/productos', '/almacenes', '/ubicaciones', '/stock', '/kardex', '/movimientos', '/proveedores', '/ordenes-compra', '/usuarios', '/reportes', '/auditoria']

  if (protectedPaths.includes(path)) {
    if (!usuario) {
      window.history.replaceState({}, '', '/')
      app.innerHTML = renderLogin()
      setupLogin()
      return
    }

    if (!canAccessPath(usuario, path)) {
      window.history.replaceState({}, '', '/dashboard')
      app.innerHTML = renderDashboard(usuario)
      setupDashboard()
      setDashboardStatus('No tiene permisos para acceder a este modulo.', 'error')
      return
    }

    if (path === '/categorias') {
      app.innerHTML = renderCategorias(usuario)
      setupCategorias()
      return
    }

    if (path === '/productos') {
      app.innerHTML = renderProductos(usuario)
      setupProductos()
      return
    }

    if (path === '/almacenes') {
      app.innerHTML = renderAlmacenes(usuario)
      setupAlmacenes()
      return
    }

    if (path === '/ubicaciones') {
      app.innerHTML = renderUbicaciones(usuario)
      setupUbicaciones()
      return
    }

    if (path === '/stock') {
      app.innerHTML = renderStock(usuario)
      setupStock()
      return
    }

    if (path === '/kardex') {
      app.innerHTML = renderKardex(usuario)
      setupKardex()
      return
    }

    if (path === '/movimientos') {
      app.innerHTML = renderMovimientos(usuario)
      setupMovimientos()
      return
    }

    if (path === '/proveedores') {
      app.innerHTML = renderProveedores(usuario)
      setupProveedores()
      return
    }

    if (path === '/ordenes-compra') {
      app.innerHTML = renderOrdenesCompra(usuario)
      setupOrdenesCompra()
      return
    }

    if (path === '/usuarios') {
      app.innerHTML = renderUsuarios(usuario)
      setupUsuarios()
      return
    }

    if (path === '/reportes') {
      app.innerHTML = renderReportes(usuario)
      setupReportes()
      return
    }

    if (path === '/auditoria') {
      app.innerHTML = renderAuditoria(usuario)
      setupAuditoria()
      return
    }

    app.innerHTML = renderDashboard(usuario)
    setupDashboard()
    return
  }

  if (usuario) {
    window.history.replaceState({}, '', '/dashboard')
    app.innerHTML = renderDashboard(usuario)
    setupDashboard()
    return
  }

  app.innerHTML = renderLogin()
  setupLogin()
}

window.addEventListener('popstate', renderApp)

renderApp()
