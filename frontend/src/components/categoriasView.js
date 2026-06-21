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

export function renderCategorias(usuario) {
  return `
    <main class="erp-shell">
      ${renderSidebar('/categorias')}

      <section class="erp-workspace">
        ${renderHeader(usuario, 'Buscar categoria...')}

        <section class="erp-content module-content">
          <div class="module-panel">
            <div class="module-toolbar">
              <div>
                <p class="eyebrow">Catalogo de inventario</p>
                <h1>Gestion de Categorias</h1>
              </div>

              <button class="primary-button module-primary-button" type="button" data-open-category-modal>
                Nueva Categoria
              </button>
            </div>

            <div class="module-filters">
              <label class="module-search" for="category-search">
                <span>Buscar</span>
                <input id="category-search" type="search" placeholder="Buscar categoria..." data-category-search />
              </label>
              <p class="module-status" data-category-status>Cargando categorias...</p>
            </div>

            <div class="responsive-table categories-table-wrap">
              <table class="categories-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripcion</th>
                    <th>Categoria Padre</th>
                    <th>Fecha Creacion</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody data-category-table-body>
                  <tr>
                    <td colspan="6">Cargando categorias...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </section>

      <div class="modal-backdrop" data-category-modal hidden>
        <section class="category-modal" role="dialog" aria-modal="true" aria-labelledby="category-modal-title">
          <div class="modal-header">
            <div>
              <p class="eyebrow">Categoria</p>
              <h2 id="category-modal-title" data-category-modal-title>Nueva Categoria</h2>
            </div>
            <button class="icon-button" type="button" aria-label="Cerrar modal" data-close-category-modal>
              X
            </button>
          </div>

          <form class="category-form" data-category-form>
            <input type="hidden" name="id_categoria" />

            <label class="field" for="category-name">
              <span>Nombre</span>
              <input id="category-name" name="nombre" type="text" placeholder="Ej. Tecnologia" required />
              <small data-category-error="nombre"></small>
            </label>

            <label class="field" for="category-description">
              <span>Descripcion</span>
              <textarea id="category-description" name="descripcion" rows="4" placeholder="Descripcion de la categoria"></textarea>
            </label>

            <label class="field" for="category-parent">
              <span>Categoria Padre (opcional)</span>
              <select id="category-parent" name="id_categoria_padre" data-category-parent></select>
            </label>

            <p class="status-message" data-category-form-status data-type="info"></p>

            <div class="modal-actions">
              <button class="secondary-button" type="button" data-close-category-modal>Cancelar</button>
              <button class="primary-button" type="submit" data-save-category>Guardar</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  `
}

export function renderCategoriaRows(categorias) {
  if (categorias.length === 0) {
    return `
      <tr>
        <td colspan="6">No se encontraron categorias.</td>
      </tr>
    `
  }

  return categorias.map((categoria) => `
    <tr>
      <td>${categoria.id_categoria}</td>
      <td><strong>${escapeHtml(categoria.nombre)}</strong></td>
      <td>${escapeHtml(categoria.descripcion || '-')}</td>
      <td>${escapeHtml(categoria.categoria_padre || '-')}</td>
      <td>${formatDate(categoria.created_at)}</td>
      <td>
        <div class="row-actions">
          <button class="table-action edit" type="button" data-edit-category="${categoria.id_categoria}">Editar</button>
          <button class="table-action delete" type="button" data-delete-category="${categoria.id_categoria}">Eliminar</button>
        </div>
      </td>
    </tr>
  `).join('')
}

export function renderParentOptions(categorias, currentId = null, selectedId = null) {
  const options = categorias
    .filter((categoria) => categoria.id_categoria !== currentId)
    .map((categoria) => `
      <option value="${categoria.id_categoria}" ${categoria.id_categoria === selectedId ? 'selected' : ''}>
        ${escapeHtml(categoria.nombre)}
      </option>
    `)
    .join('')

  return `<option value="">Sin categoria padre</option>${options}`
}
