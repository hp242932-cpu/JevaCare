import React, { useState } from 'react';
import {
  Sparkles,
  FolderLock,
  Bot,
  MapPin,
  ScanLine,
  CheckCircle2,
  X,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to Jevan Care AI Health Platform',
      badge: 'Getting Started',
      description: 'Your intelligent, privacy-first personal health companion. Safely manage your lifelong medical records, analyze prescriptions, and access AI health assistance.',
      icon: Sparkles,
      iconBg: 'bg-teal-500 text-white',
      highlights: [
        'End-to-End Encrypted Medical Vault & Storage',
        'Multimodal AI Health Assistant with Voice',
        'Real GPS Nearby Hospitals & Pharmacy Locator',
        'Intelligent Prescription & Report Scanner',
      ],
      ctaText: 'Explore Features',
      actionTab: null,
    },
    {
      title: '1. Centralized Medical Vault',
      badge: 'Medical History & Uploads',
      description: 'Store prescriptions, lab reports, doctor notes, and diagnostic scans securely. Drag & drop files for automatic AI summary extraction.',
      icon: FolderLock,
      iconBg: 'bg-indigo-500 text-white',
      highlights: [
        'Secure Supabase Cloud Storage & AES-256 Encryption',
        'Instant OCR text & medicine extraction',
        'One-click download & emergency QR code access',
      ],
      ctaText: 'Open Medical Vault',
      actionTab: 'vault',
    },
    {
      title: '2. Multimodal AI Health Assistant',
      badge: 'Voice Enabled AI',
      description: 'Ask questions about symptoms, medicines, side effects, and first aid using text or voice. Natural female AI voice synthesis with instant stop controls.',
      icon: Bot,
      iconBg: 'bg-blue-500 text-white',
      highlights: [
        'Voice input speech recognition & natural female voice output',
        'Medical-history-aware AI answers referencing your stored records',
        'Emergency red-flag symptom safety warnings',
      ],
      ctaText: 'Ask AI Assistant',
      actionTab: 'assistant',
    },
    {
      title: '3. Real GPS Nearby Healthcare Services',
      badge: 'Google Maps & Places',
      description: 'Locate 24/7 hospitals, emergency clinics, diagnostic centers, and pharmacies near your stabilized device coordinates.',
      icon: MapPin,
      iconBg: 'bg-emerald-500 text-white',
      highlights: [
        'Session location lock to prevent GPS position drift',
        'Manual area search override option',
        'Real-time directions, distance, and phone contacts',
      ],
      ctaText: 'Find Nearby Services',
      actionTab: 'map',
    },
  ];

  const currentStep = steps[step];
  const IconComponent = currentStep.icon;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handleAction = () => {
    if (currentStep.actionTab) {
      onNavigateTab(currentStep.actionTab);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative flex flex-col">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Banner */}
        <div className="p-6 pb-4 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              {currentStep.badge}
            </span>
            <span className="text-[10px] text-slate-400 font-bold">
              Step {step + 1} of {steps.length}
            </span>
          </div>

          <div className="flex items-start gap-4 mt-2">
            <div className={`w-12 h-12 rounded-2xl ${currentStep.iconBg} flex items-center justify-center shadow-lg shrink-0`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-snug">{currentStep.title}</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{currentStep.description}</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
            Key Capabilities & Features:
          </h4>

          <div className="space-y-2.5">
            {currentStep.highlights.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <span className="font-medium text-slate-700 dark:text-slate-200">{item}</span>
              </div>
            ))}
          </div>

          {/* Stepper Indicator Dots */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-2 rounded-full transition-all ${
                  i === step ? 'w-6 bg-teal-600' : 'w-2 bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Skip Intro
          </button>

          <div className="flex items-center gap-2">
            {currentStep.actionTab && (
              <button
                onClick={handleAction}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <span>{currentStep.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
            >
              <span>{step < steps.length - 1 ? 'Next Step' : 'Get Started'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
