import { useState } from "react";
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
  Tag,
  HandHeart,
  X,
  AlertCircle,
} from "lucide-react";

const Sidebar = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
    { title: "Categories", icon: <Tag size={18} />, path: "/categories" },
    {
      title: "Attendance",
      icon: <CalendarCheck size={18} />,
      path: "/attendance",
    },
    { title: "Reports", icon: <BarChart3 size={18} />, path: "/reports" },
  ];

  const activeLinkClass =
    "flex items-center gap-3 mx-3 px-3.5 py-2.5 text-[#0066cc] font-semibold bg-[#0066cc]/10 rounded-full transition-colors text-[14px]";
  const inactiveLinkClass =
    "flex items-center gap-3 mx-3 px-3.5 py-2.5 text-[#3a3a3c] hover:text-[#0066cc] hover:bg-[#f5f5f7] rounded-full transition-colors text-[14px]";

  // 2. دالة تنفيذ تسجيل الخروج الفعلي
  const handleFinalLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <>
      <aside className="w-56 h-screen bg-white flex flex-col border-r border-[#e0e0e0] overflow-hidden flex-shrink-0">
        <div className="flex items-center gap-2.5 px-5 py-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0066cc] to-[#34c759] flex items-center justify-center shadow-sm">
            <HandHeart size={18} className="text-white" strokeWidth={2.4} />
          </div>
          <span className="text-[17px] font-semibold tracking-tight text-[#1d1d1f]">
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
                  <span className="text-[14px]">{item.title}</span>
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
            <span className="text-[14px]">Log Out</span>
          </button>
        </div>
      </aside>

      {/* 4. نافذة التأكيد (Logout Confirmation Modal) */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
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
