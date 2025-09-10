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
  type: string
  //file_url: string
  submitted_at: Date
  submittedBy: string;
  docType: string;

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



  const {file_url} = useParams()
  const decodedFileUrl = decodeURIComponent(file_url ?? "")

  
  ///fetching document by making api call to the backend
  useEffect(() => {
    if (!file_url) return; // Don't fetch if id is missing

      const viewDocs = async () => {
        try {
          const res = await fetch(`http://localhost:5000/documents/${file_url}`);
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



  // const { id } = useParams<{ id: string }>();


  // useEffect(() => {
  //   fetchDoc();
  // }, [id]);
  
  
  // ///fetching directly from the frontend
  // async function fetchDoc() {
  //   setLoadingDoc(true);
  //   try {
  //     const { data: doc, error: docErr } = await supabase
  //       .from("documents")
  //       .select("*")
  //       .eq("document_id", id)
  //       .single();
  //     if (docErr) throw docErr;

  //     if (!doc.user_id) throw new Error("Document has no user_id");

  //     // ✅ create signed URL for this file
  //     const { data: signed, error: signedErr } = await supabase.storage
  //       .from("userDocuments")
  //       .createSignedUrl(doc.file_url, 60 * 60); // 1 hour
  //     if (signedErr) throw signedErr;

  //     const { data: user, error: userErr } = await supabase
  //       .from("users")
  //       .select("national_id_no, passport_no")
  //       .eq("id", doc.user_id)
  //       .single();
  //     if (userErr) throw userErr;

  //     const linkValue = user.national_id_no || user.passport_no;
  //     if (!linkValue) throw new Error("User has no national_id_no or passport_no");

  //     const { data: citizen, error: citizenErr } = await supabase
  //       .from("citizens")
  //       .select("full_name")
  //       .or(`national_id_no.eq.${linkValue},passport_no.eq.${linkValue}`)
  //       .single();
  //     if (citizenErr) throw citizenErr;

  //     const submittedBy = citizen.full_name || "Unknown";

  //     setDisplayDoc({
  //       fileName: doc.file_name || "Document",
  //       fileType: doc.file_type,
  //       filePath: doc.file_url,
  //       fileUrl: signed?.signedUrl || "",
  //       status: doc.status,
  //       uploadedAt: doc.submitted_at,
  //       submittedBy,
  //       docType: doc.doc_type,
  //     });
  //   } catch (err) {
  //     console.error("Error fetching doc:", err);
  //   } finally {
  //     setLoadingDoc(false);
  //   }
  // }


  // const updateStatus = async (status: "approved" | "rejected") => {
  //   if (!displayDoc) return;
  //   setLoadingAction(true);
  //   try {
  //     const res = await fetch(`http://localhost:5000/documents/status`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ status }),
  //     });
  //     if (!res.ok) throw new Error("Failed to update status");
  //     const updatedDoc = await res.json();
  //     setDisplayDoc(prev => (prev ? { ...prev, status: updatedDoc.status } : prev));
  //     alert("Status updated to " + updatedDoc.status);
  //   } catch (err) {
  //     console.error("Error updating status:", err);
  //     alert("Could not update status");
  //   } finally {
  //     setLoadingAction(false);
  //   }
  // };

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
            {loadingDoc ? (
              <p style={{ margin: "auto" }}>Loading document...</p>
            ) : displayDoc ? (
              displayDoc.fileType === "application/pdf" ? (
                <iframe
                  src={displayDoc.fileUrl}
                  title={displayDoc.fileName}
                  style={{ border: "none", width: "100%", height: "100%" }}
                />
              ) : displayDoc.docType === "image" ? (
                <img
                  src={displayDoc.fileUrl}
                  alt={displayDoc.fileName}
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              ) : (
                <p>
                  Unsupported file type.{" "}
                  <a href={displayDoc.fileUrl} target="_blank" rel="noopener noreferrer">
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
            type={displayDoc?.fileName || ""}
            branch="Soweto"
            submittedOn={displayDoc ? new Date(displayDoc.uploadedAt).toDateString() : ""}
            status={displayDoc?.status || ""}
            commentMaxLength={120}
            // onApprove={() => updateStatus("approved")}
            // onReject={() => updateStatus("rejected")}
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
