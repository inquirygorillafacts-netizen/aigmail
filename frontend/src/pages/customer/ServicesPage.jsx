import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, CheckCircle, Clock, AlertCircle, Heart, X, Filter } from 'lucide-react';
import { PanelLayout } from '@/components/layout/Navigation';
import { Header } from '@/components/layout/Header';
import { ServiceCard, ServiceDetail } from '@/components/services/ServiceCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SERVICES, SERVICE_CATEGORIES, getServicesByCategory } from '@/data/services';
import { useAuth } from '@/contexts/AuthContext';
import { createServiceRequest } from '@/lib/firebase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Mock active services for demo
const mockActiveServices = [
  { 
    id: '1', 
    serviceId: 'website-dev', 
    status: 'in_progress', 
    progress: 60, 
    startDate: '2025-01-10', 
    expectedDate: '2025-02-15',
    paymentStatus: 'paid',
    paymentAmount: 500
  },
  { 
    id: '2', 
    serviceId: 'whatsapp-automation', 
    status: 'pending', 
    progress: 0, 
    startDate: '2025-01-20', 
    expectedDate: '2025-01-25',
    paymentStatus: 'free_trial',
    paymentAmount: 0
  },
  { 
    id: '3', 
    serviceId: 'graphic-design', 
    status: 'active', 
    progress: 100, 
    startDate: '2025-01-01', 
    expectedDate: '2025-01-05',
    paymentStatus: 'pending',
    paymentAmount: 500
  }
];

const statusConfig = {
  active: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Active' },
  in_progress: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'In Progress' },
  pending: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Pending' },
  completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Completed' },
  on_hold: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', label: 'On Hold' }
};

const ActiveServiceCard = ({ service, serviceData, onClick }) => {
  const config = statusConfig[service.status] || statusConfig.pending;
  const StatusIcon = config.icon;
  
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="hover:border-primary/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', config.bg)}>
                <Package className={cn('w-5 h-5', config.color)} />
              </div>
              <div>
                <h4 className="font-medium text-sm">{serviceData?.name || 'Service'}</h4>
                <p className="text-xs text-muted-foreground">{serviceData?.nameHi}</p>
              </div>
            </div>
            <Badge className={cn(config.bg, config.color, 'font-normal')}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          </div>
          
          {/* Progress Bar */}
          {service.status === 'in_progress' && (
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{service.progress}%</span>
              </div>
              <Progress value={service.progress} className="h-2" />
            </div>
          )}
          
          {/* Dates */}
          <div className="flex justify-between text-xs text-muted-foreground mb-3">
            <span>Started: {new Date(service.startDate).toLocaleDateString('hi-IN')}</span>
            <span>Expected: {new Date(service.expectedDate).toLocaleDateString('hi-IN')}</span>
          </div>
          
          {/* Payment Status */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-sm">
              {service.paymentStatus === 'free_trial' ? 'Free Trial' : `₹${service.paymentAmount}`}
            </span>
            <Badge variant={service.paymentStatus === 'paid' ? 'default' : service.paymentStatus === 'free_trial' ? 'secondary' : 'outline'}>
              {service.paymentStatus === 'paid' && '✓ Paid'}
              {service.paymentStatus === 'pending' && 'Pending'}
              {service.paymentStatus === 'free_trial' && 'Free'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CustomerServicesPage = () => {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedService, setSelectedService] = useState(null);
  const [activeServices] = useState(mockActiveServices);
  const [likedServices, setLikedServices] = useState([]);
  const [showLikedServices, setShowLikedServices] = useState(false);
  
  const filteredServices = getServicesByCategory(selectedCategory).filter(service => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      service.name.toLowerCase().includes(query) ||
      service.nameHi.includes(query)
    );
  });
  
  const likedServicesList = SERVICES.filter(s => likedServices.includes(s.id));
  
  const handleServiceRequest = async (service) => {
    try {
      await createServiceRequest({
        userId: userData?.uid,
        serviceId: service.id,
        serviceName: service.name,
        details: '',
        timeline: 'flexible',
        budget: service.startingPrice
      });
      toast.success('🎉 Request sent! Owner जल्दी respond करेंगे।');
      setSelectedService(null);
    } catch (error) {
      console.error('Service request error:', error);
      toast.error('Request भेजने में error हुई।');
    }
  };
  
  const toggleLike = (serviceId) => {
    setLikedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };
  
  return (
    <PanelLayout panel="customer">
      <Header title="Services" titleHi="सर्विस" showThemeToggle />
      
      <div className="p-4 lg:p-8 pb-24 lg:pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger value="active" data-testid="tab-active">
              My Services ({activeServices.length})
            </TabsTrigger>
            <TabsTrigger value="explore" data-testid="tab-explore">
              Explore
            </TabsTrigger>
          </TabsList>
          
          {/* Active Services Tab */}
          <TabsContent value="active" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Active Services: {activeServices.length}
            </p>
            
            {activeServices.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">कोई active service नहीं है</p>
                <Button 
                  className="mt-4 rounded-full"
                  onClick={() => setActiveTab('explore')}
                >
                  Explore Services
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeServices.map((service) => (
                  <ActiveServiceCard
                    key={service.id}
                    service={service}
                    serviceData={SERVICES.find(s => s.id === service.serviceId)}
                    onClick={() => {}}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Explore Services Tab */}
          <TabsContent value="explore" className="space-y-4">
            {/* Search and Liked Services Button */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search services..."
                  className="pl-10 rounded-full"
                  data-testid="explore-search"
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
              
              {/* Liked Services Button */}
              <Sheet open={showLikedServices} onOpenChange={setShowLikedServices}>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full relative"
                    data-testid="liked-services-btn"
                  >
                    <Heart className={cn("w-5 h-5", likedServices.length > 0 && "fill-red-500 text-red-500")} />
                    {likedServices.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {likedServices.length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                      Liked Services ({likedServices.length})
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {likedServicesList.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>अभी तक कोई service like नहीं की।</p>
                        <p className="text-sm mt-2">जो services पसंद आएं उन्हें ❤️ करें!</p>
                      </div>
                    ) : (
                      likedServicesList.map((service) => (
                        <div key={service.id} className="relative">
                          <ServiceCard
                            service={service}
                            variant="compact"
                            onClick={() => {
                              setSelectedService(service);
                              setShowLikedServices(false);
                            }}
                          />
                          <button
                            onClick={() => toggleLike(service.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur"
                          >
                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {SERVICE_CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="rounded-full whitespace-nowrap"
                >
                  {cat.name}
                </Button>
              ))}
            </div>
            
            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onClick={() => setSelectedService(service)}
                  isLiked={likedServices.includes(service.id)}
                  onLike={() => toggleLike(service.id)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Service Detail Modal */}
      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Service Details</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <ServiceDetail
              service={selectedService}
              onRequest={() => handleServiceRequest(selectedService)}
              onCall={() => window.location.href = 'tel:+919876543210'}
              onChat={() => {}}
            />
          )}
        </DialogContent>
      </Dialog>
    </PanelLayout>
  );
};

export default CustomerServicesPage;
