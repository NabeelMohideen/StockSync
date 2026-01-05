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
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Shield, CheckCircle2, XCircle, AlertCircle, Pencil } from "lucide-react";
import { format, addMonths, isPast, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import AccessControl from "@/components/AccessControl";

export default function Warranties() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingWarranty, setEditingWarranty] = useState(null);
  const [formData, setFormData] = useState({
    sale_id: "", product_id: "", customer_name: "", customer_phone: "",
    warranty_period_months: "12", purchase_date: new Date().toISOString().split('T')[0],
    serial_number: "", notes: ""
  });

  const queryClient = useQueryClient();

  const { data: warranties = [], isLoading } = useQuery({
    queryKey: ['warranties'],
    queryFn: () => base44.entities.Warranty.list('-created_date', 1000)
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list()
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list('-sale_date', 1000)
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      const purchaseDate = new Date(data.purchase_date);
      const expiryDate = addMonths(purchaseDate, parseInt(data.warranty_period_months));
      const isExpired = isPast(expiryDate);
      
      return base44.entities.Warranty.create({
        ...data,
        warranty_expiry_date: expiryDate.toISOString().split('T')[0],
        status: isExpired ? 'expired' : 'active',
        warranty_period_months: parseInt(data.warranty_period_months)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranties'] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      const purchaseDate = new Date(data.purchase_date);
      const expiryDate = addMonths(purchaseDate, parseInt(data.warranty_period_months));
      const isExpired = isPast(expiryDate);
      
      return base44.entities.Warranty.update(id, {
        ...data,
        warranty_expiry_date: expiryDate.toISOString().split('T')[0],
        status: isExpired ? 'expired' : (data.status === 'claimed' ? 'claimed' : 'active'),
        warranty_period_months: parseInt(data.warranty_period_months)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranties'] });
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({
      sale_id: "", product_id: "", customer_name: "", customer_phone: "",
      warranty_period_months: "12", purchase_date: new Date().toISOString().split('T')[0],
      serial_number: "", notes: ""
    });
    setEditingWarranty(null);
    setIsOpen(false);
  };

  const handleEdit = (warranty) => {
    setEditingWarranty(warranty);
    setFormData({
      sale_id: warranty.sale_id || "",
      product_id: warranty.product_id || "",
      customer_name: warranty.customer_name || "",
      customer_phone: warranty.customer_phone || "",
      warranty_period_months: String(warranty.warranty_period_months || 12),
      purchase_date: warranty.purchase_date || new Date().toISOString().split('T')[0],
      serial_number: warranty.serial_number || "",
      notes: warranty.notes || ""
    });
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingWarranty) {
      updateMutation.mutate({ id: editingWarranty.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getProductName = (id) => products.find(p => p.id === id)?.name || 'Unknown';

  const getWarrantyStatus = (warranty) => {
    if (warranty.status === 'claimed') return { label: 'Claimed', icon: AlertCircle, color: 'bg-red-100 text-red-700' };
    if (warranty.warranty_expiry_date && isPast(parseISO(warranty.warranty_expiry_date))) {
      return { label: 'Expired', icon: XCircle, color: 'bg-slate-100 text-slate-600' };
    }
    return { label: 'Active', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700' };
  };

  const filteredWarranties = warranties.filter(w =>
    w.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.customer_phone?.includes(searchQuery) ||
    w.serial_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getProductName(w.product_id)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AccessControl allowedLevels={['super_admin', 'administrator']}>
      <div className="min-h-screen bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Warranties</h1>
              <p className="text-slate-500 mt-1">Manage TV warranties and service records</p>
            </div>
            <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsOpen(open); }}>
              <DialogTrigger asChild>
                <Button className="bg-slate-900 hover:bg-slate-800">
                  <Plus className="w-4 h-4 mr-2" /> Add Warranty
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingWarranty ? "Edit Warranty" : "Add New Warranty"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Sale Reference (Optional)</Label>
                    <Select value={formData.sale_id} onValueChange={(v) => setFormData({...formData, sale_id: v})}>
                      <SelectTrigger><SelectValue placeholder="Select sale" /></SelectTrigger>
                      <SelectContent>
                        {sales.slice(0, 100).map(s => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.customer_name} - {s.sale_date ? format(new Date(s.sale_date), 'MMM d, yyyy') : 'N/A'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Product *</Label>
                    <Select value={formData.product_id} onValueChange={(v) => setFormData({...formData, product_id: v})} required>
                      <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                      <SelectContent>
                        {products.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Customer Name *</Label>
                      <Input 
                        value={formData.customer_name} 
                        onChange={(e) => setFormData({...formData, customer_name: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Customer Phone</Label>
                      <Input 
                        type="tel"
                        value={formData.customer_phone} 
                        onChange={(e) => setFormData({...formData, customer_phone: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Purchase Date *</Label>
                      <Input 
                        type="date"
                        value={formData.purchase_date} 
                        onChange={(e) => setFormData({...formData, purchase_date: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Warranty Period (Months) *</Label>
                      <Input 
                        type="number"
                        min="1"
                        value={formData.warranty_period_months} 
                        onChange={(e) => setFormData({...formData, warranty_period_months: e.target.value})} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Serial Number</Label>
                    <Input 
                      value={formData.serial_number} 
                      onChange={(e) => setFormData({...formData, serial_number: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea 
                      value={formData.notes} 
                      onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                    <Button type="submit" className="bg-slate-900 hover:bg-slate-800">
                      {editingWarranty ? "Update" : "Add"} Warranty
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by customer, product, or serial number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          </div>

          {/* Warranties Table */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-medium">Customer</TableHead>
                  <TableHead className="font-medium">Product</TableHead>
                  <TableHead className="font-medium">Serial Number</TableHead>
                  <TableHead className="font-medium">Purchase Date</TableHead>
                  <TableHead className="font-medium">Expiry Date</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">Loading...</TableCell>
                  </TableRow>
                ) : filteredWarranties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      {searchQuery ? "No warranties found" : "No warranties yet"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWarranties.map((warranty) => {
                    const statusInfo = getWarrantyStatus(warranty);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <TableRow key={warranty.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">{warranty.customer_name}</p>
                            {warranty.customer_phone && (
                              <p className="text-sm text-slate-500">{warranty.customer_phone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">
                          {getProductName(warranty.product_id)}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {warranty.serial_number || <span className="text-slate-400">-</span>}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {warranty.purchase_date ? format(new Date(warranty.purchase_date), 'MMM d, yyyy') : '-'}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {warranty.warranty_expiry_date ? format(new Date(warranty.warranty_expiry_date), 'MMM d, yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("inline-flex items-center gap-1", statusInfo.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(warranty)}
                            className="text-slate-600 hover:text-slate-900"
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
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