import { describe, it, expect } from 'vitest';
import { 
  isValidHttpUrl, 
  validateGeneratorUrl, 
  analyzeScannedContent, 
  truncateText,
  calculateContrastRatio,
  isContrastSafe
} from './urlHelper';

describe('urlHelper utilities', () => {
  describe('isValidHttpUrl', () => {
    it('returns true for valid https URLs', () => {
      expect(isValidHttpUrl('https://qr.feminismindia.com')).toBe(true);
      expect(isValidHttpUrl('https://example.com/path?param=1#hash')).toBe(true);
      expect(isValidHttpUrl('https://sub.domain.org:8080/test')).toBe(true);
    });

    it('returns true for valid http URLs', () => {
      expect(isValidHttpUrl('http://example.com')).toBe(true);
      expect(isValidHttpUrl('http://localhost:5173')).toBe(true);
    });

    it('returns false for empty or non-string inputs', () => {
      expect(isValidHttpUrl('')).toBe(false);
      expect(isValidHttpUrl('   ')).toBe(false);
    });

    it('returns false for non-http/https protocols (security protection)', () => {
      expect(isValidHttpUrl('javascript:alert(1)')).toBe(false);
      expect(isValidHttpUrl('data:text/html,<h1>test</h1>')).toBe(false);
      expect(isValidHttpUrl('file:///etc/passwd')).toBe(false);
      expect(isValidHttpUrl('ftp://ftp.example.com')).toBe(false);
      expect(isValidHttpUrl('mailto:contact@feminismindia.com')).toBe(false);
    });

    it('returns false for malformed or incomplete URLs', () => {
      expect(isValidHttpUrl('http://')).toBe(false);
      expect(isValidHttpUrl('https://')).toBe(false);
      expect(isValidHttpUrl('not a url')).toBe(false);
      expect(isValidHttpUrl('example.com')).toBe(false); // missing protocol
    });
  });

  describe('validateGeneratorUrl', () => {
    it('identifies empty input with helpful message', () => {
      const result = validateGeneratorUrl('');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('Please enter a URL');
    });

    it('detects missing protocol and provides guidance', () => {
      const result = validateGeneratorUrl('example.com');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('https:// or http://');
    });

    it('validates correct full URL', () => {
      const result = validateGeneratorUrl('https://qr.feminismindia.com');
      expect(result.isValid).toBe(true);
      expect(result.normalizedUrl).toBe('https://qr.feminismindia.com');
      expect(result.errorMessage).toBeUndefined();
    });

    it('rejects unsupported protocols', () => {
      const result = validateGeneratorUrl('javascript:alert(1)');
      expect(result.isValid).toBe(false);
    });
  });

  describe('analyzeScannedContent', () => {
    it('correctly classifies valid web URLs', () => {
      const info = analyzeScannedContent('https://qr.feminismindia.com');
      expect(info.isWebUrl).toBe(true);
      expect(info.displayType).toBe('url');
      expect(info.domain).toBe('qr.feminismindia.com');
      expect(info.safeUrl).toBe('https://qr.feminismindia.com');
    });

    it('blocks dangerous schemes from becoming clickable web links', () => {
      const info = analyzeScannedContent('javascript:alert(document.cookie)');
      expect(info.isWebUrl).toBe(false);
      expect(info.displayType).toBe('dangerous');
      expect(info.safeUrl).toBe('');
      expect(info.explanation).toContain('Potentially unsafe');
    });

    it('classifies plain text properly without broken links', () => {
      const info = analyzeScannedContent('Just some normal text inside a QR code');
      expect(info.isWebUrl).toBe(false);
      expect(info.displayType).toBe('plain_text');
      expect(info.safeUrl).toBe('');
    });

    it('classifies non-http custom schemes properly', () => {
      const info = analyzeScannedContent('mailto:info@feminismindia.com');
      expect(info.isWebUrl).toBe(false);
      expect(info.displayType).toBe('non_http_scheme');
      expect(info.protocol).toBe('mailto');
    });
  });

  describe('truncateText', () => {
    it('leaves short text untouched', () => {
      expect(truncateText('https://short.com', 50)).toBe('https://short.com');
    });

    it('truncates long text with ellipsis', () => {
      const longUrl = 'https://example.com/a/very/long/nested/path/with/many/parameters/and/tokens';
      const truncated = truncateText(longUrl, 25);
      expect(truncated.length).toBe(25);
      expect(truncated.endsWith('...')).toBe(true);
    });
  });

  describe('Color contrast helpers', () => {
    it('calculates high contrast ratio between black and white', () => {
      const ratio = calculateContrastRatio('#000000', '#ffffff');
      expect(ratio).toBeGreaterThan(15);
      expect(isContrastSafe('#000000', '#ffffff')).toBe(true);
    });

    it('detects unsafe low contrast combinations', () => {
      expect(isContrastSafe('#333333', '#444444')).toBe(false);
      expect(isContrastSafe('#ffffff', '#eeeeee')).toBe(false);
    });
  });
});
