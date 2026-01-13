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
import { Plus, Pencil, UserCog, Shield, ShoppingCart, BarChart3, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import AccessControl from "@/components/AccessControl";

const accessLevels = [
  { value: "administrator", label: "Administrator", icon: Shield, color: "bg-purple-100 text-purple-700" },
  { value: "sales_person", label: "Sales Person", icon: ShoppingCart, color: "bg-blue-100 text-blue-700" },
  { value: "report_viewer", label: "Report Viewer", icon: BarChart3, color: "bg-emerald-100 text-emerald-700" }
];

export default function Users() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [formData, setFormData] = useState({
    access_level: "sales_person",
    assigned_shop_id: ""
  });

  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await db.users.list();
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

  const inviteUserMutation = useMutation({
    mutationFn: async ({ email, role, full_name }) => {
      // For now, users need to be created via Supabase Auth dashboard or CLI
      // This is a placeholder - actual implementation would use Supabase Auth Admin API
      console.log('User invite not yet implemented:', email, role);
      throw new Error('User invite feature requires Supabase Auth Admin API setup');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsInviteOpen(false);
      setInviteEmail("");
      setFormData({ access_level: "sales_person", assigned_shop_id: "" });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { data: result, error } = await db.users.update(id, data);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
    }
  });

  const handleInvite = (e) => {
    e.preventDefault();
    inviteUserMutation.mutate({
      email: inviteEmail,
      access_level: formData.access_level,
      assigned_shop_id: formData.assigned_shop_id
    });
  };

  const handleEdit = (user) => {
    setFormData({
      access_level: user.access_level || "sales_person",
      assigned_shop_id: user.assigned_shop_id || ""
    });
    setEditingUser(user);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateUserMutation.mutate({
      id: editingUser.id,
      data: formData
    });
  };

  const getAccessLevelConfig = (level) => {
    return accessLevels.find(l => l.value === level) || accessLevels[1];
  };

  const getShopName = (shopId) => {
    return shops.find(s => s.id === shopId)?.name || "Not assigned";
  };

  return (
    <AccessControl allowedLevels={['super_admin', 'administrator']}>
      <div className="min-h-screen bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Users</h1>
              <p className="text-slate-500 mt-1">Manage user accounts and permissions</p>
            </div>
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild>
                <Button className="bg-slate-900 hover:bg-slate-800">
                  <Plus className="w-4 h-4 mr-2" /> Invite User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Invite New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleInvite} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="pl-10"
                        placeholder="user@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Access Level *</Label>
                    <Select value={formData.access_level} onValueChange={(v) => setFormData({...formData, access_level: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {accessLevels.map(level => {
                          const Icon = level.icon;
                          return (
                            <SelectItem key={level.value} value={level.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {level.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.access_level === "sales_person" && (
                    <div className="space-y-2">
                      <Label>Assign to Shop *</Label>
                      <Select value={formData.assigned_shop_id} onValueChange={(v) => setFormData({...formData, assigned_shop_id: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shop" />
                        </SelectTrigger>
                        <SelectContent>
                          {shops.filter(s => s.is_active !== false).map(shop => (
                            <SelectItem key={shop.id} value={shop.id}>
                              {shop.shop_id ? `${shop.shop_id} - ${shop.name}` : shop.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-900">
                      An invitation email will be sent to the user. After registration, you may need to update their permissions.
                    </p>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-slate-900 hover:bg-slate-800">
                      Send Invitation
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-medium">User</TableHead>
                  <TableHead className="font-medium">Access Level</TableHead>
                  <TableHead className="font-medium">Assigned Shop</TableHead>
                  <TableHead className="font-medium">Role</TableHead>
                  <TableHead className="font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => {
                    const config = getAccessLevelConfig(user.access_level);
                    const Icon = config.icon;
                    const isSuperAdmin = user.access_level === 'super_admin';
                    
                    return (
                      <TableRow key={user.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                              <UserCog className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{user.full_name || 'No name'}</p>
                              <p className="text-sm text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("flex items-center gap-1 w-fit", config.color)}>
                            <Icon className="w-3 h-3" />
                            {isSuperAdmin ? "Super Admin" : config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.access_level === 'sales_person' ? (
                            user.assigned_shop_id ? (
                              <span className="text-slate-900">{getShopName(user.assigned_shop_id)}</span>
                            ) : (
                              <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
                                Not Assigned
                              </Badge>
                            )
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.role || 'user'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {!isSuperAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(user)}
                              className="text-slate-600 hover:text-slate-900"
                            >
                              <Pencil className="w-4 h-4 mr-1" />
                              Edit
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

        {/* Edit User Dialog */}
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User Permissions</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4 mt-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-sm font-medium text-slate-900">{editingUser?.full_name}</p>
                <p className="text-sm text-slate-500">{editingUser?.email}</p>
              </div>
              
              <div className="space-y-2">
                <Label>Access Level *</Label>
                <Select value={formData.access_level} onValueChange={(v) => setFormData({...formData, access_level: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accessLevels.map(level => {
                      const Icon = level.icon;
                      return (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {level.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {formData.access_level === "sales_person" && (
                <div className="space-y-2">
                  <Label>Assign to Shop *</Label>
                  <Select value={formData.assigned_shop_id} onValueChange={(v) => setFormData({...formData, assigned_shop_id: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shop" />
                    </SelectTrigger>
                    <SelectContent>
                      {shops.filter(s => s.is_active !== false).map(shop => (
                        <SelectItem key={shop.id} value={shop.id}>
                          {shop.shop_id ? `${shop.shop_id} - ${shop.name}` : shop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-slate-900 hover:bg-slate-800">
                  Update
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AccessControl>
  );
}