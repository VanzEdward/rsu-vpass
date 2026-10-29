import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { usePass } from "../context/PassContext";

// 6 Canva Templates (3 pairs for Students & Employees across Academic Years)
import studentPassImgV1 from "../assets/student_pass.png";
import employeePassImgV1 from "../assets/employee_pass.png";
import studentPassImgV2 from "../assets/student_passV2.png";
import employeePassImgV2 from "../assets/employee_passV2.png";
import studentPassImgV3 from "../assets/student_passV3.png";
import employeePassImgV3 from "../assets/employee_passV3.png";

/**
 * Registry of Official RSU Vehicle Pass Canva Templates
 * Allows PASO Administration to designate an official color theme for each Academic Year.
 */
export const PASS_TEMPLATES = {
  V1: {
    id: "V1",
    name: "Set 1: Classic Pink & Red",
    academicYearDefault: "2026-2027",
    studentImg: studentPassImgV1,
    employeeImg: employeePassImgV1,
    studentAccent: "#fbcfe8",
    employeeAccent: "#fecaca",
    studentColorName: "Rose Pink",
    employeeColorName: "Crimson Red",
    studentBadgeBg: "bg-pink-100 text-pink-800 border-pink-300",
    employeeBadgeBg: "bg-red-100 text-red-800 border-red-300",
    description: "RSU official launch template (A.Y. 2026–2027)",
  },
  V2: {
    id: "V2",
    name: "Set 2: Forest Emerald & Royal Blue",
    academicYearDefault: "2027-2028",
    studentImg: studentPassImgV2,
    employeeImg: employeePassImgV2,
    studentAccent: "#bbf7d0",
    employeeAccent: "#bfdbfe",
    studentColorName: "Forest Emerald",
    employeeColorName: "Royal Navy Blue",
    studentBadgeBg: "bg-emerald-100 text-emerald-800 border-emerald-300",
    employeeBadgeBg: "bg-blue-100 text-blue-800 border-blue-300",
    description: "University heritage colors for A.Y. 2027–2028",
  },
  V3: {
    id: "V3",
    name: "Set 3: Amber Gold & Crimson Maroon",
    academicYearDefault: "2028-2029",
    studentImg: studentPassImgV3,
    employeeImg: employeePassImgV3,
    studentAccent: "#fde68a",
    employeeAccent: "#fecdd3",
    studentColorName: "Amber Gold",
    employeeColorName: "Deep Maroon",
    studentBadgeBg: "bg-amber-100 text-amber-800 border-amber-300",
    employeeBadgeBg: "bg-rose-100 text-rose-800 border-rose-300",
    description: "High-contrast gate security template for A.Y. 2028–2029",
  },
};

/**
 * Authentic RSU Vehicle Pass Sticker Component
 * Automatically selects the appropriate Canva template (Set 1, Set 2, or Set 3)
 * based on the pass's assigned version or the active system setting.
 */
export default function RsuStickerPass({
  classification = "STUDENT",
  passNumber = "S-001",
  plateNumber = "RSU 2026",
  qrPayload = "",
  className = "",
  showDownloadButton = true,
  templateVersion, // "V1" | "V2" | "V3"
}) {
  const { systemSettings } = usePass() || {};
  const activeVersion =
    templateVersion || systemSettings?.stickerTemplateVersion || "V1";
  const activeSet = PASS_TEMPLATES[activeVersion] || PASS_TEMPLATES.V1;

  const isStudent = (classification || "").toLowerCase().includes("student");
  const templateImg = isStudent ? activeSet.studentImg : activeSet.employeeImg;
  const accentColor = isStudent
    ? activeSet.studentAccent
    : activeSet.employeeAccent;
  const roleTitle = isStudent ? "STUDENT" : "EMPLOYEE";

  // Normalize pass number so it always displays cleanly as 3-digit zero-padded S-### or E-### (e.g. S-001, E-001)
  const formatDisplayPass = (rawPass, student) => {
    const prefix = student ? "S" : "E";
    if (!rawPass) return `${prefix}-001`;
    const clean = String(rawPass).trim().toUpperCase();

    const seMatch = clean.match(/^([SE])-?(\d+)$/);
    if (seMatch) {
      const p = seMatch[1];
      const num = parseInt(seMatch[2], 10);
      return `${p}-${String(num).padStart(3, "0")}`;
    }

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
      ctx.drawImage(qrImg, 765, 1073, 350, 350);

      // 4. Draw Pass Series Number on the left
      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      // Big Bold Pass Number
      ctx.font = '900 135px Impact, "Arial Black", sans-serif';
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;
      ctx.fillText(displayPassNumber, 85, 1085, 640);
      ctx.shadowColor = "transparent";

      // Pass Category Label with dynamic color
      ctx.font = "700 32px Arial, sans-serif";
      ctx.fillStyle = accentColor;
      ctx.fillText(`${roleTitle} AUTHORIZED`, 90, 1235, 630);

      // Vehicle Plate Number
      ctx.font = '900 58px "Courier New", monospace';
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`PLATE: ${displayPlate}`, 90, 1295, 630);

      // Security validation footer
      ctx.font = "700 24px Arial, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.fillText("PASO VALIDATED", 90, 1375, 630);
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
    <div className={`w-full flex flex-col items-center ${className}`}>
      {/* ======================================================== */}
      {/* AUTHENTIC RSU VEHICLE PASS STICKER (Canva Template Base) */}
      {/* ======================================================== */}
      <div className="w-full max-w-[340px] rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-900 bg-white select-none relative aspect-[4/5]">
        {/* Background Canva Template */}
        <img
          src={templateImg}
          alt={`${roleTitle} Vehicle Pass Template (${activeSet.name})`}
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

          {/* Subtitle label with dynamic accent color */}
          <span
            className="text-[9px] font-bold uppercase tracking-wider block mt-1"
            style={{ color: accentColor }}
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
            top: "71.5%",
            width: "29.5%",
            height: "24%",
          }}
        >
          {qrCodeDataUrl ? (
            <img
              src={qrCodeDataUrl}
              alt="Gate Scanner QR"
              className="w-full h-full object-contain rounded-md"
            />
          ) : (
            <div className="w-full h-full bg-slate-200 animate-pulse rounded-md" />
          )}
        </div>
      </div>

      {/* Download Action Button */}
      {showDownloadButton && (
        <button
          type="button"
          onClick={handleDownloadSticker}
          className="mt-4 w-full max-w-[340px] py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download High-Resolution Pass Sticker</span>
        </button>
      )}
    </div>
  );
}
