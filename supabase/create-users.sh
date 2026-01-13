#!/bin/bash

# Create users using Supabase Admin API
# Run this after 'npx supabase db reset' to create test users

API_URL="http://127.0.0.1:54321"
SERVICE_KEY="sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz"

echo "Creating test users..."

# Create superadmin
SUPERADMIN_ID=$(curl -s -X POST "$API_URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@example.com","password":"admin123","email_confirm":true}' \
  | grep -oP '"id":"\K[^"]+' | head -1)

echo "✓ Created superadmin@example.com (ID: $SUPERADMIN_ID)"

# Create manager
MANAGER_ID=$(curl -s -X POST "$API_URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@example.com","password":"admin123","email_confirm":true}' \
  | grep -oP '"id":"\K[^"]+' | head -1)

echo "✓ Created manager@example.com (ID: $MANAGER_ID)"

# Create salesperson
SALESPERSON_ID=$(curl -s -X POST "$API_URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"salesperson@example.com","password":"admin123","email_confirm":true}' \
  | grep -oP '"id":"\K[^"]+' | head -1)

echo "✓ Created salesperson@example.com (ID: $SALESPERSON_ID)"

# Create viewer
VIEWER_ID=$(curl -s -X POST "$API_URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"viewer@example.com","password":"admin123","email_confirm":true}' \
  | grep -oP '"id":"\K[^"]+' | head -1)

echo "✓ Created viewer@example.com (ID: $VIEWER_ID)"

echo ""
echo "Inserting user profiles into public.users table..."

# Insert profiles using REST API
curl -s -X POST "$API_URL/rest/v1/users" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "[
    {\"id\":\"$SUPERADMIN_ID\",\"email\":\"superadmin@example.com\",\"full_name\":\"Super Admin\",\"access_level\":\"super_admin\"},
    {\"id\":\"$MANAGER_ID\",\"email\":\"manager@example.com\",\"full_name\":\"Manager\",\"access_level\":\"administrator\"},
    {\"id\":\"$SALESPERSON_ID\",\"email\":\"salesperson@example.com\",\"full_name\":\"Sales Person\",\"access_level\":\"sales_person\"},
    {\"id\":\"$VIEWER_ID\",\"email\":\"viewer@example.com\",\"full_name\":\"Viewer\",\"access_level\":\"report_viewer\"}
  ]" > /dev/null

echo "✓ Profiles inserted"
echo ""
echo "✅ All users created successfully!"
echo ""
echo "Test Credentials:"
echo "  superadmin@example.com / admin123"
echo "  manager@example.com / admin123"
echo "  salesperson@example.com / admin123"
echo "  viewer@example.com / admin123"
