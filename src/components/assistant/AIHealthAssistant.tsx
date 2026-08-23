import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  AlertTriangle,
  Sparkles,
  Info,
  Loader2,
  User,
  X,
  Square,
  Play,
  Radio,
  CheckCircle2,
  AlertCircle,
  Settings2,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { UserProfile, HealthAssistantMessage, VaultItem, ActiveMedicine } from '../../types';
import { JevanCareLoader } from '../common/JevanCareLoader';
import { API_ROUTES } from '../../services/apiRoutes';
import { supabaseAssistantMessages } from '../../services/supabaseService';

interface AIHealthAssistantProps {
  userProfile?: UserProfile;
  profile?: UserProfile;
  vaultItems?: VaultItem[];
  activeMedicines?: ActiveMedicine[];
  onOpenEmergency?: () => void;
}

export const AIHealthAssistant: React.FC<AIHealthAssistantProps> = ({
  userProfile,
  profile,
  vaultItems = [],
  activeMedicines = [],
  onOpenEmergency = () => {},
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

  const welcomeMessage: HealthAssistantMessage = {
    id: 'm_welcome',
    sender: 'assistant',
    text: `Hello ${currentProfile.name}! I am your Jevan Care Health Companion. Ask me about medicine side effects, disease awareness, symptom guidance, preventive care, first aid, or healthy lifestyle tips.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<HealthAssistantMessage[]>([welcomeMessage]);

  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [transcriptPreview, setTranscriptPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTtsActive, setIsTtsActive] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Available female speech synthesis voices
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  // Load chat history from Supabase if user has a profile ID
  useEffect(() => {
    if (!currentProfile.id) return;
    let isMounted = true;
    supabaseAssistantMessages.fetchMessages(currentProfile.id).then((savedMsgs) => {
      if (isMounted && savedMsgs.length > 0) {
        setMessages(savedMsgs);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentProfile.id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isLoading]);

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear your chat history with the Health Companion?')) {
      if (currentProfile.id) {
        await supabaseAssistantMessages.clearMessages(currentProfile.id);
      }
      setMessages([welcomeMessage]);
    }
  };

  // Load and auto-select preferred Female Voice for SpeechSynthesis
  useEffect(() => {
    isMountedRef.current = true;
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      if (isMountedRef.current) setAvailableVoices(voices);

      // Prefer English female voices
      const femaleKeywords = [
        'female', 'samantha', 'victoria', 'karen', 'zira', 'fiona', 
        'veena', 'google us english', 'google uk english female', 'moira', 
        'jenny', 'aria', 'natasha', 'sonia', 'en-us-x-sfg', 'natural'
      ];
      
      const femaleEn = voices.find((v) => {
        const name = v.name.toLowerCase();
        const isEn = v.lang.startsWith('en');
        return isEn && femaleKeywords.some((k) => name.includes(k));
      });

      const anyEn = voices.find((v) => v.lang.startsWith('en'));
      if (isMountedRef.current) {
        setSelectedVoice(femaleEn || anyEn || voices[0] || null);
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      isMountedRef.current = false;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Voice Input - Web Speech API Recognition
  const startVoiceRecording = () => {
    setSpeechError(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Web Speech Recognition is not supported in this browser. Please type your message.');
      return;
    }

    // Stop speaking if AI is currently talking
    stopSpeaking();

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscriptPreview('');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscriptPreview(currentTranscript);
        setInput(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setSpeechError('Microphone permission was denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          setSpeechError('No speech detected. Please tap the microphone and speak again.');
        } else {
          setSpeechError(`Speech recognition error (${event.error}). Please try again or type your question.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setSpeechError('Failed to access microphone. Please check browser permissions.');
    }
  };

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setCurrentlySpeakingId(null);
  }, []);

  const stopVoiceRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore error if already stopped
      }
    }
    setIsListening(false);
  }, []);

  const toggleVoiceRecording = useCallback(() => {
    if (isListening) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  }, [isListening, stopVoiceRecording]);

  // Voice Output - Web Speech API SpeechSynthesis with Female Voice
  const speakText = useCallback((text: string, msgId?: string) => {
    if (!('speechSynthesis' in window)) {
      setSpeechError('Speech synthesis is not supported in your browser.');
      return;
    }

    // Stop any existing speech
    window.speechSynthesis.cancel();

    // Strip markdown formatting for natural speech
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .replace(/⚠️|💡|✅|🚨|📌|🩺/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.98; // Natural conversational rate
    utterance.pitch = 1.05; // Slightly higher pitch for clear female voice

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (msgId) setCurrentlySpeakingId(msgId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentlySpeakingId(null);
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
      setCurrentlySpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  }, [selectedVoice]);

  const handleImageUpload = useCallback((file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setSelectedImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !selectedImage) return;

    // Stop listening/speaking when submitting a new prompt
    if (isListening) stopVoiceRecording();
    stopSpeaking();

    const userMsgText = input;
    const userImg = selectedImage;

    const newUserMsg: HealthAssistantMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: userMsgText,
      imageUrl: userImg || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    if (currentProfile.id) {
      supabaseAssistantMessages.saveMessage(currentProfile.id, newUserMsg);
    }
    setInput('');
    setTranscriptPreview('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await fetch(API_ROUTES.GEMINI.HEALTH_ASSISTANT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newUserMsg],
          userProfile: currentProfile,
          vaultItems,
          activeMedicines,
        }),
      });

      const json = await response.json();
      if (!isMountedRef.current) return;

      if (!json.success) {
        throw new Error(json.error?.message || json.error || 'AI response failed.');
      }

      const replyText = json.reply || json.data?.reply || 'I am here to support your health journey.';
      const hasRedFlags = Boolean(json.hasRedFlags || json.data?.hasRedFlags);

      const botReplyId = `bot_${Date.now()}`;
      const botReply: HealthAssistantMessage = {
        id: botReplyId,
        sender: 'assistant',
        text: replyText,
        hasRedFlags,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botReply]);
      if (currentProfile.id) {
        supabaseAssistantMessages.saveMessage(currentProfile.id, botReply);
      }

      // Automatically read aloud if TTS is active
      if (isTtsActive) {
        speakText(replyText, botReplyId);
      }
    } catch (err: any) {
      console.error('Assistant error:', err);
      const errMsg: HealthAssistantMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: 'I am experiencing connection difficulty. Please try again or consult a medical professional.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
      if (currentProfile.id) {
        supabaseAssistantMessages.saveMessage(currentProfile.id, errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Multimodal AI Health Assistant</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                Voice Enabled • Female AI Companion
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ask symptoms or health advice using speech or text powered by Gemini AI.
            </p>
          </div>
        </div>

        {/* Global Speech Output & Voice Selection Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Female Voice Indicator / Selector */}
          {selectedVoice && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
              <Radio className="w-3.5 h-3.5 text-teal-500 animate-pulse" />
              <span className="font-semibold truncate max-w-[140px]" title={selectedVoice.name}>
                {selectedVoice.name.replace(/Google|Microsoft|Desktop|English/g, '').trim() || 'Female Voice'}
              </span>
            </div>
          )}

          {/* Stop Speech Button when AI is actively speaking */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md flex items-center gap-1.5 transition-all animate-pulse shrink-0"
              title="Stop AI Speech Output Immediately"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Speaking 🔇</span>
            </button>
          )}

          {/* TTS Audio Toggle */}
          <button
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setIsTtsActive(!isTtsActive);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all shrink-0 ${
              isTtsActive
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}
            title="Toggle Voice Speech Output"
          >
            {isTtsActive ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4" />}
            <span>{isTtsActive ? 'Voice ON' : 'Muted'}</span>
          </button>

          {/* Clear History Button */}
          {messages.length > 1 && (
            <button
              onClick={handleClearHistory}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-800 transition-all flex items-center gap-1 shrink-0"
              title="Clear Conversation History"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Clear Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Voice Status Banners */}
      
      {/* 1. AI Currently Speaking Banner */}
      {isSpeaking && (
        <div className="p-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl border border-blue-700/50 shadow-md flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Volume2 className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-white">AI Health Companion Speaking</span>
                {/* Audio Waveform visualizer */}
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-1 bg-teal-400 rounded-full h-full animate-pulse" />
                  <span className="w-1 bg-teal-300 rounded-full h-2 animate-pulse delay-75" />
                  <span className="w-1 bg-teal-500 rounded-full h-3 animate-pulse delay-150" />
                  <span className="w-1 bg-teal-400 rounded-full h-1.5 animate-pulse delay-200" />
                </div>
              </div>
              <p className="text-[11px] text-blue-200 opacity-90">
                Spoken aloud using natural female voice ({selectedVoice?.name || 'Female Voice'}).
              </p>
            </div>
          </div>

          <button
            onClick={stopSpeaking}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all shrink-0"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop Speech 🔇</span>
          </button>
        </div>
      )}

      {/* 2. Voice Listening & Live Speech-to-Text Transcript Banner */}
      {isListening && (
        <div className="p-3 bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 text-white rounded-2xl border border-rose-700/60 shadow-md flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-rose-500/30 border border-rose-400/50 flex items-center justify-center text-rose-300 animate-pulse shrink-0">
              <Mic className="w-4 h-4 text-rose-200" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-rose-200">Listening to your voice...</span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              </div>
              <p className="text-xs font-medium text-white truncate italic mt-0.5">
                "{transcriptPreview || 'Speak your symptoms or health query clearly into mic...'}"
              </p>
            </div>
          </div>

          <button
            onClick={stopVoiceRecording}
            className="px-3 py-1.5 bg-white text-rose-900 hover:bg-rose-100 font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all shrink-0"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop Mic ⏹️</span>
          </button>
        </div>
      )}

      {/* 3. Speech Recognition Error Toast */}
      {speechError && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-2xl text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{speechError}</span>
          </div>
          <button
            onClick={() => setSpeechError(null)}
            className="p-1 hover:bg-amber-200 dark:hover:bg-amber-900 rounded-lg shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Chat Container */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden flex flex-col h-[calc(100dvh-13rem)] min-h-[380px] max-h-[580px] md:h-[520px]">
        
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => {
            const isThisMsgSpeaking = currentlySpeakingId === m.id && isSpeaking;

            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gradient-to-tr from-teal-500 to-blue-600 text-white shadow-xs'
                  }`}
                >
                  {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 relative group ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-tl-none'
                  }`}
                >
                  {m.imageUrl && (
                    <img
                      src={m.imageUrl}
                      alt="Uploaded attachment"
                      className="max-h-48 rounded-xl object-contain border border-white/20 mb-2"
                    />
                  )}

                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {/* Red Flag Emergency Warning Banner */}
                  {m.hasRedFlags && (
                    <div className="p-3 rounded-xl bg-rose-500 text-white text-xs font-bold space-y-2 mt-2 shadow-md">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-300" />
                        <span>CRITICAL EMERGENCY WARNING DETECTED</span>
                      </div>
                      <p className="text-[11px] font-normal opacity-90">
                        Your symptoms indicate a potential medical emergency. Please contact emergency services (911) immediately or visit the nearest ER.
                      </p>
                      <button
                        onClick={onOpenEmergency}
                        className="w-full py-1.5 bg-white text-rose-700 font-extrabold rounded-lg text-xs"
                      >
                        Open Emergency Hub Now
                      </button>
                    </div>
                  )}

                  {/* Message Bottom Metadata & Per-Message Speech Control */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-black/5 dark:border-white/5">
                    {/* Read Aloud Button for Assistant Messages */}
                    {m.sender === 'assistant' ? (
                      <button
                        onClick={() => {
                          if (isThisMsgSpeaking) {
                            stopSpeaking();
                          } else {
                            speakText(m.text, m.id);
                          }
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                          isThisMsgSpeaking
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300'
                        }`}
                        title={isThisMsgSpeaking ? 'Stop Speech' : 'Listen to response with female voice'}
                      >
                        {isThisMsgSpeaking ? (
                          <>
                            <Square className="w-3 h-3 fill-current text-white animate-pulse" />
                            <span>Stop Speech 🔇</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                            <span>Listen 🔊</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-[10px] opacity-70">Voice/Text Prompt</span>
                    )}

                    <span
                      className={`text-[9px] block text-right opacity-70 ${
                        m.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200 p-3 rounded-2xl bg-[#f6f2e9] dark:bg-[#18281f] border border-[#e6dfd3] dark:border-[#2a3f32] w-fit shadow-2xs">
              <JevanCareLoader size="sm" color="forest" label="Jevan Care AI is thinking..." />
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Selected Image Thumbnail preview */}
        {selectedImage && (
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <ImageIcon className="w-4 h-4 text-blue-500" />
              <span>Attached image ready for AI analysis</span>
            </div>
            <button onClick={() => setSelectedImage(null)} className="p-1 hover:bg-slate-200 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Controls Form */}
        <form onSubmit={handleSendMessage} className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
          
          <input
            id="assistant-image-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
            }}
          />

          {/* Attach Image Button */}
          <button
            type="button"
            onClick={() => document.getElementById('assistant-image-input')?.click()}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shrink-0"
            title="Attach Prescription or Symptom Photo"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          {/* Voice Speech-to-Text Toggle Button */}
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`p-2.5 rounded-xl border transition-all shrink-0 flex items-center gap-1.5 font-bold text-xs ${
              isListening
                ? 'bg-rose-600 text-white border-rose-700 shadow-md animate-pulse'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={isListening ? 'Stop Voice Recording' : 'Speak Your Health Query (Web Speech API)'}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 text-white" />
                <span className="hidden md:inline">Listening...</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="hidden md:inline">Voice Input</span>
              </>
            )}
          </button>

          {/* Text Input Field */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to your speech...'
                : 'Ask symptoms, side effects, first aid, or health questions...'
            }
            className="flex-1 px-4 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
          />

          {/* Stop Speaking Quick Control inside form if active */}
          {isSpeaking && (
            <button
              type="button"
              onClick={stopSpeaking}
              className="p-2.5 bg-rose-600 text-white font-bold rounded-xl shadow-md transition-all shrink-0"
              title="Stop AI Speech"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          )}

          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !selectedImage)}
            className="p-2.5 bg-[#1b3b2b] hover:bg-[#244836] text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-40 shrink-0 cursor-pointer"
            title="Send Message"
          >
            {isLoading ? <JevanCareLoader size="xs" color="white" /> : <Send className="w-4 h-4" />}
          </button>
        </form>

      </div>

      {/* Mandatory Medical Disclaimer Footer */}
      <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400 flex items-start gap-2">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p>
          <span className="font-bold">Medical Disclaimer:</span> Jevan Care provides informational support only and is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician for health decisions or medical emergencies.
        </p>
      </div>

    </div>
  );
};

