import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QRGenerator } from './QRGenerator';

describe('QRGenerator Component', () => {
  it('renders input and generate button', () => {
    const handleToast = vi.fn();
    render(<QRGenerator onShowToast={handleToast} />);

    expect(screen.getByLabelText(/Target Website URL/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate QR Code/i })).toBeInTheDocument();
  });

  it('shows error banner when submitting empty input', () => {
    const handleToast = vi.fn();
    render(<QRGenerator onShowToast={handleToast} />);

    const generateBtn = screen.getByRole('button', { name: /Generate QR Code/i });
    fireEvent.click(generateBtn);

    expect(screen.getByRole('alert')).toHaveTextContent(/Please enter a URL/i);
  });

  it('shows error when submitting URL without http/https', () => {
    const handleToast = vi.fn();
    render(<QRGenerator onShowToast={handleToast} />);

    const input = screen.getByLabelText(/Target Website URL/i);
    fireEvent.change(input, { target: { value: 'example.com' } });

    const generateBtn = screen.getByRole('button', { name: /Generate QR Code/i });
    fireEvent.click(generateBtn);

    expect(screen.getByRole('alert')).toHaveTextContent(/https:\/\/ or http:\/\//i);
  });

  it('generates QR code when valid URL is entered', () => {
    const handleToast = vi.fn();
    const handleSuccess = vi.fn();
    render(<QRGenerator onShowToast={handleToast} onSuccessGenerate={handleSuccess} />);

    const input = screen.getByLabelText(/Target Website URL/i);
    fireEvent.change(input, { target: { value: 'https://qr.feminismindia.com' } });

    const generateBtn = screen.getByRole('button', { name: /Generate QR Code/i });
    fireEvent.click(generateBtn);

    expect(screen.getByRole('link', { name: /qr\.feminismindia\.com/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download PNG/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download SVG/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copy URL/i })).toBeInTheDocument();
    expect(handleSuccess).toHaveBeenCalledWith('https://qr.feminismindia.com');
    expect(handleToast).toHaveBeenCalledWith('QR code generated successfully!', 'success');
  });

  it('populates and generates when clicking sample chip', () => {
    const handleToast = vi.fn();
    render(<QRGenerator onShowToast={handleToast} />);

    const sampleChip = screen.getByRole('button', { name: /qr\.feminismindia\.com/i });
    fireEvent.click(sampleChip);

    expect(screen.getByDisplayValue('https://qr.feminismindia.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download PNG/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download SVG/i })).toBeInTheDocument();
  });

  it('toggles customize drawer and displays color inputs', () => {
    const handleToast = vi.fn();
    render(<QRGenerator onShowToast={handleToast} />);

    const customizeBtn = screen.getByRole('button', { name: /Customize/i });
    fireEvent.click(customizeBtn);

    expect(screen.getByLabelText(/Foreground Color/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Background Color/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Error Correction/i)).toBeInTheDocument();
  });

  it('resets generator state when clicking reset button', () => {
    const handleToast = vi.fn();
    render(<QRGenerator onShowToast={handleToast} initialUrl="https://qr.feminismindia.com" />);

    const resetBtn = screen.getByRole('button', { name: /Reset Generator/i });
    fireEvent.click(resetBtn);

    expect(screen.getByLabelText(/Target Website URL/i)).toHaveValue('');
    expect(handleToast).toHaveBeenCalledWith('Generator reset to defaults', 'info');
  });
});
