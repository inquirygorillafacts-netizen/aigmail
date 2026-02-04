import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, AlertCircle, Play, Pause, Settings, FileText, Download, Check, X, MessageSquare, Calendar, Bot, Plus } from 'lucide-react';
import { PanelLayout } from '@/components/layout/Navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SERVICES } from '@/data/services';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Mock data
const mockActiveProjects = [
  {
    id: 'proj_001',
    serviceId: 'website-dev',
    customerName: 'Rahul Kumar',
    status: 'in_progress',
    progress: 60,
    deadline: '2025-02-15',
    nextMilestone: 'Design approval pending',
    startDate: '2025-01-10'
  },
  {
    id: 'proj_002',
    serviceId: 'whatsapp-automation',
    customerName: 'Priya Singh',
    status: 'pending',
    progress: 0,
    deadline: '2025-01-25',
    nextMilestone: 'Requirements gathering',
    startDate: '2025-01-20'
  }
];

const mockServiceRequests = [
  {
    id: 'req_001',
    serviceId: 'voice-automation',
    customerName: 'Amit Kumar',
    budget: '₹500-1000',
    timeline: 'Urgent',
    requestedAt: Date.now() - 7200000,
    details: 'Need voice calling system for sales team'
  },
  {
    id: 'req_002',
    serviceId: 'graphic-design',
    customerName: 'Neha Sharma',
    budget: '₹200-500',
    timeline: 'Flexible',
    requestedAt: Date.now() - 86400000,
    details: 'Social media posts for restaurant'
  }
];

const mockCompletedProjects = [
  {
    id: 'comp_001',
    serviceId: 'website-dev',
    customerName: 'Vikram Joshi',
    completedAt: '2025-01-10',
    revenue: 500,
    rating: 5
  }
];

const mockAutomations = [
  {
    id: 'auto_001',
    name: 'Lead Follow-up',
    trigger: 'New lead in database',
    action: 'Send WhatsApp message',
    status: 'active',
    lastRun: Date.now() - 300000,
    successRate: 95
  },
  {
    id: 'auto_002',
    name: 'Payment Reminder',
    trigger: 'Payment pending 3 days',
    action: 'Send reminder notification',
    status: 'active',
    lastRun: Date.now() - 86400000,
    successRate: 100
  }
];

const ProjectCard = ({ project, onView, onUpdate, onChat }) => {
  const serviceData = SERVICES.find(s => s.id === project.serviceId);
  
  const statusConfig = {
    in_progress: { color: 'text-blue-600 bg-blue-100', label: 'In Progress' },
    pending: { color: 'text-yellow-600 bg-yellow-100', label: 'Pending' },
    completed: { color: 'text-green-600 bg-green-100', label: 'Completed' },
    on_hold: { color: 'text-orange-600 bg-orange-100', label: 'On Hold' }
  };
  
  const config = statusConfig[project.status] || statusConfig.pending;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">{serviceData?.name} for {project.customerName}</h4>
              <p className="text-xs text-muted-foreground">{serviceData?.nameHi}</p>
            </div>
          </div>
          <Badge className={cn('font-normal', config.color)}>
            {config.label}
          </Badge>
        </div>
        
        {project.status === 'in_progress' && (
          <div className="space-y-1 mb-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span>Deadline: {new Date(project.deadline).toLocaleDateString('hi-IN')}</span>
        </div>
        
        {project.nextMilestone && (
          <div className="text-sm bg-muted/50 rounded-lg p-2 mb-3">
            <p className="text-xs text-muted-foreground">Next Milestone:</p>
            <p className="font-medium">• {project.nextMilestone}</p>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onView?.(project)}>View</Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onUpdate?.(project)}>Update</Button>
          <Button size="sm" variant="outline" onClick={() => onChat?.(project)}>
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ServiceRequestCard = ({ request, onAccept, onReject, onChat }) => {
  const serviceData = SERVICES.find(s => s.id === request.serviceId);
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium">{serviceData?.name}</h4>
            <p className="text-sm text-muted-foreground">From: {request.customerName}</p>
          </div>
          <Badge variant="outline">{request.timeline}</Badge>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <p>Budget: {request.budget}</p>
          <p className="line-clamp-2">{request.details}</p>
          <p className="text-xs">
            Requested: {new Date(request.requestedAt).toLocaleDateString('hi-IN')}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" className="flex-1" onClick={() => onAccept?.(request)}>
            <Check className="w-4 h-4 mr-1" /> Accept
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onReject?.(request)}>
            <X className="w-4 h-4 mr-1" /> Reject
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onChat?.(request)}>
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const AutomationCard = ({ automation, onEdit, onToggle }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h4 className="font-medium">{automation.name}</h4>
              <Badge className={automation.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}>
                {automation.status === 'active' ? 'Active ✓' : 'Paused'}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Trigger:</span>
            <span>{automation.trigger}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Action:</span>
            <span>{automation.action}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Last Run: {new Date(automation.lastRun).toLocaleTimeString('hi-IN')}</span>
            <span>Success Rate: {automation.successRate}%</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit?.(automation)}>Edit</Button>
          <Button 
            size="sm" 
            variant={automation.status === 'active' ? 'outline' : 'default'} 
            className="flex-1"
            onClick={() => onToggle?.(automation)}
          >
            {automation.status === 'active' ? <><Pause className="w-4 h-4 mr-1" /> Pause</> : <><Play className="w-4 h-4 mr-1" /> Start</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const OwnerBusinessPage = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [acceptForm, setAcceptForm] = useState({ cost: '', deadline: '', notes: '' });
  
  const handleAcceptRequest = (request) => {
    setSelectedRequest(request);
    setShowAcceptDialog(true);
  };
  
  const confirmAccept = () => {
    toast.success('Service request accepted! Customer को notification भेज दी गई।');
    setShowAcceptDialog(false);
    setSelectedRequest(null);
    setAcceptForm({ cost: '', deadline: '', notes: '' });
  };
  
  const handleRejectRequest = (request) => {
    toast.info('Request rejected');
  };
  
  return (
    <PanelLayout panel="owner">
      <Header title="Business" titleHi="बिज़नेस मैनेजमेंट" showThemeToggle />
      
      <div className="p-4 lg:p-8 pb-24 lg:pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-5 h-auto">
            <TabsTrigger value="active" className="text-xs py-2">Active</TabsTrigger>
            <TabsTrigger value="requests" className="text-xs py-2">
              Requests
              {mockServiceRequests.length > 0 && (
                <span className="ml-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full inline-flex items-center justify-center">
                  {mockServiceRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs py-2">Done</TabsTrigger>
            <TabsTrigger value="automations" className="text-xs py-2">Auto</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs py-2">Reports</TabsTrigger>
          </TabsList>
          
          {/* Active Projects */}
          <TabsContent value="active" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Active Projects ({mockActiveProjects.length})</p>
            </div>
            {mockActiveProjects.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active projects</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {mockActiveProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Service Requests */}
          <TabsContent value="requests" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">New Service Requests ({mockServiceRequests.length})</p>
            {mockServiceRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending requests</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {mockServiceRequests.map((request) => (
                  <ServiceRequestCard 
                    key={request.id} 
                    request={request}
                    onAccept={handleAcceptRequest}
                    onReject={handleRejectRequest}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Completed Projects */}
          <TabsContent value="completed" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">Completed Projects ({mockCompletedProjects.length})</p>
            {mockCompletedProjects.map((project) => {
              const serviceData = SERVICES.find(s => s.id === project.serviceId);
              return (
                <Card key={project.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{serviceData?.name} for {project.customerName}</h4>
                        <p className="text-xs text-muted-foreground">
                          Completed: {new Date(project.completedAt).toLocaleDateString('hi-IN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">₹{project.revenue}</p>
                      <div className="flex items-center gap-1 text-yellow-500">
                        {'★'.repeat(project.rating)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
          
          {/* Automations */}
          <TabsContent value="automations" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Active Automations ({mockAutomations.length})</p>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" /> Create New
              </Button>
            </div>
            <div className="grid gap-4">
              {mockAutomations.map((automation) => (
                <AutomationCard key={automation.id} automation={automation} />
              ))}
            </div>
          </TabsContent>
          
          {/* Reports */}
          <TabsContent value="reports" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Generate Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select defaultValue="revenue">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Revenue Report</SelectItem>
                      <SelectItem value="customers">Customer Report</SelectItem>
                      <SelectItem value="services">Service Performance</SelectItem>
                      <SelectItem value="payments">Payment Collection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="365">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Generate PDF Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Accept Request Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Service Request</DialogTitle>
            <DialogDescription>
              {selectedRequest && `${SERVICES.find(s => s.id === selectedRequest.serviceId)?.name} for ${selectedRequest.customerName}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Estimated Cost (₹)</Label>
              <Input
                type="number"
                value={acceptForm.cost}
                onChange={(e) => setAcceptForm(prev => ({ ...prev, cost: e.target.value }))}
                placeholder="Enter cost"
              />
            </div>
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Input
                type="date"
                value={acceptForm.deadline}
                onChange={(e) => setAcceptForm(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes for Customer (Optional)</Label>
              <Input
                value={acceptForm.notes}
                onChange={(e) => setAcceptForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any initial notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAcceptDialog(false)}>Cancel</Button>
            <Button onClick={confirmAccept}>Confirm & Start</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PanelLayout>
  );
};

export default OwnerBusinessPage;
