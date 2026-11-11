import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Scale,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react';
import {
  JobApplication,
  WeeklySummaryLog,
  WeeklyConfirmationRecord
} from '../types';

interface WeeklyComplianceViewProps {
  jobs: JobApplication[];
  weeklySummaries: WeeklySummaryLog[];
  confirmations: WeeklyConfirmationRecord[];
  selectedState: string;
  onAddConfirmation: (record: WeeklyConfirmationRecord) => void;
  onUpdateConfirmation: (record: WeeklyConfirmationRecord) => void;
  onDeleteConfirmation: (id: string) => void;
}

export const WeeklyComplianceView: React.FC<WeeklyComplianceViewProps> = ({
  jobs,
  weeklySummaries,
  confirmations,
  selectedState,
  onAddConfirmation,
  onUpdateConfirmation,
  onDeleteConfirmation,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWeekEnding, setNewWeekEnding] = useState('');
  const [newConfNum, setNewConfNum] = useState('');
  const [newAppealDate, setNewAppealDate] = useState('');
  const [newAppealConf, setNewAppealConf] = useState('');
  const [newCourt, setNewCourt] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleSaveConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeekEnding || !newConfNum) {
      alert('Please provide week ending date and confirmation number.');
      return;
    }
    const record: WeeklyConfirmationRecord = {
      id: 'conf-' + Math.random().toString(36).substring(2, 9),
      weekEnding: newWeekEnding,
      confirmationNumber: newConfNum,
      appealDate: newAppealDate || undefined,
      appealConfirmation: newAppealConf || undefined,
      court: newCourt || undefined,
      notes: newNotes || undefined,
    };
    onAddConfirmation(record);
    setShowAddModal(false);
    setNewWeekEnding('');
    setNewConfNum('');
    setNewAppealDate('');
    setNewAppealConf('');
    setNewCourt('');
    setNewNotes('');
  };

  return (
    <div className="space-y-5">
      {/* State Guidance Card (Clean, minimal, non-AI styling) */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-slate-800 text-slate-300 text-[11px] px-2 py-0.5 rounded font-mono">
                {selectedState} Unemployment
              </span>
              <span className="text-xs text-slate-400">Weekly Certification Proof</span>
            </div>
            <h2 className="text-base font-bold text-white">Work Search Certification Log</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-0.5">
              Record weekly state portal submission confirmation numbers and hearing records for unemployment audit and appeal protection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            {selectedState === 'GA' && (
              <a
                href="https://dol.georgia.gov/myui-claimant-portal"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition border border-slate-700"
              >
                <span>Georgia MyUI Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Confirmation #</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation & Appeals Record Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              Weekly Confirmation Numbers & Appeals History
            </h3>
            <p className="text-xs text-slate-500">
              {confirmations.length} weekly claims certified for {selectedState}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 flex items-center gap-1 transition"
          >
            <Plus className="w-3 h-3" />
            <span>Add Record</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Week Ending</th>
                <th className="py-2.5 px-3">Confirmation Number</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Appeal Date</th>
                <th className="py-2.5 px-3">Appeal Confirmation #</th>
                <th className="py-2.5 px-3">Court / Tribunal</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {confirmations.map(conf => (
                <tr key={conf.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                    {conf.weekEnding}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {conf.confirmationNumber || 'Pending'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[11px]">
                      <CheckCircle2 className="w-3 h-3" />
                      Certified
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono">
                    {conf.appealDate || '—'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">
                    {conf.appealConfirmation ? (
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-bold">
                        {conf.appealConfirmation}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {conf.court ? (
                      <div className="flex items-center gap-1 text-slate-800 font-medium">
                        <Scale className="w-3.5 h-3.5 text-slate-500" />
                        <span>{conf.court}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Delete confirmation for week ${conf.weekEnding}?`)) {
                          onDeleteConfirmation(conf.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Weekly Search Activity Summary */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200">
          <h3 className="font-bold text-slate-800 text-sm">
            Weekly Activity Log Archive
          </h3>
          <p className="text-xs text-slate-500">
            Historical breakdown of applications sent, interviews held, and follow-ups
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Week Start</th>
                <th className="py-2.5 px-3 text-center">Applications</th>
                <th className="py-2.5 px-3 text-center">Interviews</th>
                <th className="py-2.5 px-3 text-center">Networking</th>
                <th className="py-2.5 px-3 text-center">Follow-ups</th>
                <th className="py-2.5 px-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {weeklySummaries.map(ws => {
                const isMet = ws.applicationsSent >= 3;
                return (
                  <tr key={ws.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800 whitespace-nowrap">
                      {ws.weekStart}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-bold text-xs ${
                          isMet
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {ws.applicationsSent} {isMet ? '✓' : ''}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                      {ws.interviews || 0}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-600">
                      {ws.networkingContacts || 0}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-600">
                      {ws.followupsDone || 0}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-md">
                      {ws.notes || <span className="text-slate-300 italic">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Confirmation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Record Weekly Confirmation ({selectedState})</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConfirmation} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Benefit Week Ending Date *
                </label>
                <input
                  type="date"
                  required
                  value={newWeekEnding}
                  onChange={e => setNewWeekEnding(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Submission Confirmation Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15862489"
                  value={newConfNum}
                  onChange={e => setNewConfNum(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Appeal Date (Optional)
                </label>
                <input
                  type="date"
                  value={newAppealDate}
                  onChange={e => setNewAppealDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Appeal Confirmation # (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 796054"
                  value={newAppealConf}
                  onChange={e => setNewAppealConf(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Court / Tribunal / Status
                </label>
                <input
                  type="text"
                  placeholder="e.g. Appeals Tribunal, Board of Review"
                  value={newCourt}
                  onChange={e => setNewCourt(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Weekly certification submitted on Sunday"
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
