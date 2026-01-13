import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db, supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Plus, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import AccessControl from "@/components/AccessControl";

export default function Accounts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    transaction_type: "income",
    shop_id: "",
    category: "",
    amount: "",
    description: "",
    transaction_date: new Date().toISOString().split('T')[0]
  });

  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data, error } = await db.accounts.list();
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

  const createMutation = useMutation({
    mutationFn: async (transactionData) => {
      const { data, error } = await db.accounts.create(transactionData);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({
      transaction_type: "income",
      shop_id: "",
      category: "",
      amount: "",
      description: "",
      transaction_date: new Date().toISOString().split('T')[0]
    });
    setIsDialogOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  const incomeTransactions = accounts.filter(a => a.transaction_type === 'income');
  const expenseTransactions = accounts.filter(a => a.transaction_type === 'expense');

  const totalIncome = incomeTransactions.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);
  const totalExpense = expenseTransactions.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <AccessControl allowedLevels={['super_admin', 'administrator']}>
      <div className="min-h-screen bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Accounts</h1>
            <p className="text-slate-500 mt-1">Track income and expenses across your shops</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Income</CardTitle>
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-900">LKR {totalIncome.toLocaleString()}</p>
                <p className="text-sm text-slate-500 mt-1">{incomeTransactions.length} transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Expenses</CardTitle>
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-900">LKR {totalExpense.toLocaleString()}</p>
                <p className="text-sm text-slate-500 mt-1">{expenseTransactions.length} transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Net Balance</CardTitle>
                  {netBalance >= 0 ? (
                    <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <ArrowDownCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className={cn(
                  "text-2xl font-bold",
                  netBalance >= 0 ? "text-emerald-600" : "text-red-600"
                )}>
                  LKR {netBalance.toLocaleString()}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {netBalance >= 0 ? 'Profit' : 'Loss'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="bg-white border border-slate-200">
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expenses</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>All Transactions</CardTitle>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Transaction
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>New Transaction</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Transaction Type *</Label>
                          <Select
                            value={formData.transaction_type}
                            onValueChange={(value) => setFormData({ ...formData, transaction_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="income">Income</SelectItem>
                              <SelectItem value="expense">Expense</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Shop *</Label>
                          <Select
                            value={formData.shop_id || ''}
                            onValueChange={(value) => setFormData({ ...formData, shop_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select shop" />
                            </SelectTrigger>
                            <SelectContent>
                              {shops.map(shop => (
                                <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Category *</Label>
                          <Input
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            placeholder="e.g. Sales, Rent, Utilities"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Amount (LKR) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder="Enter amount"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Optional notes"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Transaction Date *</Label>
                          <Input
                            type="date"
                            value={formData.transaction_date}
                            onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                            required
                          />
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsDialogOpen(false);
                              setFormData({
                                transaction_type: 'income',
                                shop_id: null,
                                category: '',
                                amount: '',
                                description: '',
                                transaction_date: new Date().toISOString().split('T')[0]
                              });
                            }}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={async () => {
                              if (!formData.transaction_type || !formData.shop_id || !formData.category || !formData.amount) {
                                toast.error('Please fill required fields');
                                return;
                              }
                              await createMutation.mutateAsync(formData);
                            }}
                            className="flex-1"
                            disabled={createMutation.isPending}
                          >
                            {createMutation.isPending ? 'Adding...' : 'Add Transaction'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                            No transactions yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        accounts.map(account => (
                          <TableRow key={account.id}>
                            <TableCell>
                              {account.transaction_date ? format(new Date(account.transaction_date), 'MMM d, yyyy') : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge className={account.transaction_type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                                {account.transaction_type === 'income' ? (
                                  <ArrowUpCircle className="w-3 h-3 mr-1" />
                                ) : (
                                  <ArrowDownCircle className="w-3 h-3 mr-1" />
                                )}
                                {account.transaction_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{account.category}</TableCell>
                            <TableCell className="text-slate-600">{account.description || '-'}</TableCell>
                            <TableCell className={cn(
                              "text-right font-semibold",
                              account.transaction_type === 'income' ? 'text-emerald-600' : 'text-red-600'
                            )}>
                              {account.transaction_type === 'income' ? '+' : '-'} LKR {parseFloat(account.amount).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="income">
              <Card>
                <CardHeader>
                  <CardTitle>Income Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomeTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                            No income transactions yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        incomeTransactions.map(account => (
                          <TableRow key={account.id}>
                            <TableCell>
                              {account.transaction_date ? format(new Date(account.transaction_date), 'MMM d, yyyy') : '-'}
                            </TableCell>
                            <TableCell className="font-medium">{account.category}</TableCell>
                            <TableCell className="text-slate-600">{account.description || '-'}</TableCell>
                            <TableCell className="text-right font-semibold text-emerald-600">
                              + LKR {parseFloat(account.amount).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expense">
              <Card>
                <CardHeader>
                  <CardTitle>Expense Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenseTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                            No expense transactions yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        expenseTransactions.map(account => (
                          <TableRow key={account.id}>
                            <TableCell>
                              {account.transaction_date ? format(new Date(account.transaction_date), 'MMM d, yyyy') : '-'}
                            </TableCell>
                            <TableCell className="font-medium">{account.category}</TableCell>
                            <TableCell className="text-slate-600">{account.description || '-'}</TableCell>
                            <TableCell className="text-right font-semibold text-red-600">
                              - LKR {parseFloat(account.amount).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AccessControl>
  );
}