import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Pause, Play, RotateCcw, Loader2, AlertCircle, FileUp, ClipboardList, MessageSquare, Trash2, CheckCircle2, Zap, ZapOff, BookOpen, Download, Volume2, Image as ImageIcon, Sparkles, Stethoscope, ChevronRight, Activity, Scissors, XCircle, Zap as ZapIcon, Users, SkipBack, SkipForward, StopCircle, PlayCircle, Volume1 } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// --- CONFIGURATION (UPDATED FOR DEPLOYMENT) ---
const apiKey = process.env.REACT_APP_GEMINI_API_KEY; 
const INWORLD_API_KEY = process.env.REACT_APP_INWORLD_API_KEY; 
const VOICE_ID = process.env.REACT_APP_VOICE_ID || "default-oglabcjnetcklcq7rghmbw__jimmy"; 
const MODEL_ID = "inworld-tts-1.5-max";

// Rest of your Inworld Voices list goes here...
