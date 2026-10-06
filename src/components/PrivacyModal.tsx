import React from 'react';
import { ShieldCheck, Lock, EyeOff, HardDrive, Globe, X } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="privacy-modal-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <ShieldCheck size={22} className="text-cyan" />
            </div>
            <h2 id="privacy-modal-title" className="modal-title">Privacy Architecture</h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close Privacy Modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-intro">
            LinkQR is engineered as a <strong>100% client-side privacy-first utility</strong>. Everything you generate or scan stays entirely on your local device.
          </p>

          <div className="privacy-feature-list">
            <div className="privacy-feature-item">
              <div className="feature-icon-box">
                <HardDrive size={18} />
              </div>
              <div className="feature-text">
                <strong>Local-Only Execution</strong>
                <p>QR code rendering, vector generation, and camera decoding execute directly inside your browser engine. No URLs or content are transmitted to any server.</p>
              </div>
            </div>

            <div className="privacy-feature-item">
              <div className="feature-icon-box">
                <Lock size={18} />
              </div>
              <div className="feature-text">
                <strong>Zero Camera Transmission</strong>
                <p>Camera streams are processed frame-by-frame in browser memory using web APIs. Live video feeds never leave your device and are immediately freed when scanning stops.</p>
              </div>
            </div>

            <div className="privacy-feature-item">
              <div className="feature-icon-box">
                <EyeOff size={18} />
              </div>
              <div className="feature-text">
                <strong>No Tracking & No Analytics</strong>
                <p>We do not use advertising beacons, third-party analytics trackers, or user telemetry cookies. You are completely anonymous.</p>
              </div>
            </div>

            <div className="privacy-feature-item">
              <div className="feature-icon-box">
                <Globe size={18} />
              </div>
              <div className="feature-text">
                <strong>Safe URL Navigation</strong>
                <p>Scanned links are sanitized against malicious schemes (like javascript: or data: URIs) and opened only in secure isolated browser tabs.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-primary w-full" onClick={onClose}>
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
