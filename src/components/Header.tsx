import React, { useState } from 'react';
import {
  Briefcase,
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  Printer,
  Download,
  Upload,
  Plus,
  Laptop,
  FileSpreadsheet,
  CheckCheck,
  SlidersHorizontal,
  MapPin
} from 'lucide-react';
import { PrivacySettings, AppPreferences } from '../types';
import { US_STATES } from '../utils/date';

interface HeaderProps {
  preferences: AppPreferences;
  onUpdatePreferences: (prefs: AppPreferences) => void;
  privacySettings: PrivacySettings;
  activeTab: 'jobs' | 'weekly' | 'earnings';
  setActiveTab: (tab: 'jobs' | 'weekly' | 'earnings') => void;
  onOpenNewJob: () => void;
  onOpenPrint: () => void;
  onOpenPrivacy: () => void;
  onOpenDeviceSync: () => void;
  onOpenVault: () => void;
  isVaultUnlocked: boolean;
  hasMasterPasscode: boolean;
  totalJobs: number;
  totalInterviews: number;
  totalOffers: number;
  totalDenied: number;
  onExportCsv: () => void;
  onExportJson: () => void;
  onImportClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  preferences,
  onUpdatePreferences,
  privacySettings,
  activeTab,
  setActiveTab,
  onOpenNewJob,
  onOpenPrint,
  onOpenPrivacy,
  onOpenDeviceSync,
  onOpenVault,
  isVaultUnlocked,
  hasMasterPasscode,
  totalJobs,
  totalInterviews,
  totalOffers,
  totalDenied,
  onExportCsv,
  onExportJson,
  onImportClick,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const toggleClaimsMode = () => {
    onUpdatePreferences({
      ...preferences,
      unemploymentClaimsMode: !preferences.unemploymentClaimsMode,
    });
  };

  const handleStateChange = (stateCode: string) => {
    onUpdatePreferences({
      ...preferences,
      selectedState: stateCode,
    });
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      {/* Top Utility Bar (Clean, non-AI styling) */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-slate-400">
            {privacySettings.allowCrossDeviceSync ? 'Sync: Enabled' : 'Mode: Local Device Only'}
          </span>
          <span className="text-slate-600">|</span>
          <button
            onClick={onOpenDeviceSync}
            className="hover:text-white transition-colors text-slate-300 underline-offset-2 hover:underline"
          >
            {privacySettings.allowCrossDeviceSync ? 'Manage Devices' : 'Sync to Device'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* State Selector */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">State:</span>
            <select
              value={preferences.selectedState}
              onChange={e => handleStateChange(e.target.value)}
              className="bg-slate-800 text-slate-200 rounded px-1.5 py-0.5 border border-slate-700 text-xs focus:outline-none cursor-pointer"
            >
              {US_STATES.map(s => (
                <option key={s.code} value={s.code}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-600">|</span>

          {/* Vault Lock / Unlock */}
          <button
            onClick={onOpenVault}
            className="hover:text-white flex items-center gap-1 transition-colors text-slate-300"
            title="Portal Passwords Vault"
          >
            {isVaultUnlocked ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Unlock className="w-3.5 h-3.5" /> Vault Open
              </span>
            ) : hasMasterPasscode ? (
              <span className="flex items-center gap-1 text-amber-300">
                <Lock className="w-3.5 h-3.5" /> Vault Locked
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-300">
                <Lock className="w-3.5 h-3.5" /> Set Vault PIN
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Clean Short Description */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white flex-shrink-0">
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">JobLog</h1>
              <span className="text-xs text-slate-500 font-medium">— Job Application Tracker</span>
            </div>
          </div>
        </div>

        {/* Middle: Unemployment Reporting Mode Persistent Toggle */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs self-start md:self-center">
          <span className="text-slate-600 font-medium">Claims Reporting:</span>
          <button
            type="button"
            onClick={toggleClaimsMode}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              preferences.unemploymentClaimsMode ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
            title="Toggle between weekly unemployment claims view and standard job search view"
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                preferences.unemploymentClaimsMode ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="font-semibold text-slate-700">
            {preferences.unemploymentClaimsMode ? `${preferences.selectedState} Weekly Claims ON` : 'OFF'}
          </span>
        </div>

        {/* Actions Button Bar */}
        <div className="flex items-center flex-wrap gap-2">
          {preferences.unemploymentClaimsMode && (
            <button
              onClick={onOpenPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-2xs"
              title="Print official work search log"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Log</span>
            </button>
          )}

          {/* Export / Data */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Data</span>
            </button>

            {showExportMenu && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 text-xs"
                onMouseLeave={() => setShowExportMenu(false)}
              >
                <button
                  onClick={() => {
                    onExportCsv();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => {
                    onExportJson();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Download className="w-4 h-4 text-indigo-600" />
                  <span>Export JSON Backup</span>
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={() => {
                    onImportClick();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Upload className="w-4 h-4 text-amber-600" />
                  <span>Restore Backup</span>
                </button>
              </div>
            )}
          </div>

          {/* Privacy */}
          <button
            onClick={onOpenPrivacy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-2xs"
            title="Privacy and device settings"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Privacy</span>
          </button>

          {/* Add Job */}
          <button
            onClick={onOpenNewJob}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Job</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex space-x-1 border-t border-slate-100 overflow-x-auto">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`py-2 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'jobs'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <span>Job Applications</span>
        </button>

        {preferences.unemploymentClaimsMode && (
          <button
            onClick={() => setActiveTab('weekly')}
            className={`py-2 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'weekly'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <span>Weekly Certifications & Confirmations ({preferences.selectedState})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('earnings')}
          className={`py-2 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'earnings'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <span>Earnings</span>
        </button>
      </div>
    </header>
  );
};
