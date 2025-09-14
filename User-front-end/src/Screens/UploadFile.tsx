import React, { useState, useEffect } from "react";
import { supabase } from "../Authentication/supabaseconfig";
import MainHeader from "../components/mainHeader";
import AffidavitForm from "../components/AffidavitForm";

const BUCKET_ID = "userDocuments";

interface UploadedDoc {
    document_id: string;
    type: string;
    file_url: string;
    submitted_at: string;
    signed_url?: string;
}

export default function DocumentUpload() {
    const [selectedType, setSelectedType] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [recentDocs, setRecentDocs] = useState<UploadedDoc[]>([]);

    useEffect(() => {
        fetchRecentDocs();
    }, []);

    const uploadToSupabase = async (pdfBlob: Blob) => {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) throw new Error("Not authenticated");
        const user = userData.user;

        const fileName = `${Date.now()}_${selectedType.replace(/\s+/g, "_")}.pdf`;
        const filePath = `${user.id}/${fileName}`;

        const { error: storageError } = await supabase.storage
            .from(BUCKET_ID)
            .upload(filePath, pdfBlob, {
                contentType: "application/pdf",
                upsert: false,
            });

        if (storageError) throw storageError;

        const { error: insertError } = await supabase.from("documents").insert([
            {
                user_id: user.id,
                type: selectedType,
                file_url: filePath,
                doc_type: "document",
                status: "pending",
                submitted_at: new Date().toISOString(),
            },
        ]);

        if (insertError) throw insertError;
    };

    const fetchRecentDocs = async () => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;

        const { data, error } = await supabase
            .from("documents")
            .select("*")
            .eq("user_id", user.id)
            .order("submitted_at", { ascending: false })
            .limit(5);

        if (error) {
            console.error("Fetch docs error:", error);
            return;
        }

        const signedDocs = await Promise.all(
            (data ?? []).map(async (doc) => {
                const { data: signed } = await supabase.storage
                    .from(BUCKET_ID)
                    .createSignedUrl(doc.file_url, 60 * 60 * 24 * 7);
                return { ...doc, signed_url: signed?.signedUrl ?? null };
            })
        );
        setRecentDocs(signedDocs as any);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header always at top */}
            <MainHeader />

            {/* Page Content */}
            <main className="flex-1 p-8">
                <h2 className="text-2xl font-bold mb-6">Upload Document</h2>

                {/* Document Types */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        "Proof of Identity",
                        "Proof of Residence",
                        "Additional Documents",
                        "Affidavit",
                    ].map((type) => (
                        <div
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`cursor-pointer p-4 border rounded-lg text-center ${selectedType === type
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-300"
                                }`}
                        >
                            {type}
                        </div>
                    ))}
                </div>

                {/* Upload Area */}
                {selectedType === "Affidavit" ? (
                    <AffidavitForm onSubmit={uploadToSupabase} loading={loading} />
                ) : (
                    <div className="border-2 border-dashed p-8 text-center mb-6 bg-white rounded-lg shadow-sm">
                        <input
                            id="fileInput"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            className="hidden"
                        />
                        <label
                            htmlFor="fileInput"
                            className="cursor-pointer text-blue-600"
                        >
                            {file ? file.name : "Click to upload or drag and drop"}
                        </label>
                    </div>
                )}

                {/* Recent Documents */}
                <section className="mt-10">
                    <h3 className="text-lg font-semibold mb-3">Recently Uploaded</h3>
                    <ul className="space-y-2">
                        {recentDocs.map((doc) => (
                            <li key={doc.document_id} className="border-b pb-2">
                                {doc.signed_url ? (
                                    <a
                                        href={doc.signed_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline"
                                    >
                                        {doc.type}
                                    </a>
                                ) : (
                                    <span className="text-gray-500">{doc.type}</span>
                                )}
                                <span className="text-gray-500 text-sm ml-2">
                                    {new Date(doc.submitted_at).toLocaleString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            </main>
        </div>
    );
}
