import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const BUCKET_ID = "userDocuments";

const statusStyles: Record<DocumentStatus, { color: string; icon: string }> = {
  Verified: { color: "text-green-700", icon: "/IconPac/shield-trust.png" },
  Pending: { color: "text-yellow-700", icon: "/IconPac/circle-dashed.png" },
  "Not verified": { color: "text-gray-700", icon: "/IconPac/cross-circle.png" },
  "Fraud detected": { color: "text-red-700", icon: "/IconPac/exclamation.png" },
};

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
  useEffect(() => {
    let mounted = true;
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("documents")
          .select(
            "document_id, file_name, type, file_path, status, submitted_at, signed_file_url"
          )
          .order("submitted_at", { ascending: false });

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
          })
        );

        if (!mounted) return;
        setDocuments(withUrls);
      } catch (err: any) {
        console.error("fetchDocs error:", err.message || err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDocs();
    return () => {
      mounted = false;
    };
  }, []);

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
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <MainHeader />

      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-4 relative">
        <button onClick={() => navigate("/upload")} className="flex items-center gap-2 border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-full hover:bg-blue-600 hover:text-white transition">
          <IonIcon icon={cloudUploadOutline} className="text-lg" />
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
        </div>
      )}
    </div>
  );
}
