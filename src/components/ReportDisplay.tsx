import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AlertCircle, Activity, ClipboardList, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface ReportDisplayProps {
  reportText: string;
}

export default function ReportDisplay({ reportText }: ReportDisplayProps) {
  if (!reportText) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 w-full max-w-5xl mx-auto pb-12"
      id="report-analysis-display"
    >
      <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 flex items-start space-x-4 backdrop-blur-sm" id="medical-disclaimer">
        <AlertCircle className="w-5 h-5 text-rose-400 mt-1 flex-shrink-0" />
        <div>
          <p className="text-xs font-black text-rose-400 uppercase tracking-widest mb-1">Critical Medical Disclaimer</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            This autonomous AI diagnostic projection is synthesized for investigative purposes. 
            It is not a substitute for professional clinical judgment. Direct all findings to a certified medical officer.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-slate-800 shadow-2xl lg:col-span-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-transparent"></div>
          <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
            <div className="flex items-center space-x-3">
              <ClipboardList className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Structured Medical Insight</h2>
            </div>
            <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold rounded uppercase tracking-widest">
              LENS_SCAN_COMPLETE
            </div>
          </div>
          <div className="prose prose-invert prose-cyan max-w-none 
            prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-wider prose-headings:text-cyan-400 prose-headings:border-l-2 prose-headings:border-cyan-500/30 prose-headings:pl-4
            prose-p:text-slate-300 prose-p:leading-relaxed
            prose-table:border prose-table:border-slate-800 prose-table:rounded-xl prose-table:overflow-hidden
            prose-th:bg-slate-950/50 prose-th:text-slate-400 prose-th:px-4 prose-th:py-3 prose-th:uppercase prose-th:text-[10px] prose-th:tracking-widest prose-th:font-mono
            prose-td:px-4 prose-td:py-3 prose-td:text-sm prose-td:border-t prose-td:border-slate-800 prose-td:font-mono" 
            id="markdown-content"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{reportText}</ReactMarkdown>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-6 rounded-3xl shadow-[0_10px_30px_rgba(6,182,212,0.3)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="w-5 h-5 text-white" />
              <h3 className="font-black text-white uppercase tracking-wider text-xs">Diagnostic Certainty</h3>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl font-black text-white">99.4</span>
              <span className="text-xl font-bold text-white/70">%</span>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/80 mt-2">
              Neural Processing Active
            </p>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
            <div className="flex items-center space-x-2 mb-6 text-white">
              <Info className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold uppercase tracking-widest text-xs">Clinical Directives</h3>
            </div>
            <ul className="space-y-4">
              {[
                "Consult primary health officer regarding flagged markers.",
                "Utilize Chat AI for terminology clarification.",
                "Archive report for temporal trend analytics."
              ].map((text, i) => (
                <li key={i} className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full mt-1.5 mr-3 flex-shrink-0 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  <p className="text-xs text-slate-400 leading-snug">{text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Data Status</div>
            <div className="text-xs text-emerald-300 font-mono">FULLY_DIGITIZED_E2E</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
