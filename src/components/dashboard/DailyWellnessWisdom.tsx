import React, { useState, useEffect, useTransition } from 'react';
import { Sparkles, RefreshCw, Feather, CheckCircle2, Clock } from 'lucide-react';
import { HealthMetricLog, UserProfile, ActiveMedicine } from '../../types';
import { JevanCareLoader } from '../common/JevanCareLoader';

interface DailyWellnessWisdomProps {
  profile: UserProfile;
  metricLogs?: HealthMetricLog[];
  activeMedicines?: ActiveMedicine[];
  onNavigateToTab?: (tab: string) => void;
}

export type WisdomCategory =
  | 'Sleep'
  | 'Hydration'
  | 'Movement'
  | 'Nutrition'
  | 'Mindfulness'
  | 'Stress Management'
  | 'Healthy Habits';

interface WisdomData {
  text: string;
  category: WisdomCategory;
  basisNote: string;
  generatedAt: string;
  dateKey: string;
}

const DEFAULT_WISDOMS: Record<WisdomCategory, { text: string; basis: string }> = {
  Sleep: {
    text: 'Prioritizing a consistent sleep schedule and keeping your room cool and dark can significantly enhance daytime energy and metabolic resilience.',
    basis: 'Based on sleep & circadian rest logs',
  },
  Hydration: {
    text: 'Drinking a glass of water first thing in the morning gently rehydrates your body, supports digestion, and helps optimize cognitive alertness.',
    basis: 'Based on daily hydration & vital baseline',
  },
  Movement: {
    text: 'A light 10-minute walk after meals supports natural glucose regulation and releases gentle endorphins for sustained focus throughout the day.',
    basis: 'Based on physical activity & mobility trend',
  },
  Nutrition: {
    text: 'Incorporating fiber-rich whole foods and leafy greens into your meals provides steady nourishment and maintains balanced energy levels.',
    basis: 'Based on dietary & metabolic wellness markers',
  },
  Mindfulness: {
    text: 'Taking three slow, deep diaphragmatic breaths during transition points in your day helps quiet your nervous system and restore clarity.',
    basis: 'Based on mood & stress balance logs',
  },
  'Stress Management': {
    text: 'Short, mindful pauses between daily tasks allow your mind to reset, lowering stress markers and improving your overall well-being.',
    basis: 'Based on wellness & vital tracking',
  },
  'Healthy Habits': {
    text: 'Consistency in small daily choices—like timely medication adherence and balanced rest—forms the foundation of long-term health resilience.',
    basis: 'Based on routine medication & health record consistency',
  },
};

export const DailyWellnessWisdom: React.FC<DailyWellnessWisdomProps> = React.memo(({
  profile,
  metricLogs = [],
  activeMedicines = [],
}) => {
  const [wisdom, setWisdom] = useState<WisdomData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<number>(0);
  const [rateLimitNotice, setRateLimitNotice] = useState<string | null>(null);

  const todayDateKey = new Date().toISOString().split('T')[0];
  const storageKey = `jeevancare_daily_wisdom_${profile.id || 'default'}_${todayDateKey}`;

  // Analyze existing genuine metrics
  const analyzeUserMetrics = (): { primaryCategory: WisdomCategory; rationale: string } => {
    const latestLog = metricLogs[0];
    const activeMedCount = activeMedicines.length;

    if (latestLog) {
      if (typeof latestLog.sleepHours === 'number' && latestLog.sleepHours < 7) {
        return {
          primaryCategory: 'Sleep',
          rationale: `Recent log shows ${latestLog.sleepHours}h sleep (below target 7-8h)`,
        };
      }
      if (latestLog.mood === 'Neutral' || latestLog.mood === 'Poor' || latestLog.mood === 'Severe') {
        return {
          primaryCategory: 'Stress Management',
          rationale: `Mood log indicates ${latestLog.mood.toLowerCase()} mood balance`,
        };
      }
      if (typeof latestLog.bloodSugar === 'number' && latestLog.bloodSugar > 110) {
        return {
          primaryCategory: 'Nutrition',
          rationale: `Latest blood sugar reading of ${latestLog.bloodSugar} mg/dL`,
        };
      }
      if (latestLog.symptoms && latestLog.symptoms.length > 0) {
        return {
          primaryCategory: 'Mindfulness',
          rationale: `Logged symptoms: ${latestLog.symptoms.join(', ')}`,
        };
      }
    }

    if (activeMedCount > 0) {
      return {
        primaryCategory: 'Healthy Habits',
        rationale: `Managing ${activeMedCount} active prescription regimen${activeMedCount > 1 ? 's' : ''}`,
      };
    }

    return {
      primaryCategory: 'Hydration',
      rationale: 'Personalized wellness guidance based on health profile',
    };
  };

  const isMountedRef = React.useRef(true);
  const rateLimitTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (rateLimitTimerRef.current) clearTimeout(rateLimitTimerRef.current);
    };
  }, []);

  // Generate or Load Wisdom
  const generateOrFetchWisdom = async (forceRefresh = false) => {
    // Check cached wisdom for today if not force refreshing
    if (!forceRefresh) {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        try {
          const parsed: WisdomData = JSON.parse(cached);
          if (parsed.dateKey === todayDateKey && parsed.text) {
            setWisdom(parsed);
            return;
          }
        } catch {
          // fallback to generate fresh
        }
      }
    }

    setIsRefreshing(true);
    setRateLimitNotice(null);

    const { primaryCategory, rationale } = analyzeUserMetrics();

    try {
      // Attempt server AI generation if available
      const latestLog = metricLogs[0];
      const res = await fetch('/api/health-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              sender: 'user',
              text: `Generate 1 short, supportive, evidence-conscious daily wellness tip (25-35 words max) for category "${primaryCategory}". Context: ${rationale}. Format as JSON: {"text": "...", "category": "${primaryCategory}"}`,
            },
          ],
          userProfile: profile,
          activeMedicines,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        let wisdomText = '';
        
        if (data.replyText) {
          // Sanitize out any disclaimer formatting or JSON wrappers if present
          wisdomText = data.replyText
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .replace(/⚠️ Disclaimer:.*/gs, '')
            .replace(/^"|"$/g, '')
            .trim();
        }

        if (wisdomText.length > 20 && wisdomText.length < 240) {
          const newWisdomData: WisdomData = {
            text: wisdomText,
            category: primaryCategory,
            basisNote: rationale,
            generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            dateKey: todayDateKey,
          };
          if (isMountedRef.current) {
            setWisdom(newWisdomData);
            localStorage.setItem(storageKey, JSON.stringify(newWisdomData));
            setIsRefreshing(false);
          }
          return;
        }
      }
    } catch {
      // Graceful fallback to deterministic evidence-conscious template
    }

    if (!isMountedRef.current) return;

    // Deterministic fallback
    const fallbackTemplate = DEFAULT_WISDOMS[primaryCategory] || DEFAULT_WISDOMS['Healthy Habits'];
    const newWisdomData: WisdomData = {
      text: fallbackTemplate.text,
      category: primaryCategory,
      basisNote: rationale,
      generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateKey: todayDateKey,
    };

    setWisdom(newWisdomData);
    localStorage.setItem(storageKey, JSON.stringify(newWisdomData));
    setIsRefreshing(false);
  };

  useEffect(() => {
    generateOrFetchWisdom(false);
  }, [profile.id, todayDateKey]);

  const handleRefreshClick = () => {
    const now = Date.now();
    // Rate limit: 5 seconds between manual refreshes
    if (now - lastRefreshedTime < 5000) {
      setRateLimitNotice('Wisdom is updated for today. Please wait a few seconds before refreshing again.');
      if (rateLimitTimerRef.current) clearTimeout(rateLimitTimerRef.current);
      rateLimitTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) setRateLimitNotice(null);
      }, 3500);
      return;
    }
    setLastRefreshedTime(now);
    generateOrFetchWisdom(true);
  };

  return (
    <div className="bg-[#e8eee5] dark:bg-[#18281f] border border-[#d3decf] dark:border-[#2a3f32] rounded-3xl p-6 sm:p-7 shadow-xs relative overflow-hidden transition-all">
      {/* Background Subtle Pattern */}
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-[#1b3b2b] dark:text-[#f2f6f0]">
        <Feather className="w-32 h-32" />
      </div>

      <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="bg-[#1b3b2b] text-[#faf8f5] dark:bg-[#e8eee5] dark:text-[#1b3b2b] text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-2xs">
              {wisdom?.category || 'Wellness'}
            </span>
            <span className="text-xs text-[#5c5647] dark:text-[#a8b8a5] font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#2b503b] dark:text-[#a8b8a5]" />
              <span>Today's wisdom</span>
            </span>
          </div>

          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="p-2 rounded-full text-[#2b503b] dark:text-[#d3e2cb] hover:bg-[#dce6d5] dark:hover:bg-[#23382c] transition-all cursor-pointer flex items-center justify-center"
            title="Refresh Wisdom"
          >
            {isRefreshing ? (
              <JevanCareLoader size="xs" color="forest" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-xl sm:text-2xl font-serif-editorial italic font-light text-[#1b3b2b] dark:text-[#f2f6f0] leading-snug">
            Daily Wellness Wisdom
          </h3>

          {/* Main Wisdom Quote */}
          {isRefreshing ? (
            <div className="py-4">
              <JevanCareLoader variant="button" color="forest" label="Curating personalized insight..." />
            </div>
          ) : (
            <p className="text-sm sm:text-base text-[#244836] dark:text-[#d3e2cb] leading-relaxed font-sans font-normal mt-2">
              "{wisdom?.text || DEFAULT_WISDOMS['Healthy Habits'].text}"
            </p>
          )}
        </div>

        {/* Rate Limit Notice Toast if clicked repeatedly */}
        {rateLimitNotice && (
          <p className="text-[11px] text-[#7d3a3e] bg-[#f8ebea] dark:bg-[#3d2023] dark:text-[#e0a8aa] p-2 rounded-xl border border-[#eed8d7] dark:border-[#522c2f] transition-all">
            {rateLimitNotice}
          </p>
        )}

        {/* Bottom Context Line */}
        {wisdom?.basisNote && !isRefreshing && (
          <div className="pt-2 border-t border-[#d3decf]/60 dark:border-[#2a3f32]/60 flex items-center justify-between text-[11px] text-[#5c5647] dark:text-[#a8b8a5]">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2b503b] dark:text-[#88cba3]" />
              <span>{wisdom.basisNote}</span>
            </span>
            {wisdom.generatedAt && (
              <span className="text-[10px] text-[#827b6c] dark:text-[#8aa08e]">
                Updated {wisdom.generatedAt}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
