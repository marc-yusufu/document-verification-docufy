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
}
