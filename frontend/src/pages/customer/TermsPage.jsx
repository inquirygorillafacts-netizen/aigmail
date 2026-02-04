import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PanelLayout } from '@/components/layout/Navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';

const CustomerTermsPage = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: '1. Services',
      content: 'AI-Human Services डिजिटल सर्विसेज प्रदान करता है जैसे Website Development, App Development, SEO, Marketing आदि। सभी services के लिए अलग-अलग terms apply होते हैं।'
    },
    {
      title: '2. Free Trials',
      content: 'हर service के लिए 3 free trials मिलते हैं। Free trial के बाद paid subscription लेना होगा। Free trial में limited features मिल सकते हैं।'
    },
    {
      title: '3. Payment Terms',
      content: 'Payment advance में लेना होगा (50% minimum)। बाकी payment delivery के बाद देना होगा। Late payment पर additional charges lag सकते हैं।'
    },
    {
      title: '4. Refund Policy',
      content: 'Service start होने से पहले 100% refund। Service start होने के बाद work done के अनुसार partial refund। Completed work पर कोई refund नहीं।'
    },
    {
      title: '5. User Responsibilities',
      content: 'User को सही और complete information देनी होगी। Timely response और feedback देना जरूरी है। Illegal content या activities allowed नहीं हैं।'
    },
    {
      title: '6. Intellectual Property',
      content: 'Delivered work का ownership payment complete होने के बाद client को transfer होता है। AI-Human के tools और templates हमारी property रहेंगे।'
    },
    {
      title: '7. Limitation of Liability',
      content: 'AI-Human maximum liability paid amount तक सीमित होगी। Indirect damages के लिए हम responsible नहीं होंगे।'
    },
    {
      title: '8. Modifications',
      content: 'हम कभी भी terms update कर सकते हैं। Major changes की notification users को दी जाएगी। Continued use का मतलब acceptance।'
    }
  ];

  return (
    <PanelLayout panel="customer">
      <Header
        title="Terms & Conditions"
        titleHi="नियम और शर्तें"
        showBack
        onBack={() => navigate('/customer/profile')}
      />

      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Terms of Service</h2>
            <p className="text-xs text-muted-foreground">Last updated: January 2026</p>
          </div>
        </motion.div>

        {sections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-2">{section.title}</h3>
                <p className="text-sm text-muted-foreground">{section.content}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </PanelLayout>
  );
};

export default CustomerTermsPage;
