import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bell, Users, Package, TrendingUp, Clock, Plus, Send, FileText, UserPlus, CreditCard, Star, MessageSquare } from 'lucide-react';
import { PanelLayout } from '@/components/layout/Navigation';
import { Header } from '@/components/layout/Header';
import { StatCard, QuickAction, ActivityItem } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// Mock data
const mockNotifications = [
  { id: 1, type: 'customer', icon: 'UserPlus', title: 'New Customer Registration', message: 'Rahul Kumar ने registration किया', time: '2 mins ago', read: false },
  { id: 2, type: 'payment', icon: 'CreditCard', title: 'Payment Received', message: '₹500 received from Priya Singh', time: '15 mins ago', read: false },
  { id: 3, type: 'request', icon: 'Package', title: 'New Service Request', message: 'Automation request from Amit', time: '1 hour ago', read: false },
  { id: 4, type: 'message', icon: 'MessageSquare', title: 'New Message', message: 'Message from Rahul Kumar', time: '2 hours ago', read: true },
  { id: 5, type: 'rating', icon: 'Star', title: 'New Rating', message: '5-star rating from Priya Singh', time: '1 day ago', read: true }
];

const mockActivities = [
  { icon: 'UserPlus', iconColor: 'success', title: 'Rahul Kumar registered', timestamp: Date.now() - 120000 },
  { icon: 'CreditCard', iconColor: 'primary', title: '₹500 received from Priya Singh', timestamp: Date.now() - 900000 },
  { icon: 'CheckCircle', iconColor: 'success', title: 'Website project completed', timestamp: Date.now() - 3600000 },
  { icon: 'Phone', iconColor: 'secondary', title: 'Call request from Amit', timestamp: Date.now() - 7200000 }
];

const OwnerDashboardPage = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [stats, setStats] = useState({
    totalCustomers: 25,
    activeServices: 18,
    monthlyRevenue: 12500,
    pendingRequests: 3,
    todayLeads: 5,
    todayCalls: 12,
    todayMessages: 8,
    todayPayments: 2000
  });
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
  
  const quickActions = [
    { icon: 'UserPlus', label: 'Add Customer', onClick: () => navigate('/owner/customers') },
    { icon: 'Send', label: 'Broadcast', onClick: () => {} },
    { icon: 'FileText', label: 'Report', onClick: () => navigate('/owner/business') },
    { icon: 'Settings', label: 'Settings', onClick: () => navigate('/owner/control') }
  ];
  
  return (
    <PanelLayout panel="owner">
      <Header 
        title={`Welcome, Boss! 👑`}
        showThemeToggle
        rightContent={
          <Sheet open={showNotifications} onOpenChange={setShowNotifications}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" data-testid="owner-notifications-btn">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-medium rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <SheetTitle>Notifications</SheetTitle>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllRead}>
                      Mark All Read
                    </Button>
                  )}
                </div>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {notifications.map((notif) => {
                  const Icon = { UserPlus, CreditCard, Package, MessageSquare, Star }[notif.icon] || Bell;
                  return (
                    <div 
                      key={notif.id}
                      className={cn(
                        'p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors',
                        !notif.read && 'bg-primary/5 border-primary/20'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                          notif.type === 'customer' && 'bg-green-100 text-green-600',
                          notif.type === 'payment' && 'bg-blue-100 text-blue-600',
                          notif.type === 'request' && 'bg-purple-100 text-purple-600',
                          notif.type === 'message' && 'bg-orange-100 text-orange-600',
                          notif.type === 'rating' && 'bg-yellow-100 text-yellow-600'
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{notif.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        }
      />
      
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        {/* Key Business Metrics */}
        <section>
          <h3 className="font-semibold mb-3">Business Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Customers"
              titleHi="कुल कस्टमर"
              value={stats.totalCustomers}
              icon="Users"
              color="primary"
              onClick={() => navigate('/owner/customers')}
            />
            <StatCard
              title="Active Services"
              titleHi="एक्टिव सर्विस"
              value={stats.activeServices}
              icon="Package"
              color="success"
              onClick={() => navigate('/owner/business')}
            />
            <StatCard
              title="Monthly Revenue"
              titleHi="मासिक आय"
              value={`₹${stats.monthlyRevenue.toLocaleString()}`}
              icon="TrendingUp"
              color="secondary"
              trend="up"
              trendValue="+15%"
            />
            <StatCard
              title="Pending Requests"
              titleHi="पेंडिंग रिक्वेस्ट"
              value={stats.pendingRequests}
              icon="Clock"
              color="warning"
              onClick={() => navigate('/owner/business')}
            />
          </div>
        </section>
        
        {/* Today's Activity */}
        <section>
          <h3 className="font-semibold mb-3">Today's Activity</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="New Leads"
              value={stats.todayLeads}
              icon="UserPlus"
              color="success"
            />
            <StatCard
              title="AI Calls"
              value={stats.todayCalls}
              icon="Phone"
              color="primary"
            />
            <StatCard
              title="Messages"
              value={stats.todayMessages}
              icon="MessageSquare"
              color="secondary"
            />
            <StatCard
              title="Payments"
              value={`₹${stats.todayPayments.toLocaleString()}`}
              icon="CreditCard"
              color="success"
            />
          </div>
        </section>
        
        {/* Quick Actions */}
        <section>
          <h3 className="font-semibold mb-3">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <QuickAction key={action.label} {...action} />
            ))}
          </div>
        </section>
        
        {/* Recent Activity */}
        <section>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {mockActivities.map((activity, i) => (
                  <ActivityItem 
                    key={i} 
                    {...activity}
                  />
                ))}
              </div>
              <Button 
                variant="ghost" 
                className="w-full mt-2"
              >
                View All Activities →
              </Button>
            </CardContent>
          </Card>
        </section>
        
        {/* Revenue Chart Placeholder */}
        <section>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Revenue (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center bg-muted/50 rounded-lg">
                <p className="text-muted-foreground text-sm">Revenue Chart Coming Soon</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PanelLayout>
  );
};

export default OwnerDashboardPage;
