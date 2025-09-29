import React, { useState } from "react";
import { jsPDF } from "jspdf";

interface AffidavitFormProps {
    onSubmit: (pdfBlob: Blob) => Promise<void>;
    loading: boolean;
}

export default function AffidavitForm({ onSubmit, loading }: AffidavitFormProps) {
    const [affidavit, setAffidavit] = useState({
        name: "",
        idNumber: "",
        age: "",
        residingAddress: "",
        workingAddress: "",
        telWork: "",
        telHome: "",
        telCell: "",
        declaration: "",
        place: "",
        date: "",
        time: "",
        signature: "",
        commissioner: "",
    });

    // ✅ Generate PDF
    const generateAffidavitPDF = async (): Promise<Blob> => {
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        const img = new Image();
<<<<<<< Updated upstream
        img.src = "/affidavit-form.png"; // image must be inside public/
=======
        img.src = "../../public/affidavit-form.png"; // image must be inside public/
>>>>>>> Stashed changes

        return new Promise((resolve) => {
            img.onload = () => {
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();

                pdf.addImage(img, "PNG", 0, 0, pageWidth, pageHeight);

                pdf.setFontSize(11);
                pdf.text(affidavit.name, 30, 35);
                pdf.text(affidavit.idNumber, 45, 43);
                pdf.text(affidavit.age, 110, 43);
                pdf.text(affidavit.residingAddress, 57, 51);
                pdf.text(affidavit.workingAddress, 57, 59);
                pdf.text(affidavit.telWork, 33, 67.5);
                pdf.text(affidavit.telHome, 73, 67.5);
                pdf.text(affidavit.telCell, 117, 67.5);
                pdf.text(affidavit.declaration, 27, 83, { maxWidth: 160 });
                pdf.text(affidavit.place, 38, 128);
                pdf.text(affidavit.date, 113, 128);
                pdf.text(affidavit.time, 38, 136);
                pdf.text(affidavit.signature, 46, 144);

                resolve(pdf.output("blob") as Blob);
            };
        });
    };

    // ✅ Download locally
    const handleDownload = async () => {
        const blob = await generateAffidavitPDF();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "affidavit.pdf";
        a.click();
        URL.revokeObjectURL(url);
    };

    // ✅ Upload via parent
    const handleSubmit = async () => {
        const pdfBlob = await generateAffidavitPDF();
        await onSubmit(pdfBlob);
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Affidavit Form</h2>

            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Name"
                    value={affidavit.name}
                    onChange={(e) => setAffidavit({ ...affidavit, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="text"
                    placeholder="ID Number"
                    value={affidavit.idNumber}
                    onChange={(e) => setAffidavit({ ...affidavit, idNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="text"
                    placeholder="Age"
                    value={affidavit.age}
                    onChange={(e) => setAffidavit({ ...affidavit, age: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="text"
                    placeholder="Residing Address"
                    value={affidavit.residingAddress}
                    onChange={(e) => setAffidavit({ ...affidavit, residingAddress: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="text"
                    placeholder="Working Address"
                    value={affidavit.workingAddress}
                    onChange={(e) => setAffidavit({ ...affidavit, workingAddress: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Tel (Work)"
                        value={affidavit.telWork}
                        onChange={(e) => setAffidavit({ ...affidavit, telWork: e.target.value })}
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        placeholder="Tel (Home)"
                        value={affidavit.telHome}
                        onChange={(e) => setAffidavit({ ...affidavit, telHome: e.target.value })}
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        placeholder="Tel (Cell)"
                        value={affidavit.telCell}
                        onChange={(e) => setAffidavit({ ...affidavit, telCell: e.target.value })}
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <textarea
                    placeholder="Declaration"
                    value={affidavit.declaration}
                    onChange={(e) => setAffidavit({ ...affidavit, declaration: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
                />

                <div className="grid grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Place"
                        value={affidavit.place}
                        onChange={(e) => setAffidavit({ ...affidavit, place: e.target.value })}
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        placeholder="Date"
                        value={affidavit.date}
                        onChange={(e) => setAffidavit({ ...affidavit, date: e.target.value })}
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        placeholder="Time"
                        value={affidavit.time}
                        onChange={(e) => setAffidavit({ ...affidavit, time: e.target.value })}
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <input
                    type="text"
                    placeholder="Signature"
                    value={affidavit.signature}
                    onChange={(e) => setAffidavit({ ...affidavit, signature: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="mt-6 flex justify-between">
                <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                    Download PDF
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg text-white ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {loading ? "Uploading..." : "Generate & Upload PDF"}
                </button>
            </div>
        </div>
    );
}
