import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';

describe('LinkQR App Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders Header, tabs, and Generator view initially', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /LinkQR/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Create\. Scan\. Connect\./i).length).toBeGreaterThan(0);
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

  it('contains footer with new domain and camera note', () => {
    render(<App />);

    const footerDomainLink = screen.getByRole('link', { name: /qr\.feminismindia\.com/i });
    expect(footerDomainLink).toBeInTheDocument();
    expect(footerDomainLink).toHaveAttribute('href', 'https://qr.feminismindia.com');
    expect(screen.getByText(/Camera access & HTTPS context are required/i)).toBeInTheDocument();
  });

  it('opens and closes the Privacy Modal', () => {
    render(<App />);

    const privacyBtn = screen.getByRole('button', { name: /100% Private & Client-Side/i });
    fireEvent.click(privacyBtn);

    expect(screen.getByRole('heading', { name: /Privacy Architecture/i })).toBeInTheDocument();
    expect(screen.getByText(/Local-Only Execution/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Close Privacy Modal/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('heading', { name: /Privacy Architecture/i })).not.toBeInTheDocument();
  });
});
