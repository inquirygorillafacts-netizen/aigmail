import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus, MessageSquare, BarChart3, Calendar, Crown, Trash2, Check, X } from 'lucide-react';
import { PanelLayout } from '@/components/layout/Navigation';
import { Header } from '@/components/layout/Header';
import { StatCard, QuickAction, ActivityItem } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { db, collection, query, where, onSnapshot, orderBy, limit } from '@/lib/firebase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CustomerHomePage = () => {
  const navigate = useNavigate();
  const { userData, isOwner, ownerExists, claimOwner } = useAuth();
  const [stats, setStats] = useState({
    activeServices: 0,
    totalPaid: 0,
    pendingPayment: 0,
    advanceGiven: 0
  });
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotifs, setSelectedNotifs] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  
  // Mock data for demo
  useEffect(() => {
    // In production, this would fetch from Firestore
    setStats({
      activeServices: 3,
      totalPaid: 1500,
      pendingPayment: 500,
      advanceGiven: 200
    });
    
    setActivities([
      { icon: 'Globe', iconColor: 'primary', title: 'Website project शुरू हुआ', timestamp: Date.now() - 172800000, action: 'View' },
      { icon: 'CreditCard', iconColor: 'success', title: '₹500 payment successful', timestamp: Date.now() - 432000000 },
      { icon: 'MessageSquare', iconColor: 'secondary', title: 'Owner ने message भेजा', timestamp: Date.now() - 604800000, action: 'Reply' }
    ]);
    
    setNotifications([
      { id: 1, title: 'Service Update', message: 'Your website is 60% complete', time: '2 hours ago', read: false },
      { id: 2, title: 'Payment Reminder', message: 'Pending payment of ₹500', time: '1 day ago', read: false },
      { id: 3, title: 'New Message', message: 'Owner sent you a message', time: '2 days ago', read: true }
    ]);
  }, [userData]);
  
  // Mark notification as read when opened
  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  
  // Delete single notification
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification deleted');
  };
  
  // Delete selected notifications
  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedNotifs.includes(n.id)));
    setSelectedNotifs([]);
    setSelectMode(false);
    toast.success(`${selectedNotifs.length} notifications deleted`);
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setSelectedNotifs([]);
    setSelectMode(false);
    toast.success('All notifications cleared');
  };
  
  // Toggle notification selection
  const toggleSelect = (id) => {
    setSelectedNotifs(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  const handleClaimOwner = async () => {
    const success = await claimOwner();
    if (success) {
      toast.success('🎉 Congratulations! आप अब Owner हैं!');
    } else {
      toast.error('Owner claim नहीं हो पाया। कोई Owner पहले से exist करता है।');
    }
  };
  
  const quickActions = [
    { icon: 'Plus', label: 'New Service', labelHi: 'नई सर्विस', onClick: () => navigate('/customer/services') },
    { icon: 'MessageSquare', label: 'Chat', labelHi: 'चैट', onClick: () => navigate('/customer/chat') },
    { icon: 'BarChart3', label: 'All Services', labelHi: 'सभी सर्विस', onClick: () => navigate('/customer/services') },
    { icon: 'Calendar', label: 'Schedule', labelHi: 'शेड्यूल', onClick: () => toast.info('Coming soon!') }
  ];
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <PanelLayout panel="customer">
      <Header 
        title={`Hi, ${userData?.displayName?.split(' ')[0] || 'User'}! 👋`}
        showThemeToggle
        rightContent={
          <Sheet open={showNotifications} onOpenChange={(open) => {
            setShowNotifications(open);
            if (open) {
              // Mark all as read when opening
              setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            }
            if (!open) {
              setSelectMode(false);
              setSelectedNotifs([]);
            }
          }}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" data-testid="notifications-btn">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-medium rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
              <SheetHeader className="shrink-0">
                <SheetTitle className="flex items-center justify-between">
                  <span>Notifications ({notifications.length})</span>
                </SheetTitle>
              </SheetHeader>
              
              {/* Fixed Action Bar */}
              <div className="shrink-0 flex items-center gap-2 py-3 border-b border-border">
                <Button 
                  variant={selectMode ? "default" : "outline"} 
                  size="sm"
                  onClick={() => {
                    setSelectMode(!selectMode);
                    setSelectedNotifs([]);
                  }}
                  data-testid="select-mode-btn"
                >
                  {selectMode ? <X className="w-4 h-4 mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                  {selectMode ? 'Cancel' : 'Select'}
                </Button>
                
                {selectMode && selectedNotifs.length > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={deleteSelected}
                    data-testid="delete-selected-btn"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete ({selectedNotifs.length})
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearAllNotifications}
                  className="ml-auto text-destructive"
                  disabled={notifications.length === 0}
                  data-testid="clear-all-btn"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>
              
              {/* Scrollable Notifications List */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>कोई notification नहीं है</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <motion.div 
                      key={notif.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className={cn(
                        'p-3 rounded-lg border relative group',
                        notif.read ? 'bg-background' : 'bg-primary/5 border-primary/20'
                      )}
                    >
                      <div className="flex gap-3">
                        {selectMode && (
                          <Checkbox 
                            checked={selectedNotifs.includes(notif.id)}
                            onCheckedChange={() => toggleSelect(notif.id)}
                            className="mt-1"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{notif.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">{notif.time}</p>
                        </div>
                        {!selectMode && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                            onClick={() => deleteNotification(notif.id)}
                            data-testid={`delete-notif-${notif.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </SheetContent>
          </Sheet>
        }
      />
      
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        {/* User Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Avatar className="w-16 h-16">
            <AvatarImage src={userData?.photoURL} />
            <AvatarFallback>{userData?.displayName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-semibold">{userData?.displayName}</h2>
            <p className="text-sm text-muted-foreground">{userData?.email}</p>
            {isOwner && (
              <span className="inline-flex items-center gap-1 mt-1 text-xs text-secondary">
                <Crown className="w-3 h-3" /> Owner
              </span>
            )}
          </div>
        </motion.div>
        
        {/* Claim Owner Button (if no owner exists) */}
        {!ownerExists && !isOwner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-gradient-to-r from-secondary/10 to-primary/10 border-secondary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">🎯 Become the Owner!</p>
                    <p className="text-sm text-muted-foreground">No owner exists yet. Claim ownership now.</p>
                  </div>
                  <Button onClick={handleClaimOwner} variant="secondary" data-testid="claim-owner-btn">
                    <Crown className="w-4 h-4 mr-2" />
                    Claim
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Owner Switch Button */}
        {isOwner && (
          <Button 
            onClick={() => navigate('/owner/dashboard')} 
            variant="outline" 
            className="w-full"
            data-testid="switch-to-owner-btn"
          >
            <Crown className="w-4 h-4 mr-2 text-secondary" />
            Switch to Owner Panel
          </Button>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Active Services"
            titleHi="एक्टिव सर्विस"
            value={stats.activeServices}
            icon="Package"
            color="primary"
          />
          <StatCard
            title="Total Paid"
            titleHi="कुल भुगतान"
            value={`₹${stats.totalPaid.toLocaleString()}`}
            icon="CheckCircle"
            color="success"
          />
          <StatCard
            title="Pending"
            titleHi="पेंडिंग"
            value={`₹${stats.pendingPayment.toLocaleString()}`}
            icon="Clock"
            color="warning"
          />
          <StatCard
            title="Advance"
            titleHi="एडवांस"
            value={`₹${stats.advanceGiven.toLocaleString()}`}
            icon="Wallet"
            color="secondary"
          />
        </div>
        
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
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {activities.map((activity, i) => (
                  <ActivityItem 
                    key={i} 
                    {...activity}
                    onActionClick={() => navigate('/customer/services')}
                  />
                ))}
              </div>
              <Button 
                variant="ghost" 
                className="w-full mt-2"
                onClick={() => navigate('/customer/services')}
              >
                View All Activities →
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </PanelLayout>
  );
};

export default CustomerHomePage;
