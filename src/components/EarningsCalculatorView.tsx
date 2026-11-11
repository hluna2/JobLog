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

interface EarningsCalculatorViewProps {
  earnings: PartTimeEarningsRecord[];
  configuredJobs: ConfiguredJob[];
  onSaveConfiguredJobs: (jobs: ConfiguredJob[]) => void;
  onAddEarnings: (record: PartTimeEarningsRecord) => void;
  onDeleteEarnings: (id: string) => void;
}

export const EarningsCalculatorView: React.FC<EarningsCalculatorViewProps> = ({
  earnings,
  configuredJobs,
  onSaveConfiguredJobs,
  onAddEarnings,
  onDeleteEarnings,
}) => {
  // Add Record Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [weekStart, setWeekStart] = useState('');
  const [weekEnd, setWeekEnd] = useState('');
  const [hoursMap, setHoursMap] = useState<Record<string, string>>({});
  const [ratesMap, setRatesMap] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');

  // Configure Jobs Modal State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempJobs, setTempJobs] = useState<ConfiguredJob[]>(configuredJobs);
  const [newJobName, setNewJobName] = useState('');
  const [newJobRate, setNewJobRate] = useState('');

  // Open Add Modal with pre-filled default rates from configured jobs
  const handleOpenAddModal = () => {
    const initialRates: Record<string, string> = {};
    const initialHours: Record<string, string> = {};
    configuredJobs.forEach(job => {
      initialRates[job.id] = job.hourlyRate.toString();
      initialHours[job.id] = '';
    });
    setRatesMap(initialRates);
    setHoursMap(initialHours);
    setShowAddModal(true);
  };

  // Live total calculation for new record
  let currentTotalGross = 0;
  configuredJobs.forEach(job => {
    const h = parseFloat(hoursMap[job.id]) || 0;
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

    const j1Hours = job1 ? parseFloat(hoursMap[job1.id]) || 0 : 0;
    const j1Rate = job1 ? parseFloat(ratesMap[job1.id]) || job1.hourlyRate : 0;
    const j1Total = j1Hours * j1Rate;

    const j2Hours = job2 ? parseFloat(hoursMap[job2.id]) || 0 : 0;
    const j2Rate = job2 ? parseFloat(ratesMap[job2.id]) || job2.hourlyRate : 0;
    const j2Total = j2Hours * j2Rate;

    const customEntries = configuredJobs.map(j => {
      const h = parseFloat(hoursMap[j.id]) || 0;
      const r = parseFloat(ratesMap[j.id]) || j.hourlyRate;
      return {
        jobId: j.id,
        jobName: j.name,
        hours: h,
        rate: r,
        total: Math.round(h * r * 100) / 100,
      };
    });

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
    setShowAddModal(false);
    setWeekStart('');
    setWeekEnd('');
    setNotes('');
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

  return (
    <div className="space-y-6">
      {/* Earnings Guidance & Configuration Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-emerald-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
                GDOL Part-Time Work Certification
              </span>
              <span className="text-xs text-emerald-200">Device-Only Secure Storage</span>
            </div>
            <h2 className="text-lg font-bold">Weekly Gross Earnings Log</h2>
            <p className="text-xs text-emerald-100/80 max-w-2xl leading-relaxed mt-1">
              If you worked during a benefit week, Georgia requires reporting <strong className="text-white">gross wages before taxes</strong> for the week the hours were worked. Your job list and rates are saved <strong className="text-white">strictly on your device</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            {/* Configure Jobs Button */}
            <button
              onClick={handleOpenConfigModal}
              className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-emerald-200 border border-emerald-700/60 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
              title="Configure your jobs and hourly wage rates"
            >
              <Settings className="w-4 h-4 text-emerald-400" />
              <span>Configure My Jobs ({configuredJobs.length})</span>
            </button>

            {/* Record Earnings Button */}
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Record Weekly Hours</span>
            </button>
          </div>
        </div>
      </div>

      {/* Earnings History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">
              Weekly Hours & Gross Wages History
            </h3>
            <p className="text-xs text-slate-500">
              Active configured jobs on this device: {configuredJobs.map(j => `${j.name} ($${j.hourlyRate.toFixed(2)}/hr)`).join(' • ')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenConfigModal}
              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Jobs</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Week</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Week Range</th>
                <th className="py-3 px-4 text-center">{job1Name} Hours</th>
                <th className="py-3 px-4 text-center">{job1Name} Gross</th>
                {configuredJobs.length > 1 && (
                  <>
                    <th className="py-3 px-4 text-center">{job2Name} Hours</th>
                    <th className="py-3 px-4 text-center">{job2Name} Gross</th>
                  </>
                )}
                <th className="py-3 px-4 text-right">Total Gross to Report</th>
                <th className="py-3 px-4">Notes / Circumstances</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {earnings.map(row => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                    {row.weekStart} → {row.weekEnd}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-700">
                    {row.job1Hours > 0 ? `${row.job1Hours} hrs` : '0'}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-slate-800">
                    {row.job1Total > 0 ? `$${row.job1Total.toFixed(2)}` : '$0.00'}
                  </td>
                  {configuredJobs.length > 1 && (
                    <>
                      <td className="py-3 px-4 text-center font-mono text-slate-700">
                        {row.job2Hours > 0 ? `${row.job2Hours} hrs` : '0'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold text-slate-800">
                        {row.job2Total > 0 ? `$${row.job2Total.toFixed(2)}` : '$0.00'}
                      </td>
                    </>
                  )}
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                    <span className="bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                      ${row.totalAmount.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs">
                    {row.notes || <span className="text-slate-300 italic">—</span>}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Delete earnings record for ${row.weekStart}?`)) {
                          onDeleteEarnings(row.id);
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

      {/* Record Earnings Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm">Calculate & Record Weekly Earnings</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Week Start (Sunday) *</label>
                  <input
                    type="date"
                    required
                    value={weekStart}
                    onChange={e => setWeekStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Week End (Saturday) *</label>
                  <input
                    type="date"
                    required
                    value={weekEnd}
                    onChange={e => setWeekEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Job Input Rows */}
              <div className="space-y-3">
                {configuredJobs.map(job => {
                  const currentHours = parseFloat(hoursMap[job.id]) || 0;
                  const currentRate = parseFloat(ratesMap[job.id] !== undefined ? ratesMap[job.id] : job.hourlyRate.toString()) || 0;
                  const subtotal = currentHours * currentRate;

                  return (
                    <div key={job.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{job.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Rate: ${currentRate.toFixed(2)}/hr
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div>
                          <label className="block text-slate-500 text-[10px] uppercase font-bold mb-0.5">
                            Hours Worked
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={hoursMap[job.id] || ''}
                            onChange={e =>
                              setHoursMap({ ...hoursMap, [job.id]: e.target.value })
                            }
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono outline-none"
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
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-mono outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 text-[10px] uppercase font-bold mb-0.5">
                            Subtotal
                          </label>
                          <div className="font-mono font-bold text-slate-800 py-1.5">
                            ${subtotal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Card */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                    Total Gross Wages to Report to GDOL
                  </span>
                  <span className="text-xs text-emerald-600">Enter this number on MyUI weekly claim</span>
                </div>
                <div className="text-lg font-mono font-bold text-emerald-800">
                  ${currentTotalGross.toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule changes, health visit, etc."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  Save Weekly Earnings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Configure Jobs Modal (Device-Specific customization) */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-400" />
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
                Customize the jobs and hourly wage rates tracked on this device. You can add or rename jobs to match your specific employers or keep them generic (e.g. "Job 1", "Job 2").
              </p>

              {/* Current Jobs List */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">
                  Active Jobs
                </span>
                {tempJobs.map((job, index) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <Briefcase className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <input
                      type="text"
                      value={job.name}
                      onChange={e => {
                        const updated = [...tempJobs];
                        updated[index].name = e.target.value;
                        setTempJobs(updated);
                      }}
                      placeholder="Job Name"
                      className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold"
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
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-mono text-slate-800 font-semibold"
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

              {/* Add New Job Form */}
              <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-xl p-3 space-y-2">
                <span className="font-bold text-indigo-900 block">Add Another Job</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Job 3 or Consulting"
                    value={newJobName}
                    onChange={e => setNewJobName(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Rate ($)"
                    value={newJobRate}
                    onChange={e => setNewJobRate(e.target.value)}
                    className="w-20 px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewJob}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveJobConfig}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  Save Device Job Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
