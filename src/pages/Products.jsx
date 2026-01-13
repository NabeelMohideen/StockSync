import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Package, Search, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import AccessControl from "@/components/AccessControl";

export default function Products() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "", brand: "", model: "", category: "", sku: "", barcode: "", unit_price: "", cost_price: "", has_serial_numbers: false, description: ""
  });

  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await db.products.list();
      if (error) throw error;
      return data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (productData) => {
      const { data, error } = await db.products.create(productData);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: productData }) => {
      const { data, error } = await db.products.update(id, productData);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await db.products.delete(id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const resetForm = () => {
    setFormData({ name: "", brand: "", model: "", category: "", sku: "", barcode: "", unit_price: "", cost_price: "", has_serial_numbers: false, description: "" });
    setEditingProduct(null);
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      unit_price: parseFloat(formData.unit_price) || 0,
      cost_price: parseFloat(formData.cost_price) || 0,
      has_serial_numbers: formData.has_serial_numbers || false
    };
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name || "",
      brand: product.brand || "",
      sku: product.sku || "",
      size: product.size || "",
      price: product.price?.toString() || "",
      cost: product.cost?.toString() || "",
      storage_quantity: product.storage_quantity?.toString() || "",
      min_stock_level: product.min_stock_level?.toString() || "5",
      image_url: product.image_url || ""
    });
    setEditingProduct(product);
    setIsOpen(true);
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AccessControl allowedLevels={['super_admin', 'administrator']}>
      <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Products</h1>
            <p className="text-slate-500 mt-1">Manage your TV inventory</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsOpen(open); }}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800">
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Brand *</Label>
                    <Input value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Input value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder='e.g. TVs' />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SKU *</Label>
                    <Input value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Barcode</Label>
                    <Input value={formData.barcode} onChange={(e) => setFormData({...formData, barcode: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Unit Price *</Label>
                    <Input type="number" step="0.01" value={formData.unit_price} onChange={(e) => setFormData({...formData, unit_price: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Cost Price</Label>
                    <Input type="number" step="0.01" value={formData.cost_price} onChange={(e) => setFormData({...formData, cost_price: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Product description" />
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="serial" 
                    checked={formData.has_serial_numbers} 
                    onChange={(e) => setFormData({...formData, has_serial_numbers: e.target.checked})}
                    className="rounded border-slate-300"
                  />
                  <Label htmlFor="serial" className="cursor-pointer">Has Serial Numbers</Label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button type="submit" className="bg-slate-900 hover:bg-slate-800">
                    {editingProduct ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="font-medium">Product</TableHead>
                <TableHead className="font-medium">SKU</TableHead>
                <TableHead className="font-medium">Category</TableHead>
                <TableHead className="font-medium">Unit Price</TableHead>
                <TableHead className="font-medium">Serial#</TableHead>
                <TableHead className="font-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">Loading...</TableCell></TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No products found</TableCell></TableRow>
              ) : (
                filteredProducts.map((product) => {
                  return (
                    <TableRow key={product.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Package className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{product.name}</p>
                            <p className="text-sm text-slate-500">{product.brand} {product.model}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{product.sku}</TableCell>
                      <TableCell className="text-slate-600">{product.category || '-'}</TableCell>
                      <TableCell className="font-medium text-slate-900">LKR {product.unit_price?.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={cn("text-sm", product.has_serial_numbers ? "text-green-600" : "text-slate-400")}>
                          {product.has_serial_numbers ? 'Yes' : 'No'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                            <Pencil className="w-4 h-4 text-slate-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(product.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
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