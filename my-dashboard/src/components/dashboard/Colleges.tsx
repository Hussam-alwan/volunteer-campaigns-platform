import React, { useState } from "react";
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

const Colleges = () => {
  const primaryPurple = "#5D3FD3";
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [colleges] = useState([
    {
      college_id: 1,
      name: "College of Engineering",
      description: "Focuses on various engineering disciplines and innovation.",
      created_at: "2026-01-10",
    },
    {
      college_id: 2,
      name: "College of Science",
      description: "Dedicated to biological, chemical, and physical research.",
      created_at: "2026-02-15",
    },
    {
      college_id: 3,
      name: "College of Arts",
      description: "Exploring human culture, history, and creative expression.",
      created_at: "2026-03-05",
    },
  ]);

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
                  key={college.college_id}
                  className="hover:bg-slate-50/30 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <span className="font-bold text-slate-300 italic">
                      #{college.college_id}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {/* تم حذف الأيقونة هنا كما طلبت */}
                    <span className="font-bold text-slate-700 text-[15px] group-hover:text-[#5D3FD3] transition-colors">
                      {college.name}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                      {college.description}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    {/* لون زاهي هادئ (Indigo) للتاريخ */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-semibold text-xs border border-indigo-100/50">
                      <Calendar size={14} />
                      {college.created_at}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="p-2.5 rounded-xl text-sky-500 hover:bg-sky-50 transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2.5 rounded-xl text-pink-500 hover:bg-pink-50 transition-all">
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 transition-all">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Add New College */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
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
                    Add New College
                  </h2>
                  <p className="text-indigo-100 text-xs opacity-80">
                    Define a new academic department
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Official Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Faculty of Information Technology"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#5D3FD3]/5 focus:bg-white focus:border-[#5D3FD3]/20 outline-none transition-all text-sm font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                  About the College
                </label>
                <textarea
                  rows="4"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#5D3FD3]/5 focus:bg-white focus:border-[#5D3FD3]/20 outline-none transition-all text-sm font-medium resize-none"
                  placeholder="Brief overview of the college goals..."
                ></textarea>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-4 text-slate-400 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: primaryPurple }}
                  className="flex-1 px-6 py-4 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 hover:translate-y-[-2px] transition-all"
                >
                  Save College
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
