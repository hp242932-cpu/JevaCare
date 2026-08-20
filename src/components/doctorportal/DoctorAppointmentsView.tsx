import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Video,
  Building2,
  FileText,
  FilePlus,
  UserCheck,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Appointment } from '../../types';

interface DoctorAppointmentsViewProps {
  appointments: Appointment[];
  setActiveTab: (tab: string) => void;
  onSelectPatient?: (patientId: string) => void;
}

export const DoctorAppointmentsView: React.FC<DoctorAppointmentsViewProps> = ({
  appointments = [],
  setActiveTab,
  onSelectPatient,
}) => {
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredApps = appointments.filter((app) => {
    const matchesSearch =
      app.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.notes && app.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filter === 'today') {
      return app.date === todayStr || app.status === 'Upcoming';
    }
    if (filter === 'upcoming') {
      return app.status === 'Upcoming';
    }
    if (filter === 'completed') {
      return app.status === 'Completed';
    }
    return true;
  });

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold tracking-tight">Clinical Appointments Queue</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage scheduled patient consultations, video visits, and clinic appointments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('doctor-patients')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Patients Roster</span>
          </button>
          <button
            onClick={() => setActiveTab('doctor-prescriptions')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <FilePlus className="w-4 h-4" />
            <span>Issue e-Prescription</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient, doctor, or chief complaint..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1 mr-1" />
          {(['all', 'today', 'upcoming', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-all cursor-pointer ${
                filter === f
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        {filteredApps.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Calendar className="w-12 h-12 mx-auto text-emerald-500/30" />
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">
              No appointments scheduled
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no patient appointments matching your search filter "{filter}".
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className="p-5 hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                    {app.type.includes('Video') ? (
                      <Video className="w-6 h-6" />
                    ) : (
                      <Building2 className="w-6 h-6" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-slate-900 dark:text-white">
                        {app.patientName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          app.status === 'Completed'
                            ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {app.status}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                        {app.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      Reason for Consultation:{' '}
                      <strong className="text-slate-700 dark:text-slate-300">
                        {app.notes || 'Routine Follow-up & Evaluation'}
                      </strong>
                    </p>

                    <div className="flex items-center gap-4 text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {app.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {app.timeSlot}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => {
                      if (onSelectPatient) {
                        onSelectPatient(app.patientName === 'Aarav Sharma' ? 'usr_001' : 'usr_002');
                      }
                      setActiveTab('doctor-patients');
                    }}
                    className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all cursor-pointer"
                  >
                    Medical Chart
                  </button>
                  <button
                    onClick={() => setActiveTab('doctor-notes')}
                    className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800/50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>SOAP Note</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('doctor-prescriptions')}
                    className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <FilePlus className="w-3.5 h-3.5" />
                    <span>Issue Rx</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
