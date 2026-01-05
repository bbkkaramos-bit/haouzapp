
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface UserSession {
  email: string;
  role: UserRole;
  name: string;
  image?: string;
}

export interface AppSettings {
  globalUserPassword: string;
  adminPassword?: string; // كلمة مرور المدير القابلة للتغيير
  maintenanceMode: boolean;
  lastUpdated: string;
  customLogo?: string; 
  customDevPhoto?: string; 
  lastCloudSync?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  office: string;
  email: string;
  phone: string;
  image?: string;
  status: 'online' | 'offline' | 'away';
}

export enum SchoolCycle {
  PRIMARY = 'الابتدائي',
  PREPARATORY = 'الثانوي الإعدادي',
  SECONDARY = 'الثانوي التأهيلي'
}

export interface SubUnit {
  id: string;
  name: string;
  gresa: string;
  staffCount?: number;
  staff?: Employee[];
}

export interface Institution {
  id: string;
  name: string;
  gresa: string;
  cycle: SchoolCycle;
  commune: string;
  principal: string;
  phone: string;
  address: string;
  email: string;
  isGroup?: boolean;
  subUnits?: SubUnit[];
  staffCount?: number;
  staff?: Employee[];
}

export enum MemoCategory {
  MINISTERIAL = 'وزارية',
  ACADEMIC = 'أكاديمية',
  REGIONAL = 'إقليمية',
  FORMS = 'نماذج'
}

export interface Memo {
  id: string;
  title: string;
  reference: string;
  date: string;
  category: MemoCategory;
  fileUrl?: string;
}

export enum AppTab {
  STAFF = 'STAFF',
  SCHOOLS = 'SCHOOLS',
  MEMOS = 'MEMOS',
  FORMS = 'FORMS',
  NEWS = 'NEWS',
  MAIL = 'MAIL',
  AI_CHAT = 'AI_CHAT',
  PROFILE = 'PROFILE'
}

export interface AdminForm {
  id: string;
  title: string;
  category: string;
  size: string;
  fileData?: string; 
  fileName?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category: string;
  isUrgent?: boolean;
  link?: string;
}

export interface Attachment {
  name: string;
  size: string;
  type: string;
  data: string;
}

export interface MailMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  body: string;
  date: string;
  isRead: boolean;
  attachments?: Attachment[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Completed' | 'In Progress' | 'Pending';
}

export enum DirectoryView {
  STAFF = 'STAFF',
  SCHOOLS = 'SCHOOLS'
}
