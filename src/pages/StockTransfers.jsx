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
import { Plus, ArrowRight, Warehouse, Store, CheckCircle2, Clock, Truck, XCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: { label: "Pending", icon: Clock, color: "bg-amber-100 text-amber-700" },
  in_transit: { label: "In Transit", icon: Truck, color: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-slate-100 text-slate-600" }
};

export default function StockTransfers() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_id: "", to_location: "", quantity: "", transfer_date: new Date().toISOString().split('T')[0], notes: ""
  });

  const queryClient = useQueryClient();

  const { data: transfers = [], isLoading } = useQuery({
    queryKey: ['transfers'],
    queryFn: () => base44.entities.StockTransfer.list('-created_date', 100)
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
      // Create transfer
      await base44.entities.StockTransfer.create({
        ...data,
        from_location: "storage",
        status: "pending"
      });
      
      // Update storage quantity
      const product = products.find(p => p.id === data.product_id);
      if (product) {
        await base44.entities.Product.update(product.id, {
          storage_quantity: (product.storage_quantity || 0) - data.quantity
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ transfer, newStatus }) => {
      await base44.entities.StockTransfer.update(transfer.id, { status: newStatus });
      
      // If completed, update shop inventory
      if (newStatus === "completed") {
        const existingInventory = shopInventory.find(
          i => i.shop_id === transfer.to_location && i.product_id === transfer.product_id
        );
        
        if (existingInventory) {
          await base44.entities.ShopInventory.update(existingInventory.id, {
            quantity: (existingInventory.quantity || 0) + transfer.quantity
          });
        } else {
          await base44.entities.ShopInventory.create({
            shop_id: transfer.to_location,
            product_id: transfer.product_id,
            quantity: transfer.quantity
          });
        }
      }
      
      // If cancelled, return to storage
      if (newStatus === "cancelled" && transfer.status !== "completed") {
        const product = products.find(p => p.id === transfer.product_id);
        if (product) {
          await base44.entities.Product.update(product.id, {
            storage_quantity: (product.storage_quantity || 0) + transfer.quantity
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['shopInventory'] });
    }
  });

  const resetForm = () => {
    setFormData({ product_id: "", to_location: "", quantity: "", transfer_date: new Date().toISOString().split('T')[0], notes: "" });
    setIsOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      quantity: parseInt(formData.quantity) || 0
    });
  };

  const getProductName = (id) => products.find(p => p.id === id)?.name || 'Unknown';
  const getShopName = (id) => shops.find(s => s.id === id)?.name || 'Storage';
  const getAvailableStock = (productId) => products.find(p => p.id === productId)?.storage_quantity || 0;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Stock Transfers</h1>
            <p className="text-slate-500 mt-1">Move inventory from storage to shops</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsOpen(open); }}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800">
                <Plus className="w-4 h-4 mr-2" /> New Transfer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Stock Transfer</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Product *</Label>
                  <Select value={formData.product_id} onValueChange={(v) => setFormData({...formData, product_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.storage_quantity || 0} in stock)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Destination Shop *</Label>
                  <Select value={formData.to_location} onValueChange={(v) => setFormData({...formData, to_location: v})}>
                    <SelectTrigger><SelectValue placeholder="Select shop" /></SelectTrigger>
                    <SelectContent>
                      {shops.filter(s => s.is_active !== false).map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      max={getAvailableStock(formData.product_id)}
                      value={formData.quantity} 
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Transfer Date</Label>
                    <Input type="date" value={formData.transfer_date} onChange={(e) => setFormData({...formData, transfer_date: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                  <Button type="submit" className="bg-slate-900 hover:bg-slate-800">Create Transfer</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Transfers Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="font-medium">Date</TableHead>
                <TableHead className="font-medium">Product</TableHead>
                <TableHead className="font-medium">Route</TableHead>
                <TableHead className="font-medium">Quantity</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">Loading...</TableCell></TableRow>
              ) : transfers.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No transfers yet</TableCell></TableRow>
              ) : (
                transfers.map((transfer) => {
                  const config = statusConfig[transfer.status] || statusConfig.pending;
                  const StatusIcon = config.icon;
                  return (
                    <TableRow key={transfer.id} className="hover:bg-slate-50/50">
                      <TableCell className="text-slate-600">
                        {transfer.transfer_date ? format(new Date(transfer.transfer_date), 'MMM d, yyyy') : '-'}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">{getProductName(transfer.product_id)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex items-center gap-1 text-slate-600">
                            <Warehouse className="w-4 h-4" />
                            <span>Storage</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                          <div className="flex items-center gap-1 text-slate-600">
                            <Store className="w-4 h-4" />
                            <span>{getShopName(transfer.to_location)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">{transfer.quantity}</TableCell>
                      <TableCell>
                        <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full", config.color)}>
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {transfer.status === "pending" && (
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateStatusMutation.mutate({ transfer, newStatus: "in_transit" })}
                            >
                              Ship
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="text-red-600"
                              onClick={() => updateStatusMutation.mutate({ transfer, newStatus: "cancelled" })}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                        {transfer.status === "in_transit" && (
                          <Button 
                            size="sm" 
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => updateStatusMutation.mutate({ transfer, newStatus: "completed" })}
                          >
                            Mark Delivered
                          </Button>
                        )}
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
  );
}