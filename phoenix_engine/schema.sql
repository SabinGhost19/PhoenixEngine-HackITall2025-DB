CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    account_number VARCHAR(50) NOT NULL,
    balance DECIMAL(15, 4) NOT NULL,
    client_type VARCHAR(20) NOT NULL, -- 'STANDARD', 'VIP'
    is_shadow BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO accounts (account_number, balance, client_type, is_shadow) VALUES 
('ACC-1001', 1000.00, 'STANDARD', FALSE),
('ACC-1002', 50000.00, 'VIP', FALSE),
('ACC-1001', 1000.00, 'STANDARD', TRUE),
('ACC-1002', 50000.00, 'VIP', TRUE);
