-- Create enum types
CREATE TYPE user_role AS ENUM ('super_admin', 'administrator', 'sales_person', 'report_viewer');
CREATE TYPE stock_transfer_status AS ENUM ('pending', 'in_transit', 'completed', 'cancelled');
CREATE TYPE warranty_status AS ENUM ('active', 'expired', 'claimed', 'processed');

-- Users table (extends auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    access_level user_role NOT NULL DEFAULT 'sales_person',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shops table
CREATE TABLE public.shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT,
    phone TEXT,
    email TEXT,
    manager_id UUID REFERENCES public.users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    brand TEXT,
    model TEXT,
    category TEXT,
    sku TEXT UNIQUE,
    barcode TEXT,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    cost_price DECIMAL(10,2) DEFAULT 0,
    has_serial_numbers BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory table
CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    serial_numbers TEXT[], -- Array of serial numbers
    last_restocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, shop_id)
);

-- Customers table
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales table
CREATE TABLE public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_number TEXT UNIQUE NOT NULL,
    shop_id UUID REFERENCES public.shops(id),
    customer_id UUID REFERENCES public.customers(id),
    sales_person_id UUID REFERENCES public.users(id),
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_method TEXT,
    notes TEXT,
    sale_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sale Items table
CREATE TABLE public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    serial_number TEXT, -- For products with serial numbers
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock Transfers table
CREATE TABLE public.stock_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_number TEXT UNIQUE NOT NULL,
    from_shop_id UUID REFERENCES public.shops(id),
    to_shop_id UUID REFERENCES public.shops(id),
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    serial_numbers TEXT[], -- Array of serial numbers being transferred
    status stock_transfer_status DEFAULT 'pending',
    requested_by UUID REFERENCES public.users(id),
    approved_by UUID REFERENCES public.users(id),
    notes TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Warranties table
CREATE TABLE public.warranties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warranty_number TEXT UNIQUE NOT NULL,
    sale_id UUID REFERENCES public.sales(id),
    product_id UUID REFERENCES public.products(id),
    customer_id UUID REFERENCES public.customers(id),
    serial_number TEXT,
    warranty_period_months INTEGER DEFAULT 12,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    status warranty_status DEFAULT 'active',
    claim_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accounts (Financial transactions) table
CREATE TABLE public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type TEXT NOT NULL, -- 'income', 'expense', 'refund'
    category TEXT,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference_id UUID, -- Can reference sales, purchases, etc.
    shop_id UUID REFERENCES public.shops(id),
    user_id UUID REFERENCES public.users(id),
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_access_level ON public.users(access_level);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_barcode ON public.products(barcode);
CREATE INDEX idx_inventory_product ON public.inventory(product_id);
CREATE INDEX idx_inventory_shop ON public.inventory(shop_id);
CREATE INDEX idx_sales_shop ON public.sales(shop_id);
CREATE INDEX idx_sales_customer ON public.sales(customer_id);
CREATE INDEX idx_sales_date ON public.sales(sale_date);
CREATE INDEX idx_sale_items_sale ON public.sale_items(sale_id);
CREATE INDEX idx_stock_transfers_from_shop ON public.stock_transfers(from_shop_id);
CREATE INDEX idx_stock_transfers_to_shop ON public.stock_transfers(to_shop_id);
CREATE INDEX idx_stock_transfers_status ON public.stock_transfers(status);
CREATE INDEX idx_warranties_customer ON public.warranties(customer_id);
CREATE INDEX idx_warranties_status ON public.warranties(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON public.shops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_transfers_updated_at BEFORE UPDATE ON public.stock_transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warranties_updated_at BEFORE UPDATE ON public.warranties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow authenticated users for now, can be refined later)
CREATE POLICY "Allow authenticated users" ON public.users FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users" ON public.shops FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users" ON public.products FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users" ON public.inventory FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users" ON public.customers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users" ON public.sales FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users" ON public.sale_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users" ON public.stock_transfers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users" ON public.warranties FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users" ON public.accounts FOR ALL TO authenticated USING (true);
