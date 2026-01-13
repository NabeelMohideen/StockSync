# StockSync Development & Deployment Guide

This document covers development setup, security considerations, and deployment procedures.

## Table of Contents

1. [Row Level Security (RLS)](#row-level-security)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Environment Setup](#environment-setup)
4. [Common Issues & Solutions](#troubleshooting)

---

## Row Level Security

### Overview

RLS (Row Level Security) is a critical database-level security feature that controls data access. It's configured in database migrations.

### Current Development Policy

All tables have this structure:

| Operation | Policy | Details |
|---|---|---|
| **SELECT (READ)** | Public | All users can read data (dev setting) |
| **INSERT** | Authenticated only | Prevents unauthorized data creation |
| **UPDATE** | Authenticated only | Prevents unauthorized modifications |
| **DELETE** | Authenticated only | Prevents unauthorized deletions |

### Why This Design?

- **Development**: Public reads allow testing without authentication
- **Security**: Writes require authentication for data integrity

### Production Requirements ⚠️

**Before deploying to production, you MUST:**

1. **Review and tighten READ policies** to restrict by:
   - User role (admin, manager, sales_person, report_viewer)
   - Shop ownership (users see only their shop's data)
   - Data ownership (users see only their records)

2. **Example: Role-based READ access**
   ```sql
   CREATE POLICY "Users can view their shop data" 
   ON public.products 
   FOR SELECT 
   USING (auth.jwt() ->> 'user_id' IN (
     SELECT user_id FROM user_shops WHERE shop_id = products.shop_id
   ));
   ```

3. **Implement user_id checks for writes:**
   ```sql
   CREATE POLICY "Users can only update their own records" 
   ON public.users 
   FOR UPDATE 
   USING (auth.uid() = id);
   ```

4. **Add audit logging** to track all changes

5. **Test thoroughly** with different user roles

### Testing RLS Policies

Verify current setup:
1. Open browser DevTools → Network tab
2. Go to any page that loads data (Products, Sales, etc.)
3. Check the network request to `http://localhost:54321/rest/v1/products`
4. Verify the response contains data (even without authentication)

### Files

- **Migration**: `supabase/migrations/20260113000001_initial_schema.sql`
  - Lines 194-247: RLS policy definitions
- **See README.md**: Network Access section for database connectivity

---

## Pre-Deployment Checklist

### 1. Code Review & Testing

- [ ] All features tested locally
- [ ] No console errors or warnings
- [ ] Performance acceptable (load times, render times)
- [ ] Mobile responsiveness verified
- [ ] Accessibility tested (keyboard navigation, screen readers)
- [ ] All API endpoints working correctly

### 2. RLS Security Review (CRITICAL)

- [ ] Read all sections above about RLS
- [ ] Define user roles and access levels
- [ ] Create role-based access control (RBAC) matrix:
  - [ ] super_admin: Full access
  - [ ] administrator: Shop data + limited user management
  - [ ] sales_person: Own shop data + assigned records only
  - [ ] report_viewer: Read-only access

- [ ] Implement production policies
  - [ ] Create new migration: `20260114_000001_production_rls_policies.sql`
  - [ ] Role-based SELECT policies
  - [ ] User/shop ownership checks
  - [ ] Test all policies with different roles

### 3. Environment & Credentials

- [ ] Production Supabase project created
- [ ] Database migrations tested on production
- [ ] Environment variables configured
- [ ] API keys secured (not in git)
- [ ] Database backups configured
- [ ] SSL certificates valid (if self-hosted)

### 4. Data & Database

- [ ] Database migrated to production
- [ ] Initial data seeded
- [ ] Indexes created for performance
- [ ] Backups automated
- [ ] Disaster recovery plan documented

### 5. Monitoring & Logging

- [ ] Error tracking setup (Sentry, LogRocket, etc.)
- [ ] Performance monitoring (New Relic, DataDog, etc.)
- [ ] Database query monitoring
- [ ] Uptime monitoring configured
- [ ] Alerts configured for critical issues

### 6. Documentation

- [ ] Update RLS policies documentation
- [ ] Document role hierarchy and permissions
- [ ] Create troubleshooting guide
- [ ] Document how to add RLS to new tables
- [ ] Create runbook for common operations

### 7. Final Tests

- [ ] Test with super_admin user (sees all data)
- [ ] Test with administrator user (sees shop data)
- [ ] Test with sales_person user (sees own records)
- [ ] Test with report_viewer user (read-only)
- [ ] Verify anonymous user sees NO data
- [ ] Test all CRUD operations with proper users

### 8. Sign-Off

**Reviewed by:** _________________ **Date:** _________

**Approved for production:** __ Yes __ No

**Comments:**
_________________________________________________________________
_________________________________________________________________

---

## Environment Setup

### Local Development

```bash
# Install dependencies
npm install

# Start Supabase
npx supabase start

# Reset database (seed with sample data)
npx supabase db reset

# Start dev server
npm run dev
```

### Production

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy (using your hosting platform)
# Examples: Vercel, Netlify, or manual deployment
```

### Environment Variables

**Development (.env):**
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-dev-key
VITE_DISABLE_ROLE_GUARD=true
```

**Production (.env.production):**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-key
VITE_DISABLE_ROLE_GUARD=false
```

---

## Troubleshooting

### RLS Issues

**Data not showing up?**
1. Check RLS policies are enabled
2. Verify user is authenticated (if required)
3. Check console for CORS errors
4. Verify policy logic is correct

**Can't modify data?**
1. Check CRUD policies exist
2. Verify authenticated user has permissions
3. Check WITH CHECK clause on INSERT/UPDATE
4. Review error message in browser console

### Database Issues

**Connection timeout?**
```bash
npx supabase status
# Ensure all services are running
```

**Migrations failed?**
```bash
npx supabase migration list
# Check migration status and logs
```

### Deployment Issues

**Build fails?**
```bash
npm run build
# Check for TypeScript errors or missing imports
```

**Blank page in production?**
1. Check browser console for errors
2. Verify environment variables are set
3. Check network requests in DevTools
4. Verify API connectivity

---

## Security Best Practices

### For Development
✅ Use role guard disabled (`VITE_DISABLE_ROLE_GUARD=true`)
✅ Public READ access to test database connectivity
✅ Use sample data only
✅ Don't commit credentials to git

### For Production
❌ Never disable role guard
❌ Never use public READ access
❌ Use real, secure credentials
❌ Enable HTTPS
❌ Configure firewall rules
❌ Set up DDoS protection
❌ Regular security audits

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [React Best Practices](https://react.dev/learn)
- [Vite Guide](https://vitejs.dev/guide/)

