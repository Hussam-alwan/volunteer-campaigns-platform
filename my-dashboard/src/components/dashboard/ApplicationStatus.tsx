"use client";

import {
  ChevronDown,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Plus,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/layout/Avatar";
import { cn } from "@/pages/lib/utils";
import {
  getApplications,
  createApplication,
  updateApplicationStatus,
} from "@/API/Application/Application.apis";
import type {
  IApplication,
  ICreateApplicationInput,
} from "@/API/Application/Application.interfaces";
import { useGetAllUsers } from "@/API/Users/Users.apis";
import campaignQueries from "@/API/Campaingns/Campaingnqueries";
import { useEffect, useMemo, useState } from "react";

const statusStyles = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const getApplicationDate = (application: IApplication) =>
  new Date(application.appliedAt ?? application.createdAt);

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

function ApplicationStatus() {
  const [allApplications, setAllApplications] = useState<IApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showMonthMenu, setShowMonthMenu] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    motivationLetter: "",
    student: "",
    campaign: "",
  });
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);
  const [viewingMotivation, setViewingMotivation] =
    useState<IApplication | null>(null);

  const { data: usersPage } = useGetAllUsers();
  const { data: campaignsPage } = campaignQueries.useGetAllCampaigns({
    page: 0,
    size: 50,
  });
  const usersList = useMemo(() => usersPage?.content || [], [usersPage]);
  const campaignsList = useMemo(
    () => campaignsPage?.content || [],
    [campaignsPage],
  );

  const userMap = useMemo(() => {
    const m = new Map<number, { firstName: string; lastName: string }>();
    usersList.forEach((u) =>
      m.set(u.userId, { firstName: u.firstName, lastName: u.lastName }),
    );
    return m;
  }, [usersList]);

  const campaignMap = useMemo(() => {
    const m = new Map<number, string>();
    campaignsList.forEach((c) => m.set(c.id, c.title));
    return m;
  }, [campaignsList]);

  const studentLabel = (id: number) => {
    const u = userMap.get(id);
    return u ? `${u.firstName} ${u.lastName}` : `Student #${id}`;
  };
  const campaignLabel = (id: number) =>
    campaignMap.get(id) ?? `Campaign #${id}`;

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await getApplications();
        setAllApplications(data.content);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const monthOptions = useMemo(() => {
    const months = new Map<string, string>();

    allApplications.forEach((application) => {
      const date = getApplicationDate(application);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const monthKey = getMonthKey(date);

      if (!months.has(monthKey)) {
        months.set(
          monthKey,
          date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
        );
      }
    });

    return Array.from(months.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((left, right) => right.value.localeCompare(left.value));
  }, [allApplications]);

  const visibleApplications = useMemo(() => {
    const filtered =
      selectedMonth === "all"
        ? allApplications
        : allApplications.filter((application) => {
            const date = getApplicationDate(application);

            if (Number.isNaN(date.getTime())) {
              return false;
            }

            return getMonthKey(date) === selectedMonth;
          });

    return [...filtered].sort((left, right) => {
      const leftTime = getApplicationDate(left).getTime();
      const rightTime = getApplicationDate(right).getTime();

      return sortOrder === "newest"
        ? rightTime - leftTime
        : leftTime - rightTime;
    });
  }, [allApplications, selectedMonth, sortOrder]);

  const searchedApplications = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return visibleApplications;
    }

    return visibleApplications.filter((application) => {
      const studentText = `student ${application.student}`.toLowerCase();
      const campaignText = `campaign ${application.campaign}`.toLowerCase();
      const statusText = application.status.toLowerCase();
      const motivationText = application.motivationLetter.toLowerCase();

      return (
        studentText.includes(normalizedSearch) ||
        campaignText.includes(normalizedSearch) ||
        statusText.includes(normalizedSearch) ||
        motivationText.includes(normalizedSearch)
      );
    });
  }, [searchTerm, visibleApplications]);

  const itemsPerPage = 10;
  const totalPages = Math.max(
    1,
    Math.ceil(searchedApplications.length / itemsPerPage),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedApplications = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;

    return searchedApplications.slice(startIndex, startIndex + itemsPerPage);
  }, [searchedApplications, safeCurrentPage]);

  const startItem =
    searchedApplications.length === 0
      ? 0
      : (safeCurrentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(
    safeCurrentPage * itemsPerPage,
    searchedApplications.length,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload: ICreateApplicationInput = {
        motivationLetter: formData.motivationLetter.trim(),
        student: parseInt(formData.student, 10) || 1,
        campaign: parseInt(formData.campaign, 10) || 1,
        status: "PENDING",
        appliedAt: new Date().toISOString(),
      };

      const result = await createApplication(payload);

      setFormData({ motivationLetter: "", student: "", campaign: "" });
      setShowModal(false);
      setAllApplications((current) => [result, ...current]);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to create application");
    } finally {
      setLoading(false);
    }
  };

  const acceptApplication = async (id: number) => {
    try {
      setUpdatingIds((s) => [...s, id]);
      const currentApplication = allApplications.find((a) => a.id === id);

      if (!currentApplication) {
        throw new Error("Application not found");
      }

      const updated = await updateApplicationStatus(id, {
        ...currentApplication,
        status: "APPROVED",
        reviewedAt: new Date().toISOString(),
      });
      setAllApplications((cur) => cur.map((a) => (a.id === id ? updated : a)));
    } catch (err) {
      console.error(err);
      alert("Failed to accept application");
    } finally {
      setUpdatingIds((s) => s.filter((x) => x !== id));
    }
  };

  const rejectApplication = async (id: number) => {
    try {
      setUpdatingIds((s) => [...s, id]);
      const currentApplication = allApplications.find((a) => a.id === id);

      if (!currentApplication) {
        throw new Error("Application not found");
      }

      const updated = await updateApplicationStatus(id, {
        ...currentApplication,
        status: "REJECTED",
        reviewedAt: new Date().toISOString(),
      });
      setAllApplications((cur) => cur.map((a) => (a.id === id ? updated : a)));
    } catch (err) {
      console.error(err);
      alert("Failed to reject application");
    } finally {
      setUpdatingIds((s) => s.filter((x) => x !== id));
    }
  };

  const pendingCount = searchedApplications.filter(
    (application) => application.status === "PENDING",
  ).length;

  const approvedCount = searchedApplications.filter(
    (application) => application.status === "APPROVED",
  ).length;

  const acceptanceRate =
    searchedApplications.length > 0
      ? ((approvedCount / searchedApplications.length) * 100).toFixed(1)
      : "0";

  const stats = [
    {
      title: "Pending Review",
      value: pendingCount.toString(),
      icon: FileText,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      title: "Approved Applications",
      value: approvedCount.toString(),
      icon: CheckCircle2,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Acceptance Rate",
      value: `${acceptanceRate}%`,
      icon: TrendingUp,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  const selectedMonthLabel =
    selectedMonth === "all"
      ? "All Months"
      : (monthOptions.find((option) => option.value === selectedMonth)?.label ??
        "All Months");

  return (
    <div>
      <main className="flex-1 p-2">
        <div className="flex gap-6">
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Volunteer Applications
              </h1>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMonthMenu((current) => !current)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    {selectedMonthLabel}
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showMonthMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-lg z-20 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMonth("all");
                          setShowMonthMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                      >
                        All Months
                      </button>
                      {monthOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setSelectedMonth(option.value);
                            setShowMonthMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0066cc] text-white rounded-lg text-sm font-medium hover:bg-[#0066cc] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Opportunity
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.title}
                  className="bg-white rounded-xl border border-gray-200 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                      <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="relative flex-1 min-w-70 flex items-center gap-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSearchTerm(searchQuery.trim());
                      setCurrentPage(1);
                    }
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-[#0066cc]/10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm(searchQuery.trim());
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 bg-[#0066cc] text-white rounded-xl text-sm hover:opacity-90"
                  title="Search"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50"
                  title="Clear"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Applications
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setSortOrder((s) =>
                        s === "newest" ? "oldest" : "newest",
                      )
                    }
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Sort: {sortOrder === "newest" ? "Newest" : "Oldest"}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                        Student
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                        Campaign
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                        Applied On
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                        Status
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedApplications.map((application) => {
                      const name = studentLabel(application.student);
                      const initials = name
                        .split(" ")
                        .map((s) => s[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();
                      return (
                        <tr
                          key={application.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-9 h-9">
                                <AvatarImage src="" />
                                <AvatarFallback>{initials || "S"}</AvatarFallback>
                              </Avatar>
                              <p className="text-sm font-medium text-gray-900">
                                {name}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {campaignLabel(application.campaign)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {getApplicationDate(application).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "px-2.5 py-1 rounded-full text-xs font-medium",
                                statusStyles[
                                  application.status as keyof typeof statusStyles
                                ] ?? "bg-gray-100 text-gray-700",
                              )}
                            >
                              {application.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setViewingMotivation(application)}
                                title="View motivation letter"
                                className="p-1.5 bg-[#f5f5f7] text-[#0066cc] rounded-md hover:bg-[#e5e5ea] transition-colors"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <button
                                disabled={
                                  loading ||
                                  updatingIds.includes(application.id)
                                }
                                onClick={() => acceptApplication(application.id)}
                                className="p-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                disabled={
                                  loading ||
                                  updatingIds.includes(application.id)
                                }
                                onClick={() => rejectApplication(application.id)}
                                className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-t border-[#e0e0e0] text-[13px] text-[#6e6e73]">
                <span>
                  Showing {startItem}-{endItem} of{" "}
                  {visibleApplications.length} applications
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={safeCurrentPage === 1}
                    className="px-4 py-1.5 rounded-full border border-[#e0e0e0] hover:bg-[#fafafc] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={safeCurrentPage === totalPages}
                    className="px-4 py-1.5 rounded-full border border-[#e0e0e0] hover:bg-[#fafafc] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Create New Opportunity
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student
                </label>
                <select
                  required
                  value={formData.student}
                  onChange={(e) =>
                    setFormData({ ...formData, student: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]/50 text-sm"
                >
                  <option value="" disabled>
                    -- Choose Student --
                  </option>
                  {usersList.map((u) => (
                    <option key={u.userId} value={u.userId}>
                      {u.firstName} {u.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign
                </label>
                <select
                  required
                  value={formData.campaign}
                  onChange={(e) =>
                    setFormData({ ...formData, campaign: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]/50 text-sm"
                >
                  <option value="" disabled>
                    -- Choose Campaign --
                  </option>
                  {campaignsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivation Letter
                </label>
                <textarea
                  required
                  value={formData.motivationLetter}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      motivationLetter: e.target.value,
                    })
                  }
                  placeholder="Enter your motivation letter..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc]/50 text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#0066cc] text-white font-medium rounded-lg hover:bg-[#0066cc]/90 transition-colors text-sm disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingMotivation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setViewingMotivation(null)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-2xl border border-[#e0e0e0] overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0066cc] p-5 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <FileText size={20} />
                <div>
                  <h2 className="text-base font-semibold">Motivation Letter</h2>
                  <p className="text-xs text-white/80">
                    {studentLabel(viewingMotivation.student)} ·{" "}
                    {campaignLabel(viewingMotivation.campaign)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingMotivation(null)}
                className="hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <p className="text-[15px] text-[#1d1d1f] whitespace-pre-wrap leading-relaxed">
                {viewingMotivation.motivationLetter || "(empty)"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicationStatus;
