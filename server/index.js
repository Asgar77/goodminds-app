const elevenLabsAgentApiKey = import.meta.env.VITE_ELEVENLABS_AGENT_API_KEY;
const elevenLabsAgentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

const getAgentResponse = async (userMessage: string) => {
  const response = await fetch(`https://api.elevenlabs.io/v1/agents/${elevenLabsAgentId}/chat`, {
    method: 'POST',
    headers: {
      'xi-api-key': elevenLabsAgentApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: userMessage }),
  });
  return await response.json();
};