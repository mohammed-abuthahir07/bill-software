-- Packed product variants
-- Prefer letting the server auto-migrate on startup.

ALTER TABLE products
  ADD COLUMN package_weight DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER gst;

ALTER TABLE products
  ADD COLUMN weight_unit ENUM('g','kg') NOT NULL DEFAULT 'g' AFTER package_weight;

ALTER TABLE products
  ADD COLUMN selling_price DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER weight_unit;

ALTER TABLE products ADD KEY products_user_id (user_id);

ALTER TABLE products DROP INDEX unique_product_per_user;
ALTER TABLE products DROP INDEX unique_variant_per_user;
