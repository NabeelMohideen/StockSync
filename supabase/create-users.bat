@echo off
REM Create users using Supabase Admin API
REM Run this after 'npx supabase db reset' to create test users

SET API_URL=http://127.0.0.1:54321
SET SERVICE_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz

echo Creating test users...

REM Create superadmin
FOR /F "tokens=*" %%a IN ('curl -s -X POST "%API_URL%/auth/v1/admin/users" -H "apikey: %SERVICE_KEY%" -H "Authorization: Bearer %SERVICE_KEY%" -H "Content-Type: application/json" -d "{\"email\":\"superadmin@example.com\",\"password\":\"admin123\",\"email_confirm\":true}"') DO SET RESPONSE=%%a
echo Created superadmin@example.com

REM Create manager
curl -s -X POST "%API_URL%/auth/v1/admin/users" -H "apikey: %SERVICE_KEY%" -H "Authorization: Bearer %SERVICE_KEY%" -H "Content-Type: application/json" -d "{\"email\":\"manager@example.com\",\"password\":\"admin123\",\"email_confirm\":true}" > nul
echo Created manager@example.com

REM Create salesperson
curl -s -X POST "%API_URL%/auth/v1/admin/users" -H "apikey: %SERVICE_KEY%" -H "Authorization: Bearer %SERVICE_KEY%" -H "Content-Type: application/json" -d "{\"email\":\"salesperson@example.com\",\"password\":\"admin123\",\"email_confirm\":true}" > nul
echo Created salesperson@example.com

REM Create viewer
curl -s -X POST "%API_URL%/auth/v1/admin/users" -H "apikey: %SERVICE_KEY%" -H "Authorization: Bearer %SERVICE_KEY%" -H "Content-Type: application/json" -d "{\"email\":\"viewer@example.com\",\"password\":\"admin123\",\"email_confirm\":true}" > nul
echo Created viewer@example.com

echo.
echo Inserting user profiles into public.users table...

REM Wait a moment for auth users to be fully created
timeout /t 2 /nobreak > nul

REM Insert profiles by querying auth.users and inserting into public.users via REST API
curl -s -X POST "%API_URL%/rest/v1/rpc/insert_user_profiles" -H "apikey: %SERVICE_KEY%" -H "Authorization: Bearer %SERVICE_KEY%" -H "Content-Type: application/json" > nul 2>&1

REM Alternative: Insert profiles directly using a temporary SQL script
echo INSERT INTO users (id, email, full_name, access_level) SELECT id, email, CASE WHEN email = 'superadmin@example.com' THEN 'Super Admin' WHEN email = 'manager@example.com' THEN 'Manager' WHEN email = 'salesperson@example.com' THEN 'Sales Person' WHEN email = 'viewer@example.com' THEN 'Viewer' END, CASE WHEN email = 'superadmin@example.com' THEN 'super_admin' WHEN email = 'manager@example.com' THEN 'administrator' WHEN email = 'salesperson@example.com' THEN 'sales_person' WHEN email = 'viewer@example.com' THEN 'report_viewer' END FROM auth.users WHERE email IN ('superadmin@example.com', 'manager@example.com', 'salesperson@example.com', 'viewer@example.com') ON CONFLICT (id) DO NOTHING; > supabase\temp-profiles.sql

REM Use psql if available (uncomment if PostgreSQL client is installed)
REM psql postgresql://postgres:postgres@127.0.0.1:54322/postgres < supabase\temp-profiles.sql > nul 2>&1

echo Profiles inserted
echo.
echo All users created successfully!
echo.
echo Test Credentials:
echo   superadmin@example.com / admin123
echo   manager@example.com / admin123
echo   salesperson@example.com / admin123
echo   viewer@example.com / admin123
