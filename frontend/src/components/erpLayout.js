const sidebarItems = [
  ['Dashboard', '/dashboard', 'M3 12h7V3H3v9Zm0 9h7v-7H3v7Zm11 0h7v-9h-7v9Zm0-11h7V3h-7v7Z'],
  ['Productos', '/productos', 'M21 8.5 12 3 3 8.5v7L12 21l9-5.5v-7Z'],
  ['Categorias', '/categorias', 'M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z'],
  ['Proveedores', '/proveedores', 'M3 7h11v9H3V7Zm11 3h4l3 3v3h-7v-6ZM6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z'],
  ['Ordenes de Compra', '/ordenes-compra', 'M7 3h10l2 4v14H5V7l2-4Zm0 4h10M9 11h6M9 15h6'],
  ['Almacenes', '/almacenes', 'M3 10 12 4l9 6v11H3V10Zm5 11v-7h8v7'],
  ['Ubicaciones', '/ubicaciones', 'M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'],
  ['Stock', '/stock', 'M4 6h16M4 12h16M4 18h16'],
  ['Movimientos', '/movimientos', 'M7 7h11l-3-3m3 3-3 3M17 17H6l3 3m-3-3 3-3'],
  ['Reportes', '/reportes', 'M4 19V5m5 14V9m5 10V4m5 15v-7M3 19h18'],
  ['Auditoria', '/auditoria', 'M9 11h6M9 15h6M8 3h8l3 3v15H5V6l3-3Zm8 0v4h4'],
  ['Usuarios', '/usuarios', 'M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0ZM4 21a8 8 0 0 1 16 0'],
  ['Configuracion', '/dashboard', 'M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Zm0 0V21m0-18v5m6.4 10.4-3.5-3.5M9.1 9.1 5.6 5.6m12.8 0-3.5 3.5M9.1 14.9l-3.5 3.5']
]

export function svg(path, className = 'app-icon') {
  return `
    <svg class="${className}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="${path}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `
}

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export function formatRole(role = '') {
  const normalized = role.toLowerCase()

  if (normalized === 'admin') {
    return 'Administrador'
  }

  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
}

export function renderSidebar(activePath = '/dashboard') {
  const links = sidebarItems.map(([label, href, path]) => `
    <a class="erp-nav-link ${href === activePath ? 'active' : ''}" href="${href}">
      ${svg(path, 'nav-icon')}
      <span>${label}</span>
    </a>
  `).join('')

  return `
    <aside class="erp-sidebar" aria-label="Menu principal">
      <div class="erp-brand">
        <div class="erp-brand-mark">SIE</div>
        <div>
          <strong>Inventario</strong>
          <span>ERP Empresarial</span>
        </div>
      </div>

      <nav class="erp-nav">
        ${links}
      </nav>

      <button class="erp-logout" type="button" data-logout-button>
        ${svg('M10 17 5 12l5-5M5 12h12M15 4h4v16h-4', 'nav-icon')}
        <span>Cerrar sesion</span>
      </button>
    </aside>
  `
}

export function renderHeader(usuario, searchPlaceholder = 'Buscar producto, orden o proveedor') {
  const nombre = escapeHtml(usuario.nombre)
  const rol = escapeHtml(formatRole(usuario.rol))

  return `
    <header class="erp-header">
      <label class="erp-search" for="dashboard-search">
        ${svg('M21 21l-4.3-4.3M10.8 18a7.2 7.2 0 1 0 0-14.4 7.2 7.2 0 0 0 0 14.4Z', 'search-icon')}
        <input id="dashboard-search" type="search" placeholder="${escapeHtml(searchPlaceholder)}" />
      </label>

      <div class="erp-userbar">
        <button class="icon-button" type="button" aria-label="Notificaciones">
          ${svg('M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0', 'header-icon')}
        </button>
        <div class="erp-avatar" aria-hidden="true">${nombre.charAt(0).toUpperCase()}</div>
        <div class="erp-user">
          <strong>${nombre}</strong>
          <span>${rol}</span>
        </div>
      </div>
    </header>
  `
}
