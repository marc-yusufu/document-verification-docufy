// DocumentUpload.tsx
import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../Authentication/supabaseconfig";
import { useLocation } from "react-router-dom";
import MainHeader from "../components/mainHeader";
import AffidavitForm from "../components/AffidavitForm";

const BUCKET_ID = "userDocuments";
const MAX_FILE_BYTES = 120 * 1024 * 1024; // 120 MB

interface UploadedDoc {
    document_id: string;
    user_id: string;
    file_name: string;
    type: string;
    file_path: string;
    submitted_at: string;
    code_id?: string;
    status: string;
    branch_assigned?: string | null;
    comments?: string | null;
    signed_url?: string | null;
    signed_file_url?: string | null;
}

interface Branch {
    branch_id: string;
    name: string;
    latitude: number | null;
    longitude: number | null;
}

export default function DocumentUpload(): JSX.Element {
    const [selectedType, setSelectedType] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [recentDocs, setRecentDocs] = useState<UploadedDoc[]>([]);
    const [error, setError] = useState<string>("");
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [nearestBranch, setNearestBranch] = useState<{ id: string; name: string; distanceKm: number } | null>(null);
    const [locating, setLocating] = useState<boolean>(true);
    const [locationError, setLocationError] = useState<string>("");

    const [previewFile, setPreviewFile] = useState<UploadedDoc | null>(null);

    // affidavit modal toggle
    const location = useLocation();
    const openAffidavit = (location as any).state?.openAffidavit;
    const [showAffidavit, setShowAffidavit] = useState(false);

    // Haversine - distance in km
    function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
        const R = 6371; // Earth radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // in km
    }

    // Generate code
    function generateCode(length = 16): string {
        const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        const randomValues = new Uint32Array(length);
        crypto.getRandomValues(randomValues);
        for (let i = 0; i < length; i++) {
            result += charset[randomValues[i] % charset.length];
        }
        return result;
    }

    // Find nearest branch given coordinates
    const findNearestBranch = useCallback(
        async (lat: number, lon: number) => {
            try {
                const { data: branchesData, error: branchError } = await supabase
                    .from("branches")
                    .select("branch_id, name, latitude, longitude");

                if (branchError) {
                    console.warn("Failed to fetch branches:", branchError);
                    setNearestBranch(null);
                    return null;
                }

                const branches = (branchesData ?? []) as Branch[];
                if (!branches.length) {
                    setNearestBranch(null);
                    return null;
                }

                let best: Branch | null = null;
                let minDist = Infinity;

                for (const b of branches) {
                    if (b.latitude == null || b.longitude == null) continue;
                    const d = calculateDistance(lat, lon, b.latitude, b.longitude);
                    if (d < minDist) {
                        minDist = d;
                        best = b;
                    }
                }

                if (!best) {
                    setNearestBranch(null);
                    return null;
                }

                const nb = { id: best.branch_id, name: best.name, distanceKm: minDist };
                setNearestBranch(nb);
                return nb;
            } catch (err) {
                console.error("findNearestBranch error:", err);
                setNearestBranch(null);
                return null;
            }
        },
        []
    );

    // Request/obtain geolocation once and persist to DB (non-blocking)
    const requestLocation = useCallback(() => {
        if (!("geolocation" in navigator)) {
            setLocationError("Geolocation not supported by this browser.");
            setLocating(false);
            return;
        }

        setLocating(true);
        setLocationError("");

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setUserLocation({ lat: latitude, lon: longitude });
                setLocating(false);
                // update user's lat/lon in your users table (best-effort, non-blocking)
                try {
                    const { data: userData } = await supabase.auth.getUser();
                    const user = (userData as any)?.user;
                    if (user) {
                        await supabase
                            .from("users")
                            .update({ latitude, longitude })
                            .eq("user_id", user.id);
                    }
                } catch (upErr) {
                    console.warn("Failed to persist user location:", upErr);
                }

                // set nearest branch once we have coords
                await findNearestBranch(latitude, longitude);
            },
            (err) => {
                console.warn("Geolocation error:", err);
                setLocationError(err?.message ?? "Unable to get location. Please allow location access.");
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [findNearestBranch]);

    useEffect(() => {
        requestLocation();
    }, [requestLocation]);

    useEffect(() => {
        if (openAffidavit) {
            setShowAffidavit(true);
        }
    }, [openAffidavit]);

    useEffect(() => {
        fetchRecentDocs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Upload & assign nearest branch
    const uploadToSupabase = useCallback(
        async (f: File) => {
            if (!f) throw new Error("No file provided");
            if (f.size > MAX_FILE_BYTES) throw new Error("File too large. Max allowed size is 120 MB.");

            const { data: userData, error: userError } = await supabase.auth.getUser();
            const user = (userData as any)?.user;
            if (userError || !user) throw new Error("Not authenticated");

            // Ensure we have user coordinates and nearest branch (try computing if missing)
            if (!userLocation) {
                throw new Error("Location not available. Please allow location access before uploading.");
            }

            let branchId = nearestBranch?.id ?? null;
            if (!branchId) {
                const computed = await findNearestBranch(userLocation.lat, userLocation.lon);
                branchId = computed?.id ?? null;
            }

            // upload to storage
            const code = generateCode();
            const ext = f.name.split(".").pop() ?? "bin";
            const safeType = selectedType ? selectedType.replace(/\s+/g, "_") : "document";
            const fileName = `${Date.now()}_${safeType}.${ext}`;
            const filePath = `${user.id}/${fileName}`;

            const { data: uploadData, error: storageError } = await supabase.storage
                .from(BUCKET_ID)
                .upload(filePath, f, { contentType: f.type, cacheControl: "3600", upsert: false });

            if (storageError) {
                throw storageError;
            }

            // insert into documents table
            const insertPayload = {
                user_id: user.id,
                file_name: f.name,
                type: selectedType,
                file_path: filePath,
                status: "Pending",
                submitted_at: new Date().toISOString(),
                code_id: code,
                branch_assigned: branchId,
                comments: null,
            };

            const { data: insertData, error: insertError } = await supabase.from("documents").insert([insertPayload]);

            if (insertError) {
                // Attempt to clean up the uploaded file if DB insert fails
                try {
                    await supabase.storage.from(BUCKET_ID).remove([filePath]);
                } catch (cleanupErr) {
                    console.warn("Failed to remove uploaded file after DB insert error:", cleanupErr);
                }
                throw insertError;
            }

            return { uploaded: uploadData, inserted: insertData };
        },
        [selectedType, userLocation, nearestBranch, findNearestBranch]
    );

    // Fetch recent docs for preview
    async function fetchRecentDocs() {
        try {
            const { data: userData } = await supabase.auth.getUser();
            const user = (userData as any)?.user;
            if (!user) return;

            const { data, error } = await supabase
                .from("documents")
                .select("*")
                .eq("user_id", user.id)
                .order("submitted_at", { ascending: false })
                .limit(5);

            if (error) throw error;

            const signedDocs = await Promise.all(
                (data ?? []).map(async (doc: any) => {
                    let signed_url: string | null = null;
                    try {
                        if (doc.file_path) {
                            const { data: signed, error: signedErr } = await supabase.storage
                                .from(BUCKET_ID)
                                .createSignedUrl(doc.file_path, 60 * 60 * 24 * 7);
                            if (!signedErr) signed_url = (signed as any)?.signedUrl ?? null;
                        }
                    } catch {
                        signed_url = null;
                    }
                    return { ...doc, signed_file_url: signed_url, signed_url } as UploadedDoc;
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
        if (!file && !selectedType) {
            setError("*Select a file and type*");
            return;
        }
        if (!file) {
            setError("*No file selected*");
            return;
        }
        if (!selectedType) {
            setError("*Select the type above*");
            return;
        }
        if (!userLocation) {
            setError("Location is required. Please allow location access so we can assign the nearest branch.");
            return;
        }

        setLoading(true);
        try {
            await uploadToSupabase(file);
            // optional: send to your server for additional processing (non-blocking)
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
            await fetchRecentDocs();
            alert(`File uploaded successfully! Assigned to ${nearestBranch?.name ?? "nearest branch"}`);
        } catch (err: any) {
            console.error("Upload failed:", err);
            setError("Upload failed: " + (err?.message ?? String(err)));
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
            <MainHeader />
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-8 py-4">
                    <h1 className="text-3xl font-bold mb-6">Upload File</h1>

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
                                    <div className="text-sm text-gray-600">Max 120 MB (PNG, JPEG, PDF)</div>
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
                                            Selected: <b>{file.name}</b> • {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* File Type */}
                            <h2 className="text-xl font-semibold mt-8 mb-4">File Type</h2>

                            {/* Location / Nearest branch info */}
                            <div className="mb-3">
                                {locating ? (
                                    <p className="text-sm text-gray-500">
                                        Detecting your location...{" "}
                                        <button
                                            onClick={requestLocation}
                                            className="ml-2 underline text-blue-600"
                                            type="button"
                                        >
                                            Retry
                                        </button>
                                    </p>
                                ) : locationError ? (
                                    <p className="text-sm text-red-500">
                                        Location error: {locationError}{" "}
                                        <button
                                            onClick={requestLocation}
                                            className="ml-2 underline text-blue-600"
                                            type="button"
                                        >
                                            Try again
                                        </button>
                                    </p>
                                ) : nearestBranch ? (
                                    <p className="text-sm text-gray-500">
                                        Nearest branch detected: <b>{nearestBranch.name}</b> —{" "}
                                        {nearestBranch.distanceKm.toFixed(2)} km away
                                    </p>
                                ) : (
                                    <p className="text-sm text-gray-500">No branches available to assign.</p>
                                )}
                            </div>

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
                                        className={`relative border rounded-lg p-5 min-h-[200px] cursor-pointer ${selectedType === card.label ? "ring-2 ring-blue-400" : "border-gray-300"
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

                            {error && <div className="text-center text-red-500 italic mt-4">{error}</div>}

                            {/* Buttons */}
                            <div className="flex items-center justify-between mt-8 gap-6 flex-wrap">
                                <div className="flex gap-4">
                                    <button
                                        onClick={cancelUpload}
                                        className="px-6 py-2 rounded-2xl w-32 bg-red-500 text-white hover:bg-red-600"
                                        type="button"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading || locating || !userLocation}
                                        className={`px-6 py-2 rounded-2xl w-44 text-white ${loading || locating || !userLocation ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                                        type="button"
                                        title={locating ? "Waiting for location..." : !userLocation ? "Location required" : ""}
                                    >
                                        {loading ? "Uploading..." : "Submit"}
                                    </button>
                                </div>
                                <div>
                                    <button
                                        onClick={() => setShowAffidavit((s) => !s)}
                                        className="px-6 py-2 rounded-2xl w-42 bg-green-600 text-white hover:bg-green-700"
                                        type="button"
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
                                    {recentDocs.length === 0 && <li className="text-sm text-gray-400">No uploads</li>}
                                    {recentDocs.map((d) => (
                                        <li
                                            key={d.document_id}
                                            className="flex items-start gap-3 p-3 bg-white border rounded cursor-pointer"
                                            onClick={() => setPreviewFile(d)}
                                        >
                                            <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center">📄</div>
                                            <div className="text-sm">
                                                <div className="font-medium">{d.file_name}</div>
                                                <div className="text-xs text-gray-500">{new Date(d.submitted_at).toLocaleString()}</div>
                                            </div>
                                            <div className="ml-auto text-xs text-blue-600">{d.signed_file_url ? "View" : "No preview"}</div>
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
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold">Make Affidavit</h2>
                            <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowAffidavit(false)}>
                                ✖
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Fill out the form below to create a new affidavit.</p>

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
        </div>
    );
}
