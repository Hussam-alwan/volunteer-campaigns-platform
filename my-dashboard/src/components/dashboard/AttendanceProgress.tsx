import { useState, useEffect, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { getUsers } from "@/API/User/user.api";
import useAuthStore from "@/store/auth.store";
import { toast } from "@/store/toast.store";
import type { IUser } from "@/API/User/User.interfaces";
import {
  Users,
  TrendingUp,
  SquarePen,
  Search,
  Plus,
  X,
  UserPlus,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import attendanceQueries from "@/API/Attendance/Attendancequeries";
import campaignQueries from "@/API/Campaingns/Campaingnqueries";
import Select from "@/components/layout/Select";
import type { ICampaign } from "@/API/Campaingns/Campaign.interfaces";
import type {
  IAttendance,
  IProgress,
  TAttendanceStatus,
} from "@/API/Attendance/Attendance.interfaces";

const AttendanceProgress = () => {
  // الحملة المختارة (افتراضياً من الـ URL أو الحملة رقم 1) ويمكن تغييرها من القائمة
  const { campaignId } = useParams();
  // 0 = "not chosen yet"; the query is disabled for 0 and we pick the first real
  // campaign once the list loads (campaign IDs start at 101, so a hardcoded 1 was wrong).
  const [currentCampaignId, setCurrentCampaignId] = useState<number>(
    campaignId ? parseInt(campaignId) : 0,
  );

  // المستخدم الحالي (المشرف) — يُستخدم كـ recordedBy عند تسجيل الحضور
  const currentUser = useAuthStore((s) => s.user);

  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLogId, setEditingLogId] = useState<number | null>(null);

  // recordedBy = الـ ID الخاص بالمستخدم الحالي (المشرف) المسجَّل دخوله
  const initialFormState = {
    student: "",
    status: "PRESENT",
    hoursThatDay: "1",
    notes: "",
    attendanceDate: new Date().toISOString().split("T")[0],
    recordedBy: currentUser?.userId ?? 0,
  };

  const [formData, setFormData] = useState(initialFormState);

  // قائمة المستخدمين الحقيقية لاختيار الطالب (المعرّفات تبدأ من 101)
  const [users, setUsers] = useState<IUser[]>([]);
  useEffect(() => {
    getUsers(0, 1000)
      .then((res) => setUsers(res?.content ?? []))
      .catch((err) => console.error(err));
  }, []);

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

  // عند تحميل قائمة الحملات: إذا لم تكن الحملة المختارة موجودة (مثلاً القيمة 0 الافتراضية)
  // نختار أول حملة حقيقية تلقائياً حتى تظهر البيانات بدون الحاجة لتحديث الصفحة.
  useEffect(() => {
    if (campaignsList.length === 0) return;
    const exists = campaignsList.some((c) => c.campaignId === currentCampaignId);
    if (!exists) setCurrentCampaignId(campaignsList[0].campaignId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignsResp]);

  // 🔥 استخراج المصفوفة الخام وعكسها لتظهر السجلات الجديدة في الأعلى دائماً ومباشرة
  // الرد قد يأتي بصيغة { content } من Spring Boot أو { data } حسب الـ endpoint
  const attRes = attendanceData as
    | { content?: IAttendance[]; data?: { content?: IAttendance[] } | IAttendance[] }
    | undefined;
  const rawAttendanceLogs: IAttendance[] =
    attRes?.content ||
    (attRes?.data as { content?: IAttendance[] })?.content ||
    (attRes?.data as IAttendance[]) ||
    [];

  const attendanceLogs = [...rawAttendanceLogs].reverse();

  const progRes = progressData as
    | { content?: IProgress[]; data?: { content?: IProgress[] } | IProgress[] }
    | undefined;
  const progressLogs: IProgress[] =
    progRes?.content ||
    (progRes?.data as { content?: IProgress[] })?.content ||
    (progRes?.data as IProgress[]) ||
    [];

  // --- قائمة الطلاب الحقيقية من قاعدة البيانات (معرّفات صحيحة 101+) ---
  const dynamicStudentsMap = new Map<number, { id: number; name: string }>();

  // الطلاب = المستخدمون الذين لديهم رقم طالب؛ إن لم يوجد أي طالب نعرض كل المستخدمين.
  const studentUsers = users.filter((u) => u.studentNumber);
  (studentUsers.length > 0 ? studentUsers : users).forEach((u) =>
    dynamicStudentsMap.set(u.userId, {
      id: u.userId,
      name: `${u.firstName} ${u.lastName}`,
    }),
  );

  // ندمج أي أسماء واردة في سجلات الحضور كاحتياط
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

  const getStatusStyle = (status?: string) => {
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

  const handleEditClick = (log: IAttendance & { id?: number }) => {
    setEditingLogId(log.attendanceId || log.id || null);
    setFormData({
      student: log.student ? log.student.toString() : "",
      status: log.status || "PRESENT",
      hoursThatDay: log.hoursThatDay ? log.hoursThatDay.toString() : "1",
      notes: log.notes && log.notes !== "No notes" ? log.notes : "",
      attendanceDate:
        log.attendanceDate || new Date().toISOString().split("T")[0],
      recordedBy: log.recordedBy || currentUser?.userId || 0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // الحملة يجب أن تكون محمّلة ومختارة (المعرّفات تبدأ من 101) وإلا فشل الطلب بـ "campaign not found"
    if (!currentCampaignId || !campaignNameById.has(currentCampaignId)) {
      toast.error("Please select a valid campaign first.");
      return;
    }

    const studentId = parseInt(formData.student);
    const hours = parseFloat(formData.hoursThatDay);
    const recordedById = currentUser?.userId ?? formData.recordedBy;

    if (!recordedById) {
      toast.error("You must be logged in to record attendance.");
      return;
    }

    if (isNaN(studentId)) {
      toast.error("Please select a valid student from the list.");
      return;
    }

    if (isNaN(hours)) {
      toast.error("Please enter a valid number for hours.");
      return;
    }

    if (hours < 0 || hours > 10) {
      toast.error("Hours that day cannot be more than 10.");
      return;
    }

    if (!formData.attendanceDate) {
      toast.error("Please select a date.");
      return;
    }

    const status = formData.status.toUpperCase() as TAttendanceStatus;

    const payload = {
      attendanceDate: formData.attendanceDate,
      status,
      hoursThatDay: status === "ABSENT" ? 0 : hours,
      notes: formData.notes.trim() || "No notes",
      student: studentId,
      recordedBy: recordedById,
    };

    const handleSuccess = (message: string) => {
      toast.success(message);

      // تصفير الكاش بالأسماء الصريحة المتوافقة مع ملف الـ Queries المحسّن
      queryClient.invalidateQueries({
        queryKey: ["get-attendance", currentCampaignId],
      });

      queryClient.invalidateQueries({
        queryKey: ["get-progress", currentCampaignId],
      });

      handleSuccessClose();
    };

    const handleError = (error: unknown) => {
      console.error("API Error Details:", error);
      const err = error as {
        response?: { data?: { message?: string; code?: string } };
      };
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.code ||
        "Internal Server Error";
      toast.error(`Operation failed: ${serverMessage}`);
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
    <div className="w-full space-y-8 px-6 md:px-10 py-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
            Attendance & <span className="text-[#5D3FD3]">Progress</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Monitor volunteer activity and milestones based on campaign data.
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={currentCampaignId}
            onChange={(e) => setCurrentCampaignId(Number(e.target.value))}
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
          </Select>
          <button
            onClick={() => {
              setEditingLogId(null);
              setFormData(initialFormState);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#5D3FD3] text-white rounded-full font-medium hover:bg-[#4C32B3] transition-all active:scale-95"
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
            className="bg-white p-6 rounded-[18px] border border-gray-200 group transition-all"
          >
            <div className="flex justify-between items-start">
              <div
                className={`p-4 rounded-2xl ${stat.bg} ${stat.textColor} group-hover:scale-110 transition-transform`}
              >
                {stat.icon}
              </div>
            </div>
            <div className="mt-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                {stat.label}
              </p>
              <p className="text-3xl font-semibold text-slate-900 mt-1">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-[18px] border border-gray-200 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-xl font-semibold text-slate-900">
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
              className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-full text-sm focus:ring-2 focus:ring-[#5D3FD3]/10 outline-none w-full sm:w-64"
            />
            <button
              type="button"
              onClick={() => setSearchTerm(query.trim())}
              className="px-4 py-2 bg-[#5D3FD3] text-white rounded-full text-sm hover:opacity-90 active:scale-95 transition-all"
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
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full text-sm hover:bg-slate-50 active:scale-95 transition-all"
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
                <th className="px-8 py-4 font-semibold">Student Name</th>
                <th className="px-8 py-4 font-semibold">Campaign</th>
                <th className="px-8 py-4 font-semibold text-center">Hours</th>
                <th className="px-8 py-4 font-semibold">Status</th>
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
                    <td className="px-8 py-5 text-center font-semibold text-[#5D3FD3]">
                      {log.hoursThatDay}h
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`px-3 py-1 rounded-lg text-[10px] font-semibold border ${getStatusStyle(log.status)}`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => handleEditClick(log)}
                        className="text-slate-600 hover:text-[#5D3FD3] transition-colors p-1 rounded-lg hover:bg-slate-100"
                      >
                        <SquarePen size={18} />
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
          <div className="bg-white rounded-[18px] w-full max-w-md p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
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
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5 tracking-wider">
                  Select Student *
                </label>
                <Select
                  required
                  wrapperClassName="block w-full"
                  className="bg-slate-50 border-slate-100"
                  value={formData.student}
                  onChange={(e) =>
                    setFormData({ ...formData, student: e.target.value })
                  }
                >
                  <option value="" disabled>
                    -- Choose Volunteer by Name --
                  </option>
                  {uniqueStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} (#{student.id})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5 tracking-wider">
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
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5 tracking-wider">
                    Status
                  </label>
                  <Select
                    wrapperClassName="block w-full"
                    className="bg-slate-50 border-slate-100"
                    value={formData.status}
                    onChange={(e) => {
                      const status = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        status,
                        // غياب = صفر ساعات
                        hoursThatDay:
                          status === "ABSENT" ? "0" : prev.hoursThatDay,
                      }));
                    }}
                  >
                    <option value="PRESENT">PRESENT</option>
                    <option value="ABSENT">ABSENT</option>
                    <option value="LATE">LATE</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5 tracking-wider">
                    Hours (max 10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    disabled={formData.status === "ABSENT"}
                    value={formData.hoursThatDay}
                    onChange={(e) =>
                      setFormData({ ...formData, hoursThatDay: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#5D3FD3]/20 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5 tracking-wider">
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
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-medium rounded-full text-sm hover:bg-slate-200/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-[#5D3FD3] text-white font-medium rounded-full text-sm hover:bg-[#4C32B3] disabled:opacity-50 transition-all"
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
