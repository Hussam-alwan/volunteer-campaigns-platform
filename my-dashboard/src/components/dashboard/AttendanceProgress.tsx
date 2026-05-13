import React from "react";
import {
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Search,
  ArrowUpRight,
  FileSpreadsheet,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from "recharts";

const AttendanceProgress = () => {
  const primaryColor = "#5D3FD3";
  const secondaryColor = "#A78BFA";

  const stats = [
    {
      label: "Total Volunteer Hours",
      value: "1,240",
      icon: <Clock size={22} />,
      change: "+12%",
      // استخدام اللون الأزرق ليرمز للوقت والثبات
      bg: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Avg. Progress Rate",
      value: "68%",
      icon: <TrendingUp size={22} />,
      change: "+5%",
      // استخدام اللون البرتقالي ليرمز للطاقة والتقدم
      bg: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      label: "Active Volunteers",
      value: "84",
      icon: <Users size={22} />,
      change: "+18%",
      // استخدام اللون الأخضر ليرمز للمجتمع والنمو
      bg: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
  ];

  const chartData = [
    { name: "Beach Clean", hours: 45, progress: 80 },
    { name: "Education", hours: 32, progress: 65 },
    { name: "Clothes Coll.", hours: 15, progress: 20 },
    { name: "Food Bank", hours: 55, progress: 90 },
    { name: "Tree Plant", hours: 28, progress: 45 },
  ];

  const attendanceLogs = [
    {
      id: 1,
      student: "Ahmad Mohammed",
      campaign: "Beach Clean-up 2026",
      date: "2026-05-10",
      hours: 5,
      status: "Present",
    },
    {
      id: 2,
      student: "Sara Jamil",
      campaign: "Education Workshop",
      date: "2026-05-10",
      hours: 3,
      status: "Present",
    },
    {
      id: 3,
      student: "Khalid Ali",
      campaign: "Beach Clean-up 2026",
      date: "2026-05-09",
      hours: 0,
      status: "Absent",
    },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case "Present":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Absent":
        return "bg-rose-50 text-rose-600 border-rose-100";
      case "Excused":
        return "bg-amber-50 text-amber-600 border-amber-100";
      default:
        return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  return (
    <div className="w-full space-y-8 p-2 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Attendance & <span className="text-[#5D3FD3]">Progress</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Monitor volunteer activity and milestones based on campaign data.
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#5D3FD3] text-white rounded-2xl font-semibold hover:bg-[#4C32B3] transition-all shadow-lg shadow-indigo-100">
          <FileSpreadsheet size={18} />
          Export Report
        </button>
      </div>

      {/* Stats Grid - تم تغيير ألوان الأيقونات هنا */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] group hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start">
              <div
                className={`p-4 rounded-2xl ${stat.bg} ${stat.textColor} group-hover:scale-110 transition-transform`}
              >
                {stat.icon}
              </div>
              <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                {stat.change} <ArrowUpRight size={12} className="ml-1" />
              </span>
            </div>
            <div className="mt-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#5D3FD3] rounded-full"></div>
            Volunteering Hours Analysis
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f8fafc"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#F5F3FF" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
                  }}
                />
                <Bar dataKey="hours" radius={[6, 6, 6, 6]} barSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 2 === 0 ? primaryColor : secondaryColor}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-orange-400 rounded-full"></div>
            Campaign Completion Rate
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorProg" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={primaryColor}
                      stopOpacity={0.1}
                    />
                    <stop
                      offset="95%"
                      stopColor={primaryColor}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <Tooltip
                  contentStyle={{ borderRadius: "16px", border: "none" }}
                />
                <Area
                  type="monotone"
                  dataKey="progress"
                  stroke={primaryColor}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorProg)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">
            Recent Attendance Logs
          </h3>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#5D3FD3]/10 outline-none w-48"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="px-8 py-4 font-bold">Student</th>
                <th className="px-8 py-4 font-bold">Campaign</th>
                <th className="px-8 py-4 font-bold text-center">Hours</th>
                <th className="px-8 py-4 font-bold">Status</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {attendanceLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-8 py-5 font-semibold text-slate-700">
                    {log.student}
                  </td>
                  <td className="px-8 py-5 text-slate-500 text-sm">
                    {log.campaign}
                  </td>
                  <td className="px-8 py-5 text-center font-bold text-[#5D3FD3]">
                    {log.hours}h
                  </td>
                  <td className="px-8 py-5">
                    <span
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${getStatusStyle(log.status)}`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-slate-300 hover:text-[#5D3FD3] transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceProgress;
