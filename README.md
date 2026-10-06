# BlockFall — Web Falling-Block Puzzle Game

<p align="center">
  <a href="https://github.com/Devputta/Drafts-might-be-needed-/blob/main/LOGO/Gemini_Generated_Image_1ppnm1ppnm1ppnm1%20(1).jfif" target="_blank" rel="noopener noreferrer">
    <img src="https://raw.githubusercontent.com/Devputta/Drafts-might-be-needed-/main/LOGO/Gemini_Generated_Image_1ppnm1ppnm1ppnm1%20(1).jfif" alt="BlockFall Project Logo" width="220" style="border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);" />
  </a>
</p>

<p align="center">
  <strong>A high-performance browser-based falling-block puzzle game with responsive 4-way tap controls, 7-bag randomizer, 30+ arcade levels, and particle line-clear celebrations.</strong>
</p>

<p align="center">
  <a href="https://github.com/Devputta/BackFall.git"><img src="https://img.shields.io/badge/GitHub-Repository-181717?logo=github" alt="GitHub Repo" /></a>
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="License: Apache 2.0" />
  <img src="https://img.shields.io/badge/Tests-12%2F12_Passing-brightgreen" alt="Tests Passing" />
</p>

---

## 🎮 Overview

**BlockFall** is a single-player web puzzle game engineered from the ground up for speed, fidelity, and responsiveness. Powered by an independent headless engine coupled with a high-frame-rate HTML5 canvas renderer, BlockFall delivers genuine arcade physics, Super Rotation System (SRS) wall-kicks, and dynamic particle celebrations on every line clear.

---

## ✨ Features

- **Decoupled Game Engine**: Pure TypeScript engine architecture independent of the UI layer, fully testable without DOM overhead.
- **Fair 7-Bag Randomizer**: Continuous Fisher-Yates shuffled 7-bag cycle guarantees balanced piece distribution with no drought.
- **Super Rotation System (SRS)**: Complete clockwise and counter-clockwise rotation kick tables for all standard tetrominoes (`I`, `O`, `T`, `S`, `Z`, `J`, `L`).
- **Row Clear Celebrations**:
  - Multi-colored confetti and star particle physics on every clear.
  - Floating score banners (`+100 SINGLE!`, `+300 DOUBLE!`, `+500 TRIPLE!`, `★ +800 TETRIS! ★`).
  - Snappy screen shake proportional to rows cleared.
- **30+ Progressive Levels**:
  - Calibrated gravity scale ranging from 800ms (Level 1) to 20ms (Level 30).
  - Rank titles from *Novice* to *Block Legend*.
  - Jump directly into high-speed play via the **Starting Level Selector** (`1`, `5`, `10`, `15`, `20`).
- **Zero Wasted Space & 4-Way Touch Controls**:
  - **Left Tap**: Steer piece left.
  - **Right Tap**: Steer piece right.
  - **Top Tap**: Rotate clockwise.
  - **Bottom Tap**: Soft drop.
  - **Double-Tap / Swipe Down**: Instant hard drop.
  - **Right-Click**: Rotate clockwise (context menu suppressed).
- **Audio Synthesizer**: Pure Web Audio API synthesized arcade sounds (move blips, rotation chirps, hard drop thuds, line clear chimes, level fanfare). No external audio files or network latency.
- **Customizable Layout**:
  - Sizing options: **Compact** (240px), **Normal** (320px), and **Large** (440px).
  - Fullscreen mode with standard Fullscreen API sync.
- **Security & Data Integrity**:
  - Hardened `localStorage` parsing with numerical boundaries and prototype injection prevention.
  - Production `ErrorBoundary` preventing white-screen crashes.

---

## 🕹️ Controls Guide

| Action | Keyboard | Touch / Screen Gestures | Mouse |
| :--- | :--- | :--- | :--- |
| **Move Left** | `←` or `A` | Tap left side of board | Click left side |
| **Move Right** | `→` or `D` | Tap right side of board | Click right side |
| **Rotate Clockwise** | `↑`, `W`, or `X` | Tap upper center of board | Right-Click / Click top |
| **Rotate Counter-Clockwise** | `Z` | `CCW` on-screen button | — |
| **Soft Drop** | `↓` or `S` | Tap bottom center of board | Click bottom center |
| **Hard Drop** | `Space` | Double-tap / Fast downward swipe | `HARD DROP` button |
| **Hold Piece** | `C` or `Shift` | Tap `HOLD` button | Click `HOLD` button |
| **Pause / Resume** | `P` or `Esc` | Tap Pause button | Click Pause icon |
| **Restart Game** | `R` | Restart modal button | Restart header button |

---

## 🏆 Scoring Specification

Scores scale with the active level:

$$\text{Points} = \text{Base Points} \times \text{Level}$$

| Cleared Lines | Base Score | Level 1 | Level 10 | Level 20 |
| :--- | :---: | :---: | :---: | :---: |
| **Single** | 100 | 100 | 1,000 | 2,000 |
| **Double** | 300 | 300 | 3,000 | 6,000 |
| **Triple** | 500 | 500 | 5,000 | 10,000 |
| **Tetris (4 Lines)** | 800 | 800 | 8,000 | 16,000 |

- **Soft Drop**: 1 point per cell dropped.
- **Hard Drop**: 2 points per cell dropped.

---

## 🏗️ Project Architecture

```text
├── index.html                   # Entry point with security & mobile viewport headers
├── src/
│   ├── components/
│   │   ├── CanvasBoard.tsx      # 60fps canvas renderer with particle & tap system
│   │   ├── HoldPanel.tsx        # Miniature piece hold queue
│   │   ├── NextQueuePanel.tsx   # Next 3 upcoming pieces preview
│   │   ├── ScorePanel.tsx       # Live score, rank titles, and progress display
│   │   ├── MobileControls.tsx   # Responsive touch D-pad & action triggers
│   │   ├── ErrorBoundary.tsx    # Crash protection wrapper
│   │   ├── GameOverModal.tsx    # End-game review & record indicators
│   │   └── PauseModal.tsx       # Settings, size, and starting level dialog
│   ├── game/
│   │   ├── audio.ts             # Web Audio API retro synthesizer
│   │   ├── bag.ts               # Fisher-Yates 7-bag piece randomizer
│   │   ├── board.ts             # Grid logic, ghost piece, and row clearing
│   │   ├── collision.ts         # Boundary and obstacle detection
│   │   ├── constants.ts         # 30-level gravity tables & piece palettes
│   │   ├── gameEngine.ts        # Central deterministic state machine
│   │   ├── pieces.ts            # Tetromino matrices & spawn positions
│   │   ├── rotation.ts          # Rotation solver with SRS kick testing
│   │   ├── scoring.ts           # Score and level calculation
│   │   ├── srsKicks.ts          # Super Rotation System offset tables
│   │   ├── types.ts             # Core TypeScript type definitions
│   │   └── useControls.ts       # DAS/ARR keyboard event management
│   ├── lib/
│   │   └── storage.ts           # Sanitized, bounds-checked LocalStorage handler
│   └── tests/
│       ├── engine.test.ts       # Headless test cases
│       └── runTests.ts          # Test runner script
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or newer)
- `npm` or `bun`

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Devputta/BackFall.git
   cd BackFall
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. Build for production:
   ```bash
   npm run build
   ```

5. Run test suite:
   ```bash
   npx tsx src/tests/runTests.ts
   ```

---

## 🔒 Security Policy

For security vulnerability disclosures and architecture policies, please review [SECURITY.md](SECURITY.md).

- **Strict Input Sanitization**: Prevents tampering with persisted game states.
- **Client Integrity**: Zero arbitrary code execution (`eval`), strict TypeScript boundaries, and secure meta headers.

---

## 👥 Contributors & Credits

- **Project Creator & Engineering**: [Devputta](https://github.com/Devputta)
- **Repository**: [https://github.com/Devputta/BackFall.git](https://github.com/Devputta/BackFall.git)
- **Logo Contributor**: Graphic asset provided via [Devputta Drafts Logo Archive](https://github.com/Devputta/Drafts-might-be-needed-/blob/main/LOGO/Gemini_Generated_Image_1ppnm1ppnm1ppnm1%20(1).jfif)

---

## 📄 License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
