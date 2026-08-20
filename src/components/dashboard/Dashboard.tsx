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
  FileText
} from 'lucide-react';
import {
  UserProfile,
  ActiveMedicine,
  Appointment,
  VaultItem,
  RiskAlert,
  Reminder,
  HealthMetricLog
} from '../../types';
import { LocalHealthAlertsSection } from './LocalHealthAlertsSection';
import { DailyWellnessWisdom } from './DailyWellnessWisdom';
import { AIInsightsWidget } from './AIInsightsWidget';

interface DashboardProps {
  profile: UserProfile;
  activeMedicines: ActiveMedicine[];
  appointments: Appointment[];
  vaultItems: VaultItem[];
  riskAlerts: RiskAlert[];
  reminders: Reminder[];
  metricLogs?: HealthMetricLog[];
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

  return (
    <div className="space-y-8 min-w-0 w-full animate-fade-up">

      {/* =========================================================================
          PRIMARY HEALTH SUMMARY & CONTEXT (Immediate Focal Point)
          ========================================================================= */}
      <section className="bg-white dark:bg-[#16241c] border border-[#e6dfd3] dark:border-[#283c2e] rounded-2xl p-6 sm:p-8 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5c5647] dark:text-[#c0b9ad]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Health Status: Stable & Optimal • Score {healthScore}/100</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light font-askan text-[#1b3b2b] dark:text-[#f2f0e8] tracking-tight">
              Welcome back, {profile.name}
            </h1>
            <p className="text-sm text-[#5c5647] dark:text-[#c0b9ad] max-w-2xl leading-relaxed">
              Your primary health summary is up to date. You have {safeActiveMedicines.length} active routine {safeActiveMedicines.length === 1 ? 'medication' : 'medications'} scheduled and {upcomingApps.length} upcoming medical consultation.
            </p>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('scanner')}
              className="btn-primary"
              aria-label="Scan Prescription"
            >
              <ScanLine className="w-4 h-4" />
              <span>Scan Prescription</span>
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className="btn-secondary"
              aria-label="Ask Health Assistant"
            >
              <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Ask Assistant</span>
            </button>

            <button
              onClick={onOpenEmergency}
              className="p-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-all cursor-pointer"
              title="Emergency SOS Hub"
              aria-label="Emergency SOS"
            >
              <AlertTriangle className="w-5 h-5" />
            </button>
          </div>

        </div>
      </section>

      {/* Safety Risk Alert Banner if any detected */}
      {safeRiskAlerts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Active Clinical Safety Advisory
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5">
              {safeRiskAlerts[0].description}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('medicine')}
            className="text-xs font-semibold text-amber-900 dark:text-amber-300 hover:underline shrink-0"
          >
            Review Details
          </button>
        </div>
      )}

      {/* =========================================================================
          PRIMARY FOCUS GRID: Daily Medications & Upcoming Appointments
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">

        {/* Essential Section 1: Active Routine Medications (7 Columns) */}
        <section className="lg:col-span-7 bg-white dark:bg-[#16241c] border border-[#e6dfd3] dark:border-[#283c2e] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#e6dfd3] dark:border-[#283c2e] mb-4">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-[#1b3b2b] dark:text-[#a3d4b6]" />
                <h2 className="font-semibold text-base text-[#1b3b2b] dark:text-[#f2f0e8]">
                  Daily Medication Schedule
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('medicine')}
                className="text-xs font-semibold text-[#1b3b2b] dark:text-[#a3d4b6] hover:underline flex items-center gap-1 cursor-pointer"
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
                  className="mt-3 text-xs font-semibold text-[#1b3b2b] dark:text-[#a3d4b6] hover:underline"
                >
                  Scan a prescription to add routine doses
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {safeActiveMedicines.slice(0, 4).map((med) => (
                  <div
                    key={med.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#fcfaf6] dark:bg-[#1d2e23] border border-[#e6dfd3] dark:border-[#2a3f32] gap-3 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-[#1b3b2b] dark:text-[#f2f0e8] truncate">
                          {med.name}
                        </p>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#e8eee5] dark:bg-[#23382b] text-[#2b503b] dark:text-[#a3d4b6]">
                          {med.dosage}
                        </span>
                      </div>
                      <p className="text-xs text-[#5c5647] dark:text-[#c0b9ad] truncate mt-0.5">
                        {med.frequency} • {med.salt}
                      </p>
                    </div>

                    <button
                      onClick={() => onMarkDoseTaken(med.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
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
              className="font-semibold text-[#1b3b2b] dark:text-[#a3d4b6] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Medication</span>
            </button>
          </div>
        </section>

        {/* Essential Section 2: Clinical Appointments & Care Plan (5 Columns) */}
        <section className="lg:col-span-5 bg-white dark:bg-[#16241c] border border-[#e6dfd3] dark:border-[#283c2e] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#e6dfd3] dark:border-[#283c2e] mb-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#1b3b2b] dark:text-[#a3d4b6]" />
                <h2 className="font-semibold text-base text-[#1b3b2b] dark:text-[#f2f0e8]">
                  Care & Consultations
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('doctors')}
                className="text-xs font-semibold text-[#1b3b2b] dark:text-[#a3d4b6] hover:underline flex items-center gap-1"
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
                    className="p-3.5 rounded-xl bg-[#fcfaf6] dark:bg-[#1d2e23] border border-[#e6dfd3] dark:border-[#2a3f32] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-[#1b3b2b] dark:text-[#f2f0e8]">
                        {app.doctorName}
                      </p>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
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
              <div className="p-4 rounded-xl bg-[#fcfaf6] dark:bg-[#1d2e23] border border-[#e6dfd3] dark:border-[#2a3f32] text-center py-6">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-[#827b6c] dark:text-[#969082] opacity-40" />
                <p className="font-medium text-sm text-[#1b3b2b] dark:text-[#f2f0e8]">
                  No upcoming appointments scheduled
                </p>
                <p className="text-xs text-[#5c5647] dark:text-[#c0b9ad] mt-1 max-w-xs mx-auto">
                  Consult with top verified specialists for second opinions or regular health checkups.
                </p>
                <button
                  onClick={() => setActiveTab('doctors')}
                  className="mt-3 btn-secondary text-xs px-3 py-1.5 min-h-[36px]"
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
              className="font-semibold text-[#1b3b2b] dark:text-[#a3d4b6] hover:underline"
            >
              Browse Specialties →
            </button>
          </div>
        </section>

      </div>

      {/* =========================================================================
          KEY VITALS STATUS TICKER (Core Baseline Metrics)
          ========================================================================= */}
      <div className="bg-white dark:bg-[#16241c] border border-[#e6dfd3] dark:border-[#283c2e] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs text-[#5c5647] dark:text-[#c0b9ad]">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1b3b2b] dark:text-[#f2f0e8]">Blood Pressure:</span>
            <span>118/76 mmHg</span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">Optimal</span>
          </div>
          <div className="hidden sm:block h-3 w-px bg-[#e6dfd3] dark:bg-[#283c2e]"></div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1b3b2b] dark:text-[#f2f0e8]">Blood Sugar:</span>
            <span>92 mg/dL</span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">Normal</span>
          </div>
          <div className="hidden sm:block h-3 w-px bg-[#e6dfd3] dark:bg-[#283c2e]"></div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1b3b2b] dark:text-[#f2f0e8]">Health Score:</span>
            <span>88/100</span>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('progress')}
          className="font-semibold text-[#1b3b2b] dark:text-[#a3d4b6] hover:underline flex items-center gap-1"
        >
          <span>Log or View Full Vitals</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* =========================================================================
          PROGRESSIVE DISCLOSURE: ADDITIONAL INSIGHTS SECTION
          Groups non-essential health widgets to minimize cognitive overload
          ========================================================================= */}
      <section className="bg-white dark:bg-[#16241c] border border-[#e6dfd3] dark:border-[#283c2e] rounded-2xl shadow-xs transition-colors overflow-hidden">
        
        {/* Accordion / Disclosure Header */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fcfaf6]/80 dark:bg-[#192b20]/60 border-b border-[#e6dfd3] dark:border-[#283c2e]">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-semibold text-base text-[#1b3b2b] dark:text-[#f2f0e8]">
                Additional Insights & Health Intelligence
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#e8eee5] dark:bg-[#23382b] text-[#2b503b] dark:text-[#a3d4b6]">
                4 Modular Tools
              </span>
            </div>
            <p className="text-xs text-[#5c5647] dark:text-[#c0b9ad] max-w-xl">
              Expand to explore tailored daily wellness habits, AI metric analytics, local epidemiological alerts, and your medical vault archives.
            </p>
          </div>

          <button
            onClick={() => setShowAdditionalInsights(!showAdditionalInsights)}
            className="btn-secondary text-xs px-4 py-2 self-start sm:self-auto shrink-0 flex items-center gap-2"
            aria-expanded={showAdditionalInsights}
            aria-controls="additional-insights-content"
          >
            <span>{showAdditionalInsights ? 'Hide Insights' : 'Explore Insights'}</span>
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
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
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
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
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
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
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
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
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
            <div className="min-h-[260px]">
              {activeInsightTab === 'wisdom' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-[#1b3b2b] dark:text-[#f2f0e8]">
                        Daily Personalized Wellness Wisdom
                      </h4>
                      <p className="text-xs text-[#5c5647] dark:text-[#c0b9ad]">
                        Evidence-informed Ayurvedic and lifestyle guidance tailored to your active profile.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('lifestyle')}
                      className="text-xs font-semibold text-[#1b3b2b] dark:text-[#a3d4b6] hover:underline"
                    >
                      Open Wellness Hub →
                    </button>
                  </div>
                  <DailyWellnessWisdom
                    profile={profile}
                    metricLogs={metricLogs}
                    activeMedicines={activeMedicines}
                    onNavigateToTab={setActiveTab}
                  />
                </div>
              )}

              {activeInsightTab === 'clinical' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-[#1b3b2b] dark:text-[#f2f0e8]">
                        AI Clinical Analytics & Trend Forecast
                      </h4>
                      <p className="text-xs text-[#5c5647] dark:text-[#c0b9ad]">
                        Longitudinal review of your health vitals, medication adherence, and proactive risks.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('progress')}
                      className="text-xs font-semibold text-[#1b3b2b] dark:text-[#a3d4b6] hover:underline"
                    >
                      View All Vitals Charts →
                    </button>
                  </div>
                  <AIInsightsWidget
                    profile={profile}
                    metricLogs={metricLogs}
                    activeMedicines={activeMedicines}
                    onNavigateToTab={setActiveTab}
                  />
                </div>
              )}

              {activeInsightTab === 'alerts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-[#1b3b2b] dark:text-[#f2f0e8]">
                        Local Regional Health Alerts
                      </h4>
                      <p className="text-xs text-[#5c5647] dark:text-[#c0b9ad]">
                        Real-time seasonal epidemiology, air quality advisories, and flu trends in your region.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('map')}
                      className="text-xs font-semibold text-[#1b3b2b] dark:text-[#a3d4b6] hover:underline"
                    >
                      Nearby Health Facilities →
                    </button>
                  </div>
                  <LocalHealthAlertsSection />
                </div>
              )}

              {activeInsightTab === 'vault' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-[#1b3b2b] dark:text-[#f2f0e8]">
                        Encrypted Medical Vault Summary
                      </h4>
                      <p className="text-xs text-[#5c5647] dark:text-[#c0b9ad]">
                        Digitized lab reports, past prescriptions, imaging scans, and vaccine certificates.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('vault')}
                      className="text-xs font-semibold text-[#1b3b2b] dark:text-[#a3d4b6] hover:underline"
                    >
                      Open Full Vault ({safeVaultItems.length}) →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                    <div
                      onClick={() => setActiveTab('vault')}
                      className="p-4 rounded-xl bg-[#fcfaf6] dark:bg-[#1d2e23] border border-[#e6dfd3] dark:border-[#2a3f32] hover:border-[#1b3b2b] dark:hover:border-[#a3d4b6] transition-all cursor-pointer"
                    >
                      <FileText className="w-5 h-5 text-[#1b3b2b] dark:text-[#a3d4b6] mb-2" />
                      <p className="text-xs font-semibold text-[#1b3b2b] dark:text-[#f2f0e8]">Lab Reports</p>
                      <p className="text-xs text-[#5c5647] dark:text-[#c0b9ad] mt-1">
                        {safeVaultItems.filter((i) => i.category === 'lab-report').length || 12} files saved
                      </p>
                    </div>

                    <div
                      onClick={() => setActiveTab('vault')}
                      className="p-4 rounded-xl bg-[#fcfaf6] dark:bg-[#1d2e23] border border-[#e6dfd3] dark:border-[#2a3f32] hover:border-[#1b3b2b] dark:hover:border-[#a3d4b6] transition-all cursor-pointer"
                    >
                      <Pill className="w-5 h-5 text-[#1b3b2b] dark:text-[#a3d4b6] mb-2" />
                      <p className="text-xs font-semibold text-[#1b3b2b] dark:text-[#f2f0e8]">Prescriptions</p>
                      <p className="text-xs text-[#5c5647] dark:text-[#c0b9ad] mt-1">
                        {safeVaultItems.filter((i) => i.category === 'prescription').length || 8} files saved
                      </p>
                    </div>

                    <div
                      onClick={() => setActiveTab('vault')}
                      className="p-4 rounded-xl bg-[#fcfaf6] dark:bg-[#1d2e23] border border-[#e6dfd3] dark:border-[#2a3f32] hover:border-[#1b3b2b] dark:hover:border-[#a3d4b6] transition-all cursor-pointer"
                    >
                      <Activity className="w-5 h-5 text-[#1b3b2b] dark:text-[#a3d4b6] mb-2" />
                      <p className="text-xs font-semibold text-[#1b3b2b] dark:text-[#f2f0e8]">Scans & Imaging</p>
                      <p className="text-xs text-[#5c5647] dark:text-[#c0b9ad] mt-1">
                        {safeVaultItems.filter((i) => i.category === 'scan').length || 4} files saved
                      </p>
                    </div>

                    <div
                      onClick={() => setActiveTab('vault')}
                      className="p-4 rounded-xl bg-[#fcfaf6] dark:bg-[#1d2e23] border border-[#e6dfd3] dark:border-[#2a3f32] hover:border-[#1b3b2b] dark:hover:border-[#a3d4b6] transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-5 h-5 text-[#1b3b2b] dark:text-[#a3d4b6] mb-2" />
                      <p className="text-xs font-semibold text-[#1b3b2b] dark:text-[#f2f0e8]">Vaccinations</p>
                      <p className="text-xs text-[#5c5647] dark:text-[#c0b9ad] mt-1">
                        {safeVaultItems.filter((i) => i.category === 'vaccine').length || 3} files saved
                      </p>
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


