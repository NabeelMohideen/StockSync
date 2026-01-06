import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Banknote, CreditCard, DollarSign, AlertCircle, CheckCircle2, Clock, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import AccessControl from "@/components/AccessControl";

export default function Accounts() {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const queryClient = useQueryClient();

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list('-sale_date', 500)
  });

  const { data: creditSales = [] } = useQuery({
    queryKey: ['creditSales'],
    queryFn: () => base44.entities.CreditSale.list('-created_date', 500)
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: () => base44.entities.Payment.list('-payment_date', 500)
  });

  const addPaymentMutation = useMutation({
    mutationFn: async ({ creditSaleId, amount }) => {
      const creditSale = creditSales.find(c => c.id === creditSaleId);
      if (!creditSale) throw new Error("Credit sale not found");

      const newAmountPaid = (creditSale.amount_paid || 0) + amount;
      const newBalanceDue = creditSale.total_amount - newAmountPaid;
      const newStatus = newBalanceDue <= 0 ? "paid" : newAmountPaid > 0 ? "partial" : "pending";

      await base44.entities.Payment.create({
        credit_sale_id: creditSaleId,
        amount,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: "cash"
      });

      await base44.entities.CreditSale.update(creditSaleId, {
        amount_paid: newAmountPaid,
        balance_due: newBalanceDue,
        status: newStatus
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creditSales'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setIsPaymentDialogOpen(false);
      setSelectedCredit(null);
      setPaymentAmount("");
    }
  });

  const handleAddPayment = () => {
    if (!selectedCredit || !paymentAmount) return;
    addPaymentMutation.mutate({
      creditSaleId: selectedCredit.id,
      amount: parseFloat(paymentAmount)
    });
  };

  const cashSales = sales.filter(s => s.payment_method === "cash");
  const cardSales = sales.filter(s => s.payment_method === "card");
  const bankTransferSales = sales.filter(s => s.payment_method === "bank_transfer");

  const totalCash = cashSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const totalCard = cardSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const totalBankTransfer = bankTransferSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const totalCredit = creditSales.reduce((sum, c) => sum + (c.total_amount || 0), 0);
  const totalCreditPaid = creditSales.reduce((sum, c) => sum + (c.amount_paid || 0), 0);
  const totalCreditDue = creditSales.reduce((sum, c) => sum + (c.balance_due || 0), 0);

  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: "Pending", icon: Clock, color: "bg-amber-100 text-amber-700" },
      partial: { label: "Partial", icon: AlertCircle, color: "bg-blue-100 text-blue-700" },
      paid: { label: "Paid", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700" }
    };
    return configs[status] || configs.pending;
  };

  return (
    <AccessControl allowedLevels={['super_admin', 'administrator']}>
      <div className="min-h-screen bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Accounts</h1>
            <p className="text-slate-500 mt-1">Track cash, card, and credit sales</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Cash Sales</CardTitle>
                  <Banknote className="w-5 h-5 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-900">LKR {totalCash.toLocaleString()}</p>
                <p className="text-sm text-slate-500 mt-1">{cashSales.length} transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Card Sales</CardTitle>
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-900">LKR {totalCard.toLocaleString()}</p>
                <p className="text-sm text-slate-500 mt-1">{cardSales.length} transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Credit Sales</CardTitle>
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-900">LKR {totalCredit.toLocaleString()}</p>
                <p className="text-sm text-slate-500 mt-1">{creditSales.length} accounts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Outstanding</CardTitle>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-900">LKR {totalCreditDue.toLocaleString()}</p>
                <p className="text-sm text-emerald-600 mt-1">LKR {totalCreditPaid.toLocaleString()} paid</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="cash" className="space-y-6">
            <TabsList className="bg-white border border-slate-200">
              <TabsTrigger value="cash">Cash Sales</TabsTrigger>
              <TabsTrigger value="card">Card Sales</TabsTrigger>
              <TabsTrigger value="credit">Credit Sales</TabsTrigger>
              <TabsTrigger value="payments">Payment History</TabsTrigger>
            </TabsList>

            <TabsContent value="cash">
              <Card>
                <CardHeader>
                  <CardTitle>Cash Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cashSales.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                            No cash sales yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        cashSales.map(sale => (
                          <TableRow key={sale.id}>
                            <TableCell>{sale.sale_date ? format(new Date(sale.sale_date), 'MMM d, yyyy') : '-'}</TableCell>
                            <TableCell className="font-medium">{sale.customer_name || '-'}</TableCell>
                            <TableCell className="text-slate-600">{sale.customer_phone || '-'}</TableCell>
                            <TableCell className="text-right font-semibold">LKR {sale.total_amount?.toLocaleString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="card">
              <Card>
                <CardHeader>
                  <CardTitle>Card Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cardSales.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                            No card sales yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        cardSales.map(sale => (
                          <TableRow key={sale.id}>
                            <TableCell>{sale.sale_date ? format(new Date(sale.sale_date), 'MMM d, yyyy') : '-'}</TableCell>
                            <TableCell className="font-medium">{sale.customer_name || '-'}</TableCell>
                            <TableCell className="text-slate-600">{sale.customer_phone || '-'}</TableCell>
                            <TableCell className="text-right font-semibold">LKR {sale.total_amount?.toLocaleString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="credit">
              <Card>
                <CardHeader>
                  <CardTitle>Credit Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Balance Due</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {creditSales.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                            No credit sales yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        creditSales.map(credit => {
                          const statusConfig = getStatusConfig(credit.status);
                          const StatusIcon = statusConfig.icon;
                          return (
                            <TableRow key={credit.id}>
                              <TableCell className="font-medium">{credit.customer_name}</TableCell>
                              <TableCell className="text-slate-600">{credit.customer_phone}</TableCell>
                              <TableCell className="font-semibold">LKR {credit.total_amount?.toLocaleString()}</TableCell>
                              <TableCell className="text-emerald-600">LKR {(credit.amount_paid || 0).toLocaleString()}</TableCell>
                              <TableCell className="text-red-600 font-semibold">LKR {(credit.balance_due || 0).toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge className={cn("inline-flex items-center gap-1", statusConfig.color)}>
                                  <StatusIcon className="w-3 h-3" />
                                  {statusConfig.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {credit.status !== "paid" && (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedCredit(credit);
                                      setIsPaymentDialogOpen(true);
                                    }}
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Payment
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                            No payments recorded yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        payments.map(payment => {
                          const creditSale = creditSales.find(c => c.id === payment.credit_sale_id);
                          return (
                            <TableRow key={payment.id}>
                              <TableCell>{payment.payment_date ? format(new Date(payment.payment_date), 'MMM d, yyyy') : '-'}</TableCell>
                              <TableCell className="font-medium">{creditSale?.customer_name || '-'}</TableCell>
                              <TableCell className="text-slate-600 capitalize">{payment.payment_method?.replace('_', ' ')}</TableCell>
                              <TableCell className="text-right font-semibold text-emerald-600">LKR {payment.amount?.toLocaleString()}</TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Add Payment Dialog */}
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payment</DialogTitle>
              </DialogHeader>
              {selectedCredit && (
                <div className="space-y-4 mt-4">
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Customer:</span>
                      <span className="font-medium">{selectedCredit.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Amount:</span>
                      <span className="font-semibold">LKR {selectedCredit.total_amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Already Paid:</span>
                      <span className="text-emerald-600">LKR {(selectedCredit.amount_paid || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-slate-600 font-medium">Balance Due:</span>
                      <span className="text-red-600 font-bold">LKR {(selectedCredit.balance_due || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Amount (LKR) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max={selectedCredit.balance_due}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsPaymentDialogOpen(false);
                        setSelectedCredit(null);
                        setPaymentAmount("");
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddPayment}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                    >
                      Add Payment
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AccessControl>
  );
}