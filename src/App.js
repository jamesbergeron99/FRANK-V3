import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Mic, MicOff, Pause, Play, RotateCcw, Loader2, AlertCircle, FileUp, ClipboardList, MessageSquare, Trash2, CheckCircle2, Zap, ZapOff, BookOpen, Download, Volume2, Image as ImageIcon, Sparkles, Stethoscope, ChevronRight, Activity, Scissors, XCircle, Zap as ZapIcon, Users, SkipBack, SkipForward, StopCircle, PlayCircle, Volume1 
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// --- CONFIGURATION ---
const apiKey = process.env.REACT_APP_GEMINI_API_KEY; 
const INWORLD_API_KEY = process.env.REACT_APP_INWORLD_API_KEY; 
const VOICE_ID = "default-oglabcjnetcklcq7rghmbw__jimmy"; 
const MODEL_ID = "inworld-tts-1.5-max";

const INWORLD_VOICES = [
  { id: 'default-oglabcjnetcklcq7rghmbw__jimmy', name: 'Jimmy (Default Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__alex', name: 'Alex (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__craig', name: 'Craig (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__dennis', name: 'Dennis (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__mark', name: 'Mark (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__clive', name: 'Clive (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__ashley', name: 'Ashley (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__deborah', name: 'Deborah (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__elizabeth', name: 'Elizabeth (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__olivia', name: 'Olivia (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__priya', name: 'Priya (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__hana', name: 'Hana (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__julia', name: 'Julia (Child)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__pixie', name: 'Pixie (Child)' }
];

const firebaseConfig = { apiKey: "mock", authDomain: "mock", projectId: "mock", storageBucket: "mock", messagingSenderId: "000", appId: "000" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const App = () => {
  const [messages, setMessages] = useState([{ role: 'assistant', content: "I'm Frank. Send me the script when you're ready to get real." }]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [lastScriptContent, setLastScriptContent] = useState("");
  const [posterUrl, setPosterUrl] = useState(null);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [parsedLines, setParsedLines] = useState([]);
  const [cast, setCast] = useState([]);
  const [voiceAssignments, setVoiceAssignments] = useState({ Narrator: '' }); 
  const [readState, setReadState] = useState('stopped'); 
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const scrollRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' }); }, [messages, isProcessing]);

  // --- BRAIN LOGIC (WITH DETAILED ERROR HANDSHAKE) ---
  const handleFrankResponse = async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInputText('');
    setIsProcessing(true);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `You are Frank, a blunt script executive. Reply to: ${text}` }] }] })
      });

      const data = await res.json();

      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Handshake Error (${data.error.status}): ${data.error.message}. Check Render Keys.` }]);
      } else {
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
        setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection failed. Possible API Key mismatch in Render." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- POSTER LOGIC ---
  const generatePoster = async () => {
    setIsGeneratingPoster(true);
    // Simulation for Poster Tab
    setTimeout(() => {
      setPosterUrl("https://via.placeholder.com/600x900.png?text=Frank+Executive+Series");
      setIsGeneratingPoster(false);
    }, 2000);
  };

  // --- READ-THROUGH LOGIC ---
  useEffect(() => {
    if (!lastScriptContent) return;
    const lines = lastScriptContent.split('\n');
    const parsed = lines.map(l => {
      const trimmed = l.trim();
      const isChar = trimmed === trimmed.toUpperCase() && trimmed.length > 2 && trimmed.length < 20;
      if (isChar) {
        if (!cast.includes(trimmed)) setCast(prev => [...new Set([...prev, trimmed])]);
        return { type: 'character', text: trimmed };
      }
      return { type: 'dialogue', text: trimmed };
    }).filter(l => l.text);
    setParsedLines(parsed);
  }, [lastScriptContent]);

  const extractTextFromPDF = async (file) => {
    if (!window.pdfjsLib) {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      document.head.appendChild(s);
      await new Promise(r => s.onload = r);
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map(item => item.str).join(" ") + "\n";
    }
    return fullText;
  };

  const handleScriptUpload = async (file) => {
    const text = file.type === 'application/pdf' ? await extractTextFromPDF(file) : await file.text();
    setLastScriptContent(text);
    handleFrankResponse(`[Script Uploaded] Analyze this: ${text.slice(0, 2000)}`);
  };

  return (
    <div className="flex flex-col h-screen bg-[#faf9f6] text-[#2c2c2c] overflow-hidden text-sm">
      <header className="flex items-center justify-between px-8 py-5 bg-white border-b shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black rounded flex items-center justify-center text-white font-bold italic shadow-lg">F</div>
          <div><h1 className="text-xl font-black uppercase tracking-tighter">Frank</h1><p className="text-[8px] uppercase tracking-[0.3em] font-bold mt-1 text-stone-400">Executive Series Office</p></div>
        </div>
        <div className="flex items-center gap-6 text-[10px] font-bold tracking-widest text-stone-400 uppercase">
          <button onClick={() => setActiveTab('chat')} className={activeTab === 'chat' ? 'border-b-2 border-black text-black' : ''}>LOUNGE</button>
          <button onClick={() => setActiveTab('read-through')} className={activeTab === 'read-through' ? 'border-b-2 border-black text-black' : ''}>READ-THROUGH</button>
          <button onClick={() => setActiveTab('poster')} className={activeTab === 'poster' ? 'border-b-2 border-black text-black' : ''}>POSTER</button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-6 ${m.role === 'user' ? 'bg-stone-800 text-white rounded-2xl shadow-xl' : 'bg-white border shadow-sm'}`}>{m.content}</div>
                </div>
              ))}
              {isProcessing && <div className="p-10 animate-pulse text-stone-400 italic font-bold">Frank is thinking...</div>}
              <div ref={scrollRef} />
            </div>
            <div className="bg-white border-t p-5 shrink-0 shadow-lg">
              <div className="flex items-center gap-4 max-w-5xl mx-auto w-full">
                <input value={inputText} onChange={e => setInputText(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleFrankResponse(inputText)} placeholder="Defend your arc..." className="flex-1 px-6 py-4 bg-stone-50 rounded-xl outline-none" />
                <button onClick={() => handleFrankResponse(inputText)} className="w-12 h-12 bg-stone-800 text-white rounded-full flex items-center justify-center"><Send size={18} /></button>
                <label className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center cursor-pointer hover:bg-stone-100 transition-all"><FileUp size={20}/><input type="file" className="hidden" accept=".pdf" onChange={(e) => handleScriptUpload(e.target.files[0])} /></label>
              </div>
            </div>
          </>
        )}

        {activeTab === 'read-through' && (
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            <div className="bg-stone-900 text-white p-4 flex items-center justify-between px-8">
               <button onClick={() => setReadState('playing')} className="px-8 py-2 bg-white text-black rounded-full font-black uppercase text-xs">PLAY TABLE READ</button>
               <button onClick={() => setReadState('stopped')} className="p-2 bg-stone-800 rounded-full text-red-400"><StopCircle size={16} /></button>
            </div>
            <div className="flex-1 flex overflow-hidden text-black">
               <div className="w-1/3 bg-[#faf9f6] border-r p-10 overflow-y-auto">
                  <h2 className="text-xl font-black uppercase mb-8 flex items-center gap-3"><Users size={20}/> Casting</h2>
                  <div className="space-y-4">
                     {cast.map(char => (
                        <div key={char} className="bg-white p-4 rounded-xl border">
                           <div className="font-bold text-[10px] uppercase mb-2">{char}</div>
                           <select className="w-full bg-stone-50 border rounded p-2 text-xs">
                              {INWORLD_VOICES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                           </select>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="w-2/3 p-16 overflow-y-auto font-serif text-lg leading-relaxed text-stone-300">
                  {parsedLines.length > 0 ? parsedLines.map((line, idx) => (
                    <div key={idx} className="p-2 rounded mb-1">{line.text}</div>
                  )) : "Upload a script in the Lounge to cast characters."}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'poster' && (
          <div className="flex-1 flex flex-col items-center justify-center p-20 bg-stone-50">
            {posterUrl ? (
              <img src={posterUrl} className="w-80 shadow-2xl rounded-lg border-8 border-white" alt="Poster" />
            ) : (
              <button onClick={generatePoster} disabled={isGeneratingPoster} className="px-10 py-5 bg-black text-white rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all">
                {isGeneratingPoster ? "Working..." : "Generate Movie Poster"}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
