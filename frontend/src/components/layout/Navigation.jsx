import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Mic, Package, Phone, Home, MessageSquare, CreditCard, User, LayoutDashboard, Users, Briefcase, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

// Public Panel Navigation Items
const publicNavItems = [
  { path: '/public/ai-employee', icon: Mic, label: 'AI Employee', labelHi: 'AI एम्पलाई' },
  { path: '/public/services', icon: Package, label: 'Services', labelHi: 'सर्विस' },
  { path: '/public/contact', icon: Phone, label: 'Contact', labelHi: 'संपर्क' }
];

// Customer Panel Navigation Items
const customerNavItems = [
  { path: '/customer/home', icon: Home, label: 'Home', labelHi: 'होम' },
  { path: '/customer/services', icon: Package, label: 'Services', labelHi: 'सर्विस' },
  { path: '/customer/chat', icon: MessageSquare, label: 'Chat', labelHi: 'चैट' },
  { path: '/customer/payments', icon: CreditCard, label: 'Payments', labelHi: 'पेमेंट' },
  { path: '/customer/profile', icon: User, label: 'Profile', labelHi: 'प्रोफाइल' }
];

// Owner Panel Navigation Items
const ownerNavItems = [
  { path: '/owner/dashboard', icon: LayoutDashboard, label: 'Dashboard', labelHi: 'डैशबोर्ड' },
  { path: '/owner/customers', icon: Users, label: 'Customers', labelHi: 'कस्टमर' },
  { path: '/owner/chat', icon: MessageSquare, label: 'Chat', labelHi: 'चैट' },
  { path: '/owner/business', icon: Briefcase, label: 'Business', labelHi: 'बिज़नेस' },
  { path: '/owner/control', icon: Settings, label: 'Control', labelHi: 'कंट्रोल' }
];

const NavItem = ({ item, variant = 'bottom' }) => {
  const Icon = item.icon;
  
  return (
    <NavLink
      to={item.path}
      data-testid={`nav-${item.label.toLowerCase()}`}
      className={({ isActive }) => cn(
        'flex items-center gap-3 transition-all duration-200',
        variant === 'bottom' ? 'flex-col justify-center p-2 min-w-[64px]' : 'px-4 py-3 rounded-xl w-full',
        isActive 
          ? 'text-primary' 
          : 'text-muted-foreground hover:text-foreground',
        variant === 'sidebar' && isActive && 'bg-primary/10'
      )}
    >
      <Icon className={cn('w-5 h-5', variant === 'bottom' ? 'w-5 h-5' : 'w-5 h-5')} />
      <span className={cn(
        'font-medium',
        variant === 'bottom' ? 'text-xs' : 'text-sm'
      )}>
        {item.label}
      </span>
    </NavLink>
  );
};

// Bottom Navigation for Mobile
export const BottomNav = ({ panel = 'public' }) => {
  const items = panel === 'public' ? publicNavItems : 
                panel === 'customer' ? customerNavItems : 
                ownerNavItems;
  
  return (
    <nav 
      data-testid="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass border-t border-border"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {items.map((item) => (
          <NavItem key={item.path} item={item} variant="bottom" />
        ))}
      </div>
      {/* Safe area for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};

// Sidebar Navigation for Desktop
export const Sidebar = ({ panel = 'public' }) => {
  const { userData, isOwner } = useAuth();
  const items = panel === 'public' ? publicNavItems : 
                panel === 'customer' ? customerNavItems : 
                ownerNavItems;
  
  return (
    <aside 
      data-testid="sidebar"
      className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-card border-r border-border p-6 z-40"
    >
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-xl font-bold font-[Outfit]">
          <span className="text-primary">AI</span>
          <span className="text-secondary">-Human</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {panel === 'public' ? 'Service Platform' : 
           panel === 'customer' ? 'Customer Panel' : 'Owner Panel'}
        </p>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {items.map((item) => (
          <NavItem key={item.path} item={item} variant="sidebar" />
        ))}
      </nav>
      
      {/* User Info for authenticated panels */}
      {userData && panel !== 'public' && (
        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <img 
              src={userData.photoURL || '/default-avatar.png'} 
              alt={userData.displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userData.displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{userData.email}</p>
            </div>
          </div>
          
          {/* Owner Switch Button */}
          {isOwner && panel === 'customer' && (
            <NavLink 
              to="/owner/dashboard"
              data-testid="switch-to-owner"
              className="mt-3 flex items-center justify-center gap-2 w-full py-2 px-4 bg-secondary/10 text-secondary rounded-lg text-sm font-medium hover:bg-secondary/20 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Owner Panel
            </NavLink>
          )}
          
          {panel === 'owner' && (
            <NavLink 
              to="/customer/home"
              data-testid="switch-to-customer"
              className="mt-3 flex items-center justify-center gap-2 w-full py-2 px-4 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              <User className="w-4 h-4" />
              Customer Panel
            </NavLink>
          )}
        </div>
      )}
    </aside>
  );
};

// Layout Wrapper
export const PanelLayout = ({ panel = 'public', children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar panel={panel} />
      <main className="lg:pl-64 pb-20 lg:pb-0">
        {children}
      </main>
      <BottomNav panel={panel} />
    </div>
  );
};
