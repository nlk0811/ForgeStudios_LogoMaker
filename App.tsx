import React, { useMemo, useRef, useState } from 'react';
import { Logo } from './components/Logo';
import { GeminiService } from './services/geminiService';
import { EditedImage, ProcessingStatus } from './types';

type Mode = 'generate' | 'edit';

const STARTER_PROMPT =
  "Minimalist vector logo for 'ForgeStudios' with a connected network-node style 'F', electric blue accent, charcoal base, white background, flat and modern.";

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('generate');
  const [prompt, setPrompt] = useState(STARTER_PROMPT);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [history, setHistory] = useState<EditedImage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const isBusy = status === 'processing' || status === 'uploading';

  const primaryActionText = useMemo(() => {
    if (status === 'processing') return 'Processing...';
    return mode === 'generate' ? 'Generate logo' : 'Edit logo';
  }, [mode, status]);

  const onUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus('uploading');
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setOriginalImage(result);
      setCurrentImage(result);
      setMode('edit');
      setStatus('idle');
    };
    reader.onerror = () => {
      setStatus('error');
      setErrorMessage('Unable to read uploaded image.');
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async () => {
    if (!prompt.trim()) {
      setStatus('error');
      setErrorMessage('Please enter a prompt/instruction first.');
      return;
    }

    if (mode === 'edit' && !currentImage) {
      setStatus('error');
      setErrorMessage('Upload an image before using edit mode.');
      return;
    }

    setStatus('processing');
    setErrorMessage('');

    try {
      const result =
        mode === 'generate'
          ? await GeminiService.generateLogo(prompt)
          : await GeminiService.editLogo(currentImage as string, prompt);

      if (!result) {
        setStatus('error');
        setErrorMessage('Gemini returned no image. Try a clearer prompt.');
        return;
      }

      const entry: EditedImage = {
        id: crypto.randomUUID(),
        originalUrl: mode === 'edit' ? (currentImage as string) : result,
        editedUrl: result,
        prompt,
        timestamp: Date.now(),
      };

      setCurrentImage(result);
      if (mode === 'generate' || !originalImage) setOriginalImage(result);
      setHistory((prev) => [entry, ...prev]);
      setStatus('idle');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong.');
    }
  };

  const onDownload = () => {
    if (!currentImage) return;
    const a = document.createElement('a');
    a.href = currentImage;
    a.download = `forgestudios-logo-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="page">
      <header className="header">
        <div className="brand">
          <Logo className="brand-logo" />
          <div>
            <h1>ForgeStudios Logo Maker</h1>
            <p>Gemini-powered logo generation and editing</p>
          </div>
        </div>
        <div className="header-actions">
          <button className={`mode-btn ${mode === 'generate' ? 'active' : ''}`} onClick={() => setMode('generate')}>
            Generate
          </button>
          <button className={`mode-btn ${mode === 'edit' ? 'active' : ''}`} onClick={() => setMode('edit')}>
            Edit
          </button>
          <button className="upload-btn" onClick={() => inputRef.current?.click()}>
            Upload Source
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
        </div>
      </header>

      <main className="layout">
        <section className="card preview-card">
          <div className="preview-area">
            {currentImage ? (
              <img src={currentImage} alt="Generated logo" />
            ) : (
              <div className="empty-state">
                <h2>No logo yet</h2>
                <p>Generate a new logo, or upload one and edit it.</p>
              </div>
            )}
          </div>
          <div className="preview-actions">
            <button onClick={onDownload} disabled={!currentImage || isBusy}>
              Download PNG
            </button>
            <button
              onClick={() => setCurrentImage(originalImage)}
              disabled={!originalImage || originalImage === currentImage || isBusy}
            >
              Revert to original
            </button>
          </div>
        </section>

        <section className="card controls-card">
          <label htmlFor="prompt">{mode === 'generate' ? 'Prompt' : 'Edit Instruction'}</label>
          <textarea
            id="prompt"
            rows={6}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={mode === 'generate' ? 'Describe the logo you want...' : 'Describe how to edit this logo...'}
            disabled={isBusy}
          />
          <button className="primary" onClick={onSubmit} disabled={isBusy}>
            {primaryActionText}
          </button>
          <div className="env-hint">
            API key source: <code>import.meta.env.VITE_GEMINI_API_KEY</code> (Vercel env variable)
          </div>
          {status === 'error' && <p className="error">{errorMessage}</p>}
        </section>

        <section className="card history-card">
          <h3>History</h3>
          {history.length === 0 ? (
            <p className="muted">No generations yet.</p>
          ) : (
            <ul>
              {history.map((item) => (
                <li key={item.id} onClick={() => setCurrentImage(item.editedUrl)}>
                  <img src={item.editedUrl} alt={item.prompt} />
                  <div>
                    <p>{item.prompt}</p>
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
