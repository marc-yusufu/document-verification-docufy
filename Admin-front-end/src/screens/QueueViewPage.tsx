import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/sidebar";
import TopPanel from "../components/TopPanel";
import RightDetailsPanel from "../components/RightDetailsPanel";
import { supabase } from "../Authentication/supabaseconfig";

import { useComment } from "../context/context";

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

interface Stamp {
  state: string;
  by: string;
  date: string;
}

type Props = {
  doc: Document;
  onStatusChange: (updatedDoc: Document) => void; // parent refresh
};


export default function QueueViewPage() {
  const [displayDoc, setDisplayDoc] = useState<Docs | null>();
  const [loadingDoc, setLoadingDoc] = useState(true); // for fetching document
  const [loadingAction, setLoadingAction] = useState(false); // for approve/reject
  
  const paragraph = "state: Verified and Certified \nBy: Admin Marc Yusufu. \nThis document is Valid. \nDate: 19th September 2025"

  const navigate = useNavigate();

  //const {commentText} = useComment();
  //const comment = commentText;

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

  //to Approve of the document
  const ApproveDoc = async (): Promise<boolean> => {
    //setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/documents/${code_id}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stampText: paragraph}),
        }
      );
      console.log("Response: ", res);

      if (!res.ok) throw new Error("Failed to update status");

      const updatedDoc = await res.json();

      setDisplayDoc(updatedDoc); // Update local state so UI refreshes
      console.log("Status updated:", updatedDoc.status);
      window.alert("Document status updated")
      return true; //operation success

    } catch (err) {
      console.error("Error updating status:", err);
      alert("Could not update status");
      return false;
    }
  };

  //to Reject the document
  const RejectDoc = async (): Promise<boolean> => {
      //setLoading(true);
      try {
      const res = await fetch(
          `http://localhost:5000/documents/${code_id}/reject`,
          {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staus : "Rejected" }),
          }
      );
      console.log("Response: ", res);

      if (!res.ok) throw new Error("Failed to update status");

      //console.log("Status updated:", updatedDoc.status);
      window.alert("Document Rejected")
      return true; //operation success

      } catch (err) {
      console.error("Error updating status:", err);
      alert("Could not update status");
      return false;
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
            onApprove={async()=>{
              const success = await ApproveDoc();
              if(success){
                navigate("/queue");
              }
            }}
            onReject={async()=>{
              const success = await RejectDoc();
              if(success){

              }
              navigate("/queue");
            }}
            onReassign={() => {alert("This document will be reassigned to a different Admin"); navigate("/queue");}}
            onCancel={() => navigate("/queue")}
            approveDisabled={loadingAction}
            rejectDisabled={loadingAction}
          />
        </div>
      </div>
    </div>
  );
}
