import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApis from "@/API/Authorization/authorization.apis";
import type { ILoginPayload } from "../../API/Authorization/authorization.interface";
import useAuthStore from "../../store/auth.store";

const LoginPage = () => {
  const navigate = useNavigate();
  const loginToStore = useAuthStore((state) => state.login);
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
      // المصادقة بالكوكيز: السيرفر يضبط كوكي الجلسة ويعيد بيانات المستخدم.
      const user = await authApis.login(formData);
      loginToStore(user);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
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
