
// قم بتغيير هذا الـ IP إلى عنوان حاسوبك المحلي (يمكن معرفته عبر ipconfig في Terminal)
const BASE_URL = 'http://192.168.1.100:3000/api/data';

export const apiService = {
  async getData(key: string) {
    try {
      const response = await fetch(`${BASE_URL}/${key}`);
      if (!response.ok) throw new Error('Network error');
      return await response.json();
    } catch (error) {
      console.error("Fetch error:", error);
      // fallback to localStorage if server is down
      const local = localStorage.getItem(key);
      return local ? JSON.parse(local) : [];
    }
  },

  async saveData(key: string, data: any) {
    try {
      const response = await fetch(`${BASE_URL}/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      // مزامنة محلية أيضاً كاحتياط
      localStorage.setItem(key, JSON.stringify(data));
      return await response.json();
    } catch (error) {
      console.error("Save error:", error);
      localStorage.setItem(key, JSON.stringify(data));
    }
  }
};
