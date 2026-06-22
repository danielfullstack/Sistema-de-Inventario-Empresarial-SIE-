if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET no esta configurado en las variables de entorno.');
}

if (!process.env.JWT_EXPIRES_IN) {
  throw new Error('JWT_EXPIRES_IN no esta configurado en las variables de entorno.');
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN
};
