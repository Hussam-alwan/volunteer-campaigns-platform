import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authApis from "@/API/Authorization/authorization.apis";
import collegesApis from "@/API/Colleges/Colleges.apis";
import Select from "@/components/layout/Select";
import type { IRegisterPayload } from "../../API/Authorization/authorization.interface";
import type { ICollege } from "@/API/Colleges/Colleges.interfaces";

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
    college: 0,
    isBanned: false,
  });
  const [colleges, setColleges] = useState<ICollege[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // الكليات تُحمَّل من الباك-إند لأن معرّفاتها (collegeId) تبدأ من 101 وليست 1..4
  useEffect(() => {
    const loadColleges = async () => {
      try {
        const res = await collegesApis.getAllColleges({ page: 0, size: 100 });
        const list = res?.content ?? [];
        setColleges(list);
        if (list.length > 0) {
          setFormData((prev) => ({ ...prev, college: list[0].collegeId }));
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadColleges();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "academicYear" || name === "college") {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.college) {
      setError("Please select a college.");
      return;
    }

    setLoading(true);

    try {
      await authApis.register(formData);
      navigate("/login");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please check your data and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans antialiased">
      <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Create Student Account
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Join Volunteer campaigns and student initiatives
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-4 rounded-2xl mb-5 text-center border border-red-100 font-medium">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-[15px] focus:outline-none focus:border-[#5D3FD3] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-[15px] focus:outline-none focus:border-[#5D3FD3] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
              Student ID Number
            </label>
            <input
              type="text"
              name="studentNumber"
              required
              value={formData.studentNumber}
              onChange={handleChange}
              placeholder="e.g. 2024101"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-[15px] focus:outline-none focus:border-[#5D3FD3] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="09xxxxxxxx"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-[15px] focus:outline-none focus:border-[#5D3FD3] focus:bg-white transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="student@university.edu"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-[15px] focus:outline-none focus:border-[#5D3FD3] focus:bg-white transition-all"
            />
          </div>

          <div className="md:col-span-2">
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
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-[15px] focus:outline-none focus:border-[#5D3FD3] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
              Academic Year
            </label>
            <Select
              name="academicYear"
              wrapperClassName="block w-full"
              className="bg-slate-50 border-slate-200 py-3 text-[15px] text-slate-800"
              value={formData.academicYear}
              onChange={handleChange}
            >
              <option value={1}>1st Year</option>
              <option value={2}>2nd Year</option>
              <option value={3}>3rd Year</option>
              <option value={4}>4th Year</option>
              <option value={5}>5th Year</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
              College / Faculty
            </label>
            <Select
              name="college"
              wrapperClassName="block w-full"
              className="bg-slate-50 border-slate-200 py-3 text-[15px] text-slate-800"
              value={formData.college}
              onChange={handleChange}
            >
              {colleges.length === 0 && (
                <option value={0}>Loading colleges…</option>
              )}
              {colleges.map((c) => (
                <option key={c.collegeId} value={c.collegeId}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5D3FD3] hover:bg-[#4c32b3] text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200 flex items-center justify-center text-[15px] disabled:opacity-70"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-400">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-[#5D3FD3] font-bold cursor-pointer hover:underline ml-1"
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
