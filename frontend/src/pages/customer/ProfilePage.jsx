import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Camera, Phone, HelpCircle, FileText, Shield, Settings, LogOut, ChevronRight, Moon, Sun, Crown } from 'lucide-react';
import { PanelLayout } from '@/components/layout/Navigation';
import { Header, ThemeToggle } from '@/components/layout/Header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { uploadFile, updateUserProfile } from '@/lib/firebase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userData, isOwner, logout, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: userData?.displayName || '',
    mobile: userData?.mobile || '',
    location: userData?.location || ''
  });
  const [isUploading, setIsUploading] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    serviceUpdates: true,
    paymentAlerts: true,
    messages: true,
    promotional: false
  });
  
  const menuItems = [
    { icon: Phone, label: 'Helpline', labelHi: 'हेल्पलाइन', onClick: () => navigate('/customer/helpline') },
    { icon: HelpCircle, label: 'FAQs', labelHi: 'अक्सर पूछे जाने वाले सवाल', onClick: () => navigate('/customer/faq') },
    { icon: FileText, label: 'Terms & Conditions', labelHi: 'नियम और शर्तें', onClick: () => navigate('/customer/terms') },
    { icon: Shield, label: 'Privacy Policy', labelHi: 'गोपनीयता नीति', onClick: () => navigate('/customer/privacy') },
    { icon: Settings, label: 'Settings', labelHi: 'सेटिंग्स', onClick: () => navigate('/customer/settings') }
  ];
  
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const path = `users/${userData?.uid}/profile.jpg`;
      const url = await uploadFile(file, path);
      await updateProfile({ photoURL: url });
      toast.success('Photo updated successfully!');
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('Photo upload में error हुई');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSaveProfile = async () => {
    try {
      await updateProfile(editForm);
      toast.success('Profile updated!');
      setShowEditProfile(false);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Profile update में error हुई');
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/public/ai-employee');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout में error हुई');
    }
  };
  
  const faqs = [
    { q: 'Service कब से start होती है?', a: 'Request approve होने के 24-48 घंटे में काम शुरू हो जाता है।' },
    { q: 'Payment कैसे करें?', a: 'Razorpay के through secure payment करें। UPI, Card, Net Banking सभी supported हैं।' },
    { q: 'Refund policy क्या है?', a: 'अगर service शुरू होने से पहले cancel करें तो full refund मिलेगा।' },
    { q: 'Owner से कैसे contact करें?', a: 'Chat section में Owner Chat tab से direct message भेजें।' }
  ];
  
  return (
    <PanelLayout panel="customer">
      <Header title="Profile" titleHi="प्रोफाइल" showThemeToggle />
      
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={userData?.photoURL} />
                  <AvatarFallback className="text-2xl">
                    {userData?.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4 text-primary-foreground" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handlePhotoUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
              
              <h2 className="mt-4 text-xl font-semibold">{userData?.displayName}</h2>
              <p className="text-sm text-muted-foreground">{userData?.email}</p>
              {userData?.mobile && (
                <p className="text-sm text-muted-foreground">{userData.mobile}</p>
              )}
              {userData?.location && (
                <p className="text-sm text-muted-foreground">{userData.location}</p>
              )}
              
              {isOwner && (
                <span className="mt-2 inline-flex items-center gap-1 text-xs text-secondary bg-secondary/10 px-2 py-1 rounded-full">
                  <Crown className="w-3 h-3" /> Owner
                </span>
              )}
              
              <Button 
                variant="outline" 
                className="mt-4 rounded-full"
                onClick={() => setShowEditProfile(true)}
                data-testid="edit-profile-btn"
              >
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Menu Items */}
        <Card>
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <button
                key={item.label}
                onClick={item.onClick}
                data-testid={`menu-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                className={cn(
                  'w-full flex items-center justify-between p-4 hover:bg-muted transition-colors',
                  index !== menuItems.length - 1 && 'border-b border-border'
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.labelHi}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </CardContent>
        </Card>
        
        {/* Theme Toggle */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="font-medium text-sm">Theme</span>
            </div>
            <ThemeToggle />
          </CardContent>
        </Card>
        
        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">FAQs</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Accordion type="single" collapsible>
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-sm text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
        
        {/* Logout Button */}
        <Button 
          variant="destructive" 
          className="w-full rounded-full"
          onClick={() => setShowLogoutConfirm(true)}
          data-testid="logout-btn"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
      
      {/* Edit Profile Dialog */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editForm.displayName}
                onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email (cannot change)</Label>
              <Input value={userData?.email || 'Loading...'} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <Input
                value={editForm.mobile}
                onChange={(e) => setEditForm(prev => ({ ...prev, mobile: e.target.value }))}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={editForm.location}
                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, State"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProfile(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Notifications</h4>
              {Object.entries({
                serviceUpdates: 'Service Updates',
                paymentAlerts: 'Payment Alerts',
                messages: 'Messages',
                promotional: 'Promotional'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label>{label}</Label>
                  <Switch
                    checked={settings[key]}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, [key]: checked }))}
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSettings(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Logout Confirmation */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Logout</DialogTitle>
            <DialogDescription>
              क्या आप sure हैं कि logout करना चाहते हैं?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleLogout}>Yes, Logout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PanelLayout>
  );
};

export default ProfilePage;
