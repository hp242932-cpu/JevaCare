import React from 'react';
import {
  LayoutDashboard,
  HeartPulse,
  FolderLock,
  Bot,
  User,
  Pill,
  Stethoscope,
  MapPin,
  HeartHandshake,
  ScanLine,
  Activity,
  Heart,
  ShieldCheck,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { DoctorNavigation } from './doctorportal/DoctorNavigation';

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

  // 5-Pillar Category Definitions
  const categories = [
    {
      id: 'home',
      label: 'Home',
      icon: LayoutDashboard,
      defaultTab: 'dashboard',
      matchingTabs: ['dashboard'],
    },
    {
      id: 'care',
      label: 'Care',
      icon: HeartPulse,
      defaultTab: 'medicine',
      matchingTabs: ['medicine', 'doctors', 'map', 'blood-donation', 'care', 'intelligence', 'accessibility', 'schemes'],
      subTabs: [
        { id: 'intelligence', label: 'Intelligence & Schemes', icon: Sparkles },
        { id: 'medicine', label: 'Medicines & Schedule', icon: Pill },
        { id: 'doctors', label: 'Consult Doctors', icon: Stethoscope },
        { id: 'map', label: 'Nearby Healthcare', icon: MapPin },
        { id: 'blood-donation', label: 'Blood Network', icon: HeartHandshake },
      ]
    },
    {
      id: 'records',
      label: 'Records',
      icon: FolderLock,
      defaultTab: 'vault',
      matchingTabs: ['vault', 'scanner', 'progress', 'records'],
      subTabs: [
        { id: 'scanner', label: 'Prescription Scan', icon: ScanLine },
        { id: 'vault', label: 'Medical Vault', icon: FolderLock },
        { id: 'progress', label: 'Health Progress', icon: Activity },
      ]
    },
    {
      id: 'ai',
      label: 'AI & Wellness',
      icon: Bot,
      defaultTab: 'assistant',
      matchingTabs: ['assistant', 'lifestyle', 'rumor', 'ai'],
      subTabs: [
        { id: 'assistant', label: 'AI Health Assistant', icon: Bot },
        { id: 'lifestyle', label: 'Wellness & Yoga', icon: Heart },
        { id: 'rumor', label: 'Fact Checker', icon: ShieldCheck },
      ]
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      defaultTab: 'profile',
      matchingTabs: ['profile'],
    },
  ];

  // Identify active category
  const activeCategory = categories.find(c => c.matchingTabs.includes(activeTab)) || categories[0];

  return (
    <>
      {/* DESKTOP & TABLET TOP NAVIGATION */}
      <nav
        aria-label="Primary Health Navigation"
        className="bg-[#fcfaf6] dark:bg-[#121e17] border-b border-[#e6dfd3] dark:border-[#233529] sticky top-16 z-30 transition-colors hidden md:block"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main 5 Pillars Bar */}
          <div className="flex items-center justify-between border-b border-[#e6dfd3]/60 dark:border-[#233529]/60 py-2">
            <div className="flex items-center gap-1.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isCatActive = activeCategory.id === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (cat.matchingTabs.includes(activeTab)) return;
                      setActiveTab(cat.defaultTab);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isCatActive
                        ? 'bg-[#1b3b2b] text-white dark:bg-[#a3d4b6] dark:text-[#0f1a14] shadow-xs'
                        : 'text-[#5c5647] dark:text-[#c4beb2] hover:text-[#1b3b2b] dark:hover:text-white hover:bg-[#f2ece2] dark:hover:bg-[#1c2c23]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isCatActive ? 'text-emerald-300 dark:text-[#0f1a14]' : 'text-[#827b6c]'}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Context Indicator */}
            <div className="hidden lg:flex items-center gap-2 text-[11px] font-semibold text-[#827b6c] dark:text-slate-400 bg-[#f6f2e9] dark:bg-[#18261e] px-3 py-1.5 rounded-full border border-[#e6dfd3] dark:border-[#233529]">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Lifelong Encrypted Health Journey</span>
            </div>
          </div>

          {/* Sub-Tabs Row (Progressive disclosure for active pillar) */}
          {activeCategory.subTabs && (
            <div className="flex items-center gap-2 py-2 overflow-x-auto no-scrollbar animate-in fade-in">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#827b6c] dark:text-slate-500 mr-1 shrink-0">
                {activeCategory.label} Modules:
              </span>
              {activeCategory.subTabs.map((sub) => {
                const SubIcon = sub.icon;
                const isSubActive = activeTab === sub.id;

                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveTab(sub.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSubActive
                        ? 'bg-white dark:bg-[#1f3328] text-[#1b3b2b] dark:text-emerald-300 shadow-2xs border border-[#e6dfd3] dark:border-emerald-800/60 font-bold'
                        : 'text-[#6c6555] dark:text-[#a8a192] hover:text-[#1b3b2b] dark:hover:text-white hover:bg-white/50'
                    }`}
                  >
                    <SubIcon className={`w-3.5 h-3.5 ${isSubActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#827b6c]'}`} />
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>
          )}

        </div>
      </nav>

      {/* MOBILE TOP SUB-TABS (When in Care, Records, or AI) */}
      {activeCategory.subTabs && (
        <div className="md:hidden bg-[#f6f2e9] dark:bg-[#16241c] border-b border-[#e6dfd3] dark:border-[#233529] px-3 py-1.5 sticky top-16 z-30 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          {activeCategory.subTabs.map((sub) => {
            const SubIcon = sub.icon;
            const isSubActive = activeTab === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setActiveTab(sub.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap shrink-0 transition-all ${
                  isSubActive
                    ? 'bg-[#1b3b2b] text-white shadow-2xs'
                    : 'text-[#5c5647] dark:text-slate-300 bg-white/60 dark:bg-[#1a2b21]'
                }`}
              >
                <SubIcon className="w-3 h-3" />
                <span>{sub.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fcfaf6]/95 dark:bg-[#121e17]/95 backdrop-blur-md border-t border-[#e6dfd3] dark:border-[#233529] px-2 py-1.5 flex justify-around items-center"
        style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
      >
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isCatActive = activeCategory.id === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => {
                if (cat.matchingTabs.includes(activeTab)) return;
                setActiveTab(cat.defaultTab);
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isCatActive
                  ? 'text-[#1b3b2b] dark:text-[#a3d4b6] font-bold'
                  : 'text-[#827b6c] dark:text-[#8d8778]'
              }`}
            >
              <div className={`p-1 rounded-lg transition-all ${isCatActive ? 'bg-[#e8eee5] dark:bg-[#1d3126]' : ''}`}>
                <Icon className={`w-5 h-5 ${isCatActive ? 'text-[#1b3b2b] dark:text-[#a3d4b6]' : 'text-[#827b6c]'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{cat.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
});


