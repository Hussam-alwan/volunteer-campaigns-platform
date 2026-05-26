// src/pages/CampaignManagement.tsx

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  MapPin,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  X,
  Target,
  Image as ImageIcon,
  Upload,
  Link2,
  Activity,
} from "lucide-react";

import campaignQueries from "../../API/Campaingns/Campaingnqueries";
import attendanceQueries from "../../API/Attendance/Attendancequeries";
import { campaignService } from "../../services/campaignService";
import type {
  Campaign,
  CreateCampaignInput,
  CampaignStatus,
} from "../../Types2/campaign";

const emptyFormData: CreateCampaignInput = {
  title: "",
  description: "",
  location: "",
  categoryId: 1,
  max_volunteers: 0,
  start_date: "",
  end_date: "",
};

const CampaignManagement = () => {
  // التحكم بحالة الـ Pagination مع الحفاظ على التصميم المتناسق للجدول
  const [pagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const {
    data: campaignsResponse,
    isLoading: loading,
    isError: hasError,
    refetch: fetchCampaigns,
  } = campaignQueries.useGetAllCampaigns({
    page: pagination.pageIndex,
    size: pagination.pageSize,
  });

  const addCampaignMutation = campaignQueries.useAddCampaign();
  const updateCampaignMutation = campaignQueries.useUpdateCampaign();
  const deleteCampaignMutation = campaignQueries.useDeleteCampaign();

  const campaigns = campaignsResponse?.content || [];

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showPhotosModal, setShowPhotosModal] = useState<boolean>(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [photoUrlInput, setPhotoUrlInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [progressCampaign, setProgressCampaign] = useState<Campaign | null>(
    null,
  );
  const [progressForm, setProgressForm] = useState({
    percentage: 0,
    notes: "",
  });

  const progressTargetId = progressCampaign?.id || 0;
  const { data: progressPage } = attendanceQueries.useGetProgress(
    progressTargetId,
  );
  const createProgress = attendanceQueries.useCreateProgress(progressTargetId);
  const progressHistory = [...(progressPage?.content || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const latestProgress = progressHistory[0];

  const [formData, setFormData] =
    useState<CreateCampaignInput>(emptyFormData);

  const filteredCampaigns = campaigns.filter((c) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      c.title.toLowerCase().includes(term) ||
      c.location.toLowerCase().includes(term) ||
      c.status?.toLowerCase().includes(term)
    );
  });

  const primaryPurple = "#0066cc";

  // حساب العدادات العلوية ديناميكياً من بيانات الـ API المحدثة تلقائياً كاش
  const totalCampaigns = campaigns.length;
  const ongoingCampaigns = campaigns.filter(
    (c) => c.status?.toLowerCase() === "ongoing",
  ).length;
  const pendingCampaigns = campaigns.filter(
    (c) => c.status?.toLowerCase() === "pending",
  ).length;

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
        return "bg-rose-50 text-rose-600 border-rose-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const openPhotosManagement = async (camp: Campaign) => {
    setSelectedCampaign(camp);
    setShowPhotosModal(true);
    try {
      const response = await campaignService.getCampaignPhotos(camp.id);
      setSelectedCampaign((prev) =>
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

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedCampaign) return;

    try {
      if (files.length === 1) {
        await campaignService.uploadSinglePhoto(selectedCampaign.id, files[0]);
      } else {
        await campaignService.uploadMultiplePhotos(selectedCampaign.id, files);
      }
      openPhotosManagement(selectedCampaign);
    } catch (err) {
      alert("Failed to upload image files");
    }
  };

  const handleUrlSubmit = async () => {
    if (!photoUrlInput || !selectedCampaign) return;
    try {
      await campaignService.addPhotoByUrl(selectedCampaign.id, photoUrlInput);
      setPhotoUrlInput("");
      openPhotosManagement(selectedCampaign);
    } catch (err) {
      alert("Failed to add photo URL");
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingCampaign(null);
    setFormData(emptyFormData);
  };

  const openEditModal = (camp: Campaign) => {
    setEditingCampaign(camp);
    setFormData({
      title: camp.title,
      description: camp.description,
      location: camp.location,
      categoryId: camp.categoryId,
      max_volunteers: camp.max_volunteers,
      start_date: camp.start_date,
      end_date: camp.end_date,
    });
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingCampaign) {
        await updateCampaignMutation.mutateAsync({
          id: editingCampaign.id,
          payload: formData,
          existing: editingCampaign,
        });
      } else {
        await addCampaignMutation.mutateAsync(formData);
      }
      closeModal();
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          (editingCampaign
            ? "Error updating campaign"
            : "Error creating campaign"),
      );
    }
  };

  const handleDeleteCampaign = async (id: number) => {
    if (!window.confirm("Delete this campaign?")) return;
    try {
      await deleteCampaignMutation.mutateAsync(id);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error deleting campaign");
    }
  };

  const openProgressModal = (camp: Campaign) => {
    setProgressCampaign(camp);
    setProgressForm({ percentage: 0, notes: "" });
  };

  const closeProgressModal = () => {
    setProgressCampaign(null);
    setProgressForm({ percentage: 0, notes: "" });
  };

  const handleProgressSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!progressCampaign) return;
    const percentage = Number(progressForm.percentage);
    if (Number.isNaN(percentage) || percentage < 0 || percentage > 100) {
      alert("Percentage must be between 0 and 100.");
      return;
    }
    createProgress.mutate(
      { percentage, notes: progressForm.notes.trim() || undefined },
      {
        onSuccess: () => setProgressForm({ percentage: 0, notes: "" }),
        onError: (err: any) =>
          alert(err?.response?.data?.message || "Failed to save progress."),
      },
    );
  };

  const isFormSubmitting =
    addCampaignMutation.isPending || updateCampaignMutation.isPending;

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
      <div className="w-full p-8 text-center bg-red-50 text-red-600 rounded-[24px] border border-red-100">
        <p className="font-bold">Failed to fetch campaigns from the server</p>
        <button
          onClick={() => fetchCampaigns()}
          style={{ backgroundColor: primaryPurple }}
          className="mt-4 px-4 py-2 text-white rounded-xl text-xs font-bold shadow-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700 p-2">
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
          onClick={() => {
            setEditingCampaign(null);
            setFormData(emptyFormData);
            setShowCreateModal(true);
          }}
          style={{ backgroundColor: primaryPurple }}
          className="flex items-center gap-2 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95 hover:opacity-90"
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
            className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] group hover:border-[#0066cc]/20 transition-all flex items-center gap-4"
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

      {/* Search */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, location, or status..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-[#0066cc]/10 text-sm"
          />
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="px-8 py-5 font-bold text-slate-500">
                  Campaign Details
                </th>
                <th className="px-8 py-5 font-bold text-slate-500">Category</th>
                <th className="px-8 py-5 font-bold text-slate-500">
                  Volunteers
                </th>
                <th className="px-8 py-5 font-bold text-slate-500">
                  Actual Progress
                </th>
                <th className="px-8 py-5 font-bold text-slate-500">Status</th>
                <th className="px-8 py-5 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCampaigns.map((camp) => (
                <tr
                  key={camp.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-base group-hover:text-[#0066cc] transition-colors">
                        {camp.title}
                      </span>
                      <div className="flex flex-wrap items-center gap-3 text-slate-400 text-xs mt-1.5">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {camp.location}
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar size={12} /> {camp.start_date} To{" "}
                          {camp.end_date}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      {camp.categoryId === 1
                        ? "Environment"
                        : camp.categoryId === 2
                          ? "Education"
                          : camp.categoryId === 3
                            ? "Health"
                            : `Category ${camp.categoryId}`}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2 w-36">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                        <span>
                          {camp.current_volunteers || 0} / {camp.max_volunteers}
                        </span>
                        <span>
                          {camp.max_volunteers > 0
                            ? Math.round(
                                ((camp.current_volunteers || 0) /
                                  camp.max_volunteers) *
                                  100,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{
                            width: `${camp.max_volunteers > 0 ? ((camp.current_volunteers || 0) / camp.max_volunteers) * 100 : 0}%`,
                          }}
                          className="h-full bg-blue-600 rounded-full"
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2 w-32">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                        <span>Progress</span>
                        <span style={{ color: primaryPurple }}>
                          {camp.actual_progress || 0}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{
                            width: `${camp.actual_progress || 0}%`,
                            backgroundColor: primaryPurple,
                          }}
                          className="h-full rounded-full"
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-bold border ${getStatusStyle(camp.status)}`}
                    >
                      {camp.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openProgressModal(camp)}
                        title="Manage Progress"
                        className="p-2 text-[#0066cc] hover:bg-[#0066cc]/10 rounded-xl transition-all"
                      >
                        <Activity size={18} />
                      </button>
                      <button
                        onClick={() => openPhotosManagement(camp)}
                        title="Manage Photos"
                        className="p-2 text-slate-400 hover:text-[#0066cc] hover:bg-slate-50 rounded-xl transition-all"
                      >
                        <ImageIcon size={18} />
                      </button>
                      <button
                        onClick={() => openEditModal(camp)}
                        title="Edit Campaign"
                        className="p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteCampaign(camp.id)}
                        title="Delete Campaign"
                        disabled={deleteCampaignMutation.isPending}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Create Campaign */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95">
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
                    {editingCampaign ? "Edit Campaign" : "Create New Campaign"}
                  </h2>
                  <p className="text-indigo-100 text-xs mt-0.5 opacity-80">
                    {editingCampaign
                      ? "Update campaign details"
                      : "Define goals and requirements"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter campaign title..."
                  className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-[#0066cc]/10 focus:bg-white focus:border-[#0066cc]/20 outline-none transition-all text-sm"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-[#0066cc]/10 focus:bg-white focus:border-[#0066cc]/20 outline-none transition-all text-sm resize-none"
                  placeholder="What is this campaign about?"
                ></textarea>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Location
                </label>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#0066cc]/20 outline-none text-sm"
                    placeholder="Physical or Virtual location"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Category
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoryId: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none text-sm appearance-none cursor-pointer"
                >
                  <option value={1}>Environment</option>
                  <option value={2}>Education</option>
                  <option value={3}>Health</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Max Volunteers
                </label>
                <div className="relative">
                  <Users
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Start Date
                </label>
                <input
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  End Date
                </label>
                <input
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
                  onClick={closeModal}
                  className="flex-1 px-6 py-4 border border-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFormSubmitting}
                  style={{ backgroundColor: primaryPurple }}
                  className="flex-1 px-6 py-4 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:opacity-90 transition-all text-sm disabled:opacity-50"
                >
                  {isFormSubmitting
                    ? "Saving..."
                    : editingCampaign
                      ? "Save Changes"
                      : "Confirm & Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Photos Management */}
      {showPhotosModal && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 border-2 border-dashed border-slate-200 hover:border-[#0066cc]/40 rounded-2xl transition-colors relative flex flex-col items-center justify-center gap-2 group cursor-pointer">
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

                <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col gap-3 justify-center">
                  <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Link2 size={16} style={{ color: primaryPurple }} /> Add
                    Photo via URL
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={photoUrlInput}
                      onChange={(e) => setPhotoUrlInput(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0066cc]/40 text-xs"
                    />
                    <button
                      onClick={handleUrlSubmit}
                      style={{ backgroundColor: primaryPurple }}
                      className="px-4 py-2.5 text-white font-bold rounded-xl text-xs active:scale-95 transition-transform"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Current Gallery ({selectedCampaign.photos?.length || 0})
                </h3>
                {selectedCampaign.photos &&
                selectedCampaign.photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {selectedCampaign.photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 relative group shadow-sm"
                      >
                        <img
                          src={photo.photoUrl}
                          alt="Campaign"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
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

      {progressCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div
              style={{ backgroundColor: primaryPurple }}
              className="p-6 flex justify-between items-center text-white"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <Activity size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">
                    Campaign Progress
                  </h2>
                  <p className="text-indigo-100 text-xs mt-0.5 opacity-80">
                    {progressCampaign.title}
                  </p>
                </div>
              </div>
              <button
                onClick={closeProgressModal}
                className="hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-slate-50 rounded-2xl p-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Latest Progress
                </p>
                <p
                  className="text-4xl font-extrabold"
                  style={{ color: primaryPurple }}
                >
                  {latestProgress ? `${latestProgress.percentage}%` : "—"}
                </p>
                {latestProgress?.notes && (
                  <p className="text-sm text-slate-500 mt-2">
                    {latestProgress.notes}
                  </p>
                )}
                {latestProgress && (
                  <p className="text-xs text-slate-400 mt-2">
                    Updated{" "}
                    {new Date(latestProgress.createdAt).toLocaleString()}
                  </p>
                )}
              </div>

              <form onSubmit={handleProgressSubmit} className="space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Log new entry
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    required
                    placeholder="0-100"
                    value={progressForm.percentage}
                    onChange={(e) =>
                      setProgressForm({
                        ...progressForm,
                        percentage: Number(e.target.value),
                      })
                    }
                    className="col-span-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#0066cc]/20 font-bold text-slate-700"
                  />
                  <input
                    type="text"
                    placeholder="Optional notes"
                    value={progressForm.notes}
                    onChange={(e) =>
                      setProgressForm({
                        ...progressForm,
                        notes: e.target.value,
                      })
                    }
                    className="col-span-2 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#0066cc]/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={createProgress.isPending}
                  style={{ backgroundColor: primaryPurple }}
                  className="w-full px-6 py-3 text-white font-bold rounded-2xl shadow-md hover:opacity-90 transition-all text-sm disabled:opacity-50"
                >
                  {createProgress.isPending ? "Saving..." : "Add Progress Entry"}
                </button>
              </form>

              {progressHistory.length > 1 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    History
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {progressHistory.slice(1).map((p) => (
                      <div
                        key={p.progressId}
                        className="flex items-start justify-between gap-3 px-4 py-3 bg-slate-50/60 rounded-xl text-sm"
                      >
                        <div>
                          <span className="font-bold text-slate-800">
                            {p.percentage}%
                          </span>
                          {p.notes && (
                            <p className="text-slate-500 text-xs mt-0.5">
                              {p.notes}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManagement;
