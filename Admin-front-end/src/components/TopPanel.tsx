import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { FiSearch, FiBell } from "react-icons/fi";

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

    const userName = "John Doe";
    const userRole = "Admin";
    const userImage = "/images/user-avatar.png";

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
        .top-panel__user-image {
          width: 40px;
          height: 40px;
          border-radius: 9999px;
          object-fit: cover;
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
                    <FiBell className="top-panel__bell-icon" />
                    <div className="top-panel__user-info">
                        <img src={userImage} alt={userName} className="top-panel__user-image" />
                        <div className="top-panel__user-text">
                            <p className="top-panel__user-name">{userName}</p>
                            <p className="top-panel__user-role">{userRole}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TopPanel;
