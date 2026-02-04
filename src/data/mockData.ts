import { User, TravelAgent, Event, Promo, Transaction } from '@/types';

// Mock Travel Agents
export const mockTravelAgents: TravelAgent[] = [
  {
    id: 'ta-001',
    name: 'Bahagia Tour',
    quotaAllocated: 50,
    quotaUsed: 12,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ta-002',
    name: 'Sejahtera Travel',
    quotaAllocated: 40,
    quotaUsed: 8,
    isActive: true,
    createdAt: '2024-01-05T00:00:00Z',
  },
  {
    id: 'ta-003',
    name: 'Sakinah Wisata',
    quotaAllocated: 60,
    quotaUsed: 25,
    isActive: true,
    createdAt: '2024-01-10T00:00:00Z',
  },
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-001',
    email: 'admin@travelfair.com',
    name: 'System Administrator',
    role: 'administrator',
    travelAgentId: null,
    travelAgentName: null,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-002',
    email: 'manager@bahagia.com',
    name: 'Budi Santoso',
    role: 'travel_agent_admin',
    travelAgentId: 'ta-001',
    travelAgentName: 'Bahagia Tour',
    isActive: true,
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'user-003',
    email: 'sales@bahagia.com',
    name: 'Dewi Lestari',
    role: 'travel_agent_user',
    travelAgentId: 'ta-001',
    travelAgentName: 'Bahagia Tour',
    isActive: true,
    createdAt: '2024-01-03T00:00:00Z',
  },
  {
    id: 'user-004',
    email: 'manager@sejahtera.com',
    name: 'Ahmad Wijaya',
    role: 'travel_agent_admin',
    travelAgentId: 'ta-002',
    travelAgentName: 'Sejahtera Travel',
    isActive: true,
    createdAt: '2024-01-04T00:00:00Z',
  },
  {
    id: 'user-005',
    email: 'sales@sejahtera.com',
    name: 'Siti Rahayu',
    role: 'travel_agent_user',
    travelAgentId: 'ta-002',
    travelAgentName: 'Sejahtera Travel',
    isActive: true,
    createdAt: '2024-01-05T00:00:00Z',
  },
];

// Mock Events
export const mockEvents: Event[] = [
  {
    id: 'event-001',
    name: 'Jakarta Travel Fair 2024',
    description: 'The biggest travel fair in Jakarta featuring exclusive promos and cashback offers.',
    location: 'JCC Senayan, Jakarta',
    startDate: '2024-03-01',
    endDate: '2024-03-10',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'event-002',
    name: 'Surabaya Holiday Expo',
    description: 'Annual holiday expo with special deals for domestic and international destinations.',
    location: 'Grand City Convex, Surabaya',
    startDate: '2024-04-15',
    endDate: '2024-04-20',
    isActive: false,
    createdAt: '2024-01-15T00:00:00Z',
  },
];

// Mock Guaranteed Codes with date ranges
export interface MockGuaranteedCode {
  id: string;
  code: string;
  promoId: string;
  validFrom: string;
  validTo: string;
  isUsed: boolean;
  usedBy: string | null;
  usedAt: string | null;
  createdAt: string;
}

export const mockGuaranteedCodesData: MockGuaranteedCode[] = [
  { id: 'gc-001', code: 'VIP2024-001', promoId: 'promo-001', validFrom: '2024-03-01', validTo: '2024-03-10', isUsed: true, usedBy: 'Jane Smith', usedAt: '2024-03-01T11:45:00Z', createdAt: '2024-02-01T00:00:00Z' },
  { id: 'gc-002', code: 'VIP2024-002', promoId: 'promo-001', validFrom: '2024-03-01', validTo: '2024-03-10', isUsed: false, usedBy: null, usedAt: null, createdAt: '2024-02-01T00:00:00Z' },
  { id: 'gc-003', code: 'VIP2024-003', promoId: 'promo-001', validFrom: '2024-03-01', validTo: '2024-03-10', isUsed: false, usedBy: null, usedAt: null, createdAt: '2024-02-01T00:00:00Z' },
  { id: 'gc-004', code: 'VIP2024-004', promoId: 'promo-001', validFrom: '2024-03-01', validTo: '2024-03-10', isUsed: false, usedBy: null, usedAt: null, createdAt: '2024-02-01T00:00:00Z' },
  { id: 'gc-005', code: 'VIP2024-005', promoId: 'promo-001', validFrom: '2024-03-01', validTo: '2024-03-10', isUsed: false, usedBy: null, usedAt: null, createdAt: '2024-02-01T00:00:00Z' },
  { id: 'gc-006', code: 'VIP2024-006', promoId: 'promo-001', validFrom: '2024-03-05', validTo: '2024-03-08', isUsed: false, usedBy: null, usedAt: null, createdAt: '2024-02-01T00:00:00Z' },
  { id: 'gc-007', code: 'VIP2024-007', promoId: 'promo-001', validFrom: '2024-03-05', validTo: '2024-03-08', isUsed: false, usedBy: null, usedAt: null, createdAt: '2024-02-01T00:00:00Z' },
  { id: 'gc-008', code: 'VIP2024-008', promoId: 'promo-001', validFrom: '2024-03-01', validTo: '2024-03-03', isUsed: false, usedBy: null, usedAt: null, createdAt: '2024-02-01T00:00:00Z' },
  { id: 'gc-009', code: 'VIP2024-009', promoId: 'promo-001', validFrom: '2024-03-01', validTo: '2024-03-03', isUsed: false, usedBy: null, usedAt: null, createdAt: '2024-02-01T00:00:00Z' },
  { id: 'gc-010', code: 'VIP2024-010', promoId: 'promo-001', validFrom: '2024-03-01', validTo: '2024-03-10', isUsed: false, usedBy: null, usedAt: null, createdAt: '2024-02-01T00:00:00Z' },
];

// Mock Promos
export const mockPromos: Promo[] = [
  {
    id: 'promo-001',
    eventId: 'event-001',
    name: 'VIP Guaranteed Cashback',
    type: 'guaranteed_code',
    description: 'Exclusive cashback for VIP customers with guaranteed codes. Limited slots available.',
    quotaTotal: 100,
    quotaUsed: 35,
    quotaPerAgent: 20,
    cashbackRules: [
      { minAmount: 5000000, cashbackAmount: 1500000 },
      { minAmount: 10000000, cashbackAmount: 3000000 },
    ],
    validFrom: '2024-03-01',
    validTo: '2024-03-10',
    isActive: true,
  },
  {
    id: 'promo-002',
    eventId: 'event-001',
    name: 'Public Mega Cashback',
    type: 'regular',
    description: 'Open for all customers! Get amazing cashback based on your ticket purchase amount.',
    quotaTotal: 500,
    quotaUsed: 180,
    quotaPerAgent: null, // Global quota
    cashbackRules: [
      { minAmount: 3500000, cashbackAmount: 250000 },
      { minAmount: 5000000, cashbackAmount: 1000000 },
      { minAmount: 7000000, cashbackAmount: 2500000 },
    ],
    validFrom: '2024-03-01',
    validTo: '2024-03-10',
    isActive: true,
  },
  {
    id: 'promo-003',
    eventId: 'event-001',
    name: 'Weekend Flash Deal',
    type: 'regular',
    description: 'Special weekend promo with enhanced cashback rates!',
    quotaTotal: 200,
    quotaUsed: 190,
    quotaPerAgent: null,
    cashbackRules: [
      { minAmount: 4000000, cashbackAmount: 500000 },
      { minAmount: 6000000, cashbackAmount: 1500000 },
    ],
    validFrom: '2024-03-02',
    validTo: '2024-03-03',
    isActive: true,
  },
];

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'TRX-001',
    bookingDateTime: '2024-03-01T10:30:00Z',
    travelAgentId: 'ta-001',
    travelAgentName: 'Bahagia Tour',
    userId: 'user-003',
    userName: 'Dewi Lestari',
    customerName: 'John Doe',
    customerPhone: '081234567890',
    customerEmail: 'john@email.com',
    ticketAmount: 7500000,
    promoId: 'promo-002',
    promoName: 'Public Mega Cashback',
    promoType: 'regular',
    guaranteedCode: null,
    cashbackAmount: 2500000,
    status: 'success',
    notes: '',
    createdBy: 'user-003',
    createdAt: '2024-03-01T10:30:00Z',
  },
  {
    id: 'TRX-002',
    bookingDateTime: '2024-03-01T11:45:00Z',
    travelAgentId: 'ta-001',
    travelAgentName: 'Bahagia Tour',
    userId: 'user-003',
    userName: 'Dewi Lestari',
    customerName: 'Jane Smith',
    customerPhone: '081234567891',
    customerEmail: 'jane@email.com',
    ticketAmount: 12000000,
    promoId: 'promo-001',
    promoName: 'VIP Guaranteed Cashback',
    promoType: 'guaranteed_code',
    guaranteedCode: 'VIP2024-001',
    cashbackAmount: 3000000,
    status: 'success',
    notes: 'Corporate booking',
    createdBy: 'user-003',
    createdAt: '2024-03-01T11:45:00Z',
  },
  {
    id: 'TRX-003',
    bookingDateTime: '2024-03-01T14:20:00Z',
    travelAgentId: 'ta-002',
    travelAgentName: 'Sejahtera Travel',
    userId: 'user-005',
    userName: 'Siti Rahayu',
    customerName: 'Ahmad Hidayat',
    customerPhone: '081234567892',
    customerEmail: 'ahmad@email.com',
    ticketAmount: 5500000,
    promoId: 'promo-002',
    promoName: 'Public Mega Cashback',
    promoType: 'regular',
    guaranteedCode: null,
    cashbackAmount: 1000000,
    status: 'success',
    notes: '',
    createdBy: 'user-005',
    createdAt: '2024-03-01T14:20:00Z',
  },
  {
    id: 'TRX-004',
    bookingDateTime: '2024-03-02T09:15:00Z',
    travelAgentId: 'ta-001',
    travelAgentName: 'Bahagia Tour',
    userId: 'user-003',
    userName: 'Dewi Lestari',
    customerName: 'Maria Santos',
    customerPhone: '081234567893',
    customerEmail: 'maria@email.com',
    ticketAmount: 4000000,
    promoId: 'promo-002',
    promoName: 'Public Mega Cashback',
    promoType: 'regular',
    guaranteedCode: null,
    cashbackAmount: 250000,
    status: 'cancelled',
    notes: 'Customer cancelled',
    createdBy: 'user-003',
    createdAt: '2024-03-02T09:15:00Z',
  },
];

// Credential map for mock login
export const mockCredentials: Record<string, { password: string; userId: string }> = {
  'admin@travelfair.com': { password: 'admin123', userId: 'user-001' },
  'manager@bahagia.com': { password: 'manager123', userId: 'user-002' },
  'sales@bahagia.com': { password: 'sales123', userId: 'user-003' },
  'manager@sejahtera.com': { password: 'manager123', userId: 'user-004' },
  'sales@sejahtera.com': { password: 'sales123', userId: 'user-005' },
};

// Guaranteed codes for simple validation (backwards compatibility)
export const mockGuaranteedCodes: string[] = mockGuaranteedCodesData.map(c => c.code);
