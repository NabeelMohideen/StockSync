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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Pencil, Users, Phone, Mail, MapPin } from "lucide-react";
import AccessControl from "@/components/AccessControl";

export default function Customers() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", address: "", notes: ""
  });

  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list('-created_date', 1000)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Customer.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({ name: "", phone: "", email: "", address: "", notes: "" });
    setEditingCustomer(null);
    setIsOpen(false);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      notes: customer.notes || ""
    });
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AccessControl allowedLevels={['super_admin', 'administrator']}>
      <div className="min-h-screen bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Customers</h1>
              <p className="text-slate-500 mt-1">Manage customer information</p>
            </div>
            <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsOpen(open); }}>
              <DialogTrigger asChild>
                <Button className="bg-slate-900 hover:bg-slate-800">
                  <Plus className="w-4 h-4 mr-2" /> Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone *</Label>
                    <Input 
                      type="tel"
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Textarea 
                      value={formData.address} 
                      onChange={(e) => setFormData({...formData, address: e.target.value})} 
                      rows={3}
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
                      {editingCustomer ? "Update" : "Add"} Customer
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
                placeholder="Search customers by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-medium">Name</TableHead>
                  <TableHead className="font-medium">Phone</TableHead>
                  <TableHead className="font-medium">Email</TableHead>
                  <TableHead className="font-medium">Address</TableHead>
                  <TableHead className="font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">Loading...</TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      {searchQuery ? "No customers found" : "No customers yet"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <Users className="w-4 h-4 text-slate-600" />
                          </div>
                          {customer.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          {customer.phone}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {customer.email ? (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            {customer.email}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {customer.address ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="max-w-xs truncate">{customer.address}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(customer)}
                          className="text-slate-600 hover:text-slate-900"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AccessControl>
  );
}