// Firebase Configuration
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, onSnapshot, addDoc, updateDoc, orderBy, limit, getDocs, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, set, onValue, push, serverTimestamp as rtdbServerTimestamp } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
  databaseURL: "https://udhar-pay-b3ff7-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

// Auth Functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// User Functions
export const createOrUpdateUser = async (user, additionalData = {}) => {
  if (!user) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  const userData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    updatedAt: serverTimestamp(),
    ...additionalData
  };
  
  if (!userSnap.exists()) {
    // New user - assign customer role by default
    userData.roles = ['customer'];
    userData.createdAt = serverTimestamp();
    userData.isProfileComplete = false;
  } else {
    // Existing user - preserve roles
    const existingData = userSnap.data();
    userData.roles = existingData.roles || ['customer'];
  }
  
  await setDoc(userRef, userData, { merge: true });
  return { ...userData, uid: user.uid };
};

export const getUserData = async (uid) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? { uid, ...userSnap.data() } : null;
};

export const updateUserProfile = async (uid, data) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() });
};

// Check if any owner exists
export const checkOwnerExists = async () => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('roles', 'array-contains', 'owner'), limit(1));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

// Claim owner role (only if no owner exists)
export const claimOwnerRole = async (uid) => {
  const ownerExists = await checkOwnerExists();
  if (ownerExists) {
    throw new Error('Owner already exists');
  }
  
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const roles = userData.roles || ['customer'];
    if (!roles.includes('owner')) {
      roles.push('owner');
    }
    await updateDoc(userRef, { roles, updatedAt: serverTimestamp() });
    return true;
  }
  return false;
};

// Lead Functions
export const createLead = async (leadData) => {
  const leadsRef = collection(db, 'leads');
  const docRef = await addDoc(leadsRef, {
    ...leadData,
    createdAt: serverTimestamp(),
    status: 'new'
  });
  return docRef.id;
};

export const updateLead = async (leadId, data) => {
  const leadRef = doc(db, 'leads', leadId);
  await updateDoc(leadRef, { ...data, updatedAt: serverTimestamp() });
};

// Service Functions
export const getServices = async () => {
  const servicesRef = collection(db, 'services');
  const snapshot = await getDocs(servicesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Service Request Functions
export const createServiceRequest = async (requestData) => {
  const requestsRef = collection(db, 'serviceRequests');
  const docRef = await addDoc(requestsRef, {
    ...requestData,
    createdAt: serverTimestamp(),
    status: 'pending'
  });
  return docRef.id;
};

// Chat Functions (Realtime Database for real-time chat)
export const sendMessage = async (chatId, message) => {
  const messagesRef = dbRef(rtdb, `chats/${chatId}/messages`);
  const newMessageRef = push(messagesRef);
  await set(newMessageRef, {
    ...message,
    timestamp: rtdbServerTimestamp()
  });
  return newMessageRef.key;
};

export const subscribeToMessages = (chatId, callback) => {
  const messagesRef = dbRef(rtdb, `chats/${chatId}/messages`);
  return onValue(messagesRef, (snapshot) => {
    const messages = [];
    snapshot.forEach((childSnapshot) => {
      messages.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    callback(messages);
  });
};

// File Upload
export const uploadFile = async (file, path) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

// Rating Functions
export const submitRating = async (ratingData) => {
  const ratingsRef = collection(db, 'ratings');
  const docRef = await addDoc(ratingsRef, {
    ...ratingData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

// Contact Form
export const submitContactForm = async (formData) => {
  const contactsRef = collection(db, 'contacts');
  const docRef = await addDoc(contactsRef, {
    ...formData,
    createdAt: serverTimestamp(),
    status: 'unread'
  });
  return docRef.id;
};

// Export instances
export { auth, db, storage, rtdb, onAuthStateChanged, collection, query, where, onSnapshot, doc, orderBy, getDocs, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, dbRef, onValue, set };
