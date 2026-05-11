import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  MapPin,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  X,
  Target,
  FileText,
} from "lucide-react";

const CampaignManagement = () => {
  // التحكم في إظهار وإخفاء واجهة الإضافة
  const [showCreateModal, setShowCreateModal] = useState(false);

  // إحصائيات مستوحاة من حالات الحملة في الـ ERD
  const stats = [
    {
      label: "Total Campaigns",
      value: "12",
      icon: <Calendar className="text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      label: "Ongoing",
      value: "5",
      icon: <CheckCircle2 className="text-green-600" />,
      bg: "bg-green-50",
    },
    {
      label: "Pending Approval",
      value: "3",
      icon: <Clock className="text-orange-600" />,
      bg: "bg-orange-50",
    },
  ];

  // بيانات الحملات - الحقول مستوحاة من جدول campaign
  const campaigns = [
    {
      id: 1,
      title: "Beach Clean-up 2026",
      location: "Coastal Area",
      max_volunteers: 50,
      current_volunteers: 32,
      status: "Ongoing",
      start_date: "2026-05-15",
      category: "Environment",
    },
    {
      id: 2,
      title: "Education Workshop",
      location: "City Library",
      max_volunteers: 20,
      current_volunteers: 18,
      status: "Approved",
      start_date: "2026-06-01",
      category: "Education",
    },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case "Ongoing":
        return "bg-green-100 text-green-700 border-green-200";
      case "Approved":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Draft":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Campaign Management
          </h1>
          <p className="text-slate-500 mt-1">
            Organize, track, and manage all volunteer initiatives.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-purple-200 transition-all active:scale-95"
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
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4"
          >
            <div className={`p-4 rounded-2xl ${stat.bg}`}>{stat.icon}</div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search campaigns by title..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-5 py-3 border border-slate-200 rounded-2xl font-semibold text-slate-600 hover:bg-slate-50">
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-6 text-sm font-bold text-slate-600 uppercase">
                Campaign Details
              </th>
              <th className="p-6 text-sm font-bold text-slate-600 uppercase">
                Category
              </th>
              <th className="p-6 text-sm font-bold text-slate-600 uppercase">
                Volunteers
              </th>
              <th className="p-6 text-sm font-bold text-slate-600 uppercase">
                Status
              </th>
              <th className="p-6 text-sm font-bold text-slate-600 uppercase text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {campaigns.map((camp) => (
              <tr
                key={camp.id}
                className="hover:bg-slate-50/80 transition-colors group"
              >
                <td className="p-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-lg group-hover:text-purple-600">
                      {camp.title}
                    </span>
                    <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                      <MapPin size={14} /> {camp.location}
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase">
                    {camp.category}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex flex-col gap-2 w-32">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>
                        {camp.current_volunteers}/{camp.max_volunteers}
                      </span>
                      <span>
                        {Math.round(
                          (camp.current_volunteers / camp.max_volunteers) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{
                          width: `${(camp.current_volunteers / camp.max_volunteers) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(camp.status)}`}
                  >
                    {camp.status}
                  </span>
                </td>
                <td className="p-6 text-center">
                  <button className="p-2 text-slate-400 hover:text-slate-600">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- واجهة إضافة حملة جديدة (Modal) --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-purple-600 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Target size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Create New Campaign</h2>
                  <p className="text-purple-100 text-xs">
                    Fill in the details for the new volunteer initiative
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Form */}
            <form className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
              {/* Campaign Title */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <FileText size={16} className="text-purple-500" /> Campaign
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Annual Tree Planting"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe the campaign goals..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500/20 outline-none transition-all resize-none"
                ></textarea>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <MapPin size={16} className="text-purple-500" /> Location
                </label>
                <input
                  type="text"
                  placeholder="City or Campus"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Category
                </label>
                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none appearance-none">
                  <option>Select Category</option>
                  <option>Environment</option>
                  <option>Education</option>
                  <option>Social Services</option>
                </select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Calendar size={16} className="text-purple-500" /> Start Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Calendar size={16} className="text-purple-500" /> End Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                />
              </div>

              {/* Max Volunteers */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Users size={16} className="text-purple-500" /> Max Volunteers
                </label>
                <input
                  type="number"
                  placeholder="50"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-2 flex gap-4 mt-4 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManagement;
