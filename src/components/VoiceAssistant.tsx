import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, PhoneCall, Mic, MicOff, Volume2, VolumeX, MessageCircle, Calendar, ArrowLeft, Loader2, AlertCircle, ExternalLink, Settings } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

// ElevenLabs configuration - these should be set in your environment variables
const elevenLabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
const elevenLabsAgentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
const elevenLabsVoiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || "XRlny9TzSxQhHzOusWWe";

const VoiceAssistant = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [conversation, setConversation] = useState<any[]>([]);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [showConfigHelp, setShowConfigHelp] = useState(false);
  const { toast } = useToast();
  const user = auth.currentUser;

  // Check ElevenLabs configuration on component mount
  useEffect(() => {
    console.log('Checking ElevenLabs configuration...');
    console.log('API Key:', elevenLabsApiKey ? `${elevenLabsApiKey.substring(0, 10)}...` : 'Missing');
    console.log('Agent ID:', elevenLabsAgentId || 'Missing');
    console.log('Voice ID:', elevenLabsVoiceId || 'Missing');

    if (!elevenLabsApiKey || !elevenLabsAgentId) {
      console.warn('ElevenLabs configuration missing');
      setConnectionStatus('error');
      setErrorDetails('ElevenLabs API credentials are missing. Please check your environment variables.');
      setShowConfigHelp(true);
    } else {
      setConnectionStatus('disconnected');
      setShowConfigHelp(false);
    }
  }, []);

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

  // Test ElevenLabs Agent connection
  const testAgentConnection = async () => {
    if (!elevenLabsApiKey || !elevenLabsAgentId) {
      return {
        success: false,
        error: 'Missing API credentials'
      };
    }

    try {
      console.log('Testing connection to ElevenLabs Agent:', elevenLabsAgentId);
      
      const response = await fetch(`https://api.elevenlabs.io/v1/agents/${elevenLabsAgentId}`, {
        method: 'GET',
        headers: {
          'xi-api-key': elevenLabsApiKey,
          'Content-Type': 'application/json',
        },
      });

      console.log('ElevenLabs Agent API Response:', response.status, response.statusText);

      if (response.ok) {
        const agentData = await response.json();
        console.log('Agent found:', agentData.name || 'Unnamed Agent');
        return {
          success: true,
          agent: agentData
        };
      } else {
        const errorText = await response.text();
        console.error('Agent API Error:', response.status, errorText);
        
        let errorMessage = '';
        switch (response.status) {
          case 404:
            errorMessage = `Agent not found. The agent ID "${elevenLabsAgentId}" does not exist in your ElevenLabs account.`;
            break;
          case 401:
            errorMessage = 'Invalid API key. Please check your ElevenLabs API key.';
            break;
          case 403:
            errorMessage = 'Access denied. Your API key may not have permission to access this agent.';
            break;
          default:
            errorMessage = `API error: ${response.status} - ${errorText}`;
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error('Network error testing agent connection:', error);
      return {
        success: false,
        error: 'Network error. Please check your internet connection.'
      };
    }
  };

  // Enhanced ElevenLabs Agent API integration with better error handling
  const connectToElevenLabsAgent = async () => {
    setIsConnecting(true);
    setConnectionStatus('connecting');

    const testResult = await testAgentConnection();
    
    if (testResult.success) {
      setConnectionStatus('connected');
      setErrorDetails('');
      setShowConfigHelp(false);
      toast({
        title: "Connected to TARA",
        description: "Successfully connected to ElevenLabs Agent. TARA is ready to help!",
      });
      setIsConnecting(false);
      return true;
    } else {
      setConnectionStatus('error');
      setErrorDetails(testResult.error || 'Unknown error');
      setShowConfigHelp(true);
      toast({
        title: "Connection Failed",
        description: testResult.error,
        variant: "destructive",
      });
      setIsConnecting(false);
      return false;
    }
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

    // Connect to ElevenLabs Agent first
    const connected = await connectToElevenLabsAgent();
    if (!connected) return;

    setIsCallActive(true);
    setSessionDuration(0);
    setConversation([]);
    
    // Save session start to Firebase
    try {
      await addDoc(collection(db, `users/${user.uid}/taraSessions`), {
        startTime: serverTimestamp(),
        status: 'active',
        topic: 'Student wellness check-in with ElevenLabs TARA',
        agentId: elevenLabsAgentId,
      });
    } catch (error) {
      console.error('Error starting session:', error);
    }

    // Get initial greeting from ElevenLabs Agent
    setTimeout(async () => {
      const greeting = await getAgentResponse("Hello, I'm a student looking for mental health support. Can you introduce yourself?");
      const welcomeMessage = greeting.text || "Hello! I'm TARA, your AI mental health companion. I'm here to listen and support you through your academic journey. How are you feeling today?";
      
      setConversation([{ speaker: 'tara', message: welcomeMessage, timestamp: new Date() }]);
      speakText(welcomeMessage);
    }, 1000);
  };

  const endCall = async () => {
    setIsCallActive(false);
    setIsSpeaking(false);
    setIsMuted(false);
    setIsListening(false);
    setConnectionStatus('disconnected');
    
    // Save session end to Firebase
    if (user && sessionDuration > 0) {
      try {
        await addDoc(collection(db, `users/${user.uid}/taraSessions`), {
          endTime: serverTimestamp(),
          duration: formatDuration(sessionDuration),
          topic: conversation.length > 0 ? 'Student wellness conversation with ElevenLabs TARA' : 'Brief check-in',
          conversationLength: conversation.length,
          agentId: elevenLabsAgentId,
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

  // Enhanced text-to-speech with ElevenLabs
  const speakText = async (text: string) => {
    if (!elevenLabsApiKey || !elevenLabsVoiceId) {
      console.warn('ElevenLabs TTS not configured, using fallback');
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
            stability: 0.75, 
            similarity_boost: 0.85,
            style: 0.3,
            use_speaker_boost: true
          },
          model_id: "eleven_multilingual_v2"
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
          console.error('Audio playback failed');
        };
        
        await audio.play();
      } else {
        throw new Error(`TTS API responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      setIsSpeaking(false);
      toast({
        title: "Audio Error",
        description: "Unable to play TARA's voice. The text response is still available.",
        variant: "destructive",
      });
    }
  };

  // Enhanced ElevenLabs Agent API integration
  const getAgentResponse = async (userMessage: string) => {
    if (!elevenLabsApiKey || !elevenLabsAgentId) {
      console.warn('ElevenLabs Agent API not configured');
      return { 
        text: "I'm here to listen and support you. Can you tell me more about how you're feeling? (Note: ElevenLabs Agent is not configured)" 
      };
    }

    try {
      console.log('Sending message to ElevenLabs Agent:', userMessage);
      
      const response = await fetch(`https://api.elevenlabs.io/v1/agents/${elevenLabsAgentId}/chat`, {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: userMessage,
          session_id: `session_${user?.uid}_${Date.now()}`,
        }),
      });

      console.log('ElevenLabs Agent Chat Response:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('ElevenLabs Agent Response:', data);
        return data;
      } else {
        const errorText = await response.text();
        console.error('ElevenLabs Agent API Error:', response.status, errorText);
        throw new Error(`Agent API responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error with ElevenLabs Agent API:', error);
      return { 
        text: "I'm here to listen and support you. Can you tell me more about how you're feeling? I'm experiencing some technical difficulties, but I'm still here for you." 
      };
    }
  };

  // Enhanced speech recognition
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. You can still type your messages.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      console.log('Speech recognition started');
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      
      console.log('Speech recognition result:', transcript, 'Confidence:', confidence);
      
      setTranscript(transcript);
      setConversation(prev => [...prev, { 
        speaker: 'user', 
        message: transcript, 
        timestamp: new Date(),
        confidence: confidence
      }]);
      
      // Get response from ElevenLabs Agent
      const agentResponse = await getAgentResponse(transcript);
      setConversation(prev => [...prev, { 
        speaker: 'tara', 
        message: agentResponse.text, 
        timestamp: new Date() 
      }]);
      
      // Speak the response
      speakText(agentResponse.text);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      let errorMessage = "Speech recognition failed. Please try again.";
      switch (event.error) {
        case 'no-speech':
          errorMessage = "No speech detected. Please try speaking again.";
          break;
        case 'audio-capture':
          errorMessage = "Microphone access denied. Please check your permissions.";
          break;
        case 'not-allowed':
          errorMessage = "Microphone permission denied. Please allow microphone access.";
          break;
      }
      
      toast({
        title: "Speech Recognition Error",
        description: errorMessage,
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('Speech recognition ended');
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
      connectionStatus={connectionStatus}
    />;
  }

  return (
    <div className="space-y-8 animate-slide-up-smooth">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Call to TARA</h1>
        <p className="text-gray-600">
          Connect with TARA, your AI-powered mental health companion powered by ElevenLabs. 
          She's here to listen, support, and guide you through your academic and personal challenges.
        </p>
      </div>

      {/* Enhanced Configuration Status with Detailed Help */}
      {showConfigHelp && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Settings className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 mb-2">ElevenLabs Configuration Required</h3>
                <p className="text-amber-700 text-sm mb-4">
                  To use TARA's voice features, you need to configure ElevenLabs credentials.
                </p>
                
                <div className="bg-amber-100 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-amber-800 mb-2">Current Status:</h4>
                  <div className="text-sm text-amber-700 space-y-1">
                    <p><strong>API Key:</strong> {elevenLabsApiKey ? '✅ Configured' : '❌ Missing'}</p>
                    <p><strong>Agent ID:</strong> {elevenLabsAgentId ? '✅ Configured' : '❌ Missing'}</p>
                    <p><strong>Voice ID:</strong> {elevenLabsVoiceId ? '✅ Configured' : '❌ Missing'}</p>
                  </div>
                  {errorDetails && (
                    <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded text-red-700 text-sm">
                      <strong>Error:</strong> {errorDetails}
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-blue-800 mb-2">Setup Instructions:</h4>
                  <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                    <li>Go to <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="underline">ElevenLabs.io</a> and create an account</li>
                    <li>Create a new Agent in your ElevenLabs dashboard</li>
                    <li>Copy your API key from the profile settings</li>
                    <li>Copy your Agent ID from the agent settings</li>
                    <li>Add these to your environment variables:
                      <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                        VITE_ELEVENLABS_API_KEY=your_api_key<br/>
                        VITE_ELEVENLABS_AGENT_ID=your_agent_id<br/>
                        VITE_ELEVENLABS_VOICE_ID=your_voice_id
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => window.open('https://elevenlabs.io/app/agents', '_blank')}
                    variant="outline"
                    size="sm"
                    className="text-amber-600 border-amber-300 hover:bg-amber-50"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open ElevenLabs Dashboard
                  </Button>
                  <Button
                    onClick={connectToElevenLabsAgent}
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    disabled={!elevenLabsApiKey || !elevenLabsAgentId}
                  >
                    Test Connection
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TARA Introduction */}
      <Card className="card-modern">
        <CardContent className="p-8 text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-green-500 via-teal-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse-soft relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-teal-400 rounded-full animate-pulse"></div>
            <div className="relative w-28 h-28 bg-white rounded-full flex items-center justify-center">
              <span className="text-4xl">🌸</span>
            </div>
            {connectionStatus === 'connected' && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
            {connectionStatus === 'error' && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Meet TARA</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            TARA is your compassionate AI mental health specialist powered by ElevenLabs, available 24/7 to provide 
            support, guidance, and a listening ear specifically for student challenges. She understands 
            academic stress, social pressures, and the unique mental health needs of students.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-r from-green-100 to-teal-100 p-4 rounded-2xl">
              <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800 mb-1">ElevenLabs Powered</h3>
              <p className="text-sm text-gray-600">Advanced AI conversation with natural voice synthesis</p>
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
              disabled={isConnecting || (connectionStatus === 'error' && (!elevenLabsApiKey || !elevenLabsAgentId))}
              className="btn-goodmind text-lg px-12 py-6 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Connecting to TARA...
                </>
              ) : connectionStatus === 'error' && (!elevenLabsApiKey || !elevenLabsAgentId) ? (
                <>
                  <Settings className="w-6 h-6 mr-3" />
                  Configuration Required
                </>
              ) : (
                <>
                  <Phone className="w-6 h-6 mr-3" />
                  Start Session with TARA
                </>
              )}
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
                      {session.agentId && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          ElevenLabs
                        </span>
                      )}
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
  formatDuration,
  connectionStatus
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
  connectionStatus: string;
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

            {/* Connection status indicator */}
            <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
              'bg-red-500'
            }`}>
              <span className="text-white text-xs">
                {connectionStatus === 'connected' ? '✓' : 
                 connectionStatus === 'connecting' ? '...' : '!'}
              </span>
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
            <p className="text-white/60 text-sm">
              ElevenLabs Session • {formatDuration(sessionDuration)}
            </p>
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
                  {msg.confidence && (
                    <span className="text-white/40 text-xs ml-2">
                      ({Math.round(msg.confidence * 100)}% confidence)
                    </span>
                  )}
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
          <p className="text-xs">Powered by ElevenLabs AI</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;