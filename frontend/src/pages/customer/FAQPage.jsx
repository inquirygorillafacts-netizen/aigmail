import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PanelLayout } from '@/components/layout/Navigation';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const faqData = [
  { cat: 'Services', q: 'Free trial कैसे काम करता है?', a: 'हर service के लिए पहली 3 बार FREE है।' },
  { cat: 'Services', q: 'Service complete होने में कितना time लगता है?', a: 'छोटी services 1-3 दिन में और बड़ी services 1-4 weeks में।' },
  { cat: 'Payment', q: 'Payment कैसे करें?', a: 'UPI, Bank Transfer, या Card से payment कर सकते हैं।' },
  { cat: 'Payment', q: 'Refund policy क्या है?', a: 'Service start नहीं हुई तो 100% refund।' },
  { cat: 'Account', q: 'Profile कैसे update करें?', a: 'Profile page पर Edit Profile से करें।' },
  { cat: 'Support', q: 'AI Employee क्या है?', a: '24/7 available virtual assistant।' },
  { cat: 'Support', q: 'Owner से कैसे बात करें?', a: 'Chat section में Owner Chat tab से।' }
];

const CustomerFAQPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const filtered = faqData.filter(f => 
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PanelLayout panel="customer">
      <Header
        title="FAQs"
        titleHi="अक्सर पूछे जाने वाले सवाल"
        showBack
        onBack={() => navigate('/customer/profile')}
      />

      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs..."
            className="pl-10 rounded-full"
          />
        </div>

        {filtered.map((faq, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card 
              className="cursor-pointer"
              onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs text-muted-foreground">{faq.cat}</span>
                    <p className="font-medium text-sm">{faq.q}</p>
                    {expandedIndex === idx && (
                      <p className="text-sm text-muted-foreground mt-2">{faq.a}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">कोई FAQ नहीं मिला</p>
          </div>
        )}
      </div>
    </PanelLayout>
  );
};

export default CustomerFAQPage;
