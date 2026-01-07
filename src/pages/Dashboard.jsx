import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Package, Store, DollarSign, TrendingUp, Warehouse, AlertTriangle } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import StockAlertCard from "@/components/dashboard/StockAlertCard";
import RecentSalesTable from "@/components/dashboard/RecentSalesTable";
import ShopPerformance from "@/components/dashboard/ShopPerformance";
import AccessControl from "@/components/AccessControl";

export default function Dashboard() {
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const { data: shops = [] } = useQuery({
    queryKey: ['shops'],
    queryFn: () => base44.entities.Shop.list()
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list('-sale_date', 100)
  });

  const { data: shopInventory = [] } = useQuery({
    queryKey: ['shopInventory'],
    queryFn: () => base44.entities.ShopInventory.list()
  });

  // Calculate stats
  const totalStorageStock = products.reduce((sum, p) => sum + (p.storage_quantity || 0), 0);
  const totalShopStock = shopInventory.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const totalSalesAmount = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const totalUnitsSold = sales.reduce((sum, s) => sum + (s.quantity || 0), 0);

  // Storage stock alerts
  const storageAlerts = products
    .filter(p => (p.storage_quantity || 0) <= (p.min_stock_level || 5))
    .map(p => ({
      productName: p.name,
      quantity: p.storage_quantity || 0,
      minLevel: p.min_stock_level || 5
    }));

  // Shop stock alerts
  const shopAlerts = shopInventory
    .filter(i => (i.quantity || 0) <= (i.min_stock_level || 2))
    .map(i => {
      const product = products.find(p => p.id === i.product_id);
      const shop = shops.find(s => s.id === i.shop_id);
      return {
        productName: product?.name || 'Unknown',
        shopName: shop?.name || 'Unknown Shop',
        quantity: i.quantity || 0,
        minLevel: i.min_stock_level || 2
      };
    });

  return (
    <AccessControl allowedLevels={['super_admin', 'administrator']}>
      <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your inventory and sales</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Storage Stock" 
            value={totalStorageStock}
            subtitle={`${products.length} products`}
            icon={Warehouse}
            alert={storageAlerts.length > 0 ? `${storageAlerts.length} low stock items` : null}
          />
          <StatCard 
            title="Shop Stock" 
            value={totalShopStock}
            subtitle={`Across ${shops.length} shops`}
            icon={Store}
            alert={shopAlerts.length > 0 ? `${shopAlerts.length} low stock alerts` : null}
          />
          <StatCard 
            title="Total Revenue" 
            value={`LKR ${totalSalesAmount.toLocaleString()}`}
            subtitle={`${sales.length} orders`}
            icon={DollarSign}
          />
          <StatCard 
            title="Units Sold" 
            value={totalUnitsSold}
            subtitle="Total TVs sold"
            icon={TrendingUp}
          />
        </div>

        {/* Alerts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <StockAlertCard alerts={storageAlerts} type="storage" />
          <StockAlertCard alerts={shopAlerts} type="shop" />
        </div>

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