import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, User, Send, ArrowLeft, Circle, Phone, MoreVertical } from 'lucide-react';
import { Sidebar } from '@/components/layout/Navigation';
import { ChatBubble, ChatInput } from '@/components/chat/ChatComponents';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  sendMessage, 
  subscribeToMessages, 
  uploadFile, 
  rtdb, 
  dbRef, 
  onValue, 
  set,
  getOwnerData,
  setUserPresence,
  subscribeToPresence
} from '@/lib/firebase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CustomerChatPage = () => {
  const navigate = useNavigate();
  const { userData, user } = useAuth();
  const [activeTab, setActiveTab] = useState('owner');
  const [aiMessages, setAiMessages] = useState([
    { id: '1', text: 'नमस्ते! मैं AI-Human का assistant हूँ। आपकी क्या मदद कर सकता हूँ? 🙏', senderId: 'ai', senderName: 'AI Assistant', timestamp: Date.now() - 60000 }
  ]);
  const [ownerMessages, setOwnerMessages] = useState([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [ownerTyping, setOwnerTyping] = useState(false);
  const [ownerOnline, setOwnerOnline] = useState(false);
  const [ownerData, setOwnerData] = useState(null);
  const messagesEndRef = useRef(null);
  const isActiveRef = useRef(true);
  
  // Chat ID format: customerUid_owner
  const chatId = userData?.uid ? `${userData.uid}_owner` : null;
  
  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [aiMessages, ownerMessages]);
  
  // Set user presence and track app visibility
  useEffect(() => {
    if (!userData?.uid) return;
    
    // Set online
    setUserPresence(userData.uid, true);
    
    // Handle visibility change
    const handleVisibilityChange = () => {
      isActiveRef.current = document.visibilityState === 'visible';
      setUserPresence(userData.uid, document.visibilityState === 'visible');
    };
    
    // Handle page unload
    const handleUnload = () => {
      setUserPresence(userData.uid, false);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleUnload);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleUnload);
      setUserPresence(userData.uid, false);
    };
  }, [userData?.uid]);
  
  // Fetch owner data
  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const owner = await getOwnerData();
        setOwnerData(owner);
      } catch (error) {
        console.error('Error fetching owner:', error);
      }
    };
    fetchOwner();
  }, []);
  
  // Subscribe to owner messages (Real-time)
  useEffect(() => {
    if (!chatId) return;
    
    const unsubscribe = subscribeToMessages(chatId, (messages) => {
      setOwnerMessages(messages.map(msg => ({
        ...msg,
        senderName: msg.senderId === userData?.uid ? userData?.displayName : (ownerData?.displayName || 'Owner'),
        senderPhoto: msg.senderId === userData?.uid ? userData?.photoURL : ownerData?.photoURL
      })));
    });
    
    return () => unsubscribe?.();
  }, [chatId, userData, ownerData]);
  
  // Subscribe to owner presence
  useEffect(() => {
    if (!ownerData?.uid) return;
    
    const unsubscribe = subscribeToPresence(ownerData.uid, (presence) => {
      setOwnerOnline(presence?.online || false);
    });
    
    return () => unsubscribe?.();
  }, [ownerData?.uid]);
  
  // Subscribe to owner typing indicator
  useEffect(() => {
    if (!chatId) return;
    
    const typingRef = dbRef(rtdb, `typing/${chatId}/owner`);
    const unsubTyping = onValue(typingRef, (snapshot) => {
      setOwnerTyping(snapshot.val()?.typing || false);
    });
    
    return () => unsubTyping();
  }, [chatId]);
  
  // Set user typing indicator
  const setUserTyping = async (isTyping) => {
    if (!chatId) return;
    const typingRef = dbRef(rtdb, `typing/${chatId}/customer`);
    await set(typingRef, { typing: isTyping, timestamp: Date.now() });
  };
  
  // Send FCM notification to owner
  const sendNotificationToOwner = async (messageText) => {
    if (!ownerData?.uid) return;
    
    try {
      await axios.post(`${API_URL}/api/fcm/send`, {
        user_id: ownerData.uid,
        title: `💬 ${userData?.displayName || 'Customer'}`,
        body: messageText.substring(0, 100),
        data: {
          type: 'chat_message',
          chatId: chatId,
          senderId: userData?.uid,
          senderName: userData?.displayName,
          senderPhoto: userData?.photoURL || '',
          click_action: `/owner/chat/${userData?.uid}`
        }
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };
  
  // AI Chat Handler
  const handleAiChat = async (message) => {
    if (!message.trim()) return;
    
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
                  text: `You are a helpful AI assistant for AI-Human Services. Help users with questions about services. Be friendly and respond in Hinglish. Keep responses concise.\n\nUser: ${message}` 
                }] 
              }
            ],
            generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
          })
        }
      );
      
      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, कुछ technical issue है।";
      
      setAiMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: aiText,
        senderId: 'ai',
        senderName: 'AI Assistant',
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error('AI chat error:', error);
      toast.error('AI response में error हुई');
    } finally {
      setIsAiTyping(false);
    }
  };
  
  // Owner Chat Handler - Real-time with FCM
  const handleOwnerChat = async (message) => {
    if (!message.trim() || !chatId) return;
    
    try {
      // Send message to Firebase RTDB
      await sendMessage(chatId, {
        text: message,
        senderId: userData?.uid,
        senderName: userData?.displayName,
        senderPhoto: userData?.photoURL || '',
        type: 'text',
        status: 'sent'
      });
      
      // Send FCM notification to owner (if owner is not online/active)
      if (!ownerOnline) {
        await sendNotificationToOwner(message);
      }
      
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
        senderPhoto: userData?.photoURL || '',
        type: 'file',
        isFile: true,
        fileType,
        fileUrl: url,
        fileName: file.name,
        status: 'sent'
      });
      
      // Send notification for file
      if (!ownerOnline) {
        await sendNotificationToOwner(`📎 ${file.name}`);
      }
      
      toast.success('File sent!');
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('File upload में error हुई');
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar panel="customer" />
      
      <main className="lg:pl-64">
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
            <div className="flex items-center h-14 px-4">
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
                <TabsTrigger value="owner" className="gap-2" data-testid="tab-owner-chat">
                  <User className="w-4 h-4" />
                  <span className="flex items-center gap-1">
                    Owner
                    {ownerOnline && <Circle className="w-2 h-2 fill-green-500 text-green-500" />}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="ai" className="gap-2" data-testid="tab-ai-chat">
                  <Bot className="w-4 h-4" />
                  AI Chat
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Owner Chat Tab */}
            <TabsContent value="owner" className="flex-1 flex flex-col m-0 overflow-hidden">
              {/* Owner Info Bar */}
              <div className="px-4 py-3 border-b border-border flex items-center gap-3 shrink-0 bg-card">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={ownerData?.photoURL} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {ownerData?.displayName?.charAt(0) || 'O'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{ownerData?.displayName || 'Owner'}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Circle className={cn(
                      "w-2 h-2",
                      ownerOnline ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400"
                    )} />
                    {ownerOnline ? 'Online' : 'Offline - Message भेजें, notification जाएगी'}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Phone className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-2xl mx-auto pb-4">
                  {ownerMessages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">Owner से बातचीत शुरू करें!</p>
                      <p className="text-sm mt-2">
                        {ownerOnline 
                          ? 'Owner online हैं - तुरंत reply मिलेगा' 
                          : 'Owner offline हैं - message भेजें, notification जाएगी'}
                      </p>
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
                        <AvatarImage src={ownerData?.photoURL} />
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
              
              {/* Input */}
              <div className="shrink-0 border-t border-border bg-background">
                <div className="max-w-2xl mx-auto w-full">
                  <ChatInput
                    onSend={handleOwnerChat}
                    onFileSelect={handleFileUpload}
                    placeholder="Message लिखें..."
                    onTyping={setUserTyping}
                  />
                </div>
              </div>
            </TabsContent>
            
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
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default CustomerChatPage;
