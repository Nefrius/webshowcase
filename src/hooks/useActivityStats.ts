'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';

interface ActivityStats {
  today: number;
  thisWeek: number;
  following: number;
  loading: boolean;
  error: string | null;
}

export const useActivityStats = (userId: string | null) => {
  const [stats, setStats] = useState<ActivityStats>({
    today: 0,
    thisWeek: 0,
    following: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!userId) {
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));
        
        const db = getFirebaseDb();
        const activitiesRef = collection(db, 'activities');
        const followsRef = collection(db, 'follows');
        
        // Bugünün başlangıcı
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = Timestamp.fromDate(today);
        
        // Bu haftanın başlangıcı (Pazartesi)
        const thisWeek = new Date();
        const dayOfWeek = thisWeek.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        thisWeek.setDate(thisWeek.getDate() + mondayOffset);
        thisWeek.setHours(0, 0, 0, 0);
        const thisWeekTimestamp = Timestamp.fromDate(thisWeek);
        
        // Bugünkü aktiviteler
        const todayQuery = query(
          activitiesRef,
          where('userId', '==', userId),
          where('createdAt', '>=', todayTimestamp),
          orderBy('createdAt', 'desc')
        );
        const todaySnapshot = await getDocs(todayQuery);
        
        // Bu haftaki aktiviteler
        const thisWeekQuery = query(
          activitiesRef,
          where('userId', '==', userId),
          where('createdAt', '>=', thisWeekTimestamp),
          orderBy('createdAt', 'desc')
        );
        const thisWeekSnapshot = await getDocs(thisWeekQuery);
        
        // Takip edilen kullanıcı sayısı
        const followingQuery = query(
          followsRef,
          where('followerId', '==', userId)
        );
        const followingSnapshot = await getDocs(followingQuery);
        
        setStats({
          today: todaySnapshot.size,
          thisWeek: thisWeekSnapshot.size,
          following: followingSnapshot.size,
          loading: false,
          error: null
        });
        
      } catch (error) {
        console.error('Error fetching activity stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Bilinmeyen hata'
        }));
      }
    };

    fetchStats();
  }, [userId]);

  return stats;
}; 