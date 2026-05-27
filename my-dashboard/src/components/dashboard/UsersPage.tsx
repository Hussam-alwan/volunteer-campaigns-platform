import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  UserCog,
  Ban,
  ShieldCheck,
  Users as UsersIcon,
  ShieldOff,
  CheckCircle2,
  Mail,
  Phone,
  Hash,
  GraduationCap,
  School,
  KeyRound,
  IdCard,
} from "lucide-react";

import {
  useGetAllUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useBanUser,
  type IUserRow,
  type IUserInput,
} from "../../API/Users/Users.apis";
import collegesQueries from "../../API/Colleges/Collegesqueries";

const primaryColor = "#0066cc";

const avatarPalette = [
  ["#0066cc", "#4ea1ff"],
  ["#34c759", "#7eea9a"],
  ["#ff9500", "#ffc266"],
  ["#af52de", "#d18cee"],
  ["#ff3b30", "#ff8a82"],
  ["#5ac8fa", "#a3e3ff"],
  ["#ffcc00", "#ffe07a"],
  ["#5856d6", "#9594ec"],
];

type StatusFilter = "all" | "active" | "banned";

const emptyForm: IUserInput = {
  studentNumber: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  academicYear: 1,
  isBanned: false,
  college: 0,
};

const formatDate = (iso: string) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso.split("T")[0];
  }
};

const getInitials = (first: string, last: string) =>
  `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";

const getAvatarColors = (seed: number) =>
  avatarPalette[Math.abs(seed) % avatarPalette.length];

const UsersPage = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [collegeFilter, setCollegeFilter] = useState<number | "all">("all");

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formData, setFormData] = useState<IUserInput>(emptyForm);

  const {
    data: usersResponse,
    isLoading,
    isFetching,
    isError,
  } = useGetAllUsers(pagination.pageIndex, pagination.pageSize);

  const { data: collegesResponse } = collegesQueries.useGetColleges({
    page: 0,
    size: 100,
  });

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const banMutation = useBanUser();

  const colleges = collegesResponse?.content ?? [];
  const collegesById = useMemo(() => {
    const map = new Map<number, string>();
    colleges.forEach((c) => map.set(c.collegeId, c.name));
    return map;
  }, [colleges]);

  const allUsers = usersResponse?.content ?? [];

  const stats = useMemo(() => {
    const total = allUsers.length;
    const banned = allUsers.filter((u) => u.isBanned).length;
    const active = total - banned;
    const distinctColleges = new Set(allUsers.map((u) => u.college)).size;
    return { total, active, banned, colleges: distinctColleges };
  }, [allUsers]);

  const filteredUsers: IUserRow[] = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    return allUsers.filter((u) => {
      if (statusFilter === "active" && u.isBanned) return false;
      if (statusFilter === "banned" && !u.isBanned) return false;
      if (collegeFilter !== "all" && u.college !== collegeFilter) return false;
      if (!term) return true;
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      return (
        fullName.includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.studentNumber ?? "").toLowerCase().includes(term)
      );
    });
  }, [allUsers, searchQuery, statusFilter, collegeFilter]);

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setSelectedId(null);
    setFormData({
      ...emptyForm,
      college: colleges[0]?.collegeId ?? 0,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (user: IUserRow) => {
    setIsEditMode(true);
    setSelectedId(user.userId);
    setFormData({
      studentNumber: user.studentNumber ?? "",
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: "",
      phone: user.phone ?? "",
      academicYear: user.academicYear ?? 1,
      isBanned: user.isBanned,
      college: user.college,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setSelectedId(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.college) {
      alert("Please choose a college.");
      return;
    }
    const payload: IUserInput = {
      ...formData,
      studentNumber: formData.studentNumber?.trim() || undefined,
      phone: formData.phone?.trim() || undefined,
      password:
        formData.password && formData.password.trim().length > 0
          ? formData.password
          : undefined,
    };
    try {
      if (isEditMode && selectedId != null) {
        await updateMutation.mutateAsync({ id: selectedId, payload });
      } else {
        if (!payload.password) {
          alert("Password is required for new users.");
          return;
        }
        await createMutation.mutateAsync(payload);
      }
      handleCloseModal();
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err && "response" in err
          ? // @ts-expect-error axios error shape
            (err.response?.data?.message ?? "Request failed.")
          : "Request failed.";
      alert(message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      alert("Could not delete user — they may be linked to other records.");
    }
  };

  const handleBanToggle = async (user: IUserRow) => {
    if (user.isBanned) {
      try {
        await updateMutation.mutateAsync({
          id: user.userId,
          payload: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            studentNumber: user.studentNumber ?? undefined,
            phone: user.phone ?? undefined,
            academicYear: user.academicYear ?? undefined,
            isBanned: false,
            college: user.college,
          },
        });
      } catch {
        alert("Could not unban user.");
      }
      return;
    }
    if (!window.confirm(`Ban ${user.firstName} ${user.lastName}?`)) return;
    try {
      await banMutation.mutateAsync(user.userId);
    } catch {
      alert("Could not ban user.");
    }
  };

  const isActionLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    banMutation.isPending;

  if (isError) {
    return (
      <div className="w-full p-8 text-center bg-red-50 text-red-600 rounded-2xl border border-red-100">
        <p className="font-bold">Failed to load users from the server.</p>
        <button
          onClick={() => window.location.reload()}
          style={{ backgroundColor: primaryColor }}
          className="mt-4 px-4 py-2 text-white rounded-xl text-xs font-bold shadow-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-7 p-2 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[34px] font-semibold text-[#1d1d1f] tracking-tight leading-tight">
            Platform <span style={{ color: primaryColor }}>Users</span>
          </h1>
          <p className="text-[#6e6e73] mt-2 text-[16px]">
            Manage every account on the platform — students, organizers, and
            admins.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          style={{ backgroundColor: primaryColor }}
          className="flex items-center gap-2 text-white px-6 py-2.5 rounded-full font-semibold text-[15px] shadow-md shadow-[#0066cc]/20 hover:bg-[#004999] transition-colors"
        >
          <Plus size={18} />
          Add New User
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats.total}
          icon={<UsersIcon size={20} />}
          iconBg="#e7f0ff"
          iconColor={primaryColor}
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={<CheckCircle2 size={20} />}
          iconBg="#e7fbef"
          iconColor="#16a34a"
        />
        <StatCard
          label="Banned"
          value={stats.banned}
          icon={<ShieldOff size={20} />}
          iconBg="#fdecea"
          iconColor="#dc2626"
        />
        <StatCard
          label="Colleges Represented"
          value={stats.colleges}
          icon={<School size={20} />}
          iconBg="#f1ebff"
          iconColor="#7c3aed"
        />
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or student number…"
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-[#0066cc]/10 text-sm"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-full">
          {(["all", "active", "banned"] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors capitalize ${
                statusFilter === status
                  ? "bg-white text-[#1d1d1f] shadow-sm"
                  : "text-[#6e6e73] hover:text-[#1d1d1f]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <select
          value={collegeFilter}
          onChange={(e) =>
            setCollegeFilter(
              e.target.value === "all" ? "all" : Number(e.target.value),
            )
          }
          className="px-4 py-2.5 bg-slate-50 border-none rounded-xl outline-none text-sm text-[#1d1d1f] focus:ring-2 focus:ring-[#0066cc]/10"
        >
          <option value="all">All colleges</option>
          {colleges.map((c) => (
            <option key={c.collegeId} value={c.collegeId}>
              {c.name}
            </option>
          ))}
        </select>

        {(isLoading || isFetching) && (
          <div
            className="animate-spin rounded-full h-5 w-5 border-b-2"
            style={{ borderColor: primaryColor }}
          />
        )}
      </div>

      {/* Table */}
      <div
        className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-opacity duration-300 ${
          isActionLoading || isLoading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fafafc] border-b border-[#e0e0e0]">
                {["User", "College", "Year", "Status", "Joined", "Actions"].map(
                  (label) => (
                    <th
                      key={label}
                      className={`px-6 py-4 font-medium text-[#6e6e73] text-[11px] uppercase tracking-[0.08em] ${
                        label === "Actions" ? "text-right" : ""
                      }`}
                    >
                      {label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16">
                    <div className="flex flex-col items-center gap-3 text-[#6e6e73]">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <UsersIcon size={26} className="text-slate-400" />
                      </div>
                      <p className="font-semibold text-[#1d1d1f] text-[15px]">
                        No users match the current filters
                      </p>
                      <p className="text-[13px]">
                        Try clearing the search or switching filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const [c1, c2] = getAvatarColors(user.userId);
                  return (
                    <tr
                      key={user.userId}
                      className="hover:bg-[#fafafc] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-[13px] shadow-sm flex-shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${c1}, ${c2})`,
                            }}
                          >
                            {getInitials(user.firstName, user.lastName)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#1d1d1f] text-[14px] truncate">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-[#6e6e73] text-[12px] truncate">
                              {user.email}
                            </p>
                            {user.studentNumber && (
                              <p className="text-[#a1a1a6] text-[11px] mt-0.5">
                                #{user.studentNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#3a3a3c] text-[13px]">
                        {collegesById.get(user.college) ?? `#${user.college}`}
                      </td>
                      <td className="px-6 py-4 text-[#3a3a3c] text-[13px]">
                        {user.academicYear ? `Year ${user.academicYear}` : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill banned={user.isBanned} />
                      </td>
                      <td className="px-6 py-4 text-[#6e6e73] text-[12px]">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <IconButton
                            title="Edit"
                            onClick={() => handleOpenEdit(user)}
                            hoverColor="#0066cc"
                          >
                            <Edit2 size={15} />
                          </IconButton>
                          <IconButton
                            title={user.isBanned ? "Unban" : "Ban"}
                            onClick={() => handleBanToggle(user)}
                            hoverColor={user.isBanned ? "#16a34a" : "#f59e0b"}
                          >
                            {user.isBanned ? (
                              <ShieldCheck size={15} />
                            ) : (
                              <Ban size={15} />
                            )}
                          </IconButton>
                          <IconButton
                            title="Delete"
                            onClick={() => handleDelete(user.userId)}
                            hoverColor="#ff3b30"
                          >
                            <Trash2 size={15} />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {usersResponse && usersResponse.totalPages > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#e0e0e0] text-[13px] text-[#6e6e73]">
            <span>
              Showing{" "}
              <span className="font-semibold text-[#1d1d1f]">
                {filteredUsers.length}
              </span>{" "}
              of {usersResponse.totalElements} · Page{" "}
              {pagination.pageIndex + 1} of {usersResponse.totalPages || 1}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    pageIndex: Math.max(0, p.pageIndex - 1),
                  }))
                }
                disabled={pagination.pageIndex === 0}
                className="px-4 py-1.5 rounded-full border border-[#e0e0e0] hover:bg-[#fafafc] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPagination((p) => ({
                    ...p,
                    pageIndex: Math.min(
                      (usersResponse.totalPages || 1) - 1,
                      p.pageIndex + 1,
                    ),
                  }))
                }
                disabled={
                  pagination.pageIndex >= (usersResponse.totalPages || 1) - 1
                }
                className="px-4 py-1.5 rounded-full border border-[#e0e0e0] hover:bg-[#fafafc] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div
              style={{ backgroundColor: primaryColor }}
              className="p-6 flex justify-between items-center text-white"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <UserCog size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">
                    {isEditMode ? "Edit User" : "Add New User"}
                  </h2>
                  <p className="text-indigo-100 text-xs mt-0.5 opacity-80">
                    {isEditMode
                      ? "Update this user's profile and access"
                      : "Create a new platform account"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Profile section */}
              <Section title="Profile">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="First Name" icon={<IdCard size={14} />}>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData((d) => ({
                          ...d,
                          firstName: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Last Name" icon={<IdCard size={14} />}>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData((d) => ({ ...d, lastName: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Student Number" icon={<Hash size={14} />}>
                    <input
                      type="text"
                      value={formData.studentNumber ?? ""}
                      onChange={(e) =>
                        setFormData((d) => ({
                          ...d,
                          studentNumber: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Phone (10 digits)" icon={<Phone size={14} />}>
                    <input
                      type="tel"
                      pattern="\d{10}"
                      value={formData.phone ?? ""}
                      onChange={(e) =>
                        setFormData((d) => ({ ...d, phone: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>
              </Section>

              {/* Account section */}
              <Section title="Account">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Email" icon={<Mail size={14} />}>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((d) => ({ ...d, email: e.target.value }))
                      }
                      className={inputClass}
                    />
                  </Field>
                  <Field
                    label={
                      isEditMode
                        ? "Password (leave blank to keep current)"
                        : "Password (min 8 chars)"
                    }
                    icon={<KeyRound size={14} />}
                  >
                    <input
                      type="password"
                      required={!isEditMode}
                      minLength={isEditMode ? undefined : 8}
                      value={formData.password ?? ""}
                      onChange={(e) =>
                        setFormData((d) => ({
                          ...d,
                          password: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>
              </Section>

              {/* Affiliation section */}
              <Section title="Affiliation">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="College" icon={<School size={14} />}>
                    <select
                      required
                      value={formData.college || ""}
                      onChange={(e) =>
                        setFormData((d) => ({
                          ...d,
                          college: Number(e.target.value),
                        }))
                      }
                      className={inputClass}
                    >
                      <option value="" disabled>
                        Select a college…
                      </option>
                      {colleges.map((c) => (
                        <option key={c.collegeId} value={c.collegeId}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="Academic Year"
                    icon={<GraduationCap size={14} />}
                  >
                    <input
                      type="number"
                      min={1}
                      max={7}
                      value={formData.academicYear ?? 1}
                      onChange={(e) =>
                        setFormData((d) => ({
                          ...d,
                          academicYear: Number(e.target.value),
                        }))
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>
              </Section>

              {/* Status */}
              <Section title="Access">
                <label
                  className={`flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border transition-colors cursor-pointer ${
                    formData.isBanned
                      ? "bg-red-50/60 border-red-100"
                      : "bg-slate-50 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        formData.isBanned
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {formData.isBanned ? (
                        <Ban size={18} />
                      ) : (
                        <ShieldCheck size={18} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1d1d1f]">
                        {formData.isBanned ? "Banned" : "Active"}
                      </p>
                      <p className="text-xs text-[#6e6e73]">
                        {formData.isBanned
                          ? "User cannot log in or interact with campaigns."
                          : "User has full access to the platform."}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isBanned}
                    onChange={(e) =>
                      setFormData((d) => ({
                        ...d,
                        isBanned: e.target.checked,
                      }))
                    }
                    className="w-4 h-4"
                  />
                </label>
              </Section>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  style={{ backgroundColor: primaryColor }}
                  className="flex-1 px-6 py-3 text-white font-bold rounded-2xl shadow-lg shadow-[#0066cc]/20 hover:opacity-90 transition-all text-sm disabled:opacity-50"
                >
                  {isActionLoading
                    ? "Saving…"
                    : isEditMode
                      ? "Save Changes"
                      : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const inputClass =
  "w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:ring-2 focus:ring-[#0066cc]/10 focus:bg-white focus:border-[#0066cc]/20 outline-none transition-all text-sm";

const StatCard = ({
  label,
  value,
  icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
}) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: iconBg, color: iconColor }}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[12px] uppercase tracking-wider text-[#6e6e73] font-medium">
        {label}
      </p>
      <p className="text-[26px] font-semibold text-[#1d1d1f] leading-tight">
        {value}
      </p>
    </div>
  </div>
);

const StatusPill = ({ banned }: { banned: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
      banned ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${
        banned ? "bg-red-500" : "bg-green-500"
      }`}
    />
    {banned ? "Banned" : "Active"}
  </span>
);

const IconButton = ({
  title,
  onClick,
  hoverColor,
  children,
}: {
  title: string;
  onClick: () => void;
  hoverColor: string;
  children: ReactNode;
}) => (
  <button
    title={title}
    onClick={onClick}
    style={{ ["--hover-color" as string]: hoverColor }}
    className="p-2 text-[#6e6e73] hover:bg-[#f5f5f7] rounded-lg transition-colors hover:text-[var(--hover-color)]"
  >
    {children}
  </button>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="space-y-3">
    <h3 className="text-[11px] font-bold text-[#6e6e73] uppercase tracking-[0.1em]">
      {title}
    </h3>
    {children}
  </div>
);

const Field = ({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
      {icon}
      <span>{label}</span>
    </label>
    {children}
  </div>
);

export default UsersPage;
