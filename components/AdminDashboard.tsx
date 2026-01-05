
import React from 'react';
import { Institution, SchoolCycle } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, Users, Building2, MapPin, Award } from 'lucide-react';

interface AdminDashboardProps {
  schools: Institution[];
  staffCount: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ schools, staffCount }) => {
  const cycleData = [
    { name: 'الابتدائي', value: schools.filter(s => s.cycle === SchoolCycle.PRIMARY).length, color: '#10b981' },
    { name: 'الإعدادي', value: schools.filter(s => s.cycle === SchoolCycle.PREPARATORY).length, color: '#f59e0b' },
    { name: 'التأهيلي', value: schools.filter(s => s.cycle === SchoolCycle.SECONDARY).length, color: '#6366f1' },
  ];

  const totalInstitutions = schools.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-[2.5rem] text-white shadow-lg shadow-emerald-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-xl"><Building2 size={20}/></div>
            <TrendingUp size={16} className="text-emerald-100" />
          </div>
          <p className="text-[10px] font-black opacity-80 uppercase tracking-widest">إجمالي المؤسسات</p>
          <h3 className="text-2xl font-black mt-1">{totalInstitutions}</h3>
        </div>
        
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-[2.5rem] text-white shadow-lg shadow-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-xl"><Users size={20}/></div>
            <Award size={16} className="text-blue-100" />
          </div>
          <p className="text-[10px] font-black opacity-80 uppercase tracking-widest">إجمالي الموظفين</p>
          <h3 className="text-2xl font-black mt-1">{staffCount}</h3>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h4 className="text-[11px] font-black text-slate-800 mb-6 flex items-center gap-2">
           <TrendingUp size={14} className="text-blue-600" /> توزيع المؤسسات حسب الأسلاك
        </h4>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cycleData}>
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {cycleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-slate-50">
           {cycleData.map(item => (
             <div key={item.name} className="text-center">
                <p className="text-[14px] font-black text-slate-800">{item.value}</p>
                <p className="text-[8px] font-bold text-slate-400">{item.name}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
