import React, { useState } from 'react';
import { X, Lock, Unlock, Key, ShieldCheck, AlertCircle } from 'lucide-react';

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasMasterPasscode: boolean;
  isUnlocked: boolean;
  onSetPasscode: (passcode: string) => void;
  onUnlockVault: (passcode: string) => boolean;
  onLockVault: () => void;
}

export const VaultModal: React.FC<VaultModalProps> = ({
  isOpen,
  onClose,
  hasMasterPasscode,
  isUnlocked,
  onSetPasscode,
  onUnlockVault,
  onLockVault,
}) => {
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.length < 4) {
      setError('Master Passcode must be at least 4 characters.');
      return;
    }
    if (passcode !== confirmPasscode) {
      setError('Passcodes do not match.');
      return;
    }
    onSetPasscode(passcode);
    setError(null);
    setPasscode('');
    setConfirmPasscode('');
    onClose();
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onUnlockVault(passcode);
    if (success) {
      setError(null);
      setPasscode('');
      onClose();
    } else {
      setError('Incorrect master passcode. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">Portal Credentials Vault Security</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Zero-Knowledge AES-256 Encryption</span>
              <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
                Saved passwords for employer portals (Workday, Taleo, etc.) are encrypted on your device using PBKDF2 and AES-256-GCM. Antigravity or any server cannot read them without your Master Passcode.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!hasMasterPasscode ? (
            /* Setup New Passcode */
            <form onSubmit={handleSetup} className="space-y-3">
              <p className="text-slate-600 leading-relaxed">
                Choose a Master Passcode / PIN to lock and protect employer login passwords on this device:
              </p>
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Create Master Passcode / PIN *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter a secure PIN or password"
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Confirm Passcode *</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter passcode"
                  value={confirmPasscode}
                  onChange={e => setConfirmPasscode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Set Master Passcode
                </button>
              </div>
            </form>
          ) : isUnlocked ? (
            /* Already Unlocked */
            <div className="space-y-4">
              <div className="text-center py-4">
                <Unlock className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">Vault is Currently Unlocked</h4>
                <p className="text-slate-500 mt-1">
                  You can view and copy your stored employer portal credentials.
                </p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    onLockVault();
                    onClose();
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl w-full flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Lock Vault Now</span>
                </button>
              </div>
            </div>
          ) : (
            /* Unlock Vault Form */
            <form onSubmit={handleUnlock} className="space-y-3">
              <p className="text-slate-600">
                Enter your Master Passcode to decrypt and reveal your saved employer portal passwords:
              </p>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Master Passcode *</label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Enter passcode"
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Unlock Vault</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
