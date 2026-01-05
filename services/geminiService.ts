
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * جلب الردود العامة للمساعد الذكي
 */
export const getAIResponse = async (userMessage: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userMessage,
      config: {
        systemInstruction: `أنت مساعد ذكي للموظفين في مديرية الحوز. 
        تساعد الموظفين في الأسئلة المتعلقة بالعمل، الإعلانات، والمساطر الإدارية.
        اجعل إجاباتك ودودة، مهنية، وباللغة العربية.`,
        temperature: 0.7,
      },
    });
    return response.text || "عذراً، لم أستطع معالجة طلبك حالياً.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "حدث خطأ أثناء التواصل مع الذكاء الاصطناعي.";
  }
};

/**
 * تلخيص مذكرة إدارية بناءً على عنوانها ومرجعها
 */
export const summarizeMemo = async (title: string, reference: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `بناءً على عنوان المذكرة التالية: "${title}" ومرجعها "${reference}"، قدم ملخصاً إدارياً سريعاً في 3 نقاط قصيرة جداً (ما هي المذكرة، من المستهدف، وما هو الإجراء المطلوب). اجعل الأسلوب رسمياً ومختصراً جداً.`,
    });
    return response.text || "لم يتم العثور على ملخص.";
  } catch (error) {
    return "عذراً، فشل توليد الملخص حالياً.";
  }
};

/**
 * وظيفة البحث عن آخر أخبار صفحة فيسبوك لمديرية الحوز
 */
export const syncFacebookNews = async () => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `ابحث عن آخر 5 منشورات في صفحة فيسبوك الرسمية لمديرية الحوز (الرابط: https://www.facebook.com/profile.php?id=100044383515584).
      استخرج المعلومات التالية لكل منشور بوضوح:
      1. عنوان جذاب للمنشور.
      2. ملخص للمحتوى.
      3. تاريخ النشر (إن وجد).
      4. رابط المنشور المباشر.
      قم بفصل كل خبر عن الآخر بوضوح.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sourceUrls = groundingChunks
      .map((chunk: any) => ({
        uri: chunk.web?.uri,
        title: chunk.web?.title
      }))
      .filter((src: any) => src.uri);

    const generatedText = response.text || "";
    
    return {
      rawText: generatedText,
      sources: sourceUrls
    };
  } catch (error) {
    console.error("Sync Error:", error);
    throw error;
  }
};
