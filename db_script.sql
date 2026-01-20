-- -----------------------------
-- 1. Categories (static list, can be seeded)
-- -----------------------------
CREATE TABLE categories (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- -----------------------------
-- 2. Users table
-- -----------------------------
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name     TEXT,
    phone         TEXT,
    address       TEXT,
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
);

-- -----------------------------
-- 3. Products table
-- -----------------------------
CREATE TABLE products (
    id            SERIAL PRIMARY KEY,
    title         TEXT NOT NULL,
    description   TEXT,
    price_cents   BIGINT NOT NULL CHECK (price_cents >= 0),
    photo_url     TEXT,
    is_active     BOOLEAN DEFAULT TRUE,
    quantity      INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    views         INTEGER DEFAULT 0,
    category_id   INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    seller_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT unique_active_product_per_seller UNIQUE (title, seller_id, is_active)
);

-- -----------------------------
-- 4. Indexes for performance
-- -----------------------------
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);

-- -----------------------------
-- 5. Trigger to auto-update "updated_at"
-- -----------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------
-- 6. Seed Data
-- -----------------------------

INSERT INTO categories (name) VALUES 
('Electronics'),
('Furniture'),
('Clothing'),
('Books'),
('Sports & Outdoors'),
('Home Appliances')