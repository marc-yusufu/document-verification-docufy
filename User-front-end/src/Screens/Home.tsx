import { useState, useEffect } from "react";
import MainHeader from "../components/mainHeader";
import { useNavigate } from "react-router-dom";
import { supabase } from "../Authentication/supabaseconfig";
import DocumentPreview from "../components/DocumentPreview";
import ProgressTracker from "../components/ProgressTracker";
import DocumentCard from "../components/DocumentCard";

type DocumentStatus = "Verified" | "Pending" | "Not verified" | "Fraud detected";

export interface Document {
  document_id: string;
  type: string;
  file_url: string;
  status: DocumentStatus;
  signed_url?: string;
  submitted_at?: string;
  branch?: string;
  submitted_by?: string;
  comments?: string;
  title?: string;
}

const BUCKET_ID = "userDocuments";

const statusStyles: Record<DocumentStatus, { color: string; icon: string }> = {
  Verified: { color: "text-green-700", icon: "/IconPac/shield-trust.png" },
  Pending: { color: "text-yellow-700", icon: "/IconPac/circle-dashed.png" },
  "Not verified": { color: "text-gray-700", icon: "/IconPac/cross-circle.png" },
  "Fraud detected": { color: "text-red-700", icon: "/IconPac/exclamation.png" },
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [progress, setProgress] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("documents")
        .select(
          "document_id, type, file_url, status, submitted_at, branch_assigned, verified_by, Comments"
        )
        .order("submitted_at", { ascending: false });

      if (error) {
        console.error("Error fetching documents:", error);
        setLoading(false);
        return;
      }

      const withUrls = await Promise.all(
        (data ?? []).map(async (doc: any) => {
          const { data: urlData, error: urlError } = await supabase.storage
            .from(BUCKET_ID)
            .createSignedUrl(doc.file_url, 60 * 60 * 24 * 7);
          if (urlError) console.warn("signed url error", urlError);
          return {
            ...doc,
            signed_url: urlData?.signedUrl || "",
            title: doc.type,
          } as Document;
        })
      );

      setDocuments(withUrls as Document[]);
      setLoading(false);
      // auto-select first document (like your mock)
      if (withUrls.length > 0) setSelectedDoc(withUrls[0] as Document);
    };

    fetchDocs();
  }, []);

  const filteredDocs = documents.filter((d) =>
    d.type.toLowerCase().includes(query.toLowerCase())
  );

  const pendingDoc = documents.find((d) => d.status === "Pending");

  useEffect(() => {
    if (!pendingDoc || !isTracking) return;
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + Math.floor(Math.random() * 12)));
    }, 700);
    return () => clearInterval(interval);
  }, [pendingDoc, isTracking]);

  const handleUploadClick = () => navigate("/upload");
  const startTracking = () => {
    setProgress(0);
    setIsTracking(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <MainHeader />

      {/* Search & Upload row */}
      <div className="flex flex-wrap items-center gap-4 my-4">
        <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200 max-w-md w-full">
          <img src="/IconPac/search (2).png" alt="search" className="w-4 h-4" />
          <input
            className="ml-3 outline-none text-sm w-full"
            placeholder="Search documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button
          onClick={handleUploadClick}
          className="ml-auto md:ml-0 bg-blue-600 text-white px-6 py-2 rounded-full shadow hover:bg-blue-700"
        >
          Upload
        </button>
      </div>

      <div className="flex gap-6">
        {/* Left big white workspace */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 min-h-[520px]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {loading ? (
                <div className="col-span-full text-center text-gray-500 py-10">
                  Loading documents...
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 py-10">
                  No documents found.
                </div>
              ) : (
                filteredDocs.map((doc) => (
                  <DocumentCard
                    key={doc.document_id}
                    doc={doc}
                    selected={selectedDoc?.document_id === doc.document_id}
                    onClick={() => setSelectedDoc(doc)}
                    statusStyles={statusStyles}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column: top Progress + bottom Document preview */}
        <div className="w-[360px] flex flex-col gap-6">
          {/* Progress box */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            {pendingDoc ? (
              <>
                <div className="flex items-start gap-3">
                  <img src="/IconPac/document.png" className="w-8 h-8" alt="doc" />
                  <div className="flex-1">
                    <div className="font-medium">{pendingDoc.title || pendingDoc.type}</div>
                    <div className="text-xs text-gray-500">Processing</div>
                  </div>
                </div>

                <div className="mt-4">
                  <ProgressTracker status={pendingDoc.status} />
                  <div className="mt-3">
                    <div className="w-full bg-blue-100 h-2 rounded-full">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-blue-700 mt-2 flex justify-between">
                      <span>Processing</span>
                      <span>{progress}%</span>
                    </div>
                    {!isTracking && (
                      <button
                        onClick={startTracking}
                        className="mt-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs"
                      >
                        Start Tracking
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">No pending documents</div>
            )}
          </div>

          {/* Document preview */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
            {selectedDoc ? (
              <DocumentPreview document={selectedDoc} statusStyles={statusStyles} />
            ) : (
              <div className="text-gray-500">Select a document to preview</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
