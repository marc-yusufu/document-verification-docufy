// src/pages/VerifiedPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import TopPanel from "../components/TopPanel";
import { supabase } from "../Authentication/supabaseconfig";

interface Document {
  document_id: string;
  type?: string;
  file_path?: string;
  signed_file_url?: string;
  status: string;
  submitted_at: string;
  user_name?: string;
  branch?: string;
}

export default function VerifiedPage() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getVerifiedDocs() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("documents")
          .select("document_id, doc_type, file_path, status, submitted_at, file_name")
          .in("status", ["approved", "rejected"])
          .order("submitted_at", { ascending: false });

        if (error) throw error;

        const withUrls = await Promise.all(
          (data || []).map(async (doc: any) => {
            let signed_url = "";
            try {
              const { data: signed, error: urlError } = await supabase.storage
                .from("userDocuments")
                .createSignedUrl(doc.file_path, 60 * 60);
              if (!urlError && signed?.signedUrl) signed_url = signed.signedUrl;
            } catch (e) {
              console.warn("signed url error for", doc.file_path, e);
            }
            return {
              document_id: doc.document_id,
              type: doc.doc_type || doc.file_name || "Document",
              file_path: doc.file_path,
              status: doc.status,
              submitted_at: doc.submitted_at,
              signed_file_url: signed_url,
            };
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
                      {doc.submitted_at ? `${new Date(doc.submitted_at).toLocaleDateString()} ${new Date(doc.submitted_at).toLocaleTimeString()}` : "-"}
                    </td>
                    <td style={styles.td}>
                      {doc.status === "approved" && <span style={styles.statusApproved}>✔ Approved</span>}
                      {doc.status === "rejected" && <span style={styles.statusRejected}>✖ Rejected</span>}
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                        <button
                          style={styles.viewBtn}
                          onClick={() => {
                            // open signed URL if available, else open file_path link (if you have public bucket)
                            if (doc.signed_file_url) window.open(doc.signed_file_url, "_blank");
                            else if (doc.file_path) {
                              // fallback: you may want to call a backend to stream file
                              alert("No signed url available for this file.");
                            }
                          }}
                        >
                          View
                        </button>
                      </div>
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
