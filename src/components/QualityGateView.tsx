import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ShieldAlert, RotateCcw, ArrowRight } from 'lucide-react';
import { QualityCheckResult } from '../services/api';

interface QualityGateViewProps {
  imageSrc: string;
  patientName: string;
  eye: 'OD' | 'OS';
  onEvaluate: () => Promise<QualityCheckResult>;
  onProceedToAnalysis: (quality: QualityCheckResult) => void;
  onRetake: () => void;
}

export const QualityGateView: React.FC<QualityGateViewProps> = ({
  imageSrc,
  patientName,
  eye,
  onEvaluate,
  onProceedToAnalysis,
  onRetake,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [quality, setQuality] = useState<QualityCheckResult | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    onEvaluate().then((res) => {
      if (isMounted) {
        setQuality(res);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [imageSrc, onEvaluate]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn w-full">
      {/* Title */}
      <div className="border-b border-[var(--rule)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-label text-[var(--amber)]">STEP 2 OF 6</span>
          <h1
            className="font-heading font-bold text-[var(--fg)] mt-1 tracking-[-0.02em] leading-[1.1]"
            style={{ fontSize: 'clamp(1.75rem, 3.8vw, 2.5rem)' }}
          >
            Automated Image Quality Gate
          </h1>
          <p className="text-sm sm:text-base text-[var(--fg-soft)] mt-1.5 leading-[1.6]">
            Strict pre-screening validation of optical sharpness, illumination, and field definition before inference.
          </p>
        </div>

        <div className="text-xs font-mono text-[var(--fg-soft)] self-start sm:self-auto px-2.5 py-1 rounded border border-[var(--rule)] bg-[var(--bg-2)]">
          Patient: <strong className="text-[var(--fg)]">{patientName}</strong> · Eye: <strong className="text-[var(--amber)]">{eye}</strong>
        </div>
      </div>

      {loading ? (
        <div className="p-10 sm:p-16 rounded border border-[var(--rule)] bg-[var(--bg-2)] flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-10 h-10 border-2 border-[var(--rule)] border-t-[var(--amber)] rounded-full animate-spin" />
          <h3 className="text-sm font-heading font-medium text-[var(--fg)]">
            EVALUATING 6 OPTICAL QUALITY PARAMETERS...
          </h3>
          <p className="text-xs text-[var(--fg-soft)] max-w-sm">
            Validating arteriolar edge gradient, pupil illumination profile, and foveal centering against clinical gradability criteria.
          </p>
        </div>
      ) : quality ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Fundus Image with Inspection Overlay (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-3.5 sm:p-4 rounded border border-[var(--rule)] bg-[var(--bg-2)] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-label text-[var(--fg-faint)]">ACQUIRED IMAGE</span>
                <span className="font-mono text-[10px] text-[var(--fg-soft)]">45° MACULA-CENTERED</span>
              </div>

              <div className="aspect-square w-full max-w-full rounded border border-[var(--rule)] bg-[var(--bg)] overflow-hidden relative">
                <img
                  src={imageSrc}
                  alt="Quality verification fundus"
                  className="w-full h-full object-cover"
                />

                {/* Status Badge overlay */}
                <div className="absolute bottom-3 inset-x-3">
                  {quality.isAcceptable ? (
                    <div className="px-3 py-2 rounded bg-[var(--bg)]/90 backdrop-blur-sm border border-[var(--teal)]/60 text-[var(--teal)] flex items-center justify-between text-xs font-medium">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>IMAGE ACCEPTABLE</span>
                      </div>
                      <span className="font-mono">{quality.overallScore}%</span>
                    </div>
                  ) : (
                    <div className="px-3 py-2 rounded bg-[var(--bg)]/90 backdrop-blur-sm border border-red-500/60 text-red-400 flex items-center justify-between text-xs font-medium">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        <span>IMAGE NOT SUITABLE</span>
                      </div>
                      <span className="font-mono">{quality.overallScore}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 6 Criteria Checks & Gate Decision (7 cols) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            {/* Gate Decision Banner */}
            <div
              className={`p-4 sm:p-5 rounded border ${
                quality.isAcceptable
                  ? 'border-[var(--teal)]/50 bg-[var(--teal)]/5'
                  : 'border-red-500/50 bg-red-500/5'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {quality.isAcceptable ? (
                    <ShieldCheck className="w-5 h-5 text-[var(--teal)]" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div>
                  <h3
                    className={`text-sm sm:text-base font-heading font-semibold ${
                      quality.isAcceptable ? 'text-[var(--teal)]' : 'text-red-400'
                    }`}
                  >
                    {quality.isAcceptable
                      ? 'QUALITY GATE PASSED: GRADABLE FOR CLINICAL TRIAGE'
                      : 'QUALITY GATE HALTED: RETAKE MANDATED (NO INFERENCE ISSUED)'}
                  </h3>
                  <p className="text-xs text-[var(--fg-soft)] mt-1 leading-relaxed">
                    {quality.isAcceptable
                      ? 'The image complies with all required optical sharpness, contrast, and field illumination requirements. Proceed to AI analysis.'
                      : 'Hard safety rule: Ungradable or motion-blurred fundus images cannot be screened. To protect clinical safety, no risk classification is produced until a clean retake is acquired.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed 6 Check Matrix */}
            <div className="p-4 sm:p-5 rounded border border-[var(--rule)] bg-[var(--bg-2)] space-y-3">
              <span className="text-label text-[var(--fg-faint)]">OPTICAL GRADABILITY PARAMETERS</span>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5">
                {Object.values(quality.checks).map((check, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded bg-[var(--bg)] border border-[var(--rule)] flex items-start justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-medium text-[var(--fg)]">{check.name}</div>
                      <div className="text-[10px] text-[var(--fg-faint)] mt-0.5">{check.details}</div>
                    </div>
                    <div>
                      {check.passed ? (
                        <span className="inline-flex items-center gap-1 text-[var(--teal)] font-mono text-[10px] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          PASS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 font-mono text-[10px] font-semibold">
                          <XCircle className="w-3.5 h-3.5" />
                          FAIL
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons with >= 44px tap targets */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onRetake}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-[var(--rule)] text-xs text-[var(--fg)] hover:border-[var(--amber)] hover:text-[var(--amber)] transition-colors cursor-pointer min-h-[44px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake / Choose Another Image</span>
              </button>

              {quality.isAcceptable ? (
                <button
                  type="button"
                  onClick={() => onProceedToAnalysis(quality)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--teal)] text-white font-medium text-xs sm:text-sm hover:opacity-95 active:scale-[0.98] transition-all shadow-sm cursor-pointer min-h-[44px]"
                >
                  <span>Proceed to AI Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="text-xs text-red-400 font-mono flex items-center justify-center gap-1.5 p-2 rounded border border-red-500/20 bg-red-500/5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Clinical gate locked: Retake required</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
