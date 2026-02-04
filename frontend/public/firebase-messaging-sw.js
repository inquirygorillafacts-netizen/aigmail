// Firebase Messaging Service Worker - WhatsApp Style Notifications
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCf-JLtE26oGUKaNHo2QX3npzLt6reD-rw",
  authDomain: "udhar-pay-b3ff7.firebaseapp.com",
  projectId: "udhar-pay-b3ff7",
  storageBucket: "udhar-pay-b3ff7.firebasestorage.app",
  messagingSenderId: "964637228383",
  appId: "1:964637228383:web:e1384647c578a464c40aea"
});

const messaging = firebase.messaging();

// Background message handler - WhatsApp style
messaging.onBackgroundMessage((payload) => {
  console.log('📩 Background message received:', payload);
  
  const data = payload.data || {};
  const notification = payload.notification || {};
  
  // WhatsApp style notification with sender info
  const notificationTitle = notification.title || data.title || '💬 New Message';
  const senderName = data.senderName || 'AI-Human';
  const messageBody = notification.body || data.body || 'You have a new message';
  
  // WhatsApp style notification options
  const notificationOptions = {
    body: messageBody,
    icon: data.senderPhoto || '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: data.chatId || `chat-${Date.now()}`, // Group notifications by chat
    renotify: true, // Vibrate even if same tag
    requireInteraction: true, // Don't auto-dismiss
    silent: false,
    data: {
      ...data,
      url: data.click_action || '/customer/chat'
    },
    actions: [
      { action: 'reply', title: '↩️ Reply' },
      { action: 'close', title: '✕ Close' }
    ],
    vibrate: [200, 100, 200], // WhatsApp style vibration
    timestamp: Date.now()
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click - Open chat directly
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};
  
  notification.close();
  
  // Determine URL to open
  let urlToOpen = data.url || '/customer/chat';
  
  // If click_action is for owner chat, use that
  if (data.click_action) {
    urlToOpen = data.click_action;
  }
  
  // Handle actions
  if (action === 'close') {
    return; // Just close
  }
  
  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then((windowClients) => {
      // Check if app is already open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin)) {
          // App is open - navigate and focus
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            data: data,
            url: urlToOpen
          });
          return client.focus();
        }
      }
      
      // App not open - open new window
      if (clients.openWindow) {
        const fullUrl = self.location.origin + urlToOpen;
        return clients.openWindow(fullUrl);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('🔕 Notification closed:', event.notification.tag);
});

// Handle push event directly for more control
self.addEventListener('push', (event) => {
  console.log('📨 Push event received');
  
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('Push payload:', payload);
    } catch (e) {
      console.log('Push data:', event.data.text());
    }
  }
});

// Service worker install
self.addEventListener('install', (event) => {
  console.log('🔧 FCM Service Worker installed');
  self.skipWaiting();
});

// Service worker activate
self.addEventListener('activate', (event) => {
  console.log('✅ FCM Service Worker activated');
  event.waitUntil(clients.claim());
});

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  console.log('📬 Message from app:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
