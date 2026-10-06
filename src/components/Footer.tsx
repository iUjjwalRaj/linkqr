import React from 'react';
import { Camera, ExternalLink, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-info">
          <div className="footer-brand">
            <strong>LinkQR</strong>
            <span className="footer-dot">•</span>
            <span className="footer-domain-tag">
              <Globe size={13} />
              <a
                href="https://qr.ujjwalraj.online"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-domain-link"
              >
                https://qr.ujjwalraj.online
                <ExternalLink size={11} className="inline-ext-icon" />
              </a>
            </span>
          </div>
          <p className="footer-camera-note">
            <Camera size={14} className="camera-icon-note" />
            <span>Note: Camera access & HTTPS context are required for real-time QR scanning.</span>
          </p>
        </div>

        <div className="footer-meta">
          <span>Fast, private, client-side only</span>
          <span className="footer-dot">•</span>
          <span className="footer-credit">Built with React & Vite</span>
        </div>
      </div>
    </footer>
  );
};
