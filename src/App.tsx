import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { QRGenerator } from './components/QRGenerator';
import { QRScanner } from './components/QRScanner';
import { HistoryList } from './components/HistoryList';
import { Footer } from './components/Footer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { PrivacyModal } from './components/PrivacyModal';
import { 
  getHistory, 
  saveHistoryItem, 
  deleteHistoryItem, 
  clearHistory as clearStorageHistory, 
  HistoryItem 
} from './utils/historyStorage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('generator');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [generatorUrl, setGeneratorUrl] = useState<string>('');
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);

  useEffect(() => {
    setHistoryItems(getHistory());
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleGenerateSuccess = (url: string) => {
    const item = saveHistoryItem({
      type: 'generated',
      content: url,
      isUrl: true,
    });
    setHistoryItems((prev) => [item, ...prev.filter((i) => i.id !== item.id)]);
  };

  const handleScanSuccess = (content: string, isUrl: boolean) => {
    const item = saveHistoryItem({
      type: 'scanned',
      content,
      isUrl,
    });
    setHistoryItems((prev) => [item, ...prev.filter((i) => i.id !== item.id)]);
  };

  const handleDeleteItem = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistoryItems(updated);
    showToast('Entry removed from history', 'info');
  };

  const handleClearHistory = () => {
    clearStorageHistory();
    setHistoryItems([]);
    showToast('Activity history cleared', 'info');
  };

  const handleSelectForGeneration = (url: string) => {
    setGeneratorUrl(url);
    setActiveTab('generator');
    showToast('URL loaded into generator', 'info');
  };

  return (
    <div className="app-layout">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        historyCount={historyItems.length}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      <main className="main-content">
        {activeTab === 'generator' && (
          <QRGenerator
            key={generatorUrl}
            initialUrl={generatorUrl}
            onSuccessGenerate={handleGenerateSuccess}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'scanner' && (
          <QRScanner
            onSuccessScan={handleScanSuccess}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'history' && (
          <HistoryList
            items={historyItems}
            onClear={handleClearHistory}
            onDeleteItem={handleDeleteItem}
            onSelectForGeneration={handleSelectForGeneration}
            onShowToast={showToast}
          />
        )}
      </main>

      <Footer onOpenPrivacy={() => setIsPrivacyOpen(true)} />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
