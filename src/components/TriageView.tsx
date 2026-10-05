import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, ShieldAlert, AlertTriangle, FileText, ArrowLeft, HeartHandshake, MapPin, Calendar, Download, Check } from 'lucide-react';
import { ScreeningAnalysisResult } from '../services/api';
import { downloadHtmlReport } from '../utils/reportDownloader';
import { MultilingualCounselingScript } from './MultilingualCounselingScript';

interface TriageViewProps {
  analysis: ScreeningAnalysisResult;
  imageSrc?: string;
  onOpenReport: () => void;
  onBackToAnalysis: () => void;
  onRestartScreening: () => void;
}

export const TriageView: React.FC<TriageViewProps> = ({
  analysis,
  imageSrc,
  onOpenReport,
  onBackToAnalysis,
  onRestartScreening,
}) => {
  const { triage, riskLabel } = analysis;
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const isClear = triage.category === 'CLEAR';
  const isRefer = triage.category === 'REFER';
  const isEscalate = triage.category === 'ESCALATE';

  const handleQuickDownload = () => {
    downloadHtmlReport(analysis, imageSrc);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn w-full">
      {/* Title */}
      <div className="border-b border-[var(--rule)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-label text-[var(--teal)]">STEP 5 OF 6</span>
          <h1
            className="font-heading font-bold text-[var(--fg)] mt-1 tracking-[-0.02em] leading-[1.2]"
            style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.25rem)' }}
          >
            Clinical Triage & Action Protocol
          </h1>
          <p className="text-sm text-[var(--fg-soft)] mt-1">
            Standardized primary-care management pathway based on ICMR & WHO diabetic retinopathy guidelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleQuickDownload}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[var(--rule)] hover:border-[var(--teal)] bg-[var(--bg-2)] text-xs text-[var(--fg)] hover:text-[var(--teal)] transition-colors cursor-pointer min-h-[36px]"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-[var(--teal)]" />
                <span className="text-[var(--teal)] font-medium">Slip Downloaded</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-[var(--teal)]" />
                <span>Download Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Primary Triage Category Banner */}
      <div
        className={`p-6 sm:p-8 rounded border-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
          isClear
            ? 'border-[var(--teal)] bg-[var(--teal)]/10 text-[var(--fg)]'
            : isRefer
            ? 'border-[var(--amber)] bg-[var(--amber)]/10 text-[var(--fg)]'
            : 'border-red-500 bg-red-500/10 text-[var(--fg)]'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="mt-1 shrink-0">
            {isClear && <CheckCircle2 className="w-8 h-8 text-[var(--teal)]" />}
            {isRefer && <AlertCircle className="w-8 h-8 text-[var(--amber)]" />}
            {isEscalate && <ShieldAlert className="w-8 h-8 text-red-500 dark:text-red-400" />}
          </div>

          <div className="space-y-1">
            <span className="text-label tracking-widest text-[var(--fg-soft)]">
              TRIAGE INDICATION
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--fg)]">
              {triage.category === 'CLEAR'
                ? 'Routine Annual Follow-up'
                : triage.category === 'REFER'
                ? 'Secondary Care Referral Indicated'
                : 'Urgent Ophthalmology Escalation'}
            </h2>
            <p className="text-sm sm:text-base text-[var(--fg-soft)] leading-relaxed pt-1">
              Assessment: <strong className="text-[var(--fg)]">{riskLabel}</strong>. {triage.actionProtocol}
            </p>
          </div>
        </div>

        <div className="text-left md:text-right shrink-0 border-t md:border-t-0 md:border-l border-[var(--rule)] pt-4 md:pt-0 md:pl-6 space-y-1">
          <span className="text-[10px] font-mono uppercase text-[var(--fg-faint)] block">
            RECOMMENDED TIMELINE
          </span>
          <div className="font-heading font-bold text-lg text-[var(--fg)]">
            {triage.timeframe}
          </div>
          <span className="text-xs text-[var(--fg-soft)] block font-mono">
            {triage.referralFacility}
          </span>
        </div>
      </div>

      {/* Grid: 3 Structured Care Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Facility Routing */}
        <div className="p-4 sm:p-5 rounded border border-[var(--rule)] bg-[var(--bg-2)] space-y-3">
          <div className="flex items-center gap-2 text-[var(--teal)]">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="text-label text-[var(--teal)]">REFERRAL DESTINATION</span>
          </div>
          <div className="font-heading font-semibold text-sm text-[var(--fg)]">
            {triage.referralFacility}
          </div>
          <p className="text-xs text-[var(--fg-soft)] leading-relaxed">
            Linked referral hospital equipped with slit-lamp bio-microscopy and indirect ophthalmoscopy facilities.
          </p>
        </div>

        {/* Card 2: ASHA Action Checklist */}
        <div className="p-4 sm:p-5 rounded border border-[var(--rule)] bg-[var(--bg-2)] space-y-3">
          <div className="flex items-center gap-2 text-[var(--amber)]">
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="text-label text-[var(--amber)]">PATIENT COUNSELING</span>
          </div>
          <div className="font-heading font-semibold text-sm text-[var(--fg)]">
            ASHA Follow-Up Schedule
          </div>
          <p className="text-xs text-[var(--fg-soft)] leading-relaxed">
            Record appointment in cluster register. Provide referral slip with token #{analysis.screeningId} to patient.
          </p>
        </div>

        {/* Card 3: Systemic Diabetes Control */}
        <div className="p-4 sm:p-5 rounded border border-[var(--rule)] bg-[var(--bg-2)] space-y-3">
          <div className="flex items-center gap-2 text-[var(--fg-soft)]">
            <HeartHandshake className="w-4 h-4 shrink-0" />
            <span className="text-label text-[var(--fg-soft)]">GLYCEMIC TARGETS</span>
          </div>
          <div className="font-heading font-semibold text-sm text-[var(--fg)]">
            HbA1c & BP Management
          </div>
          <p className="text-xs text-[var(--fg-soft)] leading-relaxed">
            Reinforce adherence to oral hypoglycemic / insulin therapy. Target BP &lt; 130/80 mmHg to reduce retinopathy progression.
          </p>
        </div>
      </div>

      {/* Structured Patient Education Message with Multilingual Audio & Script */}
      <MultilingualCounselingScript
        category={triage.category}
        patientName={analysis.patient.name}
        token={analysis.screeningId}
      />

      {/* Mandatory Safety Notice */}
      <div className="p-3.5 rounded border border-[var(--rule)] bg-[var(--bg-2)] flex items-start gap-2.5 text-xs text-[var(--fg-soft)]">
        <AlertTriangle className="w-4 h-4 text-[var(--amber)] shrink-0 mt-0.5 sm:mt-0" />
        <p className="leading-relaxed">
          <strong className="text-[var(--fg)]">Mandatory Screening Clarification:</strong> Always inform the patient that this test is an AI-assisted screening assessment, not a confirmed medical diagnosis. Only an eye doctor (ophthalmologist) can diagnose and treat eye diseases.
        </p>
      </div>

      {/* Action Row with >= 44px tap targets */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[var(--rule)]">
        <button
          type="button"
          onClick={onBackToAnalysis}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-[var(--rule)] text-xs text-[var(--fg-soft)] hover:text-[var(--fg)] hover:border-[var(--fg-soft)] transition-colors cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Analysis</span>
        </button>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={onRestartScreening}
            className="px-4 py-3 rounded-full border border-[var(--rule)] text-xs text-[var(--fg)] hover:border-[var(--fg-soft)] transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
          >
            New Screening
          </button>

          <button
            type="button"
            onClick={handleQuickDownload}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-[var(--rule)] hover:border-[var(--teal)] bg-[var(--bg-2)] text-xs sm:text-sm font-medium text-[var(--fg)] hover:text-[var(--teal)] transition-colors cursor-pointer min-h-[44px]"
          >
            <Download className="w-4 h-4 text-[var(--teal)]" />
            <span>Download Slip (.HTML)</span>
          </button>

          <button
            type="button"
            onClick={onOpenReport}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--teal)] text-white font-medium text-xs sm:text-sm hover:opacity-95 active:scale-[0.98] transition-all shadow-sm cursor-pointer min-h-[44px]"
          >
            <FileText className="w-4 h-4" />
            <span>Printable Screening Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
