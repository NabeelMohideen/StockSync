/**
 * Script to create a super admin user
 * 
 * Usage:
 *   node scripts/create-super-admin.js <email> <password>
 * 
 * Example:
 *   node scripts/create-super-admin.js admin@stocksync.com MySecurePassword123
 */

import { createClient } from '@base44/sdk';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = (question) => new Promise((resolve) => {
  rl.question(question, resolve);
});

async function createSuperAdmin() {
  try {
    console.log('\n=== StockSync Super Admin Setup ===\n');
    
    // Get credentials from args or prompt
    let email = process.argv[2];
    let password = process.argv[3];
    
    if (!email) {
      email = await prompt('Enter super admin email: ');
    }
    
    if (!password) {
      password = await prompt('Enter password (min 6 characters): ');
    }
    
    if (!email || !password || password.length < 6) {
      console.error('\n❌ Error: Email and password (min 6 chars) are required');
      process.exit(1);
    }
    
    console.log('\n📝 Creating super admin user...');
    
    // Get Base44 credentials from environment
    const appId = process.env.VITE_BASE44_APP_ID;
    const token = process.env.VITE_BASE44_TOKEN;
    
    if (!appId) {
      console.error('\n❌ Error: VITE_BASE44_APP_ID not found in environment');
      console.log('Please set your Base44 app credentials in .env.local');
      process.exit(1);
    }
    
    // Create Base44 client
    const base44 = createClient({
      appId,
      token,
      requiresAuth: false
    });
    
    console.log('✅ Connected to Base44');
    
    // Register user through Base44
    console.log('📧 Registering user...');
    const registerResult = await base44.auth.register(email, password, {
      full_name: 'Super Admin',
      access_level: 'super_admin'
    });
    
    if (registerResult.error) {
      console.error('\n❌ Registration error:', registerResult.error);
      process.exit(1);
    }
    
    console.log('✅ User registered');
    
    // Create user record in database
    const userId = registerResult.data?.user?.id;
    
    if (userId) {
      console.log('📝 Creating user profile...');
      
      await base44.entities.User.create({
        id: userId,
        email,
        full_name: 'Super Admin',
        access_level: 'super_admin',
        role: 'admin'
      });
      
      console.log('✅ User profile created');
    }
    
    console.log('\n✅ Super admin created successfully!');
    console.log('\nLogin credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\nYou can now login at: http://localhost:5173\n');
    
  } catch (error) {
    console.error('\n❌ Error creating super admin:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

createSuperAdmin();
