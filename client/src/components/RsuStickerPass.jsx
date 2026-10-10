import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import studentPassImg from "../assets/student_pass.png";
import employeePassImg from "../assets/employee_pass.png";

/**
 * Authentic RSU Vehicle Pass Sticker Component
 * Uses the user-created Canva templates:
 * - student_pass.png (Pink theme) for students
 * - employee_pass.png (Red theme) for employees
 * Automatically stamps:
 * - QR code onto the blank white square (right side)
 * - S-Number or E-Number + Vehicle Plate on the left side
 * - High-resolution (1200x1500, 300 DPI) canvas exporter for printing
 */
export default function RsuStickerPass({
  classification = "STUDENT",
  passNumber = "S-001",
  plateNumber = "RSU 2026",
  qrPayload = "",
  className = "",
  showDownloadButton = true,
}) {
  const isStudent = (classification || "").toLowerCase().includes("student");
  const templateImg = isStudent ? studentPassImg : employeePassImg;
  const roleTitle = isStudent ? "STUDENT" : "EMPLOYEE";

  // Normalize pass number so it always displays cleanly as 3-digit zero-padded S-### or E-### (e.g. S-001, E-001)
  const formatDisplayPass = (rawPass, student) => {
    const prefix = student ? "S" : "E";
    if (!rawPass) return `${prefix}-001`;
    const clean = String(rawPass).trim().toUpperCase();

    // S-001, E-001, S-1, E-1, S1, E1
    const seMatch = clean.match(/^([SE])-?(\d+)$/);
    if (seMatch) {
      const p = seMatch[1];
      const num = parseInt(seMatch[2], 10);
      return `${p}-${String(num).padStart(3, "0")}`;
    }

    // Trailing digits (e.g., VP-2026-0001, 1, 001)
    const match = clean.match(/(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      return `${prefix}-${String(num).padStart(3, "0")}`;
    }

    return `${prefix}-001`;
  };

  const displayPassNumber = formatDisplayPass(passNumber, isStudent);
  const displayPlate = (plateNumber || "RSU 2026").toUpperCase();

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

  const payload =
    qrPayload ||
    `RSU-VPASS:${displayPassNumber}:${displayPlate}:${classification}`;

  // Generate dynamic QR Code Data URL for UI preview
  useEffect(() => {
    QRCode.toDataURL(payload, {
      width: 400,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error("Failed to generate pass QR code:", err));
  }, [payload]);

  // High-Resolution 1200x1500 Canvas Exporter for Sticker Printing
  const handleDownloadSticker = async () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 1500;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Load and draw the Canva background template
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      bgImg.src = templateImg;

      await new Promise((resolve, reject) => {
        bgImg.onload = resolve;
        bgImg.onerror = reject;
      });

      ctx.drawImage(bgImg, 0, 0, 1200, 1500);

      // 2. Generate high-res QR Code (size: 350x350)
      const qrData = await QRCode.toDataURL(payload, {
        width: 350,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: "H",
      });

      const qrImg = new Image();
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
        qrImg.src = qrData;
      });

      // 3. Draw QR Code centered inside the blank white square (bounds: 750-1130, 1058-1438)
      // Centered at x: 765, y: 1073 with size 350x350
      ctx.drawImage(qrImg, 765, 1073, 350, 350);

      // 4. Draw Pass Series Number (e.g., S-396 or E-081) on the left
      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      // Big Bold Pass Number
      ctx.font = '900 135px Impact, "Arial Black", sans-serif';
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;
      ctx.fillText(displayPassNumber, 85, 1085);
      ctx.shadowColor = "transparent";

      // Pass Category Label
      ctx.font = "700 32px Arial, sans-serif";
      ctx.fillStyle = isStudent ? "#fbcfe8" : "#fecaca";
      ctx.fillText(`${roleTitle} AUTHORIZED PASS`, 90, 1235);

      // Vehicle Plate Number
      ctx.font = '900 58px "Courier New", monospace';
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`PLATE: ${displayPlate}`, 90, 1295);

      // Security validation footer
      ctx.font = "700 24px Arial, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.fillText("PASO GATE SECURITY VALIDATED", 90, 1375);
      ctx.restore();

      // 5. Trigger download of the completed sticker image
      const cleanPlate = displayPlate.replace(/[^a-zA-Z0-9]/g, "-");
      const filename = `RSU-VEHICLE-PASS-${displayPassNumber}-${cleanPlate}.png`;

      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export Canva pass sticker:", err);
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* ======================================================== */}
      {/* AUTHENTIC RSU VEHICLE PASS STICKER (Canva Template Base) */}
      {/* ======================================================== */}
      <div className="w-full max-w-[340px] rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-900 bg-white select-none relative aspect-[4/5]">
        {/* Background Canva Template */}
        <img
          src={templateImg}
          alt={`${roleTitle} Vehicle Pass Template`}
          className="w-full h-full object-contain pointer-events-none"
        />

        {/* Dynamic Overlay: Left Side (S-Number / E-Number & Plate) */}
        <div
          className="absolute flex flex-col justify-center text-white"
          style={{
            left: "7%",
            top: "71.5%",
            width: "53%",
            height: "24%",
          }}
        >
          {/* S-Number or E-Number */}
          <span
            className="font-black text-white leading-none tracking-tight block truncate drop-shadow-md"
            style={{
              fontFamily: 'Impact, "Arial Black", sans-serif',
              fontSize: "clamp(1.75rem, 6.5vw, 2.5rem)",
            }}
          >
            {displayPassNumber}
          </span>

          {/* Subtitle label */}
          <span
            className={`text-[9px] font-bold uppercase tracking-wider block mt-1 ${
              isStudent ? "text-pink-200" : "text-red-200"
            }`}
          >
            {roleTitle} AUTHORIZED
          </span>

          {/* Vehicle Plate */}
          <span className="text-[12px] font-black font-mono tracking-wide text-white block mt-0.5 truncate drop-shadow-sm">
            PLATE: {displayPlate}
          </span>

          {/* Security sub-tag */}
          <span className="text-[8px] font-semibold text-white/70 block mt-0.5 tracking-wider">
            PASO VALIDATED
          </span>
        </div>

        {/* Dynamic Overlay: Right Side (QR Code inside blank white square) */}
        <div
          className="absolute flex items-center justify-center p-1.5"
          style={{
            left: "63.75%",
            top: "71.53%",
            width: "29.17%",
            height: "23.33%",
          }}
        >
          {qrCodeDataUrl ? (
            <img
              src={qrCodeDataUrl}
              alt={`Gate QR Code for ${displayPassNumber}`}
              className="w-full h-full object-contain rounded-xl"
            />
          ) : (
            <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-[9px] text-slate-400 font-bold">
              QR
            </div>
          )}
        </div>
      </div>

      {/* Direct Download Button */}
      {showDownloadButton && (
        <button
          type="button"
          onClick={handleDownloadSticker}
          className={`mt-3.5 w-full max-w-[340px] py-2.5 px-4 rounded-xl text-white text-xs font-black shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98 ${
            isStudent
              ? "bg-pink-600 hover:bg-pink-500 shadow-pink-900/30"
              : "bg-red-600 hover:bg-red-500 shadow-red-900/30"
          }`}
        >
          <Download className="w-4 h-4 text-white" />
          <span>Download Official {roleTitle} Pass (PNG)</span>
        </button>
      )}
    </div>
  );
}
