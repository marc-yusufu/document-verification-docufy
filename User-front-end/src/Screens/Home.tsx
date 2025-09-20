import { useState, useEffect } from "react";
import MainHeader from "../components/mainHeader";
import { useNavigate } from "react-router-dom";
import { supabase } from "../Authentication/supabaseconfig";
import { Menubar } from "radix-ui";
import {
	CheckIcon,
	ChevronRightIcon,
	DotFilledIcon,
} from "@radix-ui/react-icons";
import { FaFilter } from "react-icons/fa6";
import "./radixStyles.css";

type DocumentStatus = "Verified" | "Pending" | "Not verified" | "Fraud detected";

interface Document {
  document_id: string;
  type: string;
  file_name: string;
  file_path: string; // path in storage
  status: DocumentStatus;
  signed_url?: string;
  submitted_at: Date; 
  signed_file_url: string;
}

const BUCKET_ID = "userDocuments"; // 👈 must match Supabase bucket

const statusStyles: Record<DocumentStatus, { color: string; icon: string }> = {
  "Verified": { color: "text-green-700", icon: "/IconPac/shield-trust.png" },
  "Pending": { color: "text-yellow-700", icon: "/IconPac/circle-dashed.png" },
  "Not verified": { color: "text-gray-700", icon: "/IconPac/cross-circle.png" },
  "Fraud detected": { color: "text-red-700", icon: "/IconPac/exclamation.png" },
};

export default function Home() {
  const [docs, setDocs] = useState<Document[]>([])
  const [query, setQuery] = useState("");
  const [progress, setProgress] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("All");
  const navigate = useNavigate();

  // Fetch documents from Supabase
  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("documents")
        .select("document_id, file_name, type, file_path, status, submitted_at, signed_file_url")
        .order("submitted_at", { ascending: false });

      if (error) {
        console.error("Error fetching documents:", error);
        setLoading(false);
        return;
      }

      if(!data){
        setDocs([]);
        setDocuments([])
        setLoading(false);
        return;
      }

      setDocs(data);

      // Sign each file_url from storage
      const withUrls = await Promise.all(
        data.map(async (doc) => {
          const { data: urlData, error: urlError } = await supabase.storage
            .from(BUCKET_ID)
            .createSignedUrl(doc.file_path, 30 * 24 * 60 * 60); // 30-days expiry

          if (urlError) {
            console.error("Signed URL error:", doc.file_path, urlError.message);
          }

          return { ...doc, signed_url: urlData?.signedUrl || "" };
        })
      );

      setDocuments(withUrls as any);
      setLoading(false);
    };

    fetchDocs();
  }, []);

  const filteredDocs = documents.filter((doc) =>{
    const matchesSearch = doc.file_name.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = filter === "All" ? true : doc.status === filter;
    return matchesSearch && matchesStatus
  });

  const pendingDoc = documents.find((doc) => doc.status === "Pending");

  useEffect(() => {
    if (!pendingDoc || !isTracking) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 10);
        return next >= 100 ? 100 : next;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [pendingDoc, isTracking]);

  const handleUploadClick = () => {
    navigate("/upload");
  };

  const startTracking = () => {
    setProgress(0);
    setIsTracking(true);
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <MainHeader />

      {/* Search & Upload */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center border border-gray-300 rounded-full px-4 py-2 w-full max-w-md bg-white shadow-sm">
          <img src="/IconPac/search (2).png" alt="Search" className="w-4 h-4" />
          <input
            type="text"
            placeholder="Search documents..."
            className="ml-2 flex-1 outline-none text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* filter by file status */}
        <Menubar.Root className="MenubarRoot">
          <Menubar.Menu>
            <Menubar.Trigger className="MenubarTrigger">
              {filter}
              <FaFilter />
            </Menubar.Trigger>
            <Menubar.Portal>
              <Menubar.Content
                className="MenubarContent"
                align="start"
                sideOffset={5}
                alignOffset={-3}
              >
                <Menubar.Item 
                  className={`MenubarItem ${filter === "All" ? "bg-gray-200" : ""}`}
                  onSelect={() => setFilter("All")}>
                  All
                </Menubar.Item>
                <Menubar.Item 
                  className={`MenubarItem ${filter === "Pending" ? "bg-gray-200" : ""}`}
                  onSelect={()=> setFilter("pending")}>
                  Pending
                </Menubar.Item>
                <Menubar.Item 
                  className={`MenubarItem ${filter === "Approved" ? "bg-gray-200" : ""}`}
                  onSelect={()=> setFilter("Approved")}>
                  Verified 
                </Menubar.Item>
                <Menubar.Item 
                  className={`MenubarItem ${filter === "Rejected" ? "bg-gray-200" : ""}`}
                  onSelect={()=> setFilter("Rejected")}>
                  Rejected
                </Menubar.Item>
              </Menubar.Content>
            </Menubar.Portal>
          </Menubar.Menu>
        </Menubar.Root>



        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition shadow"
          onClick={handleUploadClick}
        >
          Upload
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Document Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[500px] pr-2 flex-1">
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
              <div
                key={doc.document_id}
                className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col items-center shadow-sm hover:shadow-md transition"
              >
                {/* Thumbnail or Icon */}
                {/\.(png|jpe?g)$/i.test(doc.file_path) ? (
                  <img
                    src={doc.signed_url }
                    alt={doc.type}
                    className="w-20 h-20 object-cover rounded-lg mb-2"
                  />
                ) : (
                  <div className="text-5xl">📄</div>
                )}

                {/* Document type */}
                <div className="text-sm text-center mt-2 font-medium text-gray-800">
                  {doc.file_name}
                </div>

                {/* Status */}
                <div
                  className={`text-xs mt-1 flex items-center gap-1 ${statusStyles[doc.status]?.color || "text-gray-500"
                    }`}
                >
                  <img
                    src={statusStyles[doc.status]?.icon || "/IconPac/question.png"}
                    alt={doc.status}
                    className="w-4 h-4"
                  />
                  {doc.status}
                </div>

                {/* Actions */}
                <div className="flex mt-3 gap-2">
                  <a
                    href={doc.signed_url }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center bg-blue-600 text-white text-xs px-3 py-1 rounded shadow hover:bg-blue-700 transition"
                  >
                    <img
                      src="/IconPac/download (1).png"
                      alt="Download"
                      className="w-3 h-3 inline-block mr-1"
                    />
                    Download
                  </a>
                  <button className="flex items-center text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 transition">
                    <img
                      src="/IconPac/share.png"
                      alt="Share"
                      className="w-4 h-4"
                    />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Progress Tracker */}
        {pendingDoc && (
          <div className="bg-blue-50 border border-blue-300 rounded-2xl p-5 w-full h-40 max-w-sm shadow-sm">
            <h3 className="text-blue-900 font-semibold mb-2">
              Tracking Document
            </h3>
            <div className="text-sm mb-2 text-blue-900 font-medium">
              {pendingDoc.type}
            </div>

            <div className="w-full bg-blue-100 h-3 rounded-full overflow-hidden mb-1">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-blue-800 mb-2">{progress}% complete</div>

            {!isTracking && (
              <button
                className="bg-blue-600 text-white px-4 py-1 text-xs rounded hover:bg-blue-700 transition"
                onClick={startTracking}
              >
                Start Tracking
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
