import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

export default function FileUploader({ onFileUpload, isLoading }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        setSelectedFile(file);
        onFileUpload(file);
      }
    }
  }, [onFileUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      onFileUpload(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative border border-slate-800 rounded-2xl p-12 transition-all duration-300 overflow-hidden ${
          isDragging ? 'bg-cyan-500/10 border-cyan-500/50 scale-[1.02]' : 'bg-slate-900/40 hover:border-slate-700'
        } ${isLoading ? 'opacity-80 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        id="file-upload-container"
      >
        {/* Scanning line effect during upload or hover */}
        {(isDragging || isLoading) && (
          <motion.div 
            initial={{ top: '-10%' }}
            animate={{ top: '110%' }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute left-0 w-full h-0.5 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-10"
          />
        )}
        
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          onChange={handleFileChange}
          accept="image/*,application/pdf"
          id="file-input"
        />
        
        <div className="flex flex-col items-center justify-center space-y-6 relative z-0">
          <div className="p-5 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 group-hover:scale-110 transition-transform">
            {isLoading ? (
              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            ) : (
              <Upload className="w-10 h-10 text-cyan-400" />
            )}
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white uppercase tracking-tight">
              {isDragging ? 'Drop Diagnostic Data' : 'Initialize Data Scan'}
            </p>
            <p className="text-xs text-slate-500 mt-2 font-mono uppercase tracking-widest">
              Supports JPEG, PNG, and PDF medical reports
            </p>
          </div>
          
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex flex-col items-center space-y-2"
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
                  />
                ))}
              </div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Neural Processing...</span>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6 p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between"
            id="selected-file-preview"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-800 rounded-lg">
                <FileText className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-200 truncate max-w-[250px] font-mono">
                  {selectedFile.name.toUpperCase()}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  SIZE: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!isLoading && (
              <button
                onClick={removeFile}
                className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-rose-400"
                id="remove-file-button"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
