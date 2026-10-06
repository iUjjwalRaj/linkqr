# LinkQR 🔗📱

**LinkQR** is a modern, fast, private, and client-side web application for generating high-resolution QR codes from web addresses and scanning QR codes in real-time using device cameras or image files.

Production Target: [https://qr.ujjwalraj.online](https://qr.ujjwalraj.online)

---

## ✨ Features

### 1. 🔲 QR Code Generator
- **URL Validation**: Strict validation for HTTP/HTTPS URLs with user-friendly formatting tips and error messages.
- **Dynamic Generation**: Generates high-quality vector SVG and ultra high-resolution (1024×1024) Canvas exports.
- **One-Click PNG Download**: Clean white background and quiet zone margin for high-reliability scanning from any device or print medium.
- **Customization Options**: Expandable drawer to customize foreground colors, background colors, error correction levels (L, M, Q, H), and quiet zone margins.
- **Quick Test Presets**: Instant load chips for `qr.ujjwalraj.online`, `github.com`, and `wikipedia.org`.
- **Copy URL**: One-click clipboard copy with animated toast notifications.

### 2. 📷 QR Code Scanner
- **Live Camera Scanning**: High-framerate real-time QR detection using browser media devices (`html5-qrcode`).
- **Environment Camera Preference**: Automatically selects the rear/environment-facing camera on mobile devices.
- **Camera Selection**: Seamlessly switch between multiple cameras (front/back/external).
- **Graceful Error Handling**: Handles camera permission denial, unsupported devices, and busy camera locks with clear user guidance.
- **File Upload Fallback**: Option to scan QR codes directly from image files without requiring camera access.
- **Safe Link Navigation**: 
  - Valid `http://` and `https://` URLs are displayed prominently with direct "Open Link" (in new tab with safe `rel="noopener noreferrer"`) and "Copy Link" buttons.
  - Plain text, malformed URLs, and non-HTTP schemes (e.g. `javascript:`, `data:`, `file:`, `mailto:`, etc.) are safely displayed as non-navigable text with security alerts to prevent malicious redirection.
- **Stream Cleanup**: Properly stops and releases all media tracks and camera hardware upon scan completion or component unmount.

### 3. 🕒 Recent Activity (History)
- Local browser storage (`localStorage`) of generated and scanned codes.
- Re-open URLs, load into generator with one click, or copy to clipboard.
- "Clear History" privacy control.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 6
- **QR Encoding**: `qrcode.react`
- **QR Decoding**: `html5-qrcode`
- **Icons**: `lucide-react`
- **Delight Effects**: `canvas-confetti`
- **Styling**: Vanilla Modern CSS (Glassmorphism, custom design system, fully responsive)
- **Testing**: Vitest + Testing Library

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+ (tested on Node.js 24)
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

## 🌐 Cloudflare Deployment Guide (`qr.ujjwalraj.online`)

LinkQR is fully static and client-side, designed to deploy directly to **Cloudflare Pages**.

### Method A: Cloudflare Pages Dashboard (Git Integration - Recommended)

1. Push this repository to GitHub or GitLab.
2. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select this repository.
4. Configure Build Settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (or leave blank)
5. Click **Save and Deploy**.
6. **Assign Custom Domain**:
   - In Cloudflare Pages project settings, go to **Custom domains** tab.
   - Click **Set up a custom domain**.
   - Enter `qr.ujjwalraj.online`.
   - Cloudflare will automatically configure the DNS CNAME record and provision an SSL/TLS certificate for HTTPS camera access.

---

### Method B: Cloudflare Wrangler CLI (Direct Upload)

If deploying directly via the terminal with your Cloudflare account:

```bash
# 1. Build the production application
npm run build

# 2. Deploy dist folder to Cloudflare Pages
npx wrangler pages deploy dist --project-name=linkqr
```

After deployment, bind the custom domain `qr.ujjwalraj.online` in the Cloudflare Dashboard under your Pages project settings.

---

## 🔒 Security & Privacy

- **100% Client-Side**: No user URLs, images, or camera streams are sent to any remote server.
- **HTTPS Enforced**: Scanner requires secure context for browser camera access.
- **Cloudflare Headers**: `public/_headers` configures Content Security, Permissions-Policy (`camera=(self)`), and HSTS.
- **SPA Routing**: `public/_redirects` ensures clean refreshes without 404 errors.
