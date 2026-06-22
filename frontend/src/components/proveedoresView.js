import { escapeHtml, renderHeader, renderSidebar } from './erpLayout.js'

function normalizeEstado(estado = '') {
  return estado.toLowerCase() === 'inactivo' ? 'Inactivo' : 'Activo'
}

export function renderProveedores(usuario) {
  return `
    <main class="erp-shell">
      ${renderSidebar('/proveedores')}

      <section class="erp-workspace">
        ${renderHeader(usuario, 'Buscar proveedor...')}

        <section class="erp-content module-content">
          <div class="module-panel">
            <div class="module-toolbar">
              <div>
                <p class="eyebrow">Compras y abastecimiento</p>
                <h1>Gestion de Proveedores</h1>
              </div>

              <button class="primary-button module-primary-button" type="button" data-open-supplier-modal>
                Nuevo Proveedor
              </button>
            </div>

            <div class="module-filters">
              <label class="module-search" for="supplier-search">
                <span>Buscar</span>
                <input id="supplier-search" type="search" placeholder="Buscar proveedor..." data-supplier-search />
              </label>
              <label class="module-search" for="supplier-status-filter">
                <span>Estado</span>
                <select id="supplier-status-filter" data-supplier-status-filter>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                  <option value="todos">Todos</option>
                </select>
              </label>
              <p class="module-status" data-supplier-status>Cargando proveedores...</p>
            </div>

            <div class="responsive-table suppliers-table-wrap">
              <table class="suppliers-table">
                <thead>
                  <tr>
                    <th>RUC</th>
                    <th>Razon Social</th>
                    <th>Telefono</th>
                    <th>Email</th>
                    <th>Direccion</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody data-supplier-table-body>
                  <tr>
                    <td colspan="7">Cargando proveedores...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </section>

      <div class="modal-backdrop" data-supplier-modal hidden>
        <section class="category-modal product-modal" role="dialog" aria-modal="true" aria-labelledby="supplier-modal-title">
          <div class="modal-header">
            <div>
              <p class="eyebrow">Proveedor</p>
              <h2 id="supplier-modal-title" data-supplier-modal-title>Nuevo Proveedor</h2>
            </div>
            <button class="icon-button" type="button" aria-label="Cerrar modal" data-close-supplier-modal>
              X
            </button>
          </div>

          <form class="category-form product-form" data-supplier-form>
            <input type="hidden" name="id_proveedor" />

            <div class="form-grid">
              <label class="field" for="supplier-name">
                <span>Razon Social</span>
                <input id="supplier-name" name="razon_social" type="text" placeholder="Ej. Distribuidora ABC SAC" required />
                <small data-supplier-error="razon_social"></small>
              </label>

              <label class="field" for="supplier-ruc">
                <span>RUC</span>
                <input id="supplier-ruc" name="ruc" type="text" maxlength="11" placeholder="20123456789" required />
                <small data-supplier-error="ruc"></small>
              </label>

              <label class="field" for="supplier-phone">
                <span>Telefono</span>
                <input id="supplier-phone" name="telefono" type="text" placeholder="999111222" />
              </label>

              <label class="field" for="supplier-email">
                <span>Email</span>
                <input id="supplier-email" name="email" type="email" placeholder="ventas@proveedor.com" />
                <small data-supplier-error="email"></small>
              </label>

              <label class="field full-field" for="supplier-address">
                <span>Direccion</span>
                <input id="supplier-address" name="direccion" type="text" placeholder="Direccion fiscal o comercial" />
              </label>

              <label class="field" for="supplier-status">
                <span>Estado</span>
                <select id="supplier-status" name="estado">
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </label>
            </div>

            <p class="status-message" data-supplier-form-status data-type="info"></p>

            <div class="modal-actions">
              <button class="secondary-button" type="button" data-close-supplier-modal>Cancelar</button>
              <button class="primary-button" type="submit" data-save-supplier>Guardar</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  `
}

export function renderProveedorRows(proveedores) {
  if (!Array.isArray(proveedores)) {
    return `
      <tr>
        <td colspan="7">No se pudo interpretar la lista de proveedores.</td>
      </tr>
    `
  }

  if (proveedores.length === 0) {
    return `
      <tr>
        <td colspan="7">No se encontraron proveedores.</td>
      </tr>
    `
  }

  return proveedores.map((proveedor) => {
    const estado = normalizeEstado(proveedor.estado)

    return `
      <tr>
        <td><strong>${escapeHtml(proveedor.ruc)}</strong></td>
        <td>${escapeHtml(proveedor.razon_social)}</td>
        <td>${escapeHtml(proveedor.telefono || '-')}</td>
        <td>${escapeHtml(proveedor.email || '-')}</td>
        <td>${escapeHtml(proveedor.direccion || '-')}</td>
        <td><span class="status-badge ${estado === 'Activo' ? 'active' : 'inactive'}">${estado}</span></td>
        <td>
          <div class="row-actions">
            <button class="table-action edit" type="button" data-edit-supplier="${proveedor.id_proveedor}">Editar</button>
            ${estado === 'Activo'
              ? `<button class="table-action delete" type="button" data-delete-supplier="${proveedor.id_proveedor}">Desactivar</button>`
              : `<button class="table-action edit" type="button" data-reactivate-supplier="${proveedor.id_proveedor}">Reactivar</button>`}
          </div>
        </td>
      </tr>
    `
  }).join('')
}
