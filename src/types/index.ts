// User & Auth Types
export type UserRole = 'administrator' | 'travel_agent_admin' | 'travel_agent_user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  travelAgentId: string | null;
  travelAgentName: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface TravelAgent {
  id: string;
  name: string;
  quotaAllocated: number;
  quotaUsed: number;
  isActive: boolean;
  createdAt: string;
}

// Event & Promo Types
export interface Event {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export type PromoType = 'guaranteed_code' | 'regular';

export interface CashbackRule {
  minAmount: number;
  cashbackAmount: number;
}

export interface Promo {
  id: string;
  eventId: string;
  name: string;
  type: PromoType;
  description: string;
  quotaTotal: number;
  quotaUsed: number;
  quotaPerAgent: number | null; // null means shared globally
  cashbackRules: CashbackRule[];
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

// Transaction Types
export type TransactionStatus = 'success' | 'cancelled';

export interface Transaction {
  id: string;
  bookingDateTime: string;
  travelAgentId: string;
  travelAgentName: string;
  userId: string;
  userName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  ticketAmount: number;
  promoId: string;
  promoName: string;
  promoType: PromoType;
  guaranteedCode: string | null;
  cashbackAmount: number;
  status: TransactionStatus;
  notes: string;
  createdBy: string;
  createdAt: string;
}

// Auth Context
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isTravelAgentAdmin: boolean;
  isTravelAgentUser: boolean;
}

// Dashboard Stats
export interface DashboardStats {
  totalTransactions: number;
  totalCashbackGiven: number;
  totalTicketSales: number;
  quotaUsagePercent: number;
}
