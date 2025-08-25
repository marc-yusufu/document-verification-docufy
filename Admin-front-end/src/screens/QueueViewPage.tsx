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

}

type Props = {
  doc: Document;
  onStatusChange: (updatedDoc: Document) => void; // parent refresh
};


export default function QueueViewPage() {

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const {id} = useParams();
  const [displayDoc, setDisplayDoc] = useState<Docs | null>();

  useEffect(() => {
    if (!id) return; // Don't fetch if id is missing

    async function viewDocs() {
      try {
        const res = await fetch(`http://localhost:5000/documents/${id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const doc = await res.json();
        setDisplayDoc(doc);
      } catch (err) {
        console.error("Error while trying to display the document: ", err);
      }
    }
    viewDocs();
  }, [id]);

  if (!displayDoc){
    return(
      <div style={{ padding: "2rem" }}>
        <p>Loading...</p>
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
