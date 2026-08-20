import React from 'react';
import {
  LayoutDashboard,
  ScanLine,
  Pill,
  Stethoscope,
  MapPin,
  ShieldCheck,
  Bot,
  Activity,
  Heart,
  FolderLock,
  User,
  HeartHandshake
} from 'lucide-react';
import { DoctorNavigation } from './doctorportal/DoctorNavigation';
import { HorizontalScrollContainer } from './common/HorizontalScrollContainer';

interface NavigationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole?: string;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = React.memo(({
  activeTab,
  setActiveTab,
  activeRole = 'Patient',
}) => {
  if (activeRole === 'Doctor') {
    return (
      <DoctorNavigation
        activeTab={activeTab.startsWith('doctor-') ? activeTab : 'doctor-dashboard'}
        setActiveTab={setActiveTab}
      />
    );
  }

  const patientTabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'assistant', label: 'Health Assistant', icon: Bot },
    { id: 'scanner', label: 'Prescription Scan', icon: ScanLine },
    { id: 'vault', label: 'Medical Vault', icon: FolderLock },
    { id: 'medicine', label: 'Medicines', icon: Pill },
    { id: 'doctors', label: 'Consult Doctors', icon: Stethoscope },
    { id: 'map', label: 'Nearby Care', icon: MapPin },
    { id: 'lifestyle', label: 'Wellness & Yoga', icon: Heart },
    { id: 'progress', label: 'Health Vitals', icon: Activity },
    { id: 'blood-donation', label: 'Blood Network', icon: HeartHandshake },
    { id: 'rumor', label: 'Fact-Checker', icon: ShieldCheck },
    { id: 'profile', label: 'Health Card', icon: User },
  ];

  return (
    <nav
      aria-label="Patient Navigation Tabs"
      className="bg-[#fcfaf6] dark:bg-[#121e17] border-b border-[#e6dfd3] dark:border-[#233529] sticky top-16 z-30 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-1.5">
        <HorizontalScrollContainer activeKey={activeTab} theme="patient">
          {patientTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-active={isActive ? 'true' : 'false'}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-180 cursor-pointer touch-manipulation min-h-[40px] ${
                  isActive
                    ? 'bg-[#1b3b2b] text-white dark:bg-[#a3d4b6] dark:text-[#0f1a14] shadow-xs'
                    : 'text-[#5c5647] dark:text-[#c4beb2] hover:text-[#1b3b2b] dark:hover:text-[#f2f0e8] hover:bg-[#f6f2e9] dark:hover:bg-[#1c2c23]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? 'text-emerald-300 dark:text-[#0f1a14]'
                      : 'text-[#827b6c] dark:text-[#969082]'
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </HorizontalScrollContainer>
      </div>
    </nav>
  );
});

