
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Brain, Users, Shield } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
}

const Landing = ({ onGetStarted }: LandingProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              GoodMind
            </span>
          </div>
          <Button variant="outline" onClick={onGetStarted} className="hidden sm:block">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-slide-up">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6">
              Your Digital
              <span className="block bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent animate-pulse-gentle">
                Mental Wellness
              </span>
              Sanctuary
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Empowering your mental health journey with AI-powered support, 
              personalized assessments, and compassionate care — developed in partnership with Springfield School.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                onClick={onGetStarted}
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-xl"
              >
                Begin Your Journey
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 border-2 border-purple-200 hover:bg-purple-50 transform hover:scale-105 transition-all duration-300"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {[
              {
                icon: Heart,
                title: "Call to Tara",
                description: "AI-powered voice assistant for compassionate mental health support",
                color: "from-pink-500 to-rose-500"
              },
              {
                icon: Brain,
                title: "Smart Assessments",
                description: "Personalized psychological evaluations with actionable insights",
                color: "from-purple-500 to-indigo-500"
              },
              {
                icon: Users,
                title: "Mood Tracking",
                description: "Daily emotional wellness monitoring with beautiful visualizations",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Shield,
                title: "Safe & Secure",
                description: "Premium privacy protection for your mental health journey",
                color: "from-green-500 to-emerald-500"
              }
            ].map((feature, index) => (
              <Card key={index} className="glass border-0 hover:shadow-2xl transform hover:scale-105 transition-all duration-500 animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500">
            © 2024 GoodMind. Crafted with ❤️ in partnership with Springfield School.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
