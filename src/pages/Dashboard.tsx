import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { QuotaBadge } from '@/components/ui/quota-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Ticket,
  TrendingUp,
  Gift,
  Users,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const { transactions, promos, travelAgents, getTransactionsByAgent } = useData();

  // Filter transactions based on role
  const userTransactions = isAdmin 
    ? transactions 
    : user?.travelAgentId 
      ? getTransactionsByAgent(user.travelAgentId)
      : [];

  // Calculate stats
  const successfulTransactions = userTransactions.filter(t => t.status === 'success');
  const totalCashback = successfulTransactions.reduce((sum, t) => sum + t.cashbackAmount, 0);
  const totalSales = successfulTransactions.reduce((sum, t) => sum + t.ticketAmount, 0);
  const todayTransactions = userTransactions.filter(t => {
    const today = new Date().toDateString();
    return new Date(t.bookingDateTime).toDateString() === today;
  });

  // Active promos
  const activePromos = promos.filter(p => p.isActive);

  // Recent transactions (last 5)
  const recentTransactions = userTransactions.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AppLayout>
      <PageHeader
        title={`Welcome back, ${user?.name.split(' ')[0]}!`}
        description={isAdmin ? 'System overview and monitoring' : `${user?.travelAgentName} Dashboard`}
        actions={
          <Button asChild size="lg" className="shadow-md">
            <Link to="/transaction/new">
              <Ticket className="w-5 h-5 mr-2" />
              New Transaction
            </Link>
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Today's Transactions"
          value={todayTransactions.length}
          subtitle={`${todayTransactions.filter(t => t.status === 'success').length} successful`}
          icon={Ticket}
          variant="primary"
        />
        <StatCard
          title="Total Cashback Given"
          value={formatCurrency(totalCashback)}
          icon={Gift}
          variant="success"
        />
        <StatCard
          title="Total Ticket Sales"
          value={formatCurrency(totalSales)}
          icon={TrendingUp}
          variant="info"
        />
        <StatCard
          title={isAdmin ? 'Active Travel Agents' : 'Active Promos'}
          value={isAdmin ? travelAgents.filter(t => t.isActive).length : activePromos.length}
          icon={isAdmin ? Users : Gift}
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Active Promos */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-display">Active Promos</CardTitle>
              <CardDescription>Available promotions for booking</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/transaction/new">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {activePromos.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No active promos</p>
            ) : (
              activePromos.slice(0, 3).map((promo) => (
                <div
                  key={promo.id}
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground truncate">{promo.name}</h4>
                        <Badge variant={promo.type === 'guaranteed_code' ? 'default' : 'secondary'}>
                          {promo.type === 'guaranteed_code' ? 'VIP' : 'Public'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{promo.description}</p>
                    </div>
                    <QuotaBadge used={promo.quotaUsed} total={promo.quotaTotal} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-display">Recent Transactions</CardTitle>
              <CardDescription>Latest booking records</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/transactions">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.status === 'success' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {transaction.status === 'success' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{transaction.customerName}</p>
                      <p className="text-xs text-muted-foreground">{transaction.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(transaction.ticketAmount)}</p>
                      <p className="text-xs text-success">+{formatCurrency(transaction.cashbackAmount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
