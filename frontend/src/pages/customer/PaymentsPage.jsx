import React, { useState, useRef } from 'react';
import { PanelLayout } from '@/components/layout/Navigation';
import { Header } from '@/components/layout/Header';
import { PaymentSummaryCard, PaymentHistorySection } from '@/components/payments/PaymentTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

// Mock payment data
const mockPayments = [
  {
    id: 'txn_001',
    type: 'payment',
    serviceName: 'Website Development',
    amount: 500,
    date: '2025-01-15T10:30:00',
    time: '10:30 AM',
    status: 'success',
    transactionId: 'pay_NxM7K8l9p0Q',
    paymentMethod: 'Razorpay'
  },
  {
    id: 'txn_002',
    type: 'advance',
    serviceName: 'Automation Setup',
    amount: 200,
    date: '2025-01-10T14:15:00',
    time: '2:15 PM',
    status: 'success',
    transactionId: 'pay_MwL6J7k8n9P',
    paymentMethod: 'Razorpay'
  },
  {
    id: 'txn_003',
    type: 'payment',
    serviceName: 'Graphic Design',
    amount: 300,
    date: '2024-12-28T09:00:00',
    time: '9:00 AM',
    status: 'success',
    transactionId: 'pay_LvK5I6j7m8O',
    paymentMethod: 'Razorpay'
  },
  {
    id: 'txn_004',
    type: 'refund',
    serviceName: 'Video Editing',
    amount: 100,
    date: '2024-12-20T16:45:00',
    time: '4:45 PM',
    status: 'success',
    transactionId: 'ref_KuJ4H5i6l7N',
    paymentMethod: 'Razorpay'
  }
];

const CustomerPaymentsPage = () => {
  const [payments] = useState(mockPayments);
  const [receiptPayment, setReceiptPayment] = useState(null);
  const receiptRef = useRef(null);
  
  // Calculate totals
  const totalPaid = payments
    .filter(p => p.type === 'payment' && p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalRefunds = payments
    .filter(p => p.type === 'refund' && p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalAdvance = payments
    .filter(p => p.type === 'advance' && p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const pendingPayment = 500; // Mock pending amount
  
  const handleDownloadReceipt = (payment) => {
    setReceiptPayment(payment);
  };
  
  const downloadReceiptAsPng = async () => {
    if (!receiptRef.current) return;
    
    toast.info('Receipt download हो रही है...');
    
    try {
      // Dynamic import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true
      });
      
      // Convert to PNG and download
      const link = document.createElement('a');
      link.download = `AI-Human_Receipt_${receiptPayment.transactionId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.success('Receipt downloaded!');
      setReceiptPayment(null);
    } catch (error) {
      console.error('Receipt download error:', error);
      toast.error('Receipt download में error हुई');
    }
  };
  
  return (
    <PanelLayout panel="customer">
      <Header title="Payments" titleHi="पेमेंट हिस्ट्री" showThemeToggle />
      
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <PaymentSummaryCard
            title="Total Paid"
            titleHi="कुल भुगतान"
            amount={totalPaid}
            icon="paid"
            color="success"
          />
          <PaymentSummaryCard
            title="Pending"
            titleHi="बाकी"
            amount={pendingPayment}
            icon="pending"
            color="warning"
          />
          <PaymentSummaryCard
            title="Advance"
            titleHi="एडवांस"
            amount={totalAdvance}
            icon="advance"
            color="primary"
          />
        </div>
        
        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentHistorySection
              payments={payments}
              onDownloadReceipt={handleDownloadReceipt}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Receipt Preview Modal */}
      <Dialog open={!!receiptPayment} onOpenChange={() => setReceiptPayment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Receipt Preview</DialogTitle>
          </DialogHeader>
          
          {receiptPayment && (
            <>
              {/* Receipt Design */}
              <div 
                ref={receiptRef}
                className="bg-white text-black p-6 rounded-lg"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                {/* Header with Logo */}
                <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
                  <div className="flex justify-center items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">AI</span>
                    </div>
                    <span className="text-2xl font-bold">AI-Human</span>
                  </div>
                  <p className="text-sm text-gray-600">Digital Services Platform</p>
                  <p className="text-xs text-gray-500 mt-1">www.ai-human.services</p>
                </div>
                
                {/* Receipt Title */}
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold uppercase tracking-wider">Payment Receipt</h2>
                  <p className="text-sm text-gray-600">Transaction ID: {receiptPayment.transactionId}</p>
                </div>
                
                {/* Payment Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{new Date(receiptPayment.date).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{receiptPayment.time}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{receiptPayment.serviceName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Payment Type:</span>
                    <span className="font-medium capitalize">{receiptPayment.type}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">{receiptPayment.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600 uppercase">{receiptPayment.status}</span>
                  </div>
                </div>
                
                {/* Amount */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-700">Total Amount:</span>
                    <span className="text-3xl font-bold text-blue-600">₹{receiptPayment.amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="text-center border-t-2 border-gray-800 pt-4">
                  <p className="text-sm text-gray-600 mb-1">Thank you for your payment! 🙏</p>
                  <p className="text-xs text-gray-500">This is a computer generated receipt.</p>
                  <p className="text-xs text-gray-500 mt-2">Contact: support@ai-human.services</p>
                </div>
              </div>
              
              {/* Download Button */}
              <Button 
                onClick={downloadReceiptAsPng} 
                className="w-full mt-4"
                data-testid="download-receipt-png-btn"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PanelLayout>
  );
};

export default CustomerPaymentsPage;
