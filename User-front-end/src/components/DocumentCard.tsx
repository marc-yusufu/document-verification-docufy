<<<<<<< Updated upstream
import React from "react";
import { Document } from "../Screens/Home"; // adjust import path if needed

interface Props {
    doc: Document;
    onClick?: () => void;
    selected?: boolean;
    statusStyles: Record<
        Document["status"],
        { color: string; icon: string }
    >;
}

export default function DocumentCard({ doc, onClick, selected, statusStyles }: Props) {
    const isImage = /\.(png|jpe?g)$/i.test(doc.file_url);
    return (
        <div
            onClick={onClick}
            className={`relative cursor-pointer bg-gray-50 rounded-2xl p-4 border ${selected ? "border-blue-400" : "border-gray-200"
                } hover:shadow-lg transition flex flex-col items-start`}
        >
            <div className="flex items-start w-full gap-3">
                <div className="w-14 h-14 rounded-md bg-white flex items-center justify-center border border-gray-200">
                    {isImage ? (
                        <img src={doc.signed_url} alt={doc.type} className="w-full h-full object-cover rounded-md" />
                    ) : (
                        <img src="/IconPac/document.png" alt="doc" className="w-7 h-7" />
                    )}
                </div>

                <div className="flex-1">
                    <div className="text-sm font-semibold">{doc.type}</div>
                    <div className={`text-xs mt-1 flex items-center gap-2 ${statusStyles[doc.status]?.color || "text-gray-500"}`}>
                        <img src={statusStyles[doc.status]?.icon} className="w-3 h-3" alt={doc.status} />
                        <span>{doc.status}</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 w-full flex items-center justify-between">
                <a
                    href={doc.signed_url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-600 text-white text-xs px-3 py-1 rounded-md"
                >
                    Download
                </a>
                <button className="w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center">
                    <img src="/IconPac/share.png" alt="share" className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
=======
import React, { useState } from "react";
import { IonIcon } from "@ionic/react";
import {
    cloudDownloadOutline,
    shareOutline,
    copyOutline,
    closeOutline,
} from "ionicons/icons";
import { QRCodeCanvas } from "qrcode.react";
import { Document, DocumentStatus } from "../Screens/types";

interface Props {
    doc: Document;
    viewMode: "grid" | "list";
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
    onOpen?: (doc: Document) => void;
    statusStyles: Record<DocumentStatus, { color: string; icon: string }>;
}

export default function DocumentCard({
    doc,
    viewMode,
    isSelected,
    onToggleSelect,
    onOpen,
    statusStyles,
}: Props) {
    const [shareOpen, setShareOpen] = useState(false);

    const isImage = /\.(png|jpe?g|gif)$/i.test(
        doc.file_path || doc.file_name || ""
    );
    const statusMeta =
        statusStyles[doc.status] ?? {
            color: "text-gray-700",
            icon: "/IconPac/question.png",
        };

    // Copy link to clipboard
    const handleCopy = async () => {
        if (doc.signed_url) {
            await navigator.clipboard.writeText(doc.signed_url);
            alert("Link copied to clipboard ✅");
        }
    };

    // Download handler
    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!doc.signed_url) return;

        try {
            const res = await fetch(doc.signed_url);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = doc.file_name || "document";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed:", err);
        }
    };

    // --- SHARE MODAL ---
    // --- SHARE MODAL ---
    const ShareModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-lg w-96 p-6 relative">
                {/* Close button */}
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setShareOpen(false)}
                >
                    <IonIcon icon={closeOutline} className="text-xl" />
                </button>

                <h2 className="text-lg font-semibold mb-4">Share Document</h2>

                {doc.signed_url ? (
                    <>
                        {/* Link + Copy */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-600">
                                Document Link
                            </label>
                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    type="text"
                                    value={doc.signed_url}
                                    readOnly
                                    className="flex-1 px-2 py-1 border rounded bg-gray-50 text-sm"
                                />
                                <button
                                    onClick={handleCopy}
                                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                                >
                                    <IonIcon icon={copyOutline} />
                                    Copy
                                </button>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="flex flex-col items-center mb-6">
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                QR Code
                            </label>
                            <QRCodeCanvas value={doc.signed_url} size={150} />
                        </div>

                        {/* Share Buttons */}
                        <div className="flex justify-center gap-6">
                            {/* Email */}
                            <a
                                href={`mailto:?subject=${encodeURIComponent(
                                    "Shared Document"
                                )}&body=${encodeURIComponent(
                                    "Check this document: " + doc.signed_url
                                )}`}
                                className="flex flex-col items-center text-sm font-medium text-gray-700 hover:text-red-500"
                            >
                                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 shadow-sm hover:shadow-md">
                                    <img
                                        src="/IconPac/emailLogo.png"
                                        alt="Email"
                                        className="w-12 h-12"
                                    />
                                </div>
                                <span className="mt-1">Email</span>
                            </a>

                            {/* WhatsApp */}
                            <a
                                href={`https://wa.me/?text=${encodeURIComponent(
                                    "Check this document: " + doc.signed_url
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center text-sm font-medium text-gray-700 hover:text-green-600"
                            >
                                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 shadow-sm hover:shadow-md">
                                    <img
                                        src="/IconPac/whatsappLogo.png"
                                        alt="WhatsApp"
                                        className="w-12 h-12"
                                    />
                                </div>
                                <span className="mt-1">WhatsApp</span>
                            </a>

                            {/* LinkedIn */}
                            <a
                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                                    doc.signed_url
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                            >
                                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 shadow-sm hover:shadow-md">
                                    <img
                                        src="/IconPac/LinkedInLogo.png"
                                        alt="LinkedIn"
                                        className="w-12 h-12"
                                    />
                                </div>
                                <span className="mt-1">LinkedIn</span>
                            </a>
                        </div>
                    </>
                ) : (
                    <p className="text-gray-500">No link available for this document.</p>
                )}
            </div>
        </div>
    );


    // ---------------- UI ----------------
    if (viewMode === "grid") {
        return (
            <>
                <div
                    className={`relative bg-white rounded-xl p-4 w-60 h-100 flex flex-col items-center shadow-sm hover:ring-2 transition cursor-pointer ${isSelected
                        ? "ring-2 ring-blue-200 border border-blue-300"
                        : "border border-gray-200"
                        }`}
                    onClick={() => onOpen?.(doc)}
                >
                    {/* checkbox */}
                    <label
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-3 right-3"
                    >
                        <input
                            type="checkbox"
                            aria-label={`Select ${doc.file_name}`}
                            checked={isSelected}
                            onChange={() => onToggleSelect(doc.document_id)}
                            className="w-4 h-4 accent-blue-600"
                        />
                    </label>

                    {/* thumbnail */}
                    <div className="w-20 h-20 mb-3 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                        {isImage && doc.signed_url ? (
                            <img
                                src={doc.signed_url}
                                alt={doc.file_name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="text-3xl select-none">📄</div>
                        )}
                    </div>

                    {/* name + status */}
                    <div className="text-sm font-medium text-gray-800 text-center truncate w-full">
                        {doc.file_name}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                        <img src={statusMeta.icon} alt={doc.status} className="w-4 h-4" />
                        <span className={`text-xs font-medium ${statusMeta.color}`}>
                            {doc.status}
                        </span>
                    </div>

                    {/* actions */}
                    <div className="mt-3 flex gap-2">
                        <button
                            onClick={handleDownload}
                            disabled={!doc.signed_url}
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition ${doc.signed_url
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-100 text-gray-500 cursor-not-allowed"
                                }`}
                        >
                            <IonIcon icon={cloudDownloadOutline} />
                            Download
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShareOpen(true);
                            }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 hover:bg-gray-50 transition"
                            title="Share"
                        >
                            <IonIcon icon={shareOutline} />
                        </button>
                    </div>
                </div>

                {shareOpen && <ShareModal />}
            </>
        );
    }

    // LIST VIEW
    return (
        <>
            <div
                className={`flex items-center justify-between gap-4 px-4 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition ${isSelected
                    ? "ring-2 ring-blue-200 border border-blue-300"
                    : "border border-gray-100"
                    }`}
                onClick={() => onOpen?.(doc)}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                            e.stopPropagation();
                            onToggleSelect(doc.document_id);
                        }}
                        className="w-4 h-4 accent-blue-600"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${doc.file_name}`}
                    />

                    <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded overflow-hidden">
                        {isImage && doc.signed_url ? (
                            <img
                                src={doc.signed_url}
                                alt={doc.file_name}
                                className="w-full h-full object-cover rounded"
                            />
                        ) : (
                            <div className="text-xl select-none">📄</div>
                        )}
                    </div>

                    <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                            {doc.file_name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{doc.type}</div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div
                        className={`inline-flex items-center gap-2 text-sm font-medium ${statusMeta.color}`}
                    >
                        <img src={statusMeta.icon} alt={doc.status} className="w-4 h-4" />
                        <span>{doc.status}</span>
                    </div>

                    <button
                        onClick={handleDownload}
                        disabled={!doc.signed_url}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition ${doc.signed_url
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-100 text-gray-500 cursor-not-allowed"
                            }`}
                    >
                        <IonIcon icon={cloudDownloadOutline} />
                        Download
                    </button>

                    <button
                        type="button"
                        className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShareOpen(true);
                        }}
                        title="Share"
                    >
                        <IonIcon icon={shareOutline} />
                    </button>
                </div>
            </div>

            {shareOpen && <ShareModal />}
        </>
    );
>>>>>>> Stashed changes
}
