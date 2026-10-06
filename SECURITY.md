# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a potential security vulnerability in **BlockFall**, please report it responsibly rather than opening a public issue.

- **Security Contact**: Contact the repository maintainers via [GitHub Issues or Private Security Advisory](https://github.com/Devputta/BackFall.git).
- **Report Details**:
  - Description of the issue and potential impact
  - Step-by-step reproduction guide or proof-of-concept
  - Affected browsers or runtime environments

We strive to acknowledge receipt of security reports within 48 hours and provide patches promptly.

---

## Security Architecture & Practices

### 1. Client-Side State Integrity & Sanitization
- **Storage Sanitization (`src/lib/storage.ts`)**:
  - `localStorage` is treated as untrusted user input.
  - All numerical properties (`highScore`, `bestLines`, `bestLevel`, `gamesPlayed`, `totalLines`, and piece distribution maps) are validated with `Number.isFinite()`, clamped to realistic non-negative integer ranges, and protected against integer overflow (`max: 999_999_999`).
  - Malformed, corrupt, or tampered payloads trigger an immediate safe fallback to default states without crashing.

### 2. Injection & XSS Protection
- The codebase enforces strict TypeScript type bounds (`isolatedModules: true`).
- No dynamic code execution (`eval`, `new Function`) is used anywhere in the application.
- All screen reader announcements and status messages utilize validated text nodes (`aria-live="polite"`).

### 3. Frame & Header Governance
- HTTP and meta tag headers enforce:
  - `X-Content-Type-Options: nosniff` to prevent MIME-type sniffing.
  - `Referrer-Policy: strict-origin-when-cross-origin`.
  - Proper viewport scaling controls (`viewport-fit=cover`).

### 4. Zero Personal Data Collection
- BlockFall operates entirely offline on the client side.
- No user credentials, cookies, tokens, or personal identifiers are stored or transmitted.
