# Database Setup Guide

## Overview

The database setup is split into two parts:
1. **Essential Data** (`seed.sql`) - Minimal required data for the system
2. **Dummy Data** (`seed-dummy.sql`) - Test data for development

## Initial Setup

### 1. Reset Database with Essential Data Only

```bash
npm run db:reset
```

This command:
- Runs migrations (`npx supabase db reset`)
- Creates test users via Admin API (`bash supabase/create-users.sh`)
- Seeds essential data (1 shop, 2 sample products)

### 2. Reset Database with Full Dummy/Test Data

```bash
npm run db:seed:dummy
```

This command:
- Runs migrations
- Creates test users
- Seeds essential data
- Seeds dummy data (shops, products, inventory, customers, sales, etc.)

## Test Users

After running either command, these users are available:

| Email | Password | Access Level |
|-------|----------|--------------|
| superadmin@example.com | admin123 | Super Admin |
| manager@example.com | admin123 | Administrator |
| salesperson@example.com | admin123 | Sales Person |
| viewer@example.com | admin123 | Report Viewer |

## Manual User Creation

If you need to create users manually:

**On Linux/Mac:**
```bash
bash supabase/create-users.sh
```

**On Windows:**
```cmd
supabase\create-users.bat
```

Or manually via curl:
```bash
curl -X POST "http://127.0.0.1:54321/auth/v1/admin/users" \
  -H "apikey: sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz" \
  -H "Authorization: Bearer sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","email_confirm":true}'
```

## Files

- `supabase/seed.sql` - Essential data (loaded automatically on db reset)
- `supabase/seed-dummy.sql` - Test/dummy data (loaded only via `db:seed:dummy`)
- `supabase/create-users.sh` - User creation script (Linux/Mac)
- `supabase/create-users.bat` - User creation script (Windows)
- `supabase/migrations/` - Database schema migrations

## Troubleshooting

### Users not created after db reset

Run the user creation script manually:
```bash
bash supabase/create-users.sh  # Linux/Mac
# or
supabase\create-users.bat      # Windows
```

### Login fails with "Invalid credentials"

1. Check if Supabase is running: `npx supabase status`
2. Verify users exist in Supabase Studio: http://127.0.0.1:54323
3. Recreate users: `bash supabase/create-users.sh`

### Database errors

Reset everything:
```bash
npx supabase db reset
bash supabase/create-users.sh
```

## Development Workflow

For daily development with test data:
```bash
npm run db:seed:dummy  # Full reset with all test data
npm run dev            # Start dev server
```

For production-like setup (minimal data):
```bash
npm run db:reset       # Reset with essential data only
npm run dev
```
