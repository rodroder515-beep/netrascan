# NetraScan

Explainable AI for Diabetic Retinopathy Screening in Rural India (SIH 2026).

AI-assisted screening and triage support system designed for point-of-care rural healthcare clinics and ASHA workers.

> **Safety Notice:** NetraScan is an AI-assisted screening and triage support system, NOT a medical diagnosis system. Never present a result as a confirmed diagnosis. All assessments support referral decisions and never replace comprehensive ophthalmic evaluation. All patients in demonstration modules are fictional demo data, clearly labelled.

---

## Video Scrubbing Preparation

To ensure instantaneous and jitter-free frame-by-frame scroll scrubbing, every video frame must be encoded as an intra-frame (keyframe interval `-g 1`) with faststart metadata:

```bash
ffmpeg -i input.mp4 -c:v libx264 -g 1 -crf 20 -pix_fmt yuv420p -an -movflags +faststart public/opening.mp4
```

- Target file: `public/opening.mp4` (Portrait 720x1280, 24fps, all-intra, muted)
- Poster file: `public/opening-poster.jpg` (Used for initial loading and `prefers-reduced-motion` accessible fallback)

---

## Architecture (Prompt 1)

- **OpeningScrub**: Fixed stage with scroll-scrubbed video, 560vh scroll track, preloader with Blob buffering, and 3 cross-fading typography panels.
- **App Shell**: Minimalist fixed navigation bar with clinic/ASHA operator status and `● OFFLINE READY` badge.
- **Design Tokens**: Dark, cinematic, clinical CSS variables defined in `src/index.css` (`--bg`, `--fg`, `--amber`, `--teal`, `--rule`, etc.).
- **Directory Structure**:
  - `src/components/`: Modular UI (OpeningScrub, Navbar, Logo, DashboardPlaceholder)
  - `src/services/`: API service stubs (`api.ts`)
  - `src/mocks/`: Clearly labelled fictional patient records (`mockPatients.ts`)
  - `src/state/`: Central application state (`appState.ts`)
  - `src/utils/`: Easing and clamp helpers (`helpers.ts`)
