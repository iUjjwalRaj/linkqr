import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import {
  Camera,
  CameraOff,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Upload,
  ShieldAlert,
  ShieldCheck,
  FileText,
  HelpCircle,
  Share2
} from 'lucide-react';
import { analyzeScannedContent, DecodedQRInfo } from '../utils/urlHelper';

interface QRScannerProps {
  onSuccessScan?: (content: string, isUrl: boolean) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onSuccessScan, onShowToast }) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<DecodedQRInfo | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isFileScanning, setIsFileScanning] = useState<boolean>(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isStoppingRef = useRef<boolean>(false);
  const lastScannedTimeRef = useRef<number>(0);

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      cleanupScanner();
    };
  }, []);

  const cleanupScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          isStoppingRef.current = true;
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn('Error during scanner cleanup:', err);
      } finally {
        scannerRef.current = null;
        isStoppingRef.current = false;
      }
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    if (!decodedText || isStoppingRef.current) return;

    // Prevent rapid duplicate scans within 1.5s
    const now = Date.now();
    if (now - lastScannedTimeRef.current < 1500) {
      return;
    }
    lastScannedTimeRef.current = now;

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#38bdf8', '#818cf8', '#34d399', '#f472b6'],
      });
    } catch {
      // Ignore confetti errors
    }

    // Stop scanner after successful scan
    await stopScanner();

    // Analyze content safety and protocol
    const analysis = analyzeScannedContent(decodedText);
    setScanResult(analysis);

    if (onSuccessScan) {
      onSuccessScan(analysis.rawText, analysis.isWebUrl);
    }

    if (analysis.isWebUrl) {
      onShowToast('Web URL detected!', 'success');
    } else {
      onShowToast('QR code decoded (Non-web content)', 'info');
    }
  };

  const startScanner = async () => {
    setCameraError(null);
    setIsInitializing(true);

    try {
      // Check for HTTPS / secure context
      if (
        window.location.protocol !== 'https:' &&
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1'
      ) {
        throw new Error('Camera access requires an HTTPS secure context. Please use HTTPS.');
      }

      // Check for camera device support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser or device does not support camera video streaming.');
      }

      // First clean up any existing instance
      await cleanupScanner();

      // Enumerate cameras for user choice
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setAvailableCameras(devices);
          if (!selectedCameraId) {
            // Pick rear camera if found, else first camera
            const backCam = devices.find((d) =>
              /back|rear|environment/i.test(d.label)
            );
            setSelectedCameraId(backCam ? backCam.id : devices[0].id);
          }
        }
      } catch (camEnumErr) {
        console.warn('Could not enumerate cameras, falling back to default facing mode:', camEnumErr);
      }

      const html5QrCode = new Html5Qrcode('scanner-viewfinder-box');
      scannerRef.current = html5QrCode;

      const cameraConfig = selectedCameraId
        ? { deviceId: { exact: selectedCameraId } }
        : { facingMode: 'environment' };

      const qrConfig = {
        fps: 10,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdge * 0.75);
          return {
            width: Math.max(180, Math.min(qrboxSize, 280)),
            height: Math.max(180, Math.min(qrboxSize, 280)),
          };
        },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        cameraConfig,
        qrConfig,
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // Ignored per-frame no-code event
        }
      );

      setIsScanning(true);
      setIsInitializing(false);
      onShowToast('Camera started. Point at a QR code.', 'info');
    } catch (err: unknown) {
      console.error('Camera initialization error:', err);
      setIsInitializing(false);
      setIsScanning(false);
      await cleanupScanner();

      const errorObj = err as Error;
      let userFriendlyMsg = 'Unable to start camera scanner.';

      if (
        errorObj.name === 'NotAllowedError' ||
        errorObj.name === 'PermissionDeniedError' ||
        errorObj.message?.includes('Permission denied') ||
        errorObj.message?.includes('NotAllowedError')
      ) {
        userFriendlyMsg = 'Camera permission was denied. Please allow camera access in your browser settings to scan QR codes.';
      } else if (
        errorObj.name === 'NotFoundError' ||
        errorObj.name === 'DevicesNotFoundError' ||
        errorObj.message?.includes('No camera')
      ) {
        userFriendlyMsg = 'No camera found on your device. You can upload an image file to scan instead.';
      } else if (errorObj.name === 'NotReadableError' || errorObj.name === 'TrackStartError') {
        userFriendlyMsg = 'Camera is currently in use by another application or tab.';
      } else if (errorObj.message) {
        userFriendlyMsg = errorObj.message;
      }

      setCameraError(userFriendlyMsg);
      onShowToast(userFriendlyMsg, 'error');
    }
  };

  const stopScanner = async () => {
    setIsInitializing(true);
    await cleanupScanner();
    setIsScanning(false);
    setIsInitializing(false);
  };

  const handleScanAgain = () => {
    setScanResult(null);
    setCameraError(null);
    startScanner();
  };

  const handleCopy = async () => {
    if (!scanResult?.rawText) return;
    try {
      await navigator.clipboard.writeText(scanResult.rawText);
      setIsCopied(true);
      onShowToast(scanResult.isWebUrl ? 'Link copied to clipboard!' : 'Decoded text copied!', 'success');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      onShowToast('Unable to copy to clipboard.', 'error');
    }
  };

  const handleShare = async () => {
    if (!scanResult?.rawText) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Scanned QR Code',
          text: scanResult.rawText,
          url: scanResult.isWebUrl ? scanResult.safeUrl : undefined,
        });
        onShowToast('Shared successfully!', 'success');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsFileScanning(true);
    setCameraError(null);

    try {
      const html5QrCode = new Html5Qrcode('file-scanner-temp-box');
      const decodedResult = await html5QrCode.scanFile(file, true);
      await html5QrCode.clear();

      if (decodedResult) {
        handleScanSuccess(decodedResult);
      } else {
        throw new Error('No QR code found in the selected image.');
      }
    } catch (err: unknown) {
      console.error('File scan error:', err);
      const msg = 'Could not find a valid QR code in this image. Please ensure the QR code is clearly visible.';
      setCameraError(msg);
      onShowToast(msg, 'error');
    } finally {
      setIsFileScanning(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="scanner-card" id="panel-scanner" role="tabpanel" aria-labelledby="tab-scanner">
      <div className="card-header">
        <div>
          <h2 className="card-title">Scan QR Code</h2>
          <p className="card-desc">Scan in real time with your device camera or upload an image file.</p>
        </div>
      </div>

      {/* Main Scanner Container */}
      <div className="scanner-body">
        {/* Active Scan Results View */}
        {scanResult ? (
          <div className="scan-result-card" role="region" aria-label="Scan Result">
            <div className={`result-header-badge ${scanResult.isWebUrl ? 'badge-success' : 'badge-warning'}`}>
              {scanResult.isWebUrl ? (
                <>
                  <ShieldCheck size={20} className="badge-icon-lg" />
                  <span>Verified Web Link Detected</span>
                </>
              ) : scanResult.displayType === 'dangerous' ? (
                <>
                  <ShieldAlert size={20} className="badge-icon-lg text-danger" />
                  <span>Potentially Unsafe Content</span>
                </>
              ) : (
                <>
                  <FileText size={20} className="badge-icon-lg" />
                  <span>Plain Text / Non-Web Content</span>
                </>
              )}
            </div>

            <div className="result-content-container">
              <span className="result-label">Decoded Content:</span>
              
              {scanResult.isWebUrl ? (
                <div className="result-url-box">
                  <a
                    href={scanResult.safeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="scanned-link"
                    id="scanned-web-link"
                  >
                    <span className="scanned-url-text">{scanResult.safeUrl}</span>
                    <ExternalLink size={16} className="ext-icon" />
                  </a>
                  {scanResult.domain && (
                    <span className="domain-pill">Domain: {scanResult.domain}</span>
                  )}
                </div>
              ) : (
                <div className="result-plain-box">
                  <p className="scanned-plain-text">{scanResult.rawText}</p>
                  <p className="safety-note">
                    <HelpCircle size={14} />
                    <span>{scanResult.explanation || 'This content is not an HTTP/HTTPS web address. Direct navigation is disabled for your safety.'}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="result-actions-row">
              {scanResult.isWebUrl && (
                <a
                  href={scanResult.safeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-large"
                  id="open-link-btn"
                >
                  <ExternalLink size={18} />
                  <span>Open Link</span>
                </a>
              )}

              <button
                type="button"
                onClick={handleCopy}
                className="btn btn-secondary btn-large"
                id="copy-scanned-btn"
              >
                {isCopied ? <Check size={18} className="text-success" /> : <Copy size={18} />}
                <span>{isCopied ? 'Copied!' : (scanResult.isWebUrl ? 'Copy Link' : 'Copy Text')}</span>
              </button>

              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={handleShare}
                  className="btn btn-secondary"
                  id="share-scanned-btn"
                >
                  <Share2 size={18} />
                  <span>Share</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleScanAgain}
                className="btn btn-ghost"
                id="scan-again-btn"
              >
                <RefreshCw size={18} />
                <span>Scan Another</span>
              </button>
            </div>
          </div>
        ) : (
          /* Live Camera / Initial Scanner View */
          <div className="scanner-view-container">
            {/* Viewfinder element required by Html5Qrcode */}
            <div className={`viewfinder-wrapper ${isScanning ? 'viewfinder-active' : ''}`}>
              <div id="scanner-viewfinder-box" className="html5-qr-viewfinder" />
              
              {/* Overlay animated laser beam & corner guides during live scanning */}
              {isScanning && (
                <div className="scanner-overlay-laser">
                  <div className="laser-line" />
                  <div className="corner-tl" />
                  <div className="corner-tr" />
                  <div className="corner-bl" />
                  <div className="corner-br" />
                  <span className="viewfinder-hint">Align QR code inside the frame</span>
                </div>
              )}

              {/* Initial idle state */}
              {!isScanning && !isInitializing && (
                <div className="scanner-idle-state">
                  <div className="idle-camera-icon">
                    <Camera size={44} />
                  </div>
                  <h3>Ready to Scan</h3>
                  <p>Click “Start Camera Scanner” to enable camera and scan QR codes in real time.</p>
                </div>
              )}

              {/* Initializing / Loading state */}
              {isInitializing && (
                <div className="scanner-loading-state">
                  <div className="spinner" />
                  <p>Connecting to camera...</p>
                </div>
              )}
            </div>

            {/* Hidden box for file scans */}
            <div id="file-scanner-temp-box" style={{ display: 'none' }} />

            {/* Error Message */}
            {cameraError && (
              <div className="error-banner" role="alert">
                <AlertTriangle size={18} className="error-icon" />
                <div className="error-text">
                  <strong>Camera Notice:</strong>
                  <p>{cameraError}</p>
                </div>
              </div>
            )}

            {/* Scanner Controls */}
            <div className="scanner-controls-grid">
              {!isScanning ? (
                <div className="start-actions-group">
                  <button
                    type="button"
                    id="start-scanner-btn"
                    onClick={startScanner}
                    disabled={isInitializing}
                    className="btn btn-primary btn-large w-full"
                  >
                    <Camera size={18} />
                    <span>{isInitializing ? 'Starting Camera...' : 'Start Camera Scanner'}</span>
                  </button>

                  <div className="divider-or">
                    <span>or upload an image</span>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="file-input-hidden"
                    id="qr-file-input"
                  />
                  <button
                    type="button"
                    id="upload-image-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isFileScanning || isInitializing}
                    className="btn btn-secondary w-full"
                  >
                    <Upload size={18} />
                    <span>{isFileScanning ? 'Analyzing Image...' : 'Scan from Image File'}</span>
                  </button>
                </div>
              ) : (
                <div className="active-scanning-controls">
                  {availableCameras.length > 1 && (
                    <div className="camera-selector-row">
                      <label htmlFor="cam-select" className="cam-label">Switch Camera:</label>
                      <select
                        id="cam-select"
                        value={selectedCameraId}
                        onChange={async (e) => {
                          const newId = e.target.value;
                          setSelectedCameraId(newId);
                          await stopScanner();
                          // restart with new camera
                          setTimeout(() => startScanner(), 100);
                        }}
                        className="select-input select-sm"
                      >
                        {availableCameras.map((cam, idx) => (
                          <option key={cam.id} value={cam.id}>
                            {cam.label || `Camera ${idx + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    type="button"
                    id="stop-scanner-btn"
                    onClick={stopScanner}
                    className="btn btn-danger w-full"
                  >
                    <CameraOff size={18} />
                    <span>Stop Scanner</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
