import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/sidebar";
import TopPanel from "../components/TopPanel";
import RightDetailsPanel from "../components/RightDetailsPanel";

interface Docs {
  fileName: string;
  fileType: string;
  filePath: string;
  fileUrl: string;
  status: string;
  uploadedAt: Date;

  // Supabase / backend fields
  document_id: string;
  file_name: string;
  type: string;
  url: string;
  file_path: string;
  submitted_at: Date;
  submittedBy: string;
  code_id: string;
  doc_type: string;
  signed_url: string;
  stamp_text: string;
  verified_at: string;
}

export default function QueueViewPage() {
  const [displayDoc, setDisplayDoc] = useState<Docs | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const navigate = useNavigate();
  const { code_id } = useParams<{ code_id: string }>();

  const stampText =
    "State: Verified and Certified \nBy: Admin Marc Yusufu. \nThis document is Valid. \nDate: 19th September 2025";

  // Fetch document from backend
  useEffect(() => {
    if (!code_id) return;

    const fetchDoc = async () => {
      try {
        const res = await fetch(`http://localhost:4000/documents/${code_id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const doc = await res.json();
        setDisplayDoc(doc);
      } catch (err) {
        console.error("Error fetching document:", err);  
      }
    };

    fetchDoc();
  }, [code_id]);

  if (!displayDoc) {
    return (
      <div style={{ padding: "2rem" }}>
        <p>Loading...</p>
        <p>Connecting to server</p>
      </div>
    );
  }

  // Approve & Stamp document
  const ApproveDoc = async (): Promise<boolean> => {
    setLoadingAction(true);
    try {
      const res = await fetch(
        `http://localhost:5000/documents/${code_id}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stampText }),
        }
      );
      if (!res.ok) throw new Error("Failed to approve and stamp document");

      const { updatedDoc } = await res.json();

      setDisplayDoc({
        ...displayDoc,
        file_path: updatedDoc.file_path,
        url: updatedDoc.signed_url || updatedDoc.url,
        status: updatedDoc.status,
        verified_at: updatedDoc.verified_at,
        stamp_text: updatedDoc.stamp_text,
      });

      alert("Document stamped and approved!");
      return true;
    } catch (err) {
      console.error("Error approving document:", err);
      alert("Could not approve document. Try again.");
      return false;
    } finally {
      setLoadingAction(false);
    }
  };

  // Reject document
  const RejectDoc = async (): Promise<boolean> => {
    setLoadingAction(true);
    try {
      const res = await fetch(
        `http://localhost:5000/documents/${code_id}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Rejected" }),
        }
      );
      if (!res.ok) throw new Error("Failed to reject document");

      const { updatedDoc } = await res.json();

      setDisplayDoc({
        ...displayDoc,
        status: updatedDoc.status,
      });

      alert("Document rejected!");
      return true;
    } catch (err) {
      console.error("Error rejecting document:", err);
      alert("Could not reject document. Try again.");
      return false;
    } finally {
      setLoadingAction(false);
    }
  };

  // Styles
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
      overflow: "auto",
      height: "100%",
    },
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <TopPanel />
        <div style={styles.content}>
          {/* Document Preview */}
          <div style={styles.documentArea}>
            {displayDoc.doc_type === "application/pdf" ? (
              <iframe
                src={displayDoc.url}
                width="100%"
                height="100%"
                title={displayDoc.file_name}
                style={{ border: "none", flex: 1 }}
              />
            ) : displayDoc.doc_type.startsWith("image/") ? (
              <img
                src={displayDoc.url}
                alt={displayDoc.file_name}
                style={{ maxWidth: "100%", height: "auto", flex: 1 }}
              />
            ) : (
              <p>
                Unsupported file type.{" "}
                <a href={displayDoc.url} target="_blank" rel="noopener noreferrer">
                  Download instead
                </a>
              </p>
            )}
          </div>

          {/* Right Details Panel */}
          <RightDetailsPanel
            submittedBy={displayDoc.submittedBy}
            type={displayDoc.type}
            branch="Soweto"
            submittedOn={new Date(displayDoc.submitted_at).toDateString()}
            status={displayDoc.status}
            commentMaxLength={120}
            onApprove={async () => {
              const success = await ApproveDoc();
              if (success) navigate("/queue");
            }}
            onReject={async () => {
              const success = await RejectDoc();
              if (success) navigate("/queue");
            }}
            onReassign={() => {
              alert("This document will be reassigned to a different Admin");
              navigate("/queue");
            }}
            onCancel={() => navigate("/queue")}
            approveDisabled={loadingAction}
            rejectDisabled={loadingAction}
          />
        </div>
      </div>
    </div>
  );
}
