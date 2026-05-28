import { useState } from "react";
import { NavLink } from "react-router-dom";
import authApis from "@/API/Authorization/authorization.apis";
import useAuthStore from "../../store/auth.store";
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

  // const primaryPurple = "#5D3FD3";

  const mainMenuItems = [
    { title: "Dashboard", icon: <LayoutGrid size={20} />, path: "/" },
    { title: "Users", icon: <Users size={20} />, path: "/users" },
    {
      title: "Applications",
      icon: <FileText size={20} />,
      path: "/applications",
    },
    { title: "Campaigns", icon: <Target size={20} />, path: "/campaigns" },
    { title: "Colleges", icon: <School size={20} />, path: "/colleges" },
    {
      title: "Attendance",
      icon: <CalendarCheck size={20} />,
      path: "/attendance",
    },
    { title: "Reports", icon: <BarChart3 size={20} />, path: "/reports" },
  ];

  const activeLinkClass =
    "relative w-full flex items-center gap-3 px-6 py-3 text-[#5D3FD3] font-semibold bg-[#F5F3FF] transition-all";
  const inactiveLinkClass =
    "w-full flex items-center gap-3 px-6 py-3 text-[#64748B] hover:text-[#5D3FD3] transition-all font-medium";

  // 2. دالة تنفيذ تسجيل الخروج الفعلي
  const handleFinalLogout = async () => {
    try {
      // مسح كوكي الجلسة على السيرفر
      await authApis.logout();
    } catch {
      // نتابع تسجيل الخروج محلياً حتى لو فشل طلب السيرفر
    } finally {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
  };

  return (
    <>
      <aside className="w-64 h-[95vh] bg-white flex flex-col my-auto ml-4 rounded-[30px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {/* Header Area */}
        <div className="flex items-center gap-3 px-6 py-8 mb-4 bg-[#5D3FD3] text-white">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <div className="w-5 h-5 border-2 border-white rotate-45 flex items-center justify-center">
              <div className="w-2 h-2 bg-white" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight">Volunteer</span>
        </div>

        <nav className="flex-1 space-y-1">
          {mainMenuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                isActive ? activeLinkClass : inactiveLinkClass
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 w-1.5 h-7 bg-[#5D3FD3] rounded-r-full" />
                  )}
                  <span
                    className={isActive ? "text-[#5D3FD3]" : "text-[#94A3B8]"}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[15px]">{item.title}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* 3. تعديل زر Log Out لفتح النافذة */}
        <div className="mt-auto pb-10 px-6">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 text-[#64748B] hover:text-red-600 transition-all font-medium group w-full"
          >
            <LogOut
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
            <span className="text-[15px]">Log Out</span>
          </button>
        </div>
      </aside>

      {/* 4. نافذة التأكيد (Logout Confirmation Modal) */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-32px shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* الجزء العلوي */}
            <div className="bg-[#5D3FD3] p-6 flex justify-between items-center text-white">
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
