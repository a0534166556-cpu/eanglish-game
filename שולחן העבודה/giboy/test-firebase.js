import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyBe-FTyDs0Pb1hBxmej0WKC47TnPv2H3IW',
  authDomain: 'learning-ingish.firebaseapp.com',
  projectId: 'learning-ingish',
  storageBucket: 'learning-ingish.appspot.com',
  messagingSenderId: '668517987962',
  appId: '1:668517987962:web:2ddbb80e2aa71a6e52a5c3'
};

try {
  initializeApp(firebaseConfig);
  console.log('Firebase initialized!');
} catch (e) {
  console.error('Firebase init error:', e);
} 