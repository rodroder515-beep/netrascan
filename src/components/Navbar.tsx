import React, { useState, useEffect } from 'react';
import { Menu, X, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import { Logo } from './Logo';

export type NavTab = 'dashboard' | 'screening' | 'history' | 'simulation' | 'system';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onReplayIntro?: () => void;
  isOfflineReady?: boolean;
  isDemoMode?: boolean;
  viewDensity?: 'compact' | 'comfortable';
  onToggleDensity?: () => void;
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onReplayIntro,
  isOfflineReady = true,
  isDemoMode = true,
  viewDensity = 'comfortable',
  onToggleDensity,
  className = '',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const tabs: { id: NavTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'screening', label: 'Screening' },
    { id: 'history', label: 'History' },
    { id: 'simulation', label: 'Simulation' },
    { id: 'system', label: 'System' },
  ];

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleTabClick = (tabId: NavTab) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 h-14 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--rule)] flex items-center justify-between px-3 sm:px-6 md:px-8 ${className}`}
      >
        {/* Brand logo */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Logo onClick={() => handleTabClick('dashboard')} />
        </div>

        {/* Desktop / Laptop navigation tabs (1024px and above) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`relative px-3.5 py-1.5 text-[13px] font-medium transition-all cursor-pointer rounded-full whitespace-nowrap min-h-[36px] flex items-center ${
                  isActive
                    ? 'text-[var(--fg)] bg-[var(--bg-2)] shadow-xs font-semibold'
                    : 'text-[var(--fg-soft)] hover:text-[var(--fg)] hover:bg-[var(--bg-2)]/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right side: Density toggle, Operator info & Offline / Demo Mode status */}
        <div className="flex items-center gap-2 sm:gap-3 text-[11px] font-mono tracking-wider shrink-0">
          {/* Quick View Density Toggle */}
          {onToggleDensity && (
            <button
              onClick={onToggleDensity}
              title={`Click to switch to ${viewDensity === 'comfortable' ? 'Compact' : 'Comfortable'} mode`}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--rule)] hover:border-[var(--teal)] bg-[var(--bg-2)] text-[11px] font-medium text-[var(--fg-soft)] hover:text-[var(--fg)] transition-all cursor-pointer min-h-[32px]"
            >
              {viewDensity === 'comfortable' ? (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-[var(--teal)] shrink-0" />
                  <span>Comfortable</span>
                </>
              ) : (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-[var(--amber)] shrink-0" />
                  <span>Compact</span>
                </>
              )}
            </button>
          )}

          <div className="hidden xl:flex items-center gap-2 text-[var(--fg-soft)]">
            <span>ASHA</span>
            <span className="text-[var(--rule)]">·</span>
            <span>PHC 01</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[var(--rule)] bg-[var(--bg-2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--fg-soft)] font-sans font-semibold">
              {isDemoMode ? 'DEMO MODE' : isOfflineReady ? 'OFFLINE READY' : 'ONLINE'}
            </span>
          </div>

          {onReplayIntro && (
            <button
              onClick={onReplayIntro}
              title="Replay intro video scrub"
              className="hidden lg:inline-flex text-[10px] uppercase tracking-widest text-[var(--fg-faint)] hover:text-[var(--fg)] cursor-pointer px-2 py-1"
            >
              Replay Intro
            </button>
          )}

          {/* Mobile / Tablet Menu Button (screens under 1024px) with large 44px tap target */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden flex items-center justify-center w-11 h-11 min-h-[44px] min-w-[44px] rounded border border-[var(--rule)] bg-[var(--bg-2)] text-[var(--fg)] hover:text-[var(--amber)] transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile / Tablet Navigation Overlay Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-[var(--bg)]/98 backdrop-blur-xl animate-fadeIn">
          {/* Mobile Drawer Header */}
          <div className="h-14 border-b border-[var(--rule)] flex items-center justify-between px-4 sm:px-6">
            <Logo onClick={() => handleTabClick('dashboard')} />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center w-11 h-11 min-h-[44px] min-w-[44px] rounded border border-[var(--rule)] bg-[var(--bg-2)] text-[var(--fg)]"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Navigation Links with large 44px touch targets */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-3">
            <div className="text-label text-[var(--fg-faint)] px-3 mb-2">
              NAVIGATION
            </div>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-lg text-sm font-medium transition-colors min-h-[48px] cursor-pointer text-left ${
                    isActive
                      ? 'bg-[var(--fg)] text-[var(--bg)] font-semibold shadow-md'
                      : 'text-[var(--fg)] hover:bg-[var(--bg-2)] border border-[var(--rule)]'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && <span className="text-xs uppercase font-mono tracking-widest">Active</span>}
                </button>
              );
            })}

            {/* View Density Mobile Selector */}
            {onToggleDensity && (
              <div className="pt-4 border-t border-[var(--rule)] space-y-2">
                <div className="text-label text-[var(--fg-faint)] px-3">
                  DISPLAY VIEW DENSITY
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      if (viewDensity !== 'comfortable') onToggleDensity();
                    }}
                    className={`p-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 min-h-[44px] ${
                      viewDensity === 'comfortable'
                        ? 'border-[var(--teal)] bg-[var(--teal)]/15 text-[var(--teal)] font-semibold'
                        : 'border-[var(--rule)] text-[var(--fg-soft)] bg-[var(--bg-2)]'
                    }`}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Comfortable</span>
                  </button>
                  <button
                    onClick={() => {
                      if (viewDensity !== 'compact') onToggleDensity();
                    }}
                    className={`p-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 min-h-[44px] ${
                      viewDensity === 'compact'
                        ? 'border-[var(--amber)] bg-[var(--amber)]/15 text-[var(--amber)] font-semibold'
                        : 'border-[var(--rule)] text-[var(--fg-soft)] bg-[var(--bg-2)]'
                    }`}
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Compact</span>
                  </button>
                </div>
              </div>
            )}

            {/* Operator and Status Info */}
            <div className="pt-4 border-t border-[var(--rule)] space-y-3">
              <div className="text-label text-[var(--fg-faint)] px-3">
                SYSTEM & DEPLOYMENT
              </div>
              <div className="p-3 rounded-lg border border-[var(--rule)] bg-[var(--bg-2)] flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--fg-soft)]">Primary Health Centre:</span>
                <span className="text-[var(--fg)] font-semibold">Kalyanpur · PHC 01</span>
              </div>
              <div className="p-3 rounded-lg border border-[var(--rule)] bg-[var(--bg-2)] flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--fg-soft)]">Inference Status:</span>
                <span className="text-[var(--teal)] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--teal)] animate-pulse" />
                  {isDemoMode ? 'OFFLINE DEMO READY' : 'OFFLINE EMBEDDED'}
                </span>
              </div>

              {onReplayIntro && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onReplayIntro();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[var(--rule)] text-[var(--fg-soft)] hover:text-[var(--fg)] hover:border-[var(--amber)] min-h-[44px] text-xs font-mono tracking-wider transition-colors cursor-pointer mt-4"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[var(--amber)]" />
                  <span>REPLAY INTRO VIDEO SCRUB</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
