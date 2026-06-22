const categoriaService = require('../services/categoriaService');

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parsePayload(body) {
  const nombre = String(body.nombre || '').trim();
  const descripcion = String(body.descripcion || '').trim();
  const rawPadre = body.id_categoria_padre;
  const idCategoriaPadre = rawPadre === null || rawPadre === undefined || rawPadre === ''
    ? null
    : parseId(rawPadre);

  return {
    nombre,
    descripcion: descripcion || null,
    idCategoriaPadre
  };
}

function validatePayload(payload, idActual = null) {
  if (!payload.nombre) {
    return 'El nombre de la categoria es obligatorio.';
  }

  if (
    payload.idCategoriaPadre !== null &&
    (!payload.idCategoriaPadre || payload.idCategoriaPadre === idActual)
  ) {
    return 'La categoria padre seleccionada no es valida.';
  }

  return null;
}

async function validateParentExists(idCategoriaPadre) {
  if (idCategoriaPadre === null) {
    return true;
  }

  const parent = await categoriaService.findById(idCategoriaPadre);
  return Boolean(parent);
}

function parseEstadoQuery(value) {
  const estado = String(value || 'activo').trim().toLowerCase();
  return ['activo', 'inactivo', 'todos'].includes(estado) ? estado : 'activo';
}

async function getCategorias(req, res) {
  try {
    const categorias = await categoriaService.findAll(parseEstadoQuery(req.query.estado));

    return res.json({
      success: true,
      data: categorias
    });
  } catch (error) {
    console.error('Error al listar categorias:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al listar categorias.'
    });
  }
}

async function getCategoriaById(req, res) {
  const idCategoria = parseId(req.params.id);

  if (!idCategoria) {
    return res.status(400).json({
      success: false,
      message: 'ID de categoria invalido.'
    });
  }

  try {
    const categoria = await categoriaService.findById(idCategoria);

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoria no encontrada.'
      });
    }

    return res.json({
      success: true,
      data: categoria
    });
  } catch (error) {
    console.error('Error al obtener categoria:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al obtener categoria.'
    });
  }
}

async function createCategoria(req, res) {
  const payload = parsePayload(req.body);
  const validationError = validatePayload(payload);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError
    });
  }

  try {
    if (!(await validateParentExists(payload.idCategoriaPadre))) {
      return res.status(400).json({
        success: false,
        message: 'La categoria padre seleccionada no existe.'
      });
    }

    const categoria = await categoriaService.create(payload);

    return res.status(201).json({
      success: true,
      message: 'Categoria creada correctamente.',
      data: categoria
    });
  } catch (error) {
    console.error('Error al crear categoria:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al crear categoria.'
    });
  }
}

async function updateCategoria(req, res) {
  const idCategoria = parseId(req.params.id);

  if (!idCategoria) {
    return res.status(400).json({
      success: false,
      message: 'ID de categoria invalido.'
    });
  }

  const payload = parsePayload(req.body);
  const validationError = validatePayload(payload, idCategoria);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError
    });
  }

  try {
    if (!(await validateParentExists(payload.idCategoriaPadre))) {
      return res.status(400).json({
        success: false,
        message: 'La categoria padre seleccionada no existe.'
      });
    }

    const categoria = await categoriaService.update(idCategoria, payload);

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoria no encontrada.'
      });
    }

    return res.json({
      success: true,
      message: 'Categoria actualizada correctamente.',
      data: categoria
    });
  } catch (error) {
    console.error('Error al actualizar categoria:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al actualizar categoria.'
    });
  }
}

async function deleteCategoria(req, res) {
  const idCategoria = parseId(req.params.id);

  if (!idCategoria) {
    return res.status(400).json({
      success: false,
      message: 'ID de categoria invalido.'
    });
  }

  try {
    const categoria = await categoriaService.findById(idCategoria);

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoria no encontrada.'
      });
    }

    if (await categoriaService.hasChildren(idCategoria)) {
      return res.status(409).json({
        success: false,
        message: 'No se puede eliminar una categoria que tiene subcategorias.'
      });
    }

    const categoriaDesactivada = await categoriaService.remove(idCategoria);

    return res.json({
      success: true,
      message: 'Categoria desactivada correctamente.',
      data: categoriaDesactivada
    });
  } catch (error) {
    console.error('Error al eliminar categoria:', error);

    if (error.code === '23503') {
      return res.status(409).json({
        success: false,
        message: 'No se puede eliminar una categoria relacionada con otros registros.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error al eliminar categoria.'
    });
  }
}

async function reactivateCategoria(req, res) {
  const idCategoria = parseId(req.params.id);

  if (!idCategoria) {
    return res.status(400).json({
      success: false,
      message: 'ID de categoria invalido.'
    });
  }

  try {
    const categoria = await categoriaService.reactivate(idCategoria);

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoria no encontrada.'
      });
    }

    return res.json({
      success: true,
      message: 'Categoria reactivada correctamente.',
      data: categoria
    });
  } catch (error) {
    console.error('Error al reactivar categoria:', error);

    return res.status(500).json({
      success: false,
      message: 'Error al reactivar categoria.'
    });
  }
}

module.exports = {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  reactivateCategoria
};
