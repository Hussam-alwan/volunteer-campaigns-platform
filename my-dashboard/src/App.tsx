import { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import useAuthStore from "./store/auth.store";
// Layout Components (part of the app shell — kept eager)
import Sidebar from "./components/layout/Sidebar";
import Toaster from "./components/layout/Toaster";

// Pages — lazy-loaded so each route (and heavy libs like recharts) only
// downloads when the user actually navigates to it.
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CampaignManagement = lazy(
  () => import("./components/dashboard/CampaignManagement"),
);
const AttendanceProgress = lazy(
  () => import("./components/dashboard/AttendanceProgress"),
);
const Colleges = lazy(() => import("./components/dashboard/Colleges"));
const Categories = lazy(() => import("./components/dashboard/Categories"));
const Reports = lazy(() => import("./components/dashboard/Reports"));
const ApplicationStatus = lazy(
  () => import("./components/dashboard/ApplicationStatus"),
);
const UserManagement = lazy(
  () => import("./components/dashboard/UserManagement"),
);

// Auth Pages
const LoginPage = lazy(() => import("./components/auth/LoginPage"));
const RegisterPage = lazy(() => import("./components/auth/RegisterPage"));

const PageFallback = () => (
  <div className="flex h-screen w-full items-center justify-center text-slate-400">
    Loading…
  </div>
);

const ProtectedLayout = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="flex h-screen w-full bg-[#F9F9FB] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
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
      <Toaster />
      <Suspense fallback={<PageFallback />}>
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
            {/* <Route path="/students" element={<StudentsPage />} /> */}
            <Route path="/users" element={<UserManagement />} />
            <Route path="/colleges" element={<Colleges />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
