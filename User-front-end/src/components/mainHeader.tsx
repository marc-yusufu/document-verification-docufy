import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import logo from "../assets/images/logopng.png";


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
    message: '"ID_Scan.jpg" could not be verified due to low image quality.',
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
      `}</style>

      {/* HEADER */}
      <div className="flex justify-between items-center px-6 py-3 rounded-lg relative">
        {/* Logo */}
        <Link to="/home" className="flex justify-center items-center gap-2">
          <img src={logo} alt="Logo" className="h-10 mb-2 object-contain" />
        </Link>

        {/* Icons + User Info */}
        <div className="flex items-center gap-4">
          {/* Add */}
          <button
            onClick={() => navigate("/upload")}
            aria-label="Add"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-100 transition"
          >
            <img src="/IconPac/plus (2).png" alt="Add" className="w-5 h-5" />
          </button>

          {/* Settings */}
          <button
            onClick={() => navigate("/settings")}
            aria-label="Settings"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-100 transition"
          >
            <img
              src="/IconPac/settings (2).png"
              alt="Settings"
              className="w-5 h-5"
            />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={toggleNotifications}
              aria-label="Notifications"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-100 transition relative"
            >
              <img
                src="/IconPac/bell-notification-social-media (2).png"
                alt="Notifications"
                className="w-5 h-5"
              />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
            </button>

            {showNotifications && (
              <div className="notif-drawer">
                {/* Drawer Header */}
                <div className="flex justify-between items-center px-4 py-3 border-b bg-blue-50">
                  <h2 className="text-base font-semibold text-blue-800">
                    Notifications
                  </h2>
                  <button
                    onClick={togglePinned}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {pinned ? "Unpin" : "Pin"}
                  </button>
                </div>

                {/* Notification List */}
                <div className="flex-1 overflow-y-auto p-4">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="mb-3 p-2 rounded-lg bg-gray-100"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="flex items-center justify-center w-6 h-6 mt-1 text-lg"
                          style={{ color: notif.color }}
                        >
                          {notif.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {notif.title}
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            {notif.message}
                          </div>
                          <div className="flex gap-4 mt-1 text-xs text-blue-700">
                            <button className="hover:underline">View</button>
                            <button className="hover:underline">Dismiss</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Drawer Footer */}
                <div className="px-4 py-2 border-t bg-blue-50 text-center">
                  <a href="/notifications" className="text-blue-600 text-sm">
                    View All
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <button
            onClick={() => navigate("/profile")}
            aria-label="Profile"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-100 transition"
          >
            <img src="/IconPac/user.png" alt="Profile" className="w-5 h-5" />
          </button>

          {/* User Info */}
          <div className="flex flex-col text-sm leading-tight">
            <span className="font-medium">Kamogelo</span>
            <span className="text-gray-600">Welcome</span>
          </div>
        </div>
      </div>
    </>
  );
}
