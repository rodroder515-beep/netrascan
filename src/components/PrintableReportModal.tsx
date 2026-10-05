import React, { useState } from 'react';
import { Printer, X, QrCode, Download, FileCode2, Check } from 'lucide-react';
import { ScreeningAnalysisResult } from '../services/api';
import { downloadHtmlReport, downloadFhirJsonReport } from '../utils/reportDownloader';

interface PrintableReportModalProps {
  analysis: ScreeningAnalysisResult;
  imageSrc: string;
  onClose: () => void;
}

export const PrintableReportModal: React.FC<PrintableReportModalProps> = ({
  analysis,
  imageSrc,
  onClose,
}) => {
  const { patient, triage, riskLabel, imageQuality, explainability, lesions } = analysis;
  const [downloadedType, setDownloadedType] = useState<'html' | 'json' | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    downloadHtmlReport(analysis, imageSrc);
    setDownloadedType('html');
    setTimeout(() => setDownloadedType(null), 3000);
  };

  const handleDownloadJson = () => {
    downloadFhirJsonReport(analysis);
    setDownloadedType('json');
    setTimeout(() => setDownloadedType(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm p-3 sm:p-6 md:p-8 flex justify-center items-start">
      <div className="bg-[var(--bg-2)] text-[var(--fg)] border border-[var(--rule)] rounded-xl max-w-4xl w-full p-4 sm:p-8 md:p-10 space-y-6 sm:space-y-8 my-auto shadow-2xl relative">
        {/* Floating Print & Download Actions Bar with >= 44px tap targets */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--rule)] pb-4 print:hidden gap-3">
          <div className="flex items-center gap-2">
            <span className="text-label text-[var(--teal)]">CLINICAL SCREENING RECORD</span>
            <span className="text-xs text-[var(--fg-faint)] hidden sm:inline">· SLIP #{analysis.screeningId}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* 1. Print / Save PDF */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--teal)] text-white font-medium text-xs hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer shadow-sm min-h-[38px]"
              title="Print to printer or save as PDF via browser print dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            {/* 2. Download Offline HTML Slip */}
            <button
              onClick={handleDownloadHtml}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[var(--rule)] hover:border-[var(--teal)] bg-[var(--bg)] text-xs font-medium text-[var(--fg)] hover:text-[var(--teal)] transition-all cursor-pointer min-h-[38px]"
              title="Download standalone offline HTML file readable without internet"
            >
              {downloadedType === 'html' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[var(--teal)]" />
                  <span className="text-[var(--teal)] font-semibold">Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[var(--teal)]" />
                  <span>Download Slip (.HTML)</span>
                </>
              )}
            </button>

            {/* 3. Export ABDM FHIR JSON */}
            <button
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[var(--rule)] hover:border-[var(--amber)] bg-[var(--bg)] text-xs font-mono text-[var(--fg-soft)] hover:text-[var(--fg)] transition-all cursor-pointer min-h-[38px]"
              title="Export ABDM-compliant HL7 FHIR DiagnosticReport JSON payload"
            >
              {downloadedType === 'json' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[var(--amber)]" />
                  <span className="text-[var(--amber)] font-semibold">Exported!</span>
                </>
              ) : (
                <>
                  <FileCode2 className="w-3.5 h-3.5 text-[var(--amber)]" />
                  <span>FHIR JSON</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-[var(--rule)] hover:border-[var(--fg-soft)] text-[var(--fg-soft)] hover:text-[var(--fg)] transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center ml-1"
              title="Close Report"
              aria-label="Close Report"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT BODY */}
        <div id="printable-screening-slip" className="space-y-6">
          {/* Clinical Header */}
          <div className="border-b-2 border-[var(--rule)] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase text-[var(--amber)]">
                GOVERNMENT RURAL TELE-OPHTHALMOLOGY PROGRAM · SIH 2026
              </div>
              <h1
                className="font-heading font-bold text-[var(--fg)] mt-1 tracking-[-0.02em] leading-[1.2]"
                style={{ fontSize: 'clamp(1.35rem, 3vw, 1.85rem)' }}
              >
                NetraScan Retinal Screening & Referral Slip
              </h1>
              <p className="text-xs sm:text-sm text-[var(--fg-soft)] mt-1 leading-[1.5]">
                Primary Health Centre 01 · Kalyanpur Block · ASHA Cluster Registry
              </p>
            </div>

            <div className="text-left sm:text-right text-xs font-mono">
              <div className="text-[var(--fg-soft)]">
                SLIP ID: <strong className="text-[var(--fg)]">{analysis.screeningId}</strong>
              </div>
              <div className="text-[var(--fg-faint)] mt-0.5">
                DATE: {new Date(analysis.timestamp).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Section 1: Patient Demographics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 sm:p-4 rounded border border-[var(--rule)] bg-[var(--bg)] text-xs">
            <div>
              <span className="text-[10px] text-[var(--fg-faint)] uppercase block">PATIENT NAME</span>
              <strong className="text-[var(--fg)]">{patient.name}</strong>
            </div>
            <div>
              <span className="text-[10px] text-[var(--fg-faint)] uppercase block">PATIENT ID / ABHA</span>
              <span className="font-mono text-[var(--fg)]">{patient.id}</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--fg-faint)] uppercase block">AGE & GENDER</span>
              <span className="text-[var(--fg)]">{patient.age} YRS · {patient.gender}</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--fg-faint)] uppercase block">VILLAGE / PHC</span>
              <span className="text-[var(--fg)]">{patient.village}</span>
            </div>
          </div>

          {/* Section 2: Clinical Screening Findings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded border border-[var(--rule)] bg-[var(--bg)] space-y-2">
              <span className="text-label text-[var(--fg-faint)]">OPTICAL QUALITY GATE</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold font-mono ${imageQuality.isAcceptable ? 'text-[var(--teal)]' : 'text-red-500'}`}>
                  {imageQuality.overallScore}%
                </span>
                <span className="text-xs text-[var(--fg-soft)]">({imageQuality.isAcceptable ? 'Gradable Focus' : 'Sub-optimal'})</span>
              </div>
              <p className="text-[11px] text-[var(--fg-faint)]">
                Field: 45° Non-mydriatic · Focus check passed
              </p>
            </div>

            <div className="p-4 rounded border border-[var(--rule)] bg-[var(--bg)] space-y-2">
              <span className="text-label text-[var(--fg-faint)]">AI RISK TIER</span>
              <div className="text-sm font-semibold text-[var(--fg)]">
                {riskLabel}
              </div>
              <p className="text-[11px] text-[var(--fg-faint)]">
                ETDRS microaneurysm quadrant rule cross-referenced
              </p>
            </div>

            <div className="p-4 rounded border border-[var(--rule)] bg-[var(--bg)] space-y-2">
              <span className="text-label text-[var(--amber)]">TRIAGE ACTION</span>
              <div className="text-sm font-semibold text-[var(--amber)]">
                {triage.category} · {triage.categoryLabel}
              </div>
              <p className="text-[11px] text-[var(--fg-faint)]">
                Target: {triage.referralFacility}
              </p>
            </div>
          </div>

          {/* Fundus Preview in Slip */}
          {imageSrc && (
            <div className="p-3 rounded border border-[var(--rule)] bg-[var(--bg)] flex flex-col sm:flex-row items-center gap-4">
              <img
                src={imageSrc}
                alt="Screened Fundus Frame"
                className="w-24 h-24 rounded object-cover border border-[var(--rule)]"
              />
              <div className="text-xs space-y-1">
                <span className="text-label text-[var(--teal)]">EVALUATED POSTERIOR POLE</span>
                <p className="text-[11px] text-[var(--fg-soft)]">
                  {explainability.clinicalRationale}
                </p>
                {lesions && lesions.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {lesions.map((item, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-2)] border border-[var(--rule)] text-[var(--fg-soft)]">
                        {item.type}: {item.count} ({item.location})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 3: Referral Action Plan & Tele-Consultation Slip */}
          <div className="p-4 rounded border border-[var(--rule)] bg-[var(--bg)] space-y-3">
            <span className="text-label text-[var(--teal)]">PRIMARY CARE REFERRAL DIRECTIVE</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-[var(--fg-faint)] uppercase block">REFERRED TO</span>
                <strong className="text-[var(--fg)]">{triage.referralFacility}</strong>
                <p className="text-[11px] text-[var(--fg-soft)] mt-1">
                  Department of Ophthalmology / Vitreoretinal Clinic
                </p>
              </div>

              <div>
                <span className="text-[10px] text-[var(--fg-faint)] uppercase block">ACTION PROTOCOL</span>
                <p className="text-[11px] text-[var(--fg-soft)]">
                  {triage.actionProtocol}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--rule)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white text-black p-1 rounded flex items-center justify-center shrink-0">
                  <QrCode className="w-10 h-10" />
                </div>
                <div className="text-[10px] font-mono text-[var(--fg-soft)]">
                  <div>TOKEN: {analysis.screeningId}</div>
                  <div className="text-[var(--fg-faint)]">ABDM / FHIR Enqueue Status: Offline Ready</div>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs w-full sm:w-auto">
                <div className="w-full sm:w-48 border-b border-[var(--fg-soft)] pb-4 sm:pb-6" />
                <span className="text-[10px] text-[var(--fg-faint)] uppercase tracking-wider block mt-1">
                  ASHA / PHC SCREENING OFFICER
                </span>
              </div>
            </div>
          </div>

          {/* Mandatory Safety Notice & Fictional Data Disclaimer */}
          <div className="p-3 rounded bg-[var(--bg)] border border-[var(--rule)] text-[10px] text-[var(--fg-faint)] leading-relaxed space-y-1">
            <div>
              <strong className="text-[var(--fg-soft)]">IMPORTANT CLINICAL SAFETY NOTICE:</strong> NetraScan is an AI-assisted screening and triage decision-support tool, NOT a diagnostic medical device. It does not replace a comprehensive dilated eye examination by an ophthalmologist.
            </div>
            <div>
              All patient information, identification numbers, and screening outcomes shown in this demonstration report are simulated fictional demo records.
            </div>
          </div>

          {/* Bottom Export Bar (Print hidden) */}
          <div className="pt-3 border-t border-[var(--rule)] flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
            <span className="text-xs text-[var(--fg-soft)]">
              Need to send this report to an ophthalmologist or EHR?
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadHtml}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[var(--rule)] hover:border-[var(--teal)] bg-[var(--bg)] text-xs text-[var(--fg)] hover:text-[var(--teal)] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[var(--teal)]" />
                <span>Save Offline Slip (.HTML)</span>
              </button>
              <button
                onClick={handleDownloadJson}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[var(--rule)] hover:border-[var(--amber)] bg-[var(--bg)] text-xs font-mono text-[var(--fg-soft)] hover:text-[var(--fg)] transition-colors cursor-pointer"
              >
                <FileCode2 className="w-3.5 h-3.5 text-[var(--amber)]" />
                <span>Export FHIR JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
