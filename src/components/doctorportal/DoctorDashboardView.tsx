import React from 'react';
import {
  Stethoscope,
  Users,
  Calendar,
  Clock,
  FilePlus,
  FileText,
  Bot,
  AlertCircle,
  CheckCircle2,
  Video,
  Phone,
  Building2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Appointment, UserProfile, PatientSummaryForDoctor } from '../../types';

interface DoctorDashboardViewProps {
  doctorProfile: UserProfile;
  appointments: Appointment[];
  patients: PatientSummaryForDoctor[];
  setActiveTab: (tab: string) => void;
  onSelectPatient?: (patientId: string) => void;
}

export const DoctorDashboardView: React.FC<DoctorDashboardViewProps> = ({
  doctorProfile,
  appointments,
  patients,
  setActiveTab,
  onSelectPatient,
}) => {
  const safeApps = appointments || [];
  const upcomingApps = safeApps.filter((a) => a.status === 'Upcoming');
  const todayApps = safeApps.slice(0, 4);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      
      {/* Top Professional Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg border border-emerald-400/30 shrink-0">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Welcome, Dr. {doctorProfile.name || 'Rajeshwar K. Tripathi'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Practitioner
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-3">
              <span>{doctorProfile.specialty || 'Pulmonology & Internal Medicine'}</span>
              <span>•</span>
              <span>Reg #: {doctorProfile.registrationNumber || 'KGMU-48219'}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Building2 className="w-3 h-3" /> {doctorProfile.hospitalAffiliation || 'KGMU Hospital, Lucknow'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('doctor-prescriptions')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <FilePlus className="w-4 h-4" />
            <span>New e-Prescription</span>
          </button>
          <button
            onClick={() => setActiveTab('doctor-notes')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>SOAP Note</span>
          </button>
        </div>
      </div>

      {/* Key Clinical Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 min-w-0">
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2 min-w-0">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="truncate">Today's Consultations</span>
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{todayApps.length}</p>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 truncate">
            <CheckCircle2 className="w-3 h-3 shrink-0" /> {upcomingApps.length} Upcoming scheduled
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2 min-w-0">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="truncate">Active Patients Roster</span>
            <Users className="w-4 h-4 text-indigo-600 shrink-0" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{patients.length}</p>
          <p className="text-[11px] text-slate-500 truncate">Authorized medical access</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2 min-w-0">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="truncate">Pending Report Reviews</span>
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">2</p>
          <p className="text-[11px] text-amber-600 font-semibold truncate">Lab reports awaiting review</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2 min-w-0">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="truncate">Clinical AI Assistant</span>
            <Bot className="w-4 h-4 text-indigo-500 shrink-0" />
          </div>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Ready</p>
          <p className="text-[11px] text-slate-500 truncate">Grounded in medical guidelines</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        
        {/* Left Column: Today's Consultation Schedule (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4 min-w-0">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Today's Consultation Queue
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('doctor-appointments')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Schedule ({safeApps.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayApps.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/40" />
              <p className="text-sm font-semibold">You're all caught up!</p>
              <p className="text-xs">No pending consultations scheduled for today.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayApps.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {app.patientName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {app.type}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs">
                      Reason: <strong className="text-slate-700 dark:text-slate-300">{app.notes || 'General Evaluation'}</strong>
                    </p>
                    <p className="text-emerald-700 dark:text-emerald-400 font-mono font-semibold text-[11px]">
                      📅 {app.date} at {app.timeSlot}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        if (onSelectPatient) onSelectPatient(app.patientName === 'Aarav Sharma' ? 'usr_001' : 'usr_002');
                        setActiveTab('doctor-patients');
                      }}
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300 transition-all cursor-pointer"
                    >
                      View Chart
                    </button>
                    <button
                      onClick={() => setActiveTab('doctor-prescriptions')}
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all cursor-pointer"
                    >
                      Issue Rx
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Quick Clinical Actions & AI Helper (1 Col) */}
        <div className="space-y-6">
          
          {/* Clinical AI Quick Assistant Card */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 rounded-2xl p-5 border border-indigo-800/40 text-white shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-indigo-100">Jevan Care Clinical AI</h3>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Summarize multi-year patient vault records, analyze uploaded lab values, or format clinical SOAP notes instantly.
            </p>
            <button
              onClick={() => setActiveTab('doctor-ai')}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Open Clinical AI Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Patient Roster Preview */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" /> Patient Roster
              </h3>
              <button
                onClick={() => setActiveTab('doctor-patients')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                View All →
              </button>
            </div>

            <div className="space-y-2">
              {patients.slice(0, 3).map((pat) => (
                <div
                  key={pat.id}
                  onClick={() => {
                    if (onSelectPatient) onSelectPatient(pat.id);
                    setActiveTab('doctor-patients');
                  }}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50/50 dark:hover:bg-slate-800 text-xs cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">{pat.name}</p>
                    <p className="text-slate-500 text-[11px]">
                      {pat.age} yrs • {pat.gender} • Blood: <strong className="text-rose-600">{pat.bloodGroup}</strong>
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
