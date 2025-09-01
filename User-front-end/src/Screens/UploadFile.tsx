import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../Authentication/supabaseconfig"; // adjust path to your Supabase client
import jsPDF from "jspdf";

interface UploadedDoc {
    document_id: string;
    type: string;
    file_url: string;
    submitted_at: string;
    signed_url?: string; // Optional, for signed URL after upload
}

export default function DocumentUpload() {
    const [selectedType, setSelectedType] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [recentDocs, setRecentDocs] = useState<UploadedDoc[]>([]);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        fetchRecentDocs();
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = event.target.files?.[0];
        if (uploadedFile) {
            setFile(uploadedFile);
        }
    };

    const processImageWithOpenCV = async (file: File): Promise<HTMLCanvasElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const cv = (window as any).cv;
                if (!cv) {
                    reject(new Error("OpenCV not loaded"));
                    return;
                }
                const src = cv.imread(img);
                const dst = new cv.Mat();
                cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
                cv.imshow(canvasRef.current!, dst);
                src.delete();
                dst.delete();
                resolve(canvasRef.current!);
            };
            img.onerror = reject;
        });
    };

    const generatePDF = (canvas: HTMLCanvasElement): Blob => {
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pageWidth;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        const yPos = (pageHeight - imgHeight) / 2;
        pdf.addImage(imgData, "JPEG", 0, yPos, imgWidth, imgHeight);
        return pdf.output("blob") as Blob;
    };


    const uploadToSupabase = async (pdfBlob: Blob) => {
        if (!file) return;

        const user = (await supabase.auth.getUser()).data.user;
        if (!user) throw new Error("Not authenticated");

        // Sanitize filename (remove spaces, special chars)
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const fileName = `${Date.now()}_${safeName}.pdf`;
        const filePath = `${user.id}/${fileName}`;

        // Upload file to Supabase Storage
        const { error: storageError } = await supabase.storage
            .from("Documents")
            .upload(filePath, pdfBlob, { contentType: "application/pdf" });

        if (storageError) throw storageError;

        // Generate signed URL (valid for 7 days)
        const { data: signedData, error: signedError } = await supabase.storage
            .from("Documents")
            .createSignedUrl(filePath, 60 * 60 * 24 * 7);

        if (signedError) throw signedError;

        // Insert metadata into Postgres table
        const { error: insertError } = await supabase.from("documents").insert([
            {
                user_id: user.id,
                type: selectedType,
                file_url: filePath, // store exact storage path
                status: "pending",
                submitted_at: new Date().toISOString(),
            },
        ]);

        if (insertError) throw insertError;

        return signedData.signedUrl;
    };


    const handleSubmit = async () => {
        setError(null);
        if (!file) {
            setError("Please upload a file");
            return;
        }
        if (!selectedType) {
            setError("Please select a document type");
            return;
        }

        setLoading(true);
        try {
            const canvas = await processImageWithOpenCV(file);
            const pdfBlob = generatePDF(canvas);
            await uploadToSupabase(pdfBlob);
            await fetchRecentDocs();
            setFile(null);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentDocs = async () => {
        const { data, error } = await supabase
            .from("documents")
            .select("*")
            .order("submitted_at", { ascending: false })
            .limit(5);

        if (!error && data) {
            // Create signed URLs for each doc
            const signedDocs = await Promise.all(
                data.map(async (doc) => {
                    const { data: signed, error: signErr } = await supabase.storage
                        .from("Documents")
                        .createSignedUrl(doc.file_url, 60 * 60 * 24 * 7); // 7 days

                    return {
                        ...doc,
                        signed_url: signErr ? null : signed?.signedUrl,
                    };
                })
            );
            setRecentDocs(signedDocs as any);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-4">Upload Document</h2>

            {/* Document Type Selector */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {["Proof of Identity", "Proof of Residence", "Additional Documents"].map(
                    (type) => (
                        <div
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`cursor-pointer p-4 border rounded-lg text-center ${selectedType === type ? "border-blue-500 bg-blue-50" : "border-gray-300"
                                }`}
                        >
                            {type}
                        </div>
                    )
                )}
            </div>

            {/* File Input */}
            <div className="border-2 border-dashed p-6 text-center mb-4">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="fileInput"
                />
                <label htmlFor="fileInput" className="cursor-pointer text-blue-600">
                    {file ? file.name : "Click to upload or drag and drop"}
                </label>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {/* Hidden Canvas for OpenCV */}
            <canvas ref={canvasRef} style={{ display: "none" }} />

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? "Processing..." : "Upload Document"}
            </button>

            {/* Recently Uploaded */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Recently Uploaded</h3>
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
            </div>
        </div>
    );
}
