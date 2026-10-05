/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { OpeningScrub } from './components/OpeningScrub';
import { Navbar, NavTab } from './components/Navbar';
import { WorkflowStepper, ScreeningWorkflowStep } from './components/WorkflowStepper';
import { DashboardView } from './components/DashboardView';
import { NewScreeningView } from './components/NewScreeningView';
import { QualityGateView } from './components/QualityGateView';
import { AiAnalysisView } from './components/AiAnalysisView';
import { TriageView } from './components/TriageView';
import { PrintableReportModal } from './components/PrintableReportModal';
import { HistoryView } from './components/HistoryView';
import { DistrictSimulationView } from './components/DistrictSimulationView';
import { SystemArchitectureView } from './components/SystemArchitectureView';
import { apiService, PatientIntake, QualityCheckResult, ScreeningAnalysisResult } from './services/api';
import { DEMO_PRESET_PATIENTS, RECENT_SCREENINGS } from './mocks/mockPatients';

export default function App() {
  const [inApp, setInApp] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [viewDensity, setViewDensity] = useState<'compact' | 'comfortable'>(() => {
    if (typeof window === 'undefined') return 'comfortable';
    try {
      const saved = localStorage.getItem('netrascan_density');
      return (saved === 'compact' || saved === 'comfortable') ? saved : 'comfortable';
    } catch {
      return 'comfortable';
    }
  });

  const handleToggleDensity = () => {
    setViewDensity((prev) => {
      const next = prev === 'comfortable' ? 'compact' : 'comfortable';
      try {
        localStorage.setItem('netrascan_density', next);
      } catch {}
      return next;
    });
  };

  const handleSelectDensity = (density: 'compact' | 'comfortable') => {
    setViewDensity(density);
    try {
      localStorage.setItem('netrascan_density', density);
    } catch {}
  };

  // Workflow states
  const [workflowStep, setWorkflowStep] = useState<ScreeningWorkflowStep>('capture');
  const [completedSteps, setCompletedSteps] = useState<ScreeningWorkflowStep[]>([]);
  
  // Active screening session state
  const [activePatient, setActivePatient] = useState<PatientIntake>(DEMO_PRESET_PATIENTS[0].patient);
  const [activeImageSrc, setActiveImageSrc] = useState<string>(DEMO_PRESET_PATIENTS[0].imagePath);
  const [activeQuality, setActiveQuality] = useState<QualityCheckResult | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<ScreeningAnalysisResult | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Check backend health on mount
  useEffect(() => {
    setIsDemoMode(apiService.getIsDemoMode());
  }, []);

  // Get viewport height safe for 100dvh on mobile
  const getViewportHeight = useCallback(() => {
    if (typeof window === 'undefined') return 800;
    return window.visualViewport?.height || window.innerHeight || 800;
  }, []);

  // Scroll to the top of the cream app shell
  const scrollToAppTop = useCallback((smooth = true) => {
    const trackHeight = getViewportHeight() * 4.5;
    window.scrollTo({
      top: trackHeight,
      behavior: smooth && !prefersReducedMotion ? 'smooth' : 'auto',
    });
  }, [prefersReducedMotion, getViewportHeight]);

  // Handle handoff directly from Opening buttons (e.g. "Start screening")
  const handleEnterApp = useCallback((targetPage?: string) => {
    if (
      targetPage === 'dashboard' ||
      targetPage === 'screening' ||
      targetPage === 'history' ||
      targetPage === 'simulation' ||
      targetPage === 'system'
    ) {
      setActiveTab(targetPage);
    } else {
      setActiveTab('dashboard');
    }

    setInApp(true);
    scrollToAppTop(true);
  }, [scrollToAppTop]);

  // Replay intro: smoothly scrolls back to 0, rewinding video and returning to dark opening
  const handleReplayIntro = useCallback(() => {
    setInApp(false);
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, [prefersReducedMotion]);

  // Bidirectional scroll sync: ensures inApp stays synchronized with window scroll position across any screen ratio
  useEffect(() => {
    const checkScrollPosition = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const vh = window.visualViewport?.height || window.innerHeight || 800;
      const trackHeight = vh * 4.5;
      const progress = scrollY / trackHeight;

      if (progress >= 0.98) {
        setInApp(true);
      } else if (progress < 0.975) {
        setInApp(false);
      }
    };

    checkScrollPosition();
    window.addEventListener('scroll', checkScrollPosition, { passive: true });
    window.addEventListener('touchmove', checkScrollPosition, { passive: true });
    window.addEventListener('resize', checkScrollPosition, { passive: true });

    return () => {
      window.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('touchmove', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, []);

  // Start new screening flow
  const handleStartNewScreening = () => {
    setWorkflowStep('capture');
    setCompletedSteps([]);
    setActiveQuality(null);
    setActiveAnalysis(null);
    setActiveTab('screening');
    scrollToAppTop(true);
  };

  // Step 1 -> Step 2
  const handleProceedToQualityGate = async (patient: PatientIntake, imageData: string) => {
    setActivePatient(patient);
    setActiveImageSrc(imageData);
    setWorkflowStep('quality');
    setCompletedSteps((prev) => Array.from(new Set([...prev, 'capture'])));
    scrollToAppTop(true);
  };

  // Step 2 -> Step 3 & 4
  const handleProceedToAnalysis = async (quality: QualityCheckResult) => {
    setActiveQuality(quality);
    setCompletedSteps((prev) => Array.from(new Set([...prev, 'capture', 'quality'])));
    
    // Run AI analysis inference
    const result = await apiService.runAnalysis(activePatient, activeImageSrc, quality);
    setActiveAnalysis(result);
    setWorkflowStep('analyze');
    scrollToAppTop(true);
  };

  // Step 4 -> Step 5
  const handleProceedToTriage = () => {
    setWorkflowStep('triage');
    setCompletedSteps((prev) => Array.from(new Set([...prev, 'capture', 'quality', 'analyze', 'explain'])));
    scrollToAppTop(true);
  };

  // View screening record from dashboard or history
  const handleInspectScreeningRecord = async (screeningId: string) => {
    const summary = RECENT_SCREENINGS.find((r) => r.id === screeningId) || RECENT_SCREENINGS[0];
    
    // Construct patient from summary
    const patientData: PatientIntake = {
      id: summary.patientId,
      name: summary.name,
      age: summary.age,
      gender: summary.gender,
      village: summary.village,
      diabetesDurationYears: summary.riskTier === 'MODERATE_NONPROLIFERATIVE' ? 9 : 4,
      randomBloodSugar: summary.riskTier === 'MODERATE_NONPROLIFERATIVE' ? 210 : 142,
      hba1c: summary.riskTier === 'MODERATE_NONPROLIFERATIVE' ? 8.8 : 6.8,
      eye: summary.eye,
      screeningDate: summary.date,
    };

    const imgSrc = summary.riskTier === 'MODERATE_NONPROLIFERATIVE' ? '/demo-fundus-dr.jpg' : '/demo-fundus.jpg';
    setActivePatient(patientData);
    setActiveImageSrc(imgSrc);

    const quality = await apiService.evaluateQuality(imgSrc);
    setActiveQuality(quality);

    const analysis = await apiService.runAnalysis(patientData, imgSrc, quality);
    setActiveAnalysis(analysis);

    setCompletedSteps(['capture', 'quality', 'analyze', 'explain', 'triage']);
    setWorkflowStep('triage');
    setActiveTab('screening');
    scrollToAppTop(true);
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#0A0C0E] text-[var(--fg)] selection:bg-[var(--amber)]/20 selection:text-[var(--fg)] overflow-x-hidden">
      {/* 1. Opening Scrub Sequence (Fixed video stage + panels + 450vh scroll track) */}
      <OpeningScrub
        inApp={inApp}
        onHandoffChange={setInApp}
        onEnterApp={handleEnterApp}
      />

      {/* 2. Fixed Cream Backdrop: Smoothly cross-fades in over 600ms when video reaches last frame */}
      <div
        className={`fixed inset-0 w-full h-[100dvh] z-10 bg-[#EDE7DC] pointer-events-none transition-opacity ${
          prefersReducedMotion ? 'duration-0' : 'duration-600 ease-[var(--ease)]'
        } ${inApp ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden="true"
      />

      {/* 3. Main Fixed Top Navigation: Slides up 12px and fades in over 600ms */}
      <div
        className={`fixed top-0 inset-x-0 z-40 transition-all ${
          prefersReducedMotion ? 'duration-0' : 'duration-600 ease-[var(--ease)]'
        } ${
          inApp
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <Navbar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            scrollToAppTop(true);
          }}
          onReplayIntro={handleReplayIntro}
          isOfflineReady={true}
          isDemoMode={isDemoMode}
          viewDensity={viewDensity}
          onToggleDensity={handleToggleDensity}
        />
      </div>

      {/* 4. Cream App Shell Container: Positioned immediately after opening track */}
      <div
        id="netrascan-app-shell"
        className={`cream-app density-${viewDensity} min-h-[100dvh] relative z-20 flex flex-col transition-opacity w-full overflow-x-hidden ${
          prefersReducedMotion ? 'duration-0' : 'duration-600 ease-[var(--ease)]'
        } ${
          inApp ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Workflow Stepper Bar (visible on screening tab or when active in workflow) */}
        {activeTab === 'screening' && (
          <div
            className={`pt-14 transition-all w-full overflow-x-auto no-scrollbar ${
              prefersReducedMotion ? 'duration-0' : 'duration-600 ease-[var(--ease)]'
            } ${
              inApp ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <WorkflowStepper
              currentStep={workflowStep}
              completedSteps={completedSteps}
              onSelectStep={(step) => {
                setWorkflowStep(step);
                scrollToAppTop(true);
              }}
            />
          </div>
        )}

        {/* Page Content: Slides up 12px and fades in over 600ms */}
        <main
          className={`flex-1 ${
            viewDensity === 'comfortable' ? 'max-w-[1440px] px-4 sm:px-8 md:px-10' : 'max-w-7xl px-3.5 sm:px-6 md:px-8'
          } pb-16 mx-auto w-full ${
            activeTab === 'screening' ? 'pt-4 sm:pt-6' : 'pt-18 sm:pt-20'
          } transition-all ${
            prefersReducedMotion ? 'duration-0' : 'duration-600 ease-[var(--ease)]'
          } ${
            inApp ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <DashboardView
              onStartNewScreening={handleStartNewScreening}
              onViewScreeningDetails={handleInspectScreeningRecord}
              onNavigateToHistory={() => {
                setActiveTab('history');
                scrollToAppTop(true);
              }}
              viewDensity={viewDensity}
            />
          )}

          {/* TAB 2: SCREENING (The 6-step workflow) */}
          {activeTab === 'screening' && (
            <>
              {/* Step 1: Capture */}
              {workflowStep === 'capture' && (
                <NewScreeningView
                  onProceedToQualityGate={handleProceedToQualityGate}
                  onCancel={() => {
                    setActiveTab('dashboard');
                    scrollToAppTop(true);
                  }}
                />
              )}

              {/* Step 2: Quality Check Gate */}
              {workflowStep === 'quality' && (
                <QualityGateView
                  imageSrc={activeImageSrc}
                  patientName={activePatient.name}
                  eye={activePatient.eye}
                  onEvaluate={() => apiService.evaluateQuality(activeImageSrc)}
                  onProceedToAnalysis={handleProceedToAnalysis}
                  onRetake={() => setWorkflowStep('capture')}
                />
              )}

              {/* Steps 3 & 4: Analyze & Explain */}
              {(workflowStep === 'analyze' || workflowStep === 'explain') && activeAnalysis && (
                <AiAnalysisView
                  analysis={activeAnalysis}
                  imageSrc={activeImageSrc}
                  onProceedToTriage={handleProceedToTriage}
                  onBackToQuality={() => setWorkflowStep('quality')}
                />
              )}

              {/* Step 5: Triage */}
              {workflowStep === 'triage' && activeAnalysis && (
                <TriageView
                  analysis={activeAnalysis}
                  imageSrc={activeImageSrc}
                  onOpenReport={() => setShowReportModal(true)}
                  onBackToAnalysis={() => setWorkflowStep('analyze')}
                  onRestartScreening={handleStartNewScreening}
                />
              )}

              {/* Step 6: Report Modal */}
              {showReportModal && activeAnalysis && (
                <PrintableReportModal
                  analysis={activeAnalysis}
                  imageSrc={activeImageSrc}
                  onClose={() => setShowReportModal(false)}
                />
              )}
            </>
          )}

          {/* TAB 3: HISTORY */}
          {activeTab === 'history' && (
            <HistoryView
              onSelectScreening={handleInspectScreeningRecord}
              onStartNewScreening={handleStartNewScreening}
            />
          )}

          {/* TAB 4: SIMULATION */}
          {activeTab === 'simulation' && <DistrictSimulationView />}

          {/* TAB 5: SYSTEM */}
          {activeTab === 'system' && (
            <SystemArchitectureView
              onReplayIntro={handleReplayIntro}
              onNavigate={(tab, step) => {
                setActiveTab(tab);
                if (step) {
                  setWorkflowStep(step);
                  setCompletedSteps((prev) => Array.from(new Set([...prev, 'capture', 'quality', 'analyze', 'explain'])));
                }
                scrollToAppTop(true);
              }}
              viewDensity={viewDensity}
              onSelectDensity={handleSelectDensity}
            />
          )}
        </main>
      </div>
    </div>
  );
}
