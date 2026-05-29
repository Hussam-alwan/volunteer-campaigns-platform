import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Plus, CheckCircle, Users, Clock, Target } from "lucide-react";
// import Navbar from "../components/layout/Navbar";
import dashboardApi from "@/API/Dasgboard/Dashboard.apis";
import campaignApis from "@/API/Campaingns/Campaign.apis";
import attendanceApis from "@/API/Attendance/Attendance.apis";
import type { IDashboardSummary } from "@/API/Dasgboard/Dashboard.interfaces";
import type { ICampaign } from "@/API/Campaingns/Campaign.interfaces";
import type { IProgress } from "@/API/Attendance/Attendance.interfaces";
import { useNavigate } from "react-router-dom";

// chart and pie data are populated from backend

const Dashboard = () => {
  const [summary, setSummary] = useState<IDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [campaignsForChart, setCampaignsForChart] = useState<ICampaign[]>([]);
  const [progressByCampaign, setProgressByCampaign] = useState<
    Record<number, number>
  >({});
  const [selectedMonth, setSelectedMonth] = useState<string>(""); // "YYYY-MM"، فارغ = كل الشهور

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const s = await dashboardApi.getDashboardSummary();
        if (!mounted) return;
        setSummary(s);
        setRequiresAuth(false);
      } catch (err: unknown) {
        if (!mounted) return;
        if ((err as { isAuth?: boolean })?.isAuth) setRequiresAuth(true);
        setSummary(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const loadCampaigns = async () => {
      try {
        const res = await campaignApis.getAllCampaigns({ page: 0, size: 100 });
        const list = (res as { content?: ICampaign[] })?.content ?? [];
        if (!mounted) return;
        setCampaignsForChart(list);

        // التقدّم لا يأتي مع بيانات الحملة، فنجلبه من endpoint التقدّم لكل حملة جارية
        const running = list.filter((c) =>
          ["ONGOING", "ACTIVE"].includes((c.status || "").toUpperCase()),
        );

        const entries = await Promise.all(
          running.map(async (c) => {
            try {
              const pr = await attendanceApis.getProgress(c.campaignId, {
                page: 0,
                size: 100,
              });
              const items =
                (pr as { content?: IProgress[] })?.content ??
                (pr as { data?: IProgress[] })?.data ??
                [];
              const sorted = [...items].sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime(),
              );
              const latest = sorted.length
                ? sorted[sorted.length - 1].percentage
                : 0;
              return [c.campaignId, latest] as const;
            } catch {
              return [c.campaignId, 0] as const;
            }
          }),
        );

        if (mounted) setProgressByCampaign(Object.fromEntries(entries));
      } catch (err: unknown) {
        if ((err as { isAuth?: boolean })?.isAuth) setRequiresAuth(true);
      }
    };

    void load();
    void loadCampaigns();

    return () => {
      mounted = false;
    };
  }, []);

  const pieData = useMemo(() => {
    return [
      {
        name: "Accepted",
        value: summary?.byStatus.approved ?? 0,
        color: "#5D3FD3",
      },
      {
        name: "Pending",
        value: summary?.byStatus.pending ?? 0,
        color: "#8B5CF6",
      },
      {
        name: "Rejected",
        value: summary?.byStatus.rejected ?? 0,
        color: "#22D3EE",
      },
      {
        name: "Withdrawn",
        value: summary?.byStatus.withdrawn ?? 0,
        color: "#F472B6",
      },
    ];
  }, [summary]);

  const totalPie = useMemo(
    () => pieData.reduce((acc, it) => acc + it.value, 0) || 1,
    [pieData],
  );

  const cards = useMemo(
    () => [
      {
        label: "Active Campaigns",
        val: loading ? "..." : String(summary?.activeCampaigns ?? 0),
        icon: <Target className="text-indigo-500" />,
      },
      {
        label: "Total Volunteers",
        val: loading ? "..." : String(summary?.totalVolunteers ?? 0),
        icon: <Users className="text-blue-500" />,
      },
      {
        label: "Accepted Apps",
        val: loading ? "..." : String(summary?.byStatus.approved ?? 0),
        icon: <CheckCircle className="text-emerald-500" />,
      },
      {
        label: "Pending Apps",
        val: loading ? "..." : String(summary?.byStatus.pending ?? 0),
        icon: <Clock className="text-amber-500" />,
      },
    ],
    [loading, summary],
  );

  // الحملات الجارية (Running) مع تصفية اختيارية حسب الشهر المختار
  const campaignProgressData = useMemo(() => {
    const running = campaignsForChart.filter((c) =>
      ["ONGOING", "ACTIVE"].includes((c.status || "").toUpperCase()),
    );

    const inSelectedMonth = (c: ICampaign) => {
      if (!selectedMonth) return true;
      const [y, m] = selectedMonth.split("-").map(Number);
      const monthStart = new Date(y, m - 1, 1);
      const monthEnd = new Date(y, m, 0, 23, 59, 59);
      const start = c.startDate ? new Date(c.startDate) : null;
      const end = c.endDate ? new Date(c.endDate) : null;
      if (!start || !end) return true;
      return start <= monthEnd && end >= monthStart;
    };

    return running.filter(inSelectedMonth).map((c) => ({
      name: c.title,
      percentage: progressByCampaign[c.campaignId] ?? 0,
    }));
  }, [campaignsForChart, selectedMonth, progressByCampaign]);

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen">
      {/* <Navbar /> */}

      <div className="px-6 md:px-12 py-10 space-y-12">
        <div className="flex justify-between items-center">
          <h2 className="text-4xl font-semibold text-slate-800">Dashboard</h2>
          <div className="flex gap-3">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white px-5 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-[#5D3FD3]/10"
              title="Filter dashboard by month"
            />
            {selectedMonth && (
              <button
                onClick={() => setSelectedMonth("")}
                className="bg-white px-5 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-slate-500 hover:bg-gray-50 active:scale-95 transition-all"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => navigate("/campaigns")}
              className="bg-[#5D3FD3] text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
            >
              <Plus size={18} /> Create New Campaign
            </button>
          </div>
        </div>

        {requiresAuth && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mt-4">
            <p className="text-red-800 font-medium">
              يتطلب عرض الإحصاءات تسجيل الدخول.
            </p>
            <p className="text-sm text-red-700">
              الرجاء تسجيل الدخول لحسابك لعرض البيانات الحقيقية.
            </p>
            <a
              href="/login"
              className="inline-block mt-2 text-sm text-red-600 underline"
            >
              اذهب إلى صفحة تسجيل الدخول
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-[18px] border border-gray-200 flex flex-col gap-3"
            >
              <div className="bg-slate-50 w-10 h-10 rounded-xl flex items-center justify-center">
                {card.icon}
              </div>
              <p className="text-slate-500 text-sm font-medium">{card.label}</p>
              <h4 className="text-2xl font-semibold text-slate-900">
                {card.val}
              </h4>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-8 rounded-[18px] border border-gray-200 relative">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-semibold text-slate-800 text-lg">
                Campaign Progress
              </h3>
              {selectedMonth && (
                <span className="text-xs font-semibold text-slate-400">
                  {new Date(`${selectedMonth}-01`).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
            <div className="h-80 w-full min-h-80">
              {campaignProgressData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                  No running campaigns
                  {selectedMonth ? " for the selected month" : ""}.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={campaignProgressData} margin={{ top: 10 }}>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94A3B8", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94A3B8", fontSize: 12 }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      cursor={{ fill: "#F8FAFC" }}
                      formatter={(v) => [`${v}%`, "Progress"]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="percentage"
                      fill="#5D3FD3"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[18px] border border-gray-200">
            <h3 className="font-semibold text-slate-800 text-lg mb-2">
              Application Summary
            </h3>
            <p className="text-slate-400 text-xs mb-6">
              Total Applications:{" "}
              {loading ? "..." : String(summary?.totalApplications ?? 0)}
            </p>

            <div className="flex w-full h-4 rounded-full overflow-hidden mb-8">
              {pieData.map((d, i) => (
                <div
                  key={i}
                  style={{
                    width: `${(d.value / totalPie) * 100}%`,
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
                  <span className="text-slate-900 font-semibold">
                    {item.value}
                  </span>
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
