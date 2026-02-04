import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Phone, MessageSquare, ChevronRight, Filter, Package, ArrowLeft } from 'lucide-react';
import { PanelLayout } from '@/components/layout/Navigation';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const mockCustomers = [
  { uid: 'cust_001', displayName: 'Rahul Kumar', email: 'rahul@gmail.com', mobile: '+91 98765 43210', location: 'Jaipur, Rajasthan', activeServices: 2, totalPaid: 500, pendingPayment: 500, lastSeen: Date.now() - 7200000 },
  { uid: 'cust_002', displayName: 'Priya Singh', email: 'priya@gmail.com', mobile: '+91 98765 43211', location: 'Delhi', activeServices: 1, totalPaid: 1000, pendingPayment: 0, lastSeen: Date.now() - 86400000 },
  { uid: 'cust_003', displayName: 'Amit Kumar', email: 'amit@gmail.com', mobile: '+91 98765 43212', location: 'Mumbai', activeServices: 0, totalPaid: 1500, pendingPayment: 0, lastSeen: Date.now() - 172800000 }
];

const CustomerListItem = ({ customer, onClick }) => {
  const diff = Date.now() - customer.lastSeen;
  let lastSeenText = '';
  if (diff < 3600000) lastSeenText = Math.floor(diff / 60000) + ' mins ago';
  else if (diff < 86400000) lastSeenText = Math.floor(diff / 3600000) + ' hours ago';
  else lastSeenText = Math.floor(diff / 86400000) + ' days ago';
  
  return (
    <motion.div whileTap={{ scale: 0.98 }} onClick={onClick} className="flex items-center gap-4 p-4 border-b border-border hover:bg-muted/50 cursor-pointer" data-testid={'customer-' + customer.uid}>
      <Avatar className="w-12 h-12">
        <AvatarFallback>{customer.displayName.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium truncate">{customer.displayName}</h4>
          <span className="text-xs text-muted-foreground">{lastSeenText}</span>
        </div>
        <p className="text-sm text-muted-foreground truncate">{customer.mobile}</p>
        <div className="flex items-center gap-3 mt-1 text-xs">
          <span className="text-primary">Active: {customer.activeServices}</span>
          {customer.pendingPayment > 0 && <span className="text-destructive">Pending: ₹{customer.pendingPayment}</span>}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </motion.div>
  );
};

const OwnerCustomersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const searchLower = searchQuery.toLowerCase();
  const filteredCustomers = mockCustomers.filter(c => {
    if (searchQuery && !c.displayName.toLowerCase().includes(searchLower) && !c.email.toLowerCase().includes(searchLower)) return false;
    if (filter === 'active' && c.activeServices === 0) return false;
    if (filter === 'pending' && c.pendingPayment === 0) return false;
    return true;
  });
  
  if (selectedCustomer) {
    return (
      <PanelLayout panel="owner">
        <Header title="Customer Detail" showThemeToggle />
        <div className="p-4 lg:p-8 pb-24 space-y-4">
          <Button variant="ghost" onClick={() => setSelectedCustomer(null)}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
          <Card>
            <CardContent className="pt-6 text-center">
              <Avatar className="w-20 h-20 mx-auto"><AvatarFallback className="text-2xl">{selectedCustomer.displayName.charAt(0)}</AvatarFallback></Avatar>
              <h2 className="mt-4 text-xl font-semibold">{selectedCustomer.displayName}</h2>
              <p className="text-muted-foreground">{selectedCustomer.email}</p>
              <p className="text-muted-foreground">{selectedCustomer.mobile}</p>
              <p className="text-sm text-muted-foreground">{selectedCustomer.location}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Payment Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <p className="text-lg font-bold text-green-600">₹{selectedCustomer.totalPaid}</p>
                  <p className="text-xs">Total Paid</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                  <p className="text-lg font-bold text-yellow-600">₹{selectedCustomer.pendingPayment}</p>
                  <p className="text-xs">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => window.location.href = 'tel:' + selectedCustomer.mobile}><Phone className="w-4 h-4 mr-2" />Call</Button>
            <Button variant="outline" onClick={() => window.open('https://wa.me/' + selectedCustomer.mobile.replace(/[^0-9]/g, ''))}><MessageSquare className="w-4 h-4 mr-2" />WhatsApp</Button>
          </div>
        </div>
      </PanelLayout>
    );
  }
  
  return (
    <PanelLayout panel="owner">
      <Header title="Customers" titleHi="कस्टमर" showThemeToggle />
      <div className="p-4 lg:p-8 pb-24 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="pl-10" data-testid="customer-search" />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card className="overflow-hidden">
          {filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No customers found</div>
          ) : (
            filteredCustomers.map((c) => <CustomerListItem key={c.uid} customer={c} onClick={() => setSelectedCustomer(c)} />)
          )}
        </Card>
      </div>
    </PanelLayout>
  );
};

export default OwnerCustomersPage;
