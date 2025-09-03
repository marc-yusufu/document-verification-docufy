import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../Authentication/supabaseconfig";
import MainHeader from "../components/mainHeader";
import jsPDF from "jspdf";

const BUCKET_ID = "documents"; // must match dashboard

interface UploadedDoc {
    document_id: string;
    type: string;
    file_url: string; // storage path (e.g. "<userId>/<filename>.pdf")
    submitted_at: string;
    signed_url?: string;
}

export default function DocumentUpload() {
    const [selectedType, setSelectedType] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [recentDocs, setRecentDocs] = useState<UploadedDoc[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        fetchRecentDocs();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploaded = e.target.files?.[0];
        if (uploaded) setFile(uploaded);
    };

    const processImageWithOpenCV = async (file: File): Promise<HTMLCanvasElement> =>
        new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const cv = (window as any).cv;
                if (!cv) return reject(new Error("OpenCV not loaded"));
                const src = cv.imread(img);
                const dst = new cv.Mat();
                cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
                cv.imshow(canvasRef.current!, dst);
                src.delete(); dst.delete();
                resolve(canvasRef.current!);
            };
            img.onerror = reject;
        });

    const generatePDF = (canvas: HTMLCanvasElement): Blob => {
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pageWidth;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        const yPos = (pageHeight - imgHeight) / 2;
        pdf.addImage(imgData, "JPEG", 0, yPos, imgWidth, imgHeight);
        return pdf.output("blob") as Blob;
    };

    // optional: sign with a few retries to avoid "object not found" right after upload
    const signWithRetry = async (path: string, tries = 4, delayMs = 350): Promise<string | null> => {
        for (let i = 0; i < tries; i++) {
            const { data, error } = await supabase.storage.from(BUCKET_ID).createSignedUrl(path, 60 * 60 * 24 * 7);
            if (!error && data?.signedUrl) return data.signedUrl;
            await new Promise((r) => setTimeout(r, delayMs));
        }
        return null;
    };

    const BUCKET_ID = "userDocuments"; // 👈 must match your bucket name exactly

    const uploadToSupabase = async (pdfBlob: Blob) => {
        if (!file) return;

        // 1. Get logged-in user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) throw new Error("Not authenticated");
        const user = userData.user;

        // 2. Clean up the filename
        const baseName = file.name.replace(/\.[^/.]+$/, ""); // strip extension
        const safeBase = baseName.replace(/[^a-zA-Z0-9._-]/g, "_"); // safe for paths
        const fileName = `${Date.now()}_${safeBase}.pdf`;

        // 3. File path must start with userId (so RLS policies match)
        const filePath = `${user.id}/${fileName}`;

        // 4. Upload to Storage
        const { data: uploadData, error: storageError } = await supabase.storage
            .from(BUCKET_ID)
            .upload(filePath, pdfBlob, {
                contentType: "application/pdf",
                upsert: false, // avoid overwriting accidentally
            });

        if (storageError) throw storageError;
        console.log("Uploaded:", uploadData);

        // 5. Save metadata in the `documents` table
        const { error: insertError } = await supabase.from("documents").insert([
            {
                user_id: user.id,
                type: selectedType,
                file_url: filePath, // store the path (NOT signed URL)
                status: "pending",
                submitted_at: new Date().toISOString(),
            },
        ]);

        if (insertError) throw insertError;

        // 6. Return file path (not signed URL, that’s created later when fetching)
        return filePath;
    };

    const handleSubmit = async () => {
        setError(null);
        if (!file) return setError("Please upload a file");
        if (!selectedType) return setError("Please select a document type");

        setLoading(true);
        try {
            const canvas = await processImageWithOpenCV(file);
            const pdfBlob = generatePDF(canvas);
            await uploadToSupabase(pdfBlob);
            await fetchRecentDocs();
            setFile(null);
        } catch (e: any) {
            console.error(e);
            setError(e.message ?? "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentDocs = async () => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;

        const { data, error } = await supabase
            .from("documents")
            .select("*")
            .eq("user_id", user.id)            // only my docs (also matches typical RLS)
            .order("submitted_at", { ascending: false })
            .limit(5);

        if (error) {
            console.error("Fetch docs error:", error);
            return;
        }

        const signedDocs = await Promise.all(
            (data ?? []).map(async (doc) => {
                const { data: signed, error: signErr } = await supabase.storage
                    .from(BUCKET_ID)
                    .createSignedUrl(doc.file_url, 60 * 60 * 24 * 7);
                if (signErr) console.error("Sign error:", doc.file_url, signErr);
                return { ...doc, signed_url: signed?.signedUrl ?? null };
            })
        );
        setRecentDocs(signedDocs as any);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow">
            <MainHeader />

            <h2 className="text-2xl font-bold mb-4">Upload Document</h2>

            {/* Type selector */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {["Proof of Identity", "Proof of Residence", "Additional Documents"].map((type) => (
                    <div
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`cursor-pointer p-4 border rounded-lg text-center ${selectedType === type ? "border-blue-500 bg-blue-50" : "border-gray-300"
                            }`}
                    >
                        {type}
                    </div>
                ))}
            </div>

            {/* File input */}
            <div className="border-2 border-dashed p-6 text-center mb-4">
                <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <label htmlFor="fileInput" className="cursor-pointer text-blue-600">
                    {file ? file.name : "Click to upload or drag and drop"}
                </label>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}
            <canvas ref={canvasRef} style={{ display: "none" }} />

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? "Processing..." : "Upload Document"}
            </button>

            {/* Recent */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Recently Uploaded</h3>
                <ul className="space-y-2">
                    {recentDocs.map((doc) => (
                        <li key={doc.document_id} className="border-b pb-2">
                            {doc.signed_url ? (
                                <a href={doc.signed_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
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
            </div>
        </div>
    );
}
