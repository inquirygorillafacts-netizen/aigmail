// Firebase Messaging Service Worker
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

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'AI-Human';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: payload.data?.tag || 'default',
    data: payload.data,
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Close' }
    ],
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if app is already open
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.postMessage({ type: 'NOTIFICATION_CLICK', data: event.notification.data });
            return client.focus();
          }
        }
        // Open new window if not open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
