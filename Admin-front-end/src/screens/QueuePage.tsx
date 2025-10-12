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

    async function getAllDocuments(){
        try{
        const res = await fetch(`http://localhost:5000/documents/?status=pending`)
        const docs = await res.json()
        console.log('Document list: ', docs) //for console while debugging
        setDocs(docs);
      }catch(err){
        console.error("Error while fetching documents: ", err);
      }
    }

    //api call to the backend to fetch documents with "pending" status
    async function getAllDocs2(){
      try{
        const res = await fetch(`http://localhost:5000/documents?status=pending`)
        const docs = await res.json()
        console.log('Document list: ', docs) //for console while debugging
        setPendingDocs(Array.isArray(docs) ? docs : []); //if it isn't an array, fallback to [] so that the page doesn't crash
      }catch(err){
        console.error("Error while fetching documents: ", err);
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
