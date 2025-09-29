// DocumentUpload.tsx
import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../Authentication/supabaseconfig";
import { useLocation } from "react-router-dom";
import MainHeader from "../components/mainHeader";
import AffidavitForm from "../components/AffidavitForm";
import { IonIcon } from "@ionic/react";
import {
    filterOutline,
    menuOutline,
    cloudUploadOutline,
    documentTextOutline,
    closeOutline,
} from "ionicons/icons";
import { s } from "framer-motion/dist/types.d-Bq-Qm38R";

const BUCKET_ID = "userDocuments";

interface UploadedDoc {
    document_id: string;
<<<<<<< Updated upstream
=======
    user_id: string;
    file_name: string;
>>>>>>> Stashed changes
    type: string;
    file_url: string;
    submitted_at: string;
<<<<<<< Updated upstream
    signed_url?: string;
=======
    code_id?: string;
    status: string;

    //submitted_by?: string | null;
    branch_assigned?: string | null;
    comments?: string | null;

    signed_url?: string | null;
    signed_file_url?: string | null;
>>>>>>> Stashed changes
}

export default function DocumentUpload(): JSX.Element {
    const [selectedType, setSelectedType] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [recentDocs, setRecentDocs] = useState<UploadedDoc[]>([]);

    const [previewFile, setPreviewFile] = useState<UploadedDoc | null>(null);

    // affidavit modal toggle
    const location = useLocation();
    const openAffidavit = location.state?.openAffidavit;
    const [showAffidavit, setShowAffidavit] = useState(false);

    useEffect(() => {
        if (openAffidavit) {
            setShowAffidavit(true); // open affidavit only after page load
        }
    }, [openAffidavit]);

    useEffect(() => {
        fetchRecentDocs();
    }, []);

<<<<<<< Updated upstream
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
=======
    function generateCode(length = 16): string {
        const charset =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        const randomValues = new Uint32Array(length);
        crypto.getRandomValues(randomValues);
        for (let i = 0; i < length; i++) {
            result += charset[randomValues[i] % charset.length];
        }
        return result;
    }

    const uploadToSupabase = useCallback(
        async (f: File) => {
            try {
                const {
                    data: { user },
                    error: userError,
                } = await supabase.auth.getUser();
                if (userError || !user) throw new Error("Not authenticated");

                const code = generateCode();
                const ext = f.name.split(".").pop() ?? "bin";
                const safeType = selectedType
                    ? selectedType.replace(/\s+/g, "_")
                    : "document";
                const fileName = `${Date.now()}_${safeType}.${ext}`;
                const filePath = `${user.id}/${fileName}`;

                const { error: storageError } = await supabase.storage
                    .from(BUCKET_ID)
                    .upload(filePath, f, { contentType: f.type, upsert: false });
                if (storageError) throw storageError;

                const insertPayload = {
                    user_id: user.id,
                    file_name: f.name,
                    type: selectedType,
                    file_path: filePath,
                    status: "Pending",
                    submitted_at: new Date().toISOString(),
                    code_id: code,
                    //submitted_by: user.email ?? null,
                    branch_assigned: null,
                    comments: null,
                };

                const { error: insertError } = await supabase
                    .from("documents")
                    .insert([insertPayload]);
                if (insertError) throw insertError;
>>>>>>> Stashed changes

                alert("File uploaded successfully");
                await fetchRecentDocs();
            } catch (err: any) {
                console.error("Upload failed:", err);
                alert("Upload failed: " + (err?.message ?? err));
            }
        },
        [selectedType]
    );

    async function fetchRecentDocs() {
        try {
            const { data: userData } = await supabase.auth.getUser();
            const user = userData?.user;
            if (!user) return;

            const { data, error } = await supabase
                .from("documents")
                .select("*")
                .eq("user_id", user.id)
                .order("submitted_at", { ascending: false })
                .limit(5);

<<<<<<< Updated upstream
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
=======
            if (error) throw error;

            const signedDocs = await Promise.all(
                (data ?? []).map(async (doc: any) => {
                    let signed_url: string | null = null;
                    try {
                        if (doc.file_path) {
                            const { data: signed } = await supabase.storage
                                .from(BUCKET_ID)
                                .createSignedUrl(doc.file_path, 60 * 60 * 24 * 7);
                            signed_url = signed?.signedUrl ?? null;
                        }
                    } catch {
                        signed_url = null;
                    }
                    return {
                        ...doc,
                        signed_file_url: signed_url,
                        signed_url,
                    } as UploadedDoc;
                })
            );

            setRecentDocs(signedDocs);
            if (signedDocs.length > 0) setPreviewFile(signedDocs[0]);
        } catch (err) {
            console.error("fetchRecentDocs error:", err);
        }
    }

    const handleSubmit = async () => {
        setError("");
        if (!file && !selectedType) return setError("*Select a file and type*");
        if (!file) return setError("*No file selected*");
        if (!selectedType) return setError("*Select the type above*");

        setLoading(true);
        try {
            await uploadToSupabase(file);

            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("typeOfFile", file.type);
                await fetch("http://localhost:5000/upload", {
                    method: "POST",
                    body: formData,
                });
            } catch (err) {
                console.warn("server upload failed:", err);
            }

            setFile(null);
            setSelectedType("");
        } finally {
            setLoading(false);
        }
    };

    const cancelUpload = () => {
        setFile(null);
        setSelectedType("");
        setError("");
    };

    return (
        <div className="min-h-screen flex flex-col bg-white mt-2">
>>>>>>> Stashed changes
            <MainHeader />
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-8 py-4">
                    <h1 className="text-3xl font-bold mb-6">Upload File</h1>

<<<<<<< Updated upstream
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
=======
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* LEFT */}
                        <div className="lg:col-span-8">
                            {/* Drag + drop */}
                            <div
                                className="rounded-md border-2 border-dashed border-gray-400 p-8 min-h-[220px] flex flex-col justify-center items-center"
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (e.dataTransfer.files?.length) {
                                        setFile(e.dataTransfer.files[0]);
                                    }
                                }}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <div className="flex flex-col items-center gap-4">
                                    <div className="text-4xl">⬆️</div>
                                    <div className="text-sm text-gray-600">
                                        Max 120 MB (PNG, JPEG, PDF)
                                    </div>
                                    <label
                                        htmlFor="fileInput"
                                        className="inline-block mt-2 bg-blue-600 text-white px-4 py-2 rounded-full cursor-pointer hover:bg-blue-700"
                                    >
                                        Browse file
                                    </label>
                                    <input
                                        id="fileInput"
                                        type="file"
                                        accept="image/*,application/pdf"
                                        className="hidden"
                                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                    />
                                    {file && (
                                        <div className="mt-3 text-sm">
                                            Selected: <b>{file.name}</b>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* File Type */}
                            <h2 className="text-xl font-semibold mt-8 mb-4">File Type</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    {
                                        label: "Proof of Identity",
                                        items: [
                                            "South African Smart ID Card",
                                            "Green Barcoded ID Book",
                                            "Valid Passport",
                                            "Driver’s License",
                                        ],
                                    },
                                    {
                                        label: "Proof of Residential Address",
                                        items: [
                                            "Utility Bills",
                                            "Bank Statements",
                                            "Lease or Rental Agreements",
                                            "Municipal Rates & Taxes",
                                        ],
                                    },
                                    {
                                        label: "Additional Documents",
                                        items: [
                                            "Affidavit or Police Statement",
                                            "Proof of Income / Tax Number",
                                            "Cancelled Cheque",
                                            "Authority Documents",
                                        ],
                                    },
                                ].map((card) => (
                                    <div
                                        key={card.label}
                                        onClick={() => setSelectedType(card.label)}
                                        className={`relative border rounded-lg p-5 min-h-[200px] cursor-pointer ${selectedType === card.label
                                            ? "ring-2 ring-blue-400"
                                            : "border-gray-300"
                                            }`}
                                    >
                                        <h3 className="font-medium mb-3">{card.label}</h3>
                                        <ul className="text-sm text-gray-600 list-disc ml-5 space-y-1">
                                            {card.items.map((i) => (
                                                <li key={i}>{i}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            {error && (
                                <div className="text-center text-red-500 italic mt-4">{error}</div>
                            )}

                            {/* Buttons */}
                            <div className="flex items-center justify-between mt-8  gap-6 mt-8 flex-wrap">
                                <div className="flex gap-4">
                                    <button
                                        onClick={cancelUpload}
                                        className="px-6 py-2 rounded-2xl w-32 bg-red-500 text-white hover:bg-red-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="px-6 py-2 rounded-2xl w-32 bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        {loading ? "Uploading..." : "Submit"}
                                    </button>
                                </div>
                                <div>
                                    <button
                                        onClick={showAffidavit ? () => setShowAffidavit(false) : () => setShowAffidavit(true)}
                                        className="px-6 py-2 rounded-2xl w-42 bg-green-600 text-white hover:bg-green-700"
                                    >
                                        Make Affidavit
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT */}
                        <div className="lg:col-span-4">
                            {/* Recent */}
                            <div className="mt-0">
                                <h4 className="text-sm text-gray-500 mb-2">Recently uploaded</h4>
                                <ul className="space-y-3">
                                    {recentDocs.length === 0 && (
                                        <li className="text-sm text-gray-400">No uploads</li>
                                    )}
                                    {recentDocs.map((d) => (
                                        <li
                                            key={d.document_id}
                                            className="flex items-start gap-3 p-3 bg-white border rounded cursor-pointer"
                                            onClick={() => setPreviewFile(d)}
                                        >
                                            <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center">
                                                📄
                                            </div>
                                            <div className="text-sm">
                                                <div className="font-medium">{d.file_name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(d.submitted_at).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="ml-auto text-xs text-blue-600">
                                                {d.signed_file_url ? "View" : "No preview"}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Affidavit modal */}
            {showAffidavit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold">Make Affidavit</h2>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setShowAffidavit(false)}
                            >
                                ✖
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Fill out the form below to create a new affidavit.
                        </p>

                        {/* Affidavit form */}
                        <AffidavitForm
                            onSubmit={async (data) => {
                                console.log("Affidavit submitted:", data);
                                // TODO: hook this into Supabase if needed
                                setShowAffidavit(false);
                            }}
                            loading={false}
                        />
                    </div>
                </div>
            )}

>>>>>>> Stashed changes
        </div>
    );
}
