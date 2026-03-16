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

const firebaseConfig = { apiKey: "mock", authDomain: "mock", projectId: "mock", storageBucket: "mock", messagingSenderId: "000", appId: "000" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const App = () => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([{ role: 'assistant', content: "I'm Frank. Let's quit the posturing and see if these pages have a heartbeat. Send me the script when you're ready to get real." }]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [errorMessage, setErrorMessage] = useState(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    signInAnonymously(auth).catch(() => setErrorMessage("Authentication Failed."));
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' }); }, [messages, isProcessing]);

  // --- THE BRAIN FIX: GEMINI 2.0 FLASH ---
  const handleFrankResponse = async (text) => {
    if (!text.trim()) return;
    
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      // Switched to gemini-2.0-flash which has the highest compatibility on v1beta
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: text }]
          }]
        })
      });

      const data = await response.json();

      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Studio Lot Error: ${data.error.message}` }]);
        return;
      }

      const frankText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (frankText) {
        setMessages(prev => [...prev, { role: 'assistant', content: frankText }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "The pages are blank. Rephrase that for me?" }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Studio connection lost. Check Render environment variables." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#faf9f6] text-[#2c2c2c] overflow-hidden text-sm">
      <header className="flex items-center justify-between px-8 py-5 bg-white border-b shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black rounded flex items-center justify-center text-white font-bold italic shadow-lg">F</div>
          <div><h1 className="text-xl font-black uppercase tracking-tighter">Frank</h1><p className="text-[8px] uppercase tracking-[0.3em] font-bold mt-1 text-stone-400">Executive Series Office</p></div>
        </div>
        <div className="flex items-center gap-6 text-[10px] font-bold tracking-widest text-stone-400 uppercase">
          <button onClick={() => setActiveTab('chat')} className={activeTab === 'chat' ? 'border-b-2 border-black text-black' : ''}>LOUNGE</button>
          <button onClick={() => setActiveTab('read-through')} className={activeTab === 'read-through' ? 'border-b-2 border-black text-black' : ''}>READ-THROUGH</button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden bg-[#fdfcfb] relative">
        {activeTab === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-6 ${m.role === 'user' ? 'bg-stone-800 text-white rounded-2xl shadow-xl' : 'bg-white border shadow-sm'}`}>{m.content}</div>
                </div>
              ))}
              {isProcessing && <div className="p-10 animate-pulse text-stone-400 font-bold italic text-xs uppercase tracking-widest text-center">Script Doctor is marking up the draft...</div>}
              <div ref={scrollRef} />
            </div>
            <div className="bg-white border-t p-5 shrink-0 shadow-lg">
              <div className="flex items-center gap-4 max-w-5xl mx-auto w-full">
                <input value={inputText} onChange={e => setInputText(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleFrankResponse(inputText)} placeholder="Defend your arc..." className="flex-1 px-6 py-4 bg-stone-50 rounded-xl outline-none" />
                <button onClick={() => handleFrankResponse(inputText)} className="w-12 h-12 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-md"><Send size={18} /></button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;
