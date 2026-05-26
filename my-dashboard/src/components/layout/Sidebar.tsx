import React, { useState } from "react"; // أضفنا useState هنا
import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  FileText,
  Target,
  BarChart3,
  LogOut,
  CalendarCheck,
  School,
  X, // أيقونة للإغلاق
  AlertCircle, // أيقونة للتنبيه
} from "lucide-react";

const Sidebar = () => {
  // 1. حالة للتحكم في ظهور النافذة
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const primaryPurple = "#0066cc";

  const mainMenuItems = [
    { title: "Dashboard", icon: <LayoutGrid size={18} />, path: "/dashboard" },
    { title: "Students", icon: <Users size={18} />, path: "/students" },
    {
      title: "Applications",
      icon: <FileText size={18} />,
      path: "/applications",
    },
    { title: "Campaigns", icon: <Target size={18} />, path: "/campaigns" },
    { title: "Colleges", icon: <School size={18} />, path: "/colleges" },
    {
      title: "Attendance",
      icon: <CalendarCheck size={18} />,
      path: "/attendance",
    },
    { title: "Reports", icon: <BarChart3 size={18} />, path: "/reports" },
  ];

  const activeLinkClass =
    "relative w-full flex items-center gap-3 mx-3 px-4 py-2.5 text-[#0066cc] font-semibold bg-[#0066cc]/8 rounded-full transition-colors";
  const inactiveLinkClass =
    "w-full flex items-center gap-3 mx-3 px-4 py-2.5 text-[#1d1d1f] hover:text-[#0066cc] hover:bg-[#f5f5f7] rounded-full transition-colors";

  // 2. دالة تنفيذ تسجيل الخروج الفعلي
  const handleFinalLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <>
      <aside className="w-64 h-[95vh] bg-white flex flex-col my-auto ml-4 rounded-[18px] border border-[#e0e0e0] overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-7">
          <div className="bg-[#0066cc] p-1.5 rounded-lg">
            <div className="w-4 h-4 border-2 border-white rotate-45 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white" />
            </div>
          </div>
          <span className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
            Volunteer
          </span>
        </div>

        <nav className="flex-1 space-y-1 mt-2">
          {mainMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? activeLinkClass : inactiveLinkClass
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={isActive ? "text-[#0066cc]" : "text-[#7a7a7a]"}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[15px]">{item.title}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pb-8 px-6">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 text-[#7a7a7a] hover:text-red-600 transition-colors font-medium group w-full"
          >
            <LogOut
              size={18}
              className="group-hover:translate-x-0.5 transition-transform"
            />
            <span className="text-[15px]">Log Out</span>
          </button>
        </div>
      </aside>

      {/* 4. نافذة التأكيد (Logout Confirmation Modal) */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* الجزء العلوي */}
            <div className="bg-[#0066cc] p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} />
                <h2 className="font-bold">Confirmation</h2>
              </div>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="hover:bg-white/10 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* محتوى النافذة */}
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Logout?</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Are you sure you want to end your session?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3 text-slate-400 font-bold rounded-2xl hover:bg-slate-50 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinalLogout}
                  className="flex-1 py-3 bg-red-500 text-white font-bold rounded-2xl shadow-lg shadow-red-100 hover:bg-red-600 transition-all text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
