// models/documents.js
import { supabase } from "../supabaseClient.js"; // your supabase client

// Get a single document by ID
export async function getDocumentById(req, res) {
  const { id } = req.params;

  const { data: doc, error } = await supabase
    .from("documents")
    .select("*")
    .eq("document_id", id)
    .single();

  if (error || !doc) {
    return res.status(404).json({ error: "Document not found" });
  }

  // Create signed URL (valid 1 hour)
  const { data: signed, error: signedError } = await supabase.storage
    .from("userDocuments")
    .createSignedUrl(doc.file_url, 60 * 60);

  if (signedError) {
    return res.status(500).json({ error: signedError.message });
  }

  res.json({
    ...doc,
    fileUrl: signed?.signedUrl || "",
  });
}

// Update status (approve/reject)
export async function updateDocumentStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const { data, error } = await supabase
    .from("documents")
    .update({ status })
    .eq("document_id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Re-generate signed URL so frontend doesn’t break
  const { data: signed } = await supabase.storage
    .from("userDocuments")
    .createSignedUrl(data.file_url, 60 * 60);

  res.json({
    ...data,
    fileUrl: signed?.signedUrl || "",
  });
}
