import { useState } from 'react';
import { Send, Bot, User as UserIcon } from 'lucide-react';
import { clsx } from 'clsx';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your AI Interview Mentor. Which company are you preparing for today, or what topic would you like to discuss?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('https://ai-powered-campus-placement-guid.onrender.com/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage.content }),
      });
      
      const data = await res.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || "Sorry, I received an empty response from the server.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Error: Could not connect to the backend server. Is it running?",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">AI Interview Chat</h1>
        <p className="text-slate-400">Ask questions based on real interview experiences.</p>
      </div>

      <div className="flex-1 glassmorphism rounded-2xl flex flex-col overflow-hidden mb-6">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={clsx(
                "flex gap-4 max-w-[80%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                msg.role === 'user' ? "bg-primary-600" : "bg-dark-700"
              )}>
                {msg.role === 'user' ? <UserIcon className="w-5 h-5 text-white" /> : <Bot className="w-6 h-6 text-primary-400" />}
              </div>
              <div className={clsx(
                "p-4 rounded-2xl whitespace-pre-wrap",
                msg.role === 'user' 
                  ? "bg-primary-600 text-white rounded-tr-none" 
                  : "bg-dark-800 text-slate-200 border border-slate-700/50 rounded-tl-none"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 max-w-[80%]">
              <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6 text-primary-400 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-dark-800 text-slate-400 border border-slate-700/50 rounded-tl-none flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-700/50 bg-dark-800/80">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about interview patterns, coding questions, etc..."
              className="w-full bg-dark-900 border border-slate-700 rounded-xl py-4 pl-4 pr-14 text-slate-200 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
