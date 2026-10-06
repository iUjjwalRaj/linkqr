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
    fireEvent.change(input, { target: { value: 'https://qr.ujjwalraj.online' } });

    const generateBtn = screen.getByRole('button', { name: /Generate QR Code/i });
    fireEvent.click(generateBtn);

    expect(screen.getByRole('link', { name: /qr\.ujjwalraj\.online/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download QR Code/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Copy URL/i })).toBeInTheDocument();
    expect(handleSuccess).toHaveBeenCalledWith('https://qr.ujjwalraj.online');
    expect(handleToast).toHaveBeenCalledWith('QR code generated successfully!', 'success');
  });

  it('populates and generates when clicking sample chip', () => {
    const handleToast = vi.fn();
    render(<QRGenerator onShowToast={handleToast} />);

    const sampleChip = screen.getByRole('button', { name: /qr\.ujjwalraj\.online/i });
    fireEvent.click(sampleChip);

    expect(screen.getByDisplayValue('https://qr.ujjwalraj.online')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download QR Code/i })).toBeInTheDocument();
  });

  it('toggles customize drawer', () => {
    const handleToast = vi.fn();
    render(<QRGenerator onShowToast={handleToast} />);

    const customizeBtn = screen.getByRole('button', { name: /Customize/i });
    fireEvent.click(customizeBtn);

    expect(screen.getByLabelText(/Foreground Color/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Background Color/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Error Correction/i)).toBeInTheDocument();
  });
});
