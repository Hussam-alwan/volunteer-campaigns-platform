// src/pages/Colleges.tsx

import React, { useState, type ChangeEvent, type FormEvent } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Calendar,
  Edit2,
  Trash2,
  X,
  School,
} from "lucide-react";

import collegesQueries from "../../API/Colleges/Collegesqueries";
import collegesApis from "../../API/Colleges/Colleges.apis";
import type {
  ICollege,
  ICreateCollegeInput,
} from "../../API/Colleges/Colleges.interfaces";

const Colleges: React.FC = () => {
  const primaryPurple = "#5D3FD3";

  // 1. التحكم بحالة الـ Pagination المتوافقة مع الباك-إيند
  const [pagination, setPagination] = useState({
    pageIndex: 0, // السيرفرات تعتمد غالباً على 0 كأول صفحة
    pageSize: 10,
  });

  // 2. جلب البيانات الاحترافي عبر TanStack Query بدون useEffect يدوي
  const {
    data: collegesResponse,
    isLoading: loading,
    isError: hasError,
    refetch: fetchColleges,
  } = collegesQueries.useGetAllColleges({
    page: pagination.pageIndex,
    size: pagination.pageSize,
  });

  // استخراج المصفوفة الفعلية للكليات من الرد المدعوم بالـ pageable
  const colleges = collegesResponse?.content || [];

  // 3. حالات النوافذ المنبثقة والتحكم بالعمليات
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(
    null,
  );

  // فورم الإنشاء والتعديل الموحد المربوط بالـ State
  const [formData, setFormData] = useState<ICreateCollegeInput>({
    name: "",
    description: "",
  });

  // 4. معالج فتح نافذة التعديل لتعبئة البيانات تلقائياً
  const handleOpenEditModal = (college: ICollege) => {
    setSelectedCollegeId(college.collegeId);
    setFormData({
      name: college.name,
      description: college.description,
    });
    setIsEditMode(true);
    setShowCreateModal(true);
  };

  // 5. معالج إغلاق النافذة وتصفير البيانات
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setIsEditMode(false);
    setSelectedCollegeId(null);
    setFormData({ name: "", description: "" });
  };

  // 6. تنفيذ عمليتي الإنشاء والتعديل (Submit)
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && selectedCollegeId) {
        await collegesApis.update(selectedCollegeId, formData);
      } else {
        await collegesApis.create(formData);
      }
      handleCloseModal();
      fetchColleges(); // تحديث الكاش تلقائياً لعرض البيانات الجديدة
    } catch (err) {
      alert(isEditMode ? "Error updating college" : "Error creating college");
    }
  };

  // 7. تنفيذ عملية الحذف الفوري عبر الـ ID
  const handleDeleteCollege = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this college?"))
      return;
    try {
      await collegesApis.delete(id);
      fetchColleges();
    } catch (err) {
      alert("Error deleting college");
    }
  };

  // شاشة التحميل المتناسقة (Spinner)
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

  // شاشة معالجة الأخطاء وإعادة المحاولة
  if (hasError) {
    return (
      <div className="w-full p-8 text-center bg-red-50 text-red-600 rounded-[24px] border border-red-100">
        <p className="font-bold">Failed to fetch colleges from the server</p>
        <button
          onClick={() => fetchColleges()}
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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            University <span style={{ color: primaryPurple }}>Colleges</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Manage and view all registered academic institutions.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{ backgroundColor: primaryPurple }}
          className="flex items-center gap-2 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95 hover:opacity-90"
        >
          <Plus size={20} />
          Add New College
        </button>
      </div>

      {/* Search Area */}
      <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm">
        <div className="relative max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by college name..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-[#5D3FD3]/10 text-sm"
          />
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 font-bold text-slate-400 text-[11px] uppercase tracking-wider">
                  ID
                </th>
                <th className="px-8 py-5 font-extrabold text-slate-800 text-[13px] uppercase tracking-wider">
                  College Name
                </th>
                <th className="px-8 py-5 font-extrabold text-slate-800 text-[13px] uppercase tracking-wider">
                  Description
                </th>
                <th className="px-8 py-5 font-extrabold text-slate-800 text-[13px] uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-8 py-5 font-extrabold text-slate-800 text-[13px] uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {colleges.map((college) => (
                <tr
                  key={college.collegeId}
                  className="hover:bg-slate-50/30 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <span className="font-bold text-slate-300 italic">
                      #{college.collegeId}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-bold text-slate-800 text-base group-hover:text-[#5D3FD3] transition-colors">
                      {college.name}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-slate-500 text-sm max-w-sm line-clamp-1">
                      {college.description}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <Calendar size={14} />
                      {college.createdAt
                        ? college.createdAt.split("T")[0]
                        : "N/A"}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(college)}
                        title="Edit College"
                        className="p-2 text-slate-400 hover:text-[#5D3FD3] hover:bg-slate-50 rounded-xl transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCollege(college.collegeId)}
                        title="Delete College"
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 text-slate-300 hover:text-[#5D3FD3] transition-colors">
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Create / Edit College */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95">
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

            <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
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
                  className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-[#5D3FD3]/10 focus:bg-white focus:border-[#5D3FD3]/20 outline-none transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-[#5D3FD3]/10 focus:bg-white focus:border-[#5D3FD3]/20 outline-none transition-all text-sm resize-none"
                  placeholder="Provide a summary of the college's major disciplines and mission..."
                ></textarea>
              </div>

              <div className="flex gap-4 mt-4 pt-6 border-t border-slate-50">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-4 border border-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: primaryPurple }}
                  className="flex-1 px-6 py-4 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:opacity-90 transition-all text-sm"
                >
                  {isEditMode ? "Save Changes" : "Confirm & Save"}
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
