import React from "react";
import Sidebar from "../components/sidebar";
import TopPanel from "../components/TopPanel";
import { useNavigate } from "react-router-dom";

export default function VerifiedPage() {
  const navigate = useNavigate();

  const tableData = [
    { id: 15, name: "ProofOfRes.pdf", user: "Sine Hokwana", branch: "Brixton", date: "30 July 2025, 09:13AM", status: "approved" },
    { id: 16, name: "Mosa's ID", user: "Mosa Lichaba", branch: "Rosebank", date: "30 July 2025, 09:16AM", status: "approved" },
    { id: 17, name: "ProofOfResidence.pdf", user: "Kaelo Mooketsi", branch: "Brixton", date: "30 July 2025, 09:13AM", status: "rejected" },
  ];

  const styles: { [key: string]: React.CSSProperties } = {
    container: { display: "flex", height: "100vh" },
    main: { flex: 1, display: "flex", flexDirection: "column", background: "#f7f7f7" },
    content: { padding: "1rem", flex: 1, overflow: "auto" },
    table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden" },
    th: { background: "#2563eb", color: "#fff", textAlign: "left", padding: "0.75rem" },
    td: { padding: "0.75rem", borderBottom: "1px solid #eee" },
    viewBtn: { background: "#e5e7eb", border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer" },
    statusApproved: { color: "#2563eb", fontWeight: 600 },
    statusRejected: { color: "#dc2626", fontWeight: 600 },
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <TopPanel />
        <div style={styles.content}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Doc Name</th>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Branch</th>
                <th style={styles.th}>Date & Time</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.id}>
                  <td style={styles.td}>{row.id}</td>
                  <td style={styles.td}>{row.name}</td>
                  <td style={styles.td}>{row.user}</td>
                  <td style={styles.td}>{row.branch}</td>
                  <td style={styles.td}>{row.date}</td>
                  <td style={styles.td}>
                    {row.status === "approved" && <span style={styles.statusApproved}>✔</span>}
                    {row.status === "rejected" && <span style={styles.statusRejected}>✖</span>}
                  </td>
                  <td style={styles.td}>
                    <button style={styles.viewBtn} onClick={() => navigate("/verifiedView")}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
