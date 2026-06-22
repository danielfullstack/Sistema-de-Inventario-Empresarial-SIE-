import { escapeHtml, renderHeader, renderSidebar } from './erpLayout.js'

function number(value) {
  return Number(value || 0)
}

function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

function typeClass(tipo = '') {
  const normalized = String(tipo).toUpperCase()

  if (normalized === 'ENTRADA') {
    return 'active'
  }

  if (normalized === 'SALIDA') {
    return 'inactive'
  }

  return 'warning'
}

export function renderKardex(usuario) {
  return `
    <main class="erp-shell">
      ${renderSidebar('/kardex')}

      <section class="erp-workspace">
        ${renderHeader(usuario, 'Buscar Kardex...')}

        <section class="erp-content module-content">
          <div class="module-panel">
            <div class="module-toolbar">
              <div>
                <p class="eyebrow">Historial valorizado operativo</p>
                <h1>Kardex de Inventario</h1>
              </div>
              <div class="row-actions">
                <button class="secondary-button" type="button" data-export-kardex-pdf>Exportar PDF</button>
                <button class="secondary-button" type="button" data-export-kardex-excel>Exportar Excel</button>
              </div>
            </div>

            <section class="stock-summary-grid" data-kardex-summary>
              ${renderKardexSummaryCards()}
            </section>

            <div class="module-filters products-filters">
              <label class="module-search" for="kardex-product-filter">
                <span>Producto</span>
                <select id="kardex-product-filter" data-kardex-product-filter></select>
              </label>

              <label class="module-search" for="kardex-warehouse-filter">
                <span>Almacen</span>
                <select id="kardex-warehouse-filter" data-kardex-warehouse-filter></select>
              </label>

              <label class="module-search" for="kardex-start-date">
                <span>Fecha Inicio</span>
                <input id="kardex-start-date" type="date" data-kardex-start-date />
              </label>

              <label class="module-search" for="kardex-end-date">
                <span>Fecha Fin</span>
                <input id="kardex-end-date" type="date" data-kardex-end-date />
              </label>

              <p class="module-status" data-kardex-status>Seleccione un producto para visualizar el Kardex.</p>
            </div>

            <div class="responsive-table stock-table-wrap">
              <table class="stock-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Producto</th>
                    <th>Almacen</th>
                    <th>Entrada</th>
                    <th>Salida</th>
                    <th>Saldo</th>
                    <th>Usuario</th>
                    <th>Referencia</th>
                  </tr>
                </thead>
                <tbody data-kardex-table-body>
                  <tr>
                    <td colspan="9">Seleccione un producto para visualizar el Kardex.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </section>
    </main>
  `
}

export function renderKardexSummaryCards(summary = {}) {
  return `
    <article class="inventory-card stock-summary-card">
      <div>
        <span>Stock Actual</span>
        <strong>${number(summary.stockActual)}</strong>
        <p>Existencia actual.</p>
      </div>
    </article>
    <article class="inventory-card stock-summary-card">
      <div>
        <span>Entradas Totales</span>
        <strong>${number(summary.entradasTotales)}</strong>
        <p>Ingresos filtrados.</p>
      </div>
    </article>
    <article class="inventory-card stock-summary-card">
      <div>
        <span>Salidas Totales</span>
        <strong>${number(summary.salidasTotales)}</strong>
        <p>Egresos filtrados.</p>
      </div>
    </article>
    <article class="inventory-card stock-summary-card">
      <div>
        <span>Movimientos Totales</span>
        <strong>${number(summary.movimientosTotales)}</strong>
        <p>Registros encontrados.</p>
      </div>
    </article>
  `
}

export function renderKardexRows(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return `
      <tr>
        <td colspan="9">No existen movimientos para los filtros seleccionados.</td>
      </tr>
    `
  }

  return items.map((item) => `
    <tr>
      <td>${formatDate(item.fecha)}</td>
      <td><span class="status-badge ${typeClass(item.tipo)}">${escapeHtml(item.tipo)}</span></td>
      <td>${escapeHtml(item.codigo_producto)} - ${escapeHtml(item.producto_nombre)}</td>
      <td>${escapeHtml(item.almacen_nombre)}</td>
      <td class="qty-in">${number(item.entrada) || '-'}</td>
      <td class="qty-out">${number(item.salida) || '-'}</td>
      <td><strong>${number(item.saldo)}</strong></td>
      <td>${escapeHtml(item.usuario_nombre || '-')}</td>
      <td>${escapeHtml(item.referencia || item.motivo || '-')}</td>
    </tr>
  `).join('')
}

export function renderKardexProductOptions(productos, selectedId = null) {
  const options = productos.map((producto) => `
    <option value="${producto.id_producto}" ${producto.id_producto === selectedId ? 'selected' : ''}>
      ${escapeHtml(producto.codigo_producto)} - ${escapeHtml(producto.nombre)}
    </option>
  `).join('')

  return `<option value="">Seleccionar producto</option>${options}`
}

export function renderKardexWarehouseOptions(almacenes, selectedId = null) {
  const options = almacenes.map((almacen) => `
    <option value="${almacen.id_almacen}" ${almacen.id_almacen === selectedId ? 'selected' : ''}>
      ${escapeHtml(almacen.nombre)}
    </option>
  `).join('')

  return `<option value="">Todos los almacenes</option>${options}`
}
