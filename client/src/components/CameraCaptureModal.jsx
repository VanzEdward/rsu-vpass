import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  RefreshCw, 
  X, 
  Check, 
  AlertCircle, 
  Zap, 
  ZapOff, 
  FlipHorizontal, 
  FileText, 
  Receipt, 
  IdCard, 
  User, 
  Sparkles,
  Maximize2
} from 'lucide-react';

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
  title,
  subTitle,
  mode = 'auto', // 'auto' | 'selfie' | 'document' | 'receipt' | 'id_card'
  selfieOnly = false,
  initialFacingMode,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const isStartingRef = useRef(false);

  // Determine active visual mode based on title and props
  const resolvedMode = React.useMemo(() => {
    if (mode && mode !== 'auto') return mode;
    if (selfieOnly) return 'selfie';
    const lower = (title || '').toLowerCase();
    if (lower.includes('receipt')) return 'receipt';
    if (lower.includes('license') || lower.includes('id card')) return 'id_card';
    if (lower.includes('or/cr') || lower.includes('document') || lower.includes('registration')) return 'document';
    if (lower.includes('selfie') || lower.includes('profile') || lower.includes('photo id') || lower.includes('identification photo')) return 'selfie';
    return 'document';
  }, [mode, selfieOnly, title]);

  const isSelfie = resolvedMode === 'selfie';

  // Default camera: front for selfie, back (rear) for documents/receipts
  const defaultFacing = initialFacingMode || (isSelfie ? 'user' : 'environment');

  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState(defaultFacing);
  const [isMirrored, setIsMirrored] = useState(defaultFacing === 'user');
  const [isLoadingCamera, setIsLoadingCamera] = useState(true);
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);

  const stopTracks = useCallback(() => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => {
          if (track.readyState === 'live') {
            track.stop();
          }
        });
      } catch (e) {
        console.warn('Error stopping camera track:', e);
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsTorchOn(false);
    setHasTorch(false);
  }, []);

  // Start webcam stream with hardware release pause and progressive fallback
  const startCamera = useCallback(async (modeToUse = facingMode) => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    setIsLoadingCamera(true);
    setCameraError('');

    // Explicitly release previous camera stream
    stopTracks();

    // 100ms hardware stabilization delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your current browser.');
      }

      const targetFacing = selfieOnly ? 'user' : modeToUse;

      let mediaStream = null;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: targetFacing,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch (firstErr) {
        console.warn('Direct 1080p facingMode failed, falling back to 720p ideal:', firstErr);
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: targetFacing },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch (secondErr) {
          console.warn('Ideal facingMode failed, trying generic video stream:', secondErr);
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      streamRef.current = mediaStream;

      // Check for hardware torch / flashlight capability on mobile rear camera
      try {
        const videoTrack = mediaStream.getVideoTracks()[0];
        if (videoTrack) {
          const capabilities = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
          setHasTorch(Boolean(capabilities && capabilities.torch));
        }
      } catch {
        setHasTorch(false);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        await videoRef.current.play().catch(() => {});
      }

      // Automatically mirror front camera so it acts naturally like a mirror; unmirror back camera
      setIsMirrored(targetFacing === 'user');
      setFacingMode(targetFacing);
    } catch (err) {
      console.warn('Webcam stream error:', err);
      setCameraError(
        'Camera permission was denied or device is busy. Please allow camera permissions in your browser settings and tap Retry.'
      );
    } finally {
      setIsLoadingCamera(false);
      isStartingRef.current = false;
    }
  }, [facingMode, selfieOnly, stopTracks]);

  // Handle hardware torch toggle
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      const nextTorch = !isTorchOn;
      await track.applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setIsTorchOn(nextTorch);
    } catch (err) {
      console.warn('Torch constraint toggle error:', err);
    }
  };

  // Toggle front vs back camera
  const toggleCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Toggle manual mirror flipping
  const toggleMirror = () => {
    setIsMirrored((prev) => !prev);
  };

  useEffect(() => {
    if (isOpen && !capturedImage) {
      const initialMode = initialFacingMode || (isSelfie ? 'user' : 'environment');
      setFacingMode(initialMode);
      setIsMirrored(initialMode === 'user');
      startCamera(initialMode);
    }

    return () => {
      stopTracks();
    };
  }, [isOpen]);

  // Capture frame with high quality & proper orientation
  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    let w = video.videoWidth || 1280;
    let h = video.videoHeight || 720;
    const maxDim = 1600;
    if (w > maxDim || h > maxDim) {
      const ratio = Math.min(maxDim / w, maxDim / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }

    canvas.width = w;
    canvas.height = h;

    const context = canvas.getContext('2d');
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    // If mirrored preview was active (selfie), flip the canvas horizontally
    // so the saved snapshot matches the mirrored preview the user saw!
    if (isMirrored) {
      context.translate(w, 0);
      context.scale(-1, 1);
    }

    context.drawImage(video, 0, 0, w, h);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);

    stopTracks();
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  // Confirm photo
  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  const handleClose = () => {
    stopTracks();
    setCapturedImage(null);
    setCameraError('');
    onClose();
  };

  if (!isOpen) return null;

  // Header icon & description based on mode
  const getHeaderDetails = () => {
    switch (resolvedMode) {
      case 'receipt':
        return {
          icon: <Receipt className="w-4 h-4 text-emerald-400" />,
          displayTitle: title || 'Snap Cashier Receipt',
          subtitle: subTitle || 'Align the paper official receipt inside the document frame',
          badge: 'Receipt Scanner Mode',
          guideText: 'Align Official Receipt • Ensure OR # and date are clear',
        };
      case 'id_card':
        return {
          icon: <IdCard className="w-4 h-4 text-emerald-400" />,
          displayTitle: title || "Scan Driver's License",
          subtitle: subTitle || 'Position your valid Philippine Driver\'s License within the card frame',
          badge: 'ID Card Mode',
          guideText: 'Position License inside frame • Keep text & photo sharp',
        };
      case 'document':
        return {
          icon: <FileText className="w-4 h-4 text-emerald-400" />,
          displayTitle: title || 'Scan Vehicle OR/CR Document',
          subtitle: subTitle || 'Position the Certificate of Registration flat within the frame',
          badge: 'Document Scanner Mode',
          guideText: 'Align OR/CR document inside the frame • Avoid glare & shadows',
        };
      case 'selfie':
      default:
        return {
          icon: <User className="w-4 h-4 text-emerald-400" />,
          displayTitle: title || 'Take Identification Selfie',
          subtitle: subTitle || 'Live front camera portrait for gate pass security badge',
          badge: 'Live Selfie Mode',
          guideText: 'Center your face inside the oval guide • Look directly at camera',
        };
    }
  };

  const { icon, displayTitle, subtitle, badge, guideText } = getHeaderDetails();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-slate-900 text-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-800 space-y-4 relative overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              {icon}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-extrabold text-white">{displayTitle}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="relative aspect-4/3 w-full bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
          {capturedImage ? (
            /* Captured Preview Mode */
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
              <img
                src={capturedImage}
                alt="Captured Snapshot"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-emerald-500/90 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center space-x-1 backdrop-blur-xs">
                <Check className="w-3.5 h-3.5" />
                <span>Photo Snapped Successfully</span>
              </div>
              <div className="absolute bottom-3 inset-x-3 text-center">
                <span className="inline-block bg-slate-900/80 border border-slate-700/80 text-[11px] text-slate-200 px-3 py-1 rounded-full backdrop-blur-xs">
                  Review photo: Ensure text & details are sharp before saving.
                </span>
              </div>
            </div>
          ) : (
            /* Live Camera Feed Mode */
            <>
              {cameraError ? (
                <div className="p-6 text-center text-white space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                  <p className="text-xs text-slate-300 max-w-xs">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => startCamera(facingMode)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center space-x-2 cursor-pointer shadow-md"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry Camera</span>
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transition-transform duration-200 ${
                      isMirrored ? '-scale-x-100' : 'scale-x-100'
                    }`}
                    onLoadedMetadata={() => setIsLoadingCamera(false)}
                  />

                  {/* ======================================================== */}
                  {/* OVERLAY GUIDES                                          */}
                  {/* ======================================================== */}
                  {isSelfie ? (
                    /* Selfie Oval Portrait Framing Guide */
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                      {/* Dimmed surrounding vignette */}
                      <div className="absolute inset-0 bg-slate-950/30" />

                      {/* Oval face guide */}
                      <div className="relative w-44 h-58 sm:w-52 sm:h-64 border-2 border-emerald-400/90 rounded-[50%] shadow-[0_0_20px_rgba(52,211,153,0.3)] z-10 flex items-center justify-center">
                        <div className="w-full h-[1px] bg-emerald-400/20 absolute" />
                        <div className="h-full w-[1px] bg-emerald-400/20 absolute" />
                      </div>

                      {/* Floating prompt pill */}
                      <span className="absolute bottom-3 z-10 text-[11px] text-emerald-200 bg-slate-950/80 border border-emerald-500/30 px-3.5 py-1 rounded-full backdrop-blur-xs font-semibold flex items-center space-x-1.5 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{guideText}</span>
                      </span>
                    </div>
                  ) : (
                    /* Document / Card / Receipt Framing Guide */
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                      {/* Darkened document border masking */}
                      <div className="absolute inset-0 bg-slate-950/40" />

                      {/* Dynamic Document Frame with Glowing Corner Brackets */}
                      <div className={`relative z-10 border border-emerald-400/40 shadow-[0_0_25px_rgba(52,211,153,0.25)] rounded-2xl flex items-center justify-center ${
                        resolvedMode === 'receipt'
                          ? 'w-56 h-64 sm:w-64 sm:h-72' // Tall document / receipt
                          : resolvedMode === 'id_card'
                            ? 'w-72 h-44 sm:w-84 sm:h-52' // Card landscape
                            : 'w-72 h-52 sm:w-88 sm:h-60' // General OR/CR document
                      }`}>
                        {/* 4 Precision Corner Brackets */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-3 border-l-3 border-emerald-400 rounded-tl-xl shadow-[0_0_8px_#34d399]" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-3 border-r-3 border-emerald-400 rounded-tr-xl shadow-[0_0_8px_#34d399]" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-3 border-l-3 border-emerald-400 rounded-bl-xl shadow-[0_0_8px_#34d399]" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-3 border-r-3 border-emerald-400 rounded-br-xl shadow-[0_0_8px_#34d399]" />

                        {/* Subtle alignment crosshair */}
                        <div className="w-6 h-[1px] bg-emerald-400/40 absolute" />
                        <div className="h-6 w-[1px] bg-emerald-400/40 absolute" />

                        {/* Document type corner watermark */}
                        <span className="absolute top-2 left-2 text-[9px] font-black uppercase tracking-wider text-emerald-300/80 bg-slate-950/70 px-2 py-0.5 rounded-md backdrop-blur-xs">
                          {resolvedMode === 'receipt' ? 'Receipt Target' : resolvedMode === 'id_card' ? 'License Target' : 'Document Target'}
                        </span>
                      </div>

                      {/* Floating prompt pill */}
                      <span className="absolute bottom-3 z-10 text-[11px] text-emerald-200 bg-slate-950/85 border border-emerald-500/30 px-3.5 py-1 rounded-full backdrop-blur-xs font-semibold flex items-center space-x-1.5 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{guideText}</span>
                      </span>
                    </div>
                  )}

                  {/* Top-Right Quick Controls Overlay */}
                  <div className="absolute top-3 right-3 z-20 flex items-center space-x-2">
                    {/* Torch / Flashlight Toggle (for rear camera in dim light) */}
                    {hasTorch && (
                      <button
                        type="button"
                        onClick={toggleTorch}
                        title={isTorchOn ? 'Turn Flashlight Off' : 'Turn Flashlight On'}
                        className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer shadow-md ${
                          isTorchOn
                            ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/50'
                            : 'bg-slate-950/80 text-slate-200 border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        {isTorchOn ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
                      </button>
                    )}

                    {/* Mirror / Flip Toggle (so users can un-invert/invert anytime) */}
                    <button
                      type="button"
                      onClick={toggleMirror}
                      title={isMirrored ? 'Mirror View Active (Normal selfie mode)' : 'Standard View Active'}
                      className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer shadow-md ${
                        isMirrored
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-950/80 text-slate-300 border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <FlipHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* Hidden Canvas for High-Resolution Snapshot Processing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls Bar */}
        <div className="pt-1">
          {capturedImage ? (
            /* Action Buttons for Captured Photo */
            <div className="flex w-full space-x-3">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-3 rounded-2xl border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake Photo</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-emerald-950/50 transition-all active:scale-98"
              >
                <Check className="w-4 h-4" />
                <span>Save This Photo</span>
              </button>
            </div>
          ) : (
            /* Action Buttons for Live Camera */
            <div className="flex w-full items-center justify-between">
              {/* Camera Switcher Button (Front / Rear) */}
              {!selfieOnly ? (
                <button
                  type="button"
                  onClick={toggleCamera}
                  title="Switch Camera (Front / Rear)"
                  className="px-3.5 py-2.5 rounded-2xl border border-slate-800 bg-slate-950/70 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-colors shadow-xs"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">
                    {facingMode === 'user' ? 'Switch to Rear' : 'Switch to Front'}
                  </span>
                </button>
              ) : (
                <div className="text-[11px] text-slate-400 font-medium flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Selfie Camera</span>
                </div>
              )}

              {/* Shutter Button (Classic Camera App Shutter) */}
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={takeSnapshot}
                  disabled={isLoadingCamera || !!cameraError}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black flex items-center space-x-2.5 cursor-pointer shadow-lg shadow-emerald-950/60 transition-all active:scale-95"
                >
                  <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <span>Take Photo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
