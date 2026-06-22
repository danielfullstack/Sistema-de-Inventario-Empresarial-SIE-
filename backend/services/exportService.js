const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');

const auditoriaService = require('./auditoriaService');
const kardexService = require('./kardexService');
const movimientoService = require('./movimientoService');
const ordenCompraService = require('./ordenCompraService');
const productoService = require('./productoService');
const proveedorService = require('./proveedorService');
const reporteService = require('./reporteService');
const stockService = require('./stockService');

const EXPORTS = {
  productos: {
    title: 'Productos',
    columns: [
      ['codigo_producto', 'Codigo'],
      ['nombre', 'Producto'],
      ['categoria_nombre', 'Categoria'],
      ['precio_unitario', 'Precio'],
      ['unidad_medida', 'Unidad'],
      ['stock_minimo', 'Stock Minimo'],
      ['stock_maximo', 'Stock Maximo'],
      ['estado', 'Estado']
    ],
    load: () => productoService.findAll('todos')
  },
  stock: {
    title: 'Stock',
    columns: [
      ['codigo_producto', 'Codigo'],
      ['producto_nombre', 'Producto'],
      ['almacen_nombre', 'Almacen'],
      ['cantidad_actual', 'Stock Actual'],
      ['cantidad_reservada', 'Reservado'],
      ['stock_disponible', 'Disponible'],
      ['stock_minimo', 'Stock Minimo'],
      ['estado_stock', 'Estado']
    ],
    load: () => stockService.findAll()
  },
  movimientos: {
    title: 'Movimientos de Inventario',
    columns: [
      ['fecha', 'Fecha'],
      ['tipo', 'Tipo'],
      ['codigo_producto', 'Codigo'],
      ['producto_nombre', 'Producto'],
      ['almacen_nombre', 'Almacen'],
      ['cantidad', 'Cantidad'],
      ['usuario_nombre', 'Usuario'],
      ['referencia', 'Referencia'],
      ['motivo', 'Motivo']
    ],
    load: () => movimientoService.findAll()
  },
  kardex: {
    title: 'Kardex de Inventario',
    columns: [
      ['fecha', 'Fecha'],
      ['tipo', 'Tipo'],
      ['codigo_producto', 'Codigo'],
      ['producto_nombre', 'Producto'],
      ['almacen_nombre', 'Almacen'],
      ['entrada', 'Entrada'],
      ['salida', 'Salida'],
      ['saldo', 'Saldo'],
      ['usuario_nombre', 'Usuario'],
      ['referencia', 'Referencia'],
      ['motivo', 'Motivo']
    ],
    load: async (query) => {
      const kardex = await kardexService.findKardex({
        idProducto: parsePositiveInt(query.id_producto || query.idProducto),
        idAlmacen: parsePositiveInt(query.id_almacen || query.idAlmacen),
        fechaInicio: query.fechaInicio || null,
        fechaFin: query.fechaFin || null
      });

      return kardex.rows;
    }
  },
  proveedores: {
    title: 'Proveedores',
    columns: [
      ['ruc', 'RUC'],
      ['razon_social', 'Razon Social'],
      ['telefono', 'Telefono'],
      ['email', 'Email'],
      ['direccion', 'Direccion'],
      ['estado', 'Estado']
    ],
    load: () => proveedorService.findAll('todos')
  },
  ordenes: {
    title: 'Ordenes de Compra',
    columns: [
      ['id_orden', 'Orden'],
      ['proveedor_nombre', 'Proveedor'],
      ['proveedor_ruc', 'RUC'],
      ['fecha_emision', 'Fecha Emision'],
      ['fecha_entrega_esperada', 'Entrega Esperada'],
      ['estado', 'Estado'],
      ['total', 'Total'],
      ['usuario_nombre', 'Usuario']
    ],
    load: () => ordenCompraService.findAll()
  },
  auditoria: {
    title: 'Auditoria',
    columns: [
      ['fecha', 'Fecha'],
      ['usuario_nombre', 'Usuario'],
      ['modulo', 'Modulo'],
      ['accion', 'Accion'],
      ['registro_id', 'Registro ID'],
      ['descripcion', 'Descripcion']
    ],
    load: () => auditoriaService.findAll()
  },
  reportes: {
    title: 'Reportes',
    columns: [
      ['seccion', 'Seccion'],
      ['detalle', 'Detalle'],
      ['valor_1', 'Valor 1'],
      ['valor_2', 'Valor 2'],
      ['valor_3', 'Valor 3']
    ],
    load: async (query) => flattenReportes(await reporteService.getReportes({
      fechaInicio: query.fechaInicio || null,
      fechaFin: query.fechaFin || null
    }))
  }
};

function parsePositiveInt(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function formatDate(value) {
  if (!value) {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date);
}

function formatValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return formatDate(value);
  }

  return String(value);
}

function getConfig(moduleName) {
  const config = EXPORTS[moduleName];

  if (!config) {
    const error = new Error('Modulo de exportacion no valido.');
    error.status = 404;
    throw error;
  }

  return config;
}

function flattenReportes(data) {
  return [
    ...(data.stockActual || []).map((item) => ({
      seccion: 'Stock actual',
      detalle: `${item.codigo_producto} - ${item.producto_nombre}`,
      valor_1: item.almacen_nombre,
      valor_2: item.cantidad_actual,
      valor_3: item.stock_disponible
    })),
    ...(data.stockBajo || []).map((item) => ({
      seccion: 'Stock bajo',
      detalle: `${item.codigo_producto} - ${item.producto_nombre}`,
      valor_1: item.almacen_nombre,
      valor_2: item.cantidad_actual,
      valor_3: item.stock_minimo
    })),
    ...(data.movimientosPorFecha || []).map((item) => ({
      seccion: 'Movimientos por fecha',
      detalle: formatDate(item.fecha),
      valor_1: item.tipo,
      valor_2: item.total_movimientos,
      valor_3: item.cantidad_total
    })),
    ...(data.productosMasUsados || []).map((item) => ({
      seccion: 'Productos mas usados',
      detalle: `${item.codigo_producto} - ${item.producto_nombre}`,
      valor_1: item.total_movimientos,
      valor_2: item.cantidad_total,
      valor_3: ''
    })),
    ...(data.comprasPorProveedor || []).map((item) => ({
      seccion: 'Compras por proveedor',
      detalle: `${item.ruc} - ${item.proveedor_nombre}`,
      valor_1: item.total_ordenes,
      valor_2: item.total_compras,
      valor_3: ''
    }))
  ];
}

async function getRows(moduleName, query = {}) {
  const config = getConfig(moduleName);
  const rows = await config.load(query);

  return {
    config,
    rows: Array.isArray(rows) ? rows : []
  };
}

function buildPdf({ title, columns, rows, usuario }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 36,
      size: 'A4',
      layout: columns.length > 8 ? 'landscape' : 'portrait'
    });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(14).text('Sistema de Inventario Empresarial (SIE)', { align: 'center' });
    doc.moveDown(0.4);
    doc.fontSize(11).text(title, { align: 'center' });
    doc.moveDown(0.7);
    doc.fontSize(8)
      .text(`Fecha de generacion: ${formatDate(new Date())}`)
      .text(`Usuario: ${usuario?.nombre || 'Sistema'} (${usuario?.rol || '-'})`);
    doc.moveDown(0.8);

    const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const columnWidth = usableWidth / columns.length;

    doc.fontSize(7).font('Helvetica-Bold');
    columns.forEach(([, label], index) => {
      doc.text(label, doc.page.margins.left + index * columnWidth, doc.y, {
        width: columnWidth - 4,
        continued: index < columns.length - 1
      });
    });
    doc.text('');
    doc.moveDown(0.2);
    doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(7);

    rows.forEach((row) => {
      if (doc.y > doc.page.height - doc.page.margins.bottom - 24) {
        doc.addPage();
      }

      const y = doc.y;
      columns.forEach(([key], index) => {
        doc.text(formatValue(row[key]), doc.page.margins.left + index * columnWidth, y, {
          width: columnWidth - 4,
          height: 28,
          ellipsis: true
        });
      });
      doc.y = y + 30;
    });

    doc.moveDown();
    doc.fontSize(8).text(`Total de registros: ${rows.length}`, { align: 'right' });
    doc.fontSize(7).text('Documento generado automaticamente por SIE.', doc.page.margins.left, doc.page.height - 28, {
      align: 'center'
    });
    doc.end();
  });
}

function buildExcel({ title, columns, rows }) {
  const data = rows.map((row) => {
    const item = {};

    columns.forEach(([key, label]) => {
      item[label] = formatValue(row[key]);
    });

    return item;
  });
  const worksheet = XLSX.utils.json_to_sheet(data, {
    header: columns.map(([, label]) => label)
  });

  worksheet['!cols'] = columns.map(([, label]) => {
    const maxContent = Math.max(
      label.length,
      ...rows.map((row) => formatValue(row[columns.find(([, currentLabel]) => currentLabel === label)?.[0]]).length)
    );

    return { wch: Math.min(Math.max(maxContent + 2, 12), 40) };
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, title.slice(0, 31));

  return XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx'
  });
}

module.exports = {
  buildExcel,
  buildPdf,
  getRows,
  getConfig
};
