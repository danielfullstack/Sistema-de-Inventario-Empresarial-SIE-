import { escapeHtml, renderHeader, renderSidebar, svg } from './erpLayout.js'

const icons = {
  box: 'M21 8.5 12 3 3 8.5v7L12 21l9-5.5v-7ZM3 8.5l9 5.5 9-5.5M12 14v7',
  warehouse: 'M3 10 12 4l9 6v11H3V10Zm5 11v-7h8v7',
  truck: 'M3 7h11v9H3V7Zm11 3h4l3 3v3h-7v-6ZM6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  cart: 'M5 6h2l2 10h8l2-7H8M10 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  trend: 'M4 17 10 11l4 4 6-8M20 7h-6m6 0v6',
  warning: 'M12 3 2 21h20L12 3Zm0 6v5m0 4h.01',
  refresh: 'M20 12a8 8 0 0 1-14.8 4.2M4 12A8 8 0 0 1 18.8 7.8M4 18v-6h6m10-6v6h-6'
}

function formatNumber(value) {
  return new Intl.NumberFormat('es-PE').format(Number(value || 0))
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(Number(value || 0))
}

function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value))
}

function normalizeMovementQuantity(movimiento) {
  const cantidad = Number(movimiento.cantidad || 0)

  if (String(movimiento.tipo).toUpperCase() === 'SALIDA') {
    return `-${formatNumber(cantidad)}`
  }

  return `+${formatNumber(cantidad)}`
}

function renderMetricCard([title, value, detail, icon]) {
  return `
    <article class="inventory-card">
      <div class="inventory-card-icon">${svg(icons[icon], 'metric-icon')}</div>
      <div>
        <span>${escapeHtml(title)}</span>
        <strong>${formatNumber(value)}</strong>
        <p>${escapeHtml(detail)}</p>
      </div>
    </article>
  `
}

export function getDashboardMetrics(summary = {}) {
  return [
    ['Total Productos', summary.total_productos, 'Productos registrados', 'box'],
    ['Total Almacenes', summary.total_almacenes, 'Almacenes operativos', 'warehouse'],
    ['Proveedores Activos', summary.proveedores_activos, 'Proveedores habilitados', 'truck'],
    ['Ordenes Pendientes', summary.ordenes_pendientes, 'Ordenes por aprobar', 'cart'],
    ['Stock Total', summary.stock_total, 'Unidades en inventario', 'trend'],
    ['Productos Bajo Stock', summary.productos_stock_bajo, 'Requieren reposicion', 'warning'],
    ['Movimientos Hoy', summary.movimientos_hoy, 'Entradas, salidas y ajustes', 'refresh']
  ]
}

export function renderDashboardMetrics(summary = {}) {
  return getDashboardMetrics(summary).map(renderMetricCard).join('')
}

export function renderDashboardMovements(movimientos = []) {
  if (!Array.isArray(movimientos) || movimientos.length === 0) {
    return `
      <tr>
        <td colspan="6">No existen movimientos recientes.</td>
      </tr>
    `
  }

  return movimientos.map((movimiento) => {
    const quantity = normalizeMovementQuantity(movimiento)

    return `
      <tr>
        <td>${formatDate(movimiento.fecha)}</td>
        <td>${escapeHtml(movimiento.producto_nombre || '-')}</td>
        <td><span class="movement-type">${escapeHtml(movimiento.tipo || '-')}</span></td>
        <td class="${quantity.startsWith('+') ? 'qty-in' : 'qty-out'}">${quantity}</td>
        <td>${escapeHtml(movimiento.almacen_nombre || '-')}</td>
        <td>${escapeHtml(movimiento.usuario_nombre || '-')}</td>
      </tr>
    `
  }).join('')
}

export function renderDashboardOrders(ordenes = []) {
  if (!Array.isArray(ordenes) || ordenes.length === 0) {
    return '<p class="empty-panel">No existen ordenes recientes.</p>'
  }

  return ordenes.map((orden) => `
    <article class="purchase-order">
      <strong>OC-${String(orden.id_orden).padStart(4, '0')}</strong>
      <span>${escapeHtml(orden.proveedor_nombre || '-')}</span>
      <small>${escapeHtml(orden.estado || 'Pendiente')} · ${formatCurrency(orden.total)}</small>
    </article>
  `).join('')
}

export function renderDashboardLowStock(stockItems = []) {
  if (!Array.isArray(stockItems) || stockItems.length === 0) {
    return '<p class="empty-panel">No hay productos bajo stock minimo.</p>'
  }

  return stockItems.map((item) => `
    <article class="low-stock-item">
      <strong>${escapeHtml(item.producto_nombre || '-')}</strong>
      <span>${escapeHtml(item.almacen_nombre || '-')}</span>
      <small>${formatNumber(item.cantidad_actual)} / minimo ${formatNumber(item.stock_minimo)}</small>
    </article>
  `).join('')
}

export function renderDashboard(usuario) {
  return `
    <main class="erp-shell">
      ${renderSidebar('/dashboard')}

      <section class="erp-workspace">
        ${renderHeader(usuario)}

        <section class="erp-content">
          <div class="erp-main-panel">
            <div class="page-heading dashboard-heading">
              <div>
                <p class="eyebrow">Control de inventario</p>
                <h1>Dashboard Inteligente</h1>
              </div>
              <p class="module-status" data-dashboard-status>Cargando indicadores...</p>
            </div>

            <section class="inventory-grid" aria-label="Indicadores principales de inventario" data-dashboard-metrics>
              ${renderDashboardMetrics()}
            </section>

            <section class="movement-panel">
              <div class="section-heading">
                <h2>Movimientos Recientes</h2>
                <span>Producto, stock, almacen y usuario</span>
              </div>

              <div class="responsive-table">
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Producto</th>
                      <th>Tipo Movimiento</th>
                      <th>Cantidad</th>
                      <th>Almacen</th>
                      <th>Usuario</th>
                    </tr>
                  </thead>
                  <tbody data-dashboard-movements>
                    <tr>
                      <td colspan="6">Cargando movimientos...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside class="dashboard-side-panel" aria-label="Resumen operativo">
            <section class="orders-panel">
              <div class="section-heading">
                <h2>Ordenes de Compra Recientes</h2>
                <span>Seguimiento operativo</span>
              </div>
              <div data-dashboard-orders>
                <p class="empty-panel">Cargando ordenes...</p>
              </div>
            </section>

            <section class="orders-panel low-stock-panel">
              <div class="section-heading">
                <h2>Stock Bajo</h2>
                <span>Productos por reponer</span>
              </div>
              <div data-dashboard-low-stock>
                <p class="empty-panel">Cargando stock bajo...</p>
              </div>
            </section>
          </aside>
        </section>
      </section>
    </main>
  `
}
