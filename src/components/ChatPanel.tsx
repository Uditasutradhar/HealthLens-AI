import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  MessageCircle, 
  User, 
  Bot, 
  Loader2, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Sparkles, 
  ThumbsUp, 
  RotateCcw,
  Stethoscope,
  Smile,
  ListChecks,
  ArrowRight
} from 'lucide-react';
import { ai, CHAT_MODEL } from '../lib/gemini';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  liked?: boolean;
  followUps?: string[];
}

interface ChatPanelProps {
  reportContext: string;
}

type PersonaMode = 'doctor' | 'friendly' | 'action';

const QUICK_STARTERS = [
  { label: 'Explain Abnormal Symptoms', icon: Stethoscope, prompt: 'Could you explain any abnormal symptoms or out-of-range values in my report in simple, comforting terms?' },
  { label: 'Questions for My Doctor', icon: HelpCircleIcon, prompt: 'What specific questions should I ask my doctor during my next appointment based on this report?' },
  { label: 'Diet & Lifestyle Advice', icon: ListChecks, prompt: 'What dietary, hydration, and lifestyle adjustments should I consider given these test results?' },
  { label: 'Are My Kidneys & Liver Healthy?', icon: Sparkles, prompt: 'Based on these extracted values, how are my kidney and liver functions looking?' },
];

function HelpCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function ChatPanel({ reportContext }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [persona, setPersona] = useState<PersonaMode>('friendly');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_~`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleLike = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, liked: !m.liked } : m));
  };

  const handleClearChat = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
    setMessages([]);
  };

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: queryText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setInput('');
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      let personaInstruction = "Warm, lively, empathetic doctor tone that is easy to digest in seconds.";
      if (persona === 'friendly') {
        personaInstruction = "Enthusiastic, friendly health companion using brief conversational sentences and daily analogies.";
      } else if (persona === 'action') {
        personaInstruction = "Concise action coach highlighting immediate practical steps and doctor questions.";
      } else if (persona === 'doctor') {
        personaInstruction = "Clear, attentive physician explaining key findings succinctly without medical jargon.";
      }

      const systemInstruction = `You are a lively, warm, and highly engaging Medical Health Companion. 
Persona Style: ${personaInstruction}

REPORT CONTEXT:
${reportContext}

CRITICAL RULES:
1. SHORT & BITE-SIZED: Keep every response strictly under 70-90 words (2 to 3 short, punchy sentences max). Never write long paragraphs, essays, or walls of text. Keep it exciting and easy to read.
2. ZERO SYMBOLS OR BOLD HEADERS: Strictly NEVER use markdown bold symbols or headers like "**Good vegetarian sources:**", "**Key Findings:**", or "**Words**". Never use asterisks (*) or markdown bullet symbols. Write in clean, pure plain text sentences.
3. CONVERSATIONAL & ENGAGING: Speak warmly like a friendly, attentive human doctor. End with one quick conversational check-in question to keep the user engaged.
4. TERMINOLOGY: Always use "abnormal symptoms" or "abnormal findings" when discussing out-of-range metrics. Never use "red flag" or "red flag symptoms".
5. RELEVANT FOLLOW-UP QUESTIONS: On the final line of your output, write "[FOLLOW_UPS]:" followed by 3 short, intriguing, contextually relevant follow-up questions separated by a pipe (|).
Example:
[FOLLOW_UPS]: What simple foods lower this? | Is this safe to exercise with? | What should I tell my doctor?`;

      const response = await ai.models.generateContent({
        model: CHAT_MODEL,
        contents: [
            ...history as any,
            { role: 'user', parts: [{ text: queryText }] }
        ],
        config: {
          systemInstruction
        }
      });

      let rawResponse = response.text || "I'm sorry, I couldn't process that request.";
      
      // Extract follow-ups if present
      let followUps: string[] = [];
      const followUpMatch = rawResponse.match(/\[FOLLOW_UPS\]:\s*(.+)$/i);
      if (followUpMatch) {
        followUps = followUpMatch[1].split('|').map(s => s.trim().replace(/[*_~`#]/g, '')).filter(Boolean);
        rawResponse = rawResponse.replace(/\[FOLLOW_UPS\]:\s*.+$/i, '').trim();
      } else {
        followUps = [
          "What foods help balance this?",
          "Should I retest soon?",
          "What should I ask my physician?"
        ];
      }

      // Comprehensive sanitization: strip all bold markers like **Heading:** or **word**, bullet asterisks, and hash symbols
      let cleanResponse = rawResponse
        .replace(/\*\*([^*]+)\*\*:\s*/g, '$1: ')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/^\s*[\*\-]\s+/gm, '')
        .replace(/^#+\s+/gm, '')
        .trim();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: cleanResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        followUps: followUps.slice(0, 3),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errMsg = error?.message || "Sorry, I'm having trouble connecting to the medical AI service. Please check your network and API key settings.";
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${errMsg}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuery(input);
  };

  if (!reportContext) return null;

  return (
    <div className="w-full max-w-5xl mx-auto mt-16 bg-[#0F172A]/70 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[700px] relative" id="chat-panel">
      {/* Header with Mode Selection and Controls */}
      <div className="bg-slate-900/90 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <MessageCircle className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
              Interactive Health Companion
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider">LIVE MEDICAL INTELLIGENCE</p>
          </div>
        </div>

        {/* Persona Mode Toggles */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800" id="persona-selector">
          <button
            type="button"
            onClick={() => setPersona('friendly')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              persona === 'friendly'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Friendly & Simple explanations"
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Friendly</span>
          </button>
          <button
            type="button"
            onClick={() => setPersona('doctor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              persona === 'doctor'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Comprehensive clinical physician view"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Clinical</span>
          </button>
          <button
            type="button"
            onClick={() => setPersona('action')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              persona === 'action'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Action-oriented checklist & diet tips"
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>Action Plan</span>
          </button>
        </div>

        {/* Reset Chat Button */}
        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-slate-800 transition-all font-mono"
            title="Clear Chat History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        )}
      </div>

      {/* Message History */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scroll-smooth custom-scrollbar" 
        id="messages-container"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-6 py-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                <Bot className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="space-y-1 max-w-md">
                <h4 className="text-base font-bold text-white tracking-wide">Report Analyzed & Ready</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  I'm here to walk you through your findings, explain abnormal symptoms, suggest questions for your doctor, or explore lifestyle improvements.
                </p>
              </div>

              {/* Quick Prompt Cards */}
              <div className="w-full max-w-2xl pt-2">
                <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-3">Popular Discussion Starters</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {QUICK_STARTERS.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => sendQuery(item.prompt)}
                        className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-left transition-all flex items-start gap-3 group"
                      >
                        <div className="p-2 bg-slate-800 group-hover:bg-cyan-500/20 rounded-lg text-cyan-400 transition-colors shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                            {item.label}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                            Click to ask
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {messages.map((message) => (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              key={message.id}
              className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`flex max-w-[88%] md:max-w-[80%] space-x-3.5 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border shadow-sm ${
                  message.role === 'user' 
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' 
                  : 'bg-slate-800 border-slate-700 text-cyan-400'
                }`}>
                  {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble Container */}
                <div className="space-y-2">
                  <div className={`p-4 md:p-5 rounded-2xl relative transition-all ${
                    message.role === 'user' 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-[0_4px_20px_rgba(6,182,212,0.25)]' 
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none font-sans leading-relaxed shadow-lg'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                    {/* Timestamp & Tool Actions */}
                    <div className={`mt-3 pt-2 flex items-center justify-between text-[10px] font-mono border-t ${
                      message.role === 'user' ? 'border-white/20 text-cyan-100' : 'border-slate-800 text-slate-500'
                    }`}>
                      <span>{message.timestamp}</span>

                      {message.role === 'assistant' && (
                        <div className="flex items-center space-x-2">
                          {/* Speak aloud button */}
                          <button
                            onClick={() => handleSpeak(message.id, message.content)}
                            className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                              speakingId === message.id ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                            }`}
                            title={speakingId === message.id ? "Stop voice" : "Listen to response"}
                          >
                            {speakingId === message.id ? (
                              <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Copy button */}
                          <button
                            onClick={() => handleCopy(message.id, message.content)}
                            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors"
                            title="Copy response"
                          >
                            {copiedId === message.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Like feedback */}
                          <button
                            onClick={() => handleToggleLike(message.id)}
                            className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                              message.liked ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                            }`}
                            title="Helpful response"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Follow-up Suggestions Chips */}
                  {message.role === 'assistant' && message.followUps && message.followUps.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1 pl-1">
                      {message.followUps.map((chip, chipIdx) => (
                        <button
                          key={chipIdx}
                          onClick={() => sendQuery(chip)}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 hover:bg-cyan-500/15 border border-slate-800 hover:border-cyan-500/30 rounded-full text-xs text-slate-300 hover:text-cyan-300 transition-all font-sans group shadow-sm disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3 text-cyan-400 group-hover:scale-110 transition-transform" />
                          <span>{chip}</span>
                          <ArrowRight className="w-2.5 h-2.5 text-slate-500 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing Animation */}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex max-w-[80%] space-x-3.5">
                <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 rounded-tl-none flex items-center space-x-3">
                  <span className="text-xs text-cyan-400 font-mono">Thinking</span>
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0s]"></div>
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 md:p-5 border-t border-slate-800 bg-slate-950/80 space-y-3" id="chat-input-form">
        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[10px] text-cyan-400/80 font-mono shrink-0 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> Suggestions:
          </span>
          {[
            "Summarize abnormal findings",
            "What diet helps most?",
            "What should I ask my doctor?",
            "Is any test urgent?",
            "Explain in 1 simple sentence"
          ].map((quickQ, i) => (
            <button
              key={i}
              type="button"
              onClick={() => sendQuery(quickQ)}
              disabled={isLoading}
              className="px-2.5 py-1 bg-slate-900 hover:bg-cyan-500/15 border border-slate-800 hover:border-cyan-500/40 rounded-lg text-slate-300 hover:text-cyan-200 shrink-0 transition-all font-sans disabled:opacity-50 text-[11px]"
            >
              {quickQ}
            </button>
          ))}
        </div>

        <div className="relative flex items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything (e.g., 'What foods should I eat?' or 'Explain creatinine')..."
            className="w-full pl-5 pr-14 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-200 placeholder:text-slate-500 focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition-all shadow-inner text-sm font-sans"
            id="chat-input"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 bg-cyan-500 text-slate-950 rounded-xl hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)] active:scale-95 font-bold"
            id="send-button"
            title="Send inquiry"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-2">
          <span>MODE: {persona.toUpperCase()} COMPANION</span>
          <span className="hidden sm:inline">NO SYMBOLS • DIRECT CONVERSATIONAL AI</span>
        </div>
      </form>
    </div>
  );
}

