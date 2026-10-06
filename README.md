# LinkQR — Create. Scan. Connect. 🔗📱

**LinkQR** is a modern, fast, private, and client-side web application for generating high-resolution QR codes from web addresses and scanning QR codes in real-time using device cameras or image files.

Production Targets:
- **Canonical Product Domain**: [https://qr.feminismindia.com](https://qr.feminismindia.com)
- **Alternate Domain Alias**: [https://qr.ujjwalraj.online](https://qr.ujjwalraj.online)

---

## ✨ Features

### 1. 🔲 QR Code Generator
- **URL Validation**: Strict validation for HTTP/HTTPS URLs with user-friendly formatting tips and error messages.
- **Dynamic Generation**: Generates high-quality vector SVG and ultra high-resolution (1024×1024) Canvas exports.
- **Dual Format Downloads**: Download as high-resolution **PNG** or scalable vector **SVG** for digital or print media.
- **Contrast Safety Warnings**: Automatically computes color luminance ratios and warns users if custom colors lack sufficient contrast for scanning.
- **Customization Options**: Adjust foreground colors, background colors, error correction levels (L, M, Q, H), and quiet zone margins.
- **Quick Test Presets**: Instant load chips for `qr.feminismindia.com`, `github.com`, and `wikipedia.org`.
- **Copy & Share**: URL copying with toast notifications and native Web Share API support on mobile devices.

### 2. 📷 QR Code Scanner
- **Live Camera Scanning**: High-framerate real-time QR detection using browser media devices (`html5-qrcode`).
- **Environment Camera Preference**: Automatically selects the rear/environment-facing camera on mobile devices.
- **Camera Selection**: Seamlessly switch between multiple cameras (front/back/external).
- **Duplicate Debounce**: Prevents rapid duplicate triggering when a QR code stays in frame.
- **Graceful Error Handling**: Handles camera permission denial, unsupported devices, and busy camera locks with clear guidance.
- **File Upload Fallback**: Option to scan QR codes directly from image files without requiring camera access.
- **Safe Link Navigation**: 
  - Valid `http://` and `https://` URLs are displayed prominently with direct "Open Link" (in new tab with safe `rel="noopener noreferrer"`) and "Copy Link" buttons.
  - Plain text, malformed URLs, and non-HTTP schemes (e.g. `javascript:`, `data:`, `file:`, `mailto:`, etc.) are safely displayed as non-navigable text with security alerts to prevent malicious redirection.
- **Stream Cleanup**: Properly stops and releases all media tracks and camera hardware upon scan completion or component unmount.

### 3. 🕒 Recent Activity (History)
- Local browser storage (`localStorage`) of generated and scanned codes.
- Individual entry deletion and full history clear controls.
- Re-open URLs, load into generator with one click, or copy to clipboard.
- 100% private to the user's browser; never transmitted over the network.

### 4. 🔒 Privacy-First Architecture
- **100% Client-Side**: No user URLs, images, or camera streams are sent to any remote server.
- **No Analytics / No Tracking**: Zero tracking pixels, telemetry cookies, or external logging.
- **HTTPS Enforced**: Scanner requires secure context for browser camera access.
- **Cloudflare Headers**: Configures Content Security, Permissions-Policy (`camera=(self)`), and HSTS.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 6
- **QR Encoding**: `qrcode.react`
- **QR Decoding**: `html5-qrcode`
- **Icons**: `lucide-react`
- **Delight Effects**: `canvas-confetti`
- **Styling**: Vanilla Modern CSS (SaaS utility aesthetic, responsive)
- **Testing**: Vitest + Testing Library

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+
- npm 9+

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Run Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
```
Production assets are generated in the `dist/` directory.

---

## 🌐 Cloudflare Deployment Guide (Dual Custom Domains)

LinkQR is configured for deployment to **Cloudflare** with single-page-application assets routing serving both custom domains simultaneously:
- `https://qr.feminismindia.com` (Preferred canonical URL)
- `https://qr.ujjwalraj.online` (Alternate production alias)

### Deploying via Wrangler CLI

```bash
# 1. Build the production application
npm run build

# 2. Deploy to Cloudflare
npx wrangler deploy
```

The application is deployed across global edge points with zero redirects between domains.
