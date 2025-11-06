-- Fix orders table to allow NULL discount_code_id and staff_id
-- Run this SQL script to update the database schema

-- For MySQL/MariaDB:
ALTER TABLE orders MODIFY COLUMN discount_code_id VARCHAR(255) NULL;
ALTER TABLE orders MODIFY COLUMN staff_id VARCHAR(255) NULL;

-- Alternative for other databases, you may need to drop and recreate constraints:
-- ALTER TABLE orders DROP CONSTRAINT fk_discount_code;
-- ALTER TABLE orders ADD CONSTRAINT fk_discount_code FOREIGN KEY (discount_code_id) REFERENCES discount_codes(discount_code_id);
