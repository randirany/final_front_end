import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./locale/ar.json";
import en from "./locale/en.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en }, // تأكد أن `translation` مرفقة هنا
      ar: { translation: ar }
    },
    lng: "ar", // اللغة الافتراضية

    // lng: "en",// اللغة الافتراضية

    // fallbackLng: "en", // استخدم الإنجليزية كلغة احتياطية إذا لم تكن هناك ترجمة متاحة

    fallbackLng: "ar", // استخدم الإنجليزية كلغة احتياطية إذا لم تكن هناك ترجمة متاحة
    interpolation: {
      escapeValue: false // يساعد في تجنب مشاكل عند إدراج HTML داخل النصوص
    }
  });

export default i18n;
