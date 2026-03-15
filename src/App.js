import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Mic, MicOff, Pause, Play, RotateCcw, Loader2, AlertCircle, FileUp, ClipboardList, MessageSquare, Trash2, CheckCircle2, Zap, ZapOff, BookOpen, Download, Volume2, Image as ImageIcon, Sparkles, Stethoscope, ChevronRight, Activity, Scissors, XCircle, Zap as ZapIcon, Users, SkipBack, SkipForward, StopCircle, PlayCircle, Volume1 
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// --- CONFIGURATION (SECURED FOR RENDER) ---
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
  { id: 'default-oglabcjnetcklcq7rghmbw__carter', name: 'Carter (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__dominus', name: 'Dominus (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__ashley', name: 'Ashley (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__deborah', name: 'Deborah (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__elizabeth', name: 'Elizabeth (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__olivia', name: 'Olivia (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__priya', name: 'Priya (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__darlene', name: 'Darlene (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__hana', name: 'Hana (Female)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__julia', name: 'Julia (Child)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__pixie', name: 'Pixie (Child)' }
];

const DEMO_SCRIPT = `INT. SUNSET BLVD EXECUTIVE OFFICE - DAY\n\nFrank sits behind a massive mahogany desk. He's smoking a cigar that costs more than a car.\n\nFRANK\nI told you, kid. The third act needs explosions.\n\nWRITER\n(nervously)\nBut it's a quiet drama about a family grieving...\n\nFRANK\n(laughing)\nGrieving? I'll give them something to grieve about when the box office numbers come in. Add the explosions.`;

// Firebase Configuration (Using Mock for Local, ENV for Render)
const firebaseConfig = { apiKey: "mock", authDomain: "mock", projectId: "mock", storageBucket: "mock", messagingSenderId: "000", appId: "000" };
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
    } catch (e) {}
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
    let lastY = -1; let lastX = -1; let currentLine = "";
    items.forEach(item => {
      if (lastY !== -1) {
        const yDiff = Math.abs(lastY - item.transform[5]);
        if (yDiff > 12) { fullText += currentLine.trim() + '\n\n'; currentLine = ""; lastX = -1; }
        else if (yDiff > 4) { fullText += currentLine.trim() + '\n'; currentLine = ""; lastX = -1; }
      }
      if (lastX !== -1 && currentLine.length > 0 && !currentLine.endsWith(' ')) {
         const xDiff = item.transform[4] - lastX;
         if (xDiff > 5) currentLine += ' ';
      }
      currentLine += item.str; lastY = item.transform[5]; lastX = item.transform[4] + item.width;
    });
    fullText += currentLine.trim() + '\n\n';
  }
  return fullText;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([{ role: 'assistant', content: "I'm Frank. Let's quit the posturing and see if these pages have a heartbeat. Send me the script when you're ready to get real." }]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(false); 
  const [activeTab, setActiveTab] = useState('chat');
  const [errorMessage, setErrorMessage] = useState(null);
  const [scriptData, setScriptData] = useState(null);
  const [deepDiveData, setDeepDiveData] = useState(null);
  const [seriesBible, setSeriesBible] = useState(""); 
  const [isDeepDiving, setIsDeepDiving] = useState(false);
  const [lastScriptContent, setLastScriptContent] = useState("");
  const [posterUrl, setPosterUrl] = useState(null);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [parsedLines, setParsedLines] = useState([]);
  const [cast, setCast] = useState([]);
  const [voiceAssignments, setVoiceAssignments] = useState({ Narrator: '' }); 
  const [readState, setReadState] = useState('stopped'); 
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const activeLineRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const scrollRef = useRef(null);
  const speechQueue = useRef([]);
  const audioBufferQueue = useRef([]); 
  const playedQueue = useRef([]); 
  const isCurrentlyPlaying = useRef(false);
  const isFetchingNext = useRef(false);
  const recognitionRef = useRef(null);
  const micBaseTextRef = useRef(""); 
  const handsFreeActiveRef = useRef(false);
  const abortControllerRef = useRef(null);
  const scriptMemoryRef = useRef(""); 
  const speechTimeoutRef = useRef(null);
  const currentInputRef = useRef('');
  const readStateRef = useRef('stopped');
  const voiceAssignmentsRef = useRef({});
  const parsedLinesRef = useRef([]);

  useEffect(() => { handsFreeActiveRef.current = isHandsFree; }, [isHandsFree]);
  useEffect(() => { readStateRef.current = readState; }, [readState]);
  useEffect(() => { voiceAssignmentsRef.current = voiceAssignments; }, [voiceAssignments]);
  useEffect(() => { parsedLinesRef.current = parsedLines; }, [parsedLines]);
  useEffect(() => { currentInputRef.current = inputText; }, [inputText]);

  const ensureAudioContext = () => {
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
    return audioContextRef.current;
  };

  useEffect(() => {
    const textToParse = lastScriptContent || DEMO_SCRIPT;
    const lines = textToParse.replace(/\r\n/g, '\n').split('\n');
    const parsed = []; const characters = new Set(); let currentScene = "UNKNOWN SCENE";
    let i = 0;
    while (i < lines.length) {
      let trimmed = lines[i].trim();
      if (!trimmed) { i++; continue; }
      if (/^(\d+\.?|pg\.?\s*\d+|page\s*\d+)$/i.test(trimmed)) { parsed.push({ id: i, type: 'page_number', text: trimmed, character: 'Narrator', sceneId: currentScene }); i++; continue; }
      const isExplicitScene = /^(INT\.|EXT\.|INT\/EXT|I\/E|SCENE START|MONTAGE|FLASHBACK|BACK TO|REVEAL|ANGLE ON|CLOSE UP|INTERCUT|SERIES OF SHOTS|ACT \w+|TEASER|COLD OPEN|TAG|TITLE CARD|SUPER|CHYRON|END OF)/i.test(trimmed) || /\s-\s(DAY|NIGHT|MORNING|EVENING|AFTERNOON|CONTINUOUS|LATER|SAME|MOMENTS LATER)/i.test(trimmed);
      if (isExplicitScene) { currentScene = trimmed; parsed.push({ id: i, type: 'scene', text: trimmed, character: 'Narrator', sceneId: currentScene }); i++; continue; }
      const words = trimmed.split(/\s+/);
      const isUppercase = trimmed === trimmed.toUpperCase();
      if (isUppercase && words.length <= 4 && !/[.!?:]$/.test(trimmed)) {
        let nextLineIdx = i + 1; while(nextLineIdx < lines.length && lines[nextLineIdx].trim() === '') nextLineIdx++;
        let nextTrimmed = nextLineIdx < lines.length ? lines[nextLineIdx].trim() : '';
        if (nextTrimmed !== '') {
           let cleanCharName = trimmed.replace(/\s*\([^)]+\)/g, '').replace(/\s*CONT'D/g, '').trim();
           if (cleanCharName && !['CONTINUED', 'FADE IN', 'FADE OUT', 'CUT TO', 'NARRATOR', 'THE END'].includes(cleanCharName)) {
              characters.add(cleanCharName);
              parsed.push({ id: i, type: 'character', text: trimmed, character: cleanCharName, sceneId: currentScene });
              i = nextLineIdx; let dialogueLines = [];
              while (i < lines.length) {
                let dTrimmed = lines[i].trim(); if (!dTrimmed) break;
                dialogueLines.push(dTrimmed); i++;
              }
              parsed.push({ id: i, type: 'dialogue', text: dialogueLines.join(' '), character: cleanCharName, sceneId: currentScene });
              continue; 
           }
        }
      }
      parsed.push({ id: i, type: 'action', text: trimmed, character: 'Narrator', sceneId: currentScene }); i++;
    }
    setParsedLines(parsed); setCast(Array.from(characters).sort());
  }, [lastScriptContent]);

  useEffect(() => {
    setVoiceAssignments(prev => {
      const next = { ...prev }; if (next['Narrator'] === undefined) next['Narrator'] = ''; 
      cast.forEach(char => { if (next[char] === undefined) next[char] = ''; }); return next;
    });
  }, [cast]);

  const fetchAudioChunk = async (text, customVoiceId = VOICE_ID) => {
    const vId = customVoiceId || VOICE_ID; 
    try {
      const authHeader = INWORLD_API_KEY.startsWith('Basic ') ? INWORLD_API_KEY : `Basic ${INWORLD_API_KEY}`;
      const response = await fetch('https://api.inworld.ai/tts/v1/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
        body: JSON.stringify({ text, voiceId: vId, modelId: MODEL_ID })
      });
      const json = await response.json();
      const base64 = json.audioContent || json.result?.audioContent;
      if (base64) {
        const binary = window.atob(base64);
        const bytes = new Uint8Array(binary.length); for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes.buffer;
      }
    } catch (e) { console.error("Inworld Error:", e); }
  };

  const playReadThroughLineInworld = async (index) => {
    if (index >= parsedLinesRef.current.length || readStateRef.current === 'stopped') { setReadState('stopped'); setCurrentLineIndex(0); return; }
    setCurrentLineIndex(index); const line = parsedLinesRef.current[index];
    setTimeout(() => { if (activeLineRef.current) activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 50);
    if (['character', 'page_number'].includes(line.type)) { playReadThroughLineInworld(index + 1); return; }
    const char = (line.type === 'dialogue') ? line.character : 'Narrator';
    const voice = voiceAssignmentsRef.current[char] || VOICE_ID;
    const buffer = await fetchAudioChunk(line.text, voice);
    if (buffer) {
      const ctx = ensureAudioContext(); const decoded = await ctx.decodeAudioData(buffer);
      const source = ctx.createBufferSource(); source.buffer = decoded; source.connect(ctx.destination);
      sourceNodeRef.current = source; source.start(0);
      source.onended = () => { if (readStateRef.current !== 'stopped') playReadThroughLineInworld(index + 1); };
    }
  };

  const handleFrankResponse = async (text, isSurgery = false) => {
    if (!text && !isSurgery) return;
    setIsProcessing(true); if (isSurgery) setIsDeepDiving(true);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
      const prompt = isSurgery ? `PERFORM SCRIPT SURGERY ON: ${lastScriptContent}` : text;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      const responseText = data.candidates[0].content.parts[0].text;
      if (isSurgery) { setDeepDiveData({ content: responseText, grade: "AUDIT" }); setActiveTab('deep-dive'); }
      else { setMessages(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: responseText }]); }
    } catch (e) { setErrorMessage("Gemini link failed."); } finally { setIsProcessing(false); setIsDeepDiving(false); }
  };

  const handleScriptUpload = async (file) => {
    if (!file) return; setIsProcessing(true);
    try {
      const text = file.type === 'application/pdf' ? await extractTextFromPDF(file) : await file.text();
      setLastScriptContent(text); scriptMemoryRef.current = text;
      handleFrankResponse(`[Script Uploaded] Analyze this: ${text.slice(0, 10000)}`);
    } catch (e) { setErrorMessage("PDF Parser failed."); } finally { setIsProcessing(false); }
  };

  const toggleDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isRecording) { recognitionRef.current.stop(); setIsRecording(false); }
    else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (e) => setInputText(e.results[e.results.length - 1][0].transcript);
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  useEffect(() => {
    signInAnonymously(auth).catch(() => setErrorMessage("Authentication Failed."));
    return onAuthStateChanged(auth, setUser);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#faf9f6] text-[#2c2c2c] overflow-hidden text-sm">
      <header className="flex items-center justify-between px-8 py-5 bg-white border-b shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black rounded flex items-center justify-center text-white font-bold italic shadow-lg">F</div>
          <div><h1 className="text-xl font-black uppercase tracking-tighter">Frank</h1><p className="text-[8px] uppercase tracking-[0.3em] font-bold mt-1 text-stone-400">Executive Series Office</p></div>
        </div>
        <div className="flex items-center gap-6 text-[10px] font-bold tracking-widest text-stone-400 uppercase">
          <button onClick={() => setActiveTab('chat')} className={activeTab === 'chat' ? 'border-b-2 border-black text-black' : ''}>LOUNGE</button>
          <button onClick={() => setActiveTab('executive-report')} className={activeTab === 'executive-report' ? 'border-b-2 border-black text-black' : ''}>REPORT CARD</button>
          <button onClick={() => setActiveTab('deep-dive')} className={activeTab === 'deep-dive' ? 'border-b-2 border-black text-black' : ''}>DEEP DIVE</button>
          <button onClick={() => setActiveTab('read-through')} className={activeTab === 'read-through' ? 'border-b-2 border-black text-black' : ''}>READ-THROUGH</button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden bg-[#fdfcfb] relative">
        {activeTab === 'chat' ? (
          <>
            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-6 ${m.role === 'user' ? 'bg-stone-800 text-white rounded-2xl shadow-xl' : 'bg-white border shadow-sm'}`}>{m.content}</div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
            <div className="bg-white border-t p-5 shrink-0 shadow-lg">
              <div className="flex items-center gap-4 max-w-5xl mx-auto w-full">
                <input value={inputText} onChange={e => setInputText(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleFrankResponse(inputText)} placeholder="Defend your arc..." className="flex-1 px-6 py-4 bg-stone-50 rounded-xl outline-none" />
                <button onClick={() => handleFrankResponse(inputText)} className="w-12 h-12 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-md"><Send size={18} /></button>
                <button onClick={toggleDictation} className={`w-12 h-12 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-stone-50 text-stone-400'}`}><Mic size={20}/></button>
                <label className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center cursor-pointer hover:bg-stone-100 transition-colors"><FileUp size={20}/><input type="file" className="hidden" accept=".pdf" onChange={(e) => handleScriptUpload(e.target.files[0])} /></label>
              </div>
            </div>
          </>
        ) : activeTab === 'read-through' ? (
          <div className="flex-1 flex flex-col bg-white">
            <div className="bg-stone-900 text-white p-3 flex items-center justify-between px-8">
               <label className="flex items-center gap-2 px-5 py-2 bg-stone-800 rounded-full cursor-pointer text-[10px] font-bold uppercase tracking-widest"><FileUp size={14}/> Upload PDF<input type="file" className="hidden" accept=".pdf" onChange={(e) => handleScriptUpload(e.target.files[0])}/></label>
               <div className="flex items-center gap-3">
                  <button onClick={() => { setReadState('playing'); playReadThroughLineInworld(currentLineIndex); }} className="px-8 py-2 bg-white text-black rounded-full font-black uppercase text-xs tracking-widest">PLAY READ-THROUGH</button>
                  <button onClick={() => { setReadState('stopped'); if (sourceNodeRef.current) sourceNodeRef.current.stop(); }} className="p-2 bg-stone-800 rounded-full text-red-400 shadow-sm"><StopCircle size={16} /></button>
               </div>
            </div>
            <div className="flex-1 flex overflow-hidden">
               <div className="w-1/2 bg-[#faf9f6] border-r p-10 overflow-y-auto">
                  <h2 className="text-2xl font-black uppercase mb-8 flex items-center gap-3"><Users size={24}/> Voice Casting</h2>
                  <div className="space-y-4">
                     {['Narrator', ...cast].map(char => (
                        <div key={char} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                           <div className="font-bold text-xs uppercase tracking-widest mb-3">{char}</div>
                           <select value={voiceAssignments[char] || ''} onChange={e => setVoiceAssignments(v => ({...v, [char]: e.target.value}))} className="w-full bg-stone-50 border rounded-lg p-2.5 text-xs outline-none">
                              <option value="">Jimmy (Default)</option>
                              {INWORLD_VOICES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                           </select>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="w-1/2 overflow-y-auto p-16 font-serif text-lg leading-relaxed">
                  {parsedLines.map((line, idx) => (
                    <div key={idx} ref={currentLineIndex === idx ? activeLineRef : null} className={`p-1.5 rounded mb-2 ${currentLineIndex === idx && readState === 'playing' ? 'bg-stone-900 text-white' : ''}`} style={{ marginLeft: line.type === 'character' ? '20%' : (line.type === 'dialogue' ? '15%' : '0') }}>{line.text}</div>
                  ))}
               </div>
            </div>
          </div>
        ) : activeTab === 'deep-dive' ? (
          <div className="p-20 overflow-y-auto bg-white max-w-4xl mx-auto font-serif text-lg leading-relaxed">
            <h2 className="text-3xl font-black uppercase mb-10 text-red-600 border-b pb-4">Surgical Audit</h2>
            {deepDiveData ? deepDiveData.content : "No surgery performed yet."}
          </div>
        ) : (
          <div className="p-20 overflow-y-auto bg-white max-w-4xl mx-auto font-serif text-lg leading-relaxed">
            {scriptData ? scriptData.content : "No report card generated yet."}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
