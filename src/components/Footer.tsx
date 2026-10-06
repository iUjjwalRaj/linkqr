import React from 'react';
import { Camera, ExternalLink, Globe, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy }) => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-info">
          <div className="footer-brand">
            <strong>LinkQR</strong>
            <span className="footer-tagline-text">Create. Scan. Connect.</span>
            <span className="footer-dot">•</span>
            <span className="footer-domain-tag">
              <Globe size={13} />
              <a
                href="https://qr.feminismindia.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-domain-link"
              >
                qr.feminismindia.com
                <ExternalLink size={11} className="inline-ext-icon" />
              </a>
            </span>
          </div>
          <p className="footer-camera-note">
            <Camera size={14} className="camera-icon-note" />
            <span>Camera access & HTTPS context are required for live QR scanning.</span>
          </p>
        </div>

        <div className="footer-meta">
          <button 
            type="button" 
            onClick={onOpenPrivacy}
            className="footer-privacy-btn"
          >
            <ShieldCheck size={13} />
            <span>100% Client-Side Privacy</span>
          </button>
          <span className="footer-dot">•</span>
          <span className="footer-credit">Built with React & Vite</span>
        </div>
      </div>
    </footer>
  );
};
