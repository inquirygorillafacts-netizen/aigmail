import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, CreditCard, Receipt, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const PaymentSummaryCard = ({ 
  title, 
  titleHi,
  amount, 
  icon,
  color = 'primary',
  className 
}) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    destructive: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  };
  
  return (
    <Card className={cn('p-4', className)} data-testid={`payment-summary-${title?.toLowerCase().replace(/\s/g, '-')}`}>
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', colorClasses[color])}>
        {icon === 'paid' && <ArrowUpRight className="w-5 h-5" />}
        {icon === 'pending' && <CreditCard className="w-5 h-5" />}
        {icon === 'advance' && <ArrowDownLeft className="w-5 h-5" />}
      </div>
      <p className="text-2xl font-bold">₹{amount.toLocaleString('en-IN')}</p>
      <p className="text-sm text-muted-foreground">{title}</p>
      {titleHi && <p className="text-xs text-muted-foreground">{titleHi}</p>}
    </Card>
  );
};

export const PaymentTimelineItem = ({
  type,
  serviceName,
  amount,
  date,
  time,
  status,
  transactionId,
  paymentMethod,
  onDownloadReceipt
}) => {
  const typeConfig = {
    payment: { icon: ArrowUpRight, iconBg: 'bg-red-100 dark:bg-red-900/30', iconColor: 'text-red-600 dark:text-red-400', label: 'Payment' },
    refund: { icon: ArrowDownLeft, iconBg: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600 dark:text-green-400', label: 'Refund' },
    advance: { icon: CreditCard, iconBg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400', label: 'Advance' }
  };
  
  const statusConfig = {
    success: { badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Success ✓' },
    pending: { badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pending' },
    failed: { badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Failed ✗' }
  };
  
  const config = typeConfig[type] || typeConfig.payment;
  const statusCfg = statusConfig[status] || statusConfig.success;
  const IconComponent = config.icon;
  
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative pl-8 pb-6 last:pb-0" data-testid={`payment-item-${transactionId}`}>
      <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-border last:hidden" />
      <div className={cn('absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center', config.iconBg)}>
        <IconComponent className={cn('w-3 h-3', config.iconColor)} />
      </div>
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium">{serviceName}</p>
            <p className="text-xs text-muted-foreground">{config.label}</p>
          </div>
          <div className="text-right">
            <p className={cn('text-lg font-bold', type === 'refund' ? 'text-green-600' : type === 'payment' ? 'text-red-600' : 'text-primary')}>
              {type === 'refund' ? '+' : '-'}₹{amount.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <div>
            <p>{new Date(date).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <p>{time}</p>
          </div>
          <Badge className={statusCfg.badge}>{statusCfg.label}</Badge>
        </div>
        {paymentMethod && <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><span>via {paymentMethod}</span></div>}
        {transactionId && (
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-mono">ID: {transactionId}</p>
            {status === 'success' && onDownloadReceipt && (
              <Button variant="ghost" size="sm" onClick={onDownloadReceipt} className="h-7 text-xs" data-testid="download-receipt-btn">
                <Download className="w-3 h-3 mr-1" />Receipt
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const PaymentHistorySection = ({ payments = [], onDownloadReceipt }) => {
  if (payments.length === 0) {
    return (
      <div className="text-center py-12" data-testid="empty-payment-history">
        <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">अभी तक कोई payment नहीं हुई है। 😊</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4" data-testid="payment-history">
      {payments.map((payment, i) => (
        <PaymentTimelineItem key={payment.id || i} {...payment} onDownloadReceipt={() => onDownloadReceipt?.(payment)} />
      ))}
    </div>
  );
};
