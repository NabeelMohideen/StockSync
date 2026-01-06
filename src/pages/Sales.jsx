import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, ReceiptText, Search, CreditCard, Banknote, Building2, Wallet } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import AccessControl from "@/components/AccessControl";

const paymentIcons = {
  cash: Banknote,
  card: CreditCard,
  bank_transfer: Building2,
  financing: Wallet
};

export default function Sales() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterShop, setFilterShop] = useState("all");
  const [formData, setFormData] = useState({
    shop_id: "", product_id: "", quantity: "1", customer_name: "", customer_phone: "", 
    payment_method: "cash", sale_date: new Date().toISOString().split('T')[0], notes: ""
  });

  const queryClient = useQueryClient();

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list('-sale_date', 200)
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const { data: shops = [] } = useQuery({
    queryKey: ['shops'],
    queryFn: () => base44.entities.Shop.list()
  });

  const { data: shopInventory = [] } = useQuery({
    queryKey: ['shopInventory'],
    queryFn: () => base44.entities.ShopInventory.list()
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const product = products.find(p => p.id === data.product_id);
      const saleData = {
        ...data,
        unit_price: product?.price || 0,
        total_amount: (product?.price || 0) * data.quantity
      };
      
      // Create sale
      await base44.entities.Sale.create(saleData);
      
      // Update shop inventory
      const inventory = shopInventory.find(
        i => i.shop_id === data.shop_id && i.product_id === data.product_id
      );
      if (inventory) {
        await base44.entities.ShopInventory.update(inventory.id, {
          quantity: Math.max(0, (inventory.quantity || 0) - data.quantity)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['shopInventory'] });
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({
      shop_id: "", product_id: "", quantity: "1", customer_name: "", customer_phone: "",
      payment_method: "cash", sale_date: new Date().toISOString().split('T')[0], notes: ""
    });
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      quantity: parseInt(formData.quantity) || 1
    });
  };

  const getProductName = (id) => products.find(p => p.id === id)?.name || 'Unknown';
  const getShopName = (id) => shops.find(s => s.id === id)?.name || 'Unknown';
  
  const getAvailableProducts = (shopId) => {
    if (!shopId) return [];
    return shopInventory
      .filter(i => i.shop_id === shopId && (i.quantity || 0) > 0)
      .map(i => ({
        ...products.find(p => p.id === i.product_id),
        available: i.quantity
      }))
      .filter(p => p.id);
  };

  const filteredSales = sales.filter(s => {
    const matchesSearch = 
      s.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getProductName(s.product_id).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesShop = filterShop === "all" || s.shop_id === filterShop;
    return matchesSearch && matchesShop;
  });

  return (
    <AccessControl allowedLevels={['super_admin', 'administrator']}>
      <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Sales</h1>
            <p className="text-slate-500 mt-1">Track all your shop sales</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsOpen(open); }}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800">
                <Plus className="w-4 h-4 mr-2" /> Record Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Record New Sale</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Shop *</Label>
                    <Select value={formData.shop_id} onValueChange={(v) => setFormData({...formData, shop_id: v, product_id: ""})}>
                      <SelectTrigger><SelectValue placeholder="Select shop" /></SelectTrigger>
                      <SelectContent>
                        {shops.filter(s => s.is_active !== false).map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Product *</Label>
                    <Select value={formData.product_id} onValueChange={(v) => setFormData({...formData, product_id: v})} disabled={!formData.shop_id}>
                      <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                      <SelectContent>
                        {getAvailableProducts(formData.shop_id).map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.available} available)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Sale Date</Label>
                    <Input type="date" value={formData.sale_date} onChange={(e) => setFormData({...formData, sale_date: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Customer Name</Label>
                    <Input value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Customer Phone</Label>
                    <Input value={formData.customer_phone} onChange={(e) => setFormData({...formData, customer_phone: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={formData.payment_method} onValueChange={(v) => setFormData({...formData, payment_method: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="financing">Financing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                </div>
                
                {formData.product_id && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm text-slate-600">Total Amount</p>
                    <p className="text-2xl font-semibold text-slate-900">
                      LKR {((products.find(p => p.id === formData.product_id)?.price || 0) * (parseInt(formData.quantity) || 1)).toLocaleString()}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button type="submit" className="bg-slate-900 hover:bg-slate-800">Record Sale</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search by customer or product..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterShop} onValueChange={setFilterShop}>
              <SelectTrigger className="w-48"><SelectValue placeholder="All Shops" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shops</SelectItem>
                {shops.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="font-medium">Date</TableHead>
                <TableHead className="font-medium">Product</TableHead>
                <TableHead className="font-medium">Shop</TableHead>
                <TableHead className="font-medium">Customer</TableHead>
                <TableHead className="font-medium">Payment</TableHead>
                <TableHead className="font-medium">Qty</TableHead>
                <TableHead className="font-medium text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-500">Loading...</TableCell></TableRow>
              ) : filteredSales.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-500">No sales found</TableCell></TableRow>
              ) : (
                filteredSales.map((sale) => {
                  const PaymentIcon = paymentIcons[sale.payment_method] || Banknote;
                  return (
                    <TableRow key={sale.id} className="hover:bg-slate-50/50">
                      <TableCell className="text-slate-600">
                        {sale.sale_date ? format(new Date(sale.sale_date), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">{getProductName(sale.product_id)}</TableCell>
                      <TableCell className="text-slate-600">{getShopName(sale.shop_id)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-slate-900">{sale.customer_name || '-'}</p>
                          {sale.customer_phone && <p className="text-xs text-slate-500">{sale.customer_phone}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-slate-600">
                          <PaymentIcon className="w-4 h-4" />
                          <span className="text-sm capitalize">{sale.payment_method?.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{sale.quantity}</TableCell>
                      <TableCell className="text-right font-semibold text-slate-900">
                        LKR {sale.total_amount?.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
    </AccessControl>
  );
}