import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import TopPanel from "../components/TopPanel";
import { supabase } from "../Authentication/supabaseconfig";

interface Document {
  document_id: string;
  type: string;
  file_url: string;
  status: string;
  submitted_at: string;
  signed_url?: string;
}

export default function QueuePage() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Document[]>([]);

  useEffect(() => {
    async function getAllDocs() {
      try {
        const { data, error } = await supabase
          .from("documents")
          .select("document_id, type, file_url, status, submitted_at")
          .eq("status", "pending")
          .order("submitted_at", { ascending: false });

        if (error) throw error;

        const withUrls = await Promise.all(
          data.map(async (doc) => {
            const { data: signed } = await supabase.storage
              .from("userDocuments")
              .createSignedUrl(doc.file_url, 60 * 60);
            return { ...doc, signed_url: signed?.signedUrl || "" };
          })
        );

        setDocs(withUrls);
      } catch (err) {
        console.error("Error fetching documents: ", err);
      }
    }

    getAllDocs();
  }, []);

  const styles: { [key: string]: React.CSSProperties } = {
    container: { display: "flex", height: "100vh" },
    main: { flex: 1, display: "flex", flexDirection: "column", background: "#f7f7f7" },
    content: { padding: "1rem", flex: 1, overflow: "auto" },
    table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden" },
    th: { background: "#2563eb", color: "#fff", textAlign: "left", padding: "0.75rem" },
    td: { padding: "0.75rem", borderBottom: "1px solid #eee" },
    viewBtn: { background: "#e5e7eb", border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer" },
    statusPending: { color: "#6b7280" },
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
                <th style={styles.th}>Doc Type</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Submitted</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc, index) => (
                <tr key={doc.document_id}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{doc.type}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.statusPending, color: "red" }}>{doc.status}</span>
                  </td>
                  <td style={styles.td}>
                    {new Date(doc.submitted_at).toLocaleDateString()}{" "}
                    {new Date(doc.submitted_at).toLocaleTimeString()}
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.viewBtn}
                      onClick={() => navigate(`/queueView/${doc.document_id}`)}
                    >
                      View
                    </button>
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
