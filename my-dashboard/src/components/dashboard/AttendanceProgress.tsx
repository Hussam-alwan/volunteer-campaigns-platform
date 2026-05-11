import React from "react";
import {
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Search,
  Filter,
  ArrowUpRight,
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
  // بيانات إحصائية مستوحاة من جداول attendance و progress في الـ ERD
  const stats = [
    {
      label: "Total Volunteer Hours",
      value: "1,240",
      icon: <Clock className="text-purple-600" />,
      change: "+12%",
      bg: "bg-purple-50",
    },
    {
      label: "Avg. Progress Rate",
      value: "68%",
      icon: <TrendingUp className="text-purple-600" />,
      change: "+5%",
      bg: "bg-purple-100/50",
    },
    {
      label: "Active Volunteers",
      value: "84",
      icon: <Users className="text-purple-600" />,
      change: "+18%",
      bg: "bg-purple-50",
    },
  ];

  // بيانات الرسم البياني (ساعات التطوع لكل حملة)
  const chartData = [
    { name: "Beach Clean", hours: 45, progress: 80 },
    { name: "Education", hours: 32, progress: 65 },
    { name: "Clothes Coll.", hours: 15, progress: 20 },
    { name: "Food Bank", hours: 55, progress: 90 },
    { name: "Tree Plant", hours: 28, progress: 45 },
  ];

  // سجل الحضور - الحقول مطابقة لجدول attendance في الـ ERD
  const attendanceLogs = [
    {
      id: 1,
      student: "Ahmad Mohammed",
      campaign: "Beach Clean-up 2026",
      date: "2026-05-10",
      hours: 5,
      status: "Present", // attendance_status_enum
      note: "Highly active",
    },
    {
      id: 2,
      student: "Sara Jamil",
      campaign: "Education Workshop",
      date: "2026-05-10",
      hours: 3,
      status: "Present",
      note: "Lead the session",
    },
    {
      id: 3,
      student: "Khalid Ali",
      campaign: "Beach Clean-up 2026",
      date: "2026-05-09",
      hours: 0,
      status: "Absent",
      note: "Medical excuse",
    },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-700 border-green-200";
      case "Absent":
        return "bg-red-100 text-red-700 border-red-200";
      case "Excused":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Attendance & <span className="text-purple-600">Progress</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Track volunteer hours and campaign milestones.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <CalendarIcon size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm group hover:border-purple-200 transition-all"
          >
            <div className="flex justify-between items-start">
              <div
                className={`p-4 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform`}
              >
                {stat.icon}
              </div>
              <span className="flex items-center text-xs font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                {stat.change} <ArrowUpRight size={12} />
              </span>
            </div>
            <div className="mt-5">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                {stat.label}
              </p>
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hours per Campaign */}
        <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-purple-600 rounded-full"></div>
            Volunteering Hours Analysis
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    padding: "12px",
                  }}
                />
                <Bar dataKey="hours" radius={[10, 10, 10, 10]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index % 2 === 0 ? "#9333ea" : "#c084fc"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign Progress Over Time */}
        <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-purple-400 rounded-full"></div>
            Cumulative Completion Rate
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorProg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="progress"
                  stroke="#9333ea"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorProg)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden pb-4">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center flex-wrap gap-4">
          <h3 className="text-xl font-black text-slate-900">
            Recent Attendance Logs
          </h3>
          <div className="flex gap-3">
            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Search students..."
                className="pl-11 pr-4 py-2.5 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-200 outline-none transition-all text-sm font-medium"
              />
            </div>
            <button className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                Student
              </th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                Campaign
              </th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                Date
              </th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                Hours
              </th>
              <th className="p-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                Status
              </th>
              <th className="p-6 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {attendanceLogs.map((log) => (
              <tr
                key={log.id}
                className="group hover:bg-purple-50/10 transition-colors"
              >
                <td className="p-6 font-bold text-slate-700">{log.student}</td>
                <td className="p-6 text-slate-500 font-medium">
                  {log.campaign}
                </td>
                <td className="p-6">
                  <span className="flex items-center gap-2 text-slate-400 font-medium">
                    <CalendarIcon size={14} /> {log.date}
                  </span>
                </td>
                <td className="p-6 font-black text-purple-600">{log.hours}h</td>
                <td className="p-6">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(log.status)}`}
                  >
                    {log.status}
                  </span>
                </td>
                <td className="p-6 text-center">
                  <button className="p-2 text-slate-300 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceProgress;
