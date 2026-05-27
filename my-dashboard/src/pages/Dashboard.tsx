import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Plus, CheckCircle, Users, Clock, Target } from "lucide-react";
import dashboardApi from "@/API/Dasgboard/Dashboard.apis";
import type { IDashboardSummary } from "@/API/Dasgboard/Dashboard.interfaces";

// chart and pie data are populated from backend

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<IDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [chartDataState, setChartDataState] = useState<
    { name: string; percentage: number }[]
  >([]);

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

    const loadChart = async () => {
      try {
        const data = await dashboardApi.getAttendanceChartData();
        if (mounted) setChartDataState(data || []);
      } catch (err: unknown) {
        if ((err as { isAuth?: boolean })?.isAuth) setRequiresAuth(true);
      }
    };

    void load();
    void loadChart();

    return () => {
      mounted = false;
    };
  }, []);

  const pieData = useMemo(() => {
    return [
      {
        name: "Accepted",
        value: summary?.byStatus.approved ?? 0,
        color: "#34c759",
      },
      {
        name: "Pending",
        value: summary?.byStatus.pending ?? 0,
        color: "#ff9500",
      },
      {
        name: "Rejected",
        value: summary?.byStatus.rejected ?? 0,
        color: "#ff3b30",
      },
      {
        name: "Withdrawn",
        value: summary?.byStatus.withdrawn ?? 0,
        color: "#8e8e93",
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

  return (
    <div className="w-full">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
            Dashboard
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/campaigns")}
              className="bg-[#0066cc] text-white px-5 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-[#004999] transition-colors"
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
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-50 flex flex-col gap-3"
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
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-50 shadow-sm relative">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-semibold text-[#1d1d1f] text-[17px]">
                Campaign Progress
              </h3>
              <span className="flex items-center gap-2 text-xs font-semibold text-[#6e6e73]">
                <div className="w-2 h-2 rounded-full bg-[#0066cc]" />
                Latest %
              </span>
            </div>
            {/* تم الإصلاح: إضافة w-full و minWidth */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={
                    chartDataState.length
                      ? chartDataState
                      : [{ name: "-", percentage: 0 }]
                  }
                >
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 12 }}
                    dy={10}
                  />
                  <Tooltip
                    cursor={{ fill: "#f5f5f7" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="percentage"
                    fill="#0066cc"
                    radius={[4, 4, 0, 0]}
                    barSize={25}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-50 shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-2">
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
