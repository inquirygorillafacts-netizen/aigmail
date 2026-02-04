import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Smile, Image, FileText, Video, X, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Single Chat Message Bubble
export const ChatBubble = ({ 
  message, 
  isOwn = false, 
  senderName,
  senderPhoto,
  timestamp,
  status, // sent, delivered, read
  isFile = false,
  fileType,
  fileUrl,
  fileName
}) => {
  const formatTime = (ts) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
  };
  
  const StatusIcon = () => {
    if (!isOwn) return null;
    if (status === 'read') return <CheckCheck className="w-3 h-3 text-primary" />;
    if (status === 'delivered') return <CheckCheck className="w-3 h-3" />;
    return <Check className="w-3 h-3" />;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        'flex gap-2 max-w-[85%]',
        isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      {!isOwn && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={senderPhoto} />
          <AvatarFallback>{senderName?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={cn(
        'rounded-2xl px-4 py-2',
        isOwn 
          ? 'bg-primary text-primary-foreground rounded-tr-sm' 
          : 'bg-muted rounded-tl-sm'
      )}>
        {isFile ? (
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:underline"
          >
            {fileType === 'image' && <Image className="w-4 h-4" />}
            {fileType === 'video' && <Video className="w-4 h-4" />}
            {fileType === 'document' && <FileText className="w-4 h-4" />}
            <span className="text-sm truncate max-w-[200px]">{fileName}</span>
          </a>
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">{message}</p>
        )}
        
        <div className={cn(
          'flex items-center gap-1 mt-1',
          isOwn ? 'justify-start' : 'justify-end'
        )}>
          <span className={cn(
            'text-[10px]',
            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}>
            {formatTime(timestamp)}
          </span>
          <StatusIcon />
        </div>
      </div>
    </motion.div>
  );
};

// Chat Input Component
export const ChatInput = ({ 
  onSend, 
  onFileSelect,
  placeholder = "Type a message...",
  disabled = false,
  onTyping 
}) => {
  const [message, setMessage] = useState('');
  const [showAttachment, setShowAttachment] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
      onTyping?.(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    // Handle typing indicator
    if (onTyping) {
      onTyping(true);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set typing to false after 2 seconds of no typing
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
    setShowAttachment(false);
  };
  
  return (
    <div className="relative border-t border-border bg-background p-3">
      {/* Attachment Menu */}
      <AnimatePresence>
        {showAttachment && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 right-0 p-3 bg-card border-t border-border"
          >
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-muted transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs">Document</span>
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-muted transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                  <Image className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs">Photo</span>
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-muted transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs">Video</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,video/*,.pdf,.doc,.docx"
      />
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowAttachment(!showAttachment)}
          disabled={disabled}
          data-testid="attachment-btn"
        >
          {showAttachment ? <X className="w-5 h-5" /> : <Paperclip className="w-5 h-5" />}
        </Button>
        
        <Input
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 rounded-full"
          data-testid="chat-input"
        />
        
        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          size="icon"
          className="rounded-full"
          data-testid="send-btn"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

// Chat Messages Container
export const ChatMessages = ({ messages = [], currentUserId, className }) => {
  const scrollRef = useRef(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  return (
    <ScrollArea 
      ref={scrollRef}
      className={cn('flex-1 p-4', className)}
      data-testid="chat-messages"
    >
      <div className="space-y-3">
        {messages.map((msg, i) => (
          <ChatBubble
            key={msg.id || i}
            message={msg.text}
            isOwn={msg.senderId === currentUserId}
            senderName={msg.senderName}
            senderPhoto={msg.senderPhoto}
            timestamp={msg.timestamp}
            status={msg.status}
            isFile={msg.isFile}
            fileType={msg.fileType}
            fileUrl={msg.fileUrl}
            fileName={msg.fileName}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

// Chat List Item (for owner panel)
export const ChatListItem = ({ 
  user, 
  lastMessage, 
  unreadCount = 0, 
  onClick,
  isActive = false 
}) => {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      data-testid={`chat-item-${user.uid}`}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors',
        isActive ? 'bg-primary/10' : 'hover:bg-muted'
      )}
    >
      <div className="relative">
        <Avatar className="w-12 h-12">
          <AvatarImage src={user.photoURL} />
          <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-medium rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm truncate">{user.displayName}</h4>
          <span className="text-xs text-muted-foreground">
            {lastMessage?.timestamp && new Date(lastMessage.timestamp).toLocaleDateString('hi-IN')}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {lastMessage?.text || 'No messages yet'}
        </p>
      </div>
    </motion.div>
  );
};
