# Python TARA Client

This Python script demonstrates how to connect to ElevenLabs Conversational AI Agent (TARA) using WebSocket with signed URL authentication.

## Features

- ✅ Secure WebSocket connection using signed URLs
- ✅ Text-based conversation with TARA
- ✅ Voice recording and audio input
- ✅ Real-time message handling
- ✅ Student-focused mental health support
- ✅ Proper error handling and logging

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and add your ElevenLabs credentials:
```
ELEVENLABS_API_KEY=your_actual_api_key
ELEVENLABS_AGENT_ID=your_actual_agent_id
```

### 3. Get ElevenLabs Credentials

1. Go to [ElevenLabs.io](https://elevenlabs.io) and create an account
2. Create a new Conversational AI Agent
3. Get your API key from [Settings](https://elevenlabs.io/app/settings)
4. Get your Agent ID from your agent's settings page

## Usage

### Run the Client

```bash
python python_tara_client.py
```

### Commands

- **Text Chat**: Type your message and press Enter
- **Voice Input**: Type `voice` and press Enter to start recording
- **Exit**: Type `quit`, `exit`, or `bye` to disconnect

## Example Session

```
🌸 Welcome to TARA - Your AI Mental Health Companion
==================================================
🔑 Requesting signed URL from ElevenLabs...
✅ Signed URL obtained successfully
🔌 Connecting to TARA via WebSocket...
✅ Connected to TARA successfully!
⚙️ Configuring session...
✅ Session configured
👂 Listening for messages from TARA...
👋 Sending initial greeting...
📨 Received: session.created
✅ Session created successfully

💬 You can now chat with TARA!
Commands:
  - Type your message and press Enter
  - Type 'voice' to start voice recording
  - Type 'quit' to exit
--------------------------------------------------

💭 You: I'm feeling stressed about my upcoming exams

🌸 TARA: I understand that exam stress can feel overwhelming. It's completely normal to feel this way - many students experience anxiety before important tests. Let's talk about some strategies that might help you manage this stress...
```

## How It Works

### 1. Authentication
- Requests a signed URL from ElevenLabs API using your API key
- Uses the signed URL to establish a secure WebSocket connection

### 2. Session Configuration
- Configures TARA as a student-focused mental health companion
- Sets up audio and text modalities
- Enables voice activity detection

### 3. Message Handling
- Processes different message types from ElevenLabs
- Handles text responses, audio transcription, and error messages
- Provides real-time conversation flow

### 4. Audio Support
- Records audio from your microphone
- Converts to base64 and sends to TARA
- Handles voice activity detection

## Troubleshooting

### Connection Issues
- Verify your API key and Agent ID are correct
- Check that your agent exists in your ElevenLabs account
- Ensure you have an active internet connection

### Audio Issues
- Make sure you have a working microphone
- On macOS/Linux, you might need to install PortAudio:
  ```bash
  # macOS
  brew install portaudio
  
  # Ubuntu/Debian
  sudo apt-get install portaudio19-dev
  ```

### Permission Issues
- Grant microphone permissions when prompted
- On some systems, you might need to run with elevated permissions

## API Reference

The script uses the ElevenLabs Conversational AI API:
- **Signed URL Endpoint**: `GET /v1/convai/conversation/get-signed-url`
- **WebSocket Protocol**: Real-time bidirectional communication
- **Message Types**: Session management, conversation items, audio handling

## Security

- Uses signed URLs for secure authentication
- API keys are loaded from environment variables
- WebSocket connection is encrypted (WSS)
- No sensitive data is logged or stored

## Next Steps

This Python client demonstrates the core concepts. You can extend it by:
- Adding audio playback for TARA's responses
- Implementing conversation history storage
- Adding a GUI interface
- Integrating with your web application backend