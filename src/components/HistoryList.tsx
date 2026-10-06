import React from 'react';
import { HistoryItem } from '../utils/historyStorage';
import { 
  History, 
  Trash2, 
  ExternalLink, 
  Copy, 
  QrCode, 
  ScanLine, 
  Check, 
  Clock,
  ShieldCheck,
  X
} from 'lucide-react';
import { truncateText } from '../utils/urlHelper';

interface HistoryListProps {
  items: HistoryItem[];
  onClear: () => void;
  onDeleteItem: (id: string) => void;
  onSelectForGeneration: (url: string) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  items,
  onClear,
  onDeleteItem,
  onSelectForGeneration,
  onShowToast,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      onShowToast('Copied to clipboard!', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      onShowToast('Failed to copy text', 'error');
    }
  };

  const formatTime = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
        ' · ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="history-card" id="panel-history" role="tabpanel" aria-labelledby="tab-history">
      <div className="card-header">
        <div>
          <h2 className="card-title">Recent Activity</h2>
          <p className="card-desc">Your locally saved history of generated and scanned QR codes.</p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="btn-ghost btn-sm text-danger"
            title="Clear all history"
            aria-label="Clear all history"
          >
            <Trash2 size={15} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      <div className="history-privacy-banner">
        <ShieldCheck size={15} className="text-cyan" />
        <span>Privacy Guarantee: History is stored strictly in your browser (localStorage) and never uploaded.</span>
      </div>

      {items.length === 0 ? (
        <div className="qr-placeholder-state">
          <div className="placeholder-icon-box">
            <History size={38} />
          </div>
          <p className="placeholder-title">No history yet</p>
          <p className="placeholder-sub">Generated and scanned QR codes will appear here for quick reference.</p>
        </div>
      ) : (
        <div className="history-items-list">
          {items.map((item) => (
            <div key={item.id} className="history-item-row">
              <div className="history-type-badge">
                {item.type === 'generated' ? (
                  <span className="type-tag tag-gen" title="Generated QR">
                    <QrCode size={13} />
                    <span>Generated</span>
                  </span>
                ) : (
                  <span className="type-tag tag-scan" title="Scanned QR">
                    <ScanLine size={13} />
                    <span>Scanned</span>
                  </span>
                )}
              </div>

              <div className="history-main-content">
                <div className="history-text-wrapper">
                  {item.isUrl ? (
                    <a
                      href={item.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="history-url-link"
                      title={item.content}
                    >
                      <span>{truncateText(item.content, 55)}</span>
                      <ExternalLink size={13} className="inline-ext-icon" />
                    </a>
                  ) : (
                    <span className="history-plain-text" title={item.content}>
                      {truncateText(item.content, 55)}
                    </span>
                  )}
                </div>

                <div className="history-timestamp">
                  <Clock size={12} />
                  <span>{formatTime(item.timestamp)}</span>
                </div>
              </div>

              <div className="history-action-buttons">
                {item.isUrl && (
                  <button
                    type="button"
                    onClick={() => onSelectForGeneration(item.content)}
                    className="btn-icon"
                    title="Load in QR Generator"
                    aria-label={`Load ${item.content} in Generator`}
                  >
                    <QrCode size={15} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleCopy(item.id, item.content)}
                  className="btn-icon"
                  title="Copy to clipboard"
                  aria-label={`Copy ${item.content}`}
                >
                  {copiedId === item.id ? <Check size={15} className="text-success" /> : <Copy size={15} />}
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  className="btn-icon btn-icon-danger"
                  title="Delete this entry"
                  aria-label={`Delete entry ${item.content}`}
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
