import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, PhoneCall, Mic, MicOff, Volume2, VolumeX, MessageCircle } from 'lucide-react';
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
      setRecentSessions(sessions.slice(0, 5)); // Show last 5 sessions
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

  const startCall = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to start a session with Tara.",
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
        topic: 'General wellness check-in',
      });
    } catch (error) {
      console.error('Error starting session:', error);
    }

    // Simulate Tara's greeting
    setTimeout(() => {
      const greeting = "Hello! I'm Tara, your mental wellness companion. I'm here to listen and support you. How are you feeling today?";
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
          topic: conversation.length > 0 ? 'Wellness conversation' : 'Brief check-in',
          conversationLength: conversation.length,
        });
        
        toast({
          title: "Session Completed",
          description: `Your ${formatDuration(sessionDuration)} session with Tara has been saved.`,
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
        description: "Unable to play Tara's voice. Check your connection.",
        variant: "destructive",
      });
    }
  };

  const getAgentResponse = async (userMessage: string) => {
    if (!elevenLabsAgentApiKey || !elevenLabsAgentId) {
      console.warn('ElevenLabs Agent API not configured');
      return { text: "I'm sorry, I can't respond right now." };
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
      return { text: "I'm sorry, I can't respond right now." };
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
      // Call ElevenLabs Agent API for dynamic response
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
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Call to Tara</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Connect with Tara, your AI-powered mental health companion. She's here to listen, 
          support, and guide you through your wellness journey.
        </p>
      </div>

      {/* Tara Introduction */}
      <Card className="glass border-0">
        <CardContent className="p-8 text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse-gentle">
            <div className="w-28 h-28 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-4xl">🌸</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Meet Tara</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Tara is your compassionate AI mental health specialist, available 24/7 to provide 
            support, guidance, and a listening ear. She combines advanced AI with empathetic 
            conversation to create a safe space for your thoughts and feelings.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 p-4 rounded-xl">
              <MessageCircle className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Real-time Voice</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Natural conversation with AI-powered voice</p>
            </div>
            <div className="bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 p-4 rounded-xl">
              <Phone className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800 dark:text-white mb-1">24/7 Available</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Always here when you need support</p>
            </div>
            <div className="bg-gradient-to-r from-green-100 to-pink-100 dark:from-green-900/30 dark:to-pink-900/30 p-4 rounded-xl">
              <Volume2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800 dark:text-white mb-1">Confidential</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Private and secure conversations</p>
            </div>
          </div>

          <Button 
            onClick={startCall}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-lg px-12 py-6 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-xl"
          >
            <Phone className="w-6 h-6 mr-3" />
            Start Session with Tara
          </Button>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800 dark:text-white">Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentSessions.length === 0 ? (
              <div className="text-center py-8">
                <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No sessions yet. Start your first conversation with Tara!</p>
              </div>
            ) : (
              recentSessions.map((session, index) => (
                <div key={session.id || index} className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">{session.topic || 'Wellness conversation'}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {session.startTime ? new Date(session.startTime.toDate()).toLocaleString() : 'Recent'} 
                      {session.duration && ` • ${session.duration}`}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View Notes</Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800 dark:text-white">💡 Tips for Your Session</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 p-4 rounded-xl">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2">🎧 Find a Quiet Space</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">Choose a comfortable, private environment where you feel safe to express yourself.</p>
            </div>
            <div className="bg-gradient-to-r from-blue-100 to-pink-100 dark:from-blue-900/30 dark:to-pink-900/30 p-4 rounded-xl">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2">💭 Be Open & Honest</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">Tara is here to help. The more honest you are, the better support she can provide.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced Call Interface Component
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Tara Avatar */}
        <div className="relative">
          <div className={`
            w-48 h-48 mx-auto bg-gradient-to-br from-purple-400 via-blue-400 to-pink-400 rounded-full flex items-center justify-center
            ${isSpeaking ? 'animate-pulse ring-8 ring-white/30' : ''}
            ${isListening ? 'ring-8 ring-green-400/50' : ''}
          `}>
            <div className="w-44 h-44 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-6xl">🌸</span>
            </div>
          </div>
          
          {/* Speaking/Listening Indicator */}
          {(isSpeaking || isListening) && (
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-8 rounded-full animate-pulse ${
                      isListening ? 'bg-green-400' : 'bg-white'
                    }`}
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Call Status */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white">Tara</h2>
          <p className="text-white/80 text-lg">
            {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Ready to listen...'}
          </p>
          <p className="text-white/60">Session in progress • {formatDuration(sessionDuration)}</p>
        </div>

        {/* Live Transcript */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 text-left max-h-40 overflow-y-auto">
          <h3 className="text-white font-medium mb-3">Live Conversation</h3>
          <div className="space-y-2 text-white/80 text-sm">
            {conversation.length === 0 ? (
              <p className="text-white/60 italic">Conversation will appear here...</p>
            ) : (
              conversation.slice(-3).map((msg, index) => (
                <div key={index} className={`${msg.speaker === 'tara' ? 'text-blue-300' : 'text-green-300'}`}>
                  <strong>{msg.speaker === 'tara' ? 'Tara' : 'You'}:</strong> {msg.message}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Call Controls */}
        <div className="flex justify-center space-x-6">
          <Button
            onClick={() => setIsMuted(!isMuted)}
            size="lg"
            className={`w-16 h-16 rounded-full ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'} backdrop-blur-sm border border-white/30`}
          >
            {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
          </Button>

          <Button
            onClick={onStartListening}
            disabled={isSpeaking || isListening}
            size="lg"
            className={`w-16 h-16 rounded-full ${isListening ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'} backdrop-blur-sm`}
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </Button>

          <Button
            onClick={onEndCall}
            size="lg"
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600"
          >
            <PhoneCall className="w-6 h-6 text-white rotate-45" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;