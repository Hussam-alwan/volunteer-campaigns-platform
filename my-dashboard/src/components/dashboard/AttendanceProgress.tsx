import { useState, useMemo, type FormEvent } from "react";
import {
  Clock,
  Users,
  TrendingUp,
  Search,
  ArrowUpRight,
  Plus,
  X,
  UserPlus,
} from "lucide-react";

import attendanceQueries from "@/API/Attendance/Attendancequeries";
import campaignQueries from "@/API/Campaingns/Campaingnqueries";
import { useGetAllUsers } from "@/API/Users/Users.apis";
import type {
  IAttendanceInput,
  TAttendanceStatus,
} from "@/API/Attendance/Attendance.interfaces";

type AttendanceFormState = {
  student: number | "";
  status: TAttendanceStatus;
  hoursThatDay: number;
  notes: string;
  attendanceDate: string;
};

const emptyForm: AttendanceFormState = {
  student: "",
  status: "PRESENT",
  hoursThatDay: 1,
  notes: "",
  attendanceDate: new Date().toISOString().split("T")[0],
};

const AttendanceProgress = () => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const { data: campaignsPage, isLoading: campaignsLoading } =
    campaignQueries.useGetAllCampaigns({ page: 0, size: 50 });
  const campaigns = campaignsPage?.content || [];

  const activeCampaignId =
    selectedCampaignId ?? (campaigns[0]?.id || 0);

  const { data: attendancePage, isLoading: attendanceLoading } =
    attendanceQueries.useGetAttendance(activeCampaignId);
  const { data: progressPage } = attendanceQueries.useGetProgress(
    activeCampaignId,
  );
  const { data: usersPage } = useGetAllUsers();

  const createAttendance =
    attendanceQueries.useCreateAttendance(activeCampaignId);

  const attendanceLogs = useMemo(
    () => [...(attendancePage?.content || [])].reverse(),
    [attendancePage],
  );
  const progressLogs = progressPage?.content || [];
  const users = usersPage?.content || [];

  const totalHours = attendanceLogs.reduce(
    (acc, log) => acc + (log.hoursThatDay || 0),
    0,
  );
  const activeVolunteers = new Set(attendanceLogs.map((l) => l.student)).size;
  const latestProgress = progressLogs[0]
    ? `${progressLogs[0].percentage}%`
    : "0%";

  const filteredLogs = attendanceLogs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.studentName?.toLowerCase().includes(term) ||
      String(log.student).includes(term)
    );
  });

  const stats = [
    {
      label: "Total Volunteer Hours",
      value: totalHours.toLocaleString(),
      icon: <Clock size={22} />,
      change: "live",
      bg: "bg-purple-50",
      textColor: "text-[#0066cc]",
    },
    {
      label: "Latest Progress",
      value: latestProgress,
      icon: <TrendingUp size={22} />,
      change: "live",
      bg: "bg-fuchsia-50",
      textColor: "text-fuchsia-600",
    },
    {
      label: "Active Volunteers",
      value: activeVolunteers.toString(),
      icon: <Users size={22} />,
      change: "live",
      bg: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PRESENT":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "ABSENT":
        return "bg-rose-50 text-rose-600 border-rose-100";
      case "LATE":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "EXCUSED":
        return "bg-blue-50 text-blue-600 border-blue-100";
      default:
        return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(emptyForm);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!activeCampaignId) {
      alert("Pick a campaign first.");
      return;
    }
    if (formData.student === "") {
      alert("Select a student.");
      return;
    }
    const payload: IAttendanceInput = {
      attendanceDate: formData.attendanceDate,
      status: formData.status,
      hoursThatDay: Number(formData.hoursThatDay),
      notes: formData.notes?.trim() || undefined,
      student: Number(formData.student),
    };
    createAttendance.mutate(payload, {
      onSuccess: () => closeModal(),
      onError: (err) => {
        const detail = (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message;
        alert(detail || "Failed to save attendance.");
      },
    });
  };

  if (campaignsLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-b-[#0066cc]"></div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="w-full p-8 text-center bg-amber-50 text-amber-700 rounded-2xl border border-amber-100">
        <p className="font-bold">
          No campaigns exist yet — create one in the Campaigns page first.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 p-2 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Attendance & <span className="text-[#0066cc]">Progress</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Monitor volunteer activity for a campaign.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={activeCampaignId || ""}
            onChange={(e) => setSelectedCampaignId(Number(e.target.value))}
            className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#0066cc]/20"
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} (#{c.id})
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setFormData(emptyForm);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0066cc] text-white rounded-full font-semibold hover:bg-[#004999] transition-colors"
          >
            <Plus size={18} />
            Log Attendance
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm group hover:shadow-md transition-all"
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-xl font-bold text-slate-900">
            Attendance Logs for Campaign #{activeCampaignId}
          </h3>
          <div className="relative w-full sm:w-auto">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#0066cc]/10 outline-none w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="px-8 py-4 font-bold">Student</th>
                <th className="px-8 py-4 font-bold">Date</th>
                <th className="px-8 py-4 font-bold text-center">Hours</th>
                <th className="px-8 py-4 font-bold">Status</th>
                <th className="px-8 py-4 font-bold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {attendanceLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-8 py-8 text-center text-slate-400 font-medium"
                  >
                    Loading…
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
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
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <span className="font-semibold text-slate-800">
                        {log.studentName || "Unknown Student"}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-slate-500 text-sm">
                      {log.attendanceDate}
                    </td>
                    <td className="px-8 py-5 text-center font-bold text-[#0066cc]">
                      {log.hoursThatDay}h
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${getStatusStyle(log.status)}`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-slate-500 text-sm max-w-xs truncate">
                      {log.notes || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus size={20} className="text-[#0066cc]" /> New
                Attendance Record
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                  Student
                </label>
                <select
                  required
                  value={formData.student}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      student: e.target.value ? Number(e.target.value) : "",
                    })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#0066cc]/20 font-medium text-slate-700"
                >
                  <option value="" disabled>
                    -- Choose Volunteer --
                  </option>
                  {users.map((u) => (
                    <option key={u.userId} value={u.userId}>
                      {u.firstName} {u.lastName} (#{u.userId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as IAttendanceInput["status"],
                      })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#0066cc]/20 font-medium text-slate-700"
                  >
                    <option value="PRESENT">PRESENT</option>
                    <option value="ABSENT">ABSENT</option>
                    <option value="LATE">LATE</option>
                    <option value="EXCUSED">EXCUSED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                    Hours
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={formData.hoursThatDay}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hoursThatDay: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#0066cc]/20 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.attendanceDate}
                  onChange={(e) =>
                    setFormData({ ...formData, attendanceDate: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#0066cc]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#0066cc]/20"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-semibold rounded-xl text-sm hover:bg-slate-200/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAttendance.isPending}
                  className="flex-1 py-2.5 bg-[#0066cc] text-white font-semibold rounded-xl text-sm hover:bg-[#004999] disabled:opacity-50 transition-all shadow-md shadow-indigo-50"
                >
                  {createAttendance.isPending ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AttendanceProgress;
