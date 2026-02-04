import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { getApps, initializeApp } from 'firebase/app';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

const FCMContext = createContext(null);

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;
const API_URL = process.env.REACT_APP_BACKEND_URL;

export const useFCM = () => {
  const context = useContext(FCMContext);
  if (!context) {
    throw new Error('useFCM must be used within FCMProvider');
  }
  return context;
};

export const FCMProvider = ({ children }) => {
  const { user } = useAuth();
  const [fcmToken, setFcmToken] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSupported_, setIsSupported_] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('default');

  // Check if FCM is supported
  useEffect(() => {
    const checkSupport = async () => {
      try {
        const supported = await isSupported();
        setIsSupported_(supported);
        if (supported) {
          setPermissionStatus(Notification.permission);
        }
      } catch (e) {
        console.log('FCM not supported:', e);
        setIsSupported_(false);
      }
    };
    checkSupport();
  }, []);

  // Request permission and get token
  const requestPermission = useCallback(async () => {
    if (!isSupported_) {
      console.log('FCM not supported');
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return null;
      }

      // Initialize Firebase app if not already
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      const messaging = getMessaging(app);

      // Register service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      if (token) {
        setFcmToken(token);
        console.log('FCM Token:', token);
        
        // Register token with backend if user is logged in
        if (user?.uid) {
          await registerToken(token);
        }
        
        return token;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
    return null;
  }, [isSupported_, user]);

  // Register token with backend
  const registerToken = async (token) => {
    if (!user?.uid || !token) return;
    
    try {
      await axios.post(`${API_URL}/api/fcm/register`, {
        user_id: user.uid,
        token: token,
        device_info: navigator.userAgent
      });
      console.log('FCM token registered with backend');
    } catch (error) {
      console.error('Error registering FCM token:', error);
    }
  };

  // Listen for foreground messages
  useEffect(() => {
    if (!isSupported_ || permissionStatus !== 'granted') return;

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const messaging = getMessaging(app);

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message:', payload);
      
      const { title, body } = payload.notification || payload.data || {};
      const data = payload.data || {};
      
      // Show toast notification with click action
      toast.info(title, {
        description: body,
        duration: 5000,
        action: data.click_action ? {
          label: 'Open Chat',
          onClick: () => {
            window.location.href = data.click_action;
          }
        } : undefined
      });

      // Add to notifications list
      const newNotification = {
        id: Date.now().toString(),
        title,
        body,
        data: payload.data,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => unsubscribe();
  }, [isSupported_, permissionStatus]);
  
  // Listen for notification clicks from service worker
  useEffect(() => {
    const handleServiceWorkerMessage = (event) => {
      if (event.data?.type === 'NOTIFICATION_CLICK') {
        const { url } = event.data;
        if (url) {
          window.location.href = url;
        }
      }
    };
    
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);
    
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);

  // Auto-request permission when user logs in
  useEffect(() => {
    if (user?.uid && isSupported_ && permissionStatus === 'default') {
      // Request after a short delay
      const timer = setTimeout(() => {
        requestPermission();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, isSupported_, permissionStatus, requestPermission]);

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      const response = await axios.get(`${API_URL}/api/notifications/${user.uid}`);
      const notifs = response.data.notifications || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user]);

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user?.uid) return;
    
    try {
      await axios.put(`${API_URL}/api/notifications/${user.uid}/read`);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!user?.uid) return;
    
    try {
      await axios.delete(`${API_URL}/api/notifications/${user.uid}`);
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Delete single notification
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Send notification (for owner to send to customers)
  const sendNotification = async (userId, title, body, data = {}) => {
    try {
      const response = await axios.post(`${API_URL}/api/fcm/send`, {
        user_id: userId,
        title,
        body,
        data
      });
      return response.data;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  };

  // Load notifications when user changes
  useEffect(() => {
    if (user?.uid) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications]);

  const value = {
    fcmToken,
    notifications,
    unreadCount,
    isSupported: isSupported_,
    permissionStatus,
    requestPermission,
    fetchNotifications,
    markAllAsRead,
    clearAllNotifications,
    deleteNotification,
    sendNotification
  };

  return (
    <FCMContext.Provider value={value}>
      {children}
    </FCMContext.Provider>
  );
};
