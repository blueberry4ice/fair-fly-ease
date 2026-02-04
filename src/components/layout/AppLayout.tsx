import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Ticket,
  History,
  Users,
  Gift,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Plane,
  ChevronRight,
  Calendar,
  Key,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'New Transaction', href: '/transaction/new', icon: Ticket },
  { label: 'Transaction History', href: '/transactions', icon: History },
  { label: 'Users', href: '/admin/users', icon: Users, roles: ['administrator', 'travel_agent_admin'] },
  { label: 'Travel Agents', href: '/admin/travel-agents', icon: Plane, roles: ['administrator'] },
  { label: 'Events', href: '/admin/events', icon: Calendar, roles: ['administrator'] },
  { label: 'Promos', href: '/admin/promos', icon: Gift, roles: ['administrator'] },
  { label: 'Guaranteed Codes', href: '/admin/codes', icon: Key, roles: ['administrator'] },
  { label: 'Monitoring', href: '/admin/monitoring', icon: BarChart3, roles: ['administrator'] },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout, isAdmin, isTravelAgentAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    if (isAdmin) return true;
    if (isTravelAgentAdmin && item.roles.includes('travel_agent_admin')) return true;
    return false;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Plane className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-lg">TravelFair POS</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="touch-target"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
                <Plane className="w-6 h-6 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-sidebar-foreground">TravelFair</h1>
                <p className="text-xs text-sidebar-foreground/60">Point of Sales</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 touch-target",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="p-4 rounded-lg bg-sidebar-accent">
              <p className="font-medium text-sm text-sidebar-accent-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate mt-0.5">
                {user?.travelAgentName || 'Administrator'}
              </p>
              <p className="text-xs text-sidebar-primary mt-1 capitalize">
                {user?.role.replace(/_/g, ' ')}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full mt-3 justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
