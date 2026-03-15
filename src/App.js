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
const VOICE_ID = "default-oglabcjnetcklc7rghmbw__jimmy"; 
const MODEL_ID = "inworld-tts-1.5-max";

const INWORLD_VOICES = [
  { id: 'default-oglabcjnetcklcq7rghmbw__jimmy', name: 'Jimmy (Default)' },
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
  const [messages, setMessages] = useState([{ role: 'assistant', content: "I'm Frank. Let's see if these pages have a heartbeat. Send me the script when you're ready to get real." }]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [lastScriptContent, setLastScriptContent] = useState("");
  const [cast, setCast] = useState([]);
  const [voiceAssignments, setVoiceAssignments] = useState({ Narrator: '' });
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [readState, setReadState] = useState('stopped');

  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // --- CORE SEND LOGIC ---
  const handleFrankResponse = async (text) => {
    if (!text.trim()) return;
    
    // 1. Immediately put the text into the chat
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInputText('');
    setIsProcessing(true);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text }] }] })
      });
      const data = await res.json();
      const responseText = data.candidates[0].content.parts[0].text;
      setMessages([...newMessages, { role: 'assistant', content: responseText }]);
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: "API Handshake failed. Check your Render keys." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isRecording) { recognitionRef.current.stop(); setIsRecording(false); }
    else {
      const recognition = new SpeechRecognition();
      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (e) => setInputText(e.results[0][0].transcript);
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#faf9f6] text-[#2c2c2c] overflow-hidden">
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
              {isProcessing && <div className="p-10 animate-pulse text-stone-400 font-bold">Frank is considering...</div>}
              <div ref={scrollRef} />
            </div>
            <div className="bg-white border-t p-5 shrink-0 shadow-lg">
              <div className="flex items-center gap-4 max-w-5xl mx-auto w-full">
                <input value={inputText} onChange={e => setInputText(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleFrankResponse(inputText)} placeholder="Defend your arc..." className="flex-1 px-6 py-4 bg-stone-50 rounded-xl outline-none" />
                <button onClick={() => handleFrankResponse(inputText)} className="w-12 h-12 bg-stone-800 text-white rounded-full flex items-center justify-center shadow-md"><Send size={18} /></button>
                <button onClick={toggleDictation} className={`w-12 h-12 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-stone-50 text-stone-400'}`}><Mic size={20}/></button>
                <label className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center cursor-pointer hover:bg-stone-100 transition-colors"><FileUp size={20}/><input type="file" className="hidden" accept=".pdf" /></label>
              </div>
            </div>
          </>
        )}

        {activeTab === 'read-through' && (
          <div className="flex-1 flex flex-col bg-white">
            <div className="bg-stone-900 text-white p-3 flex items-center justify-between px-8">
               <label className="flex items-center gap-2 px-5 py-2 bg-stone-800 rounded-full cursor-pointer text-[10px] font-bold uppercase tracking-widest"><FileUp size={14}/> Upload PDF<input type="file" className="hidden" accept=".pdf" /></label>
               <div className="flex items-center gap-3">
                  <button className="px-8 py-2 bg-white text-black rounded-full font-black uppercase text-xs tracking-widest">PLAY READ-THROUGH</button>
                  <button onClick={() => setReadState('stopped')} className="p-2 bg-stone-800 rounded-full text-red-400 shadow-sm"><StopCircle size={16} /></button>
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
               <div className="w-1/2 p-20 font-serif text-xl text-stone-300">Upload a script to begin.</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
