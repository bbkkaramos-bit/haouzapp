
import { initializeApp, FirebaseApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  Firestore,
  getDoc,
  Unsubscribe
} from "firebase/firestore";

/**
 * إعدادات Firebase
 * يجب استبدال YOUR_PROJECT_ID بالمعرف الحقيقي من لوحة تحكم Firebase
 */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// فحص ما إذا كانت الإعدادات لا تزال افتراضية
const isConfigPlaceholder = firebaseConfig.projectId === "YOUR_PROJECT_ID";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (!isConfigPlaceholder) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase Initialization Error:", error);
  }
} else {
  console.warn("Firebase: Using placeholder config. Remote sync is disabled. Please update your keys in firebaseService.ts");
}

export const firebaseService = {
  /**
   * حفظ بيانات مع دعم التخزين المحلي كاحتياط
   */
  async saveData(collectionName: string, documentId: string, data: any) {
    const key = `local_${collectionName}_${documentId}`;
    localStorage.setItem(key, JSON.stringify(data));

    if (!db) return true; // Fake success for local mode

    try {
      await setDoc(doc(db, collectionName, documentId), {
        content: data,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error("Firebase Save Error:", error);
      return false;
    }
  },

  /**
   * الاستماع للتغييرات مع دعم الاسترجاع المحلي في حال فشل الاتصال
   */
  subscribeToDocument(collectionName: string, documentId: string, callback: (data: any) => void): Unsubscribe {
    const key = `local_${collectionName}_${documentId}`;
    
    // إرجاع البيانات المحلية فوراً للسرعة
    const localData = localStorage.getItem(key);
    if (localData) callback(JSON.parse(localData));

    if (!db) return () => {};

    return onSnapshot(doc(db, collectionName, documentId), 
      (snapshot) => {
        if (snapshot.exists()) {
          const remoteData = snapshot.data().content;
          localStorage.setItem(key, JSON.stringify(remoteData));
          callback(remoteData);
        }
      },
      (error) => {
        console.error(`Firebase Sync Error [${documentId}]:`, error.message);
        // في حال خطأ الصلاحيات، نستمر في استخدام البيانات المحلية
      }
    );
  },

  /**
   * جلب البيانات لمرة واحدة
   */
  async fetchDocument(collectionName: string, documentId: string) {
    const key = `local_${collectionName}_${documentId}`;
    
    if (!db) {
      const local = localStorage.getItem(key);
      return local ? JSON.parse(local) : null;
    }

    try {
      const snapshot = await getDoc(doc(db, collectionName, documentId));
      if (snapshot.exists()) {
        const data = snapshot.data().content;
        localStorage.setItem(key, JSON.stringify(data));
        return data;
      }
      return null;
    } catch (error) {
      const local = localStorage.getItem(key);
      return local ? JSON.parse(local) : null;
    }
  }
};
