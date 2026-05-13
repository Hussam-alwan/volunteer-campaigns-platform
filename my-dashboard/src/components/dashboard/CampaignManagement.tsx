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
  const [showCreateModal, setShowCreateModal] = useState(false);

  // اللون البنفسجي المعتمد في السايدر بار
  const primaryPurple = "#5D3FD3";

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
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Approved":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "Draft":
        return "bg-slate-50 text-slate-500 border-slate-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

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
          onClick={() => setShowCreateModal(true)}
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
            className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] group hover:border-[#5D3FD3]/20 transition-all flex items-center gap-4"
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
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search campaigns..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-[#5D3FD3]/10 text-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 border border-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">
          <Filter size={18} />
          Filters
        </button>
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
                <th className="px-8 py-5 font-bold text-slate-500">Status</th>
                <th className="px-8 py-5 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {campaigns.map((camp) => (
                <tr
                  key={camp.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-base group-hover:text-[#5D3FD3] transition-colors">
                        {camp.title}
                      </span>
                      <div className="flex items-center gap-2 text-slate-400 text-xs mt-1">
                        <MapPin size={12} /> {camp.location}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      {camp.category}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2 w-36">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                        <span>
                          {camp.current_volunteers} / {camp.max_volunteers}
                        </span>
                        <span style={{ color: primaryPurple }}>
                          {Math.round(
                            (camp.current_volunteers / camp.max_volunteers) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{
                            width: `${(camp.current_volunteers / camp.max_volunteers) * 100}%`,
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
                    <button className="p-2 text-slate-300 hover:text-[#5D3FD3] transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
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
                    Create New Campaign
                  </h2>
                  <p className="text-indigo-100 text-xs mt-0.5 opacity-80">
                    Define goals and requirements
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

            <form className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  placeholder="Enter campaign title..."
                  className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-[#5D3FD3]/10 focus:bg-white focus:border-[#5D3FD3]/20 outline-none transition-all text-sm"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-[#5D3FD3]/10 focus:bg-white focus:border-[#5D3FD3]/20 outline-none transition-all text-sm resize-none"
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
                    className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#5D3FD3]/20 outline-none text-sm"
                    placeholder="Physical or Virtual location"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                  Category
                </label>
                <select className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none text-sm appearance-none cursor-pointer">
                  <option>Environment</option>
                  <option>Education</option>
                  <option>Health</option>
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
                    className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl outline-none text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex gap-4 mt-4 pt-6 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-4 border border-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: primaryPurple }}
                  className="flex-1 px-6 py-4 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:opacity-90 transition-all text-sm"
                >
                  Confirm & Create
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
