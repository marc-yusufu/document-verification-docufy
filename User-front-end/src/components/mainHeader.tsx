import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< Updated upstream
import { Link } from "react-router-dom";
import logo from "../assets/images/logopng.png";

=======
import {
  addOutline,
  notificationsOutline,
  settingsOutline,
  personCircleOutline,
  logOutOutline,
} from "ionicons/icons";
import { IonIcon } from "@ionic/react";
import logo from '../assets/images/logopng.png';
>>>>>>> Stashed changes

const notifications = [
  {
    id: 1,
    title: "Document Verified!",
    message: 'Your "Proof of Residence.pdf" has been successfully verified.',
    icon: "🧾",
    color: "text-blue-600",
  },
  {
    id: 2,
    title: "Document Processing",
    message:
      '"Bank_Statement.pdf" is being analyzed. You’ll be notified once verification is complete.',
    icon: "⏳",
    color: "text-orange-500",
  },
  {
    id: 3,
    title: "Verification Issue Detected",
    message: '"ID_Scan.jpg" could not be verified due to low image quality.',
    icon: "❌",
    color: "text-red-600",
  },
  {
    id: 4,
    title: "Upload Successful",
    message:
      '"Passport_Scan.pdf" has been uploaded and is awaiting verification.',
    icon: "✅",
    color: "text-green-600",
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
        if (!pinned) setShowNotifications(false);
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
<<<<<<< Updated upstream
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
=======
    <div className="flex justify-between items-center h-14 px-6 py-4 bg-white relative rounded-lg">
      {/* Logo */}
      <div onClick={() => navigate("/home")} className="cursor-pointer">
        <img src={logo} alt="Logo" className="h-10 mb-2 object-contain" />
      </div>

      {/* Right-side controls */}
      <div className="flex items-center gap-6">
        {/* Upload */}
        <button
          onClick={() => navigate("/upload")}
          aria-label="Add"
          className="p-2 rounded-full hover:bg-blue-100 transition-all duration-300"
        >
          <IonIcon icon={addOutline} className="w-8 h-8 text-blue-700" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={toggleNotifications}
            aria-label="Notifications"
            className="p-2 rounded-full hover:bg-blue-100 transition-all duration-300"
          >
            <IonIcon
              icon={notificationsOutline}
              className="w-6 h-6 text-blue-700"
            />
          </button>

          {/* Drawer */}
          {showNotifications && (
            <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-lg flex flex-col z-50 animate-slide-in">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-blue-50">
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

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="bg-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex items-center justify-center w-6 h-6 mt-1 text-lg ${notif.color}`}
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
>>>>>>> Stashed changes
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-gray-200 text-center bg-blue-50">
                <a
                  href="/notifications"
                  className="text-blue-600 text-sm hover:underline"
                >
                  View All
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <button
          onClick={() => navigate("/settings")}
          aria-label="Settings"
          className="p-2 rounded-full hover:bg-blue-100 transition-all duration-300"
        >
          <IonIcon icon={settingsOutline} className="w-6 h-6 text-blue-700" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/profile")}
            aria-label="User Profile"
            className="p-2 rounded-full hover:bg-blue-100 transition-all duration-300"
          >
            <IonIcon
              icon={personCircleOutline}
              className="w-8 h-8 text-blue-700"
            />
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">User Name</span>
            <span className="text-xs text-gray-600">Welcome</span>
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

      {/* Animations */}
      <style>
        {`
          @keyframes slide-in {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .animate-slide-in {
            animation: slide-in 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
}
