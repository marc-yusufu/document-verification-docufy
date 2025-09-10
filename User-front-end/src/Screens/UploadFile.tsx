import React, { useState, useEffect } from "react";
import { supabase } from "../Authentication/supabaseconfig";
import MainHeader from "../components/mainHeader";
import AffidavitForm from "../components/AffidavitForm";

const BUCKET_ID = "userDocuments";

interface UploadedDoc {
    document_id: string;
    file_name: string;
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
    const [error, setError] = useState<string>("");

    useEffect(() => {
        fetchRecentDocs();
    }, []);

    const uploadToSupabase = async (pdfBlob: Blob) => {
        try{
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData.user) throw new Error("Not authenticated");
            const user = userData.user;

            const fileName = `${Date.now()}_${selectedType.replace(/\s+/g, "_")}.pdf`;
            const fname = `${file?.name}`; //to add file name to the database
            const filePath = `${user.id}/${fileName}`; //edit format to make it a single string

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
                    file_name: fname,
                    type: selectedType,
                    file_url: filePath,
                    doc_type: "document",
                    status: "pending",
                    submitted_at: new Date().toISOString(),
                },
                
            ]);
            window.alert("File uploaded")
            if (insertError) throw insertError;
        }catch(err){
            console.log("Error uploading document to supabase: ", err)
        }

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

    const handleSubmit = async () =>{

        if(!file && !selectedType){
            setError("*Select a file and type above*");
            return;
        }
        if(!file){
            setError("*No file selected*");
            return;
        }
        if(!selectedType){
            setError("*Select the type above*");
            return;
        }
        try{

            setLoading(true);

            await uploadToSupabase(file);

            const formData = new FormData();
            formData.append("file", `${file}`);
            formData.append("typeOfFile", `${file?.type}`);

            const res = await fetch("http://localhost:5000/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            console.log("server response:", data);
            
            return data;

        }catch(err){
            console.log("Error occured. File upload failed: ", err);
            window.alert("Error occured. File upload failed")
        }finally{
            setLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow">
            <MainHeader />

            <h2 className="text-2xl font-bold mb-4">Upload Document</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

            {selectedType === "Affidavit" ? (
                <AffidavitForm onSubmit={uploadToSupabase} loading={loading} />
            ) : (
                <div className="border-2 border-dashed p-6 text-center mb-4">
                    <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        className="hidden"
                    />
                    <label htmlFor="fileInput" className="cursor-pointer text-blue-600">
                        {file ? file.name : "Click to upload or drag and drop"}
                    </label>
                    
                </div>
            )}

            <div className="flex w-full justify-center" >
                <span className="text-red-400 italic">{error}</span>
            </div>
            

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
                                    {doc.file_name && " "  || ""} 
                                    {doc.type}
                                </a>
                            ) : (
                                <span className="text-gray-500">No recently uploaded files</span>
                            )}
                            <span className="text-gray-500 text-sm ml-2">
                                {new Date(doc.submitted_at).toLocaleString()}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex w-full justify-center mt-10">
                <button
                type="submit"
                onClick={handleSubmit}
                className="
                w-[80%] bg-blue-600 text-white font-bold rounded-md 
                p-2 cursor-pointer hover:bg-blue-800 transform
                transition-transform duration-300 hover:scale-105
                shadow-md ease-out active:scale-95 active:translate-y-0.5
                hover:shadow-lg"
                >
                    Upload
                </button>
            </div>
        </div>
    );
}
