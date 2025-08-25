import { useNavigate } from "react-router-dom";
import {
    MdDashboard,
    MdListAlt,
    MdVerified,
    MdSettings,
    MdHelpOutline,
    MdLogout,
} from "react-icons/md";
import { useState } from "react";

export default function Sidebar() {
    const navigate = useNavigate();
    const [hovered, setHovered] = useState<string | null>(null);

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const handleLogout = () => {
        console.log("User logged out");
        navigate("/login");
    };

    const sidebarStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100vh",
        backgroundColor: "#ffffff",
        color: "#111827",
        padding: "16px",
        width: "240px",
        borderRight: "1px solid #e5e7eb",
    };

    const logoStyle: React.CSSProperties = {
        fontSize: "1.25rem",
        fontWeight: "bold",
        marginBottom: "24px",
    };

    const navStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    };

    const buttonBase: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 12px",
        borderRadius: "8px",
        textAlign: "left",
        width: "100%",
        background: "transparent",
        border: "none",
        fontSize: "0.95rem",
        cursor: "pointer",
        transition: "background-color 0.2s, color 0.2s",
    };

    const hoverStyle: React.CSSProperties = {
        backgroundColor: "#3376F3",
        color: "#fff",
    };

    const logoutButtonStyle: React.CSSProperties = {
        ...buttonBase,
        backgroundColor: "#dc2626",
        color: "#fff",
    };

    const NavButton = ({
        label,
        icon,
        path,
    }: {
        label: string;
        icon: React.ReactNode;
        path: string;
    }) => (
        <button
            onClick={() => handleNavigation(path)}
            onMouseEnter={() => setHovered(label)}
            onMouseLeave={() => setHovered(null)}
            style={{
                ...buttonBase,
                ...(hovered === label ? hoverStyle : {}),
            }}
        >
            <span style={{ fontSize: "1.25rem" }}>{icon}</span>
            <span>{label}</span>
        </button>
    );

    return (
        <aside style={sidebarStyle}>
            <div>
                <div style={logoStyle}>Logo</div>
                <nav style={navStyle}>
                    <NavButton label="Dashboard" icon={<MdDashboard />} path="/dashboard" />
                    <NavButton label="Queue" icon={<MdListAlt />} path="/queue" />
                    <NavButton label="Verified" icon={<MdVerified />} path="/verified" />
                </nav>
            </div>

            <nav style={navStyle}>
                <NavButton label="Settings" icon={<MdSettings />} path="/settings" />
                <NavButton label="Help Centre" icon={<MdHelpOutline />} path="/help" />

                <button onClick={handleLogout} style={logoutButtonStyle}>
                    <span style={{ fontSize: "1.25rem" }}>
                        <MdLogout />
                    </span>
                    <span>Log Out</span>
                </button>
            </nav>
        </aside>
    );
}
