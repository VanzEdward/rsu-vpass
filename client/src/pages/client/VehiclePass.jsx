import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { usePass } from "../../context/PassContext";
import {
  QrCode,
  Maximize2,
  RefreshCw,
  ShieldCheck,
  X,
  User,
  FileBadge,
  Download,
  ArrowRight,
  Sparkles,
  Car,
  CheckCircle2,
} from "lucide-react";
import RsuStickerPass from "../../components/RsuStickerPass";

export default function VehiclePass() {
  const navigate = useNavigate();
  const { applications, systemSettings, isPassExpired, initiatePassRenewal } = usePass();
  const [showQRModal, setShowQRModal] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState("");
  const [isGeneratingPass, setIsGeneratingPass] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

  // Collect all applications that have an active or issued vehicle pass
  const issuedApps = (applications || []).filter(
    (a) => a.status === "PASS_ISSUED" || a.pass,
  );
  const [selectedAppId, setSelectedAppId] = useState(issuedApps[0]?.id || "");

  // Select the active vehicle application
  const issuedApp =
    issuedApps.find((a) => a.id === selectedAppId) || issuedApps[0];

  // Update selectedAppId if issuedApps changes
  useEffect(() => {
    if (
      issuedApps.length > 0 &&
      !issuedApps.some((a) => a.id === selectedAppId)
    ) {
      setSelectedAppId(issuedApps[0].id);
    }
  }, [issuedApps, selectedAppId]);

  // Generate dynamic QR Code Data URL for the current vehicle pass
  useEffect(() => {
    if (!issuedApp || !issuedApp.pass) {
      setQrCodeDataUrl("");
      return;
    }

    const payload =
      issuedApp.pass.qrData ||
      `RSU-VPASS:${issuedApp.pass.passNumber}:${issuedApp.vehicle?.plateNumber}:${issuedApp.school_id}`;

    QRCode.toDataURL(payload, {
      width: 600,
      margin: 1,
      color: {
        dark: "#047857", // Emerald green in UI view
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error("Failed to generate pass QR code:", err));
  }, [issuedApp]);

  // Download the complete Official Wearable ID Pass as a crisp high-resolution PNG
  const handleDownloadWearablePass = async () => {
    if (!issuedApp || !issuedApp.pass || isGeneratingPass) return;

    try {
      setIsGeneratingPass(true);

      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 1200;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Helper function for drawing rounded rectangles
      const drawRoundRect = (x, y, w, h, r) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();
      };

      // 1. Clip outer badge container with rounded corners
      ctx.save();
      drawRoundRect(0, 0, 800, 1200, 32);
      ctx.clip();

      // Card Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 800, 1200);

      // 2. Top Header Banner (Emerald Gradient)
      const grad = ctx.createLinearGradient(0, 0, 800, 140);
      grad.addColorStop(0, "#059669");
      grad.addColorStop(1, "#047857");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 140);

      // Top Header Text
      ctx.fillStyle = "#ffffff";
      ctx.font = '900 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("RSU VPASS", 44, 52);

      ctx.fillStyle = "#a7f3d0";
      ctx.font = '700 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText("ROMBLON STATE UNIVERSITY", 44, 82);

      ctx.fillStyle = "#ecfdf5";
      ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText("PHYSICAL ASSETS & SECURITY OFFICE • OFFICIAL PASS", 44, 104);

      // "ACTIVE PASS" Pill Badge (Top Right)
      ctx.save();
      const badgeW = 126;
      const badgeH = 34;
      const badgeX = 800 - 44 - badgeW;
      const badgeY = 52 - badgeH / 2;
      drawRoundRect(badgeX, badgeY, badgeW, badgeH, 17);
      ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = '800 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("ACTIVE PASS", badgeX + badgeW / 2, badgeY + badgeH / 2);
      ctx.restore();

      // 3. Identification Section (Photo & Registered To)
      const photoX = 44;
      const photoY = 165;
      const photoW = 150;
      const photoH = 185;
      const photoRadius = 18;

      // Draw photo container background
      drawRoundRect(photoX, photoY, photoW, photoH, photoRadius);
      ctx.fillStyle = "#f8fafc";
      ctx.fill();

      // Attempt loading applicant photo
      let photoDrawn = false;
      if (issuedApp.applicant_photo) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          const loadPromise = new Promise((resolve, reject) => {
            img.onload = () => resolve(img);
            img.onerror = reject;
          });
          img.src = issuedApp.applicant_photo;
          const loadedImg = await Promise.race([
            loadPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500)),
          ]);

          ctx.save();
          drawRoundRect(photoX, photoY, photoW, photoH, photoRadius);
          ctx.clip();

          const imgW = loadedImg.naturalWidth || loadedImg.width;
          const imgH = loadedImg.naturalHeight || loadedImg.height;
          if (imgW && imgH) {
            const imgAspect = imgW / imgH;
            const boxAspect = photoW / photoH;
            let sx = 0, sy = 0, sw = imgW, sh = imgH;
            if (imgAspect > boxAspect) {
              sw = imgH * boxAspect;
              sx = (imgW - sw) / 2;
            } else {
              sh = imgW / boxAspect;
              sy = (imgH - sh) / 2;
            }
            ctx.drawImage(loadedImg, sx, sy, sw, sh, photoX, photoY, photoW, photoH);
            photoDrawn = true;
          }
          ctx.restore();
        } catch {
          photoDrawn = false;
        }
      }

      // Draw photo placeholder if no photo or loading failed
      if (!photoDrawn) {
        ctx.save();
        drawRoundRect(photoX, photoY, photoW, photoH, photoRadius);
        ctx.clip();
        ctx.fillStyle = "#e2e8f0";
        // Head
        ctx.beginPath();
        ctx.arc(photoX + photoW / 2, photoY + 65, 30, 0, Math.PI * 2);
        ctx.fillStyle = "#cbd5e1";
        ctx.fill();
        // Body / Shoulders
        ctx.beginPath();
        ctx.arc(photoX + photoW / 2, photoY + 160, 52, 0, Math.PI * 2);
        ctx.fillStyle = "#cbd5e1";
        ctx.fill();

        ctx.fillStyle = "#94a3b8";
        ctx.font = '700 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("ID PHOTO", photoX + photoW / 2, photoY + photoH - 20);
        ctx.restore();
      }

      // Stroke photo border (Emerald-400)
      drawRoundRect(photoX, photoY, photoW, photoH, photoRadius);
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Right Identification Text
      const textX = photoX + photoW + 24;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      // "REGISTERED TO"
      ctx.fillStyle = "#94a3b8";
      ctx.font = '800 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText("REGISTERED TO", textX, 172);

      // Applicant Name
      ctx.fillStyle = "#0f172a";
      ctx.font = '900 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const maxTextW = 800 - textX - 44;
      const displayName = issuedApp.applicant_name || "Applicant Name";
      ctx.fillText(displayName, textX, 196, maxTextW);

      // School ID
      ctx.fillStyle = "#475569";
      ctx.font = '700 16px "Courier New", Courier, monospace';
      ctx.fillText(`ID:  ${issuedApp.school_id || "N/A"}`, textX, 240);

      // Classification & Vehicle Type
      ctx.fillStyle = "#047857";
      ctx.font = '700 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const roleAndType = `${issuedApp.classification || "Student"} • ${issuedApp.vehicle?.type || "Vehicle"}`;
      ctx.fillText(roleAndType, textX, 272, maxTextW);

      // 4. Vehicle Specifications Card Box
      const specX = 44;
      const specY = 372;
      const specW = 800 - 88;
      const specH = 205;
      const specRadius = 18;

      drawRoundRect(specX, specY, specW, specH, specRadius);
      ctx.fillStyle = "#f8fafc";
      ctx.fill();
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Row 1: Vehicle Make & Model
      ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = "#64748b";
      ctx.textBaseline = "middle";
      ctx.textAlign = "left";
      ctx.fillText("Vehicle:", specX + 20, specY + 34);

      ctx.font = '700 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = "#1e293b";
      ctx.textAlign = "right";
      const vehicleDesc = `${issuedApp.vehicle?.make || ""} ${issuedApp.vehicle?.model || ""}`.trim() || "Registered Vehicle";
      ctx.fillText(vehicleDesc, specX + specW - 20, specY + 34, 440);

      // Row 2: Plate Number
      ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = "#64748b";
      ctx.textAlign = "left";
      ctx.fillText("Plate Number:", specX + 20, specY + 76);

      ctx.font = '900 18px "Courier New", Courier, monospace';
      ctx.fillStyle = "#0f172a";
      ctx.textAlign = "right";
      ctx.fillText(issuedApp.vehicle?.plateNumber || "N/A", specX + specW - 20, specY + 76);

      // Row 3: Pass Number
      ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = "#64748b";
      ctx.textAlign = "left";
      ctx.fillText("Pass Number:", specX + 20, specY + 118);

      ctx.font = '900 18px "Courier New", Courier, monospace';
      ctx.fillStyle = "#047857";
      ctx.textAlign = "right";
      ctx.fillText(issuedApp.pass?.passNumber || "S-001", specX + specW - 20, specY + 118);

      // Divider line
      ctx.beginPath();
      ctx.moveTo(specX + 20, specY + 146);
      ctx.lineTo(specX + specW - 20, specY + 146);
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Row 4: Valid Until
      ctx.font = '600 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = "#64748b";
      ctx.textAlign = "left";
      ctx.fillText("Valid Until:", specX + 20, specY + 175);

      ctx.font = '800 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = "#0f172a";
      ctx.textAlign = "right";
      ctx.fillText(issuedApp.pass?.validUntil || "1 Year from Issuance", specX + specW - 20, specY + 175);

      // 5. Dynamic Gate QR Code Box
      const qrBoxX = 44;
      const qrBoxY = 600;
      const qrBoxW = 800 - 88;
      const qrBoxH = 500;
      const qrBoxRadius = 22;

      drawRoundRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, qrBoxRadius);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Generate QR Code matching the green style
      const payload =
        issuedApp.pass?.qrData ||
        `RSU-VPASS:${issuedApp.pass?.passNumber}:${issuedApp.vehicle?.plateNumber}:${issuedApp.school_id}`;

      const qrDataUrl = await QRCode.toDataURL(payload, {
        width: 360,
        margin: 1,
        color: {
          dark: "#047857", // Emerald green matching UI
          light: "#ffffff",
        },
        errorCorrectionLevel: "H",
      });

      const qrImg = new Image();
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
        qrImg.src = qrDataUrl;
      });

      const qrSize = 350;
      const qrDrawX = qrBoxX + (qrBoxW - qrSize) / 2;
      const qrDrawY = qrBoxY + 28;
      ctx.drawImage(qrImg, qrDrawX, qrDrawY, qrSize, qrSize);

      // Security labels under QR Code
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = "#047857";
      ctx.font = '800 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText("PASO GATE SECURITY VALIDATED", 400, qrBoxY + qrSize + 48);

      ctx.fillStyle = "#64748b";
      ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText("Present to Security Scanner upon Gate Entry & Exit", 400, qrBoxY + qrSize + 74);

      ctx.fillStyle = "#94a3b8";
      ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText("Official Wearable Gate Pass • Main Campus Odiongan", 400, qrBoxY + qrSize + 96);

      // 6. Security Footer / Authenticity Seal
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(44, 1125, 800 - 88, 1);

      ctx.fillStyle = "#64748b";
      ctx.font = '700 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("PHYSICAL ASSETS AND SECURITY OFFICE • ROMBLON STATE UNIVERSITY", 400, 1150);

      ctx.fillStyle = "#94a3b8";
      ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`Pass ID: ${issuedApp.pass.passNumber} • Verified Clearance Credential`, 400, 1170);

      // 7. Outer Border around entire card
      ctx.restore(); // restore clipping
      drawRoundRect(1, 1, 798, 1198, 32);
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 8. Download the generated PNG
      const cleanPlate = (issuedApp.vehicle?.plateNumber || "vehicle")
        .replace(/[^a-zA-Z0-9]/g, "-")
        .toUpperCase();
      const filename = `RSU-WEARABLE-PASS-${cleanPlate}-${issuedApp.pass.passNumber}.png`;

      const link = document.createElement("a");
      link.download = filename;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadMessage(
        `Official Wearable ID Pass for ${issuedApp.vehicle?.plateNumber} downloaded successfully! Ready to print or save on your mobile device.`
      );
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to generate wearable pass PNG:", err);
    } finally {
      setIsGeneratingPass(false);
    }
  };

  // Download ONLY the pure QR Code as a high-resolution PNG for vehicle sticker printing
  const handleDownloadQR = () => {
    if (!issuedApp || !issuedApp.pass) return;

    const payload =
      issuedApp.pass.qrData ||
      `RSU-VPASS:${issuedApp.pass.passNumber}:${issuedApp.vehicle?.plateNumber}:${issuedApp.school_id}`;

    // Generate high-resolution, high-contrast black-and-white QR code for optical scanners and sticker printing
    QRCode.toDataURL(
      payload,
      {
        width: 1024,
        margin: 2,
        color: {
          dark: "#000000", // Black & White for highest optical scanning accuracy
          light: "#ffffff",
        },
        errorCorrectionLevel: "H", // High error tolerance for physical sticker wear
      },
      (err, url) => {
        if (err) {
          console.error("Failed to create downloadable sticker QR code:", err);
          return;
        }

        const cleanPlate = (issuedApp.vehicle?.plateNumber || "vehicle")
          .replace(/[^a-zA-Z0-9]/g, "-")
          .toUpperCase();
        const filename = `RSU-VPASS-STICKER-QR-${cleanPlate}-${issuedApp.pass.passNumber}.png`;

        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setDownloadMessage(
          `Sticker QR Code for ${issuedApp.vehicle?.plateNumber} downloaded successfully! Ready to print as a vehicle sticker.`
        );
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3500);
      },
    );
  };

  if (!issuedApp || !issuedApp.pass) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Official Vehicle Pass
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Physical Assets and Security Office (PASO) issued credentials &
            vehicle clearance.
          </p>
        </div>

        <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
            <QrCode className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              No Active Vehicle Pass Generated Yet
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your gate QR code and official vehicle pass will be generated and
              granted by PASO once your Cashier payment receipt has been
              verified in Milestone 3.
            </p>
          </div>
          <div className="pt-2 flex justify-center space-x-3">
            <Link
              to="/client/my-vehicle"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm inline-flex items-center space-x-1.5"
            >
              <span>Register Vehicle</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const {
    pass,
    vehicle,
    applicant_name,
    school_id,
    classification,
    applicant_photo,
  } = issuedApp;

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-1 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Milestone 4: QR Pass Active</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Official Vehicle Pass
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Download your official wearable ID pass or vehicle sticker to display on campus.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={() => setShowQRModal(true)}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Maximize2 className="w-4 h-4 text-emerald-600" />
            <span>Show QR Only</span>
          </button>
        </div>
      </div>

      {/* Success Toast when Pass or QR is downloaded */}
      {downloadSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center space-x-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {downloadMessage || `Official Pass for ${vehicle.plateNumber} downloaded successfully!`}
            </span>
          </div>
          <button
            onClick={() => setDownloadSuccess(false)}
            className="text-emerald-700 hover:text-emerald-950 font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Multi-vehicle Pass Switcher (if user has registered more than 1 vehicle) */}
      {issuedApps.length > 1 && (
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap pl-1">
            Registered Vehicles ({issuedApps.length}):
          </span>
          <div className="flex items-center space-x-2">
            {issuedApps.map((app) => (
              <button
                key={app.id}
                onClick={() => setSelectedAppId(app.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
                  issuedApp.id === app.id
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>
                  {app.vehicle?.make} {app.vehicle?.model} (
                  {app.vehicle?.plateNumber})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Passes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Official Wearable ID Pass */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <FileBadge className="w-4 h-4 text-emerald-600" />
              <span>Official Wearable ID Pass</span>
            </h2>
            <span className="text-[11px] text-slate-400">
              Issued to Driver/Owner
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md max-w-sm mx-auto">
            {/* Pass Header */}
            <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-base font-black tracking-wider text-white">
                  RSU VPASS
                </span>
                <p className="text-[10px] uppercase tracking-wider text-emerald-100 font-semibold">
                  Romblon State University
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold tracking-wide border border-white/30">
                ACTIVE PASS
              </span>
            </div>

            {/* Pass Body */}
            <div className="p-5 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-24 rounded-2xl overflow-hidden bg-slate-50 border-2 border-emerald-400 shadow-xs flex flex-col items-center justify-center text-slate-400 shrink-0">
                  {applicant_photo ? (
                    <img
                      src={applicant_photo}
                      alt="Applicant Identification"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <User className="w-8 h-8 text-slate-300" />
                      <span className="text-[9px] mt-1">Photo</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    Registered To
                  </p>
                  <p
                    className="text-sm font-black text-slate-900 leading-tight truncate"
                    title={applicant_name}
                  >
                    {applicant_name}
                  </p>
                  <p className="text-xs font-mono text-slate-600 truncate">
                    ID: {school_id}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold truncate">
                    {classification} • {vehicle.type}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0">Vehicle:</span>
                  <span className="font-semibold text-slate-800 truncate text-right">
                    {vehicle.make} {vehicle.model}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0">Plate Number:</span>
                  <span className="font-mono font-bold text-slate-900 truncate text-right">
                    {vehicle.plateNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0">Pass Number:</span>
                  <span className="font-mono font-bold text-emerald-700 truncate text-right">
                    {pass.passNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200 gap-2">
                  <span className="text-slate-500 shrink-0">Valid Until:</span>
                  <span className="font-bold text-slate-900 truncate text-right">
                    {pass.validUntil}
                  </span>
                </div>
              </div>

              {/* Dynamic QR Section */}
              <div className="flex items-center justify-center p-3 bg-white rounded-2xl border border-slate-200">
                <div
                  onClick={() => setShowQRModal(true)}
                  className="cursor-pointer flex flex-col items-center group"
                >
                  <div className="w-28 h-28 flex items-center justify-center">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="Gate QR Code"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <QrCode className="w-24 h-24 text-emerald-700 group-hover:scale-105 transition-transform" />
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 group-hover:text-emerald-700 mt-1">
                    Click to enlarge QR
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Download Wearable Pass Button */}
          <div className="text-center pt-1 max-w-sm mx-auto">
            <button
              type="button"
              onClick={handleDownloadWearablePass}
              disabled={isGeneratingPass}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm inline-flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer disabled:opacity-60"
            >
              <Download className="w-4 h-4 text-emerald-100" />
              <span>
                {isGeneratingPass ? "Generating Pass..." : "Download Official Wearable Pass (PNG)"}
              </span>
            </button>
          </div>
        </div>

        {/* 2. Official Vehicle Pass Sticker */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>Official Vehicle Pass Sticker</span>
            </h2>
            <span className="text-[11px] text-slate-400">
              Attached to Vehicle Windshield / Front Bumper
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-200 flex flex-col items-center">
            <RsuStickerPass
              classification={classification || "Student"}
              passNumber={pass.passNumber || "S-001"}
              plateNumber={vehicle.plateNumber || "RSU 2026"}
              qrPayload={pass.qrData || `RSU-VPASS:${pass.passNumber}:${vehicle.plateNumber}:${school_id}`}
              showDownloadButton={true}
            />

            <p className="text-[11px] text-slate-500 text-center leading-relaxed mt-2.5 max-w-xs">
              Official Romblon State University {classification || "Student"} vehicle pass. Printed at 300 DPI high resolution with gate QR code ready for adhesive sticker attachment.
            </p>
          </div>

          {/* Annual Renewal Module */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 max-w-sm mx-auto mt-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Annual Pass Renewal • A.Y. {systemSettings?.academicYear || '2026-2027'}</span>
            </h3>
            
            {issuedApp?.pass && isPassExpired(issuedApp.pass) ? (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
                <p className="font-bold text-rose-950 flex items-center space-x-1">
                  <span>Pass Expired on {issuedApp.pass.validUntil}</span>
                </p>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  Your 1-year gate clearance for <strong>{vehicle.make} {vehicle.model} ({vehicle.plateNumber})</strong> has expired. Renew your pass to restore campus gate entry.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/client/my-vehicle?renewAppId=${issuedApp.id}&from=vehicle-pass`);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Renew This Pass Now</span>
                </button>
              </div>
            ) : (
              <>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Passes are valid for exactly 1 year from issuance for <strong>Academic Year {systemSettings?.academicYear || '2026-2027'}</strong>. Valid until <strong>{pass.validUntil}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/client/my-vehicle?renewAppId=${issuedApp.id}&from=vehicle-pass`);
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Request Early Annual Renewal
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* QR Enlarged Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-slate-900">
              Enlarged Gate QR
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              {pass.passNumber}
            </p>

            <div className="mt-6 flex justify-center">
              <div className="p-4 bg-white rounded-2xl border-2 border-emerald-500 shadow-md w-64 h-64 flex items-center justify-center">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Enlarged Gate QR"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <QrCode className="w-56 h-56 text-emerald-700" />
                )}
              </div>
            </div>

            <p className="text-xs font-bold text-slate-800 mt-4 truncate px-2">
              {vehicle.make} {vehicle.model} •{" "}
              <span className="font-mono text-emerald-700">
                {vehicle.plateNumber}
              </span>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Present this QR code to the gate security officer scanner.
            </p>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={handleDownloadQR}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-98"
              >
                <Download className="w-4 h-4 text-emerald-100" />
                <span>Download QR Code Only (PNG)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowQRModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
