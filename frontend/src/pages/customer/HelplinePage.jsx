import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageSquare, Mail, Clock, ArrowLeft, Headphones, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PanelLayout } from '@/components/layout/Navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const CustomerHelplinePage = () => {
  const navigate = useNavigate();

  const helplineOptions = [
    {
      icon: Phone,
      title: 'Call Support',
      titleHi: 'कॉल करें',
      desc: '24/7 Available',
      action: () => window.location.href = 'tel:+919876543210',
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp',
      titleHi: 'व्हाट्सऐप',
      desc: 'Quick Response',
      action: () => window.open('https://wa.me/919876543210?text=Hi! मुझे help चाहिए', '_blank'),
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      icon: Mail,
      title: 'Email Support',
      titleHi: 'ईमेल करें',
      desc: 'Detailed Queries',
      action: () => window.location.href = 'mailto:support@ai-human.com',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      icon: Headphones,
      title: 'AI Chat',
      titleHi: 'AI से बात करें',
      desc: 'Instant Help',
      action: () => navigate('/customer/chat'),
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    }
  ];

  return (
    <PanelLayout panel="customer">
      <Header
        title="Helpline"
        titleHi="हेल्पलाइन"
        showBack
        onBack={() => navigate('/customer/profile')}
      />

      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        {/* Emergency Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl p-4 border border-red-500/20"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div>
              <h3 className="font-semibold text-red-600 dark:text-red-400">जरूरी सहायता?</h3>
              <p className="text-sm text-muted-foreground">Direct call करें - +91 98765 43210</p>
            </div>
          </div>
        </motion.div>

        {/* Helpline Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {helplineOptions.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="cursor-pointer hover:border-primary/50 transition-all"
                onClick={option.action}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${option.bgColor} flex items-center justify-center`}>
                    <option.icon className={`w-7 h-7 ${option.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{option.title}</h3>
                    <p className="text-xs text-muted-foreground">{option.titleHi}</p>
                    <p className="text-sm text-muted-foreground mt-1">{option.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Working Hours */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Working Hours</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">AI Support</span>
                <span className="font-medium text-green-500">24/7 Available</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Human Support</span>
                <span className="font-medium">9 AM - 9 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email Response</span>
                <span className="font-medium">Within 24 hours</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PanelLayout>
  );
};

export default CustomerHelplinePage;
