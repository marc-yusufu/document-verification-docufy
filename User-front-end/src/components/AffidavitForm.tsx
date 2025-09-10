import React, { useState } from "react";
import jsPDF from "jspdf";

interface Props {
    onSubmit: (pdfBlob: Blob) => Promise<void>;
    loading: boolean;
}

export default function AffidavitForm({ onSubmit, loading }: Props) {
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

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setAffidavit((prev) => ({ ...prev, [name]: value }));
    };

    const generateAffidavitPDF = (): Blob => {
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        pdf.setFontSize(12);
        pdf.text("AFFIDAVIT", 105, 20, { align: "center" });

        let y = 35;
        const lineHeight = 8;

        const addLine = (label: string, value: string) => {
            pdf.text(`${label}: ${value}`, 20, y);
            y += lineHeight;
        };

        addLine("Name", affidavit.name);
        addLine("ID Number", affidavit.idNumber);
        addLine("Age", affidavit.age);
        addLine("Residing Address", affidavit.residingAddress);
        addLine("Working Address", affidavit.workingAddress);
        addLine("Tel (Work)", affidavit.telWork);
        addLine("Tel (Home)", affidavit.telHome);
        addLine("Tel (Cell)", affidavit.telCell);

        y += lineHeight;
        pdf.text("Declaration:", 20, y);
        y += lineHeight;
        pdf.text(
            affidavit.declaration || "................................................",
            20,
            y,
            { maxWidth: 170 }
        );

        y += lineHeight * 4;
        addLine("Place", affidavit.place);
        addLine("Date", affidavit.date);
        addLine("Time", affidavit.time);
        addLine("Signature", affidavit.signature);
        addLine("Commissioner of Oaths", affidavit.commissioner);

        return pdf.output("blob") as Blob;
    };

    const handleSubmit = async () => {
        const pdfBlob = generateAffidavitPDF();
        await onSubmit(pdfBlob);

        // reset form
        setAffidavit({
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
    };

    return (
        <div className="border p-6 rounded-lg mb-4">
            <h3 className="text-lg font-semibold mb-4">Affidavit Form</h3>

            <div className="space-y-3">
                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={affidavit.name}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />
                <input
                    type="text"
                    name="idNumber"
                    placeholder="ID Number"
                    value={affidavit.idNumber}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />
                <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={affidavit.age}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />
                <input
                    type="text"
                    name="residingAddress"
                    placeholder="Residing Address"
                    value={affidavit.residingAddress}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />
                <textarea
                    name="declaration"
                    placeholder="Declaration"
                    value={affidavit.declaration}
                    onChange={handleChange}
                    className="w-full border p-2 rounded h-24"
                />
                <div className="grid grid-cols-3 gap-3">
                    <input
                        type="text"
                        name="place"
                        placeholder="Place"
                        value={affidavit.place}
                        onChange={handleChange}
                        className="border p-2 rounded"
                    />
                    <input
                        type="date"
                        name="date"
                        value={affidavit.date}
                        onChange={handleChange}
                        className="border p-2 rounded"
                    />
                    <input
                        type="time"
                        name="time"
                        value={affidavit.time}
                        onChange={handleChange}
                        className="border p-2 rounded"
                    />
                </div>
                <input
                    type="text"
                    name="signature"
                    placeholder="Signature"
                    value={affidavit.signature}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />
                <input
                    type="text"
                    name="commissioner"
                    placeholder="Commissioner of Oaths"
                    value={affidavit.commissioner}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
                {loading ? "Submitting..." : "Submit Affidavit"}
            </button>
        </div>
    );
}
