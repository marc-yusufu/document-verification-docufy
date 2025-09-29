import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< Updated upstream
import { supabase } from "../Authentication/supabaseconfig";
import DocumentPreview from "../components/DocumentPreview";
import ProgressTracker from "../components/ProgressTracker";
import DocumentCard from "../components/DocumentCard";
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
=======
>>>>>>> Stashed changes
import { Menubar } from "radix-ui"; // keep whatever you already use; adjust if you use @radix-ui/react-menubar
import "./radixStyles.css";
>>>>>>> Stashed changes

type DocumentStatus = "Verified" | "Pending" | "Not verified" | "Fraud detected";

export interface Document {
  document_id: string;
  type: string;
  file_url: string;
  status: DocumentStatus;
  signed_url?: string;
  submitted_at?: string;
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  branch?: string;
  submitted_by?: string;
  comments?: string;
=======
  signed_file_url?: string;
>>>>>>> Stashed changes
=======
  signed_file_url?: string;
>>>>>>> Stashed changes
  title?: string;
}

=======
import MainHeader from "../components/mainHeader";
import DocumentCard from "../components/DocumentCard";
import { IonIcon } from "@ionic/react";
import {
  filterOutline,
  listOutline,
  gridOutline,
  menuOutline,
  cloudUploadOutline,
  documentTextOutline,
  trashOutline,
  closeOutline,
  navigate,
} from "ionicons/icons";
import { supabase } from "../Authentication/supabaseconfig";
import { Document, DocumentStatus } from "../Screens/types";

>>>>>>> Stashed changes
const BUCKET_ID = "userDocuments";

const statusStyles: Record<DocumentStatus, { color: string; icon: string }> = {
  Verified: { color: "text-green-700", icon: "/IconPac/shield-trust.png" },
  Pending: { color: "text-yellow-700", icon: "/IconPac/circle-dashed.png" },
  "Not verified": { color: "text-gray-700", icon: "/IconPac/cross-circle.png" },
  "Fraud detected": { color: "text-red-700", icon: "/IconPac/exclamation.png" },
};

<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
export default function Home() {
  const [query, setQuery] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [progress, setProgress] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const navigate = useNavigate();

=======
export default function Home(): JSX.Element {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<DocumentStatus | "All">("All");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [progress, setProgress] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch documents and build signed URLs
>>>>>>> Stashed changes
=======
export default function Home(): JSX.Element {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<DocumentStatus | "All">("All");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [progress, setProgress] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch documents and build signed URLs
>>>>>>> Stashed changes
=======
export default function Home(): JSX.Element {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<string>("All");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  // Fetch documents with signed URLs
>>>>>>> Stashed changes
  useEffect(() => {
    let mounted = true;
    const fetchDocs = async () => {
      setLoading(true);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      const { data, error } = await supabase
        .from("documents")
        .select(
          "document_id, type, file_url, status, submitted_at, branch_assigned, verified_by, Comments"
        )
        .order("submitted_at", { ascending: false });
=======
=======
>>>>>>> Stashed changes
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
=======
      try {
        const { data, error } = await supabase
>>>>>>> Stashed changes
          .from("documents")
          .select(
            "document_id, file_name, type, file_path, status, submitted_at, signed_file_url"
          )
          .order("submitted_at", { ascending: false });
<<<<<<< Updated upstream
<<<<<<< Updated upstream

        if (fetchError) throw fetchError;
>>>>>>> Stashed changes

=======

        if (fetchError) throw fetchError;

>>>>>>> Stashed changes
        const rows = (data ?? []) as any[];

        // create signed URLs for docs with file_path
        const withUrls = await Promise.all(
          rows.map(async (r) => {
            const filePath = r.file_path || r.signed_file_url || "";
            let signedUrl = "";
            if (filePath) {
              try {
                const { data: urlData, error: urlError } = await supabase.storage
                  .from(BUCKET_ID)
                  .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 days
                if (urlError) {
                  console.warn("createSignedUrl error for", filePath, urlError.message);
                } else {
                  signedUrl = urlData?.signedUrl ?? "";
                }
              } catch (e) {
                console.warn("createSignedUrl thrown for", filePath, e);
              }
            }

            const doc: Document = {
              document_id: r.document_id,
              type: r.type ?? r.file_name ?? "Document",
              file_name: r.file_name ?? r.document_id,
              file_path: r.file_path ?? r.signed_file_url ?? "",
              status: (r.status as DocumentStatus) ?? "Pending",
              signed_url: signedUrl,
              submitted_at: r.submitted_at ?? undefined,
              signed_file_url: r.signed_file_url ?? undefined,
              title: r.type ?? r.file_name ?? undefined,
            };
            return doc;
=======

        if (error) throw error;

        const rows = (data ?? []) as any[];
        const withUrls = await Promise.all(
          rows.map(async (r) => {
            let signed = "";
            if (r.file_path) {
              try {
                const { data: urlData } = await supabase.storage
                  .from(BUCKET_ID)
                  .createSignedUrl(r.file_path, 60 * 60 * 24 * 7);
                signed = urlData?.signedUrl ?? "";
              } catch {
                // ignore signing errors
              }
            }
            return {
              ...r,
              signed_url: signed,
              submitted_at: r.submitted_at
                ? new Date(r.submitted_at).toISOString()
                : undefined,
            } as Document;
>>>>>>> Stashed changes
          })
        );

        if (!mounted) return;
        setDocuments(withUrls);
<<<<<<< Updated upstream
        if (withUrls.length > 0) setSelectedDoc(withUrls[0]);
      } catch (err: any) {
        console.error("Error fetching documents:", err);
        if (mounted) setError(err.message || "Failed to fetch documents.");
      } finally {
        if (mounted) setLoading(false);
      }
<<<<<<< Updated upstream
<<<<<<< Updated upstream

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
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
      } catch (err: any) {
        console.error("fetchDocs error:", err.message || err);
      } finally {
        if (mounted) setLoading(false);
      }
>>>>>>> Stashed changes
    };

    fetchDocs();
    return () => {
      mounted = false;
    };
  }, []);

<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  const filteredDocs = documents.filter((d) =>
    d.type.toLowerCase().includes(query.toLowerCase())
  );

=======
  // Filter + search
  const filteredDocs = documents.filter((d) => {
    const matchesSearch = query.trim() === "" ? true : (d.type ?? d.file_name ?? "").toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "All" ? true : d.status === filter;
    return matchesSearch && matchesFilter;
  });

  // Pending doc for tracker (first pending)
>>>>>>> Stashed changes
  const pendingDoc = documents.find((d) => d.status === "Pending");

  // Simulated progress when tracking
  useEffect(() => {
    if (!pendingDoc || !isTracking) return;
<<<<<<< Updated upstream
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + Math.floor(Math.random() * 12)));
    }, 700);
    return () => clearInterval(interval);
  }, [pendingDoc, isTracking]);

  const handleUploadClick = () => navigate("/upload");
=======
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.floor(Math.random() * 12) + 3; // ensure progress
        return next >= 100 ? 100 : next;
      });
    }, 700);
    return () => clearInterval(id);
  }, [pendingDoc, isTracking]);

>>>>>>> Stashed changes
=======
  // Filter + search
  const filteredDocs = documents.filter((d) => {
    const matchesSearch = query.trim() === "" ? true : (d.type ?? d.file_name ?? "").toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "All" ? true : d.status === filter;
    return matchesSearch && matchesFilter;
  });

  // Pending doc for tracker (first pending)
  const pendingDoc = documents.find((d) => d.status === "Pending");

  // Simulated progress when tracking
  useEffect(() => {
    if (!pendingDoc || !isTracking) return;
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.floor(Math.random() * 12) + 3; // ensure progress
        return next >= 100 ? 100 : next;
      });
    }, 700);
    return () => clearInterval(id);
  }, [pendingDoc, isTracking]);

>>>>>>> Stashed changes
  const startTracking = () => {
    setProgress(0);
    setIsTracking(true);
=======
  // Derived filtered list
  const filteredDocs = documents.filter((doc) => {
    return filter === "All" ? true : doc.status === filter;
  });

  // Selection helpers
  const isSelected = (id: string) => selectedIds.includes(id);
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filteredDocs.map((d) => d.document_id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Delete selected
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const ok = window.confirm(
      `Delete ${selectedIds.length} selected file(s)? This cannot be undone.`
    );
    if (!ok) return;

    setIsDeleting(true);
    try {
      const selectedDocs = documents.filter((d) =>
        selectedIds.includes(d.document_id)
      );
      const filePaths = selectedDocs
        .map((d) => d.file_path)
        .filter(Boolean) as string[];

      if (filePaths.length > 0) {
        await supabase.storage.from(BUCKET_ID).remove(filePaths);
      }

      const { error } = await supabase
        .from("documents")
        .delete()
        .in("document_id", selectedIds);
      if (error) throw error;

      setDocuments((prev) =>
        prev.filter((d) => !selectedIds.includes(d.document_id))
      );
      setSelectedIds([]);
      setShowOptionsMenu(false);
    } catch (err: any) {
      console.error("Delete error:", err);
      alert("Failed to delete selected files: " + (err?.message ?? err));
    } finally {
      setIsDeleting(false);
    }
>>>>>>> Stashed changes
  };

  const handleUploadClick = () => navigate("/upload");

  const handleSelectDoc = (doc: Document) => {
    setSelectedDoc(doc);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <MainHeader />

<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      {/* Search & Upload row */}
=======
      {/* Search + Filter + Upload */}
>>>>>>> Stashed changes
=======
      {/* Search + Filter + Upload */}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======

        <Menubar.Root className="MenubarRoot">
          <Menubar.Menu>
            <Menubar.Trigger className="MenubarTrigger">Filter</Menubar.Trigger>
            <Menubar.Portal>
              <Menubar.Content className="MenubarContent">
                {(["All", "Pending", "Verified", "Not verified", "Fraud detected"] as const).map((s) => (
                  <Menubar.Item
                    key={s}
                    className="MenubarItem"
                    onSelect={() => setFilter(s as any)}
                  >
                    {s}
                  </Menubar.Item>
                ))}
              </Menubar.Content>
            </Menubar.Portal>
          </Menubar.Menu>
        </Menubar.Root>

<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        <button
          onClick={handleUploadClick}
          className="ml-auto md:ml-0 bg-blue-600 text-white px-6 py-2 rounded-full shadow hover:bg-blue-700"
        >
=======
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-4 relative">
        <button onClick={() => navigate("/upload")} className="flex items-center gap-2 border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-full hover:bg-blue-600 hover:text-white transition">
          <IonIcon icon={cloudUploadOutline} className="text-lg" />
>>>>>>> Stashed changes
          Upload
        </button>

        <button
          onClick={() => { navigate("/upload", { state: { openAffidavit: true } }); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-800 transition"
        >
          <IonIcon icon={documentTextOutline} className="text-lg" />
          Affidavit
        </button>

        <div className="flex items-center gap-3 ml-auto w-full md:w-auto relative">
          {/* Filter dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-100 transition"
              onClick={() => setShowFilterMenu((s) => !s)}
            >
              <IonIcon icon={filterOutline} />
              Filter
            </button>

            {showFilterMenu && (
              <div className="absolute mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-md w-40 z-20">
                {[
                  "All",
                  "Verified",
                  "Pending",
                  "Not verified",
                  "Fraud detected",
                ].map((status) => (
                  <button
                    key={status}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${filter === status ? "bg-blue-50" : ""
                      }`}
                    onClick={() => {
                      setFilter(status);
                      setShowFilterMenu(false);
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View toggles */}
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-full border ${viewMode === "list"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            onClick={() => setViewMode("list")}
          >
            <IonIcon icon={listOutline} />
            List
          </button>

          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-full border ${viewMode === "grid"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            onClick={() => setViewMode("grid")}
          >
            <IonIcon icon={gridOutline} />
            Grid
          </button>

          {/* Options dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-100 transition"
              onClick={() => setShowOptionsMenu((s) => !s)}
            >
              <IonIcon icon={menuOutline} />
              Options {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
            </button>

            {showOptionsMenu && (
              <div className="absolute mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-md w-48 z-20">
                <button
                  className={`flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 ${selectedIds.length === 0
                    ? "opacity-60 pointer-events-none"
                    : ""
                    }`}
                  onClick={handleDeleteSelected}
                >
                  <IonIcon icon={trashOutline} />
                  Delete Selected ({selectedIds.length})
                </button>

                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => {
                    selectAllVisible();
                    setShowOptionsMenu(false);
                  }}
                >
                  Toggle Select Visible
                </button>

                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => {
                    setSelectedIds([]);
                    setShowOptionsMenu(false);
                  }}
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

<<<<<<< Updated upstream
      <div className="flex gap-6">
<<<<<<< Updated upstream
<<<<<<< Updated upstream
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
=======
=======
>>>>>>> Stashed changes
        {/* LEFT: document cards grid */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 min-h-[520px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center text-gray-500 py-10">Loading documents...</div>
              ) : filteredDocs.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 py-10">No documents found.</div>
              ) : (
                filteredDocs.map((doc) => (
                  // Use DocumentCard if you already have it; fallback to inline card if not.
                  // I'll show inline wrapper that calls your DocumentCard (keeps your props).
                  <div
                    key={doc.document_id}
                    onClick={() => handleSelectDoc(doc)}
                    className={`cursor-pointer transition-shadow rounded-2xl p-5 flex flex-col items-center shadow-sm hover:shadow-md border ${selectedDoc?.document_id === doc.document_id ? "border-blue-400 ring-1 ring-blue-200" : "border-gray-200"} bg-white`}
                  >
                    {/* Thumbnail or icon */}
                    {/\.(png|jpe?g|gif)$/i.test(doc.file_path || doc.file_name || "") ? (
                      <img src={doc.signed_url || undefined} alt={doc.type} className="w-20 h-20 object-cover rounded-lg mb-2" />
                    ) : (
                      <div className="text-5xl mb-2">📄</div>
                    )}

                    <div className="text-sm text-center mt-2 font-medium text-gray-800">
                      {doc.file_name}
                    </div>

                    <div className={`text-xs mt-1 flex items-center gap-1 ${statusStyles[doc.status]?.color || "text-gray-500"}`}>
                      <img src={statusStyles[doc.status]?.icon || "/IconPac/question.png"} alt={doc.status} className="w-4 h-4" />
                      <span>{doc.status}</span>
                    </div>

                    <div className="flex mt-3 gap-2">
                      <a
                        href={doc.signed_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center text-xs px-3 py-1 rounded ${doc.signed_url ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-100 text-gray-500 cursor-not-allowed"}`}
                      >
                        <img src="/IconPac/download (1).png" alt="Download" className="w-3 h-3 inline-block mr-1" />
                        Download
                      </a>

                      <button className="flex items-center text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 transition">
                        <img src="/IconPac/share.png" alt="Share" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
                ))
              )}
            </div>
          </div>
        </div>

<<<<<<< Updated upstream
<<<<<<< Updated upstream
        {/* Right column: top Progress + bottom Document preview */}
        <div className="w-[360px] flex flex-col gap-6">
          {/* Progress box */}
=======
        {/* RIGHT: progress (top) + preview (bottom) */}
        <div className="w-[360px] flex flex-col gap-6">
          {/* Progress Tracker box */}
>>>>>>> Stashed changes
=======
        {/* RIGHT: progress (top) + preview (bottom) */}
        <div className="w-[360px] flex flex-col gap-6">
          {/* Progress Tracker box */}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
=======
                      <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
>>>>>>> Stashed changes
=======
                      <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
>>>>>>> Stashed changes
                    </div>
                    <div className="text-xs text-blue-700 mt-2 flex justify-between">
                      <span>Processing</span>
                      <span>{progress}%</span>
                    </div>
                    {!isTracking && (
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                      <button
                        onClick={startTracking}
                        className="mt-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs"
                      >
=======
                      <button onClick={startTracking} className="mt-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
>>>>>>> Stashed changes
=======
                      <button onClick={startTracking} className="mt-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
<<<<<<< Updated upstream
          {/* Document preview */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
=======
          {/* Preview box */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 min-h-[240px]">
>>>>>>> Stashed changes
=======
          {/* Preview box */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 min-h-[240px]">
>>>>>>> Stashed changes
            {selectedDoc ? (
              <DocumentPreview document={selectedDoc} statusStyles={statusStyles} />
            ) : (
              <div className="text-gray-500">Select a document to preview</div>
            )}
          </div>
        </div>
      </div>

      {/* Optional error notice */}
      {error && (
        <div className="max-w-7xl mx-auto mt-4 text-sm text-red-600">
          {error}
=======
      {/* Documents area */}
      <div
        className={`${viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5 justify-items-center"
          : "flex flex-col gap-4"
          } overflow-y-auto max-h-[600px] pr-2 flex-1`}
      >
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
              viewMode={viewMode}
              isSelected={isSelected(doc.document_id)}
              onToggleSelect={toggleSelect}
              onOpen={() => setPreviewDoc(doc)}
              statusStyles={statusStyles}
            />
          ))
        )}
      </div>

      {/* Preview modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-black"
              onClick={() => setPreviewDoc(null)}
            >
              <IonIcon icon={closeOutline} className="text-2xl" />
            </button>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden">
                {previewDoc.signed_url &&
                  /\.(png|jpe?g|gif)$/i.test(
                    previewDoc.file_path || previewDoc.file_name
                  ) ? (
                  <img
                    src={previewDoc.signed_url}
                    alt={previewDoc.file_name}
                    className="max-h-[400px] object-contain"
                  />
                ) : (
                  <div className="text-5xl">📄</div>
                )}
              </div>

              <div className="w-full lg:w-80 space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  {previewDoc.file_name}
                </h2>
                <p className="text-sm text-gray-500">Type: {previewDoc.type}</p>
                <p className="text-sm text-gray-500">
                  Status:{" "}
                  <span className="font-medium">{previewDoc.status}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Submitted:{" "}
                  {previewDoc.submitted_at
                    ? new Date(previewDoc.submitted_at).toLocaleString()
                    : "N/A"}
                </p>

                <a
                  href={previewDoc.signed_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Open Full
                </a>
              </div>
            </div>
          </div>
>>>>>>> Stashed changes
        </div>
      )}
    </div>
  );
}
