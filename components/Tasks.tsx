
import React from 'react';
import { Task } from '../types';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const MOCK_TASKS: Task[] = [
  { id: '1', title: 'تقرير الربع الأول', description: 'إرسال التقرير المالي للربع الأول', dueDate: '2024-06-01', priority: 'High', status: 'In Progress' },
  { id: '2', title: 'تحديث بيانات الحساب', description: 'تحديث بيانات الموظف الشخصية', dueDate: '2024-05-25', priority: 'Medium', status: 'Pending' },
  { id: '3', title: 'مراجعة الكود البرمجي', description: 'مراجعة التحديثات الأخيرة لتطبيق الجوال', dueDate: '2024-05-22', priority: 'High', status: 'Completed' },
];

const chartData = [
  { name: 'مكتملة', value: 12, color: '#10b981' },
  { name: 'قيد التنفيذ', value: 5, color: '#3b82f6' },
  { name: 'معلقة', value: 3, color: '#f59e0b' },
];

const Tasks: React.FC = () => {
  return (
    <div className="p-4 space-y-6 mb-20">
      <h1 className="text-2xl font-bold text-gray-800">مهامي</h1>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-500 mb-4">ملخص الإنجاز</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-3">
        {MOCK_TASKS.map((task) => (
          <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border-r-4 border-r-blue-500 border border-gray-100 flex items-start gap-4">
            <div className={`mt-1 ${
              task.status === 'Completed' ? 'text-green-500' :
              task.status === 'In Progress' ? 'text-blue-500' : 'text-amber-500'
            }`}>
              {task.status === 'Completed' ? <CheckCircle size={24} /> : <Clock size={24} />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-800">{task.title}</h3>
                {task.priority === 'High' && (
                  <span className="flex items-center text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded">
                    <AlertCircle size={10} className="mr-1" /> مهم جداً
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{task.description}</p>
              <div className="flex justify-between items-center mt-3">
                <span className="text-[10px] font-medium text-gray-400">تاريخ الاستحقاق: {task.dueDate}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                  task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {task.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
