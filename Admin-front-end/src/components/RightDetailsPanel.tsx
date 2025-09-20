import React, { useState } from "react";


type Props = {
    title?: string;
    submittedBy?: string;
    type?: string;
    branch?: string;
    submittedOn?: string;
    status?: string;
    editable?: boolean;
    commentMaxLength?: number;
    approveDisabled?: boolean;
    rejectDisabled?: boolean;
    onClose?: () => void;
    onApprove?: (comment?: string) => void;
    onReject?: (comment?: string) => void;
    onReassign?: () => void;
    onCancel?: () => void;
};

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

export default function RightDetailsPanel({
    title,
    submittedBy,
    type,
    branch,
    submittedOn,
    status,
    editable = true,
    commentMaxLength = 120,
    approveDisabled,
    rejectDisabled,
    onClose,
    onApprove,
    onReject,
    onReassign,
    onCancel,
}: Props) {
    const [comment, setComment] = useState<string>("");

    const panelStyle: React.CSSProperties = {
        width: 320,
        minWidth: 320,
        background: "#fff",
        borderLeft: "1px solid #e5e7eb",
        padding: 18,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        gap: 12,
        height: "100vh",
        overflow: "auto",
    };

    const labelStyle: React.CSSProperties = { color: "#6b7280", fontSize: 13, marginBottom: 6 };
    const valueStyle: React.CSSProperties = { fontSize: 14, marginBottom: 8 };

    const displayTitle = title ?? "Details Panel";


    return (
        <aside style={panelStyle}>
            {/* top row: close icon */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                    onClick={onClose}
                    aria-label="close"
                    style={{
                        width: 30,
                        height: 30,
                        borderRadius: 999,
                        border: "none",
                        background: "#fff",
                        color: "#ef4444",
                        cursor: "pointer",
                        boxShadow: "0 0 0 1px rgba(239,68,68,0.08) inset",
                    }}
                >
                    ✕
                </button>
            </div>

            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{displayTitle}</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div>
                    <div style={labelStyle}>Submitted by:</div>
                    <div style={valueStyle}>{submittedBy ?? "-"}</div>
                </div>

                <div>
                    <div style={labelStyle}>Type:</div>
                    <div style={valueStyle}>{type ?? "-"}</div>
                </div>

                <div>
                    <div style={labelStyle}>Branch:</div>
                    <div style={valueStyle}>{branch ?? "-"}</div>
                </div>

                <div>
                    <div style={labelStyle}>Submitted on:</div>
                    <div style={valueStyle}>{submittedOn ?? "-"}</div>
                </div>

                <div>
                    <div style={labelStyle}>Status:</div>
                    <div style={valueStyle} className="text-red-600">{status ?? "-"}</div>
                </div>
            </div>

            <div style={{ marginTop: 8 }}>
                <div style={labelStyle}>Comment:</div>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={`Max: ${commentMaxLength} characters`}
                    maxLength={commentMaxLength}
                    disabled={!editable}
                    style={{
                        width: "100%",
                        height: 90,
                        borderRadius: 8,
                        border: "1px solid #d1d5db",
                        padding: 10,
                        resize: "none",
                        background: editable ? "#fff" : "#f3f4f6",
                        color: "#111827",
                        boxSizing: "border-box",
                    }}
                />
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <button
                    onClick={() => onApprove && onApprove(comment)}
                    disabled={approveDisabled ?? !editable}
                    style={{
                        flex: 1,
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "none",
                        cursor: approveDisabled ?? !editable ? "not-allowed" : "pointer",
                        background: approveDisabled ?? !editable ? "#e5e7eb" : "#2563eb",
                        color: approveDisabled ?? !editable ? "#9ca3af" : "#fff",
                        fontWeight: 600,
                    }}
                >
                    Approve
                </button>

                <button
                    onClick={ async () => onReject && onReject(comment)}
                    disabled={rejectDisabled ?? !editable}
                    style={{
                        flex: 1,
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "none",
                        cursor: rejectDisabled ?? !editable ? "not-allowed" : "pointer",
                        background: rejectDisabled ?? !editable ? "#f3f4f6" : "#ef4444",
                        color: rejectDisabled ?? !editable ? "#9ca3af" : "#fff",
                        fontWeight: 600,
                    }}
                >
                    Reject
                </button>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
                <button
                    onClick={onReassign}
                    style={{
                        flex: 1,
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        background: "#fff",
                        color: "#111827",
                        cursor: "pointer",
                        fontWeight: 600,
                    }}
                >
                    Reassign
                </button>

                <button
                    onClick={onCancel}
                    style={{
                        flex: 1,
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        background: "#fff",
                        color: "#6b7280",
                        cursor: "pointer",
                        fontWeight: 600,
                    }}
                >
                    Cancel
                </button>
            </div>
        </aside>
    );
}


