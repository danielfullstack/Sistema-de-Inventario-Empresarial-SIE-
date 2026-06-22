import { escapeHtml, renderHeader, renderSidebar } from './erpLayout.js'

function number(value) {
  return Number(value || 0)
}

export function getStockSummary(stockItems) {
  const totalProductos = new Set(stockItems.map((item) => item.id_producto)).size
  const totalStock = stockItems.reduce((sum, item) => sum + number(item.cantidad_actual), 0)
  const totalReservado = stockItems.reduce((sum, item) => sum + number(item.cantidad_reservada), 0)
  const stockBajo = stockItems.filter((item) => number(item.cantidad_actual) <= number(item.stock_minimo)).length

  return {
    totalProductos,
    totalStock,
    totalReservado,
    stockBajo
  }
}

export function renderStock(usuario) {
  return `
    <main class="erp-shell">
      ${renderSidebar('/stock')}

      <section class="erp-workspace">
        ${renderHeader(usuario, 'Buscar stock...')}

        <section class="erp-content module-content">
          <div class="module-panel">
            <div class="module-toolbar">
              <div>
                <p class="eyebrow">Inventario disponible</p>
                <h1>Control de Stock</h1>
              </div>
              <div class="row-actions">
                <button class="secondary-button" type="button" data-export-stock-pdf>Exportar PDF</button>
                <button class="secondary-button" type="button" data-export-stock-excel>Exportar Excel</button>
              </div>
            </div>

            <section class="stock-summary-grid" data-stock-summary>
              ${renderStockSummaryCards({ totalProductos: 0, totalStock: 0, totalReservado: 0, stockBajo: 0 })}
            </section>

            <div class="module-filters products-filters">
              <label class="module-search" for="stock-search">
                <span>Buscar</span>
                <input id="stock-search" type="search" placeholder="Buscar por codigo o producto..." data-stock-search />
              </label>

              <label class="module-search" for="stock-warehouse-filter">
                <span>Almacen</span>
                <select id="stock-warehouse-filter" data-stock-warehouse-filter></select>
              </label>

              <label class="module-search" for="stock-product-filter">
                <span>Producto</span>
                <input id="stock-product-filter" type="search" placeholder="Producto especifico..." data-stock-product-filter />
              </label>

              <p class="module-status" data-stock-status>Cargando stock...</p>
            </div>

            <div class="responsive-table stock-table-wrap">
              <table class="stock-table">
                <thead>
                  <tr>
                    <th>Codigo</th>
                    <th>Producto</th>
                    <th>Almacen</th>
                    <th>Stock Actual</th>
                    <th>Stock Reservado</th>
                    <th>Stock Disponible</th>
                    <th>Stock Minimo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody data-stock-table-body>
                  <tr>
                    <td colspan="8">Cargando stock...</td>
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

export function renderStockSummaryCards(summary) {
  return `
    <article class="inventory-card stock-summary-card">
      <div>
        <span>Total Productos</span>
        <strong>${summary.totalProductos}</strong>
        <p>Productos con stock registrado.</p>
      </div>
    </article>
    <article class="inventory-card stock-summary-card">
      <div>
        <span>Total Stock</span>
        <strong>${summary.totalStock}</strong>
        <p>Unidades actuales.</p>
      </div>
    </article>
    <article class="inventory-card stock-summary-card">
      <div>
        <span>Stock Reservado</span>
        <strong>${summary.totalReservado}</strong>
        <p>Unidades comprometidas.</p>
      </div>
    </article>
    <article class="inventory-card stock-summary-card">
      <div>
        <span>Productos con Stock Bajo</span>
        <strong>${summary.stockBajo}</strong>
        <p>Requieren reposicion.</p>
      </div>
    </article>
  `
}

export function renderStockRows(stockItems) {
  if (!Array.isArray(stockItems)) {
    return `
      <tr>
        <td colspan="8">No se pudo interpretar la lista de stock.</td>
      </tr>
    `
  }

  if (stockItems.length === 0) {
    return `
      <tr>
        <td colspan="8">No existen registros de stock.</td>
      </tr>
    `
  }

  return stockItems.map((item) => {
    const isLow = number(item.cantidad_actual) <= number(item.stock_minimo)

    return `
      <tr>
        <td><strong>${escapeHtml(item.codigo_producto)}</strong></td>
        <td>${escapeHtml(item.producto_nombre)}</td>
        <td>${escapeHtml(item.almacen_nombre)}</td>
        <td>${number(item.cantidad_actual)}</td>
        <td>${number(item.cantidad_reservada)}</td>
        <td>${number(item.stock_disponible)}</td>
        <td>${number(item.stock_minimo)}</td>
        <td>
          <span class="status-badge ${isLow ? 'inactive' : 'active'}">
            ${isLow ? 'Stock Bajo' : 'Stock Normal'}
          </span>
        </td>
      </tr>
    `
  }).join('')
}

export function renderStockAlmacenOptions(almacenes, selectedId = null) {
  const options = almacenes.map((almacen) => `
    <option value="${almacen.id_almacen}" ${almacen.id_almacen === selectedId ? 'selected' : ''}>
      ${escapeHtml(almacen.nombre)}
    </option>
  `).join('')

  return `<option value="">Todos los almacenes</option>${options}`
}
