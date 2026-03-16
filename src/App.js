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

// Restored to Default only per your request
const INWORLD_VOICES = [
  { id: 'default-oglabcjnetcklcq7rghmbw__jimmy', name: 'Jimmy (Default Male)' }
];

const firebaseConfig = process.env.REACT_APP_FIREBASE_CONFIG ? JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG) : {
  apiKey: "mock-key",
  authDomain: "mock.firebaseapp.com",
  projectId: "mock-id",
  storageBucket: "mock.appspot.com",
  messagingSenderId: "000",
  appId: "000"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'frank-exec-series-v14';

const App = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([{ role: 'assistant', content: "I'm Frank. Send me the script when you're ready to get real." }]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [lastScriptContent, setLastScriptContent] = useState("");
  const [parsedLines, setParsedLines] = useState([]);
  const [cast, setCast] = useState([]);
  const [voiceAssignments, setVoiceAssignments] = useState({}); 
  const [readState, setReadState] = useState('stopped'); 

  const scrollRef = useRef(null);
  const readStateRef = useRef('stopped');

  useEffect(() => { readStateRef.current = readState; }, [readState]);

  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' }); }, [messages, isProcessing]);

  // --- BRAIN LOGIC ---
  const handleFrankResponse = async (text) => {
    if (!text.trim()) return;
    
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: `You are Frank, a blunt Sunset Blvd executive. Respond to: ${text}` }] }] 
        }) 
      });

      const data = await res.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (responseText) {
        setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
      }
    } catch (e) { console.error(e); } finally { setIsProcessing(false); }
  };

  const handleScriptUpload = async (file) => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const text = await file.text();
      setLastScriptContent(text);
      // Basic Parser to identify characters for the manual casting list
      const lines = text.split('\n');
      const foundChars = new Set();
      lines.forEach(l => {
        const trimmed = l.trim();
        if (trimmed === trimmed.toUpperCase() && trimmed.length > 2 && trimmed.length < 25) {
          foundChars.add(trimmed);
        }
      });
      setCast(Array.from(foundChars));
      handleFrankResponse(`[Script Uploaded] Analyze: ${text.slice(0, 2000)}`);
    } catch (err) { console.error(err); } finally { setIsProcessing(false); }
  };

  return (
    <div className="flex flex-col h-screen bg-[#faf9f6] text-[#2c2c2c] overflow-hidden text-sm font-sans">
      <header className="flex items-center justify-between px-8 py-5 bg-white border-b shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black rounded flex items-center justify-center text-white font-bold italic">F</div>
          <div><h1 className="text-xl font-black uppercase tracking-tighter text-black">Frank</h1><p className="text-[8px] uppercase tracking-[0.3em] font-bold mt-1 text-stone-400">Executive Series Office</p></div>
        </div>
        <div className="flex items-center gap-6 text-[10px] font-bold tracking-widest text-stone-400 uppercase">
          <button onClick={() => setActiveTab('chat')} className={activeTab === 'chat' ? 'border-b-2 border-black text-black' : ''}>LOUNGE</button>
          <button onClick={() => setActiveTab('read-through')} className={activeTab === 'read-through' ? 'border-b-2 border-black text-black' : ''}>READ-THROUGH</button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === 'chat' ? (
          <>
            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-6 rounded-2xl shadow-sm ${m.role === 'user' ? 'bg-stone-800 text-white' : 'bg-white border text-black'}`}>{m.content}</div>
                </div>
              ))}
              {isProcessing && <div className="p-5 italic text-stone-400">Frank is weighing the stakes...</div>}
              <div ref={scrollRef} />
            </div>
            <div className="bg-white border-t p-5 shrink-0">
              <div className="flex items-center gap-4 max-w-5xl mx-auto w-full">
                <input value={inputText} onChange={e => setInputText(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleFrankResponse(inputText)} placeholder="Defend your arc..." className="flex-1 px-6 py-4 bg-stone-50 rounded-xl outline-none text-black" />
                <button onClick={() => handleFrankResponse(inputText)} className="bg-stone-800 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-black transition-all"><Send size={18} /></button>
                <label className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center cursor-pointer text-stone-400 hover:text-black"><FileUp size={20}/><input type="file" className="hidden" accept=".pdf" onChange={(e) => handleScriptUpload(e.target.files[0])}/></label>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex overflow-hidden bg-white">
            <div className="w-1/3 bg-[#faf9f6] border-r p-10 overflow-y-auto">
              <h2 className="text-xl font-black uppercase mb-8 flex items-center gap-3 text-black"><Users size={20}/> Casting</h2>
              <div className="space-y-4">
                {['Narrator', ...cast].map(char => (
                  <div key={char} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                    <div className="font-bold text-[10px] uppercase tracking-widest mb-3 text-black">{char}</div>
                    <input 
                      type="text" 
                      placeholder="Enter voice name..." 
                      className="w-full bg-stone-50 border rounded-lg p-2.5 text-xs outline-none text-black font-bold"
                      value={voiceAssignments[char] || ''}
                      onChange={e => setVoiceAssignments({...voiceAssignments, [char]: e.target.value})}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="w-2/3 p-20 flex items-center justify-center text-stone-300 italic font-serif text-xl">
              Table Read ready. Character names mapped.
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
