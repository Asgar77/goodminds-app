import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, PhoneCall, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

const elevenLabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
const elevenLabsVoiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID;

const VoiceAssistant = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const startCall = () => {
    setIsCallActive(true);
    // Simulate Tara speaking
    setTimeout(() => setIsSpeaking(true), 1000);
    setTimeout(() => setIsSpeaking(false), 4000);
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsSpeaking(false);
    setIsMuted(false);
  };

  if (isCallActive) {
    return <CallInterface isMuted={isMuted} setIsMuted={setIsMuted} isSpeaking={isSpeaking} onEndCall={endCall} />;
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Call to Tara</h1>
        <p className="text-gray-600">
          Connect with Tara, your AI-powered mental health companion. She's here to listen, 
          support, and guide you through your wellness journey.
        </p>
      </div>

      {/* Tara Introduction */}
      <Card className="glass border-0">
        <CardContent className="p-8 text-center">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse-gentle">
            <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center">
              <span className="text-4xl">🌸</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Meet Tara</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Tara is your compassionate AI mental health specialist, available 24/7 to provide 
            support, guidance, and a listening ear. She combines advanced AI with empathetic 
            conversation to create a safe space for your thoughts and feelings.
          </p>

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
          <CardTitle className="text-xl text-gray-800">Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: 'Today, 2:30 PM', duration: '15 min', topic: 'Anxiety about upcoming presentation' },
              { date: 'Yesterday, 8:45 PM', duration: '22 min', topic: 'Processing difficult conversation with friend' },
              { date: '3 days ago, 1:15 PM', duration: '18 min', topic: 'Stress management techniques' },
            ].map((session, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-800">{session.topic}</div>
                  <div className="text-sm text-gray-600">{session.date} • {session.duration}</div>
                </div>
                <Button variant="outline" size="sm">View Notes</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">💡 Tips for Your Session</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-xl">
              <h4 className="font-semibold text-gray-800 mb-2">🎧 Find a Quiet Space</h4>
              <p className="text-gray-700 text-sm">Choose a comfortable, private environment where you feel safe to express yourself.</p>
            </div>
            <div className="bg-gradient-to-r from-blue-100 to-pink-100 p-4 rounded-xl">
              <h4 className="font-semibold text-gray-800 mb-2">💭 Be Open & Honest</h4>
              <p className="text-gray-700 text-sm">Tara is here to help. The more honest you are, the better support she can provide.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Call Interface Component
const CallInterface = ({ isMuted, setIsMuted, isSpeaking, onEndCall }: {
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  isSpeaking: boolean;
  onEndCall: () => void;
}) => {
  // Helper to fetch and play TTS audio from ElevenLabs
  async function playTaraTTS(text: string) {
    if (!elevenLabsApiKey || !elevenLabsVoiceId) return;
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice_settings: { stability: 0.5, similarity_boost: 0.5 },
      }),
    });
    if (!response.ok) return;
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  }

  useEffect(() => {
    if (isSpeaking) {
      playTaraTTS(
        "I hear that you're feeling anxious about your presentation tomorrow. That's completely normal - many people experience this kind of anticipatory anxiety. Let's explore some techniques that might help you feel more confident..."
      );
    }
  }, [isSpeaking]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Tara Avatar */}
        <div className="relative">
          <div className={`
            w-48 h-48 mx-auto bg-gradient-to-br from-purple-400 via-blue-400 to-pink-400 rounded-full flex items-center justify-center
            ${isSpeaking ? 'animate-pulse ring-8 ring-white/30' : ''}
          `}>
            <div className="w-44 h-44 bg-white rounded-full flex items-center justify-center">
              <span className="text-6xl">🌸</span>
            </div>
          </div>
          
          {/* Speaking Indicator */}
          {isSpeaking && (
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-8 bg-white rounded-full animate-pulse"
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
            {isSpeaking ? 'Speaking...' : 'Listening...'}
          </p>
          <p className="text-white/60">Session in progress • 03:24</p>
        </div>

        {/* Live Transcript */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 text-left">
          <h3 className="text-white font-medium mb-3">Live Transcript</h3>
          <div className="space-y-2 text-white/80 text-sm">
            {isSpeaking ? (
              <p className="animate-fade-in">
                "I hear that you're feeling anxious about your presentation tomorrow. 
                That's completely normal - many people experience this kind of anticipatory anxiety. 
                Let's explore some techniques that might help you feel more confident..."
              </p>
            ) : (
              <p className="text-white/60 italic">Waiting for you to speak...</p>
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
            onClick={onEndCall}
            size="lg"
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600"
          >
            <PhoneCall className="w-6 h-6 text-white rotate-45" />
          </Button>

          <Button
            size="lg"
            className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30"
          >
            <Volume2 className="w-6 h-6 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
