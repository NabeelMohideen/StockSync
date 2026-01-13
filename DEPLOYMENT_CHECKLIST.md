# Pre-Deployment Checklist

## RLS Security Review (CRITICAL)

Before deploying to production, complete this checklist:

### 1. Audit Current Policies
- [ ] Review all RLS policies in `supabase/migrations/20260113000001_initial_schema.sql`
- [ ] Read `RLS_SECURITY.md` for current development setup
- [ ] Understand why SELECT is currently public (development only)

### 2. Design Production Policies
- [ ] Define user roles and access levels
- [ ] Create role-based access control (RBAC) matrix:
  - [ ] super_admin: Full access to all data
  - [ ] administrator: Full access to shop data, limited user management
  - [ ] sales_person: Can see own shop data and assigned records
  - [ ] report_viewer: Read-only access to reports

- [ ] Plan data ownership models:
  - [ ] Sales belong to a sales_person and shop
  - [ ] Inventory belongs to a shop
  - [ ] Users belong to shops/teams

### 3. Implement Production Policies
- [ ] Create new migration: `20260114_000001_production_rls_policies.sql`
- [ ] Implement role-based SELECT policies
- [ ] Implement user_id checks for personal data
- [ ] Implement shop_id checks for shop data
- [ ] Test all policies with different user roles

### 4. Testing
- [ ] Test with super_admin user (should see all data)
- [ ] Test with administrator user (should see shop data)
- [ ] Test with sales_person user (should see own records)
- [ ] Test with report_viewer user (read-only access)
- [ ] Test anonymous user (should see NO data)
- [ ] Verify write operations are blocked for users without permission

### 5. Documentation
- [ ] Update RLS_SECURITY.md with production policies
- [ ] Document role hierarchy and access levels
- [ ] Create troubleshooting guide for RLS issues
- [ ] Document how to add RLS to new tables

### 6. Monitoring
- [ ] Set up audit logs for data access
- [ ] Monitor RLS policy performance
- [ ] Set up alerts for unauthorized access attempts
- [ ] Regular security audits

---

## Quick Reference: Production RLS Example

```sql
-- Example: Sales table with role-based access

-- Super admin can see everything
CREATE POLICY "super_admin_all_access" 
ON public.sales 
FOR SELECT 
USING (auth.jwt() ->> 'access_level' = 'super_admin');

-- Admin can see shop data
CREATE POLICY "admin_shop_access" 
ON public.sales 
FOR SELECT 
USING (
  auth.jwt() ->> 'access_level' IN ('super_admin', 'administrator')
  AND shop_id IN (
    SELECT shop_id FROM user_shops WHERE user_id = auth.uid()
  )
);

-- Sales person can see own sales
CREATE POLICY "salesperson_own_sales" 
ON public.sales 
FOR SELECT 
USING (
  auth.uid() = sales_person_id 
  OR shop_id IN (
    SELECT shop_id FROM user_shops WHERE user_id = auth.uid()
  )
);

-- Report viewer read-only
CREATE POLICY "report_viewer_read" 
ON public.sales 
FOR SELECT 
USING (auth.jwt() ->> 'access_level' = 'report_viewer');
```

---

## Why This Matters

The RLS issue occurred because:
- ❌ Development had public SELECT access
- ❌ No documentation about the design
- ❌ No checklist to review before deployment

This checklist prevents:
- 🔒 Unauthorized data access
- 🔐 Data leaks to competitors
- 🛡️ Compliance violations (GDPR, etc.)
- 👮 Security breaches

---

## Sign-Off

Before deploying, have your security/tech lead sign off:

**Reviewed by:** _________________ **Date:** _________

**Approved for production:** __ Yes __ No

**Comments:**
_________________________________________________________________
_________________________________________________________________
