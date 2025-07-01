import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

const MoodTracker = () => {
  const user = auth.currentUser;
  const [selectedMood, setSelectedMood] = useState('');
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const moods = [
    { id: 'excited', emoji: '🤩', label: 'Excited', color: 'from-yellow-400 to-orange-500' },
    { id: 'happy', emoji: '😊', label: 'Happy', color: 'from-green-400 to-green-500' },
    { id: 'calm', emoji: '😌', label: 'Calm', color: 'from-blue-400 to-blue-500' },
    { id: 'neutral', emoji: '😐', label: 'Neutral', color: 'from-gray-400 to-gray-500' },
    { id: 'anxious', emoji: '😰', label: 'Anxious', color: 'from-orange-400 to-red-500' },
    { id: 'angry', emoji: '😠', label: 'Angry', color: 'from-red-500 to-red-600' },
    { id: 'sad', emoji: '😢', label: 'Sad', color: 'from-purple-400 to-purple-500' },
  ];

  // Fetch mood history from Firestore
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(collection(db, `users/${user.uid}/moods`), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const moods: any[] = [];
      snapshot.forEach(doc => moods.push({ id: doc.id, ...doc.data() }));
      setMoodHistory(moods);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Save mood to Firestore
  const handleMoodSelect = async (moodId: string) => {
    setSelectedMood(moodId);
    if (!user) return;
    const selectedMoodData = moods.find(m => m.id === moodId);
    if (selectedMoodData) {
      await addDoc(collection(db, `users/${user.uid}/moods`), {
        mood: moodId,
        emoji: selectedMoodData.emoji,
        label: selectedMoodData.label,
        createdAt: new Date().toISOString(),
      });
    }
  };

  // Delete mood entry
  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/moods/${id}`));
  };

  // Generate dynamic insights
  const getInsights = () => {
    if (moodHistory.length === 0) return "Log your moods to see insights.";
    const moodCounts: Record<string, number> = {};
    moodHistory.forEach(entry => {
      moodCounts[entry.label] = (moodCounts[entry.label] || 0) + 1;
    });
    const mostCommon = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
    return mostCommon
      ? `Your most frequent mood is ${mostCommon[0]}. Keep tracking to see more patterns!`
      : "Keep tracking your moods to see patterns.";
  };

  if (!user) {
    return <div className="text-center mt-8">Please sign in to track your mood.</div>;
  }

  return (
    <div className="space-y-8 animate-slide-up-smooth">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">How are you feeling today?</h1>
        <p className="text-gray-600">Track your daily emotions to better understand your mental wellness patterns.</p>
      </div>

      {/* Mood Selection */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Select Your Mood</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
                className={`
                  p-6 rounded-2xl text-center transition-all duration-300 transform hover:scale-105
                  ${selectedMood === mood.id 
                    ? `bg-gradient-to-br ${mood.color} text-white shadow-lg` 
                    : 'bg-white/70 hover:bg-white/90 text-gray-700 shadow-md hover:shadow-lg'
                  }
                `}
              >
                <div className="text-4xl mb-2">{mood.emoji}</div>
                <div className="font-medium text-sm">{mood.label}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mood History */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Your Mood Journey</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="loading-spinner h-8 w-8"></div>
            </div>
          ) : moodHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">😊</div>
              <p className="text-gray-500">No moods logged yet. Start tracking your emotions!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {moodHistory.map((entry, index) => (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-white/50 rounded-2xl hover:bg-white/70 transition-colors">
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">{entry.emoji}</span>
                    <div>
                      <div className="font-medium text-gray-800 capitalize">{entry.label}</div>
                      <div className="text-sm text-gray-600">{new Date(entry.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleDelete(entry.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Weekly Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-green-100 to-teal-100 p-6 rounded-2xl">
            <h4 className="font-semibold text-gray-800 mb-2">💡 This Week's Pattern</h4>
            <p className="text-gray-700">
              {getInsights()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoodTracker;