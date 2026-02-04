import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Eye, Lock, Database, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PanelLayout } from '@/components/layout/Navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';

const CustomerPrivacyPage = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Database,
      title: 'Data Collection',
      content: 'हम आपका name, email, phone number, location collect करते हैं। यह data service provide करने के लिए जरूरी है। Google Sign-in से basic profile information मिलती है।'
    },
    {
      icon: Eye,
      title: 'Data Usage',
      content: 'आपका data सिर्फ services provide करने, communication, और experience improve करने के लिए use होता है। हम कभी आपका data sell नहीं करते।'
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: 'आपका data Firebase के secure servers पर encrypted form में store होता है। हम industry-standard security measures follow करते हैं।'
    },
    {
      icon: Share2,
      title: 'Data Sharing',
      content: 'हम आपका data third parties के साथ share नहीं करते, सिवाय legal requirements के। Service providers को limited access दी जा सकती है।'
    }
  ];

  const rights = [
    'अपना data access करने का अधिकार',
    'Data correction request का अधिकार',
    'Account delete करने का अधिकार',
    'Marketing emails unsubscribe का अधिकार'
  ];

  return (
    <PanelLayout panel="customer">
      <Header
        title="Privacy Policy"
        titleHi="गोपनीयता नीति"
        showBack
        onBack={() => navigate('/customer/profile')}
      />

      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="font-semibold">आपकी Privacy हमारी Priority</h2>
            <p className="text-xs text-muted-foreground">Last updated: January 2026</p>
          </div>
        </motion.div>

        {sections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-2">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">{section.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Your Rights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">आपके अधिकार (Your Rights)</h3>
              <ul className="space-y-2">
                {rights.map((right, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {right}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact */}
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Privacy से related कोई सवाल हो तो contact करें:
            </p>
            <p className="text-sm font-medium text-primary mt-1">
              privacy@ai-human.com
            </p>
          </CardContent>
        </Card>
      </div>
    </PanelLayout>
  );
};

export default CustomerPrivacyPage;
