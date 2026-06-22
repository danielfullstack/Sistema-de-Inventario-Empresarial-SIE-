const categoriaService = require('../services/categoriaService');
const productoService = require('../services/productoService');

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function parseInteger(value) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}

function parsePayload(body) {
  const estado = String(body.estado || 'activo').trim().toLowerCase();

  return {
    codigoProducto: String(body.codigo_producto || '').trim(),
    nombre: String(body.nombre || '').trim(),
    descripcion: String(body.descripcion || '').trim() || null,
    precioUnitario: parseNumber(body.precio_unitario),
    unidadMedida: String(body.unidad_medida || '').trim() || null,
    stockMinimo: parseInteger(body.stock_minimo),
    stockMaximo: parseInteger(body.stock_maximo),
    estado: estado || 'activo',
    idCategoria: parseId(body.id_categoria)
  };
}

function validatePayload(payload) {
  if (!payload.codigoProducto) {
    return 'El codigo del producto es obligatorio.';
  }

  if (!payload.nombre) {
    return 'El nombre del producto es obligatorio.';
  }

  if (payload.precioUnitario === null || payload.precioUnitario < 0) {
    return 'El precio unitario debe ser un numero mayor o igual a 0.';
  }

  if (!payload.idCategoria) {
    return 'La categoria es obligatoria.';
  }

  if (payload.stockMinimo === null || payload.stockMinimo < 0) {
    return 'El stock minimo debe ser mayor o igual a 0.';
  }

  if (payload.stockMaximo === null || payload.stockMaximo < payload.stockMinimo) {
    return 'El stock maximo debe ser mayor o igual al stock minimo.';
  }

  if (!['activo', 'inactivo'].includes(payload.estado)) {
    return 'El estado seleccionado no es valido.';
  }

  return null;
}

async function validateCategoriaExists(idCategoria) {
  const categoria = await categoriaService.findById(idCategoria);
  return Boolean(categoria);
}

async function validateCodigoUnique(codigoProducto, idProductoActual = null) {
  const producto = await productoService.findByCodigo(codigoProducto);

  if (!producto) {
    return true;
  }

  return producto.id_producto === idProductoActual;
}

function parseEstadoQuery(value) {
  const estado = String(value || 'activo').trim().toLowerCase();
  return ['activo', 'inactivo', 'todos'].includes(estado) ? estado : 'activo';
}

async function getProductos(req, res) {
  try {
    const productos = await productoService.findAll(parseEstadoQuery(req.query.estado));

    return res.json({
      success: true,
      data: productos
    });
  } catch (error) {
    console.error('Error al listar productos:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al listar productos.'
    });
  }
}

async function getProductoById(req, res) {
  const idProducto = parseId(req.params.id);

  if (!idProducto) {
    return res.status(400).json({
      success: false,
      message: 'ID de producto invalido.'
    });
  }

  try {
    const producto = await productoService.findById(idProducto);

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado.'
      });
    }

    return res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al obtener producto.'
    });
  }
}

async function getProductosByCategoria(req, res) {
  const idCategoria = parseId(req.params.id);

  if (!idCategoria) {
    return res.status(400).json({
      success: false,
      message: 'ID de categoria invalido.'
    });
  }

  try {
    const productos = await productoService.findByCategoria(idCategoria, parseEstadoQuery(req.query.estado));

    return res.json({
      success: true,
      data: productos
    });
  } catch (error) {
    console.error('Error al filtrar productos por categoria:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al filtrar productos por categoria.'
    });
  }
}

async function createProducto(req, res) {
  const payload = parsePayload(req.body);
  const validationError = validatePayload(payload);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError
    });
  }

  try {
    if (!(await validateCategoriaExists(payload.idCategoria))) {
      return res.status(400).json({
        success: false,
        message: 'La categoria seleccionada no existe.'
      });
    }

    if (!(await validateCodigoUnique(payload.codigoProducto))) {
      return res.status(400).json({
        success: false,
        message: 'El codigo del producto ya existe.'
      });
    }

    const producto = await productoService.create(payload);

    return res.status(201).json({
      success: true,
      message: 'Producto creado correctamente.',
      data: producto
    });
  } catch (error) {
    console.error('Error al crear producto:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al crear producto.'
    });
  }
}

async function updateProducto(req, res) {
  const idProducto = parseId(req.params.id);

  if (!idProducto) {
    return res.status(400).json({
      success: false,
      message: 'ID de producto invalido.'
    });
  }

  const payload = parsePayload(req.body);
  const validationError = validatePayload(payload);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError
    });
  }

  try {
    if (!(await validateCategoriaExists(payload.idCategoria))) {
      return res.status(400).json({
        success: false,
        message: 'La categoria seleccionada no existe.'
      });
    }

    if (!(await validateCodigoUnique(payload.codigoProducto, idProducto))) {
      return res.status(400).json({
        success: false,
        message: 'El codigo del producto ya existe.'
      });
    }

    const producto = await productoService.update(idProducto, payload);

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado.'
      });
    }

    return res.json({
      success: true,
      message: 'Producto actualizado correctamente.',
      data: producto
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al actualizar producto.'
    });
  }
}

async function deleteProducto(req, res) {
  const idProducto = parseId(req.params.id);

  if (!idProducto) {
    return res.status(400).json({
      success: false,
      message: 'ID de producto invalido.'
    });
  }

  try {
    const producto = await productoService.findById(idProducto);

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado.'
      });
    }

    const productoDesactivado = await productoService.remove(idProducto);

    return res.json({
      success: true,
      message: 'Producto desactivado correctamente.',
      data: productoDesactivado
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);

    if (error.code === '23503') {
      return res.status(409).json({
        success: false,
        message: 'No se puede eliminar un producto relacionado con otros registros.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al eliminar producto.'
    });
  }
}

async function reactivateProducto(req, res) {
  const idProducto = parseId(req.params.id);

  if (!idProducto) {
    return res.status(400).json({
      success: false,
      message: 'ID de producto invalido.'
    });
  }

  try {
    const producto = await productoService.reactivate(idProducto);

    if (!producto) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado.'
      });
    }

    return res.json({
      success: true,
      message: 'Producto reactivado correctamente.',
      data: producto
    });
  } catch (error) {
    console.error('Error al reactivar producto:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al reactivar producto.'
    });
  }
}

module.exports = {
  getProductos,
  getProductoById,
  getProductosByCategoria,
  createProducto,
  updateProducto,
  deleteProducto,
  reactivateProducto
};
