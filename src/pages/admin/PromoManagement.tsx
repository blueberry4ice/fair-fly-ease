import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuotaBadge } from '@/components/ui/quota-badge';
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
import { Switch } from '@/components/ui/switch';
import { Promo, PromoType, CashbackRule } from '@/types';
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Gift,
  Trash2,
} from 'lucide-react';

export default function PromoManagement() {
  const { promos, events, addPromo, updatePromo } = useData();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'regular' as PromoType,
    eventId: '',
    quotaTotal: 100,
    quotaPerAgent: null as number | null,
    validFrom: '',
    validTo: '',
    isActive: true,
    cashbackRules: [{ minAmount: 3500000, cashbackAmount: 250000 }] as CashbackRule[],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleOpenAddDialog = () => {
    const activeEvent = events.find(e => e.isActive);
    setFormData({
      name: '',
      description: '',
      type: 'regular',
      eventId: activeEvent?.id || '',
      quotaTotal: 100,
      quotaPerAgent: null,
      validFrom: activeEvent?.startDate || '',
      validTo: activeEvent?.endDate || '',
      isActive: true,
      cashbackRules: [{ minAmount: 3500000, cashbackAmount: 250000 }],
    });
    setShowAddDialog(true);
  };

  const handleOpenEditDialog = (promo: Promo) => {
    setEditingPromo(promo);
    setFormData({
      name: promo.name,
      description: promo.description,
      type: promo.type,
      eventId: promo.eventId,
      quotaTotal: promo.quotaTotal,
      quotaPerAgent: promo.quotaPerAgent,
      validFrom: promo.validFrom,
      validTo: promo.validTo,
      isActive: promo.isActive,
      cashbackRules: [...promo.cashbackRules],
    });
  };

  const handleAddCashbackRule = () => {
    setFormData(f => ({
      ...f,
      cashbackRules: [...f.cashbackRules, { minAmount: 0, cashbackAmount: 0 }],
    }));
  };

  const handleRemoveCashbackRule = (index: number) => {
    setFormData(f => ({
      ...f,
      cashbackRules: f.cashbackRules.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateCashbackRule = (index: number, field: keyof CashbackRule, value: number) => {
    setFormData(f => ({
      ...f,
      cashbackRules: f.cashbackRules.map((rule, i) => 
        i === index ? { ...rule, [field]: value } : rule
      ),
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.eventId || formData.cashbackRules.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingPromo) {
      updatePromo(editingPromo.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        eventId: formData.eventId,
        quotaTotal: formData.quotaTotal,
        quotaPerAgent: formData.quotaPerAgent,
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        isActive: formData.isActive,
        cashbackRules: formData.cashbackRules.filter(r => r.minAmount > 0 && r.cashbackAmount > 0),
      });
      toast.success('Promo updated successfully');
      setEditingPromo(null);
    } else {
      addPromo({
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        eventId: formData.eventId,
        quotaTotal: formData.quotaTotal,
        quotaUsed: 0,
        quotaPerAgent: formData.quotaPerAgent,
        validFrom: formData.validFrom,
        validTo: formData.validTo,
        isActive: formData.isActive,
        cashbackRules: formData.cashbackRules.filter(r => r.minAmount > 0 && r.cashbackAmount > 0),
      });
      toast.success('Promo created successfully');
      setShowAddDialog(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Promo Management"
        description="Manage promotions and cashback rules"
        actions={
          <Button onClick={handleOpenAddDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Promo
          </Button>
        }
      />

      {/* Promo Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promos.map((promo) => (
          <Card key={promo.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg font-display">{promo.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={promo.type === 'guaranteed_code' ? 'default' : 'secondary'}>
                    {promo.type === 'guaranteed_code' ? 'VIP' : 'Public'}
                  </Badge>
                  <Badge variant={promo.isActive ? 'default' : 'outline'}>
                    {promo.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{promo.description}</p>
              
              <QuotaBadge 
                used={promo.quotaUsed} 
                total={promo.quotaTotal} 
                showProgress 
              />

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Cashback Rules:</p>
                {promo.cashbackRules.map((rule, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>Min {formatCurrency(rule.minAmount)}</span>
                    <span className="font-semibold text-success">
                      {formatCurrency(rule.cashbackAmount)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleOpenEditDialog(promo)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Promo
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Promo Dialog */}
      <Dialog 
        open={showAddDialog || !!editingPromo} 
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditingPromo(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPromo ? 'Edit Promo' : 'Add New Promo'}</DialogTitle>
            <DialogDescription>
              {editingPromo ? 'Update promo details and cashback rules' : 'Create a new promotion'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Promo Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                  placeholder="Enter promo name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Promo Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: PromoType) => setFormData(f => ({ ...f, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular (Public)</SelectItem>
                    <SelectItem value="guaranteed_code">Guaranteed Code (VIP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                placeholder="Enter promo description"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event">Event *</Label>
                <Select 
                  value={formData.eventId} 
                  onValueChange={(value) => setFormData(f => ({ ...f, eventId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map(event => (
                      <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quotaTotal">Total Quota</Label>
                <Input
                  id="quotaTotal"
                  type="number"
                  value={formData.quotaTotal}
                  onChange={(e) => setFormData(f => ({ ...f, quotaTotal: parseInt(e.target.value) || 0 }))}
                  min={0}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData(f => ({ ...f, validFrom: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validTo">Valid To</Label>
                <Input
                  id="validTo"
                  type="date"
                  value={formData.validTo}
                  onChange={(e) => setFormData(f => ({ ...f, validTo: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active Status</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(f => ({ ...f, isActive: checked }))}
              />
            </div>

            {/* Cashback Rules */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Cashback Rules</Label>
                <Button variant="outline" size="sm" onClick={handleAddCashbackRule}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Rule
                </Button>
              </div>

              {formData.cashbackRules.map((rule, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <Label className="text-xs">Min Amount (IDR)</Label>
                    <Input
                      type="number"
                      value={rule.minAmount}
                      onChange={(e) => handleUpdateCashbackRule(index, 'minAmount', parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">Cashback (IDR)</Label>
                    <Input
                      type="number"
                      value={rule.cashbackAmount}
                      onChange={(e) => handleUpdateCashbackRule(index, 'cashbackAmount', parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  {formData.cashbackRules.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:text-destructive mt-5"
                      onClick={() => handleRemoveCashbackRule(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddDialog(false);
                setEditingPromo(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingPromo ? 'Save Changes' : 'Create Promo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
