
import React, { useState, useEffect, useRef } from 'react';
import { Announcement } from '../types';
import { firebaseService } from '../services/firebaseService';
import { syncFacebookNews } from '../services/geminiService';
import * as XLSX from 'xlsx';
import { 
  Bell, Calendar, Search, Plus, Trash2, Edit2, 
  X, Check, Megaphone, User as UserIcon, Loader2, Facebook, Newspaper, 
  MoveHorizontal, RefreshCw, FileSpreadsheet, PlusCircle, Link as LinkIcon, AlertCircle
} from 'lucide-react';

interface FeedProps {
  isAdminOverride?: boolean;
}

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: '1',
    title: 'مرحباً بكم في منصة مديرية الحوز',
    content: 'هذه المنصة مخصصة لتسهيل التواصل والتدبير الإداري والتربوي بالإقليم.',
    author: 'الإدارة',
    date: new Date().toISOString().split('T')[0],
    category: 'إعلان عام'
  }
];

const Feed: React.FC<FeedProps> = ({ isAdminOverride = false }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tickerNews, setTickerNews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'NEWS' | 'TICKER'>('NEWS');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // حالة نموذج الإضافة اليدوية
  const [formData, setFormData] = useState<Partial<Announcement>>({
    title: '',
    content: '',
    category: 'إعلان عام',
    author: 'الإدارة',
    isUrgent: false,
    link: ''
  });

  const excelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const localNews = localStorage.getItem('local_app_data_news_feed');
    const localTicker = localStorage.getItem('local_app_config_ticker_news');

    if (localNews) {
      setAnnouncements(JSON.parse(localNews));
    } else {
      setAnnouncements(DEFAULT_ANNOUNCEMENTS);
    }

    if (localTicker) {
      setTickerNews(JSON.parse(localTicker));
    }

    setInitialLoading(false);
  }, []);

  const saveNews = async (updated: Announcement[]) => {
    setAnnouncements(updated);
    localStorage.setItem('local_app_data_news_feed', JSON.stringify(updated));
    if (isAdminOverride) {
      await firebaseService.saveData('app_data', 'news_feed', updated);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const remoteNews = await firebaseService.fetchDocument('app_data', 'news_feed');
      const remoteTicker = await firebaseService.fetchDocument('app_config', 'ticker_news');
      
      if (remoteNews && Array.isArray(remoteNews)) {
        setAnnouncements(remoteNews);
        localStorage.setItem('local_app_data_news_feed', JSON.stringify(remoteNews));
      }
      if (remoteTicker && Array.isArray(remoteTicker)) {
        setTickerNews(remoteTicker);
        localStorage.setItem('local_app_config_ticker_news', JSON.stringify(remoteTicker));
      }
      alert('تم تحديث الأخبار بنجاح من السحابة');
    } catch (e) {
      alert('فشل الاتصال بالسحابة. جاري العمل بالوضع المحلي.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddNewsManual = async () => {
    if (!formData.title || !formData.content) {
      alert('يرجى ملء العنوان والمحتوى');
      return;
    }

    const newNews: Announcement = {
      id: `news-${Date.now()}`,
      title: formData.title!,
      content: formData.content!,
      author: formData.author || 'الإدارة',
      date: new Date().toISOString().split('T')[0],
      category: formData.category || 'إعلان عام',
      isUrgent: formData.isUrgent,
      link: formData.link
    };

    const updated = [newNews, ...announcements];
    await saveNews(updated);
    setShowAddModal(false);
    setFormData({ title: '', content: '', category: 'إعلان عام', author: 'الإدارة', isUrgent: false, link: '' });
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];

        const importedNews: Announcement[] = jsonData.map((row, idx) => ({
          id: `imp-${Date.now()}-${idx}`,
          title: row['العنوان'] || row['Title'] || 'بدون عنوان',
          content: row['المحتوى'] || row['Content'] || '',
          author: row['الكاتب'] || row['Author'] || 'الإدارة',
          date: row['التاريخ'] || row['Date'] || new Date().toISOString().split('T')[0],
          category: row['التصنيف'] || row['Category'] || 'إعلان عام',
          link: row['الرابط'] || row['Link'] || ''
        })).filter(item => item.content !== '');

        if (confirm(`تم العثور على ${importedNews.length} خبر. هل تريد إضافتها للأخبار الحالية؟`)) {
          const updated = [...importedNews, ...announcements];
          saveNews(updated);
        }
      } catch (err) {
        alert('خطأ في قراءة ملف Excel');
      } finally {
        setIsImporting(false);
        if (excelInputRef.current) excelInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFacebookSync = async () => {
    if (!isAdminOverride) return;
    setIsSyncing(true);
    try {
      const fbData = await syncFacebookNews();
      const newItem: Announcement = {
        id: `fb-${Date.now()}`,
        title: "مستجدات فيسبوك المديرية",
        content: fbData.rawText,
        author: 'AI Assistant',
        date: new Date().toISOString().split('T')[0],
        category: 'فيسبوك',
        link: "https://www.facebook.com/profile.php?id=100044383515584"
      };
      const updated = [newItem, ...announcements];
      await saveNews(updated);
      alert("تمت المزامنة مع فيسبوك بنجاح!");
    } catch (e) { 
      alert("خطأ في المزامنة مع فيسبوك"); 
    } finally { 
      setIsSyncing(false); 
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">جاري تحميل الأخبار...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-50 font-['Cairo'] pb-32 text-right">
      <div className="bg-white p-6 shadow-sm border-b border-slate-100 sticky top-0 z-50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Megaphone size={24} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-800 leading-tight">مركز الأخبار</h1>
              <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">المستجدات الرسمية</p>
            </div>
          </div>
          <div className="flex gap-2">
            {isAdminOverride && (
              <>
                <button 
                  onClick={() => excelInputRef.current?.click()}
                  disabled={isImporting}
                  className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shadow-sm active:scale-90 transition-all"
                  title="استيراد أخبار"
                >
                  {isImporting ? <Loader2 size={18} className="animate-spin" /> : <FileSpreadsheet size={18} />}
                  <input type="file" ref={excelInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleExcelImport} />
                </button>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="p-3 bg-blue-600 text-white rounded-xl shadow-md active:scale-90 transition-all"
                  title="إضافة خبر يدوياً"
                >
                  <Plus size={18} />
                </button>
                <button 
                  onClick={handleFacebookSync} 
                  disabled={isSyncing} 
                  className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 active:scale-90"
                >
                  {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <Facebook size={18} />}
                </button>
              </>
            )}
            <button 
              onClick={handleManualSync}
              disabled={isSyncing}
              title="تحديث"
              className={`p-3 rounded-xl border flex items-center gap-2 transition-all active:scale-90 ${isSyncing ? 'bg-slate-50 text-slate-300' : 'bg-slate-50 text-slate-600 border-slate-200 shadow-sm'}`}
            >
              <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setActiveSubTab('NEWS')} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${activeSubTab === 'NEWS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
            الإعلانات
          </button>
          <button onClick={() => setActiveSubTab('TICKER')} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${activeSubTab === 'TICKER' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
            الشريط الإخباري
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {activeSubTab === 'NEWS' ? (
          announcements.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
               <Newspaper size={40} className="mx-auto text-slate-100 mb-4" />
               <p className="text-slate-400 text-[10px] font-black italic">لا توجد إعلانات حالياً</p>
            </div>
          ) : (
            announcements.map(ann => (
              <div key={ann.id} className={`bg-white p-6 rounded-[2.5rem] shadow-sm border relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 ${ann.isUrgent ? 'border-red-100 bg-red-50/20' : 'border-slate-50'}`}>
                {ann.isUrgent && <div className="absolute top-0 right-0 left-0 h-1 bg-red-500"></div>}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 text-[8px] font-black rounded-lg uppercase ${ann.isUrgent ? 'bg-red-500 text-white' : 'bg-blue-50 text-blue-600'}`}>{ann.category}</span>
                  {isAdminOverride && (
                    <button onClick={() => saveNews(announcements.filter(a => a.id !== ann.id))} className="text-red-400 p-1 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14}/></button>
                  )}
                </div>
                <h2 className="text-[13px] font-black text-slate-900 mb-2 leading-tight">{ann.title}</h2>
                <div className="text-slate-600 text-[10px] font-bold leading-relaxed whitespace-pre-line">
                  {ann.content}
                </div>
                {ann.link && (
                  <a href={ann.link} target="_blank" className="mt-4 flex items-center gap-2 text-[9px] font-black text-blue-600 bg-blue-50 w-fit px-3 py-1.5 rounded-xl border border-blue-100">
                    <LinkIcon size={12}/> عرض المزيد
                  </a>
                )}
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-400 flex items-center gap-1.5"><UserIcon size={12}/> {ann.author}</span>
                  <span className="text-[9px] font-black text-slate-400 flex items-center gap-1.5"><Calendar size={12}/> {ann.date}</span>
                </div>
              </div>
            ))
          )
        ) : (
          tickerNews.length === 0 ? (
             <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
               <Bell size={40} className="mx-auto text-slate-100 mb-4" />
               <p className="text-slate-400 text-[10px] font-black italic">شريط الأخبار فارغ</p>
            </div>
          ) : (
            tickerNews.map((msg, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-right-2 duration-300">
                <p className="text-[11px] font-black text-slate-700 leading-relaxed">{msg}</p>
                {isAdminOverride && (
                  <button 
                    onClick={() => {
                      const updated = tickerNews.filter((_, i) => i !== idx);
                      setTickerNews(updated);
                      localStorage.setItem('local_app_config_ticker_news', JSON.stringify(updated));
                      firebaseService.saveData('app_config', 'ticker_news', updated);
                    }}
                    className="p-2 text-red-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))
          )
        )}
      </div>

      {/* Modal إضافة خبر */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-in zoom-in duration-300 text-right border border-white/20 max-h-[90vh] overflow-y-auto">
            <h2 className="text-[15px] font-black text-slate-900 mb-6 flex items-center gap-3">
               <PlusCircle className="text-blue-600"/> إضافة خبر جديد
            </h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">عنوان الخبر</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-[11px] font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-inner" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  placeholder="اكتب العنوان..." 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">تصنيف الخبر</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-[11px] font-black text-slate-900 outline-none" 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="إعلان عام">إعلان عام</option>
                  <option value="مباراة">مباراة</option>
                  <option value="مذكرة">مذكرة</option>
                  <option value="مستجدات">مستجدات</option>
                  <option value="عاجل">عاجل</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">محتوى الخبر</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-[11px] font-black text-slate-900 outline-none h-32 resize-none" 
                  value={formData.content} 
                  onChange={(e) => setFormData({...formData, content: e.target.value})} 
                  placeholder="اكتب تفاصيل الخبر هنا..." 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">رابط إضافي (اختياري)</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-[11px] font-black text-slate-900 outline-none" 
                  value={formData.link} 
                  onChange={(e) => setFormData({...formData, link: e.target.value})} 
                  placeholder="https://..." 
                  dir="ltr"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-red-50/50 rounded-2xl border border-red-100">
                <input 
                  type="checkbox" 
                  id="urgent" 
                  checked={formData.isUrgent} 
                  onChange={(e) => setFormData({...formData, isUrgent: e.target.checked})} 
                  className="w-5 h-5 rounded-lg accent-red-600" 
                />
                <label htmlFor="urgent" className="text-[11px] font-black text-red-800 flex items-center gap-2">
                  <AlertCircle size={14}/> تمييز الخبر كـ "عاجل"
                </label>
              </div>
              
              <div className="flex gap-2 pt-6">
                <button onClick={handleAddNewsManual} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[12px] font-black shadow-xl active:scale-95 transition-all">إضافة الخبر</button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[12px] font-black">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feed;
