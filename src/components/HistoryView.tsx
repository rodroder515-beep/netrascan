import React, { useState } from 'react';
import { Search, ArrowUpRight, CheckCircle2, AlertCircle, ShieldAlert, AlertTriangle } from 'lucide-react';
import { RECENT_SCREENINGS } from '../mocks/mockPatients';

interface HistoryViewProps {
  onSelectScreening: (screeningId: string) => void;
  onStartNewScreening: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onSelectScreening,
  onStartNewScreening,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterEye, setFilterEye] = useState<string>('ALL');

  const filtered = RECENT_SCREENINGS.filter((row) => {
    const matchesSearch =
      row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.village.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === 'ALL' || row.triageCategory === filterCategory;

    const matchesEye = filterEye === 'ALL' || row.eye === filterEye;

    return matchesSearch && matchesCategory && matchesEye;
  });

  const getTriageBadge = (category: string) => {
    if (category === 'CLEAR') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[var(--teal)]/40 text-[var(--teal)] bg-[var(--teal)]/10 font-semibold text-[11px]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          CLEAR
        </span>
      );
    } else if (category === 'REFER') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[var(--amber)]/40 text-[var(--amber)] bg-[var(--amber)]/10 font-semibold text-[11px]">
          <AlertCircle className="w-3.5 h-3.5" />
          REFER
        </span>
      );
    } else if (category === 'ESCALATE') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-red-500/40 text-red-400 bg-red-500/10 font-semibold text-[11px]">
          <ShieldAlert className="w-3.5 h-3.5" />
          ESCALATE
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[var(--rule)] text-[var(--fg-faint)] bg-[var(--bg)] font-semibold text-[11px]">
          <AlertTriangle className="w-3.5 h-3.5" />
          RETAKE
        </span>
      );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full">
      {/* Header */}
      <div className="border-b border-[var(--rule)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-label text-[var(--fg-faint)] mb-1">
            <span>OFFLINE LOCAL REGISTRY</span>
            <span>·</span>
            <span>INDEXEDDB SYNC</span>
          </div>
          <h1
            className="font-heading font-bold text-[var(--fg)] tracking-[-0.02em] leading-[1.1]"
            style={{ fontSize: 'clamp(1.75rem, 3.8vw, 2.5rem)' }}
          >
            Screening Records & Registry
          </h1>
          <p className="text-sm sm:text-base text-[var(--fg-soft)] mt-1.5 leading-[1.6]">
            Historical registry of point-of-care retinal screenings conducted across PHC 01 and linked sub-centres.
          </p>
        </div>

        <button
          onClick={onStartNewScreening}
          className="px-6 py-2.5 rounded-full bg-[var(--teal)] text-white font-medium text-xs sm:text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-sm cursor-pointer shrink-0 min-h-[44px] flex items-center justify-center w-full sm:w-auto"
        >
          + New Screening
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 sm:p-4 rounded border border-[var(--rule)] bg-[var(--bg-2)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-faint)]" />
          <input
            type="text"
            placeholder="Search by name, ID, or village..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded bg-[var(--bg)] border border-[var(--rule)] text-xs text-[var(--fg)] placeholder:text-[var(--fg-faint)] focus:border-[var(--amber)] min-h-[40px]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
          {/* Triage filter */}
          <div className="flex items-center gap-1 border border-[var(--rule)] rounded p-0.5 bg-[var(--bg)] text-xs overflow-x-auto no-scrollbar">
            {(['ALL', 'CLEAR', 'REFER', 'ESCALATE', 'RETAKE_REQUIRED'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded transition-colors text-xs whitespace-nowrap min-h-[36px] flex items-center cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-[var(--bg-2)] text-[var(--fg)] font-medium shadow-sm'
                    : 'text-[var(--fg-soft)] hover:text-[var(--fg)]'
                }`}
              >
                {cat === 'RETAKE_REQUIRED' ? 'RETAKE' : cat}
              </button>
            ))}
          </div>

          {/* Eye filter */}
          <div className="flex items-center gap-1 border border-[var(--rule)] rounded p-0.5 bg-[var(--bg)] text-xs">
            {(['ALL', 'OD', 'OS'] as const).map((eye) => (
              <button
                key={eye}
                onClick={() => setFilterEye(eye)}
                className={`px-2.5 py-1.5 rounded transition-colors text-xs cursor-pointer min-h-[36px] flex items-center ${
                  filterEye === eye
                    ? 'bg-[var(--bg-2)] text-[var(--fg)] font-medium'
                    : 'text-[var(--fg-soft)] hover:text-[var(--fg)]'
                }`}
              >
                {eye}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 1. Desktop & Tablet Table: Scrolls inside container */}
      <div className="hidden md:block overflow-x-auto border border-[var(--rule)] rounded bg-[var(--bg-2)]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[var(--bg)]/90 border-b border-[var(--rule)] text-label text-[var(--fg-faint)]">
              <th className="py-3 px-4 whitespace-nowrap">RECORD ID</th>
              <th className="py-3 px-4 whitespace-nowrap">PATIENT NAME & AGE</th>
              <th className="py-3 px-4 whitespace-nowrap">VILLAGE SUB-CENTRE</th>
              <th className="py-3 px-4 whitespace-nowrap">DATE & EYE</th>
              <th className="py-3 px-4 whitespace-nowrap">QUALITY</th>
              <th className="py-3 px-4 whitespace-nowrap">SCREENING RISK TIER</th>
              <th className="py-3 px-4 whitespace-nowrap">TRIAGE STATUS</th>
              <th className="py-3 px-4 text-right whitespace-nowrap">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--rule)]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-[var(--fg-soft)]">
                  No screening records match the specified search parameters.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--bg)]/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-[var(--fg-soft)] whitespace-nowrap">{item.id}</td>
                  <td className="py-3 px-4 font-medium text-[var(--fg)] whitespace-nowrap">
                    {item.name}
                    <span className="text-[var(--fg-faint)] font-normal ml-1 font-mono">
                      ({item.age}{item.gender})
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[var(--fg-soft)] whitespace-nowrap">{item.village}</td>
                  <td className="py-3 px-4 font-mono text-[var(--fg-soft)] whitespace-nowrap">
                    {item.date} · <strong className="text-[var(--fg)]">{item.eye}</strong>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        item.qualityStatus === 'GRADABLE'
                          ? 'border-[var(--teal)]/40 text-[var(--teal)] bg-[var(--teal)]/10'
                          : 'border-red-500/40 text-red-400 bg-red-500/10'
                      }`}
                    >
                      {item.qualityScore}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[var(--fg-soft)] whitespace-nowrap">
                    {item.riskTier.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getTriageBadge(item.triageCategory)}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => onSelectScreening(item.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-[var(--rule)] hover:border-[var(--fg-soft)] text-xs text-[var(--fg)] transition-colors cursor-pointer min-h-[36px]"
                    >
                      <span>View</span>
                      <ArrowUpRight className="w-3 h-3 text-[var(--fg-faint)]" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Card List (< 768px) with >= 44px tap targets */}
      <div className="block md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-[var(--fg-soft)] border border-[var(--rule)] rounded bg-[var(--bg-2)]">
            No screening records match the specified search parameters.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border border-[var(--rule)] bg-[var(--bg-2)] space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-heading font-semibold text-sm text-[var(--fg)]">
                    {item.name}
                    <span className="text-[var(--fg-faint)] text-xs font-normal ml-1.5 font-mono">
                      ({item.age}{item.gender})
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[var(--fg-faint)] mt-0.5">
                    ID: {item.id} · {item.village}
                  </div>
                </div>
                <div>{getTriageBadge(item.triageCategory)}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[var(--rule)]">
                <div>
                  <span className="text-[10px] text-[var(--fg-faint)] uppercase block">Date & Eye</span>
                  <span className="font-mono text-[var(--fg)]">{item.date} · {item.eye}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[var(--fg-faint)] uppercase block">Quality Score</span>
                  <span className="font-mono text-[var(--teal)] font-medium">{item.qualityScore}% Gradable</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[10px] text-[var(--fg-faint)] uppercase block">Risk Assessment</span>
                <span className="text-xs text-[var(--fg-soft)] font-medium">
                  {item.riskTier.replace(/_/g, ' ')}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onSelectScreening(item.id)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-md border border-[var(--rule)] hover:border-[var(--amber)] bg-[var(--bg)] text-xs font-medium text-[var(--fg)] min-h-[44px] transition-colors cursor-pointer"
              >
                <span>View Full Screening Record</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[var(--amber)]" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-3.5 sm:p-4 rounded border border-[var(--rule)] bg-[var(--bg-2)]/60 text-xs text-[var(--fg-faint)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2">
        <span>Fictional demonstration records for SIH 2026</span>
        <span>Local encrypted storage (Zero cloud dependency)</span>
      </div>
    </div>
  );
};
