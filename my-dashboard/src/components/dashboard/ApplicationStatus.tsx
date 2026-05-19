"use client";

import {
  Filter,
  ChevronDown,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
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
} from "@/components/layout/Avaert";

import { cn } from "@/pages/lib/utils";
//table
const applications = [
  {
    id: 1,
    name: "Emma Johnson",
    email: "emma.johnson@univ.edu",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    college: "Engineering",
    motivation:
      "I am passionate about community service and believe in making a...",
    appliedOn: "15 Apr 2025",
    status: "Pending",
  },
  {
    id: 2,
    name: "Liam Smith",
    email: "liam.smith@univ.edu",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    college: "Business",
    motivation: "Volunteering has always been important to me. I enjoy...",
    appliedOn: "14 Apr 2025",
    status: "Pending",
  },
  {
    id: 3,
    name: "Olivia Brown",
    email: "olivia.brown@univ.edu",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    college: "Arts & Design",
    motivation:
      "I want to use my creative skills to help organizations that...",
    appliedOn: "13 Apr 2025",
    status: "Accepted",
  },
  {
    id: 4,
    name: "Noah Williams",
    email: "noah.williams@univ.edu",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    college: "Computer Science",
    motivation: "Technology can create real change. I want to contribute...",
    appliedOn: "12 Apr 2025",
    status: "Rejected",
  },
  {
    id: 5,
    name: "Ava Davis",
    email: "ava.davis@univ.edu",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    college: "Health Sciences",
    motivation:
      "Helping others and promoting wellness is my passion. I hope...",
    appliedOn: "11 Apr 2025",
    status: "Pending",
  },
];

const statusStyles = {
  Pending: "bg-amber-100 text-amber-700",
  Accepted: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

//chart data

const stats = [
  {
    title: "Pending Review",
    value: "56",
    change: "+12.5%",
    changeText: "from last month",
    icon: FileText,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    positive: true,
  },
  {
    title: "Accepted This Month",
    value: "38",
    change: "+8.7%",
    changeText: "from last month",
    icon: CheckCircle2,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    positive: true,
  },
  {
    title: "Acceptance Rate",
    value: "67.9%",
    change: "+5.4%",
    changeText: "from last month",
    icon: TrendingUp,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    positive: true,
  },
];
import HeaderPage from "@/components/layout/HeaderPage";
function ApplicationStatus() {
  return (
    <div>
      {/* //header */}
      <HeaderPage />
      {/* //main content */}
      <main className="flex-1 p-2">
        <div className="flex gap-6">
          {/* Left Content */}
          <div className="flex-1 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Volunteer Applications
              </h1>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <Calendar className="w-4 h-4" />
                  This Month
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#5D3FD3] text-white rounded-lg text-sm font-medium hover:bg-[#5D3FD3] transition-colors">
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
                      <p className="text-xs mt-2">
                        <span
                          className={
                            stat.positive ? "text-green-600" : "text-red-600"
                          }
                        >
                          {stat.change}
                        </span>
                        <span className="text-gray-400 ml-1">
                          {stat.changeText}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Applications
                </h2>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Sort: Newest
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full ">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                        Student Name
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                        College
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                        Motivation Letter (Preview)
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
                    {applications.map((app) => (
                      <tr
                        key={app.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9">
                              <AvatarImage src={app.avatar} />
                              <AvatarFallback>
                                {app.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {app.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {app.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {app.college}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                          {app.motivation}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {app.appliedOn}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "px-2.5 py-1 rounded-full text-xs font-medium",
                              statusStyles[
                                app.status as keyof typeof statusStyles
                              ],
                            )}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button className="p-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
                              <Check className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing 1 to 5 of 56 applications
                </p>
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="w-8 h-8 bg-[#5D3FD3] text-white rounded-lg text-sm font-medium">
                    1
                  </button>
                  <button className="w-8 h-8 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-600 transition-colors">
                    2
                  </button>
                  <button className="w-8 h-8 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-600 transition-colors">
                    3
                  </button>
                  <span className="px-2 text-gray-400">...</span>
                  <button className="w-8 h-8 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-600 transition-colors">
                    12
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
        </div>
      </main>

      {/* Chart */}
    </div>
  );
}

export default ApplicationStatus;
