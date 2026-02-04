import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';

// Dashboard Stat Card
export const StatCard = ({ 
  title, 
  titleHi,
  value, 
  icon, 
  trend,
  trendValue,
  color = 'primary',
  className,
  onClick 
}) => {
  const IconComponent = Icons[icon] || Icons.Activity;
  
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    success: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    destructive: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  };
  
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card 
        onClick={onClick}
        data-testid={`stat-card-${title?.toLowerCase().replace(/\s/g, '-')}`}
        className={cn(
          'p-4 cursor-pointer hover:shadow-md transition-shadow',
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div className={cn('p-2 rounded-lg', colorClasses[color])}>
            <IconComponent className="w-5 h-5" />
          </div>
          {trend && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trend === 'up' ? 'text-green-500' : 'text-red-500'
            )}>
              {trend === 'up' ? (
                <Icons.TrendingUp className="w-3 h-3" />
              ) : (
                <Icons.TrendingDown className="w-3 h-3" />
              )}
              {trendValue}
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
          {titleHi && <p className="text-xs text-muted-foreground">{titleHi}</p>}
        </div>
      </Card>
    </motion.div>
  );
};

// Quick Action Button
export const QuickAction = ({ icon, label, labelHi, onClick, className }) => {
  const IconComponent = Icons[icon] || Icons.Circle;
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      data-testid={`action-${label?.toLowerCase().replace(/\s/g, '-')}`}
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-xl',
        'bg-card border border-border hover:border-primary/50',
        'transition-colors cursor-pointer',
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <IconComponent className="w-5 h-5 text-primary" />
      </div>
      <span className="text-xs font-medium text-center">{label}</span>
    </motion.button>
  );
};

// Activity Feed Item
export const ActivityItem = ({ 
  icon, 
  iconColor = 'primary',
  title, 
  description, 
  timestamp,
  action,
  onActionClick 
}) => {
  const IconComponent = Icons[icon] || Icons.Circle;
  
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    success: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    destructive: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  };
  
  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'अभी';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} मिनट पहले`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} घंटे पहले`;
    return date.toLocaleDateString('hi-IN');
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 py-3"
      data-testid="activity-item"
    >
      <div className={cn('p-2 rounded-lg shrink-0', colorClasses[iconColor])}>
        <IconComponent className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">{formatTime(timestamp)}</p>
      </div>
      {action && (
        <button 
          onClick={onActionClick}
          className="text-xs text-primary font-medium hover:underline shrink-0"
        >
          {action}
        </button>
      )}
    </motion.div>
  );
};
