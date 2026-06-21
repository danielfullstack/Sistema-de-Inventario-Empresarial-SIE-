const auditoriaService = require('../services/auditoriaService');

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function getAuditorias(_req, res) {
  try {
    const auditorias = await auditoriaService.findAll();

    return res.json({
      success: true,
      data: auditorias
    });
  } catch (error) {
    console.error('Error al listar auditoria:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al listar auditoria.'
    });
  }
}

async function getAuditoriaById(req, res) {
  const idAuditoria = parseId(req.params.id);

  if (!idAuditoria) {
    return res.status(400).json({
      success: false,
      message: 'ID de auditoria invalido.'
    });
  }

  try {
    const auditoria = await auditoriaService.findById(idAuditoria);

    if (!auditoria) {
      return res.status(404).json({
        success: false,
        message: 'Registro de auditoria no encontrado.'
      });
    }

    return res.json({
      success: true,
      data: auditoria
    });
  } catch (error) {
    console.error('Error al obtener auditoria:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al obtener auditoria.'
    });
  }
}

async function getAuditoriasByUsuario(req, res) {
  const idUsuario = parseId(req.params.id);

  if (!idUsuario) {
    return res.status(400).json({
      success: false,
      message: 'ID de usuario invalido.'
    });
  }

  try {
    const auditorias = await auditoriaService.findByUsuario(idUsuario);

    return res.json({
      success: true,
      data: auditorias
    });
  } catch (error) {
    console.error('Error al filtrar auditoria por usuario:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al filtrar auditoria por usuario.'
    });
  }
}

module.exports = {
  getAuditorias,
  getAuditoriaById,
  getAuditoriasByUsuario
};
