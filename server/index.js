import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Conversation } from 'elevenlabs-typescript-sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const agentId = process.env.VITE_ELEVENLABS_AGENT_ID;
const elevenlabsApiKey = process.env.VITE_ELEVENLABS_API_KEY;

app.post('/api/agent', async (req, res) => {
  const { message } = req.body;
  if (!agentId || !elevenlabsApiKey) {
    return res.status(500).json({ error: 'Agent ID or API key missing' });
  }
  try {
    const conversation = await Conversation.startSession({
      agentId,
      apiKey: elevenlabsApiKey,
    });
    const agentResponse = await conversation.sendText(message);
    res.json({ text: agentResponse.text });
  } catch (error) {
    console.error('Agent error:', error);
    res.status(500).json({ error: 'Failed to get agent response' });
  }
});

const chatWithVoice = async (userMessage: string) => {
  if (!elevenlabsApiKey || !agentId) {
    console.warn('ElevenLabs Agent API not configured');
    return;
  }
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/agents/${agentId}/chat/voice`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenlabsApiKey,
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: userMessage,
          voice_settings: {
            stability: 0.7,
            similarity_boost: 0.8,
            style: 0.2,
            use_speaker_boost: true,
          },
        }),
      }
    );
    if (!response.ok) throw new Error('Voice chat failed');
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.onended = () => URL.revokeObjectURL(audioUrl);
    await audio.play();
  } catch (error) {
    console.error('Error with voice chat:', error);
    toast({
      title: "Voice Chat Error",
      description: "Tara couldn't respond. Please try again.",
      variant: "destructive",
    });
  }
};

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Tara backend running on port ${PORT}`);
}); 