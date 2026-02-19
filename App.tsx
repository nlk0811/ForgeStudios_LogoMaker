import React, { useMemo, useRef, useState } from 'react';
import { Logo } from './components/Logo';
import { GeminiService } from './services/geminiService';
import { EditedImage, ProcessingStatus } from './types';

type Mode = 'generate' | 'edit';

const STARTER_PROMPT =
  "Minimalist vector logo for 'ForgeStudios', futuristic monogram F, electric blue highlights, charcoal body, flat vector style, white or transparent background.";

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('generate');
  const [prompt, setPrompt] = useState(STARTER_PROMPT);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [history, setHistory] = useState<EditedImage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const isBusy = status === 'processing' || status === 'uploading';

  const mainTitle = mode === 'generate' ? 'Ready to generate' : 'Ready to edit';
  const mainSubtitle =
    mode === 'generate'
      ? 'Describe your vision in the prompt box below'
      : 'Upload source image and describe the transformation';

  const primaryActionText = useMemo(() => {
    if (status === 'processing') return '...';
    return mode === 'generate' ? 'Generate' : 'Apply';
  }, [mode, status]);

  const onUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus('uploading');
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setOriginalImage(base64);
      setCurrentImage(base64);
      setMode('edit');
      setStatus('idle');
    };
    reader.onerror = () => {
      setStatus('error');
      setErrorMessage('Could not read the selected image file.');
    };

    reader.readAsDataURL(file);
  };

  const onGenerateOrEdit = async () => {
    if (!prompt.trim()) {
      setStatus('error');
      setErrorMessage('Please enter a prompt first.');
      return;
    }

    if (mode === 'edit' && !currentImage) {
      setStatus('error');
      setErrorMessage('Please upload a source image for edit mode.');
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
        setErrorMessage('No image was returned. Try a clearer logo prompt.');
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
      if (mode === 'generate' || !originalImage) {
        setOriginalImage(result);
      }
      setHistory((prev) => [entry, ...prev]);
      setStatus('idle');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Request failed.');
    }
  };

  const onRevert = () => {
    if (!originalImage || isBusy) return;
    setCurrentImage(originalImage);
  };

  const onDownload = () => {
    if (!currentImage || isBusy) return;
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `forgestudios-logo-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <Logo className="brand-icon" />
          <h1>
            FORGE<span>STUDIOS</span>
          </h1>
        </div>

        <div className="mode-switch" role="tablist" aria-label="Mode switch">
          <button className={mode === 'edit' ? 'active' : ''} onClick={() => setMode('edit')}>
            EDITOR
          </button>
          <button className={mode === 'generate' ? 'active' : ''} onClick={() => setMode('generate')}>
            GENERATOR
          </button>
        </div>

        <button className="source-btn" onClick={() => inputRef.current?.click()}>
          + Source
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
      </header>

      <main className="workspace">
        <section className="canvas-panel panel">
          <div className="canvas-frame">
            {currentImage ? (
              <img src={currentImage} alt="Generated logo preview" className="preview-image" />
            ) : (
              <div className="center-empty">
                <div className="spark-box">✦</div>
                <h2>{mainTitle}</h2>
                <p>{mainSubtitle}</p>
              </div>
            )}
          </div>

          <div className="prompt-panel">
            <div className="prompt-header">
              <span>{mode === 'generate' ? 'GENERATION PROMPT' : 'EDIT INSTRUCTION'}</span>
              <button onClick={() => setPrompt(STARTER_PROMPT)}>LOAD LOGO PRESET</button>
            </div>
            <div className="prompt-input-row">
              <textarea
                rows={3}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={mode === 'generate' ? 'Describe your logo idea...' : 'Describe how to edit the uploaded logo...'}
                disabled={isBusy}
              />
              <button className="send-btn" onClick={onGenerateOrEdit} disabled={isBusy} title={primaryActionText}>
                {primaryActionText}
              </button>
            </div>

            <div className="bottom-actions">
              <div className="left-actions">
                <button onClick={onRevert} disabled={!originalImage || originalImage === currentImage || isBusy}>
                  REVERT
                </button>
                <button onClick={onDownload} disabled={!currentImage || isBusy}>
                  EXPORT
                </button>
              </div>
              {status === 'error' && <p className="error-text">⚠ PROCESS ABORTED: {errorMessage}</p>}
            </div>
          </div>
        </section>

        <aside className="side-stack">
          <section className="history-panel panel">
            <h3>FORGE HISTORY</h3>
            {history.length === 0 ? (
              <div className="history-empty">
                <p>FORGE HISTORY IS EMPTY</p>
              </div>
            ) : (
              <ul>
                {history.map((item) => (
                  <li key={item.id} onClick={() => setCurrentImage(item.editedUrl)}>
                    <img src={item.editedUrl} alt={item.prompt} />
                    <div>
                      <p>{item.prompt}</p>
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="notes-panel panel">
            <h4>LABORATORY NOTES</h4>
            <ul>
              <li>Use GENERATOR mode for pure creation.</li>
              <li>EDITOR mode preserves source structure.</li>
              <li>Use “flat”, “minimalist”, “vector logo” for cleaner results.</li>
              <li>API key source: import.meta.env.VITE_GEMINI_API_KEY.</li>
            </ul>
          </section>
        </aside>
      </main>
    </div>
  );
};

export default App;
