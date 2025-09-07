// App.tsx

import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "@radix-ui/themes/styles.css";

// Components
import Sidebar from "./components/sidebar";
import TopPanel from "./components/TopPanel";
import RightDetailsPanel from "./components/RightDetailsPanel";

// Authentication
import WorkerLogin from "./Authentication/WorkerLogin";
import WorkerSignUpScreen from "./Authentication/WorkerSignin";
import ForgotPassword from "./Authentication/ForgotPassword";
import ResetPassword from "./Authentication/ResertPassword";

// Pages
import DashboardPage from "./screens/DashboardPage";
import QueuePage from "./screens/QueuePage";
import QueueViewPage from "./screens/QueueViewPage";
import VerifiedPage from "./screens/VerifiedPage";
import VerifiedViewPage from "./screens/VerifiedViewPage";
import SettingsPage from "./screens/SettingsPage";

// Main App
const App = () => {
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const hiddenRoutes = ["/login", "/signup",];
  const hideHeaderFooter = hiddenRoutes.includes(location.pathname);

  return (
    <div className="font-sans">
      {!hideHeaderFooter}

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
        <Route
          path="/"
          element={
            <>
              <Sidebar />
              <TopPanel />
              <RightDetailsPanel />
            </>
          }
        />

        {/* Main pages */}
        <Route path="/login" element={<WorkerLogin />} />
        <Route path="/signup" element={<WorkerSignUpScreen />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/queue" element={<QueuePage />} />
        <Route path="/queue/:id" element={<QueueViewPage />} />
        <Route path="/verified" element={<VerifiedPage />} />
        <Route path="/verified/:id" element={<VerifiedViewPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
};

export default App;