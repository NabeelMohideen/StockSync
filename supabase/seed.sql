-- Seed file for StockSync Inventory System
-- This will create a super admin user and populate tables with dummy data

-- Create super admin user in auth.users
DO $$
DECLARE
  user_id UUID;
  hashed_password TEXT;
BEGIN
  -- Generate a UUID for the user
  user_id := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID;
  
  -- Hash the password 'admin123'
  hashed_password := crypt('admin123', gen_salt('bf'));
  
  -- Insert into auth.users if not exists
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud,
    confirmation_token,
    recovery_token,
    email_change_token_new
  )
  VALUES (
    user_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@stocksync.com',
    hashed_password,
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Super Admin"}',
    false,
    'authenticated',
    'authenticated',
    '',
    '',
    ''
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert into auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    user_id,
    user_id::text,
    format('{"sub":"%s","email":"admin@stocksync.com"}', user_id)::jsonb,
    'email',
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (provider, provider_id) DO NOTHING;

  -- Insert into public.users
  INSERT INTO public.users (id, full_name, email, access_level, phone)
  VALUES (
    user_id,
    'Super Admin',
    'admin@stocksync.com',
    'super_admin',
    '+1234567890'
  )
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Insert dummy shops
INSERT INTO public.shops (id, name, location, phone, email) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Main Store', '123 Main Street, Downtown', '+1234567891', 'main@stocksync.com'),
  ('10000000-0000-0000-0000-000000000002', 'Branch Store', '456 Oak Avenue, Uptown', '+1234567892', 'branch@stocksync.com'),
  ('10000000-0000-0000-0000-000000000003', 'Outlet Store', '789 Pine Road, Suburb', '+1234567893', 'outlet@stocksync.com')
ON CONFLICT (id) DO NOTHING;

-- Insert dummy products
INSERT INTO public.products (id, name, brand, model, category, sku, unit_price, cost_price, has_serial_numbers) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Samsung 55" 4K Smart TV', 'Samsung', 'UN55TU8000', 'TVs', 'TV-SAM-55-001', 899.99, 650.00, true),
  ('20000000-0000-0000-0000-000000000002', 'LG 65" OLED TV', 'LG', 'OLED65C1PUB', 'TVs', 'TV-LG-65-001', 1799.99, 1300.00, true),
  ('20000000-0000-0000-0000-000000000003', 'Sony 50" LED TV', 'Sony', 'KD50X80J', 'TVs', 'TV-SONY-50-001', 699.99, 500.00, true),
  ('20000000-0000-0000-0000-000000000004', 'HDMI Cable 6ft', 'Generic', 'HDMI-6FT', 'Accessories', 'ACC-HDMI-001', 9.99, 3.00, false),
  ('20000000-0000-0000-0000-000000000005', 'TV Wall Mount', 'Generic', 'WM-UNIV-001', 'Accessories', 'ACC-MOUNT-001', 49.99, 20.00, false),
  ('20000000-0000-0000-0000-000000000006', 'Soundbar System', 'Samsung', 'HW-Q600A', 'Audio', 'AUD-SAM-001', 349.99, 220.00, true),
  ('20000000-0000-0000-0000-000000000007', 'Universal Remote', 'Logitech', 'Harmony 650', 'Accessories', 'ACC-REM-001', 79.99, 45.00, false),
  ('20000000-0000-0000-0000-000000000008', 'TCL 43" Smart TV', 'TCL', '43S435', 'TVs', 'TV-TCL-43-001', 399.99, 280.00, true),
  ('20000000-0000-0000-0000-000000000009', 'Streaming Device', 'Roku', 'Ultra 4K', 'Accessories', 'ACC-ROKU-001', 99.99, 60.00, true),
  ('20000000-0000-0000-0000-000000000010', 'TV Stand', 'Walker Edison', 'W58CSPBL', 'Furniture', 'FUR-STAND-001', 199.99, 120.00, false)
ON CONFLICT (id) DO NOTHING;

-- Insert inventory for shops
INSERT INTO public.inventory (product_id, shop_id, quantity, serial_numbers) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 5, ARRAY['SN001', 'SN002', 'SN003', 'SN004', 'SN005']),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 3, ARRAY['SN101', 'SN102', 'SN103']),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 4, ARRAY['SN201', 'SN202', 'SN203', 'SN204']),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 50, NULL),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 20, NULL),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 8, ARRAY['SN301', 'SN302', 'SN303', 'SN304', 'SN305', 'SN306', 'SN307', 'SN308']),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 15, NULL),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', 6, ARRAY['SN401', 'SN402', 'SN403', 'SN404', 'SN405', 'SN406']),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000002', 12, ARRAY['SN501', 'SN502', 'SN503', 'SN504', 'SN505', 'SN506', 'SN507', 'SN508', 'SN509', 'SN510', 'SN511', 'SN512']),
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000002', 10, NULL)
ON CONFLICT (product_id, shop_id) DO NOTHING;

-- Insert dummy customers
INSERT INTO public.customers (id, full_name, email, phone, address, city) VALUES
  ('30000000-0000-0000-0000-000000000001', 'John Smith', 'john.smith@email.com', '+1234567801', '123 Elm Street', 'Springfield'),
  ('30000000-0000-0000-0000-000000000002', 'Jane Doe', 'jane.doe@email.com', '+1234567802', '456 Maple Avenue', 'Riverside'),
  ('30000000-0000-0000-0000-000000000003', 'Robert Johnson', 'robert.j@email.com', '+1234567803', '789 Cedar Lane', 'Lakeside'),
  ('30000000-0000-0000-0000-000000000004', 'Emily Davis', 'emily.davis@email.com', '+1234567804', '321 Birch Road', 'Hilltown'),
  ('30000000-0000-0000-0000-000000000005', 'Michael Brown', 'michael.b@email.com', '+1234567805', '654 Spruce Drive', 'Mountainview')
ON CONFLICT (id) DO NOTHING;

-- Insert dummy sales
INSERT INTO public.sales (id, sale_number, shop_id, customer_id, sales_person_id, total_amount, discount_amount, tax_amount, final_amount, payment_method, sale_date) VALUES
  ('40000000-0000-0000-0000-000000000001', 'SAL-2026-0001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 899.99, 50.00, 67.50, 917.49, 'Credit Card', NOW() - INTERVAL '5 days'),
  ('40000000-0000-0000-0000-000000000002', 'SAL-2026-0002', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1799.99, 0.00, 135.00, 1934.99, 'Cash', NOW() - INTERVAL '3 days'),
  ('40000000-0000-0000-0000-000000000003', 'SAL-2026-0003', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 699.99, 20.00, 54.00, 733.99, 'Debit Card', NOW() - INTERVAL '2 days'),
  ('40000000-0000-0000-0000-000000000004', 'SAL-2026-0004', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 449.98, 10.00, 34.80, 474.78, 'Credit Card', NOW() - INTERVAL '1 day'),
  ('40000000-0000-0000-0000-000000000005', 'SAL-2026-0005', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000005', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 399.99, 0.00, 30.00, 429.99, 'Cash', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sale items
INSERT INTO public.sale_items (sale_id, product_id, quantity, unit_price, discount_amount, total_price, serial_number) VALUES
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 1, 899.99, 50.00, 849.99, 'SN001'),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 1, 1799.99, 0.00, 1799.99, 'SN101'),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 1, 699.99, 20.00, 679.99, 'SN201'),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 5, 9.99, 0.00, 49.95, NULL),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000007', 5, 79.99, 10.00, 389.95, NULL),
  ('40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000008', 1, 399.99, 0.00, 399.99, 'SN401')
ON CONFLICT (id) DO NOTHING;

-- Insert dummy warranties
INSERT INTO public.warranties (warranty_number, sale_id, product_id, customer_id, serial_number, warranty_period_months, start_date, end_date, status) VALUES
  ('WAR-2026-0001', '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'SN001', 12, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '359 days', 'active'),
  ('WAR-2026-0002', '40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'SN101', 24, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '721 days', 'active'),
  ('WAR-2026-0003', '40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'SN201', 12, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '363 days', 'active'),
  ('WAR-2026-0005', '40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000005', 'SN401', 12, CURRENT_DATE, CURRENT_DATE + INTERVAL '365 days', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert dummy accounts (financial transactions)
INSERT INTO public.accounts (transaction_type, category, amount, description, shop_id, user_id, transaction_date) VALUES
  ('income', 'Sales', 917.49, 'Sale SAL-2026-0001', '10000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_DATE - INTERVAL '5 days'),
  ('income', 'Sales', 1934.99, 'Sale SAL-2026-0002', '10000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_DATE - INTERVAL '3 days'),
  ('income', 'Sales', 733.99, 'Sale SAL-2026-0003', '10000000-0000-0000-0000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_DATE - INTERVAL '2 days'),
  ('expense', 'Utilities', 250.00, 'Monthly electricity bill', '10000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_DATE - INTERVAL '1 day'),
  ('expense', 'Rent', 2500.00, 'Monthly rent - Main Store', '10000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_DATE),
  ('income', 'Sales', 474.78, 'Sale SAL-2026-0004', '10000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_DATE - INTERVAL '1 day'),
  ('income', 'Sales', 429.99, 'Sale SAL-2026-0005', '10000000-0000-0000-0000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;
