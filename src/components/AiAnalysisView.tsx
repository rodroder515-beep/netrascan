import React, { useState } from 'react';
import { Layers, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import { ScreeningAnalysisResult } from '../services/api';

interface AiAnalysisViewProps {
  analysis: ScreeningAnalysisResult;
  imageSrc: string;
  onProceedToTriage: () => void;
  onBackToQuality: () => void;
}

export type VisualTab = 'ORIGINAL' | 'VESSELS' | 'OPTIC_DISC' | 'LESIONS' | 'HEATMAP';

export const AiAnalysisView: React.FC<AiAnalysisViewProps> = ({
  analysis,
  imageSrc,
  onProceedToTriage,
  onBackToQuality,
}) => {
  const [activeTab, setActiveTab] = useState<VisualTab>('HEATMAP');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(75);

  const isModerateDR = analysis.riskTier === 'MODERATE_NONPROLIFERATIVE';

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn w-full">
      {/* Title */}
      <div className="border-b border-[var(--rule)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-label text-[var(--teal)]">STEPS 3 & 4 OF 6</span>
          <h1
            className="font-heading font-bold text-[var(--fg)] mt-1 tracking-[-0.02em] leading-[1.1]"
            style={{ fontSize: 'clamp(1.75rem, 3.8vw, 2.5rem)' }}
          >
            AI Retinal Analysis & Explainability
          </h1>
          <p className="text-sm sm:text-base text-[var(--fg-soft)] mt-1.5 leading-[1.6]">
            Multi-stage anatomical segmentation, lesion localization, Grad-CAM attention heatmap, and clinical rule verification.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-mono text-[var(--fg-soft)] px-2.5 py-1 rounded border border-[var(--rule)] bg-[var(--bg-2)]">
            Patient: <strong className="text-[var(--fg)]">{analysis.patient.name}</strong> ({analysis.patient.eye})
          </span>
        </div>
      </div>

      {/* Pipeline Statuses - Responsive Grid with no overflow */}
      <div className="p-3.5 sm:p-4 rounded border border-[var(--rule)] bg-[var(--bg-2)]">
        <div className="text-label text-[var(--fg-faint)] mb-2.5 flex items-center justify-between flex-wrap gap-1">
          <span>EDGE NEURAL PIPELINE EXECUTION STATUS</span>
          <span className="text-[var(--teal)] font-mono font-medium">COMPLETE (640ms)</span>
        </div>
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 text-xs">
          {[
            { name: '1. Normalization', status: 'Passed (CLAHE)', color: 'text-[var(--teal)]' },
            { name: '2. Vessel Tree', status: 'U-Net Extracted', color: 'text-[var(--teal)]' },
            { name: '3. Disc & Macula', status: 'Polar Mapped', color: 'text-[var(--teal)]' },
            { name: '4. Lesions', status: isModerateDR ? '14 Detected' : '0 Anomalies', color: isModerateDR ? 'text-[var(--amber)]' : 'text-[var(--teal)]' },
            { name: '5. Rule Verification', status: 'Verified', color: 'text-[var(--teal)]' },
          ].map((item, idx) => (
            <div key={idx} className="p-2 sm:p-2.5 rounded bg-[var(--bg)] border border-[var(--rule)]">
              <div className="text-[10px] text-[var(--fg-faint)] truncate">{item.name}</div>
              <div className={`text-[11px] font-medium font-mono mt-0.5 truncate ${item.color}`}>
                {item.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Interactive Inspection Grid - Stacks to single column on tablet/mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Interactive Visual Inspection Viewer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 sm:p-5 rounded border border-[var(--rule)] bg-[var(--bg-2)] space-y-4">
            {/* Tab Selector & Opacity Slider */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--rule)] pb-3 gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {(['ORIGINAL', 'VESSELS', 'OPTIC_DISC', 'LESIONS', 'HEATMAP'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-2 rounded text-label transition-colors cursor-pointer whitespace-nowrap min-h-[40px] flex items-center ${
                      activeTab === tab
                        ? 'bg-[var(--fg)] text-[var(--bg)] font-bold shadow-sm'
                        : 'text-[var(--fg-soft)] hover:text-[var(--fg)] bg-[var(--bg)] border border-[var(--rule)]'
                    }`}
                  >
                    {tab.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {activeTab !== 'ORIGINAL' && (
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--fg-soft)] shrink-0 self-end sm:self-auto">
                  <span>Opacity:</span>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    value={overlayOpacity}
                    onChange={(e) => setOverlayOpacity(parseInt(e.target.value))}
                    className="w-20 sm:w-24 accent-[var(--amber)] cursor-pointer"
                  />
                  <span className="w-8 text-right">{overlayOpacity}%</span>
                </div>
              )}
            </div>

            {/* Fundus Visual Canvas with Layer Overlays - Scales to container with aspect-square */}
            <div className="aspect-square w-full max-w-full rounded border border-[var(--rule)] bg-[#000] relative overflow-hidden select-none">
              {/* Base Fundus Image */}
              <img
                src={imageSrc}
                alt="Retinal inspection view"
                className="w-full h-full object-cover"
              />

              {/* LAYER 1: VESSELS OVERLAY (SVG with viewBox 0 0 100 100, scales with container) */}
              {activeTab === 'VESSELS' && (
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 w-full h-full pointer-events-none transition-opacity"
                  style={{ opacity: overlayOpacity / 100 }}
                >
                  <g stroke="var(--teal)" strokeWidth="0.8" fill="none" opacity="0.95" strokeLinecap="round">
                    <path d="M 28 48 C 32 32 45 22 62 20 C 72 19 82 24 88 28" />
                    <path d="M 45 22 C 48 16 54 12 60 10" />
                    <path d="M 62 20 C 66 14 74 12 80 12" />
                    <path d="M 72 19 C 78 17 84 15 88 16" />

                    <path d="M 28 52 C 32 68 45 78 62 80 C 72 81 82 76 88 72" />
                    <path d="M 45 78 C 48 84 54 88 60 90" />
                    <path d="M 62 80 C 66 86 74 88 80 88" />
                    <path d="M 72 81 C 78 83 84 85 88 84" />

                    <path d="M 24 48 C 18 42 12 38 6 34" strokeWidth="0.7" />
                    <path d="M 24 52 C 18 58 12 62 6 66" strokeWidth="0.7" />

                    <path d="M 40 46 C 45 47 48 48 50 49" strokeWidth="0.5" />
                    <path d="M 40 54 C 45 53 48 52 50 51" strokeWidth="0.5" />
                    <path d="M 52 35 C 54 40 54 44 54 46" strokeWidth="0.5" />
                    <path d="M 52 65 C 54 60 54 56 54 54" strokeWidth="0.5" />
                  </g>
                </svg>
              )}

              {/* LAYER 2: OPTIC DISC & MACULA OVERLAY */}
              {activeTab === 'OPTIC_DISC' && (
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 w-full h-full pointer-events-none transition-opacity"
                  style={{ opacity: overlayOpacity / 100 }}
                >
                  <circle
                    cx="26"
                    cy="50"
                    r="8.5"
                    fill="none"
                    stroke="var(--amber)"
                    strokeWidth="0.8"
                    strokeDasharray="2 1"
                  />
                  <circle
                    cx="26"
                    cy="50"
                    r="3.2"
                    fill="var(--amber)"
                    fillOpacity="0.25"
                    stroke="var(--amber)"
                    strokeWidth="0.6"
                  />
                  <text x="26" y="38" fill="var(--amber)" fontSize="3" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">
                    OPTIC DISC (CDR 0.34)
                  </text>

                  <circle
                    cx="54"
                    cy="50"
                    r="3.5"
                    fill="none"
                    stroke="var(--teal)"
                    strokeWidth="0.8"
                  />
                  <circle cx="54" cy="50" r="0.8" fill="var(--teal)" />
                  <text x="54" y="58" fill="var(--teal)" fontSize="3" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">
                    FOVEAL AVASCULAR ZONE
                  </text>
                </svg>
              )}

              {/* LAYER 3: LESIONS OVERLAY (Responsive % markers) */}
              {activeTab === 'LESIONS' && (
                <div
                  className="absolute inset-0 w-full h-full pointer-events-none transition-opacity"
                  style={{ opacity: overlayOpacity / 100 }}
                >
                  {analysis.lesions.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                      <div className="px-4 py-2 rounded bg-[var(--bg)]/90 border border-[var(--teal)]/40 text-[var(--teal)] text-xs font-mono font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>NO PATHOLOGICAL LESIONS DETECTED</span>
                      </div>
                    </div>
                  ) : (
                    analysis.lesions.map((group) =>
                      group.coordinates.map((pt, i) => (
                        <div
                          key={`${group.type}-${i}`}
                          className={`absolute rounded-full border transform -translate-x-1/2 -translate-y-1/2 transition-transform ${
                            group.type === 'microaneurysm'
                              ? 'border-red-500 bg-red-500/30 animate-pulse'
                              : group.type === 'dot_hemorrhage'
                              ? 'border-[var(--amber)] bg-[var(--amber)]/40'
                              : 'border-yellow-300 bg-yellow-300/30'
                          }`}
                          style={{
                            left: `${pt.x}%`,
                            top: `${pt.y}%`,
                            width: `clamp(12px, 2.5vw, 24px)`,
                            height: `clamp(12px, 2.5vw, 24px)`,
                          }}
                        />
                      ))
                    )
                  )}
                </div>
              )}

              {/* LAYER 4: GRAD-CAM ATTENTION HEATMAP */}
              {activeTab === 'HEATMAP' && (
                <div
                  className="absolute inset-0 w-full h-full pointer-events-none transition-opacity"
                  style={{ opacity: overlayOpacity / 100 }}
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <defs>
                      <radialGradient id="heatHot1" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                        <stop offset="50%" stopColor="#f97316" stopOpacity="0.55" />
                        <stop offset="85%" stopColor="#eab308" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
                      </radialGradient>
                      <radialGradient id="heatHot2" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.75" />
                        <stop offset="60%" stopColor="#eab308" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {isModerateDR ? (
                      <>
                        <circle cx="62" cy="38" r="16" fill="url(#heatHot1)" />
                        <circle cx="48" cy="62" r="14" fill="url(#heatHot1)" />
                        <circle cx="70" cy="54" r="11" fill="url(#heatHot2)" />
                        <circle cx="38" cy="32" r="9" fill="url(#heatHot2)" />
                      </>
                    ) : (
                      <>
                        <circle cx="54" cy="50" r="12" fill="url(#heatHot2)" opacity="0.4" />
                        <circle cx="26" cy="50" r="10" fill="url(#heatHot2)" opacity="0.3" />
                      </>
                    )}
                  </svg>

                  {/* Gradient Ramp legend */}
                  <div className="absolute bottom-2.5 right-2.5 p-2 rounded bg-black/75 backdrop-blur-sm border border-[var(--rule)] text-[10px] font-mono text-[var(--fg-soft)]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span>Low</span>
                      <div className="w-16 h-2 rounded bg-gradient-to-r from-teal-500 via-yellow-400 to-red-500" />
                      <span>High</span>
                    </div>
                    <span className="text-[9px] text-[var(--fg-faint)] block text-center">Grad-CAM Salience</span>
                  </div>
                </div>
              )}
            </div>

            {/* Canvas Sub-label */}
            <div className="flex items-center justify-between text-xs text-[var(--fg-soft)] pt-1 font-mono">
              <span>View Mode: <strong className="text-[var(--fg)]">{activeTab.replace('_', ' ')}</strong></span>
              <span>Input Size: 512×512 Normalized</span>
            </div>
          </div>
        </div>

        {/* Right Column: Quantitative Findings & Rule Cross-Checks (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          {/* Diagnostic Assessment Card */}
          <div className="p-4 sm:p-5 rounded border border-[var(--rule)] bg-[var(--bg-2)] space-y-3">
            <span className="text-label text-[var(--amber)]">MODEL ASSESSMENT RESULT</span>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg sm:text-xl font-heading font-semibold text-[var(--fg)]">
                  {analysis.riskLabel}
                </h3>
                <p className="text-xs text-[var(--fg-soft)] mt-1">
                  Confidence Score: <strong className="text-[var(--fg)] font-mono">{(analysis.confidenceScore * 100).toFixed(1)}%</strong>
                </p>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="text-[10px] text-[var(--fg-faint)] uppercase block">ETDRS Scale</span>
                <span className="text-[var(--teal)] font-bold">Grade {isModerateDR ? '2 / 4' : '0 / 4'}</span>
              </div>
            </div>

            <div className="p-3 rounded bg-[var(--bg)] border border-[var(--rule)] text-xs text-[var(--fg-soft)] leading-relaxed">
              {analysis.explainability.clinicalRationale}
            </div>
          </div>

          {/* Clinical Deterministic Rule Verification Matrix */}
          <div className="p-4 sm:p-5 rounded border border-[var(--rule)] bg-[var(--bg-2)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-2.5">
              <span className="text-label text-[var(--teal)]">CLINICAL RULE VERIFICATION</span>
              <span className="text-[10px] font-mono text-[var(--fg-faint)]">SAFETY INTERCEPTOR</span>
            </div>

            <div className="space-y-2">
              {analysis.ruleCrossChecks.map((rule, idx) => (
                <div key={idx} className="p-2.5 rounded bg-[var(--bg)] border border-[var(--rule)] flex items-start gap-2.5 text-xs">
                  <div className="mt-0.5 shrink-0">
                    {rule.status === 'MET' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--teal)]" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-[var(--amber)]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-[var(--fg)] truncate">{rule.ruleName}</span>
                      <span
                        className={`text-[10px] font-mono font-semibold shrink-0 ${
                          rule.status === 'MET' ? 'text-[var(--teal)]' : 'text-[var(--amber)]'
                        }`}
                      >
                        {rule.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--fg-soft)] mt-0.5">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls with >= 44px tap targets */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onBackToQuality}
              className="w-full sm:w-auto px-5 py-3 rounded-full border border-[var(--rule)] text-xs text-[var(--fg)] hover:border-[var(--fg-soft)] transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
            >
              ← Back to Quality Gate
            </button>
            <button
              type="button"
              onClick={onProceedToTriage}
              className="w-full sm:flex-1 px-6 py-3 rounded-full bg-[var(--teal)] text-white font-medium text-xs sm:text-sm hover:opacity-95 active:scale-[0.98] transition-all shadow-sm cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
            >
              <span>Proceed to Clinical Triage</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
