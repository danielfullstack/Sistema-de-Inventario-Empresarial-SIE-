import { escapeHtml, renderHeader, renderSidebar } from './erpLayout.js'

const ACTION_LABELS = {
  CREATE: ['Crear', 'active'],
  UPDATE: ['Editar', 'warning'],
  DELETE: ['Eliminar', 'inactive'],
  LOGIN: ['Login', 'login'],
  LOGOUT: ['Logout', 'logout']
}

function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'short',
    timeStyle: 'medium'
  }).format(new Date(value))
}

export function renderAuditoria(usuario) {
  return `
    <main class="erp-shell">
      ${renderSidebar('/auditoria')}

      <section class="erp-workspace">
        ${renderHeader(usuario, 'Buscar auditoria...')}

        <section class="erp-content module-content">
          <div class="module-panel">
            <div class="module-toolbar">
              <div>
                <p class="eyebrow">Trazabilidad del sistema</p>
                <h1>Registro de Auditoria</h1>
              </div>
            </div>

            <section class="stock-summary-grid" data-audit-summary>
              ${renderAuditoriaSummaryCards([])}
            </section>

            <div class="module-filters products-filters">
              <label class="module-search" for="audit-search">
                <span>Buscar</span>
                <input id="audit-search" type="search" placeholder="Buscar auditoria..." data-audit-search />
              </label>

              <label class="module-search" for="audit-user-filter">
                <span>Usuario</span>
                <select id="audit-user-filter" data-audit-user-filter></select>
              </label>

              <label class="module-search" for="audit-module-filter">
                <span>Modulo</span>
                <select id="audit-module-filter" data-audit-module-filter></select>
              </label>

              <label class="module-search" for="audit-action-filter">
                <span>Accion</span>
                <select id="audit-action-filter" data-audit-action-filter>
                  <option value="">Todas</option>
                  <option value="CREATE">CREATE</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                  <option value="LOGIN">LOGIN</option>
                  <option value="LOGOUT">LOGOUT</option>
                </select>
              </label>

              <label class="module-search" for="audit-date-filter">
                <span>Fecha</span>
                <input id="audit-date-filter" type="date" data-audit-date-filter />
              </label>

              <p class="module-status" data-audit-status>Cargando auditoria...</p>
            </div>

            <div class="responsive-table audit-table-wrap">
              <table class="audit-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Usuario</th>
                    <th>Modulo</th>
                    <th>Accion</th>
                    <th>Registro ID</th>
                    <th>Descripcion</th>
                  </tr>
                </thead>
                <tbody data-audit-table-body>
                  <tr>
                    <td colspan="6">Cargando auditoria...</td>
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

export function renderAuditoriaRows(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return `
      <tr>
        <td colspan="6">No se encontraron registros de auditoria.</td>
      </tr>
    `
  }

  return items.map((item) => {
    const [label, className] = ACTION_LABELS[item.accion] || [item.accion, 'logout']

    return `
      <tr>
        <td>${formatDate(item.fecha)}</td>
        <td>${escapeHtml(item.usuario_nombre || '-')}</td>
        <td>${escapeHtml(item.modulo || '-')}</td>
        <td><span class="audit-badge ${className}">${escapeHtml(label)}</span></td>
        <td>${item.registro_id ?? '-'}</td>
        <td>${escapeHtml(item.descripcion || '-')}</td>
      </tr>
    `
  }).join('')
}

export function renderAuditoriaSummaryCards(items) {
  const list = Array.isArray(items) ? items : []
  const count = (action) => list.filter((item) => item.accion === action).length

  return `
    <article class="inventory-card stock-summary-card">
      <div>
        <span>Total Registros</span>
        <strong>${list.length}</strong>
        <p>Eventos auditados.</p>
      </div>
    </article>
    <article class="inventory-card stock-summary-card">
      <div>
        <span>Creaciones</span>
        <strong>${count('CREATE')}</strong>
        <p>Altas registradas.</p>
      </div>
    </article>
    <article class="inventory-card stock-summary-card">
      <div>
        <span>Ediciones</span>
        <strong>${count('UPDATE')}</strong>
        <p>Cambios aplicados.</p>
      </div>
    </article>
    <article class="inventory-card stock-summary-card">
      <div>
        <span>Eliminaciones</span>
        <strong>${count('DELETE')}</strong>
        <p>Bajas o desactivaciones.</p>
      </div>
    </article>
    <article class="inventory-card stock-summary-card">
      <div>
        <span>Logins</span>
        <strong>${count('LOGIN')}</strong>
        <p>Inicios de sesion.</p>
      </div>
    </article>
  `
}

export function renderAuditFilterOptions(values, emptyLabel) {
  const uniqueValues = [...new Set(values.filter(Boolean))]

  return `
    <option value="">${emptyLabel}</option>
    ${uniqueValues.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('')}
  `
}
