// TopPanel.tsx
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { FiBell, FiX } from "react-icons/fi";
import { Avatar } from "@radix-ui/themes";
import { useUser } from "../context/UserContext";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/reports": "Reports",
  "/settings": "Settings",
  // add more routes here
};

const TopPanel: React.FC = () => {
  const location = useLocation();
  const title = routeTitles[location.pathname] ?? "Page";

  const { user, loading } = useUser();
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = [
    { id: 1, message: "Document #123 approved", time: "2 mins ago" },
    { id: 2, message: "New user registered", time: "10 mins ago" },
    { id: 3, message: "System maintenance scheduled", time: "1h ago" },
  ];

  const initials = user?.firstName
    ? user.firstName
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "?";

  return (
    <>
      <header className="flex items-center justify-between bg-gray-100 px-6 py-4 rounded-md shadow-sm">
        {/* Page Title */}
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setNotifOpen(true)}
            aria-label="Open notifications"
            className="text-blue-600 text-2xl p-1 hover:text-blue-700"
          >
            <FiBell />
          </button>

          <div className="flex items-center gap-3">
            <Avatar
              radius="full"
              fallback={
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                  {loading ? "..." : initials}
                </div>
              }
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-800">
                {loading ? "Loading..." : user?.firstName || "Unknown"}
              </span>
              <span className="text-xs text-gray-500">Admin</span>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Drawer */}
      {notifOpen && (
        <aside className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col animate-slideIn">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="text-lg font-medium">Notifications</h3>
            <button
              type="button"
              onClick={() => setNotifOpen(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              <FiX />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="rounded-md bg-gray-50 p-3">
                <p className="text-sm text-gray-800">{n.message}</p>
                <small className="text-xs text-gray-500">{n.time}</small>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-center text-gray-500">No notifications</div>
            )}
          </div>

          <div className="px-4 py-3 border-t text-center bg-gray-50">
            <a href="/notifications" className="text-blue-600 hover:underline">
              View All
            </a>
          </div>
        </aside>
      )}
    </>
  );
};

export default TopPanel;
