import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Logo } from './Logo';
import { clamp, ramp } from '../utils/helpers';
import { ArrowDown, ArrowUpDown, Crosshair, Eye, Scan, Sparkles } from 'lucide-react';

interface OpeningScrubProps {
  onEnterApp: (targetPage?: string) => void;
  inApp?: boolean;
  onHandoffChange?: (inApp: boolean) => void;
}

const CUES = [
  [0.00, 0.00, 0.18, 0.26], // Panel 1: Retinal screening, explained (Eye closed / resting)
  [0.35, 0.43, 0.58, 0.66], // Panel 2: See what the model looked at (Eyelid opening / pupil dilating)
  [0.74, 0.82, 0.94, 0.98], // Panel 3: Built for the clinic, not the cloud (Full eye open / illuminated retina)
] as const;

const DRIFT = 24; // px counter-scroll travel per panel

export const OpeningScrub: React.FC<OpeningScrubProps> = ({
  onEnterApp,
  inApp = false,
  onHandoffChange,
}) => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [invertedScrub, setInvertedScrub] = useState<boolean>(false);

  // Ref for the video element and DOM nodes
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoStageRef = useRef<HTMLDivElement | null>(null);
  const meterRef = useRef<HTMLDivElement | null>(null);
  const panel0Ref = useRef<HTMLDivElement | null>(null);
  const panel1Ref = useRef<HTMLDivElement | null>(null);
  const panel2Ref = useRef<HTMLDivElement | null>(null);
  const panelsContainerRef = useRef<HTMLDivElement | null>(null);
  const hudLeftRef = useRef<HTMLDivElement | null>(null);
  const hudRightRef = useRef<HTMLDivElement | null>(null);
  const irisGlowRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Mouse Parallax coordinates (smooth lerp)
  const mouseRef = useRef({ targetX: 0, targetY: 0, currentX: 0, currentY: 0 });

  const isUnlockedRef = useRef<boolean>(false);
  const rafIdRef = useRef<number>(0);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Compute responsive viewport height (100dvh safe)
  const getViewportHeight = useCallback(() => {
    if (typeof window === 'undefined') return 800;
    return window.visualViewport?.height || window.innerHeight || 800;
  }, []);

  // Track mouse coordinates for interactive spatial depth
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      mouseRef.current.targetX = (e.clientX - halfW) / halfW; // -1 to +1
      mouseRef.current.targetY = (e.clientY - halfH) / halfH; // -1 to +1
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [prefersReducedMotion]);

  // Hand off into app shell smoothly
  const triggerHandoff = useCallback((targetPage = 'dashboard') => {
    onEnterApp(targetPage);
    const track = trackRef.current;
    const trackHeight = track ? track.offsetHeight : getViewportHeight() * 4.5;
    window.scrollTo({
      top: trackHeight,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, [onEnterApp, prefersReducedMotion, getViewportHeight]);

  // Video initialization: preload silently in background, show when ready, with 8s safety fallback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();

    const markReady = () => {
      video.pause();
      setIsReady(true);

      if (prefersReducedMotion && video.duration) {
        video.currentTime = Math.max(0, video.duration - 0.05);
      } else {
        video.currentTime = 0;
      }
    };

    video.addEventListener('canplaythrough', markReady);
    video.addEventListener('canplay', markReady);
    video.addEventListener('loadeddata', markReady);

    if (video.readyState >= 3) {
      markReady();
    }

    // Safety fallback: if video isn't ready after 8 seconds, fade it in anyway
    const safetyTimer = window.setTimeout(() => {
      markReady();
    }, 8000);

    return () => {
      clearTimeout(safetyTimer);
      video.removeEventListener('canplaythrough', markReady);
      video.removeEventListener('canplay', markReady);
      video.removeEventListener('loadeddata', markReady);
    };
  }, [prefersReducedMotion]);

  // Touch, wheel, pointer unlock for iOS Safari and mobile browsers
  useEffect(() => {
    const unlock = () => {
      if (isUnlockedRef.current) return;
      const video = videoRef.current;
      if (video) {
        video.play().then(() => {
          video.pause();
          isUnlockedRef.current = true;
        }).catch(() => {});
      }
    };

    window.addEventListener('touchstart', unlock, { passive: true, once: true });
    window.addEventListener('touchmove', unlock, { passive: true, once: true });
    window.addEventListener('pointerdown', unlock, { passive: true, once: true });
    window.addEventListener('wheel', unlock, { passive: true, once: true });
    window.addEventListener('scroll', unlock, { passive: true, once: true });

    return () => {
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('touchmove', unlock);
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('wheel', unlock);
      window.removeEventListener('scroll', unlock);
    };
  }, []);

  // requestAnimationFrame loop: maps scroll position & mouse coordinates frame-by-frame with parallax
  useEffect(() => {
    if (prefersReducedMotion || !isReady) return;

    const updateFrame = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const track = trackRef.current;
      const vh = window.visualViewport?.height || window.innerHeight || 800;
      const trackHeight = track ? track.offsetHeight : vh * 4.5;
      const progress = clamp(scrollY / trackHeight, 0, 1);

      // Smooth mouse lerp
      const m = mouseRef.current;
      m.currentX += (m.targetX - m.currentX) * 0.08;
      m.currentY += (m.targetY - m.currentY) * 0.08;

      // 1. Map scroll progress to video's currentTime frame-by-frame
      const video = videoRef.current;
      if (video && video.duration && !isNaN(video.duration)) {
        const duration = video.duration;
        const effectiveProgress = invertedScrub ? 1 - progress : progress;
        const targetTime = clamp(effectiveProgress * duration, 0, Math.max(0, duration - 0.02));

        if (Math.abs(video.currentTime - targetTime) > 0.008) {
          video.currentTime = targetTime;
        }
      }

      // 2. PARALLAX LAYER 0: Background Video Stage (Dolly push-in + subtle counter tilt)
      if (videoStageRef.current) {
        const videoZoom = 1.0 + progress * 0.12; // 1.0 -> 1.12 scale push into pupil
        const videoX = m.currentX * -12;
        const videoY = m.currentY * -12 - progress * 35; // moves slower than scroll
        videoStageRef.current.style.transform = `translate3d(${videoX.toFixed(2)}px, ${videoY.toFixed(2)}px, 0) scale(${videoZoom.toFixed(4)})`;
      }

      // 3. Update 2px scroll meter
      if (meterRef.current) {
        meterRef.current.style.transform = `scaleX(${progress})`;
      }

      // 4. PARALLAX LAYER 1: Optical HUD & Telemetry Reticles (Mid-depth float)
      if (hudLeftRef.current) {
        const hudOpacity = ramp(progress, 0.15, 0.35) * (1 - ramp(progress, 0.70, 0.85));
        const hudX = m.currentX * 18;
        const hudY = m.currentY * 18 - progress * 80;
        hudLeftRef.current.style.opacity = hudOpacity.toFixed(3);
        hudLeftRef.current.style.transform = `translate3d(${hudX.toFixed(2)}px, ${hudY.toFixed(2)}px, 0)`;
      }

      if (hudRightRef.current) {
        const hudOpacity = ramp(progress, 0.30, 0.50) * (1 - ramp(progress, 0.88, 0.98));
        const hudX = m.currentX * 24;
        const hudY = m.currentY * 24 - progress * 105;
        hudRightRef.current.style.opacity = hudOpacity.toFixed(3);
        hudRightRef.current.style.transform = `translate3d(${hudX.toFixed(2)}px, ${hudY.toFixed(2)}px, 0)`;
      }

      // 5. Iris Illumination / Eye Opening Ophthalmoscope light bloom
      if (irisGlowRef.current) {
        const glowVal = ramp(progress, 0.68, 0.98);
        const glowScale = 0.85 + glowVal * 0.4;
        irisGlowRef.current.style.opacity = (glowVal * 0.85).toFixed(3);
        irisGlowRef.current.style.transform = `scale(${glowScale.toFixed(3)}) translate3d(${(m.currentX * -6).toFixed(2)}px, ${(m.currentY * -6).toFixed(2)}px, 0)`;
      }

      // 6. PARALLAX LAYER 2: Text Panels Foreground (Mouse counter-float)
      if (panelsContainerRef.current) {
        const panelTiltX = m.currentX * 10;
        const panelTiltY = m.currentY * 10;
        panelsContainerRef.current.style.transform = `translate3d(${panelTiltX.toFixed(2)}px, ${panelTiltY.toFixed(2)}px, 0)`;
      }

      // Update 3 cross-fading typography panels
      const panels = [panel0Ref.current, panel1Ref.current, panel2Ref.current];
      for (let i = 0; i < 3; i++) {
        const el = panels[i];
        if (!el) continue;

        const [c0, c1, c2, c3] = CUES[i];
        const enter = ramp(progress, c0, c1);
        const leave = ramp(progress, c2, c3);
        const opacity = enter * (1 - leave);
        const y = (1 - enter) * DRIFT - leave * DRIFT;

        el.style.opacity = opacity.toFixed(4);
        el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
        el.style.pointerEvents = opacity > 0.6 && !inApp ? 'auto' : 'none';
      }

      // Bidirectional handoff
      if (progress >= 0.98) {
        onHandoffChange?.(true);
      } else if (progress < 0.975) {
        onHandoffChange?.(false);
      }
    };

    const tick = () => {
      updateFrame();
      rafIdRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', updateFrame, { passive: true });
    window.addEventListener('touchmove', updateFrame, { passive: true });
    window.addEventListener('resize', updateFrame, { passive: true });
    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', updateFrame);
      window.removeEventListener('touchmove', updateFrame);
      window.removeEventListener('resize', updateFrame);
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [prefersReducedMotion, isReady, inApp, onHandoffChange, invertedScrub]);

  return (
    <div className="relative bg-[#0A0C0E] text-[var(--fg)] w-full">
      {/* Plain black screen (#0A0C0E) - completely clean */}
      <div
        className={`fixed inset-0 w-full h-[100dvh] z-50 bg-[#0A0C0E] transition-opacity duration-300 ${
          isReady ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
        }`}
        aria-hidden="true"
      />

      {/* Dark Opening Layer Container: Fades out over 600ms when handing off to cream app */}
      <div
        className={`transition-opacity ${
          prefersReducedMotion ? 'duration-0' : 'duration-600 ease-[var(--ease)]'
        } ${inApp ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}
      >
        {/* Fixed Stage: The user's uploaded video with PARALLAX scale & translate */}
        <div className="fixed inset-0 w-full h-[100dvh] z-0 flex items-center justify-center overflow-hidden bg-[#0A0C0E] pointer-events-none">
          <div
            ref={videoStageRef}
            className="w-full h-full min-w-full min-h-full flex items-center justify-center will-change-transform"
          >
            <video
              ref={videoRef}
              src="/opening.mp4"
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              aria-label="NetraScan opening: retinal imagery"
              className="w-full h-full min-w-full min-h-full object-cover object-center"
            />
          </div>

          {/* Iris Illumination Glow Effect (Bloom as eye opens) */}
          <div
            ref={irisGlowRef}
            className="absolute inset-0 pointer-events-none will-change-[transform,opacity]"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(200, 113, 33, 0.45) 0%, rgba(237, 231, 220, 0.65) 45%, rgba(10, 12, 14, 0.9) 100%)',
              opacity: 0,
            }}
          />

          {/* Scrims behind header and footer for crisp text contrast over background video */}
          <div className="absolute top-0 inset-x-0 h-28 sm:h-32 bg-gradient-to-b from-[#0A0C0E]/90 via-[#0A0C0E]/50 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-24 sm:h-28 bg-gradient-to-t from-[#0A0C0E]/95 via-[#0A0C0E]/60 to-transparent pointer-events-none" />
        </div>

        {/* Scroll Meter (2px fixed hairline at the top) */}
        <div
          ref={meterRef}
          className="fixed top-0 left-0 right-0 h-[2px] bg-[var(--amber)] z-40 origin-left pointer-events-none"
          style={{ transform: 'scaleX(0)' }}
        />

        {/* MID-LAYER PARALLAX: Medical Optical HUD Reticles floating at differential depth */}
        <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden hidden md:block">
          {/* Left HUD: Optical Alignment & Quality Gate */}
          <div
            ref={hudLeftRef}
            className="absolute top-1/3 left-8 lg:left-14 will-change-[transform,opacity] transition-opacity duration-200"
            style={{ opacity: 0 }}
          >
            <div className="p-3 rounded-lg border border-white/15 bg-black/40 backdrop-blur-md text-[11px] font-mono text-[#F8FAFC]/80 space-y-1.5 shadow-xl max-w-[210px]">
              <div className="flex items-center justify-between text-[var(--amber)] pb-1 border-b border-white/10">
                <span className="flex items-center gap-1 text-[10px] tracking-wider uppercase">
                  <Scan className="w-3 h-3" />
                  OPTICAL ALIGN
                </span>
                <span className="text-[10px]">FOV 45°</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/60">Sobel Sharpness</span>
                <span className="text-[var(--teal)] font-bold">92.4%</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/60">Pupil Dilated</span>
                <span className="text-white font-bold">&gt; 4.2mm</span>
              </div>
              <div className="pt-1 flex items-center gap-1 text-[9px] text-white/50">
                <Crosshair className="w-2.5 h-2.5 text-[var(--amber)] animate-spin" />
                <span>Posterior Pole Centered</span>
              </div>
            </div>
          </div>

          {/* Right HUD: Real-time Neural Engine & Grad-CAM Focal Grid */}
          <div
            ref={hudRightRef}
            className="absolute top-1/2 right-8 lg:right-14 will-change-[transform,opacity] transition-opacity duration-200"
            style={{ opacity: 0 }}
          >
            <div className="p-3 rounded-lg border border-white/15 bg-black/40 backdrop-blur-md text-[11px] font-mono text-[#F8FAFC]/80 space-y-1.5 shadow-xl max-w-[220px]">
              <div className="flex items-center justify-between text-[var(--teal)] pb-1 border-b border-white/10">
                <span className="flex items-center gap-1 text-[10px] tracking-wider uppercase">
                  <Eye className="w-3 h-3" />
                  U-NET SEGMENTER
                </span>
                <span className="text-[10px]">224×224</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/60">Optic Disc Center</span>
                <span className="text-white font-bold">[112, 120]</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/60">Microvascular Tree</span>
                <span className="text-[var(--teal)] font-bold">Detected</span>
              </div>
              <div className="pt-1 flex items-center gap-1 text-[9px] text-[var(--amber)]">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Feature Attribution Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Fixed Header */}
        <header className="fixed top-0 inset-x-0 z-30 flex items-center justify-between px-3 sm:px-6 md:px-10 py-3 sm:py-5 max-w-7xl mx-auto w-full">
          <Logo size={24} className="sm:size-7 text-white" onClick={() => triggerHandoff('dashboard')} />

          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            {/* Desktop / Laptop nav links */}
            <nav className="hidden lg:flex items-center gap-5">
              <button
                onClick={() => triggerHandoff('screening')}
                className="text-label text-[#F8FAFC]/85 hover:text-white transition-colors cursor-pointer py-1.5"
              >
                Screening
              </button>
              <button
                onClick={() => triggerHandoff('system')}
                className="text-label text-[#F8FAFC]/85 hover:text-white transition-colors cursor-pointer py-1.5"
              >
                System
              </button>
            </nav>

            {/* Video Direction Switcher Toggle */}
            <button
              onClick={() => setInvertedScrub(!invertedScrub)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-white/20 hover:border-white/40 bg-black/40 text-[10px] sm:text-xs text-[#F8FAFC]/80 hover:text-white transition-colors cursor-pointer min-h-[32px]"
              title="Toggle scrub direction between Normal and Inverted"
            >
              <ArrowUpDown className="w-3 h-3 text-[var(--amber)]" />
              <span className="hidden sm:inline">Motion:</span>
              <span className="font-mono text-[var(--amber)]">{invertedScrub ? 'Reverse' : 'Forward'}</span>
            </button>

            {/* Skip Intro button */}
            <button
              onClick={() => triggerHandoff('dashboard')}
              className="text-[10px] sm:text-xs text-[#F8FAFC]/80 hover:text-white transition-colors cursor-pointer px-2 py-1 uppercase tracking-widest rounded border border-transparent hover:border-[#F8FAFC]/20"
              aria-label="Skip introductory video sequence"
            >
              SKIP INTRO
            </button>

            {/* Start screening CTA */}
            <button
              onClick={() => triggerHandoff('dashboard')}
              className="min-h-[40px] px-4 sm:px-5 py-2 rounded-full bg-white text-black text-xs sm:text-sm font-medium hover:bg-[#F8FAFC] transition-colors cursor-pointer shrink-0 shadow-sm flex items-center justify-center whitespace-nowrap"
            >
              Start screening
            </button>
          </div>
        </header>

        {/* FOREGROUND PARALLAX: Panels with mouse interactive counter-tilt */}
        <div
          ref={panelsContainerRef}
          className="fixed inset-0 w-full h-[100dvh] z-20 pointer-events-none flex items-center justify-center px-4 py-8 sm:p-8 md:p-12 overflow-hidden will-change-transform"
        >
          {/* Panel 1: Eye at rest / Closed */}
          <div
            ref={panel0Ref}
            className="absolute max-w-[92vw] sm:max-w-xl md:max-w-2xl text-center flex flex-col items-center will-change-[transform,opacity]"
            style={{ opacity: 0, transform: 'translate3d(0, 24px, 0)' }}
          >
            <span className="text-label text-[var(--amber)] mb-2 sm:mb-3">
              EYE AT REST · RURAL OUTREACH
            </span>
            <h1
              className="font-heading font-bold tracking-[-0.02em] leading-[1.1] text-white [text-wrap:balance]"
              style={{
                fontSize: 'clamp(34px, 5.2vw, 54px)',
              }}
            >
              Retinal screening,<br />explained.
            </h1>
            <p className="mt-4 sm:mt-5 text-[18px] font-normal leading-[1.6] text-[#F8FAFC]/92 max-w-lg mx-auto [text-wrap:pretty]">
              Diabetic retinopathy develops silently before symptoms appear. Point-of-care screening reveals what the patient cannot feel.
            </p>
            <div className="mt-6 sm:mt-8 w-full max-w-xs flex justify-center">
              <button
                onClick={() => triggerHandoff('dashboard')}
                className="min-h-[44px] w-full sm:w-auto px-7 py-3 rounded-full bg-white text-black text-xs sm:text-sm font-medium hover:bg-[#F8FAFC] transition-colors shadow-lg cursor-pointer flex items-center justify-center"
              >
                Start screening
              </button>
            </div>

            {/* Scroll Indicator Prompt */}
            <div className="mt-6 flex flex-col items-center gap-1 opacity-80 animate-bounce">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[#F8FAFC]/70">
                Scroll to open eye & explore
              </span>
              <ArrowDown className="w-3.5 h-3.5 text-[var(--amber)]" />
            </div>
          </div>

          {/* Panel 2: Eyelid Opening / Dilating Pupil / Grad-CAM */}
          <div
            ref={panel1Ref}
            className="absolute max-w-[92vw] sm:max-w-xl md:max-w-2xl text-center flex flex-col items-center will-change-[transform,opacity]"
            style={{ opacity: 0, transform: 'translate3d(0, 24px, 0)' }}
          >
            <span className="text-label text-[var(--teal)] mb-2 sm:mb-3">
              EYELID OPENS · EXPLAINABLE AI
            </span>
            <h2
              className="font-heading font-bold tracking-[-0.02em] leading-[1.1] text-white [text-wrap:balance]"
              style={{
                fontSize: 'clamp(34px, 5.2vw, 54px)',
              }}
            >
              See what the<br />model looked at.
            </h2>
            <p className="mt-4 sm:mt-5 text-[18px] font-normal leading-[1.6] text-[#F8FAFC]/92 max-w-lg mx-auto [text-wrap:pretty]">
              Highlighted retinal regions show what influenced the AI-assisted assessment. It supports referral decisions and never replaces ophthalmic evaluation.
            </p>
            <div className="mt-6 sm:mt-8 w-full max-w-xs flex justify-center">
              <button
                onClick={() => triggerHandoff('simulation')}
                className="min-h-[44px] w-full sm:w-auto px-7 py-3 rounded-full border border-white/30 bg-[#0A0C0E]/85 backdrop-blur-sm text-white text-xs sm:text-sm font-medium hover:border-white transition-colors cursor-pointer flex items-center justify-center"
              >
                View the workflow
              </button>
            </div>
          </div>

          {/* Panel 3: Eye fully open / Illuminated Retina */}
          <div
            ref={panel2Ref}
            className="absolute max-w-[92vw] sm:max-w-xl md:max-w-2xl text-center flex flex-col items-center will-change-[transform,opacity]"
            style={{ opacity: 0, transform: 'translate3d(0, 24px, 0)' }}
          >
            <span className="text-label text-[var(--amber)] mb-2 sm:mb-3">
              FULL RETINAL EXPOSURE · OFFLINE-FIRST
            </span>
            <h2
              className="font-heading font-bold tracking-[-0.02em] leading-[1.1] text-white [text-wrap:balance]"
              style={{
                fontSize: 'clamp(34px, 5.2vw, 54px)',
              }}
            >
              Built for the clinic,<br />not the cloud.
            </h2>
            <p className="mt-4 sm:mt-5 text-[18px] font-normal leading-[1.6] text-[#F8FAFC]/92 max-w-lg mx-auto [text-wrap:pretty]">
              Capture, check image quality, and triage at the point of care, then refer for comprehensive ophthalmic evaluation.
            </p>
            <div className="mt-6 sm:mt-8 w-full max-w-xs flex justify-center">
              <button
                onClick={() => triggerHandoff('system')}
                className="min-h-[44px] w-full sm:w-auto px-7 py-3 rounded-full border border-white/30 bg-[#0A0C0E]/85 backdrop-blur-sm text-white text-xs sm:text-sm font-medium hover:border-white transition-colors cursor-pointer flex items-center justify-center"
              >
                View system
              </button>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <footer className="fixed bottom-0 inset-x-0 z-30 py-3 px-3 sm:px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between text-center gap-1 sm:gap-2 pointer-events-none">
          <p className="text-[11px] sm:text-xs text-[#F8FAFC]/80 tracking-wider">
            NetraScan · AI-assisted screening support, not a medical diagnosis · Demo prototype
          </p>
          <span className="text-[10px] sm:text-[11px] tracking-widest uppercase text-[#F8FAFC]/65">
            Scroll to scrub video
          </span>
        </footer>
      </div>

      {/* Scroll Track: 450vh track provides smooth scrubbing across all viewport dimensions */}
      <div
        ref={trackRef}
        className="relative pointer-events-none w-full"
        style={{ height: '450vh' }}
        aria-hidden="true"
      />
    </div>
  );
};
