import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useState } from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import AccessControl from "@/components/AccessControl";

export default function Reports() {
  const [dateRange, setDateRange] = useState("30"); // days

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list('-sale_date', 1000)
  });

  const { data: shops = [] } = useQuery({
    queryKey: ['shops'],
    queryFn: () => base44.entities.Shop.list()
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  // Filter sales by date range
  const getFilteredSales = () => {
    if (dateRange === "all") return sales;
    
    const daysAgo = parseInt(dateRange);
    const cutoffDate = subDays(new Date(), daysAgo);
    
    return sales.filter(sale => {
      if (!sale.sale_date) return false;
      const saleDate = new Date(sale.sale_date);
      return saleDate >= cutoffDate;
    });
  };

  const filteredSales = getFilteredSales();

  // Calculate metrics
  const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const totalUnits = filteredSales.reduce((sum, s) => sum + (s.quantity || 0), 0);
  const averageOrderValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

  // Calculate profit
  const totalCost = filteredSales.reduce((sum, sale) => {
    const product = products.find(p => p.id === sale.product_id);
    return sum + ((product?.cost || 0) * (sale.quantity || 0));
  }, 0);
  const totalProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Top performing shops
  const shopPerformance = shops.map(shop => {
    const shopSales = filteredSales.filter(s => s.shop_id === shop.id);
    const revenue = shopSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    return {
      name: shop.name,
      revenue,
      salesCount: shopSales.length,
      units: shopSales.reduce((sum, s) => sum + (s.quantity || 0), 0)
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Top selling products
  const productPerformance = products.map(product => {
    const productSales = filteredSales.filter(s => s.product_id === product.id);
    const revenue = productSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    const units = productSales.reduce((sum, s) => sum + (s.quantity || 0), 0);
    return {
      name: product.name,
      brand: product.brand,
      revenue,
      units
    };
  }).filter(p => p.units > 0).sort((a, b) => b.revenue - a.revenue);

  // Payment method breakdown
  const paymentBreakdown = filteredSales.reduce((acc, sale) => {
    const method = sale.payment_method || 'cash';
    acc[method] = (acc[method] || 0) + (sale.total_amount || 0);
    return acc;
  }, {});

  return (
    <AccessControl allowedLevels={['super_admin', 'administrator', 'report_viewer']}>
      <div className="min-h-screen bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Reports</h1>
              <p className="text-slate-500 mt-1">Sales analytics and performance metrics</p>
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-slate-500 mt-1">{filteredSales.length} transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Profit</CardTitle>
                  <div className="p-2 rounded-lg bg-blue-100">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">${totalProfit.toLocaleString()}</p>
                <p className="text-sm text-emerald-600 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" />
                  {profitMargin.toFixed(1)}% margin
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Units Sold</CardTitle>
                  <div className="p-2 rounded-lg bg-purple-100">
                    <ShoppingCart className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">{totalUnits}</p>
                <p className="text-sm text-slate-500 mt-1">TVs sold</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Avg Order Value</CardTitle>
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Calendar className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">${averageOrderValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                <p className="text-sm text-slate-500 mt-1">per transaction</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Shop Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Shop Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shopPerformance.slice(0, 5).map((shop, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium text-slate-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{shop.name}</p>
                          <p className="text-sm text-slate-500">{shop.salesCount} sales • {shop.units} units</p>
                        </div>
                      </div>
                      <p className="font-semibold text-slate-900">${shop.revenue.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(paymentBreakdown).map(([method, amount]) => {
                    const percentage = (amount / totalRevenue) * 100;
                    return (
                      <div key={method} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900 capitalize">
                            {method.replace('_', ' ')}
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            ${amount.toLocaleString()}
                          </p>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-slate-900 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500">{percentage.toFixed(1)}% of total</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {productPerformance.slice(0, 10).map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-medium text-slate-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{product.name}</p>
                        <p className="text-sm text-slate-500">{product.brand}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">${product.revenue.toLocaleString()}</p>
                      <p className="text-sm text-slate-500">{product.units} units sold</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AccessControl>
  );
}