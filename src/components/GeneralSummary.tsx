import React from 'react';
import { JobApplication } from '../types';

interface GeneralSummaryProps {
  jobs: JobApplication[];
}

export const GeneralSummary: React.FC<GeneralSummaryProps> = ({ jobs }) => {
  const total = jobs.length;
  const offers = jobs.filter(j => j.status === 'Offer').length;
  const interviews = jobs.filter(j => j.status === 'Interview').length;
  const viewed = jobs.filter(j => j.status === 'Viewed').length;
  const applied = jobs.filter(j => j.status === 'Applied').length;
  const denied = jobs.filter(j => j.status === 'Denied').length;
  const saved = jobs.filter(j => j.status === 'Saved').length;

  const interviewRate = total > 0 ? ((interviews / total) * 100).toFixed(1) : '0';
  const offerRate = total > 0 ? ((offers / total) * 100).toFixed(1) : '0';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-2.5 sm:p-3 shadow-2xs no-print">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          General Search Summary
        </h3>
        <span className="text-xs text-slate-400 font-mono">
          {total} Total Submissions
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 sm:gap-2 text-center">
        {/* Total Applied */}
        <div className="bg-slate-50 py-1.5 px-2 rounded-lg border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total</span>
          <span className="text-base sm:text-lg font-bold text-slate-900 font-mono">{total}</span>
        </div>

        {/* Applied / Pending */}
        <div className="bg-sky-50/60 py-1.5 px-2 rounded-lg border border-sky-200/80">
          <span className="text-[10px] uppercase font-bold text-sky-800 block">Applied</span>
          <span className="text-base sm:text-lg font-bold text-sky-900 font-mono">{applied}</span>
        </div>

        {/* Viewed */}
        <div className="bg-purple-50/60 py-1.5 px-2 rounded-lg border border-purple-200/80">
          <span className="text-[10px] uppercase font-bold text-purple-800 block">Viewed</span>
          <span className="text-base sm:text-lg font-bold text-purple-900 font-mono">{viewed}</span>
        </div>

        {/* Interviews */}
        <div className="bg-amber-50/60 py-1.5 px-2 rounded-lg border border-amber-200/80">
          <span className="text-[10px] uppercase font-bold text-amber-800 block">Interviews</span>
          <span className="text-base sm:text-lg font-bold text-amber-900 font-mono">{interviews}</span>
        </div>

        {/* Offers */}
        <div className="bg-emerald-50/60 py-1.5 px-2 rounded-lg border border-emerald-200/80">
          <span className="text-[10px] uppercase font-bold text-emerald-800 block">Offers</span>
          <span className="text-base sm:text-lg font-bold text-emerald-900 font-mono">{offers}</span>
        </div>

        {/* Denied */}
        <div className="bg-rose-50/60 py-1.5 px-2 rounded-lg border border-rose-200/80">
          <span className="text-[10px] uppercase font-bold text-rose-800 block">Denied</span>
          <span className="text-base sm:text-lg font-bold text-rose-900 font-mono">{denied}</span>
        </div>

        {/* Interview Rate */}
        <div className="bg-slate-50 py-1.5 px-2 rounded-lg border border-slate-200/80">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Interview Rate</span>
          <span className="text-base sm:text-lg font-bold text-slate-800 font-mono">{interviewRate}%</span>
        </div>
      </div>
    </div>
  );
};
