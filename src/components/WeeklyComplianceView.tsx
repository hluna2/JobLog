import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  Scale,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileText
} from 'lucide-react';
import {
  JobApplication,
  WeeklySummaryLog,
  WeeklyConfirmationRecord,
  AppealRecord
} from '../types';
import { ConfirmModal } from './ConfirmModal';

interface WeeklyComplianceViewProps {
  jobs: JobApplication[];
  weeklySummaries: WeeklySummaryLog[];
  confirmations: WeeklyConfirmationRecord[];
  appeals: AppealRecord[];
  selectedState: string;
  onAddConfirmation: (record: WeeklyConfirmationRecord) => void;
  onUpdateConfirmation: (record: WeeklyConfirmationRecord) => void;
  onDeleteConfirmation: (id: string) => void;
  onAddAppeal: (record: AppealRecord) => void;
  onUpdateAppeal: (record: AppealRecord) => void;
  onDeleteAppeal: (id: string) => void;
  onAddWeeklySummary: (summary: WeeklySummaryLog) => void;
  onUpdateWeeklySummary: (summary: WeeklySummaryLog) => void;
  onDeleteWeeklySummary: (id: string) => void;
}

export const WeeklyComplianceView: React.FC<WeeklyComplianceViewProps> = ({
  jobs,
  weeklySummaries,
  confirmations,
  appeals,
  selectedState,
  onAddConfirmation,
  onUpdateConfirmation,
  onDeleteConfirmation,
  onAddAppeal,
  onUpdateAppeal,
  onDeleteAppeal,
  onAddWeeklySummary,
  onUpdateWeeklySummary,
  onDeleteWeeklySummary,
}) => {
  // 1. Weekly Confirmation Numbers Modal State
  const [showConfModal, setShowConfModal] = useState(false);
  const [editingConf, setEditingConf] = useState<WeeklyConfirmationRecord | null>(null);
  const [confWeekEnding, setConfWeekEnding] = useState('');
  const [confNum, setConfNum] = useState('');
  const [confNotes, setConfNotes] = useState('');

  // 2. Appeals & Hearings Modal State (Separate Table!)
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [editingAppeal, setEditingAppeal] = useState<AppealRecord | null>(null);
  const [appealDate, setAppealDate] = useState('');
  const [appealConfNum, setAppealConfNum] = useState('');
  const [appealCourt, setAppealCourt] = useState('');
  const [appealRelatedWeek, setAppealRelatedWeek] = useState('');
  const [appealNotes, setAppealNotes] = useState('');

  // 3. Weekly Activity Modal State
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<WeeklySummaryLog | null>(null);
  const [actWeekStart, setActWeekStart] = useState('');
  const [actApps, setActApps] = useState('3');
  const [actInterviews, setActInterviews] = useState('0');
  const [actNet, setActNet] = useState('0');
  const [actFollowups, setActFollowups] = useState('0');
  const [actNotes, setActNotes] = useState('');

  // Delete Confirmation Modal States
  const [confToDelete, setConfToDelete] = useState<WeeklyConfirmationRecord | null>(null);
  const [appealToDelete, setAppealToDelete] = useState<AppealRecord | null>(null);
  const [actToDelete, setActToDelete] = useState<WeeklySummaryLog | null>(null);
  const [showCleanEmptyModal, setShowCleanEmptyModal] = useState(false);

  // Show all vs show last 5 state
  const [showAllConfirmations, setShowAllConfirmations] = useState(false);
  const [showAllAppeals, setShowAllAppeals] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);

  // Scroll container refs to auto-scroll to bottom on "Show All"
  const confScrollRef = useRef<HTMLDivElement>(null);
  const appealScrollRef = useRef<HTMLDivElement>(null);
  const actScrollRef = useRef<HTMLDivElement>(null);

  // Count empty/placeholder rows in weekly activity
  const emptyRows = weeklySummaries.filter(
    w =>
      !w.weekStart ||
      (!w.notes &&
        (w.applicationsSent || 0) +
          (w.interviews || 0) +
          (w.networkingContacts || 0) +
          (w.followupsDone || 0) ===
          0)
  );
  const emptyRowsCount = emptyRows.length;

  const handleCleanEmptyRows = () => {
    emptyRows.forEach(w => onDeleteWeeklySummary(w.id));
    setShowCleanEmptyModal(false);
  };

  // Sort confirmations oldest to most recent (ascending order)
  const sortedConfirmations = [...confirmations].sort(
    (a, b) => new Date(a.weekEnding).getTime() - new Date(b.weekEnding).getTime()
  );

  const displayedConfirmations = showAllConfirmations
    ? sortedConfirmations
    : sortedConfirmations.slice(-5);

  // Sort appeals oldest to most recent (ascending order)
  const sortedAppeals = [...appeals].sort(
    (a, b) => new Date(a.appealDate || '1970-01-01').getTime() - new Date(b.appealDate || '1970-01-01').getTime()
  );

  const displayedAppeals = showAllAppeals
    ? sortedAppeals
    : sortedAppeals.slice(-5);

  // Sort weekly activity oldest to most recent (ascending order)
  const sortedWeekly = [...weeklySummaries].sort(
    (a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
  );

  const displayedWeekly = showAllActivity
    ? sortedWeekly
    : sortedWeekly.slice(-5);

  // Auto-scroll to bottom on Show All
  useEffect(() => {
    if (showAllConfirmations && confScrollRef.current) {
      confScrollRef.current.scrollTop = confScrollRef.current.scrollHeight;
    }
  }, [showAllConfirmations]);

  useEffect(() => {
    if (showAllAppeals && appealScrollRef.current) {
      appealScrollRef.current.scrollTop = appealScrollRef.current.scrollHeight;
    }
  }, [showAllAppeals]);

  useEffect(() => {
    if (showAllActivity && actScrollRef.current) {
      actScrollRef.current.scrollTop = actScrollRef.current.scrollHeight;
    }
  }, [showAllActivity]);

  // Confirmation Handlers
  const handleOpenAddConf = () => {
    setEditingConf(null);
    setConfWeekEnding('');
    setConfNum('');
    setConfNotes('');
    setShowConfModal(true);
  };

  const handleOpenEditConf = (record: WeeklyConfirmationRecord) => {
    setEditingConf(record);
    setConfWeekEnding(record.weekEnding);
    setConfNum(record.confirmationNumber);
    setConfNotes(record.notes || '');
    setShowConfModal(true);
  };

  const handleSaveConf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confWeekEnding || !confNum) {
      alert('Please provide week ending date and confirmation number.');
      return;
    }

    if (editingConf) {
      onUpdateConfirmation({
        ...editingConf,
        weekEnding: confWeekEnding,
        confirmationNumber: confNum,
        notes: confNotes || undefined,
      });
    } else {
      onAddConfirmation({
        id: 'conf-' + Math.random().toString(36).substring(2, 9),
        weekEnding: confWeekEnding,
        confirmationNumber: confNum,
        notes: confNotes || undefined,
      });
    }
    setShowConfModal(false);
  };

  // Appeal Handlers (Separate Table!)
  const handleOpenAddAppeal = () => {
    setEditingAppeal(null);
    setAppealDate('');
    setAppealConfNum('');
    setAppealCourt('Appeals Tribunal');
    setAppealRelatedWeek('');
    setAppealNotes('');
    setShowAppealModal(true);
  };

  const handleOpenEditAppeal = (record: AppealRecord) => {
    setEditingAppeal(record);
    setAppealDate(record.appealDate);
    setAppealConfNum(record.appealConfirmation);
    setAppealCourt(record.court);
    setAppealRelatedWeek(record.relatedWeekEnding || '');
    setAppealNotes(record.notes || '');
    setShowAppealModal(true);
  };

  const handleSaveAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealDate && !appealConfNum && !appealCourt) {
      alert('Please provide at least an appeal date, confirmation/decision #, or tribunal name.');
      return;
    }

    if (editingAppeal) {
      onUpdateAppeal({
        ...editingAppeal,
        appealDate,
        appealConfirmation: appealConfNum,
        court: appealCourt,
        relatedWeekEnding: appealRelatedWeek || undefined,
        notes: appealNotes || undefined,
      });
    } else {
      onAddAppeal({
        id: 'appeal-' + Math.random().toString(36).substring(2, 9),
        appealDate,
        appealConfirmation: appealConfNum,
        court: appealCourt,
        relatedWeekEnding: appealRelatedWeek || undefined,
        notes: appealNotes || undefined,
      });
    }
    setShowAppealModal(false);
  };

  // Activity Log Handlers
  const handleOpenAddActivity = () => {
    setEditingActivity(null);
    setActWeekStart('');
    setActApps('3');
    setActInterviews('0');
    setActNet('0');
    setActFollowups('0');
    setActNotes('');
    setShowActivityModal(true);
  };

  const handleOpenEditActivity = (summary: WeeklySummaryLog) => {
    setEditingActivity(summary);
    setActWeekStart(summary.weekStart);
    setActApps(summary.applicationsSent.toString());
    setActInterviews((summary.interviews || 0).toString());
    setActNet((summary.networkingContacts || 0).toString());
    setActFollowups((summary.followupsDone || 0).toString());
    setActNotes(summary.notes || '');
    setShowActivityModal(true);
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actWeekStart) {
      alert('Please provide week start date.');
      return;
    }

    const apps = parseInt(actApps, 10) || 0;
    const interviews = parseInt(actInterviews, 10) || 0;
    const net = parseInt(actNet, 10) || 0;
    const followups = parseInt(actFollowups, 10) || 0;

    if (editingActivity) {
      onUpdateWeeklySummary({
        ...editingActivity,
        weekStart: actWeekStart,
        applicationsSent: apps,
        interviews,
        networkingContacts: net,
        followupsDone: followups,
        notes: actNotes,
      });
    } else {
      onAddWeeklySummary({
        id: 'wk-' + Math.random().toString(36).substring(2, 9),
        weekStart: actWeekStart,
        weekEnd: '',
        applicationsSent: apps,
        interviews,
        networkingContacts: net,
        followupsDone: followups,
        notes: actNotes,
      });
    }
    setShowActivityModal(false);
  };

  return (
    <div className="space-y-6">
      {/* State Guidance Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-slate-800 text-slate-300 text-[11px] px-2 py-0.5 rounded font-mono">
                {selectedState} Unemployment
              </span>
              <span className="text-xs text-slate-400">Weekly Work Search & Legal Proof</span>
            </div>
            <h2 className="text-base font-bold text-white">Weekly Certifications & Confirmation Logs</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-0.5">
              Keep your weekly certification numbers, tribunal appeals, and 3-minimum work search records organized for audit verification.
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
              onClick={handleOpenAddConf}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Confirmation #</span>
            </button>

            <button
              onClick={handleOpenAddAppeal}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition border border-slate-700"
            >
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>Record Appeal / Hearing</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Weekly Certification Submission Confirmations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Weekly Submission Confirmation Numbers</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Showing {displayedConfirmations.length} of {sortedConfirmations.length} certification confirmation numbers (Oldest to Newest)
            </p>
          </div>

          <div className="flex items-center gap-2">
            {sortedConfirmations.length > 5 && (
              <button
                onClick={() => setShowAllConfirmations(!showAllConfirmations)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition flex items-center gap-1"
              >
                {showAllConfirmations ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                    <span>Show Last 5 Only</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    <span>Show All ({sortedConfirmations.length}) & Scroll Up</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleOpenAddConf}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 flex items-center gap-1 transition"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Internal Scroll Container */}
        <div
          ref={confScrollRef}
          className={`${
            showAllConfirmations ? 'max-h-[340px] overflow-y-auto' : ''
          } overflow-x-auto`}
        >
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100 z-10">
              <tr className="text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2 px-3 w-8 text-center">#</th>
                <th className="py-2 px-3">Benefit Week Ending</th>
                <th className="py-2 px-3">Confirmation #</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Submission Notes</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedConfirmations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No confirmation records saved yet.
                  </td>
                </tr>
              ) : (
                displayedConfirmations.map((conf, idx) => (
                  <tr key={conf.id} className="hover:bg-slate-50 transition">
                    <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 font-mono font-medium text-slate-800 whitespace-nowrap">
                      {conf.weekEnding}
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {conf.confirmationNumber || 'Pending'}
                      </span>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[11px]">
                        <CheckCircle2 className="w-3 h-3" />
                        Certified
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 max-w-xs truncate">
                      {conf.notes || <span className="text-slate-300 italic">—</span>}
                    </td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditConf(conf)}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition mr-1"
                        title="Edit confirmation record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfToDelete(conf)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                        title="Delete confirmation record"
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

      {/* 2. Appeals, Hearings & Tribunal Records Table (SEPARATE TABLE) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-600" />
              <span>Appeals, Hearings & Tribunal Records</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Showing {displayedAppeals.length} of {sortedAppeals.length} legal & hearing records (Oldest to Newest)
            </p>
          </div>

          <div className="flex items-center gap-2">
            {sortedAppeals.length > 5 && (
              <button
                onClick={() => setShowAllAppeals(!showAllAppeals)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition flex items-center gap-1"
              >
                {showAllAppeals ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                    <span>Show Last 5 Only</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    <span>Show All ({sortedAppeals.length}) & Scroll Up</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleOpenAddAppeal}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 flex items-center gap-1 transition"
            >
              <Plus className="w-3 h-3" />
              <span>Add Appeal</span>
            </button>
          </div>
        </div>

        {/* Internal Scroll Container */}
        <div
          ref={appealScrollRef}
          className={`${
            showAllAppeals ? 'max-h-[300px] overflow-y-auto' : ''
          } overflow-x-auto`}
        >
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100 z-10">
              <tr className="text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2 px-3 w-8 text-center">#</th>
                <th className="py-2 px-3">Appeal Date</th>
                <th className="py-2 px-3">Appeal / Decision #</th>
                <th className="py-2 px-3">Court / Tribunal / Status</th>
                <th className="py-2 px-3">Related Week</th>
                <th className="py-2 px-3">Hearing Notes</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedAppeals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    No appeal or hearing records logged yet.
                  </td>
                </tr>
              ) : (
                displayedAppeals.map((app, idx) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition">
                    <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 font-mono font-medium text-slate-800 whitespace-nowrap">
                      {app.appealDate || <span className="text-slate-400 italic">—</span>}
                    </td>
                    <td className="py-2 px-3 font-mono">
                      {app.appealConfirmation ? (
                        <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {app.appealConfirmation}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {app.court ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          <Scale className="w-3 h-3 text-amber-600" />
                          <span>{app.court}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {app.relatedWeekEnding || '—'}
                    </td>
                    <td className="py-2 px-3 text-slate-600 max-w-xs truncate">
                      {app.notes || <span className="text-slate-300 italic">—</span>}
                    </td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditAppeal(app)}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition mr-1"
                        title="Edit appeal record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setAppealToDelete(app)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                        title="Delete appeal record"
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

      {/* 3. Weekly Activity Log Table with Internal Scrolling & Last 5 filter */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Weekly Work Search Activity Log</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Showing {displayedWeekly.length} of {sortedWeekly.length} weeks (Oldest to Newest) • Minimum 3 qualifying activities/week
            </p>
          </div>

          <div className="flex items-center gap-2">
            {sortedWeekly.length > 5 && (
              <button
                onClick={() => setShowAllActivity(!showAllActivity)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition flex items-center gap-1"
              >
                {showAllActivity ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                    <span>Show Last 5 Only</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    <span>Show All ({sortedWeekly.length}) & Scroll Up</span>
                  </>
                )}
              </button>
            )}

            {emptyRowsCount > 0 && (
              <button
                onClick={() => setShowCleanEmptyModal(true)}
                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 flex items-center gap-1 transition"
                title="Remove empty placeholder weeks"
              >
                <Trash2 className="w-3 h-3 text-rose-600" />
                <span>Remove {emptyRowsCount} Blank {emptyRowsCount === 1 ? 'Week' : 'Weeks'}</span>
              </button>
            )}

            <button
              onClick={handleOpenAddActivity}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 flex items-center gap-1 transition"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Internal Scroll Container */}
        <div
          ref={actScrollRef}
          className={`${
            showAllActivity ? 'max-h-[340px] overflow-y-auto' : ''
          } overflow-x-auto`}
        >
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100 z-10">
              <tr className="text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2 px-3 w-8 text-center">#</th>
                <th className="py-2 px-3">Week Start</th>
                <th className="py-2 px-3 text-center">Apps</th>
                <th className="py-2 px-3 text-center">Interviews</th>
                <th className="py-2 px-3 text-center">Networking</th>
                <th className="py-2 px-3 text-center">Follow-ups</th>
                <th className="py-2 px-3 text-center">Total Activities</th>
                <th className="py-2 px-3">Weekly Notes</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedWeekly.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-400">
                    No weekly activity logs saved yet.
                  </td>
                </tr>
              ) : (
                displayedWeekly.map((ws, idx) => {
                  const apps = ws.applicationsSent || 0;
                  const interviews = ws.interviews || 0;
                  const networking = ws.networkingContacts || 0;
                  const followups = ws.followupsDone || 0;
                  const totalActivities = apps + interviews + networking + followups;
                  const isMet = totalActivities >= 3;
                  const isBlank = !ws.weekStart || (totalActivities === 0 && !ws.notes);

                  return (
                    <tr
                      key={ws.id}
                      className={`hover:bg-slate-50 transition ${
                        isBlank ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-mono font-medium text-slate-800 whitespace-nowrap">
                        {ws.weekStart ? (
                          ws.weekStart
                        ) : (
                          <span className="text-amber-700 italic font-sans text-[11px]">
                            (Blank / Unspecified Week)
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-semibold text-slate-700">
                        {apps}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-slate-700">
                        {interviews}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-slate-600">
                        {networking}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-slate-600">
                        {followups}
                      </td>
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-bold text-xs ${
                            isMet
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-50 text-amber-800 border border-amber-300'
                          }`}
                          title={`Total: ${totalActivities} activities (${apps} apps, ${interviews} interviews, ${networking} networking, ${followups} follow-ups)`}
                        >
                          {totalActivities} / 3 min {isMet ? '✓' : ''}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600 max-w-xs">
                        {ws.notes || <span className="text-slate-300 italic">—</span>}
                      </td>
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditActivity(ws)}
                          className="p-1 text-slate-400 hover:text-indigo-600 transition mr-1"
                          title="Edit activity log"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setActToDelete(ws)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Delete activity log"
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

      {/* Confirmation Add/Edit Modal */}
      {showConfModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingConf ? 'Edit Confirmation Record' : 'Record Weekly Confirmation #'}
              </h3>
              <button
                onClick={() => setShowConfModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConf} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Benefit Week Ending Date *
                </label>
                <input
                  type="date"
                  required
                  value={confWeekEnding}
                  onChange={e => setConfWeekEnding(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Confirmation Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15862489"
                  value={confNum}
                  onChange={e => setConfNum(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Certified on Sunday evening via MyUI"
                  value={confNotes}
                  onChange={e => setConfNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowConfModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg"
                >
                  {editingConf ? 'Save Changes' : 'Save Confirmation #'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appeal Add/Edit Modal (SEPARATE MODAL) */}
      {showAppealModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>{editingAppeal ? 'Edit Appeal / Hearing Record' : 'Record Appeal / Tribunal Hearing'}</span>
              </h3>
              <button
                onClick={() => setShowAppealModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAppeal} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Appeal / Hearing Date
                </label>
                <input
                  type="date"
                  value={appealDate}
                  onChange={e => setAppealDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Appeal Confirmation # / Docket / Decision #
                </label>
                <input
                  type="text"
                  placeholder="e.g. 796054 or Docket #1234"
                  value={appealConfNum}
                  onChange={e => setAppealConfNum(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Court / Tribunal / Status
                </label>
                <input
                  type="text"
                  placeholder="e.g. Appeals Tribunal, Board of Review, Hearing Remand"
                  value={appealCourt}
                  onChange={e => setAppealCourt(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Related Benefit Week Ending Date (Optional)
                </label>
                <input
                  type="date"
                  value={appealRelatedWeek}
                  onChange={e => setAppealRelatedWeek(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Hearing Notes / Decision Details</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Hearing scheduled with Administrative Hearing Officer"
                  value={appealNotes}
                  onChange={e => setAppealNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAppealModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg"
                >
                  {editingAppeal ? 'Save Changes' : 'Save Appeal Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Weekly Activity Add/Edit Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingActivity ? 'Edit Weekly Activity' : 'Add Weekly Activity Log'}
              </h3>
              <button
                onClick={() => setShowActivityModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Week Start Date (Sunday) *
                </label>
                <input
                  type="date"
                  required
                  value={actWeekStart}
                  onChange={e => setActWeekStart(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Applications Sent *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={actApps}
                    onChange={e => setActApps(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Interviews</label>
                  <input
                    type="number"
                    min="0"
                    value={actInterviews}
                    onChange={e => setActInterviews(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Networking Contacts
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={actNet}
                    onChange={e => setActNet(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Follow-ups</label>
                  <input
                    type="number"
                    min="0"
                    value={actFollowups}
                    onChange={e => setActFollowups(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Weekly Notes</label>
                <textarea
                  rows={2}
                  value={actNotes}
                  onChange={e => setActNotes(e.target.value)}
                  placeholder="e.g. Attended career fair, updated resume"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg"
                >
                  {editingActivity ? 'Save Changes' : 'Save Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Deletion Modal */}
      <ConfirmModal
        isOpen={!!confToDelete}
        title="Delete Confirmation Record"
        message={
          <span>
            Are you sure you want to delete the confirmation record for week ending{' '}
            <strong>{confToDelete?.weekEnding}</strong> (Conf #{confToDelete?.confirmationNumber})?
          </span>
        }
        confirmLabel="Delete Confirmation"
        confirmVariant="danger"
        onConfirm={() => {
          if (confToDelete) {
            onDeleteConfirmation(confToDelete.id);
            setConfToDelete(null);
          }
        }}
        onClose={() => setConfToDelete(null)}
      />

      {/* Appeal Deletion Modal */}
      <ConfirmModal
        isOpen={!!appealToDelete}
        title="Delete Appeal Record"
        message={
          <span>
            Are you sure you want to delete the appeal record for{' '}
            <strong>{appealToDelete?.court || 'Tribunal'}</strong> (Date: {appealToDelete?.appealDate || 'N/A'}, Conf/Decision #{appealToDelete?.appealConfirmation || 'N/A'})?
          </span>
        }
        confirmLabel="Delete Appeal"
        confirmVariant="danger"
        onConfirm={() => {
          if (appealToDelete) {
            onDeleteAppeal(appealToDelete.id);
            setAppealToDelete(null);
          }
        }}
        onClose={() => setAppealToDelete(null)}
      />

      {/* Activity Log Deletion Modal */}
      <ConfirmModal
        isOpen={!!actToDelete}
        title="Delete Weekly Activity Log"
        message={
          <span>
            Are you sure you want to delete the activity log for week starting{' '}
            <strong>{actToDelete?.weekStart || 'Unspecified'}</strong>?
          </span>
        }
        confirmLabel="Delete Log"
        confirmVariant="danger"
        onConfirm={() => {
          if (actToDelete) {
            onDeleteWeeklySummary(actToDelete.id);
            setActToDelete(null);
          }
        }}
        onClose={() => setActToDelete(null)}
      />

      {/* Clean Up All Empty Placeholder Rows Modal */}
      <ConfirmModal
        isOpen={showCleanEmptyModal}
        title="Remove All Blank Placeholder Weeks"
        message={
          <span>
            Are you sure you want to delete <strong>{emptyRowsCount} blank/empty placeholder weeks</strong> from your log?
            <br />
            <br />
            <span className="text-slate-500">
              Only weeks that have 0 applications, 0 interviews, 0 networking contacts, 0 follow-ups, and no notes will be removed. All valid entries remain untouched.
            </span>
          </span>
        }
        confirmLabel={`Delete ${emptyRowsCount} Blank ${emptyRowsCount === 1 ? 'Week' : 'Weeks'}`}
        confirmVariant="danger"
        onConfirm={handleCleanEmptyRows}
        onClose={() => setShowCleanEmptyModal(false)}
      />
    </div>
  );
};
