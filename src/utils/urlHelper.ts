/**
 * URL validation, security filtering, contrast calculation, and domain resolution helpers for LinkQR
 */

export interface UrlValidationResult {
  isValid: boolean;
  errorMessage?: string;
  normalizedUrl?: string;
}

export interface DecodedQRInfo {
  rawText: string;
  isWebUrl: boolean;
  safeUrl: string;
  displayType: 'url' | 'plain_text' | 'non_http_scheme' | 'dangerous';
  domain?: string;
  protocol?: string;
  explanation?: string;
}

/**
 * Returns the currently active host domain (e.g. qr.feminismindia.com or qr.ujjwalraj.online)
 */
export function getCurrentDomain(): string {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return host;
    }
  }
  return 'qr.feminismindia.com';
}

/**
 * Returns the currently active full origin URL (e.g. https://qr.feminismindia.com or https://qr.ujjwalraj.online)
 */
export function getCurrentAppUrl(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const host = window.location.hostname;
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return window.location.origin;
    }
  }
  return 'https://qr.feminismindia.com';
}

/**
 * Validates if the string is a valid HTTP or HTTPS URL.
 * Strictly rejects dangerous or unsupported protocols (javascript:, data:, file:, etc.)
 */
export function isValidHttpUrl(stringToTest: string): boolean {
  if (!stringToTest || typeof stringToTest !== 'string') return false;
  const trimmed = stringToTest.trim();
  if (!trimmed) return false;

  try {
    const url = new URL(trimmed);
    // Only allow http and https protocols
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }
    // Hostname must exist and not be empty
    if (!url.hostname || url.hostname.length === 0) {
      return false;
    }
    // Disallow single dot or empty domain
    if (url.hostname === '.' || (!url.hostname.includes('.') && url.hostname !== 'localhost')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates input for the QR code generator with human-friendly error messages
 */
export function validateGeneratorUrl(input: string): UrlValidationResult {
  const trimmed = (input || '').trim();

  if (!trimmed) {
    return {
      isValid: false,
      errorMessage: 'Please enter a URL to generate a QR code.',
    };
  }

  // Check if user omitted protocol (e.g. example.com)
  if (!/^https?:\/\//i.test(trimmed)) {
    if (/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z]{2,})+/i.test(trimmed)) {
      return {
        isValid: false,
        errorMessage: `Please include the protocol prefix: https:// or http:// (e.g. https://${trimmed})`,
      };
    }
    return {
      isValid: false,
      errorMessage: 'Invalid URL format. URL must start with https:// or http://',
    };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        isValid: false,
        errorMessage: `Unsupported protocol "${parsed.protocol}". Only http:// and https:// URLs are supported.`,
      };
    }

    if (!parsed.hostname || parsed.hostname.length < 3 || (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost')) {
      return {
        isValid: false,
        errorMessage: 'Please enter a complete and valid domain name (e.g. https://example.com).',
      };
    }

    return {
      isValid: true,
      normalizedUrl: trimmed,
    };
  } catch {
    return {
      isValid: false,
      errorMessage: 'The entered URL is malformed. Please enter a valid web address.',
    };
  }
}

/**
 * Analyzes decoded QR scanner text to ensure safe handling
 */
export function analyzeScannedContent(rawContent: string): DecodedQRInfo {
  const trimmed = (rawContent || '').trim();

  if (!trimmed) {
    return {
      rawText: '',
      isWebUrl: false,
      safeUrl: '',
      displayType: 'plain_text',
      explanation: 'Empty content detected.',
    };
  }

  // Check for potentially dangerous schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('file:') ||
    lower.startsWith('blob:')
  ) {
    return {
      rawText: trimmed,
      isWebUrl: false,
      safeUrl: '',
      displayType: 'dangerous',
      explanation: 'Potentially unsafe URI scheme detected. Direct web navigation is blocked for your security.',
    };
  }

  // Check if it's a valid HTTP or HTTPS URL
  if (isValidHttpUrl(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      return {
        rawText: trimmed,
        isWebUrl: true,
        safeUrl: trimmed,
        displayType: 'url',
        domain: parsed.hostname,
        protocol: parsed.protocol.replace(':', ''),
        explanation: 'Valid website URL detected.',
      };
    } catch {
      // Fall through to plain text
    }
  }

  // Check for other non-http custom schemes (e.g. mailto:, tel:, sms:, wifi:, geo:)
  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (schemeMatch && schemeMatch[1] && !['http', 'https'].includes(schemeMatch[1].toLowerCase())) {
    return {
      rawText: trimmed,
      isWebUrl: false,
      safeUrl: '',
      displayType: 'non_http_scheme',
      protocol: schemeMatch[1].toLowerCase(),
      explanation: `Non-web scheme detected (${schemeMatch[1]}:). Direct web navigation is disabled.`,
    };
  }

  // Plain text or malformed string
  return {
    rawText: trimmed,
    isWebUrl: false,
    safeUrl: '',
    displayType: 'plain_text',
    explanation: 'Plain text or non-web content detected.',
  };
}

/**
 * Truncates long URLs for clean UI display
 */
export function truncateText(text: string, maxLength = 60): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Convert hex color to sRGB relative luminance value
 */
function getRelativeLuminance(hex: string): number {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length !== 6) return 0;

  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const srgb = [r, g, b].map(val => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

/**
 * Calculates WCAG contrast ratio between two hex colors (1.0 to 21.0)
 */
export function calculateContrastRatio(hex1: string, hex2: string): number {
  try {
    const lum1 = getRelativeLuminance(hex1);
    const lum2 = getRelativeLuminance(hex2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  } catch {
    return 21;
  }
}

/**
 * Determines if QR code colors have adequate contrast for real-world scanning (min ratio ~ 3.0)
 */
export function isContrastSafe(fgHex: string, bgHex: string): boolean {
  return calculateContrastRatio(fgHex, bgHex) >= 3.0;
}
