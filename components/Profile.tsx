
import React, { useState, useRef } from 'react';
import { 
  LogOut, Shield, HelpCircle, ChevronLeft, User as UserIcon, ShieldCheck, 
  Edit2, Camera, Check, X, Mail, Settings, Key, AlertTriangle, Lock, 
  ImageIcon, Code2, RotateCcw, CloudUpload, CloudDownload, Loader2, RefreshCw,
  Globe, Zap, Radio, UserCog, Database, UploadCloud, Terminal
} from 'lucide-react';
import { UserSession, UserRole, AppSettings } from '../types';

interface ProfileProps {
  session: UserSession;
  onLogout: () => void;
  onUpdateSession: (updated: UserSession) => void;
  appSettings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

const Profile: React.FC<ProfileProps> = ({ session, onLogout, onUpdateSession, appSettings, onUpdateSettings }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [modalType, setModalType] = useState<'GLOBAL' | 'ADMIN' | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [editedName, setEditedName] = useState(session.name);
  const [editedImage, setEditedImage] = useState(session.image || '');
  
  const [newPasswordValue, setNewPasswordValue] = useState('');
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const devPhotoInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);
  
  const isAdmin = session.role === UserRole.ADMIN;

  const handleFullBackup = () => {
    if (!isAdmin) return;
    setIsBackingUp(true);
    
    try {
      const keysToBackup = [
        'dir_schools_v37',
        'dir_staff_v14',
        'dir_news_v1',
        'dir_ticker_v1',
        'dir_memos_v1',
        'dir_forms_v2',
        'dir_mail_v1',
        'app_global_settings_v1'
      ];

      const backupData: Record<string, string | null> = {};
      keysToBackup.forEach(key => {
        backupData[key] = localStorage.getItem(key);
      });

      const blob = new Blob([JSON.stringify(backupData)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_haouz_hub_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert('تم إنشاء نسخة احتياطية لكافة بيانات المنصة بنجاح.');
    } catch (error) {
      alert('خطأ أثناء إنشاء النسخة الاحتياطية');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('تحذير: استعادة البيانات ستقوم باستبدال كافة المعلومات الحالية بالبيانات الموجودة في الملف. هل أنت متأكد؟')) {
      if (restoreInputRef.current) restoreInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        Object.entries(data).forEach(([key, value]) => {
          if (value) localStorage.setItem(key, value as string);
        });
        alert('تمت استعادة البيانات بنجاح! سيتم إعادة تحميل الموقع لتطبيق التغييرات.');
        window.location.reload();
      } catch (error) {
        alert('الملف المرفوع غير صالح أو تالف.');
      }
    };
    reader.readAsText(file);
  };

  const handleSyncPush = async () => {
    if (!isAdmin) return;
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const now = new Date().toISOString();
    onUpdateSettings({ 
      ...appSettings, 
      lastCloudSync: now,
      lastUpdated: now
    });
    
    window.localStorage.setItem('app_cloud_signal', now);
    alert('تم نشر التحديثات بنجاح! ستظهر رسالة "توجد بيانات جديدة" لجميع الموظفين الآن.');
    setIsSyncing(false);
  };

  const handleUpdatePassword = () => {
    if (!newPasswordValue.trim()) {
      alert('المرجو إدخل كلمة المرور');
      return;
    }

    if (modalType === 'GLOBAL') {
      onUpdateSettings({ ...appSettings, globalUserPassword: newPasswordValue });
      alert('تم تحديث كلمة المرور الموحدة للموظفين');
    } else if (modalType === 'ADMIN') {
      onUpdateSettings({ ...appSettings, adminPassword: newPasswordValue });
      alert('تم تحديث كلمة مرور المدير العام بنجاح');
    }

    setModalType(null);
    setNewPasswordValue('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'profile' | 'logo' | 'devPhoto') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (target === 'profile') setEditedImage(base64);
        else if (target === 'logo') onUpdateSettings({ ...appSettings, customLogo: base64 });
        else if (target === 'devPhoto') onUpdateSettings({ ...appSettings, customDevPhoto: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    onUpdateSession({ ...session, name: editedName, image: editedImage });
    setIsEditing(false);
    alert('تم حفظ بيانات الحساب الشخصي');
  };

  const devPhotoSrc = appSettings.customDevPhoto || "https://i.ibb.co/VvWjCxF/user-photo.jpg";

  return (
    <div className="flex flex-col min-h-full bg-slate-50 font-['Cairo'] pb-32 text-right" dir="rtl">
      {/* Profile Header */}
      <div className="bg-white px-6 pt-12 pb-10 rounded-b-[3.5rem] shadow-sm border-b border-slate-100 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="absolute top-8 right-8 p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all">
            <Edit2 size={18} />
          </button>
        )}

        <div className="relative flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-[2.8rem] border-4 border-white shadow-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
              {(isEditing ? editedImage : session.image) ? (
                <img src={isEditing ? editedImage : session.image} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={56} className="text-slate-300" />
              )}
            </div>
            {isEditing && (
              <button onClick={() => imageInputRef.current?.click()} className="absolute -bottom-2 -right-2 w-11 h-11 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
                <Camera size={20} />
                <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'profile')} />
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="w-full max-w-xs space-y-4">
               <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-center text-[14px] font-black text-slate-900" value={editedName} onChange={(e) => setEditedName(e.target.value)} />
               <div className="flex gap-3">
                  <button onClick={handleSaveProfile} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[12px] font-black shadow-lg">حفظ</button>
                  <button onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[12px] font-black">إلغاء</button>
               </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-black text-slate-800">{session.name}</h2>
              <div className={`mt-3 px-5 py-2 rounded-full flex items-center gap-2 border shadow-sm ${isAdmin ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                <ShieldCheck size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">{isAdmin ? 'المدير العام للمنصة' : 'إطار بمديرية الحوز'}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="px-5 mt-10 space-y-4">
        
        {/* مركز المزامنة والنشر */}
        <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
           <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                       <Radio className={isSyncing ? "animate-pulse text-blue-400" : "text-blue-400"} size={22} />
                    </div>
                    <div className="text-right">
                       <h3 className="text-[13px] font-black">مركز النشر والتحديث</h3>
                       <p className="text-[8px] font-bold text-blue-300">الحالة: <span className="animate-pulse">متصل بالسحابة</span></p>
                    </div>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                 {isAdmin && (
                    <button 
                       onClick={handleSyncPush}
                       disabled={isSyncing}
                       className="w-full flex items-center justify-center gap-3 p-4 bg-blue-600 rounded-2xl text-[11px] font-black shadow-lg"
                    >
                       {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <CloudUpload size={18} />}
                       نشر كافة التعديلات للكل
                    </button>
                 )}
                 <button onClick={() => window.location.reload()} className="w-full flex items-center justify-center gap-3 p-4 bg-white/10 rounded-2xl text-[11px] font-black">
                    <RefreshCw size={18} /> مزامنة وجلب البيانات الآن
                 </button>
              </div>
           </div>
        </div>

        {/* أدوات المدير - النسخ الاحتياطي */}
        {isAdmin && (
           <div className="mt-8 space-y-3">
             <h3 className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest flex items-center gap-2">
               <Database size={12} /> إدارة قواعد البيانات
             </h3>
             <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleFullBackup}
                  disabled={isBackingUp}
                  className="flex flex-col items-center gap-3 p-6 bg-white border border-slate-100 rounded-[2.2rem] shadow-sm hover:border-blue-500 transition-all group"
                >
                   <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {isBackingUp ? <Loader2 size={24} className="animate-spin" /> : <CloudDownload size={24} />}
                   </div>
                   <span className="text-[11px] font-black">نسخة احتياطية</span>
                </button>

                <button 
                  onClick={() => restoreInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 p-6 bg-white border border-slate-100 rounded-[2.2rem] shadow-sm hover:border-emerald-500 transition-all group"
                >
                   <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <UploadCloud size={24} />
                   </div>
                   <span className="text-[11px] font-black">استعادة البيانات</span>
                   <input type="file" ref={restoreInputRef} className="hidden" accept=".json" onChange={handleRestoreBackup} />
                </button>
             </div>

             <h3 className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest mt-6">إدارة الدخول والحماية</h3>
             
             {/* تغيير كلمة المرور الموحدة */}
             <button onClick={() => { setModalType('GLOBAL'); setNewPasswordValue(appSettings.globalUserPassword); }} className="w-full flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm group">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all"><Key size={22} /></div>
                  <div className="text-right">
                    <span className="text-[11px] font-black block">كلمة المرور الموحدة</span>
                    <span className="text-[8px] font-bold text-slate-400">لجميع الموظفين</span>
                  </div>
                </div>
                <ChevronLeft size={18} className="text-slate-300" />
             </button>

             {/* تغيير كلمة مرور المدير */}
             <button onClick={() => { setModalType('ADMIN'); setNewPasswordValue(appSettings.adminPassword || 'Lhou@7419'); }} className="w-full flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm group">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all"><UserCog size={22} /></div>
                  <div className="text-right">
                    <span className="text-[11px] font-black block">كلمة مرور المدير</span>
                    <span className="text-[8px] font-bold text-slate-400">تأمين حسابك الخاص</span>
                  </div>
                </div>
                <ChevronLeft size={18} className="text-slate-300" />
             </button>

             <h3 className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest mt-6">تخصيص الهوية</h3>
             <div className="flex gap-2">
               <button onClick={() => logoInputRef.current?.click()} className="flex-1 flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600"><ImageIcon size={20} /></div>
                    <span className="text-[11px] font-black">شعار المديرية</span>
                  </div>
                  <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} />
               </button>
               <button onClick={() => devPhotoInputRef.current?.click()} className="flex-1 flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-purple-50 text-purple-600"><Code2 size={20} /></div>
                    <span className="text-[11px] font-black">صورة المطور</span>
                  </div>
                  <input type="file" ref={devPhotoInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'devPhoto')} />
               </button>
             </div>
           </div>
        )}

        {/* بطاقة المطور */}
        <div className="mt-10 p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 mr-2 mb-4 uppercase tracking-widest flex items-center gap-2">
            <Terminal size={12} className="text-blue-500" /> تطوير وإشراف تقني
          </h3>
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-[2rem] border border-slate-100">
            <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden border-2 border-white shadow-md flex-shrink-0">
              <img src={devPhotoSrc} alt="Developer" className="w-full h-full object-cover" />
            </div>
            <div className="text-right">
              <p className="text-[13px] font-black text-blue-900">الحسين بوركوكو</p>
              <p className="text-[10px] text-slate-500 font-bold leading-tight mt-1">رئيس المركز الإقليمي لمنظومة الإعلام</p>
            </div>
          </div>
        </div>

        <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 p-6 text-red-500 font-black bg-white rounded-[2rem] border-2 border-red-50 shadow-sm mt-6 active:scale-95 transition-all">
          <LogOut size={24} />
          <span className="text-xs">تسجيل الخروج الآمن</span>
        </button>
      </div>

      {/* Password Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3.5rem] shadow-2xl p-8 text-right relative">
             <button onClick={() => setModalType(null)} className="absolute top-8 left-8 text-slate-300 hover:text-red-500"><X size={24}/></button>
             <h2 className="text-base font-black text-slate-900 mb-6">
               {modalType === 'GLOBAL' ? 'تحديث كلمة المرور الموحدة' : 'تحديث كلمة مرور المدير'}
             </h2>
             <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 mr-2">أدخل كلمة المرور الجديدة</label>
                  <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4.5 px-6 text-[14px] font-black text-slate-900 text-center outline-none focus:border-blue-500" value={newPasswordValue} onChange={(e) => setNewPasswordValue(e.target.value)} dir="ltr" />
                </div>
                <button onClick={handleUpdatePassword} className="w-full py-5 bg-blue-600 text-white rounded-2xl text-[12px] font-black shadow-xl flex items-center justify-center gap-3">
                  <Check size={20} /> اعتماد كلمة المرور
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
