
import React, { useState, useEffect } from 'react';
import { Employee, DirectoryView, SchoolCycle, Institution } from '../types';
import { 
  Search, Phone, MessageSquare, ChevronDown, ChevronLeft, 
  Building2, User, MapPin, School, GraduationCap, Library, Map,
  Plus, Edit2, Trash2, X, Settings, Check, Users, Briefcase, Mail, Share2
} from 'lucide-react';

interface OfficeGroup { id: string; name: string; employees: Employee[]; }
interface Department { id: string; name: string; offices: OfficeGroup[]; }

const INITIAL_STAFF: Department[] = [
  {
    id: 'dept_1',
    name: 'مصلحة الموارد البشرية والتدبير',
    offices: [
      { 
        id: 'off_1', 
        name: 'مكتب الوضعيات الإدارية', 
        employees: [
          { id: 'emp_1', name: 'ياسين الفاضلي', role: 'رئيس المصلحة', department: 'الموارد البشرية', office: 'المكتب الرئيسي', phone: '0661223344', email: 'y.fadili@men.gov.ma', status: 'online', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200' },
          { id: 'emp_2', name: 'سميرة الناجي', role: 'متصرفة إدارية', department: 'الموارد البشرية', office: 'مكتب الوضعيات', phone: '0661556677', email: 's.naji@men.gov.ma', status: 'online', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200' }
        ] 
      },
      { 
        id: 'off_2', 
        name: 'مكتب المنازعات والتقاعد', 
        employees: [
          { id: 'emp_3', name: 'عمر الصمدي', role: 'تقني متخصص', department: 'الموارد البشرية', office: 'مكتب المنازعات', phone: '0661998877', email: 'o.samadi@men.gov.ma', status: 'away' }
        ] 
      }
    ]
  },
  {
    id: 'dept_2',
    name: 'مصلحة الشؤون التربوية',
    offices: [
      { 
        id: 'off_3', 
        name: 'مكتب الخريطة المدرسية', 
        employees: [
          { id: 'emp_4', name: 'سارة مرابط', role: 'رئيسة المصلحة', department: 'الشؤون التربوية', office: 'الخريطة المدرسية', phone: '0662112233', email: 's.mrabet@men.gov.ma', status: 'online', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200' }
        ] 
      }
    ]
  }
];

const INITIAL_SCHOOLS: Institution[] = [
  { id: 's1', name: 'مدرسة تحناوت الابتدائية', gresa: '04523T', cycle: SchoolCycle.PRIMARY, commune: 'تحناوت', principal: 'محمد السعدي', phone: '0524112233', address: 'تحناوت المركز', email: 'prim.tah@alhaouz.ma' },
  { id: 's2', name: 'ثانوية توبقال الإعدادية', gresa: '04882R', cycle: SchoolCycle.PREPARATORY, commune: 'تحناوت', principal: 'ليلى بناني', phone: '0524445566', address: 'تحناوت', email: 'prep.toub@alhaouz.ma' },
  { id: 's4', name: 'مدرسة أوريكا المركزية', gresa: '04112B', cycle: SchoolCycle.PRIMARY, commune: 'أوريكا', principal: 'فاطمة الزهراء', phone: '0524001122', address: 'مركز أوريكا', email: 'prim.our@alhaouz.ma' },
];

const INITIAL_COMMUNES = ['تحناوت', 'أوريكا', 'أيت أورير', 'أمزميز', 'أسني', 'ستي فاظمة', 'تمصلوحت', 'أغواطيم'];

const Directory: React.FC = () => {
  const [currentView, setCurrentView] = useState<DirectoryView>(DirectoryView.STAFF);
  const [activeCycle, setActiveCycle] = useState<SchoolCycle | 'الكل'>('الكل');
  const [activeCommune, setActiveCommune] = useState<string>('الكل');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [schools, setSchools] = useState<Institution[]>([]);
  const [communes, setCommunes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showCommuneModal, setShowCommuneModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState<Institution | null>(null);
  const [newCommuneName, setNewCommuneName] = useState('');
  const [formData, setFormData] = useState<Partial<Institution>>({
    name: '', cycle: SchoolCycle.PRIMARY, commune: '', principal: '', phone: '', address: '', gresa: ''
  });

  useEffect(() => {
    const savedStaff = localStorage.getItem('dir_staff');
    const savedSchools = localStorage.getItem('dir_schools');
    const savedCommunes = localStorage.getItem('dir_communes');
    
    setDepartments(savedStaff ? JSON.parse(savedStaff) : INITIAL_STAFF);
    setSchools(savedSchools ? JSON.parse(savedSchools) : INITIAL_SCHOOLS);
    setCommunes(savedCommunes ? JSON.parse(savedCommunes) : INITIAL_COMMUNES);
  }, []);

  const saveSchoolsData = (updatedSchools: Institution[], updatedCommunes: string[]) => {
    localStorage.setItem('dir_schools', JSON.stringify(updatedSchools));
    localStorage.setItem('dir_communes', JSON.stringify(updatedCommunes));
  };

  const handleShareEmployee = (emp: Employee, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `📌 بطاقة موظف بمديرية الحوز:\n👤 الاسم: ${emp.name}\n💼 المهمة: ${emp.role}\n🏢 المصلحة: ${emp.department}\n📍 المكتب: ${emp.office}\n📞 الهاتف: ${emp.phone}\n📧 البريد: ${emp.email}`;
    
    if (navigator.share) {
      navigator.share({
        title: `بيانات ${emp.name}`,
        text: shareText,
      }).catch(err => console.error('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(shareText);
      alert('تم نسخ بيانات الموظف بنجاح!');
    }
  };

  const toggleDept = (id: string) => setExpandedDept(expandedDept === id ? null : id);

  const filteredStaff = departments.map(dept => ({
    ...dept,
    offices: dept.offices.map(office => ({
      ...office,
      employees: office.employees.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        emp.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(off => off.employees.length > 0)
  })).filter(dept => dept.offices.length > 0);

  const filteredSchools = schools.filter(s => {
    const matchesCycle = activeCycle === 'الكل' || s.cycle === activeCycle;
    const matchesCommune = activeCommune === 'الكل' || s.commune === activeCommune;
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.principal.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.commune.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCycle && matchesCommune && matchesSearch;
  });

  const handleSaveSchool = () => {
    if (!formData.name || !formData.commune) return;
    const updated = editingSchool 
      ? schools.map(s => s.id === editingSchool.id ? { ...s, ...formData } as Institution : s)
      : [...schools, { id: Date.now().toString(), ...formData as Institution, email: '' }];
    
    setSchools(updated);
    saveSchoolsData(updated, communes);
    setShowSchoolModal(false);
    setEditingSchool(null);
  };

  const handleDeleteSchool = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المؤسسة؟')) {
      const updated = schools.filter(s => s.id !== id);
      setSchools(updated);
      saveSchoolsData(updated, communes);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24 font-['Cairo'] relative text-right" dir="rtl">
      <div className="bg-white px-6 pt-10 pb-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              {currentView === DirectoryView.STAFF ? <Users size={24} /> : <School size={24} />}
            </div>
            <div>
              <h1 className="text-base font-black text-slate-800 leading-none">مديرية الحوز</h1>
              <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase tracking-wider">
                {currentView === DirectoryView.STAFF ? 'دليل المصالح والأطر الإدارية' : 'دليل المؤسسات والجماعات'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`p-2.5 rounded-xl transition-all ${isAdminMode ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}
          >
            <Settings size={20} />
          </button>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl mt-6 relative z-10">
          <button 
            onClick={() => setCurrentView(DirectoryView.STAFF)}
            className={`flex-1 py-2 text-[11px] font-black rounded-lg transition-all flex items-center justify-center gap-2 ${currentView === DirectoryView.STAFF ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
             الأطر الإدارية
          </button>
          <button 
            onClick={() => setCurrentView(DirectoryView.SCHOOLS)}
            className={`flex-1 py-2 text-[11px] font-black rounded-lg transition-all flex items-center justify-center gap-2 ${currentView === DirectoryView.SCHOOLS ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
             المؤسسات التعليمية
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={currentView === DirectoryView.STAFF ? "بحث في الموظفين والمصالح..." : "بحث في المؤسسات والمديرين والجماعات..."}
            className="w-full pr-12 pl-4 py-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {currentView === DirectoryView.STAFF ? (
          <div className="space-y-4">
            {filteredStaff.map((dept) => (
              <div key={dept.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <button 
                  onClick={() => toggleDept(dept.id)}
                  className={`w-full flex items-center justify-between p-4 text-right transition-colors ${expandedDept === dept.id ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${expandedDept === dept.id ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                      <Briefcase size={20} />
                    </div>
                    <span className="font-black text-slate-700 text-xs">{dept.name}</span>
                  </div>
                  {expandedDept === dept.id ? <ChevronDown size={18} className="text-blue-600" /> : <ChevronLeft size={18} className="text-slate-300" />}
                </button>
                
                {expandedDept === dept.id && (
                  <div className="p-4 bg-slate-50/30 border-t border-slate-50 space-y-6">
                    {dept.offices.map(office => (
                      <div key={office.id} className="space-y-3">
                        <div className="flex items-center gap-2 pr-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{office.name}</span>
                        </div>
                        <div className="grid gap-2">
                          {office.employees.map(emp => (
                            <div key={emp.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow p-4 flex items-center gap-4">
                              <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 relative flex-shrink-0 shadow-inner overflow-hidden">
                                {emp.image ? (
                                  <img src={emp.image} alt={emp.name} className="w-full h-full object-cover" />
                                ) : (
                                  <User size={28} />
                                )}
                                <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full ${emp.status === 'online' ? 'bg-green-500' : 'bg-amber-400'}`}></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-black text-slate-800 text-xs truncate">{emp.name}</h4>
                                  <button 
                                    onClick={(e) => handleShareEmployee(emp, e)}
                                    className="p-1 text-slate-300 hover:text-blue-600 transition-colors"
                                    title="مشاركة بيانات الموظف"
                                  >
                                    <Share2 size={12} />
                                  </button>
                                </div>
                                <p className="text-[9px] text-blue-600 font-bold mt-0.5">{emp.role}</p>
                                
                                <div className="flex flex-col gap-1.5 mt-1.5" onClick={(e) => e.stopPropagation()}>
                                  {emp.email && (
                                    <a href={`mailto:${emp.email}`} className="text-[8px] text-slate-400 flex items-center gap-1.5 hover:text-blue-500 transition-colors w-fit">
                                      <Mail size={10} className="text-slate-300"/> {emp.email}
                                    </a>
                                  )}
                                  
                                  {/* Consolidated Tappable Icons next to phone */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg" dir="ltr">{emp.phone}</span>
                                    <a 
                                      href={`tel:${emp.phone}`} 
                                      className="p-1.5 bg-blue-600 text-white rounded-lg shadow-sm active:scale-90 transition-all" 
                                      title="اتصال"
                                    >
                                      <Phone size={12}/>
                                    </a>
                                    <button 
                                      onClick={() => window.open(`https://wa.me/212${emp.phone.replace(/^0/, '')}`)} 
                                      className="p-1.5 bg-green-600 text-white rounded-lg shadow-sm active:scale-90 transition-all" 
                                      title="واتساب"
                                    >
                                      <MessageSquare size={12}/>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {(['الكل', ...Object.values(SchoolCycle)] as string[]).map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setActiveCycle(cycle as any)}
                  className={`px-4 py-2.5 rounded-2xl text-[10px] font-black whitespace-nowrap transition-all ${activeCycle === cycle ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-500 border border-slate-100'}`}
                >
                  {cycle}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-white p-2.5 rounded-[1.5rem] border border-slate-100 overflow-hidden shadow-sm">
              <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600 flex-shrink-0">
                <Map size={18} />
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
                {['الكل', ...communes].map((commune) => (
                  <button
                    key={commune}
                    onClick={() => setActiveCommune(commune)}
                    className={`px-3.5 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all ${activeCommune === commune ? 'bg-blue-100 text-blue-700' : 'text-slate-400 hover:bg-slate-50'}`}
                  >
                    {commune}
                  </button>
                ))}
              </div>
              {isAdminMode && (
                <button onClick={() => setShowCommuneModal(true)} className="p-2.5 bg-slate-100 text-slate-500 rounded-xl flex-shrink-0 hover:bg-orange-500 hover:text-white transition-colors">
                  <Plus size={18} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredSchools.length > 0 ? filteredSchools.map((school) => (
                <div key={school.id} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                  <div className={`absolute top-0 right-0 w-1.5 h-full ${
                    school.cycle === SchoolCycle.PRIMARY ? 'bg-green-500' :
                    school.cycle === SchoolCycle.PREPARATORY ? 'bg-amber-500' : 'bg-purple-500'
                  }`}></div>
                  
                  {isAdminMode && (
                    <div className="absolute top-5 left-5 flex gap-2">
                      <button onClick={() => { setEditingSchool(school); setFormData(school); setShowSchoolModal(true); }} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"><Edit2 size={14}/></button>
                      <button onClick={() => handleDeleteSchool(school.id)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"><Trash2 size={14}/></button>
                    </div>
                  )}

                  <div className="flex items-start gap-5">
                    <div className={`p-4 rounded-[1.25rem] shadow-sm ${
                      school.cycle === SchoolCycle.PRIMARY ? 'bg-green-50 text-green-600' :
                      school.cycle === SchoolCycle.PREPARATORY ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      {school.cycle === SchoolCycle.PRIMARY ? <Library size={24} /> : 
                       school.cycle === SchoolCycle.PREPARATORY ? <GraduationCap size={24} /> : <School size={24} />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                          <MapPin size={10} /> {school.commune}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`${
                          school.cycle === SchoolCycle.PRIMARY ? 'text-green-500' :
                          school.cycle === SchoolCycle.PREPARATORY ? 'text-amber-500' : 'text-purple-500'
                        }`}>
                          {school.cycle === SchoolCycle.PRIMARY ? <Library size={14} /> : 
                           school.cycle === SchoolCycle.PREPARATORY ? <GraduationCap size={14} /> : <School size={14} />}
                        </span>
                        <h3 className="font-black text-slate-800 text-sm leading-tight">{school.name}</h3>
                      </div>
                      
                      <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5 mb-4">
                        <User size={12} className="text-slate-300" /> مدير(ة) المؤسسة: {school.principal}
                      </p>

                      {!isAdminMode && (
                        <div className="flex gap-2">
                          <a href={`tel:${school.phone}`} className="flex-1 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-100 active:scale-95 transition-all">
                            <Phone size={14}/> اتصال
                          </a>
                          <button onClick={() => window.open(`https://wa.me/212${school.phone.replace(/^0/, '')}`)} className="flex-1 py-3 bg-green-500 text-white rounded-2xl text-[10px] font-black flex items-center justify-center gap-2 shadow-lg shadow-green-100 active:scale-95 transition-all">
                            <MessageSquare size={14}/> واتساب
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                  <Search size={48} className="mx-auto text-slate-100 mb-4" />
                  <p className="text-slate-400 text-xs font-black">لا توجد نتائج مطابقة لبحثك</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isAdminMode && currentView === DirectoryView.SCHOOLS && (
        <button 
          onClick={() => { setEditingSchool(null); setFormData({ cycle: SchoolCycle.PRIMARY, gresa: '' }); setShowSchoolModal(true); }}
          className="fixed bottom-24 left-6 w-14 h-14 bg-orange-500 text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-90 transition-transform"
        >
          <Plus size={28} />
        </button>
      )}

      {showSchoolModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setShowSchoolModal(false)} className="absolute top-8 left-8 text-slate-300 hover:text-slate-600 transition-colors"><X/></button>
            <h2 className="text-xl font-black text-slate-800 mb-8">{editingSchool ? 'تعديل بيانات المؤسسة' : 'إضافة مؤسسة جديدة'}</h2>
            
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 mr-2 mb-1.5 block">اسم المؤسسة</label>
                <input className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-5 text-xs font-bold focus:ring-2 focus:ring-blue-500 shadow-inner" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 mr-2 mb-1.5 block">الرمز (GRESA)</label>
                <input className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-5 text-xs font-bold focus:ring-2 focus:ring-blue-500 shadow-inner" value={formData.gresa} onChange={(e) => setFormData({...formData, gresa: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 mr-2 mb-1.5 block">السلك</label>
                  <select className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-3 text-[10px] font-bold shadow-inner" value={formData.cycle} onChange={(e) => setFormData({...formData, cycle: e.target.value as SchoolCycle})}>
                    {(Object.values(SchoolCycle) as string[]).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 mr-2 mb-1.5 block">الجماعة</label>
                  <select className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-3 text-[10px] font-bold shadow-inner" value={formData.commune} onChange={(e) => setFormData({...formData, commune: e.target.value})}>
                    <option value="">اختر الجماعة</option>
                    {communes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 mr-2 mb-1.5 block">مدير(ة) المؤسسة المسوؤل(ة)</label>
                <input className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-5 text-xs font-bold focus:ring-2 focus:ring-blue-500 shadow-inner" value={formData.principal} onChange={(e) => setFormData({...formData, principal: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 mr-2 mb-1.5 block">رقم الهاتف</label>
                <input className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-5 text-xs font-bold focus:ring-2 focus:ring-blue-500 shadow-inner" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>

            <button onClick={handleSaveSchool} className="w-full mt-10 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black shadow-xl shadow-blue-100 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
              <Check size={20}/> {editingSchool ? 'حفظ التغييرات' : 'إضافة المؤسسة'}
            </button>
          </div>
        </div>
      )}

      {showCommuneModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl relative animate-in fade-in slide-in-from-bottom-4">
            <button onClick={() => setShowCommuneModal(false)} className="absolute top-8 left-8 text-slate-300"><X/></button>
            <h2 className="text-xl font-black text-slate-800 mb-8">إدارة جماعات الإقليم</h2>
            <div className="flex gap-3 mb-8">
              <input placeholder="اسم جماعة جديدة..." className="flex-1 bg-slate-50 border-none rounded-2xl py-4 px-6 text-xs font-bold focus:ring-2 focus:ring-blue-500 shadow-inner" value={newCommuneName} onChange={(e) => setNewCommuneName(e.target.value)} />
              <button onClick={() => { if(newCommuneName) { const updated = [...communes, newCommuneName]; setCommunes(updated); saveSchoolsData(schools, updated); setNewCommuneName(''); } }} className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"><Plus size={24}/></button>
            </div>
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {communes.map(c => (
                <div key={c} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                  <span className="text-xs font-black text-slate-600">{c}</span>
                  <button onClick={() => { const updated = communes.filter(x => x !== c); setCommunes(updated); saveSchoolsData(schools, updated); }} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Directory;
