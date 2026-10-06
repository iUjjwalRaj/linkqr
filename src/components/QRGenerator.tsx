import React, { useState, useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { 
  Download, 
  Copy, 
  Check, 
  AlertCircle, 
  Sparkles, 
  ExternalLink, 
  SlidersHorizontal,
  FileImage
} from 'lucide-react';
import { validateGeneratorUrl, truncateText } from '../utils/urlHelper';

interface QRGeneratorProps {
  onSuccessGenerate?: (url: string) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  initialUrl?: string;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({ 
  onSuccessGenerate, 
  onShowToast, 
  initialUrl = '' 
}) => {
  const [inputUrl, setInputUrl] = useState<string>(initialUrl);
  const [activeQrUrl, setActiveQrUrl] = useState<string>(initialUrl ? (validateGeneratorUrl(initialUrl).isValid ? initialUrl : '') : '');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);

  // Customization options
  const [fgColor, setFgColor] = useState<string>('#090d16');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [includeMargin, setIncludeMargin] = useState<boolean>(true);

  const canvasRef = useRef<HTMLDivElement>(null);
  const qrCardRef = useRef<HTMLDivElement>(null);

  const handleGenerate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const validation = validateGeneratorUrl(inputUrl);
    if (!validation.isValid) {
      setErrorMessage(validation.errorMessage || 'Invalid URL entered.');
      return;
    }

    setErrorMessage('');
    const targetUrl = validation.normalizedUrl!;
    setActiveQrUrl(targetUrl);
    if (onSuccessGenerate) {
      onSuccessGenerate(targetUrl);
    }
    onShowToast('QR code generated successfully!', 'success');
  };

  const handleDownloadPng = async () => {
    if (!activeQrUrl) return;
    setIsDownloading(true);

    try {
      // Create offscreen canvas for super high-resolution crisp export
      const qrCanvas = canvasRef.current?.querySelector('canvas');
      if (!qrCanvas) {
        throw new Error('Canvas element not found for export');
      }

      // Convert canvas to downloadable PNG
      const pngUrl = qrCanvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      const safeFilename = `linkqr-${new URL(activeQrUrl).hostname.replace(/[^a-z0-9]/gi, '_')}.png`;
      
      downloadLink.href = pngUrl;
      downloadLink.download = safeFilename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      onShowToast(`Downloaded ${safeFilename}`, 'success');
    } catch (err) {
      console.error('Download error:', err);
      onShowToast('Failed to download QR code. Please try again.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!activeQrUrl) return;
    try {
      await navigator.clipboard.writeText(activeQrUrl);
      setIsCopied(true);
      onShowToast('URL copied to clipboard!', 'success');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      onShowToast('Unable to access clipboard.', 'error');
    }
  };

  const handleSampleClick = (sample: string) => {
    setInputUrl(sample);
    setErrorMessage('');
    const val = validateGeneratorUrl(sample);
    if (val.isValid && val.normalizedUrl) {
      setActiveQrUrl(val.normalizedUrl);
      if (onSuccessGenerate) onSuccessGenerate(val.normalizedUrl);
      onShowToast('Sample URL loaded & QR generated', 'info');
    }
  };

  const handleClear = () => {
    setInputUrl('');
    setErrorMessage('');
  };

  return (
    <div className="generator-card" id="panel-generator" role="tabpanel" aria-labelledby="tab-generator">
      <div className="card-header">
        <div>
          <h2 className="card-title">Generate QR Code</h2>
          <p className="card-desc">Enter any valid web address (HTTP / HTTPS) to create a custom scannable QR code.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className={`btn-ghost btn-sm ${showOptions ? 'btn-ghost-active' : ''}`}
          aria-expanded={showOptions}
          title="Customize colors & error correction"
        >
          <SlidersHorizontal size={16} />
          <span>Customize</span>
        </button>
      </div>

      <form onSubmit={handleGenerate} className="generator-form" noValidate>
        <div className="form-group">
          <label htmlFor="url-input" className="form-label">
            Target Website URL <span className="required-star">*</span>
          </label>
          <div className="input-wrapper">
            <input
              id="url-input"
              type="url"
              className={`text-input ${errorMessage ? 'input-error' : ''}`}
              placeholder="https://example.com or https://qr.ujjwalraj.online"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              autoComplete="url"
              spellCheck={false}
              aria-invalid={!!errorMessage}
              aria-describedby={errorMessage ? 'generator-error-msg' : undefined}
            />
            {inputUrl && (
              <button
                type="button"
                className="input-clear-btn"
                onClick={handleClear}
                aria-label="Clear input URL"
              >
                ×
              </button>
            )}
          </div>

          {errorMessage && (
            <div id="generator-error-msg" className="error-banner" role="alert">
              <AlertCircle size={16} className="error-icon" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="quick-samples">
            <span className="samples-label">Quick test:</span>
            <button
              type="button"
              className="sample-chip"
              onClick={() => handleSampleClick('https://qr.ujjwalraj.online')}
            >
              qr.ujjwalraj.online
            </button>
            <button
              type="button"
              className="sample-chip"
              onClick={() => handleSampleClick('https://github.com')}
            >
              github.com
            </button>
            <button
              type="button"
              className="sample-chip"
              onClick={() => handleSampleClick('https://en.wikipedia.org')}
            >
              wikipedia.org
            </button>
          </div>
        </div>

        {/* Customization Drawer */}
        {showOptions && (
          <div className="customization-drawer">
            <div className="options-grid">
              <div className="option-field">
                <label htmlFor="fg-color" className="option-label">Foreground Color</label>
                <div className="color-picker-row">
                  <input
                    id="fg-color"
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="color-input"
                  />
                  <span className="color-code">{fgColor}</span>
                </div>
              </div>

              <div className="option-field">
                <label htmlFor="bg-color" className="option-label">Background Color</label>
                <div className="color-picker-row">
                  <input
                    id="bg-color"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="color-input"
                  />
                  <span className="color-code">{bgColor}</span>
                </div>
              </div>

              <div className="option-field">
                <label htmlFor="error-level" className="option-label">Error Correction</label>
                <select
                  id="error-level"
                  value={errorLevel}
                  onChange={(e) => setErrorLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                  className="select-input"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30% - Best)</option>
                </select>
              </div>

              <div className="option-field checkbox-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeMargin}
                    onChange={(e) => setIncludeMargin(e.target.checked)}
                  />
                  <span>Quiet Zone Margin (Recommended)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            id="generate-qr-btn"
            className="btn btn-primary btn-large"
          >
            <Sparkles size={18} />
            <span>Generate QR Code</span>
          </button>
        </div>
      </form>

      {/* Generated QR Display Section */}
      {activeQrUrl ? (
        <div className="qr-result-section" ref={qrCardRef}>
          <div className="qr-frame-outer">
            <div className="qr-preview-wrapper" style={{ backgroundColor: bgColor }}>
              <QRCodeSVG
                value={activeQrUrl}
                size={230}
                level={errorLevel}
                fgColor={fgColor}
                bgColor={bgColor}
                includeMargin={includeMargin}
                className="qr-svg-display"
              />
            </div>

            {/* Hidden canvas for high-res PNG downloads */}
            <div ref={canvasRef} style={{ display: 'none' }}>
              <QRCodeCanvas
                value={activeQrUrl}
                size={1024}
                level={errorLevel}
                fgColor={fgColor}
                bgColor={bgColor}
                includeMargin={includeMargin}
              />
            </div>
          </div>

          <div className="qr-metadata">
            <div className="qr-url-badge">
              <span className="qr-url-label">Encoded Destination URL:</span>
              <a
                href={activeQrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="qr-url-link"
                title={activeQrUrl}
              >
                <span>{truncateText(activeQrUrl, 55)}</span>
                <ExternalLink size={14} className="link-icon" />
              </a>
            </div>

            <div className="qr-action-buttons">
              <button
                type="button"
                id="download-qr-btn"
                onClick={() => handleDownloadPng()}
                disabled={isDownloading}
                className="btn btn-primary"
              >
                <Download size={18} />
                <span>{isDownloading ? 'Preparing PNG...' : 'Download QR Code (PNG)'}</span>
              </button>

              <button
                type="button"
                id="copy-url-btn"
                onClick={handleCopyUrl}
                className="btn btn-secondary"
              >
                {isCopied ? <Check size={18} className="text-success" /> : <Copy size={18} />}
                <span>{isCopied ? 'Copied!' : 'Copy URL'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="qr-placeholder-state">
          <div className="placeholder-icon-box">
            <FileImage size={40} />
          </div>
          <p className="placeholder-title">No QR code generated yet</p>
          <p className="placeholder-sub">Type a URL above and click “Generate QR Code” to preview and download.</p>
        </div>
      )}
    </div>
  );
};
