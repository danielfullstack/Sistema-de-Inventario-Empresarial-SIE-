import { escapeHtml, renderHeader, renderSidebar } from './erpLayout.js'

function number(value) {
  return Number(value || 0)
}

function formatNumber(value) {
  return new Intl.NumberFormat('es-PE').format(number(value))
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(number(value))
}

function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('es-PE').format(new Date(value))
}

export function renderReportes(usuario) {
  return `
    <main class="erp-shell">
      ${renderSidebar('/reportes')}

      <section class="erp-workspace">
        ${renderHeader(usuario, 'Buscar reporte...')}

        <section class="erp-content module-content">
          <div class="module-panel">
            <div class="module-toolbar">
              <div>
                <p class="eyebrow">Analisis operativo</p>
                <h1>Reportes</h1>
              </div>
              <div class="row-actions">
                <button class="secondary-button" type="button" data-export-reports-pdf>Exportar PDF</button>
                <button class="secondary-button" type="button" data-export-reports-excel>Exportar Excel</button>
              </div>
            </div>

            <section class="stock-summary-grid" data-report-summary>
              ${renderReporteSummaryCards()}
            </section>

            <div class="module-filters products-filters">
              <label class="module-search" for="report-start-date">
                <span>Fecha inicio</span>
                <input id="report-start-date" type="date" data-report-start-date />
              </label>

              <label class="module-search" for="report-end-date">
                <span>Fecha fin</span>
                <input id="report-end-date" type="date" data-report-end-date />
              </label>

              <button class="secondary-button" type="button" data-refresh-reports>Actualizar</button>
              <p class="module-status" data-report-status>Cargando reportes...</p>
            </div>

            <div class="reports-grid">
              ${renderReportSection('Stock actual', 'report-stock-current', ['Codigo', 'Producto', 'Almacen', 'Actual', 'Reservado', 'Disponible', 'Minimo'], 7)}
              ${renderReportSection('Stock bajo', 'report-stock-low', ['Codigo', 'Producto', 'Almacen', 'Actual', 'Minimo'], 5)}
              ${renderReportSection('Movimientos por fecha', 'report-movements-date', ['Fecha', 'Tipo', 'Movimientos', 'Cantidad total'], 4)}
              ${renderReportSection('Productos mas usados', 'report-products-used', ['Codigo', 'Producto', 'Movimientos', 'Cantidad total'], 4)}
              ${renderReportSection('Compras por proveedor', 'report-purchases-supplier', ['RUC', 'Proveedor', 'Ordenes', 'Total compras'], 4)}
            </div>
          </div>
        </section>
      </section>
    </main>
  `
}

export function renderReporteSummaryCards(data = {}) {
  const stockActual = Array.isArray(data.stockActual) ? data.stockActual : []
  const stockBajo = Array.isArray(data.stockBajo) ? data.stockBajo : []
  const movimientos = Array.isArray(data.movimientosPorFecha) ? data.movimientosPorFecha : []
  const compras = Array.isArray(data.comprasPorProveedor) ? data.comprasPorProveedor : []
  const stockTotal = stockActual.reduce((sum, item) => sum + number(item.cantidad_actual), 0)
  const totalMovimientos = movimientos.reduce((sum, item) => sum + number(item.total_movimientos), 0)
  const totalCompras = compras.reduce((sum, item) => sum + number(item.total_compras), 0)

  return `
    <article class="inventory-card stock-summary-card">
      <div>
        <span>Stock Actual</span>
        <strong>${formatNumber(stockTotal)}</strong>
        <p>Unidades registradas.</p>
      </div>
    </article>
    <article class="inventory-card stock-summary-card">
      <div>
        <span>Stock Bajo</span>
        <strong>${formatNumber(stockBajo.length)}</strong>
        <p>Productos por reponer.</p>
      </div>
    </article>
    <article class="inventory-card stock-summary-card">
      <div>
        <span>Movimientos</span>
        <strong>${formatNumber(totalMovimientos)}</strong>
        <p>Segun rango seleccionado.</p>
      </div>
    </article>
    <article class="inventory-card stock-summary-card">
      <div>
        <span>Compras</span>
        <strong>${formatCurrency(totalCompras)}</strong>
        <p>Total por proveedores.</p>
      </div>
    </article>
  `
}

export function renderStockActualRows(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return emptyRows(7, 'No existen registros de stock.')
  }

  return items.map((item) => `
    <tr>
      <td><strong>${escapeHtml(item.codigo_producto)}</strong></td>
      <td>${escapeHtml(item.producto_nombre)}</td>
      <td>${escapeHtml(item.almacen_nombre)}</td>
      <td>${formatNumber(item.cantidad_actual)}</td>
      <td>${formatNumber(item.cantidad_reservada)}</td>
      <td>${formatNumber(item.stock_disponible)}</td>
      <td>${formatNumber(item.stock_minimo)}</td>
    </tr>
  `).join('')
}

export function renderStockBajoRows(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return emptyRows(5, 'No hay productos con stock bajo.')
  }

  return items.map((item) => `
    <tr>
      <td><strong>${escapeHtml(item.codigo_producto)}</strong></td>
      <td>${escapeHtml(item.producto_nombre)}</td>
      <td>${escapeHtml(item.almacen_nombre)}</td>
      <td class="qty-out">${formatNumber(item.cantidad_actual)}</td>
      <td>${formatNumber(item.stock_minimo)}</td>
    </tr>
  `).join('')
}

export function renderMovimientosFechaRows(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return emptyRows(4, 'No hay movimientos en el rango seleccionado.')
  }

  return items.map((item) => `
    <tr>
      <td>${formatDate(item.fecha)}</td>
      <td><span class="movement-type">${escapeHtml(item.tipo)}</span></td>
      <td>${formatNumber(item.total_movimientos)}</td>
      <td>${formatNumber(item.cantidad_total)}</td>
    </tr>
  `).join('')
}

export function renderProductosUsadosRows(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return emptyRows(4, 'No hay productos usados en el rango seleccionado.')
  }

  return items.map((item) => `
    <tr>
      <td><strong>${escapeHtml(item.codigo_producto)}</strong></td>
      <td>${escapeHtml(item.producto_nombre)}</td>
      <td>${formatNumber(item.total_movimientos)}</td>
      <td>${formatNumber(item.cantidad_total)}</td>
    </tr>
  `).join('')
}

export function renderComprasProveedorRows(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return emptyRows(4, 'No hay compras por proveedor en el rango seleccionado.')
  }

  return items.map((item) => `
    <tr>
      <td><strong>${escapeHtml(item.ruc)}</strong></td>
      <td>${escapeHtml(item.proveedor_nombre)}</td>
      <td>${formatNumber(item.total_ordenes)}</td>
      <td>${formatCurrency(item.total_compras)}</td>
    </tr>
  `).join('')
}

function renderReportSection(title, bodyName, headings, colspan) {
  return `
    <section class="report-section">
      <div class="section-heading">
        <h2>${title}</h2>
      </div>
      <div class="responsive-table">
        <table class="reports-table">
          <thead>
            <tr>${headings.map((heading) => `<th>${heading}</th>`).join('')}</tr>
          </thead>
          <tbody data-${bodyName}>
            ${emptyRows(colspan, 'Cargando reporte...')}
          </tbody>
        </table>
      </div>
    </section>
  `
}

function emptyRows(colspan, message) {
  return `
    <tr>
      <td colspan="${colspan}">${message}</td>
    </tr>
  `
}
