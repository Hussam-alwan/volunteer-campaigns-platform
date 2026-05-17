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
} from "recharts";
import {
  MoreHorizontal,
  Plus,
  Calendar,
  CheckCircle,
  Users,
  Clock,
  Target, // تم الإصلاح: إضافة Target
} from "lucide-react";
import Navbar from "../components/layout/Navbar";

const chartData = [
  { name: "12", hours: 60, volunteers: 40 },
  { name: "13", hours: 45, volunteers: 30 },
  { name: "14", hours: 55, volunteers: 45 },
  { name: "15", hours: 85, volunteers: 70 },
  { name: "16", hours: 50, volunteers: 35 },
  { name: "17", hours: 70, volunteers: 55 },
  { name: "18", hours: 80, volunteers: 65 },
];

const pieData = [
  { name: "Accepted", value: 745, color: "#5D3FD3" },
  { name: "Pending", value: 173, color: "#8B5CF6" },
  { name: "Rejected", value: 287, color: "#22D3EE" },
  { name: "Draft", value: 241, color: "#F472B6" },
];

const Dashboard = () => {
  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen">
      <Navbar />

      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
            Dashboard
          </h2>
          <div className="flex gap-3">
            <button className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold flex items-center gap-2 shadow-sm">
              <Calendar size={18} /> This Month
            </button>
            <button className="bg-[#5D3FD3] text-white px-5 py-2 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-indigo-100">
              <Plus size={18} /> Create New Campaign
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              label: "Active Campaigns",
              val: "12",
              icon: <Target className="text-indigo-500" />,
            },
            {
              label: "Total Volunteers",
              val: "245",
              icon: <Users className="text-blue-500" />,
            },
            {
              label: "Accepted Apps",
              val: "173",
              icon: <CheckCircle className="text-emerald-500" />,
            },
            {
              label: "Pending Apps",
              val: "32",
              icon: <Clock className="text-amber-500" />,
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-50 flex flex-col gap-3"
            >
              <div className="bg-slate-50 w-10 h-10 rounded-xl flex items-center justify-center">
                {card.icon}
              </div>
              <p className="text-slate-500 text-sm font-medium">{card.label}</p>
              <h4 className="text-2xl font-bold text-slate-900">{card.val}</h4>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-50 shadow-sm relative">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-slate-800 text-lg">
                Attendance Insights
              </h3>
              <div className="flex gap-4 text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#5D3FD3]" /> Hours
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-200" />{" "}
                  Volunteers
                </span>
              </div>
            </div>
            {/* تم الإصلاح: إضافة w-full و minWidth */}
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 12 }}
                    dy={10}
                  />
                  <Tooltip
                    cursor={{ fill: "#F8FAFC" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="hours"
                    fill="#5D3FD3"
                    radius={[4, 4, 0, 0]}
                    barSize={25}
                  />
                  <Bar
                    dataKey="volunteers"
                    fill="#E2E8F0"
                    radius={[4, 4, 0, 0]}
                    barSize={25}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-50 shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-2">
              Application Summary
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              Total Applications: 1245
            </p>

            <div className="flex w-full h-4 rounded-full overflow-hidden mb-8">
              {pieData.map((d, i) => (
                <div
                  key={i}
                  style={{
                    width: `${(d.value / 1446) * 100}%`,
                    backgroundColor: d.color,
                  }}
                />
              ))}
            </div>

            <div className="space-y-5">
              {pieData.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-sm font-medium"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-slate-900 font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ... بقية الأجزاء السفلية تعمل بشكل صحيح ... */}
      </div>
    </div>
  );
};

export default Dashboard;
