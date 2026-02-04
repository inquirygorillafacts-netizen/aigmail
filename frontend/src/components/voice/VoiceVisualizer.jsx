import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// Voice Wave Animation Component
export const VoiceWave = ({ isActive = false, className }) => {
  const bars = [1, 2, 3, 4, 5];
  
  return (
    <div className={cn('flex items-center justify-center gap-1 h-8', className)}>
      {bars.map((bar) => (
        <motion.div
          key={bar}
          className={cn(
            'w-1 bg-gradient-to-t from-primary to-secondary rounded-full',
            isActive ? 'voice-bar' : 'h-2'
          )}
          style={{ height: isActive ? '100%' : '8px' }}
          animate={isActive ? {
            scaleY: [0.3, 1, 0.3],
          } : { scaleY: 0.3 }}
          transition={{
            duration: 0.5,
            repeat: isActive ? Infinity : 0,
            delay: bar * 0.1,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
};

// Main Voice Visualizer Button
export const VoiceVisualizer = ({ 
  isListening = false, 
  isSpeaking = false,
  onPress,
  disabled = false,
  size = 'lg',
  className 
}) => {
  const isActive = isListening || isSpeaking;
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };
  
  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* Pulse Rings */}
      {isActive && (
        <>
          <motion.div
            className="absolute rounded-full bg-primary/20"
            style={{ width: '150%', height: '150%' }}
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute rounded-full bg-primary/30"
            style={{ width: '130%', height: '130%' }}
            animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
          />
        </>
      )}
      
      {/* Main Button */}
      <motion.button
        onClick={onPress}
        disabled={disabled}
        data-testid="voice-button"
        className={cn(
          'relative rounded-full flex items-center justify-center',
          'bg-gradient-to-br from-primary to-primary/80',
          'shadow-[0_8px_32px_rgba(37,99,235,0.3)]',
          'hover:shadow-[0_12px_40px_rgba(37,99,235,0.4)]',
          'transition-all duration-300',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          isActive && 'bg-gradient-to-br from-primary via-purple-500 to-secondary'
        )}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
      >
        {isListening ? (
          <MicOff className="w-1/3 h-1/3 text-white" />
        ) : (
          <Mic className="w-1/3 h-1/3 text-white" />
        )}
      </motion.button>
      
      {/* Status Text */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <motion.p 
          className="text-sm font-medium text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {isListening ? 'सुन रहा है...' : isSpeaking ? 'बोल रहा है...' : 'माइक दबाएं'}
        </motion.p>
      </div>
    </div>
  );
};

// Compact Voice Button for floating use
export const FloatingVoiceButton = ({ 
  isActive = false, 
  onClick,
  className 
}) => {
  return (
    <motion.button
      onClick={onClick}
      data-testid="floating-voice-btn"
      className={cn(
        'fixed bottom-24 right-4 lg:bottom-8 z-40',
        'w-14 h-14 rounded-full',
        'bg-gradient-to-br from-primary to-secondary',
        'shadow-[0_4px_20px_rgba(37,99,235,0.4)]',
        'flex items-center justify-center',
        'hover:scale-105 transition-transform',
        className
      )}
      whileTap={{ scale: 0.9 }}
    >
      {isActive ? (
        <VoiceWave isActive className="scale-75" />
      ) : (
        <Mic className="w-6 h-6 text-white" />
      )}
    </motion.button>
  );
};
