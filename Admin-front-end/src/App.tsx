import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import AOS from "aos"; 
import "aos/dist/aos.css";
import "@radix-ui/themes/styles.css";


// Authentication
import WorkerLogin from "./Authentication/WorkerLogin";

// Pages
import DashboardPage from "./screens/DashboardPage";
import QueuePage from "./screens/QueuePage";
import QueueViewPage from "./screens/QueueViewPage";
//import DocumentReviewPage from "./screens/DocumentReviewPage";
import SettingsPage from "./screens/SettingsPage";
import Layout from "./Layout";

const App = () => {
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const hiddenRoutes = ["/login"];
  const hideHeaderFooter = hiddenRoutes.includes(location.pathname);

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
        {/* Login page without sidebar */}
        <Route path="/login" element={<WorkerLogin />} />

        {/* Pages with sidebar */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/queue" element={<QueuePage />} />
          <Route path="/queueView/:id/:file_url" element={<QueueViewPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<WorkerLogin />} />
      </Routes>
    </div>
  );
};

export default App;
