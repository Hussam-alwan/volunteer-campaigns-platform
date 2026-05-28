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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

function App() {
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
