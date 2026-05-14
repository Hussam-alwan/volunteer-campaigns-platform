import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Users, // تم استخدامها لـ Users بدلاً من Volunteers
  FileText,
  Target,
  BarChart3,
  LogOut,
  CalendarCheck,
  School, // أيقونة جديدة لـ Colleges
} from "lucide-react";

const Sidebar = () => {
  const mainMenuItems = [
    { title: "Dashboard", icon: <LayoutGrid size={20} />, path: "/" },
    // تم تغيير المسمى من Students إلى Users بناءً على جدول user في الـ ERD
    { title: "Users", icon: <Users size={20} />, path: "/users" },
    {
      title: "Applications",
      icon: <FileText size={20} />,
      path: "/applications",
    },
    { title: "Campaigns", icon: <Target size={20} />, path: "/campaigns" },
    // تم إضافة Colleges بناءً على جدول college في الـ ERD
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

  return (
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
