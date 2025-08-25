import { Routes, Route } from "react-router-dom";

// Pages
import DashboardPage from "./screens/DashboardPage";
import QueuePage from "./screens/QueuePage";
import QueueViewPage from "./screens/QueueViewPage";
import SettingsPage from "./screens/SettingsPage";
import VerifiedPage from "./screens/VerifiedPage";
import VerifiedViewPage from "./screens/VerifiedViewPage";

export default function AppNav() {
    return (
        <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/queue" element={<QueuePage />} />
            <Route path="/queueView/:id" element={<QueueViewPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/verified" element={<VerifiedPage />} />
            <Route path="/verifiedView" element={<VerifiedViewPage />} />
        </Routes>
    );
}
