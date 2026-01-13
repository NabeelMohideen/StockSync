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

This will output your local credentials. Create a `.env` file:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your-anon-key-from-supabase-start
VITE_DISABLE_ROLE_GUARD=true
```

### 4. Run Database Migrations

```bash
npx supabase db reset
```

This creates all tables and seeds initial data including:
- Admin user: `admin@stocksync.com` / `admin123`
- 3 sample shops
- 10 sample products
- Sample inventory, sales, and transactions

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:8000`

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

## Development

For detailed development guides, security setup, and pre-deployment checklists, see [DEVELOPMENT.md](DEVELOPMENT.md).

### Authentication & Authorization

The app implements complete authentication with role-based access control:

- **Login Required**: Users must login to access the app
- **4 User Roles**: Super Admin, Administrator, Sales Person, Report Viewer
- **Role-Based Navigation**: Menu items filtered by user role
- **Session Management**: Secure session handling with Supabase Auth
- **Test Users**: Demo accounts included for testing

**For complete authentication guide and role details, see [AUTHENTICATION.md](AUTHENTICATION.md)**

Test users available:
- `superadmin@example.com` (super_admin) - Full access
- `manager@example.com` (administrator) - Admin access
- `salesperson@example.com` (sales_person) - POS only
- `viewer@example.com` (report_viewer) - Reports only

Password: `admin123` for all test accounts

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
├── pages/           # Page components
└── utils/           # Helper functions

supabase/
├── migrations/      # Database migrations
└── seed.sql        # Sample data
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npx supabase db reset` - Reset database and reseed
- `npx supabase migration new <name>` - Create new migration

### Adding New Features

1. Create database migration if needed: `npx supabase migration new feature_name`
2. Update `src/api/supabaseClient.js` with new CRUD helpers
3. Create page component in `src/pages/`
4. Add route in `src/App.jsx`
5. Update navigation in `src/Layout.jsx`

## Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Development
VITE_DISABLE_ROLE_GUARD=true  # Bypass auth in development
```

## Deployment

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
2. Run migrations: `npx supabase db push`
3. Update environment variables with production credentials
4. Set up Row Level Security (RLS) policies as needed

## Troubleshooting

### Port 8000 already in use

Change port in `vite.config.js`:

```js
server: {
  port: 3000, // or any available port
}
```

### Database connection issues

Ensure Supabase is running:

```bash
npx supabase status
```

Restart if needed:

```bash
npx supabase stop
npx supabase start
```

### TypeScript errors

These are JSConfig type-checking warnings and don't affect runtime. To disable:

1. Rename `jsconfig.json` to `jsconfig.json.bak`, or
2. Install TypeScript and convert project

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
