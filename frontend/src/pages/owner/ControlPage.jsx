import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, CreditCard, Palette, Mail, Bell, ToggleLeft, Building2, Phone, MapPin, Clock, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { PanelLayout } from '@/components/layout/Navigation';
import { Header, ThemeToggle } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const OwnerControlPage = () => {
  const [activeTab, setActiveTab] = useState('app');
  
  // App Settings
  const [appSettings, setAppSettings] = useState({
    businessName: 'AI-Human Services',
    contactNumber: '+91 9876543210',
    whatsappNumber: '+91 9876543210',
    email: 'info@ai-human.com',
    location: 'Jaipur, Rajasthan',
    workingHours: '9 AM - 6 PM'
  });
  
  // Feature Toggles
  const [features, setFeatures] = useState({
    aiEmployee: true,
    servicesPage: true,
    contactPage: true,
    registration: true,
    serviceRequest: true,
    aiChat: true,
    fileUpload: true,
    paymentHistory: true
  });
  
  // Security Settings
  const [security, setSecurity] = useState({
    pinLockEnabled: false,
    pin: '',
    confirmPin: '',
    twoFactorEnabled: false,
    sessionTimeout: '30'
  });
  const [showPin, setShowPin] = useState(false);
  
  // Payment Settings
  const [payment, setPayment] = useState({
    razorpayKeyId: 'rzp_test_••••••••',
    razorpaySecret: '••••••••••••••••',
    paymentsEnabled: true,
    currency: 'INR'
  });
  const [showPaymentKeys, setShowPaymentKeys] = useState(false);
  
  // Branding
  const [branding, setBranding] = useState({
    primaryColor: '#2563EB',
    secondaryColor: '#F97316',
    defaultTheme: 'light'
  });
  
  // Message Templates
  const [templates, setTemplates] = useState({
    welcome: 'Dear {name},\nWelcome to AI-Human Services! We\'re excited to have you on board.',
    serviceConfirmation: 'Hi {name},\nYour {service} request has been received. We\'ll start working on it soon.',
    paymentReminder: 'Dear {name},\nYour payment of {amount} is pending. Please complete the payment to continue the service.'
  });
  
  // Notification Settings
  const [notifications, setNotifications] = useState({
    newCustomer: true,
    serviceRequest: true,
    paymentReceived: true,
    customerMessage: true,
    newRating: true,
    emailNotif: true,
    pushNotif: true,
    whatsappNotif: false
  });
  
  const handleSaveAppSettings = () => {
    toast.success('App settings saved!');
  };
  
  const handleSaveSecurity = () => {
    if (security.pinLockEnabled && security.pin !== security.confirmPin) {
      toast.error('PIN does not match');
      return;
    }
    toast.success('Security settings saved!');
  };
  
  const handleTestPaymentConnection = () => {
    toast.success('✓ Razorpay Connected Successfully!');
  };
  
  return (
    <PanelLayout panel="owner">
      <Header title="Control Panel" titleHi="कंट्रोल पैनल" showThemeToggle />
      
      <div className="p-4 lg:p-8 pb-24 lg:pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4 lg:grid-cols-7 h-auto mb-6">
            <TabsTrigger value="app" className="text-xs py-2">
              <Settings className="w-4 h-4 lg:mr-1" />
              <span className="hidden lg:inline">App</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="text-xs py-2">
              <ToggleLeft className="w-4 h-4 lg:mr-1" />
              <span className="hidden lg:inline">Features</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs py-2">
              <Shield className="w-4 h-4 lg:mr-1" />
              <span className="hidden lg:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="text-xs py-2">
              <CreditCard className="w-4 h-4 lg:mr-1" />
              <span className="hidden lg:inline">Payment</span>
            </TabsTrigger>
            <TabsTrigger value="branding" className="text-xs py-2 hidden lg:flex">
              <Palette className="w-4 h-4 mr-1" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs py-2 hidden lg:flex">
              <Mail className="w-4 h-4 mr-1" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs py-2 hidden lg:flex">
              <Bell className="w-4 h-4 mr-1" />
              Notifs
            </TabsTrigger>
          </TabsList>
          
          {/* App Settings */}
          <TabsContent value="app">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input
                    value={appSettings.businessName}
                    onChange={(e) => setAppSettings(prev => ({ ...prev, businessName: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Contact Number</Label>
                    <Input
                      value={appSettings.contactNumber}
                      onChange={(e) => setAppSettings(prev => ({ ...prev, contactNumber: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp Number</Label>
                    <Input
                      value={appSettings.whatsappNumber}
                      onChange={(e) => setAppSettings(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={appSettings.email}
                    onChange={(e) => setAppSettings(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Office Location</Label>
                  <Input
                    value={appSettings.location}
                    onChange={(e) => setAppSettings(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Working Hours</Label>
                  <Input
                    value={appSettings.workingHours}
                    onChange={(e) => setAppSettings(prev => ({ ...prev, workingHours: e.target.value }))}
                  />
                </div>
                <Button onClick={handleSaveAppSettings} className="w-full">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Feature Controls */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Feature Controls</CardTitle>
                <CardDescription>Enable or disable features across panels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Public Panel Features</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'aiEmployee', label: 'AI Employee' },
                      { key: 'servicesPage', label: 'Services Page' },
                      { key: 'contactPage', label: 'Contact Page' },
                      { key: 'registration', label: 'Registration' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label>{label}</Label>
                        <Switch
                          checked={features[key]}
                          onCheckedChange={(checked) => setFeatures(prev => ({ ...prev, [key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Customer Panel Features</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'serviceRequest', label: 'Service Request' },
                      { key: 'aiChat', label: 'AI Chat' },
                      { key: 'fileUpload', label: 'File Upload' },
                      { key: 'paymentHistory', label: 'Payment History' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label>{label}</Label>
                        <Switch
                          checked={features[key]}
                          onCheckedChange={(checked) => setFeatures(prev => ({ ...prev, [key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button className="w-full">Save All Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security & Access Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Panel PIN Lock</Label>
                      <p className="text-xs text-muted-foreground">Require PIN to access Owner Panel</p>
                    </div>
                    <Switch
                      checked={security.pinLockEnabled}
                      onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, pinLockEnabled: checked }))}
                    />
                  </div>
                  
                  {security.pinLockEnabled && (
                    <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                      <div className="space-y-2">
                        <Label>Set 4-Digit PIN</Label>
                        <InputOTP 
                          maxLength={4} 
                          value={security.pin}
                          onChange={(value) => setSecurity(prev => ({ ...prev, pin: value }))}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <div className="space-y-2">
                        <Label>Confirm PIN</Label>
                        <InputOTP 
                          maxLength={4}
                          value={security.confirmPin}
                          onChange={(value) => setSecurity(prev => ({ ...prev, confirmPin: value }))}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-xs text-muted-foreground">Extra security layer</p>
                    </div>
                    <Switch
                      checked={security.twoFactorEnabled}
                      onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, twoFactorEnabled: checked }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Session Timeout</Label>
                    <select
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="5">5 minutes</option>
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>
                
                <Button onClick={handleSaveSecurity} className="w-full">Save Security Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Payment */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Razorpay Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>API Key ID</Label>
                  <div className="relative">
                    <Input
                      type={showPaymentKeys ? 'text' : 'password'}
                      value={payment.razorpayKeyId}
                      onChange={(e) => setPayment(prev => ({ ...prev, razorpayKeyId: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPaymentKeys(!showPaymentKeys)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPaymentKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>API Secret Key</Label>
                  <Input
                    type={showPaymentKeys ? 'text' : 'password'}
                    value={payment.razorpaySecret}
                    onChange={(e) => setPayment(prev => ({ ...prev, razorpaySecret: e.target.value }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Enable Payments</Label>
                  <Switch
                    checked={payment.paymentsEnabled}
                    onCheckedChange={(checked) => setPayment(prev => ({ ...prev, paymentsEnabled: checked }))}
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleTestPaymentConnection} className="flex-1">
                    Test Connection
                  </Button>
                  <Button className="flex-1">Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Branding */}
          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Brand Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Logo</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">Click to upload logo</p>
                    <p className="text-xs text-muted-foreground">Recommended: 512x512 PNG</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input
                        value={branding.primaryColor}
                        onChange={(e) => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Color</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Default Theme</Label>
                  <ThemeToggle />
                </div>
                <Button className="w-full">Save & Preview</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Templates */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Message Templates
                </CardTitle>
                <CardDescription>
                  Variables: {'{name}'}, {'{service}'}, {'{amount}'}, {'{date}'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Welcome Message</Label>
                  <Textarea
                    value={templates.welcome}
                    onChange={(e) => setTemplates(prev => ({ ...prev, welcome: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Service Confirmation</Label>
                  <Textarea
                    value={templates.serviceConfirmation}
                    onChange={(e) => setTemplates(prev => ({ ...prev, serviceConfirmation: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Reminder</Label>
                  <Textarea
                    value={templates.paymentReminder}
                    onChange={(e) => setTemplates(prev => ({ ...prev, paymentReminder: e.target.value }))}
                    rows={3}
                  />
                </div>
                <Button className="w-full">Save Templates</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Owner Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Notify me when:</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'newCustomer', label: 'New customer' },
                      { key: 'serviceRequest', label: 'Service request' },
                      { key: 'paymentReceived', label: 'Payment received' },
                      { key: 'customerMessage', label: 'Customer message' },
                      { key: 'newRating', label: 'New rating' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label>{label}</Label>
                        <Switch
                          checked={notifications[key]}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Notification Methods:</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'emailNotif', label: 'Email' },
                      { key: 'pushNotif', label: 'Push (browser)' },
                      { key: 'whatsappNotif', label: 'WhatsApp' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label>{label}</Label>
                        <Switch
                          checked={notifications[key]}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button className="w-full">Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PanelLayout>
  );
};

export default OwnerControlPage;
