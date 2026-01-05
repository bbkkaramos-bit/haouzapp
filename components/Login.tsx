
import React, { useState } from 'react';
import { Mail, ShieldCheck, ArrowRight, Loader2, Key, Eye, EyeOff } from 'lucide-react';
import { UserRole, UserSession, AppSettings } from '../types';

// Define LoginProps interface to fix missing type error
interface LoginProps {
  onLogin: (session: UserSession) => void;
  appSettings: AppSettings;
}

// Ensure the component has a clean default export using function declaration
export default function Login({ onLogin, appSettings }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const ADMIN_EMAIL = 'lhoussaine.bourkouko@men.gov.ma';
  // Use stored admin password or fallback to default
  const ADMIN_PASSWORD = appSettings.adminPassword || 'Lhou@7419';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const lowEmail = email.toLowerCase().trim();
    const isValidDomain = lowEmail.endsWith('@men.gov.ma') || lowEmail.endsWith('@taalim.ma');
    
    if (!lowEmail || !lowEmail.includes('@')) {
      alert('المرجو إدخل بريد إلكتروني مهني صحيح');
      return;
    }
    if (!isValidDomain) {
      alert('عذراً، المنصة مقتصرة فقط على مستخدمي نطاق @men.gov.ma أو @taalim.ma');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const isAdmin = lowEmail === ADMIN_EMAIL.toLowerCase();
      if (isAdmin) {
        if (password === ADMIN_PASSWORD) {
          onLogin({ email: lowEmail, role: UserRole.ADMIN, name: 'المدير(ة) العام(ة)' });
        } else {
          alert('كلمة المرور الخاصة بالمدير(ة) العام(ة) غير صحيحة');
          setLoading(false);
        }
      } else {
        if (password === appSettings.globalUserPassword) {
          onLogin({ email: lowEmail, role: UserRole.USER, name: lowEmail.split('@')[0] });
        } else {
          alert('كلمة المرور الموحدة للموظفين غير صحيحة');
          setLoading(false);
        }
      }
    }, 1000);
  };

  const logoSrc = appSettings.customLogo || "https://i.ibb.co/VMDX3x4/haouz-header.png";

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 items-center justify-center p-6 font-['Cairo'] text-right" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="w-full bg-white p-8 pb-2 flex items-center justify-center">
          <img src={logoSrc} alt="Logo" className="w-full h-auto max-h-24 object-contain" />
        </div>

        <div className="p-8 pt-4">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 flex items-center gap-2 mb-2">
               <ShieldCheck size={14} className="text-blue-600" />
               <span className="text-[11px] font-black text-blue-700">بوابة التواصل الموحد</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 flex items-center gap-2">
                <Mail size={12} className="text-blue-500" /> البريد الإلكتروني المهني
              </label>
              <input 
                type="email"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-[13px] font-black text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-left"
                placeholder="example@taalim.ma"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 mr-2 flex items-center gap-2">
                <Key size={12} className="text-blue-500" /> كلمة المرور
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-[13px] font-black text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-left"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full py-5 bg-gradient-to-r from-blue-700 to-indigo-600 text-white rounded-[1.8rem] text-[13px] font-black shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
              {loading ? <Loader2 size={24} className="animate-spin" /> : <>تـسـجـيـل الـدخـول <ArrowRight size={20} className="rotate-180" /></>}
            </button>
          </form>
        </div>
      </div>
      <p className="mt-8 text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Direction Al Haouz Hub © 2024</p>
    </div>
  );
}
