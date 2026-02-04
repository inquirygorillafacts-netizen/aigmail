import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageSquare, Mail, MapPin, Star, Send, Building2, Target, Users, Sparkles } from 'lucide-react';
import { PanelLayout } from '@/components/layout/Navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { submitRating, submitContactForm } from '@/lib/firebase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ContactPage = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleRatingSubmit = async () => {
    if (rating === 0) {
      toast.error('कृपया rating select करें');
      return;
    }
    
    try {
      await submitRating({ rating, feedback });
      setRatingSubmitted(true);
      toast.success('धन्यवाद! आपकी rating submit हो गई 🙏');
    } catch (error) {
      console.error('Rating error:', error);
      toast.error('कुछ गड़बड़ हुई। कृपया दोबारा try करें।');
    }
  };
  
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.message) {
      toast.error('कृपया नाम और message भरें');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await submitContactForm(contactForm);
      toast.success('Message भेज दिया गया! हम जल्दी reply करेंगे।');
      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('कुछ गड़बड़ हुई। कृपया दोबारा try करें।');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const companyInfo = {
    phone: '+91 9876543210',
    whatsapp: '+919876543210',
    email: 'info@ai-human.com',
    location: 'Jaipur, Rajasthan, India'
  };
  
  return (
    <PanelLayout panel="public">
      <Header 
        title="Contact" 
        titleHi="संपर्क"
        showThemeToggle
      />
      
      <div className="p-4 lg:p-8 pb-24 lg:pb-8 space-y-8">
        {/* About Us Section */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6 border border-primary/10"
          >
            <h2 className="text-2xl font-bold font-[Outfit] mb-4">
              <span className="text-primary">AI</span>
              <span className="text-secondary">-Human</span>
              <span className="text-foreground"> Services</span>
            </h2>
            
            <p className="text-muted-foreground mb-6">
              हम एक unique service platform हैं जहाँ AI और Human मिलकर आपके business को next level पर ले जाते हैं।
              20+ digital services, 24/7 AI support, और affordable pricing - यही है हमारी खासियत।
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center text-center p-4 bg-card rounded-xl">
                <Building2 className="w-8 h-8 text-primary mb-2" />
                <p className="text-sm font-medium">20+ Services</p>
                <p className="text-xs text-muted-foreground">सर्विस</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-card rounded-xl">
                <Sparkles className="w-8 h-8 text-secondary mb-2" />
                <p className="text-sm font-medium">24/7 AI Support</p>
                <p className="text-xs text-muted-foreground">AI सपोर्ट</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-card rounded-xl">
                <Target className="w-8 h-8 text-green-500 mb-2" />
                <p className="text-sm font-medium">3x FREE Trial</p>
                <p className="text-xs text-muted-foreground">फ्री ट्रायल</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-card rounded-xl">
                <Users className="w-8 h-8 text-purple-500 mb-2" />
                <p className="text-sm font-medium">100+ Clients</p>
                <p className="text-xs text-muted-foreground">क्लाइंट</p>
              </div>
            </div>
          </motion.div>
        </section>
        
        {/* Contact Methods */}
        <section>
          <h3 className="font-semibold mb-4">Contact Us / संपर्क करें</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href={`tel:${companyInfo.phone}`} data-testid="call-btn">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Call Now</p>
                    <p className="text-sm text-muted-foreground">{companyInfo.phone}</p>
                  </div>
                </CardContent>
              </Card>
            </a>
            
            <a 
              href={`https://wa.me/${companyInfo.whatsapp}?text=Hi! I want to know about your services.`}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="whatsapp-btn"
            >
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-sm text-muted-foreground">Message us</p>
                  </div>
                </CardContent>
              </Card>
            </a>
            
            <a href={`mailto:${companyInfo.email}`} data-testid="email-btn">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{companyInfo.email}</p>
                  </div>
                </CardContent>
              </Card>
            </a>
            
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{companyInfo.location}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* Rating Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rate Us / हमें रेटिंग दें</CardTitle>
            </CardHeader>
            <CardContent>
              {ratingSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <div className="text-4xl mb-2">🙏</div>
                  <p className="font-medium">धन्यवाद!</p>
                  <p className="text-sm text-muted-foreground">आपकी rating से हमें बहुत खुशी हुई</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {/* Star Rating */}
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110"
                        data-testid={`star-${star}`}
                      >
                        <Star 
                          className={cn(
                            'w-8 h-8 transition-colors',
                            (hoverRating || rating) >= star 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-muted-foreground'
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  
                  {/* Feedback */}
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="अपनी राय दें (optional)..."
                    rows={3}
                    data-testid="feedback-input"
                  />
                  
                  <Button 
                    onClick={handleRatingSubmit}
                    className="w-full rounded-full"
                    data-testid="submit-rating-btn"
                  >
                    Submit Rating
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
        
        {/* Message Form */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Send Message / संदेश भेजें</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <Input
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="आपका नाम *"
                  required
                  data-testid="contact-name"
                />
                <Input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email (optional)"
                  data-testid="contact-email"
                />
                <Textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="अपना संदेश लिखें... *"
                  rows={4}
                  required
                  data-testid="contact-message"
                />
                <Button 
                  type="submit" 
                  className="w-full rounded-full"
                  disabled={isSubmitting}
                  data-testid="send-message-btn"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </PanelLayout>
  );
};

export default ContactPage;
