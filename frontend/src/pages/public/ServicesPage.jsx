import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { PanelLayout } from '@/components/layout/Navigation';
import { Header } from '@/components/layout/Header';
import { FloatingVoiceButton } from '@/components/voice/VoiceVisualizer';
import { ServiceCard, ServiceDetail } from '@/components/services/ServiceCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SERVICES, SERVICE_CATEGORIES, getServicesByCategory } from '@/data/services';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ServicesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedService, setSelectedService] = useState(null);
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  
  // Filter services based on search and category
  const filteredServices = getServicesByCategory(selectedCategory).filter(service => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      service.name.toLowerCase().includes(query) ||
      service.nameHi.includes(query) ||
      service.description.toLowerCase().includes(query)
    );
  });
  
  const handleServiceClick = (service) => {
    setSelectedService(service);
  };
  
  const handleServiceRequest = async () => {
    if (!isAuthenticated) {
      await login();
    }
    navigate('/customer/services', { state: { requestService: selectedService?.id } });
    setSelectedService(null);
  };
  
  const handleCall = () => {
    window.location.href = 'tel:+919876543210';
  };
  
  const handleChat = () => {
    setSelectedService(null);
    navigate('/public/ai-employee');
  };
  
  return (
    <PanelLayout panel="public">
      <Header 
        title="Services" 
        titleHi="सर्विस"
        showThemeToggle
      />
      
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services... सर्विस खोजें..."
            className="pl-10 pr-10 rounded-full"
            data-testid="service-search"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {SERVICE_CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="rounded-full whitespace-nowrap"
              data-testid={`category-${cat.id}`}
            >
              {cat.name}
            </Button>
          ))}
        </div>
        
        {/* Service Highlight */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4 border border-primary/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Special Offer
            </Badge>
          </div>
          <h3 className="font-semibold">हर सर्विस पहली 3 बार FREE! 🎉</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try any service 3 times free, then just ₹500/month onwards
          </p>
        </motion.div>
        
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={() => handleServiceClick(service)}
            />
          ))}
        </div>
        
        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              कोई service नहीं मिली। कृपया अलग keyword try करें।
            </p>
          </div>
        )}
      </div>
      
      {/* Floating Voice Button */}
      <FloatingVoiceButton
        onClick={() => navigate('/public/ai-employee')}
      />
      
      {/* Service Detail Modal */}
      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Service Details</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <ServiceDetail
              service={selectedService}
              onRequest={handleServiceRequest}
              onCall={handleCall}
              onChat={handleChat}
            />
          )}
        </DialogContent>
      </Dialog>
    </PanelLayout>
  );
};

export default ServicesPage;
