import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { HandHeart } from "lucide-react";
import authApis from "@/API/Authorization/authorization.apis";
import type { IRegisterPayload } from "../../API/Authorization/authorization.interface";
import collegesQueries from "../../API/Colleges/Collegesqueries";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border border-transparent text-[#1d1d1f] text-[15px] placeholder-[#a1a1a6] focus:outline-none focus:bg-white focus:border-[#0066cc]/40 focus:ring-2 focus:ring-[#0066cc]/15 transition-colors";
const labelClass =
  "block text-[12px] font-medium text-[#6e6e73] mb-1.5 uppercase tracking-wider";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<IRegisterPayload>({
    studentNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    academicYear: 1,
    college: 1,
    isBanned: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: collegesPage } = collegesQueries.useGetColleges({
    page: 0,
    size: 100,
  });
  const colleges = collegesPage?.content || [];

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "academicYear" || name === "college") {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authApis.register(formData);
      navigate("/login");
    } catch (err) {
      const detail = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(
        detail || "Registration failed. Please check your data and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0066cc] to-[#34c759] flex items-center justify-center mb-5">
            <HandHeart size={24} className="text-white" strokeWidth={2.4} />
          </div>
          <h1 className="text-[28px] font-semibold text-[#1d1d1f] tracking-tight">
            Create your account
          </h1>
          <p className="text-[15px] text-[#6e6e73] mt-1">
            Join the volunteer platform.
          </p>
        </div>

        <div className="bg-white border border-[#e0e0e0] rounded-2xl p-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-[13px] p-3 rounded-xl mb-4 text-center border border-red-100">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className={labelClass}>First name</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Last name</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Student ID</label>
              <input
                type="text"
                name="studentNumber"
                required
                value={formData.studentNumber}
                onChange={handleChange}
                placeholder="e.g. 2024101"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="09xxxxxxxx"
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="student@university.edu"
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Academic year</label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
                <option value={5}>5th Year</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>College</label>
              <select
                name="college"
                value={formData.college}
                onChange={handleChange}
                className={`${inputClass} appearance-none cursor-pointer`}
              >
                {colleges.length === 0 ? (
                  <option value={0} disabled>
                    Loading colleges…
                  </option>
                ) : (
                  colleges.map((c) => (
                    <option key={c.collegeId} value={c.collegeId}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="md:col-span-2 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0066cc] hover:bg-[#004999] text-white font-semibold py-3 rounded-full transition-colors text-[15px] disabled:opacity-60"
              >
                {loading ? "Creating account…" : "Sign Up"}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center mt-5 text-[14px] text-[#6e6e73]">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-[#0066cc] font-medium hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
