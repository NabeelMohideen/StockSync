import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Warehouse, Store, Package, AlertTriangle, Pencil, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("storage");
  const [selectedShop, setSelectedShop] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");

  const queryClient = useQueryClient();

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

  const updateStorageMutation = useMutation({
    mutationFn: ({ id, quantity }) => base44.entities.Product.update(id, { storage_quantity: quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingItem(null);
    }
  });

  const updateShopInventoryMutation = useMutation({
    mutationFn: ({ id, quantity }) => base44.entities.ShopInventory.update(id, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopInventory'] });
      setEditingItem(null);
    }
  });

  const handleEdit = (item, type) => {
    setEditingItem({ ...item, type });
    setEditQuantity(type === "storage" ? item.storage_quantity?.toString() || "0" : item.quantity?.toString() || "0");
  };

  const handleSaveEdit = () => {
    const quantity = parseInt(editQuantity) || 0;
    if (editingItem.type === "storage") {
      updateStorageMutation.mutate({ id: editingItem.id, quantity });
    } else {
      updateShopInventoryMutation.mutate({ id: editingItem.id, quantity });
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getShopInventoryData = () => {
    return shopInventory
      .filter(i => selectedShop === "all" || i.shop_id === selectedShop)
      .map(i => {
        const product = products.find(p => p.id === i.product_id);
        const shop = shops.find(s => s.id === i.shop_id);
        return {
          ...i,
          productName: product?.name || 'Unknown',
          productBrand: product?.brand || '',
          shopName: shop?.name || 'Unknown',
          isLowStock: (i.quantity || 0) <= (i.min_stock_level || 2)
        };
      })
      .filter(i => 
        i.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.productBrand.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  const getTotalStorageStock = () => products.reduce((sum, p) => sum + (p.storage_quantity || 0), 0);
  const getTotalShopStock = () => shopInventory.reduce((sum, i) => sum + (i.quantity || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Inventory</h1>
          <p className="text-slate-500 mt-1">View and manage stock levels</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-100">
                <Warehouse className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Storage Stock</p>
                <p className="text-2xl font-semibold text-slate-900">{getTotalStorageStock()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-100">
                <Store className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Shop Stock</p>
                <p className="text-2xl font-semibold text-slate-900">{getTotalShopStock()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-100">
                <Package className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Stock</p>
                <p className="text-2xl font-semibold text-slate-900">{getTotalStorageStock() + getTotalShopStock()}</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList className="bg-white border border-slate-200">
              <TabsTrigger value="storage" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                <Warehouse className="w-4 h-4 mr-2" /> Storage
              </TabsTrigger>
              <TabsTrigger value="shops" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                <Store className="w-4 h-4 mr-2" /> Shops
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-4">
              {activeTab === "shops" && (
                <Select value={selectedShop} onValueChange={setSelectedShop}>
                  <SelectTrigger className="w-48 bg-white"><SelectValue placeholder="All Shops" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Shops</SelectItem>
                    {shops.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white w-64"
                />
              </div>
            </div>
          </div>

          <TabsContent value="storage">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-medium">Product</TableHead>
                    <TableHead className="font-medium">SKU</TableHead>
                    <TableHead className="font-medium">Size</TableHead>
                    <TableHead className="font-medium">Quantity</TableHead>
                    <TableHead className="font-medium">Min Level</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-500">No products found</TableCell></TableRow>
                  ) : (
                    filteredProducts.map((product) => {
                      const isLowStock = (product.storage_quantity || 0) <= (product.min_stock_level || 5);
                      return (
                        <TableRow key={product.id} className="hover:bg-slate-50/50">
                          <TableCell>
                            <div>
                              <p className="font-medium text-slate-900">{product.name}</p>
                              <p className="text-sm text-slate-500">{product.brand}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600">{product.sku}</TableCell>
                          <TableCell className="text-slate-600">{product.size || '-'}</TableCell>
                          <TableCell className="font-semibold text-slate-900">{product.storage_quantity || 0}</TableCell>
                          <TableCell className="text-slate-600">{product.min_stock_level || 5}</TableCell>
                          <TableCell>
                            {isLowStock ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                                <AlertTriangle className="w-3 h-3" /> Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                                In Stock
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(product, "storage")}>
                              <Pencil className="w-4 h-4 text-slate-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="shops">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-medium">Product</TableHead>
                    <TableHead className="font-medium">Shop</TableHead>
                    <TableHead className="font-medium">Quantity</TableHead>
                    <TableHead className="font-medium">Min Level</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getShopInventoryData().length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No inventory found</TableCell></TableRow>
                  ) : (
                    getShopInventoryData().map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">{item.productName}</p>
                            <p className="text-sm text-slate-500">{item.productBrand}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">{item.shopName}</TableCell>
                        <TableCell className="font-semibold text-slate-900">{item.quantity || 0}</TableCell>
                        <TableCell className="text-slate-600">{item.min_stock_level || 2}</TableCell>
                        <TableCell>
                          {item.isLowStock ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                              <AlertTriangle className="w-3 h-3" /> Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                              In Stock
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item, "shop")}>
                            <Pencil className="w-4 h-4 text-slate-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Update Quantity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input 
                  type="number" 
                  min="0" 
                  value={editQuantity} 
                  onChange={(e) => setEditQuantity(e.target.value)} 
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
                <Button onClick={handleSaveEdit} className="bg-slate-900 hover:bg-slate-800">Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}