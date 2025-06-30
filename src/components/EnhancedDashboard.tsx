
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Heart, 
  BarChart3, 
  Phone, 
  BookOpen, 
  User, 
  Menu, 
  X, 
  Sparkles,
  Sun,
  Moon,
  Wind,
  Zap,
  Target,
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react';
import MoodTracker from './MoodTracker';
import AssessmentModule from './AssessmentModule';
import VoiceAssistant from './VoiceAssistant';
import ProfileSection from './ProfileSection';

interface EnhancedDashboardProps {
  onLogout: () => void;
}

const EnhancedDashboard = ({ onLogout }: EnhancedDashboardProps) => {
  const [activeModule, setActiveModule] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const modules = [
    { id: 'overview', name: 'Overview', icon: BarChart3, gradient: 'from-purple-500 to-blue-500' },
    { id: 'mood', name: 'Mood Tracker', icon: Heart, gradient: 'from-pink-500 to-rose-500' },
    { id: 'assessments', name: 'Assessments', icon: Brain, gradient: 'from-blue-500 to-cyan-500' },
    { id: 'tara', name: 'Call to Tara', icon: Phone, gradient: 'from-green-500 to-emerald-500' },
    { id: 'journal', name: 'Journal', icon: BookOpen, gradient: 'from-orange-500 to-amber-500' },
    { id: 'profile', name: 'Profile', icon: User, gradient: 'from-indigo-500 to-purple-500' },
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
        return <ProfileSection onLogout={onLogout} />;
      default:
        return <EnhancedOverviewModule />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Mobile Menu Button */}
      <Button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden glass border-0 text-gray-700 hover:bg-white/80 shadow-lg"
        size="icon"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Enhanced Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-72 glass border-r border-purple-100/50
        transform transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                GoodMind
              </span>
              <p className="text-xs text-gray-500">Your Digital Sanctuary</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mb-6 p-4 glass rounded-xl border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Today's Wellness</span>
              <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs">
                Excellent
              </Badge>
            </div>
            <Progress value={87} className="h-2 mb-2" />
            <p className="text-xs text-gray-500">87% - Keep it up! 🌟</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => {
                  setActiveModule(module.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-300 group
                  ${activeModule === module.id 
                    ? `bg-gradient-to-r ${module.gradient} text-white shadow-lg transform scale-105` 
                    : 'text-gray-600 hover:bg-white/60 hover:shadow-md'
                  }
                `}
              >
                <div className={`p-2 rounded-xl ${
                  activeModule === module.id 
                    ? 'bg-white/20' 
                    : 'bg-gradient-to-r ' + module.gradient + ' text-white group-hover:scale-110 transition-transform'
                }`}>
                  <module.icon className="w-5 h-5" />
                </div>
                <span className="font-medium">{module.name}</span>
              </button>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="mt-6 p-4 glass rounded-xl border border-white/20">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Sarah Johnson</p>
                <p className="text-xs text-gray-500">Wellness Explorer</p>
              </div>
            </div>
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

// Enhanced Overview Module
const EnhancedOverviewModule = () => {
  const wellnessInsights = [
    { 
      title: "Morning Wellness Ritual", 
      desc: "Start your day with intention", 
      time: "8:00 AM",
      icon: Sun,
      color: "from-yellow-400 to-orange-500",
      completed: true
    },
    { 
      title: "Mindful Check-in", 
      desc: "How are you feeling right now?", 
      time: "2:00 PM",
      icon: Heart,
      color: "from-pink-400 to-rose-500",
      completed: false
    },
    { 
      title: "Evening Reflection", 
      desc: "Wind down with gratitude", 
      time: "8:00 PM",
      icon: Moon,
      color: "from-purple-400 to-indigo-500",
      completed: false
    },
  ];

  const moodTrend = [
    { day: 'Mon', mood: 85, color: 'bg-green-400' },
    { day: 'Tue', mood: 78, color: 'bg-blue-400' },
    { day: 'Wed', mood: 92, color: 'bg-green-500' },
    { day: 'Thu', mood: 88, color: 'bg-green-400' },
    { day: 'Fri', mood: 95, color: 'bg-green-500' },
    { day: 'Sat', mood: 82, color: 'bg-blue-400' },
    { day: 'Sun', mood: 90, color: 'bg-green-400' },
  ];

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Welcome Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-pink-400/20 rounded-3xl"></div>
        <div className="relative p-8 glass rounded-3xl border-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Good morning, Sarah! 
                </span>
                <span className="text-3xl ml-2">🌅</span>
              </h1>
              <p className="text-gray-600 text-lg">Ready to nurture your mind and soul today?</p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center animate-pulse-gentle">
                <Brain className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Wellness Plan */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-6 h-6 text-purple-500" />
            <span>Today's Wellness Journey</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {wellnessInsights.map((insight, index) => (
              <div 
                key={index} 
                className={`p-6 rounded-2xl transition-all duration-300 hover:scale-105 ${
                  insight.completed 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200' 
                    : 'glass border border-white/20 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${insight.color} rounded-xl flex items-center justify-center`}>
                    <insight.icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant={insight.completed ? "default" : "outline"} className="text-xs">
                    {insight.time}
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{insight.title}</h3>
                <p className="text-sm text-gray-600">{insight.desc}</p>
                {insight.completed && (
                  <div className="mt-3 flex items-center text-green-600 text-sm">
                    <Zap className="w-4 h-4 mr-1" />
                    Completed
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mood Trend Chart */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            <span>Weekly Mood Journey</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
              <span>This week you've maintained excellent emotional balance! 🎯</span>
              <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white">
                Trending Up ↗️
              </Badge>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {moodTrend.map((day, index) => (
                <div key={index} className="text-center">
                  <div className="relative h-20 bg-gray-100 rounded-lg mb-2 overflow-hidden">
                    <div 
                      className={`absolute bottom-0 left-0 right-0 ${day.color} rounded-lg transition-all duration-1000 ease-out`}
                      style={{ height: `${day.mood}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">{day.day}</span>
                  <div className="text-xs text-gray-500">{day.mood}%</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Highlights */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <span>Recent Highlights</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { 
              text: 'Completed your first week of consistent mood tracking', 
              time: '2 hours ago', 
              emoji: '🏆',
              color: 'from-yellow-400 to-orange-500'
            },
            { 
              text: 'Had a breakthrough conversation with Tara about managing stress', 
              time: '1 day ago', 
              emoji: '💡',
              color: 'from-blue-400 to-cyan-500'
            },
            { 
              text: 'Your anxiety assessment shows significant improvement', 
              time: '3 days ago', 
              emoji: '📈',
              color: 'from-green-400 to-emerald-500'
            },
            { 
              text: 'Discovered new coping strategies in your wellness journey', 
              time: '1 week ago', 
              emoji: '🌱',
              color: 'from-purple-400 to-pink-500'
            },
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 glass rounded-xl hover:shadow-md transition-all duration-300">
              <div className={`w-12 h-12 bg-gradient-to-r ${activity.color} rounded-full flex items-center justify-center text-xl`}>
                {activity.emoji}
              </div>
              <div className="flex-1">
                <span className="text-gray-700 font-medium">{activity.text}</span>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced Journal Module
const JournalModule = () => {
  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Personal Journal</h1>
        <p className="text-gray-600">Your safe space for thoughts, feelings, and self-reflection</p>
      </div>
      
      <Card className="glass border-0">
        <CardContent className="p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-float">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Your Digital Journal Awaits
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Express your thoughts and feelings in a safe, private space. Coming soon with AI-powered insights and mood analysis.
          </p>
          <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3">
            Start Writing
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedDashboard;
