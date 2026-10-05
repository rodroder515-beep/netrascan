import React from 'react';
import { Camera, ShieldCheck, Cpu, Eye, AlertTriangle, FileText } from 'lucide-react';

export type ScreeningWorkflowStep = 'capture' | 'quality' | 'analyze' | 'explain' | 'triage' | 'report';

interface WorkflowStepperProps {
  currentStep: ScreeningWorkflowStep;
  completedSteps: ScreeningWorkflowStep[];
  onSelectStep?: (step: ScreeningWorkflowStep) => void;
  className?: string;
}

export const WORKFLOW_STEPS: { id: ScreeningWorkflowStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'capture', label: 'CAPTURE', icon: Camera },
  { id: 'quality', label: 'QUALITY CHECK', icon: ShieldCheck },
  { id: 'analyze', label: 'ANALYZE', icon: Cpu },
  { id: 'explain', label: 'EXPLAIN', icon: Eye },
  { id: 'triage', label: 'TRIAGE', icon: AlertTriangle },
  { id: 'report', label: 'REPORT', icon: FileText },
];

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStep,
  completedSteps,
  onSelectStep,
  className = '',
}) => {
  const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className={`w-full bg-[var(--bg-2)] border-b border-[var(--rule)] py-3 px-4 sm:px-8 select-none ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-2 sm:gap-4">
        {WORKFLOW_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = step.id === currentStep;
          const isCompleted = completedSteps.includes(step.id);
          const isClickable = onSelectStep && (isCompleted || isCurrent);

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onSelectStep(step.id)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded transition-all shrink-0 text-left ${
                  isCurrent
                    ? 'bg-[var(--fg)] text-[var(--bg)] font-semibold shadow-sm'
                    : isCompleted
                    ? 'text-[var(--fg)] hover:bg-[var(--bg)]/80 cursor-pointer'
                    : 'text-[var(--fg-faint)] opacity-60 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
                    isCurrent
                      ? 'bg-[var(--bg)] text-[var(--fg)] font-bold'
                      : isCompleted
                      ? 'bg-[var(--teal)]/30 text-[var(--teal)] border border-[var(--teal)]/50'
                      : 'border border-[var(--rule)] text-[var(--fg-faint)]'
                  }`}
                >
                  {isCompleted && !isCurrent ? '✓' : idx + 1}
                </div>
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-[var(--bg)]' : ''}`} />
                <span className="text-[11px] font-heading tracking-wider uppercase whitespace-nowrap">
                  {step.label}
                </span>
              </button>

              {idx < WORKFLOW_STEPS.length - 1 && (
                <div className="hidden md:flex items-center text-[var(--rule)] shrink-0 px-1 font-mono text-xs">
                  →
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
