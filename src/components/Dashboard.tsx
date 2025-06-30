import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Heart, BarChart3, Phone, BookOpen, Settings, User, Menu, X } from 'lucide-react';
import MoodTracker from './MoodTracker';
import AssessmentModule from './AssessmentModule';
import VoiceAssistant from './VoiceAssistant';
import { auth, db } from '../lib/firebase';
import { useUserData } from './GoogleAuth';
import { collection, onSnapshot, addDoc, query, orderBy, deleteDoc, doc, setDoc } from 'firebase/firestore';
import Logo from './Logo';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [activeModule, setActiveModule] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const modules = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'mood', name: 'Mood Tracker', icon: Heart },
    { id: 'assessments', name: 'Assessments', icon: Brain },
    { id: 'tara', name: 'Call to Tara', icon: Phone },
    { id: 'journal', name: 'Journal', icon: BookOpen },
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'mood':
        return <MoodTracker />;
      case 'assessments':
        return <AssessmentModule />;
      case 'tara':
        return <VoiceAssistant />;
      case 'journal':
        return <JournalModule />;
      case 'profile':
        return <ProfileModule onLogout={onLogout} />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <OverviewModule />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Mobile Menu Button */}
      <Button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white"
        size="icon"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white/80 backdrop-blur-sm border-r border-purple-100 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <Logo size={48} />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              GoodMind
            </span>
          </div>

          <nav className="space-y-2">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => {
                  setActiveModule(module.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${activeModule === module.id 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-purple-50'
                  }
                `}
              >
                <module.icon className="w-5 h-5" />
                <span className="font-medium">{module.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        <div className="p-6 lg:p-8">
          {renderActiveModule()}
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Overview Module Component
const OverviewModule = () => {
  const user = auth.currentUser;
  const userData = useUserData(user?.uid);
  const [assessmentCount, setAssessmentCount] = useState(0);
  const [daysTracked, setDaysTracked] = useState(0);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);

  // Fetch assessment count
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, `users/${user.uid}/assessments`), (snapshot) => {
      setAssessmentCount(snapshot.size);
    });
    return () => unsub();
  }, [user]);

  // Example: Fetch days tracked (could be based on mood entries, etc.)
  useEffect(() => {
    if (user) setDaysTracked(1);
  }, [user]);

  // Fetch and aggregate recent activity
  useEffect(() => {
    if (!user) return;
    const moodsQ = collection(db, `users/${user.uid}/moods`);
    const assessmentsQ = collection(db, `users/${user.uid}/assessments`);
    const taraQ = collection(db, `users/${user.uid}/taraSessions`);
    const journalQ = collection(db, `users/${user.uid}/journal`);

    const unsubs: any[] = [];
    let allActivities: any[] = [];

    // Helper to add and sort activities
    const updateFeed = () => {
      setActivityFeed([...allActivities].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    };

    // Moods
    unsubs.push(onSnapshot(moodsQ, (snap) => {
      allActivities = allActivities.filter(a => a.type !== 'mood');
      snap.forEach(doc => {
        allActivities.push({
          type: 'mood',
          timestamp: doc.data().createdAt,
          label: doc.data().label,
          emoji: doc.data().emoji,
        });
      });
      updateFeed();
    }));
    // Assessments
    unsubs.push(onSnapshot(assessmentsQ, (snap) => {
      allActivities = allActivities.filter(a => a.type !== 'assessment');
      snap.forEach(doc => {
        allActivities.push({
          type: 'assessment',
          timestamp: doc.data().completedAt,
          label: doc.id,
          summary: doc.data().summary,
        });
      });
      updateFeed();
    }));
    // Tara Sessions
    unsubs.push(onSnapshot(taraQ, (snap) => {
      allActivities = allActivities.filter(a => a.type !== 'tara');
      snap.forEach(doc => {
        allActivities.push({
          type: 'tara',
          timestamp: doc.data().endTime,
          topic: doc.data().topic,
          duration: doc.data().duration,
        });
      });
      updateFeed();
    }));
    // Journal
    unsubs.push(onSnapshot(journalQ, (snap) => {
      allActivities = allActivities.filter(a => a.type !== 'journal');
      snap.forEach(doc => {
        allActivities.push({
          type: 'journal',
          timestamp: doc.data().createdAt,
          text: doc.data().text,
        });
      });
      updateFeed();
    }));

    return () => unsubs.forEach(unsub => unsub());
  }, [user]);

  const stats = [
    { label: 'Days Tracked', value: daysTracked, color: 'from-purple-500 to-purple-600' },
    { label: 'Assessments', value: assessmentCount, color: 'from-blue-500 to-blue-600' },
    { label: 'Tara Sessions', value: '—', color: 'from-pink-500 to-pink-600' },
    { label: 'Journal Entries', value: '—', color: 'from-green-500 to-green-600' },
  ];

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back{userData?.displayName ? `, ${userData.displayName}` : ''}! 👋</h1>
        <p className="text-gray-600">Here's how your mental wellness journey is progressing.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="glass border-0 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <span className="text-white font-bold text-lg">{stat.value}</span>
              </div>
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activityFeed.length === 0 ? (
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <span className="text-gray-700">No recent activity yet</span>
              <span className="text-sm text-gray-500">—</span>
            </div>
          ) : (
            activityFeed.slice(0, 10).map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <span className="text-gray-700">
                  {activity.type === 'mood' && <>{activity.emoji} Logged mood: <b>{activity.label}</b></>}
                  {activity.type === 'assessment' && <>📝 Completed assessment: <b>{activity.label}</b></>}
                  {activity.type === 'tara' && <>📞 Tara session: <b>{activity.topic}</b> ({activity.duration})</>}
                  {activity.type === 'journal' && <>📔 Journal entry: <span className="italic">{activity.text.slice(0, 30)}{activity.text.length > 30 ? '...' : ''}</span></>}
                </span>
                <span className="text-sm text-gray-500">{activity.timestamp ? new Date(activity.timestamp).toLocaleString() : ''}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Journal Module Component
const JournalModule = () => {
  const user = auth.currentUser;
  const [entry, setEntry] = useState('');
  const [journal, setJournal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch journal entries from Firestore
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(collection(db, `users/${user.uid}/journal`), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const entries: any[] = [];
      snapshot.forEach(doc => entries.push({ id: doc.id, ...doc.data() }));
      setJournal(entries);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Save entry to Firestore
  const handleSave = async () => {
    if (!user || !entry.trim()) return;
    await addDoc(collection(db, `users/${user.uid}/journal`), {
      text: entry,
      createdAt: new Date().toISOString(),
    });
    setEntry('');
  };

  // Delete entry
  const handleDelete = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/journal/${id}`));
  };

  if (!user) {
    return <div className="text-center mt-8">Please sign in to use your journal.</div>;
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-3xl font-bold text-gray-800">Personal Journal</h1>
      <Card className="glass border-0">
        <CardContent className="p-8">
          <textarea
            className="w-full p-4 rounded-xl border border-gray-200 mb-4 text-gray-800"
            rows={4}
            placeholder="Write your thoughts..."
            value={entry}
            onChange={e => setEntry(e.target.value)}
          />
          <Button onClick={handleSave} disabled={!entry.trim()} className="w-full">Save Entry</Button>
        </CardContent>
      </Card>
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Your Journal Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : journal.length === 0 ? (
            <div>No entries yet.</div>
          ) : (
            <div className="space-y-4">
              {journal.map(entry => (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                  <div>
                    <div className="text-gray-800 whitespace-pre-line">{entry.text}</div>
                    <div className="text-xs text-gray-500 mt-2">{new Date(entry.createdAt).toLocaleString()}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(entry.id)}>Delete</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Profile Module Component
const ProfileModule = ({ onLogout }: { onLogout: () => void }) => {
  const user = auth.currentUser;
  const userData = useUserData(user?.uid);
  const [displayName, setDisplayName] = useState(userData?.displayName || user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setDisplayName(userData?.displayName || user?.displayName || '');
    setPhotoURL(user?.photoURL || '');
  }, [userData, user]);

  // Handle display name update
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, `users/${user.uid}`), { displayName }, { merge: true });
      await user.updateProfile({ displayName });
      setMessage('Profile updated!');
    } catch (e) {
      setMessage('Error updating profile.');
    }
    setSaving(false);
  };

  // Handle photo upload
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const file = e.target.files[0];
    try {
      const storageRef = (await import('firebase/storage')).ref;
      const uploadBytes = (await import('firebase/storage')).uploadBytes;
      const getDownloadURL = (await import('firebase/storage')).getDownloadURL;
      const { storage } = await import('../lib/firebase');
      const ref = storageRef(storage, `profilePhotos/${user.uid}`);
      await uploadBytes(ref, file);
      const url = await getDownloadURL(ref);
      await setDoc(doc(db, `users/${user.uid}`), { photoURL: url }, { merge: true });
      await user.updateProfile({ photoURL: url });
      setPhotoURL(url);
      setMessage('Photo updated!');
    } catch (e) {
      setMessage('Error uploading photo.');
    }
    setUploading(false);
  };

  if (!user) {
    return <div className="text-center mt-8">Please sign in to view your profile.</div>;
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>
      <Card className="glass border-0">
        <CardContent className="p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center overflow-hidden">
              {photoURL ? (
                <img src={photoURL} alt="User avatar" className="w-20 h-20 object-cover rounded-full" />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
            <div>
              <input
                className="text-xl font-semibold bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-400 mb-2"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                disabled={saving}
              />
              <p className="text-gray-600">{userData?.email || user?.email || ''}</p>
              <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={uploading} className="mt-2" />
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full mt-2">{saving ? 'Saving...' : 'Save Changes'}</Button>
          {message && <div className="text-green-600 mt-2">{message}</div>}
          <div className="mt-8 text-sm text-gray-500">
            <div>Account created: {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleString() : '—'}</div>
            <div>Last login: {user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : '—'}</div>
          </div>
          <Button 
            onClick={onLogout}
            variant="outline" 
            className="w-full mt-4"
          >
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Settings Module Component
const SettingsModule = () => {
  const user = auth.currentUser;
  const [settings, setSettings] = useState<any>({ theme: 'light', notifications: true });
  const [loading, setLoading] = useState(true);

  // Fetch settings from Firestore
  useEffect(() => {
    if (!user) return;
    const settingsRef = doc(db, `users/${user.uid}/settings`);
    const unsub = onSnapshot(settingsRef, (snap) => {
      if (snap.exists()) setSettings(snap.data());
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Update settings in Firestore
  const handleChange = async (field: string, value: any) => {
    if (!user) return;
    setSettings((prev: any) => ({ ...prev, [field]: value }));
    await setDoc(doc(db, `users/${user.uid}/settings`), { ...settings, [field]: value }, { merge: true });
  };

  if (!user) {
    return <div className="text-center mt-8">Please sign in to update your settings.</div>;
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
      <Card className="glass border-0">
        <CardContent className="p-8 space-y-6">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">Theme</span>
                <select
                  className="border rounded p-2"
                  value={settings.theme}
                  onChange={e => handleChange('theme', e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={e => handleChange('notifications', e.target.checked)}
                  className="w-5 h-5"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
