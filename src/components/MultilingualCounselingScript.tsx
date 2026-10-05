import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Copy, Check, Languages, Sparkles, MessageSquareQuote } from 'lucide-react';
import { TriageCategory } from '../services/api';
import { COUNSELING_LANGUAGES, SupportedLanguage } from '../utils/counselingTranslations';

interface MultilingualCounselingScriptProps {
  category: TriageCategory;
  patientName: string;
  token: string;
}

export const MultilingualCounselingScript: React.FC<MultilingualCounselingScriptProps> = ({
  category,
  patientName,
  token,
}) => {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('hi');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSupported(true);
    }
  }, []);

  // Stop speech when component unmounts or language changes
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedLang, category]);

  const currentConfig = COUNSELING_LANGUAGES[selectedLang];
  const currentContent = currentConfig.scripts[category] || currentConfig.scripts.CLEAR;

  const handleToggleSpeech = () => {
    if (!speechSupported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentContent.script);
    utterance.lang = currentConfig.bcp47;
    utterance.rate = 0.92; // Calm, clear cadence for elderly rural patients

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = () => {
    const textToCopy = `[NetraScan Patient Counseling - ${patientName} (Token #${token})]\n\n${currentContent.script}\n\nProtocol Checklist:\n${currentContent.ashaTips.map((tip) => '• ' + tip).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const languageOptions: { id: SupportedLanguage; label: string; native: string }[] = [
    { id: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { id: 'en', label: 'English', native: 'English' },
    { id: 'bn', label: 'Bengali', native: 'বাংলা' },
    { id: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { id: 'te', label: 'Telugu', native: 'తెలుగు' },
    { id: 'mr', label: 'Marathi', native: 'मराठी' },
  ];

  return (
    <div className="p-5 sm:p-6 rounded-xl border border-[var(--rule)] bg-[var(--bg-2)] space-y-4 shadow-sm">
      {/* Header with Title and Language Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--rule)] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[var(--teal)]">
            <MessageSquareQuote className="w-4 h-4 shrink-0" />
            <span className="text-label text-[var(--teal)]">
              FRONTLINE ASHA PATIENT COUNSELING SCRIPT
            </span>
          </div>
          <h3 className="font-heading font-semibold text-[17px] text-[var(--fg)] mt-0.5">
            {currentContent.title}
          </h3>
          <p className="text-[12px] text-[var(--fg-soft)]">
            Read aloud to patient or play synthetic audio guidance in the local dialect.
          </p>
        </div>

        {/* Action Buttons: Audio Playback and Copy */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {speechSupported && (
            <button
              type="button"
              onClick={handleToggleSpeech}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer min-h-[36px] ${
                isSpeaking
                  ? 'bg-red-500 text-white shadow-sm animate-pulse'
                  : 'bg-[var(--teal)] text-white hover:opacity-95 shadow-xs'
              }`}
              title={isSpeaking ? 'Stop voice playback' : 'Play audio aloud to patient'}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Stop Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Play Aloud ({currentConfig.langNative})</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--rule)] hover:border-[var(--teal)] bg-[var(--bg)] text-xs text-[var(--fg)] hover:text-[var(--teal)] transition-colors cursor-pointer min-h-[36px]"
            title="Copy script to send via SMS or WhatsApp"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[var(--teal)]" />
                <span className="text-[var(--teal)] font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[var(--fg-faint)]" />
                <span>Copy Script</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Language Selector Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-1 text-[11px] text-[var(--fg-faint)] font-mono uppercase tracking-wider mr-1 shrink-0">
          <Languages className="w-3.5 h-3.5 text-[var(--amber)]" />
          <span>Dialect:</span>
        </div>
        {languageOptions.map((lang) => {
          const isSelected = selectedLang === lang.id;
          return (
            <button
              key={lang.id}
              type="button"
              onClick={() => setSelectedLang(lang.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer min-h-[32px] flex items-center gap-1 ${
                isSelected
                  ? 'bg-[var(--teal)] text-white shadow-xs'
                  : 'bg-[var(--bg)] text-[var(--fg-soft)] hover:text-[var(--fg)] border border-[var(--rule)] hover:border-[var(--fg-soft)]/50'
              }`}
            >
              <span>{lang.native}</span>
              <span className={`text-[10px] opacity-75 font-mono ${isSelected ? 'text-white' : 'text-[var(--fg-faint)]'}`}>
                ({lang.label})
              </span>
            </button>
          );
        })}
      </div>

      {/* Spoken Counseling Dialogue Box */}
      <div className="p-4 sm:p-5 rounded-lg bg-[var(--bg)] border-l-4 border-[var(--teal)] border-y border-r border-[var(--rule)] relative">
        <blockquote className="text-[14px] sm:text-[15px] text-[var(--fg)] leading-relaxed italic">
          &ldquo;{currentContent.script}&rdquo;
        </blockquote>

        {isSpeaking && (
          <div className="mt-3 pt-3 border-t border-[var(--rule)] flex items-center gap-2 text-xs font-mono text-[var(--teal)]">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--teal)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--teal)]" />
            </span>
            <span>Synthesizing voice in {currentConfig.langNative} ({currentConfig.langName})...</span>
          </div>
        )}
      </div>

      {/* Frontline ASHA Behavioral Checklist */}
      <div className="pt-2">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--fg-faint)] mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[var(--amber)]" />
          <span>FRONT-LINE COUNSELING PROTOCOL FOR ASHA HEALTH WORKER</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[var(--fg-soft)]">
          {currentContent.ashaTips.map((tip, idx) => (
            <li
              key={idx}
              className="p-2.5 rounded bg-[var(--bg)] border border-[var(--rule)] flex items-start gap-2"
            >
              <span className="text-[var(--teal)] font-bold shrink-0 mt-0.5">✓</span>
              <span className="leading-snug">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
