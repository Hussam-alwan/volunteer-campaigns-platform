import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./pages/Dashboard";
// 1. استيراد صفحة إدارة الحملات
import StudentsPage from "./components/dashboard/StudentsPage";
import CampaignManagement from "./components/dashboard/CampaignManagement";
import AttendanceProgress from "./components/dashboard/AttendanceProgress";
import Colleges from "./components/dashboard/Colleges";
import Reports from "./components/dashboard/Reports";
function App() {
  return (
    <Router>
      <div className="flex h-screen w-full bg-[#F9F9FB] overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />

            {/* 2. إضافة الراوت الخاص بـ Campaign Management */}
            <Route path="/campaigns" element={<CampaignManagement />} />

            <Route
              path="/applications"
              element={<div>صفحة الطلبات قيد الإنشاء</div>}
            />
            <Route path="/attendance" element={<AttendanceProgress />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/colleges" element={<Colleges />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
