import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const notifications = [
  {
    id: 1,
    title: "Document Verified!",
    message: 'Your "Proof of Residence.pdf" has been successfully verified.',
    icon: "🧾",
    color: "#2563eb",
  },
  {
    id: 2,
    title: "Document Processing",
    message:
      '"Bank_Statement.pdf" is being analyzed. You’ll be notified once verification is complete.',
    icon: "⏳",
    color: "#f97316",
  },
  {
    id: 3,
    title: "Verification Issue Detected",
    message:
      '"ID_Scan.jpg" could not be verified due to low image quality.',
    icon: "❌",
    color: "#dc2626",
  },
  {
    id: 4,
    title: "Upload Successful",
    message:
      '"Passport_Scan.pdf" has been uploaded and is awaiting verification.',
    icon: "✅",
    color: "#16a34a",
  },
];

export default function MainHeader() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [pinned, setPinned] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        if (!pinned) {
          setShowNotifications(false);
        }
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications, pinned]);

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
    if (!pinned) setPinned(false);
  };

  const togglePinned = () => {
    setPinned((prev) => !prev);
    setShowNotifications(true);
  };

  return (
    <>
      <style>{`
        .notif-drawer {
          position: fixed;
          right: 0;
          top: 0;
          height: 100%;
          width: 360px;
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
          border-bottom: 1px solid #e5e7eb;
          background: #f0f9ff;
        }
        .notif-list {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }
        .notif-item {
          margin-bottom: 1rem;
          padding: 0.5rem;
          border-radius: 8px;
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
          border-top: 1px solid #e5e7eb;
          text-align: center;
          background: #f0f9ff;
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

      <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-300 relative">
        <h1
          className="text-2xl font-bold text-blue-800 cursor-pointer select-none"
          onClick={() => navigate("/home")}
        >
          Docufy
        </h1>

        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/upload")}
            aria-label="Add"
            className="p-1 rounded hover:bg-blue-100 transition"
          >
            <img
              src="/IconPac/plus (2).png"
              alt="Add"
              className="w-6 h-6"
            />
          </button>

          <button
            onClick={() => navigate("/settings")}
            aria-label="Settings"
            className="p-1 rounded hover:bg-blue-100 transition"
          >
            <img
              src="/IconPac/settings (2).png"
              alt="Settings"
              className="w-6 h-6"
            />
          </button>

          <div className="relative" ref={notificationRef}>
            <button
              onClick={toggleNotifications}
              aria-label="Notifications"
              className="relative p-1 rounded hover:bg-blue-100 transition"
            >
              <img
                src="/IconPac/bell-notification-social-media (2).png"
                alt="Notifications"
                className="w-6 h-6"
              />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
            </button>

            {showNotifications && (
              <div className="notif-drawer">
                <div className="notif-header">
                  <h2 className="text-base font-semibold text-blue-800 select-none">
                    Notifications
                  </h2>
                  <button
                    onClick={togglePinned}
                    className="text-sm text-blue-600 hover:underline select-none"
                  >
                    {pinned ? "Unpin" : "Pin"}
                  </button>
                </div>

                <div className="notif-list">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="notif-item">
                      <div className="flex items-start gap-3">
                        <div
                          className="flex items-center justify-center w-6 h-6 mt-1 text-lg"
                          style={{ color: notif.color }}
                        >
                          {notif.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{notif.title}</div>
                          <div className="text-xs text-gray-600 mt-0.5">{notif.message}</div>
                          <div className="flex gap-4 mt-1 text-xs text-blue-700">
                            <button className="hover:underline">View</button>
                            <button className="hover:underline">Dismiss</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="notif-footer">
                  <a href="/notifications">View All</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
