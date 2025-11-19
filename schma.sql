-- ============================================================
-- USERS TABLE
-- ============================================================
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    user_type VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Seed Users
INSERT INTO users (id, email, password, user_type, created_at) VALUES
(1, 'venkatesh@dodopayments.com', '123456789', 'user', '2025-11-19 08:29:27.456292'),
(2, 'venkateshkonar1206@gmail.com', 'venky@123#', 'admin', '2025-11-19 08:35:37.148228');


-- ============================================================
-- PRODUCTS TABLE (internal ID + Dodo product_id)
-- ============================================================
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(255),  -- Dodo product_id (pdt_xxx)
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_products_dodo_product_id ON products(product_id);


-- ============================================================
-- SUBSCRIPTIONS TABLE (internal ID + Dodo subscription_id)
-- ============================================================
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    subscription_id VARCHAR(255), -- Dodo subscription_id (sub_xxx)

    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,

    status VARCHAR(20) NOT NULL DEFAULT 'active',
    start_date TIMESTAMP DEFAULT NOW(),
    end_date TIMESTAMP
);

CREATE UNIQUE INDEX idx_subscriptions_dodo_subscription_id ON subscriptions(subscription_id);


-- ============================================================
-- PAYMENTS TABLE (internal ID + Dodo payment_id)
-- ============================================================
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,

    payment_id VARCHAR(255) UNIQUE,       -- Dodo payment_id
    subscription_ref VARCHAR(255),        -- Dodo subscription_id
    brand_id VARCHAR(255),

    user_ref VARCHAR(255),                -- Dodo customer_id
    product_ref VARCHAR(255),             -- Dodo product_id
    subscription_ref2 VARCHAR(255),       -- Dodo subscription_id (mirror field)

    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE SET NULL,

    status VARCHAR(50) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL,

    payment_method VARCHAR(255),
    payment_method_type VARCHAR(255),

    customer_id VARCHAR(255),
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),

    digital_products_delivered BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_payments_user_id ON payments(user_id);


-- ============================================================
-- EVENTS TABLE
-- ============================================================
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    event_payload JSONB NOT NULL,
    received_at TIMESTAMP DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE
);
