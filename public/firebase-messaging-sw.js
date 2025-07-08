// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration - will be injected at build time
const firebaseConfig = {
  apiKey: "AIzaSyCFSKUzZZNAHeCpaCu8jJsMXexE4QmCyXc",
  authDomain: "infery-986dc.firebaseapp.com",
  projectId: "infery-986dc",
  storageBucket: "infery-986dc.firebasestorage.app",
  messagingSenderId: "326726268883",
  appId: "1:326726268883:web:ff1148207489b293c4e126",
  measurementId: "G-2RPNP645SN"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'InferyHub Bildirimi';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/infery.ico',
    badge: '/infery.ico',
    tag: 'inferyhub-push',
    requireInteraction: false,
    data: payload.data || {},
    actions: [
      {
        action: 'view',
        title: 'Görüntüle',
        icon: '/infery.ico'
      },
      {
        action: 'dismiss',
        title: 'Kapat'
      }
    ]
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Handle different notification types
  const data = event.notification.data || {};
  let url = '/';

  switch (data.type) {
    case 'new_website':
      url = `/website/${data.websiteId}`;
      break;
    case 'new_comment':
      url = `/website/${data.websiteId}#comments`;
      break;
    case 'new_rating':
      url = `/website/${data.websiteId}#ratings`;
      break;
    case 'new_follow':
      url = `/profile/${data.userId}`;
      break;
    case 'announcement':
      url = '/notifications';
      break;
    default:
      url = data.url || '/';
  }

  // Open the app and navigate to the appropriate page
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            url: url,
            data: data
          });
          return;
        }
      }
      
      // If app is not open, open it
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // Track notification dismissal
  const data = event.notification.data || {};
  if (data.trackDismissal) {
    // Send analytics event (optional)
    console.log('Tracking notification dismissal:', data.type);
  }
});

// App Update Sistemi
self.addEventListener('install', () => {
  console.log('New service worker installing...');
  // Yeni SW hemen aktif olması için
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('New service worker activated');
  // Tüm clientları kontrol et
  event.waitUntil(clients.claim());
  
  // Client'lara güncelleme mevcut mesajı gönder
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'SW_UPDATE_AVAILABLE',
        version: '2.1.0'
      });
    });
  });
});

// Update mesajlarını handle et
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Skipping waiting...');
    self.skipWaiting();
  }
});

console.log('Firebase Messaging Service Worker loaded'); 