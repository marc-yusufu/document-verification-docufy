import React, { useEffect, useState } from "react";
import { Document as DocType } from "../Screens/types";
import { IonIcon } from "@ionic/react";
import {
    cloudDownloadOutline,
    shareOutline,
    trashOutline,
} from "ionicons/icons";

interface Props {
    doc: DocType;
    onClose: () => void;
    onDelete: (id: string) => Promise<void> | void;
}

export default function PreviewModal({ doc, onClose, onDelete }: Props) {
    const [progress, setProgress] = useState(0);
    const [isTracking, setIsTracking] = useState(true); // always tracking
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let id: any;
        if (isTracking) {
            id = setInterval(() => {
                setProgress((p) =>
                    p >= 100 ? 100 : p + Math.floor(Math.random() * 8) + 3
                );
            }, 800);
        }
        return () => clearInterval(id);
    }, [isTracking]);

    const submittedOn = doc.submitted_at
        ? new Date(doc.submitted_at).toLocaleDateString()
        : "—";

    const handleShare = async () => {
        if (!doc.signed_url) return;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: doc.file_name,
                    text: "Check out this document",
                    url: doc.signed_url,
                });
            } catch (err) {
                console.error("Share cancelled", err);
            }
        } else {
            await navigator.clipboard.writeText(doc.signed_url);
            alert("Link copied to clipboard!");
        }
    };

    async function handleDelete() {
        if (!confirm("Delete this file? This cannot be undone.")) return;
        setIsDeleting(true);
        try {
            await onDelete(doc.document_id);
        } catch (e) {
            console.error(e);
            alert("Delete failed");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-[95%] md:w-4/5 h-[85%] flex overflow-hidden">
                {/* left: preview box */}
                <div className="flex-1 p-6 flex flex-col">
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Tracker (always visible) */}
                    <div className="mt-2">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                    1
                                </div>
                                <div className="text-sm">Processing</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center">
                                    2
                                </div>
                                <div className="text-sm">Analyzing</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${doc.status === "Verified"
                                        ? "bg-green-600 text-white"
                                        : "bg-gray-200 text-gray-600"
                                        }`}
                                >
                                    {doc.status === "Verified" ? "✓" : "3"}
                                </div>
                                <div className="text-sm">Verified</div>
                            </div>
                            <div className="ml-auto text-sm text-blue-700">
                                Tracking {progress}%
                            </div>
                        </div>
                    </div>

                    {/* preview area */}
                    <div className="flex-1 mt-4 border-dashed border-2 border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                        {doc.signed_url ? (
                            <iframe
                                src={doc.signed_url}
                                title={doc.file_name}
                                className="w-full h-full"
                            />
                        ) : (
                            <div className="text-gray-400 text-xl">No preview available</div>
                        )}
                    </div>
                </div>

                {/* right: metadata */}
                <div className="w-96 p-6 border-l overflow-auto">
                    <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center text-2xl">
                            📄
                        </div>
                        <div>
                            <div className="text-lg font-semibold">{doc.file_name}</div>
                            <div className="text-xs text-gray-500">{doc.type}</div>
                        </div>
                    </div>

                    <div className="mt-4 text-sm space-y-2">
                        <div>
                            <span className="text-gray-500">Submitted by:</span>{" "}
                            <span className="font-medium">{doc.submitted_by ?? "Unknown"}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Type:</span>{" "}
                            <span>{doc.type ?? "—"}</span>f
                        </div>
                        <div>
                            <span className="text-gray-500">Branch:</span>{" "}
                            <span>{doc.branch_assigned ?? "—"}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Submitted on:</span>{" "}
                            <span>{submittedOn}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Status:</span>{" "}
                            <span className="font-medium">{doc.status}</span>
                        </div>

                        <div className="mt-4">
                            <div className="text-gray-500 mb-2">Comments:</div>
                            <div className="bg-gray-50 p-3 rounded text-sm min-h-[80px] whitespace-pre-line">
                                {doc.comments && doc.comments.trim() !== ""
                                    ? doc.comments
                                    : "No comments"}
                            </div>
                        </div>

                        {/* actions */}
                        <div className="mt-6 flex gap-3">
                            {/* Download */}
                            <a
                                href={doc.signed_url || "#"}
                                target="_blank"
                                rel="noreferrer"
                                className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-white ${doc.signed_url
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-gray-300 cursor-not-allowed"
                                    }`}
                            >
                                <IonIcon icon={cloudDownloadOutline} />
                                Download
                            </a>

                            {/* Share */}
                            <button
                                onClick={handleShare}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                            >
                                <IonIcon icon={shareOutline} className="text-gray-700 text-lg" />
                            </button>

                            {/* Delete */}
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className={`p-2 rounded-full ${isDeleting
                                    ? "bg-gray-200 text-gray-500"
                                    : "bg-red-600 text-white hover:bg-red-700"
                                    }`}
                            >
                                <IonIcon icon={trashOutline} className="text-lg" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
