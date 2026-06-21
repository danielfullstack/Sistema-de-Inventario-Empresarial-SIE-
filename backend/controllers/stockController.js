const stockService = require('../services/stockService');

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function getStock(_req, res) {
  try {
    const stock = await stockService.findAll();

    return res.json({
      success: true,
      data: stock
    });
  } catch (error) {
    console.error('Error al listar stock:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al listar stock.'
    });
  }
}

async function getStockById(req, res) {
  const idStock = parseId(req.params.id);

  if (!idStock) {
    return res.status(400).json({
      success: false,
      message: 'ID de stock invalido.'
    });
  }

  try {
    const stock = await stockService.findById(idStock);

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Registro de stock no encontrado.'
      });
    }

    return res.json({
      success: true,
      data: stock
    });
  } catch (error) {
    console.error('Error al obtener stock:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al obtener stock.'
    });
  }
}

async function getStockByProducto(req, res) {
  const idProducto = parseId(req.params.id);

  if (!idProducto) {
    return res.status(400).json({
      success: false,
      message: 'ID de producto invalido.'
    });
  }

  try {
    const stock = await stockService.findByProducto(idProducto);

    return res.json({
      success: true,
      data: stock
    });
  } catch (error) {
    console.error('Error al filtrar stock por producto:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al filtrar stock por producto.'
    });
  }
}

async function getStockByAlmacen(req, res) {
  const idAlmacen = parseId(req.params.id);

  if (!idAlmacen) {
    return res.status(400).json({
      success: false,
      message: 'ID de almacen invalido.'
    });
  }

  try {
    const stock = await stockService.findByAlmacen(idAlmacen);

    return res.json({
      success: true,
      data: stock
    });
  } catch (error) {
    console.error('Error al filtrar stock por almacen:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al filtrar stock por almacen.'
    });
  }
}

async function getLowStock(_req, res) {
  try {
    const stock = await stockService.findLowStock();

    return res.json({
      success: true,
      data: stock
    });
  } catch (error) {
    console.error('Error al listar stock bajo:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al listar stock bajo.'
    });
  }
}

module.exports = {
  getStock,
  getStockById,
  getStockByProducto,
  getStockByAlmacen,
  getLowStock
};
