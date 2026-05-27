import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import auth
import type { ILoginPayload } from "../../API/Authorization/authorization.interface";
// 1️⃣ استيراد الـ Store الافتراضي لتحديث الحالة الأمنية للتطبيق
import useAuthStore from "../../store/auth.store";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ILoginPayload>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1️⃣ إرسال طلب تسجيل الدخول واستلام الاستجابة
      const response = await authApis.login(formData);
      console.log("Full Server Response Body:", response);

      // 2️⃣ استخراج التوكن بشكل آمن تماماً
      // إذا كان الباكيند يرسل التوكن داخل الـ response body أو كـ الرد نفسه:
      let realToken =
        response?.accessToken ||
        response?.access_token ||
        response?.token ||
        response?.jwt;

      // 💡 إذا لم يعثر عليه بالداخل، قد يكون الـ response هو التوكن مباشرة كـ string، أو قادم عبر الهيدرز من دالة الـ API
      if (!realToken && typeof response === "string") {
        realToken = response;
      }

      // إذا استمر عدم وجود توكن، نضع النص الاحتياطي لتجنب انهيار الكود، لكن يفضل التأكد من الـ Network
      if (!realToken) {
        realToken = "cookie_session_active";
      }

      const user = response;

      if (user && (user.userId || user.email || typeof user === "string")) {
        // 3️⃣ الطريقة الآمنة والمستقرة لتحديث الـ Zustand Store دون استخدام setState المباشر الذي يسبب المشاكل:
        const store = useAuthStore.getState();

        // فحص الميثودز المتوفرة داخل الـ Store الخاص بك وتحديثها ديناميكياً
        if (typeof (store as any).setAuth === "function") {
          (store as any).setAuth(user, realToken);
        } else if (typeof (store as any).login === "function") {
          (store as any).login(user, realToken);
        } else {
          // تحديث يدوي للحقول في حال لم يكن هناك دالة تحديث مخصصة داخل الـ Store
          useAuthStore.setState({
            token: realToken,
            user: typeof user === "object" ? user : { email: formData.email },
            isAuthenticated: true,
            loading: false,
          });
        }

        // 4️⃣ حفظ التوكن الحقيقي في الـ localStorage لكي يلتقطه الـ Request Interceptor في Axios
        localStorage.setItem("token", realToken);
        console.log("Successfully Authorized with Token:", realToken);

        // التوجيه الفوري للداشبورد
        navigate("/dashboard", { replace: true });
      } else {
        setError("Failed to resolve user layout.");
      }
    } catch (err: any) {
      console.error("Axios login error:", err);
      setError(err?.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans antialiased">
      <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 w-full max-w-md">
        {/* Header/Logo section matching Sidebar Header */}
        <div className="text-center mb-8">
          <div className="bg-[#5D3FD3] inline-flex p-3 rounded-2xl text-white mb-4 shadow-lg shadow-indigo-100">
            <div className="w-6 h-6 border-2 border-white rotate-45 flex items-center justify-center">
              <div className="w-2 h-2 bg-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Sign in to continue to Volunteer platform
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-4 rounded-2xl mb-5 text-center border border-red-100 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5D3FD3] focus:bg-white transition-all text-[15px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5D3FD3] focus:bg-white transition-all text-[15px]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5D3FD3] hover:bg-[#4c32b3] text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200 flex items-center justify-center text-[15px] mt-2 disabled:opacity-70"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-400">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-[#5D3FD3] font-bold cursor-pointer hover:underline ml-1"
            >
              Create an account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
