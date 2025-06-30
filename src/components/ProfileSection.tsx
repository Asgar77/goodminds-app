import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Mail, 
  Calendar, 
  Trophy, 
  Target, 
  Heart, 
  Brain, 
  Shield, 
  Settings,
  Camera,
  Star,
  Award,
  Zap,
  Sparkles
} from 'lucide-react';
import { ThemeToggle } from "./ThemeToggle";

interface ProfileSectionProps {
  onLogout: () => void;
}

const ProfileSection = ({ onLogout }: ProfileSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState('Sarah Johnson');
  const [userBio, setUserBio] = useState('On a journey to better mental wellness 🌱');

  const wellnessStats = [
    { label: 'Days Active', value: 28, max: 30, color: 'from-purple-500 to-blue-500', icon: Calendar },
    { label: 'Mood Entries', value: 85, max: 100, color: 'from-pink-500 to-rose-500', icon: Heart },
    { label: 'Sessions with Tara', value: 12, max: 15, color: 'from-blue-500 to-cyan-500', icon: Brain },
    { label: 'Wellness Score', value: 87, max: 100, color: 'from-green-500 to-emerald-500', icon: Trophy },
  ];

  const achievements = [
    { name: 'First Steps', desc: 'Completed your first mood check-in', icon: Star, earned: true },
    { name: 'Consistent Tracker', desc: '7 days of mood tracking', icon: Target, earned: true },
    { name: 'Tara\'s Friend', desc: '5 sessions with our AI companion', icon: Heart, earned: true },
    { name: 'Self-Care Warrior', desc: '30 days of active wellness', icon: Award, earned: false },
    { name: 'Mindful Explorer', desc: 'Completed all assessment modules', icon: Brain, earned: false },
    { name: 'Wellness Champion', desc: 'Maintained 90+ wellness score', icon: Sparkles, earned: false },
  ];

  const recentMilestones = [
    { text: 'Maintained positive mood for 5 consecutive days', time: '2 days ago', emoji: '🌟' },
    { text: 'Completed Anxiety Assessment with improved score', time: '1 week ago', emoji: '💪' },
    { text: 'First heart-to-heart session with Tara', time: '2 weeks ago', emoji: '💙' },
    { text: 'Started your wellness journey', time: '1 month ago', emoji: '🌱' },
  ];

  return (
    <div className="space-y-8 animate-slide-up max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 dark:from-[#1a2e23] dark:via-[#1a2e23] dark:to-[#245A3A] rounded-3xl transition-colors"></div>
        <Card className="glass border-0 -mt-16 mx-4 relative z-10 bg-white/30 dark:bg-brand-green/40 backdrop-blur-md shadow-green-100 dark:shadow-green-900 shadow-xl transition-colors">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl font-bold">
                    SJ
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white shadow-lg hover:scale-110 transition-transform"
                  variant="outline"
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                </Button>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex justify-end md:justify-end mb-2">
                  <ThemeToggle />
                </div>
                {isEditing ? (
                  <div className="space-y-3">
                    <Input 
                      value={userName} 
                      onChange={(e) => setUserName(e.target.value)}
                      className="text-2xl font-bold border-2"
                    />
                    <Input 
                      value={userBio} 
                      onChange={(e) => setUserBio(e.target.value)}
                      className="text-gray-600"
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => setIsEditing(false)} size="sm">Save</Button>
                      <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{userName}</h1>
                    <p className="text-gray-600 mb-4">{userBio}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                      <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                        <Zap className="w-3 h-3 mr-1" />
                        Wellness Explorer
                      </Badge>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                        <Heart className="w-3 h-3 mr-1" />
                        28 Day Streak
                      </Badge>
                      <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Top 10% User
                      </Badge>
                    </div>
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="hover:scale-110 transition-transform">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={onLogout}
                  variant="outline" 
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wellness Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {wellnessStats.map((stat, index) => (
          <Card key={index} className="glass border-0 hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-800">{stat.value}</span>
              </div>
              <p className="text-gray-600 font-medium mb-3">{stat.label}</p>
              <Progress value={(stat.value / stat.max) * 100} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">{stat.value} of {stat.max}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Achievements & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Achievements */}
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievements.map((achievement, index) => (
              <div 
                key={index} 
                className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                  achievement.earned 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' 
                    : 'bg-gray-50 opacity-60'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  achievement.earned 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
                    : 'bg-gray-300 text-gray-500'
                }`}>
                  <achievement.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{achievement.name}</h4>
                  <p className="text-sm text-gray-600">{achievement.desc}</p>
                </div>
                {achievement.earned && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                    Earned
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Milestones */}
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <span>Recent Milestones</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMilestones.map((milestone, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-colors">
                <span className="text-2xl">{milestone.emoji}</span>
                <div className="flex-1">
                  <p className="text-gray-700 font-medium">{milestone.text}</p>
                  <p className="text-sm text-gray-500 mt-1">{milestone.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Privacy & Security */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-green-500" />
            <span>Privacy & Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Data Encrypted</h3>
              <p className="text-sm text-gray-600">Your mental wellness data is protected with end-to-end encryption</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Private by Default</h3>
              <p className="text-sm text-gray-600">Your conversations and assessments remain completely confidential</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Compassionate Care</h3>
              <p className="text-sm text-gray-600">Built with empathy and designed for your emotional wellbeing</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSection;
