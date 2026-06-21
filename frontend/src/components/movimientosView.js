import { escapeHtml, renderHeader, renderSidebar } from './erpLayout.js'

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

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function getMovimientoSummary(movimientos) {
  return {
    entradas: movimientos.filter((item) => item.tipo === 'ENTRADA').length,
    salidas: movimientos.filter((item) => item.tipo === 'SALIDA').length,
    ajustes: movimientos.filter((item) => item.tipo === 'AJUSTE').length,
    hoy: movimientos.filter((item) => String(item.fecha || item.created_at || '').slice(0, 10) === todayKey()).length
  }
}

export function renderMovimientos(usuario) {
  return `
    <main class="erp-shell">
      ${renderSidebar('/movimientos')}

      <section class="erp-workspace">
        ${renderHeader(usuario, 'Buscar movimiento...')}

        <section class="erp-content module-content">
          <div class="module-panel">
            <div class="module-toolbar">
              <div>
                <p class="eyebrow">Kardex operativo</p>
                <h1>Movimientos de Inventario</h1>
              </div>

              <button class="primary-button module-primary-button" type="button" data-open-movement-modal>
                Nuevo Movimiento
              </button>
            </div>

            <section class="stock-summary-grid" data-movement-summary>
              ${renderMovimientoSummaryCards({ entradas: 0, salidas: 0, ajustes: 0, hoy: 0 })}
            </section>

            <div class="module-filters products-filters">
              <label class="module-search" for="movement-search">
                <span>Buscar</span>
                <input id="movement-search" type="search" placeholder="Buscar movimiento..." data-movement-search />
              </label>

              <label class="module-search" for="movement-product-filter">
                <span>Producto</span>
                <select id="movement-product-filter" data-movement-product-filter></select>
              </label>

              <label class="module-search" for="movement-warehouse-filter">
                <span>Almacen</span>
                <select id="movement-warehouse-filter" data-movement-warehouse-filter></select>
              </label>

              <label class="module-search" for="movement-type-filter">
                <span>Tipo</span>
                <select id="movement-type-filter" data-movement-type-filter>
                  <option value="">Todos los tipos</option>
                  <option value="ENTRADA">ENTRADA</option>
                  <option value="SALIDA">SALIDA</option>
                  <option value="AJUSTE">AJUSTE</option>
                </select>
              </label>

              <label class="module-search" for="movement-date-filter">
                <span>Fecha</span>
                <input id="movement-date-filter" type="date" data-movement-date-filter />
              </label>

              <p class="module-status" data-movement-status>Cargando movimientos...</p>
            </div>

            <div class="responsive-table movements-table-wrap">
              <table class="movements-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Producto</th>
                    <th>Almacen</th>
                    <th>Cantidad</th>
                    <th>Usuario</th>
                    <th>Referencia</th>
                    <th>Motivo</th>
                  </tr>
                </thead>
                <tbody data-movement-table-body>
                  <tr>
                    <td colspan="8">Cargando movimientos...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </section>

      <div class="modal-backdrop" data-movement-modal hidden>
        <section class="category-modal product-modal" role="dialog" aria-modal="true" aria-labelledby="movement-modal-title">
          <div class="modal-header">
            <div>
              <p class="eyebrow">Movimiento</p>
              <h2 id="movement-modal-title">Nuevo Movimiento</h2>
            </div>
            <button class="icon-button" type="button" aria-label="Cerrar modal" data-close-movement-modal>
              X
            </button>
          </div>

          <form class="category-form product-form" data-movement-form>
            <div class="form-grid">
              <label class="field" for="movement-product">
                <span>Producto</span>
                <select id="movement-product" name="id_producto" data-movement-product required></select>
                <small data-movement-error="id_producto"></small>
              </label>

              <label class="field" for="movement-warehouse">
                <span>Almacen</span>
                <select id="movement-warehouse" name="id_almacen" data-movement-warehouse required></select>
                <small data-movement-error="id_almacen"></small>
              </label>

              <label class="field" for="movement-type">
                <span>Tipo</span>
                <select id="movement-type" name="tipo" required>
                  <option value="ENTRADA">ENTRADA</option>
                  <option value="SALIDA">SALIDA</option>
                  <option value="AJUSTE">AJUSTE</option>
                </select>
                <small data-movement-error="tipo"></small>
              </label>

              <label class="field" for="movement-quantity">
                <span>Cantidad</span>
                <input id="movement-quantity" name="cantidad" type="number" min="1" step="1" placeholder="1" required />
                <small data-movement-error="cantidad"></small>
              </label>

              <label class="field full-field" for="movement-reference">
                <span>Referencia</span>
                <input id="movement-reference" name="referencia" type="text" placeholder="OC-001, ajuste manual, venta interna" />
              </label>

              <label class="field full-field" for="movement-reason">
                <span>Motivo</span>
                <textarea id="movement-reason" name="motivo" rows="3" placeholder="Detalle del movimiento"></textarea>
              </label>
            </div>

            <p class="status-message" data-movement-form-status data-type="info"></p>

            <div class="modal-actions">
              <button class="secondary-button" type="button" data-close-movement-modal>Cancelar</button>
              <button class="primary-button" type="submit" data-save-movement>Guardar</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  `
}

export function renderMovimientoSummaryCards(summary) {
  return `
    <article class="inventory-card stock-summary-card">
      <div>
        <span>Total Entradas</span>
        <strong>${summary.entradas}</strong>
        <p>Movimientos de ingreso.</p>
      </div>
    </article>
    <article class="inventory-card stock-summary-card">
      <div>
        <span>Total Salidas</span>
        <strong>${summary.salidas}</strong>
        <p>Movimientos de salida.</p>
      </div>
    </article>
    <article class="inventory-card stock-summary-card">
      <div>
        <span>Total Ajustes</span>
        <strong>${summary.ajustes}</strong>
        <p>Correcciones registradas.</p>
      </div>
    </article>
    <article class="inventory-card stock-summary-card">
      <div>
        <span>Movimientos Hoy</span>
        <strong>${summary.hoy}</strong>
        <p>Actividad del dia.</p>
      </div>
    </article>
  `
}

export function renderMovimientoRows(movimientos) {
  if (!Array.isArray(movimientos)) {
    return `
      <tr>
        <td colspan="8">No se pudo interpretar la lista de movimientos.</td>
      </tr>
    `
  }

  if (movimientos.length === 0) {
    return `
      <tr>
        <td colspan="8">No existen movimientos registrados.</td>
      </tr>
    `
  }

  return movimientos.map((movimiento) => `
    <tr>
      <td>${formatDate(movimiento.fecha || movimiento.created_at)}</td>
      <td><span class="movement-type">${escapeHtml(movimiento.tipo)}</span></td>
      <td>${escapeHtml(movimiento.codigo_producto)} - ${escapeHtml(movimiento.producto_nombre)}</td>
      <td>${escapeHtml(movimiento.almacen_nombre)}</td>
      <td class="${movimiento.tipo === 'SALIDA' ? 'qty-out' : 'qty-in'}">${movimiento.tipo === 'SALIDA' ? '-' : '+'}${movimiento.cantidad}</td>
      <td>${escapeHtml(movimiento.usuario_nombre)}</td>
      <td>${escapeHtml(movimiento.referencia || '-')}</td>
      <td>${escapeHtml(movimiento.motivo || '-')}</td>
    </tr>
  `).join('')
}

export function renderMovimientoProductoOptions(productos, selectedId = null, includeAll = false) {
  const options = productos.map((producto) => `
    <option value="${producto.id_producto}" ${producto.id_producto === selectedId ? 'selected' : ''}>
      ${escapeHtml(producto.codigo_producto)} - ${escapeHtml(producto.nombre)}
    </option>
  `).join('')

  return `<option value="">${includeAll ? 'Todos los productos' : 'Seleccionar producto'}</option>${options}`
}

export function renderMovimientoAlmacenOptions(almacenes, selectedId = null, includeAll = false) {
  const options = almacenes.map((almacen) => `
    <option value="${almacen.id_almacen}" ${almacen.id_almacen === selectedId ? 'selected' : ''}>
      ${escapeHtml(almacen.nombre)}
    </option>
  `).join('')

  return `<option value="">${includeAll ? 'Todos los almacenes' : 'Seleccionar almacen'}</option>${options}`
}
