import React from "react";
import Sidebar from "../components/sidebar";
import TopPanel from "../components/TopPanel";
import RightDetailPanel from "../components/RightDetailsPanel";
import { useNavigate } from "react-router-dom";

export default function VerifiedViewPage() {
    const navigate = useNavigate();

    const styles: { [key: string]: React.CSSProperties } = {
        container: { display: "flex", height: "100vh" },
        main: { flex: 1, display: "flex", flexDirection: "column", background: "#f7f7f7" },
        content: { padding: "1rem", flex: 1, display: "flex" },
        documentArea: { flex: 1, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", color: "#9ca3af", marginRight: "1rem", borderRadius: "8px" },
    };

    return (
        <div style={styles.container}>
            <Sidebar />
            <div style={styles.main}>
                <TopPanel />
                <div style={styles.content}>
                    <div style={styles.documentArea}>Document</div>
                    <RightDetailPanel
                        submittedBy="Kaelo Mooketsi"
                        type="ID Card"
                        branch="Soweto"
                        submittedOn="2025-07-29"
                        status="Rejected"
                        commentMaxLength={120}
                        approveDisabled
                        rejectDisabled
                        onReassign={() => alert("Reassigned")}
                        onCancel={() => navigate("/verified")}
                    />
                </div>
            </div>
        </div>
    );
}
