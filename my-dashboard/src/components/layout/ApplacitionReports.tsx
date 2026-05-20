import React from "react";
import { ChevronDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  //   Legend,
} from "recharts";

const data = [
  { date: "12 Apr", pending: 30, accepted: 45, rejected: 20 },
  { date: "13 Apr", pending: 35, accepted: 55, rejected: 25 },
  { date: "14 Apr", pending: 40, accepted: 70, rejected: 30 },
  { date: "15 Apr", pending: 45, accepted: 60, rejected: 25 },
  { date: "16 Apr", pending: 50, accepted: 80, rejected: 35 },
  { date: "17 Apr", pending: 55, accepted: 75, rejected: 30 },
  { date: "18 Apr", pending: 60, accepted: 85, rejected: 40 },
];

function ApplacitionReports() {
  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Applications Overview
          </h3>
          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
            This Month
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-300"></div>
            <span className="text-xs text-gray-600">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
            <span className="text-xs text-gray-600">Accepted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-400"></div>
            <span className="text-xs text-gray-600">Rejected</span>
          </div>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0f0f0"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#9ca3af" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#9ca3af" }}
            />
            <Bar
              dataKey="pending"
              fill="#a5b4fc"
              radius={[4, 4, 0, 0]}
              barSize={12}
            />
            <Bar
              dataKey="accepted"
              fill="#4f46e5"
              radius={[4, 4, 0, 0]}
              barSize={12}
            />
            <Bar
              dataKey="rejected"
              fill="#f472b6"
              radius={[4, 4, 0, 0]}
              barSize={12}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ApplacitionReports;
