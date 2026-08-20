import React, { useState } from 'react';
import {
  AlertTriangle,
  PhoneCall,
  MapPin,
  X,
  Radio,
  ShieldAlert,
  Hospital,
  Droplet,
  User,
  CheckCircle2,
  Navigation,
  FileText
} from 'lucide-react';
import { UserProfile } from '../../types';

interface EmergencyHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile;
  profile?: UserProfile;
}

export const EmergencyHubModal: React.FC<EmergencyHubModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  profile,
}) => {
  const currentProfile = userProfile || profile || {
    id: 'u1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@health.in',
    phone: '+91 98765 43210',
    role: 'patient',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Dust Mites'],
    chronicConditions: ['Mild Asthma'],
    emergencyContactName: 'Pooja Sharma',
    emergencyContactPhone: '+91 98765 12345',
    isEmergencySharingEnabled: true,
  };
  const safeProfile = {
    ...currentProfile,
    allergies: currentProfile.allergies || [],
    chronicConditions: currentProfile.chronicConditions || [],
  };

  const [sosSent, setSosSent] = useState(false);
  const [activeTab, setActiveTab] = useState<'sos' | 'firstaid' | 'id'>('sos');

  if (!isOpen) return null;

  const handleTriggerSOS = () => {
    setSosSent(true);
    setTimeout(() => {
      // simulate broadcast complete
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-rose-200 dark:border-rose-900 overflow-hidden relative">
        
        {/* Emergency Red Header */}
        <div className="p-5 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 text-white animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">EMERGENCY SERVICES HUB</h2>
              <p className="text-xs text-rose-100">Instant One-Touch SOS & Dispatch</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Subtab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('sos')}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'sos'
                ? 'border-b-2 border-rose-600 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            One-Touch SOS & Calls
          </button>
          <button
            onClick={() => setActiveTab('firstaid')}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'firstaid'
                ? 'border-b-2 border-rose-600 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            First Aid & Poison Control
          </button>
          <button
            onClick={() => setActiveTab('id')}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === 'id'
                ? 'border-b-2 border-rose-600 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Emergency Medical Card
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {activeTab === 'sos' ? (
            <div className="space-y-6">

              {/* Huge One-Touch SOS Broadcast Button */}
              <div className="text-center space-y-3">
                {sosSent ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 font-bold text-xs space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h3 className="text-sm">SOS Broadcast & Location Dispatched!</h3>
                    <p className="font-normal text-[11px]">
                      GPS Coordinates sent to Emergency Contacts ({safeProfile.emergencyContactPhone}) and KGMU Emergency Dispatch Lucknow.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleTriggerSOS}
                    className="w-full py-6 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-black text-lg shadow-xl shadow-rose-600/30 transition-all transform hover:scale-[1.01] flex flex-col items-center justify-center gap-1"
                  >
                    <Radio className="w-8 h-8 animate-ping mb-1" />
                    <span>TRIGGER EMERGENCY SOS BROADCAST</span>
                    <span className="text-xs font-normal text-rose-200">
                      Dispatches live GPS & notifies emergency contacts instantly
                    </span>
                  </button>
                )}
              </div>

              {/* Direct Hotlines Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="tel:108"
                  className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between text-rose-900 dark:text-rose-200 hover:bg-rose-100 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-sm block">108 UP Health & Ambulance</span>
                    <span className="text-[11px] opacity-80">Free 24/7 ALS Emergency Dispatch</span>
                  </div>
                  <PhoneCall className="w-5 h-5 text-rose-600" />
                </a>

                <a
                  href="tel:1800116117"
                  className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-sm block">National Poison Hotline</span>
                    <span className="text-[11px] opacity-80">1800-11-6117 (AIIMS & UP)</span>
                  </div>
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                </a>

                <a
                  href={`tel:${safeProfile.emergencyContactPhone}`}
                  className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between text-blue-900 dark:text-blue-200 hover:bg-blue-100 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-sm block">Family Emergency Contact</span>
                    <span className="text-[11px] opacity-80">{safeProfile.emergencyContactName} ({safeProfile.emergencyContactPhone})</span>
                  </div>
                  <User className="w-5 h-5 text-blue-600" />
                </a>

                <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-between text-teal-900 dark:text-teal-200">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-sm block">Nearest ER Hospital</span>
                    <span className="text-[11px] opacity-80">KGMU Emergency, Lucknow (1.8 km)</span>
                  </div>
                  <Navigation className="w-5 h-5 text-teal-600" />
                </div>
              </div>

            </div>
          ) : activeTab === 'firstaid' ? (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Emergency First Aid Instructions</h3>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-bold text-rose-600">CPR & Severe Respiratory Distress</h4>
                <p className="text-slate-600 dark:text-slate-300">
                  1. Call 911 immediately. 2. Place hands in center of chest and push hard and fast at 100-120 beats per minute. 3. Ensure clear airway.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-bold text-amber-600">Poison Ingestion First Aid</h4>
                <p className="text-slate-600 dark:text-slate-300">
                  1. Do NOT induce vomiting unless instructed by Poison Control (1-800-222-1222). 2. Keep the container or medicine bottle ready for reference.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Emergency Medical ID Card</h3>

              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-extrabold text-base">{safeProfile.name}</h4>
                    <p className="text-xs text-slate-400">Age: {safeProfile.age || '32'} • Gender: {safeProfile.gender || 'Male'}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-extrabold text-xs">
                    Blood Group: {safeProfile.bloodGroup}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Known Allergies</span>
                    <span className="font-bold text-amber-300">{safeProfile.allergies.join(', ') || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Chronic Conditions</span>
                    <span className="font-bold text-teal-300">{safeProfile.chronicConditions.join(', ') || 'None'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Emergency Contact: {safeProfile.emergencyContactName}</span>
                  <span className="font-bold text-white">{safeProfile.emergencyContactPhone}</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
