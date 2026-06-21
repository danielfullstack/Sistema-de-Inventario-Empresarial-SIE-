import { escapeHtml, renderHeader, renderSidebar } from './erpLayout.js'

const ESTADOS = ['Pendiente', 'Aprobada', 'Recibida', 'Cancelada']

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

  return new Intl.DateTimeFormat('es-PE').format(new Date(value))
}

function normalizeEstado(estado = '') {
  const found = ESTADOS.find((item) => item.toLowerCase() === String(estado).toLowerCase())
  return found || 'Pendiente'
}

export function renderOrdenesCompra(usuario) {
  return `
    <main class="erp-shell">
      ${renderSidebar('/ordenes-compra')}

      <section class="erp-workspace">
        ${renderHeader(usuario, 'Buscar orden de compra...')}

        <section class="erp-content module-content">
          <div class="module-panel">
            <div class="module-toolbar">
              <div>
                <p class="eyebrow">Compras y abastecimiento</p>
                <h1>Ordenes de Compra</h1>
              </div>

              <button class="primary-button module-primary-button" type="button" data-open-purchase-order-modal>
                Nueva Orden
              </button>
            </div>

            <div class="module-filters products-filters">
              <label class="module-search" for="purchase-order-search">
                <span>Buscar</span>
                <input id="purchase-order-search" type="search" placeholder="Buscar orden o proveedor..." data-purchase-order-search />
              </label>

              <label class="module-search" for="purchase-order-provider-filter">
                <span>Proveedor</span>
                <select id="purchase-order-provider-filter" data-purchase-order-provider-filter></select>
              </label>

              <label class="module-search" for="purchase-order-status-filter">
                <span>Estado</span>
                <select id="purchase-order-status-filter" data-purchase-order-status-filter>
                  <option value="">Todos los estados</option>
                  ${renderEstadoOptions()}
                </select>
              </label>

              <p class="module-status" data-purchase-order-status>Cargando ordenes...</p>
            </div>

            <div class="responsive-table purchase-orders-table-wrap">
              <table class="purchase-orders-table">
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Proveedor</th>
                    <th>Fecha Emision</th>
                    <th>Entrega Esperada</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody data-purchase-order-table-body>
                  <tr>
                    <td colspan="7">Cargando ordenes...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </section>

      <div class="modal-backdrop" data-purchase-order-modal hidden>
        <section class="category-modal purchase-order-modal" role="dialog" aria-modal="true" aria-labelledby="purchase-order-modal-title">
          <div class="modal-header">
            <div>
              <p class="eyebrow">Orden de compra</p>
              <h2 id="purchase-order-modal-title">Nueva Orden</h2>
            </div>
            <button class="icon-button" type="button" aria-label="Cerrar modal" data-close-purchase-order-modal>
              X
            </button>
          </div>

          <form class="category-form product-form" data-purchase-order-form>
            <div class="form-grid">
              <label class="field" for="purchase-order-provider">
                <span>Proveedor</span>
                <select id="purchase-order-provider" name="id_proveedor" data-purchase-order-provider required></select>
                <small data-purchase-order-error="id_proveedor"></small>
              </label>

              <label class="field" for="purchase-order-date">
                <span>Fecha Emision</span>
                <input id="purchase-order-date" name="fecha_emision" type="date" required />
                <small data-purchase-order-error="fecha_emision"></small>
              </label>

              <label class="field" for="purchase-order-delivery-date">
                <span>Entrega Esperada</span>
                <input id="purchase-order-delivery-date" name="fecha_entrega_esperada" type="date" />
              </label>

              <label class="field" for="purchase-order-state">
                <span>Estado</span>
                <select id="purchase-order-state" name="estado">
                  ${renderEstadoOptions('Pendiente')}
                </select>
              </label>

              <label class="field full-field" for="purchase-order-notes">
                <span>Observaciones</span>
                <textarea id="purchase-order-notes" name="observaciones" rows="3" placeholder="Condiciones, notas o referencia interna"></textarea>
              </label>
            </div>

            <div class="order-detail-panel">
              <div class="section-heading compact-heading">
                <div>
                  <h2>Productos</h2>
                  <span>Agrega los productos solicitados al proveedor.</span>
                </div>
                <button class="secondary-button" type="button" data-add-purchase-order-detail>Agregar producto</button>
              </div>
              <div class="order-detail-list" data-purchase-order-detail-list></div>
              <small data-purchase-order-error="detalles"></small>
            </div>

            <p class="status-message" data-purchase-order-form-status data-type="info"></p>

            <div class="modal-actions">
              <button class="secondary-button" type="button" data-close-purchase-order-modal>Cancelar</button>
              <button class="primary-button" type="submit" data-save-purchase-order>Guardar</button>
            </div>
          </form>
        </section>
      </div>

      <div class="modal-backdrop" data-purchase-order-history-modal hidden>
        <section class="category-modal purchase-order-modal" role="dialog" aria-modal="true" aria-labelledby="purchase-order-history-title">
          <div class="modal-header">
            <div>
              <p class="eyebrow">Historial</p>
              <h2 id="purchase-order-history-title" data-purchase-order-history-title>Detalle de Orden</h2>
            </div>
            <button class="icon-button" type="button" aria-label="Cerrar modal" data-close-purchase-order-history>
              X
            </button>
          </div>

          <div class="purchase-order-history" data-purchase-order-history-content></div>
        </section>
      </div>
    </main>
  `
}

export function renderOrdenCompraRows(ordenes) {
  if (!Array.isArray(ordenes)) {
    return `
      <tr>
        <td colspan="7">No se pudo interpretar la lista de ordenes.</td>
      </tr>
    `
  }

  if (ordenes.length === 0) {
    return `
      <tr>
        <td colspan="7">No existen ordenes de compra.</td>
      </tr>
    `
  }

  return ordenes.map((orden) => {
    const estado = normalizeEstado(orden.estado)

    return `
      <tr>
        <td><strong>OC-${String(orden.id_orden).padStart(4, '0')}</strong></td>
        <td>${escapeHtml(orden.proveedor_nombre || '-')}</td>
        <td>${formatDate(orden.fecha_emision)}</td>
        <td>${formatDate(orden.fecha_entrega_esperada)}</td>
        <td>${formatCurrency(orden.total)}</td>
        <td>
          <select class="state-select state-${estado.toLowerCase()}" data-update-purchase-order-state="${orden.id_orden}">
            ${renderEstadoOptions(estado)}
          </select>
        </td>
        <td>
          <div class="row-actions">
            <button class="table-action edit" type="button" data-view-purchase-order="${orden.id_orden}">Ver historial</button>
          </div>
        </td>
      </tr>
    `
  }).join('')
}

export function renderProveedorOrdenOptions(proveedores, selectedId = null, includeAll = false) {
  const options = proveedores.map((proveedor) => `
    <option value="${proveedor.id_proveedor}" ${Number(proveedor.id_proveedor) === Number(selectedId) ? 'selected' : ''}>
      ${escapeHtml(proveedor.razon_social)}
    </option>
  `).join('')

  const emptyLabel = includeAll ? 'Todos los proveedores' : 'Seleccionar proveedor'
  return `<option value="">${emptyLabel}</option>${options}`
}

export function renderProductoOrdenOptions(productos, selectedId = null) {
  const options = productos.map((producto) => `
    <option value="${producto.id_producto}" data-price="${producto.precio_unitario}" ${Number(producto.id_producto) === Number(selectedId) ? 'selected' : ''}>
      ${escapeHtml(producto.codigo_producto)} - ${escapeHtml(producto.nombre)}
    </option>
  `).join('')

  return `<option value="">Seleccionar producto</option>${options}`
}

export function renderOrdenDetalleFormRow(productos, index) {
  return `
    <div class="order-detail-row" data-purchase-order-detail-row>
      <label class="field">
        <span>Producto</span>
        <select name="id_producto" data-detail-product required>
          ${renderProductoOrdenOptions(productos)}
        </select>
      </label>
      <label class="field">
        <span>Cantidad</span>
        <input name="cantidad_solicitada" type="number" min="1" step="1" value="1" required />
      </label>
      <label class="field">
        <span>Precio Unitario</span>
        <input name="precio_unitario" type="number" min="0" step="0.01" placeholder="0.00" required />
      </label>
      <button class="table-action delete" type="button" data-remove-purchase-order-detail="${index}">Eliminar</button>
    </div>
  `
}

export function renderOrdenCompraHistory(orden) {
  const detalles = Array.isArray(orden.detalles) ? orden.detalles : []

  return `
    <div class="history-summary">
      <p><strong>Orden:</strong> OC-${String(orden.id_orden).padStart(4, '0')}</p>
      <p><strong>Proveedor:</strong> ${escapeHtml(orden.proveedor_nombre || '-')}</p>
      <p><strong>Estado:</strong> ${escapeHtml(normalizeEstado(orden.estado))}</p>
      <p><strong>Total:</strong> ${formatCurrency(orden.total)}</p>
      <p><strong>Creada por:</strong> ${escapeHtml(orden.usuario_nombre || '-')}</p>
      <p><strong>Observaciones:</strong> ${escapeHtml(orden.observaciones || '-')}</p>
    </div>

    <div class="responsive-table">
      <table class="purchase-order-detail-table">
        <thead>
          <tr>
            <th>Codigo</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${detalles.length === 0 ? `
            <tr><td colspan="5">La orden no tiene detalles.</td></tr>
          ` : detalles.map((detalle) => `
            <tr>
              <td><strong>${escapeHtml(detalle.codigo_producto)}</strong></td>
              <td>${escapeHtml(detalle.producto_nombre)}</td>
              <td>${detalle.cantidad_solicitada}</td>
              <td>${formatCurrency(detalle.precio_unitario)}</td>
              <td>${formatCurrency(detalle.subtotal)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
}

function renderEstadoOptions(selectedEstado = '') {
  return ESTADOS.map((estado) => `
    <option value="${estado}" ${estado === selectedEstado ? 'selected' : ''}>${estado}</option>
  `).join('')
}
