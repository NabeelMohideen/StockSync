import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Store, MapPin, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";
import AccessControl from "@/components/AccessControl";

export default function Shops() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [formData, setFormData] = useState({
    name: "", location: "", manager: "", phone: "", is_active: true
  });

  const queryClient = useQueryClient();

  const { data: shops = [], isLoading } = useQuery({
    queryKey: ['shops'],
    queryFn: () => base44.entities.Shop.list()
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list()
  });

  const { data: shopInventory = [] } = useQuery({
    queryKey: ['shopInventory'],
    queryFn: () => base44.entities.ShopInventory.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Shop.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Shop.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Shop.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shops'] })
  });

  const resetForm = () => {
    setFormData({ name: "", location: "", manager: "", phone: "", is_active: true });
    setEditingShop(null);
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingShop) {
      updateMutation.mutate({ id: editingShop.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (shop) => {
    setFormData({
      name: shop.name || "",
      location: shop.location || "",
      manager: shop.manager || "",
      phone: shop.phone || "",
      is_active: shop.is_active !== false
    });
    setEditingShop(shop);
    setIsOpen(true);
  };

  const getShopStats = (shopId) => {
    const shopSales = sales.filter(s => s.shop_id === shopId);
    const totalSales = shopSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    const inventory = shopInventory.filter(i => i.shop_id === shopId);
    const totalStock = inventory.reduce((sum, i) => sum + (i.quantity || 0), 0);
    return { totalSales, salesCount: shopSales.length, totalStock };
  };

  return (
    <AccessControl allowedLevels={['super_admin', 'administrator']}>
      <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Shops</h1>
            <p className="text-slate-500 mt-1">Manage your retail locations</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsOpen(open); }}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800">
                <Plus className="w-4 h-4 mr-2" /> Add Shop
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingShop ? 'Edit Shop' : 'Add New Shop'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Shop Name *</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Manager</Label>
                  <Input value={formData.manager} onChange={(e) => setFormData({...formData, manager: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="flex items-center justify-between py-2">
                  <Label>Active</Label>
                  <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({...formData, is_active: checked})} />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button type="submit" className="bg-slate-900 hover:bg-slate-800">
                    {editingShop ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Shops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <p className="text-slate-500 col-span-full text-center py-8">Loading...</p>
          ) : shops.length === 0 ? (
            <p className="text-slate-500 col-span-full text-center py-8">No shops added yet</p>
          ) : (
            shops.map((shop) => {
              const stats = getShopStats(shop.id);
              return (
                <Card key={shop.id} className={cn(
                  "border-slate-100 hover:shadow-md transition-shadow",
                  !shop.is_active && "opacity-60"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-slate-100">
                          <Store className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{shop.name}</h3>
                          <span className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            shop.is_active !== false ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                          )}>
                            {shop.is_active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(shop)}>
                          <Pencil className="w-4 h-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(shop.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {shop.location}
                      </div>
                      {shop.manager && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <User className="w-4 h-4 text-slate-400" />
                          {shop.manager}
                        </div>
                      )}
                      {shop.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400" />
                          {shop.phone}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-slate-900">{stats.totalStock}</p>
                        <p className="text-xs text-slate-500">Stock</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-slate-900">{stats.salesCount}</p>
                        <p className="text-xs text-slate-500">Sales</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-slate-900">${(stats.totalSales / 1000).toFixed(1)}k</p>
                        <p className="text-xs text-slate-500">Revenue</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
    </AccessControl>
  );
}