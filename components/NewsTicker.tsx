
import React from 'react';
import { Bell } from 'lucide-react';

interface NewsTickerProps {
  news: string[];
}

const NewsTicker: React.FC<NewsTickerProps> = ({ news }) => {
  if (news.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-700 via-emerald-600 to-blue-700 h-8 flex items-center overflow-hidden shadow-md relative z-[60]">
      <div className="bg-white/10 backdrop-blur-md px-3 h-full flex items-center gap-2 border-l border-white/20 relative z-10 shrink-0 shadow-[4px_0_15px_rgba(0,0,0,0.1)]">
        <Bell size={14} className="text-white animate-bounce" />
        <span className="text-[10px] font-black text-white whitespace-nowrap uppercase tracking-widest">هام جداً:</span>
      </div>
      
      <div className="flex-1 overflow-hidden relative group">
        <div className="flex whitespace-nowrap animate-marquee group-hover:pause">
          {news.map((text, i) => (
            <span key={i} className="text-white text-[10px] font-black px-8 flex items-center gap-2 border-l border-white/10">
              <span className="w-1 h-1 bg-white/40 rounded-full"></span>
              {text}
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {news.map((text, i) => (
            <span key={`dup-${i}`} className="text-white text-[10px] font-black px-8 flex items-center gap-2 border-l border-white/10">
              <span className="w-1 h-1 bg-white/40 rounded-full"></span>
              {text}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
        .pause {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default NewsTicker;
