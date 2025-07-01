#!/usr/bin/env python3
"""
Python client for connecting to ElevenLabs Conversational AI Agent (TARA)
This script demonstrates how to establish a secure WebSocket connection using signed URLs
"""

import asyncio
import websockets
import json
import requests
import base64
import pyaudio
import wave
import threading
import time
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class TaraClient:
    def __init__(self):
        self.api_key = os.getenv('ELEVENLABS_API_KEY')
        self.agent_id = os.getenv('ELEVENLABS_AGENT_ID')
        self.websocket: Optional[websockets.WebSocketServerProtocol] = None
        self.is_connected = False
        self.is_recording = False
        self.audio_format = pyaudio.paInt16
        self.channels = 1
        self.rate = 16000
        self.chunk = 1024
        self.audio = pyaudio.PyAudio()
        
        if not self.api_key or not self.agent_id:
            raise ValueError("Please set ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID environment variables")
    
    def get_signed_url(self) -> str:
        """Get signed URL from ElevenLabs API"""
        print("🔑 Requesting signed URL from ElevenLabs...")
        
        url = f"https://api.elevenlabs.io/v1/convai/conversation/get-signed-url"
        headers = {
            'xi-api-key': self.api_key,
            'Content-Type': 'application/json'
        }
        params = {'agent_id': self.agent_id}
        
        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            
            data = response.json()
            signed_url = data.get('signed_url')
            
            if not signed_url:
                raise ValueError("No signed URL received from API")
            
            print("✅ Signed URL obtained successfully")
            return signed_url
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Error getting signed URL: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response status: {e.response.status_code}")
                print(f"Response body: {e.response.text}")
            raise
    
    async def connect(self):
        """Establish WebSocket connection to ElevenLabs Agent"""
        try:
            signed_url = self.get_signed_url()
            print(f"🔌 Connecting to TARA via WebSocket...")
            
            self.websocket = await websockets.connect(signed_url)
            self.is_connected = True
            print("✅ Connected to TARA successfully!")
            
            # Send session configuration
            await self.configure_session()
            
            # Start listening for messages
            await self.listen_for_messages()
            
        except Exception as e:
            print(f"❌ Connection failed: {e}")
            self.is_connected = False
            raise
    
    async def configure_session(self):
        """Configure the conversation session"""
        print("⚙️ Configuring session...")
        
        session_config = {
            "type": "session.update",
            "session": {
                "modalities": ["text", "audio"],
                "instructions": (
                    "You are TARA, a compassionate AI mental health companion specifically designed to support students. "
                    "You understand academic stress, social pressures, exam anxiety, and the unique challenges students face. "
                    "Provide empathetic, supportive responses while maintaining appropriate boundaries. "
                    "Always encourage students to seek professional help when needed."
                ),
                "voice": "alloy",
                "input_audio_format": "pcm16",
                "output_audio_format": "pcm16",
                "input_audio_transcription": {
                    "model": "whisper-1"
                },
                "turn_detection": {
                    "type": "server_vad",
                    "threshold": 0.5,
                    "prefix_padding_ms": 300,
                    "silence_duration_ms": 200
                }
            }
        }
        
        await self.websocket.send(json.dumps(session_config))
        print("✅ Session configured")
    
    async def listen_for_messages(self):
        """Listen for incoming WebSocket messages"""
        print("👂 Listening for messages from TARA...")
        
        try:
            async for message in self.websocket:
                await self.handle_message(message)
        except websockets.exceptions.ConnectionClosed:
            print("🔌 Connection closed")
            self.is_connected = False
        except Exception as e:
            print(f"❌ Error listening for messages: {e}")
            self.is_connected = False
    
    async def handle_message(self, message: str):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(message)
            message_type = data.get('type', 'unknown')
            
            print(f"📨 Received: {message_type}")
            
            if message_type == "session.created":
                print("✅ Session created successfully")
                # Send initial greeting
                await self.send_initial_greeting()
                
            elif message_type == "session.updated":
                print("✅ Session updated")
                
            elif message_type == "conversation.item.created":
                if data.get('item', {}).get('role') == 'assistant':
                    content = data['item'].get('content', [])
                    for c in content:
                        if c.get('type') == 'text':
                            print(f"🌸 TARA: {c.get('text', '')}")
                            
            elif message_type == "conversation.item.input_audio_transcription.completed":
                transcript = data.get('transcript', '')
                if transcript:
                    print(f"🎤 You said: {transcript}")
                    
            elif message_type == "response.audio.delta":
                # Handle streaming audio (for real-time playback)
                pass
                
            elif message_type == "response.audio.done":
                # Handle complete audio response
                if 'response' in data and 'audio' in data['response']:
                    print("🔊 Received audio response from TARA")
                    # You could save and play the audio here
                    
            elif message_type == "response.output_item.added":
                item = data.get('item', {})
                if item.get('type') == 'message':
                    content = item.get('content', [])
                    for c in content:
                        if c.get('type') == 'text':
                            print(f"🌸 TARA: {c.get('text', '')}")
                            
            elif message_type == "response.audio_transcript.done":
                transcript = data.get('transcript', '')
                if transcript:
                    print(f"🌸 TARA (transcript): {transcript}")
                    
            elif message_type == "response.done":
                print("✅ Response completed")
                
            elif message_type == "input_audio_buffer.speech_started":
                print("🎤 Speech detected...")
                
            elif message_type == "input_audio_buffer.speech_stopped":
                print("🎤 Speech ended")
                
            elif message_type == "error":
                error_msg = data.get('error', {}).get('message', 'Unknown error')
                print(f"❌ Error from TARA: {error_msg}")
                
            else:
                print(f"📋 Unhandled message type: {message_type}")
                
        except json.JSONDecodeError:
            print(f"❌ Failed to parse message: {message}")
        except Exception as e:
            print(f"❌ Error handling message: {e}")
    
    async def send_initial_greeting(self):
        """Send initial greeting to TARA"""
        print("👋 Sending initial greeting...")
        
        greeting_message = {
            "type": "conversation.item.create",
            "item": {
                "type": "message",
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": "Hello TARA! I'm a student and I'd like to talk about managing academic stress and mental wellness."
                    }
                ]
            }
        }
        
        await self.websocket.send(json.dumps(greeting_message))
        
        # Trigger response
        response_create = {
            "type": "response.create",
            "response": {
                "modalities": ["text", "audio"]
            }
        }
        
        await self.websocket.send(json.dumps(response_create))
    
    async def send_text_message(self, text: str):
        """Send a text message to TARA"""
        if not self.is_connected or not self.websocket:
            print("❌ Not connected to TARA")
            return
        
        print(f"💬 Sending: {text}")
        
        # Create conversation item
        conversation_item = {
            "type": "conversation.item.create",
            "item": {
                "type": "message",
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": text
                    }
                ]
            }
        }
        
        await self.websocket.send(json.dumps(conversation_item))
        
        # Trigger response
        response_create = {
            "type": "response.create",
            "response": {
                "modalities": ["text", "audio"]
            }
        }
        
        await self.websocket.send(json.dumps(response_create))
    
    def start_audio_recording(self):
        """Start recording audio from microphone"""
        if self.is_recording:
            return
        
        print("🎤 Starting audio recording... (Press Enter to stop)")
        self.is_recording = True
        
        def record_audio():
            stream = self.audio.open(
                format=self.audio_format,
                channels=self.channels,
                rate=self.rate,
                input=True,
                frames_per_buffer=self.chunk
            )
            
            frames = []
            
            while self.is_recording:
                try:
                    data = stream.read(self.chunk, exception_on_overflow=False)
                    frames.append(data)
                except Exception as e:
                    print(f"❌ Audio recording error: {e}")
                    break
            
            stream.stop_stream()
            stream.close()
            
            # Convert audio to base64 and send
            if frames:
                audio_data = b''.join(frames)
                base64_audio = base64.b64encode(audio_data).decode('utf-8')
                
                # Send audio to TARA
                asyncio.create_task(self.send_audio_data(base64_audio))
        
        # Start recording in a separate thread
        threading.Thread(target=record_audio, daemon=True).start()
    
    def stop_audio_recording(self):
        """Stop audio recording"""
        if self.is_recording:
            print("🎤 Stopping audio recording...")
            self.is_recording = False
    
    async def send_audio_data(self, base64_audio: str):
        """Send audio data to TARA"""
        if not self.is_connected or not self.websocket:
            return
        
        print("🎵 Sending audio to TARA...")
        
        # Append audio to buffer
        audio_message = {
            "type": "input_audio_buffer.append",
            "audio": base64_audio
        }
        
        await self.websocket.send(json.dumps(audio_message))
        
        # Commit the audio buffer
        commit_message = {
            "type": "input_audio_buffer.commit"
        }
        
        await self.websocket.send(json.dumps(commit_message))
        
        # Create response
        response_create = {
            "type": "response.create",
            "response": {
                "modalities": ["text", "audio"]
            }
        }
        
        await self.websocket.send(json.dumps(response_create))
    
    async def disconnect(self):
        """Disconnect from TARA"""
        if self.websocket:
            await self.websocket.close()
        self.is_connected = False
        self.audio.terminate()
        print("👋 Disconnected from TARA")

async def main():
    """Main function to run the TARA client"""
    print("🌸 Welcome to TARA - Your AI Mental Health Companion")
    print("=" * 50)
    
    try:
        # Create and connect to TARA
        tara = TaraClient()
        
        # Start connection in background
        connection_task = asyncio.create_task(tara.connect())
        
        # Wait a moment for connection to establish
        await asyncio.sleep(2)
        
        if not tara.is_connected:
            print("❌ Failed to connect to TARA")
            return
        
        print("\n💬 You can now chat with TARA!")
        print("Commands:")
        print("  - Type your message and press Enter")
        print("  - Type 'voice' to start voice recording")
        print("  - Type 'quit' to exit")
        print("-" * 50)
        
        # Interactive chat loop
        while tara.is_connected:
            try:
                user_input = input("\n💭 You: ").strip()
                
                if user_input.lower() in ['quit', 'exit', 'bye']:
                    break
                elif user_input.lower() == 'voice':
                    tara.start_audio_recording()
                    input("🎤 Recording... Press Enter to stop")
                    tara.stop_audio_recording()
                elif user_input:
                    await tara.send_text_message(user_input)
                
                # Small delay to allow for response
                await asyncio.sleep(0.1)
                
            except KeyboardInterrupt:
                break
            except EOFError:
                break
        
        # Cleanup
        await tara.disconnect()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nPlease check your environment variables:")
        print("- ELEVENLABS_API_KEY")
        print("- ELEVENLABS_AGENT_ID")

if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main())