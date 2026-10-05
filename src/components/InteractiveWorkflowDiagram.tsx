import React, { useState } from 'react';
import { Camera, ShieldCheck, Cpu, CheckCircle2, Eye, GitFork, ArrowDown, ArrowUpRight, Smartphone, Activity } from 'lucide-react';
import { ScreeningWorkflowStep } from './WorkflowStepper';
import { NavTab } from './Navbar';

export interface WorkflowNode {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  tab: NavTab;
  step?: ScreeningWorkflowStep;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  keyOutputs: string[];
  specs: string;
}

const FLOWCHART_NODES: WorkflowNode[] = [
  {
    id: 'capture',
    stepNumber: 1,
    title: 'Capture',
    subtitle: 'ASHA worker, fundus camera',
    tab: 'screening',
    step: 'capture',
    icon: Camera,
    description: 'Frontline optical acquisition using a portable 45° smartphone fundus camera attachment. Designed for non-mydriatic operation without pupil-dilating eye drops by ASHA healthcare workers.',
    keyOutputs: ['45° Posterior Pole Fundus Image', 'Macular centering alignment', 'Offline raw image cache'],
    specs: 'FOV: 45° · Non-mydriatic · Format: Compressed WebP / 1920x1920',
  },
  {
    id: 'quality_gate',
    stepNumber: 2,
    title: 'Quality gate',
    subtitle: 'Blur, glare, recapture feedback',
    tab: 'screening',
    step: 'quality',
    icon: ShieldCheck,
    description: 'Pre-inference mathematical optical quality gate assessing 6 gradability metrics. If illumination is uneven or motion blur is excessive, inference is halted and immediate recapture guidance is provided.',
    keyOutputs: ['Arteriolar gradient sharpness score', 'Luminance uniformity verification', 'Hard safety rule: Ungradable blocks inference'],
    specs: 'Latency: 45ms on edge ARM · Filter: Sobel + Canny edge gradient',
  },
  {
    id: 'structure_segmentation',
    stepNumber: 3,
    title: 'Structure segmentation',
    subtitle: 'Vessels, disc, lesions, NV',
    tab: 'screening',
    step: 'analyze',
    icon: Cpu,
    description: 'Anatomical segmentation parsing retinal structures: U-Net vascular tree extraction, polar Hough transform optic disc/cup localization, and candidate microvascular lesion demarcations.',
    keyOutputs: ['Segmented vessel arborization map', 'Cup-to-Disc ratio (CDR 0.34)', 'Microaneurysm & dot hemorrhage coordinates'],
    specs: 'Network: U-Net Lite · Latency: 210ms · INT8 edge quantized',
  },
  {
    id: 'grading',
    stepNumber: 4,
    title: 'Grading',
    subtitle: 'Classifier plus rule engine cross-check',
    tab: 'screening',
    step: 'analyze',
    icon: CheckCircle2,
    description: 'Dual-layer clinical grading: deep neural classifier probability corroborated against deterministic ETDRS clinical rule engines to prevent generative deep-learning hallucinations.',
    keyOutputs: ['ETDRS Diabetic Retinopathy risk grade (0-4)', 'Confidence probability score', 'Deterministic clinical rule verification'],
    specs: 'Backbone: MobileNetV3-Small / EfficientNet-Lite · Rule safety check',
  },
  {
    id: 'explainability',
    stepNumber: 5,
    title: 'Explainability',
    subtitle: 'Grad-CAM, lesion evidence, report',
    tab: 'screening',
    step: 'explain',
    icon: Eye,
    description: 'Gradient-weighted Class Activation Mapping (Grad-CAM) generates diagnostic attention heatmaps. Clinicians inspect salient retinal features and review a transparent clinical rationale slip.',
    keyOutputs: ['Grad-CAM visual attention heatmap', 'Salience overlay with low-to-high spectrum', 'Clinical rationale for referral'],
    specs: 'Method: Grad-CAM · Resolution: 512x512 heatmap tensor · FHIR ready',
  },
  {
    id: 'triage_router',
    stepNumber: 6,
    title: 'Triage router',
    subtitle: 'Clear, refer, or escalate',
    tab: 'screening',
    step: 'triage',
    icon: GitFork,
    description: 'Actionable point-of-care clinical triage dividing cases into CLEAR (routine 1-year recall), REFER (specialist review within 30 days), or ESCALATE (urgent vitreoretinal care within 48 hours).',
    keyOutputs: ['Triaged urgency classification', 'Target referral facility & timeframe', 'Printable bilingual counseling referral slip'],
    specs: 'Triage categories: Clear / Refer / Escalate / Retake · ABDM compliant',
  },
];

const BRANCH_NODES = {
  edge: {
    id: 'edge_deployment',
    title: 'Edge deployment',
    subtitle: 'Offline MATLAB executable',
    tab: 'system' as NavTab,
    icon: Smartphone,
    description: 'Complete offline edge deployment operating directly on frontline smartphone hardware with zero mandatory internet during clinic hours. Local encrypted IndexedDB stores patient records until cellular reconnect.',
    specs: 'Runtime: Standalone edge executable / INT8 TFLite · Zero telemetry leaks · ABDM FHIR offline sync queue',
  },
  simulation: {
    id: 'district_simulation',
    title: 'District simulation',
    subtitle: 'Simulink capacity, coverage',
    tab: 'simulation' as NavTab,
    icon: Activity,
    description: 'Mathematical Simulink/MATLAB district health block model simulating population coverage throughput, specialist queue relief, false-referral travel cost savings, and severe blindness aversion projections.',
    specs: 'Engine: Dynamic queue simulation · ICMR-INDIAB epidemiological calibration · Cost & adherence modeling',
  },
};

interface InteractiveWorkflowDiagramProps {
  onNavigate?: (tab: NavTab, step?: ScreeningWorkflowStep) => void;
  className?: string;
}

export const InteractiveWorkflowDiagram: React.FC<InteractiveWorkflowDiagramProps> = ({
  onNavigate,
  className = '',
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('capture');

  const selectedNode: WorkflowNode =
    FLOWCHART_NODES.find((n) => n.id === selectedNodeId) ||
    (selectedNodeId === 'edge_deployment'
      ? {
          id: BRANCH_NODES.edge.id,
          stepNumber: 7,
          title: BRANCH_NODES.edge.title,
          subtitle: BRANCH_NODES.edge.subtitle,
          tab: BRANCH_NODES.edge.tab,
          step: undefined,
          icon: BRANCH_NODES.edge.icon,
          description: BRANCH_NODES.edge.description,
          keyOutputs: ['Autonomous on-device edge execution', 'Local encrypted IndexedDB storage', 'Store-and-forward sync queue'],
          specs: BRANCH_NODES.edge.specs,
        }
      : {
          id: BRANCH_NODES.simulation.id,
          stepNumber: 7,
          title: BRANCH_NODES.simulation.title,
          subtitle: BRANCH_NODES.simulation.subtitle,
          tab: BRANCH_NODES.simulation.tab,
          step: undefined,
          icon: BRANCH_NODES.simulation.icon,
          description: BRANCH_NODES.simulation.description,
          keyOutputs: ['Annual population throughput', 'Hospital queue load reduction', 'Averted blindness projection'],
          specs: BRANCH_NODES.simulation.specs,
        });

  return (
    <div className={`space-y-6 sm:space-y-8 ${className}`}>
      {/* Header explanation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--rule)] pb-3">
        <div>
          <span className="text-label text-[var(--teal)]">NETRASCAN PIPELINE ARCHITECTURE</span>
          <h2 className="text-lg sm:text-xl font-heading font-semibold text-[var(--fg)] mt-0.5">
            End-to-End System Workflow
          </h2>
          <p className="text-xs text-[var(--fg-soft)] mt-0.5">
            Click any block in the pipeline to inspect technical specifications or jump to that stage.
          </p>
        </div>

        <span className="text-[10px] font-mono text-[var(--amber)] px-2.5 py-1 rounded border border-[var(--amber)]/40 bg-[var(--amber)]/10 self-start sm:self-auto">
          INTERACTIVE FLOWCHART
        </span>
      </div>

      {/* Visual Flowchart Canvas: Matches the user's diagram */}
      <div className="p-4 sm:p-8 rounded-xl border border-[var(--rule)] bg-[#0c1314] relative overflow-hidden flex flex-col items-center">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(46,107,114,0.4) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 w-full max-w-md flex flex-col items-center space-y-3 sm:space-y-4">
          {/* Main 6 Sequential Stages */}
          {FLOWCHART_NODES.map((node, index) => {
            const isSelected = selectedNodeId === node.id;
            const Icon = node.icon;

            return (
              <React.Fragment key={node.id}>
                {/* Node Box */}
                <button
                  type="button"
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`w-full py-3 px-4 sm:py-3.5 sm:px-6 rounded-lg border text-center transition-all cursor-pointer shadow-md group relative min-h-[56px] flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-[#1b4338] border-[var(--amber)] ring-2 ring-[var(--amber)]/50 scale-[1.02]'
                      : 'bg-[#122e26] border-[#1d4d40] hover:border-[var(--teal)] hover:bg-[#163a30]'
                  }`}
                  aria-label={`${node.title} - ${node.subtitle}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-[var(--amber)]' : 'text-[#52b788]'
                      }`}
                    />
                    <span className="font-heading font-semibold text-sm sm:text-base text-[#e8f5e9] tracking-wide">
                      {node.title}
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs text-[#a3c9be] mt-0.5">
                    {node.subtitle}
                  </span>

                  {/* Active selection dot */}
                  {isSelected && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--amber)] animate-pulse" />
                  )}
                </button>

                {/* Arrow down connector */}
                {index < FLOWCHART_NODES.length - 1 && (
                  <div className="flex items-center justify-center text-[#52b788] py-0.5 opacity-80">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Fork Arrow into 2 branches */}
          <div className="w-full flex items-center justify-center py-1 text-[#52b788] opacity-80">
            <div className="flex flex-col items-center">
              <ArrowDown className="w-4 h-4 mb-1" />
              <svg width="220" height="24" viewBox="0 0 220 24" fill="none" className="max-w-full">
                <path
                  d="M110 0 V10 H40 V24 M110 10 H180 V24"
                  stroke="#52b788"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Bottom Forked Branches: Edge Deployment & District Simulation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
            {/* Branch 1: Edge Deployment */}
            <button
              type="button"
              onClick={() => setSelectedNodeId(BRANCH_NODES.edge.id)}
              className={`p-3.5 rounded-lg border text-center transition-all cursor-pointer shadow-md min-h-[56px] flex flex-col items-center justify-center ${
                selectedNodeId === BRANCH_NODES.edge.id
                  ? 'bg-[#1b4338] border-[var(--amber)] ring-2 ring-[var(--amber)]/50 scale-[1.02]'
                  : 'bg-[#122e26] border-[#1d4d40] hover:border-[var(--teal)] hover:bg-[#163a30]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Smartphone
                  className={`w-3.5 h-3.5 shrink-0 ${
                    selectedNodeId === BRANCH_NODES.edge.id ? 'text-[var(--amber)]' : 'text-[#52b788]'
                  }`}
                />
                <span className="font-heading font-semibold text-xs sm:text-sm text-[#e8f5e9]">
                  {BRANCH_NODES.edge.title}
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-[#a3c9be] mt-0.5">
                {BRANCH_NODES.edge.subtitle}
              </span>
            </button>

            {/* Branch 2: District Simulation */}
            <button
              type="button"
              onClick={() => setSelectedNodeId(BRANCH_NODES.simulation.id)}
              className={`p-3.5 rounded-lg border text-center transition-all cursor-pointer shadow-md min-h-[56px] flex flex-col items-center justify-center ${
                selectedNodeId === BRANCH_NODES.simulation.id
                  ? 'bg-[#1b4338] border-[var(--amber)] ring-2 ring-[var(--amber)]/50 scale-[1.02]'
                  : 'bg-[#122e26] border-[#1d4d40] hover:border-[var(--teal)] hover:bg-[#163a30]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Activity
                  className={`w-3.5 h-3.5 shrink-0 ${
                    selectedNodeId === BRANCH_NODES.simulation.id ? 'text-[var(--amber)]' : 'text-[#52b788]'
                  }`}
                />
                <span className="font-heading font-semibold text-xs sm:text-sm text-[#e8f5e9]">
                  {BRANCH_NODES.simulation.title}
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-[#a3c9be] mt-0.5">
                {BRANCH_NODES.simulation.subtitle}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Node Details Card & Direct Jump Action */}
      <div className="p-5 sm:p-6 rounded-xl border border-[var(--rule)] bg-[var(--bg-2)] space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--rule)] pb-4 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-label text-[var(--amber)]">STAGE SPECIFICATION</span>
              <span className="text-xs font-mono text-[var(--fg-faint)]">· {selectedNode.subtitle}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-heading font-semibold text-[var(--fg)] mt-1">
              {selectedNode.title}
            </h3>
          </div>

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate(selectedNode.tab, selectedNode.step)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[var(--fg)] text-[var(--bg)] font-medium text-xs sm:text-sm hover:bg-white transition-all shadow-md cursor-pointer shrink-0 min-h-[44px]"
            >
              <span>Test This Stage</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-xs sm:text-sm text-[var(--fg-soft)] leading-relaxed">
          {selectedNode.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-3 rounded border border-[var(--rule)] bg-[var(--bg)] space-y-1.5">
            <span className="text-label text-[var(--fg-faint)] block">KEY DELIVERABLES & OUTPUTS</span>
            <ul className="space-y-1 text-xs text-[var(--fg)]">
              {selectedNode.keyOutputs.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--teal)] shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded border border-[var(--rule)] bg-[var(--bg)] flex flex-col justify-between">
            <div>
              <span className="text-label text-[var(--fg-faint)] block mb-1">HARDWARE & ARCHITECTURAL SPECS</span>
              <span className="text-xs font-mono text-[var(--amber)] leading-relaxed">
                {selectedNode.specs}
              </span>
            </div>
            <div className="text-[11px] text-[var(--fg-faint)] mt-2 font-mono">
              Interoperability: ABDM FHIR JSON Compatible
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
