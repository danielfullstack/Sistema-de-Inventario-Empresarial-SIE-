-- FASE C - Restricciones e Integridad PostgreSQL
-- Proyecto SIE - Sistema de Inventario Empresarial
-- Migracion idempotente: valida existencia antes de crear constraints e indices.

BEGIN;

-- =========================================================
-- UNIQUE
-- =========================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'usuarios_correo_key'
      AND conrelid = 'usuarios'::regclass
  ) THEN
    ALTER TABLE usuarios
      ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'producto_codigo_producto_key'
      AND conrelid = 'producto'::regclass
  ) THEN
    ALTER TABLE producto
      ADD CONSTRAINT producto_codigo_producto_key UNIQUE (codigo_producto);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'proveedor_ruc_key'
      AND conrelid = 'proveedor'::regclass
  ) THEN
    ALTER TABLE proveedor
      ADD CONSTRAINT proveedor_ruc_key UNIQUE (ruc);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uq_stock_producto_almacen'
      AND conrelid = 'stock'::regclass
  ) THEN
    ALTER TABLE stock
      ADD CONSTRAINT uq_stock_producto_almacen UNIQUE (id_producto, id_almacen);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ubicacion_codigo_key'
      AND conrelid = 'ubicacion'::regclass
  ) THEN
    ALTER TABLE ubicacion
      ADD CONSTRAINT ubicacion_codigo_key UNIQUE (codigo);
  END IF;
END $$;

-- =========================================================
-- CHECK
-- =========================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_producto_precio_unitario_nonnegative'
      AND conrelid = 'producto'::regclass
  ) THEN
    ALTER TABLE producto
      ADD CONSTRAINT chk_producto_precio_unitario_nonnegative
      CHECK (precio_unitario >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_producto_stock_minimo_nonnegative'
      AND conrelid = 'producto'::regclass
  ) THEN
    ALTER TABLE producto
      ADD CONSTRAINT chk_producto_stock_minimo_nonnegative
      CHECK (stock_minimo >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_producto_stock_maximo_nonnegative'
      AND conrelid = 'producto'::regclass
  ) THEN
    ALTER TABLE producto
      ADD CONSTRAINT chk_producto_stock_maximo_nonnegative
      CHECK (stock_maximo >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_stock_cantidad_actual_nonnegative'
      AND conrelid = 'stock'::regclass
  ) THEN
    ALTER TABLE stock
      ADD CONSTRAINT chk_stock_cantidad_actual_nonnegative
      CHECK (cantidad_actual >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_stock_cantidad_reservada_nonnegative'
      AND conrelid = 'stock'::regclass
  ) THEN
    ALTER TABLE stock
      ADD CONSTRAINT chk_stock_cantidad_reservada_nonnegative
      CHECK (cantidad_reservada >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_movimiento_cantidad_positive'
      AND conrelid = 'movimiento_inventario'::regclass
  ) THEN
    ALTER TABLE movimiento_inventario
      ADD CONSTRAINT chk_movimiento_cantidad_positive
      CHECK (cantidad > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_proveedor_ruc_length'
      AND conrelid = 'proveedor'::regclass
  ) THEN
    ALTER TABLE proveedor
      ADD CONSTRAINT chk_proveedor_ruc_length
      CHECK (length(ruc) = 11);
  END IF;
END $$;

-- =========================================================
-- FOREIGN KEYS
-- Las FK existentes con NO ACTION ya protegen borrados relacionados.
-- Se agregan solo si faltan, usando ON DELETE RESTRICT en las relaciones criticas.
-- =========================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_producto_categoria' AND conrelid = 'producto'::regclass) THEN
    ALTER TABLE producto
      ADD CONSTRAINT fk_producto_categoria
      FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
      ON DELETE RESTRICT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ubicacion_almacen' AND conrelid = 'ubicacion'::regclass) THEN
    ALTER TABLE ubicacion
      ADD CONSTRAINT fk_ubicacion_almacen
      FOREIGN KEY (id_almacen) REFERENCES almacen(id_almacen)
      ON DELETE RESTRICT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_stock_producto' AND conrelid = 'stock'::regclass) THEN
    ALTER TABLE stock
      ADD CONSTRAINT fk_stock_producto
      FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
      ON DELETE RESTRICT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_stock_almacen' AND conrelid = 'stock'::regclass) THEN
    ALTER TABLE stock
      ADD CONSTRAINT fk_stock_almacen
      FOREIGN KEY (id_almacen) REFERENCES almacen(id_almacen)
      ON DELETE RESTRICT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_mov_producto' AND conrelid = 'movimiento_inventario'::regclass) THEN
    ALTER TABLE movimiento_inventario
      ADD CONSTRAINT fk_mov_producto
      FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
      ON DELETE RESTRICT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_mov_almacen' AND conrelid = 'movimiento_inventario'::regclass) THEN
    ALTER TABLE movimiento_inventario
      ADD CONSTRAINT fk_mov_almacen
      FOREIGN KEY (id_almacen) REFERENCES almacen(id_almacen)
      ON DELETE RESTRICT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_mov_usuario' AND conrelid = 'movimiento_inventario'::regclass) THEN
    ALTER TABLE movimiento_inventario
      ADD CONSTRAINT fk_mov_usuario
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
      ON DELETE RESTRICT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_orden_proveedor' AND conrelid = 'orden_compra'::regclass) THEN
    ALTER TABLE orden_compra
      ADD CONSTRAINT fk_orden_proveedor
      FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
      ON DELETE RESTRICT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_orden_usuario' AND conrelid = 'orden_compra'::regclass) THEN
    ALTER TABLE orden_compra
      ADD CONSTRAINT fk_orden_usuario
      FOREIGN KEY (created_by) REFERENCES usuarios(id)
      ON DELETE RESTRICT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_detalle_orden' AND conrelid = 'detalle_orden_compra'::regclass) THEN
    ALTER TABLE detalle_orden_compra
      ADD CONSTRAINT fk_detalle_orden
      FOREIGN KEY (id_orden) REFERENCES orden_compra(id_orden)
      ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_detalle_producto' AND conrelid = 'detalle_orden_compra'::regclass) THEN
    ALTER TABLE detalle_orden_compra
      ADD CONSTRAINT fk_detalle_producto
      FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
      ON DELETE RESTRICT;
  END IF;
END $$;

-- =========================================================
-- INDICES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_producto_nombre
  ON producto (nombre);

CREATE INDEX IF NOT EXISTS idx_producto_codigo_producto
  ON producto (codigo_producto);

CREATE INDEX IF NOT EXISTS idx_proveedor_ruc
  ON proveedor (ruc);

CREATE INDEX IF NOT EXISTS idx_movimiento_fecha
  ON movimiento_inventario (fecha);

CREATE INDEX IF NOT EXISTS idx_movimiento_id_producto
  ON movimiento_inventario (id_producto);

CREATE INDEX IF NOT EXISTS idx_movimiento_id_almacen
  ON movimiento_inventario (id_almacen);

CREATE INDEX IF NOT EXISTS idx_stock_id_producto
  ON stock (id_producto);

CREATE INDEX IF NOT EXISTS idx_stock_id_almacen
  ON stock (id_almacen);

CREATE INDEX IF NOT EXISTS idx_auditoria_fecha
  ON auditoria (fecha);

CREATE INDEX IF NOT EXISTS idx_auditoria_id_usuario
  ON auditoria (id_usuario);

CREATE INDEX IF NOT EXISTS idx_orden_compra_estado
  ON orden_compra (estado);

CREATE INDEX IF NOT EXISTS idx_orden_compra_id_proveedor
  ON orden_compra (id_proveedor);

COMMIT;
