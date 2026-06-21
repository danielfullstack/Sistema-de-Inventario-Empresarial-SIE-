const JWT_SECRET = process.env.JWT_SECRET || 'sie_desarrollo_cambiar_en_produccion';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN
};
