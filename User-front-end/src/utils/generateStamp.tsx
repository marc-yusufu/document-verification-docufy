import jsPDF from "jspdf";

// Utility to generate 6-character unique code
const generateCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

export async function generateStampedPdf(canvas: HTMLCanvasElement, stampUrl: string) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [canvas.width, canvas.height],
  });

  const imgData = canvas.toDataURL("image/png");
  doc.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const stampWidth = 60;
  const stampHeight = 30;
  const margin = 10;

  const code = generateCode();

  // Load the stamp image
  return new Promise<string>((resolve, reject) => {
    const stamp = new Image();
    stamp.crossOrigin = "Anonymous";
    stamp.src = stampUrl;

    stamp.onload = () => {
      // Draw stamp on offscreen canvas to get base64 data URL
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = stamp.width;
      tempCanvas.height = stamp.height;

      const ctx = tempCanvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available."));
        return;
      }

      ctx.drawImage(stamp, 0, 0);
      const stampDataUrl = tempCanvas.toDataURL("image/png");

      const stampX = pageWidth - stampWidth - margin;
      const stampY = pageHeight - stampHeight - 25;

      doc.addImage(stampDataUrl, "PNG", stampX, stampY, stampWidth, stampHeight);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(50);
      doc.text(`ID: ${code}`, stampX + 5, pageHeight - 10);

      resolve(doc.output("dataurlstring"));
    };

    stamp.onerror = () => {
      reject(new Error("Failed to load stamp image."));
    };
  });
}
