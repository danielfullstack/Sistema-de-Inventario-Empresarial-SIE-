const pool = require('../config/db');

const baseSelect = `
  SELECT
    oc.id_orden,
    oc.id_proveedor,
    p.razon_social AS proveedor_nombre,
    p.ruc AS proveedor_ruc,
    oc.fecha_emision,
    oc.fecha_entrega_esperada,
    oc.estado,
    oc.total,
    oc.observaciones,
    oc.created_by,
    u.nombre AS usuario_nombre,
    oc.created_at,
    oc.updated_at
  FROM orden_compra oc
  INNER JOIN proveedor p ON p.id_proveedor = oc.id_proveedor
  LEFT JOIN usuarios u ON u.id = oc.created_by
`;

function normalizeEstado(estado = '') {
  const estados = {
    pendiente: 'Pendiente',
    aprobada: 'Aprobada',
    recibida: 'Recibida',
    cancelada: 'Cancelada'
  };

  return estados[String(estado).trim().toLowerCase()] || estado;
}

async function findAll() {
  const { rows } = await pool.query(`
    ${baseSelect}
    ORDER BY oc.fecha_emision DESC, oc.id_orden DESC
  `);

  return rows;
}

async function findById(idOrden) {
  const { rows } = await pool.query(
    `${baseSelect} WHERE oc.id_orden = $1`,
    [idOrden]
  );

  const orden = rows[0] || null;

  if (!orden) {
    return null;
  }

  orden.detalles = await findDetalles(idOrden);
  return orden;
}

async function findDetalles(idOrden) {
  const { rows } = await pool.query(
    `
      SELECT
        doc.id_detalle,
        doc.id_orden,
        doc.id_producto,
        pr.codigo_producto,
        pr.nombre AS producto_nombre,
        doc.cantidad_solicitada,
        doc.precio_unitario,
        doc.subtotal
      FROM detalle_orden_compra doc
      INNER JOIN producto pr ON pr.id_producto = doc.id_producto
      WHERE doc.id_orden = $1
      ORDER BY doc.id_detalle ASC
    `,
    [idOrden]
  );

  return rows;
}

async function findByProveedor(idProveedor) {
  const { rows } = await pool.query(
    `
      ${baseSelect}
      WHERE oc.id_proveedor = $1
      ORDER BY oc.fecha_emision DESC, oc.id_orden DESC
    `,
    [idProveedor]
  );

  return rows;
}

async function findByEstado(estado) {
  const { rows } = await pool.query(
    `
      ${baseSelect}
      WHERE LOWER(oc.estado) = LOWER($1)
      ORDER BY oc.fecha_emision DESC, oc.id_orden DESC
    `,
    [estado]
  );

  return rows;
}

async function create(orden) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const proveedor = await client.query(
      'SELECT id_proveedor FROM proveedor WHERE id_proveedor = $1',
      [orden.idProveedor]
    );

    if (proveedor.rows.length === 0) {
      const error = new Error('El proveedor seleccionado no existe.');
      error.status = 400;
      throw error;
    }

    if (orden.createdBy) {
      const usuario = await client.query(
        'SELECT id FROM usuarios WHERE id = $1',
        [orden.createdBy]
      );

      if (usuario.rows.length === 0) {
        const error = new Error('El usuario seleccionado no existe.');
        error.status = 400;
        throw error;
      }
    }

    const productIds = orden.detalles.map((detalle) => detalle.idProducto);
    const products = await client.query(
      `
        SELECT id_producto, precio_unitario
        FROM producto
        WHERE id_producto = ANY($1::int[])
      `,
      [productIds]
    );
    const productMap = new Map(products.rows.map((producto) => [Number(producto.id_producto), producto]));

    for (const detalle of orden.detalles) {
      if (!productMap.has(detalle.idProducto)) {
        const error = new Error('Uno de los productos seleccionados no existe.');
        error.status = 400;
        throw error;
      }
    }

    const detalles = orden.detalles.map((detalle) => {
      const precioUnitario = detalle.precioUnitario ?? Number(productMap.get(detalle.idProducto).precio_unitario || 0);
      const subtotal = detalle.cantidadSolicitada * precioUnitario;

      return {
        ...detalle,
        precioUnitario,
        subtotal
      };
    });
    const total = detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0);

    const insertedOrder = await client.query(
      `
        INSERT INTO orden_compra (
          id_proveedor,
          fecha_emision,
          fecha_entrega_esperada,
          estado,
          total,
          observaciones,
          created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id_orden
      `,
      [
        orden.idProveedor,
        orden.fechaEmision,
        orden.fechaEntregaEsperada,
        normalizeEstado(orden.estado),
        total,
        orden.observaciones,
        orden.createdBy
      ]
    );

    const idOrden = insertedOrder.rows[0].id_orden;

    for (const detalle of detalles) {
      await client.query(
        `
          INSERT INTO detalle_orden_compra (
            id_orden,
            id_producto,
            cantidad_solicitada,
            precio_unitario,
            subtotal
          )
          VALUES ($1, $2, $3, $4, $5)
        `,
        [
          idOrden,
          detalle.idProducto,
          detalle.cantidadSolicitada,
          detalle.precioUnitario,
          detalle.subtotal
        ]
      );
    }

    await client.query('COMMIT');
    return findById(idOrden);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function updateEstado(idOrden, estado) {
  const { rows } = await pool.query(
    `
      UPDATE orden_compra
      SET estado = $1, updated_at = NOW()
      WHERE id_orden = $2
      RETURNING id_orden
    `,
    [normalizeEstado(estado), idOrden]
  );

  if (rows.length === 0) {
    return null;
  }

  return findById(rows[0].id_orden);
}

module.exports = {
  findAll,
  findById,
  findByProveedor,
  findByEstado,
  create,
  updateEstado
};
