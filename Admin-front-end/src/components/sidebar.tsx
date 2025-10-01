import { useNavigate, useLocation } from "react-router-dom";
import {
    MdDashboard,
    MdListAlt,
    MdVerified,
    MdSettings, // Keep for bottom buttons
    MdHelpOutline, // Keep for bottom buttons
    MdLogout,
} from "react-icons/md";
import logopng from "../../public/logopng.png";

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem("workerId");
        localStorage.removeItem("role");
        navigate("/login");
    };

    // 1. Removed Settings and Help Centre from the main array
    const navItems = [
        { label: "Dashboard", icon: <MdDashboard />, path: "/dashboard" },
        { label: "Queue", icon: <MdListAlt />, path: "/queue" },
        { label: "Verified", icon: <MdVerified />, path: "/verified" },
    ];

    // New array for items that should be at the bottom
    const bottomNavItems = [
        { label: "Settings", icon: <MdSettings />, path: "/settings" },
        { label: "Help Centre", icon: <MdHelpOutline />, path: "/help" },
    ];

    const getNavItemClass = (path: string) => {
        const isActive = location.pathname === path;
        return `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full
            ${isActive
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-blue-100"
            }`;
    };

    return (
        <aside className="flex flex-col bg-white border-r border-gray-200 h-screen w-54">
            {/* Logo */}
            <div className="p-6">
                <img src={logopng} alt="Logo" className="w-40 h-auto" />
            </div>

            {/* Main Navigation (Dashboard, Queue, Verified) */}
            <nav className="flex flex-col gap-1 px-4">
                {navItems.map(({ label, icon, path }) => (
                    <button
                        key={label}
                        onClick={() => handleNavigation(path)}
                        // Use the function to get consistent active/hover styles
                        className={getNavItemClass(path)}
                    >
                        <span className="text-xl">{icon}</span>
                        <span>{label}</span>
                    </button>
                ))}
            </nav>

            {/* Bottom Navigation (Help Centre, Settings, Logout) */}
            <div className="mt-auto px-4 pb-6 space-y-1"> {/* Added space-y-1 for consistent spacing */}
                {/* Render the bottom navigation items */}
                {bottomNavItems.map(({ label, icon, path }) => (
                    <button
                        key={label}
                        onClick={() => handleNavigation(path)}
                        className={getNavItemClass(path)}
                    >
                        <span className="text-xl">{icon}</span>
                        <span>{label}</span>
                    </button>
                ))}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    // Logout button uses different styling (red background)
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-red-600 text-white w-full hover:bg-red-700"
                >
                    <span className="text-xl">
                        <MdLogout />
                    </span>
                    <span>Log Out</span>
                </button>
            </div>
        </aside>
    );
}