export function validateLogin({ correo, password }) {
  const errors = {}
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailPattern.test(correo.trim())) {
    errors.correo = 'Ingresa un correo empresarial valido.'
  }

  if (password.trim().length < 8) {
    errors.password = 'La contrasena debe tener al menos 8 caracteres.'
  }

  return errors
}
