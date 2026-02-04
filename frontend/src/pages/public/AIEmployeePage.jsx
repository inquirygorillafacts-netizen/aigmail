import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PanelLayout } from '@/components/layout/Navigation';
import { Header } from '@/components/layout/Header';
import { VoiceVisualizer } from '@/components/voice/VoiceVisualizer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { createLead, updateLead } from '@/lib/firebase';
import { LogIn, Mic, MicOff, Volume2 } from 'lucide-react';

const AIEmployeePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [leadId, setLeadId] = useState(null);
  const [extractedInfo, setExtractedInfo] = useState({
    name: '',
    mobile: '',
    location: '',
    profession: '',
    interestedService: ''
  });
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  
  // System prompt for AI Employee
  const systemPrompt = `You are a friendly AI employee of AI-Human Services. Your role is to:
1. Greet visitors warmly in Hinglish (Hindi + English mix)
2. Introduce yourself and the company briefly
3. Ask for their name, mobile number, location, and profession naturally in conversation
4. Understand what services they're interested in
5. Explain our services when asked (website development, app development, automation, marketing, etc.)
6. Be helpful, professional, and conversational - NOT robotic
7. All our services have first 3 trials FREE, then starting from ₹500/month

Important: Extract information naturally through conversation, don't ask all questions at once.

Start with: "नमस्ते! मैं AI-Human का employee हूँ। कैसे हैं आप? आपका नाम क्या है?"`;

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'hi-IN';
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          handleUserMessage(finalTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setPermissionDenied(true);
        }
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start();
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  // Request microphone permission and start AI greeting
  const initializeConversation = async () => {
    try {
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setIsInitialized(true);
      
      // Create lead entry
      const newLeadId = await createLead({
        source: 'ai-employee',
        conversation: []
      });
      setLeadId(newLeadId);
      
      // AI starts greeting
      const greeting = "नमस्ते! मैं AI-Human का employee हूँ। कैसे हैं आप? आपका नाम क्या है?";
      setAiResponse(greeting);
      speakText(greeting);
      setConversationHistory([{ role: 'assistant', content: greeting }]);
      
    } catch (error) {
      console.error('Permission error:', error);
      setPermissionDenied(true);
    }
  };
  
  // Speak text using Speech Synthesis
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.9;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        // Auto-start listening after AI speaks
        if (!isListening && recognitionRef.current) {
          startListening();
        }
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };
  
  // Handle user message and get AI response
  const handleUserMessage = async (userMessage) => {
    if (!userMessage.trim()) return;
    
    const newHistory = [...conversationHistory, { role: 'user', content: userMessage }];
    setConversationHistory(newHistory);
    
    // Stop listening while processing
    stopListening();
    
    try {
      // Call Google Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.REACT_APP_GOOGLE_AI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: systemPrompt }] },
              ...newHistory.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
              }))
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500
            }
          })
        }
      );
      
      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
        "Sorry, I couldn't understand. क्या आप दोबारा बोल सकते हैं?";
      
      setAiResponse(aiText);
      setConversationHistory([...newHistory, { role: 'assistant', content: aiText }]);
      
      // Extract information from conversation
      extractInfoFromConversation([...newHistory, { role: 'assistant', content: aiText }]);
      
      // Speak the response
      speakText(aiText);
      
      // Update lead in database
      if (leadId) {
        await updateLead(leadId, {
          conversation: [...newHistory, { role: 'assistant', content: aiText }],
          ...extractedInfo
        });
      }
      
    } catch (error) {
      console.error('AI response error:', error);
      const fallback = "कुछ technical issue है। क्या आप दोबारा try कर सकते हैं?";
      setAiResponse(fallback);
      speakText(fallback);
    }
  };
  
  // Extract user information from conversation
  const extractInfoFromConversation = async (history) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.REACT_APP_GOOGLE_AI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              role: 'user',
              parts: [{
                text: `Extract user information from this conversation. Return JSON only with fields: name, mobile, location, profession, interestedService. Return empty string for unknown fields.

Conversation:
${history.map(m => `${m.role}: ${m.content}`).join('\n')}

Return only valid JSON:`
              }]
            }],
            generationConfig: {
              temperature: 0,
              maxOutputTokens: 200
            }
          })
        }
      );
      
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const info = JSON.parse(jsonMatch[0]);
        setExtractedInfo(prev => ({
          name: info.name || prev.name,
          mobile: info.mobile || prev.mobile,
          location: info.location || prev.location,
          profession: info.profession || prev.profession,
          interestedService: info.interestedService || prev.interestedService
        }));
      }
    } catch (e) {
      console.error('Info extraction error:', e);
    }
  };
  
  const startListening = () => {
    if (recognitionRef.current && !isSpeaking) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };
  
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };
  
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  const handleStartJourney = async () => {
    try {
      await login();
      navigate('/customer/home');
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  
  return (
    <PanelLayout panel="public">
      <div className="min-h-screen relative overflow-hidden">
        {/* Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1759912804199-a104b710a308?w=1920)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col min-h-screen pb-20 lg:pb-0">
          <Header 
            title="AI Employee" 
            titleHi="AI एम्पलाई"
            showThemeToggle
            rightContent={
              !isAuthenticated && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleStartJourney}
                  data-testid="start-journey-btn"
                  className="rounded-full"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Start Journey
                </Button>
              )
            }
          />
          
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl md:text-4xl font-bold font-[Outfit]">
                <span className="text-primary">AI</span>
                <span className="text-secondary">-Human</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                24/7 Available Employee
              </p>
            </motion.div>
            
            {!isInitialized ? (
              // Initial Screen - Request Permission
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center max-w-md"
              >
                {permissionDenied ? (
                  <Card className="p-6 space-y-4">
                    <MicOff className="w-12 h-12 mx-auto text-destructive" />
                    <h3 className="font-semibold">Microphone Access Denied</h3>
                    <p className="text-sm text-muted-foreground">
                      बातचीत के लिए माइक की permission चाहिए। कृपया browser settings से allow करें।
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button variant="outline" onClick={() => navigate('/public/contact')}>
                        Direct Contact
                      </Button>
                      <Button onClick={() => window.location.reload()}>
                        Try Again
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-8 space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Mic className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">AI से बात करें</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        हमारा AI employee आपकी हर query का जवाब देगा। शुरू करने के लिए नीचे button दबाएं।
                      </p>
                    </div>
                    <Button 
                      onClick={initializeConversation}
                      className="w-full rounded-full"
                      size="lg"
                      data-testid="start-conversation-btn"
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      Start Conversation
                    </Button>
                  </Card>
                )}
              </motion.div>
            ) : (
              // Active Conversation Screen
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center w-full max-w-lg space-y-8"
              >
                {/* Voice Visualizer */}
                <VoiceVisualizer
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  onPress={toggleListening}
                  size="lg"
                />
                
                {/* Status */}
                <div className="text-center mt-12">
                  {isSpeaking && (
                    <div className="flex items-center gap-2 text-primary">
                      <Volume2 className="w-5 h-5 animate-pulse" />
                      <span>AI बोल रहा है...</span>
                    </div>
                  )}
                  {isListening && !isSpeaking && (
                    <div className="flex items-center gap-2 text-secondary">
                      <Mic className="w-5 h-5 animate-pulse" />
                      <span>सुन रहा है...</span>
                    </div>
                  )}
                </div>
                
                {/* AI Response */}
                {aiResponse && (
                  <Card className="w-full p-4 bg-card/80 backdrop-blur">
                    <p className="text-sm">
                      <span className="text-primary font-medium">AI: </span>
                      {aiResponse}
                    </p>
                  </Card>
                )}
                
                {/* User Transcript */}
                {transcript && (
                  <Card className="w-full p-4 bg-muted/50">
                    <p className="text-sm">
                      <span className="text-muted-foreground font-medium">You: </span>
                      {transcript}
                    </p>
                  </Card>
                )}
              </motion.div>
            )}
            
            {/* Start Journey Button */}
            {!isAuthenticated && isInitialized && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <Button 
                  onClick={handleStartJourney}
                  variant="secondary"
                  className="rounded-full"
                  size="lg"
                  data-testid="start-journey-btn-bottom"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Start Your Journey
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PanelLayout>
  );
};

export default AIEmployeePage;
