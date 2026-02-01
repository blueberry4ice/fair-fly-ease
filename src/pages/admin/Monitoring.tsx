import React from 'react';
import { useData } from '@/contexts/DataContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { QuotaBadge } from '@/components/ui/quota-badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Ticket,
  TrendingUp,
  Gift,
  Users,
  Building2,
  PieChart,
  BarChart3,
} from 'lucide-react';

export default function Monitoring() {
  const { transactions, promos, travelAgents, users } = useData();

  // Calculate overall stats
  const successfulTransactions = transactions.filter(t => t.status === 'success');
  const totalTicketSales = successfulTransactions.reduce((sum, t) => sum + t.ticketAmount, 0);
  const totalCashback = successfulTransactions.reduce((sum, t) => sum + t.cashbackAmount, 0);
  const cancelledTransactions = transactions.filter(t => t.status === 'cancelled');

  // Transactions by promo
  const transactionsByPromo = promos.map(promo => {
    const promoTransactions = successfulTransactions.filter(t => t.promoId === promo.id);
    return {
      promo,
      count: promoTransactions.length,
      totalAmount: promoTransactions.reduce((sum, t) => sum + t.ticketAmount, 0),
      totalCashback: promoTransactions.reduce((sum, t) => sum + t.cashbackAmount, 0),
    };
  });

  // Transactions by agent
  const transactionsByAgent = travelAgents.map(agent => {
    const agentTransactions = successfulTransactions.filter(t => t.travelAgentId === agent.id);
    return {
      agent,
      count: agentTransactions.length,
      totalAmount: agentTransactions.reduce((sum, t) => sum + t.ticketAmount, 0),
      totalCashback: agentTransactions.reduce((sum, t) => sum + t.cashbackAmount, 0),
    };
  }).sort((a, b) => b.totalAmount - a.totalAmount);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompact = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  return (
    <AppLayout>
      <PageHeader
        title="Monitoring Dashboard"
        description="Real-time overview of travel fair performance"
      />

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Total Transactions"
          value={successfulTransactions.length}
          subtitle={`${cancelledTransactions.length} cancelled`}
          icon={Ticket}
          variant="primary"
        />
        <StatCard
          title="Total Ticket Sales"
          value={formatCurrency(totalTicketSales)}
          icon={TrendingUp}
          variant="info"
        />
        <StatCard
          title="Total Cashback Given"
          value={formatCurrency(totalCashback)}
          icon={Gift}
          variant="success"
        />
        <StatCard
          title="Active Users"
          value={users.filter(u => u.isActive).length}
          subtitle={`${travelAgents.length} travel agents`}
          icon={Users}
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Quota Usage by Promo */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Promo Quota Usage
            </CardTitle>
            <CardDescription>Current quota status for all promos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {promos.map((promo) => {
              const percentage = (promo.quotaUsed / promo.quotaTotal) * 100;
              return (
                <div key={promo.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{promo.name}</span>
                      <Badge variant={promo.type === 'guaranteed_code' ? 'default' : 'secondary'} className="text-xs">
                        {promo.type === 'guaranteed_code' ? 'VIP' : 'Public'}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {promo.quotaUsed} / {promo.quotaTotal}
                    </span>
                  </div>
                  <Progress 
                    value={percentage} 
                    className={`h-2 ${
                      percentage >= 90 ? '[&>div]:bg-destructive' : 
                      percentage >= 70 ? '[&>div]:bg-warning' : 
                      '[&>div]:bg-success'
                    }`}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Performance by Promo */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Promo Performance
            </CardTitle>
            <CardDescription>Transaction summary by promotion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactionsByPromo.map(({ promo, count, totalAmount, totalCashback }) => (
                <div key={promo.id} className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{promo.name}</span>
                    <Badge variant="outline">{count} bookings</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Sales</p>
                      <p className="font-semibold">{formatCurrency(totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cashback</p>
                      <p className="font-semibold text-success">{formatCurrency(totalCashback)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Travel Agent Performance */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Travel Agent Performance
            </CardTitle>
            <CardDescription>Ranking by total ticket sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {transactionsByAgent.map(({ agent, count, totalAmount, totalCashback }, index) => (
                <div 
                  key={agent.id} 
                  className={`p-4 rounded-lg border ${
                    index === 0 ? 'bg-primary/5 border-primary/20' : 'bg-card'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-primary text-primary-foreground' :
                      index === 1 ? 'bg-secondary text-secondary-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{count} transactions</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Sales</span>
                      <span className="font-semibold">{formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cashback Given</span>
                      <span className="font-semibold text-success">{formatCurrency(totalCashback)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
