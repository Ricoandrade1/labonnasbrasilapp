-- Adds new columns to orders table
ALTER TABLE orders
ADD COLUMN payment JSONB,
ADD COLUMN deletionRequest JSONB,
ADD COLUMN notes TEXT;

-- Removes redundant columns from orders table
ALTER TABLE orders
DROP COLUMN name,
DROP COLUMN price,
DROP COLUMN category,
DROP COLUMN description,
DROP COLUMN includes,
DROP COLUMN daysAvailable,
DROP COLUMN reportEnabled,
DROP COLUMN editablePrice,
DROP COLUMN quantity;

-- Renames products column to items
ALTER TABLE orders
RENAME COLUMN products TO items;
