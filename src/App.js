import React, { useState, useEffect, useRef } from 'react';

import { 

  Send, 

  Mic, 

  MicOff, 

  Pause, 

  Play, 

  RotateCcw, 

  Loader2, 

  AlertCircle, 

  FileUp, 

  ClipboardList, 

  MessageSquare, 

  Trash2, 

  CheckCircle2, 

  Zap, 

  ZapOff, 

  BookOpen, 

  Download, 

  Volume2, 

  Image as ImageIcon, 

  Sparkles, 

  Stethoscope, 

  ChevronRight, 

  Activity, 

  Scissors, 

  XCircle, 

  Zap as ZapIcon, 

  Users, 

  SkipBack, 

  SkipForward, 

  StopCircle, 

  PlayCircle, 

  Volume1 

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



const DEMO_SCRIPT = `INT. SUNSET BLVD EXECUTIVE OFFICE - DAY



Frank sits behind a massive mahogany desk. He's smoking a cigar that costs more than a car.



FRANK

I told you, kid. The third act needs explosions.



WRITER

(nervously)

But it's a quiet drama about a family grieving...



FRANK

(laughing)

Grieving? I'll give them something to grieve about when the box office numbers come in. Add the explosions.



CUT TO:



EXT. STUDIO LOT - DAY



The Writer walks out, defeated.`;



// Firebase Config Stub (Render uses the ENV version)

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



const fetchWithRetry = async (url, options) => {

  const delays = [1000, 2000, 4000, 8000, 16000];

  for (let i = 0; i <= 4; i++) {

    try {

      const res = await fetch(url, options);

      if (res.ok) return res;

      if (i === 4) return res; 

    } catch (e) {

      if (i === 4) throw e;

    }

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

    const parsed = []; const characters = new Set(); let currentScene = "UNKNOWN SCENE"; let i = 0;

    while (i < lines.length) {

      let trimmed = lines[i].trim();

      if (!trimmed) { i++; continue; }

      if (/^(\d+\.?|pg\.?\s*\d+|page\s*\d+)$/i.test(trimmed)) { parsed.push({ id: i, type: 'page_number', text: trimmed, character: 'Narrator', sceneId: currentScene }); i++; continue; }

      const isExplicitScene = /^(INT\.|EXT\.|INT\/EXT|I\/E|SCENE START|MONTAGE|FLASHBACK|BACK TO|REVEAL|ANGLE ON|CLOSE UP|INTERCUT|SERIES OF SHOTS|ACT \w+|TEASER|COLD OPEN|TAG|TITLE CARD|SUPER|CHYRON|END OF)/i.test(trimmed) || /\s-\s(DAY|NIGHT|MORNING|EVENING|AFTERNOON|CONTINUOUS|LATER|SAME|MOMENTS LATER)/i.test(trimmed);

      if (isExplicitScene) { currentScene = trimmed; parsed.push({ id: i, type: 'scene', text: trimmed, character: 'Narrator', sceneId: currentScene }); i++; continue; }

      if (/^(CUT TO|FADE OUT|FADE IN|DISSOLVE TO|SMASH CUT TO|MATCH CUT TO|JUMP CUT TO)(:|\.)?$/i.test(trimmed)) { parsed.push({ id: i, type: 'transition', text: trimmed, character: 'Narrator', sceneId: currentScene }); i++; continue; }

      const words = trimmed.split(/\s+/);

      const invalidCharWords = ['INT', 'EXT', 'DAY', 'NIGHT', 'MORNING', 'EVENING', 'CONTINUOUS', 'LATER', 'SAME', 'MOMENTS', 'ROOM', 'HOUSE', 'CAR', 'STREET', 'OFFICE', 'APARTMENT', 'HALLWAY', 'BATHROOM', 'KITCHEN', 'BEDROOM', 'BLVD', 'BOULEVARD', 'AVENUE', 'CITY', 'TOWN', 'STORE', 'RESTAURANT', 'BAR', 'HOSPITAL', 'SCHOOL', 'POLICE', 'WAREHOUSE', 'GARAGE', 'BASEMENT', 'ROOF', 'YARD', 'POOL', 'ALLEY', 'HIGHWAY', 'ROAD', 'BUILDING', 'PARK', 'EXTERIOR', 'INTERIOR', 'LOCATION', 'ACT', 'TEASER', 'COLD', 'OPEN', 'TAG', 'END', 'INTERCUT', 'SERIES', 'SHOTS', 'MONTAGE', 'FLASHBACK', 'TITLE', 'CARD', 'CHYRON', 'SUPER', 'OMITTED', 'PHONE', 'CONVERSATION'];

      const hasInvalidWord = words.some(w => invalidCharWords.includes(w.replace(/[^A-Z]/g, '')));

      const isUppercase = trimmed === trimmed.toUpperCase();

      const hasLetters = /[A-Z]/.test(trimmed);

      const isShortEnough = words.length <= 4 && trimmed.length < 35;

      const noEndingPunctuation = !/[.!?:]$/.test(trimmed); 

      if (isUppercase && hasLetters && isShortEnough && noEndingPunctuation && !hasInvalidWord) {

        let nextLineIdx = i + 1; while(nextLineIdx < lines.length && lines[nextLineIdx].trim() === '') nextLineIdx++;

        let nextTrimmed = nextLineIdx < lines.length ? lines[nextLineIdx].trim() : '';

        const nextIsScene = /^(INT\.|EXT\.|INT\/EXT|I\/E|SCENE START)/i.test(nextTrimmed) || /\s-\s(DAY|NIGHT|MORNING|EVENING|AFTERNOON|CONTINUOUS|LATER|SAME)/i.test(nextTrimmed);

        if (nextTrimmed !== '' && !nextIsScene) {

           let cleanCharName = trimmed.replace(/\s*\([^)]+\)/g, '').replace(/\s*CONT'D/g, '').replace(/['"]+/g, '').trim();

           if (cleanCharName && !['CONTINUED', 'FADE IN', 'FADE OUT', 'CUT TO', 'NARRATOR', 'THE END'].includes(cleanCharName)) {

              characters.add(cleanCharName);

              parsed.push({ id: i, type: 'character', text: trimmed, character: cleanCharName, sceneId: currentScene });

              i = nextLineIdx; let dialogueLines = []; let blockStartId = i;

              while (i < lines.length) {

                 let dTrimmed = lines[i].trim(); if (!dTrimmed) break; if (/^(\d+\.?|pg\.?\s*\d+|page\s*\d+)$/i.test(dTrimmed)) break;

                 if (dTrimmed.startsWith('(') && dTrimmed.endsWith(')')) {

                    if (dialogueLines.length > 0) { parsed.push({ id: blockStartId, type: 'dialogue', text: dialogueLines.join(' '), character: cleanCharName, sceneId: currentScene }); dialogueLines = []; }

                    parsed.push({ id: i, type: 'parenthetical', text: dTrimmed, character: cleanCharName, sceneId: currentScene }); blockStartId = i + 1;

                 } else { dialogueLines.push(dTrimmed); } i++;

              }

              if (dialogueLines.length > 0) parsed.push({ id: blockStartId, type: 'dialogue', text: dialogueLines.join(' '), character: cleanCharName, sceneId: currentScene });

              continue; 

           }

        }

      }

      let actionLines = [trimmed]; let blockStartId = i; i++;

      while (i < lines.length) {

         let aTrimmed = lines[i].trim(); if (!aTrimmed) break; 

         if (/^(INT\.|EXT\.|INT\/EXT|I\/E|SCENE START)/i.test(aTrimmed) || /\s-\s(DAY|NIGHT|MORNING|EVENING|AFTERNOON|CONTINUOUS|LATER|SAME)/i.test(aTrimmed)) break;

         if (/^(\d+\.?|pg\.?\s*\d+|page\s*\d+)$/i.test(aTrimmed)) break;

         const aWords = aTrimmed.split(/\s+/); const aHasInvalidWord = aWords.some(w => invalidCharWords.includes(w.replace(/[^A-Z]/g, '')));

         if (aTrimmed === aTrimmed.toUpperCase() && /[A-Z]/.test(aTrimmed) && aWords.length <= 4 && !/[.!?:]$/.test(aTrimmed) && !aHasInvalidWord) {

            let nIdx = i + 1; while(nIdx < lines.length && lines[nIdx].trim() === '') nIdx++;

            if (nIdx < lines.length && lines[nIdx].trim() !== '') break;

         }

         actionLines.push(aTrimmed); i++;

      }

      parsed.push({ id: blockStartId, type: 'action', text: actionLines.join(' '), character: 'Narrator', sceneId: currentScene });

    }

    setParsedLines(parsed); setCast(Array.from(characters).sort()); setCurrentLineIndex(0); setReadState('stopped'); readStateRef.current = 'stopped';

    if (sourceNodeRef.current) { sourceNodeRef.current.onended = null; try { sourceNodeRef.current.stop(); } catch(e){} }

  }, [lastScriptContent]);



  useEffect(() => {

    setVoiceAssignments(prev => {

      const next = { ...prev }; if (next['Narrator'] === undefined) next['Narrator'] = ''; 

      cast.forEach(char => { if (next[char] === undefined) next[char] = ''; }); return next;

    });

  }, [cast]);



  const playReadThroughLineInworld = async (index) => {

    if (index >= parsedLinesRef.current.length || readStateRef.current === 'stopped') { setReadState('stopped'); setCurrentLineIndex(0); return; }

    setCurrentLineIndex(index); const line = parsedLinesRef.current[index];

    setTimeout(() => { if (activeLineRef.current) activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 50);

    if (['character', 'parenthetical', 'page_number'].includes(line.type)) { setTimeout(() => { if (readStateRef.current !== 'stopped') playReadThroughLineInworld(index + 1); }, 50); return; }

    let textToSpeak = line.text; if (line.type === 'scene') textToSpeak = textToSpeak.replace(/INT\./g, 'Interior. ').replace(/EXT\./g, 'Exterior. ');

    const char = (line.type === 'dialogue') ? line.character : 'Narrator';

    let voiceIdToUse = voiceAssignmentsRef.current[char] || VOICE_ID; if (voiceIdToUse.trim() === '') voiceIdToUse = VOICE_ID;

    try {

      const buffer = await fetchAudioChunk(textToSpeak, voiceIdToUse); if (readStateRef.current === 'stopped') return;

      const ctx = ensureAudioContext(); const decodedBuffer = await ctx.decodeAudioData(buffer); if (readStateRef.current === 'stopped') return;

      const source = ctx.createBufferSource(); source.buffer = decodedBuffer; source.connect(ctx.destination);

      sourceNodeRef.current = source; source.start(0);

      source.onended = () => { if (readStateRef.current !== 'stopped') playReadThroughLineInworld(index + 1); };

    } catch (e) { if (readStateRef.current !== 'stopped') setTimeout(() => playReadThroughLineInworld(index + 1), 200); }

  };



  const toggleReadPlayback = async () => {

    ensureAudioContext();

    if (readState === 'playing') { setReadState('paused'); readStateRef.current = 'paused'; if (audioContextRef.current) await audioContextRef.current.suspend(); }

    else if (readState === 'paused') { setReadState('playing'); readStateRef.current = 'playing'; if (audioContextRef.current) await audioContextRef.current.resume(); }

    else { setReadState('playing'); readStateRef.current = 'playing'; if (sourceNodeRef.current) { sourceNodeRef.current.onended = null; try { sourceNodeRef.current.stop(); } catch(e){} } playReadThroughLineInworld(currentLineIndex); }

  };



  const stopReadPlayback = () => { setReadState('stopped'); readStateRef.current = 'stopped'; if (sourceNodeRef.current) { sourceNodeRef.current.onended = null; try { sourceNodeRef.current.stop(); } catch(e){} } setCurrentLineIndex(0); };



  const skipScene = (direction) => {

    ensureAudioContext(); if (sourceNodeRef.current) { sourceNodeRef.current.onended = null; try { sourceNodeRef.current.stop(); } catch(e){} }

    let newIdx = currentLineIndex;

    if (direction === 1) { for (let i = currentLineIndex + 1; i < parsedLines.length; i++) { if (parsedLines[i].type === 'scene') { newIdx = i; break; } } }

    else { for (let i = currentLineIndex - 1; i >= 0; i--) { if (parsedLines[i].type === 'scene') { newIdx = i; break; } } }

    setCurrentLineIndex(newIdx); if (readState === 'playing') setTimeout(() => playReadThroughLineInworld(newIdx), 100);

    else if (activeLineRef.current) activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });

  };



  const testVoice = async (character) => {

    ensureAudioContext(); if (sourceNodeRef.current) { sourceNodeRef.current.onended = null; try { sourceNodeRef.current.stop(); } catch(e){} }

    let voiceIdToUse = voiceAssignments[character] || VOICE_ID; if (voiceIdToUse.trim() === '') voiceIdToUse = VOICE_ID;

    try {

      const buffer = await fetchAudioChunk(`Testing audio levels for ${character}.`, voiceIdToUse);

      const ctx = ensureAudioContext(); const decodedBuffer = await ctx.decodeAudioData(buffer);

      const source = ctx.createBufferSource(); source.buffer = decodedBuffer; source.connect(ctx.destination);

      sourceNodeRef.current = source; source.start(0);

    } catch (e) { setErrorMessage(`Test Voice Error: ${e.message}`); }

  };



  useEffect(() => {

    const initAuth = async () => { try { await signInAnonymously(auth); } catch (err) { console.error(err); } };

    initAuth(); const unsubscribe = onAuthStateChanged(auth, setUser); return () => unsubscribe();

  }, []);



  useEffect(() => {

    if (!user) return;

    const chatDoc = doc(db, 'artifacts', appId, 'users', user.uid, 'series_bible', 'main');

    const unsubscribe = onSnapshot(chatDoc, (docSnap) => {

      if (docSnap.exists()) {

        const data = docSnap.data();

        if (data.messages) setMessages(data.messages);

        if (data.scriptData) setScriptData(data.scriptData);

        if (data.deepDiveData) setDeepDiveData(data.deepDiveData);

        if (data.seriesBible) setSeriesBible(data.seriesBible);

        if (data.posterUrl) setPosterUrl(data.posterUrl);

        if (data.lastScriptContent) { setLastScriptContent(data.lastScriptContent); scriptMemoryRef.current = data.lastScriptContent; }

      }

    });

    return () => unsubscribe();

  }, [user]);



  const saveToCloud = async (newMessages, sData = null, dData = null, bible = null, pUrl = null, fullScript = null) => {

    if (!user) return;

    const chatDoc = doc(db, 'artifacts', appId, 'users', user.uid, 'series_bible', 'main');

    const update = { messages: newMessages.map(m => m.content.includes("SCRIPT CONTENT:") ? { ...m, content: "[Full Script Analyzed]" } : m) };

    if (sData !== null) update.scriptData = sData; if (dData !== null) update.deepDiveData = dData;

    if (bible !== null) update.seriesBible = bible; if (pUrl !== null) update.posterUrl = pUrl;

    if (fullScript !== null) update.lastScriptContent = fullScript;

    await setDoc(chatDoc, update, { merge: true });

  };



  const clearHistory = async () => {

    if (!user) return;

    const chatDoc = doc(db, 'artifacts', appId, 'users', user.uid, 'series_bible', 'main');

    const reset = [{ role: 'assistant', content: "New slate. Let's see what you've got." }];

    setMessages(reset); setScriptData(null); setDeepDiveData(null); setSeriesBible(""); setPosterUrl(null); setLastScriptContent(""); scriptMemoryRef.current = "";

    await setDoc(chatDoc, { messages: reset, scriptData: null, deepDiveData: null, seriesBible: "", posterUrl: null, lastScriptContent: "" });

  };



  const toggleDictation = () => {

    if (isRecording) { if (recognitionRef.current) recognitionRef.current.stop(); setIsRecording(false); return; }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) { setErrorMessage("Speech recognition not supported."); return; }

    const recognition = new SpeechRecognition(); recognition.continuous = true; recognition.interimResults = true;

    recognition.onstart = () => { setIsRecording(true); micBaseTextRef.current = inputText; };

    recognition.onresult = (event) => {

      let interimTranscript = ''; let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {

        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;

        else interimTranscript += event.results[i][0].transcript;

      }

      if (finalTranscript) micBaseTextRef.current = (micBaseTextRef.current + " " + finalTranscript).trim();

      const currentFullText = (micBaseTextRef.current + " " + interimTranscript).trim();

      setInputText(currentFullText);

      if (handsFreeActiveRef.current) {

        if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);

        speechTimeoutRef.current = setTimeout(() => { if (currentInputRef.current.trim().length > 0) { handleFrankResponse(currentInputRef.current.trim()); if (recognitionRef.current) recognitionRef.current.stop(); } }, 3000); 

      }

    };

    recognition.onerror = () => setIsRecording(false); recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition; recognition.start();

  };



  const generatePoster = async (directText = null) => {

    setIsGeneratingPoster(true); setErrorMessage(null);

    let contextText = (typeof directText === 'string') ? directText : (scriptMemoryRef.current || lastScriptContent || seriesBible);

    if (!contextText || contextText.trim() === "") contextText = messages.map(m => m.content).join(" ").slice(-2000);

    try {

      const promptUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

      const aiPrompt = `expert movie poster designer. TITLE, PROTAGONISTS, RACE, PROPS from: ${contextText.slice(0, 30000)}`;

      const promptRes = await fetchWithRetry(promptUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: aiPrompt }] }] }) });

      const promptData = await promptRes.json();

      const imagePrompt = promptData.candidates?.[0]?.content?.parts?.[0]?.text?.substring(0, 480) || "cinematic poster";

      const imgUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;

      const imgRes = await fetchWithRetry(imgUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ instances: { prompt: imagePrompt }, parameters: { sampleCount: 1, aspectRatio: "3:4" } }) });

      const imgData = await imgRes.json(); const base64 = imgData.predictions?.[0]?.bytesBase64Encoded;

      if (base64) { const url = `data:image/png;base64,${base64}`; setPosterUrl(url); await saveToCloud(messages, scriptData, deepDiveData, seriesBible, url, scriptMemoryRef.current); }

    } catch (err) { setErrorMessage("Poster failed: " + err.message); } finally { setIsGeneratingPoster(false); }

  };



  const fetchAudioChunk = async (text, customVoiceId = VOICE_ID) => {

    try {

      const authHeader = INWORLD_API_KEY.trim().startsWith('Basic ') ? INWORLD_API_KEY.trim() : `Basic ${INWORLD_API_KEY.trim()}`;

      const response = await fetch('https://api.inworld.ai/tts/v1/voice', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authHeader }, body: JSON.stringify({ text, voiceId: customVoiceId, modelId: MODEL_ID }) });

      if (response.ok) {

         const json = await response.json(); let base64 = json.audioContent || json.result?.audioContent || json.data;

         if (base64) {

            const binary = window.atob(base64.replace(/^data:audio\/\w+;base64,/, ""));

            const bytes = new Uint8Array(binary.length); for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

            return bytes.buffer;

         }

      }

    } catch (e) {}

    // Fallback to Gemini TTS

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

    const res = await fetchWithRetry(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } } } } }) });

    const data = await res.json(); const b64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    const bin = window.atob(b64); const byts = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) byts[i] = bin.charCodeAt(i);

    return byts.buffer;

  };



  const handleScriptUpload = async (file, skipFrankResponse = false) => {

    if (!file) return; setIsProcessing(true); setErrorMessage(null);

    try {

      let text = file.type === 'application/pdf' ? await extractTextFromPDF(file) : await file.text();

      scriptMemoryRef.current = text; setLastScriptContent(text);

      if (!skipFrankResponse) handleFrankResponse(`[Episode Uploaded] SCRIPT CONTENT: ${text.slice(0, 30000)}`);

      else await saveToCloud(messages, scriptData, deepDiveData, seriesBible, posterUrl, text);

    } catch (err) { setErrorMessage("Upload failed: " + err.message); } finally { setIsProcessing(false); }

  };



  const processAudioQueue = async () => {

    if (isCurrentlyPlaying.current || isPaused) return;

    if (audioBufferQueue.current.length === 0) {

      if (speechQueue.current.length === 0) { setIsSpeaking(false); if (handsFreeActiveRef.current) setTimeout(() => toggleDictation(), 400); return; }

      await fillAudioBuffer(); if (audioBufferQueue.current.length === 0) { setTimeout(processAudioQueue, 150); return; }

    }

    isCurrentlyPlaying.current = true; setIsSpeaking(true);

    const item = audioBufferQueue.current.shift(); playedQueue.current.push(item);

    const ctx = ensureAudioContext();

    try {

      const decoded = await ctx.decodeAudioData(item.buffer.slice(0)); const source = ctx.createBufferSource();

      source.buffer = decoded; source.connect(ctx.destination); sourceNodeRef.current = source; source.start(0);

      fillAudioBuffer(); source.onended = () => { isCurrentlyPlaying.current = false; processAudioQueue(); };

    } catch (e) { isCurrentlyPlaying.current = false; processAudioQueue(); }

  };



  const fillAudioBuffer = async () => {

    if (isFetchingNext.current || speechQueue.current.length === 0) return;

    isFetchingNext.current = true;

    try { const txt = speechQueue.current.shift(); const buf = await fetchAudioChunk(txt); audioBufferQueue.current.push({ text: txt, buffer: buf }); }

    catch (e) {} finally { isFetchingNext.current = false; }

  };



  const queueSpeech = (fullText) => {

    const chunks = fullText.replace(/[*_#~`>]/g, '').replace(/\[.*?\]/g, '').split(/(?<=[.!?])\s+/).filter(c => c.length > 2);

    speechQueue.current = [...speechQueue.current, ...chunks]; processAudioQueue();

  };



  const stopSpeech = () => {

    if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);

    speechQueue.current = []; audioBufferQueue.current = []; playedQueue.current = [];

    if (sourceNodeRef.current) { sourceNodeRef.current.onended = null; try { sourceNodeRef.current.stop(); } catch (e) {} }

    isCurrentlyPlaying.current = false; setIsSpeaking(false); setIsPaused(false);

  };



  const handleFrankResponse = async (textToProcess, isDeepDive = false) => {

    if (!textToProcess && !isDeepDive) return;

    stopSpeech(); setIsProcessing(true); if (isDeepDive) { setIsDeepDiving(true); setActiveTab('deep-dive'); }

    setErrorMessage(null); setInputText('');

    try {

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

      const systemPrompt = "You are Frank, Sunset Blvd executive. 1st person. Detailed pass for scripts. Brief punchy for chat.";

      const res = await fetchWithRetry(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [...messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })), { role: 'user', parts: [{ text: textToProcess || "Surgery start" }] }], systemInstruction: { parts: [{ text: systemPrompt }] } }) });

      const data = await res.json(); const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) return;

      const isScript = textToProcess?.includes("SCRIPT CONTENT:") || isDeepDive;

      const newMessages = [...messages, { role: 'user', content: isDeepDive ? "[Surgery]" : (isScript ? "[New Script]" : textToProcess) }, { role: 'assistant', content: responseText }];

      if (isScript) {

        const grade = responseText.toUpperCase().includes("GREEN LIGHT") ? "GREEN LIGHT" : "PASS";

        if (isDeepDive) setDeepDiveData({ content: responseText, grade }); else setScriptData({ content: responseText, grade });

        setSeriesBible(prev => prev + `\n- ${grade}: ${responseText.slice(0, 100)}`);

      }

      setMessages(newMessages); await saveToCloud(newMessages); queueSpeech(responseText);

    } catch (e) { setErrorMessage("Error processing..."); } finally { setIsProcessing(false); setIsDeepDiving(false); }

  };



  return (

    <div className="flex flex-col h-screen bg-[#faf9f6] text-[#2c2c2c] overflow-hidden text-sm">

      <header className="flex items-center justify-between px-8 py-5 bg-white border-b shadow-sm shrink-0">

        <div className="flex items-center gap-4">

          <div className="w-10 h-10 bg-black rounded flex items-center justify-center text-white font-bold italic">F</div>

          <div><h1 className="text-xl font-black uppercase tracking-tighter">Frank</h1><p className="text-[8px] uppercase tracking-[0.3em] font-bold text-stone-400">Executive Series Office</p></div>

        </div>

        <div className="flex items-center gap-6 text-[10px] font-bold uppercase">

          <button onClick={() => setActiveTab('chat')} className={activeTab === 'chat' ? 'border-b-2 border-black' : ''}>LOUNGE</button>

          <button onClick={() => setActiveTab('executive-report')} className={activeTab === 'executive-report' ? 'border-b-2 border-black' : ''}>REPORT</button>

          <button onClick={() => setActiveTab('read-through')} className={activeTab === 'read-through' ? 'border-b-2 border-black' : ''}>READ-THROUGH</button>

          <button onClick={clearHistory} className="text-red-400"><Trash2 size={12} /></button>

        </div>

      </header>



      {errorMessage && <div className="bg-red-50 text-red-600 text-[10px] py-2 px-10 flex items-center justify-between border-b"><span>{errorMessage}</span><button onClick={() => setErrorMessage(null)}>X</button></div>}



      <main className="flex-1 flex flex-col overflow-hidden relative">

        {activeTab === 'chat' ? (

          <div className="flex-1 overflow-y-auto p-10 space-y-10">

            {messages.map((m, i) => (

              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                <div className={`max-w-[75%] p-6 rounded-2xl ${m.role === 'user' ? 'bg-stone-800 text-white' : 'bg-white border shadow-sm'}`}>{m.content}</div>

              </div>

            ))}

            {isProcessing && <div className="p-5 italic text-stone-400 flex items-center gap-3"><Loader2 className="animate-spin" size={16} /><span>Frank is considering...</span></div>}

            <div ref={scrollRef} className="h-4" />

          </div>

        ) : activeTab === 'read-through' ? (

          <div className="flex-1 flex flex-col overflow-hidden bg-white">

            <div className="bg-stone-900 text-white p-3 flex items-center justify-between px-8">

               <label className="px-5 py-2 bg-stone-800 rounded-full cursor-pointer text-[10px] font-bold uppercase"><FileUp size={14} className="inline mr-2"/>Upload<input type="file" className="hidden" accept=".pdf" onChange={(e) => handleScriptUpload(e.target.files[0], true)} /></label>

               <div className="flex items-center gap-3">

                  <button onClick={() => skipScene(-1)}><SkipBack size={16} /></button>

                  <button onClick={toggleReadPlayback} className="px-8 py-2 bg-white text-black rounded-full font-black uppercase text-xs">{readState === 'playing' ? 'PAUSE' : 'PLAY'}</button>

                  <button onClick={stopReadPlayback}><StopCircle size={16} /></button>

                  <button onClick={() => skipScene(1)}><SkipForward size={16} /></button>

               </div>

            </div>

            <div className="flex-1 flex overflow-hidden">

               <div className="w-1/3 bg-stone-50 border-r p-10 overflow-y-auto">

                  <h2 className="text-xl font-black uppercase mb-8">Voice Casting</h2>

                  <div className="space-y-4">

                     {['Narrator', ...cast].map(char => (

                        <div key={char} className="bg-white p-4 rounded-xl border">

                           <div className="flex justify-between mb-2"><span className="font-bold text-xs uppercase">{char}</span><button onClick={() => testVoice(char)}><Volume1/></button></div>

                           <select value={voiceAssignments[char] || ''} onChange={e => setVoiceAssignments(v => ({...v, [char]: e.target.value}))} className="w-full text-xs p-2 border rounded">

                              <option value="">Jimmy (Default)</option>

                              {INWORLD_VOICES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}

                           </select>

                        </div>

                     ))}

                  </div>

               </div>

               <div className="w-2/3 p-16 overflow-y-auto font-serif text-lg leading-relaxed">

                  {parsedLines.map((line, idx) => (

                    <div key={idx} ref={currentLineIndex === idx ? activeLineRef : null} className={`p-2 rounded mb-2 ${currentLineIndex === idx ? 'bg-stone-900 text-white' : ''}`} style={{ marginLeft: line.type === 'character' ? '20%' : (line.type === 'dialogue' ? '15%' : '0'), textAlign: line.type === 'transition' ? 'right' : 'left' }}>{line.text}</div>

                  ))}

               </div>

            </div>

          </div>

        ) : null}



        {activeTab === 'chat' && (

          <div className="bg-white border-t p-5 shrink-0">

            <div className="flex items-center gap-4 max-w-5xl mx-auto w-full">

              <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleFrankResponse(inputText)} placeholder="Defend your arc..." className="flex-1 px-6 py-4 bg-stone-50 rounded-xl outline-none" />

              <button onClick={() => handleFrankResponse(inputText)} className="bg-stone-800 text-white w-12 h-12 rounded-full flex items-center justify-center"><Send size={18} /></button>

              <button onClick={() => toggleDictation()} className={`w-12 h-12 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-600 text-white' : 'bg-stone-50'}`}><Mic size={20}/></button>

              <label className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center cursor-pointer"><FileUp size={20}/><input type="file" className="hidden" accept=".pdf" onChange={(e) => handleScriptUpload(e.target.files[0])}/></label>

            </div>

          </div>

        )}

      </main>

    </div>

  );

};



export default App;
