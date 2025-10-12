// src/pages/QueuePage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import TopPanel from "../components/TopPanel";
import { MdVisibility } from "react-icons/md";
import { supabase } from "../Authentication/supabaseconfig";

interface DocumentItem {
  document_id: string;
  file_path: string;       // actual storage path in bucket
  file_name?: string;
  doc_type?: string;
  status: string;
  submitted_at: string;
  code_id?: string;
  signed_url?: string;
}

export default function QueuePage() {
  const navigate = useNavigate();
  const [pendingDocs, setPendingDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPendingDocuments() {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("documents")
          .select("document_id, file_path, file_name, doc_type, status, submitted_at, code_id")
          .eq("status", "pending")
          .order("submitted_at", { ascending: false });

        if (error) throw error;

        const docsWithUrls = await Promise.all(
          (data || []).map(async (doc: any) => {
            let signed_url = "";
            try {
              const { data: signed, error: urlError } = await supabase.storage
                .from("userDocuments")
                .createSignedUrl(doc.file_path, 60 * 60); // 1 hour
              if (!urlError && signed?.signedUrl) signed_url = signed.signedUrl;
            } catch (e) {
              // ignore signed url errors per doc but log
              console.warn("signed url error for", doc.file_path, e);
            }
            return { ...doc, signed_url };
          })
        );

        setPendingDocs(docsWithUrls);
      } catch (err: any) {
        console.error("Error fetching documents:", err);
        setPendingDocs([]);
        setError(err.message || "Failed to fetch pending documents");
      } finally {
        setLoading(false);
      }
    }

    fetchPendingDocuments();
  }, []);

  const styles: { [key: string]: React.CSSProperties } = {
    container: { display: "flex", height: "100vh" },
    main: { flex: 1, display: "flex", flexDirection: "column", background: "#f7f7f7" },
    content: { padding: "1rem", flex: 1, overflow: "auto" },
    table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden" },
    th: { background: "#2563eb", color: "#fff", textAlign: "left", padding: "0.75rem" },
    td: { padding: "0.75rem", borderBottom: "1px solid #eee", textAlign: "center" },
    viewBtn: {
      background: "#e5e7eb",
      border: "none",
      padding: "0.4rem 0.8rem",
      borderRadius: "6px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "0.3rem"
    },
    statusPending: { color: "orange", fontWeight: "700" },
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <TopPanel />
        <div style={styles.content}>
          <h2 style={{ margin: "0 0 1rem 0" }}>Pending Documents</h2>

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
              {loading ? (
                <tr>
                  <td colSpan={5} style={styles.td}>⏳ Loading documents...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} style={styles.td}>❌ {error}</td>
                </tr>
              ) : pendingDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={styles.td}>📂 No pending documents found.</td>
                </tr>
              ) : (
                pendingDocs.map((doc, index) => {
                  const submittedDate = doc.submitted_at ? new Date(doc.submitted_at) : null;
                  return (
                    <tr key={doc.document_id}>
                      <td style={styles.td}>{index + 1}</td>
                      <td style={styles.td}>{doc.doc_type || doc.file_name || "Document"}</td>
                      <td style={styles.td}><span style={styles.statusPending}>{doc.status}</span></td>
                      <td style={styles.td}>
                        {submittedDate ? `${submittedDate.toLocaleDateString()} ${submittedDate.toLocaleTimeString()}` : "-"}
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <button
                            style={styles.viewBtn}
                            onClick={() => navigate(`/queueView/${doc.code_id ?? doc.document_id}`)}
                          >
                            View <MdVisibility />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
