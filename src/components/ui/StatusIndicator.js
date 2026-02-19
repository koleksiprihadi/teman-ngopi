// src/components/ui/StatusIndicator.js
'use client';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { syncAll } from '@/lib/sync/syncManager';

export default function StatusIndicator() {
  const { isOnline, syncStatus, pendingCount, storage } = useOnlineStatus();

  const statusConfig = {
    synced: {
      dot: 'bg-emerald-400',
      text: 'Tersinkron',
      icon: '✅',
      color: 'text-emerald-300',
      glow: 'shadow-emerald-400/50',
    },
    syncing: {
      dot: 'bg-amber-400 animate-pulse',
      text: 'Menyinkron...',
      icon: '🔄',
      color: 'text-amber-300',
      glow: 'shadow-amber-400/50',
    },
    error: {
      dot: 'bg-red-400',
      text: 'Gagal Sinkron',
      icon: '⚠️',
      color: 'text-red-300',
      glow: 'shadow-red-400/50',
    },
    offline: {
      dot: 'bg-gray-400',
      text: 'Offline',
      icon: '📡',
      color: 'text-gray-300',
      glow: 'shadow-gray-400/50',
    },
  };

  const config = statusConfig[isOnline ? syncStatus : 'offline'];

  return (
    <div className="flex items-center gap-3">
      {/* Connection + Sync Status */}
      <button
        onClick={() => isOnline && syncAll()}
        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 transition-all cursor-pointer"
        title={pendingCount > 0 ? `${pendingCount} data belum tersinkron` : 'Klik untuk sinkron'}
      >
        <span className={`w-2 h-2 rounded-full ${config.dot} shadow-lg ${config.glow}`} />
        <span className={`text-xs font-medium ${config.color} hidden sm:block`}>
          {isOnline ? (syncStatus === 'synced' ? '🟢 Online' : config.icon) : '🔴 Offline'}
        </span>
        {pendingCount > 0 && (
          <span className="bg-amber-400 text-amber-900 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {pendingCount}
          </span>
        )}
      </button>

      {/* Storage indicator */}
      {storage.quota > 0 && (
        <div className="hidden md:flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="text-xs text-white/60">
              💾 {storage.usageStr} / {storage.quotaStr}
            </span>
            <div className="w-20 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  storage.percentage > 80 ? 'bg-red-400' :
                  storage.percentage > 60 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(storage.percentage, 100)}%` }}
              />
            </div>
          </div>
          {storage.percentage > 80 && (
            <span className="text-amber-300 text-xs animate-pulse">⚠️</span>
          )}
        </div>
      )}
    </div>
  );
}
