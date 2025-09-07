// Layout.tsx
import React, { ReactNode } from "react";
import RightDetailsPanel from "./components/RightDetailsPanel";
import Sidebar from "./components/sidebar";
import TopPanel from "./components/TopPanel";

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="app-layout flex">
            {/* Sidebar on the left */}
            <Sidebar />

            <div className="main-content flex-1 flex flex-col">
                {/* Top Panel */}
                <TopPanel />

                <div className="content-area flex-1 flex">
                    {/* Page content */}
                    <main className="flex-1">{children}</main>

                    {/* Optional right panel */}
                    <RightDetailsPanel />
                </div>
            </div>
        </div>
    );
};

export default Layout;
