import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { PanelLayout } from '@/components/layout/Navigation';
import { Header } from '@/components/layout/Header';
import { ChatListItem, ChatBubble, ChatInput } from '@/components/chat/ChatComponents';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { sendMessage, subscribeToMessages, uploadFile } from '@/lib/firebase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Mock customers for chat
const mockChatUsers = [
  {
    uid: 'cust_001',
    displayName: 'Rahul Kumar',
    photoURL: null,
    lastMessage: { text: 'Website के बारे में पूछना था...', timestamp: Date.now() - 120000 },
    unreadCount: 2
  },
  {
    uid: 'cust_002',
    displayName: 'Priya Singh',
    photoURL: null,
    lastMessage: { text: 'Thank you so much!', timestamp: Date.now() - 86400000 },
    unreadCount: 0
  },
  {
    uid: 'cust_003',
    displayName: 'Amit Kumar',
    photoURL: null,
    lastMessage: { text: 'Project kab complete hoga?', timestamp: Date.now() - 172800000 },
    unreadCount: 0
  }
];

const OwnerChatPage = () => {
  const { userData } = useAuth();
  const [chatUsers, setChatUsers] = useState(mockChatUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get chat ID
  const getChatId = (userId) => `${userId}_owner`;
  
  // Subscribe to messages when user is selected
  useEffect(() => {
    if (!selectedUser) return;
    
    const chatId = getChatId(selectedUser.uid);
    
    // Mock messages for demo
    setMessages([
      { id: '1', text: 'Hello! मुझे website के बारे में जानना था।', senderId: selectedUser.uid, senderName: selectedUser.displayName, timestamp: Date.now() - 300000 },
      { id: '2', text: 'हाँ जी, बताइए क्या जानना है?', senderId: 'owner', senderName: 'You', timestamp: Date.now() - 240000 },
      { id: '3', text: 'कितने दिन में बन जाएगी?', senderId: selectedUser.uid, senderName: selectedUser.displayName, timestamp: Date.now() - 180000 }
    ]);
    
    // In production, subscribe to real messages
    // const unsubscribe = subscribeToMessages(chatId, setMessages);
    // return () => unsubscribe?.();
    
    // Mark as read
    setChatUsers(prev => prev.map(u => 
      u.uid === selectedUser.uid ? { ...u, unreadCount: 0 } : u
    ));
  }, [selectedUser]);
  
  const handleSendMessage = async (text) => {
    if (!text.trim() || !selectedUser) return;
    
    const newMessage = {
      id: Date.now().toString(),
      text,
      senderId: 'owner',
      senderName: 'You',
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Update last message in list
    setChatUsers(prev => prev.map(u => 
      u.uid === selectedUser.uid 
        ? { ...u, lastMessage: { text, timestamp: Date.now() } }
        : u
    ));
    
    // In production:
    // const chatId = getChatId(selectedUser.uid);
    // await sendMessage(chatId, { text, senderId: 'owner', senderName: userData?.displayName });
  };
  
  const handleFileUpload = async (file) => {
    if (!selectedUser) return;
    
    toast.info('File upload feature coming soon!');
    
    // In production:
    // const chatId = getChatId(selectedUser.uid);
    // const path = `chats/${chatId}/${Date.now()}_${file.name}`;
    // const url = await uploadFile(file, path);
    // await sendMessage(chatId, { ... });
  };
  
  const filteredUsers = chatUsers.filter(user => 
    !searchQuery || user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalUnread = chatUsers.reduce((sum, u) => sum + u.unreadCount, 0);
  
  return (
    <PanelLayout panel="owner">
      <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen">
        <Header 
          title="Chat" 
          titleHi="चैट"
          showThemeToggle
        />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Chat List */}
          <div className={cn(
            'w-full lg:w-80 border-r border-border flex flex-col',
            selectedUser && 'hidden lg:flex'
          )}>
            {/* Search */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats..."
                  className="pl-10"
                  data-testid="chat-search"
                />
              </div>
            </div>
            
            {/* Chat List */}
            <ScrollArea className="flex-1">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No chats found
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <ChatListItem
                    key={user.uid}
                    user={user}
                    lastMessage={user.lastMessage}
                    unreadCount={user.unreadCount}
                    onClick={() => setSelectedUser(user)}
                    isActive={selectedUser?.uid === user.uid}
                  />
                ))
              )}
            </ScrollArea>
          </div>
          
          {/* Chat Area */}
          <div className={cn(
            'flex-1 flex flex-col',
            !selectedUser && 'hidden lg:flex'
          )}>
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setSelectedUser(null)}
                  >
                    ←
                  </Button>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedUser.photoURL} />
                    <AvatarFallback>{selectedUser.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-medium">{selectedUser.displayName}</h3>
                    <p className="text-xs text-muted-foreground">Customer</p>
                  </div>
                </div>
                
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <ChatBubble
                        key={msg.id}
                        message={msg.text}
                        isOwn={msg.senderId === 'owner'}
                        senderName={msg.senderName}
                        timestamp={msg.timestamp}
                        status="read"
                      />
                    ))}
                  </div>
                </ScrollArea>
                
                {/* Input */}
                <ChatInput
                  onSend={handleSendMessage}
                  onFileSelect={handleFileUpload}
                  placeholder="Type a message..."
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg font-medium">Select a chat</p>
                  <p className="text-sm">Choose a customer to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PanelLayout>
  );
};

export default OwnerChatPage;
