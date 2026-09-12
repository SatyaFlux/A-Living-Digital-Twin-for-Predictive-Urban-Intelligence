import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, X, Send, Sparkles, ShieldCheck, Database
} from 'lucide-react';
import { ChatMessage } from '../../types';
import { api } from '../../services/api';

interface TwinAIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_welcome',
    sender: 'assistant',
    text: "Hello! I am **TwinAI**, your grounded Urban Digital Twin Copilot. I analyze real-time multi-node telemetry, time-series ML models, and smart city operational policies. How can I assist your urban decision-making today?",
    timestamp: '12:00 PM',
    suggested_followups: [
      "Why is traffic increasing near Gate 2?",
      "What will traffic look like in 30 minutes?",
      "Which area has the highest pollution?",
      "What happens if Road A is closed?"
    ]
  }
];

const createMessageId = (prefix: string) => `${prefix}_${Date.now()}`;
const getFormattedTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const TwinAIChatDrawer: React.FC<TwinAIChatDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const timeStr = getFormattedTime();
    const userMsg: ChatMessage = {
      id: createMessageId('user'),
      sender: 'user',
      text: query,
      timestamp: timeStr
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.sendChatMessage(query);
      const aiMsg: ChatMessage = {
        id: createMessageId('ai'),
        sender: 'assistant',
        text: response.reply,
        timestamp: getFormattedTime(),
        sources: response.grounded_sources,
        suggested_followups: response.suggested_followups,
        is_telemetry_backed: response.is_telemetry_backed
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: createMessageId('err'),
        sender: 'assistant',
        text: "I am unable to query live twin state right now. Please ensure the backend server is active.",
        timestamp: getFormattedTime()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="relative z-50 w-full max-w-lg glass-panel h-full flex flex-col border-l border-slate-800/80 shadow-2xl bg-slate-950/95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-md shadow-cyan-500/20 text-white">
              <Bot className="w-5 h-5 animate-pulse-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">TwinAI Grounded Copilot</h3>
                <span className="flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Grounded RAG
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Zero Hallucination Telemetry Reasoning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] p-3.5 rounded-2xl ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">
                  {m.text}
                </div>

                {/* Grounded Citations */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5">
                    <div className="text-[10px] uppercase font-mono font-bold text-cyan-400 flex items-center">
                      <Database className="w-3 h-3 mr-1" /> Grounded Evidence & Sources:
                    </div>
                    {m.sources.map((src, i) => (
                      <div
                        key={i}
                        className="text-[11px] bg-slate-950/70 p-2 rounded-lg border border-slate-800 text-slate-300"
                      >
                        <div className="font-semibold text-cyan-300 flex items-center justify-between">
                          <span>{src.title}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {Math.round(src.confidence * 100)}% Match
                          </span>
                        </div>
                        <p className="text-slate-400 mt-0.5 text-[10px] line-clamp-2">{src.snippet}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-[10px] text-slate-500 mt-1 px-1">{m.timestamp}</span>

              {/* Follow-up Prompts */}
              {m.suggested_followups && m.suggested_followups.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {m.suggested_followups.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900/80 text-cyan-300 hover:bg-cyan-950/60 border border-cyan-500/30 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-cyan-400 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800 w-fit">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Querying live telemetry & vector index...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask TwinAI (e.g., Why is Gate 2 congested?)"
              className="flex-1 bg-slate-950/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
