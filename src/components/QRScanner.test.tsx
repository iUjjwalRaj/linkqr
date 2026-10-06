import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QRScanner } from './QRScanner';

const { mockScanFile, mockStart, mockStop, mockClear, mockGetCameras } = vi.hoisted(() => {
  const mScanFile = vi.fn();
  const mStart = vi.fn();
  const mStop = vi.fn();
  const mClear = vi.fn();
  const mGetCameras = vi.fn();
  return {
    mockScanFile: mScanFile,
    mockStart: mStart,
    mockStop: mStop,
    mockClear: mClear,
    mockGetCameras: mGetCameras,
  };
});

vi.mock('html5-qrcode', () => {
  class MockHtml5Qrcode {
    isScanning = false;
    start = mockStart;
    stop = mockStop;
    clear = mockClear;
    scanFile = mockScanFile;
    static getCameras = mockGetCameras;
  }

  return {
    Html5Qrcode: MockHtml5Qrcode,
  };
});

describe('QRScanner Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockScanFile.mockResolvedValue('https://qr.feminismindia.com');
    mockStart.mockResolvedValue(undefined);
    mockStop.mockResolvedValue(undefined);
    mockClear.mockResolvedValue(undefined);
    mockGetCameras.mockResolvedValue([
      { id: 'cam1', label: 'Rear Camera' },
    ]);
  });

  it('renders initial idle scanner state with start button and upload option', () => {
    const handleToast = vi.fn();
    render(<QRScanner onShowToast={handleToast} />);

    expect(screen.getByText(/Ready to Scan/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Camera Scanner/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Scan from Image File/i })).toBeInTheDocument();
  });

  it('triggers file upload QR scan and displays detected URL safely', async () => {
    const handleToast = vi.fn();
    const handleSuccess = vi.fn();
    render(<QRScanner onShowToast={handleToast} onSuccessScan={handleSuccess} />);

    const fileInput = document.getElementById('qr-file-input') as HTMLInputElement;
    const testFile = new File(['fake qr img'], 'qrcode.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Verified Web Link Detected/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /https:\/\/qr\.feminismindia\.com/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Open Link/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Copy Link/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Scan Another/i })).toBeInTheDocument();
    });

    expect(handleSuccess).toHaveBeenCalledWith('https://qr.feminismindia.com', true);
  });

  it('handles non-web plain text scan result safely without clickable link', async () => {
    mockScanFile.mockResolvedValueOnce('Plain text note inside QR');
    const handleToast = vi.fn();
    const handleSuccess = vi.fn();
    render(<QRScanner onShowToast={handleToast} onSuccessScan={handleSuccess} />);

    const fileInput = document.getElementById('qr-file-input') as HTMLInputElement;
    const testFile = new File(['fake text qr'], 'qrcode2.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Plain Text \/ Non-Web Content/i)).toBeInTheDocument();
      expect(screen.getByText('Plain text note inside QR')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Open Link/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Copy Text/i })).toBeInTheDocument();
    });

    expect(handleSuccess).toHaveBeenCalledWith('Plain text note inside QR', false);
  });

  it('handles dangerous schemes by disabling navigation and showing safety warning', async () => {
    mockScanFile.mockResolvedValueOnce('javascript:alert(document.domain)');
    const handleToast = vi.fn();
    render(<QRScanner onShowToast={handleToast} />);

    const fileInput = document.getElementById('qr-file-input') as HTMLInputElement;
    const testFile = new File(['dangerous'], 'danger.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Potentially Unsafe Content/i)).toBeInTheDocument();
      expect(screen.getByText('javascript:alert(document.domain)')).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Open Link/i })).not.toBeInTheDocument();
    });
  });
});
