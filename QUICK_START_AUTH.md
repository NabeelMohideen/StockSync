# Quick Start: Authentication Testing

## 🚀 Start the App

```bash
npm run dev
```

Visit: http://localhost:5173

**You'll see**: Login page (authentication is now enforced!)

---

## 👤 Test Users

Use any of these accounts to login. Password for all: **`admin123`**

### 1. Super Admin (Full Access)
- **Email**: admin@stocksync.com
- **See**: All 12 menu items
- **Access**: Complete system access

### 2. Administrator (Admin Access)
- **Email**: manager@stocksync.com
- **See**: All 12 menu items
- **Access**: Admin features

### 3. Sales Person (POS Only)
- **Email**: sales@stocksync.com
- **See**: Only POS menu item
- **Access**: Point of Sale checkout

### 4. Report Viewer (Reports Only)
- **Email**: viewer@stocksync.com
- **See**: Only Reports menu item
- **Access**: View reports only

---

## 📋 How to Test

### Test 1: Login Works
1. Visit http://localhost:5173
2. See login page ✓
3. Enter: `admin@stocksync.com` / `admin123`
4. Click "Sign In"
5. Redirected to Dashboard ✓

### Test 2: Role-Based Navigation
1. Login with `admin@stocksync.com` (super_admin)
2. See all menu items in sidebar ✓
3. Logout
4. Login with `sales@stocksync.com` (sales_person)
5. See only POS menu item ✓
6. Navigation is filtered by role ✓

### Test 3: Logout Works
1. Click "Logout" button in sidebar
2. Redirected to login page ✓
3. Session is cleared ✓

### Test 4: Protection Works
1. Logout (or open incognito window)
2. Try to visit: http://localhost:5173/dashboard
3. Gets redirected to /login ✓
4. Can't access pages without login ✓

---

## 📊 What Was Changed

| Item | Change | Effect |
|------|--------|--------|
| `.env` | `VITE_DISABLE_ROLE_GUARD=false` | Auth now enforced |
| `src/Layout.jsx` | Fixed `access_level` instead of `role` | Navigation filtering works |
| Documentation | Added `AUTHENTICATION.md` | Complete auth guide |

---

## 🔍 Verify Everything Works

After running `npm run dev`, check:

- ✅ Login page appears on first visit
- ✅ Can login with test users
- ✅ Dashboard loads after login
- ✅ Navigation items filtered by role
- ✅ User name shown in sidebar
- ✅ Logout button works
- ✅ Can't access pages without login

---

## ❓ Troubleshooting

### "Still seeing app without login"
```bash
# Clear .env cache
1. Edit .env: Change VITE_DISABLE_ROLE_GUARD=false
2. Stop dev server (Ctrl+C)
3. Clear browser cache (Ctrl+Shift+Delete)
4. Run: npm run dev again
```

### "Can't login with test users"
```bash
# Reseed database
npx supabase db reset
```

### "All menu items showing for sales person"
- This means `VITE_DISABLE_ROLE_GUARD=true` is still set
- Change to `false` in `.env`
- Restart dev server

---

## 📚 For More Details

- **Complete Guide**: See [AUTHENTICATION.md](AUTHENTICATION.md)
- **Implementation Details**: See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **Main README**: See [README.md](README.md) - Authentication section

---

## ✅ Success Indicators

Your authentication system is working when:

1. **First visit** → Shows login page
2. **After login** → Shows dashboard with filtered navigation
3. **Different users** → Different menu items visible
4. **Logout** → Returns to login page
5. **Manual URL access** → Redirects to login if not authenticated

---

**Status**: ✅ Ready to test! Visit http://localhost:5173
