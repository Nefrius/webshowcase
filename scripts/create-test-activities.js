const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');

// Firebase config - replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyBFMxo8YWHjWJwZhVZmIJRCfmIBWLNbEJo",
  authDomain: "infery-986dc.firebaseapp.com",
  projectId: "infery-986dc",
  storageBucket: "infery-986dc.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test data
const testUsers = [
  {
    id: 'user1',
    displayName: 'Ahmet Yılmaz',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: 'user2',
    displayName: 'Ayşe Demir',
    photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: 'user3',
    displayName: 'Mehmet Kaya',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: 'user4',
    displayName: 'Fatma Öz',
    photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
  }
];

const testWebsites = [
  {
    id: 'website1',
    title: 'React Dokümantasyonu',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200&h=150&fit=crop'
  },
  {
    id: 'website2',
    title: 'Next.js Öğrenme Rehberi',
    imageUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=200&h=150&fit=crop'
  },
  {
    id: 'website3',
    title: 'Firebase Kullanım Kılavuzu',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=150&fit=crop'
  },
  {
    id: 'website4',
    title: 'TypeScript Best Practices',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=150&fit=crop'
  }
];

// Generate test activities
async function createTestActivities() {
  console.log('Creating test activities...');
  
  const activities = [];
  
  // Website submissions
  for (let i = 0; i < 5; i++) {
    const user = testUsers[Math.floor(Math.random() * testUsers.length)];
    const website = testWebsites[Math.floor(Math.random() * testWebsites.length)];
    
    activities.push({
      type: 'website_submit',
      userId: user.id,
      userDisplayName: user.displayName,
      userPhotoURL: user.photoURL,
      websiteId: website.id,
      websiteTitle: website.title,
      websiteImageUrl: website.imageUrl,
      isPublic: true,
      createdAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000))
    });
  }
  
  // Website likes
  for (let i = 0; i < 8; i++) {
    const user = testUsers[Math.floor(Math.random() * testUsers.length)];
    const website = testWebsites[Math.floor(Math.random() * testWebsites.length)];
    
    activities.push({
      type: 'website_like',
      userId: user.id,
      userDisplayName: user.displayName,
      userPhotoURL: user.photoURL,
      websiteId: website.id,
      websiteTitle: website.title,
      websiteImageUrl: website.imageUrl,
      isPublic: true,
      createdAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000))
    });
  }
  
  // Website comments
  const comments = [
    'Harika bir kaynak, çok faydalı!',
    'Bu konuyu öğrenmek isteyenler için mükemmel.',
    'Detaylı açıklamalar var, teşekkürler!',
    'Tam aradığım şey buydu.',
    'Çok net anlatılmış, herkese tavsiye ederim.'
  ];
  
  for (let i = 0; i < 6; i++) {
    const user = testUsers[Math.floor(Math.random() * testUsers.length)];
    const website = testWebsites[Math.floor(Math.random() * testWebsites.length)];
    const comment = comments[Math.floor(Math.random() * comments.length)];
    
    activities.push({
      type: 'website_comment',
      userId: user.id,
      userDisplayName: user.displayName,
      userPhotoURL: user.photoURL,
      websiteId: website.id,
      websiteTitle: website.title,
      websiteImageUrl: website.imageUrl,
      commentText: comment,
      isPublic: true,
      createdAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000))
    });
  }
  
  // Website ratings
  for (let i = 0; i < 4; i++) {
    const user = testUsers[Math.floor(Math.random() * testUsers.length)];
    const website = testWebsites[Math.floor(Math.random() * testWebsites.length)];
    const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
    
    activities.push({
      type: 'website_rating',
      userId: user.id,
      userDisplayName: user.displayName,
      userPhotoURL: user.photoURL,
      websiteId: website.id,
      websiteTitle: website.title,
      websiteImageUrl: website.imageUrl,
      rating: rating,
      isPublic: true,
      createdAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000))
    });
  }
  
  // User follows
  for (let i = 0; i < 3; i++) {
    const user = testUsers[Math.floor(Math.random() * testUsers.length)];
    const targetUser = testUsers[Math.floor(Math.random() * testUsers.length)];
    
    if (user.id !== targetUser.id) {
      activities.push({
        type: 'user_follow',
        userId: user.id,
        userDisplayName: user.displayName,
        userPhotoURL: user.photoURL,
        targetUserId: targetUser.id,
        targetUserDisplayName: targetUser.displayName,
        targetUserPhotoURL: targetUser.photoURL,
        isPublic: true,
        createdAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000))
      });
    }
  }
  
  // Profile updates
  for (let i = 0; i < 2; i++) {
    const user = testUsers[Math.floor(Math.random() * testUsers.length)];
    
    activities.push({
      type: 'profile_update',
      userId: user.id,
      userDisplayName: user.displayName,
      userPhotoURL: user.photoURL,
      isPublic: true,
      createdAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000))
    });
  }
  
  // Bookmark creates
  const collections = ['Öğrenme Kaynakları', 'Geliştirici Araçları', 'Faydalı Linkler'];
  
  for (let i = 0; i < 3; i++) {
    const user = testUsers[Math.floor(Math.random() * testUsers.length)];
    const website = testWebsites[Math.floor(Math.random() * testWebsites.length)];
    const collection = collections[Math.floor(Math.random() * collections.length)];
    
    activities.push({
      type: 'bookmark_create',
      userId: user.id,
      userDisplayName: user.displayName,
      userPhotoURL: user.photoURL,
      websiteId: website.id,
      websiteTitle: website.title,
      websiteImageUrl: website.imageUrl,
      bookmarkCollectionName: collection,
      isPublic: true,
      createdAt: Timestamp.fromDate(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000))
    });
  }
  
  // Sort by creation date (newest first)
  activities.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  
  // Add to Firestore
  for (const activity of activities) {
    try {
      await addDoc(collection(db, 'activities'), activity);
      console.log(`Created ${activity.type} activity by ${activity.userDisplayName}`);
    } catch (error) {
      console.error('Error creating activity:', error);
    }
  }
  
  console.log(`Successfully created ${activities.length} test activities!`);
}

// Run the script
createTestActivities().catch(console.error); 