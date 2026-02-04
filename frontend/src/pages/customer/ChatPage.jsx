import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, User, Send, Paperclip, ArrowLeft, Circle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Navigation';
import { ChatBubble, ChatInput, ChatMessages } from '@/components/chat/ChatComponents';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { sendMessage, subscribeToMessages, uploadFile, rtdb, dbRef, onValue, set } from '@/lib/firebase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CustomerChatPage = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('ai');
  const [aiMessages, setAiMessages] = useState([
    { id: '1', text: 'नमस्ते! मैं AI-Human का assistant हूँ। आपकी क्या मदद कर सकता हूँ? 🙏', senderId: 'ai', senderName: 'AI Assistant', timestamp: Date.now() - 60000 }
  ]);
  const [ownerMessages, setOwnerMessages] = useState([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [ownerTyping, setOwnerTyping] = useState(false);
  const [ownerOnline, setOwnerOnline] = useState(false);
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // Owner ID - In production, fetch from config or database
  const OWNER_ID = 'owner';
  const chatId = userData?.uid ? `${userData.uid}_${OWNER_ID}` : null;
  
  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [aiMessages, ownerMessages]);
  
  // Subscribe to owner messages
  useEffect(() => {
    if (!chatId) return;
    
    const unsubscribe = subscribeToMessages(chatId, (messages) => {
      setOwnerMessages(messages.map(msg => ({
        ...msg,
        senderId: msg.senderId,
        senderName: msg.senderId === userData?.uid ? userData?.displayName : 'Owner',
        senderPhoto: msg.senderId === userData?.uid ? userData?.photoURL : null
      })));
    });
    
    return () => unsubscribe?.();
  }, [chatId, userData]);
  
  // Subscribe to owner online status & typing indicator
  useEffect(() => {
    if (!chatId) return;
    
    // Owner online status
    const onlineRef = dbRef(rtdb, `presence/owner`);
    const unsubOnline = onValue(onlineRef, (snapshot) => {
      setOwnerOnline(snapshot.val()?.online || false);
    });
    
    // Owner typing indicator
    const typingRef = dbRef(rtdb, `typing/${chatId}/owner`);
    const unsubTyping = onValue(typingRef, (snapshot) => {
      setOwnerTyping(snapshot.val()?.typing || false);
    });
    
    return () => {
      unsubOnline();
      unsubTyping();
    };
  }, [chatId]);
  
  // Set user typing indicator
  const setUserTyping = async (isTyping) => {
    if (!chatId) return;
    const typingRef = dbRef(rtdb, `typing/${chatId}/customer`);
    await set(typingRef, { typing: isTyping, timestamp: Date.now() });
  };
  
  // AI Chat Handler
  const handleAiChat = async (message) => {
    if (!message.trim()) return;
    
    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      text: message,
      senderId: userData?.uid || 'user',
      senderName: userData?.displayName || 'You',
      senderPhoto: userData?.photoURL,
      timestamp: Date.now()
    };
    setAiMessages(prev => [...prev, userMsg]);
    setIsAiTyping(true);
    
    try {
      // Call Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.REACT_APP_GOOGLE_AI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { 
                role: 'user', 
                parts: [{ 
                  text: `You are a helpful AI assistant for AI-Human Services. Help users with questions about services (website development, app development, automation, marketing, etc.). Be friendly, professional, and respond in Hinglish (Hindi + English mix). Keep responses concise.

User question: ${message}` 
                }] 
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 300
            }
          })
        }
      );
      
      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
        "Sorry, कुछ technical issue है। कृपया दोबारा try करें।";
      
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        senderId: 'ai',
        senderName: 'AI Assistant',
        timestamp: Date.now()
      };
      setAiMessages(prev => [...prev, aiMsg]);
      
    } catch (error) {
      console.error('AI chat error:', error);
      toast.error('AI response में error हुई');
    } finally {
      setIsAiTyping(false);
    }
  };
  
  // Owner Chat Handler
  const handleOwnerChat = async (message) => {
    if (!message.trim() || !chatId) return;
    
    try {
      await sendMessage(chatId, {
        text: message,
        senderId: userData?.uid,
        senderName: userData?.displayName,
        senderPhoto: userData?.photoURL,
        type: 'text'
      });
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Message भेजने में error हुई');
    }
  };
  
  // File Upload Handler
  const handleFileUpload = async (file) => {
    if (!chatId) return;
    
    try {
      toast.info('File upload हो रही है...');
      const path = `chats/${chatId}/${Date.now()}_${file.name}`;
      const url = await uploadFile(file, path);
      
      const fileType = file.type.startsWith('image/') ? 'image' : 
                       file.type.startsWith('video/') ? 'video' : 'document';
      
      await sendMessage(chatId, {
        text: file.name,
        senderId: userData?.uid,
        senderName: userData?.displayName,
        senderPhoto: userData?.photoURL,
        type: 'file',
        isFile: true,
        fileType,
        fileUrl: url,
        fileName: file.name
      });
      
      toast.success('File sent successfully!');
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('File upload में error हुई');
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar panel="customer" />
      
      <main className="lg:pl-64">
        <div className="flex flex-col h-screen">
          {/* Custom Header for Chat - Mobile shows back button */}
          <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
            <div className="flex items-center h-14 px-4">
              {/* Mobile Back Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden mr-2"
                onClick={() => navigate('/customer/home')}
                data-testid="chat-back-btn"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <h1 className="text-lg font-semibold">Chat / चैट</h1>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 pt-2 shrink-0">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="ai" className="gap-2" data-testid="tab-ai-chat">
                  <Bot className="w-4 h-4" />
                  AI Chat
                </TabsTrigger>
                <TabsTrigger value="owner" className="gap-2" data-testid="tab-owner-chat">
                  <User className="w-4 h-4" />
                  <span className="flex items-center gap-1">
                    Owner Chat
                    {ownerOnline && <Circle className="w-2 h-2 fill-green-500 text-green-500" />}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* AI Chat Tab */}
            <TabsContent value="ai" className="flex-1 flex flex-col m-0 overflow-hidden">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-2xl mx-auto pb-4">
                  {aiMessages.map((msg) => (
                    <ChatBubble
                      key={msg.id}
                      message={msg.text}
                      isOwn={msg.senderId !== 'ai'}
                      senderName={msg.senderName}
                      senderPhoto={msg.senderPhoto}
                      timestamp={msg.timestamp}
                      status="read"
                    />
                  ))}
                  {isAiTyping && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                      <motion.div 
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="text-sm"
                      >
                        AI typing...
                      </motion.div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              {/* AI Chat Input - Fixed at bottom */}
              <div className="shrink-0 border-t border-border bg-background">
                <div className="max-w-2xl mx-auto w-full">
                  <ChatInput
                    onSend={handleAiChat}
                    placeholder="AI से पूछें..."
                    disabled={isAiTyping}
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Owner Chat Tab */}
            <TabsContent value="owner" className="flex-1 flex flex-col m-0 overflow-hidden">
              {/* Owner Status Bar */}
              <div className="px-4 py-2 border-b border-border flex items-center gap-2 shrink-0">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>O</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">Owner</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Circle className={cn("w-2 h-2", ownerOnline ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400")} />
                    {ownerOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-2xl mx-auto pb-4">
                  {ownerMessages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Owner से बातचीत शुरू करें!</p>
                      <p className="text-sm mt-2">आप photos, videos, documents भी share कर सकते हैं।</p>
                    </div>
                  ) : (
                    ownerMessages.map((msg) => (
                      <ChatBubble
                        key={msg.id}
                        message={msg.text}
                        isOwn={msg.senderId === userData?.uid}
                        senderName={msg.senderName}
                        senderPhoto={msg.senderPhoto}
                        timestamp={msg.timestamp}
                        status={msg.status}
                        isFile={msg.isFile}
                        fileType={msg.fileType}
                        fileUrl={msg.fileUrl}
                        fileName={msg.fileName}
                      />
                    ))
                  )}
                  {ownerTyping && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>O</AvatarFallback>
                      </Avatar>
                      <motion.div 
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="text-sm bg-muted px-3 py-2 rounded-full"
                      >
                        typing...
                      </motion.div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              {/* Owner Chat Input - Fixed at bottom */}
              <div className="shrink-0 border-t border-border bg-background">
                <div className="max-w-2xl mx-auto w-full">
                  <ChatInput
                    onSend={handleOwnerChat}
                    onFileSelect={handleFileUpload}
                    placeholder="Owner को message भेजें..."
                    onTyping={setUserTyping}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* NO Bottom Nav on Chat Page for Mobile - WhatsApp style */}
    </div>
  );
};

export default CustomerChatPage;
