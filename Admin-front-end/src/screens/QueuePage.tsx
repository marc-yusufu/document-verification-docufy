import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import TopPanel from "../components/TopPanel";

import { MdVisibility } from "react-icons/md";
import { supabase } from "../Authentication/supabaseconfig";

interface Document {
  id: string
  document_id: string;
  file_url: string
  fileName: string
  type: string
  status: string
  submitted_at: string
  signed_url?: string;
  code_id: string;

}

export default function QueuePage() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Document[]>([]);

  const [pendingDocs, setPendingDocs] = useState<Document[]>([]);

  const [loading, setLoading] = useState(true); //use for 2 to 3 second loading animation


  useEffect(() => {

    async function getAllDocuments() {
      try {
        const res = await fetch(`http://localhost:5000/documents/?status=pending`)
        const docs = await res.json()
        console.log('Document list: ', docs) //for console while debugging
        setDocs(docs);
      } catch (err) {
        console.error("Error while fetching documents: ", err);
      }
    }

    //api call to the backend to fetch documents with "pending" status
    async function getAllDocs2() {
      try {
        const res = await fetch(`http://localhost:5000/documents?status=pending`)
        const docs = await res.json()
        console.log('Document list: ', docs) //for console while debugging
        setPendingDocs(Array.isArray(docs) ? docs : []); //if it isn't an array, fallback to [] so that the page doesn't crash
      } catch (err) {
        console.error("Error while fetching documents: ", err);
      }
    }

    getAllDocuments();
    getAllDocs2();
  }, []);


  const styles: { [key: string]: React.CSSProperties } = {
    container: { display: "flex", height: "100vh" },
    main: { flex: 1, display: "flex", flexDirection: "column", background: "#f7f7f7" },
    content: { padding: "1rem", flex: 1, overflow: "auto" },
    table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden" },
    th: { background: "#2563eb", color: "#fff", textAlign: "left", padding: "0.75rem" },
    td: { padding: "0.75rem", borderBottom: "1px solid #eee", textAlign: "center" },
    viewBtn: { background: "#e5e7eb", border: "none", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer" },
    statusPending: { color: "#6b7280" },
  };

  console.log("Rendering docs:", pendingDocs); //does the state even receive anything from the api?

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

              {docs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={styles.td}>
                    📂 No pending documents found.
                  </td>
                </tr>
              ) : (
                pendingDocs.map((doc, index) => (
                  <tr key={doc.id}>
                    <td style={styles.td}>{index + 1}</td>
                    <td style={styles.td}>{doc.type}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusPending, color: 'red' }}>{doc.status}</span>
                    </td>
                    <td style={styles.td}>
                      {new Date(doc.submitted_at).toLocaleDateString()}, {new Date(doc.submitted_at).toLocaleTimeString()}
                    </td>
                    <td style={styles.td} className="flex">
                      <button
                        className="text-blue-600 font-bold text-[14px] flex justify-center hover:bg-white"
                        style={styles.viewBtn}
                        onClick={() => navigate(`/queueView/${doc.code_id}`)}
                      >
                        View<MdVisibility />
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
  )
}
