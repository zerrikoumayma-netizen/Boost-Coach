import { Navigate, Route, Routes } from "react-router-dom";
import { AdminRoute, ProtectedRoute } from "./auth/ProtectedRoute.jsx";
// import AuthLayout from "./layouts/AuthLayout.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import ProgramsPage from "./pages/ProgramsPage.jsx";
import ProgramLaunchPage from "./pages/ProgramLaunchPage.jsx";
import SessionRunnerPage from "./pages/SessionRunnerPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import SportsAdvicePage from "./pages/SportsAdvicePage.jsx";
import DataExplorerPage from "./pages/DataExplorerPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import AdminProductsPage from "./pages/admin/AdminProductsPage.jsx";
import AdminEventsPage from "./pages/admin/AdminEventsPage.jsx";
import AdminProgramsPage from "./pages/admin/AdminProgramsPage.jsx";
import AdminUsersPage from "./pages/admin/AdminUsersPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="programs" element={<ProgramsPage />} />
          <Route path="programs/:id/launch" element={<ProgramLaunchPage />} />
          <Route path="programs/:id/session/:sessionNumber" element={<SessionRunnerPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="advice" element={<SportsAdvicePage />} />
          <Route path="profile" element={<ProfilePage />} />

          <Route element={<AdminRoute />}>
            <Route path="admin" element={<AdminDashboardPage />} />
            <Route path="admin/products" element={<AdminProductsPage />} />
            <Route path="admin/events" element={<AdminEventsPage />} />
            <Route path="admin/programs" element={<AdminProgramsPage />} />
            <Route path="admin/users" element={<AdminUsersPage />} />
            <Route path="data" element={<DataExplorerPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
