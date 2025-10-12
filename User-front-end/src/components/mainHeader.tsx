import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  addOutline,
  notificationsOutline,
  settingsOutline,
  personCircleOutline,
  logOutOutline,
} from "ionicons/icons";
import { IonIcon } from "@ionic/react";
import logo from '../assets/images/logopng.png';

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
            <span className="text-sm font-medium text-gray-900">Mohammed Smith</span>
            <span className="text-xs text-gray-600">Welcome</span>
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
