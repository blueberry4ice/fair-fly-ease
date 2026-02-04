import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useData } from '@/contexts/DataContext';
import { GuaranteedCode } from '@/types';
import { Plus, Pencil, Ticket, Search, CheckCircle2, Clock, XCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function GuaranteedCodeManagement() {
  const { guaranteedCodes, promos, addGuaranteedCode, updateGuaranteedCode, deleteGuaranteedCode } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<GuaranteedCode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPromo, setFilterPromo] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const guaranteedPromos = promos.filter(p => p.type === 'guaranteed_code');
  
  const [formData, setFormData] = useState({
    code: '',
    promoId: '',
    validFrom: '',
    validTo: '',
  });

  const filteredCodes = guaranteedCodes.filter(code => {
    const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPromo = filterPromo === 'all' || code.promoId === filterPromo;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'used' && code.isUsed) ||
      (filterStatus === 'available' && !code.isUsed && new Date() >= new Date(code.validFrom) && new Date() <= new Date(code.validTo)) ||
      (filterStatus === 'expired' && !code.isUsed && new Date() > new Date(code.validTo));
    return matchesSearch && matchesPromo && matchesStatus;
  });

  const handleOpenDialog = (code?: GuaranteedCode) => {
    if (code) {
      setEditingCode(code);
      setFormData({
        code: code.code,
        promoId: code.promoId,
        validFrom: code.validFrom,
        validTo: code.validTo,
      });
    } else {
      setEditingCode(null);
      const defaultPromo = guaranteedPromos[0];
      setFormData({
        code: '',
        promoId: defaultPromo?.id || '',
        validFrom: defaultPromo?.validFrom || '',
        validTo: defaultPromo?.validTo || '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCode) {
      updateGuaranteedCode(editingCode.id, formData);
    } else {
      addGuaranteedCode(formData);
    }
    
    setIsDialogOpen(false);
    setEditingCode(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this code?')) {
      deleteGuaranteedCode(id);
    }
  };

  const generateRandomCode = () => {
    const prefix = 'VIP';
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${year}-${random}`;
  };

  const getCodeStatus = (code: GuaranteedCode) => {
    if (code.isUsed) {
      return { label: 'Used', variant: 'secondary' as const, icon: CheckCircle2 };
    }
    const now = new Date();
    const validFrom = new Date(code.validFrom);
    const validTo = new Date(code.validTo);
    
    if (now < validFrom) {
      return { label: 'Pending', variant: 'outline' as const, icon: Clock };
    }
    if (now > validTo) {
      return { label: 'Expired', variant: 'destructive' as const, icon: XCircle };
    }
    return { label: 'Available', variant: 'default' as const, icon: Ticket };
  };

  const getPromoName = (promoId: string) => {
    return promos.find(p => p.id === promoId)?.name || 'Unknown Promo';
  };

  // Summary stats
  const totalCodes = guaranteedCodes.length;
  const usedCodes = guaranteedCodes.filter(c => c.isUsed).length;
  const availableCodes = guaranteedCodes.filter(c => {
    if (c.isUsed) return false;
    const now = new Date();
    return now >= new Date(c.validFrom) && now <= new Date(c.validTo);
  }).length;

  return (
    <AppLayout>
      <PageHeader
        title="Guaranteed Code Management"
        description="Manage VIP guaranteed codes for exclusive promo redemption"
      >
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Code
        </Button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Ticket className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Codes</p>
                <p className="text-2xl font-bold">{totalCodes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/10">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">{availableCodes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-muted">
                <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Used</p>
                <p className="text-2xl font-bold">{usedCodes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle>All Guaranteed Codes</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterPromo} onValueChange={setFilterPromo}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by promo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Promos</SelectItem>
                  {guaranteedPromos.map(promo => (
                    <SelectItem key={promo.id} value={promo.id}>{promo.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead className="hidden md:table-cell">Promo</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Used By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No guaranteed codes found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCodes.map((code) => {
                    const status = getCodeStatus(code);
                    const StatusIcon = status.icon;
                    return (
                      <TableRow key={code.id}>
                        <TableCell>
                          <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                            {code.code}
                          </code>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm">{getPromoName(code.promoId)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{format(new Date(code.validFrom), 'MMM d, yyyy')}</p>
                            <p className="text-muted-foreground">to {format(new Date(code.validTo), 'MMM d, yyyy')}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="gap-1">
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {code.isUsed ? (
                            <div className="text-sm">
                              <p>{code.usedBy}</p>
                              {code.usedAt && (
                                <p className="text-xs">{format(new Date(code.usedAt), 'MMM d, yyyy HH:mm')}</p>
                              )}
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(code)}
                              disabled={code.isUsed}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(code.id)}
                              disabled={code.isUsed}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCode ? 'Edit Guaranteed Code' : 'Add New Guaranteed Code'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., VIP2024-ABCD"
                  className="font-mono"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({ ...formData, code: generateRandomCode() })}
                >
                  Generate
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="promo">Promo</Label>
              <Select
                value={formData.promoId}
                onValueChange={(value) => {
                  const promo = promos.find(p => p.id === value);
                  setFormData({
                    ...formData,
                    promoId: value,
                    validFrom: promo?.validFrom || formData.validFrom,
                    validTo: promo?.validTo || formData.validTo,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a promo" />
                </SelectTrigger>
                <SelectContent>
                  {guaranteedPromos.map(promo => (
                    <SelectItem key={promo.id} value={promo.id}>{promo.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validTo">Valid To</Label>
                <Input
                  id="validTo"
                  type="date"
                  value={formData.validTo}
                  onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCode ? 'Save Changes' : 'Add Code'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
