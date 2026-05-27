// ❌ إذا كانت الدالة هكذا وتعود بـ data فقط، فلن ترى التوكن القادم في الهيدر:
// const login = async (payload: ILoginPayload) => {
//   const { data } = await ApiInstance.post("/auth/login", payload);
//   return data;
// };

//  التحويل الصحيح لقراءة الاستجابة كاملة إذا كان التوكن بالهيدرز:
import type { ILoginPayload } from "./authorization.interface";
import ApiInstance from "../api.instance";
const login = async (payload: ILoginPayload) => {
  const response = await ApiInstance.post("/auth/login", payload);

  // إذا وجدنا هيدر Authorization في استجابة السيرفر، نقوم بدمجه مع البيانات المعادة
  const tokenFromHeader =
    response.headers["authorization"] || response.headers["Authorization"];

  if (tokenFromHeader) {
    // تنظيف كلمة Bearer إن وجدت لتخزين الصافي
    const cleanToken = tokenFromHeader.replace("Bearer ", "");
    return { ...response.data, accessToken: cleanToken };
  }

  return response.data;
};

export default login;
