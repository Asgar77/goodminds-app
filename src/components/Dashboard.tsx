import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Heart, BarChart3, Phone, BookOpen, Settings, User, Menu, X, TrendingUp, Calendar, Award, Sparkles, CalendarDays } from 'lucide-react';
import MoodTracker from './MoodTracker';
import AssessmentModule from './AssessmentModule';
import VoiceAssistant from './VoiceAssistant';
import { auth, db } from '../lib/firebase';
import { useUserData } from './GoogleAuth';
import { collection, onSnapshot, addDoc, query, orderBy, deleteDoc, doc, setDoc, getDocs } from 'firebase/firestore';
import { ThemeToggle } from './ThemeToggle';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [activeModule, setActiveModule] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    moodEntries: 0,
    assessmentsCompleted: 0,
    taraSessions: 0,
    journalEntries: 0,
    currentStreak: 0,
    wellnessScore: 0
  });

  const user = auth.currentUser;
  const { userData } = useUserData(user?.uid);

  // Get user's first name for welcome message
  const getFirstName = () => {
    const displayName = userData?.displayName || user?.displayName || '';
    return displayName.split(' ')[0] || 'Student';
  };

  // Handle Book Appointment
  const handleBookAppointment = () => {
    window.open('https://calendly.com/goodmind/appointment1?month=2025-07', '_blank');
  };

  // Fetch dashboard statistics
  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        // Fetch mood entries
        const moodsSnapshot = await getDocs(collection(db, `users/${user.uid}/moods`));
        const moodEntries = moodsSnapshot.size;

        // Fetch assessments
        const assessmentsSnapshot = await getDocs(collection(db, `users/${user.uid}/assessments`));
        const assessmentsCompleted = assessmentsSnapshot.size;

        // Fetch Tara sessions
        const taraSnapshot = await getDocs(collection(db, `users/${user.uid}/taraSessions`));
        const taraSessions = taraSnapshot.size;

        // Fetch journal entries
        const journalSnapshot = await getDocs(collection(db, `users/${user.uid}/journal`));
        const journalEntries = journalSnapshot.size;

        // Calculate wellness score (simple algorithm)
        const wellnessScore = Math.min(100, Math.round(
          (moodEntries * 2) + 
          (assessmentsCompleted * 10) + 
          (taraSessions * 5) + 
          (journalEntries * 3)
        ));

        // Calculate current streak (simplified)
        const currentStreak = Math.floor(wellnessScore / 10);

        setDashboardStats({
          moodEntries,
          assessmentsCompleted,
          taraSessions,
          journalEntries,
          currentStreak,
          wellnessScore
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, [user]);

  const modules = [
    { id: 'overview', name: 'Overview', icon: BarChart3, color: 'from-green-500 to-teal-500' },
    { id: 'mood', name: 'Mood Tracker', icon: Heart, color: 'from-pink-500 to-rose-500' },
    { id: 'assessments', name: 'Assessments', icon: Brain, color: 'from-blue-500 to-cyan-500' },
    { id: 'tara', name: 'Call to TARA', icon: Phone, color: 'from-purple-500 to-indigo-500' },
    { id: 'journal', name: 'Journal', icon: BookOpen, color: 'from-orange-500 to-amber-500' },
    { id: 'appointment', name: 'Book an Appointment', icon: CalendarDays, color: 'from-emerald-500 to-green-500' },
    { id: 'profile', name: 'Profile', icon: User, color: 'from-gray-500 to-slate-500' },
    { id: 'settings', name: 'Settings', icon: Settings, color: 'from-indigo-500 to-purple-500' },
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
      case 'appointment':
        return <AppointmentModule />;
      case 'profile':
        return <ProfileModule onLogout={onLogout} />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <OverviewModule stats={dashboardStats} userData={userData} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
      {/* Mobile Menu Button */}
      <Button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden glass-modern border-0 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 rounded-2xl"
        size="icon"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Enhanced Sidebar with Much Larger Logos */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-80 glass-modern border-r border-white/20
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 h-full flex flex-col">
          {/* Header with Much Larger Logos */}
          <div className="flex items-center justify-between mb-8">
            {/* GoodMind Logo - Much Larger */}
            <div className="flex items-center space-x-3">
              <div className="w-20 h-20 relative">
                <img
                  src="/GoodMind_new_logo__25_-removebg-preview.png"
                  alt="GoodMind Logo"
                  className="w-full h-full object-contain animate-float-gentle drop-shadow-2xl filter brightness-110 contrast-125"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl';
                    fallback.innerHTML = '<span class="text-white text-3xl">🧠</span>';
                    e.currentTarget.parentNode?.appendChild(fallback);
                  }}
                />
              </div>
            </div>
            
            {/* Springfield Logo - Much Larger */}
            <div className="w-18 h-18 relative">
              <img
                src="/images-removebg-preview.png"
                alt="Springfield Education Logo"
                className="w-full h-full object-contain drop-shadow-2xl filter brightness-110 contrast-125"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'w-18 h-18 bg-gradient-to-br from-blue-500 to-green-500 rounded-3xl flex items-center justify-center shadow-2xl';
                  fallback.innerHTML = '<span class="text-white text-lg font-bold">SF</span>';
                  e.currentTarget.parentNode?.appendChild(fallback);
                }}
              />
            </div>
          </div>

          {/* User Welcome with First Name */}
          <div className="mb-6 p-4 glass-modern rounded-2xl border border-white/20">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-teal-400 rounded-full flex items-center justify-center">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Welcome, {getFirstName()}!
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Wellness Explorer</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">Wellness Score</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {dashboardStats.wellnessScore}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${dashboardStats.wellnessScore}%` }}
              ></div>
            </div>
          </div>

          {/* Navigation with Book Appointment */}
          <nav className="space-y-2 flex-1">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => {
                  if (module.id === 'appointment') {
                    handleBookAppointment();
                  } else {
                    setActiveModule(module.id);
                    setSidebarOpen(false);
                  }
                }}
                className={`
                  w-full flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-300 group
                  ${activeModule === module.id 
                    ? `bg-gradient-to-r ${module.color} text-white shadow-lg transform scale-105` 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:shadow-md'
                  }
                `}
              >
                <div className={`p-2 rounded-xl ${
                  activeModule === module.id 
                    ? 'bg-white/20' 
                    : 'bg-gradient-to-r ' + module.color + ' text-white group-hover:scale-110 transition-transform'
                }`}>
                  <module.icon className="w-5 h-5" />
                </div>
                <span className="font-medium">{module.name}</span>
              </button>
            ))}
          </nav>

          {/* Theme Toggle */}
          <div className="mt-6 flex justify-center">
            <ThemeToggle />
          </div>
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
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Enhanced Overview Module with Personalized Welcome
const OverviewModule = ({ stats, userData }: { stats: any, userData: any }) => {
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const user = auth.currentUser;

  // Get user's first name for personalized welcome
  const getFirstName = () => {
    const displayName = userData?.displayName || user?.displayName || '';
    return displayName.split(' ')[0] || 'Student';
  };

  useEffect(() => {
    if (!user) return;

    // Fetch recent activity from all collections
    const fetchActivity = async () => {
      try {
        const activities: any[] = [];

        // Fetch recent moods
        const moodsQuery = query(
          collection(db, `users/${user.uid}/moods`), 
          orderBy('createdAt', 'desc')
        );
        const moodsSnapshot = await getDocs(moodsQuery);
        moodsSnapshot.docs.slice(0, 3).forEach(doc => {
          const data = doc.data();
          activities.push({
            type: 'mood',
            emoji: data.emoji,
            label: data.label,
            timestamp: data.createdAt,
            id: doc.id
          });
        });

        // Fetch recent assessments
        const assessmentsSnapshot = await getDocs(collection(db, `users/${user.uid}/assessments`));
        assessmentsSnapshot.docs.slice(0, 2).forEach(doc => {
          activities.push({
            type: 'assessment',
            label: doc.id,
            timestamp: doc.data().completedAt,
            id: doc.id
          });
        });

        // Sort by timestamp
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setActivityFeed(activities.slice(0, 5));
      } catch (error) {
        console.error('Error fetching activity:', error);
      }
    };

    fetchActivity();
  }, [user]);

  const statCards = [
    { 
      label: 'Wellness Score', 
      value: `${stats.wellnessScore}%`, 
      color: 'from-green-500 to-teal-500', 
      icon: TrendingUp,
      change: '+5% this week'
    },
    { 
      label: 'Current Streak', 
      value: `${stats.currentStreak} days`, 
      color: 'from-blue-500 to-cyan-500', 
      icon: Calendar,
      change: 'Keep it up!'
    },
    { 
      label: 'Mood Entries', 
      value: stats.moodEntries, 
      color: 'from-pink-500 to-rose-500', 
      icon: Heart,
      change: `${stats.moodEntries} total`
    },
    { 
      label: 'Assessments', 
      value: stats.assessmentsCompleted, 
      color: 'from-purple-500 to-indigo-500', 
      icon: Brain,
      change: `${stats.assessmentsCompleted} completed`
    },
  ];

  return (
    <div className="space-y-8 animate-slide-up-smooth">
      {/* Personalized Welcome Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-teal-400/20 to-blue-400/20 rounded-3xl"></div>
        <div className="relative p-8 glass-modern rounded-3xl border-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="text-gray-800">
                  Welcome back, {getFirstName()}! 
                </span>
                <span className="text-3xl ml-2">🌅</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">Ready to continue your wellness journey today?</p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-teal-400 rounded-full flex items-center justify-center animate-pulse-soft">
                <Award className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="card-modern hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">{stat.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800 dark:text-white flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-green-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activityFeed.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Start your wellness journey to see activity here!</p>
            </div>
          ) : (
            activityFeed.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors">
                <span className="text-gray-700 dark:text-gray-300">
                  {activity.type === 'mood' && <>{activity.emoji} Logged mood: <b>{activity.label}</b></>}
                  {activity.type === 'assessment' && <>📝 Completed assessment: <b>{activity.label}</b></>}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : 'Recent'}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// New Appointment Module
const AppointmentModule = () => {
  const handleBookAppointment = () => {
    window.open('https://calendly.com/goodmind/appointment1?month=2025-07', '_blank');
  };

  return (
    <div className="space-y-8 animate-slide-up-smooth">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Book an Appointment</h1>
        <p className="text-gray-600">Schedule a personalized session with our mental health professionals</p>
      </div>
      
      <Card className="card-modern">
        <CardContent className="p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-float-gentle">
            <CalendarDays className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">
            Professional Mental Health Support
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Connect with licensed mental health professionals for personalized support and guidance tailored to your needs.
          </p>
          <Button 
            onClick={handleBookAppointment}
            className="btn-goodmind text-lg px-12 py-6"
          >
            <CalendarDays className="w-6 h-6 mr-3" />
            Schedule Your Appointment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced Journal Module
const JournalModule = () => {
  const user = auth.currentUser;
  const [entry, setEntry] = useState('');
  const [journal, setJournal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleSave = async () => {
    if (!user || !entry.trim()) return;
    try {
      await addDoc(collection(db, `users/${user.uid}/journal`), {
        text: entry,
        createdAt: new Date().toISOString(),
        mood: 'neutral',
      });
      setEntry('');
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/journal/${id}`));
    } catch (error) {
      console.error('Error deleting journal entry:', error);
    }
  };

  if (!user) {
    return (
      <div className="text-center mt-8">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Please sign in to use your journal.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up-smooth">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Personal Journal</h1>
        <p className="text-gray-600 dark:text-gray-300">Your safe space for thoughts, feelings, and self-reflection</p>
      </div>
      
      <Card className="card-modern">
        <CardContent className="p-8">
          <textarea
            className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white mb-4 min-h-[120px] resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            placeholder="What's on your mind today? Write your thoughts, feelings, or reflections..."
            value={entry}
            onChange={e => setEntry(e.target.value)}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {entry.length} characters
            </span>
            <Button 
              onClick={handleSave} 
              disabled={!entry.trim()} 
              className="btn-goodmind"
            >
              Save Entry
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800 dark:text-white">Your Journal Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="loading-spinner h-8 w-8"></div>
            </div>
          ) : journal.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No entries yet. Start writing to capture your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {journal.map(entry => (
                <div key={entry.id} className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(entry.createdAt).toLocaleString()}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="text-gray-800 dark:text-white whitespace-pre-line leading-relaxed">
                    {entry.text}
                  </div>
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
  const { userData } = useUserData(user?.uid);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setDisplayName(userData?.displayName || user?.displayName || '');
  }, [userData, user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, `users/${user.uid}`), { displayName }, { merge: true });
      await user.updateProfile({ displayName });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile.');
    }
    setSaving(false);
  };

  if (!user) {
    return (
      <div className="text-center mt-8">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up-smooth">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your account and preferences</p>
      </div>
      
      <Card className="card-modern">
        <CardContent className="p-8">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-20 h-20 object-cover rounded-full" />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                disabled={saving}
                placeholder="Enter your display name"
              />
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Created</label>
                <input
                  type="text"
                  value={user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : '—'}
                  disabled
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Login</label>
                <input
                  type="text"
                  value={user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : '—'}
                  disabled
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                />
              </div>
            </div>
          </div>
          
          {message && (
            <div className={`p-3 rounded-2xl mb-4 ${
              message.includes('Error') 
                ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            }`}>
              {message}
            </div>
          )}
          
          <div className="flex space-x-4">
            <Button 
              onClick={handleSave} 
              disabled={saving || !displayName.trim()}
              className="btn-goodmind"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button 
              onClick={onLogout}
              variant="outline" 
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 rounded-2xl"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Settings Module Component
const SettingsModule = () => {
  const user = auth.currentUser;
  const [settings, setSettings] = useState<any>({ 
    theme: 'light', 
    notifications: true,
    privacy: 'private',
    dataSharing: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const settingsRef = doc(db, `users/${user.uid}/settings/preferences`);
    const unsub = onSnapshot(settingsRef, (snap) => {
      if (snap.exists()) {
        setSettings({ ...settings, ...snap.data() });
      }
      setLoading(false);
    });
    
    return () => unsub();
  }, [user]);

  const handleChange = async (field: string, value: any) => {
    if (!user) return;
    
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    
    try {
      await setDoc(doc(db, `users/${user.uid}/settings/preferences`), newSettings, { merge: true });
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  if (!user) {
    return (
      <div className="text-center mt-8">
        <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Please sign in to access settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up-smooth">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-300">Customize your GoodMind experience</p>
      </div>
      
      <Card className="card-modern">
        <CardContent className="p-8 space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="loading-spinner h-8 w-8"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-800 dark:text-white">Notifications</span>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Receive wellness reminders and updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={e => handleChange('notifications', e.target.checked)}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-800 dark:text-white">Data Sharing</span>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Help improve GoodMind with anonymous usage data</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.dataSharing}
                  onChange={e => handleChange('dataSharing', e.target.checked)}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-800 dark:text-white">Privacy Level</span>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Control who can see your wellness data</p>
                </div>
                <select
                  className="border border-gray-200 dark:border-gray-600 rounded-2xl p-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500"
                  value={settings.privacy}
                  onChange={e => handleChange('privacy', e.target.value)}
                >
                  <option value="private">Private</option>
                  <option value="friends">Friends Only</option>
                  <option value="public">Public</option>
                </select>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;