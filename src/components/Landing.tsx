import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Brain, Users, Shield, ArrowRight, Calendar } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
}

const Landing = ({ onGetStarted }: LandingProps) => {
  const handleBookAppointment = () => {
    window.open('https://calendly.com/goodmind/appointment1?month=2025-07', '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Exact Background Gradient from Reference */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-green-50 to-green-200"></div>
      
      {/* Header with Updated Logos */}
      <header className="w-full py-4 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* GoodMind Logo - Left */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 relative">
              <img
                src="/GoodMind_new_logo__25_-removebg-preview.png"
                alt="GoodMind Logo"
                className="w-full h-full object-contain"
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
              <span className="text-2xl font-bold text-gray-800">
                goodmind
              </span>
              <span className="text-green-600 font-medium">.app</span>
            </div>
          </div>

          {/* Springfield Logo - Right */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 relative">
              <img
                src="/images-removebg-preview.png"
                alt="Springfield Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center';
                  fallback.innerHTML = '<span class="text-white text-sm">SF</span>';
                  e.currentTarget.parentNode?.appendChild(fallback);
                }}
              />
            </div>
            <div className="hidden sm:flex space-x-1">
              <div className="w-6 h-1 bg-gray-800 rounded-full"></div>
              <div className="w-6 h-1 bg-gray-800 rounded-full"></div>
              <div className="w-6 h-1 bg-gray-800 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Exact Layout from Reference */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Text Content */}
            <div className="space-y-8">
              {/* Product Hunt Badge - Exact Style */}
              <div className="inline-flex items-center space-x-3 bg-gray-800 text-white px-6 py-3 rounded-full text-sm font-medium animate-scale-in-smooth">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-800">3</span>
                </div>
                <span className="font-semibold text-xs">PRODUCT HUNT</span>
                <span className="opacity-90 text-xs">#3 Product of the Day</span>
              </div>

              {/* Main Headline - Exact Text */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-green-700 leading-tight">
                Let's get through this{' '}
                <span className="font-black">together!</span>
              </h1>
              
              {/* CTA Button - Exact Style */}
              <div>
                <Button 
                  onClick={onGetStarted}
                  className="bg-gray-800 hover:bg-gray-900 text-white font-semibold px-8 py-4 rounded-full text-lg transform hover:scale-105 transition-all duration-300 shadow-xl"
                >
                  Begin Your Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>

            {/* Right Side - Illustration */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-80 h-80 sm:w-96 sm:h-96">
                {/* Background Circle */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-orange-200 rounded-full opacity-60"></div>
                
                {/* Main Illustration Area */}
                <div className="absolute inset-8 flex items-center justify-center">
                  {/* Woman Sitting - Simplified Representation */}
                  <div className="relative">
                    {/* Person silhouette */}
                    <div className="w-32 h-40 bg-gradient-to-b from-blue-300 to-blue-400 rounded-t-full relative">
                      {/* Head */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-orange-200 rounded-full"></div>
                      {/* Hair */}
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-20 h-12 bg-gray-700 rounded-t-full"></div>
                      {/* Arms hugging knees */}
                      <div className="absolute top-8 -left-4 w-8 h-16 bg-orange-200 rounded-full transform rotate-45"></div>
                      <div className="absolute top-8 -right-4 w-8 h-16 bg-orange-200 rounded-full transform -rotate-45"></div>
                    </div>
                    
                    {/* Legs */}
                    <div className="w-24 h-20 bg-blue-500 rounded-b-3xl mx-auto"></div>
                  </div>
                  
                  {/* Supporting Hand from Top Right */}
                  <div className="absolute -top-4 -right-8 w-16 h-20 bg-orange-300 rounded-full transform rotate-12 opacity-80"></div>
                  
                  {/* Decorative Plants */}
                  <div className="absolute bottom-4 left-4">
                    <div className="w-2 h-12 bg-green-500 rounded-full"></div>
                    <div className="w-4 h-3 bg-green-400 rounded-full -mt-1"></div>
                  </div>
                  <div className="absolute bottom-8 right-2">
                    <div className="w-2 h-8 bg-green-500 rounded-full"></div>
                    <div className="w-3 h-2 bg-green-400 rounded-full -mt-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Cards - Below Main Content */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm border-t border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8">
              <img
                src="/GoodMind_new_logo__25_-removebg-preview.png"
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
            <span className="text-lg font-bold text-gray-800">
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