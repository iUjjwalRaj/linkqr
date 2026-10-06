import React from 'react';
import { QrCode, ScanLine, ShieldCheck, Sparkles, Lock } from 'lucide-react';
import { getCurrentDomain } from '../utils/urlHelper';

export type ActiveTab = 'generator' | 'scanner' | 'history';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  historyCount: number;
  onOpenPrivacy: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  onTabChange, 
  historyCount,
  onOpenPrivacy 
}) => {
  const activeDomain = getCurrentDomain();

  return (
    <header className="app-header">
      <div className="header-top-banner">
        <button 
          type="button" 
          onClick={onOpenPrivacy}
          className="badge-pill privacy-badge-btn" 
          title="Learn about LinkQR privacy & client-side security"
        >
          <ShieldCheck size={14} className="badge-icon" />
          <span>100% Private & Client-Side</span>
          <Lock size={11} className="badge-sub-icon" />
        </button>

        <span className="badge-pill host-badge">
          <Sparkles size={14} className="badge-icon" />
          <span>{activeDomain}</span>
        </span>
      </div>

      <div className="logo-container">
        <div className="logo-icon-wrapper">
          <div className="logo-glow" />
          <div className="logo-box">
            <QrCode className="logo-icon" size={32} />
          </div>
        </div>
        <div className="logo-text-group">
          <h1 className="app-title">Link<span>QR</span></h1>
          <p className="app-subtitle">Create. Scan. Connect.</p>
        </div>
      </div>

      <nav className="tab-navigation" role="tablist" aria-label="LinkQR Navigation">
        <button
          id="tab-generator"
          role="tab"
          aria-selected={activeTab === 'generator'}
          aria-controls="panel-generator"
          className={`tab-btn ${activeTab === 'generator' ? 'tab-btn-active' : ''}`}
          onClick={() => onTabChange('generator')}
        >
          <QrCode size={18} />
          <span>QR Generator</span>
        </button>

        <button
          id="tab-scanner"
          role="tab"
          aria-selected={activeTab === 'scanner'}
          aria-controls="panel-scanner"
          className={`tab-btn ${activeTab === 'scanner' ? 'tab-btn-active' : ''}`}
          onClick={() => onTabChange('scanner')}
        >
          <ScanLine size={18} />
          <span>QR Scanner</span>
        </button>

        <button
          id="tab-history"
          role="tab"
          aria-selected={activeTab === 'history'}
          aria-controls="panel-history"
          className={`tab-btn ${activeTab === 'history' ? 'tab-btn-active' : ''}`}
          onClick={() => onTabChange('history')}
        >
          <span>Recent Activity</span>
          {historyCount > 0 && (
            <span className="tab-badge" aria-label={`${historyCount} items in history`}>
              {historyCount}
            </span>
          )}
        </button>
      </nav>
    </header>
  );
};
