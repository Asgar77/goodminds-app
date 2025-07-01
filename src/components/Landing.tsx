import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Brain, Users, Shield, ArrowRight, Calendar, Sparkles, Star } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
}

const Landing = ({ onGetStarted }: LandingProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showFeatures, setShowFeatures] = useState(false);
  const fullText = "Let's get through this together!";

  const handleBookAppointment = () => {
    window.open('https://calendly.com/goodmind/appointment1?month=2025-07', '_blank');
  };

  // Enhanced typing animation effect
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTyping(false);
        setShowFeatures(true);
        clearInterval(typingInterval);
      }
    }, 80);

    return () => clearInterval(typingInterval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Enhanced Background with Beautiful Gradient */}
      <div className="absolute inset-0 bg-goodmind-gradient animate-gradient"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 animate-pulse-soft"></div>
      
      {/* Floating Elements for Visual Appeal */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-green-200/30 rounded-full blur-xl animate-float-gentle"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-teal-200/20 rounded-full blur-2xl animate-float-gentle" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-40 left-20 w-24 h-24 bg-blue-200/25 rounded-full blur-xl animate-float-gentle" style={{ animationDelay: '4s' }}></div>
      
      {/* Header with Much Larger, More Visible Logos */}
      <header className="w-full py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* GoodMind Logo - Left - Dramatically Larger and More Visible */}
          <div className="flex items-center space-x-4 animate-slide-up-smooth">
            <div className="w-32 h-32 relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-teal-400 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <img
                src="/GoodMind_new_logo__25_-removebg-preview.png"
                alt="GoodMind Logo"
                className="relative w-full h-full object-contain drop-shadow-2xl filter brightness-110 contrast-125 hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'w-32 h-32 bg-gradient-to-br from-green-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl';
                  fallback.innerHTML = '<span class="text-white text-5xl">🧠</span>';
                  e.currentTarget.parentNode?.appendChild(fallback);
                }}
              />
            </div>
          </div>

          {/* Springfield Logo - Right - Dramatically Larger and More Visible */}
          <div className="flex items-center space-x-4 animate-slide-up-smooth" style={{ animationDelay: '0.2s' }}>
            <div className="w-32 h-32 relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-green-400 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <img
                src="/images-removebg-preview.png"
                alt="Springfield Education Logo"
                className="relative w-full h-full object-contain drop-shadow-2xl filter brightness-110 contrast-125 hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'w-32 h-32 bg-gradient-to-br from-blue-500 to-green-500 rounded-3xl flex items-center justify-center shadow-2xl';
                  fallback.innerHTML = '<span class="text-white text-3xl font-bold">SF</span>';
                  e.currentTarget.parentNode?.appendChild(fallback);
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Enhanced Layout with Animations */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Text Content with Enhanced Animations */}
            <div className="space-y-8">
              {/* Product Hunt Badge with Enhanced Animation */}
              <div className="inline-flex items-center space-x-3 bg-gray-800 text-white px-6 py-3 rounded-full text-sm font-medium animate-scale-in-smooth hover:scale-105 transition-transform cursor-pointer">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse-soft">
                  <span className="text-sm font-bold text-gray-800">3</span>
                </div>
                <span className="font-semibold text-xs">PRODUCT HUNT</span>
                <span className="opacity-90 text-xs">#3 Product of the Day</span>
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              </div>

              {/* Main Headline with Enhanced Typing Animation */}
              <div className="min-h-[200px] flex items-center">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-green-700 leading-tight">
                  {displayedText.split(' ').map((word, index) => {
                    if (word === 'together!') {
                      return (
                        <span key={index} className="font-black text-green-800 animate-pulse-soft">
                          {word}
                        </span>
                      );
                    }
                    return <span key={index} className="animate-fade-in-smooth" style={{ animationDelay: `${index * 0.1}s` }}>{word} </span>;
                  })}
                  {isTyping && (
                    <span className="animate-typing-cursor text-green-600 text-5xl">|</span>
                  )}
                </h1>
              </div>
              
              {/* CTA Button with Enhanced Animation */}
              <div className="animate-fade-in-smooth" style={{ animationDelay: '3s' }}>
                <Button 
                  onClick={onGetStarted}
                  className="bg-gray-800 hover:bg-gray-900 text-white font-semibold px-10 py-6 rounded-full text-lg transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-3xl group"
                >
                  Begin Your Journey
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-teal-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </Button>
              </div>
            </div>

            {/* Right Side - Enhanced Illustration with Animations */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-80 h-80 sm:w-96 sm:h-96 animate-float-gentle">
                {/* Enhanced Background Circle with Gradient Animation */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-orange-200 to-yellow-200 rounded-full opacity-60 animate-gradient"></div>
                <div className="absolute inset-2 bg-gradient-to-tr from-green-100 to-teal-100 rounded-full opacity-40 animate-pulse-soft"></div>
                
                {/* Main Illustration Area with Enhanced Elements */}
                <div className="absolute inset-8 flex items-center justify-center">
                  {/* Person silhouette with enhanced styling */}
                  <div className="relative animate-scale-in-smooth" style={{ animationDelay: '1s' }}>
                    {/* Person sitting - Enhanced Representation */}
                    <div className="w-32 h-40 bg-gradient-to-b from-blue-300 to-blue-400 rounded-t-full relative shadow-lg">
                      {/* Head with enhanced styling */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full shadow-md"></div>
                      {/* Hair with enhanced styling */}
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-20 h-12 bg-gradient-to-b from-gray-700 to-gray-600 rounded-t-full shadow-sm"></div>
                      {/* Arms hugging knees with enhanced positioning */}
                      <div className="absolute top-8 -left-4 w-8 h-16 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full transform rotate-45 shadow-md"></div>
                      <div className="absolute top-8 -right-4 w-8 h-16 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full transform -rotate-45 shadow-md"></div>
                    </div>
                    
                    {/* Legs with enhanced styling */}
                    <div className="w-24 h-20 bg-gradient-to-b from-blue-500 to-blue-600 rounded-b-3xl mx-auto shadow-lg"></div>
                  </div>
                  
                  {/* Supporting Hand from Top Right with Enhanced Animation */}
                  <div className="absolute -top-4 -right-8 w-16 h-20 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full transform rotate-12 opacity-80 animate-pulse-soft shadow-lg"></div>
                  
                  {/* Enhanced Decorative Plants with Animation */}
                  <div className="absolute bottom-4 left-4 animate-float-gentle" style={{ animationDelay: '2s' }}>
                    <div className="w-2 h-12 bg-gradient-to-t from-green-600 to-green-400 rounded-full shadow-sm"></div>
                    <div className="w-4 h-3 bg-gradient-to-br from-green-400 to-green-300 rounded-full -mt-1 shadow-sm"></div>
                  </div>
                  <div className="absolute bottom-8 right-2 animate-float-gentle" style={{ animationDelay: '3s' }}>
                    <div className="w-2 h-8 bg-gradient-to-t from-green-600 to-green-400 rounded-full shadow-sm"></div>
                    <div className="w-3 h-2 bg-gradient-to-br from-green-400 to-green-300 rounded-full -mt-1 shadow-sm"></div>
                  </div>
                  
                  {/* Additional Floating Elements for Visual Appeal */}
                  <div className="absolute top-2 left-8 w-3 h-3 bg-yellow-300 rounded-full animate-pulse-soft opacity-60"></div>
                  <div className="absolute top-12 right-12 w-2 h-2 bg-pink-300 rounded-full animate-float-gentle opacity-70"></div>
                  <div className="absolute bottom-16 left-2 w-4 h-4 bg-blue-300 rounded-full animate-pulse-soft opacity-50"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Feature Cards with Staggered Animations */}
          {showFeatures && (
            <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  className="card-modern hover:scale-110 transform transition-all duration-500 animate-slide-up-smooth group cursor-pointer" 
                  style={{ animationDelay: `${4.5 + index * 0.2}s` }}
                >
                  <CardContent className="p-6 text-center relative overflow-hidden">
                    {/* Background Gradient Animation */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl`}></div>
                    
                    {/* Icon with Enhanced Animation */}
                    <div className={`relative w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center group-hover:scale-125 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                      <feature.icon className="w-8 h-8 text-white" />
                      <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    
                    {/* Content with Enhanced Typography */}
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 group-hover:text-gray-900 transition-colors">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors">{feature.description}</p>
                    
                    {/* Hover Effect Stars */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Star className="w-4 h-4 text-yellow-400 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Enhanced Footer with Animations */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm border-t border-white/20 relative z-10 animate-fade-in-smooth" style={{ animationDelay: '6s' }}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 animate-float-gentle">
              <img
                src="/GoodMind_new_logo__25_-removebg-preview.png"
                alt="GoodMind Logo"
                className="w-full h-full object-contain hover:scale-110 transition-transform"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center';
                  fallback.innerHTML = '<span class="text-white text-lg">🧠</span>';
                  e.currentTarget.parentNode?.appendChild(fallback);
                }}
              />
            </div>
            <span className="text-xl font-bold text-gray-800 hover:text-green-600 transition-colors cursor-pointer">
              goodmind.app
            </span>
            <span className="text-xs text-gray-500 animate-pulse">™</span>
          </div>
          <p className="text-gray-500 text-sm mb-2 hover:text-gray-600 transition-colors">
            Registered not-for profit organization u/s 8 of the Companies Act with Reg. No: 159344 and
          </p>
          <p className="text-gray-500 text-sm mb-2 hover:text-gray-600 transition-colors">
            Goodmind Care Foundation's Corporate Identification Number is (CIN)
          </p>
          <p className="text-gray-500 text-sm hover:text-gray-600 transition-colors">
            U85300TG2022NPL159344
          </p>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-500 text-sm hover:text-gray-600 transition-colors">
              © 2024 GoodMind. Crafted with ❤️ for mental wellness.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;