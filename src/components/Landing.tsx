import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Brain, Users, Shield, Sparkles, ArrowRight } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
}

const Landing = ({ onGetStarted }: LandingProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-goodmind-gradient">
      {/* Header */}
      <header className="w-full py-4 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 relative">
              <img
                src="/GoodMind new logo (13).png"
                alt="GoodMind Logo"
                className="w-full h-full object-contain animate-float-gentle"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center';
                  fallback.innerHTML = '<span class="text-white text-xl">🧠</span>';
                  e.currentTarget.parentNode?.appendChild(fallback);
                }}
              />
            </div>
            <div>
              <span className="text-2xl font-bold text-goodmind-gradient">
                goodmind
              </span>
              <span className="text-green-600 font-medium">.app</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={onGetStarted} 
            className="hidden sm:flex border-green-500 text-green-600 hover:bg-green-500 hover:text-white rounded-2xl px-6 py-2 transition-all duration-300"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-200/30 rounded-full blur-3xl animate-pulse-soft"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-float-gentle"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="animate-slide-up-smooth">
            {/* Product Hunt Badge */}
            <div className="inline-flex items-center space-x-2 bg-green-800 text-white px-4 py-2 rounded-full text-sm font-medium mb-8 animate-scale-in-smooth">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-green-800">3</span>
              </div>
              <span>PRODUCT HUNT</span>
              <span className="opacity-90">#3 Product of the Day</span>
            </div>

            {/* Main Headline */}
            <h1 className="mobile-text font-bold mb-6 text-gray-800 leading-tight">
              Your space. Your feelings.
              <span className="block text-goodmind-gradient animate-gradient">
                Your journey!
              </span>
            </h1>
            
            <p className="mobile-subtitle text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              A friendly corner just for you! To explore emotions, talk to TARA, 
              track your mood, and journal your thoughts.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                onClick={onGetStarted}
                className="btn-goodmind text-lg mobile-padding group"
              >
                Begin Your Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                className="btn-goodmind-outline text-lg mobile-padding"
              >
                Learn More
              </Button>
            </div>

            {/* Motivational Quote */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 mb-16 border border-white/30 animate-fade-in-smooth">
              <h2 className="text-3xl sm:text-4xl font-bold text-green-700 mb-4">
                Let's get through this together!
              </h2>
              <p className="text-gray-600 text-lg">
                From illness to wellness, from stress to bliss, we help you take that leap.
              </p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {[
              {
                icon: Heart,
                title: "Call to TARA",
                description: "AI-powered voice companion for compassionate mental health support",
                color: "from-pink-500 to-rose-500",
                delay: "0s"
              },
              {
                icon: Brain,
                title: "Smart Assessments",
                description: "Personalized psychological evaluations with actionable insights",
                color: "from-green-500 to-teal-500",
                delay: "0.1s"
              },
              {
                icon: Users,
                title: "Mood Tracking",
                description: "Daily emotional wellness monitoring with beautiful visualizations",
                color: "from-blue-500 to-cyan-500",
                delay: "0.2s"
              },
              {
                icon: Shield,
                title: "Safe & Secure",
                description: "Premium privacy protection for your mental health journey",
                color: "from-purple-500 to-indigo-500",
                delay: "0.3s"
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="card-modern hover:scale-105 transform transition-all duration-500 animate-slide-up-smooth group" 
                style={{ animationDelay: feature.delay }}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* What We Offer Section */}
          <div className="mt-32 animate-fade-in-smooth">
            <h2 className="text-3xl font-bold text-gray-800 mb-16">What we offer</h2>
            
            <Card className="card-modern max-w-2xl mx-auto">
              <CardContent className="p-8 text-center">
                <div className="w-32 h-32 mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-teal-100 rounded-3xl"></div>
                  <div className="absolute inset-4 bg-white rounded-2xl flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Smart Assessment</h3>
                <p className="text-gray-600 leading-relaxed mb-8">
                  We offer a cutting-edge mental health services that revolutionizes self-care with 
                  free AI-powered assessment tool. This Smart Assessments are designed to analyze 
                  various factors to offer a comprehensive understanding of individuals current mental condition.
                </p>
                
                <Button className="btn-goodmind">
                  Take Assessment
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action Section */}
          <div className="mt-32 animate-slide-up-smooth">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-3xl p-8 sm:p-12 text-white text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                RISE AS A MENTAL HEALTH WARRIOR!
              </h2>
              <p className="text-lg sm:text-xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
                Ready to be a part of something greater and make a difference? Join us as a Campus Ambassador 
                and become a driving force to normalise mental wellness. Embrace the spirit of resilience, 
                the power of compassion, and the courage to spark change.
              </p>
              <p className="text-lg mb-8 opacity-90">
                Let your heart lead the way. Join our tribe of passionate ambassadors and unleash the warrior 
                in YOU! Let's unite to make a difference and build a brighter world—for YOU, for US!
              </p>
              <Button 
                className="bg-white text-green-600 hover:bg-gray-100 font-bold px-8 py-4 rounded-2xl text-lg transform hover:scale-105 transition-all duration-300"
              >
                Join Now!
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm border-t border-white/20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8">
              <img
                src="/GoodMind new logo (13).png"
                alt="GoodMind Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center';
                  fallback.innerHTML = '<span class="text-white text-sm">🧠</span>';
                  e.currentTarget.parentNode?.appendChild(fallback);
                }}
              />
            </div>
            <span className="text-lg font-bold text-goodmind-gradient">
              goodmind.app
            </span>
            <span className="text-xs text-gray-500">™</span>
          </div>
          <p className="text-gray-500 text-sm mb-2">
            Registered not-for profit organization u/s 8 of the Companies Act with Reg. No: 159344 and
          </p>
          <p className="text-gray-500 text-sm mb-2">
            Goodmind Care Foundation's Corporate Identification Number is (CIN)
          </p>
          <p className="text-gray-500 text-sm">
            U85300TG2022NPL159344
          </p>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              © 2024 GoodMind. Crafted with ❤️ for mental wellness.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;