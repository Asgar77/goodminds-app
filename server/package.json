import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Conversation } from 'elevenlabs-typescript-sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const agentId = process.env.AGENT_ID;
const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;

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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Tara backend running on port ${PORT}`);
}); 