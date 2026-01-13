# StockSync - Inventory Management System

A modern, full-featured inventory management system built with React, Vite, and Supabase. Manage shops, products, sales, customers, stock transfers, warranties, and financial accounts.

## Features

- **Multi-Shop Management**: Manage multiple retail locations from a single dashboard
- **Product Catalog**: Track products with variants, serial numbers, pricing, and inventory levels
- **Point of Sale (POS)**: Fast checkout interface with cart management and invoice generation
- **Sales Tracking**: Complete sales history with customer details and payment methods
- **Inventory Management**: Real-time stock tracking across shops with low-stock alerts
- **Stock Transfers**: Transfer products between locations with status tracking
- **Customer Management**: Store customer information and purchase history
- **Warranty Tracking**: Automatic warranty creation and expiry tracking
- **Financial Accounts**: Track income and expenses with transaction history
- **User Management**: Role-based access control (Super Admin, Administrator, Sales Person, Report Viewer)
- **Reports & Analytics**: Sales performance, shop analytics, and financial summaries

## Tech Stack

- **Frontend**: React 18, Vite 6
- **UI Framework**: TailwindCSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Date Handling**: date-fns

## Prerequisites

- Node.js 18+ and npm
- Supabase CLI
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd stocksync
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

Start local Supabase instance:

```bash
npx supabase start
```

The `.env` file is already configured with:

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
VITE_DISABLE_ROLE_GUARD=false
```

### 4. Initialize Database

Two options available:

**Option A: Essential Data Only** (Recommended for production-like testing)
```bash
npm run db:reset
```

**Option B: Full Dummy Data** (For comprehensive testing)
```bash
npm run db:seed:dummy
```

Both commands:
- Run database migrations (creates all tables)
- Create 4 test users via Admin API
- Seed essential or dummy data

### 5. Test Users

After running db:reset or db:seed:dummy:

| Email | Password | Role |
|-------|----------|------|
| superadmin@example.com | admin123 | Super Admin |
| manager@example.com | admin123 | Administrator |
| salesperson@example.com | admin123 | Sales Person |
| viewer@example.com | admin123 | Report Viewer |

### 6. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:8000` and login with any test user above.

## Network Access (Multi-Device Development)

Access your development app from other devices on your network:

### Quick Start

1. **Find your machine IP:**
   ```bash
   # Windows: Run in Command Prompt
   ipconfig
   # Look for "IPv4 Address" (e.g., 192.168.1.100)
   
   # Mac/Linux: Run in Terminal
   ifconfig
   # Look for "inet " that's not 127.0.0.1
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```

3. **Access from another device:**
   ```
   http://YOUR_MACHINE_IP:8000
   # Example: http://192.168.1.100:8000
   ```

The app will **automatically detect network access** and connect to the database.

### How It Works

- **Local access** (localhost) → Uses `http://localhost:54321`
- **Network access** (192.168.x.x) → Auto-switches to `http://192.168.x.x:54321`

### Troubleshooting Network Access

**Can't connect from another device?**

1. Check firewall allows ports 8000 and 54321:
   ```bash
   # Windows Firewall
   netsh advfirewall firewall add rule name="StockSync Dev" dir=in action=allow protocol=tcp localport=8000,54321
   ```

2. Verify Supabase is running:
   ```bash
   npx supabase status
   ```

3. Test network connectivity:
   ```bash
   ping 192.168.1.100  # Replace with your IP
   ```

4. Clear browser cache on the network device and try again

## Database Schema

### Core Tables

- **users**: User accounts with role-based permissions
- **shops**: Retail locations with details
- **products**: Product catalog with pricing and serial number tracking
- **inventory**: Shop-level stock quantities with serial number arrays
- **customers**: Customer information and contact details
- **sales**: Sales transactions with payment methods
- **sale_items**: Individual items in each sale
- **stock_transfers**: Product transfers between locations
- **warranties**: Warranty records with expiry tracking
- **accounts**: Financial transactions (income/expense)

### User Roles

- **super_admin**: Full system access
- **administrator**: Manage shops, products, inventory, sales
- **sales_person**: POS access, limited to assigned shop
- **report_viewer**: Read-only access to reports

## Key Features Guide

### Dashboard

View real-time metrics:
- Total products and shop inventory
- Sales revenue and transaction count
- Low stock alerts
- Shop performance comparison

### Point of Sale (POS)

1. Select shop
2. Search and add products to cart
3. Enter customer details (optional)
4. Select payment method
5. Complete sale and generate invoice

### Inventory Management

- View stock levels across all shops
- Update quantities
- Track serial numbers for electronics
- Monitor low stock alerts

### Stock Transfers

1. Select product and destination shop
2. Enter quantity and transfer details
3. Track status: Pending → In Transit → Completed
4. Automatic inventory updates on completion

### Financial Accounts

Track business finances:
- Record income transactions (sales, other revenue)
- Record expenses (rent, utilities, salaries)
- View net balance and financial summaries
- Filter by transaction type

## Authentication & Authorization

The app implements complete authentication with role-based access control:

- **Login Required**: Users must login to access the app
- **4 User Roles**: Super Admin, Administrator, Sales Person, Report Viewer
- **Role-Based Navigation**: Menu items filtered by user role
- **Session Management**: Secure session handling with Supabase Auth
- **Test Users**: Pre-configured for immediate testing

### User Roles & Access

| Role | Access | Pages |
|------|--------|-------|
| **super_admin** | Full access | All pages |
| **administrator** | Admin access | All pages |
| **sales_person** | Limited access | POS only |
| **report_viewer** | Read-only | Reports only |

**Test credentials (automatically created on db reset):**
- `superadmin@example.com` (super_admin) - Full system access
- `manager@example.com` (administrator) - Shop and inventory management
- `salesperson@example.com` (sales_person) - POS only
- `viewer@example.com` (report_viewer) - Reports and analytics only

Password: `admin123` for all test accounts

### Architecture

The authentication flow:
1. **App Launch** → AuthProvider checks Supabase session
2. **If authenticated** → Show app with role-based navigation
3. **If NOT authenticated** → Redirect to /login page
4. **Login Process** → Credentials sent to Supabase Auth → Session created → Redirect to Dashboard

### Implementation Details

**AuthProvider** (`src/lib/AuthContext.jsx`)
- Manages global authentication state
- Provides `useAuth()` hook for components
- Handles login/logout/signup operations
- Tracks session and user information

**ProtectedRoute** (`src/App.jsx`)
- Wraps all app routes (except /login)
- Checks if user is authenticated
- Redirects to /login if not authenticated

**Layout** (`src/Layout.jsx`)
- Displays sidebar with role-filtered navigation
- Shows logged-in user's name and role
- Provides logout functionality

### Project Structure

```
src/
├── api/              # API clients (Supabase)
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   ├── dashboard/   # Dashboard widgets
│   └── pos/         # POS components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and configs
│   ├── AuthContext.jsx     # Authentication provider
│   ├── NavigationTracker.jsx
│   └── PageNotFound.jsx
├── pages/           # Page components
└── utils/           # Helper functions

supabase/
├── migrations/      # Database migrations
├── config.toml      # Supabase local config
├── seed.sql         # Essential data
├── seed-dummy.sql   # Full test data
├── create-users.sh  # Linux/Mac user creation
└── create-users.bat # Windows user creation
```

### Available Scripts

- `npm run dev` - Start development server on port 8000
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Check code quality
- `npm run lint:fix` - Auto-fix linting issues
- `npm run db:reset` - Reset database with essential data + create users
- `npm run db:seed` - Alias for db:reset
- `npm run db:seed:dummy` - Reset database with full test/dummy data + create users
- `npx supabase migration new <name>` - Create new database migration

### Adding New Features

1. Create database migration if needed: `npx supabase migration new feature_name`
2. Update `src/api/supabaseClient.js` with new CRUD helpers
3. Create page component in `src/pages/`
4. Add route in `src/App.jsx`
5. Update navigation in `src/Layout.jsx`

## Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH

# Authentication (default: false - auth required)
# Set to false for production or true to skip auth in development
VITE_DISABLE_ROLE_GUARD=false
```

**Note**: The `.env` file is already configured. Only modify if you're using a different Supabase instance.

## Development & Deployment

### Security & RLS Policies

Row Level Security (RLS) is configured at the database level to control data access:

**Current Development Setup:**
- **SELECT (READ)**: Public - All users can read data
- **INSERT**: Authenticated only - Prevents unauthorized data creation
- **UPDATE**: Authenticated only - Prevents unauthorized modifications
- **DELETE**: Authenticated only - Prevents unauthorized deletions

⚠️ **Before Deploying to Production:**
1. Tighten READ policies to restrict by user role, shop ownership, or data ownership
2. Implement role-based access control (RBAC) at database level
3. Add audit logging to track all changes
4. Test thoroughly with different user roles

**Example: Role-based READ access**
```sql
CREATE POLICY "Users can view their shop data" 
ON public.products 
FOR SELECT 
USING (auth.jwt() ->> 'user_id' IN (
  SELECT user_id FROM user_shops WHERE shop_id = products.shop_id
));
```

See [supabase/migrations/20260113000001_initial_schema.sql](supabase/migrations/20260113000001_initial_schema.sql) for current RLS policies.

### Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] No console errors or warnings
- [ ] Performance acceptable (load times, render times)
- [ ] Mobile responsiveness verified
- [ ] Accessibility tested (keyboard navigation, screen readers)
- [ ] RLS policies reviewed and tightened for production
- [ ] Environment variables configured for production
- [ ] All API endpoints working correctly

### Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

### Deploy to Vercel/Netlify

1. Connect your repository
2. Set environment variables
3. Build command: `npm run build`
4. Output directory: `dist`

### Supabase Production

1. Create project at [supabase.com](https://supabase.com)
2. Run migrations: `npx supabase db push --linked`
3. Update environment variables with production credentials
4. Configure Row Level Security policies

## Troubleshooting

### Port 8000 already in use

The dev server will automatically use the next available port. Check the terminal output for the actual URL. Or manually change in `vite.config.js`:

```js
server: {
  port: 3000, // or any available port
}
```

### Database connection issues

1. **Check Supabase is running:**
   ```bash
   npx supabase status
   ```

2. **Restart Supabase:**
   ```bash
   npx supabase stop
   npx supabase start
   ```

3. **Reset and reinitialize:**
   ```bash
   npx supabase db reset
   npm run db:reset
   ```

### Login fails with "Invalid credentials"

1. Verify users were created:
   ```bash
   npx supabase status
   # Visit Supabase Studio: http://127.0.0.1:54323
   # Check auth.users table
   ```

2. Recreate test users:
   ```bash
   npm run db:reset
   ```

### Console errors about React Router

These are informational warnings from React Router about future v7 compatibility. They don't affect functionality. The app is configured with the future flags to prepare for v7.

### CORS or connection errors

1. Verify Supabase is accessible:
   ```bash
   curl http://localhost:54321/auth/v1/health
   # Should return 200 OK
   ```

2. Check firewall allows ports 8000 and 54321

3. Clear browser cache and reload

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation in [DEVELOPMENT.md](DEVELOPMENT.md)
- Review Supabase logs: `npx supabase logs`

## Roadmap

- [ ] Barcode scanning support
- [ ] Email notifications for low stock
- [ ] Advanced reporting with charts
- [ ] Multi-currency support
- [ ] Mobile app (React Native)
- [ ] Supplier management
- [ ] Purchase order tracking
- [ ] Profit margin analytics

---

Built with ❤️ using React, Vite, and Supabase
