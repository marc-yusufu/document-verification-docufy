import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import AOS from "aos"; 
import "aos/dist/aos.css";
import "@radix-ui/themes/styles.css";

// Authentication
import WorkerLogin from "./Authentication/WorkerLogin";
import WorkerSignUpScreen from "./Authentication/WorkerSignin";
import ForgotPassword from "./Authentication/ForgotPassword";
import ResetPassword from "./Authentication/ResertPassword";

// Pages
import DashboardPage from "./screens/DashboardPage";
import QueuePage from "./screens/QueuePage";
import QueueViewPage from "./screens/QueueViewPage";
import SettingsPage from "./screens/SettingsPage";
import Layout from "./Layout";


// Private Route Component
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const workerId = localStorage.getItem("workerId");
  return workerId ? <Outlet /> : <Navigate to="/login" replace />;
};

const App = () => {
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="font-sans">
      {loading && (
        <div className="text-center text-sm p-2 bg-yellow-100 text-yellow-800">
          Upload in progress...
        </div>
      )}
      {error && (
        <div className="text-center text-sm p-2 bg-red-100 text-red-800">
          Error: {error}
        </div>
      )}

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<WorkerLogin />} />
        <Route path="/register" element={<WorkerSignUpScreen />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />



        {/* Pages with sidebar */}
        <Route element={<Layout />}/>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/queue" element={<QueuePage />} />
          <Route path="/queueView/:code_id" element={<QueueViewPage />} />
          <Route path="/settings" element={<SettingsPage />} />

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/queue" element={<QueuePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default App;
