import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';
import { firestore } from '../config/firebase';

const SCORES_PATH = ['leaderboards', 'feed-zone', 'scores'] as const;

export async function saveLeaderboardScore(entry: {
  id: string;
  name: string;
  score: number;
}): Promise<void> {
  if (!firestore) {
    console.warn('Firestore not initialized, skipping leaderboard save');
    return;
  }
  const col = collection(firestore, ...SCORES_PATH);

  const dataToSave = {
    id: entry.id,
    name: entry.name,
    score: entry.score,
    createdAt: Timestamp.now(),
  };

  try {
    await addDoc(col, dataToSave);
  } catch (error) {
    console.error('Error saving to Firestore:', error);
    throw error;
  }
}

export interface LeaderboardRow {
  name: string;
  score: number;
}

export async function fetchTopScores(count = 10): Promise<LeaderboardRow[]> {
  if (!firestore) {
    console.warn('Firestore not initialized, skipping leaderboard fetch');
    return [];
  }
  const col = collection(firestore, ...SCORES_PATH);
  const q = query(col, orderBy('score', 'desc'), limit(count));

  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { name: data.name, score: data.score };
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}
