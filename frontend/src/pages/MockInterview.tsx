import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, User, Bot, Video, Mic, MicOff, VideoOff, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import { clsx } from 'clsx';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function MockInterview() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI interviewer for today. Are you ready to begin your mock interview? Please tell me which role you're interviewing for.",
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true); // TTS Toggle
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speakText = useCallback((text: string) => {
    if (!isAudioOn || !('speechSynthesis' in window)) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    // Strip out <think> blocks and basic markdown for cleaner speech
    let cleanText = text.replace(/<think>[\s\S]*?<\/think>/g, '');
    cleanText = cleanText.replace(/[*_#`~]/g, '');
    cleanText = cleanText.trim();

    if (cleanText) {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      // Optional: try to find a good English voice
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.includes('en') && v.name.includes('Google')) || voices[0];
      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, [isAudioOn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // We prepend a special directive to force the AI into interviewer mode
      const query = `[MOCK INTERVIEW MODE] ${userMessage.content}`;
      const res = await fetch('http://localhost:8000/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query })
      });
      
      const data = await res.json();
      const answer = data.answer || "Sorry, I received an empty response from the server.";
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: answer,
      };
      setMessages(prev => [...prev, botMessage]);
      
      // Speak the response
      speakText(answer);
      
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Error: Could not connect to the backend server. Is it running?",
      };
      setMessages(prev => [...prev, errorMessage]);
      speakText(errorMessage.content);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Live Mock Interview</h1>
          <p className="text-slate-400">Simulate a real-time behavioral and technical interview.</p>
        </div>
        <div className="flex items-center gap-4 bg-dark-800 px-4 py-2 rounded-xl border border-slate-700">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-slate-300 font-medium">Recording</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        
        {/* Left Column: Video Feeds & Controls */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="glassmorphism rounded-2xl overflow-hidden aspect-video relative flex flex-col">
            <div className="flex-1 bg-dark-950 flex items-center justify-center relative">
               <Bot className="w-20 h-20 text-slate-600" />
               <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-sm text-white">
                 AI Interviewer
               </div>
            </div>
          </div>
          
          <div className="glassmorphism rounded-2xl overflow-hidden aspect-video relative flex flex-col">
            <div className="flex-1 bg-dark-900 flex items-center justify-center relative">
               {!isVideoOn ? (
                 <User className="w-20 h-20 text-slate-700" />
               ) : (
                 <div className="w-full h-full bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-700 m-2 rounded-xl">
                   <span className="text-slate-500 font-medium">Camera Feed Active</span>
                 </div>
               )}
               <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg text-sm text-white">
                 You
               </div>
            </div>
          </div>

          <div className="glassmorphism rounded-2xl p-4 flex justify-center gap-3 mt-auto flex-wrap">
            <button 
              onClick={() => setIsAudioOn(!isAudioOn)}
              title="Toggle Interviewer Voice"
              className={clsx("p-4 rounded-full transition-colors", isAudioOn ? "bg-primary-600 hover:bg-primary-500 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600")}
            >
              {isAudioOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
            <button 
              onClick={() => setIsMicOn(!isMicOn)}
              title="Toggle Microphone"
              className={clsx("p-4 rounded-full transition-colors", isMicOn ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-red-500/20 text-red-500 hover:bg-red-500/30")}
            >
              {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
            <button 
              onClick={() => setIsVideoOn(!isVideoOn)}
              title="Toggle Camera"
              className={clsx("p-4 rounded-full transition-colors", isVideoOn ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-red-500/20 text-red-500 hover:bg-red-500/30")}
            >
              {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>
            <button title="End Call" className="p-4 rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors">
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Right Column: Chat/Transcript */}
        <div className="lg:col-span-2 glassmorphism rounded-2xl flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 bg-dark-900/50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-200">Live Transcript</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={clsx(
                  "flex gap-4 max-w-[85%]",
                  message.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                  message.role === 'assistant' ? "bg-primary-500/20 text-primary-400" : "bg-slate-700 text-slate-300"
                )}>
                  {message.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                
                <div className={clsx(
                  "px-4 py-3 rounded-2xl leading-relaxed whitespace-pre-wrap",
                  message.role === 'user' 
                    ? "bg-primary-600 text-white rounded-tr-sm" 
                    : "bg-dark-800 border border-slate-700 text-slate-200 rounded-tl-sm"
                )}>
                  {message.content.replace('[MOCK INTERVIEW MODE] ', '')}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-dark-800 border border-slate-700 rounded-tl-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-.3s]" />
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-.5s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-dark-900/50 border-t border-slate-700/50">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your response to the interviewer..."
                className="w-full bg-slate-50 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-2 text-slate-400 hover:text-primary-400 disabled:opacity-50 disabled:hover:text-slate-400 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
