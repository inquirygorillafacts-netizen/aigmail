import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const ServiceCard = ({ 
  service, 
  onClick, 
  variant = 'default',
  className,
  isLiked = false,
  onLike
}) => {
  const IconComponent = Icons[service.icon] || Icons.Package;
  
  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        data-testid={`service-card-${service.id}`}
        className={cn(
          'p-4 rounded-xl border border-border bg-card cursor-pointer',
          'hover:border-primary/50 hover:shadow-md transition-all',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <IconComponent className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{service.name}</h4>
            <p className="text-xs text-muted-foreground">₹{service.startingPrice}/mo से</p>
          </div>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      data-testid={`service-card-${service.id}`}
      className={className}
    >
      <Card 
        onClick={onClick}
        className="cursor-pointer overflow-hidden h-full hover:border-primary/50 transition-colors group"
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <IconComponent className="w-6 h-6 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 whitespace-nowrap text-xs">
                {service.freeTrials}x FREE
              </Badge>
              {onLike && (
                <button
                  onClick={(e) => { e.stopPropagation(); onLike(); }}
                  className="p-1.5 rounded-full hover:bg-muted transition-colors"
                  data-testid={`like-${service.id}`}
                >
                  <Icons.Heart 
                    className={cn(
                      'w-5 h-5 transition-colors',
                      isLiked 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-muted-foreground hover:text-red-400'
                    )}
                  />
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h3 className="font-semibold text-base line-clamp-1">{service.name}</h3>
            <p className="text-xs text-muted-foreground">{service.nameHi}</p>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {service.description}
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <p className="text-lg font-bold text-primary">₹{service.startingPrice}</p>
              <p className="text-xs text-muted-foreground">/month से</p>
            </div>
            <Button size="sm" variant="outline" className="rounded-full">
              जानें
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Service Detail Modal Content
export const ServiceDetail = ({ service, onRequest, onCall, onChat }) => {
  const IconComponent = Icons[service.icon] || Icons.Package;
  
  return (
    <div className="space-y-6" data-testid="service-detail">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
          <IconComponent className="w-8 h-8 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold">{service.name}</h2>
          <p className="text-sm text-muted-foreground">{service.nameHi}</p>
          <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            पहले {service.freeTrials} बार FREE!
          </Badge>
        </div>
      </div>
      
      {/* Description */}
      <div>
        <h4 className="font-medium mb-2">About this Service</h4>
        <p className="text-sm text-muted-foreground">{service.description}</p>
        <p className="text-sm text-muted-foreground mt-1">{service.descriptionHi}</p>
      </div>
      
      {/* Deliverables */}
      <div>
        <h4 className="font-medium mb-2">What's Included</h4>
        <ul className="grid grid-cols-2 gap-2">
          {service.deliverables?.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <Icons.CheckCircle className="w-4 h-4 text-green-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Pricing */}
      <div className="bg-muted/50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Starting from</p>
            <p className="text-2xl font-bold text-primary">₹{service.startingPrice}</p>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Timeline</p>
            <p className="font-medium">{service.timeline}</p>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button onClick={onRequest} className="w-full rounded-full" data-testid="request-service-btn">
          <Icons.Send className="w-4 h-4 mr-2" />
          Service Request करें
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onChat} className="rounded-full" data-testid="chat-service-btn">
            <Icons.MessageSquare className="w-4 h-4 mr-2" />
            AI से पूछें
          </Button>
          <Button variant="outline" onClick={onCall} className="rounded-full" data-testid="call-service-btn">
            <Icons.Phone className="w-4 h-4 mr-2" />
            Call करें
          </Button>
        </div>
      </div>
    </div>
  );
};
