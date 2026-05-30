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
  Eye,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/layout/Avaert";
import Select from "@/components/layout/Select";
import SegmentedToggle from "@/components/layout/SegmentedToggle";
import { toast } from "@/store/toast.store";
import { cn } from "@/pages/lib/utils";
import {
  getApplications,
  createApplication,
  updateApplicationStatus,
} from "@/API/Application/Application.apis";
import { getUsers } from "@/API/User/user.api";
import collegesApis from "@/API/Colleges/Colleges.apis";
import campaignApis from "@/API/Campaingns/Campaign.apis";
import type {
  IApplication,
  ICreateApplicationInput,
} from "@/API/Application/Application.interfaces";
import type { IUser } from "@/API/User/User.interfaces";
import type { ICollege } from "@/API/Colleges/Colleges.interfaces";
import type { ICampaign } from "@/API/Campaingns/Campaign.interfaces";
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

  const [users, setUsers] = useState<IUser[]>([]);
  const [colleges, setColleges] = useState<ICollege[]>([]);
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [letterApp, setLetterApp] = useState<IApplication | null>(null);

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

  // بيانات مرجعية لعرض اسم الطالب والكلية والفلترة حسب الحملة
  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [usersRes, collegesRes, campaignsRes] = await Promise.all([
          getUsers(0, 1000),
          collegesApis.getAllColleges({ page: 0, size: 1000 }),
          campaignApis.getAllCampaigns({ page: 0, size: 1000 }),
        ]);
        setUsers(usersRes?.content ?? []);
        setColleges(collegesRes?.content ?? []);
        setCampaigns(
          (campaignsRes as { content?: ICampaign[] })?.content ?? [],
        );
      } catch (error) {
        console.error(error);
      }
    };

    loadRefs();
  }, []);

  const userMap = useMemo(() => {
    const map = new Map<number, IUser>();
    users.forEach((u) => map.set(u.userId, u));
    return map;
  }, [users]);

  const collegeNameById = useMemo(() => {
    const map = new Map<number, string>();
    colleges.forEach((c) => map.set(c.collegeId, c.name));
    return map;
  }, [colleges]);

  const getStudentName = (studentId: number) => {
    const u = userMap.get(studentId);
    return u ? `${u.firstName} ${u.lastName}` : `Student #${studentId}`;
  };

  const getStudentCollege = (studentId: number) => {
    const u = userMap.get(studentId);
    if (!u) return "—";
    return collegeNameById.get(u.college) ?? `College #${u.college}`;
  };

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
    const filtered = allApplications.filter((application) => {
      const monthOk =
        selectedMonth === "all" ||
        (() => {
          const date = getApplicationDate(application);
          if (Number.isNaN(date.getTime())) return false;
          return getMonthKey(date) === selectedMonth;
        })();

      const campaignOk =
        campaignFilter === "all" ||
        String(application.campaign) === campaignFilter;

      const statusOk =
        statusFilter === "all" || application.status === statusFilter;

      return monthOk && campaignOk && statusOk;
    });

    return [...filtered].sort((left, right) => {
      const leftTime = getApplicationDate(left).getTime();
      const rightTime = getApplicationDate(right).getTime();

      return sortOrder === "newest"
        ? rightTime - leftTime
        : leftTime - rightTime;
    });
  }, [allApplications, selectedMonth, sortOrder, campaignFilter, statusFilter]);

  const campaignTitleById = useMemo(() => {
    const map = new Map<number, string>();
    campaigns.forEach((c) => map.set(c.campaignId, c.title));
    return map;
  }, [campaigns]);

  const matchesSearch = useMemo(
    () => (application: IApplication, query: string) => {
      if (!query) return true;

      const studentText = getStudentName(application.student).toLowerCase();
      const collegeText = getStudentCollege(application.student).toLowerCase();
      const campaignText = (
        campaignTitleById.get(application.campaign) ??
        `campaign ${application.campaign}`
      ).toLowerCase();
      const statusText = (application.status ?? "").toLowerCase();
      const motivationText = (application.motivationLetter ?? "").toLowerCase();

      return (
        studentText.includes(query) ||
        collegeText.includes(query) ||
        campaignText.includes(query) ||
        statusText.includes(query) ||
        motivationText.includes(query)
      );
    },
    // getStudentName/getStudentCollege read from userMap & collegeNameById
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userMap, collegeNameById, campaignTitleById],
  );

  const searchedApplications = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return visibleApplications;
    }

    return visibleApplications.filter((application) =>
      matchesSearch(application, normalizedSearch),
    );
  }, [searchTerm, visibleApplications, matchesSearch]);

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

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = [1];
    const start = Math.max(2, safeCurrentPage - 1);
    const end = Math.min(totalPages - 1, safeCurrentPage + 1);

    if (start > 2) {
      pages.push(-1);
    }

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    if (end < totalPages - 1) {
      pages.push(-1);
    }

    pages.push(totalPages);

    return pages;
  }, [safeCurrentPage, totalPages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const motivation = formData.motivationLetter.trim();
    if (!formData.student) {
      toast.error("Please select a student.");
      return;
    }
    if (!formData.campaign) {
      toast.error("Please select a campaign.");
      return;
    }
    if (!motivation) {
      toast.error("Please write a motivation letter.");
      return;
    }
    if (motivation.length > 500) {
      toast.error("Motivation letter must be 500 characters or fewer.");
      return;
    }

    try {
      setLoading(true);

      const payload: ICreateApplicationInput = {
        motivationLetter: motivation,
        student: parseInt(formData.student, 10),
        campaign: parseInt(formData.campaign, 10),
        status: "PENDING",
        appliedAt: new Date().toISOString(),
      };

      const result = await createApplication(payload);

      setFormData({ motivationLetter: "", student: "", campaign: "" });
      setShowModal(false);
      setAllApplications((current) => [result, ...current]);
      toast.success("Application created.");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create application.");
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
      toast.error("Failed to accept application.");
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
      toast.error("Failed to reject application.");
    } finally {
      setUpdatingIds((s) => s.filter((x) => x !== id));
    }
  };

  // الإحصائيات تتبع نطاق العرض (الشهر/الحملة/البحث) لكن لا تتأثر بفلتر الحالة
  const statsApplications = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return allApplications.filter((application) => {
      const monthOk =
        selectedMonth === "all" ||
        (() => {
          const date = getApplicationDate(application);
          if (Number.isNaN(date.getTime())) return false;
          return getMonthKey(date) === selectedMonth;
        })();

      const campaignOk =
        campaignFilter === "all" ||
        String(application.campaign) === campaignFilter;

      const searchOk = matchesSearch(application, q);

      return monthOk && campaignOk && searchOk;
    });
  }, [allApplications, selectedMonth, campaignFilter, searchTerm, matchesSearch]);

  const pendingCount = statsApplications.filter(
    (application) => application.status === "PENDING",
  ).length;

  const approvedCount = statsApplications.filter(
    (application) => application.status === "APPROVED",
  ).length;

  const acceptanceRate =
    statsApplications.length > 0
      ? ((approvedCount / statsApplications.length) * 100).toFixed(1)
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
      <main className="flex-1 px-6 md:px-10 py-8">
        <div className="flex gap-6">
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Volunteer Applications
              </h1>
              <div className="flex items-center gap-3">
                <Select
                  value={campaignFilter}
                  onChange={(e) => {
                    setCampaignFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  title="Filter by campaign"
                >
                  <option value="all">All campaigns</option>
                  {campaigns.map((c) => (
                    <option key={c.campaignId} value={String(c.campaignId)}>
                      {c.title}
                    </option>
                  ))}
                </Select>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMonthMenu((current) => !current)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    {selectedMonthLabel}
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showMonthMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-[18px] border border-gray-200 bg-white shadow-lg z-20 overflow-hidden">
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
                  className="flex items-center gap-2 px-4 py-2 bg-[#5D3FD3] text-white rounded-full text-sm font-medium hover:bg-[#5D3FD3] transition-colors"
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
                  className="bg-white rounded-[18px] border border-gray-200 p-5"
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

            <div className="flex flex-wrap gap-4 bg-white p-4 rounded-[18px] border border-gray-200">
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
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-full outline-none focus:ring-2 focus:ring-[#5D3FD3]/10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm(searchQuery.trim());
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 bg-[#5D3FD3] text-white rounded-full text-sm hover:opacity-90 active:scale-95 transition-all"
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
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-full text-sm hover:bg-gray-50 active:scale-95 transition-all"
                  title="Clear"
                >
                  Clear
                </button>
              </div>

              <SegmentedToggle
                className="w-[26rem]"
                value={statusFilter}
                onChange={(v) => {
                  setStatusFilter(v);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "all", label: "All" },
                  { value: "PENDING", label: "Pending" },
                  { value: "APPROVED", label: "Approved" },
                  { value: "REJECTED", label: "Rejected" },
                ]}
              />
            </div>

            <div className="bg-white rounded-[18px] border border-gray-200">
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
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Sort: {sortOrder === "newest" ? "Newest" : "Oldest"}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                        Student Name
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                        College
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
                    {paginatedApplications.map((application) => (
                      <tr
                        key={application.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9">
                              <AvatarImage src="" />
                              <AvatarFallback>
                                {getStudentName(application.student)
                                  .charAt(0)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-sm font-medium text-gray-900">
                              {getStudentName(application.student)}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {getStudentCollege(application.student)}
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
                              type="button"
                              onClick={() => setLetterApp(application)}
                              title="View motivation letter"
                              className="p-2 text-slate-400 hover:text-[#5D3FD3] hover:bg-slate-100 rounded-lg transition-all active:scale-95"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              disabled={
                                loading || updatingIds.includes(application.id)
                              }
                              onClick={() => acceptApplication(application.id)}
                              title="Approve"
                              className="p-2 text-green-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              disabled={
                                loading || updatingIds.includes(application.id)
                              }
                              onClick={() => rejectApplication(application.id)}
                              title="Reject"
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing {startItem}-{endItem} of {visibleApplications.length}{" "}
                  applications
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={safeCurrentPage === 1}
                    className="p-2 hover:bg-gray-100 rounded-2xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  {pageNumbers.map((page, index) =>
                    page === -1 ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-2 text-gray-400"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "w-8 h-8 rounded-2xl text-sm font-medium transition-colors",
                          safeCurrentPage === page
                            ? "bg-[#5D3FD3] text-white"
                            : "hover:bg-gray-100 text-gray-600",
                        )}
                      >
                        {page}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={safeCurrentPage === totalPages}
                    className="p-2 hover:bg-gray-100 rounded-2xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[18px] shadow-2xl w-full max-w-md">
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
                <Select
                  required
                  wrapperClassName="block w-full"
                  className="border-gray-300 rounded-2xl py-2"
                  value={formData.student}
                  onChange={(e) =>
                    setFormData({ ...formData, student: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Select a student…
                  </option>
                  {users.map((u) => (
                    <option key={u.userId} value={u.userId}>
                      {u.firstName} {u.lastName}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign
                </label>
                <Select
                  required
                  wrapperClassName="block w-full"
                  className="border-gray-300 rounded-2xl py-2"
                  value={formData.campaign}
                  onChange={(e) =>
                    setFormData({ ...formData, campaign: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Select a campaign…
                  </option>
                  {campaigns.map((c) => (
                    <option key={c.campaignId} value={c.campaignId}>
                      {c.title}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivation Letter
                </label>
                <textarea
                  required
                  maxLength={500}
                  value={formData.motivationLetter}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      motivationLetter: e.target.value,
                    })
                  }
                  placeholder="Enter your motivation letter…"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5D3FD3]/50 text-sm resize-none"
                />
                <p className="mt-1 text-xs text-slate-400 text-right">
                  {formData.motivationLetter.length}/500
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#5D3FD3] text-white font-medium rounded-full hover:bg-[#5D3FD3]/90 transition-colors text-sm disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {letterApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[18px] shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Motivation Letter
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {getStudentName(letterApp.student)}
                </p>
              </div>
              <button
                onClick={() => setLetterApp(null)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {letterApp.motivationLetter || "No motivation letter provided."}
              </p>
            </div>
            <div className="flex justify-end p-4 border-t border-gray-200">
              <button
                onClick={() => setLetterApp(null)}
                className="px-4 py-2 bg-[#5D3FD3] text-white rounded-full text-sm font-medium hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicationStatus;
