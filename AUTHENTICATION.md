# StockSync Authentication & Authorization Guide

## Overview

StockSync implements a complete authentication and role-based access control system using Supabase Auth with PostgreSQL backend. The app now enforces login on visit and restricts functionality based on user roles.

## Authentication Flow

### 1. On App Launch
```
User visits app → AuthProvider checks Supabase session → 
  If authenticated: Show app with role-based navigation
  If NOT authenticated: Redirect to /login page
```

### 2. Login Process
1. User enters email and password on Login page
2. Credentials sent to Supabase Auth
3. If valid: Session created, user redirected to Dashboard
4. If invalid: Error message displayed

### 3. Post-Login
- User navigates the app with navigation items filtered by their role
- Sidebar shows logged-in user's name and role
- User can logout to return to login page

## User Roles

StockSync supports 4 role levels with different access levels:

| Role | Access Level | Pages Visible |
|------|-------------|----------------|
| **super_admin** | Full access | All pages |
| **administrator** | Admin access | All pages except some report filtering |
| **sales_person** | Limited access | POS only |
| **report_viewer** | Read-only | Reports only |

### Role-Based Navigation Access

- **POS**: `super_admin`, `administrator`, `sales_person`
- **Dashboard**: `super_admin`, `administrator`
- **Products**: `super_admin`, `administrator`
- **Shops**: `super_admin`, `administrator`
- **Inventory**: `super_admin`, `administrator`
- **Transfers**: `super_admin`, `administrator`
- **Sales**: `super_admin`, `administrator`
- **Accounts**: `super_admin`, `administrator`
- **Customers**: `super_admin`, `administrator`
- **Warranties**: `super_admin`, `administrator`
- **Reports**: `super_admin`, `administrator`, `report_viewer`
- **Users**: `super_admin`, `administrator`

## Test Users

The following test users are available for testing:

```
super_admin:
  Email: superadmin@example.com
  Password: admin123
  Access: All features

administrator:
  Email: manager@example.com
  Password: admin123
  Access: Most features

sales_person:
  Email: salesperson@example.com
  Password: admin123
  Access: POS only

report_viewer:
  Email: viewer@example.com
  Password: admin123
  Access: Reports only
```

## Architecture

### Components

#### AuthProvider (src/lib/AuthContext.jsx)
- Manages global authentication state
- Handles login/logout/signup functions
- Stores user session information
- Provides hooks: `useAuth()`

Key state:
```javascript
{
  user,              // Supabase auth user object
  isAuthenticated,   // Boolean flag
  isLoadingAuth,     // Loading state during auth checks
  authError,         // Error message if any
  signIn,            // Function to login
  signOut,           // Function to logout
  checkUserAuth      // Function to refresh auth state
}
```

#### ProtectedRoute (src/App.jsx)
- Wraps all app routes except /login
- Checks authentication status
- Redirects unauthenticated users to /login
- Shows loading spinner while checking auth

#### Layout (src/Layout.jsx)
- Main app layout with sidebar
- Fetches user profile from Supabase
- Filters navigation items by user role
- Displays logged-in user info
- Provides logout button

#### Login Page (src/pages/Login.jsx)
- Email/password login form
- Handles Supabase authentication
- Redirects authenticated users to dashboard
- Shows demo credentials for testing

### Environment Variables

Located in `.env`:

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<your-key>
VITE_DISABLE_ROLE_GUARD=false    # Set to false to enforce auth
```

**Important**: 
- `VITE_DISABLE_ROLE_GUARD=false` enforces login (production mode)
- `VITE_DISABLE_ROLE_GUARD=true` bypasses auth for development (dev mode)

## How to Use

### Starting Development Server

```bash
npm run dev
```

The app will:
1. Start on localhost:5173
2. Redirect to /login if you're not authenticated
3. Show login page with demo credentials

### Logging In

1. Use any of the test user credentials (see above)
2. Click "Sign In"
3. Dashboard loads with role-based navigation

### Testing Different Roles

1. Login with `admin@stocksync.com` (super_admin) → See all menu items
2. Logout and login with `sales@stocksync.com` (sales_person) → See only POS
3. Logout and login with `viewer@stocksync.com` (report_viewer) → See only Reports

### Creating New Users

New users can be created via:
1. Supabase dashboard auth interface
2. Database `public.users` table with associated `auth.users` entry
3. Make sure to set `access_level` to one of: `super_admin`, `administrator`, `sales_person`, `report_viewer`

## Database Schema

### users table
```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY,           -- Links to auth.users
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    access_level user_role,        -- super_admin | administrator | sales_person | report_viewer
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

## Security Considerations

### Row-Level Security (RLS)

The database has RLS policies that:
- Allow public reads on most tables (for display)
- Require authentication for writes (updates/inserts/deletes)
- Prevent unauthorized data access

### Session Management

- Sessions are managed by Supabase Auth
- Tokens stored securely in browser
- Tokens automatically refreshed as needed
- Logout destroys session

### Password Security

- Passwords are hashed with bcrypt on backend
- Never stored in plain text
- Managed entirely by Supabase Auth

## Troubleshooting

### Problem: Always redirected to login
**Solution**: Check if VITE_DISABLE_ROLE_GUARD is set to false and restart dev server

### Problem: Can't login with test users
**Solution**: 
1. Verify Supabase is running (`supabase status`)
2. Check test users are seeded (`supabase seed run`)
3. Verify credentials match seed.sql

### Problem: Some nav items disappear after login
**Solution**: This is correct behavior - nav items are filtered by user role. Try logging in with a higher-privilege user.

### Problem: Can access pages without logging in
**Solution**: Check .env has `VITE_DISABLE_ROLE_GUARD=false`

## For Developers

### Accessing User Info

```jsx
import { useAuth } from '@/lib/AuthContext';

function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user.email}</p>
      ) : (
        <p>Please login</p>
      )}
    </div>
  );
}
```

### Checking User Role

```jsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';

function MyComponent() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      return data;
    }
  });

  return <div>{user?.access_level}</div>;
}
```

### Protecting Custom Routes

All routes in the Pages config are automatically protected. To add a new protected route:

1. Create the page component
2. Add to `pages.config.js` Pages export
3. It will automatically be wrapped with ProtectedRoute

## Next Steps

1. Test authentication by visiting the app - should see login page
2. Login with test user - should see dashboard
3. Verify role-based navigation works
4. Create additional test users as needed
5. Implement role checks in individual page components if needed

---

**Status**: ✅ Authentication system is now active and enforced
