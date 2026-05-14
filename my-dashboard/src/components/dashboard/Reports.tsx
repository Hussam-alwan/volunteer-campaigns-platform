import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  LayoutDashboard,
  CheckCircle2,
  TrendingUp,
  FileText,
  School,
} from "lucide-react";

// بيانات تجريبية مبنية على حقول الـ ERD
const collegeData = [
  { name: "Engineering", students: 400 },
  { name: "Science", students: 300 },
  { name: "Arts", students: 200 },
  { name: "IT", students: 500 },
];

const applicationStats = [
  { status: "Accepted", value: 450, color: "#5D3FD3" }, // بنفسجي أساسي
  { status: "Pending", value: 120, color: "#A78BFA" }, // بنفسجي فاتح
  { status: "Rejected", value: 80, color: "#E2E8F0" }, // فضي كاشف
];

const attendanceTrends = [
  { day: "Mon", present: 85 },
  { day: "Tue", present: 88 },
  { day: "Wed", present: 95 },
  { day: "Thu", present: 90 },
  { day: "Fri", present: 92 },
];

function Reports() {
  const primaryPurple = "#5D3FD3";
  const barColors = ["#5D3FD3", "#7C3AED", "#8B5CF6", "#A78BFA"];

  return (
    <div className="w-full space-y-8 p-6 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            System <span style={{ color: primaryPurple }}>Analytics</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">
            Visualizing data from ERD: Colleges, Campaigns & Attendance
          </p>
        </div>
        <div className="flex gap-2">
          <button
            style={{ backgroundColor: primaryPurple }}
            className="px-6 py-2.5 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:opacity-90 transition-all"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Students",
            value: "1,284",
            icon: Users,
            color: "text-orange-500", // أورانج كاشف
            bg: "bg-orange-50",
          },
          {
            label: "Active Campaigns",
            value: "42",
            icon: LayoutDashboard,
            color: "text-yellow-500", // أصفر كاشف
            bg: "bg-yellow-50",
          },
          {
            label: "Colleges",
            value: "8",
            icon: School,
            color: "text-green-500", // أخضر كاشف
            bg: "bg-green-50",
          },
          {
            label: "Avg. Attendance",
            value: "92%",
            icon: CheckCircle2,
            color: "text-red-500", // أحمر كاشف
            bg: "bg-red-50",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                <stat.icon size={24} />
              </div>
              <span className="text-indigo-500 text-xs font-bold bg-indigo-50 px-2 py-1 rounded-lg">
                +12.5%
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider">
                {stat.label}
              </h3>
              <p className="text-2xl font-black text-slate-800 mt-1">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Bar Chart - Students per College */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
              <School size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Students per College
            </h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={collegeData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: primaryPurple,
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: primaryPurple,
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="students" radius={[10, 10, 0, 0]} barSize={45}>
                  {collegeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={barColors[index % barColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Pie Chart - Application Status */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-green-50 text-green-500 rounded-lg">
              <FileText size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Application Status
            </h2>
          </div>
          <div className="h-[300px] w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={applicationStats}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {applicationStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-4 pr-4">
              {applicationStats.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-bold text-slate-600">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Area Chart - Weekly Attendance */}
        {/* 3. Bar Chart - Weekly Attendance (Updated to match image_a3d737.png) */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-red-50 text-red-500 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Weekly Attendance Trends
            </h2>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={attendanceTrends}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: primaryPurple,
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: primaryPurple,
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="present"
                  fill={primaryPurple}
                  radius={[5, 5, 0, 0]}
                  barSize={40}
                  label={{
                    position: "top",
                    fill: "#64748B",
                    fontSize: 12,
                    fontWeight: "bold",
                  }} // لإظهار الأرقام فوق الأعمدة كما في الصورة
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
