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
  Briefcase,
  Columns,
  Power,
  RotateCcw
} from 'lucide-react';
import { PartTimeEarningsRecord, ConfiguredJob, EarningsJobEntry } from '../types';
import { evaluateHoursExpression, isFormulaString, roundHours, roundCurrency } from '../utils/math';
import { ConfirmModal } from './ConfirmModal';

interface ModalJobRow {
  id: string;
  name: string;
  hours: string;
  rate: string;
}

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
  const [jobRows, setJobRows] = useState<ModalJobRow[]>([]);
  const [notes, setNotes] = useState('');
  const [recordToDelete, setRecordToDelete] = useState<PartTimeEarningsRecord | null>(null);

  // Table Column Layout: Minimized (clean, compact) vs Detailed (expanded)
  const [isMinimizedView, setIsMinimizedView] = useState(true);

  // Configure Jobs Modal State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempJobs, setTempJobs] = useState<ConfiguredJob[]>(configuredJobs);
  const [newJobName, setNewJobName] = useState('');
  const [newJobRate, setNewJobRate] = useState('');

  // Active jobs on device
  const activeConfiguredJobs = configuredJobs.filter(j => j.isActive !== false);
  const inactiveConfiguredJobs = configuredJobs.filter(j => j.isActive === false);

  // Open Add Modal with active configured jobs pre-filled
  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setWeekStart('');
    setWeekEnd('');
    setNotes('');

    // Pre-fill only ACTIVE jobs by default
    const initialRows: ModalJobRow[] = (activeConfiguredJobs.length > 0 ? activeConfiguredJobs : configuredJobs).map(j => ({
      id: 'row-' + Math.random().toString(36).substring(2, 7),
      name: j.name,
      hours: '',
      rate: j.hourlyRate.toFixed(2),
    }));

    if (initialRows.length === 0) {
      initialRows.push({
        id: 'row-1',
        name: 'Job 1',
        hours: '',
        rate: '15.00',
      });
    }

    setJobRows(initialRows);
    setShowAddModal(true);
  };

  // Open Edit Modal with historical records preserved
  const handleOpenEditModal = (rec: PartTimeEarningsRecord) => {
    setEditingRecord(rec);
    setWeekStart(rec.weekStart);
    setWeekEnd(rec.weekEnd);
    setNotes(rec.notes || '');

    let rows: ModalJobRow[] = [];

    if (rec.customEntries && rec.customEntries.length > 0) {
      rows = rec.customEntries.map(e => ({
        id: e.jobId || 'row-' + Math.random().toString(36).substring(2, 7),
        name: e.jobName,
        hours: e.hours ? e.hours.toString() : '',
        rate: (e.rate || 0).toFixed(2),
      }));
    } else {
      // Fallback for older 2-job format
      if (rec.job1Hours > 0 || rec.job1Rate > 0) {
        rows.push({
          id: 'row-1',
          name: configuredJobs[0]?.name || 'Job 1',
          hours: rec.job1Hours.toString(),
          rate: (rec.job1Rate || 0).toFixed(2),
        });
      }
      if (rec.job2Hours > 0 || rec.job2Rate > 0) {
        rows.push({
          id: 'row-2',
          name: configuredJobs[1]?.name || 'Job 2',
          hours: rec.job2Hours.toString(),
          rate: (rec.job2Rate || 0).toFixed(2),
        });
      }
      if (rows.length === 0) {
        rows.push({
          id: 'row-1',
          name: 'Job 1',
          hours: '',
          rate: '15.00',
        });
      }
    }

    setJobRows(rows);
    setShowAddModal(true);
  };

  // Add another job row dynamically into the current week's modal
  const handleAddJobRow = (prefilledName?: string, prefilledRate?: number) => {
    setJobRows(prev => [
      ...prev,
      {
        id: 'row-' + Math.random().toString(36).substring(2, 7),
        name: prefilledName || '',
        hours: '',
        rate: prefilledRate !== undefined ? prefilledRate.toFixed(2) : '15.00',
      },
    ]);
  };

  // Remove a job row from the current week's modal
  const handleRemoveJobRow = (rowId: string) => {
    setJobRows(prev => prev.filter(r => r.id !== rowId));
  };

  // Update a field in a modal job row
  const handleUpdateJobRow = (rowId: string, field: 'name' | 'hours' | 'rate', value: string) => {
    setJobRows(prev =>
      prev.map(r => (r.id === rowId ? { ...r, [field]: value } : r))
    );
  };

  // Live total calculations for the modal
  let currentTotalHours = 0;
  let currentTotalGross = 0;

  jobRows.forEach(row => {
    const h = evaluateHoursExpression(row.hours);
    const r = parseFloat(row.rate) || 0;
    currentTotalHours += h;
    currentTotalGross += h * r;
  });

  currentTotalHours = roundHours(currentTotalHours, 3);
  currentTotalGross = roundCurrency(currentTotalGross);

  // Save Record Handler
  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weekStart || !weekEnd) {
      alert('Please enter week start and end dates.');
      return;
    }

    // Build custom entries with hours rounded to 3 decimal places and amounts rounded to 2 decimal places
    const customEntries: EarningsJobEntry[] = jobRows
      .filter(r => r.name.trim() || r.hours.trim())
      .map(row => {
        const h = roundHours(evaluateHoursExpression(row.hours), 3);
        const r = parseFloat(row.rate) || 0;
        const total = roundCurrency(h * r);
        return {
          jobId: row.id,
          jobName: row.name.trim() || 'Job',
          hours: h,
          rate: r,
          total,
        };
      });

    const totalHours = roundHours(customEntries.reduce((sum, e) => sum + e.hours, 0), 3);
    const totalAmount = roundCurrency(customEntries.reduce((sum, e) => sum + e.total, 0));

    // Preserve compatibility with job1 and job2 fields
    const j1 = customEntries[0];
    const j2 = customEntries[1];

    if (editingRecord) {
      onUpdateEarnings({
        ...editingRecord,
        weekStart,
        weekEnd,
        job1Hours: j1 ? j1.hours : 0,
        job1Rate: j1 ? j1.rate : 0,
        job1Total: j1 ? j1.total : 0,
        job2Hours: j2 ? j2.hours : 0,
        job2Rate: j2 ? j2.rate : 0,
        job2Total: j2 ? j2.total : 0,
        totalAmount,
        notes,
        customEntries,
      });
    } else {
      const record: PartTimeEarningsRecord = {
        id: 'earn-' + Math.random().toString(36).substring(2, 9),
        weekStart,
        weekEnd,
        job1Hours: j1 ? j1.hours : 0,
        job1Rate: j1 ? j1.rate : 0,
        job1Total: j1 ? j1.total : 0,
        job2Hours: j2 ? j2.hours : 0,
        job2Rate: j2 ? j2.rate : 0,
        job2Total: j2 ? j2.total : 0,
        totalAmount,
        notes,
        customEntries,
      };
      onAddEarnings(record);
    }

    setShowAddModal(false);
  };

  // Configure Jobs Handlers (with Active / Inactive toggling)
  const handleOpenConfigModal = () => {
    setTempJobs([...configuredJobs]);
    setShowConfigModal(true);
  };

  const handleToggleJobActive = (index: number) => {
    const updated = [...tempJobs];
    const current = updated[index].isActive !== false;
    updated[index].isActive = !current;
    setTempJobs(updated);
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
      isActive: true,
    };
    setTempJobs([...tempJobs, newJob]);
    setNewJobName('');
    setNewJobRate('');
  };

  const handleDeleteJob = (id: string) => {
    setTempJobs(tempJobs.filter(j => j.id !== id));
  };

  const handleSaveJobConfig = () => {
    onSaveConfiguredJobs(tempJobs);
    setShowConfigModal(false);
  };

  // Helper to extract all entries for a history row
  const getRowEntries = (row: PartTimeEarningsRecord): Array<{ name: string; hours: number; rate: number; total: number }> => {
    if (row.customEntries && row.customEntries.length > 0) {
      return row.customEntries.map(e => ({
        name: e.jobName,
        hours: roundHours(e.hours, 3),
        rate: e.rate,
        total: roundCurrency(e.total),
      }));
    }
    const fallback: Array<{ name: string; hours: number; rate: number; total: number }> = [];
    if (row.job1Hours > 0 || row.job1Total > 0) {
      fallback.push({
        name: configuredJobs[0]?.name || 'Job 1',
        hours: roundHours(row.job1Hours, 3),
        rate: row.job1Rate || 0,
        total: roundCurrency(row.job1Total || 0),
      });
    }
    if (row.job2Hours > 0 || row.job2Total > 0) {
      fallback.push({
        name: configuredJobs[1]?.name || 'Job 2',
        hours: roundHours(row.job2Hours, 3),
        rate: row.job2Rate || 0,
        total: roundCurrency(row.job2Total || 0),
      });
    }
    return fallback;
  };

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
              Record concurrent employment hours and compute weekly gross wages. You can add new jobs, inactivate past employers while keeping past records intact, and evaluate formulas like <code className="text-indigo-300 bg-slate-800 px-1 py-0.5 rounded">=22.8-7.5+8.35</code>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <button
              onClick={handleOpenConfigModal}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Configure My Jobs ({activeConfiguredJobs.length} active)</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Hours</span>
            </button>
          </div>
        </div>
      </div>

      {/* Earnings History Table with Minimized / Detailed Layout Toggle */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
              Weekly Hours & Gross Wages History
            </h3>
            <p className="text-[11px] text-slate-500">
              Active jobs on device: {activeConfiguredJobs.map(j => `${j.name} ($${j.hourlyRate.toFixed(2)}/hr)`).join(' • ') || 'None active'}
              {inactiveConfiguredJobs.length > 0 && ` (${inactiveConfiguredJobs.length} past inactive preserved)`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Minimized Columns Toggle */}
            <button
              onClick={() => setIsMinimizedView(!isMinimizedView)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 flex items-center gap-1.5 transition"
              title="Toggle between clean minimized layout and expanded columns"
            >
              <Columns className="w-3.5 h-3.5 text-slate-500" />
              <span>{isMinimizedView ? 'Layout: Minimized (Clean)' : 'Layout: Expanded'}</span>
            </button>

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
                {isMinimizedView ? (
                  <>
                    <th className="py-2 px-3">Jobs & Hours Breakdown</th>
                    <th className="py-2 px-3 text-center">Total Hours (3 Decimals)</th>
                    <th className="py-2 px-3 text-right">Total Gross Wages</th>
                  </>
                ) : (
                  <>
                    {configuredJobs.map(job => (
                      <React.Fragment key={job.id}>
                        <th className="py-2 px-3 text-center">{job.name} Hours</th>
                        <th className="py-2 px-3 text-center">{job.name} Gross</th>
                      </React.Fragment>
                    ))}
                    <th className="py-2 px-3 text-right">Total Gross</th>
                  </>
                )}
                <th className="py-2 px-3">Notes</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedEarnings.length === 0 ? (
                <tr>
                  <td colSpan={isMinimizedView ? 7 : (configuredJobs.length * 2 + 5)} className="py-6 text-center text-slate-400">
                    No earnings records saved yet.
                  </td>
                </tr>
              ) : (
                sortedEarnings.map((row, idx) => {
                  const entries = getRowEntries(row);
                  const totalRowHours = roundHours(entries.reduce((sum, e) => sum + e.hours, 0), 3);

                  return (
                    <tr key={row.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-800 whitespace-nowrap">
                        {row.weekStart} → {row.weekEnd}
                      </td>

                      {isMinimizedView ? (
                        <>
                          {/* Minimized Clean Breakdown */}
                          <td className="py-2.5 px-3">
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {entries.length === 0 ? (
                                <span className="text-slate-400 italic">0 hours</span>
                              ) : (
                                entries.map((entry, eIdx) => (
                                  <span
                                    key={eIdx}
                                    className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px] font-mono whitespace-nowrap"
                                  >
                                    <span className="font-semibold text-slate-900 font-sans">{entry.name}:</span>{' '}
                                    <span className="text-indigo-700 font-bold">{entry.hours.toFixed(3)}h</span>{' '}
                                    <span className="text-slate-400">(${entry.total.toFixed(2)})</span>
                                  </span>
                                ))
                              )}
                            </div>
                          </td>

                          {/* Total Hours (Strictly 3 Decimals) */}
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800 whitespace-nowrap">
                            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {totalRowHours.toFixed(3)}h
                            </span>
                          </td>

                          {/* Total Gross Wages (Strictly 2 Decimals) */}
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                            <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded border border-emerald-200">
                              ${roundCurrency(row.totalAmount).toFixed(2)}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Detailed Expanded Columns */}
                          {configuredJobs.map(job => {
                            const entry = entries.find(e => e.name.toLowerCase() === job.name.toLowerCase());
                            const h = entry ? entry.hours : 0;
                            const t = entry ? entry.total : 0;
                            return (
                              <React.Fragment key={job.id}>
                                <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                                  {h > 0 ? `${h.toFixed(3)}h` : '0'}
                                </td>
                                <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-800">
                                  {t > 0 ? `$${t.toFixed(2)}` : '$0.00'}
                                </td>
                              </React.Fragment>
                            );
                          })}
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                            ${roundCurrency(row.totalAmount).toFixed(2)}
                          </td>
                        </>
                      )}

                      <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                        {row.notes || <span className="text-slate-300 italic">—</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Earnings Modal (Dynamic Job Rows, Add/Remove on the fly, 3 Decimals Hours) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingRecord ? 'Edit Weekly Earnings Record' : 'Record Weekly Hours & Gross Wages'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="p-5 space-y-4 text-xs">
              {/* Week Start & End */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Week Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={weekStart}
                    onChange={e => setWeekStart(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Week End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={weekEnd}
                    onChange={e => setWeekEnd(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Job Rows with Add/Remove support */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                    Jobs Worked This Week ({jobRows.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddJobRow()}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Job Entry</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {jobRows.length === 0 ? (
                    <div className="p-3 bg-slate-50 rounded-lg text-center text-slate-400 border border-slate-200">
                      No jobs added for this week yet. Click "+ Add Job Entry" above.
                    </div>
                  ) : (
                    jobRows.map((row, rIdx) => {
                      const h = roundHours(evaluateHoursExpression(row.hours), 3);
                      const isFormula = isFormulaString(row.hours);
                      const r = parseFloat(row.rate) || 0;
                      const subtotal = roundCurrency(h * r);

                      return (
                        <div
                          key={row.id}
                          className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <input
                                type="text"
                                list="configured-job-suggestions"
                                placeholder="Job / Employer Name"
                                value={row.name}
                                onChange={e => handleUpdateJobRow(row.id, 'name', e.target.value)}
                                className="w-full px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-800 font-bold text-xs"
                              />
                            </div>
                            {jobRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveJobRow(row.id)}
                                className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition"
                                title="Remove job from this week"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-2 items-center">
                            <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="block text-slate-500 text-[10px] uppercase font-bold">
                                  Hours (3 Dec)
                                </label>
                                {isFormula && (
                                  <span className="text-[10px] font-mono font-bold text-indigo-600">
                                    = {h.toFixed(3)}h
                                  </span>
                                )}
                              </div>
                              <input
                                type="text"
                                placeholder="e.g. 15 or =22.8-7.5+8.35"
                                value={row.hours}
                                onChange={e => handleUpdateJobRow(row.id, 'hours', e.target.value)}
                                className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                                title="Enter hours or an Excel formula like =22.8-7.5+8.35 (rounded to 3 decimal places)"
                              />
                            </div>

                            <div>
                              <label className="block text-slate-500 text-[10px] uppercase font-bold mb-0.5">
                                Hourly Rate ($)
                              </label>
                              <div className="flex items-center gap-1">
                                <span className="text-slate-400 font-mono">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder="15.00"
                                  value={row.rate}
                                  onChange={e => handleUpdateJobRow(row.id, 'rate', e.target.value)}
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-slate-500 text-[10px] uppercase font-bold mb-0.5">
                                Subtotal ($)
                              </label>
                              <div className="font-mono font-bold text-slate-800 py-1">
                                ${subtotal.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Add Inactive Past Employer Button if any exist */}
                {inactiveConfiguredJobs.length > 0 && (
                  <div className="pt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                    <span>Quick-add past employer:</span>
                    {inactiveConfiguredJobs.map(pastJob => (
                      <button
                        key={pastJob.id}
                        type="button"
                        onClick={() => handleAddJobRow(pastJob.name, pastJob.hourlyRate)}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded font-semibold text-slate-700 transition"
                      >
                        + {pastJob.name} (${pastJob.hourlyRate.toFixed(2)})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Card (Hours rounded to 3 decimals, Dollars rounded to 2 decimals) */}
              <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-700 block">
                    Total Hours & Gross Wages
                  </span>
                  <span className="text-[11px] font-mono text-slate-600">
                    {currentTotalHours.toFixed(3)} hrs total across {jobRows.length} {jobRows.length === 1 ? 'job' : 'jobs'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-base font-mono font-bold text-emerald-800">
                    ${currentTotalGross.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-400">Gross before taxes</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule adjustments, orientation, overtime, etc."
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

      {/* Datalist for Job Name Suggestions */}
      <datalist id="configured-job-suggestions">
        {configuredJobs.map(j => (
          <option key={j.id} value={j.name} />
        ))}
      </datalist>

      {/* Configure Jobs Modal (With Active / Inactive Past Employer Toggling!) */}
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

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Add your employers and default hourly wage rates. When you leave an employer, click the <strong>Active / Inactive</strong> button to inactivate it. Inactivated jobs are hidden from new weekly records, but <strong>all your past earnings history remains completely safe and preserved</strong>.
              </p>

              {/* Active Jobs List */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">
                  Configured Jobs ({tempJobs.length})
                </span>
                {tempJobs.map((job, index) => {
                  const isActive = job.isActive !== false;

                  return (
                    <div
                      key={job.id}
                      className={`flex items-center gap-2 p-2 border rounded-lg transition ${
                        isActive ? 'bg-slate-50 border-slate-200' : 'bg-slate-100/60 border-dashed border-slate-300 opacity-80'
                      }`}
                    >
                      <Briefcase className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
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
                      <div className="flex items-center gap-1 w-20">
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
                          className="w-full px-1.5 py-1 bg-white border border-slate-300 rounded font-mono text-slate-800 font-semibold text-right"
                        />
                      </div>

                      {/* Active / Inactive Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleJobActive(index)}
                        className={`px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1 border transition ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300'
                            : 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300'
                        }`}
                        title={isActive ? 'Click to mark Inactive (past employer)' : 'Click to reactivate job'}
                      >
                        <Power className="w-3 h-3" />
                        <span>{isActive ? 'Active' : 'Inactive'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                        title="Delete Job Definition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add New Job Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-2">
                <span className="font-bold text-slate-800 block">Add a New Job / Employer</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Target, Freelance"
                    value={newJobName}
                    onChange={e => setNewJobName(e.target.value)}
                    className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded"
                  />
                  <div className="flex items-center gap-1 w-24">
                    <span className="text-slate-400 font-mono">$</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Rate"
                      value={newJobRate}
                      onChange={e => setNewJobRate(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-mono text-right"
                    />
                  </div>
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
            <strong>{recordToDelete?.weekStart} → {recordToDelete?.weekEnd}</strong> (${roundCurrency(recordToDelete?.totalAmount || 0).toFixed(2)})?
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
