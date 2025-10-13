import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import TopPanel from "../components/TopPanel";
import { supabase } from "../Authentication/supabaseconfig";

interface Document {
  document_id: string;
  type: string;
  //file_url: string;
  file_path: string;
  status: string;
  submitted_at: string;
  signed_url?: string;
  user_name?: string;   // optional, if you store the submitter
  branch?: string;      // optional, if you store the branch
}

export default function VerifiedPage() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getVerifiedDocs() {
      try {
        const { data, error } = await supabase
          .from("documents")
          .select("document_id, type, file_path, status, submitted_at")
          .in("status", ["Approved", "Rejected"])
          .order("submitted_at", { ascending: false });

        if (error) throw error;

        const withUrls = await Promise.all(
          data.map(async (doc) => {
            const { data: signed } = await supabase.storage
              .from("userDocuments")
              .createSignedUrl(doc.file_path, 60 * 60);
            return { ...doc, signed_url: signed?.signedUrl || "" };
          })
        );

        setDocs(withUrls);
      } catch (err) {
        console.error("Error fetching verified documents: ", err);
      } finally {
        setLoading(false);
      }
    }

    getVerifiedDocs();
  }, []);

  const styles: { [key: string]: React.CSSProperties } = {
    container: { display: "flex", height: "100vh" },
    main: { flex: 1, display: "flex", flexDirection: "column", background: "#f7f7f7" },
    content: { padding: "1rem", flex: 1, overflow: "auto" },
    table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden" },
    th: { background: "#2563eb", color: "#fff", textAlign: "left", padding: "0.75rem" },
    td: { padding: "0.75rem", borderBottom: "1px solid #eee", textAlign: "center" },
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
                <th style={styles.th}>Doc Type</th>
                <th style={styles.th}>Submitted</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={styles.td}>
                    ⏳ Loading verified documents...
                  </td>
                </tr>
              ) : docs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={styles.td}>
                    📂 No verified documents found.
                  </td>
                </tr>
              ) : (
                docs.map((doc, index) => (
                  <tr key={doc.document_id}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>{doc.type}</td>
                    <td style={styles.td}>
                      {new Date(doc.submitted_at).toLocaleDateString()}{" "}
                      {new Date(doc.submitted_at).toLocaleTimeString()}
                    </td>
                    <td style={styles.td}>
                      {doc.status === "Approved" && (
                        <span style={styles.statusApproved}>✔ Approved</span>
                      )}
                      {doc.status === "Rejected" && (
                        <span style={styles.statusRejected}>✖ Rejected</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.viewBtn}
                        onClick={() => navigate(`/verifiedView/${doc.document_id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
