import React, { useState, useMemo } from 'react';
import { Sliders, Activity } from 'lucide-react';
import { apiService, SimulationParams } from '../services/api';

export const DistrictSimulationView: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    dailyScreenings: 25,
    phcReferralCapacity: 40,
    patientAdherencePercent: 70,
    aiSpecificityThreshold: 92,
  });

  const simResult = useMemo(() => {
    return apiService.calculateSimulation(params);
  }, [params]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-6xl mx-auto w-full">
      {/* Title */}
      <div className="border-b border-[var(--rule)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-label text-[var(--teal)]">MATLAB / SIMULINK MODEL CONCEPT</span>
          <h1
            className="font-heading font-bold text-[var(--fg)] mt-1 tracking-[-0.02em] leading-[1.1]"
            style={{ fontSize: 'clamp(1.75rem, 3.8vw, 2.5rem)' }}
          >
            District Screening Throughput Simulation
          </h1>
          <p className="text-sm sm:text-base text-[var(--fg-soft)] mt-1.5 max-w-2xl leading-[1.6]">
            Simulate population-scale screening throughput, hospital queue reduction, and economic impact across a rural district health block.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[var(--amber)] px-3 py-1.5 rounded border border-[var(--amber)]/30 bg-[var(--amber)]/10 self-start sm:self-auto shrink-0">
          <Activity className="w-3.5 h-3.5" />
          <span>DYNAMIC SIMULATION ENGINE</span>
        </div>
      </div>

      {/* Main Grid: Parameters on Left (5 cols) & Live Results on Right (7 cols) - Stacks on mobile/tablet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Interactive Simulation Control Sliders (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          <div className="p-4 sm:p-6 rounded border border-[var(--rule)] bg-[var(--bg-2)] space-y-5 sm:space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[var(--amber)]" />
                <h2 className="text-sm font-heading font-semibold text-[var(--fg)]">
                  SIMULATION PARAMETERS
                </h2>
              </div>
              <span className="text-label text-[var(--fg-faint)]">RURAL PHC BLOCK</span>
            </div>

            {/* Parameter 1: Daily Screenings */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--fg)] font-medium">Daily Screenings per Sub-centre</span>
                <span className="font-mono text-[var(--amber)] font-bold">{params.dailyScreenings} pts/day</span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={params.dailyScreenings}
                onChange={(e) => setParams({ ...params, dailyScreenings: parseInt(e.target.value) })}
                className="w-full accent-[var(--amber)] cursor-pointer h-6"
              />
              <div className="flex justify-between text-[10px] text-[var(--fg-faint)] font-mono">
                <span>5 / day (Small camp)</span>
                <span>60 / day (High volume)</span>
              </div>
            </div>

            {/* Parameter 2: Specialist Review Capacity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--fg)] font-medium">District Specialist Review Capacity</span>
                <span className="font-mono text-[var(--teal)] font-bold">{params.phcReferralCapacity} cases/day</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={params.phcReferralCapacity}
                onChange={(e) => setParams({ ...params, phcReferralCapacity: parseInt(e.target.value) })}
                className="w-full accent-[var(--teal)] cursor-pointer h-6"
              />
              <div className="flex justify-between text-[10px] text-[var(--fg-faint)] font-mono">
                <span>10 / day (Single Doctor)</span>
                <span>100 / day (Medical College)</span>
              </div>
            </div>

            {/* Parameter 3: Patient Adherence */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--fg)] font-medium">Patient Adherence to Referral</span>
                <span className="font-mono text-[var(--fg)] font-bold">{params.patientAdherencePercent}%</span>
              </div>
              <input
                type="range"
                min={30}
                max={95}
                step={5}
                value={params.patientAdherencePercent}
                onChange={(e) => setParams({ ...params, patientAdherencePercent: parseInt(e.target.value) })}
                className="w-full accent-[var(--fg)] cursor-pointer h-6"
              />
              <div className="flex justify-between text-[10px] text-[var(--fg-faint)] font-mono">
                <span>30% (Standard self-pay)</span>
                <span>95% (ASHA escorted)</span>
              </div>
            </div>

            {/* Parameter 4: Specificity Threshold */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--fg)] font-medium">AI Triage Specificity Threshold</span>
                <span className="font-mono text-[var(--amber)] font-bold">{params.aiSpecificityThreshold}%</span>
              </div>
              <input
                type="range"
                min={75}
                max={98}
                step={1}
                value={params.aiSpecificityThreshold}
                onChange={(e) => setParams({ ...params, aiSpecificityThreshold: parseInt(e.target.value) })}
                className="w-full accent-[var(--amber)] cursor-pointer h-6"
              />
              <div className="flex justify-between text-[10px] text-[var(--fg-faint)] font-mono">
                <span>75% (Higher false referrals)</span>
                <span>98% (High specificity)</span>
              </div>
            </div>

            {/* Reset button with >= 44px tap target */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setParams({ dailyScreenings: 25, phcReferralCapacity: 40, patientAdherencePercent: 70, aiSpecificityThreshold: 92 })}
                className="text-xs text-[var(--fg-soft)] hover:text-[var(--fg)] underline cursor-pointer min-h-[44px] flex items-center"
              >
                Reset to default baseline parameters
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Model Output Cards & Flow Visualizer (7 cols) */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          {/* Key Simulation KPI Cards */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 rounded border border-[var(--rule)] bg-[var(--bg-2)] flex flex-col justify-between">
              <span className="text-label text-[var(--fg-faint)] block">ANNUAL SCREENED</span>
              <div
                className="font-heading font-semibold text-[var(--fg)] mt-2"
                style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)' }}
              >
                {simResult.annualScreenings.toLocaleString()}
              </div>
              <span className="text-[11px] text-[var(--fg-soft)] mt-1 block">at point-of-care PHC</span>
            </div>

            <div className="p-4 rounded border border-[var(--amber)]/40 bg-[var(--bg-2)] flex flex-col justify-between">
              <span className="text-label text-[var(--amber)] block">AVOIDED TRAVEL TRIPS</span>
              <div
                className="font-heading font-semibold text-[var(--amber)] mt-2"
                style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)' }}
              >
                {simResult.avoidedUnnecessaryTravelVisits.toLocaleString()}
              </div>
              <span className="text-[11px] text-[var(--fg-soft)] mt-1 block">triaged clear locally</span>
            </div>

            <div className="p-4 rounded border border-[var(--teal)]/40 bg-[var(--bg-2)] xs:col-span-2 sm:col-span-1 flex flex-col justify-between">
              <span className="text-label text-[var(--teal)] block">ESTIMATED RURAL SAVINGS</span>
              <div
                className="font-heading font-semibold text-[var(--teal)] mt-2 flex items-center"
                style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)' }}
              >
                <span>₹</span>
                <span>{(simResult.estimatedRuralFamilySavingsINR / 100000).toFixed(1)}L</span>
              </div>
              <span className="text-[11px] text-[var(--fg-soft)] mt-1 block">bus fare + lost wages</span>
            </div>
          </div>

          {/* Interactive Simulink-style Flow Pipeline: Scales with container */}
          <div className="p-4 sm:p-6 rounded border border-[var(--rule)] bg-[var(--bg-2)] space-y-4 sm:space-y-5">
            <h3 className="text-sm font-heading font-semibold text-[var(--fg)]">
              TELE-OPHTHALMOLOGY FLOW PIPELINE
            </h3>

            <div className="space-y-2.5 sm:space-y-3 font-mono text-xs">
              {/* Stage 1 */}
              <div className="p-3 sm:p-3.5 rounded border border-[var(--rule)] bg-[var(--bg)] flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                <div>
                  <div className="text-[10px] text-[var(--fg-faint)] uppercase">STAGE 1: VILLAGE SUB-CENTRE CAPTURE</div>
                  <div className="text-[var(--fg)] font-medium mt-0.5">{params.dailyScreenings} patients / day · Mobile Fundus Scanner</div>
                </div>
                <span className="text-[var(--teal)] font-semibold shrink-0 text-right">100% Volume</span>
              </div>

              {/* Flow Arrow */}
              <div className="flex justify-center text-[var(--rule)] py-0.5 font-bold">↓</div>

              {/* Stage 2 */}
              <div className="p-3 sm:p-3.5 rounded border border-[var(--teal)]/40 bg-[var(--teal)]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                <div>
                  <div className="text-[10px] text-[var(--teal)] uppercase">STAGE 2: ON-DEVICE AI TRIAGE GATE</div>
                  <div className="text-[var(--fg)] font-medium mt-0.5 leading-relaxed">
                    {Math.round(simResult.annualScreenings * 0.75 / 260)} Cleared (Annual Follow-up) · {Math.round(simResult.referredPatients / 260)} Flagged for Referral
                  </div>
                </div>
                <span className="text-[var(--amber)] font-semibold shrink-0 text-right">Local Filter</span>
              </div>

              {/* Flow Arrow */}
              <div className="flex justify-center text-[var(--rule)] py-0.5 font-bold">↓</div>

              {/* Stage 3 */}
              <div className="p-3 sm:p-3.5 rounded border border-[var(--amber)]/40 bg-[var(--amber)]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                <div>
                  <div className="text-[10px] text-[var(--amber)] uppercase">STAGE 3: DISTRICT EYE HOSPITAL CARE</div>
                  <div className="text-[var(--fg)] font-medium mt-0.5 leading-relaxed">
                    {Math.round(simResult.adherentPatients / 260)} Patients / day receiving targeted laser / anti-VEGF treatment
                  </div>
                </div>
                <span className="text-[var(--teal)] font-semibold shrink-0 text-right">Targeted Care</span>
              </div>
            </div>

            {/* Impact Metric Bar */}
            <div className="pt-3 border-t border-[var(--rule)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[var(--fg-faint)] block text-[10px] uppercase">PROJECTED SEVERE BLINDNESS AVERTED</span>
                <span className="text-base sm:text-lg font-heading font-semibold text-[var(--teal)]">
                  ~{simResult.blindnessAversionProjection} Individuals / Year
                </span>
              </div>

              <div>
                <span className="text-[var(--fg-faint)] block text-[10px] uppercase">SPECIALIST HOURS PRESERVED</span>
                <span className="text-base sm:text-lg font-heading font-semibold text-[var(--fg)]">
                  {simResult.specialistReviewHoursSaved} Clinical Hours / Year
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded border border-[var(--rule)] bg-[var(--bg)] text-[11px] text-[var(--fg-faint)] leading-relaxed">
            * Mathematical simulation model parameters based on standard epidemiological prevalence of diabetic retinopathy in rural Indian cohorts (ICMR-INDIAB reference data).
          </div>
        </div>
      </div>
    </div>
  );
};
