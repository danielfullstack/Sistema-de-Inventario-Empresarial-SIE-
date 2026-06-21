import { escapeHtml, renderHeader, renderSidebar } from './erpLayout.js'

function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(value))
}

export function renderAlmacenes(usuario) {
  return `
    <main class="erp-shell">
      ${renderSidebar('/almacenes')}

      <section class="erp-workspace">
        ${renderHeader(usuario, 'Buscar almacen...')}

        <section class="erp-content module-content">
          <div class="module-panel">
            <div class="module-toolbar">
              <div>
                <p class="eyebrow">Gestion logistica</p>
                <h1>Gestion de Almacenes</h1>
              </div>

              <button class="primary-button module-primary-button" type="button" data-open-warehouse-modal>
                Nuevo Almacen
              </button>
            </div>

            <div class="module-filters">
              <label class="module-search" for="warehouse-search">
                <span>Buscar</span>
                <input id="warehouse-search" type="search" placeholder="Buscar almacen..." data-warehouse-search />
              </label>
              <p class="module-status" data-warehouse-status>Cargando almacenes...</p>
            </div>

            <div class="responsive-table warehouses-table-wrap">
              <table class="warehouses-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Direccion</th>
                    <th>Capacidad</th>
                    <th>Tipo</th>
                    <th>Fecha creacion</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody data-warehouse-table-body>
                  <tr>
                    <td colspan="7">Cargando almacenes...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </section>

      <div class="modal-backdrop" data-warehouse-modal hidden>
        <section class="category-modal" role="dialog" aria-modal="true" aria-labelledby="warehouse-modal-title">
          <div class="modal-header">
            <div>
              <p class="eyebrow">Almacen</p>
              <h2 id="warehouse-modal-title" data-warehouse-modal-title>Nuevo Almacen</h2>
            </div>
            <button class="icon-button" type="button" aria-label="Cerrar modal" data-close-warehouse-modal>
              X
            </button>
          </div>

          <form class="category-form" data-warehouse-form>
            <input type="hidden" name="id_almacen" />

            <label class="field" for="warehouse-name">
              <span>Nombre</span>
              <input id="warehouse-name" name="nombre" type="text" placeholder="Ej. Almacen Principal" required />
              <small data-warehouse-error="nombre"></small>
            </label>

            <label class="field" for="warehouse-address">
              <span>Direccion</span>
              <input id="warehouse-address" name="direccion" type="text" placeholder="Direccion fisica del almacen" />
            </label>

            <label class="field" for="warehouse-capacity">
              <span>Capacidad Total</span>
              <input id="warehouse-capacity" name="capacidad_total" type="number" min="0" step="1" placeholder="0" />
              <small data-warehouse-error="capacidad_total"></small>
            </label>

            <label class="field" for="warehouse-type">
              <span>Tipo</span>
              <select id="warehouse-type" name="tipo">
                <option value="Principal">Principal</option>
                <option value="Secundario">Secundario</option>
                <option value="Temporal">Temporal</option>
              </select>
            </label>

            <p class="status-message" data-warehouse-form-status data-type="info"></p>

            <div class="modal-actions">
              <button class="secondary-button" type="button" data-close-warehouse-modal>Cancelar</button>
              <button class="primary-button" type="submit" data-save-warehouse>Guardar</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  `
}

export function renderAlmacenRows(almacenes) {
  if (!Array.isArray(almacenes)) {
    return `
      <tr>
        <td colspan="7">No se pudo interpretar la lista de almacenes.</td>
      </tr>
    `
  }

  if (almacenes.length === 0) {
    return `
      <tr>
        <td colspan="7">No se encontraron almacenes.</td>
      </tr>
    `
  }

  return almacenes.map((almacen) => `
    <tr>
      <td>${almacen.id_almacen}</td>
      <td><strong>${escapeHtml(almacen.nombre)}</strong></td>
      <td>${escapeHtml(almacen.direccion || '-')}</td>
      <td>${almacen.capacidad_total ?? 0}</td>
      <td><span class="warehouse-type">${escapeHtml(almacen.tipo || '-')}</span></td>
      <td>${formatDate(almacen.created_at)}</td>
      <td>
        <div class="row-actions">
          <button class="table-action edit" type="button" data-edit-warehouse="${almacen.id_almacen}">Editar</button>
          <button class="table-action delete" type="button" data-delete-warehouse="${almacen.id_almacen}">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('')
}
