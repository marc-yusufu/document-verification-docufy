import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { FiSearch, FiBell, FiX } from "react-icons/fi";
import { Avatar, Box } from "@radix-ui/themes";

interface TopPanelProps {
  pageTitle?: string;
  onSearch?: (query: string) => void;
}

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/reports": "Reports",
  "/settings": "Settings",
  // add more routes here
};

const TopPanel: React.FC<TopPanelProps> = ({ pageTitle, onSearch }) => {
  const location = useLocation();
  const title = pageTitle ?? routeTitles[location.pathname] ?? "Page";

  const [searchText, setSearchText] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);

  const userName = "John Doe";
  const userRole = "Admin";

  const notifications = [
    { id: 1, message: "Document #123 approved", time: "2 mins ago" },
    { id: 2, message: "New user registered", time: "10 mins ago" },
    { id: 3, message: "System maintenance scheduled", time: "1h ago" },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchText(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  return (
    <>
      <style>{`
        .top-panel {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background-color: #e5e7eb;
          padding: 1rem;
          border-radius: 0.375rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          font-family: Arial, sans-serif;
        }
        .top-panel__title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
        }
        .top-panel__search {
          display: flex;
          align-items: center;
          background-color: #fff;
          border-radius: 9999px;
          padding: 0.25rem 0.75rem;
          width: 320px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .top-panel__search-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 1rem;
          color: #374151;
        }
        .top-panel__search-icon {
          color: #3b82f6;
          font-size: 1.25rem;
          cursor: pointer;
        }
        .top-panel__actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .top-panel__bell-icon {
          color: #3b82f6;
          font-size: 1.5rem;
          cursor: pointer;
        }
        .top-panel__user-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .top-panel__user-text {
          display: flex;
          flex-direction: column;
        }
        .top-panel__user-name {
          font-weight: 500;
          margin: 0;
        }
        .top-panel__user-role {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0;
        }

        /* Drawer styles */
        .notif-drawer {
          position: fixed;
          right: 0;
          top: 0;
          height: 100%;
          width: 320px;
          background: #fff;
          box-shadow: -2px 0 8px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .notif-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #eee;
          background: #f9fafb;
        }
        .notif-list {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }
        .notif-item {
          margin-bottom: 1rem;
          padding: 0.5rem;
          border-radius: 6px;
          background: #f3f4f6;
        }
        .notif-item p {
          margin: 0;
          font-size: 0.9rem;
        }
        .notif-item small {
          font-size: 0.75rem;
          color: #6b7280;
        }
        .notif-footer {
          padding: 0.75rem;
          border-top: 1px solid #eee;
          text-align: center;
          background: #f9fafb;
        }
        .notif-footer a {
          color: #2563eb;
          font-size: 0.9rem;
          text-decoration: none;
        }
        .close-btn {
          cursor: pointer;
          font-size: 1.25rem;
          color: #374151;
        }
      `}</style>

      <div className="top-panel">
        {/* Page Title */}
        <h1 className="top-panel__title">{title}</h1>

        {/* Search */}
        <div className="top-panel__search">
          <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={handleSearchChange}
            className="top-panel__search-input"
          />
          <FiSearch className="top-panel__search-icon" />
        </div>

        {/* Notifications + User */}
        <div className="top-panel__actions">
          {/* Bell opens drawer */}
          <FiBell className="top-panel__bell-icon" onClick={() => setNotifOpen(true)} />

          <div className="top-panel__user-info">
            <Avatar radius="full" fallback={
              <Box width="24px" height="24px">
                <svg viewBox="0 0 64 64" fill="currentColor">
                  <path d="M41.5 14c4.687 0 8.5 4.038 8.5 9s-3.813 9-8.5 9S33 27.962 33 23 36.813 14 41.5 14zM56.289 43.609C57.254 46.21 55.3 49 52.506 49c-2.759 0-11.035 0-11.035 0 .689-5.371-4.525-10.747-8.541-13.03 2.388-1.171 5.149-1.834 8.07-1.834C48.044 34.136 54.187 37.944 56.289 43.609zM37.289 46.609C38.254 49.21 36.3 52 33.506 52c-5.753 0-17.259 0-23.012 0-2.782 0-4.753-2.779-3.783-5.392 2.102-5.665 8.245-9.472 15.289-9.472S35.187 40.944 37.289 46.609zM21.5 17c4.687 0 8.5 4.038 8.5 9s-3.813 9-8.5 9S13 30.962 13 26 16.813 17 21.5 17z" />
                </svg>
              </Box>
            } />
            <div className="top-panel__user-text">
              <p className="top-panel__user-name">{userName}</p>
              <p className="top-panel__user-role">{userRole}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Drawer */}
      {notifOpen && (
        <div className="notif-drawer">
          <div className="notif-header">
            <h3>Notifications</h3>
            <FiX className="close-btn" onClick={() => setNotifOpen(false)} />
          </div>
          <div className="notif-list">
            {notifications.map((n) => (
              <div key={n.id} className="notif-item">
                <p>{n.message}</p>
                <small>{n.time}</small>
              </div>
            ))}
          </div>
          <div className="notif-footer">
            <a href="/notifications">View All</a>
          </div>
        </div>
      )}
    </>
  );
};

export default TopPanel;
