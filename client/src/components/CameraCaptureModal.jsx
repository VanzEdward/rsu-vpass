import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, AlertCircle } from 'lucide-react';

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
  title = 'Take Identification Photo',
  selfieOnly = false,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('user'); // 'user' (front) or 'environment' (rear)
  const [isLoadingCamera, setIsLoadingCamera] = useState(true);

  const isReceipt = title.toLowerCase().includes('receipt');

  // Start webcam stream
  const startCamera = async (mode = facingMode) => {
    setIsLoadingCamera(true);
    setCameraError('');
    
    // Stop any existing stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: selfieOnly ? 'user' : mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Webcam stream error:', err);
      setCameraError(
        'Camera access is required to capture live verification photos. Please allow camera permissions in your browser and click Retry.'
      );
    } finally {
      setIsLoadingCamera(false);
    }
  };

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera(facingMode);
    }

    return () => {
      // Clean up stream on unmount
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  // Handle capture frame
  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);

    // Stop active camera stream while previewing
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Switch camera front/back
  const toggleCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    startCamera(newMode);
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
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    setCameraError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              <p className="text-[11px] text-slate-500">Live camera capture for identification verification</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="relative aspect-4/3 w-full bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-slate-200">
          {capturedImage ? (
            /* Captured Preview */
            <img
              src={capturedImage}
              alt="Captured Verification Snapshot"
              className="w-full h-full object-cover"
            />
          ) : (
            /* Live Camera Feed */
            <>
              {cameraError ? (
                <div className="p-6 text-center text-white space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                  <p className="text-xs text-slate-300 max-w-xs">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => startCamera(facingMode)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center space-x-2 cursor-pointer shadow-sm"
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
                    className="w-full h-full object-cover"
                    onLoadedMetadata={() => setIsLoadingCamera(false)}
                  />

                  {/* Frame Guide Overlay (Rectangular for Receipt, Oval for Face ID) */}
                  {isReceipt ? (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
                      <div className="w-64 h-44 sm:w-80 sm:h-52 border-2 border-dashed border-emerald-400/90 rounded-2xl shadow-xs" />
                      <span className="absolute bottom-3 text-[11px] text-white/90 bg-slate-900/70 px-3.5 py-1 rounded-full backdrop-blur-xs font-medium">
                        Align physical receipt inside the frame
                      </span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-44 h-56 border-2 border-dashed border-emerald-400/80 rounded-full shadow-xs" />
                      <span className="absolute bottom-3 text-[11px] text-white/90 bg-slate-900/70 px-3.5 py-1 rounded-full backdrop-blur-xs font-medium">
                        Center face inside the oval guide
                      </span>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Hidden Canvas for Snapshot processing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2">
          {capturedImage ? (
            /* Action Buttons for Captured Photo */
            <div className="flex w-full space-x-3">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake Photo</span>
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Save This Photo</span>
              </button>
            </div>
          ) : (
            /* Action Buttons for Live Camera */
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center space-x-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Camera View</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={toggleCamera}
                  title="Switch Camera (Front/Back)"
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={takeSnapshot}
                  disabled={isLoadingCamera || !!cameraError}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-sm transition-colors"
                >
                  <Camera className="w-4 h-4 text-emerald-100" />
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
