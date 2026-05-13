-- Moneda en la que se registran costo y precio de venta del vehículo (misma escala numérica que antes).
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS price_currency text NOT NULL DEFAULT 'PYG';

ALTER TABLE vehicles
DROP CONSTRAINT IF EXISTS vehicles_price_currency_check;

ALTER TABLE vehicles
ADD CONSTRAINT vehicles_price_currency_check CHECK (price_currency IN ('PYG', 'USD'));
