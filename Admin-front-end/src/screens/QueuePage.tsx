import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import TopPanel from "../components/TopPanel";
import { useNavigate } from "react-router-dom";
import { supabase } from "../Authentication/supabaseconfig";

interface Document {
  id: string;
  fileName: string;
  fileType: string;
  status: string;
  uploadedAt: string;
  userName?: string;
  branch?: string;
  storagePath: string; // 👈 key in Supabase Storage
}

export default function QueuePage() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  // fetch only pending documents
  useEffect(() => {
    async function getPendingDocs() {
      setLoading(true);
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("status", "pending")
        .order("uploadedAt", { ascending: false });

      if (error) {
        console.error("Error fetching documents:", error);
      } else {
        setDocs(data || []);
      }
      setLoading(false);
    }
    getPendingDocs();
  }, []);

  // generate public URL for viewing
  const getFileUrl = (path: string) => {
    const { data } = supabase.storage.from("documents").getPublicUrl(path);
    return data.publicUrl;
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: { display: "flex", height: "100vh" },
    main: { flex: 1, display: "flex", flexDirection: "column", background: "#f7f7f7" },
    content: { padding: "1rem", flex: 1, overflow: "auto" },
    table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden" },
    th: { background: "#2563eb", color: "#fff", textAlign: "left", padding: "0.75rem" },
    td: { padding: "0.75rem", borderBottom: "1px solid #eee" },
    viewBtn: { background: "#e5e7eb", border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer" },
    statusPending: { color: "#ef4444", fontWeight: "bold" },
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <TopPanel />
        <div style={styles.content}>
          {loading ? (
            <p>Loading pending documents...</p>
          ) : (
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
                {docs.map((doc, idx) => (
                  <tr key={doc.id}>
                    <td style={styles.td}>{idx + 1}</td>
                    <td style={styles.td}>{doc.fileName}</td>
                    <td style={styles.td}>{doc.userName || "N/A"}</td>
                    <td style={styles.td}>{doc.branch || "N/A"}</td>
                    <td style={styles.td}>
                      {new Date(doc.uploadedAt).toLocaleDateString()}{" "}
                      {new Date(doc.uploadedAt).toLocaleTimeString()}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.statusPending}>{doc.status}</span>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.viewBtn}
                        onClick={() => window.open(getFileUrl(doc.storagePath), "_blank")}
                      >
                        View
                      </button>
                      <button
                        style={styles.viewBtn}
                        onClick={() => navigate(`/queueView/${doc.id}`)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
