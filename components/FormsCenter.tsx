
import React, { useState, useEffect, useRef } from 'react';
import { 
  FileDown, Search, Filter, FileText, Download, HardDrive, 
  Info, ChevronDown, Plus, Edit2, Trash2, Settings, X, Check, Tag, Upload, FileCheck, Loader2, AlertCircle
} from 'lucide-react';
import { AdminForm } from '../types';

interface FormsCenterProps {
  isAdminOverride?: boolean;
}

const INITIAL_FORMS: AdminForm[] = [
  { id: '1', title: 'طلب رخصة تغيب إدارية', category: 'الرخص والغيابات', size: '240 KB' },
  { id: '2', title: 'نموذج طلب شهادة العمل', category: 'الشهادات الإدارية', size: '150 KB' },
  { id: '3', title: 'تصريح بالشرف (التعويضات العائلية)', category: 'الشؤون الاجتماعية', size: '190 KB' },
];

const FormsCenter: React.FC<FormsCenterProps> = ({ isAdminOverride = false }) => {
  const [forms, setForms] = useState<AdminForm[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [showModal, setShowModal] = useState(false);
  const [editingForm, setEditingForm] = useState<AdminForm | null>(null);
  
  const [formData, setFormData] = useState({ title: '', category: '', fileData: '', fileName: '', size: '' });
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('dir_forms_v2');
    setForms(saved ? JSON.parse(saved) : INITIAL_FORMS);
  }, []);

  const saveToStorage = (updatedForms: AdminForm[]) => {
    setForms(updatedForms);
    localStorage.setItem('dir_forms_v2', JSON.stringify(updatedForms));
  };

  const categories = ['الكل', ...new Set(forms.map(f => f.category))];

  const filteredForms = forms.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'الكل' || f.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('يرجى اختيار ملف PDF فقط');
        return;
      }
      setIsProcessingFile(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const sizeKB = Math.round(file.size / 1024);
        setFormData({ ...formData, fileData: base64, fileName: file.name, size: `${sizeKB} KB` });
        setIsProcessingFile(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!isAdminOverride) return;
    const finalCategory = isNewCategory ? customCategory : formData.category;
    if (!formData.title || !finalCategory) { alert('يرجى ملء جميع الخانات الأساسية'); return; }

    let updated: AdminForm[];
    if (editingForm) {
      updated = forms.map(f => f.id === editingForm.id ? { ...f, title: formData.title, category: finalCategory, fileData: formData.fileData || f.fileData, fileName: formData.fileName || f.fileName, size: formData.size || f.size } : f);
    } else {
      updated = [{ id: Date.now().toString(), title: formData.title, category: finalCategory, size: formData.size || '0 KB', fileData: formData.fileData, fileName: formData.fileName }, ...forms];
    }
    saveToStorage(updated);
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingForm(null);
    setFormData({ title: '', category: '', fileData: '', fileName: '', size: '' });
    setIsNewCategory(false);
    setCustomCategory('');
  };

  const handleDelete = (id: string) => {
    if (!isAdminOverride) return;
    if (confirm('هل أنت متأكد من حذف هذا النموذج؟')) {
      const updated = forms.filter(f => f.id !== id);
      saveToStorage(updated);
    }
  };

  const openEdit = (form: AdminForm) => {
    setEditingForm(form);
    setFormData({ title: form.title, category: form.category, fileData: form.fileData || '', fileName: form.fileName || '', size: form.size || '' });
    setIsNewCategory(false);
    setShowModal(true);
  };

  const handleDownload = (form: AdminForm) => {
    if (!form.fileData) { alert('عذراً، الملف غير متوفر حالياً.'); return; }
    const link = document.createElement('a');
    link.href = form.fileData;
    link.download = form.fileName || `${form.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50 font-['Cairo'] pb-32 text-right" dir="rtl">
      <div className="bg-white px-6 pt-10 pb-6 shadow-sm border-b border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
              <HardDrive size={24} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-800 leading-tight">مركز النماذج الإدارية</h1>
              <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest">تحميل الوثائق والمطبوعات الجاهزة</p>
            </div>
          </div>
          {isAdminOverride && (
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
              <Settings size={18} />
            </div>
          )}
        </div>

        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="ابحث عن نموذج..." 
            className="w-full pr-11 pl-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-inner text-slate-900 placeholder:text-slate-300" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600 shrink-0"><Filter size={16} /></div>
          <div className="relative flex-1">
            <select 
              value={activeCategory} 
              onChange={(e) => setActiveCategory(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[10px] font-black text-slate-900 appearance-none outline-none cursor-pointer"
            >
              {categories.map(cat => <option key={cat} value={cat} className="text-slate-900">{cat === 'الكل' ? 'جميع التصنيفات' : cat}</option>)}
            </select>
            <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="grid gap-3">
          {filteredForms.map(form => (
            <div key={form.id} className="bg-white p-5 rounded-[2rem] border border-slate-50 shadow-sm flex items-center gap-4 group hover:border-emerald-200 transition-all">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0"><FileText size={24} /></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[11px] font-black text-slate-800 truncate mb-1">{form.title}</h3>
                <div className="flex items-center gap-3">
                  <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">{form.category}</span>
                  <span className="text-[8px] font-bold text-slate-400">{form.size}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {isAdminOverride ? (
                  <>
                    <button onClick={() => openEdit(form)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit2 size={14}/></button>
                    <button onClick={() => handleDelete(form.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={14}/></button>
                  </>
                ) : (
                  <button onClick={() => handleDownload(form)} className={`p-3 rounded-xl shadow-lg transition-all ${form.fileData ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-300'}`} disabled={!form.fileData}>
                    <Download size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isAdminOverride && (
        <button onClick={() => { closeModal(); setShowModal(true); }} className="fixed bottom-28 left-6 w-16 h-16 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center z-[70] border-4 border-white active:scale-90 transition-all">
          <Plus size={28} />
        </button>
      )}

      {showModal && isAdminOverride && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl relative animate-in zoom-in overflow-y-auto max-h-[90vh] text-right">
            <button onClick={closeModal} className="absolute top-8 left-8 text-slate-300 hover:text-red-500"><X size={24} /></button>
            <h2 className="text-base font-black text-slate-900 mb-8">{editingForm ? 'تعديل النموذج' : 'إضافة نموذج جديد'}</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 mr-2">اسم النموذج</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-[11px] font-black outline-none shadow-inner text-slate-900" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})} 
                />
              </div>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-[1.8rem] p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${formData.fileData ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-emerald-400'}`}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />
                {isProcessingFile ? <Loader2 size={32} className="animate-spin text-emerald-600" /> : <Upload size={32} className={formData.fileData ? 'text-emerald-600' : 'text-slate-300'} />}
                <p className="text-[10px] font-black text-slate-500">{formData.fileName || 'ارفع ملف PDF هنا'}</p>
              </div>
              <button onClick={handleSave} className="w-full py-5 bg-emerald-600 text-white rounded-2xl text-[12px] font-black shadow-xl shadow-emerald-100 flex items-center justify-center gap-3">
                <Check size={20} /> اعتماد وحفظ النموذج
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormsCenter;
