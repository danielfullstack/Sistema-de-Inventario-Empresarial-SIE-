import { escapeHtml, renderHeader, renderSidebar } from './erpLayout.js'

const ROLES = ['Administrador', 'Supervisor', 'Operador']

function normalizeEstado(estado = '') {
  return String(estado).toLowerCase() === 'inactivo' ? 'Inactivo' : 'Activo'
}

function normalizeRol(rol = '') {
  if (String(rol).toLowerCase() === 'admin') {
    return 'Administrador'
  }

  const found = ROLES.find((item) => item.toLowerCase() === String(rol).toLowerCase())
  return found || rol
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

export function renderUsuarios(usuario) {
  return `
    <main class="erp-shell">
      ${renderSidebar('/usuarios')}

      <section class="erp-workspace">
        ${renderHeader(usuario, 'Buscar usuario...')}

        <section class="erp-content module-content">
          <div class="module-panel">
            <div class="module-toolbar">
              <div>
                <p class="eyebrow">Seguridad y accesos</p>
                <h1>Gestion de Usuarios</h1>
              </div>

              <button class="primary-button module-primary-button" type="button" data-open-user-modal>
                Nuevo Usuario
              </button>
            </div>

            <div class="stock-summary-grid user-summary-grid" data-user-summary>
              ${renderUsuarioSummaryCards([])}
            </div>

            <div class="module-filters products-filters">
              <label class="module-search" for="user-search">
                <span>Buscar</span>
                <input id="user-search" type="search" placeholder="Buscar usuario..." data-user-search />
              </label>

              <label class="module-search" for="user-filter">
                <span>Filtro</span>
                <select id="user-filter" data-user-filter>
                  <option value="">Todos</option>
                  ${ROLES.map((rol) => `<option value="${rol}">${rol}</option>`).join('')}
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </label>

              <p class="module-status" data-user-status>Cargando usuarios...</p>
            </div>

            <div class="responsive-table users-table-wrap">
              <table class="users-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Ultimo Login</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody data-user-table-body>
                  <tr>
                    <td colspan="6">Cargando usuarios...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </section>

      <div class="modal-backdrop" data-user-modal hidden>
        <section class="category-modal product-modal" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
          <div class="modal-header">
            <div>
              <p class="eyebrow">Usuario</p>
              <h2 id="user-modal-title" data-user-modal-title>Nuevo Usuario</h2>
            </div>
            <button class="icon-button" type="button" aria-label="Cerrar modal" data-close-user-modal>
              X
            </button>
          </div>

          <form class="category-form product-form" data-user-form>
            <input type="hidden" name="id" />

            <div class="form-grid">
              <label class="field" for="user-name">
                <span>Nombre</span>
                <input id="user-name" name="nombre" type="text" placeholder="Ej. Daniel" required />
                <small data-user-error="nombre"></small>
              </label>

              <label class="field" for="user-lastname">
                <span>Apellido</span>
                <input id="user-lastname" name="apellido" type="text" placeholder="Ej. Ramos" />
              </label>

              <label class="field" for="user-email">
                <span>Correo</span>
                <input id="user-email" name="correo" type="email" placeholder="usuario@sie.com" required />
                <small data-user-error="correo"></small>
              </label>

              <label class="field" for="user-role">
                <span>Rol</span>
                <select id="user-role" name="rol" required>
                  ${ROLES.map((rol) => `<option value="${rol}">${rol}</option>`).join('')}
                </select>
                <small data-user-error="rol"></small>
              </label>
            </div>

            <p class="temporary-password-box" data-temporary-password hidden></p>
            <p class="status-message" data-user-form-status data-type="info"></p>

            <div class="modal-actions">
              <button class="secondary-button" type="button" data-close-user-modal>Cancelar</button>
              <button class="primary-button" type="submit" data-save-user>Guardar</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  `
}

export function renderUsuarioRows(usuarios) {
  if (!Array.isArray(usuarios)) {
    return `
      <tr>
        <td colspan="6">No se pudo interpretar la lista de usuarios.</td>
      </tr>
    `
  }

  if (usuarios.length === 0) {
    return `
      <tr>
        <td colspan="6">No se encontraron usuarios.</td>
      </tr>
    `
  }

  return usuarios.map((usuario) => {
    const estado = normalizeEstado(usuario.estado)
    const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim()
    const nextEstado = estado === 'Activo' ? 'inactivo' : 'activo'
    const actionLabel = estado === 'Activo' ? 'Desactivar' : 'Reactivar'

    return `
      <tr>
        <td><strong>${escapeHtml(nombreCompleto)}</strong></td>
        <td>${escapeHtml(usuario.correo)}</td>
        <td>${escapeHtml(normalizeRol(usuario.rol))}</td>
        <td><span class="status-badge ${estado === 'Activo' ? 'active' : 'inactive'}">${estado}</span></td>
        <td>${formatDate(usuario.ultimo_login)}</td>
        <td>
          <div class="row-actions">
            <button class="table-action edit" type="button" data-edit-user="${usuario.id}">Editar</button>
            <button class="table-action delete" type="button" data-toggle-user-state="${usuario.id}" data-next-state="${nextEstado}">
              ${actionLabel}
            </button>
          </div>
        </td>
      </tr>
    `
  }).join('')
}

export function renderUsuarioSummaryCards(usuarios) {
  const total = usuarios.length
  const administradores = usuarios.filter((usuario) => normalizeRol(usuario.rol) === 'Administrador').length
  const supervisores = usuarios.filter((usuario) => normalizeRol(usuario.rol) === 'Supervisor').length
  const operadores = usuarios.filter((usuario) => normalizeRol(usuario.rol) === 'Operador').length

  return [
    ['Total Usuarios', total],
    ['Administradores', administradores],
    ['Supervisores', supervisores],
    ['Operadores', operadores]
  ].map(([label, value]) => `
    <article class="metric-card stock-summary-card">
      <span>${label}</span>
      <strong>${value}</strong>
    </article>
  `).join('')
}
