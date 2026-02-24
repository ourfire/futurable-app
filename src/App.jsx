import React, { useState } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  BookOpen, 
  Loader2, 
  Copy, 
  Download, 
  Settings2,
  Share2,
  Maximize2,
  CheckCircle2
} from 'lucide-react';

// --- CONFIGURATION ---
// In production, set VITE_GEMINI_API_KEY in Netlify Environment Variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const TEXT_MODEL = "gemini-2.5-flash-preview-05-20";
const IMAGE_MODEL = "imagen-3.0-generate-002";

// --- LOGO COMPONENT ---
const FuturableLogo = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
    <path d="M30 70V30H70" stroke="currentColor" strokeWidth="4" strokeLinecap="square" />
    <rect x="45" y="45" width="25" height="25" fill="currentColor" />
    <circle cx="70" cy="30" r="5" fill="currentColor" />
  </svg>
);

// --- API KEY WARNING ---
const ApiKeyWarning = () => (
  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800 space-y-1">
    <p className="font-bold uppercase tracking-widest text-xs text-amber-600">⚠ API Key no configurada</p>
    <p>Agrega <code className="bg-amber-100 px-1 rounded font-mono text-xs">VITE_GEMINI_API_KEY</code> en las variables de entorno de Netlify (Site Settings → Environment Variables).</p>
  </div>
);

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [charLimit, setCharLimit] = useState(500);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const fetchWithRetry = async (url, options, retries = 5, backoff = 1000) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorBody}`);
      }
      return await response.json();
    } catch (err) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
      }
      throw err;
    }
  };

  const generateContent = async () => {
    if (!prompt || !API_KEY) return;
    setLoading(true);
    setStory('');
    setImageUrl('');
    setError('');
    setStatus('Iniciando proceso estratégico...');
    
    try {
      const systemPrompt = `
        Eres el Director Creativo de Agencia Futurable. 
        Escribe un micro-cuento de máximo ${charLimit} caracteres en español.
        Tono: Estratégico, post-biológico, "poesía aplicada", estilo Zen.
        Contexto: Escenarios futuros (2029-2050), singularidades económicas, arquitectura orgánica.
        Estilo: Denso, sin clichés, evita moralejas simples.
      `;

      // 1. Story Generation
      setStatus('Escribiendo micro-cuento...');
      const textResponse = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] }
          })
        }
      );

      const generatedStory = textResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
      setStory(generatedStory);

      // 2. Visual Prompt Generation
      setStatus('Diseñando prompt visual...');
      const styleGuide = `Cinematic, post-biological, egg-shaped concrete structures, integrated copper mesh, 80s circuitry patterns, soft volumetric lighting, 35mm film grain, desaturated muted tones.`;
      const imagePromptRequest = `Based on: "${generatedStory}", create a concise visual prompt following this style: ${styleGuide}. Focus on environment and mood. Return only the prompt text, no extra commentary.`;
      
      const promptResponse = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: imagePromptRequest }] }]
          })
        }
      );

      const visualPrompt = promptResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // 3. Image Generation
      setStatus('Renderizando activo Futurable...');
      const imageResponse = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:predict?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt: visualPrompt }],
            parameters: { sampleCount: 1 }
          })
        }
      );

      if (imageResponse.predictions?.[0]?.bytesBase64Encoded) {
        setImageUrl(`data:image/png;base64,${imageResponse.predictions[0].bytesBase64Encoded}`);
      }
    } catch (err) {
      console.error(err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(story);
    } catch {
      const el = document.createElement('textarea');
      el.value = story;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openFullScreen = () => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Futurable — ${prompt}</title>
      <style>body{margin:0;background:#1c1917;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:Georgia,serif;}
      .card{max-width:700px;padding:60px;color:#f5f5f4;text-align:center;}
      img{width:100%;border-radius:16px;margin-bottom:40px;}
      p{font-size:1.4rem;line-height:1.8;font-style:italic;color:#e7e5e4;}
      span{display:block;margin-top:20px;font-size:.6rem;letter-spacing:.3em;text-transform:uppercase;color:#78716c;font-family:sans-serif;}
      </style></head><body>
      <div class="card">
      ${imageUrl ? `<img src="${imageUrl}" alt="Futurable Asset" />` : ''}
      <p>${story}</p>
      <span>Agencia Futurable — ${new Date().toLocaleDateString('es-ES', {year:'numeric',month:'long'})}</span>
      </div></body></html>
    `);
  };

  return (
    <div className="min-h-screen bg-[#F4F1EE] text-[#2D2A26] p-4 md:p-12 font-sans selection:bg-teal-100">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Navigation & Branding */}
        <nav className="flex justify-between items-center border-b border-stone-300 pb-8">
          <div className="flex items-center gap-4">
            <FuturableLogo className="w-10 h-10 text-teal-800" />
            <div>
              <h1 className="text-xl font-bold tracking-tighter uppercase italic">Futurable <span className="font-light opacity-60">Gemma</span></h1>
              <p className="text-[10px] tracking-[0.2em] uppercase text-stone-500 font-medium">Estación de Generación Semanal</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-stone-400">
            <span>Estrategia</span>
            <span className="w-1 h-1 bg-stone-300 rounded-full" />
            <span>Poesía Aplicada</span>
            <span className="w-1 h-1 bg-stone-300 rounded-full" />
            <span>2029-2050</span>
          </div>
        </nav>

        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Controls - Left Column */}
          <div className="lg:col-span-5 space-y-8">
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 space-y-6">
              <div className="flex items-center gap-2 text-stone-400 mb-2">
                <Settings2 size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Configuración</span>
              </div>

              {!API_KEY && <ApiKeyWarning />}

              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-3 uppercase tracking-widest">Extensión del Micro Cuento</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl">
                  {[280, 500].map(limit => (
                    <button
                      key={limit}
                      onClick={() => setCharLimit(limit)}
                      className={`py-2 px-4 rounded-lg text-xs font-bold transition-all ${charLimit === limit ? 'bg-white text-teal-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                      {limit === 280 ? 'X / THREADS' : 'LINKEDIN / IG'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 mb-3 uppercase tracking-widest">Idea Seminal / Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ej: La singularidad económica de 2029 y el fin del hardware..."
                  className="w-full p-5 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-teal-800 focus:border-transparent transition-all outline-none resize-none h-32 text-sm leading-relaxed"
                />
              </div>

              <button
                onClick={generateContent}
                disabled={loading || !prompt || !API_KEY}
                className="w-full bg-teal-900 hover:bg-black text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />}
                <span className="tracking-widest uppercase text-xs">{loading ? status : 'Generar Post Semanal'}</span>
              </button>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-700 font-mono break-all">
                  {error}
                </div>
              )}
            </section>
          </div>

          {/* Canvas - Right Column */}
          <div className="lg:col-span-7">
            {!story && !imageUrl && !loading ? (
              <div className="h-full min-h-[400px] border-2 border-dashed border-stone-300 rounded-[2rem] flex items-center justify-center text-stone-400 flex-col gap-4">
                <div className="p-6 bg-stone-200/50 rounded-full">
                  <BookOpen size={48} strokeWidth={1} />
                </div>
                <p className="text-sm font-medium uppercase tracking-widest">Esperando señal estratégica...</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Social Media Preview Card */}
                <div className="bg-white rounded-[2rem] shadow-xl border border-stone-200 overflow-hidden flex flex-col md:flex-row min-h-[450px]">
                  
                  {/* Visual Part */}
                  <div className="md:w-1/2 bg-stone-900 relative aspect-square md:aspect-auto overflow-hidden">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Futurable Asset" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-stone-800 animate-pulse">
                        <ImageIcon className="text-stone-700" size={40} />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20">
                      <FuturableLogo className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Content Part */}
                  <div className="md:w-1/2 p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-teal-800">Agencia Futurable</span>
                        <div className="flex gap-2">
                          <button onClick={copyToClipboard} title="Copiar texto" className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                            {copied ? <CheckCircle2 size={16} className="text-green-600" /> : <Copy size={16} className="text-stone-400" />}
                          </button>
                        </div>
                      </div>
                      <p className="text-xl md:text-2xl font-serif italic leading-relaxed text-stone-800">
                        {story || "Destilando narrativa..."}
                      </p>
                    </div>

                    <div className="mt-8 space-y-4">
                      <div className="h-px bg-stone-100 w-full" />
                      <div className="flex justify-between items-center">
                        <div className="text-[9px] uppercase tracking-tighter text-stone-400 font-bold">
                          Caracteres: {story.length} / {charLimit}
                        </div>
                        <div className="flex gap-4">
                          {imageUrl && (
                            <a href={imageUrl} download="futurable_asset.png" className="text-[10px] font-bold uppercase tracking-widest hover:text-teal-800 transition-colors flex items-center gap-1">
                              <Download size={12} /> PNG
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meta-Actions */}
                <div className="flex justify-end gap-3 px-4">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-teal-800 transition-colors"
                  >
                    <Share2 size={14} /> Copiar Texto
                  </button>
                  <button
                    onClick={openFullScreen}
                    disabled={!story}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-teal-800 transition-colors disabled:opacity-30"
                  >
                    <Maximize2 size={14} /> Full Screen
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <footer className="border-t border-stone-200 pt-8 flex justify-between items-center text-[9px] uppercase tracking-widest text-stone-400 font-bold">
          <span>© {new Date().getFullYear()} Agencia Futurable</span>
          <span>Powered by Gemini API</span>
        </footer>
      </div>
    </div>
  );
}
