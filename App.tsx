
import React, { useState, useEffect } from 'react';
import { AppTab, Announcement, UserSession, UserRole, AppSettings } from './types';
import Navigation from './components/Navigation';
import StaffDirectory from './components/StaffDirectory';
import SchoolsDirectory from './components/SchoolsDirectory';
import MemosManager from './components/MemosManager';
import FormsCenter from './components/FormsCenter';
import AIChat from './components/AIChat';
import Profile from './components/Profile';
import Feed from './components/Feed';
import NewsTicker from './components/NewsTicker';
import MailCenter from './components/MailCenter';
import Login from './components/Login';
import { firebaseService } from './services/firebaseService';
import { RefreshCw, Zap, BellRing, Cloud, CloudOff, Wifi, Loader2, AlertCircle, Database } from 'lucide-react';

const DEFAULT_TICKER = ["مرحباً بكم في المنصة الرسمية لمديرية الحوز - تواصل، تدبير، تميز."];
const DEFAULT_SETTINGS: AppSettings = {
  globalUserPassword: '123',
  adminPassword: 'Lhou@7419',
  maintenanceMode: false,
  lastUpdated: new Date().toISOString()
};

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.STAFF);
  const [tickerMessages, setTickerMessages] = useState<string[]>(DEFAULT_TICKER);
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false); // لم تعد المزامنة تلقائية للأقسام الثقيلة

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const savedSession = localStorage.getItem('app_session_v4');
    if (savedSession) setSession(JSON.parse(savedSession));

    // مزامنة الإعدادات فقط (خفيفة جداً)
    const unsubSettings = firebaseService.subscribeToDocument('app_config', 'global_settings', (data) => {
      if (data) setAppSettings(data);
    });

    // مزامنة الشريط الإخباري فقط (خفيفة جداً)
    const unsubTicker = firebaseService.subscribeToDocument('app_config', 'ticker_news', (data) => {
      if (Array.isArray(data)) setTickerMessages(data.length > 0 ? data : DEFAULT_TICKER);
    });

    return () => {
      unsubSettings();
      unsubTicker();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    await firebaseService.saveData('app_config', 'global_settings', newSettings);
  };

  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    localStorage.setItem('app_session_v4', JSON.stringify(newSession));
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('app_session_v4');
    setActiveTab(AppTab.STAFF);
  };

  if (!session) {
    return <Login onLogin={handleLogin} appSettings={appSettings} />;
  }

  const renderContent = () => {
    const isAdmin = session.role === UserRole.ADMIN;
    switch (activeTab) {
      case AppTab.STAFF: return <StaffDirectory isAdminOverride={isAdmin} />;
      case AppTab.SCHOOLS: return <SchoolsDirectory isAdminOverride={isAdmin} />;
      case AppTab.NEWS: return <Feed isAdminOverride={isAdmin} />;
      case AppTab.MAIL: return <MailCenter userSession={session} />;
      case AppTab.MEMOS: return <MemosManager isAdminOverride={isAdmin} />;
      case AppTab.FORMS: return <FormsCenter isAdminOverride={isAdmin} />;
      case AppTab.AI_CHAT: return <AIChat />;
      case AppTab.PROFILE:
        return (
          <Profile 
            session={session} 
            onLogout={handleLogout} 
            onUpdateSession={(s) => setSession(s)} 
            appSettings={appSettings}
            onUpdateSettings={handleUpdateSettings}
          />
        );
      default: return <StaffDirectory isAdminOverride={isAdmin} />;
    }
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-slate-50 shadow-2xl relative flex flex-col overflow-hidden border-x border-slate-100">
      {/* Indicator Bar */}
      <div className={`h-1.5 w-full transition-colors duration-500 ${isOnline ? 'bg-blue-600' : 'bg-red-500'}`}></div>
      
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-100 shrink-0">
         <div className="flex items-center gap-2">
            <Database size={10} className="text-slate-400" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
               {isOnline ? 'وضع الاستجابة السريعة - متصل' : 'وضع العمل بدون إنترنت'}
            </span>
         </div>
         <div className="flex items-center gap-1">
            <Wifi size={10} className={isOnline ? 'text-blue-500' : 'text-red-500'} />
         </div>
      </div>

      <NewsTicker news={tickerMessages} />
      
      <main className="flex-1 overflow-y-auto bg-slate-50/50 scrollbar-hide">
        {renderContent()}
      </main>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
