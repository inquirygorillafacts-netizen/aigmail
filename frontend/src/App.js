import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

// Contexts
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PWAProvider } from "@/contexts/PWAContext";
import { FCMProvider } from "@/contexts/FCMContext";

// PWA Components
import { InstallBanner } from "@/components/pwa/InstallPrompt";

// Public Pages
import AIEmployeePage from "@/pages/public/AIEmployeePage";
import ServicesPage from "@/pages/public/ServicesPage";
import ContactPage from "@/pages/public/ContactPage";

// Customer Pages
import CustomerHomePage from "@/pages/customer/HomePage";
import CustomerServicesPage from "@/pages/customer/ServicesPage";
import CustomerChatPage from "@/pages/customer/ChatPage";
import CustomerPaymentsPage from "@/pages/customer/PaymentsPage";
import ProfilePage from "@/pages/customer/ProfilePage";
import CustomerHelplinePage from "@/pages/customer/HelplinePage";
import CustomerFAQPage from "@/pages/customer/FAQPage";
import CustomerTermsPage from "@/pages/customer/TermsPage";
import CustomerPrivacyPage from "@/pages/customer/PrivacyPage";
import CustomerSettingsPage from "@/pages/customer/SettingsPage";

// Owner Pages
import OwnerDashboardPage from "@/pages/owner/DashboardPage";
import OwnerCustomersPage from "@/pages/owner/CustomersPage";
import OwnerChatPage from "@/pages/owner/ChatPage";
import OwnerBusinessPage from "@/pages/owner/BusinessPage";
import OwnerControlPage from "@/pages/owner/ControlPage";
import OwnerNotificationsPage from "@/pages/owner/NotificationsPage";

// Protected Route Component
const ProtectedRoute = ({ children, requireOwner = false }) => {
  const { isAuthenticated, isOwner, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/public/ai-employee" replace />;
  }

  if (requireOwner && !isOwner) {
    return <Navigate to="/customer/home" replace />;
  }

  return children;
};

// Public Route - Redirect to customer if logged in
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, redirect to customer home
  if (isAuthenticated) {
    return <Navigate to="/customer/home" replace />;
  }

  return children;
};

// App Routes
const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Default redirect - based on auth status */}
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/customer/home" replace /> : <Navigate to="/public/ai-employee" replace />
      } />

      {/* Public Panel - Redirect to customer if logged in */}
      <Route path="/public/ai-employee" element={
        <PublicRoute><AIEmployeePage /></PublicRoute>
      } />
      <Route path="/public/services" element={
        <PublicRoute><ServicesPage /></PublicRoute>
      } />
      <Route path="/public/contact" element={
        <PublicRoute><ContactPage /></PublicRoute>
      } />

      {/* Customer Panel - Auth required */}
      <Route path="/customer/home" element={
        <ProtectedRoute><CustomerHomePage /></ProtectedRoute>
      } />
      <Route path="/customer/services" element={
        <ProtectedRoute><CustomerServicesPage /></ProtectedRoute>
      } />
      <Route path="/customer/chat" element={
        <ProtectedRoute><CustomerChatPage /></ProtectedRoute>
      } />
      <Route path="/customer/payments" element={
        <ProtectedRoute><CustomerPaymentsPage /></ProtectedRoute>
      } />
      <Route path="/customer/profile" element={
        <ProtectedRoute><ProfilePage /></ProtectedRoute>
      } />
      <Route path="/customer/helpline" element={
        <ProtectedRoute><CustomerHelplinePage /></ProtectedRoute>
      } />
      <Route path="/customer/faq" element={
        <ProtectedRoute><CustomerFAQPage /></ProtectedRoute>
      } />
      <Route path="/customer/terms" element={
        <ProtectedRoute><CustomerTermsPage /></ProtectedRoute>
      } />
      <Route path="/customer/privacy" element={
        <ProtectedRoute><CustomerPrivacyPage /></ProtectedRoute>
      } />
      <Route path="/customer/settings" element={
        <ProtectedRoute><CustomerSettingsPage /></ProtectedRoute>
      } />

      {/* Owner Panel - Auth + Owner role required */}
      <Route path="/owner/dashboard" element={
        <ProtectedRoute requireOwner><OwnerDashboardPage /></ProtectedRoute>
      } />
      <Route path="/owner/customers" element={
        <ProtectedRoute requireOwner><OwnerCustomersPage /></ProtectedRoute>
      } />
      <Route path="/owner/chat" element={
        <ProtectedRoute requireOwner><OwnerChatPage /></ProtectedRoute>
      } />
      <Route path="/owner/chat/:customerId" element={
        <ProtectedRoute requireOwner><OwnerChatPage /></ProtectedRoute>
      } />
      <Route path="/owner/business" element={
        <ProtectedRoute requireOwner><OwnerBusinessPage /></ProtectedRoute>
      } />
      <Route path="/owner/control" element={
        <ProtectedRoute requireOwner><OwnerControlPage /></ProtectedRoute>
      } />

      {/* Catch all - redirect based on auth */}
      <Route path="*" element={
        isAuthenticated ? <Navigate to="/customer/home" replace /> : <Navigate to="/public/ai-employee" replace />
      } />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <PWAProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
            <InstallBanner />
            <Toaster
              position="top-center"
              richColors
              closeButton
              toastOptions={{
                duration: 3000,
              }}
            />
          </BrowserRouter>
        </AuthProvider>
      </PWAProvider>
    </ThemeProvider>
  );
}

export default App;
