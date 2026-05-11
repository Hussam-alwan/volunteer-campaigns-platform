import { NavLink } from "react-router-dom"; // استيراد NavLink
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  UserCog,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  // إضافة الـ path لكل عنصر ليتناسب مع Routes في App.tsx
  const menuItems = [
    { title: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/" },
    { title: "Clients", icon: <Users size={20} />, path: "/clients" },
    {
      title: "Campaign Management",
      icon: <ClipboardList size={20} />,
      path: "/campaigns",
    },
    {
      title: "Applications",
      icon: <FileText size={20} />,
      path: "/applications",
    },
    { title: "User Management", icon: <UserCog size={20} />, path: "/users" },
    {
      title: "Attendance & Progress",
      icon: <BarChart3 size={20} />,
      path: "/attendance",
    },
  ];

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-100 flex flex-col p-4 shrink-0">
      {/* Logo Area */}
      <div className="flex items-center gap-2 px-2 mb-10">
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
          V
        </div>
        <span className="text-xl font-bold text-gray-800">VolunteerHub</span>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-purple-50 text-purple-600 font-semibold"
                  : "text-gray-950 hover:bg-gray-50"
              }`
            }
          >
            {item.icon}
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Menu */}
      <div className="pt-4 border-t border-gray-100 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-4 py-3 rounded-xl ${isActive ? "bg-purple-50 text-purple-600" : "text-gray-500 hover:bg-gray-50"}`
          }
        >
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </NavLink>

        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl">
          <HelpCircle size={20} />
          <span className="font-medium">Help & Support</span>
        </button>

        <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl mt-4">
          <LogOut size={20} />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
