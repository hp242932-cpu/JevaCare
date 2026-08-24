import React, { useState } from 'react';
import {
  HeartPulse,
  Pill,
  Clock,
  ScanLine,
  Calendar,
  AlertTriangle,
  Bot,
  FolderLock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Stethoscope,
  Activity,
  Layers,
  Lightbulb,
  FileText,
  ArrowRight,
  Zap,
  MapPin
} from 'lucide-react';
import {
  UserProfile,
  ActiveMedicine,
  Appointment,
  VaultItem,
  RiskAlert,
  Reminder,
  HealthMetricLog,
  EconomicProfile
} from '../../types';
import { LocalHealthAlertsSection } from './LocalHealthAlertsSection';
import { DailyWellnessWisdom } from './DailyWellnessWisdom';
import { AIInsightsWidget } from './AIInsightsWidget';
import { AccessibilityIntelligenceCard } from './AccessibilityIntelligenceCard';
import { OfficialBloodStockCard } from './OfficialBloodStockCard';

interface DashboardProps {
  profile: UserProfile;
  activeMedicines: ActiveMedicine[];
  appointments: Appointment[];
  vaultItems: VaultItem[];
  riskAlerts: RiskAlert[];
  reminders: Reminder[];
  metricLogs?: HealthMetricLog[];
  economicProfile?: EconomicProfile | null;
  setActiveTab: (tab: string) => void;
  onOpenEmergency: () => void;
  onMarkDoseTaken: (medId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  activeMedicines = [],
  appointments = [],
  vaultItems = [],
  riskAlerts = [],
  reminders = [],
  metricLogs = [],
  economicProfile = null,
  setActiveTab,
  onOpenEmergency,
  onMarkDoseTaken,
}) => {
  // Progressive disclosure state for non-essential widgets
  const [showAdditionalInsights, setShowAdditionalInsights] = useState<boolean>(false);
  const [activeInsightTab, setActiveInsightTab] = useState<'wisdom' | 'clinical' | 'alerts' | 'vault'>('wisdom');
  
  const healthScore = 88;
  const safeActiveMedicines = activeMedicines || [];
  const safeAppointments = appointments || [];
  const safeVaultItems = vaultItems || [];
  const safeRiskAlerts = riskAlerts || [];
  const upcomingApps = safeAppointments.filter((a) => a?.status === 'Upcoming');

  // Next prioritized action calculation
  const nextMedicine = safeActiveMedicines[0];
  const nextAppointment = upcomingApps[0];

  return (
    <div className="space-y-6 sm:space-y-8 min-w-0 w-full animate-fade-up">

      {/* =========================================================================
          1. HOW AM I DOING? (Primary Health Status Snapshot & Next Action)
          ========================================================================= */}
      <section className="bg-white dark:bg-[#16241c] border border-[#e6dfd3] dark:border-[#283c2e] rounded-3xl p-6 sm:p-8 shadow-xs transition-colors relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-2.5 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5c5647] dark:text-[#c0b9ad]">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Health Status: Stable & Optimal
              </span>
              <span>•</span>
              <span className="font-bold text-[#1b3b2b] dark:text-white">Score: {healthScore}/100</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif-editorial font-bold text-[#1b3b2b] dark:text-[#f2f0e8] tracking-tight">
              Good day, {profile.name}
            </h1>
            
            <p className="text-sm text-[#5c5647] dark:text-[#c0b9ad] max-w-2xl leading-relaxed">
              Your health vitals are in target range. You have {safeActiveMedicines.length} active routine {safeActiveMedicines.length === 1 ? 'medication' : 'medications'} scheduled today and {safeVaultItems.length} encrypted records in your vault.
            </p>

            {/* Live Vital Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#fcfaf6] dark:bg-[#1f3328] border border-[#e6dfd3] dark:border-[#2b4233] text-[#1b3b2b] dark:text-[#f2f0e8]">
                <Activity className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>BP: <strong>118/76 mmHg</strong></span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#fcfaf6] dark:bg-[#1f3328] border border-[#e6dfd3] dark:border-[#2b4233] text-[#1b3b2b] dark:text-[#f2f0e8]">
                <HeartPulse className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Sugar: <strong>92 mg/dL</strong></span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#fcfaf6] dark:bg-[#1f3328] border border-[#e6dfd3] dark:border-[#2b4233] text-[#1b3b2b] dark:text-[#f2f0e8]">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Adherence: <strong>94% Streak</strong></span>
              </span>
            </div>
          </div>

          {/* Quick Primary Shortcuts */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('scanner')}
              className="px-4 py-2.5 bg-[#1b3b2b] hover:bg-[#244836] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer border border-[#1b3b2b]"
              aria-label="Scan Prescription"
            >
              <ScanLine className="w-4 h-4 text-emerald-300" />
              <span>Scan Prescription</span>
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className="px-4 py-2.5 bg-white dark:bg-[#1e3025] hover:bg-[#f6f2e9] text-[#1b3b2b] dark:text-white text-xs font-bold rounded-xl border border-[#e6dfd3] dark:border-[#2b4233] transition-all flex items-center gap-2 cursor-pointer"
              aria-label="Ask Health Assistant"
            >
              <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Ask Assistant</span>
            </button>

            <button
              onClick={onOpenEmergency}
              className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 transition-all cursor-pointer"
              title="Emergency SOS Hub"
              aria-label="Emergency SOS"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* 2. WHAT SHOULD I DO NEXT? (Contextual Prioritized Action Card) */}
        <div className="mt-6 pt-5 border-t border-[#e6dfd3]/80 dark:border-[#283c2e] bg-[#fcfaf6] dark:bg-[#192b20] -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-5 sm:p-6 rounded-b-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-800 dark:text-emerald-400">
                  Recommended Next Action
                </span>
                <p className="font-bold text-xs sm:text-sm text-[#1b3b2b] dark:text-white">
                  {nextMedicine ? (
                    `Take ${nextMedicine.name} (${nextMedicine.dosage}) — ${nextMedicine.frequency}`
                  ) : nextAppointment ? (
                    `Upcoming consultation with ${nextAppointment.doctorName} on ${nextAppointment.date}`
                  ) : (
                    `Upload your latest prescription or health report to your encrypted vault`
                  )}
                </p>
                <p className="text-[11px] text-[#827b6c] dark:text-slate-400 mt-0.5">
                  {nextMedicine ? (
                    `Salt: ${nextMedicine.salt} • Instruction: ${nextMedicine.instructions || 'Take with water'}`
                  ) : (
                    `AI OCR will automatically catalog medicines, salts, and safety contraindications.`
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {nextMedicine ? (
                <button
                  onClick={() => onMarkDoseTaken(nextMedicine.id)}
                  className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Mark Dose Taken</span>
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('scanner')}
                  className="px-3.5 py-2 bg-[#1b3b2b] hover:bg-[#244836] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <ScanLine className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Scan New Rx</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. WHAT CAN JEVAN CARE HELP ME WITH? (Connected 5-Step Health Journey)
          ========================================================================= */}
      <section className="bg-white dark:bg-[#16241c] border border-[#e6dfd3] dark:border-[#283c2e] rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h2 className="font-bold text-sm text-[#1b3b2b] dark:text-white">
              Connected Health Journey Workflow
            </h2>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#827b6c] dark:text-slate-400">
            End-to-End Care Loop
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          
          {/* Step 1 */}
          <button
            onClick={() => setActiveTab('scanner')}
            className="p-3 rounded-2xl bg-[#fcfaf6] dark:bg-[#1d2e23] border border-[#e6dfd3] dark:border-[#2a3f32] hover:border-[#1b3b2b] dark:hover:border-emerald-500 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#e8eee5] dark:bg-[#253d2f] text-[#2b503b] dark:text-emerald-300">
                1. Scan Rx
              </span>
              <ScanLine className="w-4 h-4 text-[#827b6c] group-hover:text-[#1b3b2b] dark:group-hover:text-emerald-400 transition-colors" />
            </div>
            <h4 className="font-bold text-xs text-[#1b3b2b] dark:text-white leading-snug">OCR Medicine Scanner</h4>
            <p className="text-[11px] text-[#827b6c] dark:text-slate-400 mt-1 line-clamp-2">Handwritten parsing & dosage confirmation.</p>
          </button>

          {/* Step 2 */}
          <button
            onClick={() => setActiveTab('medicine')}
            className="p-3 rounded-2xl bg-[#fcfaf6] dark:bg-[#1d2e23] border border-[#e6dfd3] dark:border-[#2a3f32] hover:border-[#1b3b2b] dark:hover:border-emerald-500 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#e8eee5] dark:bg-[#253d2f] text-[#2b503b] dark:text-emerald-300">
                2. Salts & Risks
              </span>
              <Pill className="w-4 h-4 text-[#827b6c] group-hover:text-[#1b3b2b] dark:group-hover:text-emerald-400 transition-colors" />
            </div>
            <h4 className="font-bold text-xs text-[#1b3b2b] dark:text-white leading-snug">Medicine Intelligence</h4>
            <p className="text-[11px] text-[#827b6c] dark:text-slate-400 mt-1 line-clamp-2">Interaction checks & generic price comparison.</p>
          </button>

          {/* Step 3 */}
          <button
            onClick={() => setActiveTab('vault')}
            className="p-3 rounded-2xl bg-[#fcfaf6] dark:bg-[#1d2e23] border border-[#e6dfd3] dark:border-[#2a3f32] hover:border-[#1b3b2b] dark:hover:border-emerald-500 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#e8eee5] dark:bg-[#253d2f] text-[#2b503b] dark:text-emerald-300">
                3. Vault
              </span>
              <FolderLock className="w-4 h-4 text-[#827b6c] group-hover:text-[#1b3b2b] dark:group-hover:text-emerald-400 transition-colors" />
            </div>
            <h4 className="font-bold text-xs text-[#1b3b2b] dark:text-white leading-snug">AES-256 Vault</h4>
            <p className="text-[11px] text-[#827b6c] dark:text-slate-400 mt-1 line-clamp-2">Encrypted report storage & ABHA ID linkage.</p>
          </button>

          {/* Step 4 */}
          <button
            onClick={() => setActiveTab('progress')}
            className="p-3 rounded-2xl bg-[#fcfaf6] dark:bg-[#1d2e23] border border-[#e6dfd3] dark:border-[#2a3f32] hover:border-[#1b3b2b] dark:hover:border-emerald-500 transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#e8eee5] dark:bg-[#253d2f] text-[#2b503b] dark:text-emerald-300">
                4. Track
              </span>
              <Activity className="w-4 h-4 text-[#827b6c] group-hover:text-[#1b3b2b] dark:group-hover:text-emerald-400 transition-colors" />
            </div>
            <h4 className="font-bold text-xs text-[#1b3b2b] dark:text-white leading-snug">Vitals & Progress</h4>
            <p className="text-[11px] text-[#827b6c] dark:text-slate-400 mt-1 line-clamp-2">BP, Glucose & trend recovery charts.</p>
          </button>

          {/* Step 5 */}
          <button
            onClick={() => setActiveTab('doctors')}
            className="p-3 rounded-2xl bg-[#fcfaf6] dark:bg-[#1d2e23] border border-[#e6dfd3] dark:border-[#2a3f32] hover:border-[#1b3b2b] dark:hover:border-emerald-500 transition-all text-left group cursor-pointer col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#e8eee5] dark:bg-[#253d2f] text-[#2b503b] dark:text-emerald-300">
                5. Care & GPS
              </span>
              <Stethoscope className="w-4 h-4 text-[#827b6c] group-hover:text-[#1b3b2b] dark:group-hover:text-emerald-400 transition-colors" />
            </div>
            <h4 className="font-bold text-xs text-[#1b3b2b] dark:text-white leading-snug">Doctors & Nearby</h4>
            <p className="text-[11px] text-[#827b6c] dark:text-slate-400 mt-1 line-clamp-2">Telehealth specialists & 24/7 hospitals.</p>
          </button>

        </div>
      </section>

      {/* Safety Risk Alert Banner if any detected */}
      {safeRiskAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Active Clinical Safety Advisory
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5">
              {safeRiskAlerts[0].description}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('medicine')}
            className="text-xs font-bold text-amber-900 dark:text-amber-300 hover:underline shrink-0"
          >
            Review Details
          </button>
        </div>
      )}

      {/* =========================================================================
          HEALTHCARE ACCESSIBILITY & AFFORDABILITY INTELLIGENCE SPOTLIGHT
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
        <div className="lg:col-span-8">
          <AccessibilityIntelligenceCard
            userProfile={profile}
            activeMedicines={safeActiveMedicines}
            economicProfile={economicProfile}
            onNavigateTab={setActiveTab}
          />
        </div>
        <div className="lg:col-span-4">
          <OfficialBloodStockCard
            userProfile={profile}
            onNavigateTab={setActiveTab}
          />
        </div>
      </div>

      {/* =========================================================================
          PRIMARY FOCUS GRID: Daily Medications & Upcoming Appointments
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">

        {/* Essential Section 1: Active Routine Medications (7 Columns) */}
        <section className="lg:col-span-7 bg-white dark:bg-[#16241c] border border-[#e6dfd3] dark:border-[#283c2e] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#e6dfd3] dark:border-[#283c2e] mb-4">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-[#1b3b2b] dark:text-[#a3d4b6]" />
                <h2 className="font-bold text-base text-[#1b3b2b] dark:text-[#f2f0e8]">
                  Daily Medication Schedule
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('medicine')}
                className="text-xs font-bold text-[#1b3b2b] dark:text-[#a3d4b6] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Cabinet</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {safeActiveMedicines.length === 0 ? (
              <div className="py-8 text-center text-[#827b6c] dark:text-[#969082]">
                <Pill className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">No active medications scheduled for today</p>
                <button
                  onClick={() => setActiveTab('scanner')}
                  className="mt-3 text-xs font-bold text-[#1b3b2b] dark:text-[#a3d4b6] hover:underline"
                >
                  Scan a prescription to add routine doses
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {safeActiveMedicines.slice(0, 4).map((med) => (
                  <div
                    key={med.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fcfaf6] dark:bg-[#1d2e23] border border-[#e6dfd3] dark:border-[#2a3f32] gap-3 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-xs sm:text-sm text-[#1b3b2b] dark:text-[#f2f0e8] truncate">
                          {med.name}
                        </p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#e8eee5] dark:bg-[#23382b] text-[#2b503b] dark:text-[#a3d4b6]">
                          {med.dosage}
                        </span>
                      </div>
                      <p className="text-xs text-[#5c5647] dark:text-[#c0b9ad] truncate mt-0.5">
                        {med.frequency} • {med.salt}
                      </p>
                    </div>

                    <button
                      onClick={() => onMarkDoseTaken(med.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Take Dose</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-[#e6dfd3] dark:border-[#283c2e] flex items-center justify-between text-xs text-[#5c5647] dark:text-[#c0b9ad]">
            <span>Active routine: {safeActiveMedicines.length} items</span>
            <button
              onClick={() => setActiveTab('scanner')}
              className="font-bold text-[#1b3b2b] dark:text-[#a3d4b6] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add from Prescription</span>
            </button>
          </div>
        </section>

        {/* Essential Section 2: Clinical Appointments & Care Plan (5 Columns) */}
        <section className="lg:col-span-5 bg-white dark:bg-[#16241c] border border-[#e6dfd3] dark:border-[#283c2e] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#e6dfd3] dark:border-[#283c2e] mb-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#1b3b2b] dark:text-[#a3d4b6]" />
                <h2 className="font-bold text-base text-[#1b3b2b] dark:text-[#f2f0e8]">
                  Care & Consultations
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('doctors')}
                className="text-xs font-bold text-[#1b3b2b] dark:text-[#a3d4b6] hover:underline flex items-center gap-1"
              >
                <span>Find Doctors</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingApps.length > 0 ? (
              <div className="space-y-3">
                {upcomingApps.slice(0, 2).map((app) => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-2xl bg-[#fcfaf6] dark:bg-[#1d2e23] border border-[#e6dfd3] dark:border-[#2a3f32] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs sm:text-sm text-[#1b3b2b] dark:text-[#f2f0e8]">
                        {app.doctorName}
                      </p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {app.specialty}
                      </span>
                    </div>
                    <p className="text-xs text-[#5c5647] dark:text-[#c0b9ad]">
                      {app.date} at {app.time} • {app.mode} Consultation
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#fcfaf6] dark:bg-[#1d2e23] border border-[#e6dfd3] dark:border-[#2a3f32] text-center py-6">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-[#827b6c] dark:text-[#969082] opacity-40" />
                <p className="font-bold text-sm text-[#1b3b2b] dark:text-[#f2f0e8]">
                  No upcoming appointments scheduled
                </p>
                <p className="text-xs text-[#5c5647] dark:text-[#c0b9ad] mt-1 max-w-xs mx-auto">
                  Consult with top verified specialists for second opinions or regular health checkups.
                </p>
                <button
                  onClick={() => setActiveTab('doctors')}
                  className="mt-3 px-3 py-1.5 bg-[#1b3b2b] hover:bg-[#244836] text-white text-xs font-bold rounded-xl transition-all"
                >
                  Book Doctor Consultation
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-[#e6dfd3] dark:border-[#283c2e] flex items-center justify-between text-xs text-[#5c5647] dark:text-[#c0b9ad]">
            <span>Telehealth & In-clinic support</span>
            <button
              onClick={() => setActiveTab('doctors')}
              className="font-bold text-[#1b3b2b] dark:text-[#a3d4b6] hover:underline"
            >
              Browse Specialists →
            </button>
          </div>
        </section>

      </div>

      {/* =========================================================================
          PROGRESSIVE DISCLOSURE: ADDITIONAL INSIGHTS SECTION
          Groups non-essential health widgets to minimize cognitive overload
          ========================================================================= */}
      <section className="bg-white dark:bg-[#16241c] border border-[#e6dfd3] dark:border-[#283c2e] rounded-3xl shadow-xs transition-colors overflow-hidden">
        
        {/* Accordion / Disclosure Header */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fcfaf6]/80 dark:bg-[#192b20]/60 border-b border-[#e6dfd3] dark:border-[#283c2e]">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-base text-[#1b3b2b] dark:text-[#f2f0e8]">
                Additional Insights & Health Intelligence
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e8eee5] dark:bg-[#23382b] text-[#2b503b] dark:text-[#a3d4b6]">
                4 Modular Tools
              </span>
            </div>
            <p className="text-xs text-[#5c5647] dark:text-[#c0b9ad] max-w-xl">
              Expand to explore tailored daily wellness habits, AI metric analytics, local epidemiological alerts, and your medical vault archives.
            </p>
          </div>

          <button
            onClick={() => setShowAdditionalInsights(!showAdditionalInsights)}
            className="px-3.5 py-2 rounded-xl border border-[#e6dfd3] dark:border-[#283c2e] text-xs font-bold text-[#1b3b2b] dark:text-white hover:bg-white dark:hover:bg-[#1f3328] transition-all self-start sm:self-auto shrink-0 flex items-center gap-2 cursor-pointer"
            aria-expanded={showAdditionalInsights}
            aria-controls="additional-insights-content"
          >
            <span>{showAdditionalInsights ? 'Hide Additional Tools' : 'Explore Additional Tools'}</span>
            {showAdditionalInsights ? (
              <ChevronUp className="w-4 h-4 text-[#5c5647] dark:text-[#c0b9ad]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#5c5647] dark:text-[#c0b9ad]" />
            )}
          </button>
        </div>

        {/* Collapsible Content Area */}
        {showAdditionalInsights && (
          <div id="additional-insights-content" className="p-5 sm:p-6 space-y-6 animate-fade-up">
            
            {/* Category Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[#e6dfd3] dark:border-[#283c2e]">
              <button
                onClick={() => setActiveInsightTab('wisdom')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeInsightTab === 'wisdom'
                    ? 'bg-[#1b3b2b] text-white dark:bg-[#a3d4b6] dark:text-[#0f1a14] shadow-xs'
                    : 'text-[#5c5647] dark:text-[#c0b9ad] hover:bg-[#f6f2e9] dark:hover:bg-[#1d2e23]'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Daily Wellness Tip</span>
              </button>

              <button
                onClick={() => setActiveInsightTab('clinical')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeInsightTab === 'clinical'
                    ? 'bg-[#1b3b2b] text-white dark:bg-[#a3d4b6] dark:text-[#0f1a14] shadow-xs'
                    : 'text-[#5c5647] dark:text-[#c0b9ad] hover:bg-[#f6f2e9] dark:hover:bg-[#1d2e23]'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>AI Clinical Summary</span>
              </button>

              <button
                onClick={() => setActiveInsightTab('alerts')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeInsightTab === 'alerts'
                    ? 'bg-[#1b3b2b] text-white dark:bg-[#a3d4b6] dark:text-[#0f1a14] shadow-xs'
                    : 'text-[#5c5647] dark:text-[#c0b9ad] hover:bg-[#f6f2e9] dark:hover:bg-[#1d2e23]'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Local Health Alerts</span>
              </button>

              <button
                onClick={() => setActiveInsightTab('vault')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeInsightTab === 'vault'
                    ? 'bg-[#1b3b2b] text-white dark:bg-[#a3d4b6] dark:text-[#0f1a14] shadow-xs'
                    : 'text-[#5c5647] dark:text-[#c0b9ad] hover:bg-[#f6f2e9] dark:hover:bg-[#1d2e23]'
                }`}
              >
                <FolderLock className="w-3.5 h-3.5" />
                <span>Medical Vault Overview</span>
              </button>
            </div>

            {/* Active Insight Module */}
            <div className="min-h-[240px]">
              {activeInsightTab === 'wisdom' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#1b3b2b] dark:text-[#f2f0e8]">
                        Daily Personalized Wellness Wisdom
                      </h4>
                      <p className="text-xs text-[#5c5647] dark:text-[#c0b9ad]">
                        Evidence-informed Ayurvedic and lifestyle guidance tailored to your active profile.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('lifestyle')}
                      className="text-xs font-bold text-[#1b3b2b] dark:text-[#a3d4b6] hover:underline"
                    >
                      Open Wellness Hub →
                    </button>
                  </div>
                  <DailyWellnessWisdom
                    profile={profile}
                    onOpenYogaGuide={() => setActiveTab('lifestyle')}
                  />
                </div>
              )}

              {activeInsightTab === 'clinical' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#1b3b2b] dark:text-[#f2f0e8]">
                        AI Clinical Intelligence Summary
                      </h4>
                      <p className="text-xs text-[#5c5647] dark:text-[#c0b9ad]">
                        Real-time cross-metric health trajectories and automated clinical adherence scoring.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('progress')}
                      className="text-xs font-bold text-[#1b3b2b] dark:text-[#a3d4b6] hover:underline"
                    >
                      View Detailed Trends →
                    </button>
                  </div>
                  <AIInsightsWidget
                    profile={profile}
                    activeMedicines={safeActiveMedicines}
                    riskAlerts={safeRiskAlerts}
                    metricLogs={metricLogs}
                    onViewFullLogs={() => setActiveTab('progress')}
                  />
                </div>
              )}

              {activeInsightTab === 'alerts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#1b3b2b] dark:text-[#f2f0e8]">
                        Regional Epidemiological & Environmental Alerts
                      </h4>
                      <p className="text-xs text-[#5c5647] dark:text-[#c0b9ad]">
                        Grounded in Lucknow regional surveillance data for proactive preventive wellness.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                      Lucknow Region (Live)
                    </span>
                  </div>
                  <LocalHealthAlertsSection />
                </div>
              )}

              {activeInsightTab === 'vault' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#1b3b2b] dark:text-[#f2f0e8]">
                        Medical Vault Status
                      </h4>
                      <p className="text-xs text-[#5c5647] dark:text-[#c0b9ad]">
                        AES-256 encrypted storage of prescriptions, laboratory panels, and diagnostic imaging.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('vault')}
                      className="text-xs font-bold text-[#1b3b2b] dark:text-[#a3d4b6] hover:underline"
                    >
                      Open Full Vault →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-[#fcfaf6] dark:bg-[#1d2e23] border border-[#e6dfd3] dark:border-[#2a3f32]">
                      <span className="text-[10px] font-bold uppercase text-[#827b6c] block">Total Documents</span>
                      <span className="text-2xl font-bold text-[#1b3b2b] dark:text-white mt-1 block">{safeVaultItems.length}</span>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">Encrypted on Cloud</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#fcfaf6] dark:bg-[#1d2e23] border border-[#e6dfd3] dark:border-[#2a3f32]">
                      <span className="text-[10px] font-bold uppercase text-[#827b6c] block">ABHA Health Card</span>
                      <span className="text-sm font-bold text-[#1b3b2b] dark:text-white mt-2 block font-mono">
                        {profile.abhaId || '91-4829-1049-3821'}
                      </span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">Verified Sandbox ABHA</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#fcfaf6] dark:bg-[#1d2e23] border border-[#e6dfd3] dark:border-[#2a3f32] flex flex-col justify-between">
                      <span className="text-[10px] font-bold uppercase text-[#827b6c] block">Quick Action</span>
                      <button
                        onClick={() => setActiveTab('vault')}
                        className="mt-2 w-full py-2 bg-[#1b3b2b] hover:bg-[#244836] text-white text-xs font-bold rounded-xl transition-all"
                      >
                        Upload to Vault
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </section>

    </div>
  );
};



