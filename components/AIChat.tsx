
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { getAIResponse } from '../services/geminiService';

interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: 'مرحباً بك! أنا مساعدك الذكي في مديرية الحوز. كيف يمكنني مساعدتك اليوم؟' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);
    const botResponse = await getAIResponse(userMsg);
    setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-['Cairo'] relative">
      {/* Dynamic Header */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50 shrink-0">
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
             <Bot size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[12px] font-black text-slate-900 leading-tight">المساعد الذكي (AI)</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">جاهز للمساعدة</span>
            </div>
          </div>
          <Sparkles size={20} className="text-blue-200" />
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 p-5 pb-40 scroll-smooth scrollbar-hide">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end animate-in fade-in slide-in-from-bottom-2'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-[11px] leading-relaxed whitespace-pre-wrap font-bold shadow-sm ${
              m.role === 'user' 
              ? 'bg-gradient-to-tr from-blue-700 to-indigo-600 text-white rounded-tr-none shadow-blue-100' 
              : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-end animate-pulse">
            <div className="bg-white p-3 px-5 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-3 border border-slate-100">
              <Loader2 size={14} className="animate-spin text-blue-600" />
              <span className="text-[9px] text-slate-400 font-black italic tracking-wide">يفكر المساعد...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-6 left-0 right-0 px-5 bg-transparent z-40">
        <div className="relative max-w-sm mx-auto group">
          <input
            type="text"
            placeholder="اكتب استفسارك هنا بكل وضوح..."
            className="w-full py-5 pr-5 pl-14 bg-white border border-slate-200 rounded-[2rem] focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 shadow-2xl shadow-slate-200/50 text-[11px] font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-blue-600 text-white rounded-[1.2rem] active:scale-90 transition-all disabled:bg-slate-200 disabled:text-slate-400 shadow-lg shadow-blue-200 flex items-center justify-center"
          >
            <Send size={18} className="rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
