import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('LinkQR App Integration', () => {
  it('renders Header, tabs, and Generator view initially', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /LinkQR/i })).toBeInTheDocument();
    expect(screen.getByText(/Generate and scan QR codes instantly/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /QR Generator/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /QR Scanner/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Recent Activity/i })).toBeInTheDocument();

    // Default tab is generator
    expect(screen.getByRole('button', { name: /Generate QR Code/i })).toBeInTheDocument();
  });

  it('switches between tabs', () => {
    render(<App />);

    // Click Scanner tab
    const scannerTab = screen.getByRole('tab', { name: /QR Scanner/i });
    fireEvent.click(scannerTab);

    expect(screen.getByRole('button', { name: /Start Camera Scanner/i })).toBeInTheDocument();

    // Click History tab
    const historyTab = screen.getByRole('tab', { name: /Recent Activity/i });
    fireEvent.click(historyTab);

    expect(screen.getByRole('heading', { name: /Recent Activity/i })).toBeInTheDocument();
    expect(screen.getByText(/No history yet/i)).toBeInTheDocument();
  });

  it('contains footer with domain and camera note', () => {
    render(<App />);

    expect(screen.getByText(/https:\/\/qr\.ujjwalraj\.online/i)).toBeInTheDocument();
    expect(screen.getByText(/Note: Camera access & HTTPS context are required/i)).toBeInTheDocument();
  });
});
