import { Document } from "../Screens/Home"; // adjust path if needed
import React from "react";

interface Props {
    document: Document;
    statusStyles: Record<Document["status"], { color: string; icon: string }>;
}

export default function DocumentPreview({ document, statusStyles }: Props) {
    const submittedOn = document.submitted_at ? new Date(document.submitted_at).toLocaleDateString() : "N/A";

    return (
        <div className="relative">
            <button className="absolute right-3 top-3 text-red-500">✕</button>

            <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center">
                    <img src="/IconPac/document-lg.png" alt="doc" className="w-10 h-10" />
                </div>

                <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{document.title || document.type}</h3>
                    <div className="text-sm text-gray-600">Submitted by <span className="font-medium text-gray-800 ml-2">{document.submitted_by || "Unknown"}</span></div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                <div className="text-gray-600">Type</div>
                <div className="font-medium text-gray-900">{document.type}</div>

                <div className="text-gray-600">Branch</div>
                <div className="font-medium text-gray-900">{document.branch || "N/A"}</div>

                <div className="text-gray-600">Submitted on</div>
                <div className="font-medium text-gray-900">{submittedOn}</div>

                <div className="text-gray-600">Status</div>
                <div className="font-medium text-gray-900 flex items-center gap-2">
                    <img src={statusStyles[document.status]?.icon} className="w-4 h-4" alt={document.status} />
                    {document.status}
                </div>
            </div>

            <div className="mt-4">
                <div className="text-sm text-gray-600 mb-1">Comments:</div>
                <div className="w-full h-28 rounded-lg bg-gray-100 border border-gray-200 p-2 text-sm text-gray-600">
                    {document.comments || ""}
                </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
                <a href={document.signed_url} target="_blank" rel="noreferrer" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-full text-center">
                    Download
                </a>
                <button className="w-11 h-11 bg-white border border-gray-200 rounded-full flex items-center justify-center">
                    <img src="/IconPac/share.png" alt="share" className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
