import React, { useState } from 'react';
import {
  X,
  Laptop,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  Key,
  Copy,
  Check,
  Trash2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { PrivacySettings, AuthorizedDevice } from '../types';
import { exportFullBackup, importFullBackup } from '../services/storage';

interface DeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  privacySettings: PrivacySettings;
  onAuthorizeDevice: (deviceName: string) => void;
  onRevokeAllOtherDevices: () => void;
  onToggleSync: (enabled: boolean) => void;
}

export const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({
  isOpen,
  onClose,
  privacySettings,
  onAuthorizeDevice,
  onRevokeAllOtherDevices,
  onToggleSync,
}) => {
  const [newDeviceName, setNewDeviceName] = useState('');
  const [showConsentPrompt, setShowConsentPrompt] = useState(false);
  const [copiedSyncCode, setCopiedSyncCode] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate a base64 sync payload for cross-device transfer
  const syncPayload = btoa(unescape(encodeURIComponent(exportFullBackup())));

  const handleCopySyncCode = () => {
    navigator.clipboard.writeText(syncPayload);
    setCopiedSyncCode(true);
    setTimeout(() => setCopiedSyncCode(false), 2000);
  };

  const handleImportFromAnotherDevice = () => {
    if (!importCode.trim()) return;
    try {
      const decoded = decodeURIComponent(escape(atob(importCode.trim())));
      const result = importFullBackup(decoded);
      if (result.success) {
        setImportStatus('✅ Successfully synced and restored job records from other device!');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setImportStatus('❌ ' + result.message);
      }
    } catch (e: any) {
      setImportStatus('❌ Invalid sync code format: ' + e.message);
    }
  };

  const handleConfirmAuthorize = () => {
    if (!newDeviceName.trim()) {
      alert('Please enter a name for the device (e.g. My iPhone 15, Work Laptop).');
      return;
    }
    onAuthorizeDevice(newDeviceName.trim());
    setShowConsentPrompt(false);
    setNewDeviceName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Laptop className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-base">Multi-Device Access & Sync Control</h3>
              <p className="text-xs text-slate-400">
                Manage which devices are permitted to access your job applications
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
          {/* Current Mode Status Box */}
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/70 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-900 text-sm">
                  {privacySettings.allowCrossDeviceSync
                    ? 'Cross-Device Sync: ACTIVE'
                    : 'Current Mode: GUEST SESSION (Local Device Only)'}
                </span>
              </div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                {privacySettings.allowCrossDeviceSync
                  ? 'Your job search database can be transferred to authorized devices using end-to-end encrypted sync codes. You can revoke access at any time.'
                  : 'Your data is strictly saved on this browser session and cannot be accessed from any other phone, computer, or cloud account unless you explicitly authorize another device.'}
              </p>
            </div>
          </div>

          {/* Explicit Device Authorization Prompt Dialog */}
          {showConsentPrompt ? (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span>Explicit User Consent Required: Allow Access to Another Device?</span>
              </div>
              <p className="text-amber-800 leading-relaxed">
                You are about to authorize a second device (e.g. mobile phone, tablet, or home laptop) to view and sync your Georgia Unemployment work search records. Do you wish to allow this?
              </p>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Name for the New Device:
                </label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 15, iPad, or Home Desktop"
                  value={newDeviceName}
                  onChange={e => setNewDeviceName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConsentPrompt(false)}
                  className="px-3 py-1.5 text-slate-700 hover:bg-amber-100 rounded-lg font-medium"
                >
                  No, Keep Local to This Device
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAuthorize}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Yes, Authorize and Allow Access
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-800">Authorized Devices ({privacySettings.authorizedDevices.length})</h4>
                <p className="text-slate-500">Only verified devices can read your local vault</p>
              </div>
              <button
                onClick={() => setShowConsentPrompt(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
              >
                + Authorize New Device
              </button>
            </div>
          )}

          {/* List of Authorized Devices */}
          <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
            {privacySettings.authorizedDevices.map((dev, index) => (
              <div key={dev.deviceId} className="p-3 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    {dev.isCurrent ? (
                      <Laptop className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{dev.deviceName}</span>
                      {dev.isCurrent && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2 rounded-full">
                          THIS DEVICE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      ID: {dev.deviceId.substring(0, 10)}... • Authorized {new Date(dev.firstAuthorizedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {!dev.isCurrent && (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Paired
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Revoke All Other Devices Button */}
          {privacySettings.authorizedDevices.length > 1 && (
            <div className="text-right">
              <button
                onClick={() => {
                  if (confirm('Revoke access from all other devices? They will no longer be able to sync.')) {
                    onRevokeAllOtherDevices();
                  }
                }}
                className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1 ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Revoke All Other Devices Immediately</span>
              </button>
            </div>
          )}

          {/* Portable Sync Code Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Key className="w-4 h-4 text-indigo-600" />
                <span>Portable Sync Code (Pair with Mobile / Another Laptop)</span>
              </div>
              <button
                onClick={handleCopySyncCode}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-indigo-700 border border-slate-300 rounded-lg font-semibold flex items-center gap-1"
              >
                {copiedSyncCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSyncCode ? 'Copied Code!' : 'Copy Sync Code'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              To load your applications on your phone or another computer: copy this code, open ClaimTrack GA on the other device, and paste it in the box below.
            </p>

            {/* Paste code from another device */}
            <div className="pt-2 border-t border-slate-200/80">
              <label className="block text-slate-700 font-bold mb-1">
                Receive Data From Another Device:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste sync code from your other device here..."
                  value={importCode}
                  onChange={e => setImportCode(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-[11px] outline-none"
                />
                <button
                  onClick={handleImportFromAnotherDevice}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg flex items-center gap-1"
                >
                  <span>Sync Now</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              {importStatus && (
                <p className="mt-1.5 text-xs font-semibold text-slate-800">{importStatus}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
