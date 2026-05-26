import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import useAuthStore from "./store/auth.store";
// Layout Components
import Sidebar from "./components/layout/Sidebar";

// Pages
import Dashboard from "./pages/Dashboard";
import StudentsPage from "./components/dashboard/StudentsPage";
import CampaignManagement from "./components/dashboard/CampaignManagement";
import AttendanceProgress from "./components/dashboard/AttendanceProgress";
import Colleges from "./components/dashboard/Colleges";
import Reports from "./components/dashboard/Reports";
import ApplicationStatus from "./components/dashboard/ApplicationStatus";

// Auth Pages
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";

const ProtectedLayout = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="flex h-screen w-full bg-[#F9F9FB] overflow-hidden p-2">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-10">
        <Outlet />
      </main>
    </div>
  );
};

const PublicLayout = () => {
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

function App() {
  // 2️⃣ استخراج الـ loading والـ checkAuth بأبسط طريقة قياسية
  const loading = useAuthStore((state) => state.loading);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // تشغيل فحص الجلسة بأمان تام
    if (checkAuth && typeof checkAuth === "function") {
      checkAuth();
    } else {
      // حماية إضافية تمنع تعليق الشاشة لو تجمّد الكاش
      useAuthStore.setState({ loading: false });
    }
  }, [checkAuth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5D3FD3]"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/campaigns" element={<CampaignManagement />} />
          <Route path="/applications" element={<ApplicationStatus />} />
          <Route path="/attendance" element={<AttendanceProgress />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/colleges" element={<Colleges />} />
          <Route path="/reports" element={<Reports />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
