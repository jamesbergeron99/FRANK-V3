import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Mic, MicOff, Pause, Play, RotateCcw, Loader2, AlertCircle, FileUp, ClipboardList, MessageSquare, Trash2, CheckCircle2, Zap, ZapOff, BookOpen, Download, Volume2, Image as ImageIcon, Sparkles, Stethoscope, ChevronRight, Activity, Scissors, XCircle, Zap as ZapIcon, Users, SkipBack, SkipForward, StopCircle, PlayCircle, Volume1 
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// --- CONFIGURATION ---
const apiKey = process.env.REACT_APP_GEMINI_API_KEY; 

// Inworld TTS Credentials - Natural Jimmy Voice (LOCKED DEFAULT)
const INWORLD_API_KEY = process.env.REACT_APP_INWORLD_API_KEY; 
const VOICE_ID = "default-oglabcjnetcklcq7rghmbw__jimmy"; 
const MODEL_ID = "inworld-tts-1.5-max";

const INWORLD_VOICES = [
  { id: 'default-oglabcjnetcklcq7rghmbw__jimmy', name: 'Jimmy (Default Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__alex', name: 'Alex (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__craig', name: 'Craig (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__dennis', name: 'Dennis (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__edward', name: 'Edward (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__hades', name: 'Hades (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__mark', name: 'Mark (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__clive', name: 'Clive (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__carter', name: 'Carter (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__ethan', name: 'Ethan (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__tyler', name: 'Tyler (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__jason', name: 'Jason (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__ronald', name: 'Ronald (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__shaun', name: 'Shaun (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__theodore', name: 'Theodore (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__oliver', name: 'Oliver (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__simon', name: 'Simon (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__elliot', name: 'Elliot (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__james', name: 'James (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__vinny', name: 'Vinny (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__brian', name: 'Brian (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__jake', name: 'Jake (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__derek', name: 'Derek (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__grant', name: 'Grant (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__ashley', name: 'Ashley (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__deborah', name: 'Deborah (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__elizabeth', name: 'Elizabeth (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__olivia', name: 'Olivia (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__priya', name: 'Priya (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__sarah', name: 'Sarah (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__hana', name: 'Hana (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__chloe', name: 'Chloe (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__lauren', name: 'Lauren (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__jessica', name: 'Jessica (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__amina', name: 'Amina (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__kelsey', name: 'Kelsey (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__darlene', name: 'Darlene (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__julia', name: 'Julia (Child-like)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__pixie', name: 'Pixie (Child-like)' }
];

const DEMO_SCRIPT = `INT. SUNSET BLVD EXECUTIVE OFFICE - DAY\n\nFrank sits behind a massive mahogany desk. He's smoking a cigar that costs more than a car.\n\nFRANK\nI told you, kid. The third act needs explosions.\n\nWRITER\n(nervously)\nBut it's a quiet drama about a family grieving...\n\nFRANK\n(laughing)\nGrieving? I'll give them something to grieve about when the box office numbers come in. Add the explosions.`;

const firebaseConfig = process.env.REACT_APP_FIREBASE_CONFIG ? JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG) : { apiKey: "mock", authDomain: "mock", projectId: "mock", storageBucket: "mock", messagingSenderId: "000", appId: "000" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'frank-exec-series-v14';

const fetchWithRetry = async (url, options) => {
  const delays = [1000, 2000, 4000, 8000, 16000];
  for (let i = 0; i <= 4; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
    } catch (e) { if (i === 4) throw e; }
    await new Promise(r => setTimeout(r, delays[i]));
  }
};

const extractTextFromPDF = async (file) => {
  if (!window.pdfjsLib) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const items = content.items.slice().sort((a, b) => {
      if (Math.abs(a.transform[5] - b.transform[5]) > 4) return b.transform[5] - a.transform[5];
      return a.transform[4] - b.transform[4];
    });
    let currentLine = "";
    items.forEach(item => { currentLine += item.str; });
    fullText += currentLine + '\n\n';
  }
  return fullText;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([{ role: 'assistant', content: "I'm Frank. Let's quit the posturing and see if these pages have a heartbeat. Send me the script when you're ready to get real." }]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [errorMessage, setErrorMessage] = useState(null);
  const [lastScriptContent, setLastScriptContent] = useState("");
  const [parsedLines, setParsedLines] = useState([]);
  const [cast, setCast] = useState([]);
  const [voiceAssignments, setVoiceAssignments] = useState({ Narrator: '' }); 
  const [readState, setReadState] = useState('stopped'); 
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const scrollRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const activeLineRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' }); }, [messages, isProcessing]);

  // --- BRAIN FIX: RESTORED MESSAGE UPDATING ---
  const handleFrankResponse = async (text) => {
    if (!text.trim()) return;
    
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const res = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `You are Frank, a blunt executive. Critical pass on: ${text}` }] }] })
      });
      const data = await res.json();
      const frankText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (frankText) {
        setMessages(prev => [...prev, { role: 'assistant', content: frankText }]);
      }
    } catch (e) { setErrorMessage("Analysis failed."); } finally { setIsProcessing(false); }
  };

  const handleScriptUpload = async (file) => {
    if (!file) return;
    setIsProcessing(true);
    const text = file.type === 'application/pdf' ? await extractTextFromPDF(file) : await file.text();
    setLastScriptContent(text);
    const lines = text.split('\n');
    const chars = new Set();
    lines.forEach(l => {
      const trimmed = l.trim();
      if (trimmed === trimmed.toUpperCase() && trimmed.length > 2 && trimmed.length < 25) chars.add(trimmed);
    });
    setCast(Array.from(chars));
    handleFrankResponse(`[Script Uploaded] Analyze: ${text.slice(0, 3000)}`);
  };

  return (
    <div className="flex flex-col h-screen bg-[#faf9f6] text-[#2c2c2c] overflow-hidden text-sm">
      <header className="flex items-center justify-between px-8 py-5 bg-white border-b shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black rounded flex items-center justify-center text-white font-bold italic shadow-lg text-lg">F</div>
          <div><h1 className="text-xl font-black uppercase tracking-tighter text-black">Frank</h1><p className="text-[8px] uppercase tracking-[0.3em] font-bold mt-1 text-stone-400 text-black">Executive Series Office</p></div>
        </div>
        <div className="flex items-center gap-6 text-[10px] font-bold tracking-widest text-stone-400 uppercase text-black">
          <button onClick={() => setActiveTab('chat')} className={activeTab === 'chat' ? 'border-b-2 border-black text-black' : ''}>LOUNGE</button>
          <button onClick={() => setActiveTab('read-through')} className={activeTab === 'read-through' ? 'border-b-2 border-black text-black' : ''}>READ-THROUGH</button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden relative text-black">
        {activeTab === 'chat' ? (
          <>
            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-6 rounded-2xl shadow-sm ${m.role === 'user' ? 'bg-stone-800 text-white' : 'bg-white border text-black'}`}>{m.content}</div>
                </div>
              ))}
              {isProcessing && <div className="p-10 animate-pulse text-stone-400 font-bold italic">Frank is considering...</div>}
              <div ref={scrollRef} />
            </div>
            <div className="bg-white border-t p-5 shrink-0 shadow-lg">
              <div className="flex items-center gap-4 max-w-5xl mx-auto w-full">
                <input value={inputText} onChange={e => setInputText(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleFrankResponse(inputText)} placeholder="Defend your arc..." className="flex-1 px-6 py-4 bg-stone-50 rounded-xl outline-none text-black font-bold" />
                <button onClick={() => handleFrankResponse(inputText)} className="w-12 h-12 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-md"><Send size={18} /></button>
                <label className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center cursor-pointer text-black font-bold"><FileUp size={20}/><input type="file" className="hidden" accept=".pdf" onChange={(e) => handleScriptUpload(e.target.files[0])}/></label>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col bg-white overflow-hidden text-black">
            <div className="bg-stone-900 text-white p-4 flex items-center justify-between px-8 font-bold">
               <button className="px-8 py-2 bg-white text-black rounded-full font-black uppercase text-xs">Play Read</button>
               <button onClick={() => setReadState('stopped')} className="p-2 bg-stone-800 rounded-full text-red-400"><StopCircle size={16} /></button>
            </div>
            <div className="flex-1 flex overflow-hidden">
               <div className="w-1/3 bg-[#faf9f6] border-r p-10 overflow-y-auto">
                  <h2 className="text-xl font-black uppercase mb-8 flex items-center gap-3"><Users size={20}/> Casting</h2>
                  <div className="space-y-4">
                     {['Narrator', ...cast].map(char => (
                        <div key={char} className="bg-white p-4 rounded-xl border border-stone-200">
                           <div className="font-bold text-[10px] uppercase mb-2">{char}</div>
                           {/* VOICE DROPDOWN FIX */}
                           <select value={voiceAssignments[char] || ''} onChange={e => setVoiceAssignments({...voiceAssignments, [char]: e.target.value})} className="w-full bg-stone-50 border rounded p-2 text-xs text-black font-bold">
                              <option value="">Jimmy (Default)</option>
                              {INWORLD_VOICES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                           </select>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="w-2/3 p-16 overflow-y-auto font-serif text-lg leading-relaxed text-stone-300 italic">
                 Upload a script in the Lounge to cast characters.
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
