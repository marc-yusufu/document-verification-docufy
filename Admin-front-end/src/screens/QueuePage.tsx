import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import TopPanel from "../components/TopPanel";
import { useNavigate } from "react-router-dom";

interface Document{
  _id: string
  fileName: string
  fileType: string
  status: string
  uploadedAt: string
}

export default function QueuePage() {
  const navigate = useNavigate();

  const [docs, setDocs] = useState<Document[]>([]);
  const [pendingDocs, setPendingDocs] = useState<Document[]>([]);

  //list all document in the queue
  useEffect(() => {
    async function getAllDocs(){
        try{
        const res = await fetch(`http://localhost:5000/documents?status=pending`)
        const docs = await res.json()
        console.log('Document list: ', docs) //for console while debugging
        setDocs(docs);
      }catch(err){
        console.error("Error while fetching documents: ", err);
      }
    }

    getAllDocs();
  }, []);

  //change document status
  async function updateStatus(id: string, status: 'verified' | 'rejected') {
    const res = await fetch(`http://localhost:5000/documents/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })

    const updatedStatus = await res.json()
    console.log('Updated Document:', updatedStatus)
    return updatedStatus;
  }


  const tableData = [
    { id: 15, name: "ProofOfRes.pdf", user: "Sine Hokwana", branch: "Brixton", date: "30 July 2025, 09:13AM", status: "Awaiting Review" },
    { id: 16, name: "Mosa's ID", user: "Mosa Lichaba", branch: "Rosebank", date: "30 July 2025, 09:16AM", status: "Awaiting Review" },
    { id: 17, name: "ProofOfRes.pdf", user: "Mosa Lichaba", branch: "Brixton", date: "30 July 2025, 09:13AM", status: "Awaiting Review" },
  ];

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
                <th style={styles.th}>Doc Name</th>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Branch</th>
                <th style={styles.th}>Date & Time</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc, index) => (
                <tr key={doc.document_id}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{doc.type}</td>
                  <td style={styles.td}>
                    {new Date(doc.uploadedAt).toLocaleDateString()}, {new Date(doc.uploadedAt).toLocaleTimeString()}
                  </td>
                  <td style={styles.td}><span style={{ ...styles.statusPending, color: 'red' }}>{doc.status}</span></td>
                  <td style={styles.td}>
                    <button style={styles.viewBtn} onClick={() => navigate(`/queueView/${doc._id}`)}>View</button>
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
