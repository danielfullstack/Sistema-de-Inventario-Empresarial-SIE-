const dashboardService = require('../services/dashboardService');

async function getDashboard(_req, res) {
  try {
    const dashboard = await dashboardService.getDashboard();

    return res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    console.error('Error al obtener dashboard:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al obtener dashboard.'
    });
  }
}

module.exports = {
  getDashboard
};
