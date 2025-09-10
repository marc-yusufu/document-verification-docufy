import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import TopPanel from "../components/TopPanel";
import RightDetailPanel from "../components/RightDetailsPanel";
import { useNavigate, useParams } from "react-router-dom";

interface Docs {
  fileName: string
  fileType: string
  filePath: string
  fileUrl: string
  status: string
  uploadedAt: Date

  //supabase
  document_id: string
  type: string
  file_url: string
  submitted_at: Date

}

        /*
  {
    document_id: '54e179b8-8f5e-4975-ae43-2dcdf0d0d507',
    user_id: 'fa64554c-1462-4964-8ef4-d929086b9f3e',
    type: 'Proof of Identity',
    file_url: 'fa64554c-1462-4964-8ef4-d929086b9f3e/1756932029384_edit.pdf',
    status: 'pending',
    department_assigned: null,
    verified_by: null,
    rejected_reason: null,
    signed_file_url: null,
    submitted_at: '2025-09-03T20:40:30.466+00:00',
    verified_at: null,
    branch_assigned: null,
    doc_type: null
  }
        */

type Props = {
  doc: Document;
  onStatusChange: (updatedDoc: Document) => void; // parent refresh
};


export default function QueueViewPage() {

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const {id, file_url} = useParams()
  const [displayDoc, setDisplayDoc] = useState<Docs | null>(null);

  useEffect(() => {
    if (!file_url) return; // Don't fetch if id is missing

      const viewDocs = async () => {
        try {
          const res = await fetch(`http://localhost:5000/documents/${id}/${file_url}`);
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const doc = await res.json();
          setDisplayDoc(doc);
        } catch (err) {
          console.error("Error while trying to display the document: ", err);
        }
      }
    viewDocs();
  }, [file_url]);

  if (!displayDoc){
    return(
      <div style={{ padding: "2rem" }}>
        <p>Loading...</p>
        <p>Connecting to server</p>
      </div>
      
    ) 
  } 
  
  const fileUrl = `http://localhost:5000/documents/${displayDoc.filePath}`; //to display preview on the browser

  const updateStatus = async (status: "approved" | "rejected") => {
    //setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/documents/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) throw new Error("Failed to update status");
      const updatedDoc = await res.json();

      setDisplayDoc(updatedDoc); // Update local state so UI refreshes
      console.log("Status updated:", updatedDoc.status);

    } catch (err) {
      console.error("Error updating status:", err);
      alert("Could not update status");
    } finally {
      //setLoading(false);
    }
  };

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

          <div style={styles.documentArea}>
            {displayDoc.fileType === "application/pdf" ? (
            <iframe
              src={displayDoc.fileUrl}
              width="100%"
              height="600px"
              title={displayDoc.fileName}
              style={{ border: "none", flex: 1 }}
            ></iframe>
          ) : displayDoc.fileType.startsWith("image/") ? (
            <img
              src={displayDoc.fileUrl}
              alt={displayDoc.fileName}
              style={{ maxWidth: "100%", height: "auto" }}
            />
          ) : (
            <p>
              Unsupported file type.{" "}
              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                Download instead
              </a>
            </p>
          )}
        </div>

          <RightDetailPanel
            submittedBy="Mosa Lichaba"
            type="ID Card"
            branch="Soweto"
            submittedOn ={new Date(displayDoc.uploadedAt).toDateString()}
            status={displayDoc.status}
            commentMaxLength={120}
            onApprove={()=> updateStatus("approved")}
            onReject={() => updateStatus("rejected")}
            onReassign={() => alert("Reassigned")}
            onCancel={() => navigate("/queue")}
          />
        </div>
      </div>
    </div>
  );
}
