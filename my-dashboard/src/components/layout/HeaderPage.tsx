import React from "react";
import { Search, MessageSquare, Bell, MoreVertical } from "lucide-react";
import LoginPage from "../auth/LoginPage";
import RegisterPage from "../auth/RegisterPage";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/layout/Avaert";

function HeaderPage() {
  return (
    <div>
      {/* <LoginPage />
      <RegisterPage /> */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        {/* Search */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search here..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2  focus:ring-[#0066cc] focus:border-[#0066cc]-transparent"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
            <MessageSquare className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-2 ml-2">
            <Avatar className="w-9 h-9">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
              <AvatarFallback>AP</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700">
              Antor Paul
            </span>
            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default HeaderPage;
