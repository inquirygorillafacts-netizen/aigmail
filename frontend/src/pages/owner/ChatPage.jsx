import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, Circle, Phone, MoreVertical, Users, MessageSquare } from 'lucide-react';
import { PanelLayout } from '@/components/layout/Navigation';
import { Header } from '@/components/layout/Header';
import { ChatListItem, ChatBubble, ChatInput } from '@/components/chat/ChatComponents';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  sendMessage, 
  subscribeToMessages, 
  uploadFile,
  getAllCustomers,
  subscribeToAllChats,
  setUserPresence,
  subscribeToPresence,
  rtdb,
  dbRef,
  set,
  onValue
} from '@/lib/firebase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const OwnerChatPage = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userPresence, setUserPresenceState] = useState({});
  const [customerTyping, setCustomerTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const isActiveRef = useRef(true);
  
  // Get chat ID
  const getChatId = (userId) => `${userId}_owner`;
  
  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Set owner presence
  useEffect(() => {
    if (!userData?.uid) return;
    
    setUserPresence(userData.uid, true);
    
    const handleVisibilityChange = () => {
      isActiveRef.current = document.visibilityState === 'visible';
      setUserPresence(userData.uid, document.visibilityState === 'visible');
    };
    
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
  
  // Fetch all customers from Firestore
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const allCustomers = await getAllCustomers();
        // Filter out owner from customers
        const filteredCustomers = allCustomers.filter(c => c.uid !== userData?.uid);
        setCustomers(filteredCustomers);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    fetchCustomers();
  }, [userData?.uid]);
  
  // Subscribe to all chats metadata
  useEffect(() => {
    const unsubscribe = subscribeToAllChats((chats) => {
      setChatList(chats);
    });
    return () => unsubscribe?.();
  }, []);
  
  // Subscribe to customer presence
  useEffect(() => {
    const unsubscribes = [];
    
    customers.forEach(customer => {
      const unsub = subscribeToPresence(customer.uid, (presence) => {
        setUserPresenceState(prev => ({
          ...prev,
          [customer.uid]: presence
        }));
      });
      unsubscribes.push(unsub);
    });
    
    return () => unsubscribes.forEach(unsub => unsub?.());
  }, [customers]);
  
  // Handle URL parameter for direct chat
  useEffect(() => {
    if (customerId && customers.length > 0) {
      const customer = customers.find(c => c.uid === customerId);
      if (customer) {
        setSelectedUser(customer);
      }
    }
  }, [customerId, customers]);
  
  // Subscribe to messages when user is selected
  useEffect(() => {
    if (!selectedUser) return;
    
    const chatId = getChatId(selectedUser.uid);
    
    const unsubscribe = subscribeToMessages(chatId, (msgs) => {
      setMessages(msgs.map(msg => ({
        ...msg,
        senderName: msg.senderId === userData?.uid ? 'You' : selectedUser.displayName,
        senderPhoto: msg.senderId === userData?.uid ? userData?.photoURL : selectedUser.photoURL
      })));
    });
    
    return () => unsubscribe?.();
  }, [selectedUser, userData]);
  
  // Subscribe to customer typing
  useEffect(() => {
    if (!selectedUser) return;
    
    const chatId = getChatId(selectedUser.uid);
    const typingRef = dbRef(rtdb, `typing/${chatId}/customer`);
    
    const unsubTyping = onValue(typingRef, (snapshot) => {
      const data = snapshot.val();
      // Only show typing if recent (within 3 seconds)
      setCustomerTyping(data?.typing && (Date.now() - (data?.timestamp || 0)) < 3000);
    });
    
    return () => unsubTyping();
  }, [selectedUser]);
  
  // Set owner typing indicator
  const setOwnerTyping = async (isTyping) => {
    if (!selectedUser) return;
    const chatId = getChatId(selectedUser.uid);
    const typingRef = dbRef(rtdb, `typing/${chatId}/owner`);
    await set(typingRef, { typing: isTyping, timestamp: Date.now() });
  };
  
  // Send FCM notification to customer
  const sendNotificationToCustomer = async (customerId, messageText) => {
    try {
      await axios.post(`${API_URL}/api/fcm/send`, {
        user_id: customerId,
        title: `💬 ${userData?.displayName || 'Owner'}`,
        body: messageText.substring(0, 100),
        data: {
          type: 'chat_message',
          chatId: getChatId(customerId),
          senderId: userData?.uid,
          senderName: userData?.displayName || 'Owner',
          senderPhoto: userData?.photoURL || '',
          click_action: '/customer/chat'
        }
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };
  
  // Send message handler
  const handleSendMessage = async (text) => {
    if (!text.trim() || !selectedUser) return;
    
    const chatId = getChatId(selectedUser.uid);
    
    try {
      await sendMessage(chatId, {
        text,
        senderId: userData?.uid,
        senderName: userData?.displayName || 'Owner',
        senderPhoto: userData?.photoURL || '',
        type: 'text',
        status: 'sent'
      });
      
      // Send FCM notification if customer is offline
      const customerPresence = userPresence[selectedUser.uid];
      if (!customerPresence?.online) {
        await sendNotificationToCustomer(selectedUser.uid, text);
      }
      
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Message भेजने में error हुई');
    }
  };
  
  // File upload handler
  const handleFileUpload = async (file) => {
    if (!selectedUser) return;
    
    try {
      toast.info('File upload हो रही है...');
      const chatId = getChatId(selectedUser.uid);
      const path = `chats/${chatId}/${Date.now()}_${file.name}`;
      const url = await uploadFile(file, path);
      
      const fileType = file.type.startsWith('image/') ? 'image' : 
                       file.type.startsWith('video/') ? 'video' : 'document';
      
      await sendMessage(chatId, {
        text: file.name,
        senderId: userData?.uid,
        senderName: userData?.displayName || 'Owner',
        senderPhoto: userData?.photoURL || '',
        type: 'file',
        isFile: true,
        fileType,
        fileUrl: url,
        fileName: file.name,
        status: 'sent'
      });
      
      // Send notification
      const customerPresence = userPresence[selectedUser.uid];
      if (!customerPresence?.online) {
        await sendNotificationToCustomer(selectedUser.uid, `📎 ${file.name}`);
      }
      
      toast.success('File sent!');
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('File upload में error हुई');
    }
  };
  
  // Merge customers with chat data
  const getCustomersWithChats = () => {
    return customers.map(customer => {
      const chatId = getChatId(customer.uid);
      const chatData = chatList.find(c => c.chatId === chatId);
      const presence = userPresence[customer.uid];
      
      return {
        ...customer,
        lastMessage: chatData ? {
          text: chatData.lastMessage,
          timestamp: chatData.lastMessageTime
        } : null,
        unreadCount: chatData?.lastSenderId !== userData?.uid ? 1 : 0,
        isOnline: presence?.online || false
      };
    }).sort((a, b) => {
      // Sort by last message time, then by online status
      const aTime = a.lastMessage?.timestamp || 0;
      const bTime = b.lastMessage?.timestamp || 0;
      if (bTime !== aTime) return bTime - aTime;
      return (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0);
    });
  };
  
  const customersWithChats = getCustomersWithChats();
  
  const filteredUsers = customersWithChats.filter(user => 
    !searchQuery || 
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <PanelLayout panel="owner">
      <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen">
        <Header 
          title="Customer Chats" 
          titleHi="कस्टमर चैट"
          showThemeToggle
        />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Chat List */}
          <div className={cn(
            'w-full lg:w-80 border-r border-border flex flex-col bg-card',
            selectedUser && 'hidden lg:flex'
          )}>
            {/* Search & Stats */}
            <div className="p-4 border-b border-border space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customers..."
                  className="pl-10"
                  data-testid="chat-search"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {customers.length} Customers
                </span>
                <span className="flex items-center gap-1">
                  <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                  {Object.values(userPresence).filter(p => p?.online).length} Online
                </span>
              </div>
            </div>
            
            {/* Customer List */}
            <ScrollArea className="flex-1">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No customers found</p>
                  <p className="text-sm mt-2">Customers will appear here when they sign up</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.uid}
                    onClick={() => {
                      setSelectedUser(user);
                      navigate(`/owner/chat/${user.uid}`, { replace: true });
                    }}
                    className={cn(
                      'flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-border/50',
                      selectedUser?.uid === user.uid ? 'bg-primary/10' : 'hover:bg-muted'
                    )}
                    data-testid={`chat-user-${user.uid}`}
                  >
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.photoURL} />
                        <AvatarFallback className="bg-primary/10">
                          {user.displayName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {user.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm truncate">{user.displayName}</h4>
                        {user.lastMessage?.timestamp && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(user.lastMessage.timestamp).toLocaleDateString('hi-IN')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.lastMessage?.text || user.email || 'New customer'}
                      </p>
                    </div>
                    {user.unreadCount > 0 && (
                      <Badge className="bg-primary text-primary-foreground text-xs">
                        {user.unreadCount}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
          
          {/* Chat Area */}
          <div className={cn(
            'flex-1 flex flex-col bg-background',
            !selectedUser && 'hidden lg:flex'
          )}>
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center gap-3 bg-card">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="lg:hidden"
                    onClick={() => {
                      setSelectedUser(null);
                      navigate('/owner/chat', { replace: true });
                    }}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedUser.photoURL} />
                      <AvatarFallback>{selectedUser.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {userPresence[selectedUser.uid]?.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{selectedUser.displayName}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {userPresence[selectedUser.uid]?.online ? (
                        <>
                          <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                          Online
                        </>
                      ) : (
                        <>
                          <Circle className="w-2 h-2 fill-gray-400 text-gray-400" />
                          Offline - notification जाएगी
                        </>
                      )}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Phone className="w-5 h-5" />
                  </Button>
                </div>
                
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4 max-w-3xl mx-auto">
                    {messages.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">{selectedUser.displayName} से chat शुरू करें</p>
                        <p className="text-sm mt-2">
                          {userPresence[selectedUser.uid]?.online 
                            ? 'Customer online है - तुरंत reply मिलेगा' 
                            : 'Customer offline है - notification भेजी जाएगी'}
                        </p>
                      </div>
                    ) : (
                      messages.map((msg) => (
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
                    {customerTyping && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={selectedUser.photoURL} />
                          <AvatarFallback>{selectedUser.displayName?.charAt(0)}</AvatarFallback>
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
                <ChatInput
                  onSend={handleSendMessage}
                  onFileSelect={handleFileUpload}
                  placeholder="Message लिखें..."
                  onTyping={setOwnerTyping}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Customer select करें</p>
                  <p className="text-sm mt-2">Chat शुरू करने के लिए left side से customer चुनें</p>
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
