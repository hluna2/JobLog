import React, { useState } from 'react';
import { X, Printer } from 'lucide-react';
import { JobApplication } from '../types';

interface PrintableLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: JobApplication[];
  selectedState: string;
}

export const PrintableLogModal: React.FC<PrintableLogModalProps> = ({
  isOpen,
  onClose,
  jobs,
  selectedState,
}) => {
  const [dateFilter, setDateFilter] = useState<'all' | 'recent30' | 'recent90'>('all');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const filteredJobs = jobs.filter(j => {
    if (dateFilter === 'all') return true;
    const applied = new Date(j.dateApplied).getTime();
    const now = Date.now();
    const days = (now - applied) / (1000 * 60 * 60 * 24);
    if (dateFilter === 'recent30') return days <= 30;
    if (dateFilter === 'recent90') return days <= 90;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 print:border-none print:shadow-none print:m-0 print:p-0 print:max-w-none">
        {/* Top Control Bar (Hidden during print) */}
        <div className="bg-slate-900 text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3 no-print">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Work Search Verification Sheet ({selectedState})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Clean 8.5x11" format for unemployment audit documentation
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as any)}
              className="bg-slate-800 text-xs border border-slate-700 text-slate-200 px-2.5 py-1 rounded-lg focus:outline-none"
            >
              <option value="all">All Applications ({jobs.length})</option>
              <option value="recent30">Past 30 Days</option>
              <option value="recent90">Past 90 Days</option>
            </select>

            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 print:p-2 text-slate-900 font-sans print:text-[8.5pt] max-h-[75vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Document Header (Clean, anonymous, no personal info placeholders) */}
          <div className="border-b-2 border-slate-900 pb-3 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                  STATE OF {selectedState} • UNEMPLOYMENT WORK SEARCH RECORD
                </span>
                <h1 className="text-lg font-bold uppercase tracking-tight text-slate-900">
                  Weekly Work Search Verification Log
                </h1>
              </div>
              <div className="text-right text-xs">
                <div className="font-semibold text-slate-800">Generated: {new Date().toLocaleDateString()}</div>
                <div className="text-slate-500 text-[11px]">Total Entries: {filteredJobs.length}</div>
              </div>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left text-xs print:text-[8pt] border border-slate-300 border-collapse mb-5">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <th className="py-1 px-1.5 border-r border-slate-300 w-6 text-center">#</th>
                <th className="py-1 px-1.5 border-r border-slate-300 whitespace-nowrap">Date Applied</th>
                <th className="py-1 px-1.5 border-r border-slate-300">Company Name</th>
                <th className="py-1 px-1.5 border-r border-slate-300">Website / Phone</th>
                <th className="py-1 px-1.5 border-r border-slate-300">Job Title</th>
                <th className="py-1 px-1.5 border-r border-slate-300">Method / Source</th>
                <th className="py-1 px-1.5 border-r border-slate-300">Contact Person</th>
                <th className="py-1 px-1.5">Status / Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    No applications recorded for this period.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job, idx) => (
                  <tr key={job.id} className="odd:bg-white even:bg-slate-50/50">
                    <td className="py-1 px-1.5 border-r border-slate-200 text-center text-slate-500 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-1 px-1.5 border-r border-slate-200 font-mono whitespace-nowrap">
                      {job.dateApplied}
                    </td>
                    <td className="py-1 px-1.5 border-r border-slate-200 font-semibold text-slate-900">
                      <div>{job.employerName}</div>
                      {job.address && (
                        <div className="text-[9px] text-slate-500 font-normal">{job.address}</div>
                      )}
                    </td>
                    <td className="py-1 px-1.5 border-r border-slate-200 text-slate-700 font-mono text-[9px]">
                      <div className="truncate max-w-[140px]">{job.employerWebsite || 'NA'}</div>
                      {job.phoneNumber && <div>{job.phoneNumber}</div>}
                    </td>
                    <td className="py-1 px-1.5 border-r border-slate-200 font-medium text-slate-800">
                      {job.jobTitle}
                    </td>
                    <td className="py-1 px-1.5 border-r border-slate-200 text-slate-700">
                      <div>{job.jobSource}</div>
                      <div className="text-[9px] text-slate-500">{job.applicationMethod}</div>
                    </td>
                    <td className="py-1 px-1.5 border-r border-slate-200 text-slate-700 font-mono text-[9px]">
                      {job.contactPerson || 'NA'}
                    </td>
                    <td className="py-1 px-1.5 text-slate-800">
                      <span className="font-semibold">{job.status}</span>
                      {job.result && job.result !== 'NA' && (
                        <div className="text-[9px] text-slate-600 font-normal">{job.result}</div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Signature Block */}
          <div className="border-t border-slate-800 pt-3 mt-5 break-inside-avoid">
            <p className="text-[9px] text-slate-500 leading-relaxed italic mb-4">
              "I certify that the information contained on this record of work search activities is true, accurate, and complete to the best of my knowledge."
            </p>

            <div className="grid grid-cols-2 gap-8 text-xs">
              <div>
                <div className="border-b border-slate-900 pb-1 h-6"></div>
                <span className="text-[9px] font-bold uppercase text-slate-600 block mt-0.5">
                  Signature
                </span>
              </div>
              <div>
                <div className="border-b border-slate-900 pb-1 h-6 flex items-end">
                  <span className="font-mono">{new Date().toLocaleDateString()}</span>
                </div>
                <span className="text-[9px] font-bold uppercase text-slate-600 block mt-0.5">
                  Date
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
