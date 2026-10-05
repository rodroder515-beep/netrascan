import React, { useState } from 'react';
import { Layers, Smartphone, ShieldCheck, Cpu, Database, CloudUpload, Play, Lock, ChevronRight, FileCode2, GitFork, Maximize2, Minimize2, Check, Sliders } from 'lucide-react';
import { InteractiveWorkflowDiagram } from './InteractiveWorkflowDiagram';
import { NavTab } from './Navbar';
import { ScreeningWorkflowStep } from './WorkflowStepper';

interface SystemArchitectureViewProps {
  onReplayIntro: () => void;
  onNavigate?: (tab: NavTab, step?: ScreeningWorkflowStep) => void;
  viewDensity?: 'compact' | 'comfortable';
  onSelectDensity?: (density: 'compact' | 'comfortable') => void;
}

export const SystemArchitectureView: React.FC<SystemArchitectureViewProps> = ({
  onReplayIntro,
  onNavigate,
  viewDensity = 'comfortable',
  onSelectDensity,
}) => {
  const [viewMode, setViewMode] = useState<'FLOWCHART' | 'MODULES'>('FLOWCHART');
  const [selectedBlock, setSelectedBlock] = useState<number>(2);

  const BLOCKS = [
    {
      id: 0,
      title: '1. Edge Fundus Optical Capture',
      tag: 'HARDWARE INTERFACE',
      icon: Smartphone,
      summary: 'Portable non-mydriatic 45° smartphone fundus lens attachment at rural sub-centre.',
      details: [
        'FOV: 45° macular and optic disc coverage.',
        'Illumination: Infrared pupil positioning LED with low-intensity white flash.',
        'Target: Operable by frontline ASHA health workers with zero pupil-dilating eye drops (non-mydriatic).',
      ],
      specs: '1920x1920 raw · Smartphone Clip-on',
    },
    {
      id: 1,
      title: '2. On-Device Optical Quality Gate',
      tag: 'PRE-INFERENCE SAFETY',
      icon: ShieldCheck,
      summary: 'Rigorous 6-parameter mathematical assessment before neural processing.',
      details: [
        'Edge gradient analysis on micro-vessels to verify optical focus (>90% threshold).',
        'Luminance histogram verification to flag corneal reflection or deep shadow.',
        'Hard Rule Enforcement: Ungradable images halt pipeline and mandate immediate retake.',
      ],
      specs: '45ms on edge ARM CPU · Sobel Filter',
    },
    {
      id: 2,
      title: '3. Embedded Explainable Vision AI',
      tag: 'EDGE TFLITE INFERENCE',
      icon: Cpu,
      summary: 'Compact convolutional neural network generating classification and Grad-CAM maps.',
      details: [
        'Backbone: MobileNetV3-Small / EfficientNet-Lite quantized to INT8.',
        'Segmentation: U-Net vessel tree extractor and polar Hough optic disc demarcator.',
        'Explainability: Gradient-weighted Class Activation Mapping (Grad-CAM) highlights diagnostic features.',
      ],
      specs: '6.8 MB INT8 Quantized · 520ms Latency',
    },
    {
      id: 3,
      title: '4. Rule-Based Clinical Engine',
      tag: 'SAFETY CROSS-CHECK',
      icon: Layers,
      summary: 'Deterministic clinical guideline cross-check to prevent deep-learning hallucinations.',
      details: [
        'ETDRS microaneurysm quadrant counting rule verification.',
        'Macular edema proximity safety rule: Hard exudate clearance check.',
        'Corroborates neural network probability against clinical ophthalmology referral rules.',
      ],
      specs: 'Deterministic logic · Safety alert override',
    },
    {
      id: 4,
      title: '5. Encrypted Local Store',
      tag: 'OFFLINE INDEXEDDB',
      icon: Database,
      summary: 'Complete offline operational capability with zero mandatory cloud connectivity.',
      details: [
        'Patient demographic and screening data stored in local encrypted IndexedDB.',
        'Images stored locally as compressed WebP binaries.',
        'Full historical search, re-inspection, and reporting operational without internet.',
      ],
      specs: 'Encrypted IndexedDB · Zero telemetry leaks',
    },
    {
      id: 5,
      title: '6. Tele-Ophthalmology Sync Queue',
      tag: 'STORE-AND-FORWARD',
      icon: CloudUpload,
      summary: 'ABDM-compliant store-and-forward queue syncing when cellular network is restored.',
      details: [
        'Ayushman Bharat Digital Mission (ABDM) / ABHA ID integration compatibility.',
        'HL7 FHIR DiagnosticReport JSON schema standard export.',
        'Automatic asynchronous background sync when device reconnects to Wi-Fi/4G.',
      ],
      specs: 'HL7 FHIR JSON · TLS 1.3 sync queue',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-6xl mx-auto w-full">
      {/* Title & Mode Switcher */}
      <div className="border-b border-[var(--rule)] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-label text-[var(--teal)]">SYSTEM SETTINGS & ARCHITECTURE</span>
          <h1 className="font-heading font-semibold text-[26px] sm:text-[30px] text-[var(--fg)] mt-1 tracking-[-0.02em] leading-tight">
            System & Display Configuration
          </h1>
          <p className="text-[14px] text-[var(--fg-soft)] mt-1 max-w-2xl leading-[1.6]">
            Configure point-of-care display density, offline synchronization, and inspect edge AI pipeline guarantees.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto flex-wrap">
          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1 border border-[var(--rule)] rounded-full p-1 bg-[var(--bg-2)] text-xs">
            <button
              type="button"
              onClick={() => setViewMode('FLOWCHART')}
              className={`px-3 py-1.5 rounded-full transition-all font-medium cursor-pointer min-h-[34px] flex items-center gap-1.5 ${
                viewMode === 'FLOWCHART'
                  ? 'bg-[var(--teal)] text-white shadow-xs'
                  : 'text-[var(--fg-soft)] hover:text-[var(--fg)]'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Flowchart</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('MODULES')}
              className={`px-3 py-1.5 rounded-full transition-all font-medium cursor-pointer min-h-[34px] flex items-center gap-1.5 ${
                viewMode === 'MODULES'
                  ? 'bg-[var(--teal)] text-white shadow-xs'
                  : 'text-[var(--fg-soft)] hover:text-[var(--fg)]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Modules</span>
            </button>
          </div>

          <button
            onClick={onReplayIntro}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--rule)] hover:border-[var(--teal)] text-xs text-[var(--fg)] hover:text-[var(--teal)] transition-colors cursor-pointer min-h-[36px]"
          >
            <Play className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Replay Intro</span>
          </button>
        </div>
      </div>

      {/* GLOBAL VIEW DENSITY SETTING CARD */}
      <div className="p-5 sm:p-6 rounded-xl border border-[var(--rule)] bg-[var(--bg-2)] space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--rule)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[var(--teal)]/10 text-[var(--teal)] border border-[var(--teal)]/25">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[17px] font-heading font-semibold text-[var(--fg)]">
                Global View Density
              </h2>
              <p className="text-[13px] text-[var(--fg-soft)] mt-0.5">
                Switch spacing, typography size, and row padding across the entire app shell.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[12px] font-medium px-3 py-1 rounded-full bg-[var(--bg)] border border-[var(--rule)] self-start sm:self-auto">
            <span className="text-[var(--fg-soft)]">Current Mode:</span>
            <span className="font-semibold text-[var(--teal)] capitalize">{viewDensity}</span>
          </div>
        </div>

        {/* Density Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Option 1: Comfortable */}
          <div
            onClick={() => onSelectDensity?.('comfortable')}
            className={`p-4 sm:p-5 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
              viewDensity === 'comfortable'
                ? 'border-[var(--teal)] bg-[var(--bg)] shadow-md'
                : 'border-[var(--rule)] bg-[var(--bg)]/60 hover:border-[var(--fg-soft)]/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Maximize2 className={`w-4 h-4 ${viewDensity === 'comfortable' ? 'text-[var(--teal)]' : 'text-[var(--fg-soft)]'}`} />
                  <span className="font-heading font-semibold text-[15px] text-[var(--fg)]">
                    Comfortable (Recommended)
                  </span>
                </div>
                {viewDensity === 'comfortable' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--teal)] bg-[var(--teal)]/10 px-2 py-0.5 rounded-full border border-[var(--teal)]/30">
                    <Check className="w-3 h-3" />
                    Active
                  </span>
                )}
              </div>
              <p className="text-[13px] text-[var(--fg-soft)] leading-relaxed">
                Spacious layout with generous 15px body typography, larger 52px metric numbers, and comfortable 50px table rows. Best for desktop monitors, wall-mounted displays, and distance viewing.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--rule)] flex items-center justify-between text-[11px] text-[var(--fg-soft)]">
              <span>Touch targets: 44px+</span>
              <span className="font-mono text-[var(--teal)]">Higher readability</span>
            </div>
          </div>

          {/* Option 2: Compact */}
          <div
            onClick={() => onSelectDensity?.('compact')}
            className={`p-4 sm:p-5 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
              viewDensity === 'compact'
                ? 'border-[var(--amber)] bg-[var(--bg)] shadow-md'
                : 'border-[var(--rule)] bg-[var(--bg)]/60 hover:border-[var(--fg-soft)]/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Minimize2 className={`w-4 h-4 ${viewDensity === 'compact' ? 'text-[var(--amber)]' : 'text-[var(--fg-soft)]'}`} />
                  <span className="font-heading font-semibold text-[15px] text-[var(--fg)]">
                    Compact
                  </span>
                </div>
                {viewDensity === 'compact' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--amber)] bg-[var(--amber)]/10 px-2 py-0.5 rounded-full border border-[var(--amber)]/30">
                    <Check className="w-3 h-3" />
                    Active
                  </span>
                )}
              </div>
              <p className="text-[13px] text-[var(--fg-soft)] leading-relaxed">
                Condensed information architecture with 12px–13px text, 38px table rows, and tighter card margins. Best for smaller laptop screens or tablets to inspect maximum patient records simultaneously.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--rule)] flex items-center justify-between text-[11px] text-[var(--fg-soft)]">
              <span>Touch targets: 38px–40px</span>
              <span className="font-mono text-[var(--amber)]">Max data density</span>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 1: FLOWCHART VIEW (Matches the user's diagram) */}
      {viewMode === 'FLOWCHART' && (
        <InteractiveWorkflowDiagram onNavigate={onNavigate} />
      )}

      {/* VIEW 2: MODULES VIEW */}
      {viewMode === 'MODULES' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="text-label text-[var(--fg-faint)]">
              CLICK ANY SYSTEM STAGE TO INSPECT TECHNICAL SPECIFICATIONS & SAFETY GUARANTEES:
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3">
              {BLOCKS.map((block) => {
                const Icon = block.icon;
                const isSelected = selectedBlock === block.id;

                return (
                  <button
                    key={block.id}
                    onClick={() => setSelectedBlock(block.id)}
                    className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[48px] ${
                      isSelected
                        ? 'border-[var(--teal)] bg-[var(--bg-2)] shadow-md ring-1 ring-[var(--teal)]/40'
                        : 'border-[var(--rule)] bg-[var(--bg-2)]/60 hover:border-[var(--fg-soft)]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-[var(--fg-faint)] mb-2">
                        <span>{block.tag}</span>
                        <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[var(--teal)]' : 'text-[var(--fg-soft)]'}`} />
                      </div>
                      <h3 className="text-xs sm:text-sm font-heading font-semibold text-[var(--fg)] mb-1">
                        {block.title}
                      </h3>
                      <p className="text-xs text-[var(--fg-soft)] line-clamp-2 leading-relaxed">
                        {block.summary}
                      </p>
                    </div>

                    <div className="pt-2.5 mt-2.5 border-t border-[var(--rule)] flex items-center justify-between text-[11px] font-mono text-[var(--fg-faint)]">
                      <span className={isSelected ? 'text-[var(--teal)] font-medium' : ''}>
                        {isSelected ? 'ACTIVE INSPECTION' : 'Click to inspect'}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Block Detailed Inspection Card */}
          {selectedBlock !== null && (
            <div className="p-4 sm:p-6 rounded-xl border border-[var(--teal)]/50 bg-[var(--bg-2)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--rule)] pb-3 sm:pb-4 gap-2">
                <div>
                  <span className="text-label text-[var(--teal)]">
                    {BLOCKS[selectedBlock].tag}
                  </span>
                  <h2 className="text-lg sm:text-xl font-heading font-semibold text-[var(--fg)] mt-0.5">
                    {BLOCKS[selectedBlock].title}
                  </h2>
                </div>
                <span className="text-[11px] sm:text-xs font-mono text-[var(--teal)] px-3 py-1 rounded-full border border-[var(--teal)]/40 bg-[var(--teal)]/10 self-start sm:self-auto">
                  {BLOCKS[selectedBlock].specs}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[var(--fg-soft)] leading-relaxed">
                {BLOCKS[selectedBlock].summary}
              </p>

              <div className="space-y-2 pt-1">
                <span className="text-label text-[var(--fg-faint)]">ARCHITECTURAL DETAILS & CONSTRAINTS:</span>
                <ul className="space-y-1.5 text-xs text-[var(--fg-soft)] leading-relaxed">
                  {BLOCKS[selectedBlock].details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[var(--teal)] font-bold mt-0.5">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Operational Matrix for Field Deployment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
        <div className="p-4 sm:p-5 rounded-xl border border-[var(--rule)] bg-[var(--bg-2)] space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-[var(--teal)]">
            <Lock className="w-4 h-4 shrink-0" />
            <h4 className="text-xs font-heading font-semibold text-[var(--fg)]">ZERO CLOUD DEPENDENCY</h4>
          </div>
          <p className="text-xs text-[var(--fg-soft)] leading-relaxed">
            Entire optical evaluation, U-Net vessel segmentation, and Grad-CAM heatmap inference execute directly on the edge smartphone device. Zero internet required during clinic hours.
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-[var(--rule)] bg-[var(--bg-2)] space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-[var(--amber)]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <h4 className="text-xs font-heading font-semibold text-[var(--fg)]">CLINICAL SAFETY GATE</h4>
          </div>
          <p className="text-xs text-[var(--fg-soft)] leading-relaxed">
            Deterministic rule engines intercept ungradable captures and cross-validate deep learning scores against standard ETDRS microvascular guidelines before issuing triage.
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-[var(--rule)] bg-[var(--bg-2)] space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-[var(--fg)]">
            <FileCode2 className="w-4 h-4 shrink-0" />
            <h4 className="text-xs font-heading font-semibold text-[var(--fg)]">ABDM & FHIR INTEROPERABILITY</h4>
          </div>
          <p className="text-xs text-[var(--fg-soft)] leading-relaxed">
            Structured DiagnosticReport FHIR standard payload formatted for Ayushman Bharat Digital Mission patient health records (ABHA) tele-consultation linkage.
          </p>
        </div>
      </div>
    </div>
  );
};
