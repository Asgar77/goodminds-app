import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, PhoneCall, Mic, MicOff, Volume2, VolumeX, MessageCircle, Calendar, ArrowLeft } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const elevenLabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
const elevenLabsVoiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID;
const elevenLabsAgentApiKey = import.meta.env.VITE_ELEVENLABS_AGENT_API_KEY;
const elevenLabsAgentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

const VoiceAssistant = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [conversation, setConversation] = useState<any[]>([]);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const { toast } = useToast();
  const user = auth.currentUser;

  // Fetch recent sessions
  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, `users/${user.uid}/taraSessions`), 
      orderBy('startTime', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessions: any[] = [];
      snapshot.forEach(doc => {
        sessions.push({ id: doc.id, ...doc.data() });
      });
      setRecentSessions(sessions.slice(0, 5));
    });

    return () => unsubscribe();
  }, [user]);

  // Session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBookAppointment = () => {
    window.open('https://calendly.com/goodmind/appointment1?month=2025-07', '_blank');
  };

  const startCall = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to start a session with TARA.",
        variant: "destructive",
      });
      return;
    }

    setIsCallActive(true);
    setSessionDuration(0);
    setConversation([]);
    
    // Save session start to Firebase
    try {
      await addDoc(collection(db, `users/${user.uid}/taraSessions`), {
        startTime: serverTimestamp(),
        status: 'active',
        topic: 'Student wellness check-in',
      });
    } catch (error) {
      console.error('Error starting session:', error);
    }

    // Simulate TARA's greeting
    setTimeout(() => {
      const greeting = "Hello! I'm TARA, your mental wellness companion. I'm here to listen and support you through your academic journey. How are you feeling today?";
      setConversation([{ speaker: 'tara', message: greeting, timestamp: new Date() }]);
      speakText(greeting);
    }, 1000);
  };

  const endCall = async () => {
    setIsCallActive(false);
    setIsSpeaking(false);
    setIsMuted(false);
    setIsListening(false);
    
    // Save session end to Firebase
    if (user && sessionDuration > 0) {
      try {
        await addDoc(collection(db, `users/${user.uid}/taraSessions`), {
          endTime: serverTimestamp(),
          duration: formatDuration(sessionDuration),
          topic: conversation.length > 0 ? 'Student wellness conversation' : 'Brief check-in',
          conversationLength: conversation.length,
        });
        
        toast({
          title: "Session Completed",
          description: `Your ${formatDuration(sessionDuration)} session with TARA has been saved.`,
        });
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }
  };

  const speakText = async (text: string) => {
    if (!elevenLabsApiKey || !elevenLabsVoiceId) {
      console.warn('ElevenLabs API not configured');
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 3000);
      return;
    }

    try {
      setIsSpeaking(true);
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice_settings: { 
            stability: 0.7, 
            similarity_boost: 0.8,
            style: 0.2,
            use_speaker_boost: true
          },
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      } else {
        throw new Error('Failed to generate speech');
      }
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      setIsSpeaking(false);
      toast({
        title: "Audio Error",
        description: "Unable to play TARA's voice. Check your connection.",
        variant: "destructive",
      });
    }
  };

  const getAgentResponse = async (userMessage: string) => {
    if (!elevenLabsAgentApiKey || !elevenLabsAgentId) {
      console.warn('ElevenLabs Agent API not configured');
      return { text: "I'm here to listen and support you. Can you tell me more about how you're feeling?" };
    }
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/agents/${elevenLabsAgentId}/chat`, {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsAgentApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: userMessage,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error('Failed to get agent response');
      }
    } catch (error) {
      console.error('Error with agent API:', error);
      return { text: "I'm here to listen and support you. Can you tell me more about how you're feeling?" };
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
      setConversation(prev => [...prev, { 
        speaker: 'user', 
        message: transcript, 
        timestamp: new Date() 
      }]);
      
      const agentResponse = await getAgentResponse(transcript);
      setConversation(prev => [...prev, { 
        speaker: 'tara', 
        message: agentResponse.text, 
        timestamp: new Date() 
      }]);
      speakText(agentResponse.text);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  if (isCallActive) {
    return <CallInterface 
      isMuted={isMuted} 
      setIsMuted={setIsMuted} 
      isSpeaking={isSpeaking} 
      isListening={isListening}
      onEndCall={endCall}
      onStartListening={startListening}
      conversation={conversation}
      sessionDuration={sessionDuration}
      formatDuration={formatDuration}
    />;
  }

  return (
    <div className="space-y-8 animate-slide-up-smooth">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Call to TARA</h1>
        <p className="text-gray-600">
          Connect with TARA, your AI-powered mental health companion designed specifically for students. 
          She's here to listen, support, and guide you through your academic and personal challenges.
        </p>
      </div>

      {/* TARA Introduction */}
      <Card className="card-modern">
        <CardContent className="p-8 text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-green-500 via-teal-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse-soft relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-teal-400 rounded-full animate-pulse"></div>
            <div className="relative w-28 h-28 bg-white rounded-full flex items-center justify-center">
              <span className="text-4xl">🌸</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Meet TARA</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            TARA is your compassionate AI mental health specialist, available 24/7 to provide 
            support, guidance, and a listening ear specifically for student challenges. She understands 
            academic stress, social pressures, and the unique mental health needs of students.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-r from-green-100 to-teal-100 p-4 rounded-2xl">
              <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800 mb-1">Student-Focused Support</h3>
              <p className="text-sm text-gray-600">Specialized in academic stress and student mental health</p>
            </div>
            <div className="bg-gradient-to-r from-teal-100 to-blue-100 p-4 rounded-2xl">
              <Phone className="w-8 h-8 text-teal-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800 mb-1">24/7 Available</h3>
              <p className="text-sm text-gray-600">Always here when you need support, day or night</p>
            </div>
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-2xl">
              <Volume2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800 mb-1">Confidential & Safe</h3>
              <p className="text-sm text-gray-600">Private conversations in a judgment-free space</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={startCall}
              className="btn-goodmind text-lg px-12 py-6 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-xl"
            >
              <Phone className="w-6 h-6 mr-3" />
              Start Session with TARA
            </Button>
            
            <Button 
              onClick={handleBookAppointment}
              variant="outline"
              className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white text-lg px-12 py-6 rounded-2xl transform hover:scale-105 transition-all duration-300"
            >
              <Calendar className="w-6 h-6 mr-3" />
              Book an Appointment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSessions.length === 0 ? (
              <div className="text-center py-8">
                <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No sessions yet. Start your first conversation with TARA!</p>
              </div>
            ) : (
              recentSessions.map((session, index) => (
                <div key={session.id || index} className="flex items-center justify-between p-4 bg-white/50 rounded-2xl hover:bg-white/70 transition-colors">
                  <div>
                    <div className="font-medium text-gray-800">{session.topic || 'Student wellness conversation'}</div>
                    <div className="text-sm text-gray-600">
                      {session.startTime ? new Date(session.startTime.toDate()).toLocaleString() : 'Recent'} 
                      {session.duration && ` • ${session.duration}`}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl">View Notes</Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tips for Students */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">💡 Tips for Your Session</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-green-100 to-teal-100 p-4 rounded-2xl">
              <h4 className="font-semibold text-gray-800 mb-2">🎧 Find a Quiet Study Space</h4>
              <p className="text-gray-700 text-sm">Choose a comfortable, private environment where you feel safe to express yourself about academic and personal challenges.</p>
            </div>
            <div className="bg-gradient-to-r from-teal-100 to-blue-100 p-4 rounded-2xl">
              <h4 className="font-semibold text-gray-800 mb-2">💭 Share Your Academic Stress</h4>
              <p className="text-gray-700 text-sm">TARA understands student life. Feel free to discuss exam anxiety, social pressures, or any academic concerns.</p>
            </div>
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-2xl">
              <h4 className="font-semibold text-gray-800 mb-2">⏰ No Time Pressure</h4>
              <p className="text-gray-700 text-sm">Take your time. TARA is available 24/7, so you can have sessions whenever you need support.</p>
            </div>
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-2xl">
              <h4 className="font-semibold text-gray-800 mb-2">🤝 Remember: You're Not Alone</h4>
              <p className="text-gray-700 text-sm">Many students face similar challenges. TARA is here to remind you that seeking help is a sign of strength.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// iOS-style Call Interface Component
const CallInterface = ({ 
  isMuted, 
  setIsMuted, 
  isSpeaking, 
  isListening,
  onEndCall, 
  onStartListening,
  conversation,
  sessionDuration,
  formatDuration
}: {
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  isSpeaking: boolean;
  isListening: boolean;
  onEndCall: () => void;
  onStartListening: () => void;
  conversation: any[];
  sessionDuration: number;
  formatDuration: (seconds: number) => string;
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 p-4 relative overflow-hidden">
      {/* Background blur effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-400/20 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-float-gentle"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 text-center relative z-10">
        {/* TARA Avatar */}
        <div className="relative">
          <div className={`
            w-48 h-48 mx-auto bg-gradient-to-br from-green-400 via-teal-400 to-blue-400 rounded-full flex items-center justify-center relative overflow-hidden
            ${isSpeaking ? 'animate-pulse ring-8 ring-white/30' : ''}
            ${isListening ? 'ring-8 ring-green-400/50 animate-pulse' : ''}
          `}>
            {/* Animated background for speaking */}
            {isSpeaking && (
              <div className="absolute inset-0 bg-gradient-to-br from-green-300 to-teal-300 rounded-full animate-pulse"></div>
            )}
            
            <div className="relative w-44 h-44 bg-white rounded-full flex items-center justify-center">
              <span className="text-6xl">🌸</span>
            </div>
          </div>
          
          {/* Speaking/Listening Indicator */}
          {(isSpeaking || isListening) && (
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-8 rounded-full animate-pulse ${
                      isListening ? 'bg-green-400' : 'bg-white'
                    }`}
                    style={{ 
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '1s'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Call Status */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white">TARA</h2>
          <p className="text-white/80 text-lg">
            {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Ready to listen...'}
          </p>
          <div className="bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
            <p className="text-white/60 text-sm">Session • {formatDuration(sessionDuration)}</p>
          </div>
        </div>

        {/* Live Conversation */}
        <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-6 text-left max-h-40 overflow-y-auto">
          <h3 className="text-white font-medium mb-3 text-center">Live Conversation</h3>
          <div className="space-y-2 text-white/80 text-sm">
            {conversation.length === 0 ? (
              <p className="text-white/60 italic text-center">Conversation will appear here...</p>
            ) : (
              conversation.slice(-3).map((msg, index) => (
                <div key={index} className={`${msg.speaker === 'tara' ? 'text-green-300' : 'text-blue-300'}`}>
                  <strong>{msg.speaker === 'tara' ? 'TARA' : 'You'}:</strong> {msg.message}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Call Controls - iOS Style */}
        <div className="flex justify-center space-x-8">
          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              isMuted 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
          </button>

          {/* Talk Button */}
          <button
            onClick={onStartListening}
            disabled={isSpeaking || isListening}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening 
                ? 'bg-green-500 animate-pulse' 
                : 'bg-blue-500 hover:bg-blue-600 disabled:opacity-50'
            }`}
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </button>

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all duration-300 transform hover:scale-105"
          >
            <PhoneCall className="w-6 h-6 text-white transform rotate-135" />
          </button>
        </div>

        {/* Instructions */}
        <div className="text-white/60 text-sm space-y-1">
          <p>Tap the blue button to speak</p>
          <p>TARA will respond with voice and text</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;