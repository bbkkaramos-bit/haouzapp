
import React, { useState, useEffect, useMemo } from 'react';
import { Memo, MemoCategory } from '../types';
import { summarizeMemo } from '../services/geminiService';
import { 
  Search, FileText, Download, Calendar, Filter, Plus, 
  Edit2, Trash2, X, Settings, Check, ArrowDownToLine, 
  BookOpen, Hash, Tag, FileDown, Clock, Archive, Sparkles, Loader2
} from 'lucide-react';

interface MemosManagerProps {
  isAdminOverride?: boolean;
}

const INITIAL_MEMOS: Memo[] = [
  { id: '1', title: 'بشأن تنظيم امتحانات نيل شهادة الدروس الابتدائية', reference: '24-001X', date: '2024-05-10', category: MemoCategory.MINISTERIAL },
  { id: '2', title: 'مذكرة أكاديمية حول الدخول المدرسي المقبل', reference: 'AREF-05', date: '2024-04-15', category: MemoCategory.ACADEMIC },
  { id: '3', title: 'تكليفات الأطر الإدارية بمديرية الحوز', reference: 'DP-HA-22', date: '2024-05-12', category: MemoCategory.REGIONAL },
  { id: '4', title: 'نموذج تقرير يومي عن سير الدراسة', reference: 'MOD-01', date: '2024-05-20', category: MemoCategory.FORMS },
  { id: '5', title: 'نموذج محضر اجتماع مجلس التدبير', reference: 'MOD-02', date: '2024-05-21', category: MemoCategory.FORMS },
];

const MemosManager: React.FC<MemosManagerProps> = ({ isAdminOverride = false }) => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<MemoCategory | 'الكل'>('الكل');
  const [showModal, setShowModal] = useState(false);
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [summaryLoadingId, setSummaryLoadingId] = useState<string | null>(null);
  const [activeSummary, setActiveSummary] = useState<{id: string, text: string} | null>(null);

  const [formData, setFormData] = useState<Partial<Memo>>({
    title: '', reference: '', date: new Date().toISOString().split('T')[0], category: MemoCategory.MINISTERIAL
  });

  useEffect(() => {
    const saved = localStorage.getItem('dir_memos_v1');
    setMemos(saved ? JSON.parse(saved) : INITIAL_MEMOS);
  }, []);

  const saveMemos = (updated: Memo[]) => {
    setMemos(updated);
    localStorage.setItem('dir_memos_v1', JSON.stringify(updated));
  };

  const handleSummarize = async (memo: Memo) => {
    if (activeSummary?.id === memo.id) {
      setActiveSummary(null);
      return;
    }
    setSummaryLoadingId(memo.id);
    const summary = await summarizeMemo(memo.title, memo.reference);
    setActiveSummary({ id: memo.id, text: summary });
    setSummaryLoadingId(null);
  };

  const handleSaveMemo = () => {
    if (!isAdminOverride) return;
    if (!formData.title || !formData.reference) {
      alert('المرجو ملء جميع البيانات');
      return;
    }

    let updated: Memo[];
    if (editingMemo) {
      updated = memos.map(m => m.id === editingMemo.id ? { ...m, ...formData } as Memo : m);
    } else {
      updated = [{ ...formData, id: `memo-${Date.now()}` } as Memo, ...memos];
    }

    saveMemos(updated);
    setShowModal(false);
    setEditingMemo(null);
  };

  const filteredMemos = useMemo(() => {
    return memos.filter(m => {
      const matchesCategory = activeCategory === 'الكل' || m.category === activeCategory;
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = m.title.toLowerCase().includes(lowerSearch) || 
                            m.reference.toLowerCase().includes(lowerSearch);
      return matchesCategory && matchesSearch;
    });
  }, [memos, activeCategory, searchTerm]);

  const getCategoryColor = (cat: MemoCategory) => {
    switch (cat) {
      case MemoCategory.MINISTERIAL: return 'bg-blue-50 text-blue-600 border-blue-100';
      case MemoCategory.ACADEMIC: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case MemoCategory.REGIONAL: return 'bg-orange-50 text-orange-600 border-orange-100';
      case MemoCategory.FORMS: return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50 font-['Cairo'] pb-32 text-right" dir="rtl">
      {/* Sticky Header */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Archive size={22} />
            </div>
            <div>
              <h1 className="text-[12px] font-black text-slate-800 leading-tight">مركز المذكرات والنماذج</h1>
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">أرشيف المديرية الرسمي</p>
            </div>
          </div>
          {isAdminOverride && (
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <Settings size={18} />
            </div>
          )}
        </div>

        <div className="flex px-4 pb-3 gap-2 overflow-x-auto scrollbar-hide">
          {['الكل', ...Object.values(MemoCategory)].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as any)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black transition-all border whitespace-nowrap ${activeCategory === cat ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-white text-slate-400 border-slate-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="relative group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
          <input
            type="text"
            placeholder="البحث برقم المذكرة، النموذج أو العنوان..."
            className="w-full pr-11 pl-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {filteredMemos.length > 0 ? filteredMemos.map((memo) => (
            <div key={memo.id} className="bg-white rounded-[2rem] border border-slate-50 shadow-sm p-5 relative overflow-hidden group hover:border-blue-200 transition-all">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${getCategoryColor(memo.category)}`}>
                  {memo.category === MemoCategory.FORMS ? <FileDown size={24} /> : <FileText size={24} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg border ${getCategoryColor(memo.category)}`}>
                      {memo.category}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> {memo.date}
                    </span>
                  </div>
                  <h3 className="text-[11px] font-black text-slate-800 leading-relaxed mb-3">{memo.title}</h3>
                  
                  {activeSummary?.id === memo.id && (
                    <div className="mb-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 animate-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 mb-2">
                         <Sparkles size={12} className="text-blue-600" />
                         <span className="text-[9px] font-black text-blue-600 uppercase">ملخص الذكاء الاصطناعي:</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-600 leading-relaxed">{activeSummary.text}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                      <Hash size={12} /> {memo.reference}
                    </span>
                    
                    <div className="flex gap-2">
                       <button 
                        onClick={() => handleSummarize(memo)}
                        disabled={summaryLoadingId === memo.id}
                        className={`p-2 rounded-xl transition-all shadow-sm ${activeSummary?.id === memo.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}
                       >
                         {summaryLoadingId === memo.id ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14}/>}
                       </button>
                       <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black active:scale-95 transition-all">
                          <Download size={14} />
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
               <BookOpen size={48} className="mx-auto text-slate-100 mb-4" />
               <p className="text-slate-400 text-[11px] font-black">لا توجد نتائج مطابقة حالياً</p>
            </div>
          )}
        </div>
      </div>

      {isAdminOverride && (
        <button 
          onClick={() => { setEditingMemo(null); setFormData({ category: MemoCategory.MINISTERIAL, date: new Date().toISOString().split('T')[0] }); setShowModal(true); }}
          className="fixed bottom-28 left-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-[70] border-4 border-white active:scale-90 transition-all"
        >
          <Plus size={28} />
        </button>
      )}

      {/* Add/Edit Modal */}
      {showModal && isAdminOverride && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl relative animate-in zoom-in duration-200 text-right overflow-y-auto max-h-[90vh] scrollbar-hide">
            <button onClick={() => setShowModal(false)} className="absolute top-8 left-8 text-slate-300 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
            <h2 className="text-base font-black text-slate-900 mb-8">{editingMemo ? 'تعديل البيانات' : 'إضافة مستند جديد'}</h2>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 mr-2">نوع المستند</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-[11px] font-black text-slate-900 outline-none appearance-none" 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value as MemoCategory})}
                >
                  {Object.values(MemoCategory).map(cat => <option key={cat} value={cat} className="text-slate-900">{cat}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 mr-2">عنوان المستند (أو النموذج)</label>
                <textarea className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-[11px] font-black text-slate-900 outline-none h-24 resize-none" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="اكتب العنوان بوضوح..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 mr-2">المرجع / الرمز</label>
                  <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-[11px] font-black text-slate-900 outline-none" value={formData.reference} onChange={(e) => setFormData({...formData, reference: e.target.value})} placeholder="مثال: MOD-2024" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 mr-2">التاريخ</label>
                  <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-[11px] font-black text-slate-900 outline-none" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>
              <button onClick={handleSaveMemo} className="w-full py-4.5 bg-blue-600 text-white rounded-2xl text-[12px] font-black shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                <Check size={20} /> حفظ في الأرشيف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemosManager;
