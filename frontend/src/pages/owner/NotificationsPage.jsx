import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, Users, User, Search, X, CheckCircle, AlertCircle } from 'lucide-react';
import { PanelLayout } from '@/components/layout/Navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { db, collection, getDocs, query, where } from '@/lib/firebase';
import { toast } from 'sonner';
import axios from 'axios';
import { cn } from '@/lib/utils';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Mock customers for demo
const mockCustomers = [
  { uid: 'cust_001', displayName: 'Rahul Kumar', email: 'rahul@example.com', photoURL: null },
  { uid: 'cust_002', displayName: 'Priya Singh', email: 'priya@example.com', photoURL: null },
  { uid: 'cust_003', displayName: 'Amit Kumar', email: 'amit@example.com', photoURL: null },
  { uid: 'cust_004', displayName: 'Neha Sharma', email: 'neha@example.com', photoURL: null },
  { uid: 'cust_005', displayName: 'Vikram Singh', email: 'vikram@example.com', photoURL: null },
];

// Sent notifications history (mock)
const mockSentHistory = [
  { id: 1, title: 'New Year Offer!', body: 'Get 20% off on all services', sentTo: 'all', sentAt: Date.now() - 86400000, success: 5, failed: 0 },
  { id: 2, title: 'Payment Reminder', body: 'आपकी ₹500 payment pending है', sentTo: 'Rahul Kumar', sentAt: Date.now() - 172800000, success: 1, failed: 0 },
  { id: 3, title: 'Service Update', body: 'Your website is ready for review', sentTo: 'Priya Singh', sentAt: Date.now() - 259200000, success: 1, failed: 0 },
];

const OwnerNotificationsPage = () => {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('send');
  const [customers, setCustomers] = useState(mockCustomers);
  const [sentHistory, setSentHistory] = useState(mockSentHistory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [sendToAll, setSendToAll] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  
  // Filter customers based on search
  const filteredCustomers = customers.filter(c => 
    c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Toggle customer selection
  const toggleCustomer = (uid) => {
    if (sendToAll) return;
    setSelectedCustomers(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };
  
  // Select all customers
  const selectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.uid));
    }
  };
  
  // Send notification
  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Title और Message दोनों जरूरी हैं');
      return;
    }
    
    if (!sendToAll && selectedCustomers.length === 0) {
      toast.error('कम से कम एक customer select करें');
      return;
    }
    
    setSending(true);
    
    try {
      const targetCustomers = sendToAll ? customers : customers.filter(c => selectedCustomers.includes(c.uid));
      let successCount = 0;
      let failCount = 0;
      
      // Send to each customer
      for (const customer of targetCustomers) {
        try {
          await axios.post(`${API_URL}/api/fcm/send`, {
            user_id: customer.uid,
            title: title,
            body: body,
            data: {
              type: 'owner_broadcast',
              timestamp: Date.now().toString()
            }
          });
          successCount++;
        } catch (err) {
          console.error(`Failed to send to ${customer.displayName}:`, err);
          failCount++;
        }
      }
      
      // Add to history
      const newEntry = {
        id: Date.now(),
        title,
        body,
        sentTo: sendToAll ? 'all' : targetCustomers.map(c => c.displayName).join(', '),
        sentAt: Date.now(),
        success: successCount,
        failed: failCount
      };
      setSentHistory(prev => [newEntry, ...prev]);
      
      // Show result
      if (successCount > 0) {
        toast.success(`✅ ${successCount} customers को notification भेजी गई!`);
      }
      if (failCount > 0) {
        toast.warning(`⚠️ ${failCount} customers को भेजने में error`);
      }
      
      // Reset form
      setTitle('');
      setBody('');
      setSelectedCustomers([]);
      setSendToAll(false);
      
    } catch (error) {
      console.error('Send notification error:', error);
      toast.error('Notification भेजने में error हुई');
    } finally {
      setSending(false);
    }
  };
  
  // Format timestamp
  const formatTime = (ts) => {
    const date = new Date(ts);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return date.toLocaleDateString('hi-IN');
  };
  
  return (
    <PanelLayout panel="owner">
      <Header 
        title="Notifications" 
        titleHi="नोटिफिकेशन"
        showThemeToggle
      />
      
      <div className="p-4 lg:p-8 pb-24 lg:pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger value="send" data-testid="tab-send">
              <Send className="w-4 h-4 mr-2" />
              Send
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <Bell className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>
          
          {/* Send Notification Tab */}
          <TabsContent value="send" className="space-y-6">
            {/* Compose Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  Compose Notification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Title / शीर्षक</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Notification title..."
                    data-testid="notif-title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Message / संदेश</label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write your message..."
                    rows={4}
                    data-testid="notif-body"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Select Recipients */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Select Recipients
                  </span>
                  <Badge variant="secondary">
                    {sendToAll ? 'All' : selectedCustomers.length} selected
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Send to All Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={sendToAll}
                      onCheckedChange={(checked) => {
                        setSendToAll(checked);
                        if (checked) setSelectedCustomers([]);
                      }}
                      data-testid="send-to-all"
                    />
                    <div>
                      <p className="font-medium text-sm">Send to All Customers</p>
                      <p className="text-xs text-muted-foreground">सभी customers को भेजें ({customers.length})</p>
                    </div>
                  </div>
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
                
                {/* Search */}
                {!sendToAll && (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search customers..."
                        className="pl-10"
                        data-testid="customer-search"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                    
                    {/* Select All Button */}
                    <div className="flex justify-between items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={selectAll}
                        data-testid="select-all-btn"
                      >
                        {selectedCustomers.length === filteredCustomers.length ? 'Deselect All' : 'Select All'}
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {filteredCustomers.length} customers
                      </span>
                    </div>
                    
                    {/* Customer List */}
                    <ScrollArea className="h-[250px]">
                      <div className="space-y-2">
                        {filteredCustomers.map((customer) => (
                          <motion.div
                            key={customer.uid}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleCustomer(customer.uid)}
                            className={cn(
                              'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                              selectedCustomers.includes(customer.uid)
                                ? 'bg-primary/10 border border-primary/30'
                                : 'bg-muted/50 hover:bg-muted'
                            )}
                            data-testid={`customer-${customer.uid}`}
                          >
                            <Checkbox
                              checked={selectedCustomers.includes(customer.uid)}
                              onCheckedChange={() => toggleCustomer(customer.uid)}
                            />
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={customer.photoURL} />
                              <AvatarFallback>{customer.displayName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{customer.displayName}</p>
                              <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={sending || !title.trim() || !body.trim() || (!sendToAll && selectedCustomers.length === 0)}
              className="w-full rounded-full"
              size="lg"
              data-testid="send-notification-btn"
            >
              {sending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Notification
                </>
              )}
            </Button>
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            {sentHistory.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>कोई notification history नहीं है</p>
              </div>
            ) : (
              sentHistory.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.body}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            <User className="w-3 h-3 mr-1" />
                            {item.sentTo === 'all' ? 'All Customers' : item.sentTo}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formatTime(item.sentAt)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs">{item.success}</span>
                        </div>
                        {item.failed > 0 && (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs">{item.failed}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PanelLayout>
  );
};

export default OwnerNotificationsPage;
