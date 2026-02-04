import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Moon, Sun, Globe, Trash2, LogOut, ChevronRight, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PanelLayout } from '@/components/layout/Navigation';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

const CustomerSettingsPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/public/ai-employee');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const handleDeleteAccount = () => {
    toast.info('Account deletion request submitted. हम जल्द आपसे contact करेंगे।');
    setShowDeleteDialog(false);
  };

  return (
    <PanelLayout panel="customer">
      <Header
        title="Settings"
        titleHi="सेटिंग्स"
        showBack
        onBack={() => navigate('/customer/profile')}
      />

      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Appearance</h3>
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <div>
                    <p className="font-medium text-sm">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">डार्क मोड</p>
                  </div>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Notifications</h3>
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5" />
                  <div>
                    <p className="font-medium text-sm">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">पुश नोटिफिकेशन</p>
                  </div>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Language */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Language</h3>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5" />
                  <div>
                    <p className="font-medium text-sm">App Language</p>
                    <p className="text-xs text-muted-foreground">Hinglish (Hindi + English)</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Account</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout / लॉगआउट
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-5 h-5 mr-3" />
              Delete Account / अकाउंट डिलीट करें
            </Button>
          </div>
        </motion.div>

        {/* App Version */}
        <div className="text-center pt-8">
          <p className="text-xs text-muted-foreground">AI-Human App v1.0.0</p>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Account Delete करें?
            </DialogTitle>
            <DialogDescription>
              क्या आप सच में account delete करना चाहते हैं? यह action reverse नहीं हो सकता। आपका सारा data permanently delete हो जाएगा।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PanelLayout>
  );
};

export default CustomerSettingsPage;
