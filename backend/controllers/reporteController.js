const reporteService = require('../services/reporteService');

function parseDate(value) {
  const date = String(value || '').trim();

  if (!date) {
    return null;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
}

async function getReportes(req, res) {
  const fechaInicio = parseDate(req.query.fecha_inicio);
  const fechaFin = parseDate(req.query.fecha_fin);

  if (req.query.fecha_inicio && !fechaInicio) {
    return res.status(400).json({
      success: false,
      message: 'La fecha de inicio no es valida.'
    });
  }

  if (req.query.fecha_fin && !fechaFin) {
    return res.status(400).json({
      success: false,
      message: 'La fecha de fin no es valida.'
    });
  }

  try {
    const reportes = await reporteService.getReportes({
      fechaInicio,
      fechaFin
    });

    return res.json({
      success: true,
      data: reportes
    });
  } catch (error) {
    console.error('Error al generar reportes:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al generar reportes.'
    });
  }
}

module.exports = {
  getReportes
};
