import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  FileText,
  Target,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  CalendarCheck,
  GraduationCap,
} from "lucide-react";

const Sidebar = () => {
  // المسميات بناءً على ملفاتك الـ VS Code والـ ERD
  const mainMenuItems = [
    { title: "Dashboard", icon: <LayoutGrid size={20} />, path: "/" }, // من ملف ApplicationStatus.tsx
    { title: "Students", icon: <GraduationCap size={20} />, path: "/students" }, // من جدول user/student في ERD
    {
      title: "Applications",
      icon: <FileText size={20} />,
      path: "/applications",
    }, // من ملف ApplicationStatus.tsx
    { title: "Campaigns", icon: <Target size={20} />, path: "/campaigns" }, // من ملف CampaignManagement.tsx
    { title: "Volunteers", icon: <Users size={20} />, path: "/volunteers" }, // مسمى أساسي في مشروعك
    {
      title: "Attendance",
      icon: <CalendarCheck size={20} />,
      path: "/attendance",
    }, // مضاف من جدول attendance في ERD
    { title: "Reports", icon: <BarChart3 size={20} />, path: "/reports" }, // للتقارير والإحصائيات
  ];

  const secondaryMenuItems = [
    { title: "Settings", icon: <Settings size={20} />, path: "/settings" },
    { title: "Help & Support", icon: <HelpCircle size={20} />, path: "/help" },
  ];

  // ألوان التصميم المطلوبة (البنفسجي والأبيض)
  const activeLinkClass =
    "relative w-full flex items-center gap-3 px-6 py-3 text-[#5D3FD3] font-semibold bg-[#F5F3FF] transition-all";
  const inactiveLinkClass =
    "w-full flex items-center gap-3 px-6 py-3 text-[#64748B] hover:text-[#5D3FD3] transition-all font-medium";

  return (
    <aside className="w-64 h-[95vh] bg-white flex flex-col my-auto ml-4 rounded-[30px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
      {/* Header Area - Flowice Style Logo */}
      <div className="flex items-center gap-3 px-6 py-8 mb-4 bg-[#5D3FD3] text-white">
        <div className="bg-white/20 p-1.5 rounded-lg">
          <div className="w-5 h-5 border-2 border-white rotate-45 flex items-center justify-center">
            <div className="w-2 h-2 bg-white" />
          </div>
        </div>
        <span className="text-xl font-bold tracking-tight">Flowice</span>
      </div>

      {/* Main Menu */}
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
                {/* الخط العامودي الجانبي البنفسجي */}
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

      {/* Secondary Menu */}
      <div className="space-y-1 border-t border-gray-50 pt-4">
        {secondaryMenuItems.map((item, index) => (
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
      </div>

      {/* Log Out Section */}
      <div className="mt-auto pb-10 px-6">
        <button className="flex items-center gap-3 text-[#64748B] hover:text-red-600 transition-all font-medium group">
          <LogOut
            size={20}
            className="group-hover:translate-x-1 transition-transform"
          />
          <span className="text-[15px]">Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
