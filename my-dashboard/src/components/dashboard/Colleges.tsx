// src/pages/Colleges.tsx

import { useState, type FormEvent } from "react";
import {
  Plus,
  Search,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  X,
  School,
} from "lucide-react";

import collegesQueries from "../../API/Colleges/Collegesqueries";
import type { ICollege } from "../../API/Colleges/Colleges.interfaces";

const Colleges = () => {
  const primaryPurple = "#0066cc";

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // 1. الإبقاء على الـ State للبحث (تمت إزالة الـ debouncedQuery لأن الفلترة فورية وداخلية)
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 2. جلب البيانات كاملة من السيرفر (بدون إرسال برامتر name لأن الباك إند لا يدعمه)
  const {
    data: collegesResponse,
    isLoading: loading,
    isFetching: fetching,
    isError: hasError,
  } = collegesQueries.useGetColleges({
    page: pagination.pageIndex,
    size: pagination.pageSize,
  });

  const addCollegeMutation = collegesQueries.useAddCollege();
  const updateCollegeMutation = collegesQueries.useUpdateCollege();
  const deleteCollegeMutation = collegesQueries.useDeleteCollege();

  const allColleges = collegesResponse?.content || [];

  // 3. ✨ هنا السحر: تفلترة المصفوفة داخلياً في الفرونت إند بناءً على ما يكتبه المستخدم فورياً
  const filteredColleges = allColleges.filter((college: ICollege) => {
    const term = searchQuery.toLowerCase().trim();
    return (
      college.name.toLowerCase().includes(term) ||
      college.description.toLowerCase().includes(term)
    );
  });

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(
    null,
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [editTimestamps, setEditTimestamps] = useState({
    createdAt: "",
    updatedAt: "",
  });

  const formatDateTime = (isoString: string) => {
    if (!isoString) return { date: "N/A", time: "" };
    try {
      const parts = isoString.split("T");
      const date = parts[0];
      const time = parts[1] ? parts[1].split(".")[0] : "";
      return { date, time };
    } catch {
      return { date: isoString, time: "" };
    }
  };

  const handleOpenEditModal = (college: ICollege) => {
    setSelectedCollegeId(college.collegeId);
    setFormData({
      name: college.name,
      description: college.description,
    });
    setEditTimestamps({
      createdAt: college.createdAt,
      updatedAt: college.updatedAt,
    });
    setIsEditMode(true);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setIsEditMode(false);
    setSelectedCollegeId(null);
    setFormData({ name: "", description: "" });
    setEditTimestamps({ createdAt: "", updatedAt: "" });
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (isEditMode && selectedCollegeId) {
        await updateCollegeMutation.mutateAsync({
          id: selectedCollegeId,
          payload: formData,
        });
      } else {
        await addCollegeMutation.mutateAsync(formData);
      }
      handleCloseModal();
    } catch {
      alert(isEditMode ? "Error updating college" : "Error creating college");
    }
  };

  const handleDeleteCollege = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this college?"))
      return;
    try {
      await deleteCollegeMutation.mutateAsync(id);
    } catch {
      alert(
        "Error deleting college. It might be referenced by other entities.",
      );
    }
  };

  const isActionLoading =
    addCollegeMutation.isPending ||
    updateCollegeMutation.isPending ||
    deleteCollegeMutation.isPending;

  if (hasError) {
    return (
      <div className="w-full p-8 text-center bg-red-50 text-red-600 rounded-2xl border border-red-100">
        <p className="font-bold">Failed to fetch colleges from the server</p>
        <button
          onClick={() => window.location.reload()}
          style={{ backgroundColor: primaryPurple }}
          className="mt-4 px-4 py-2 text-white rounded-xl text-xs font-bold shadow-md animate-pulse"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 p-2 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[34px] font-semibold text-[#1d1d1f] tracking-tight leading-tight">
            University <span style={{ color: primaryPurple }}>Colleges</span>
          </h1>
          <p className="text-[#6e6e73] mt-2 text-[17px]">
            Manage and view all registered academic institutions.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{ backgroundColor: primaryPurple }}
          className="flex items-center gap-2 text-white px-6 py-2.5 rounded-full font-semibold text-[15px] hover:bg-[#004999] transition-colors"
        >
          <Plus size={18} />
          Add New College
        </button>
      </div>

      {/* Search Area */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="relative max-w-md flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by college name..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-[#0066cc]/10 text-sm"
          />
        </div>
        {(loading || fetching) && (
          <div
            className="animate-spin rounded-full h-5 w-5 border-b-2"
            style={{ borderColor: primaryPurple }}
          ></div>
        )}
      </div>

      {/* Table Area */}
      <div
        className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-opacity duration-300 ${isActionLoading || loading || fetching ? "opacity-50 pointer-events-none" : ""}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fafafc] border-b border-[#e0e0e0]">
                <th className="px-6 py-4 font-medium text-[#6e6e73] text-[12px] uppercase tracking-[0.06em]">
                  College Name
                </th>
                <th className="px-6 py-4 font-medium text-[#6e6e73] text-[12px] uppercase tracking-[0.06em]">
                  Description
                </th>
                <th className="px-6 py-4 font-medium text-[#6e6e73] text-[12px] uppercase tracking-[0.06em]">
                  Created
                </th>
                <th className="px-6 py-4 font-medium text-[#6e6e73] text-[12px] uppercase tracking-[0.06em]">
                  Updated
                </th>
                <th className="px-6 py-4 font-medium text-[#6e6e73] text-[12px] uppercase tracking-[0.06em] text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {/* 4. تم التبديل إلى filteredColleges بدلاً من colleges ليعمل البحث فورياً */}
              {filteredColleges.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-10 text-[#6e6e73] text-[15px]"
                  >
                    No colleges found matching your search.
                  </td>
                </tr>
              ) : (
                filteredColleges.map((college) => {
                  const created = formatDateTime(college.createdAt);
                  const updated = formatDateTime(college.updatedAt);

                  return (
                    <tr
                      key={college.collegeId}
                      className="hover:bg-[#fafafc] transition-colors"
                    >
                      <td className="px-6 py-5">
                        <span className="font-semibold text-[#1d1d1f] text-[15px]">
                          {college.name}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[#3a3a3c] text-[14px] max-w-xs line-clamp-1">
                          {college.description}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-[#6e6e73] text-[13px]">
                          <Calendar size={13} />
                          <span>{created.date}</span>
                          {created.time && (
                            <span className="text-[#a1a1a6] text-[12px] ml-1 inline-flex items-center gap-1">
                              <Clock size={11} />
                              {created.time}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-[#6e6e73] text-[13px]">
                          <Calendar size={13} />
                          <span>{updated.date}</span>
                          {updated.time && (
                            <span className="text-[#a1a1a6] text-[12px] ml-1 inline-flex items-center gap-1">
                              <Clock size={11} />
                              {updated.time}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(college)}
                            title="Edit College"
                            className="p-2 text-[#6e6e73] hover:text-[#0066cc] hover:bg-[#f5f5f7] rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteCollege(college.collegeId)
                            }
                            title="Delete College"
                            className="p-2 text-[#6e6e73] hover:text-[#ff3b30] hover:bg-[#f5f5f7] rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {collegesResponse && collegesResponse.totalPages > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#e0e0e0] text-[13px] text-[#6e6e73]">
            <span>
              Page {pagination.pageIndex + 1} of{" "}
              {collegesResponse.totalPages || 1} ·{" "}
              {collegesResponse.totalElements} total
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
                      (collegesResponse.totalPages || 1) - 1,
                      p.pageIndex + 1,
                    ),
                  }))
                }
                disabled={
                  pagination.pageIndex >= (collegesResponse.totalPages || 1) - 1
                }
                className="px-4 py-1.5 rounded-full border border-[#e0e0e0] hover:bg-[#fafafc] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal - Create / Edit College */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div
              style={{ backgroundColor: primaryPurple }}
              className="p-8 flex justify-between items-center text-white"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <School size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">
                    {isEditMode ? "Modify College Details" : "Add New College"}
                  </h2>
                  <p className="text-indigo-100 text-xs mt-0.5 opacity-80">
                    {isEditMode
                      ? "Update information accurately"
                      : "Establish a new academic division"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  College Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., College of Information Technology"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-[#0066cc]/10 focus:bg-white focus:border-[#0066cc]/20 outline-none transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
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
                  className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-[#0066cc]/10 focus:bg-white focus:border-[#0066cc]/20 outline-none transition-all text-base resize-none"
                  placeholder="Provide a summary of the college's major disciplines and mission..."
                ></textarea>
              </div>

              {isEditMode && (
                <div className="grid grid-cols-2 gap-4 pt-2 animate-in fade-in duration-400">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider ml-1">
                      Created At
                    </label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50/30 border border-indigo-100/50 rounded-xl text-indigo-800 text-xs font-semibold select-none cursor-not-allowed">
                      <Calendar size={14} className="text-indigo-600" />
                      <span>
                        {formatDateTime(editTimestamps.createdAt).date}
                      </span>
                      <span className="text-[10px] text-indigo-600 bg-indigo-100/70 px-1.5 py-0.5 rounded-md ml-auto font-bold">
                        {formatDateTime(editTimestamps.createdAt).time}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider ml-1">
                      Last Updated
                    </label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-indigo-50/30 border border-indigo-100/50 rounded-xl text-indigo-800 text-xs font-semibold select-none cursor-not-allowed">
                      <Clock size={14} className="text-indigo-600" />
                      <span>
                        {formatDateTime(editTimestamps.updatedAt).date}
                      </span>
                      <span className="text-[10px] text-indigo-600 bg-indigo-100/70 px-1.5 py-0.5 rounded-md ml-auto font-bold">
                        {formatDateTime(editTimestamps.updatedAt).time}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-2 pt-5 border-t border-slate-50">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-4 border border-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  style={{ backgroundColor: primaryPurple }}
                  className="flex-1 px-6 py-4 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:opacity-90 transition-all text-sm disabled:opacity-50"
                >
                  {isActionLoading
                    ? "Saving..."
                    : isEditMode
                      ? "Save Changes"
                      : "Confirm & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Colleges;
