// src/pages/CampaignManagement.tsx
import React, {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  Plus,
  Search,
  MapPin,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  X,
  Target,
  Image as ImageIcon,
  Upload,
  Trash2,
  SquarePen,
  BarChart3,
} from "lucide-react";

import campaignQueries from "../../API/Campaingns/Campaingnqueries";
import attendanceQueries from "../../API/Attendance/Attendancequeries";
import attendanceApis from "../../API/Attendance/Attendance.apis";
import type { IProgress } from "../../API/Attendance/Attendance.interfaces";
import useAuthStore from "../../store/auth.store";
import Pagination from "../layout/Pagination";
import Select from "../layout/Select";
import { toast } from "../../store/toast.store";
import { campaignService } from "../../services/campaignService";
import { API_BASE_URL, SERVER_BASE_URL } from "../../constants/domain";
import type {
  Campaign,
  CreateCampaignInput,
  CampaignStatus,
} from "../../Types2/campaign";
import type { ICampaign } from "../../API/Campaingns/Campaign.interfaces";
import { getCategories, type ICategory } from "../../API/Category/Category.apis";

type ApiErrorShape = {
  message?: string;
  error?: string;
  status?: number;
  path?: string;
};

type CampaignPhoto = {
  photoId?: number;
  campaignId?: number;
  photoUrl?: string;
  uploadedAt?: string;
};

const CAMPAIGN_STATUSES = ["PENDING", "ONGOING", "COMPLETED", "REJECTED"];

const CampaignManagement: React.FC = () => {
  const PAGE_SIZE = 10;
  const currentUserId = useAuthStore((s) => s.user?.userId ?? 1);

  const [query, setQuery] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState<number>(0);

  // جلب البيانات عبر React Query مع الترقيم (page/size) والبحث والفلترة بالحالة
  const {
    data: campaignsResponse,
    isLoading: loading,
    isError: hasError,
  } = campaignQueries.useGetAllCampaigns({
    page,
    size: PAGE_SIZE,
    ...(searchTerm ? { searchText: searchTerm } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  });

  const addCampaignMutation = campaignQueries.useAddCampaign();
  const updateCampaignMutation = campaignQueries.useUpdateCampaign();
  const deleteCampaignMutation = campaignQueries.useDeleteCampaign();
  const createProgressMutation = attendanceQueries.useCreateProgress();

  // استخراج المصفوفة الفعلية مباشرةً دون إعادة تسمية الحقول
  // (إعادة التسمية القديمة كانت تُفقد campaignId فتُفعّل الحذف/القائمة لكل الصفوف)
  const campaigns: ICampaign[] =
    (campaignsResponse as { content?: ICampaign[] })?.content ??
    (campaignsResponse as { data?: ICampaign[] })?.data ??
    (Array.isArray(campaignsResponse)
      ? (campaignsResponse as ICampaign[])
      : []);

  const totalPages = (campaignsResponse as { totalPages?: number })?.totalPages
    ? Math.max(1, (campaignsResponse as { totalPages: number }).totalPages)
    : 1;
  const totalElements =
    (campaignsResponse as { totalElements?: number })?.totalElements ??
    campaigns.length;

  // أحدث نسبة تقدّم لكل حملة (تُحمّل من السيرفر لتبقى بعد تحديث الصفحة)
  const [progressById, setProgressById] = useState<Record<number, number>>({});

  const campaignIdsKey = campaigns.map((c) => c.campaignId).join(",");
  useEffect(() => {
    if (campaigns.length === 0) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        campaigns.map(async (c) => {
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
      if (!cancelled) {
        setProgressById((prev) => ({
          ...prev,
          ...Object.fromEntries(entries),
        }));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignIdsKey]);

  const runSearch = () => {
    setSearchTerm(query.trim());
    setPage(0);
  };

  const clearSearch = () => {
    setQuery("");
    setSearchTerm("");
    setPage(0);
  };

  // حالات النوافذ المنبثقة والتحكم بالواجهة
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingCampaignId, setEditingCampaignId] = useState<number | null>(
    null,
  );
  const [showPhotosModal, setShowPhotosModal] = useState<boolean>(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [progressCampaign, setProgressCampaign] = useState<ICampaign | null>(
    null,
  );
  const [progressValue, setProgressValue] = useState<string>("0");
  const [selectedFilesToUpload, setSelectedFilesToUpload] = useState<File[]>(
    [],
  );
  const [localPreviews, setLocalPreviews] = useState<string[]>([]);
  const [photoBlobUrls, setPhotoBlobUrls] = useState<Record<string, string>>(
    {},
  );

  // فورم الإنشاء المربوط بالـ State
  const [formData, setFormData] = useState<CreateCampaignInput>({
    title: "",
    description: "",
    location: "",
    categoryId: 0,
    max_volunteers: 0,
    start_date: "",
    end_date: "",
  });

  // التصنيفات الحقيقية من قاعدة البيانات (المعرّفات تبدأ من 101 وليست 1..3)
  const [categories, setCategories] = useState<ICategory[]>([]);
  useEffect(() => {
    getCategories(0, 100)
      .then((res) => {
        const list = res?.content ?? [];
        setCategories(list);
        // اضبط تصنيفاً افتراضياً صالحاً إن لم يكن المختار موجوداً
        setFormData((prev) =>
          list.some((c) => c.categoryId === prev.categoryId)
            ? prev
            : { ...prev, categoryId: list[0]?.categoryId ?? 0 },
        );
      })
      .catch((err) => console.error(err));
  }, []);

  const primaryPurple = "#5D3FD3";

  const ongoingCampaigns = campaigns.filter(
    (c: ICampaign) => c.status?.toLowerCase() === "ongoing",
  ).length;
  const pendingCampaigns = campaigns.filter(
    (c: ICampaign) => c.status?.toLowerCase() === "pending",
  ).length;
  const totalCampaigns = campaigns.length;

  const stats = [
    {
      label: "Total Campaigns",
      value: totalCampaigns.toString(),
      icon: <Calendar className="text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      label: "Ongoing",
      value: ongoingCampaigns.toString(),
      icon: <CheckCircle2 className="text-green-600" />,
      bg: "bg-green-50",
    },
    {
      label: "Pending Approval",
      value: pendingCampaigns.toString(),
      icon: <Clock className="text-orange-600" />,
      bg: "bg-orange-50",
    },
  ];

  const getStatusStyle = (status: CampaignStatus) => {
    switch (status?.toLowerCase()) {
      case "ongoing":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";

      case "approved":
        return "bg-blue-50 text-blue-600 border-blue-100";

      case "pending":
        return "bg-orange-50 text-orange-600 border-orange-100";

      case "rejected":
        return "bg-red-50 text-red-600 border-red-100";

      case "draft":
        return "bg-slate-50 text-slate-500 border-slate-100";

      case "completed":
        return "bg-purple-50 text-purple-600 border-purple-100";

      case "cancelled":
      case "canceled":
        return "bg-rose-50 text-rose-600 border-rose-100";

      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const extractErrorMessage = (err: unknown, fallback: string): string => {
    if (typeof err === "object" && err !== null) {
      const maybeError = err as {
        message?: string;
        response?: { data?: ApiErrorShape; status?: number };
      };
      const apiData = maybeError.response?.data;
      const apiMessage =
        apiData?.message ||
        apiData?.error ||
        (apiData?.status ? `HTTP ${apiData.status}` : undefined);
      return apiMessage || maybeError.message || fallback;
    }

    return fallback;
  };

  const buildPhotoDisplayUrl = (rawPhotoUrl?: string): string => {
    if (!rawPhotoUrl) return "";
    if (rawPhotoUrl.startsWith("http")) return rawPhotoUrl;

    const cleaned = rawPhotoUrl.replace(/^\/api\/v1(?=\/)/, "");
    const normalizedPath = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
    return `${SERVER_BASE_URL}${normalizedPath}`;
  };

  const openPhotosManagement = async (camp: Campaign) => {
    setSelectedCampaign(camp);
    setShowPhotosModal(true);
    try {
      const response = await campaignService.getCampaignPhotos(camp.campaignId);
      setSelectedCampaign((prev: Campaign | null) =>
        prev
          ? {
              ...prev,
              photos: response.data.content || [],
            }
          : null,
      );
    } catch (err) {
      console.error("Error fetching campaign photos", err);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const arr = Array.from(files);
    const previews = arr.map((f: File) => URL.createObjectURL(f));
    setSelectedFilesToUpload(arr);
    setLocalPreviews(previews);
  };

  const uploadSelectedFiles = async () => {
    if (!selectedCampaign || selectedFilesToUpload.length === 0) return;

    try {
      if (selectedFilesToUpload.length === 1) {
        await campaignService.uploadSinglePhoto(
          selectedCampaign.campaignId,
          selectedFilesToUpload[0],
        );
      } else {
        // campaignService.uploadMultiplePhotos expects a FileList but accepts array-like as well
        await campaignService.uploadMultiplePhotos(
          selectedCampaign.campaignId,
          selectedFilesToUpload as unknown as FileList,
        );
      }

      // cleanup previews
      localPreviews.forEach((url) => URL.revokeObjectURL(url));
      setLocalPreviews([]);
      setSelectedFilesToUpload([]);

      // refresh gallery
      openPhotosManagement(selectedCampaign);
    } catch (err) {
      console.error("Upload selected files error:", err);
      toast.error("Failed to upload selected images");
    }
  };

  const clearSelection = () => {
    localPreviews.forEach((url) => URL.revokeObjectURL(url));
    setLocalPreviews([]);
    setSelectedFilesToUpload([]);
  };

  const handleDeletePhoto = async (photoId?: number) => {
    if (!photoId || !selectedCampaign) return;
    if (!window.confirm("Delete this photo?")) return;
    try {
      await campaignService.deletePhoto(photoId);
      openPhotosManagement(selectedCampaign); // refresh gallery
    } catch (err) {
      console.error("Delete photo error:", err);
      toast.error("Failed to delete photo");
    }
  };


  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      categoryId: categories[0]?.categoryId ?? 0,
      max_volunteers: 0,
      start_date: "",
      end_date: "",
    });
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setEditingCampaignId(null);
    resetForm();
  };

  const openCreateModal = () => {
    setEditingCampaignId(null);
    resetForm();
    setShowCreateModal(true);
  };

  const openEditCampaignModal = (camp: ICampaign) => {
    setEditingCampaignId(camp.campaignId);
    setFormData({
      title: camp.title ?? "",
      description: camp.description ?? "",
      location: camp.location ?? "",
      categoryId: Number(camp.category) || categories[0]?.categoryId || 0,
      max_volunteers: Number(camp.maxVolunteers) || 0,
      start_date: camp.startDate ?? "",
      end_date: camp.endDate ?? "",
    });
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      startDate: formData.start_date,
      endDate: formData.end_date,
      maxVolunteers: Number(formData.max_volunteers),
      category: Number(formData.categoryId),
      status: "PENDING",
      proposedBy: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (editingCampaignId) {
        const existing = campaigns.find(
          (c) => c.campaignId === editingCampaignId,
        );
        await updateCampaignMutation.mutateAsync({
          id: editingCampaignId,
          payload: {
            ...payload,
            status: existing?.status ?? "PENDING",
            proposedBy: existing?.proposedBy ?? currentUserId,
            createdAt: existing?.createdAt ?? payload.createdAt,
          },
        });
      } else {
        await addCampaignMutation.mutateAsync(payload);
      }
      closeCreateModal();
    } catch (err) {
      console.error("Error saving campaign:", err);
      toast.error(extractErrorMessage(err, "Error saving campaign"));
    }
  };

  const handleStatusChange = async (camp: ICampaign, newStatus: string) => {
    if (!newStatus || newStatus === camp.status) return;
    try {
      await updateCampaignMutation.mutateAsync({
        id: camp.campaignId,
        payload: {
          title: camp.title,
          description: camp.description,
          location: camp.location,
          startDate: camp.startDate,
          endDate: camp.endDate,
          maxVolunteers: Number(camp.maxVolunteers) || 0,
          category: Number(camp.category) || categories[0]?.categoryId || 0,
          status: newStatus,
          proposedBy: camp.proposedBy ?? currentUserId,
          createdAt: camp.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(extractErrorMessage(err, "Error updating status"));
    }
  };

  const openProgressModal = (camp: ICampaign) => {
    setProgressCampaign(camp);
    setProgressValue(
      String(
        progressById[camp.campaignId] ??
          (camp as unknown as { actualProgress?: number }).actualProgress ??
          0,
      ),
    );
  };

  const handleProgressSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!progressCampaign) return;

    const pct = Math.max(0, Math.min(100, Number(progressValue) || 0));

    try {
      await createProgressMutation.mutateAsync({
        campaignId: progressCampaign.campaignId,
        payload: {
          percentage: pct,
          campaign: progressCampaign.campaignId,
          updatedBy: currentUserId,
        },
      });
      setProgressById((prev) => ({
        ...prev,
        [progressCampaign.campaignId]: pct,
      }));
      setProgressCampaign(null);
    } catch (err) {
      console.error("Error updating progress:", err);
      toast.error(extractErrorMessage(err, "Error updating progress"));
    }
  };

  const handleDeleteCampaign = async (campaignId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this campaign? This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      await deleteCampaignMutation.mutateAsync(campaignId);
    } catch (err) {
      console.error("Error deleting campaign:", err);
      toast.error(extractErrorMessage(err, "Error deleting campaign"));
    }
  };
  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-10 w-10 border-b-2"
          style={{ borderColor: primaryPurple }}
        ></div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full p-8 text-center bg-red-50 text-red-600 rounded-[18px] border border-red-100">
        <p className="font-bold">Failed to fetch campaigns from the server</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700 px-6 md:px-10 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Campaign <span style={{ color: primaryPurple }}>Management</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Organize, track, and manage all volunteer initiatives.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          style={{ backgroundColor: primaryPurple }}
          className="flex items-center gap-2 text-white px-6 py-3 rounded-full font-medium transition-all active:scale-95 hover:opacity-90"
        >
          <Plus size={20} />
          Create New Campaign
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-[18px] border border-gray-200 group hover:border-[#5D3FD3]/20 transition-all flex items-center gap-4"
          >
            <div
              className={`p-4 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-[18px] border border-gray-200">
        <div className="relative flex-1 min-w-70 flex items-center gap-2">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") runSearch();
            }}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-full outline-none focus:ring-2 focus:ring-[#5D3FD3]/10 text-sm"
          />
          <button
            type="button"
            onClick={runSearch}
            className="px-4 py-2 bg-[#5D3FD3] text-white rounded-full text-sm hover:opacity-90 active:scale-95 transition-all"
            title="Search"
          >
            Search
          </button>
          <button
            type="button"
            onClick={clearSearch}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full text-sm hover:bg-slate-50 active:scale-95 transition-all"
            title="Clear"
          >
            Clear
          </button>
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          title="Filter by status"
        >
          <option value="">All statuses</option>
          {CAMPAIGN_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-[18px] border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-wider">
              <th className="px-4 py-4 font-bold text-slate-500">
                Campaign Details
              </th>
              <th className="px-4 py-4 font-bold text-slate-500">Volunteers</th>
              <th className="px-4 py-4 font-bold text-slate-500">
                Actual Progress
              </th>
              <th className="px-4 py-4 font-bold text-slate-500">Status</th>
              <th className="px-4 py-4 font-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {campaigns.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-8 py-10 text-center text-slate-400 font-medium"
                >
                  No campaigns found.
                </td>
              </tr>
            ) : (
              campaigns.map((camp: ICampaign) => {
                const currentVolunteers =
                  (camp as unknown as { currentVolunteers?: number })
                    .currentVolunteers ?? 0;
                const volunteersPct =
                  camp.maxVolunteers > 0
                    ? Math.round((currentVolunteers / camp.maxVolunteers) * 100)
                    : 0;
                const progress =
                  (camp.status || "").toUpperCase() === "COMPLETED"
                    ? 100
                    : (progressById[camp.campaignId] ??
                      (camp as unknown as { actualProgress?: number })
                        .actualProgress ??
                      0);
                const statusOptions = Array.from(
                  new Set([camp.status, ...CAMPAIGN_STATUSES]),
                );

                return (
                  <tr
                    key={camp.campaignId}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-base group-hover:text-[#5D3FD3] transition-colors">
                          {camp.title}
                        </span>
                        <div className="flex flex-wrap items-center gap-3 text-slate-400 text-xs mt-1.5">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} /> {camp.location}
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <Calendar size={12} /> {camp.startDate} To{" "}
                            {camp.endDate}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2 w-28">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                          <span>
                            {currentVolunteers} / {camp.maxVolunteers}
                          </span>
                          <span>{volunteersPct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${volunteersPct}%` }}
                            className="h-full bg-blue-600 rounded-full"
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2 w-28">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                          <span>Progress</span>
                          <span style={{ color: primaryPurple }}>
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{
                              width: `${progress}%`,
                              backgroundColor: primaryPurple,
                            }}
                            className="h-full rounded-full"
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Select
                        value={camp.status}
                        onChange={(e) =>
                          handleStatusChange(camp, e.target.value)
                        }
                        className={`py-1.5 pl-3 pr-8 text-[10px] font-bold rounded-lg ${getStatusStyle(camp.status as CampaignStatus)}`}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </Select>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditCampaignModal(camp)}
                          title="Edit Campaign"
                          className="p-2 text-slate-400 hover:text-[#5D3FD3] hover:bg-slate-50 rounded-xl transition-all"
                        >
                          <SquarePen size={18} />
                        </button>
                        <button
                          onClick={() => openProgressModal(camp)}
                          title="Edit Progress"
                          className="p-2 text-slate-400 hover:text-[#5D3FD3] hover:bg-slate-50 rounded-xl transition-all"
                        >
                          <BarChart3 size={18} />
                        </button>
                        <button
                          onClick={() => openPhotosManagement(camp as Campaign)}
                          title="Manage Photos"
                          className="p-2 text-slate-400 hover:text-[#5D3FD3] hover:bg-slate-50 rounded-xl transition-all"
                        >
                          <ImageIcon size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCampaign(camp.campaignId)}
                          title="Delete Campaign"
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <Pagination
          currentPage={page + 1}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p - 1)}
          totalItems={totalElements}
          pageSize={PAGE_SIZE}
          itemLabel="campaigns"
        />
      </div>

      {/* Modal - Create Campaign */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[18px] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div
              style={{ backgroundColor: primaryPurple }}
              className="p-8 flex justify-between items-center text-white"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <Target size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">
                    {editingCampaignId ? "Edit Campaign" : "Create New Campaign"}
                  </h2>
                  <p className="text-indigo-100 text-xs mt-0.5 opacity-80">
                    Define goals and requirements
                  </p>
                </div>
              </div>
              <button
                onClick={closeCreateModal}
                className="hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleCreateSubmit}
              className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto"
            >
              <div className="md:col-span-2 space-y-2">
                <label
                  htmlFor="campaign-title"
                  className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1"
                >
                  Campaign Title
                </label>
                <input
                  id="campaign-title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter campaign title..."
                  className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-[#5D3FD3]/10 focus:bg-white focus:border-[#5D3FD3]/20 outline-none transition-all text-sm"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label
                  htmlFor="campaign-description"
                  className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1"
                >
                  Description
                </label>
                <textarea
                  id="campaign-description"
                  name="description"
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-[#5D3FD3]/10 focus:bg-white focus:border-[#5D3FD3]/20 outline-none transition-all text-sm resize-none"
                  placeholder="What is this campaign about?"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="campaign-location"
                  className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1"
                >
                  Location
                </label>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="campaign-location"
                    name="location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#5D3FD3]/20 outline-none text-sm"
                    placeholder="Physical or Virtual location"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="campaign-category"
                  className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1"
                >
                  Category
                </label>
                <Select
                  id="campaign-category"
                  name="category"
                  wrapperClassName="block w-full"
                  className="bg-slate-50 border-transparent py-3.5"
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoryId: parseInt(e.target.value),
                    })
                  }
                >
                  {categories.length === 0 && (
                    <option value={formData.categoryId}>
                      Loading categories…
                    </option>
                  )}
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="max-volunteers"
                  className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1"
                >
                  Max Volunteers
                </label>
                <div className="relative">
                  <Users
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="max-volunteers"
                    name="max_volunteers"
                    type="number"
                    required
                    value={formData.max_volunteers || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_volunteers: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="start-date"
                  className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1"
                >
                  Start Date
                </label>
                <input
                  id="start-date"
                  name="start_date"
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none text-sm cursor-pointer"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label
                  htmlFor="end-date"
                  className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1"
                >
                  End Date
                </label>
                <input
                  id="end-date"
                  name="end_date"
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none text-sm cursor-pointer"
                />
              </div>

              <div className="md:col-span-2 flex gap-4 mt-4 pt-6 border-t border-slate-50">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="flex-1 px-6 py-4 border border-slate-100 text-slate-500 font-medium rounded-full hover:bg-slate-50 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: primaryPurple }}
                  className="flex-1 px-6 py-4 text-white font-bold rounded-full hover:opacity-90 transition-all text-sm"
                >
                  {editingCampaignId ? "Save Changes" : "Confirm & Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Edit Progress */}
      {progressCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <form
            onSubmit={handleProgressSubmit}
            className="bg-white w-full max-w-md rounded-[18px] shadow-2xl overflow-hidden animate-in zoom-in-95"
          >
            <div
              style={{ backgroundColor: primaryPurple }}
              className="p-6 flex justify-between items-center text-white"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-2xl">
                  <BarChart3 size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">
                    Edit Progress
                  </h2>
                  <p className="text-indigo-100 text-xs opacity-80">
                    {progressCampaign.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProgressCampaign(null)}
                className="hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                <X size={22} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Progress percentage (0–100)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                required
                value={progressValue}
                onChange={(e) => setProgressValue(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-[#5D3FD3]/10 outline-none text-sm"
              />
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${Math.max(0, Math.min(100, Number(progressValue) || 0))}%`,
                    backgroundColor: primaryPurple,
                  }}
                  className="h-full rounded-full transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProgressCampaign(null)}
                  className="flex-1 px-6 py-3 border border-slate-100 text-slate-500 font-medium rounded-full hover:bg-slate-50 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProgressMutation.isPending}
                  style={{ backgroundColor: primaryPurple }}
                  className="flex-1 px-6 py-3 text-white font-bold rounded-full hover:opacity-90 transition-all text-sm disabled:opacity-50"
                >
                  {createProgressMutation.isPending
                    ? "Saving..."
                    : "Save Progress"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Modal - Photos Management */}
      {showPhotosModal && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl rounded-[18px] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div
              style={{ backgroundColor: primaryPurple }}
              className="p-8 flex justify-between items-center text-white"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <ImageIcon size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">
                    Manage Campaign Photos
                  </h2>
                  <p className="text-indigo-100 text-xs mt-0.5 opacity-80">
                    {selectedCampaign.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPhotosModal(false)}
                className="hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-6 border-2 border-dashed border-slate-200 hover:border-[#5D3FD3]/40 rounded-2xl transition-colors relative flex flex-col items-center justify-center gap-2 group cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div
                    style={{ color: primaryPurple }}
                    className="p-3 bg-indigo-50/50 rounded-xl group-hover:scale-110 transition-transform"
                  >
                    <Upload size={20} />
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    Upload Local Files
                  </span>
                  <span className="text-xs text-slate-400">
                    Supports multiple PNG, JPG images
                  </span>
                </div>
              </div>

              {localPreviews && localPreviews.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Selected Preview ({localPreviews.length})
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {localPreviews.map((url: string, idx: number) => (
                      <div
                        key={url}
                        className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 relative flex items-center justify-center"
                      >
                        <img
                          src={url}
                          alt={`preview-${idx}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => {
                            // remove single preview
                            const newPreviews = localPreviews.filter(
                              (_, i) => i !== idx,
                            );
                            const newFiles = selectedFilesToUpload.filter(
                              (_, i) => i !== idx,
                            );
                            URL.revokeObjectURL(url);
                            setLocalPreviews(newPreviews);
                            setSelectedFilesToUpload(newFiles);
                          }}
                          className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-xs"
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={uploadSelectedFiles}
                      style={{ backgroundColor: primaryPurple }}
                      className="px-4 py-2.5 text-white font-bold rounded-xl text-xs active:scale-95 transition-transform"
                    >
                      Upload Selected
                    </button>
                    <button
                      onClick={clearSelection}
                      className="px-4 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl text-xs"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Current Gallery ({selectedCampaign.photos?.length || 0})
                </h3>
                {selectedCampaign.photos &&
                selectedCampaign.photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {selectedCampaign.photos.map((photo: CampaignPhoto) => {
                      const p = photo as {
                        photoId?: number;
                        campaignId?: number;
                        photoUrl?: string;
                      };
                      const key = p.photoId ?? p.campaignId ?? p.photoUrl;
                      const src = buildPhotoDisplayUrl(p.photoUrl);

                      const blobKey = String(key);
                      const displaySrc = photoBlobUrls[blobKey] || src;

                      return (
                        <div
                          key={String(key)}
                          className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 relative group shadow-sm"
                        >
                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(p.photoId)}
                            title="Delete photo"
                            className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white text-red-500 p-1.5 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
                          >
                            <Trash2 size={14} />
                          </button>
                          {displaySrc ? (
                            <img
                              src={displaySrc}
                              alt="Campaign"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={async () => {
                                try {
                                  const token = localStorage.getItem("token");
                                  const headers: Record<string, string> = {};
                                  if (token)
                                    headers["Authorization"] =
                                      `Bearer ${token}`;

                                  const candidates: string[] = [];
                                  // If API already returned an absolute URL, try it first
                                  if (p.photoUrl?.startsWith("http"))
                                    candidates.push(p.photoUrl);

                                  // Prefer the server base (root) + photoUrl (no /api/v1 prefix)
                                  if (
                                    p.photoUrl &&
                                    p.photoUrl.startsWith("/")
                                  ) {
                                    candidates.push(
                                      buildPhotoDisplayUrl(p.photoUrl),
                                    );
                                  }

                                  // As a fallback try the API base + photoUrl (older deployments might serve differently)
                                  if (p.photoUrl) {
                                    candidates.push(
                                      `${API_BASE_URL}${p.photoUrl}`,
                                    );
                                  }

                                  // Also try cleaning any leading /api/v1 if present and use server base
                                  if (p.photoUrl) {
                                    const cleaned = p.photoUrl.replace(
                                      /^\/api\/v1/,
                                      "",
                                    );
                                    if (cleaned && cleaned !== p.photoUrl) {
                                      candidates.push(
                                        `${SERVER_BASE_URL}${cleaned.startsWith("/") ? cleaned : "/" + cleaned}`,
                                      );
                                    }
                                  }

                                  let success = false;
                                  for (const fullUrl of candidates) {
                                    try {
                                      // helpful debug for server-side troubleshooting
                                      console.debug(
                                        "Attempting image fetch:",
                                        fullUrl,
                                      );
                                      const res = await fetch(fullUrl, {
                                        headers,
                                      });
                                      if (!res.ok)
                                        throw new Error(`status:${res.status}`);
                                      const blob = await res.blob();
                                      const urlObj = URL.createObjectURL(blob);
                                      setPhotoBlobUrls((prev) => ({
                                        ...prev,
                                        [blobKey]: urlObj,
                                      }));
                                      success = true;
                                      break;
                                    } catch {
                                      // try next candidate
                                    }
                                  }

                                  if (!success)
                                    console.error(
                                      "All fetch attempts failed for image",
                                      p.photoUrl || blobKey,
                                      candidates,
                                    );
                                } catch (err) {
                                  console.error(
                                    "Failed to fetch image as blob:",
                                    err,
                                  );
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              No image
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center border border-slate-100 rounded-2xl bg-slate-50/30 flex flex-col items-center justify-center gap-2">
                    <ImageIcon size={32} className="text-slate-300" />
                    <span className="text-xs font-medium text-slate-400">
                      No photos uploaded for this campaign yet.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManagement;
