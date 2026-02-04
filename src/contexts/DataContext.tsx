import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { TravelAgent, Event, Promo, Transaction, User, GuaranteedCode } from '@/types';
import { 
  mockTravelAgents, 
  mockEvents, 
  mockPromos, 
  mockTransactions, 
  mockUsers,
  mockGuaranteedCodesData 
} from '@/data/mockData';

interface DataContextType {
  // Data
  travelAgents: TravelAgent[];
  events: Event[];
  promos: Promo[];
  transactions: Transaction[];
  users: User[];
  guaranteedCodes: GuaranteedCode[];
  
  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  cancelTransaction: (id: string) => void;
  
  // Promo actions
  getPromoById: (id: string) => Promo | undefined;
  updatePromoQuota: (promoId: string, increment: number) => void;
  
  // User actions
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  
  // Promo management
  addPromo: (promo: Omit<Promo, 'id'>) => Promo;
  updatePromo: (id: string, updates: Partial<Promo>) => void;
  
  // Event management
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => Event;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  
  // Travel Agent management
  addTravelAgent: (agent: Omit<TravelAgent, 'id' | 'createdAt' | 'quotaUsed'>) => TravelAgent;
  updateTravelAgent: (id: string, updates: Partial<TravelAgent>) => void;
  
  // Guaranteed Code management
  addGuaranteedCode: (code: Omit<GuaranteedCode, 'id' | 'createdAt' | 'isUsed' | 'usedBy' | 'usedAt'>) => GuaranteedCode;
  updateGuaranteedCode: (id: string, updates: Partial<GuaranteedCode>) => void;
  deleteGuaranteedCode: (id: string) => void;
  
  // Utility
  calculateCashback: (amount: number, promo: Promo) => number;
  validateGuaranteedCode: (code: string) => boolean;
  getRemainingQuota: (promo: Promo, travelAgentId?: string) => number;
  
  // Filtering
  getTransactionsByAgent: (agentId: string) => Transaction[];
  getTransactionsByPromo: (promoId: string) => Transaction[];
  getUsersByAgent: (agentId: string) => User[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'travel_fair_data';

interface StoredData {
  transactions: Transaction[];
  users: User[];
  promos: Promo[];
  travelAgents: TravelAgent[];
  events: Event[];
  guaranteedCodes: GuaranteedCode[];
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [travelAgents, setTravelAgents] = useState<TravelAgent[]>(mockTravelAgents);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [promos, setPromos] = useState<Promo[]>(mockPromos);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [guaranteedCodes, setGuaranteedCodes] = useState<GuaranteedCode[]>(mockGuaranteedCodesData);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: StoredData = JSON.parse(stored);
        if (data.transactions) setTransactions(data.transactions);
        if (data.users) setUsers(data.users);
        if (data.promos) setPromos(data.promos);
        if (data.travelAgents) setTravelAgents(data.travelAgents);
        if (data.events) setEvents(data.events);
        if (data.guaranteedCodes) setGuaranteedCodes(data.guaranteedCodes);
      } catch {
        // Use default data on error
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const data: StoredData = { transactions, users, promos, travelAgents, events, guaranteedCodes };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [transactions, users, promos, travelAgents, events, guaranteedCodes]);

  const generateId = (prefix: string) => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const calculateCashback = useCallback((amount: number, promo: Promo): number => {
    const sortedRules = [...promo.cashbackRules].sort((a, b) => b.minAmount - a.minAmount);
    for (const rule of sortedRules) {
      if (amount >= rule.minAmount) {
        return rule.cashbackAmount;
      }
    }
    return 0;
  }, []);

  const validateGuaranteedCode = useCallback((code: string): boolean => {
    const foundCode = guaranteedCodes.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (!foundCode) return false;
    if (foundCode.isUsed) return false;
    const now = new Date();
    const validFrom = new Date(foundCode.validFrom);
    const validTo = new Date(foundCode.validTo);
    return now >= validFrom && now <= validTo;
  }, [guaranteedCodes]);

  const getRemainingQuota = useCallback((promo: Promo, travelAgentId?: string): number => {
    if (promo.quotaPerAgent && travelAgentId) {
      // Per-agent quota
      const agentTransactions = transactions.filter(
        t => t.promoId === promo.id && t.travelAgentId === travelAgentId && t.status === 'success'
      );
      return promo.quotaPerAgent - agentTransactions.length;
    }
    // Global quota
    return promo.quotaTotal - promo.quotaUsed;
  }, [transactions]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `TRX-${String(transactions.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update promo quota
    if (transaction.status === 'success') {
      setPromos(prev => prev.map(p => 
        p.id === transaction.promoId 
          ? { ...p, quotaUsed: p.quotaUsed + 1 }
          : p
      ));
      
      // Mark guaranteed code as used
      if (transaction.guaranteedCode) {
        setGuaranteedCodes(prev => prev.map(c =>
          c.code.toUpperCase() === transaction.guaranteedCode?.toUpperCase()
            ? { ...c, isUsed: true, usedBy: transaction.customerName, usedAt: new Date().toISOString() }
            : c
        ));
      }
    }
    
    return newTransaction;
  }, [transactions.length]);

  const cancelTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id && t.status === 'success') {
        // Restore quota
        setPromos(promos => promos.map(p => 
          p.id === t.promoId 
            ? { ...p, quotaUsed: Math.max(0, p.quotaUsed - 1) }
            : p
        ));
        return { ...t, status: 'cancelled' as const };
      }
      return t;
    }));
  }, []);

  const getPromoById = useCallback((id: string) => {
    return promos.find(p => p.id === id);
  }, [promos]);

  const updatePromoQuota = useCallback((promoId: string, increment: number) => {
    setPromos(prev => prev.map(p => 
      p.id === promoId 
        ? { ...p, quotaUsed: Math.max(0, p.quotaUsed + increment) }
        : p
    ));
  }, []);

  const addUser = useCallback((user: Omit<User, 'id' | 'createdAt'>): User => {
    const newUser: User = {
      ...user,
      id: generateId('user'),
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => 
      u.id === id ? { ...u, ...updates } : u
    ));
  }, []);

  const addPromo = useCallback((promo: Omit<Promo, 'id'>): Promo => {
    const newPromo: Promo = {
      ...promo,
      id: generateId('promo'),
    };
    setPromos(prev => [...prev, newPromo]);
    return newPromo;
  }, []);

  const updatePromo = useCallback((id: string, updates: Partial<Promo>) => {
    setPromos(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  }, []);

  // Event management
  const addEvent = useCallback((event: Omit<Event, 'id' | 'createdAt'>): Event => {
    const newEvent: Event = {
      ...event,
      id: generateId('event'),
      createdAt: new Date().toISOString(),
    };
    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<Event>) => {
    setEvents(prev => prev.map(e => 
      e.id === id ? { ...e, ...updates } : e
    ));
  }, []);

  // Travel Agent management
  const addTravelAgent = useCallback((agent: Omit<TravelAgent, 'id' | 'createdAt' | 'quotaUsed'>): TravelAgent => {
    const newAgent: TravelAgent = {
      ...agent,
      id: generateId('ta'),
      quotaUsed: 0,
      createdAt: new Date().toISOString(),
    };
    setTravelAgents(prev => [...prev, newAgent]);
    return newAgent;
  }, []);

  const updateTravelAgent = useCallback((id: string, updates: Partial<TravelAgent>) => {
    setTravelAgents(prev => prev.map(a => 
      a.id === id ? { ...a, ...updates } : a
    ));
  }, []);

  // Guaranteed Code management
  const addGuaranteedCode = useCallback((code: Omit<GuaranteedCode, 'id' | 'createdAt' | 'isUsed' | 'usedBy' | 'usedAt'>): GuaranteedCode => {
    const newCode: GuaranteedCode = {
      ...code,
      id: generateId('gc'),
      isUsed: false,
      usedBy: null,
      usedAt: null,
      createdAt: new Date().toISOString(),
    };
    setGuaranteedCodes(prev => [...prev, newCode]);
    return newCode;
  }, []);

  const updateGuaranteedCode = useCallback((id: string, updates: Partial<GuaranteedCode>) => {
    setGuaranteedCodes(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  }, []);

  const deleteGuaranteedCode = useCallback((id: string) => {
    setGuaranteedCodes(prev => prev.filter(c => c.id !== id));
  }, []);

  const getTransactionsByAgent = useCallback((agentId: string) => {
    return transactions.filter(t => t.travelAgentId === agentId);
  }, [transactions]);

  const getTransactionsByPromo = useCallback((promoId: string) => {
    return transactions.filter(t => t.promoId === promoId);
  }, [transactions]);

  const getUsersByAgent = useCallback((agentId: string) => {
    return users.filter(u => u.travelAgentId === agentId);
  }, [users]);

  const value: DataContextType = {
    travelAgents,
    events,
    promos,
    transactions,
    users,
    guaranteedCodes,
    addTransaction,
    cancelTransaction,
    getPromoById,
    updatePromoQuota,
    addUser,
    updateUser,
    addPromo,
    updatePromo,
    addEvent,
    updateEvent,
    addTravelAgent,
    updateTravelAgent,
    addGuaranteedCode,
    updateGuaranteedCode,
    deleteGuaranteedCode,
    calculateCashback,
    validateGuaranteedCode,
    getRemainingQuota,
    getTransactionsByAgent,
    getTransactionsByPromo,
    getUsersByAgent,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
