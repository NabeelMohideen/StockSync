# Row Level Security (RLS) Policies - Important!

## Overview
This document explains the RLS (Row Level Security) policies configured for the StockSync database to prevent future data visibility issues.

## Current Policy Design

### Development Environment
**All tables have the following policy structure:**

1. **SELECT (READ) - PUBLIC ACCESS**
   - All users (authenticated and anonymous) can read data
   - This allows the frontend to fetch data without authentication
   - **Policy:** `FOR SELECT USING (true)`

2. **INSERT - AUTHENTICATED ONLY**
   - Only authenticated users can add new records
   - Prevents unauthorized data creation
   - **Policy:** `FOR INSERT TO authenticated WITH CHECK (true)`

3. **UPDATE - AUTHENTICATED ONLY**
   - Only authenticated users can modify existing records
   - Prevents unauthorized data modifications
   - **Policy:** `FOR UPDATE TO authenticated USING (true) WITH CHECK (true)`

4. **DELETE - AUTHENTICATED ONLY**
   - Only authenticated users can delete records
   - Prevents unauthorized data deletion
   - **Policy:** `FOR DELETE TO authenticated USING (true)`

## Affected Tables
- public.users
- public.shops
- public.products
- public.inventory
- public.customers
- public.sales
- public.sale_items
- public.stock_transfers
- public.warranties
- public.accounts

## Why This Design?

### Problem That Was Fixed
Previously, all operations (SELECT, INSERT, UPDATE, DELETE) required authentication, which prevented unauthenticated users from reading data. This caused the app to display no data until users logged in.

### Solution
- **Reads** are public (development setting) - allows testing without authentication
- **Writes** require authentication - ensures data integrity and prevents unauthorized modifications

## Production Considerations

⚠️ **IMPORTANT FOR PRODUCTION:**
Before deploying to production, you MUST:

1. **Review and tighten READ policies** - Consider restricting data access by:
   - User role
   - Shop ownership
   - Data ownership
   - Department/division

2. **Example: Role-based READ access**
   ```sql
   CREATE POLICY "Users can view their own shop data" 
   ON public.products 
   FOR SELECT 
   USING (auth.jwt() ->> 'user_id' IN (
     SELECT user_id FROM user_shops WHERE shop_id = products.shop_id
   ));
   ```

3. **Implement user_id checks** for writes:
   ```sql
   CREATE POLICY "Users can only update their own records" 
   ON public.users 
   FOR UPDATE 
   USING (auth.uid() = id);
   ```

4. **Add audit logging** to track changes

5. **Test thoroughly** with different user roles

## Testing RLS Policies

### How to Verify Current Setup
1. Open browser DevTools → Network tab
2. Go to any page that loads data (Products, Sales, etc.)
3. Check the network request to `http://localhost:54321/rest/v1/products`
4. Verify the response contains data (even without authentication)

### How to Test Writes
1. Try creating a new product - should fail (anonymous user)
2. Log in as a user
3. Try creating a new product - should succeed

## Files to Review
- **Migration:** `/supabase/migrations/20260113000001_initial_schema.sql`
  - Lines 194-247: RLS policy definitions
  - Lines 194-204: RLS enable statements

- **This File:** `/RLS_SECURITY.md` (you are here)

## Checklist for Future Updates

If you add new tables, **always**:
- [ ] Enable RLS: `ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;`
- [ ] Add SELECT policy for public read access
- [ ] Add INSERT policy restricting to authenticated users
- [ ] Add UPDATE policy restricting to authenticated users  
- [ ] Add DELETE policy restricting to authenticated users
- [ ] Document the policy in this file
- [ ] Test data visibility in the web app

## Common Mistakes to Avoid

❌ **DON'T:** Create policies only for INSERT/UPDATE/DELETE without SELECT
```sql
-- This will hide all data!
CREATE POLICY "Allow writes" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
```

✅ **DO:** Create SELECT policy for data visibility
```sql
-- Add this along with write policies
CREATE POLICY "Allow reads" ON public.products FOR SELECT USING (true);
```

❌ **DON'T:** Use `FOR ALL` if you need different permissions for different operations
```sql
-- This applies the same policy to all operations
CREATE POLICY "Generic" ON public.products FOR ALL USING (true);
```

✅ **DO:** Use specific operations (SELECT, INSERT, UPDATE, DELETE)
```sql
CREATE POLICY "Read" ON public.products FOR SELECT USING (true);
CREATE POLICY "Write" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
```

## Quick Reference

| Operation | Current Policy | Development | Production |
|-----------|---|---|---|
| SELECT | Public (`true`) | ✅ Users see all data | ⚠️ Should restrict by role/ownership |
| INSERT | Authenticated only | Requires login | Requires login + validation |
| UPDATE | Authenticated only | Requires login | Requires login + ownership check |
| DELETE | Authenticated only | Requires login | Requires login + admin only |

## Questions?

If data is still not showing:
1. Check browser DevTools → Network → REST API requests
2. Look for error messages in the response
3. Verify RLS policies in Supabase Studio at http://localhost:54323
4. Review this file for the correct policy structure
