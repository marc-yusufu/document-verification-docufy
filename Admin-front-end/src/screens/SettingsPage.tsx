import React, { useState } from "react";
import {
  MdNotifications,
  MdSecurity,
  MdAccountCircle,
  MdSystemUpdateAlt,
  MdLogout,
} from "react-icons/md";
import Sidebar from "../components/sidebar";
import TopPanel from "../components/TopPanel";

const SettingsPage: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const handleLogoutAll = () => {
    alert("All active sessions have been logged out.");
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div style={styles.main}>
        <TopPanel />

        {/* Scrollable content */}
        <div style={styles.content}>

          {/* Account Settings */}
          <section style={styles.section}>
            <h3 style={styles.sectionHeader}>
              <MdAccountCircle /> Account
            </h3>
            <p>Email: <strong>admin@docufy.com</strong></p>
            <p>Role: <strong>Administrator</strong></p>
            <div style={styles.buttonGroup}>
              <button style={styles.primary}>Change Password</button>
              <button style={styles.secondary}>Update Profile Picture</button>
            </div>
          </section>

          {/* Notifications */}
          <section style={styles.section}>
            <h3 style={styles.sectionHeader}>
              <MdNotifications /> Notifications
            </h3>
            <label style={styles.label}>
              <input
                type="checkbox"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
              />
              <span>Email Notifications</span>
            </label>
            <label style={styles.label}>
              <input
                type="checkbox"
                checked={inAppAlerts}
                onChange={() => setInAppAlerts(!inAppAlerts)}
              />
              <span>In-App Alerts</span>
            </label>
          </section>

          {/* Security */}
          <section style={styles.section}>
            <h3 style={styles.sectionHeader}>
              <MdSecurity /> Security
            </h3>
            <label style={styles.label}>
              <input
                type="checkbox"
                checked={twoFactor}
                onChange={() => setTwoFactor(!twoFactor)}
              />
              <span>Enable Two-Factor Authentication</span>
            </label>
            <button style={styles.danger} onClick={handleLogoutAll}>
              <MdLogout /> Log Out from All Devices
            </button>
          </section>

          {/* System (Admin Only) */}
          <section style={styles.section}>
            <h3 style={styles.sectionHeader}>
              <MdSystemUpdateAlt /> System Settings
            </h3>
            <p>Manage system-wide settings, backups, and updates.</p>
            <button style={styles.success}>Backup Data</button>
          </section>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: "#f7f7f7",
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: 1,
    padding: "25px 40px",
    overflowY: "auto",
  },
  pageTitle: {
    fontSize: "26px",
    fontWeight: 700,
    marginBottom: "25px",
    color: "#222",
  },
  section: {
    backgroundColor: "white",
    padding: "20px 25px",
    marginBottom: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 6px rgb(0 0 0 / 0.05)",
  },
  sectionHeader: {
    fontSize: "20px",
    fontWeight: 600,
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#2e7bf6",
  },
  buttonGroup: {
    marginTop: "10px",
    display: "flex",
    gap: "10px",
  },
  primary: {
    backgroundColor: "#2e7bf6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 14px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  secondary: {
    backgroundColor: "#666",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 14px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  danger: {
    backgroundColor: "#e53935",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 14px",
    fontSize: "14px",
    fontWeight: 600,
    marginTop: "10px",
    cursor: "pointer",
  },
  success: {
    backgroundColor: "#43a047",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 14px",
    fontSize: "14px",
    fontWeight: 600,
    marginTop: "10px",
    cursor: "pointer",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "15px",
    color: "#333",
    marginTop: "8px",
    cursor: "pointer",
  },
};

export default SettingsPage;
