ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS external_reference VARCHAR(64);