// src/context/PdfContext.tsx
import React, { createContext, useState, useContext } from "react";

type DocumentStatus = "verified" | "checking" | "Not verified" | "Fraud detected";

interface UploadedDocument{
    id: string;
    name: string;
    status: DocumentStatus;
    pdfDataUrl: string;
}

type PdfContextType = {
    pdfDataUrl: string | null;
    setPdfDataUrl: (dataUrl: string | null) => void;
    documents: UploadedDocument[];
    addOrUpdateDocument: (doc: UploadedDocument) => void;
};

const PdfContext = createContext<PdfContextType | undefined>(undefined);

export const PdfProvider = ({ children }: { children: React.ReactNode }) => {
    const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
    const [documents, setDocuments] = useState<UploadedDocument[]>([]);

    const addOrUpdateDocument = (newDoc: UploadedDocument) => {
        setDocuments((prevDocs) => {
        const existingIndex = prevDocs.findIndex(doc => doc.name === newDoc.name);

        if (existingIndex !== -1) {
            const updated = [...prevDocs];
            updated[existingIndex] = newDoc;
            return updated;
        }

        return [...prevDocs, newDoc];
        });
  };

  return (
    <PdfContext.Provider value={{ pdfDataUrl, setPdfDataUrl, documents, addOrUpdateDocument }}>
      {children}
    </PdfContext.Provider>
  );
};

export const usePdf = () => {
  const context = useContext(PdfContext);
  if (!context) {
    throw new Error("usePdf must be used within a PdfProvider");
  }
  return context;
};
