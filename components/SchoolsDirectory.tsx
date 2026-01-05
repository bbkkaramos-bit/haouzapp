
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Institution, SchoolCycle, SubUnit, Employee } from '../types';
import * as XLSX from 'xlsx';
import { 
  Search, Phone, User, School, Plus, Edit2, Trash2, 
  X, Settings, Fingerprint, Users, Layers, Share2, 
  Briefcase, GraduationCap, MapPin, ChevronLeft, ChevronDown, Landmark, Mail, Trash, UserPlus, PlusCircle, MessageSquare, Users2, Smartphone, FileSpreadsheet, Loader2, Check, Save, UserCheck, DownloadCloud, Library, PlusSquare, Crown
} from 'lucide-react';

const INITIAL_COMMUNES = [
  "تمكرت", "التوامة", "تزارت", "زرقطن", "تغدوين", "أبادو", "آيت عادل", 
  "آيت حكيم آيت يزيد", "آيت سيدي داود", "آيت فاسكا", "سيدي عبد الله غيات", 
  "تمزوزت", "أغمات", "إكرفروان", "تديلي مسفيوة", "أغواطيم", "تمصلوحت", 
  "أوريكة", "مولاي إبراهيم", "أوكايمدن", "ستي فاطمة", "أمغراس", "وزكيتة", 
  "للا تكركوست", "أولاد امطاع", "سيدي بدهاج", "تزكين", "دار الجامع", 
  "أزكور", "أنكال", "أسني", "ويركان", "إمكدال", "إجوكاك", "ثلاث نيعقوب", 
  "إغيل", "أغبار"
].sort();

const MOCK_SCHOOLS: Institution[] = [
  {
    id: 'sch-101',
    name: 'مجموعة مدارس تحناوت المركزية',
    gresa: '04523T',
    cycle: SchoolCycle.PRIMARY,
    commune: 'أغواطيم',
    principal: 'عبد العزيز الإدريسي',
    phone: '0661009988',
    address: 'تحناوت - قرب العمالة',
    email: 'tah.central@men.gov.ma',
    isGroup: true,
    subUnits: [
      { 
        id: 'su-101', 
        name: 'فرعية آيت المودن', 
        gresa: '04523T-1',
        staff: [
          { id: 'st-su-1', name: 'ياسين الفاضلي', role: 'أستاذ(ة)', phone: '0611223344', status: 'online', department: 'فرعية آيت المودن', office: 'الوحدة المدرسية', email: '' }
        ]
      },
      { id: 'su-102', name: 'فرعية تمزميزت', gresa: '04523T-2', staff: [] }
    ],
    staff: [
      { id: 'st-1', name: 'سعيد بناني', role: 'أستاذ التعليم الابتدائي', phone: '0670112233', status: 'online', department: 'م.م تحناوت', office: 'المركزية', email: '' },
      { id: 'st-2', name: 'خديجة العلمي', role: 'حارس عام للخارجية', phone: '0661445566', status: 'online', department: 'م.م تحناوت', office: 'المركزية', email: '' }
    ]
  }
];

interface SchoolsDirectoryProps {
  isAdminOverride?: boolean;
}

const SchoolsDirectory: React.FC<SchoolsDirectoryProps> = ({ isAdminOverride = false }) => {
  const [schools, setSchools] = useState<Institution[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCycle, setActiveCycle] = useState<SchoolCycle | 'الكل'>('الكل');
  const [selectedCommune, setSelectedCommune] = useState<string>('الكل');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<Institution | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'INFO' | 'UNITS' | 'STAFF'>('INFO');
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);
  
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showSubUnitQuickModal, setShowSubUnitQuickModal] = useState(false);
  const [targetSubUnitId, setTargetSubUnitId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Institution>>({
    name: '', gresa: '', cycle: SchoolCycle.PRIMARY, commune: INITIAL_COMMUNES[0], 
    principal: '', phone: '', email: '', address: '', isGroup: false, subUnits: [], staff: []
  });

  const [staffFormData, setStaffFormData] = useState<Partial<Employee>>({
    name: '', role: 'أستاذ(ة)', phone: '', office: 'المركزية', status: 'online'
  });

  const [newSubUnit, setNewSubUnit] = useState({ id: '', name: '', gresa: '' });
  const [quickSubUnitForm, setQuickSubUnitForm] = useState({ name: '', gresa: '' });

  const getCycleStyles = (cycle: SchoolCycle) => {
    switch (cycle) {
      case SchoolCycle.PRIMARY:
        return {
          color: 'emerald',
          bg: 'bg-emerald-50',
          text: 'text-emerald-600',
          border: 'border-emerald-100',
          accent: 'bg-emerald-500',
          icon: Library,
          gradient: 'from-emerald-600 to-teal-500'
        };
      case SchoolCycle.PREPARATORY:
        return {
          color: 'amber',
          bg: 'bg-amber-50',
          text: 'text-amber-600',
          border: 'border-amber-100',
          accent: 'bg-amber-500',
          icon: GraduationCap,
          gradient: 'from-amber-600 to-orange-500'
        };
      case SchoolCycle.SECONDARY:
        return {
          color: 'indigo',
          bg: 'bg-indigo-50',
          text: 'text-indigo-600',
          border: 'border-indigo-100',
          accent: 'bg-indigo-500',
          icon: School,
          gradient: 'from-indigo-600 to-blue-500'
        };
      default:
        return {
          color: 'slate',
          bg: 'bg-slate-50',
          text: 'text-slate-600',
          border: 'border-slate-100',
          accent: 'bg-slate-500',
          icon: Landmark,
          gradient: 'from-slate-600 to-slate-500'
        };
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('dir_schools_v37');
    if (saved) { 
      // ترحيل البيانات القديمة إذا كانت تستخدم المسمى الطويل
      const parsed = JSON.parse(saved).map((inst: any) => ({
        ...inst,
        cycle: inst.cycle === 'التعليم الابتدائي' ? SchoolCycle.PRIMARY : inst.cycle
      }));
      setSchools(parsed); 
    } 
    else { setSchools(MOCK_SCHOOLS); localStorage.setItem('dir_schools_v37', JSON.stringify(MOCK_SCHOOLS)); }
  }, []);

  const saveToStorage = (list: Institution[]) => {
    setSchools(list);
    localStorage.setItem('dir_schools_v37', JSON.stringify(list));
  };

  const handleExportAllData = () => {
    if (!isAdminOverride) return;
    setIsExporting(true);
    
    try {
      const exportRows: any[] = [];
      
      schools.forEach(school => {
        exportRows.push({
          'المؤسسة': school.name,
          'الرمز': school.gresa,
          'السلك': school.cycle,
          'الجماعة': school.commune,
          'مدير(ة) المؤسسة': school.principal,
          'هاتف المؤسسة': school.phone,
          'البريد الإلكتروني': school.email,
          'نوع الوحدة': 'مركزية',
          'اسم الوحدة': 'الإدارة',
          'اسم الموظف': school.principal,
          'المهمة': 'مدير(ة) المؤسسة',
          'هاتف الموظف': school.phone
        });

        (school.staff || []).forEach(st => {
          exportRows.push({
            'المؤسسة': school.name,
            'الرمز': school.gresa,
            'السلك': school.cycle,
            'الجماعة': school.commune,
            'مدير(ة) المؤسسة': school.principal,
            'هاتف المؤسسة': school.phone,
            'البريد الإلكتروني': school.email,
            'نوع الوحدة': 'مركزية',
            'اسم الوحدة': 'المركزية',
            'اسم الموظف': st.name,
            'المهمة': st.role,
            'هاتف الموظف': st.phone
          });
        });

        (school.subUnits || []).forEach(unit => {
          (unit.staff || []).forEach(st => {
            exportRows.push({
              'المؤسسة': school.name,
              'الرمز': school.gresa,
              'السلك': school.cycle,
              'الجماعة': school.commune,
              'مدير(ة) المؤسسة': school.principal,
              'هاتف المؤسسة': school.phone,
              'البريد الإلكتروني': school.email,
              'نوع الوحدة': 'فرعية',
              'اسم الوحدة': unit.name,
              'اسم الموظف': st.name,
              'المهمة': st.role,
              'هاتف الموظف': st.phone
            });
          });
        });
      });

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "بيانات المؤسسات");
      const wscols = [
        {wch: 25}, {wch: 15}, {wch: 20}, {wch: 20}, {wch: 25}, 
        {wch: 15}, {wch: 25}, {wch: 15}, {wch: 25}, {wch: 25}, {wch: 20}, {wch: 15}
      ];
      worksheet['!cols'] = wscols;
      XLSX.writeFile(workbook, `دليل_مؤسسات_الحوز_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      alert('حدث خطأ أثناء التصدير');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdminOverride) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const currentSchools = [...schools];
        jsonData.forEach((row, index) => {
          const name = row['الاسم'] || row['المؤسسة'] || row['Name'];
          const gresa = String(row['الرمز'] || row['GRESA'] || '');
          const cycleStr = row['السلك'] || row['Cycle'];
          const commune = row['الجماعة'] || row['Commune'] || INITIAL_COMMUNES[0];
          const principal = row['مدير(ة) المؤسسة'] || row['مدير المؤسسة'] || row['المدير'] || row['Principal'] || 'غير مسجل';
          const phone = String(row['الهاتف'] || row['Phone'] || '');
          const email = row['البريد'] || row['Email'] || '';
          
          if (!name || !gresa) return;

          let cycle = SchoolCycle.PRIMARY;
          if (cycleStr?.includes('إعدادي')) cycle = SchoolCycle.PREPARATORY;
          if (cycleStr?.includes('تأهيلي')) cycle = SchoolCycle.SECONDARY;

          currentSchools.push({
            id: `sch-${Date.now()}-${index}`,
            name, gresa, cycle, commune, principal, phone, email,
            address: commune, isGroup: false, subUnits: [], staff: []
          });
        });

        if (confirm(`تم استخراج ${jsonData.length} مؤسسة. حفظ؟`)) saveToStorage(currentSchools);
      } catch (error) { alert('خطأ في معالجة الملف'); } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleShareInstitution = (inst: Institution, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `📌 مؤسسة: ${inst.name}\n📍 الجماعة: ${inst.commune}\n👤 مدير(ة) المؤسسة: ${inst.principal}\n📞 الهاتف: ${inst.phone}\n📧 البريد: ${inst.email}\n🆔 الرمز: ${inst.gresa}`;
    if (navigator.share) { navigator.share({ title: inst.name, text: shareText }).catch(console.error); } 
    else { navigator.clipboard.writeText(shareText); alert('تم النسخ!'); }
  };

  const handleShareSubUnit = (unit: SubUnit, parentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `📌 وحدة مدرسية: ${unit.name}\n🏫 تابعة لـ: ${parentName}\n🆔 الرمز: ${unit.gresa}`;
    if (navigator.share) { navigator.share({ title: unit.name, text: shareText }).catch(console.error); } 
    else { navigator.clipboard.writeText(shareText); alert('تم نسخ بيانات الفرعية!'); }
  };

  const handleSaveSchool = () => {
    if (!isAdminOverride || !formData.name || !formData.gresa) {
      alert('المرجو تعبئة الاسم ورمز المؤسسة');
      return;
    }
    let updated: Institution[];
    const payload = { ...formData, subUnits: formData.subUnits || [], staff: formData.staff || [] };
    if (formData.id) { 
      updated = schools.map(s => s.id === formData.id ? { ...s, ...payload } as Institution : s); 
    } else { 
      updated = [...schools, { ...payload, id: `sch-${Date.now()}` } as Institution]; 
    }
    saveToStorage(updated);
    setShowSchoolModal(false);
    setSelectedSchool(null);
    setFormData({ name: '', gresa: '', cycle: SchoolCycle.PRIMARY, commune: INITIAL_COMMUNES[0], principal: '', phone: '', email: '', address: '', isGroup: false, subUnits: [], staff: [] });
  };

  const handleEditSchool = (school: Institution, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdminOverride) return;
    setFormData(school);
    setShowSchoolModal(true);
  };

  const handleDeleteSchool = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdminOverride) return;
    if (confirm('هل أنت متأكد من حذف هذه المؤسسة نهائياً؟')) {
      const updated = schools.filter(s => s.id !== id);
      saveToStorage(updated);
    }
  };

  const handleSaveStaff = () => {
    if (!isAdminOverride || !staffFormData.name || !selectedSchool) return;
    
    const newStaff: Employee = { 
      id: `st-${Date.now()}`, 
      name: staffFormData.name!, 
      role: staffFormData.role!, 
      phone: staffFormData.phone!, 
      office: staffFormData.office!, 
      department: targetSubUnitId ? "وحدة مدرسية" : selectedSchool.name, 
      status: 'online', 
      email: '' 
    };

    const updatedSchools = schools.map(s => {
      if (s.id === selectedSchool.id) {
        let updatedObj = { ...s };
        if (targetSubUnitId) {
          updatedObj.subUnits = (s.subUnits || []).map(u => u.id === targetSubUnitId ? { ...u, staff: [...(u.staff || []), newStaff] } : u);
        } else {
          updatedObj.staff = [...(s.staff || []), newStaff];
        }
        setSelectedSchool(updatedObj);
        return updatedObj;
      }
      return s;
    });

    saveToStorage(updatedSchools);
    setShowStaffModal(false);
    setTargetSubUnitId(null);
    setStaffFormData({ name: '', role: 'أستاذ(ة)', phone: '', office: 'المركزية' });
  };

  // Corrected: replaced 'u' with 's' in the else block because 'u' is only defined within the map scope above.
  const handleDeleteStaff = (staffId: string, subUnitId: string | null = null) => {
    if (!isAdminOverride || !selectedSchool || !confirm('حذف الإطار؟')) return;
    const updatedSchools = schools.map(s => {
      if (s.id === selectedSchool.id) {
        let updatedObj = { ...s };
        if (subUnitId) {
          updatedObj.subUnits = (s.subUnits || []).map(u => u.id === subUnitId ? { ...u, staff: (u.staff || []).filter(st => st.id !== staffId) } : u);
        } else {
          updatedObj.staff = (s.staff || []).filter(st => st.id !== staffId);
        }
        setSelectedSchool(updatedObj);
        return updatedObj;
      }
      return s;
    });
    saveToStorage(updatedSchools);
  };

  const handleSaveQuickSubUnit = () => {
    if (!isAdminOverride || !selectedSchool || !quickSubUnitForm.name || !quickSubUnitForm.gresa) return;

    const newUnit: SubUnit = {
      id: `su-${Date.now()}`,
      name: quickSubUnitForm.name,
      gresa: quickSubUnitForm.gresa,
      staff: []
    };

    const updatedSchools = schools.map(s => {
      if (s.id === selectedSchool.id) {
        const updatedObj = { 
          ...s, 
          isGroup: true,
          subUnits: [...(s.subUnits || []), newUnit] 
        };
        setSelectedSchool(updatedObj);
        return updatedObj;
      }
      return s;
    });

    saveToStorage(updatedSchools);
    setShowSubUnitQuickModal(false);
    setQuickSubUnitForm({ name: '', gresa: '' });
  };

  const getStaffStats = (inst: Institution) => {
    let total = 1 + (inst.staff || []).length;
    (inst.subUnits || []).forEach(u => { total += (u.staff || []).length; });
    return total;
  };

  const groupedSchools = useMemo<Record<string, Institution[]>>(() => {
    const filtered = schools.filter(s => {
      const matchesCycle = activeCycle === 'الكل' || s.cycle === activeCycle;
      const matchesCommune = selectedCommune === 'الكل' || s.commune === selectedCommune;
      const lowerSearch = searchTerm.toLowerCase();
      // تم تعزيز منطق البحث ليشمل اسم المدير ورمز المؤسسة بوضوح
      return matchesCycle && matchesCommune && (
        s.name.toLowerCase().includes(lowerSearch) || 
        s.gresa.toLowerCase().includes(lowerSearch) || 
        s.principal.toLowerCase().includes(lowerSearch) || 
        s.phone.includes(lowerSearch) || 
        s.email?.toLowerCase().includes(lowerSearch)
      );
    });
    const groups: Record<string, Institution[]> = {};
    filtered.forEach(s => { if (!groups[s.commune]) groups[s.commune] = []; groups[s.commune].push(s); });
    return groups;
  }, [schools, activeCycle, selectedCommune, searchTerm]);

  const handleSaveSubUnit = () => {
    if (!newSubUnit.name || !newSubUnit.gresa) return;
    let updatedSubUnits = [...(formData.subUnits || [])];
    if (newSubUnit.id) {
      updatedSubUnits = updatedSubUnits.map(u => u.id === newSubUnit.id ? { ...u, name: newSubUnit.name, gresa: newSubUnit.gresa } : u);
    } else {
      updatedSubUnits.push({ ...newSubUnit, id: `su-${Date.now()}`, staff: [] });
    }
    setFormData({ ...formData, subUnits: updatedSubUnits });
    setNewSubUnit({ id: '', name: '', gresa: '' });
  };

  const handleEditSubUnit = (unit: SubUnit) => {
    setNewSubUnit({ id: unit.id, name: unit.name, gresa: unit.gresa });
  };

  const handleDeleteSubUnit = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الفرعية؟')) {
      const updatedSubUnits = (formData.subUnits || []).filter(u => u.id !== id);
      setFormData({ ...formData, subUnits: updatedSubUnits });
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50 font-['Cairo'] pb-32 text-right" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-[60]">
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
              <Landmark size={24} />
            </div>
            <div>
              <h1 className="text-[14px] font-black text-slate-900 leading-tight">دليل المؤسسات</h1>
              <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest mt-1">الخريطة التربوية للحوز</p>
            </div>
          </div>
          <div className="flex gap-2">
            {isAdminOverride && (
              <>
                <button 
                  onClick={handleExportAllData} 
                  disabled={isExporting}
                  title="تصدير كافة البيانات (Excel)"
                  className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-sm active:scale-90 transition-all disabled:opacity-50"
                >
                  {isExporting ? <Loader2 size={18} className="animate-spin" /> : <DownloadCloud size={18} />}
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shadow-sm active:scale-90 transition-all">
                  {isImporting ? <Loader2 size={18} className="animate-spin" /> : <FileSpreadsheet size={18} />}
                  <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleImportExcel} />
                </button>
                <button onClick={() => setIsAdminMode(!isAdminMode)} className={`p-2.5 rounded-xl transition-all shadow-sm ${isAdminMode ? 'bg-orange-600 text-white shadow-md' : 'bg-slate-50 text-slate-500'}`}>
                  <Settings size={18} />
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="px-5 pb-4 space-y-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
            {['الكل', SchoolCycle.PRIMARY, SchoolCycle.PREPARATORY, SchoolCycle.SECONDARY].map((cycle) => {
              const styles = cycle !== 'الكل' ? getCycleStyles(cycle as SchoolCycle) : null;
              return (
                <button 
                  key={cycle} 
                  onClick={() => setActiveCycle(cycle as any)} 
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black whitespace-nowrap transition-all border ${
                    activeCycle === cycle 
                    ? (styles ? `${styles.bg} ${styles.text} border-${styles.color}-600 shadow-lg shadow-${styles.color}-100` : 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100')
                    : 'bg-white text-slate-400 border-slate-100'
                  }`}
                >
                  {cycle}
                </button>
              );
            })}
          </div>
          <div className="relative">
             <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" size={14} />
             <select value={selectedCommune} onChange={(e) => setSelectedCommune(e.target.value)} className="w-full py-3.5 pr-10 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-900 outline-none appearance-none cursor-pointer shadow-inner">
                <option value="الكل">تصفية حسب الجماعة الإقليمية ({INITIAL_COMMUNES.length} جماعة)</option>
                {INITIAL_COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
             <ChevronDown size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        <div className="relative group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
          <input type="text" placeholder="ابحث باسم المؤسسة، الرمز، المدير(ة) أو الهاتف..." className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-[2rem] text-[11px] font-bold text-slate-900 outline-none shadow-sm focus:ring-4 focus:ring-emerald-500/5 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {(Object.entries(groupedSchools) as [string, Institution[]][]).map(([commune, list]) => (
          <div key={commune} className="space-y-4">
            <div className="flex items-center gap-3 pr-2">
              <div className="w-2 h-5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
              <h2 className="text-[12px] font-black text-slate-900">{commune}</h2>
              <span className="h-px flex-1 bg-slate-100"></span>
            </div>
            <div className="grid gap-4">
              {list.map((school) => {
                const totalStaff = getStaffStats(school);
                const cycleStyles = getCycleStyles(school.cycle);
                const CycleIcon = cycleStyles.icon;

                return (
                  <div key={school.id} onClick={() => { setSelectedSchool(school); setActiveDetailTab('INFO'); }} className={`bg-white rounded-[2.2rem] border border-slate-50 shadow-sm p-5 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all relative overflow-hidden group hover:border-${cycleStyles.color}-200`}>
                    <div className={`absolute top-0 right-0 w-1.5 h-full ${cycleStyles.accent}`}></div>
                    
                    <div className={`w-14 h-14 ${cycleStyles.bg} rounded-2xl flex items-center justify-center ${cycleStyles.text} shrink-0 border ${cycleStyles.border} group-hover:scale-110 transition-transform`}>
                      <CycleIcon size={24} />
                    </div>
                    
                    <div className="flex-1 min-w-0 text-right">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="font-black text-slate-900 text-[11px] truncate">{school.name}</h3>
                        <div className="flex gap-1.5 z-10" onClick={(e) => e.stopPropagation()}>
                          <button onClick={(e) => handleShareInstitution(school, e)} className={`p-1.5 ${cycleStyles.text} ${cycleStyles.bg} rounded-lg hover:bg-${cycleStyles.color}-600 hover:text-white transition-all shadow-sm`}><Share2 size={12}/></button>
                          {isAdminOverride && isAdminMode && (
                            <>
                              <button onClick={(e) => handleEditSchool(school, e)} className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit2 size={12}/></button>
                              <button onClick={(e) => handleDeleteSchool(school.id, e)} className="p-1.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 size={12}/></button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1 mb-2">
                        <div className="flex items-center gap-1.5">
                           <Phone size={10} className={cycleStyles.text} />
                           <span className="text-[10px] font-black text-slate-600" dir="ltr">{school.phone}</span>
                        </div>
                        {school.email && (
                          <div className="flex items-center gap-1.5">
                             <Mail size={10} className="text-blue-400" />
                             <span className="text-[9px] font-black text-slate-400 truncate max-w-[150px]">{school.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                           <User size={10} className="text-slate-400" />
                           <span className="text-[9px] font-black text-slate-500 truncate">{school.principal}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 flex items-center gap-1.5"><Fingerprint size={10}/> {school.gresa}</span>
                        <span className={`text-[9px] font-black ${cycleStyles.text} ${cycleStyles.bg} px-2 py-0.5 rounded-lg border ${cycleStyles.border} flex items-center gap-1`}><Users2 size={10} /> {totalStaff} إطار</span>
                      </div>
                    </div>
                    <ChevronLeft size={20} className="text-slate-200 group-hover:text-slate-400 transition-all" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {isAdminOverride && isAdminMode && (
        <button onClick={() => { setFormData({ name: '', gresa: '', cycle: SchoolCycle.PRIMARY, commune: INITIAL_COMMUNES[0], principal: '', phone: '', email: '', address: '', isGroup: false, subUnits: [], staff: [] }); setShowSchoolModal(true); }} className="fixed bottom-28 left-6 w-16 h-16 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center z-[70] border-4 border-white active:scale-90 transition-all hover:scale-110 shadow-emerald-200">
          <Plus size={28} />
        </button>
      )}

      {/* Modal إضافة/تعديل المؤسسة */}
      {showSchoolModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[150] flex items-center justify-center p-5">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl relative animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto text-right border border-white/20">
            <button onClick={() => setShowSchoolModal(false)} className="absolute top-8 left-8 p-2 bg-slate-100 text-slate-400 rounded-full hover:bg-red-500 hover:text-white transition-all"><X size={20}/></button>
            <h2 className="text-[16px] font-black text-slate-900 mb-8 flex items-center gap-3">
              <PlusCircle className="text-emerald-600" size={24} />
              {formData.id ? 'تعديل بيانات المؤسسة' : 'إضافة مؤسسة جديدة'}
            </h2>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 mr-2 flex items-center gap-2"><School size={12}/> اسم المؤسسة</label>
                <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-[12px] font-black text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="مثال: م.م تحناوت المركزية" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 mr-2 flex items-center gap-2"><Fingerprint size={12}/> الرمز GRESA</label>
                  <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 text-[11px] font-black text-slate-900 outline-none shadow-inner" value={formData.gresa} onChange={(e) => setFormData({...formData, gresa: e.target.value})} placeholder="04XXXXX" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 mr-2 flex items-center gap-2"><Layers size={12}/> السلك</label>
                  <select className={`w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-2 text-[10px] font-black text-slate-900 outline-none`} value={formData.cycle} onChange={(e) => setFormData({...formData, cycle: e.target.value as SchoolCycle})}>
                    {Object.values(SchoolCycle).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 mr-2 flex items-center gap-2"><MapPin size={12}/> الجماعة الترابية</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-[11px] font-black text-slate-900 outline-none" value={formData.commune} onChange={(e) => setFormData({...formData, commune: e.target.value})}>
                  {INITIAL_COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 mr-2 flex items-center gap-2"><User size={12}/> اسم مدير(ة) المؤسسة المسوؤل(ة)</label>
                <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-[12px] font-black text-slate-900 outline-none shadow-inner" value={formData.principal} onChange={(e) => setFormData({...formData, principal: e.target.value})} placeholder="الاسم الكامل لمدير(ة) المؤسسة" />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 mr-2 flex items-center gap-2"><Phone size={12}/> رقم الهاتف</label>
                  <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-[12px] font-black text-slate-900 outline-none shadow-inner" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="06XXXXXXXX" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 mr-2 flex items-center gap-2"><Mail size={12}/> البريد الإلكتروني</label>
                  <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-[12px] font-black text-slate-900 outline-none shadow-inner" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="school@men.gov.ma" dir="ltr" />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <input type="checkbox" id="isGroup" checked={formData.isGroup} onChange={(e) => setFormData({...formData, isGroup: e.target.checked})} className="w-5 h-5 rounded-lg accent-emerald-600" />
                <label htmlFor="isGroup" className="text-[11px] font-black text-emerald-800">مجموعة مدارس (تحتوي فرعيات)</label>
              </div>

              {formData.isGroup && (
                <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-[2rem] space-y-4">
                  <h3 className="text-[11px] font-black text-emerald-800 mb-2">إدارة الوحدات المدرسية (الفرعيات)</h3>
                  
                  <div className="space-y-3">
                    <input className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-[10px] font-black" placeholder="اسم الفرعية" value={newSubUnit.name} onChange={(e) => setNewSubUnit({...newSubUnit, name: e.target.value})} />
                    <div className="flex gap-2">
                      <input className="flex-1 bg-white border border-slate-200 rounded-xl py-3 px-4 text-[10px] font-black" placeholder="رمز GRESA الفرعية" value={newSubUnit.gresa} onChange={(e) => setNewSubUnit({...newSubUnit, gresa: e.target.value})} />
                      <button onClick={handleSaveSubUnit} className="bg-emerald-600 text-white p-3 rounded-xl shadow-lg active:scale-90 transition-all">
                        {newSubUnit.id ? <Save size={18} /> : <Plus size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4 max-h-40 overflow-y-auto pr-1">
                    {(formData.subUnits || []).map(unit => (
                      <div key={unit.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-700">{unit.name}</span>
                          <span className="text-[8px] font-bold text-slate-400">{unit.gresa}</span>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => handleEditSubUnit(unit)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={12}/></button>
                          <button onClick={() => handleDeleteSubUnit(unit.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={12}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={handleSaveSchool} className="w-full py-5 bg-gradient-to-r from-emerald-700 to-teal-600 text-white rounded-[1.5rem] text-[13px] font-black shadow-xl shadow-emerald-100 active:scale-95 transition-all mt-6 flex items-center justify-center gap-3">
                <Check size={22} /> {formData.id ? 'حفظ التعديلات' : 'إضافة المؤسسة الآن'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تفاصيل المؤسسة */}
      {selectedSchool && !showSchoolModal && (() => {
        const cycleStyles = getCycleStyles(selectedSchool.cycle);
        const CycleIcon = cycleStyles.icon;

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={() => setSelectedSchool(null)}>
            <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl relative p-0 text-right overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
              <div className={`bg-gradient-to-tr ${cycleStyles.gradient} p-8 pt-10 text-white relative`}>
                <button onClick={() => setSelectedSchool(null)} className="absolute top-6 left-6 p-2 bg-white/20 rounded-full text-white hover:bg-white/40 transition-all"><X size={20} /></button>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/30 shadow-xl">
                    <CycleIcon size={32} />
                  </div>
                  <h3 className="text-[14px] font-black text-center mb-1 leading-tight">{selectedSchool.name}</h3>
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] font-bold opacity-80 flex items-center gap-2"><Fingerprint size={12}/> {selectedSchool.gresa}</p>
                    <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                    <p className="text-[10px] font-bold opacity-80">{selectedSchool.cycle}</p>
                  </div>
                </div>
              </div>

              <div className="flex border-b border-slate-100 bg-slate-50/50">
                <button onClick={() => setActiveDetailTab('INFO')} className={`flex-1 py-4 text-[10px] font-black transition-all ${activeDetailTab === 'INFO' ? `${cycleStyles.text} border-b-4 border-${cycleStyles.color}-600 bg-white` : 'text-slate-400'}`}>المعلومات</button>
                <button onClick={() => setActiveDetailTab('UNITS')} className={`flex-1 py-4 text-[10px] font-black transition-all ${activeDetailTab === 'UNITS' ? `${cycleStyles.text} border-b-4 border-${cycleStyles.color}-600 bg-white` : 'text-slate-400'}`}>الوحدات</button>
                <button onClick={() => setActiveDetailTab('STAFF')} className={`flex-1 py-4 text-[10px] font-black transition-all ${activeDetailTab === 'STAFF' ? `${cycleStyles.text} border-b-4 border-${cycleStyles.color}-600 bg-white` : 'text-slate-400'}`}>المركزية</button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                {activeDetailTab === 'INFO' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                      <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center ${cycleStyles.text} shadow-sm`}><User size={20}/></div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 mb-0.5">مدير(ة) المؤسسة المسوؤل(ة)</p>
                        <p className="text-[11px] font-black text-slate-800">{selectedSchool.principal}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                      <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center ${cycleStyles.text} shadow-sm`}><Smartphone size={20}/></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[8px] font-black text-slate-400 mb-0.5">رقم هاتف المؤسسة</p>
                        <p className="text-[11px] font-black text-slate-800" dir="ltr">{selectedSchool.phone}</p>
                      </div>
                    </div>
                    {selectedSchool.email && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                        <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center ${cycleStyles.text} shadow-sm`}><Mail size={20}/></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[8px] font-black text-slate-400 mb-0.5">البريد الإلكتروني</p>
                          <a href={`mailto:${selectedSchool.email}`} className="text-[10px] font-black text-blue-600 truncate block" dir="ltr">{selectedSchool.email}</a>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <a href={`tel:${selectedSchool.phone}`} className={`flex items-center justify-center gap-2 py-4 bg-${cycleStyles.color}-600 text-white rounded-2xl text-[11px] font-black shadow-lg shadow-${cycleStyles.color}-50 active:scale-95 transition-all hover:bg-${cycleStyles.color}-700`}>
                        <Phone size={16}/> اتصال
                      </a>
                      <a href={`https://wa.me/212${selectedSchool.phone.replace(/^0/, '')}`} target="_blank" className="flex items-center justify-center gap-2 py-4 bg-green-600 text-white rounded-2xl text-[11px] font-black shadow-lg shadow-green-50 active:scale-95 transition-all hover:bg-green-700">
                        <MessageSquare size={16}/> واتساب
                      </a>
                    </div>
                  </div>
                )}

                {activeDetailTab === 'UNITS' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[10px] font-black text-slate-400">الوحدات المدرسية (الفرعيات)</h4>
                      {isAdminOverride && isAdminMode && (
                        <button 
                          onClick={() => { setQuickSubUnitForm({ name: '', gresa: '' }); setShowSubUnitQuickModal(true); }}
                          className={`flex items-center gap-2 px-3 py-1.5 bg-${cycleStyles.color}-600 text-white rounded-xl text-[9px] font-black shadow-lg shadow-${cycleStyles.color}-50 active:scale-95 transition-all hover:bg-${cycleStyles.color}-700`}
                        >
                          <Plus size={14} /> إضافة فرعية
                        </button>
                      )}
                    </div>
                    {selectedSchool.isGroup ? (
                      (selectedSchool.subUnits || []).length > 0 ? (
                        selectedSchool.subUnits?.map(unit => (
                          <div key={unit.id} className="bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col overflow-hidden transition-all mb-3 group/item">
                            <div 
                               className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50"
                               onClick={() => setExpandedUnitId(expandedUnitId === unit.id ? null : unit.id)}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 ${cycleStyles.bg} ${cycleStyles.text} rounded-xl flex items-center justify-center border ${cycleStyles.border}`}><Layers size={18}/></div>
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-black text-slate-800">{unit.name}</span>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase">{unit.gresa}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                 <button onClick={(e) => handleShareSubUnit(unit, selectedSchool.name, e)} className={`p-2 ${cycleStyles.text} ${cycleStyles.bg} rounded-lg hover:bg-${cycleStyles.color}-600 hover:text-white transition-all`}><Share2 size={12}/></button>
                                 {isAdminOverride && isAdminMode && (
                                   <button onClick={() => { setTargetSubUnitId(unit.id); setShowStaffModal(true); }} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><UserPlus size={12}/></button>
                                 )}
                                 <ChevronDown size={14} className={`text-slate-300 transition-transform ${expandedUnitId === unit.id ? 'rotate-180' : ''}`} />
                              </div>
                            </div>
                            
                            {expandedUnitId === unit.id && (
                              <div className="px-4 pb-4 bg-slate-50/50 animate-in slide-in-from-top-2 duration-300">
                                 <div className="h-px bg-slate-100 w-full mb-3"></div>
                                 <h5 className="text-[9px] font-black text-slate-400 mb-2 mr-1">أطر الفرعية:</h5>
                                 <div className="space-y-2">
                                    {(unit.staff || []).length > 0 ? (
                                      unit.staff?.map(st => (
                                        <div key={st.id} className="p-3 bg-white border border-slate-100 rounded-2xl shadow-xs flex items-center justify-between">
                                           <div className="flex items-center gap-2">
                                              <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><UserCheck size={14}/></div>
                                              <div className="flex flex-col">
                                                 <span className="text-[10px] font-black text-slate-800">{st.name}</span>
                                                 <span className="text-[8px] font-bold text-slate-400">{st.role}</span>
                                              </div>
                                           </div>
                                           <div className="flex gap-1.5">
                                              <a href={`tel:${st.phone}`} className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"><Phone size={10}/></a>
                                              {isAdminOverride && isAdminMode && (
                                                <button onClick={() => handleDeleteStaff(st.id, unit.id)} className="p-1.5 bg-red-50 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-colors"><Trash2 size={10}/></button>
                                              )}
                                           </div>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-[9px] text-slate-400 text-center py-2 font-bold">لا يوجد أطر مسجلين للفرعية</p>
                                    )}
                                 </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10">
                          <Layers size={40} className="mx-auto text-slate-100 mb-3" />
                          <p className="text-[10px] text-slate-400 font-bold">لم يتم تسجيل أي فرعيات بعد</p>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-10">
                        <CycleIcon size={40} className="mx-auto text-slate-100 mb-3" />
                        <p className="text-[10px] text-slate-400 font-bold">مؤسسة مستقلة (لا توجد فرعيات)</p>
                      </div>
                    )}
                  </div>
                )}

                {activeDetailTab === 'STAFF' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[10px] font-black text-slate-400">أطر المركزية</h4>
                      {isAdminOverride && isAdminMode && (
                        <button onClick={() => { setTargetSubUnitId(null); setShowStaffModal(true); }} className={`flex items-center gap-2 px-3 py-1.5 bg-${cycleStyles.color}-600 text-white rounded-xl text-[9px] font-black shadow-lg shadow-${cycleStyles.color}-50 active:scale-95 transition-all hover:bg-${cycleStyles.color}-700`}>
                          <Plus size={14} /> إضافة إطار
                        </button>
                      )}
                    </div>

                    {/* عرض بطاقة المدير أولاً */}
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm relative group overflow-hidden mb-2">
                      <div className="absolute top-0 right-0 w-1 h-full bg-blue-600"></div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><Crown size={20}/></div>
                           <div className="flex flex-col">
                             <h5 className="text-[11px] font-black text-slate-900">{selectedSchool.principal}</h5>
                             <span className="text-[8px] font-black text-blue-600 uppercase">مدير(ة) المؤسسة</span>
                           </div>
                        </div>
                        <span className="text-[7px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm"><Check size={8}/> إطار إداري</span>
                      </div>
                      <div className="flex justify-end mt-3 gap-2">
                        <a href={`tel:${selectedSchool.phone}`} className="p-1.5 bg-white text-blue-600 rounded-lg shadow-sm border border-blue-100 hover:bg-blue-600 hover:text-white transition-all"><Phone size={12}/></a>
                        <a href={`https://wa.me/212${selectedSchool.phone.replace(/^0/, '')}`} target="_blank" className="p-1.5 bg-green-50 text-green-600 rounded-lg shadow-sm border border-green-100 hover:bg-green-600 hover:text-white transition-all"><MessageSquare size={12}/></a>
                      </div>
                    </div>

                    {/* عرض باقي أطر المركزية */}
                    {(selectedSchool.staff || []).length > 0 ? (
                      (selectedSchool.staff || []).map(st => (
                        <div key={st.id} className="p-4 bg-white border border-slate-50 rounded-2xl shadow-sm relative group overflow-hidden">
                          <div className={`absolute top-0 right-0 w-1 h-full ${cycleStyles.accent}`}></div>
                          <div className="flex items-center justify-between">
                            <h5 className="text-[11px] font-black text-slate-900">{st.name}</h5>
                            {isAdminOverride && isAdminMode && (
                              <button onClick={() => handleDeleteStaff(st.id)} className="text-red-400 hover:text-red-600 p-1.5 transition-colors"><Trash2 size={14}/></button>
                            )}
                          </div>
                          <p className="text-[9px] font-bold text-slate-500 mt-1">{st.role}</p>
                          <div className="flex justify-end mt-3 gap-2">
                            <a href={`tel:${st.phone}`} className="p-1.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors shadow-sm"><Phone size={12}/></a>
                            <a href={`https://wa.me/212${st.phone.replace(/^0/, '')}`} target="_blank" className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-colors shadow-sm"><MessageSquare size={12}/></a>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-[9px] text-slate-400 font-bold italic">لا يوجد أطر إضافيين بالمركزية</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* نافذة إضافة إطار (موحدة للمركزية والفرعيات) */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[250] flex items-center justify-center p-5">
           <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl relative animate-in zoom-in duration-300 text-right border border-white/20">
              <button onClick={() => setShowStaffModal(false)} className="absolute top-8 left-8 p-2 bg-slate-100 text-slate-400 rounded-full hover:bg-red-500 hover:text-white transition-all"><X size={20}/></button>
              <h2 className="text-[16px] font-black text-slate-900 mb-2 flex items-center gap-3"><UserPlus size={24} className="text-emerald-600" /> إضافة إطار تربوي</h2>
              <p className="text-[9px] text-blue-600 font-bold mb-8">{targetSubUnitId ? "إضافة إطار للوحدة المدرسية المحددة" : "إضافة إطار للمدرسة المركزية"}</p>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 mr-2">الاسم الكامل</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-[12px] font-black text-slate-900 outline-none" value={staffFormData.name} onChange={(e) => setStaffFormData({...staffFormData, name: e.target.value})} placeholder="الاسم والعائلة" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 mr-2">المهمة</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-[12px] font-black text-slate-900 outline-none" value={staffFormData.role} onChange={(e) => setStaffFormData({...staffFormData, role: e.target.value})} placeholder="أستاذ(ة)، حارس(ة) عام(ة)، مقتصد(ة)..." />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 mr-2">رقم الهاتف</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-[12px] font-black text-slate-900 outline-none" value={staffFormData.phone} onChange={(e) => setStaffFormData({...staffFormData, phone: e.target.value})} placeholder="06XXXXXXXX" />
                 </div>
                 <button onClick={handleSaveStaff} className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] text-[13px] font-black shadow-xl active:scale-95 transition-all mt-6 flex items-center justify-center gap-3 shadow-emerald-100">
                    <Check size={20} /> تسجيل الإطار بالمؤسسة
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* نافذة إضافة وحدة مدرسية (فرعية) سريعة */}
      {showSubUnitQuickModal && selectedSchool && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[250] flex items-center justify-center p-5">
           <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl relative animate-in zoom-in duration-300 text-right border border-white/20">
              <button onClick={() => setShowSubUnitQuickModal(false)} className="absolute top-8 left-8 p-2 bg-slate-100 text-slate-400 rounded-full hover:bg-red-500 hover:text-white transition-all"><X size={20}/></button>
              <h2 className="text-[16px] font-black text-slate-900 mb-2 flex items-center gap-3"><PlusSquare size={24} className="text-blue-600" /> إضافة وحدة مدرسية</h2>
              <p className="text-[9px] text-blue-600 font-bold mb-8">ربط فرعية جديدة بـ: {selectedSchool.name}</p>
              <div className="space-y-5">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 mr-2">اسم الفرعية / الوحدة</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-[12px] font-black text-slate-900 outline-none shadow-inner" value={quickSubUnitForm.name} onChange={(e) => setQuickSubUnitForm({...quickSubUnitForm, name: e.target.value})} placeholder="مثال: فرعية تيزي نتاست" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 mr-2">الرمز (GRESA الفرعية)</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-[12px] font-black text-slate-900 outline-none shadow-inner" value={quickSubUnitForm.gresa} onChange={(e) => setQuickSubUnitForm({...quickSubUnitForm, gresa: e.target.value})} placeholder="04XXXXX-Y" />
                 </div>
                 <button onClick={handleSaveQuickSubUnit} className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] text-[13px] font-black shadow-xl active:scale-95 transition-all mt-6 flex items-center justify-center gap-3">
                    <Check size={20} /> تسجيل الوحدة المدرسية
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SchoolsDirectory;
