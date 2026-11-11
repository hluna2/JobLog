import React, { useState } from 'react';
import {
  DollarSign,
  Clock,
  Calculator,
  Plus,
  Trash2,
  Settings,
  X,
  Edit2,
  Check,
  Briefcase
} from 'lucide-react';
import { PartTimeEarningsRecord, ConfiguredJob } from '../types';
import { evaluateHoursExpression, isFormulaString, roundHours } from '../utils/math';
import { ConfirmModal } from './ConfirmModal';

interface EarningsCalculatorViewProps {
  earnings: PartTimeEarningsRecord[];
  configuredJobs: ConfiguredJob[];
  onSaveConfiguredJobs: (jobs: ConfiguredJob[]) => void;
  onAddEarnings: (record: PartTimeEarningsRecord) => void;
  onUpdateEarnings: (record: PartTimeEarningsRecord) => void;
  onDeleteEarnings: (id: string) => void;
}

export const EarningsCalculatorView: React.FC<EarningsCalculatorViewProps> = ({
  earnings,
  configuredJobs,
  onSaveConfiguredJobs,
  onAddEarnings,
  onUpdateEarnings,
  onDeleteEarnings,
}) => {
  // Add / Edit Record Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PartTimeEarningsRecord | null>(null);
  const [weekStart, setWeekStart] = useState('');
  const [weekEnd, setWeekEnd] = useState('');
  const [hoursMap, setHoursMap] = useState<Record<string, string>>({});
  const [ratesMap, setRatesMap] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [recordToDelete, setRecordToDelete] = useState<PartTimeEarningsRecord | null>(null);

  // Configure Jobs Modal State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempJobs, setTempJobs] = useState<ConfiguredJob[]>(configuredJobs);
  const [newJobName, setNewJobName] = useState('');
  const [newJobRate, setNewJobRate] = useState('');

  // Open Add Modal with pre-filled default rates from configured jobs
  const handleOpenAddModal = () => {
    setEditingRecord(null);
    const initialRates: Record<string, string> = {};
    const initialHours: Record<string, string> = {};
    configuredJobs.forEach(job => {
      initialRates[job.id] = job.hourlyRate.toString();
      initialHours[job.id] = '';
    });
    setRatesMap(initialRates);
    setHoursMap(initialHours);
    setWeekStart('');
    setWeekEnd('');
    setNotes('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (rec: PartTimeEarningsRecord) => {
    setEditingRecord(rec);
    setWeekStart(rec.weekStart);
    setWeekEnd(rec.weekEnd);
    setNotes(rec.notes || '');

    const initialRates: Record<string, string> = {};
    const initialHours: Record<string, string> = {};

    const job1 = configuredJobs[0];
    const job2 = configuredJobs[1];

    if (job1) {
      initialHours[job1.id] = rec.job1Hours ? rec.job1Hours.toString() : '';
      initialRates[job1.id] = rec.job1Rate ? rec.job1Rate.toString() : job1.hourlyRate.toString();
    }
    if (job2) {
      initialHours[job2.id] = rec.job2Hours ? rec.job2Hours.toString() : '';
      initialRates[job2.id] = rec.job2Rate ? rec.job2Rate.toString() : job2.hourlyRate.toString();
    }

    setRatesMap(initialRates);
    setHoursMap(initialHours);
    setShowAddModal(true);
  };

  // Live total calculation for new record with Excel-style formula evaluation support
  let currentTotalGross = 0;
  configuredJobs.forEach(job => {
    const h = evaluateHoursExpression(hoursMap[job.id]);
    const r = parseFloat(ratesMap[job.id] !== undefined ? ratesMap[job.id] : job.hourlyRate.toString()) || 0;
    currentTotalGross += h * r;
  });

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weekStart || !weekEnd) {
      alert('Please enter week start and end dates.');
      return;
    }

    const job1 = configuredJobs[0];
    const job2 = configuredJobs[1];

    const j1Hours = job1 ? evaluateHoursExpression(hoursMap[job1.id]) : 0;
    const j1Rate = job1 ? parseFloat(ratesMap[job1.id]) || job1.hourlyRate : 0;
    const j1Total = j1Hours * j1Rate;

    const j2Hours = job2 ? evaluateHoursExpression(hoursMap[job2.id]) : 0;
    const j2Rate = job2 ? parseFloat(ratesMap[job2.id]) || job2.hourlyRate : 0;
    const j2Total = j2Hours * j2Rate;

    const customEntries = configuredJobs.map(j => {
      const h = evaluateHoursExpression(hoursMap[j.id]);
      const r = parseFloat(ratesMap[j.id]) || j.hourlyRate;
      return {
        jobId: j.id,
        jobName: j.name,
        hours: h,
        rate: r,
        total: Math.round(h * r * 100) / 100,
      };
    });

    if (editingRecord) {
      onUpdateEarnings({
        ...editingRecord,
        weekStart,
        weekEnd,
        job1Hours: j1Hours,
        job1Rate: j1Rate,
        job1Total: Math.round(j1Total * 100) / 100,
        job2Hours: j2Hours,
        job2Rate: j2Rate,
        job2Total: Math.round(j2Total * 100) / 100,
        totalAmount: Math.round(currentTotalGross * 100) / 100,
        notes,
        customEntries,
      });
    } else {
      const record: PartTimeEarningsRecord = {
        id: 'earn-' + Math.random().toString(36).substring(2, 9),
        weekStart,
        weekEnd,
        job1Hours: j1Hours,
        job1Rate: j1Rate,
        job1Total: Math.round(j1Total * 100) / 100,
        job2Hours: j2Hours,
        job2Rate: j2Rate,
        job2Total: Math.round(j2Total * 100) / 100,
        totalAmount: Math.round(currentTotalGross * 100) / 100,
        notes,
        customEntries,
      };
      onAddEarnings(record);
    }

    setShowAddModal(false);
  };

  // Configure Jobs Handlers
  const handleOpenConfigModal = () => {
    setTempJobs([...configuredJobs]);
    setShowConfigModal(true);
  };

  const handleAddNewJob = () => {
    if (!newJobName.trim()) {
      alert('Please enter a job name.');
      return;
    }
    const rate = parseFloat(newJobRate) || 0;
    const newJob: ConfiguredJob = {
      id: 'job-' + Math.random().toString(36).substring(2, 8),
      name: newJobName.trim(),
      hourlyRate: rate,
    };
    setTempJobs([...tempJobs, newJob]);
    setNewJobName('');
    setNewJobRate('');
  };

  const handleDeleteJob = (id: string) => {
    if (tempJobs.length <= 1) {
      alert('You must keep at least 1 job configured.');
      return;
    }
    setTempJobs(tempJobs.filter(j => j.id !== id));
  };

  const handleSaveJobConfig = () => {
    onSaveConfiguredJobs(tempJobs);
    setShowConfigModal(false);
  };

  const job1Name = configuredJobs[0]?.name || 'Job 1';
  const job2Name = configuredJobs[1]?.name || 'Job 2';

  // Sort earnings oldest to newest (ascending)
  const sortedEarnings = [...earnings].sort(
    (a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
  );

  return (
    <div className="space-y-5">
      {/* Earnings Guidance Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-slate-800 text-slate-300 text-[11px] px-2 py-0.5 rounded font-mono">
                Device Storage
              </span>
              <span className="text-xs text-slate-400">Weekly Gross Wages Calculator</span>
            </div>
            <h2 className="text-base font-bold text-white">Earnings Log</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-0.5">
              Track concurrent employment hours and compute weekly gross wages to report when submitting unemployment certifications.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <button
              onClick={handleOpenConfigModal}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Configure My Jobs ({configuredJobs.length})</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Hours</span>
            </button>
          </div>
        </div>
      </div>

      {/* Earnings History Table with Internal Scrolling */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
              Weekly Hours & Gross Wages History
            </h3>
            <p className="text-[11px] text-slate-500">
              Active jobs on this device: {configuredJobs.map(j => `${j.name} ($${j.hourlyRate.toFixed(2)}/hr)`).join(' • ')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddModal}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 flex items-center gap-1 transition"
            >
              <Plus className="w-3 h-3" />
              <span>Add Week</span>
            </button>
          </div>
        </div>

        {/* Internal Scroll Container */}
        <div className="max-h-[380px] overflow-y-auto overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100 z-10">
              <tr className="text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2 px-3 w-8 text-center">#</th>
                <th className="py-2 px-3">Week Range</th>
                <th className="py-2 px-3 text-center">{job1Name} Hours</th>
                <th className="py-2 px-3 text-center">{job1Name} Gross</th>
                {configuredJobs.length > 1 && (
                  <>
                    <th className="py-2 px-3 text-center">{job2Name} Hours</th>
                    <th className="py-2 px-3 text-center">{job2Name} Gross</th>
                  </>
                )}
                <th className="py-2 px-3 text-right">Total Gross</th>
                <th className="py-2 px-3">Notes</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedEarnings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    No earnings records saved yet.
                  </td>
                </tr>
              ) : (
                sortedEarnings.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition">
                    <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 font-mono font-medium text-slate-800 whitespace-nowrap">
                      {row.weekStart} → {row.weekEnd}
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-slate-700">
                      {row.job1Hours > 0 ? `${row.job1Hours}h` : '0'}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-semibold text-slate-800">
                      {row.job1Total > 0 ? `$${row.job1Total.toFixed(2)}` : '$0.00'}
                    </td>
                    {configuredJobs.length > 1 && (
                      <>
                        <td className="py-2 px-3 text-center font-mono text-slate-700">
                          {row.job2Hours > 0 ? `${row.job2Hours}h` : '0'}
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-semibold text-slate-800">
                          {row.job2Total > 0 ? `$${row.job2Total.toFixed(2)}` : '$0.00'}
                        </td>
                      </>
                    )}
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        ${row.totalAmount.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 max-w-xs">
                      {row.notes || <span className="text-slate-300 italic">—</span>}
                    </td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(row)}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition mr-1"
                        title="Edit earnings record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setRecordToDelete(row)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                        title="Delete earnings record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Earnings Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm">
                  {editingRecord ? 'Edit Weekly Earnings' : 'Record Weekly Earnings'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Week Start (Sunday) *</label>
                  <input
                    type="date"
                    required
                    value={weekStart}
                    onChange={e => setWeekStart(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Week End (Saturday) *</label>
                  <input
                    type="date"
                    required
                    value={weekEnd}
                    onChange={e => setWeekEnd(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Job Rows */}
              <div className="space-y-2.5">
                {configuredJobs.map(job => {
                  const currentHours = evaluateHoursExpression(hoursMap[job.id]);
                  const isFormula = isFormulaString(hoursMap[job.id]);
                  const currentRate = parseFloat(ratesMap[job.id] !== undefined ? ratesMap[job.id] : job.hourlyRate.toString()) || 0;
                  const subtotal = currentHours * currentRate;

                  return (
                    <div key={job.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{job.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Rate: ${currentRate.toFixed(2)}/hr
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="block text-slate-500 text-[10px] uppercase font-bold">
                              Hours
                            </label>
                            {isFormula && (
                              <span className="text-[10px] font-mono font-bold text-indigo-600">
                                = {currentHours}h
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            placeholder="e.g. 15 or =22.8-7.5+8.35"
                            value={hoursMap[job.id] || ''}
                            onChange={e =>
                              setHoursMap({ ...hoursMap, [job.id]: e.target.value })
                            }
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                            title="Enter hours or an Excel formula like =22.8-7.5+8.35"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 text-[10px] uppercase font-bold mb-0.5">
                            Hourly Rate ($)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={ratesMap[job.id] !== undefined ? ratesMap[job.id] : job.hourlyRate}
                            onChange={e =>
                              setRatesMap({ ...ratesMap, [job.id]: e.target.value })
                            }
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 text-[10px] uppercase font-bold mb-0.5">
                            Subtotal
                          </label>
                          <div className="font-mono font-bold text-slate-800 py-1">
                            ${subtotal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Card */}
              <div className="bg-slate-100 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-700 block">
                    Total Gross Wages
                  </span>
                  <span className="text-[11px] text-slate-500">Gross earnings before taxes</span>
                </div>
                <div className="text-base font-mono font-bold text-slate-900">
                  ${currentTotalGross.toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule adjustments, orientation, etc."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
                  {editingRecord ? 'Save Changes' : 'Save Earnings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Configure Jobs Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-300" />
                <h3 className="font-bold text-sm">Configure My Jobs & Hourly Rates</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Customize the jobs and hourly wage rates tracked on this device. You can name them generically (e.g. "Job 1", "Job 2") or give them custom employer names.
              </p>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">
                  Active Jobs
                </span>
                {tempJobs.map((job, index) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <input
                      type="text"
                      value={job.name}
                      onChange={e => {
                        const updated = [...tempJobs];
                        updated[index].name = e.target.value;
                        setTempJobs(updated);
                      }}
                      placeholder="Job Name"
                      className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded text-slate-800 font-semibold"
                    />
                    <div className="flex items-center gap-1 w-24">
                      <span className="text-slate-400 font-mono">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={job.hourlyRate}
                        onChange={e => {
                          const updated = [...tempJobs];
                          updated[index].hourlyRate = parseFloat(e.target.value) || 0;
                          setTempJobs(updated);
                        }}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono text-slate-800 font-semibold"
                      />
                    </div>
                    {tempJobs.length > 1 && (
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                        title="Remove Job"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-2">
                <span className="font-bold text-slate-800 block">Add Another Job</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Job 3"
                    value={newJobName}
                    onChange={e => setNewJobName(e.target.value)}
                    className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Rate ($)"
                    value={newJobRate}
                    onChange={e => setNewJobRate(e.target.value)}
                    className="w-20 px-2 py-1 bg-white border border-slate-300 rounded font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewJob}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveJobConfig}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg"
                >
                  Save Device Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Earnings Confirmation Modal */}
      <ConfirmModal
        isOpen={!!recordToDelete}
        title="Delete Earnings Record"
        message={
          <span>
            Are you sure you want to delete the earnings record for{' '}
            <strong>{recordToDelete?.weekStart} → {recordToDelete?.weekEnd}</strong> (${recordToDelete?.totalAmount.toFixed(2)})?
          </span>
        }
        confirmLabel="Delete Record"
        confirmVariant="danger"
        onConfirm={() => {
          if (recordToDelete) {
            onDeleteEarnings(recordToDelete.id);
            setRecordToDelete(null);
          }
        }}
        onClose={() => setRecordToDelete(null)}
      />
    </div>
  );
};
