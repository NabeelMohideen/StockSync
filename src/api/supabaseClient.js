import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for common queries
export const db = {
  // Products
  products: {
    list: () => supabase.from('products').select('*').order('created_at', { ascending: false }),
    get: (id) => supabase.from('products').select('*').eq('id', id).single(),
    create: (data) => supabase.from('products').insert([data]).select(),
    update: (id, data) => supabase.from('products').update(data).eq('id', id).select(),
    delete: (id) => supabase.from('products').delete().eq('id', id),
  },

  // Shops
  shops: {
    list: () => supabase.from('shops').select('*').order('created_at', { ascending: false }),
    get: (id) => supabase.from('shops').select('*').eq('id', id).single(),
    create: (data) => supabase.from('shops').insert([data]).select(),
    update: (id, data) => supabase.from('shops').update(data).eq('id', id).select(),
    delete: (id) => supabase.from('shops').delete().eq('id', id),
  },

  // Sales
  sales: {
    list: (limit = 100) => supabase.from('sales').select('*').order('sale_date', { ascending: false }).limit(limit),
    get: (id) => supabase.from('sales').select('*').eq('id', id).single(),
    create: (data) => supabase.from('sales').insert([data]).select(),
    update: (id, data) => supabase.from('sales').update(data).eq('id', id).select(),
    delete: (id) => supabase.from('sales').delete().eq('id', id),
  },

  // Shop Inventory
  shopInventory: {
    list: () => supabase.from('shop_inventory').select('*').order('created_at', { ascending: false }),
    get: (id) => supabase.from('shop_inventory').select('*').eq('id', id).single(),
    create: (data) => supabase.from('shop_inventory').insert([data]).select(),
    update: (id, data) => supabase.from('shop_inventory').update(data).eq('id', id).select(),
    delete: (id) => supabase.from('shop_inventory').delete().eq('id', id),
    getByShop: (shopId) => supabase.from('shop_inventory').select('*').eq('shop_id', shopId),
  },

  // Customers
  customers: {
    list: () => supabase.from('customers').select('*').order('created_at', { ascending: false }),
    get: (id) => supabase.from('customers').select('*').eq('id', id).single(),
    create: (data) => supabase.from('customers').insert([data]).select(),
    update: (id, data) => supabase.from('customers').update(data).eq('id', id).select(),
    delete: (id) => supabase.from('customers').delete().eq('id', id),
  },

  // Users
  users: {
    list: () => supabase.from('users').select('*').order('created_at', { ascending: false }),
    get: (id) => supabase.from('users').select('*').eq('id', id).single(),
    create: (data) => supabase.from('users').insert([data]).select(),
    update: (id, data) => supabase.from('users').update(data).eq('id', id).select(),
    delete: (id) => supabase.from('users').delete().eq('id', id),
  },

  // Stock Transfers
  stockTransfers: {
    list: () => supabase.from('stock_transfers').select('*').order('created_at', { ascending: false }),
    get: (id) => supabase.from('stock_transfers').select('*').eq('id', id).single(),
    create: (data) => supabase.from('stock_transfers').insert([data]).select(),
    update: (id, data) => supabase.from('stock_transfers').update(data).eq('id', id).select(),
    delete: (id) => supabase.from('stock_transfers').delete().eq('id', id),
  },

  // Warranties
  warranties: {
    list: () => supabase.from('warranties').select('*').order('created_at', { ascending: false }),
    get: (id) => supabase.from('warranties').select('*').eq('id', id).single(),
    create: (data) => supabase.from('warranties').insert([data]).select(),
    update: (id, data) => supabase.from('warranties').update(data).eq('id', id).select(),
    delete: (id) => supabase.from('warranties').delete().eq('id', id),
  },

  // Accounts
  accounts: {
    list: () => supabase.from('accounts').select('*').order('created_at', { ascending: false }),
    get: (id) => supabase.from('accounts').select('*').eq('id', id).single(),
    create: (data) => supabase.from('accounts').insert([data]).select(),
    update: (id, data) => supabase.from('accounts').update(data).eq('id', id).select(),
    delete: (id) => supabase.from('accounts').delete().eq('id', id),
  },

  // Reports
  reports: {
    list: () => supabase.from('reports').select('*').order('created_at', { ascending: false }),
    get: (id) => supabase.from('reports').select('*').eq('id', id).single(),
    create: (data) => supabase.from('reports').insert([data]).select(),
    update: (id, data) => supabase.from('reports').update(data).eq('id', id).select(),
    delete: (id) => supabase.from('reports').delete().eq('id', id),
  },
};
