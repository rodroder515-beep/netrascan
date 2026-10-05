import React, { useState } from 'react';
import { PlusCircle, Search, AlertCircle, ShieldAlert, CheckCircle2, AlertTriangle, ArrowUpRight, ShieldCheck, MapPin } from 'lucide-react';
import { RECENT_SCREENINGS, MOCK_STATS, DemoScreeningSummary } from '../mocks/mockPatients';

interface DashboardViewProps {
  onStartNewScreening: () => void;
  onViewScreeningDetails: (screeningId: string) => void;
  onNavigateToHistory: () => void;
  viewDensity?: 'compact' | 'comfortable';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onStartNewScreening,
  onViewScreeningDetails,
  onNavigateToHistory,
  viewDensity = 'comfortable',
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterTier, setFilterTier] = useState<'ALL' | 'CLEAR' | 'REFER' | 'ESCALATE' | 'UNGRADABLE'>('ALL');

  const isComfortable = viewDensity === 'comfortable';

  const filteredScreenings = RECENT_SCREENINGS.filter((item: DemoScreeningSummary) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.village.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterTier === 'ALL') return matchesSearch;
    if (filterTier === 'CLEAR') return matchesSearch && item.triageCategory === 'CLEAR';
    if (filterTier === 'REFER') return matchesSearch && item.triageCategory === 'REFER';
    if (filterTier === 'ESCALATE') return matchesSearch && item.triageCategory === 'ESCALATE';
    if (filterTier === 'UNGRADABLE') return matchesSearch && item.triageCategory === 'RETAKE_REQUIRED';
    return matchesSearch;
  });

  const getTriageBadge = (category: string) => {
    if (category === 'CLEAR') {
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border border-[var(--teal)]/30 text-[var(--teal)] bg-[var(--teal)]/10 font-medium tracking-wide ${
          isComfortable ? 'px-3 py-1 text-[12px]' : 'px-2 py-0.5 text-[11px]'
        }`}>
          <CheckCircle2 className={`${isComfortable ? 'w-3.5 h-3.5' : 'w-3 h-3'} shrink-0`} />
          Clear
        </span>
      );
    } else if (category === 'REFER') {
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border border-[var(--amber)]/35 text-[var(--amber)] bg-[var(--amber)]/10 font-medium tracking-wide ${
          isComfortable ? 'px-3 py-1 text-[12px]' : 'px-2 py-0.5 text-[11px]'
        }`}>
          <AlertCircle className={`${isComfortable ? 'w-3.5 h-3.5' : 'w-3 h-3'} shrink-0`} />
          Refer
        </span>
      );
    } else if (category === 'ESCALATE') {
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border border-red-500/35 text-red-500 dark:text-red-400 bg-red-500/10 font-medium tracking-wide ${
          isComfortable ? 'px-3 py-1 text-[12px]' : 'px-2 py-0.5 text-[11px]'
        }`}>
          <ShieldAlert className={`${isComfortable ? 'w-3.5 h-3.5' : 'w-3 h-3'} shrink-0`} />
          Escalate
        </span>
      );
    } else {
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border border-[var(--rule)] text-[var(--fg-soft)] bg-[var(--bg-2)] font-medium tracking-wide ${
          isComfortable ? 'px-3 py-1 text-[12px]' : 'px-2 py-0.5 text-[11px]'
        }`}>
          <AlertTriangle className={`${isComfortable ? 'w-3.5 h-3.5' : 'w-3 h-3'} shrink-0`} />
          Retake
        </span>
      );
    }
  };

  return (
    <div className={`animate-fadeIn w-full ${isComfortable ? 'space-y-7 sm:space-y-8' : 'space-y-5'}`}>
      {/* Header and CTA */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--rule)] ${
        isComfortable ? 'pb-6' : 'pb-4'
      }`}>
        <div>
          {/* Refined metadata breadcrumb with soft clinical hierarchy */}
          <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium text-[var(--fg-faint)] mb-1.5">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[var(--teal)]" />
              Rural Health Network
            </span>
            <span className="opacity-40">/</span>
            <span>Kalyanpur Cluster</span>
            <span className="opacity-40">/</span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-[var(--teal)]/10 text-[var(--teal)] font-medium border border-[var(--teal)]/25">
              PHC 01
            </span>
          </div>

          {/* Main Title: Title Case with comfortable or compact scaling */}
          <h1 className={`font-heading font-semibold tracking-[-0.02em] leading-tight text-[var(--fg)] ${
            isComfortable ? 'text-[30px] sm:text-[34px]' : 'text-[26px] sm:text-[28px]'
          }`}>
            Screening Overview
          </h1>

          <p className={`font-normal text-[var(--fg-soft)] mt-1.5 max-w-2xl leading-[1.6] ${
            isComfortable ? 'text-[15px]' : 'text-[13px]'
          }`}>
            Point-of-care explainable AI triage support for diabetic retinopathy in rural primary healthcare workflows.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onStartNewScreening}
          className={`inline-flex items-center justify-center gap-2 rounded-full bg-[var(--teal)] text-white font-medium hover:opacity-95 active:scale-[0.98] transition-all shadow-sm cursor-pointer shrink-0 w-full sm:w-auto ${
            isComfortable ? 'px-6 py-3 text-[14px] min-h-[46px]' : 'px-5 py-2 text-[13px] min-h-[40px]'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Start New Screening</span>
        </button>
      </div>

      {/* Streamlined Clinical Safety Strip */}
      <div className={`rounded-xl border border-[var(--rule)] bg-[var(--bg-2)]/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[var(--fg-soft)] ${
        isComfortable ? 'px-5 py-3.5 text-[14px] leading-[1.6]' : 'px-4 py-2.5 text-[12px] leading-[1.5]'
      }`}>
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[var(--amber)] shrink-0" />
          <p>
            <span className="font-semibold text-[var(--fg)]">Clinical Decision Support:</span> Screening indications support referral urgency and do not substitute full ophthalmic diagnosis.
          </p>
        </div>
        <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-md border border-[var(--rule)] text-[var(--fg-faint)] bg-[var(--bg)] shrink-0 self-start md:self-auto">
          Fictional Demo Data
        </span>
      </div>

      {/* Primary Statistics (128 / 17 / 6 / 9) - Modern rounded-xl cards with balanced depth */}
      <div className={`grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 ${isComfortable ? 'gap-5' : 'gap-3.5'}`}>
        {/* Total Screened: 128 */}
        <div className={`rounded-xl border border-[var(--rule)] bg-[var(--bg-2)] shadow-sm hover:border-[var(--fg-soft)]/40 transition-colors flex flex-col justify-between ${
          isComfortable ? 'p-6' : 'p-4'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`font-medium text-[var(--fg-soft)] ${isComfortable ? 'text-[13px]' : 'text-[11px]'}`}>
              Total Screened
            </span>
            <span className="text-[10px] font-mono text-[var(--fg-faint)] px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--rule)]">
              YTD 2026
            </span>
          </div>

          <div className={`${isComfortable ? 'my-3.5' : 'my-2'} flex items-baseline gap-2.5`}>
            <span className={`font-heading font-semibold tracking-[-0.02em] leading-none text-[var(--fg)] ${
              isComfortable ? 'text-[48px] sm:text-[54px]' : 'text-[38px] sm:text-[42px]'
            }`}>
              {MOCK_STATS.totalScreened}
            </span>
            <span className={`font-normal text-[var(--fg-soft)] ${isComfortable ? 'text-[15px]' : 'text-[13px]'}`}>patients</span>
          </div>

          <div className={`pt-3 border-t border-[var(--rule)] flex items-center justify-between text-[var(--fg-soft)] ${
            isComfortable ? 'text-[13px]' : 'text-[11px]'
          }`}>
            <span>Routine Annual: {MOCK_STATS.routineAnnual}</span>
            <span className="text-[var(--teal)] font-medium">75.0%</span>
          </div>
        </div>

        {/* Referrals Indicated: 17 */}
        <div className={`rounded-xl border border-[var(--amber)]/45 bg-[var(--bg-2)] shadow-sm relative overflow-hidden flex flex-col justify-between ${
          isComfortable ? 'p-6' : 'p-4'
        }`}>
          <div className="absolute top-0 right-0 w-28 h-28 bg-[var(--amber)]/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className={`font-medium text-[var(--amber)] ${isComfortable ? 'text-[13px]' : 'text-[11px]'}`}>
              Referrals Indicated
            </span>
            <AlertCircle className="w-4 h-4 text-[var(--amber)]" />
          </div>

          <div className={`${isComfortable ? 'my-3.5' : 'my-2'} flex items-baseline gap-2.5 relative z-10`}>
            <span className={`font-heading font-semibold tracking-[-0.02em] leading-none text-[var(--amber)] ${
              isComfortable ? 'text-[48px] sm:text-[54px]' : 'text-[38px] sm:text-[42px]'
            }`}>
              {MOCK_STATS.referralsIndicated}
            </span>
            <span className={`font-normal text-[var(--fg-soft)] ${isComfortable ? 'text-[15px]' : 'text-[13px]'}`}>cases</span>
          </div>

          <div className={`pt-3 border-t border-[var(--rule)] text-[var(--fg-soft)] flex items-center justify-between relative z-10 ${
            isComfortable ? 'text-[13px]' : 'text-[11px]'
          }`}>
            <span>Mild / Moderate DR</span>
            <span className="text-[var(--amber)] font-medium">13.3%</span>
          </div>
        </div>

        {/* Urgent Escalations: 6 */}
        <div className={`rounded-xl border border-red-500/35 bg-[var(--bg-2)] shadow-sm relative overflow-hidden flex flex-col justify-between ${
          isComfortable ? 'p-6' : 'p-4'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`font-medium text-red-500 dark:text-red-400 ${isComfortable ? 'text-[13px]' : 'text-[11px]'}`}>
              Urgent Escalations
            </span>
            <ShieldAlert className="w-4 h-4 text-red-500 dark:text-red-400" />
          </div>

          <div className={`${isComfortable ? 'my-3.5' : 'my-2'} flex items-baseline gap-2.5`}>
            <span className={`font-heading font-semibold tracking-[-0.02em] leading-none text-red-500 dark:text-red-400 ${
              isComfortable ? 'text-[48px] sm:text-[54px]' : 'text-[38px] sm:text-[42px]'
            }`}>
              {MOCK_STATS.urgentEscalations}
            </span>
            <span className={`font-normal text-[var(--fg-soft)] ${isComfortable ? 'text-[15px]' : 'text-[13px]'}`}>cases</span>
          </div>

          <div className={`pt-3 border-t border-[var(--rule)] text-[var(--fg-soft)] flex items-center justify-between ${
            isComfortable ? 'text-[13px]' : 'text-[11px]'
          }`}>
            <span>Severe / Proliferative</span>
            <span className="text-red-500 dark:text-red-400 font-medium">4.7%</span>
          </div>
        </div>

        {/* Ungradable / Retake: 9 */}
        <div className={`rounded-xl border border-[var(--rule)] bg-[var(--bg-2)] shadow-sm flex flex-col justify-between ${
          isComfortable ? 'p-6' : 'p-4'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`font-medium text-[var(--fg-soft)] ${isComfortable ? 'text-[13px]' : 'text-[11px]'}`}>
              Ungradable / Retake
            </span>
            <AlertTriangle className="w-4 h-4 text-[var(--fg-soft)]" />
          </div>

          <div className={`${isComfortable ? 'my-3.5' : 'my-2'} flex items-baseline gap-2.5`}>
            <span className={`font-heading font-semibold tracking-[-0.02em] leading-none text-[var(--fg)] ${
              isComfortable ? 'text-[48px] sm:text-[54px]' : 'text-[38px] sm:text-[42px]'
            }`}>
              {MOCK_STATS.ungradableRetake}
            </span>
            <span className={`font-normal text-[var(--fg-soft)] ${isComfortable ? 'text-[15px]' : 'text-[13px]'}`}>retakes</span>
          </div>

          <div className={`pt-3 border-t border-[var(--rule)] text-[var(--fg-soft)] flex items-center justify-between ${
            isComfortable ? 'text-[13px]' : 'text-[11px]'
          }`}>
            <span>Haze / Motion cut-off</span>
            <span className="text-[var(--fg-soft)] font-medium">7.0%</span>
          </div>
        </div>
      </div>

      {/* Recent Screenings Section */}
      <div className={`rounded-xl border border-[var(--rule)] bg-[var(--bg-2)] shadow-sm ${
        isComfortable ? 'p-6 sm:p-7 space-y-5' : 'p-4 sm:p-5 space-y-4'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className={`font-heading font-semibold tracking-[-0.01em] text-[var(--fg)] ${
              isComfortable ? 'text-[20px] sm:text-[22px]' : 'text-[17px] sm:text-[18px]'
            }`}>
              Recent Point-of-Care Screenings
            </h2>
            <p className={`font-normal text-[var(--fg-soft)] mt-0.5 ${isComfortable ? 'text-[14px]' : 'text-[12px]'}`}>
              Verified clinical records from PHC 01 and associated sub-centre outreach sessions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--fg-faint)] pointer-events-none" />
              <input
                type="text"
                placeholder="Search patient, ID, village..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-3 rounded-lg bg-[var(--bg)] border border-[var(--rule)] text-[var(--fg)] placeholder:text-[var(--fg-faint)] focus:border-[var(--teal)] focus:outline-none w-full transition-colors ${
                  isComfortable ? 'h-[44px] text-[14px]' : 'h-[36px] text-[12px]'
                }`}
              />
            </div>

            {/* Filter Pills */}
            <div className={`flex items-center gap-1 border border-[var(--rule)] rounded-lg p-1 bg-[var(--bg)] overflow-x-auto no-scrollbar ${
              isComfortable ? 'h-[44px]' : 'h-[36px]'
            }`}>
              {(['ALL', 'CLEAR', 'REFER', 'ESCALATE', 'UNGRADABLE'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setFilterTier(tier)}
                  className={`rounded-md transition-all whitespace-nowrap font-medium cursor-pointer ${
                    isComfortable ? 'px-3.5 py-1.5 text-[12px]' : 'px-2.5 py-1 text-[11px]'
                  } ${
                    filterTier === tier
                      ? 'bg-[var(--teal)] text-white shadow-xs'
                      : 'text-[var(--fg-soft)] hover:text-[var(--fg)]'
                  }`}
                >
                  {tier === 'ALL' ? 'All' : tier === 'CLEAR' ? 'Clear' : tier === 'REFER' ? 'Refer' : tier === 'ESCALATE' ? 'Escalate' : 'Ungradable'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop & Tablet Table */}
        <div className="hidden md:block overflow-x-auto border border-[var(--rule)] rounded-lg bg-[var(--bg)]">
          <table className={`w-full text-left border-collapse ${isComfortable ? 'text-[14px]' : 'text-[12px]'}`}>
            <thead>
              <tr className="bg-[var(--bg-2)]/90 border-b border-[var(--rule)] text-[11px] font-medium uppercase tracking-wider text-[var(--fg-faint)]">
                <th className={`${isComfortable ? 'py-3.5 px-5' : 'py-2.5 px-3.5'} whitespace-nowrap`}>Patient ID</th>
                <th className={`${isComfortable ? 'py-3.5 px-5' : 'py-2.5 px-3.5'} whitespace-nowrap`}>Patient Name</th>
                <th className={`${isComfortable ? 'py-3.5 px-5' : 'py-2.5 px-3.5'} whitespace-nowrap`}>Village / PHC</th>
                <th className={`${isComfortable ? 'py-3.5 px-5' : 'py-2.5 px-3.5'} whitespace-nowrap`}>Date & Eye</th>
                <th className={`${isComfortable ? 'py-3.5 px-5' : 'py-2.5 px-3.5'} whitespace-nowrap`}>Quality</th>
                <th className={`${isComfortable ? 'py-3.5 px-5' : 'py-2.5 px-3.5'} whitespace-nowrap`}>Screening Risk Tier</th>
                <th className={`${isComfortable ? 'py-3.5 px-5' : 'py-2.5 px-3.5'} whitespace-nowrap`}>Triage Status</th>
                <th className={`${isComfortable ? 'py-3.5 px-5' : 'py-2.5 px-3.5'} text-right whitespace-nowrap`}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--rule)]">
              {filteredScreenings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[14px] text-[var(--fg-soft)]">
                    No matching screening records found.
                  </td>
                </tr>
              ) : (
                filteredScreenings.map((row) => (
                  <tr key={row.id} className="hover:bg-[var(--bg-2)]/60 transition-colors">
                    <td className={`${isComfortable ? 'py-4 px-5' : 'py-2.5 px-3.5'} font-mono text-[var(--fg-soft)] text-xs whitespace-nowrap`}>{row.patientId}</td>
                    <td className={`${isComfortable ? 'py-4 px-5' : 'py-2.5 px-3.5'} font-medium text-[var(--fg)] whitespace-nowrap`}>
                      {row.name}
                      <span className="text-[var(--fg-faint)] font-normal ml-1.5 text-xs">({row.age}{row.gender})</span>
                    </td>
                    <td className={`${isComfortable ? 'py-4 px-5' : 'py-2.5 px-3.5'} text-[var(--fg-soft)] whitespace-nowrap`}>{row.village}</td>
                    <td className={`${isComfortable ? 'py-4 px-5' : 'py-2.5 px-3.5'} text-[var(--fg-soft)] whitespace-nowrap font-mono text-xs`}>
                      {row.date} · <span className="text-[var(--fg)] font-medium">{row.eye}</span>
                    </td>
                    <td className={`${isComfortable ? 'py-4 px-5' : 'py-2.5 px-3.5'} whitespace-nowrap`}>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded font-mono font-medium ${
                          row.qualityStatus === 'GRADABLE'
                            ? 'text-[var(--teal)] bg-[var(--teal)]/10 border border-[var(--teal)]/25'
                            : 'text-red-500 bg-red-500/10 border border-red-500/25'
                        }`}
                      >
                        {row.qualityScore}%
                      </span>
                    </td>
                    <td className={`${isComfortable ? 'py-4 px-5 text-[14px]' : 'py-2.5 px-3.5 text-[12px]'} text-[var(--fg)] whitespace-nowrap font-normal`}>
                      {row.riskTier.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                    </td>
                    <td className={`${isComfortable ? 'py-4 px-5' : 'py-2.5 px-3.5'} whitespace-nowrap`}>
                      {getTriageBadge(row.triageCategory)}
                    </td>
                    <td className={`${isComfortable ? 'py-4 px-5' : 'py-2.5 px-3.5'} text-right whitespace-nowrap`}>
                      <button
                        onClick={() => onViewScreeningDetails(row.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full border border-[var(--rule)] hover:border-[var(--teal)] font-medium text-[var(--fg)] hover:text-[var(--teal)] hover:bg-[var(--bg-2)] transition-colors cursor-pointer ${
                          isComfortable ? 'px-3.5 py-1.5 text-[13px] min-h-[36px]' : 'px-2.5 py-1 text-[11px] min-h-[28px]'
                        }`}
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[var(--fg-faint)]" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Clean Card List */}
        <div className="block md:hidden space-y-3">
          {filteredScreenings.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-[var(--fg-soft)] border border-[var(--rule)] rounded-lg bg-[var(--bg)]">
              No matching screening records found.
            </div>
          ) : (
            filteredScreenings.map((row) => (
              <div
                key={row.id}
                className="p-4 rounded-xl border border-[var(--rule)] bg-[var(--bg)] space-y-3 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-heading font-semibold text-[15px] text-[var(--fg)]">
                      {row.name}
                      <span className="text-[var(--fg-faint)] text-xs font-normal ml-1.5 font-mono">
                        ({row.age}{row.gender})
                      </span>
                    </div>
                    <div className="text-[12px] text-[var(--fg-faint)] mt-0.5 font-mono">
                      ID: {row.patientId} · {row.village}
                    </div>
                  </div>
                  <div>{getTriageBadge(row.triageCategory)}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2.5 border-t border-[var(--rule)]">
                  <div>
                    <span className="text-[10px] text-[var(--fg-faint)] uppercase block">Date & Eye</span>
                    <span className="text-[var(--fg)] font-medium font-mono">{row.date} · {row.eye}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--fg-faint)] uppercase block">Gradability</span>
                    <span className="text-[var(--teal)] font-medium">{row.qualityScore}% Gradable</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] text-[var(--fg-faint)] uppercase block">Screening Indication</span>
                  <span className="text-[14px] text-[var(--fg)] font-medium">
                    {row.riskTier.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onViewScreeningDetails(row.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-3 px-4 rounded-lg border border-[var(--rule)] hover:border-[var(--teal)] bg-[var(--bg-2)] text-[13px] font-medium text-[var(--fg)] min-h-[46px] transition-colors cursor-pointer"
                >
                  <span>Inspect Details & Explainability</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[var(--teal)]" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Bottom link to History */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onNavigateToHistory}
            className="text-[13px] text-[var(--fg-soft)] hover:text-[var(--teal)] underline flex items-center gap-1 min-h-[36px] cursor-pointer"
          >
            <span>View all 128 registered screenings in History</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
