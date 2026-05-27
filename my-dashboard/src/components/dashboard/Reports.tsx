import { useQuery } from "@tanstack/react-query";
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
} from "recharts";
import {
  Users,
  LayoutDashboard,
  CheckCircle2,
  School,
  FileText,
  Loader2,
} from "lucide-react";
import ReportsService from "@/API/Reports/Reports.api"; // تأكدي من صحة مسار استيراد الـ Service عندك

function Reports() {
  const primaryPurple = "#0066cc";

  // 1. جلب الداتا الحقيقية من السيرفر باستخدام React Query
  const {
    data: stats,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: ReportsService.getDashboardStats,
  });

  // 2. معالجة حالة الـ Loading (انتظار تحميل البيانات أول مرة)
  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col justify-center items-center bg-transparent gap-3">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-500 font-bold">Loading System Analytics...</p>
      </div>
    );
  }

  // 3. معالجة حالة الـ Error (إذا السيرفر معطل أو طفا)
  if (isError) {
    return (
      <div className="w-full h-screen flex flex-col justify-center items-center bg-transparent gap-4">
        <p className="text-red-500 font-bold text-lg">
          Failed to load reports data from server.
        </p>
        <button
          onClick={() => refetch()}
          className="px-5 py-2 text-white bg-red-500 rounded-xl font-bold text-sm shadow-md hover:bg-red-600 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const collegeData =
    stats?.studentsPerCollege?.map((item) => ({
      name: item.collegeName.replace("يي", ""),
      students: item.studentCount,
    })) || [];

  const applicationCounts: Record<string, number> =
    stats?.applicationStatusCounts || {};
  const applicationStats = stats
    ? [
        {
          status: "Approved",
          value: applicationCounts.APPROVED || 0,
          color: "#34c759",
        },
        {
          status: "Pending",
          value: applicationCounts.PENDING || 0,
          color: "#ff9500",
        },
        {
          status: "Rejected",
          value: applicationCounts.REJECTED || 0,
          color: "#ff3b30",
        },
      ]
    : [];

  const barColors = [
    "#0066cc",
    "#34c759",
    "#ff9500",
    "#af52de",
    "#ff2d55",
    "#5ac8fa",
  ];

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            System <span style={{ color: primaryPurple }}>Analytics</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">
            Visualizing live data: Colleges, Campaigns & Applications
          </p>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Students",
            value: stats?.totalStudents.toLocaleString() || "0",
            icon: Users,
            color: "text-orange-500",
            bg: "bg-orange-50",
          },
          {
            label: "Active Campaigns",
            value: stats?.activeCampaigns || "0",
            icon: LayoutDashboard,
            color: "text-yellow-500",
            bg: "bg-yellow-50",
          },
          {
            label: "Colleges",
            value: stats?.colleges || "0",
            icon: School,
            color: "text-green-500",
            bg: "bg-green-50",
          },
          {
            label: "Avg. Attendance",
            value:
              stats?.avgAttendance != null
                ? `${stats.avgAttendance.toFixed(1)}%`
                : "0%",
            icon: CheckCircle2,
            color: "text-red-500",
            bg: "bg-red-50",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                <stat.icon size={24} />
              </div>
              <span className="text-indigo-500 text-xs font-bold bg-indigo-50 px-2 py-1 rounded-lg">
                Live
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
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
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
                    fill: "#64748B",
                    fontSize: 11,
                    fontWeight: "bold",
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#64748B",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                />
                <Tooltip
                  cursor={{ fill: "#f5f5f7" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="students" radius={[10, 10, 0, 0]} barSize={35}>
                  {collegeData.map((_, index) => (
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
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-green-50 text-green-500 rounded-lg">
              <FileText size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Application Status
            </h2>
          </div>
          <div className="h-[300px] w-full flex items-center justify-between">
            <div className="w-[60%] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={applicationStats}
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={6}
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
            </div>
            <div className="flex flex-col gap-4 w-[40%] pl-2">
              {applicationStats.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-slate-50 pb-2"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-semibold text-slate-500">
                      {item.status}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {item.value || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
