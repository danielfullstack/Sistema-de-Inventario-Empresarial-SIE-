import { escapeHtml, renderHeader, renderSidebar } from './erpLayout.js'

function normalizeEstado(estado = '') {
  return String(estado).toLowerCase() === 'inactivo' ? 'Inactivo' : 'Activo'
}

export function renderUbicaciones(usuario) {
  return `
    <main class="erp-shell">
      ${renderSidebar('/ubicaciones')}

      <section class="erp-workspace">
        ${renderHeader(usuario, 'Buscar ubicacion...')}

        <section class="erp-content module-content">
          <div class="module-panel">
            <div class="module-toolbar">
              <div>
                <p class="eyebrow">Distribucion de almacen</p>
                <h1>Gestion de Ubicaciones</h1>
              </div>

              <button class="primary-button module-primary-button" type="button" data-open-location-modal>
                Nueva Ubicacion
              </button>
            </div>

            <div class="module-filters products-filters">
              <label class="module-search" for="location-search">
                <span>Buscar</span>
                <input id="location-search" type="search" placeholder="Buscar ubicacion..." data-location-search />
              </label>

              <label class="module-search" for="location-warehouse-filter">
                <span>Almacen</span>
                <select id="location-warehouse-filter" data-location-warehouse-filter></select>
              </label>
              <label class="module-search" for="location-status-filter">
                <span>Estado</span>
                <select id="location-status-filter" data-location-status-filter>
                  <option value="activo">Activas</option>
                  <option value="inactivo">Inactivas</option>
                  <option value="todos">Todas</option>
                </select>
              </label>

              <p class="module-status" data-location-status>Cargando ubicaciones...</p>
            </div>

            <div class="responsive-table locations-table-wrap">
              <table class="locations-table">
                <thead>
                  <tr>
                    <th>Codigo</th>
                    <th>Almacen</th>
                    <th>Pasillo</th>
                    <th>Estante</th>
                    <th>Nivel</th>
                    <th>Capacidad</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody data-location-table-body>
                  <tr>
                    <td colspan="8">Cargando ubicaciones...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </section>

      <div class="modal-backdrop" data-location-modal hidden>
        <section class="category-modal" role="dialog" aria-modal="true" aria-labelledby="location-modal-title">
          <div class="modal-header">
            <div>
              <p class="eyebrow">Ubicacion</p>
              <h2 id="location-modal-title" data-location-modal-title>Nueva Ubicacion</h2>
            </div>
            <button class="icon-button" type="button" aria-label="Cerrar modal" data-close-location-modal>
              X
            </button>
          </div>

          <form class="category-form" data-location-form>
            <input type="hidden" name="id_ubicacion" />

            <label class="field" for="location-warehouse">
              <span>Almacen</span>
              <select id="location-warehouse" name="id_almacen" data-location-warehouse required></select>
              <small data-location-error="id_almacen"></small>
            </label>

            <label class="field" for="location-code">
              <span>Codigo</span>
              <input id="location-code" name="codigo" type="text" placeholder="Ej. A-01" required />
              <small data-location-error="codigo"></small>
            </label>

            <div class="form-grid">
              <label class="field" for="location-aisle">
                <span>Pasillo</span>
                <input id="location-aisle" name="pasillo" type="text" placeholder="Ej. A" />
              </label>

              <label class="field" for="location-rack">
                <span>Estante</span>
                <input id="location-rack" name="estante" type="text" placeholder="Ej. 1" />
              </label>

              <label class="field" for="location-level">
                <span>Nivel</span>
                <input id="location-level" name="nivel" type="text" placeholder="Ej. 1" />
              </label>

              <label class="field" for="location-capacity">
                <span>Capacidad</span>
                <input id="location-capacity" name="capacidad" type="number" min="0" step="1" placeholder="0" />
                <small data-location-error="capacidad"></small>
              </label>
            </div>

            <p class="status-message" data-location-form-status data-type="info"></p>

            <div class="modal-actions">
              <button class="secondary-button" type="button" data-close-location-modal>Cancelar</button>
              <button class="primary-button" type="submit" data-save-location>Guardar</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  `
}

export function renderUbicacionRows(ubicaciones) {
  if (!Array.isArray(ubicaciones)) {
    return `
      <tr>
        <td colspan="8">No se pudo interpretar la lista de ubicaciones.</td>
      </tr>
    `
  }

  if (ubicaciones.length === 0) {
    return `
      <tr>
        <td colspan="8">No se encontraron ubicaciones.</td>
      </tr>
    `
  }

  return ubicaciones.map((ubicacion) => {
    const estado = normalizeEstado(ubicacion.estado)

    return `
      <tr>
        <td><strong>${escapeHtml(ubicacion.codigo)}</strong></td>
        <td>${escapeHtml(ubicacion.almacen_nombre || '-')}</td>
        <td>${escapeHtml(ubicacion.pasillo || '-')}</td>
        <td>${escapeHtml(ubicacion.estante || '-')}</td>
        <td>${escapeHtml(ubicacion.nivel || '-')}</td>
        <td>${ubicacion.capacidad ?? 0}</td>
        <td><span class="status-badge ${estado === 'Activo' ? 'active' : 'inactive'}">${estado}</span></td>
        <td>
          <div class="row-actions">
            <button class="table-action edit" type="button" data-edit-location="${ubicacion.id_ubicacion}">Editar</button>
            ${estado === 'Activo'
              ? `<button class="table-action delete" type="button" data-delete-location="${ubicacion.id_ubicacion}">Desactivar</button>`
              : `<button class="table-action edit" type="button" data-reactivate-location="${ubicacion.id_ubicacion}">Reactivar</button>`}
          </div>
        </td>
      </tr>
    `
  }).join('')
}

export function renderAlmacenOptions(almacenes, selectedId = null, includeAll = false) {
  const options = almacenes.map((almacen) => `
    <option value="${almacen.id_almacen}" ${almacen.id_almacen === selectedId ? 'selected' : ''}>
      ${escapeHtml(almacen.nombre)}
    </option>
  `).join('')

  const emptyLabel = includeAll ? 'Todos los almacenes' : 'Seleccionar almacen'
  return `<option value="">${emptyLabel}</option>${options}`
}
