import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { QuotaBadge } from '@/components/ui/quota-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Promo } from '@/types';
import { toast } from 'sonner';
import {
  Ticket,
  Gift,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Calculator,
} from 'lucide-react';

export default function NewTransaction() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    events, 
    promos, 
    addTransaction, 
    calculateCashback, 
    validateGuaranteedCode,
    getRemainingQuota,
  } = useData();

  // Step management
  const [step, setStep] = useState<'select-promo' | 'form'>('select-promo');
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [ticketAmount, setTicketAmount] = useState('');
  const [guaranteedCode, setGuaranteedCode] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [lastTransactionId, setLastTransactionId] = useState('');

  // Filter active promos
  const activeEvent = events.find(e => e.isActive);
  const activePromos = promos.filter(p => p.isActive && p.eventId === activeEvent?.id);

  // Calculate cashback
  const amount = parseFloat(ticketAmount) || 0;
  const cashbackAmount = selectedPromo ? calculateCashback(amount, selectedPromo) : 0;
  const remainingQuota = selectedPromo ? getRemainingQuota(selectedPromo, user?.travelAgentId || undefined) : 0;

  // Validation
  const isGuaranteedCodeValid = selectedPromo?.type === 'guaranteed_code' 
    ? validateGuaranteedCode(guaranteedCode) 
    : true;
  
  const canSubmit = 
    customerName.trim() !== '' &&
    amount >= 1000000 &&
    cashbackAmount > 0 &&
    remainingQuota > 0 &&
    isGuaranteedCodeValid;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSelectPromo = (promo: Promo) => {
    setSelectedPromo(promo);
    setStep('form');
  };

  const handleSubmit = async () => {
    if (!selectedPromo || !user) return;

    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const transaction = addTransaction({
      bookingDateTime: new Date().toISOString(),
      travelAgentId: user.travelAgentId || '',
      travelAgentName: user.travelAgentName || 'Administrator',
      userId: user.id,
      userName: user.name,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      ticketAmount: amount,
      promoId: selectedPromo.id,
      promoName: selectedPromo.name,
      promoType: selectedPromo.type,
      guaranteedCode: selectedPromo.type === 'guaranteed_code' ? guaranteedCode.toUpperCase() : null,
      cashbackAmount,
      status: 'success',
      notes: notes.trim(),
      createdBy: user.id,
    });

    setLastTransactionId(transaction.id);
    setShowConfirmDialog(false);
    setShowSuccessDialog(true);
    setIsSubmitting(false);
  };

  const handleNewTransaction = () => {
    setShowSuccessDialog(false);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setTicketAmount('');
    setGuaranteedCode('');
    setNotes('');
    setStep('select-promo');
    setSelectedPromo(null);
  };

  if (step === 'select-promo') {
    return (
      <AppLayout>
        <PageHeader
          title="New Transaction"
          description={activeEvent ? `Event: ${activeEvent.name}` : 'Select a promo to continue'}
        />

        {!activeEvent ? (
          <Card className="max-w-lg mx-auto text-center py-12">
            <CardContent>
              <AlertTriangle className="w-12 h-12 mx-auto text-warning mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Event</h3>
              <p className="text-muted-foreground">There is no active travel fair event at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {activePromos.map((promo) => {
              const quota = getRemainingQuota(promo, user?.travelAgentId || undefined);
              const isAvailable = quota > 0;

              return (
                <Card 
                  key={promo.id}
                  className={`transition-all cursor-pointer hover:shadow-lg ${
                    isAvailable 
                      ? 'hover:border-primary/50' 
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => isAvailable && handleSelectPromo(promo)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg font-display">{promo.name}</CardTitle>
                      <Badge variant={promo.type === 'guaranteed_code' ? 'default' : 'secondary'}>
                        {promo.type === 'guaranteed_code' ? 'VIP' : 'Public'}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{promo.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <QuotaBadge 
                      used={promo.quotaTotal - quota} 
                      total={promo.quotaTotal} 
                      showProgress 
                    />
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Cashback Tiers:</p>
                      {promo.cashbackRules.map((rule, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>Min {formatCurrency(rule.minAmount)}</span>
                          <span className="font-semibold text-success">
                            {formatCurrency(rule.cashbackAmount)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      className="w-full" 
                      disabled={!isAvailable}
                      variant={isAvailable ? 'default' : 'secondary'}
                    >
                      {isAvailable ? 'Select Promo' : 'Sold Out'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="New Transaction"
        description={selectedPromo?.name}
        actions={
          <Button variant="outline" onClick={() => setStep('select-promo')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Change Promo
          </Button>
        }
      />

      <div className="max-w-2xl mx-auto">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              Transaction Details
            </CardTitle>
            <CardDescription>Enter the booking information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="08xx xxxx xxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="customer@email.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="h-12"
              />
            </div>

            {/* Ticket Amount */}
            <div className="space-y-2">
              <Label htmlFor="ticketAmount">Ticket Amount (IDR) *</Label>
              <Input
                id="ticketAmount"
                type="number"
                placeholder="Enter ticket total amount"
                value={ticketAmount}
                onChange={(e) => setTicketAmount(e.target.value)}
                className="h-12 text-lg font-semibold"
                min={0}
              />
              {amount > 0 && amount < 3500000 && (
                <p className="text-sm text-warning">
                  Minimum amount for cashback: {formatCurrency(3500000)}
                </p>
              )}
            </div>

            {/* Guaranteed Code (if applicable) */}
            {selectedPromo?.type === 'guaranteed_code' && (
              <div className="space-y-2">
                <Label htmlFor="guaranteedCode">Guaranteed Code *</Label>
                <Input
                  id="guaranteedCode"
                  placeholder="Enter VIP code"
                  value={guaranteedCode}
                  onChange={(e) => setGuaranteedCode(e.target.value.toUpperCase())}
                  className={`h-12 uppercase ${
                    guaranteedCode && !isGuaranteedCodeValid 
                      ? 'border-destructive focus-visible:ring-destructive' 
                      : ''
                  }`}
                />
                {guaranteedCode && !isGuaranteedCodeValid && (
                  <p className="text-sm text-destructive">Invalid guaranteed code</p>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Cashback Calculation */}
            {amount > 0 && (
              <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Calculator className="w-5 h-5 text-success" />
                    <span className="font-semibold">Cashback Calculation</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ticket Amount</span>
                      <span className="font-medium">{formatCurrency(amount)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-success">
                      <span>Cashback Amount</span>
                      <span>{formatCurrency(cashbackAmount)}</span>
                    </div>
                    {cashbackAmount === 0 && amount > 0 && (
                      <p className="text-warning text-xs mt-2">
                        Amount does not meet minimum requirement for cashback
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Button
              onClick={() => setShowConfirmDialog(true)}
              disabled={!canSubmit}
              className="w-full h-14 text-lg font-semibold shadow-lg"
              size="lg"
            >
              <Gift className="w-5 h-5 mr-2" />
              Submit Transaction
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Transaction</DialogTitle>
            <DialogDescription>
              Please review the transaction details before submitting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span className="font-medium">{customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ticket Amount</span>
              <span className="font-medium">{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Promo</span>
              <span className="font-medium">{selectedPromo?.name}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-success">
              <span>Cashback</span>
              <span>{formatCurrency(cashbackAmount)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="text-center">
          <div className="py-6">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <DialogTitle className="text-xl mb-2">Transaction Successful!</DialogTitle>
            <DialogDescription className="space-y-2">
              <p>Transaction ID: <span className="font-mono font-bold">{lastTransactionId}</span></p>
              <p className="text-success font-semibold text-lg">
                Cashback: {formatCurrency(cashbackAmount)}
              </p>
            </DialogDescription>
          </div>
          <DialogFooter className="sm:justify-center gap-3">
            <Button variant="outline" onClick={() => navigate('/transactions')}>
              View History
            </Button>
            <Button onClick={handleNewTransaction}>
              New Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
