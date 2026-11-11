import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Database,
  Trash2,
  HardDrive,
  Download,
  Upload,
  Check
} from 'lucide-react';
import { PrivacySettings } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PrivacySettings;
  onUpdateSettings: (settings: PrivacySettings) => void;
  totalJobs: number;
  onClearAllData: () => void;
  onExportBackup: () => void;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  totalJobs,
  onClearAllData,
  onExportBackup,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const handleToggle = (key: keyof PrivacySettings) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">Privacy & Data Governance</h3>
              <p className="text-xs text-slate-400">
                You have 100% control over your unemployment search records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Storage Stat Card */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="font-bold text-slate-800 block">Local Device Storage</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Device ID: {settings.deviceId.substring(0, 12)}...
                </span>
              </div>
            </div>
            <span className="bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full font-bold">
              {totalJobs} Jobs Stored
            </span>
          </div>

          {/* Privacy Toggles */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider text-slate-400">
              Consent & Permissions
            </h4>

            {/* Local Storage Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
              <div>
                <span className="font-bold text-slate-800 block">
                  Local Device Storage (Required)
                </span>
                <p className="text-slate-500 text-[11px]">
                  Persists your applications inside browser localStorage on this device.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.allowLocalStorage}
                disabled
                className="w-4 h-4 text-indigo-600 rounded cursor-not-allowed"
              />
            </div>

            {/* Cross-Device Sync Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
              <div>
                <span className="font-bold text-slate-800 block">
                  Cross-Device Sync (Explicit Opt-In)
                </span>
                <p className="text-slate-500 text-[11px]">
                  Allows pairing with another phone or laptop via encrypted sync code.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('allowCrossDeviceSync')}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  settings.allowCrossDeviceSync ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    settings.allowCrossDeviceSync ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Anonymous Metrics (Disabled) */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
              <div>
                <span className="font-bold text-slate-800 block">
                  Anonymous Crash Reporting (Opt-In)
                </span>
                <p className="text-slate-500 text-[11px]">
                  Send anonymous error codes to improve reliability. Off by default.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('allowAnonymousMetrics')}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  settings.allowAnonymousMetrics ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    settings.allowAnonymousMetrics ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Data Portability & Danger Zone */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider text-slate-400">
              Data Management
            </h4>

            <div className="flex items-center justify-between">
              <button
                onClick={onExportBackup}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Backup</span>
              </button>

              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-semibold flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Local Data</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showClearConfirm}
        title="Clear All Local Data"
        message="Are you sure you want to delete all stored jobs and records from this browser? Please make sure you have exported a backup JSON first."
        confirmLabel="Clear All Data"
        confirmVariant="danger"
        onConfirm={() => {
          onClearAllData();
          onClose();
        }}
        onClose={() => setShowClearConfirm(false)}
      />
    </div>
  );
};
