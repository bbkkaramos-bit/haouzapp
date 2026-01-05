
import React from 'react';
import { Users, Building2, MessageSquare, User, FileText, LayoutGrid, Newspaper, Mail } from 'lucide-react';
import { AppTab } from '../types';

interface NavigationProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: AppTab.STAFF, icon: Users, label: 'الأطر' },
    { id: AppTab.SCHOOLS, icon: Building2, label: 'المؤسسات' },
    { id: AppTab.NEWS, icon: Newspaper, label: 'الأخبار' },
    { id: AppTab.MAIL, icon: Mail, label: 'البريد' },
    { id: AppTab.MEMOS, icon: FileText, label: 'المذكرات' },
    { id: AppTab.AI_CHAT, icon: MessageSquare, label: 'المساعد' },
    { id: AppTab.PROFILE, icon: User, label: 'حسابي' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around items-center py-2.5 px-0.5 shadow-[0_-4px_25px_rgba(0,0,0,0.05)] z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center flex-1 py-0.5 transition-all duration-300 ${
              isActive ? 'text-blue-600' : 'text-slate-400 hover:text-blue-400'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-50' : 'bg-transparent'}`}>
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[7px] mt-0.5 font-black ${isActive ? 'opacity-100' : 'opacity-70'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;
