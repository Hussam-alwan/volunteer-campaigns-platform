import React, { useState } from "react";
import { useParams } from "react-router-dom"; // إذا كان الـ campaignId يأتي من الرابط
import {
  Clock,
  Users,
  TrendingUp,
  MoreHorizontal,
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
} from "recharts";

// استدعاء الـ Hooks التي قمنا ببنائها سوياً لربط البيانات
// import attendanceQueries from "./Attendancequeries";
import attendanceQueries from "@/API/Attendance/Attendancequeries";
const AttendanceProgress = () => {
  // 1. جلب الـ ID الخاص بالحملة الحالية (يمكنك تعديلها لتأخذ قيمة ثابتة أو من الـ Props إذا لم تكن تستخدم الراوتر)
  const { campaignId = 1 } = useParams();
  const [searchTerm, setSearchTerm] = useState("");

  const primaryColor = "#5D3FD3";
  const secondaryColor = "#A78BFA";

  // 2. جلب البيانات الحية من السيرفر باستخدام الـ Hooks
  const { data: attendanceData, isLoading: isAttendanceLoading } =
    attendanceQueries.useGetAttendance(campaignId);

  const { data: progressData, isLoading: isProgressLoading } =
    attendanceQueries.useGetProgress(campaignId);

  // استخراج المصفوفات الفعلية من الـ Response القادم من الباك اند (مع وضع مصفوفة فارغة كاحتياط لمنع الـ Crash)
  const attendanceLogs = attendanceData?.data || [];
  const progressLogs = progressData?.data || [];

  // 3. حساب الإحصائيات (Stats) ديناميكياً بناءً على البيانات الحية القادمة من السيرفر
  const totalHours = attendanceLogs.reduce(
    (acc, curr) => acc + (curr.hoursThatDay || 0),
    0,
  );
  const activeVolunteers = new Set(attendanceLogs.map((log) => log.student))
    .size;
  const latestProgress =
    progressLogs.length > 0 ? `${progressLogs[0].percentage}%` : "0%";

  const stats = [
    {
      label: "Total Volunteer Hours",
      value: totalHours.toLocaleString(),
      icon: <Clock size={22} />,
      change: "+12%", // يمكنك تركها ثابتة أو حسابها لاحقاً
      bg: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Latest Progress Rate",
      value: latestProgress,
      icon: <TrendingUp size={22} />,
      change: "+5%",
      bg: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      label: "Active Volunteers",
      value: activeVolunteers.toString(),
      icon: <Users size={22} />,
      change: "+18%",
      bg: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
  ];

  // 4. تجهيز بيانات الرسوم البيانية ديناميكياً بناءً على سجل التقدم الفعلي من السيرفر
  const chartData = progressLogs
    .map((item, index) => ({
      name: `Milestone ${index + 1}`,
      progress: item.percentage,
    }))
    .reverse(); // لترتيبها من الأقدم للأحدث

  // 5. فلترة جدول الحضور بناءً على البحث باسم الطالب
  const filteredLogs = attendanceLogs.filter((log) =>
    log.student?.toString().toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "PRESENT":
      case "Present":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "ABSENT":
      case "Absent":
        return "bg-rose-50 text-rose-600 border-rose-100";
      case "LATE":
      case "Late":
        return "bg-amber-50 text-amber-600 border-amber-100";
      default:
        return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  if (isAttendanceLoading || isProgressLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D3FD3]"></div>
      </div>
    );
  }

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

      {/* Stats Grid */}
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

      {/* Charts Section - تفعيل الـ Recharts الذي قمت باستيراده وإعطائه حاوية ثابتة */}
      {chartData.length > 0 && (
        <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">
            Campaign Progress Over Time
          </h3>
          <div style={{ width: "100%", height: "300px", minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F1F5F9"
                />
                <XAxis
                  dataKey="name"
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={12}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip cursor={{ fill: "#F8FAFC" }} />
                <Bar
                  dataKey="progress"
                  fill={primaryColor}
                  radius={[10, 10, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

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
              placeholder="Search student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#5D3FD3]/10 outline-none w-48"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="px-8 py-4 font-bold">Student ID / Name</th>
                <th className="px-8 py-4 font-bold">Campaign ID</th>
                <th className="px-8 py-4 font-bold text-center">Hours</th>
                <th className="px-8 py-4 font-bold">Status</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-8 py-8 text-center text-slate-400 font-medium"
                  >
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.attendanceId}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-5 font-semibold text-slate-700">
                      {log.student}{" "}
                      {/* هنا يظهر الـ ID أو الاسم الراجع من السيرفر */}
                    </td>
                    <td className="px-8 py-5 text-slate-500 text-sm">
                      {log.campaign}
                    </td>
                    <td className="px-8 py-5 text-center font-bold text-[#5D3FD3]">
                      {log.hoursThatDay}h
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceProgress;
