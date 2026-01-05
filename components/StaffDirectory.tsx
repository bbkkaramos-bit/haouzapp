
import React, { useState, useEffect, useRef } from 'react';
import { Employee, UserRole } from '../types';
import { firebaseService } from '../services/firebaseService';
import AdminDashboard from './AdminDashboard';
import * as XLSX from 'xlsx';
import { 
  Search, Users, Plus, Loader2, User, Briefcase, Phone, MessageSquare, 
  ChevronLeft, ChevronDown, Share2, Mail, Trash2, RefreshCw, AlertCircle, 
  Edit2, Check, X, PlusCircle, UserPlus, Building, Layout, Image as ImageIcon,
  Camera, Upload, FileSpreadsheet, UserCheck, Download, BarChart3
} from 'lucide-react';

interface StaffDirectoryProps {
  isAdminOverride?: boolean;
}

const INITIAL_DEPARTMENTS = [
  {
    id: 'dept_1',
    name: 'مصلحة الشؤون الإدارية والمالية والبنايات',
    offices: [
      { 
        id: 'off_1', 
        name: 'مكتب الموارد البشرية', 
        employees: [
          { 
            id: 'emp_1', 
            name: 'ياسين الفاضلي', 
            role: 'رئيس مصلحة الشؤون الإدارية', 
            department: 'الشؤون الإدارية', 
            office: 'المكتب الرئيسي', 
            phone: '0661223344', 
            email: 'y.fadili@men.gov.ma', 
            status: 'online',
            image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300'
          }
        ] 
      }
    ]
  }
];

const StaffDirectory: React.FC<StaffDirectoryProps> = ({ isAdminOverride = false }) => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  // حالات الإضافة (للمدير)
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'DEPT' | 'OFFICE' | 'EMP'>('DEPT');
  const [targetId, setTargetId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({ name: '', role: '', phone: '', email: '', image: '' });
  const [isImporting, setIsImporting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const localData = localStorage.getItem('local_app_data_staff_list');
    const localSchools = localStorage.getItem('dir_schools_v37');
    
    if (localData) {
      const parsed = JSON.parse(localData);
      setDepartments(Array.isArray(parsed) ? parsed : INITIAL_DEPARTMENTS);
    } else {
      setDepartments(INITIAL_DEPARTMENTS);
    }

    if (localSchools) {
      setSchools(JSON.parse(localSchools));
    }

    setInitialLoading(false);
  }, []);

  const saveAndSync = async (updated: any[]) => {
    setDepartments(updated);
    localStorage.setItem('local_app_data_staff_list', JSON.stringify(updated));
    if (isAdminOverride) {
      await firebaseService.saveData('app_data', 'staff_list', updated);
    }
  };

  const getTotalStaffCount = () => {
    let count = 0;
    departments.forEach(d => d.offices.forEach((o: any) => count += (o.employees || []).length));
    return count;
  };

  const handleManualSync = async () => {
    setLoading(true);
    try {
      const remoteData = await firebaseService.fetchDocument('app_data', 'staff_list');
      if (remoteData && Array.isArray(remoteData)) {
        saveAndSync(remoteData);
        alert('تمت المزامنة مع السحابة بنجاح');
      }
    } catch (error) {
      alert('فشل الاتصال بالسحابة.');
    } finally {
      setLoading(false);
    }
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

        const currentDepts = [...departments];
        jsonData.forEach((row) => {
          const deptName = row['المصلحة'] || row['Department'] || 'غير مصنف';
          const officeName = row['المكتب'] || row['Office'] || 'المكتب الرئيسي';
          const empName = row['الاسم'] || row['Name'];
          const empRole = row['المهمة'] || row['Role'] || 'موظف';
          const empPhone = String(row['الهاتف'] || row['Phone'] || '');
          const empEmail = row['البريد'] || row['Email'] || '';

          if (!empName) return;

          let dept = currentDepts.find(d => d.name === deptName);
          if (!dept) {
            dept = { id: `dept_${Date.now()}_${Math.random()}`, name: deptName, offices: [] };
            currentDepts.push(dept);
          }

          let office = dept.offices.find((o: any) => o.name === officeName);
          if (!office) {
            office = { id: `off_${Date.now()}_${Math.random()}`, name: officeName, employees: [] };
            dept.offices.push(office);
          }

          office.employees.push({
            id: `emp_${Date.now()}_${Math.random()}`,
            name: empName,
            role: empRole,
            phone: empPhone,
            email: empEmail,
            status: 'online'
          });
        });

        if (confirm(`تم استخراج ${jsonData.length} موظف بنجاح. حفظ؟`)) {
          saveAndSync(currentDepts);
        }
      } catch (err) {
        alert('خطأ في معالجة الملف.');
      } finally {
        setIsImporting(false);
        if (excelInputRef.current) excelInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAction = () => {
    const updated = [...departments];
    const newId = `id_${Date.now()}`;

    if (modalType === 'DEPT') {
      if (!formData.name) return alert('يرجى إدخال اسم المصلحة');
      updated.push({ id: newId, name: formData.name, offices: [] });
    } else if (modalType === 'OFFICE' && targetId) {
      if (!formData.name) return alert('يرجى إدخال اسم المكتب');
      const dept = updated.find(d => d.id === targetId);
      if (dept) dept.offices.push({ id: newId, name: formData.name, employees: [] });
    } else if (modalType === 'EMP' && targetId) {
      if (!formData.name || !formData.role) return alert('يرجى إدخال الاسم والمهمة');
      updated.forEach(d => {
        const off = d.offices.find((o: any) => o.id === targetId);
        if (off) off.employees.push({ 
          id: newId, 
          name: formData.name, 
          role: formData.role, 
          phone: formData.phone, 
          email: formData.email,
          image: formData.image,
          status: 'online' 
        });
      });
    }
    
    saveAndSync(updated);
    setShowAddModal(false);
    setFormData({ name: '', role: '', phone: '', email: '', image: '' });
  };

  const handleDelete = (type: 'DEPT' | 'OFFICE' | 'EMP', id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    let updated = [...departments];
    if (type === 'DEPT') updated = updated.filter(d => d.id !== id);
    else if (type === 'OFFICE') updated.forEach(d => d.offices = d.offices.filter((o: any) => o.id !== id));
    else if (type === 'EMP') updated.forEach(d => d.offices.forEach((o: any) => o.employees = o.employees.filter((e: any) => e.id !== id)));
    saveAndSync(updated);
  };

  const filteredStaff = departments.map(dept => ({
    ...dept,
    offices: (dept.offices || []).map((office: any) => ({
      ...office,
      employees: (office.employees || []).filter((emp: Employee) => 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        emp.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter((off: any) => off.employees.length > 0 || isAdminOverride)
  })).filter(dept => dept.offices.length > 0 || isAdminOverride);

  const handleShare = (emp: Employee) => {
    const text = `👤 ${emp.name}\n💼 ${emp.role}\n🏢 مديرية الحوز\n📞 ${emp.phone}`;
    if (navigator.share) navigator.share({ text });
    else { navigator.clipboard.writeText(text); alert('تم النسخ!'); }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">جاري تحميل الدليل...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full font-['Cairo'] pb-40 text-right">
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-[60] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
              <Users size={22} />
            </div>
            <div>
              <h1 className="text-[13px] font-black text-slate-900 leading-tight">دليل أطر المديرية</h1>
              <p className="text-[8px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5">مركز التواصل الداخلي</p>
            </div>
          </div>
          <div className="flex gap-2">
            {isAdminOverride && (
              <button 
                onClick={() => setShowDashboard(!showDashboard)}
                className={`p-3 rounded-xl border flex items-center gap-2 transition-all active:scale-90 ${showDashboard ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}
                title="لوحة الإحصائيات"
              >
                <BarChart3 size={18} />
              </button>
            )}
            <button 
              onClick={handleManualSync}
              className={`p-3 rounded-xl border flex items-center gap-2 transition-all active:scale-90 ${loading ? 'bg-slate-50 text-slate-300' : 'bg-slate-50 text-slate-600 border-slate-200 shadow-sm'}`}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input 
            type="text" 
            placeholder="ابحث عن اسم، مهمة أو مصلحة..." 
            className="w-full pr-11 pl-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="p-5 space-y-4">
        {isAdminOverride && showDashboard && (
          <AdminDashboard schools={schools} staffCount={getTotalStaffCount()} />
        )}

        {filteredStaff.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
             <Users size={40} className="mx-auto text-slate-100 mb-4" />
             <p className="text-slate-400 text-[10px] font-black italic">لا توجد بيانات للعرض حالياً</p>
          </div>
        ) : (
          filteredStaff.map(dept => (
            <div key={dept.id} className="bg-white rounded-[2.2rem] border border-slate-100 overflow-hidden shadow-sm transition-all hover:shadow-md">
              <div className="w-full flex items-center justify-between p-4 bg-white">
                <button 
                  onClick={() => setExpandedDept(expandedDept === dept.id ? null : dept.id)}
                  className="flex flex-1 items-center gap-3 text-right"
                >
                  <div className={`p-2.5 rounded-xl transition-all ${expandedDept === dept.id ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-50 text-emerald-600'}`}>
                    <Building size={18}/>
                  </div>
                  <span className="text-[11px] font-black text-slate-700">{dept.name}</span>
                </button>
                <div className="flex gap-1 items-center">
                  {isAdminOverride && (
                    <>
                      <button onClick={() => { setTargetId(dept.id); setModalType('OFFICE'); setShowAddModal(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Plus size={16}/></button>
                      <button onClick={() => handleDelete('DEPT', dept.id)} className="p-2 text-red-300 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                    </>
                  )}
                  {expandedDept === dept.id ? <ChevronDown size={18} className="text-emerald-600" /> : <ChevronLeft size={18} className="text-slate-300" />}
                </div>
              </div>

              {expandedDept === dept.id && (
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 space-y-8 animate-in slide-in-from-top-2 duration-300">
                  {(dept.offices || []).map((office: any) => (
                    <div key={office.id} className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{office.name}</p>
                        </div>
                        {isAdminOverride && (
                          <div className="flex gap-2">
                             <button onClick={() => { setTargetId(office.id); setModalType('EMP'); setShowAddModal(true); }} className="text-blue-500 p-1.5 bg-white border border-blue-100 rounded-lg shadow-sm flex items-center gap-1">
                               <UserPlus size={14}/>
                               <span className="text-[8px] font-black">إضافة إطار</span>
                             </button>
                             <button onClick={() => handleDelete('OFFICE', office.id)} className="text-red-300 p-1.5 bg-white border border-red-50 rounded-lg shadow-sm"><Trash2 size={14}/></button>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid gap-3">
                        {(office.employees || []).map((emp: Employee) => (
                          <div key={emp.id} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-4 group transition-all hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5">
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 overflow-hidden shrink-0 shadow-inner border border-slate-200">
                              {emp.image ? (
                                <img src={emp.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={emp.name} />
                              ) : (
                                <User size={24}/>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[11px] font-black text-slate-800 truncate">{emp.name}</h4>
                              <p className="text-[9px] text-emerald-600 font-bold truncate mt-0.5">{emp.role}</p>
                              <div className="flex gap-2 mt-3">
                                <a href={`tel:${emp.phone}`} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100"><Phone size={12}/></a>
                                <button onClick={() => handleShare(emp)} className="p-2 bg-slate-50 text-slate-400 rounded-xl border border-slate-100"><Share2 size={12}/></button>
                                {isAdminOverride && (
                                  <button onClick={() => handleDelete('EMP', emp.id)} className="p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={12}/></button>
                                )}
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
          ))
        )}
      </div>

      {isAdminOverride && (
        <button 
          onClick={() => { setModalType('DEPT'); setShowAddModal(true); }}
          className="fixed bottom-28 left-6 w-16 h-16 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center z-[70] border-4 border-white active:scale-90 transition-all"
        >
          <UserPlus size={28} />
        </button>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-in zoom-in text-right max-h-[90vh] overflow-y-auto">
            <h2 className="text-[15px] font-black text-slate-900 mb-6 flex items-center gap-3">
               {modalType === 'DEPT' ? <Building className="text-emerald-600"/> : modalType === 'OFFICE' ? <Layout className="text-blue-600"/> : <UserPlus className="text-orange-600"/>}
               إضافة عنصر جديد
            </h2>
            <div className="space-y-4">
              {modalType === 'EMP' && (
                <div className="flex flex-col items-center mb-6">
                  <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 cursor-pointer overflow-hidden relative shadow-inner">
                    {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <Camera size={28} />}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">الاسم</label>
                <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-[11px] font-black text-slate-900 outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="الاسم هنا..." />
              </div>
              {modalType === 'EMP' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">المهمة</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-[11px] font-black text-slate-900 outline-none" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">رقم الهاتف</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-[11px] font-black text-slate-900 outline-none" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </>
              )}
              <div className="flex gap-2 pt-6">
                <button onClick={handleAddAction} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[12px] font-black shadow-xl">إضافة الآن</button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[12px] font-black">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDirectory;
