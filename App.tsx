
import React, { useState, useRef } from 'react';
import { GeminiService } from './services/geminiService';
import { Logo } from './components/Logo';
import { EditedImage, ProcessingStatus } from './types';

type Mode = 'edit' | 'generate';

const FORGE_STUDIOS_PROMPT = "Minimalist vector logo for 'ForgeStudios', letter F formed by three connected network nodes with geometric lines, digital spark element at top right, deep charcoal and electric blue color scheme, solid white background, flat design, clean tech aesthetic, no shading --no realistic texture detail";

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('edit');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [history, setHistory] = useState<EditedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('uploading');
    const reader = new FileReader();
    reader.onload = (event) => {
      const base = event.target?.result as string;
      setOriginalImage(base);
      setCurrentImage(base);
      setMode('edit');
      setStatus('idle');
    };
    reader.readAsDataURL(file);
  };

  const handleAction = async () => {
    if (!prompt.trim() && mode === 'generate') return;
    if (!currentImage && mode === 'edit') return;

    setStatus('processing');
    try {
      let resultBase64: string | null = null;
      
      if (mode === 'edit' && currentImage) {
        resultBase64 = await GeminiService.editImage(currentImage, prompt);
      } else {
        resultBase64 = await GeminiService.generateImage(prompt);
      }

      if (resultBase64) {
        const newEntry: EditedImage = {
          id: crypto.randomUUID(),
          originalUrl: currentImage || resultBase64,
          editedUrl: resultBase64,
          prompt: prompt || "Generated Image",
          timestamp: Date.now(),
        };
        setHistory(prev => [newEntry, ...prev]);
        setCurrentImage(resultBase64);
        if (mode === 'generate') setOriginalImage(resultBase64);
        setPrompt('');
        setStatus('idle');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const downloadImage = () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `forge-${mode}-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-slate-100">
      <header className="sticky top-0 z-50 bg-[#121212]/90 backdrop-blur-md border-b border-slate-800 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <h1 className="text-xl font-bold tracking-tight">
              FORGE<span className="electric-blue">STUDIOS</span>
            </h1>
          </div>
          
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
            <button 
              onClick={() => setMode('edit')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${mode === 'edit' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              EDITOR
            </button>
            <button 
              onClick={() => setMode('generate')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${mode === 'generate' ? 'bg-electric-blue text-[#0f172a] shadow-glow' : 'text-slate-500 hover:text-slate-300'}`}
            >
              GENERATOR
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-4">
             <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm font-medium border border-slate-700"
            >
              <i className="fa-solid fa-plus mr-2"></i> Source
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="relative h-[50vh] lg:h-[65vh] bg-[#121212] rounded-3xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl group">
            {currentImage ? (
              <img src={currentImage} alt="Main view" className="max-w-full max-h-full object-contain p-4" />
            ) : (
              <div 
                className="flex flex-col items-center gap-6 cursor-pointer p-12 text-center"
                onClick={() => mode === 'edit' ? fileInputRef.current?.click() : null}
              >
                <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-700 group-hover:border-electric-blue/50 transition-all group-hover:text-electric-blue">
                   <i className={`fa-solid ${mode === 'edit' ? 'fa-cloud-arrow-up' : 'fa-wand-magic-sparkles'} text-4xl`}></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{mode === 'edit' ? 'Upload to begin' : 'Ready to generate'}</h3>
                  <p className="text-slate-500 text-sm mt-2">
                    {mode === 'edit' ? 'Select a base image to forge new versions' : 'Describe your vision in the prompt box below'}
                  </p>
                </div>
              </div>
            )}

            {status === 'processing' && (
              <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-md flex flex-col items-center justify-center z-10">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-slate-800 border-t-electric-blue rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Logo className="w-6 h-6 animate-pulse" />
                  </div>
                </div>
                <p className="mt-6 text-sm font-bold electric-blue tracking-[0.3em] uppercase animate-pulse">Forging...</p>
              </div>
            )}
          </div>

          <div className="bg-[#121212] rounded-3xl border border-slate-800 p-8 shadow-xl">
             <div className="flex flex-col gap-6">
               <div className="flex items-center justify-between">
                 <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    {mode === 'edit' ? 'Mutation Instructions' : 'Generation Prompt'}
                 </label>
                 {mode === 'generate' && (
                    <button 
                      onClick={() => setPrompt(FORGE_STUDIOS_PROMPT)}
                      className="text-[10px] font-bold text-electric-blue/70 hover:text-electric-blue transition-colors uppercase tracking-widest"
                    >
                      Load Logo Preset
                    </button>
                 )}
               </div>
               <div className="relative group">
                 <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={mode === 'edit' ? "e.g., 'Replace the background with a futuristic lab'" : "e.g., 'Minimalist neon tiger head, vector art, black background'"}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-6 pr-16 focus:outline-none focus:ring-2 focus:ring-electric-blue/20 focus:border-electric-blue/50 transition-all resize-none h-32 text-lg font-light leading-relaxed placeholder:text-slate-700"
                  disabled={status === 'processing'}
                 />
                 <button 
                  onClick={handleAction}
                  disabled={(mode === 'edit' && !currentImage) || !prompt.trim() || status === 'processing'}
                  className="absolute bottom-6 right-6 bg-electric-blue text-[#0f172a] h-12 w-12 rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 disabled:opacity-30 disabled:scale-100 transition-all shadow-glow"
                  title={mode === 'edit' ? 'Apply Edit' : 'Generate New'}
                 >
                   <i className={`fa-solid ${mode === 'edit' ? 'fa-wand-magic-sparkles' : 'fa-sparkles'}`}></i>
                 </button>
               </div>

               <div className="flex items-center justify-between border-t border-slate-800 pt-6">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setCurrentImage(originalImage)}
                      disabled={!originalImage || currentImage === originalImage || status === 'processing'}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-20 uppercase tracking-widest"
                    >
                      Revert
                    </button>
                    <button 
                      onClick={downloadImage}
                      disabled={!currentImage || status === 'processing'}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-20 uppercase tracking-widest"
                    >
                      Export
                    </button>
                  </div>
                  {status === 'error' && (
                    <span className="text-xs font-bold text-red-400 uppercase tracking-widest animate-shake">
                      <i className="fa-solid fa-triangle-exclamation mr-2"></i> Process Aborted
                    </span>
                  )}
               </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#121212] rounded-3xl border border-slate-800 p-6 shadow-xl flex-1 flex flex-col h-[400px] lg:h-auto overflow-hidden">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">Forge History</h2>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-700 border-2 border-dashed border-slate-800/50 rounded-2xl">
                  <i className="fa-solid fa-ghost mb-4 text-3xl opacity-20"></i>
                  <p className="text-[10px] uppercase tracking-widest font-bold">Forge history is empty</p>
                </div>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.id} 
                    className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer hover:border-electric-blue/40 transition-all hover:translate-x-1"
                    onClick={() => setCurrentImage(item.editedUrl)}
                  >
                    <div className="aspect-video bg-black/20">
                      <img src={item.editedUrl} alt={item.prompt} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-500" />
                    </div>
                    <div className="p-4 bg-slate-900/80 backdrop-blur-sm border-t border-slate-800">
                      <p className="text-[10px] font-bold uppercase tracking-wider truncate text-slate-400 group-hover:text-electric-blue transition-colors">{item.prompt}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <i className="fa-solid fa-chevron-right text-[10px] text-slate-700"></i>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-electric-blue/5 rounded-3xl border border-electric-blue/10 p-8">
            <h3 className="text-xs font-bold text-electric-blue uppercase tracking-[0.2em] mb-4">Laboratory Notes</h3>
            <ul className="text-[11px] leading-relaxed text-slate-500 space-y-4 font-medium uppercase tracking-wider">
              <li className="flex gap-3"><i className="fa-solid fa-bolt text-electric-blue text-[10px] mt-0.5"></i> Use 'Generator' mode for pure creation.</li>
              <li className="flex gap-3"><i className="fa-solid fa-bolt text-electric-blue text-[10px] mt-0.5"></i> 'Editor' mode preserves structure.</li>
              <li className="flex gap-3"><i className="fa-solid fa-bolt text-electric-blue text-[10px] mt-0.5"></i> Mention "flat design" or "minimalist" for vector-like results.</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="p-8 border-t border-slate-800/50 text-center">
        <p className="text-[10px] text-slate-600 uppercase tracking-[0.3em] font-bold">
          ForgeStudios &bull; Neural Image Processor &bull; Est. 2025
        </p>
      </footer>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #00E5FF; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default App;
