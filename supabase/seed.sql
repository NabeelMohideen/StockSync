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

-- Create additional test users
DO $$
DECLARE
  admin_user_id UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'::UUID;
  sales_user_id UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'::UUID;
  viewer_user_id UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'::UUID;
  hashed_password TEXT;
BEGIN
  hashed_password := crypt('admin123', gen_salt('bf'));

  -- Administrator user
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new)
  VALUES (admin_user_id, '00000000-0000-0000-0000-000000000000', 'manager@stocksync.com', hashed_password, NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Store Manager"}', false, 'authenticated', 'authenticated', '', '', '')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), admin_user_id, admin_user_id::text, format('{"sub":"%s","email":"manager@stocksync.com"}', admin_user_id)::jsonb, 'email', NOW(), NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.users (id, full_name, email, access_level, phone)
  VALUES (admin_user_id, 'Store Manager', 'manager@stocksync.com', 'administrator', '+1234567894')
  ON CONFLICT (id) DO NOTHING;

  -- Sales person user
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new)
  VALUES (sales_user_id, '00000000-0000-0000-0000-000000000000', 'sales@stocksync.com', hashed_password, NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sales Associate"}', false, 'authenticated', 'authenticated', '', '', '')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), sales_user_id, sales_user_id::text, format('{"sub":"%s","email":"sales@stocksync.com"}', sales_user_id)::jsonb, 'email', NOW(), NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.users (id, full_name, email, access_level, phone)
  VALUES (sales_user_id, 'Sales Associate', 'sales@stocksync.com', 'sales_person', '+1234567895')
  ON CONFLICT (id) DO NOTHING;

  -- Report viewer user
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new)
  VALUES (viewer_user_id, '00000000-0000-0000-0000-000000000000', 'viewer@stocksync.com', hashed_password, NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Report Viewer"}', false, 'authenticated', 'authenticated', '', '', '')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), viewer_user_id, viewer_user_id::text, format('{"sub":"%s","email":"viewer@stocksync.com"}', viewer_user_id)::jsonb, 'email', NOW(), NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.users (id, full_name, email, access_level, phone)
  VALUES (viewer_user_id, 'Report Viewer', 'viewer@stocksync.com', 'report_viewer', '+1234567896')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Insert dummy shops
INSERT INTO public.shops (id, name, location, phone, email, manager_id) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Main Store', '123 Main Street, Downtown', '+1234567891', 'main@stocksync.com', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
  ('10000000-0000-0000-0000-000000000002', 'Branch Store', '456 Oak Avenue, Uptown', '+1234567892', 'branch@stocksync.com', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
  ('10000000-0000-0000-0000-000000000003', 'Outlet Store', '789 Pine Road, Suburb', '+1234567893', 'outlet@stocksync.com', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13')
ON CONFLICT (id) DO NOTHING;

-- Insert dummy products
INSERT INTO public.products (id, name, description, brand, model, category, sku, barcode, unit_price, cost_price, has_serial_numbers) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Samsung 55" 4K Smart TV', '55-inch 4K UHD Smart TV with HDR', 'Samsung', 'UN55TU8000', 'TVs', 'TV-SAM-55-001', '8806090264849', 899.99, 650.00, true),
  ('20000000-0000-0000-0000-000000000002', 'LG 65" OLED TV', '65-inch OLED 4K Smart TV', 'LG', 'OLED65C1PUB', 'TVs', 'TV-LG-65-001', '8806098681174', 1799.99, 1300.00, true),
  ('20000000-0000-0000-0000-000000000003', 'Sony 50" LED TV', '50-inch 4K LED Smart TV', 'Sony', 'KD50X80J', 'TVs', 'TV-SONY-50-001', '4548736121645', 699.99, 500.00, true),
  ('20000000-0000-0000-0000-000000000004', 'HDMI Cable 6ft', 'High-speed HDMI cable 6 feet', 'Generic', 'HDMI-6FT', 'Accessories', 'ACC-HDMI-001', '1234567890123', 9.99, 3.00, false),
  ('20000000-0000-0000-0000-000000000005', 'TV Wall Mount', 'Universal TV wall mount 32-70 inches', 'Generic', 'WM-UNIV-001', 'Accessories', 'ACC-MOUNT-001', '1234567890124', 49.99, 20.00, false),
  ('20000000-0000-0000-0000-000000000006', 'Soundbar System', 'Samsung soundbar with wireless subwoofer', 'Samsung', 'HW-Q600A', 'Audio', 'AUD-SAM-001', '8806090937897', 349.99, 220.00, true),
  ('20000000-0000-0000-0000-000000000007', 'Universal Remote', 'Logitech Harmony universal remote', 'Logitech', 'Harmony 650', 'Accessories', 'ACC-REM-001', '1234567890125', 79.99, 45.00, false),
  ('20000000-0000-0000-0000-000000000008', 'TCL 43" Smart TV', '43-inch Full HD Smart TV', 'TCL', '43S435', 'TVs', 'TV-TCL-43-001', '8806098697496', 399.99, 280.00, true),
  ('20000000-0000-0000-0000-000000000009', 'Streaming Device', 'Roku Ultra 4K streaming device', 'Roku', 'Ultra 4K', 'Accessories', 'ACC-ROKU-001', '1234567890126', 99.99, 60.00, true),
  ('20000000-0000-0000-0000-000000000010', 'TV Stand', 'Modern TV stand for up to 65 inch TVs', 'Walker Edison', 'W58CSPBL', 'Furniture', 'FUR-STAND-001', '1234567890127', 199.99, 120.00, false),
  ('20000000-0000-0000-0000-000000000011', 'Panasonic 40" LED TV', '40-inch Full HD LED TV', 'Panasonic', 'TC-40FS600', 'TVs', 'TV-PANA-40-001', '8806098698496', 349.99, 250.00, true),
  ('20000000-0000-0000-0000-000000000012', 'Surge Protector', '8-outlet surge protector', 'Belkin', 'BE108230-08', 'Accessories', 'ACC-SURGE-001', '1234567890128', 24.99, 12.00, false),
  ('20000000-0000-0000-0000-000000000013', 'Sony Soundbar', 'Sony 2.1 channel soundbar', 'Sony', 'HT-S100F', 'Audio', 'AUD-SONY-001', '4548736099234', 179.99, 110.00, true),
  ('20000000-0000-0000-0000-000000000014', 'Antenna', 'Indoor digital TV antenna', 'Antennas Direct', 'ClearStream', 'Accessories', 'ACC-ANT-001', '1234567890129', 39.99, 18.00, false),
  ('20000000-0000-0000-0000-000000000015', 'Apple TV 4K', 'Apple TV 4K streaming device', 'Apple', 'A2169', 'Accessories', 'ACC-APPLE-001', '0190199242326', 179.99, 130.00, true)
ON CONFLICT (id) DO NOTHING;

-- Insert inventory for shops
INSERT INTO public.inventory (product_id, shop_id, quantity, serial_numbers, last_restocked_at) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 5, ARRAY['SN001', 'SN002', 'SN003', 'SN004', 'SN005'], NOW() - INTERVAL '10 days'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 3, ARRAY['SN101', 'SN102', 'SN103'], NOW() - INTERVAL '8 days'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 4, ARRAY['SN201', 'SN202', 'SN203', 'SN204'], NOW() - INTERVAL '7 days'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 50, NULL, NOW() - INTERVAL '12 days'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 20, NULL, NOW() - INTERVAL '15 days'),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 8, ARRAY['SN301', 'SN302', 'SN303', 'SN304', 'SN305', 'SN306', 'SN307', 'SN308'], NOW() - INTERVAL '6 days'),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 15, NULL, NOW() - INTERVAL '20 days'),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', 6, ARRAY['SN401', 'SN402', 'SN403', 'SN404', 'SN405', 'SN406'], NOW() - INTERVAL '5 days'),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000002', 12, ARRAY['SN501', 'SN502', 'SN503', 'SN504', 'SN505', 'SN506', 'SN507', 'SN508', 'SN509', 'SN510', 'SN511', 'SN512'], NOW() - INTERVAL '4 days'),
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000002', 10, NULL, NOW() - INTERVAL '9 days'),
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000002', 7, ARRAY['SN601', 'SN602', 'SN603', 'SN604', 'SN605', 'SN606', 'SN607'], NOW() - INTERVAL '11 days'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 3, ARRAY['SN006', 'SN007', 'SN008'], NOW() - INTERVAL '13 days'),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', 8, ARRAY['SN407', 'SN408', 'SN409', 'SN410', 'SN411', 'SN412', 'SN413', 'SN414'], NOW() - INTERVAL '6 days'),
  ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001', 30, NULL, NOW() - INTERVAL '18 days'),
  ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000001', 5, ARRAY['SN701', 'SN702', 'SN703', 'SN704', 'SN705'], NOW() - INTERVAL '7 days'),
  ('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000002', 25, NULL, NOW() - INTERVAL '14 days'),
  ('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000001', 4, ARRAY['SN801', 'SN802', 'SN803', 'SN804'], NOW() - INTERVAL '3 days')
ON CONFLICT (product_id, shop_id) DO NOTHING;

-- Insert dummy customers
INSERT INTO public.customers (id, full_name, email, phone, address, city, notes) VALUES
  ('30000000-0000-0000-0000-000000000001', 'John Smith', 'john.smith@email.com', '+1234567801', '123 Elm Street', 'Springfield', 'Regular customer, prefers Samsung products'),
  ('30000000-0000-0000-0000-000000000002', 'Jane Doe', 'jane.doe@email.com', '+1234567802', '456 Maple Avenue', 'Riverside', 'VIP customer'),
  ('30000000-0000-0000-0000-000000000003', 'Robert Johnson', 'robert.j@email.com', '+1234567803', '789 Cedar Lane', 'Lakeside', NULL),
  ('30000000-0000-0000-0000-000000000004', 'Emily Davis', 'emily.davis@email.com', '+1234567804', '321 Birch Road', 'Hilltown', 'Requested extended warranty'),
  ('30000000-0000-0000-0000-000000000005', 'Michael Brown', 'michael.b@email.com', '+1234567805', '654 Spruce Drive', 'Mountainview', NULL),
  ('30000000-0000-0000-0000-000000000006', 'Sarah Wilson', 'sarah.wilson@email.com', '+1234567806', '987 Oak Boulevard', 'Riverside', 'Repeat customer'),
  ('30000000-0000-0000-0000-000000000007', 'David Martinez', 'david.m@email.com', '+1234567807', '246 Pine Street', 'Springfield', NULL),
  ('30000000-0000-0000-0000-000000000008', 'Lisa Anderson', 'lisa.anderson@email.com', '+1234567808', '135 Willow Lane', 'Lakeside', 'Business account'),
  ('30000000-0000-0000-0000-000000000009', 'James Taylor', 'james.t@email.com', '+1234567809', '864 Maple Court', 'Hilltown', NULL),
  ('30000000-0000-0000-0000-000000000010', 'Jennifer Garcia', 'jennifer.g@email.com', '+1234567810', '753 Cedar Avenue', 'Mountainview', 'Prefers LG products')
ON CONFLICT (id) DO NOTHING;

-- Insert dummy sales
INSERT INTO public.sales (id, sale_number, shop_id, customer_id, sales_person_id, total_amount, discount_amount, tax_amount, final_amount, payment_method, notes, sale_date) VALUES
  ('40000000-0000-0000-0000-000000000001', 'SAL-2026-0001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 899.99, 50.00, 67.50, 917.49, 'Credit Card', 'Customer requested delivery', NOW() - INTERVAL '15 days'),
  ('40000000-0000-0000-0000-000000000002', 'SAL-2026-0002', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 1799.99, 0.00, 135.00, 1934.99, 'Cash', NULL, NOW() - INTERVAL '12 days'),
  ('40000000-0000-0000-0000-000000000003', 'SAL-2026-0003', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 699.99, 20.00, 54.00, 733.99, 'Debit Card', NULL, NOW() - INTERVAL '10 days'),
  ('40000000-0000-0000-0000-000000000004', 'SAL-2026-0004', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 449.98, 10.00, 34.80, 474.78, 'Credit Card', NULL, NOW() - INTERVAL '8 days'),
  ('40000000-0000-0000-0000-000000000005', 'SAL-2026-0005', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000005', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 399.99, 0.00, 30.00, 429.99, 'Cash', NULL, NOW() - INTERVAL '5 days'),
  ('40000000-0000-0000-0000-000000000006', 'SAL-2026-0006', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000006', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 899.99, 100.00, 63.00, 862.99, 'Credit Card', 'Holiday discount applied', NOW() - INTERVAL '4 days'),
  ('40000000-0000-0000-0000-000000000007', 'SAL-2026-0007', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000007', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 349.99, 0.00, 26.25, 376.24, 'Cash', NULL, NOW() - INTERVAL '3 days'),
  ('40000000-0000-0000-0000-000000000008', 'SAL-2026-0008', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000008', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 179.99, 0.00, 13.50, 193.49, 'Debit Card', NULL, NOW() - INTERVAL '2 days'),
  ('40000000-0000-0000-0000-000000000009', 'SAL-2026-0009', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000009', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 99.99, 0.00, 7.50, 107.49, 'Credit Card', NULL, NOW() - INTERVAL '1 day'),
  ('40000000-0000-0000-0000-000000000010', 'SAL-2026-0010', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000010', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 1799.99, 50.00, 131.25, 1881.24, 'Cash', 'VIP customer discount', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sale items
INSERT INTO public.sale_items (sale_id, product_id, quantity, unit_price, discount_amount, total_price, serial_number) VALUES
  -- Sale 1
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 1, 899.99, 50.00, 849.99, 'SN001'),
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 2, 9.99, 0.00, 19.98, NULL),
  -- Sale 2
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 1, 1799.99, 0.00, 1799.99, 'SN101'),
  -- Sale 3
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 1, 699.99, 20.00, 679.99, 'SN201'),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', 1, 49.99, 0.00, 49.99, NULL),
  -- Sale 4
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 5, 9.99, 0.00, 49.95, NULL),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000007', 5, 79.99, 10.00, 389.95, NULL),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000005', 1, 49.99, 0.00, 49.99, NULL),
  -- Sale 5
  ('40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000008', 1, 399.99, 0.00, 399.99, 'SN401'),
  -- Sale 6
  ('40000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', 1, 899.99, 100.00, 799.99, 'SN006'),
  ('40000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000012', 2, 24.99, 0.00, 49.98, NULL),
  -- Sale 7
  ('40000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000011', 1, 349.99, 0.00, 349.99, 'SN601'),
  -- Sale 8
  ('40000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000013', 1, 179.99, 0.00, 179.99, 'SN701'),
  -- Sale 9
  ('40000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000009', 1, 99.99, 0.00, 99.99, 'SN501'),
  -- Sale 10
  ('40000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000002', 1, 1799.99, 50.00, 1749.99, 'SN102')
ON CONFLICT (id) DO NOTHING;

-- Insert dummy warranties
INSERT INTO public.warranties (id, warranty_number, sale_id, product_id, customer_id, serial_number, warranty_period_months, start_date, end_date, status, claim_notes) VALUES
  ('50000000-0000-0000-0000-000000000001', 'WAR-2026-0001', '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'SN001', 12, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '350 days', 'active', NULL),
  ('50000000-0000-0000-0000-000000000002', 'WAR-2026-0002', '40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'SN101', 24, CURRENT_DATE - INTERVAL '12 days', CURRENT_DATE + INTERVAL '718 days', 'active', NULL),
  ('50000000-0000-0000-0000-000000000003', 'WAR-2026-0003', '40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'SN201', 12, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '355 days', 'active', NULL),
  ('50000000-0000-0000-0000-000000000004', 'WAR-2026-0004', '40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000005', 'SN401', 12, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '360 days', 'active', NULL),
  ('50000000-0000-0000-0000-000000000005', 'WAR-2026-0005', '40000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000006', 'SN006', 12, CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE + INTERVAL '361 days', 'active', NULL),
  ('50000000-0000-0000-0000-000000000006', 'WAR-2026-0006', '40000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000007', 'SN601', 12, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '362 days', 'active', NULL),
  ('50000000-0000-0000-0000-000000000007', 'WAR-2026-0007', '40000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000008', 'SN701', 12, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '363 days', 'active', NULL),
  ('50000000-0000-0000-0000-000000000008', 'WAR-2026-0008', '40000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000009', 'SN501', 12, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '364 days', 'active', NULL),
  ('50000000-0000-0000-0000-000000000009', 'WAR-2026-0009', '40000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000010', 'SN102', 24, CURRENT_DATE, CURRENT_DATE + INTERVAL '730 days', 'active', NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert dummy accounts (financial transactions)
INSERT INTO public.accounts (transaction_type, category, amount, description, reference_id, shop_id, user_id, transaction_date) VALUES
  ('income', 'Sales', 917.49, 'Sale SAL-2026-0001', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', CURRENT_DATE - INTERVAL '15 days'),
  ('income', 'Sales', 1934.99, 'Sale SAL-2026-0002', '40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', CURRENT_DATE - INTERVAL '12 days'),
  ('income', 'Sales', 733.99, 'Sale SAL-2026-0003', '40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', CURRENT_DATE - INTERVAL '10 days'),
  ('expense', 'Utilities', 250.00, 'Monthly electricity bill - Main Store', NULL, '10000000-0000-0000-0000-000000000001', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', CURRENT_DATE - INTERVAL '9 days'),
  ('expense', 'Rent', 2500.00, 'Monthly rent - Main Store', NULL, '10000000-0000-0000-0000-000000000001', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', CURRENT_DATE - INTERVAL '8 days'),
  ('income', 'Sales', 474.78, 'Sale SAL-2026-0004', '40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_DATE - INTERVAL '8 days'),
  ('income', 'Sales', 429.99, 'Sale SAL-2026-0005', '40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', CURRENT_DATE - INTERVAL '5 days'),
  ('expense', 'Rent', 1800.00, 'Monthly rent - Branch Store', NULL, '10000000-0000-0000-0000-000000000002', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', CURRENT_DATE - INTERVAL '4 days'),
  ('income', 'Sales', 862.99, 'Sale SAL-2026-0006', '40000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', CURRENT_DATE - INTERVAL '4 days'),
  ('income', 'Sales', 376.24, 'Sale SAL-2026-0007', '40000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', CURRENT_DATE - INTERVAL '3 days'),
  ('expense', 'Utilities', 180.00, 'Monthly electricity bill - Branch Store', NULL, '10000000-0000-0000-0000-000000000002', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', CURRENT_DATE - INTERVAL '3 days'),
  ('expense', 'Marketing', 500.00, 'Social media advertising campaign', NULL, '10000000-0000-0000-0000-000000000001', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', CURRENT_DATE - INTERVAL '2 days'),
  ('income', 'Sales', 193.49, 'Sale SAL-2026-0008', '40000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_DATE - INTERVAL '2 days'),
  ('expense', 'Supplies', 150.00, 'Office supplies and packaging materials', NULL, '10000000-0000-0000-0000-000000000001', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', CURRENT_DATE - INTERVAL '1 day'),
  ('income', 'Sales', 107.49, 'Sale SAL-2026-0009', '40000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000001', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', CURRENT_DATE - INTERVAL '1 day'),
  ('expense', 'Utilities', 120.00, 'Monthly electricity bill - Outlet Store', NULL, '10000000-0000-0000-0000-000000000003', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', CURRENT_DATE),
  ('income', 'Sales', 1881.24, 'Sale SAL-2026-0010', '40000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', CURRENT_DATE),
  ('expense', 'Maintenance', 300.00, 'Store maintenance and repairs', NULL, '10000000-0000-0000-0000-000000000001', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

-- Insert dummy stock transfers
INSERT INTO public.stock_transfers (id, transfer_number, from_shop_id, to_shop_id, product_id, quantity, serial_numbers, status, requested_by, approved_by, notes, requested_at, completed_at) VALUES
  ('60000000-0000-0000-0000-000000000001', 'STK-2026-0001', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 2, ARRAY['SN002', 'SN003'], 'completed', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Stock transfer to meet branch demand', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days'),
  ('60000000-0000-0000-0000-000000000002', 'STK-2026-0002', '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000008', 3, ARRAY['SN402', 'SN403', 'SN404'], 'completed', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'New outlet store opening inventory', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days'),
  ('60000000-0000-0000-0000-000000000003', 'STK-2026-0003', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', 20, NULL, 'completed', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Accessories restock', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),
  ('60000000-0000-0000-0000-000000000004', 'STK-2026-0004', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000006', 2, ARRAY['SN304', 'SN305'], 'in_transit', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Transfer for promotional event', NOW() - INTERVAL '2 days', NULL),
  ('60000000-0000-0000-0000-000000000005', 'STK-2026-0005', '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000009', 3, ARRAY['SN503', 'SN504', 'SN505'], 'pending', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, 'Return excess inventory', NOW() - INTERVAL '1 day', NULL),
  ('60000000-0000-0000-0000-000000000006', 'STK-2026-0006', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000007', 5, NULL, 'completed', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Remote control stock balancing', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days'),
  ('60000000-0000-0000-0000-000000000007', 'STK-2026-0007', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000015', 2, ARRAY['SN802', 'SN803'], 'pending', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NULL, 'Apple TV for display units', NOW(), NULL)
ON CONFLICT (id) DO NOTHING;
