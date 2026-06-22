-- FASE D - Borrado Logico
-- Agrega estado a entidades maestras que aun no lo tienen.

BEGIN;

ALTER TABLE categoria
  ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activo';

ALTER TABLE almacen
  ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activo';

ALTER TABLE ubicacion
  ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activo';

ALTER TABLE producto
  ALTER COLUMN estado SET DEFAULT 'activo';

ALTER TABLE proveedor
  ALTER COLUMN estado SET DEFAULT 'activo';

ALTER TABLE usuarios
  ALTER COLUMN estado SET DEFAULT 'activo';

UPDATE categoria SET estado = 'activo' WHERE estado IS NULL;
UPDATE almacen SET estado = 'activo' WHERE estado IS NULL;
UPDATE ubicacion SET estado = 'activo' WHERE estado IS NULL;
UPDATE producto SET estado = LOWER(estado) WHERE estado IS NOT NULL;
UPDATE proveedor SET estado = LOWER(estado) WHERE estado IS NOT NULL;
UPDATE usuarios SET estado = LOWER(estado) WHERE estado IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_categoria_estado'
      AND conrelid = 'categoria'::regclass
  ) THEN
    ALTER TABLE categoria
      ADD CONSTRAINT chk_categoria_estado CHECK (estado IN ('activo', 'inactivo'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_almacen_estado'
      AND conrelid = 'almacen'::regclass
  ) THEN
    ALTER TABLE almacen
      ADD CONSTRAINT chk_almacen_estado CHECK (estado IN ('activo', 'inactivo'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_ubicacion_estado'
      AND conrelid = 'ubicacion'::regclass
  ) THEN
    ALTER TABLE ubicacion
      ADD CONSTRAINT chk_ubicacion_estado CHECK (estado IN ('activo', 'inactivo'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_categoria_estado ON categoria (estado);
CREATE INDEX IF NOT EXISTS idx_producto_estado ON producto (estado);
CREATE INDEX IF NOT EXISTS idx_almacen_estado ON almacen (estado);
CREATE INDEX IF NOT EXISTS idx_ubicacion_estado ON ubicacion (estado);
CREATE INDEX IF NOT EXISTS idx_proveedor_estado ON proveedor (estado);
CREATE INDEX IF NOT EXISTS idx_usuarios_estado ON usuarios (estado);

COMMIT;
