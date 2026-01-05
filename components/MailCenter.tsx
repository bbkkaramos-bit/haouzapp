
import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, Send, Search, Plus, Trash2, Paperclip, 
  X, Check, ChevronLeft, Inbox, SendHorizontal, 
  User, Calendar, Clock, FileText, ChevronRight,
  MoreVertical, Star, AlertCircle, Loader2, Download, Lock, Reply, Globe
} from 'lucide-react';
import { MailMessage, Employee, Attachment, UserSession, UserRole } from '../types';

interface MailCenterProps {
  userSession: UserSession;
}

const MailCenter: React.FC<MailCenterProps> = ({ userSession }) => {
  const isAdmin = userSession.role === UserRole.ADMIN;
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'INBOX' | 'SENT'>('INBOX');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<MailMessage | null>(null);
  const [staff, setStaff] = useState<Employee[]>([]);
  
  const [composeData, setComposeData] = useState({ recipientId: '', subject: '', body: '', attachments: [] as Attachment[] });
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedMail = localStorage.getItem('dir_mail_v1');
    setMessages(savedMail ? JSON.parse(savedMail) : []);
    
    const savedStaffRaw = localStorage.getItem('local_app_data_staff_list');
    if (savedStaffRaw) {
      const depts = JSON.parse(savedStaffRaw);
      const allEmployees: Employee[] = [];
      depts.forEach((d: any) => d.offices.forEach((o: any) => allEmployees.push(...o.employees)));
      setStaff(allEmployees);
    }
  }, []);

  const saveMail = (updated: MailMessage[]) => {
    setMessages(updated);
    localStorage.setItem('dir_mail_v1', JSON.stringify(updated));
  };

  const handleSendMail = async () => {
    if ((!isBroadcast && !composeData.recipientId) || !composeData.subject || !composeData.body) {
      alert('المرجو تعبئة جميع الخانات');
      return;
    }
    
    setIsSending(true);
    
    const senderInStaff = staff.find(s => s.email === userSession.email);
    const senderRole = isAdmin ? 'المدير(ة) العام(ة)' : (senderInStaff?.role || 'إطار إداري');

    if (isBroadcast && isAdmin) {
      // إرسال للكل (محاكاة عبر إرسال رسالة برمز خاص للكل)
      const broadcastMsg: MailMessage = {
        id: `msg-all-${Date.now()}`,
        senderId: userSession.email,
        senderName: userSession.name,
        senderRole: senderRole,
        recipientId: 'ALL_STAFF',
        recipientName: 'جميع الموظفين والأطر',
        subject: `📢 تعميم: ${composeData.subject}`,
        body: composeData.body,
        date: new Date().toISOString(),
        isRead: false,
        attachments: composeData.attachments
      };
      saveMail([broadcastMsg, ...messages]);
    } else {
      const recipient = staff.find(s => s.id === composeData.recipientId);
      const newMsg: MailMessage = {
        id: `msg-${Date.now()}`,
        senderId: userSession.email,
        senderName: userSession.name,
        senderRole: senderRole,
        recipientId: recipient?.email || composeData.recipientId,
        recipientName: recipient?.name || 'موظف',
        subject: composeData.subject,
        body: composeData.body,
        date: new Date().toISOString(),
        isRead: false,
        attachments: composeData.attachments
      };
      saveMail([newMsg, ...messages]);
    }

    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      setTimeout(() => {
        setShowCompose(false);
        setIsSent(false);
        setIsBroadcast(false);
        setComposeData({ recipientId: '', subject: '', body: '', attachments: [] });
      }, 1500);
    }, 800);
  };

  const filteredMessages = messages.filter(m => {
    // عرض رسائل التعميم للكل أيضاً في صندوق الوارد
    const isBroadcastToMe = activeSubTab === 'INBOX' && m.recipientId === 'ALL_STAFF';
    const isMyInbox = activeSubTab === 'INBOX' && (m.recipientId === userSession.email);
    const isMySent = activeSubTab === 'SENT' && (m.senderId === userSession.email);
    
    if (!isMyInbox && !isMySent && !isBroadcastToMe) return false;

    const isSearchMatch = m.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.senderName.toLowerCase().includes(searchTerm.toLowerCase());
    return isSearchMatch;
  });

  return (
    <div className="flex flex-col min-h-full bg-slate-50 font-['Cairo'] pb-32 text-right" dir="rtl">
      <div className="bg-white px-6 pt-10 pb-4 shadow-sm border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Mail size={24} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-800 leading-tight">بريد التواصل</h1>
              <p className="text-[9px] text-indigo-600 font-bold tracking-widest uppercase">{userSession.name}</p>
            </div>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
          <button onClick={() => { setActiveSubTab('INBOX'); setSelectedMsg(null); }} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${activeSubTab === 'INBOX' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>صندوق الوارد</button>
          <button onClick={() => { setActiveSubTab('SENT'); setSelectedMsg(null); }} className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${activeSubTab === 'SENT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>الرسائل المرسلة</button>
        </div>

        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="البحث في المراسلات..." className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {selectedMsg ? (
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 animate-in slide-in-from-left-4">
            <button onClick={() => setSelectedMsg(null)} className="mb-6 flex items-center gap-2 text-indigo-600 text-[11px] font-black group">
              <ChevronRight size={18} /> العودة
            </button>
            <div className="flex items-center gap-4 mb-8">
               <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner"><User size={28} /></div>
               <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">{selectedMsg.senderName}</h3>
                  <p className="text-[10px] font-bold text-slate-500">{selectedMsg.senderRole}</p>
                  <p className="text-[8px] text-slate-400 mt-1">{new Date(selectedMsg.date).toLocaleString('ar-MA')}</p>
               </div>
            </div>
            <h2 className={`text-base font-black text-slate-900 mb-6 border-r-4 pr-4 leading-tight ${selectedMsg.recipientId === 'ALL_STAFF' ? 'border-amber-500' : 'border-indigo-600'}`}>{selectedMsg.subject}</h2>
            <div className="bg-slate-50 p-6 rounded-[2rem] text-[12px] text-slate-600 font-bold whitespace-pre-line leading-relaxed shadow-inner">
              {selectedMsg.body}
            </div>
            {activeSubTab === 'INBOX' && selectedMsg.recipientId !== 'ALL_STAFF' && (
              <button onClick={() => { setComposeData({ recipientId: selectedMsg.senderId, subject: `رد: ${selectedMsg.subject}`, body: '\n\n--- الرد ---\n', attachments: [] }); setShowCompose(true); }} className="w-full mt-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[12px] shadow-xl">الرد على الرسالة</button>
            )}
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div key={msg.id} onClick={() => setSelectedMsg(msg)} className={`bg-white rounded-[2rem] p-5 shadow-sm border-2 transition-all cursor-pointer flex items-center gap-4 ${msg.recipientId === 'ALL_STAFF' ? 'border-amber-100 bg-amber-50/20' : 'border-slate-50'}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${msg.recipientId === 'ALL_STAFF' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                {msg.recipientId === 'ALL_STAFF' ? <Globe size={24}/> : <User size={24}/>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-slate-900 truncate">{activeSubTab === 'SENT' ? msg.recipientName : msg.senderName}</span>
                  <span className="text-[8px] font-bold text-slate-400">{new Date(msg.date).toLocaleDateString('ar-MA')}</span>
                </div>
                <p className="text-[11px] font-black text-slate-800 mb-1 truncate">{msg.subject}</p>
                {msg.recipientId === 'ALL_STAFF' && <span className="text-[8px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-lg">تعميم رسمي</span>}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="fixed bottom-28 left-6 flex flex-col gap-3">
         {isAdmin && (
           <button 
             onClick={() => { setIsBroadcast(true); setShowCompose(true); }}
             className="w-14 h-14 bg-amber-500 text-white rounded-full shadow-2xl flex items-center justify-center z-[70] border-4 border-white active:scale-90 transition-all"
             title="إرسال تعميم للكل"
           >
             <Globe size={24} />
           </button>
         )}
         <button onClick={() => { setIsBroadcast(false); setComposeData({ recipientId: '', subject: '', body: '', attachments: [] }); setShowCompose(true); }} className="w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center z-[70] border-4 border-white active:scale-90 transition-all">
           <Plus size={28} />
         </button>
      </div>

      {showCompose && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl relative animate-in zoom-in text-right">
            {!isSent && <button onClick={() => setShowCompose(false)} className="absolute top-8 left-8 text-slate-300"><X size={24}/></button>}
            
            {isSent ? (
               <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce"><Check size={40} /></div>
                  <h2 className="text-lg font-black text-slate-900">تم الإرسال بنجاح!</h2>
               </div>
            ) : (
               <>
                <h2 className="text-base font-black text-slate-900 mb-8 flex items-center gap-3">
                   {isBroadcast ? <Globe size={22} className="text-amber-500" /> : <Send size={22} className="text-indigo-600" />}
                   {isBroadcast ? 'إرسال تعميم لكافة الأطر' : 'إرسال مراسلة جديدة'}
                </h2>
                <div className="space-y-6">
                  {!isBroadcast && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400">المرسل إليه</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-[12px] font-black outline-none" value={composeData.recipientId} onChange={(e) => setComposeData({...composeData, recipientId: e.target.value})}>
                        <option value="">اختر الموظف...</option>
                        {staff.map(s => <option key={s.id} value={s.id}>{s.name} - {s.role}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400">الموضوع</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-[12px] font-black outline-none" value={composeData.subject} onChange={(e) => setComposeData({...composeData, subject: e.target.value})} placeholder="اكتب العنوان..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400">نص الرسالة</label>
                    <textarea className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-[12px] font-black outline-none h-40 resize-none" value={composeData.body} onChange={(e) => setComposeData({...composeData, body: e.target.value})} placeholder="اكتب محتوى الرسالة..." />
                  </div>
                  <button onClick={handleSendMail} disabled={isSending} className={`w-full py-4.5 text-white rounded-[1.5rem] text-[13px] font-black shadow-xl active:scale-95 transition-all ${isBroadcast ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                    {isSending ? <Loader2 size={22} className="animate-spin" /> : 'إرسال الآن'}
                  </button>
                </div>
               </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MailCenter;
