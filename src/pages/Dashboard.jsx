import { useQuery } from "@tanstack/react-query";
import { db, supabase } from "@/api/supabaseClient";
import { Package, Store, DollarSign, TrendingUp, Warehouse, AlertTriangle } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import StockAlertCard from "@/components/dashboard/StockAlertCard";
import RecentSalesTable from "@/components/dashboard/RecentSalesTable";
import ShopPerformance from "@/components/dashboard/ShopPerformance";
import AccessControl from "@/components/AccessControl";

export default function Dashboard() {
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await db.products.list();
      if (error) throw error;
      return data || [];
    }
  });

  const { data: shops = [] } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const { data, error } = await db.shops.list();
      if (error) throw error;
      return data || [];
    }
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data, error } = await db.sales.list(100);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: shopInventory = [] } = useQuery({
    queryKey: ['shopInventory'],
    queryFn: async () => {
      const { data, error } = await supabase.from('inventory').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate stats
  const totalProducts = products.length;
  const totalShopStock = shopInventory.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const totalSalesAmount = sales.reduce((sum, s) => sum + (parseFloat(s.final_amount) || 0), 0);
  const recentSalesCount = sales.length;

  // Shop stock alerts (low inventory)
  const shopAlerts = shopInventory
    .filter(i => (i.quantity || 0) <= 5) // Alert when quantity is 5 or less
    .map(i => {
      const product = products.find(p => p.id === i.product_id);
      const shop = shops.find(s => s.id === i.shop_id);
      return {
        productName: product?.name || 'Unknown',
        shopName: shop?.name || 'Unknown Shop',
        quantity: i.quantity || 0,
        minLevel: 5
      };
    });

  return (
    <AccessControl allowedLevels={['super_admin', 'administrator']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Dashboard</h1>
          <p className="text-slate-600 text-lg">Welcome back! Here's what's happening with your inventory</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            title="Total Products" 
            value={totalProducts}
            subtitle={`${totalProducts} products`}
            icon={Package}
            className="hover:scale-[1.02] transition-transform"
          />
          <StatCard 
            title="Shop Stock" 
            value={totalShopStock}
            subtitle={`Across ${shops.length} shops`}
            icon={Store}
            alert={shopAlerts.length > 0 ? `${shopAlerts.length} low stock alerts` : null}
            className="hover:scale-[1.02] transition-transform"
          />
          <StatCard 
            title="Total Revenue" 
            value={`LKR ${totalSalesAmount.toLocaleString()}`}
            subtitle={`${recentSalesCount} orders`}
            icon={DollarSign}
            className="hover:scale-[1.02] transition-transform"
          />
          <StatCard 
            title="Recent Sales" 
            value={recentSalesCount}
            subtitle="Total TVs sold"
            icon={TrendingUp}
            className="hover:scale-[1.02] transition-transform"
          />
        </div>

        {/* Alerts Section */}
        {shopAlerts.length > 0 && (
          <div className="grid grid-cols-1 gap-6 mb-10">
            <StockAlertCard alerts={shopAlerts} type="shop" />
          </div>
        )}

        {/* Performance & Recent Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentSalesTable sales={sales} shops={shops} products={products} />
          </div>
          <div>
            <ShopPerformance shops={shops} sales={sales} />
          </div>
        </div>
      </div>
    </div>
    </AccessControl>
  );
}