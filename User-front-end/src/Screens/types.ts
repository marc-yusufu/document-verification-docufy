export type DocumentStatus = "Verified" | "Pending" | "Not verified" | "Fraud detected";

export interface Document {
  document_id: string;
  type?: string;
  file_name: string;
  file_path?: string;
  status: DocumentStatus;
  signed_url?: string;
  signed_file_url?: string;
  submitted_at?: string; // keep as string for consistency across components
  submitted_by?: string;
  branch_assigned?: string;
  comments?: string;
}
