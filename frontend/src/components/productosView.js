import { escapeHtml, renderHeader, renderSidebar } from './erpLayout.js'

function formatCurrency(value) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(Number(value || 0))
}

function normalizeEstado(estado = '') {
  return estado.toLowerCase() === 'inactivo' ? 'Inactivo' : 'Activo'
}

export function renderProductos(usuario) {
  return `
    <main class="erp-shell">
      ${renderSidebar('/productos')}

      <section class="erp-workspace">
        ${renderHeader(usuario, 'Buscar producto...')}

        <section class="erp-content module-content">
          <div class="module-panel">
            <div class="module-toolbar">
              <div>
                <p class="eyebrow">Catalogo de inventario</p>
                <h1>Gestion de Productos</h1>
              </div>

              <button class="primary-button module-primary-button" type="button" data-open-product-modal>
                Nuevo Producto
              </button>
            </div>

            <div class="module-filters products-filters">
              <label class="module-search" for="product-search">
                <span>Buscar</span>
                <input id="product-search" type="search" placeholder="Buscar producto..." data-product-search />
              </label>

              <label class="module-search" for="product-category-filter">
                <span>Categoria</span>
                <select id="product-category-filter" data-product-category-filter></select>
              </label>

              <p class="module-status" data-product-status>Cargando productos...</p>
            </div>

            <div class="responsive-table products-table-wrap">
              <table class="products-table">
                <thead>
                  <tr>
                    <th>Codigo</th>
                    <th>Nombre</th>
                    <th>Categoria</th>
                    <th>Precio</th>
                    <th>Unidad</th>
                    <th>Stock Min</th>
                    <th>Stock Max</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody data-product-table-body>
                  <tr>
                    <td colspan="9">Cargando productos...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </section>

      <div class="modal-backdrop" data-product-modal hidden>
        <section class="category-modal product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
          <div class="modal-header">
            <div>
              <p class="eyebrow">Producto</p>
              <h2 id="product-modal-title" data-product-modal-title>Nuevo Producto</h2>
            </div>
            <button class="icon-button" type="button" aria-label="Cerrar modal" data-close-product-modal>
              X
            </button>
          </div>

          <form class="category-form product-form" data-product-form>
            <input type="hidden" name="id_producto" />

            <div class="form-grid">
              <label class="field" for="product-code">
                <span>Codigo Producto</span>
                <input id="product-code" name="codigo_producto" type="text" placeholder="Ej. PROD-001" required />
                <small data-product-error="codigo_producto"></small>
              </label>

              <label class="field" for="product-name">
                <span>Nombre</span>
                <input id="product-name" name="nombre" type="text" placeholder="Ej. Mouse Logitech" required />
                <small data-product-error="nombre"></small>
              </label>

              <label class="field full-field" for="product-description">
                <span>Descripcion</span>
                <textarea id="product-description" name="descripcion" rows="3" placeholder="Descripcion del producto"></textarea>
              </label>

              <label class="field" for="product-price">
                <span>Precio Unitario</span>
                <input id="product-price" name="precio_unitario" type="number" min="0" step="0.01" placeholder="0.00" required />
                <small data-product-error="precio_unitario"></small>
              </label>

              <label class="field" for="product-unit">
                <span>Unidad Medida</span>
                <input id="product-unit" name="unidad_medida" type="text" placeholder="Unidad, caja, paquete" />
              </label>

              <label class="field" for="product-stock-min">
                <span>Stock Minimo</span>
                <input id="product-stock-min" name="stock_minimo" type="number" min="0" step="1" placeholder="0" />
                <small data-product-error="stock_minimo"></small>
              </label>

              <label class="field" for="product-stock-max">
                <span>Stock Maximo</span>
                <input id="product-stock-max" name="stock_maximo" type="number" min="0" step="1" placeholder="0" />
                <small data-product-error="stock_maximo"></small>
              </label>

              <label class="field" for="product-category">
                <span>Categoria</span>
                <select id="product-category" name="id_categoria" data-product-category required></select>
                <small data-product-error="id_categoria"></small>
              </label>

              <label class="field" for="product-status">
                <span>Estado</span>
                <select id="product-status" name="estado">
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </label>
            </div>

            <p class="status-message" data-product-form-status data-type="info"></p>

            <div class="modal-actions">
              <button class="secondary-button" type="button" data-close-product-modal>Cancelar</button>
              <button class="primary-button" type="submit" data-save-product>Guardar</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  `
}

export function renderProductoRows(productos) {
  if (productos.length === 0) {
    return `
      <tr>
        <td colspan="9">No se encontraron productos.</td>
      </tr>
    `
  }

  return productos.map((producto) => {
    const estado = normalizeEstado(producto.estado)

    return `
      <tr>
        <td><strong>${escapeHtml(producto.codigo_producto)}</strong></td>
        <td>${escapeHtml(producto.nombre)}</td>
        <td>${escapeHtml(producto.categoria_nombre || '-')}</td>
        <td>${formatCurrency(producto.precio_unitario)}</td>
        <td>${escapeHtml(producto.unidad_medida || '-')}</td>
        <td>${producto.stock_minimo ?? 0}</td>
        <td>${producto.stock_maximo ?? 0}</td>
        <td><span class="status-badge ${estado === 'Activo' ? 'active' : 'inactive'}">${estado}</span></td>
        <td>
          <div class="row-actions">
            <button class="table-action edit" type="button" data-edit-product="${producto.id_producto}">Editar</button>
            <button class="table-action delete" type="button" data-delete-product="${producto.id_producto}">Eliminar</button>
          </div>
        </td>
      </tr>
    `
  }).join('')
}

export function renderCategoriaOptions(categorias, selectedId = null, includeAll = false) {
  const options = categorias.map((categoria) => `
    <option value="${categoria.id_categoria}" ${categoria.id_categoria === selectedId ? 'selected' : ''}>
      ${escapeHtml(categoria.nombre)}
    </option>
  `).join('')

  const emptyLabel = includeAll ? 'Todas las categorias' : 'Seleccionar categoria'
  return `<option value="">${emptyLabel}</option>${options}`
}
