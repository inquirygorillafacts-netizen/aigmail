import React from 'react';
import { Sun, Moon, Bell, ArrowLeft, Download } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePWA } from '@/contexts/PWAContext';
import { cn } from '@/lib/utils';

export const Header = ({ 
  title, 
  titleHi,
  showBack = false,
  onBack,
  showNotifications = false,
  showThemeToggle = true,
  showInstall = true,
  rightContent,
  className 
}) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { userData } = useAuth();
  const { isInstallable, isInstalled, installApp } = usePWA();
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };
  
  return (
    <header 
      data-testid="header"
      className={cn(
        'sticky top-0 z-30 glass border-b border-border',
        className
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleBack}
              data-testid="back-button"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-lg font-semibold font-[Outfit]">{title}</h1>
            {titleHi && <p className="text-xs text-muted-foreground">{titleHi}</p>}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {rightContent}
          
          {/* Install Button */}
          {showInstall && isInstallable && !isInstalled && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={installApp}
              data-testid="header-install-btn"
              className="text-primary"
            >
              <Download className="w-5 h-5" />
            </Button>
          )}
          
          {showNotifications && (
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="notifications-button"
              className="relative"
            >
              <Bell className="w-5 h-5" />
              {/* Notification Badge */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
          )}
          
          {showThemeToggle && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleTheme}
              data-testid="theme-toggle"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

// Theme Toggle Switch Component
export const ThemeToggle = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div 
      className={cn('flex items-center gap-3', className)}
      data-testid="theme-toggle-switch"
    >
      <Sun className="w-4 h-4 text-muted-foreground" />
      <button
        onClick={toggleTheme}
        className="relative w-14 h-7 rounded-full bg-muted transition-colors"
      >
        <span 
          className={cn(
            'absolute top-1 w-5 h-5 rounded-full bg-primary transition-transform duration-200',
            theme === 'dark' ? 'translate-x-8' : 'translate-x-1'
          )}
        />
      </button>
      <Moon className="w-4 h-4 text-muted-foreground" />
    </div>
  );
};
