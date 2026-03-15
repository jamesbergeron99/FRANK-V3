import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Pause, Play, RotateCcw, Loader2, AlertCircle, FileUp, ClipboardList, MessageSquare, Trash2, CheckCircle2, Zap, ZapOff, BookOpen, Download, Volume2, Image as ImageIcon, Sparkles, Stethoscope, ChevronRight, Activity, Scissors, XCircle, Zap as ZapIcon, Users, SkipBack, SkipForward, StopCircle, PlayCircle, Volume1 } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

const apiKey = process.env.REACT_APP_GEMINI_API_KEY; 
const INWORLD_API_KEY = process.env.REACT_APP_INWORLD_API_KEY; 
const VOICE_ID = "default-oglabcjnetcklcq7rghmbw__jimmy"; 
const MODEL_ID = "inworld-tts-1.5-max";

const INWORLD_VOICES = [
  { id: 'default-oglabcjnetcklcq7rghmbw__jimmy', name: 'Jimmy (Default Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__alex', name: 'Alex (Male)' },
  { id: 'default-oglabcjnetcklcq7rghmbw__sarah', name: 'Sarah (Female)' }
];

const firebaseConfig = { apiKey: "mock", authDomain: "mock", projectId: "mock", storageBucket: "mock", messagingSenderId: "000", appId: "000" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const App = () => {
  const [messages, setMessages] = useState([{ role: 'assistant', content: "Frank here. Let's see if your script has a pulse. Upload it." }]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [readState, setReadState] = useState('stopped');
  const sourceNodeRef = useRef(null);
  const audioContextRef = useRef(null);

  const handleFrankResponse = async (textToProcess) => {
    setIsProcessing(true);
    console.log("FRANK LOG: Sending to Gemini...");
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: textToProcess }] }] })
      });
      const data = await res.json();
      if (data.error) {
        console.error("FRANK ERROR (Gemini):", data.error.message);
      } else {
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        setMessages(prev => [...prev, { role: 'user', content: "[Script Sent]" }, { role: 'assistant', content: responseText }]);
      }
    } catch (e) {
      console.error("FRANK CRITICAL FAILURE:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-10 bg-[#faf9f6] h-screen font-sans">
      <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-6 border border-stone-200">
        <h1 className="text-2xl font-black uppercase mb-4">Frank AI Executive Suite</h1>
        <div className="h-96 overflow-y-auto mb-4 border-b border-stone-100 p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <div className={`inline-block p-4 rounded-xl ${m.role === 'user' ? 'bg-stone-800 text-white' : 'bg-stone-50 border'}`}>{m.content}</div>
            </div>
          ))}
          {isProcessing && <div className="animate-pulse text-stone-400">Frank is reading...</div>}
        </div>
        <div className="flex gap-2">
          <input className="flex-1 p-4 bg-stone-100 rounded-xl outline-none" placeholder="Type here..." value={inputText} onChange={(e) => setInputText(e.target.value)} />
          <button className="bg-black text-white px-6 rounded-xl font-bold" onClick={() => handleFrankResponse(inputText)}>SEND</button>
        </div>
      </div>
    </div>
  );
};

export default App;
