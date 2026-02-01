import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Transaction } from '@/types';
import { toast } from 'sonner';
import {
  Search,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Calendar,
  Eye,
  X,
} from 'lucide-react';
import { format } from 'date-fns';

export default function TransactionHistory() {
  const { user, isAdmin } = useAuth();
  const { transactions, promos, cancelTransaction, getTransactionsByAgent } = useData();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [promoFilter, setPromoFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Dialog states
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [transactionToCancel, setTransactionToCancel] = useState<Transaction | null>(null);

  // Filter transactions based on role
  const userTransactions = isAdmin 
    ? transactions 
    : user?.travelAgentId 
      ? getTransactionsByAgent(user.travelAgentId)
      : [];

  // Apply filters
  const filteredTransactions = useMemo(() => {
    return userTransactions.filter(t => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          t.customerName.toLowerCase().includes(query) ||
          t.id.toLowerCase().includes(query) ||
          t.userName.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Promo filter
      if (promoFilter !== 'all' && t.promoId !== promoFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;

      // Date range filter
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        const transactionDate = new Date(t.bookingDateTime);
        if (transactionDate < fromDate) return false;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59);
        const transactionDate = new Date(t.bookingDateTime);
        if (transactionDate > toDate) return false;
      }

      return true;
    });
  }, [userTransactions, searchQuery, promoFilter, statusFilter, dateFrom, dateTo]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCancelTransaction = () => {
    if (transactionToCancel) {
      cancelTransaction(transactionToCancel.id);
      toast.success('Transaction cancelled successfully');
      setShowCancelDialog(false);
      setTransactionToCancel(null);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Transaction ID',
      'Date',
      'Customer',
      'Phone',
      'Email',
      'Amount',
      'Promo',
      'Cashback',
      'Status',
      'Sales',
      'Agent',
    ];

    const rows = filteredTransactions.map(t => [
      t.id,
      format(new Date(t.bookingDateTime), 'yyyy-MM-dd HH:mm'),
      t.customerName,
      t.customerPhone,
      t.customerEmail,
      t.ticketAmount,
      t.promoName,
      t.cashbackAmount,
      t.status,
      t.userName,
      t.travelAgentName,
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPromoFilter('all');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = searchQuery || promoFilter !== 'all' || statusFilter !== 'all' || dateFrom || dateTo;

  return (
    <AppLayout>
      <PageHeader
        title="Transaction History"
        description={`${filteredTransactions.length} transactions found`}
        actions={
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        }
      />

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search customer, ID, or sales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            {/* Promo Filter */}
            <Select value={promoFilter} onValueChange={setPromoFilter}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Promos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Promos</SelectItem>
                {promos.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Date From */}
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-11"
            />

            {/* Date To */}
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-11"
            />
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Cards View */}
      <div className="lg:hidden space-y-3">
        {filteredTransactions.length === 0 ? (
          <Card className="py-12 text-center">
            <CardContent>
              <p className="text-muted-foreground">No transactions found</p>
            </CardContent>
          </Card>
        ) : (
          filteredTransactions.map((transaction) => (
            <Card 
              key={transaction.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedTransaction(transaction)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{transaction.customerName}</p>
                    <p className="text-sm text-muted-foreground">{transaction.id}</p>
                  </div>
                  <Badge variant={transaction.status === 'success' ? 'default' : 'destructive'}>
                    {transaction.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {format(new Date(transaction.bookingDateTime), 'dd MMM yyyy, HH:mm')}
                  </span>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(transaction.ticketAmount)}</p>
                    <p className="text-success text-xs">+{formatCurrency(transaction.cashbackAmount)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden lg:block overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Promo</TableHead>
              <TableHead>Cashback</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sales</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                  <TableCell>
                    {format(new Date(transaction.bookingDateTime), 'dd MMM yyyy, HH:mm')}
                  </TableCell>
                  <TableCell className="font-medium">{transaction.customerName}</TableCell>
                  <TableCell>{formatCurrency(transaction.ticketAmount)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.promoName}</Badge>
                  </TableCell>
                  <TableCell className="text-success font-semibold">
                    {formatCurrency(transaction.cashbackAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={transaction.status === 'success' ? 'default' : 'destructive'}
                      className="capitalize"
                    >
                      {transaction.status === 'success' ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.userName}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {transaction.status === 'success' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setTransactionToCancel(transaction);
                            setShowCancelDialog(true);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              ID: {selectedTransaction?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Date & Time</p>
                  <p className="font-medium">
                    {format(new Date(selectedTransaction.bookingDateTime), 'dd MMM yyyy, HH:mm')}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={selectedTransaction.status === 'success' ? 'default' : 'destructive'}>
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedTransaction.customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedTransaction.customerPhone || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedTransaction.customerEmail || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Travel Agent</p>
                  <p className="font-medium">{selectedTransaction.travelAgentName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sales Person</p>
                  <p className="font-medium">{selectedTransaction.userName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Promo</p>
                  <p className="font-medium">{selectedTransaction.promoName}</p>
                </div>
                {selectedTransaction.guaranteedCode && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Guaranteed Code</p>
                    <p className="font-mono font-medium">{selectedTransaction.guaranteedCode}</p>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ticket Amount</span>
                  <span className="font-semibold">{formatCurrency(selectedTransaction.ticketAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-success">
                  <span>Cashback</span>
                  <span>{formatCurrency(selectedTransaction.cashbackAmount)}</span>
                </div>
              </div>

              {selectedTransaction.notes && (
                <div className="border-t pt-4">
                  <p className="text-muted-foreground text-sm">Notes</p>
                  <p className="mt-1">{selectedTransaction.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedTransaction?.status === 'success' && (
              <Button 
                variant="destructive"
                onClick={() => {
                  setTransactionToCancel(selectedTransaction);
                  setSelectedTransaction(null);
                  setShowCancelDialog(true);
                }}
              >
                Cancel Transaction
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelectedTransaction(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {transactionToCancel && (
            <div className="py-4 space-y-2 text-sm">
              <p><span className="text-muted-foreground">ID:</span> {transactionToCancel.id}</p>
              <p><span className="text-muted-foreground">Customer:</span> {transactionToCancel.customerName}</p>
              <p><span className="text-muted-foreground">Amount:</span> {formatCurrency(transactionToCancel.ticketAmount)}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Transaction
            </Button>
            <Button variant="destructive" onClick={handleCancelTransaction}>
              Yes, Cancel It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
