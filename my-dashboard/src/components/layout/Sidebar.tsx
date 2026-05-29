import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import authApis from "@/API/Authorization/authorization.apis";
import useAuthStore from "../../store/auth.store";
import type { IUser } from "../../API/Authorization/authorization.interface";
import {
  LayoutGrid,
  Users,
  FileText,
  Target,
  BarChart3,
  LogOut,
  CalendarCheck,
  School,
  Tags,
  X, // أيقونة للإغلاق
  AlertCircle, // أيقونة للتنبيه
} from "lucide-react";

const Sidebar = () => {
  // 1. حالة للتحكم في ظهور النافذة
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // المستخدم الحالي (من المتجر مبدئياً ثم نحدّثه من /me)
  const [currentUser, setCurrentUser] = useState<IUser | null>(
    useAuthStore.getState().user,
  );

  useEffect(() => {
    authApis
      .me()
      .then(setCurrentUser)
      .catch(() => {
        /* not logged in / offline — keep store value */
      });
  }, []);

  // const primaryPurple = "#5D3FD3";

  const mainMenuItems = [
    { title: "Dashboard", icon: <LayoutGrid size={20} />, path: "/dashboard" },
    { title: "Users", icon: <Users size={20} />, path: "/users" },
    {
      title: "Applications",
      icon: <FileText size={20} />,
      path: "/applications",
    },
    { title: "Campaigns", icon: <Target size={20} />, path: "/campaigns" },
    { title: "Colleges", icon: <School size={20} />, path: "/colleges" },
    { title: "Categories", icon: <Tags size={20} />, path: "/categories" },
    {
      title: "Attendance",
      icon: <CalendarCheck size={20} />,
      path: "/attendance",
    },
    { title: "Reports", icon: <BarChart3 size={20} />, path: "/reports" },
  ];

  const activeLinkClass =
    "mx-3 flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#5D3FD3] font-semibold bg-[#F5F3FF] transition-all";
  const inactiveLinkClass =
    "mx-3 flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#64748B] hover:text-[#5D3FD3] hover:bg-gray-50 transition-all font-medium";

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
      <aside className="w-64 h-screen bg-white flex flex-col border-r border-gray-200 overflow-hidden">
        {/* Header Area */}
        <div className="flex items-center justify-center px-6 py-8 mb-4">

          <img src="/logo.png" alt="Volunteer logo" className="h-20 object-contain" />
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

        {/* Current user (from /me) + Log Out */}
        <div className="mt-auto px-3 pb-6 space-y-1">
          {currentUser && (
            <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-slate-50">
              <div className="w-9 h-9 shrink-0 rounded-full bg-[#5D3FD3] text-white flex items-center justify-center text-sm font-semibold uppercase">
                {(currentUser.firstName?.[0] ?? "") +
                  (currentUser.lastName?.[0] ?? "")}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-slate-800 truncate">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 text-[#64748B] hover:text-red-600 transition-all font-medium group w-full px-3 py-2.5 rounded-xl hover:bg-red-50"
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
          <div className="bg-white w-full max-w-sm rounded-[18px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
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
