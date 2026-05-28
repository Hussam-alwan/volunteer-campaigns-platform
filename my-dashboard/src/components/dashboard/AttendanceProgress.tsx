import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Users,
  TrendingUp,
  MoreHorizontal,
  Search,
  Plus,
  X,
  UserPlus,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import attendanceQueries from "@/API/Attendance/Attendancequeries";
import campaignQueries from "@/API/Campaingns/Campaingnqueries";
import type { ICampaign } from "@/API/Campaingns/Campaign.interfaces";

const AttendanceProgress = () => {
  // الحملة المختارة (افتراضياً من الـ URL أو الحملة رقم 1) ويمكن تغييرها من القائمة
  const { campaignId } = useParams();
  const [currentCampaignId, setCurrentCampaignId] = useState<number>(
    campaignId ? parseInt(campaignId) : 1,
  );

  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLogId, setEditingLogId] = useState(null);

  // تحديث الـ Initial State لتشمل الـ recordedBy الافتراضي من نظام الـ Auth عندكِ
  const initialFormState = {
    student: "",
    status: "PRESENT",
    hoursThatDay: "1",
    notes: "",
    attendanceDate: new Date().toISOString().split("T")[0],
    recordedBy: 2, // يمكنكِ مستقبلاً جلب الـ ID الخاص بالمشرف الحالي من الـ Auth Context/Zustand 🌟
  };

  const [formData, setFormData] = useState(initialFormState);

  // 1. 🔥 الاستدعاء النظيف والمعدل هنا: تم إلغاء تمرير الكائن المعقد لأن ملف الـ API صار يتعامل معه تلقائياً
  const { data: attendanceData, isLoading: isAttendanceLoading } =
    attendanceQueries.useGetAttendance(currentCampaignId);

  const { data: progressData, isLoading: isProgressLoading } =
    attendanceQueries.useGetProgress(currentCampaignId);

  // 2. استدعاء الـ Mutations
  const createAttendanceMutation =
    attendanceQueries.useCreateAttendance(currentCampaignId);

  const updateAttendanceMutation =
    attendanceQueries.useUpdateAttendance(currentCampaignId);

  // قائمة الحملات لاختيارها وعرض اسمها بدل الـ ID
  const { data: campaignsResp } = campaignQueries.useGetAllCampaigns({
    page: 0,
    size: 100,
  });
  const campaignsList: ICampaign[] =
    (campaignsResp as { content?: ICampaign[] })?.content ?? [];
  const campaignNameById = new Map<number, string>();
  campaignsList.forEach((c) => campaignNameById.set(c.campaignId, c.title));

  // 🔥 استخراج المصفوفة الخام وعكسها لتظهر السجلات الجديدة في الأعلى دائماً ومباشرة
  const rawAttendanceLogs =
    attendanceData?.content ||
    attendanceData?.data?.content ||
    attendanceData?.data ||
    [];

  const attendanceLogs = [...rawAttendanceLogs].reverse();

  const progressLogs =
    progressData?.content ||
    progressData?.data?.content ||
    progressData?.data ||
    [];

  // --- تأمين قائمة الطلاب ---
  const staticStudents = [
    { id: 1, name: "Aisha Rahman" },
    { id: 2, name: "Yousef Nabil" },
    { id: 3, name: "Hana Sami" },
    { id: 5, name: "Noor Fawzy" },
    { id: 11, name: "Lina Khaled" },
    { id: 12, name: "Ziad Helmy" },
  ];

  const dynamicStudentsMap = new Map();
  staticStudents.forEach((st) => dynamicStudentsMap.set(st.id, st));

  attendanceLogs.forEach((log) => {
    if (log.student && log.studentName) {
      dynamicStudentsMap.set(log.student, {
        id: log.student,
        name: log.studentName,
      });
    }
  });

  const uniqueStudents = Array.from(dynamicStudentsMap.values());
  // ----------------------------------------------------------------

  // الحسابات الديناميكية للمؤشرات
  const totalPresent = attendanceLogs.filter(
    (log) => log.status?.toUpperCase() === "PRESENT",
  ).length;

  const totalAbsent = attendanceLogs.filter(
    (log) => log.status?.toUpperCase() === "ABSENT",
  ).length;

  const activeVolunteers = new Set(attendanceLogs.map((log) => log.student))
    .size;

  const latestProgress =
    progressLogs && progressLogs.length > 0
      ? `${progressLogs[0].percentage}%`
      : "35%";

  const stats = [
    {
      label: "Total Present",
      value: totalPresent.toLocaleString(),
      icon: <CheckCircle2 size={22} />,
      bg: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      label: "Total Absent",
      value: totalAbsent.toLocaleString(),
      icon: <XCircle size={22} />,
      bg: "bg-rose-50",
      textColor: "text-rose-600",
    },
    {
      label: "Latest Progress Rate",
      value: latestProgress,
      icon: <TrendingUp size={22} />,
      bg: "bg-fuchsia-50",
      textColor: "text-fuchsia-600",
    },
    {
      label: "Active Volunteers",
      value: activeVolunteers.toString(),
      icon: <Users size={22} />,
      bg: "bg-purple-50",
      textColor: "text-[#5D3FD3]",
    },
  ];

  const filteredLogs = attendanceLogs.filter((log) =>
    log.studentName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "PRESENT":
        return "bg-emerald-50 text-emerald-600 border-emerald-100 w-20 inline-block text-center";
      case "ABSENT":
        return "bg-rose-50 text-rose-600 border-rose-100 w-20 inline-block text-center";
      case "LATE":
        return "bg-amber-50 text-amber-600 border-amber-200 w-20 inline-block text-center";
      default:
        return "bg-slate-50 text-slate-500 border-slate-100 w-20 inline-block text-center";
    }
  };

  const handleEditClick = (log) => {
    setEditingLogId(log.attendanceId || log.id || null);
    setFormData({
      student: log.student ? log.student.toString() : "",
      status: log.status || "PRESENT",
      hoursThatDay: log.hoursThatDay ? log.hoursThatDay.toString() : "1",
      notes: log.notes && log.notes !== "No notes" ? log.notes : "",
      attendanceDate:
        log.attendanceDate || new Date().toISOString().split("T")[0],
      recordedBy: log.recordedBy || 2,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const studentId = parseInt(formData.student);
    const hours = parseFloat(formData.hoursThatDay);

    if (isNaN(studentId)) {
      alert("Please select a valid student from the list.");
      return;
    }

    if (isNaN(hours)) {
      alert("Please enter a valid number for hours.");
      return;
    }

    if (hours < 0 || hours > 10) {
      alert("Hours that day cannot be more than 10.");
      return;
    }

    if (!formData.attendanceDate) {
      alert("Please select a date.");
      return;
    }

    const payload = {
      attendanceDate: formData.attendanceDate,
      status: formData.status.toUpperCase(),
      hoursThatDay: hours,
      notes: formData.notes.trim() || "No notes",
      student: studentId,
      recordedBy: formData.recordedBy,
    };

    const handleSuccess = (message) => {
      alert(message);

      // تصفير الكاش بالأسماء الصريحة المتوافقة مع ملف الـ Queries المحسّن
      queryClient.invalidateQueries({
        queryKey: ["get-attendance", currentCampaignId],
      });

      queryClient.invalidateQueries({
        queryKey: ["get-progress", currentCampaignId],
      });

      handleSuccessClose();
    };

    const handleError = (error) => {
      console.error("API Error Details:", error);
      const serverMessage =
        error?.response?.data?.message ||
        error?.response?.data?.code ||
        "Internal Server Error";
      alert(`Operation failed: ${serverMessage}`);
    };

    if (editingLogId && updateAttendanceMutation.mutate) {
      updateAttendanceMutation.mutate(
        { id: editingLogId, payload },
        {
          onSuccess: () =>
            handleSuccess("Attendance record updated successfully!"),
          onError: (err) => handleError(err),
        },
      );
    } else {
      createAttendanceMutation.mutate(payload, {
        onSuccess: () =>
          handleSuccess("Attendance record logged successfully!"),
        onError: (err) => handleError(err),
      });
    }
  };

  const handleSuccessClose = () => {
    setIsModalOpen(false);
    setEditingLogId(null);
    setFormData(initialFormState);
  };

  const isSaving =
    createAttendanceMutation.isPending || updateAttendanceMutation?.isPending;

  if (isAttendanceLoading || isProgressLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-b-[#5D3FD3]"></div>
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
        <div className="flex gap-2">
          <select
            value={currentCampaignId}
            onChange={(e) => setCurrentCampaignId(Number(e.target.value))}
            className="px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#5D3FD3]/10 cursor-pointer"
            title="Choose campaign"
          >
            {campaignsList.length === 0 && (
              <option value={currentCampaignId}>
                Campaign #{currentCampaignId}
              </option>
            )}
            {campaignsList.map((c) => (
              <option key={c.campaignId} value={c.campaignId}>
                {c.title}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setEditingLogId(null);
              setFormData(initialFormState);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#5D3FD3] text-white rounded-2xl font-semibold hover:bg-[#4C32B3] transition-all shadow-lg shadow-indigo-100"
          >
            <Plus size={18} />
            Log Attendance
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm group hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start">
              <div
                className={`p-4 rounded-2xl ${stat.bg} ${stat.textColor} group-hover:scale-110 transition-transform`}
              >
                {stat.icon}
              </div>
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

      {/* Attendance Table */}
      <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-xl font-bold text-slate-900">
            Recent Attendance Logs
          </h3>
          <div className="relative w-full sm:w-auto flex items-center gap-2">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSearchTerm(query.trim());
              }}
              className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#5D3FD3]/10 outline-none w-full sm:w-64"
            />
            <button
              type="button"
              onClick={() => setSearchTerm(query.trim())}
              className="px-3 py-2 bg-[#5D3FD3] text-white rounded-xl text-sm hover:opacity-90"
              title="Search"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSearchTerm("");
              }}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50"
              title="Clear"
            >
              Clear
            </button>
          </div>
        </div>

        <div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="px-8 py-4 font-bold">Student Name</th>
                <th className="px-8 py-4 font-bold">Campaign</th>
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
                filteredLogs.map((log, index) => (
                  <tr
                    key={log.attendanceId || `log-${index}`}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <span className="font-semibold text-slate-800">
                        {log.studentName || "Unknown Student"}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-slate-500 text-sm">
                      {campaignNameById.get(log.campaign) ?? `#${log.campaign}`}
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
                      <button
                        onClick={() => handleEditClick(log)}
                        className="text-slate-600 hover:text-[#5D3FD3] transition-colors p-1 rounded-lg hover:bg-slate-100"
                      >
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

      {/* Modal - تسجيل وتعديل الحضور */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] w-full max-w-md p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus size={20} className="text-[#5D3FD3]" />{" "}
                {editingLogId
                  ? "Edit Attendance Record"
                  : "New Attendance Record"}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingLogId(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                  Select Student *
                </label>
                <select
                  required
                  value={formData.student}
                  onChange={(e) =>
                    setFormData({ ...formData, student: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#5D3FD3]/20 font-medium text-slate-700"
                >
                  <option value="" disabled>
                    -- Choose Volunteer by Name --
                  </option>
                  {uniqueStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} (#{student.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.attendanceDate}
                  onChange={(e) =>
                    setFormData({ ...formData, attendanceDate: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#5D3FD3]/20 font-medium text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#5D3FD3]/20 font-medium text-slate-700"
                  >
                    <option value="PRESENT">PRESENT</option>
                    <option value="ABSENT">ABSENT</option>
                    <option value="LATE">LATE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                    Hours (max 10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={formData.hoursThatDay}
                    onChange={(e) =>
                      setFormData({ ...formData, hoursThatDay: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#5D3FD3]/20 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 tracking-wider">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="Optional notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#5D3FD3]/20"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingLogId(null);
                  }}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-semibold rounded-xl text-sm hover:bg-slate-200/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-[#5D3FD3] text-white font-semibold rounded-xl text-sm hover:bg-[#4C32B3] disabled:opacity-50 transition-all shadow-md shadow-indigo-50"
                >
                  {isSaving ? "Saving..." : "Save Record"}
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
