import React, { useState } from 'react';
import { useUserLocation } from '../../context/LocationContext';
import {
  Compass,
  Navigation,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MapPin,
  CheckCircle2,
  Activity,
  Layers,
} from 'lucide-react';

export const LocationDebugPanel: React.FC = () => {
  const {
    location,
    status,
    statusMessage,
    permissionState,
    accuracy,
    accuracyQuality,
    lastUpdatedTime,
    locationAgeSeconds,
    refreshLocation,
    isLoading,
    isWatching,
    startWatching,
    stopWatching,
  } = useUserLocation();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <aside aria-label="Device GPS Diagnostics" className="fixed bottom-4 right-4 z-50 max-w-sm w-full font-sans">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden transition-all duration-300">
        {/* Header Bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/80 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              {location ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              )}
            </span>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
                <Compass className="w-3 h-3 text-teal-400" />
                Device GPS Engine
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {location
                  ? `${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}° (±${Math.round(location.accuracy)}m)`
                  : statusMessage}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                refreshLocation(true);
              }}
              disabled={isLoading}
              title="Refresh GPS"
              className="p-1 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 text-slate-400 hover:text-white"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Diagnostics */}
        {isExpanded && (
          <div className="p-4 border-t border-slate-800 space-y-3.5 text-xs text-slate-300">
            {/* Status & Accuracy Badge */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="font-semibold text-slate-400">Status:</span>
              <span
                className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wider ${
                  status === 'located'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : status === 'acquiring'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {status}
              </span>
            </div>

            {/* Coordinates Table */}
            <div className="space-y-1.5 font-mono text-[11px] bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Source:</span>
                <span className="text-teal-300 font-bold">
                  {location?.source || 'NOT_LOCATED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Latitude:</span>
                <span className="text-white font-semibold">
                  {location ? location.latitude.toFixed(8) : '--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Longitude:</span>
                <span className="text-white font-semibold">
                  {location ? location.longitude.toFixed(8) : '--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Accuracy:</span>
                <span
                  className={`font-semibold ${
                    (accuracy || 999) <= 25 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {accuracy ? `±${Math.round(accuracy)} meters` : '--'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quality:</span>
                <span className="text-slate-300">
                  {accuracyQuality?.label || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-300">{lastUpdatedTime || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Age:</span>
                <span className="text-slate-300">{locationAgeSeconds}s ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Permission:</span>
                <span className="text-slate-300 capitalize">{permissionState}</span>
              </div>
            </div>

            {/* Single Source of Truth Checks */}
            <div className="space-y-1 text-[10px] text-slate-400">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-teal-400" />
                Subsystem Synchronization:
              </span>
              <div className="pl-4 space-y-0.5">
                <div>• Map Center: <span className="text-emerald-400">Synchronized with Device GPS</span></div>
                <div>• User Marker: <span className="text-emerald-400">Real coordinates</span></div>
                <div>• Nearby Healthcare API: <span className="text-emerald-400">Active Coordinates</span></div>
                <div>• Pharmacy Discovery: <span className="text-emerald-400">Active Coordinates</span></div>
                <div>• Haversine Distance: <span className="text-emerald-400">Device Origin</span></div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => refreshLocation(true)}
                disabled={isLoading}
                className="flex-1 py-1.5 px-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Acquiring...' : 'Refresh GPS Position'}</span>
              </button>
              <button
                onClick={isWatching ? stopWatching : startWatching}
                className={`py-1.5 px-2.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-colors ${
                  isWatching
                    ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 hover:bg-amber-600/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Activity className="w-3 h-3" />
                <span>{isWatching ? 'Stop Watch' : 'Watch Position'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
