import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { HandHeart } from "lucide-react";
import authApis from "@/API/Authorization/authorization.apis";
import type { ILoginPayload } from "../../API/Authorization/authorization.interface";
import useAuthStore from "../../store/auth.store";

const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState<ILoginPayload>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { accessToken, ...user } = await authApis.login(formData);
      if (!accessToken) {
        setError("Server did not return an authorization token.");
        return;
      }
      setAuth(user, accessToken);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const detail = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0066cc] to-[#34c759] flex items-center justify-center mb-5">
            <HandHeart size={24} className="text-white" strokeWidth={2.4} />
          </div>
          <h1 className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight">
            Welcome back
          </h1>
          <p className="text-[15px] text-[#6e6e73] mt-1">
            Sign in to continue.
          </p>
        </div>

        <div className="bg-white border border-[#e0e0e0] rounded-2xl p-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-[13px] p-3 rounded-xl mb-4 text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-[#6e6e73] mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border border-transparent text-[#1d1d1f] text-[15px] placeholder-[#a1a1a6] focus:outline-none focus:bg-white focus:border-[#0066cc]/40 focus:ring-2 focus:ring-[#0066cc]/15 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#6e6e73] mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border border-transparent text-[#1d1d1f] text-[15px] placeholder-[#a1a1a6] focus:outline-none focus:bg-white focus:border-[#0066cc]/40 focus:ring-2 focus:ring-[#0066cc]/15 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0066cc] hover:bg-[#004999] text-white font-semibold py-3 rounded-full transition-colors text-[15px] mt-2 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-[14px] text-[#6e6e73]">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-[#0066cc] font-medium hover:underline"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
