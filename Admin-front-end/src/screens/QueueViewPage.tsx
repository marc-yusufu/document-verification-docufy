import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/sidebar";
import TopPanel from "../components/TopPanel";
import RightDetailsPanel from "../components/RightDetailsPanel";
import { supabase } from "../Authentication/supabaseconfig";

interface Docs {

  fileName: string
  fileType: string
  filePath: string
  fileUrl: string
  status: string
  uploadedAt: Date

  //supabase
  document_id: string
  file_name: string
  type: string
  url: string
  file_path: string;
  submitted_at: Date
  submittedBy: string;
  code_id: string;
  doc_type: string;

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
  const [displayDoc, setDisplayDoc] = useState<Docs | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(true); // for fetching document
  const [loadingAction, setLoadingAction] = useState(false); // for approve/reject
  const navigate = useNavigate();


  const {code_id} = useParams<{code_id : string}>()
  
  ///fetching document by making api call to the backend
  useEffect(() => {
    if (!code_id) return; // Don't fetch if id is missing

      const viewDocs = async () => {
        try {
          const res = await fetch(`http://localhost:5000/documents/${code_id}`);
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const doc = await res.json();
          setDisplayDoc(doc);
          console.log("From the backend: ", doc.url)
        } catch (err) {
          console.error("Error while trying to display the document: ", err);
        }
      }
    viewDocs();
  }, [code_id]);

  if (!displayDoc){
    return(
      <div style={{ padding: "2rem" }}>
        <p>Loading...</p>
        <p>Connecting to server</p>
      </div>
      
    ) 
  } 
  
  const fileUrl = `http://localhost:5000/documents/${displayDoc.filePath}`; //to display preview on the browser

  //to update the status of the document
  const updateStatus = async (status: "approved" | "rejected") => {
    //setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/documents/${code_id}/status`,
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
      window.alert("Document status updated")

    } catch (err) {
      console.error("Error updating status:", err);
      alert("Could not update status");
    } finally {
      //setLoading(false);
    }
  };


  const styles: { [key: string]: React.CSSProperties } = {
    container: { display: "flex", height: "100vh", overflow: "hidden" },
    main: { flex: 1, display: "flex", flexDirection: "column", background: "#f7f7f7" },
    content: { padding: "1rem", flex: 1, display: "flex", overflow: "hidden" },
    documentArea: {
      flex: 1,
      background: "#fff",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      fontSize: "1.2rem",
      color: "#9ca3af",
      marginRight: "1rem",
      borderRadius: "8px",
      overflow: "auto", // ✅ scroll only inside here
      height: "100%", // fill available space
    },
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <TopPanel />
        <div style={styles.content}>
          {/* Document Preview Area */}
          <div style={styles.documentArea}>
            { displayDoc ? (
              displayDoc.doc_type === "application/pdf" ? (
                <iframe
                  src={displayDoc.url}
                  width="100%"
                  height="100%"
                  title={displayDoc.file_name}
                  style={{ border: "none", flex:1  }}
                ></iframe>
              ) : displayDoc.doc_type.startsWith("image/") ? (
                <img
                  src={displayDoc.url}
                  alt={displayDoc.file_name}
                  width="100%"
                  height="100%"
                  style={{ maxWidth: "100%", height: "auto", flex: 1 }}
                />
              ) : (
                <p>
                  Unsupported file type.{" "}
                  <a href={displayDoc.url} target="_blank" rel="noopener noreferrer">
                    Download instead
                  </a>
                </p>
              )
            ) : (
              <p style={{ margin: "auto" }}>No document found</p>
            )}
          </div>

          {/* Right Panel */}
          <RightDetailsPanel
            submittedBy={displayDoc?.submittedBy || "Loading..."}
            type={displayDoc?.type || ""}
            branch="Soweto"
            submittedOn={displayDoc? new Date(displayDoc.submitted_at).toDateString() : ""}
            status={displayDoc?.status || ""}
            commentMaxLength={120}
            onApprove={() => updateStatus("approved")}
            onReject={() => updateStatus("rejected")}
            onReassign={() => alert("Reassigned")}
            onCancel={() => navigate("/queue")}
            approveDisabled={loadingAction}
            rejectDisabled={loadingAction}
          />
        </div>
      </div>
    </div>
  );
}
