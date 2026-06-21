export function renderLogin() {
  return `
    <main class="login-shell">
      <section class="brand-panel" aria-label="Resumen del sistema">
        <div class="brand-mark" aria-hidden="true">SIE</div>
        <div class="brand-copy">
          <p class="eyebrow">Inventario empresarial</p>
          <h1>Sistema de Inventario Empresarial</h1>
          <p>
            Control de existencias, movimientos, usuarios y reportes desde una
            base preparada para crecer con procesos administrativos reales.
          </p>
        </div>

        <div class="metrics-grid" aria-label="Indicadores del panel">
          <article>
            <span>98.7%</span>
            <p>precision de stock</p>
          </article>
          <article>
            <span>24/7</span>
            <p>monitoreo operativo</p>
          </article>
          <article>
            <span>12</span>
            <p>almacenes conectados</p>
          </article>
        </div>
      </section>

      <section class="auth-panel" aria-label="Inicio de sesion">
        <div class="auth-card">
          <div class="auth-heading">
            <p class="eyebrow">Acceso administrativo</p>
            <h2>Inicia sesion</h2>
            <p>Usa tus credenciales corporativas para entrar al panel.</p>
          </div>

          <form class="login-form" data-login-form novalidate>
            <label class="field" for="correo">
              <span>Correo electronico</span>
              <input
                id="correo"
                name="correo"
                type="email"
                autocomplete="email"
                placeholder="usuario@empresa.com"
                required
              />
              <small data-error-for="correo"></small>
            </label>

            <label class="field" for="password">
              <span>Contrasena</span>
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                placeholder="Minimo 8 caracteres"
                required
              />
              <small data-error-for="password"></small>
            </label>

            <div class="form-row">
              <label class="check-option">
                <input type="checkbox" name="remember" />
                <span>Recordar equipo</span>
              </label>
              <a href="#" aria-label="Recuperar contrasena">Recuperar acceso</a>
            </div>

            <button class="primary-button" type="submit" data-submit-button>
              Iniciar sesion
            </button>

            <p class="status-message" data-status-message data-type="info">
              Backend listo para conectar con PostgreSQL.
            </p>
          </form>
        </div>
      </section>
    </main>
  `
}
