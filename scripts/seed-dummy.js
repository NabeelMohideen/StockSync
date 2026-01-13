#!/usr/bin/env node

/**
 * Seed Dummy Data Script
 * Loads dummy/test data into the database using direct SQL via REST API
 */

import https from 'https';
import http from 'http';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

// Parse URL
const url = new URL(SUPABASE_URL);
const isHttps = url.protocol === 'https:';
const client = isHttps ? https : http;

async function executeSql(sqlStatements) {
  return new Promise((resolve, reject) => {
    // Send each SQL statement separately
    const executeNext = async (index) => {
      if (index >= sqlStatements.length) {
        resolve();
        return;
      }

      const sql = sqlStatements[index];
      
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: '/rest/v1/rpc/exec_sql',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      };

      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 400) {
            console.error(`Error executing SQL: ${res.statusCode} - ${data}`);
          }
          executeNext(index + 1);
        });
      });

      req.on('error', (err) => {
        console.error('Request error:', err);
        reject(err);
      });

      // Don't send raw SQL, instead use upsert via REST API
      executeNext(index + 1);
    };

    executeNext(0);
  });
}

const dummyData = {
  shops: [
    { id: '10000000-0000-0000-0000-000000000001', name: 'Main Store', location: '123 Main Street, Downtown', phone: '+1234567891', email: 'main@stocksync.com' },
    { id: '10000000-0000-0000-0000-000000000002', name: 'Branch Store', location: '456 Oak Avenue, Uptown', phone: '+1234567892', email: 'branch@stocksync.com' },
    { id: '10000000-0000-0000-0000-000000000003', name: 'Outlet Store', location: '789 Pine Road, Suburb', phone: '+1234567893', email: 'outlet@stocksync.com' }
  ],
  products: [
    { id: '20000000-0000-0000-0000-000000000001', name: 'Samsung 55" 4K Smart TV', description: '55-inch 4K UHD Smart TV with HDR', brand: 'Samsung', model: 'UN55TU8000', category: 'TVs', sku: 'TV-SAM-55-001', barcode: '8806090264849', unit_price: 899.99, cost_price: 650.00, has_serial_numbers: true },
    { id: '20000000-0000-0000-0000-000000000002', name: 'LG 65" OLED TV', description: '65-inch OLED 4K Smart TV', brand: 'LG', model: 'OLED65C1PUB', category: 'TVs', sku: 'TV-LG-65-001', barcode: '8806098681174', unit_price: 1799.99, cost_price: 1300.00, has_serial_numbers: true },
    { id: '20000000-0000-0000-0000-000000000003', name: 'Sony 50" LED TV', description: '50-inch 4K LED Smart TV', brand: 'Sony', model: 'KD50X80J', category: 'TVs', sku: 'TV-SONY-50-001', barcode: '4548736121645', unit_price: 699.99, cost_price: 500.00, has_serial_numbers: true },
    { id: '20000000-0000-0000-0000-000000000004', name: 'HDMI Cable 6ft', description: 'High-speed HDMI cable 6 feet', brand: 'Generic', model: 'HDMI-6FT', category: 'Accessories', sku: 'ACC-HDMI-001', barcode: '1234567890123', unit_price: 9.99, cost_price: 3.00, has_serial_numbers: false },
    { id: '20000000-0000-0000-0000-000000000005', name: 'TV Wall Mount', description: 'Universal TV wall mount 32-70 inches', brand: 'Generic', model: 'WM-UNIV-001', category: 'Accessories', sku: 'ACC-MOUNT-001', barcode: '1234567890124', unit_price: 49.99, cost_price: 20.00, has_serial_numbers: false },
    { id: '20000000-0000-0000-0000-000000000006', name: 'Soundbar System', description: 'Samsung soundbar with wireless subwoofer', brand: 'Samsung', model: 'HW-Q600A', category: 'Audio', sku: 'AUD-SAM-001', barcode: '8806090937897', unit_price: 349.99, cost_price: 220.00, has_serial_numbers: true },
    { id: '20000000-0000-0000-0000-000000000007', name: 'Universal Remote', description: 'Logitech Harmony universal remote', brand: 'Logitech', model: 'Harmony 650', category: 'Accessories', sku: 'ACC-REM-001', barcode: '1234567890125', unit_price: 79.99, cost_price: 45.00, has_serial_numbers: false },
    { id: '20000000-0000-0000-0000-000000000008', name: 'TCL 43" Smart TV', description: '43-inch Full HD Smart TV', brand: 'TCL', model: '43S435', category: 'TVs', sku: 'TV-TCL-43-001', barcode: '8806098697496', unit_price: 399.99, cost_price: 280.00, has_serial_numbers: true },
    { id: '20000000-0000-0000-0000-000000000009', name: 'Streaming Device', description: 'Roku Ultra 4K streaming device', brand: 'Roku', model: 'Ultra 4K', category: 'Accessories', sku: 'ACC-ROKU-001', barcode: '1234567890126', unit_price: 99.99, cost_price: 60.00, has_serial_numbers: true },
    { id: '20000000-0000-0000-0000-000000000010', name: 'TV Stand', description: 'Modern TV stand for up to 65 inch TVs', brand: 'Walker Edison', model: 'W58CSPBL', category: 'Furniture', sku: 'FUR-STAND-001', barcode: '1234567890127', unit_price: 199.99, cost_price: 120.00, has_serial_numbers: false },
    { id: '20000000-0000-0000-0000-000000000011', name: 'Panasonic 40" LED TV', description: '40-inch Full HD LED TV', brand: 'Panasonic', model: 'TC-40FS600', category: 'TVs', sku: 'TV-PANA-40-001', barcode: '8806098698496', unit_price: 349.99, cost_price: 250.00, has_serial_numbers: true },
    { id: '20000000-0000-0000-0000-000000000012', name: 'Surge Protector', description: '8-outlet surge protector', brand: 'Belkin', model: 'BE108230-08', category: 'Accessories', sku: 'ACC-SURGE-001', barcode: '1234567890128', unit_price: 24.99, cost_price: 12.00, has_serial_numbers: false },
    { id: '20000000-0000-0000-0000-000000000013', name: 'Sony Soundbar', description: 'Sony 2.1 channel soundbar', brand: 'Sony', model: 'HT-S100F', category: 'Audio', sku: 'AUD-SONY-001', barcode: '4548736099234', unit_price: 179.99, cost_price: 110.00, has_serial_numbers: true },
    { id: '20000000-0000-0000-0000-000000000014', name: 'Antenna', description: 'Indoor digital TV antenna', brand: 'Antennas Direct', model: 'ClearStream', category: 'Accessories', sku: 'ACC-ANT-001', barcode: '1234567890129', unit_price: 39.99, cost_price: 18.00, has_serial_numbers: false },
    { id: '20000000-0000-0000-0000-000000000015', name: 'Apple TV 4K', description: 'Apple TV 4K streaming device', brand: 'Apple', model: 'A2169', category: 'Accessories', sku: 'ACC-APPLE-001', barcode: '0190199242326', unit_price: 179.99, cost_price: 130.00, has_serial_numbers: true }
  ]
};

async function insertViaRest(table, data) {
  return new Promise((resolve, reject) => {
    const jsonData = JSON.stringify(data);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: `/rest/v1/${table}?upsert=true`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Length': Buffer.byteLength(jsonData),
        'Prefer': 'resolution=merge-duplicates',
      },
    };

    const req = client.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`${res.statusCode}: ${responseData}`));
        } else {
          resolve();
        }
      });
    });

    req.on('error', reject);
    req.write(jsonData);
    req.end();
  });
}

async function seedDummyData() {
  console.log('🌱 Seeding dummy data...\n');

  try {
    console.log('📦 Inserting shops...');
    await insertViaRest('shops', dummyData.shops);
    console.log('✅ Shops inserted\n');

    console.log('📦 Inserting products...');
    await insertViaRest('products', dummyData.products);
    console.log('✅ Products inserted\n');

    console.log('📦 Initializing inventory...');
    const inventoryData = dummyData.products.map(product => ({
      product_id: product.id,
      shop_id: '10000000-0000-0000-0000-000000000001',
      quantity: 0,
      last_restocked_at: new Date().toISOString()
    }));
    await insertViaRest('inventory', inventoryData);
    console.log('✅ Inventory initialized\n');

    console.log('═════════════════════════════════════════');
    console.log('✨ Dummy data seeded successfully!');
    console.log('═════════════════════════════════════════\n');
    console.log('📊 Seeded data:');
    console.log(`   • ${dummyData.shops.length} shops`);
    console.log(`   • ${dummyData.products.length} products`);
    console.log(`   • Inventory initialized for all products\n`);
    console.log('Ready to start development! 🚀\n');

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
}

seedDummyData();
