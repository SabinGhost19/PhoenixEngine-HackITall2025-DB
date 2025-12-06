CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    account_number VARCHAR(50) NOT NULL,
    balance DECIMAL(15, 4) NOT NULL,
    client_type VARCHAR(20) NOT NULL, -- 'STANDARD', 'VIP'
    is_shadow BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data for Legacy accounts (is_shadow = FALSE)
INSERT INTO accounts (account_number, balance, client_type, is_shadow) VALUES 
('ACC001', 10000.00, 'STANDARD', FALSE),
('ACC002', 50000.00, 'VIP', FALSE),
('ACC003', 25000.00, 'STANDARD', FALSE),
('ACC004', 75000.00, 'VIP', FALSE),
('ACC005', 15000.00, 'STANDARD', FALSE),
('ACC006', 30000.00, 'VIP', FALSE),
('ACC007', 20000.00, 'STANDARD', FALSE),
('ACC008', 60000.00, 'VIP', FALSE),
('ACC009', 12000.00, 'STANDARD', FALSE),
('ACC010', 40000.00, 'VIP', FALSE);

-- Seed data for Modern/Shadow accounts (is_shadow = TRUE)
INSERT INTO accounts (account_number, balance, client_type, is_shadow) VALUES 
('ACC001', 10000.00, 'STANDARD', TRUE),
('ACC002', 50000.00, 'VIP', TRUE),
('ACC003', 25000.00, 'STANDARD', TRUE),
('ACC004', 75000.00, 'VIP', TRUE),
('ACC005', 15000.00, 'STANDARD', TRUE),
('ACC006', 30000.00, 'VIP', TRUE),
('ACC007', 20000.00, 'STANDARD', TRUE),
('ACC008', 60000.00, 'VIP', TRUE),
('ACC009', 12000.00, 'STANDARD', TRUE),
('ACC010', 40000.00, 'VIP', TRUE);
