import { Navigate, Route, Routes } from "react-router";

import HomePage from "./pages/HomePage";
import CreatePage from "./pages/TaskCreatePage";
import TaskDetailPage from "./pages/TaskDetailPage";
import LoginPage from "./pages/auth/LoginPage";
import { PublicRoute, ProtectedRoute } from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import ThemeSettingsPage from "./pages/settings/ThemeSettings";

const App = () => {
  return (
    <div className="min-h-screen w-full">
      <Routes>
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<PublicRoute> <LoginPage /> </PublicRoute>} />

        <Route element={<ProtectedRoute> <AppLayout /> </ProtectedRoute>} >
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/task/:id" element={<TaskDetailPage />} />
          <Route path="/settings/theme" element={<ThemeSettingsPage />} />
        </Route>

      </Routes>
    </div>
  );
};
export default App;