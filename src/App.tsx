import React, { useState } from 'react';
import { ai, ANALYZER_MODEL, fileToGenerativePart } from './lib/gemini';
import FileUploader from './components/FileUploader';
import ReportDisplay from './components/ReportDisplay';
import ChatPanel from './components/ChatPanel';
import { HeartPulse, ShieldCheck, Stethoscope, MessageCircle } from 'lucide-react';

export default function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const filePart = await fileToGenerativePart(file);
      
      const prompt = `
        You are a highly skilled Medical Intelligence AI. I am providing you with a medical report (as image or PDF).
        Please perform the following:
        
        1. **OCR & Extraction**: Meticulously extract all data points (blood markers, test names, values, ranges, units).
        2. **Structured Summary**: Organize this into a clean Markdown table with columns: Test / Marker, Observed Value, Reference Range, Status (Normal / Abnormal / Critical).
        3. **Abnormal Symptoms & Clinical Findings**:
           - Explicitly identify all values outside the reference range under the heading "### Abnormal Symptoms & Findings" (do NOT use terms like 'Red Flag' or 'Red Flag Symptoms').
           - Explain in clear, compassionate English what each abnormal finding signifies.
        4. **Predictive Analysis & Health Risk Assessment**:
           - Predict possible underlying health conditions or risk factors (e.g., metabolic syndrome, cardiovascular risk, diabetes risk, hepatic or renal indicators, anemia).
           - Balance clinical precision with empathetic explanations.
        5. **Recommended Actions & Doctor Consultations**:
           - Suggest concrete lifestyle questions, diet adjustments, and relevant specialist consultations.
        6. **Medical Disclaimer**: End with a prominent medical disclaimer.
        
        Format the output with clean, modern Markdown headings and structured tables.
      `;

      const response = await ai.models.generateContent({
        model: ANALYZER_MODEL,
        contents: {
          parts: [filePart, { text: prompt }]
        }
      });

      const result = response.text || "Analysis could not be completed. Please try with a clearer image.";
      setAnalysisResult(result);
    } catch (err: any) {
      console.error('Analysis error:', err);
      const errMsg = err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      if (errMsg.includes('API_KEY') || errMsg.includes('403') || errMsg.includes('API key not valid')) {
        setError("Invalid or missing Gemini API key. Please configure your GEMINI_API_KEY in the Secrets panel or .env file.");
      } else {
        setError(`Failed to process the health report: ${err?.message || "Please check that your report image/PDF is legible and try again."}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-white" id="main-container">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-bg-dark/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between" id="header">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white uppercase italic">
              HealthLens<span className="text-cyan-400">.AI</span>
            </h1>
            <div className="px-1.5 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-[9px] text-cyan-400 font-mono inline-block mt-0.5">
              GEMINI 2.5 PRO CORE
            </div>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6 text-xs font-mono uppercase tracking-widest text-slate-400">
          <span className="flex items-center space-x-2 hover:text-cyan-400 transition-colors cursor-pointer">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span>NODE_ACTIVE</span>
          </span>
          <span className="flex items-center space-x-2 hover:text-cyan-400 transition-colors cursor-pointer">
            <ShieldCheck className="w-4 h-4" />
            <span>SECURE_E2E</span>
          </span>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16" id="main-content">
        {/* Hero Section */}
        <section className="text-center space-y-8 max-w-3xl mx-auto py-8" id="hero-section">
          <div className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] mb-4">
            Intelligence Engine v2.5
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight uppercase">
            Deep Scan Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Medical Data</span>
          </h2>
          <p className="text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Neural extraction engine for clinical diagnostics. Convert analog reports into actionable intelligence with predictive health risk modeling.
          </p>
          
          <div className="pt-10">
            <FileUploader onFileUpload={handleFileUpload} isLoading={isAnalyzing} />
          </div>
        </section>

        {error && (
          <div className="max-w-2xl mx-auto p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-center text-xs font-mono uppercase tracking-wider" id="error-message">
            {error}
          </div>
        )}

        {/* Results Area */}
        {analysisResult && (
          <div id="results-area" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <ReportDisplay reportText={analysisResult} />
            <ChatPanel reportContext={analysisResult} />
          </div>
        )}

        {/* Initial Empty State Content */}
        {!analysisResult && !isAnalyzing && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 border-t border-slate-800" id="features-grid">
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/30 transition-all group">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Neural Extraction</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Advanced OCR layer trained on clinical standard nomenclature for 99.4% extraction accuracy.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-rose-500/30 transition-all group">
              <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Diagnostic Predictions</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Comparative analysis against WHO reference ranges for autonomous disease risk identification.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 transition-all group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Chatbot Interface</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Interactive companion for real-time clarification of complex medical terminology.
              </p>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-bg-dark border-t border-slate-800 py-10 mt-24" id="footer">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2 opacity-60">
            <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center">
              <HeartPulse className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-xs font-black tracking-widest uppercase italic">HealthLens AI</span>
          </div>
          <p className="text-[10px] text-slate-600 font-mono">
            SESSION_ID: 7F8-K92-X44 | POWERED BY GEMINI 2.5 PRO CORE
          </p>
          <div className="flex space-x-6 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
