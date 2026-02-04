import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Zap, Bell, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/contexts/PWAContext';

// Install Banner (shows at top/bottom)
export const InstallBanner = () => {
  const { isInstallable, showInstallBanner, installApp, dismissBanner } = usePWA();

  if (!isInstallable || !showInstallBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 lg:bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
      >
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-4 shadow-2xl border border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm">App Install करें!</h3>
              <p className="text-xs text-white/80 mt-1">
                Fast access, offline support, और notifications के लिए install करें
              </p>
            </div>
            <button 
              onClick={dismissBanner}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white/80" />
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              onClick={installApp}
              className="flex-1 bg-white text-primary hover:bg-white/90 rounded-full font-medium"
              size="sm"
              data-testid="install-app-banner-btn"
            >
              <Download className="w-4 h-4 mr-2" />
              Install Now
            </Button>
            <Button
              onClick={dismissBanner}
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full"
              size="sm"
            >
              बाद में
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Install Button for Header
export const InstallButton = ({ variant = 'default', className = '' }) => {
  const { isInstallable, isInstalled, installApp } = usePWA();

  if (isInstalled || !isInstallable) return null;

  if (variant === 'icon') {
    return (
      <Button
        onClick={installApp}
        variant="ghost"
        size="icon"
        className={className}
        data-testid="install-app-btn"
      >
        <Download className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <Button
      onClick={installApp}
      variant="outline"
      size="sm"
      className={`rounded-full ${className}`}
      data-testid="install-app-btn"
    >
      <Download className="w-4 h-4 mr-2" />
      Install
    </Button>
  );
};

// Full Install Popup/Modal
export const InstallPopup = ({ open, onClose }) => {
  const { installApp } = usePWA();

  const features = [
    { icon: Zap, title: 'Super Fast', desc: 'तुरंत खुलेगा' },
    { icon: Wifi, title: 'Offline Access', desc: 'बिना internet भी' },
    { icon: Bell, title: 'Notifications', desc: 'सभी updates पाएं' },
    { icon: Smartphone, title: 'Native Feel', desc: 'App जैसा experience' }
  ];

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="bg-card w-full max-w-sm rounded-3xl p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-white">AI</span>
            </div>
            <h2 className="text-xl font-bold">AI-Human App</h2>
            <p className="text-sm text-muted-foreground mt-1">Install करके better experience पाएं</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                <feature.icon className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs font-medium">{feature.title}</p>
                  <p className="text-[10px] text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Button
              onClick={async () => {
                await installApp();
                onClose();
              }}
              className="w-full rounded-full bg-gradient-to-r from-primary to-blue-600"
              size="lg"
              data-testid="install-app-popup-btn"
            >
              <Download className="w-5 h-5 mr-2" />
              Install App
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full rounded-full"
            >
              अभी नहीं
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
