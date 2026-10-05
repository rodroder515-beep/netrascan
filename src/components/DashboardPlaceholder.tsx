import React from 'react';
import { NavTab } from './Navbar';

interface DashboardPlaceholderProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onReplayIntro: () => void;
}

export const DashboardPlaceholder: React.FC<DashboardPlaceholderProps> = ({
  activeTab,
  onNavigate,
  onReplayIntro,
}) => {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col justify-between">
      <div className="space-y-8">
        {/* Page Title & Breadcrumb */}
        <div className="border-b border-[var(--rule)] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-label text-[var(--fg-faint)] mb-2">
              <span>PRIMARY HEALTH CENTRE 01</span>
              <span>/</span>
              <span className="text-[var(--amber)] uppercase">{activeTab}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-semibold tracking-tight text-[var(--fg)]">
              {activeTab === 'dashboard' && 'SCREENING OVERVIEW'}
              {activeTab === 'screening' && 'POINT-OF-CARE SCREENING'}
              {activeTab === 'history' && 'SCREENING RECORDS'}
              {activeTab === 'simulation' && 'EXPLAINABLE AI SIMULATION'}
              {activeTab === 'system' && 'SYSTEM & DIAGNOSTICS'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--fg-soft)]">Protocol: SIH-2026-DR-04</span>
          </div>
        </div>

        {/* Clinical Safety Banner - Required safety language */}
        <div className="p-4 rounded border border-[var(--rule)] bg-[var(--bg-2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[var(--fg-soft)]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[var(--amber)] shrink-0" />
            <p>
              <strong className="text-[var(--fg)] font-medium">Safety Notice:</strong> NetraScan is an AI-assisted screening and triage support system, not a medical diagnosis system. All assessments support referral decisions and never replace ophthalmic evaluation.
            </p>
          </div>
          <span className="text-label text-[var(--fg-faint)] shrink-0">DEMO PROTOTYPE</span>
        </div>

        {/* Placeholder Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded border border-[var(--rule)] bg-[var(--bg-2)]/60 flex flex-col justify-between min-h-[200px]">
            <div>
              <span className="text-label text-[var(--fg-faint)]">SESSION SCOPE</span>
              <h2 className="text-lg font-heading font-medium text-[var(--fg)] mt-2">
                Prompt 1 Active
              </h2>
              <p className="text-xs text-[var(--fg-soft)] mt-2 leading-relaxed">
                Opening sequence scrub, typography, design tokens, and application shell initialized.
              </p>
            </div>
            <div className="pt-4 border-t border-[var(--rule)] flex items-center justify-between">
              <span className="text-[11px] font-mono text-[var(--teal)]">Ready for Prompt 2</span>
              <span className="text-label text-[var(--fg-faint)]">SHELL OK</span>
            </div>
          </div>

          <div className="p-6 rounded border border-[var(--rule)] bg-[var(--bg-2)]/60 flex flex-col justify-between min-h-[200px]">
            <div>
              <span className="text-label text-[var(--fg-faint)]">UPCOMING MODULES</span>
              <h2 className="text-lg font-heading font-medium text-[var(--fg)] mt-2">
                Full Screening Workflow
              </h2>
              <p className="text-xs text-[var(--fg-soft)] mt-2 leading-relaxed">
                Fundus image capture, image quality assessment, explainable Grad-CAM heatmap visualization, and offline sync.
              </p>
            </div>
            <div className="pt-4 border-t border-[var(--rule)] flex items-center justify-between">
              <span className="text-[11px] font-mono text-[var(--fg-soft)]">Services & Mocks prepared</span>
              <span className="text-label text-[var(--fg-faint)]">PENDING P2</span>
            </div>
          </div>

          <div className="p-6 rounded border border-[var(--rule)] bg-[var(--bg-2)]/60 flex flex-col justify-between min-h-[200px]">
            <div>
              <span className="text-label text-[var(--fg-faint)]">CONTROLS</span>
              <h2 className="text-lg font-heading font-medium text-[var(--fg)] mt-2">
                Intro Sequence
              </h2>
              <p className="text-xs text-[var(--fg-soft)] mt-2 leading-relaxed">
                Test the scroll-scrubbed video opening with cross-fading typography panels.
              </p>
            </div>
            <div className="pt-4 border-t border-[var(--rule)]">
              <button
                onClick={onReplayIntro}
                className="w-full py-2 px-3 rounded border border-[var(--rule)] text-xs text-[var(--fg)] hover:border-[var(--amber)] hover:text-[var(--amber)] transition-colors cursor-pointer text-center"
              >
                Replay Opening Scrub
              </button>
            </div>
          </div>
        </div>

        {/* Minimal System Info for System tab */}
        {activeTab === 'system' && (
          <div className="p-6 rounded border border-[var(--rule)] bg-[var(--bg-2)] space-y-4">
            <h2 className="text-lg font-heading font-medium text-[var(--fg)]">System Diagnostics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 border border-[var(--rule)] rounded">
                <div className="text-[var(--fg-faint)] text-label">STORAGE</div>
                <div className="text-[var(--fg)] mt-1">IndexedDB Ready</div>
              </div>
              <div className="p-3 border border-[var(--rule)] rounded">
                <div className="text-[var(--fg-faint)] text-label">NETWORK</div>
                <div className="text-[var(--amber)] mt-1">Offline Cached</div>
              </div>
              <div className="p-3 border border-[var(--rule)] rounded">
                <div className="text-[var(--fg-faint)] text-label">LATENCY</div>
                <div className="text-[var(--fg)] mt-1">Local (0ms)</div>
              </div>
              <div className="p-3 border border-[var(--rule)] rounded">
                <div className="text-[var(--fg-faint)] text-label">MODEL INFERENCE</div>
                <div className="text-[var(--teal)] mt-1">Embedded TFLite</div>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={onReplayIntro}
                className="px-4 py-2 rounded border border-[var(--rule)] text-xs text-[var(--fg)] hover:border-[var(--amber)] hover:text-[var(--amber)] transition-colors cursor-pointer"
              >
                Replay Intro
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-6 border-t border-[var(--rule)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--fg-faint)] gap-4">
        <span>NetraScan · Explainable AI for Diabetic Retinopathy Screening in Rural India</span>
        <span>SIH 2026 Prototype · Fictional Patient Demonstration Data</span>
      </footer>
    </main>
  );
};
