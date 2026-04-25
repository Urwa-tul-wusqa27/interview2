import React, { useState, useEffect, useRef } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  useNavigate, 
  useParams,
  Link,
  useLocation
} from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Mic, 
  MicOff, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  RefreshCcw,
  Trophy,
  Target,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  MessageSquareQuote,
  History,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Lightbulb,
  ArrowUpRight
} from 'lucide-react';
import { QuestionSet, AnalysisResponse, AppStep, OverallReport, Type } from './types.ts';
import { GoogleGenAI } from "@google/genai";
import { auth, signInWithGoogle, logout, onAuthStateChanged, User, sessionService } from './lib/firebase';

// Initialize Gemini Client
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY1 || process.env.GEMINI_API_KEY || '' 
});

// --- Speech Recognition Types ---
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// --- Navbar Component ---
function Navbar({ user }: { user: User | null }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-xl border-b border-neutral-100 py-3 shadow-md' : 'bg-white/40 backdrop-blur-md py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
            <Zap size={20} fill="currentColor" />
          </div>
          <span className="text-xl font-display font-black tracking-tighter text-neutral-900">INTERVIEW.AI</span>
        </Link>

        <div className="flex items-center gap-12">
          <Link 
            to="/" 
            className={`text-sm font-bold transition-all flex items-center gap-2 ${location.pathname === '/' ? 'text-indigo-600' : 'text-neutral-500 hover:text-neutral-900'}`}
          >
            <Play size={16} />
            Practice
          </Link>
          <Link 
            to="/history" 
            className={`text-sm font-bold transition-all flex items-center gap-2 ${location.pathname === '/history' ? 'text-indigo-600' : 'text-neutral-500 hover:text-neutral-900'}`}
          >
            <History size={16} />
            History
          </Link>
          
          <div className="h-6 w-px bg-neutral-200 mx-2 hidden md:block" />

          {user && (
            <div className="hidden md:flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Active Session</span>
                <span className="text-xs font-bold text-neutral-900">{user.email?.split('@')[0]}</span>
              </div>
              <div className="relative group/user flex items-center gap-2">
                <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-white shadow-sm" />
                <button 
                  onClick={logout}
                  className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// --- App Component ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-neutral-50 selection:bg-indigo-100 selection:text-indigo-900">
        <Navbar user={user} />
        <div className="pt-24">
          <Routes>
            <Route path="/" element={<Landing user={user} />} />
            <Route path="/history" element={<HistoryPage user={user} />} />
            <Route path="/interview/:role/:level" element={<InterviewPage user={user} />} />
            <Route path="/session/:id" element={<SessionDetail user={user} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

// --- History Page ---
function HistoryPage({ user }: { user: User | null }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    sessionService.getSessions(user.uid).then(data => {
      setSessions(data);
      setLoading(false);
    });
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <History className="text-indigo-600" size={32} />
          <h1 className="text-4xl font-display font-black">Session History</h1>
        </div>
        <Link to="/" className="text-sm font-bold text-neutral-500 hover:text-indigo-600 transition-colors flex items-center gap-2">
          Practice More
          <ArrowRight size={16} />
        </Link>
      </div>

      {!user ? (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-neutral-100 shadow-xl shadow-neutral-200/20">
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-8">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-2xl font-black text-neutral-900 mb-4">Personal History is Locked</h2>
          <p className="text-neutral-500 font-medium max-w-md mx-auto mb-10">Sign in to securely store your interview sessions and track your progress across devices.</p>
          <button 
            onClick={signInWithGoogle}
            className="px-8 py-4 bg-neutral-900 text-white rounded-2xl font-bold flex items-center gap-3 mx-auto hover:bg-neutral-800 transition-all"
          >
            Sign In with Google
          </button>
        </div>
      ) : loading ? (
        <div className="text-center py-20 text-neutral-400">Loading your journey...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-neutral-100">
          <p className="text-neutral-400 font-bold mb-6">No sessions yet. Time to start practicing!</p>
          <Link to="/" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold">Start First Session</Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {sessions.map(s => (
            <motion.div 
              key={s.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(`/session/${s.id}`)}
              className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-xl shadow-neutral-200/20 flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-neutral-50 flex items-center justify-center text-2xl font-black text-neutral-300">
                  {s.role[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">{s.role}</h3>
                  <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">{s.level} • {s.createdAt.toDate().toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-black text-neutral-400 uppercase">Score</p>
                  <p className="text-2xl font-black text-indigo-600">{s.overallReport.overall_score}</p>
                </div>
                <ChevronRight size={24} className="text-neutral-200 group-hover:text-indigo-600 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Session Detail ---
function SessionDetail({ user }: { user: User | null }) {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<any>(null);
  const [step, setStep] = useState<"overall" | "questions">("overall");

  useEffect(() => {
    if (id) sessionService.getSession(id).then(setSession);
  }, [id]);

  if (!session) return <div className="p-20 text-center">Loading session data...</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
       <div className="flex items-center justify-between mb-20">
         <Link to="/history" className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-indigo-600 transition-colors">
           <ArrowRight size={16} className="rotate-180" />
           Back to History
         </Link>
         <div className="flex bg-neutral-100 p-1.5 rounded-2xl">
           <button 
             onClick={() => setStep("overall")}
             className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${step === "overall" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
           >
             Overall Report
           </button>
           <button 
             onClick={() => setStep("questions")}
             className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${step === "questions" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
           >
             Question Reviews
           </button>
         </div>
       </div>

       {step === "overall" ? (
         <OverallReportView report={session.overallReport} onNext={() => setStep("questions")} />
       ) : (
         <div className="space-y-20">
           {session.allAnalyses.map((analysis: any, idx: number) => (
             <Dashboard 
               key={idx} 
               analysis={analysis} 
               originalAnswer={session.sessionData[idx].answer} 
               currentReviewIndex={idx} 
               totalReviews={session.allAnalyses.length}
               onNext={() => {}}
               isLast={true}
             />
           ))}
         </div>
       )}
    </div>
  );
}

// --- Landing Page ---
function Landing({ user }: { user: User | null }) {
  const [roles, setRoles] = useState<QuestionSet[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("Beginner");
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/questions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRoles(data);
          if (data.length > 0) setSelectedRole(data[0].role);
        }
      })
      .catch(err => console.error("Failed to load questions:", err));
  }, []);

  const handleStart = () => {
    if (selectedRole && selectedLevel) {
      navigate(`/interview/${encodeURIComponent(selectedRole)}/${encodeURIComponent(selectedLevel)}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/40 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-100/40 blur-[140px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          <motion.div 
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-10">
              <Sparkles size={14} className="animate-pulse" />
              <span>AI-Powered Interview Coach</span>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-display font-black tracking-tight text-neutral-900 mb-10 leading-[0.95]">
              Master your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">career story.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-neutral-500 mb-12 max-w-xl leading-relaxed font-medium">
              Don't just practice confidence. Build <span className="text-neutral-900 font-bold border-b-4 border-indigo-200">technical substance</span>. Our AI rewrites your experiences into high-impact STAR stories.
            </p>

            <div className="flex flex-wrap gap-12 items-center">
               <div className="flex flex-col">
                  <span className="text-4xl font-black text-neutral-900 tracking-tighter">12k+</span>
                  <span className="text-sm font-bold text-neutral-400">Candidates Prepped</span>
               </div>
               <div className="h-10 w-px bg-neutral-200" />
               <div className="flex flex-col">
                  <span className="text-4xl font-black text-neutral-900 tracking-tighter">94%</span>
                  <span className="text-sm font-bold text-neutral-400">Success Rate</span>
               </div>
               <div className="h-10 w-px bg-neutral-200" />
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-neutral-200 transition-transform hover:z-10 hover:scale-110 cursor-pointer overflow-hidden">
                       <img src={`https://i.pravatar.cc/150?u=${i}`} alt="" />
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="lg:col-span-5"
          >
            <div className="bg-white p-10 rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(79,70,229,0.2)] border border-neutral-100 relative group">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200 rotate-12 group-hover:rotate-6 transition-transform">
                <Play size={40} fill="currentColor" />
              </div>

              <h3 className="text-2xl font-black text-neutral-900 mb-10 flex items-center gap-3">
                 <Zap className="text-amber-400" />
                 Start Prep Session
              </h3>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-4 mb-2 block">Select Role</label>
                  <div className="grid grid-cols-1 gap-3">
                    {roles && roles.slice(0, 3).map((r) => (
                      <button 
                         key={r.role}
                         onClick={() => setSelectedRole(r.role)}
                         className={`w-full p-5 rounded-2xl border-2 text-left transition-all font-bold group flex items-center justify-between ${selectedRole === r.role ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-neutral-50 border-neutral-50 text-neutral-600 hover:border-neutral-200'}`}
                      >
                         {r.role}
                         <ChevronRight size={18} className={selectedRole === r.role ? 'text-white' : 'text-neutral-300'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-4 mb-2 block">Experience Level</label>
                  <div className="flex gap-3">
                    {["Beginner", "Intermediate", "Expert"].map(lvl => (
                      <button 
                         key={lvl}
                         onClick={() => setSelectedLevel(lvl)}
                         className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all ${selectedLevel === lvl ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-neutral-50 border-neutral-50 text-neutral-500 hover:border-neutral-200'}`}
                      >
                         {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleStart}
                  className="w-full py-6 bg-indigo-600 text-white rounded-3xl font-black text-xl flex items-center justify-center gap-4 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 group"
                >
                  Enter Simulator
                  <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-center text-xs font-bold text-neutral-400">
                   {user ? 'Cloud syncing enabled' : 'Sign in for persistent history'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-12">
           <div className="space-y-6 group">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Target size={32} />
              </div>
              <h4 className="text-2xl font-black text-neutral-900">STAR Reconstructor</h4>
              <p className="text-neutral-500 leading-relaxed font-medium">Automatically transforms raw memories into structured, high-impact STAR frameworks.</p>
           </div>
           <div className="space-y-6 group">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <BrainCircuit size={32} />
              </div>
              <h4 className="text-2xl font-black text-neutral-900">Semantic Fluff Detection</h4>
              <p className="text-neutral-500 leading-relaxed font-medium">Identifies generic buzzwords and empty claims that recruiters ignore.</p>
           </div>
           <div className="space-y-6 group">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <ShieldCheck size={32} />
              </div>
              <h4 className="text-2xl font-black text-neutral-900">Predictive Job Fit</h4>
              <p className="text-neutral-500 leading-relaxed font-medium">Calculates your probabilistic readiness for top-tier tech roles based on answer depth.</p>
           </div>
        </div>

        {/* How it Works */}
        <div className="mt-60">
           <div className="text-center mb-24">
              <h2 className="text-5xl font-black text-neutral-900 mb-6">Designed for Substance.</h2>
              <p className="text-xl text-neutral-500 font-medium">Generic practice makes you sound generic. <br /> We help you build technical weight.</p>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
              <div className="space-y-12">
                 <div className="flex gap-8 group">
                    <div className="w-12 h-12 bg-neutral-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shrink-0 group-hover:rotate-6 transition-transform">1</div>
                    <div>
                       <h5 className="text-2xl font-bold text-neutral-900 mb-2">Simulate Real Pressure</h5>
                       <p className="text-neutral-500 font-medium">Answer 5 high-impact questions curated from FAANG interview banks.</p>
                    </div>
                 </div>
                 <div className="flex gap-8 group">
                    <div className="w-12 h-12 bg-neutral-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shrink-0 group-hover:rotate-6 transition-transform">2</div>
                    <div>
                       <h5 className="text-2xl font-bold text-neutral-900 mb-2">Detect the "Bluff"</h5>
                       <p className="text-neutral-500 font-medium">Our AI semantic engine identifies filler words and generic patterns in your narrative.</p>
                    </div>
                 </div>
                 <div className="flex gap-8 group">
                    <div className="w-12 h-12 bg-neutral-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shrink-0 group-hover:rotate-6 transition-transform">3</div>
                    <div>
                       <h5 className="text-2xl font-bold text-neutral-900 mb-2">Build a Star Roadmap</h5>
                       <p className="text-neutral-500 font-medium">Get a personal improvement kit with rewritten answers and strategic action steps.</p>
                    </div>
                 </div>
              </div>

              <div className="relative">
                 <div className="absolute inset-0 bg-indigo-600/10 blur-[120px] rounded-full" />
                 <div className="relative bg-white p-2 rounded-[2.5rem] shadow-4xl border border-neutral-100">
                    <div className="bg-neutral-50 p-10 rounded-[2.2rem] space-y-6">
                       <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full bg-red-400" />
                          <div className="w-3 h-3 rounded-full bg-amber-400" />
                          <div className="w-3 h-3 rounded-full bg-emerald-400" />
                       </div>
                       <div className="space-y-3">
                          <div className="h-4 w-3/4 bg-neutral-200 rounded-full" />
                          <div className="h-4 w-1/2 bg-neutral-200 rounded-full" />
                          <div className="h-4 w-2/3 bg-neutral-200 rounded-full" />
                       </div>
                       <div className="pt-6">
                          <div className="p-6 bg-indigo-600 rounded-2xl text-white">
                             <div className="flex items-center gap-2 mb-2 font-black text-[10px] uppercase tracking-widest text-indigo-200">
                                <Zap size={14} /> AI Reconstruction
                             </div>
                             <p className="text-sm font-bold leading-relaxed">"Instead of saying 'I was involved', say 'I led the migration of 4 microservices which reduced latency by 32%...'"</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Interview Page Component ---
function InterviewPage({ user }: { user: User | null }) {
  const { role, level } = useParams<{ role: string, level: string }>();
  const [step, setStep] = useState<AppStep>("interview");
  const [roles, setRoles] = useState<QuestionSet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [answer, setAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [sessionData, setSessionData] = useState<{ question: string; answer: string }[]>([]);
  const [allAnalyses, setAllAnalyses] = useState<AnalysisResponse[]>([]);
  const [overallReport, setOverallReport] = useState<OverallReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    fetch('/api/questions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRoles(data);
      })
      .catch(err => console.error("Failed to load questions:", err));
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setToast({ message: "Speech recognition not supported in this browser.", type: 'error' });
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (e: any) => {
        let t = "";
        for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
        setAnswer(prev => prev + (prev.endsWith(' ') ? '' : ' ') + t);
      };
      recognition.onend = () => setIsRecording(false);
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    }
  };

  const roleData = roles.find(r => r.role === role);
  const levelData = roleData?.levels?.find(l => l.level === level);
  
  // Memoize shuffled questions to keep session stable during steps
  const currentQuestions = useRef<string[]>([]);
  useEffect(() => {
    if (levelData?.questions) {
      const qs = [...levelData.questions];
      for (let i = qs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [qs[i], qs[j]] = [qs[j], qs[i]];
      }
      currentQuestions.current = qs.slice(0, 5);
    }
  }, [levelData, step]); // Refresh on level change or if we go back/reset

  const question = currentQuestions.current[currentIndex];

  const handleQuestionSubmit = async () => {
    if (!answer.trim()) {
      setToast({ message: "Please provide an answer to proceed.", type: 'error' });
      return;
    }
    
    // Buffer the data
    const updatedSession = [...sessionData, { question, answer }];
    setSessionData(updatedSession);
    
    if (currentIndex < currentQuestions.current.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswer("");
      setToast({ message: "Answer saved! Next question...", type: 'success' });
    } else {
      handleFinalBulkAnalysis(updatedSession);
    }
  };

  const handleFinalBulkAnalysis = async (finalSession: { question: string; answer: string }[]) => {
    setStep("analyzing");
    setIsAnalyzing(true);
    
    try {
      const prompt = `
        You are a high-level Career Consultant and Interview Analyst. Analyze these interview answers for a ${role} (${level}) role.
        
        Session History:
        ${finalSession.map((s, i) => `[Q${i+1}] ${s.question}\n[A${i+1}] ${s.answer}`).join("\n\n")}

        REQUIREMENTS:
        1. For EACH of the 5 answers, provide an AnalysisResponse:
           - substance_score (0-100)
           - fluff_percentage (0-100)
           - weaknesses (array of strings)
           - highlighted_fluff_words (array of generic words found)
           - improved_answer (optimized version using STAR method)
           - verdict (one sentence judgment)

        2. Provide an OverallReport for the session:
           - overall_score (0-100)
           - consultant_verdict (professional summary)
           - key_themes (what the user consistently did well or poorly)
           - growth_areas (specific points for improvement - VERY IMPORTANT)
           - improvement_plan (a list of 3-5 specific actions they should take next)
           - job_fit_prediction ("High", "Low", or "Medium")
           - readiness_summary (detailed suggestions on how to improve - THIS IS THE FINAL TAKEAWAY)

        IMPORTANT: Return strictly JSON.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analyses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    substance_score: { type: Type.NUMBER },
                    fluff_percentage: { type: Type.NUMBER },
                    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                    highlighted_fluff_words: { type: Type.ARRAY, items: { type: Type.STRING } },
                    improved_answer: { type: Type.STRING },
                    verdict: { type: Type.STRING }
                  },
                  required: ["substance_score", "fluff_percentage", "weaknesses", "highlighted_fluff_words", "improved_answer", "verdict"]
                }
              },
              overall: {
                type: Type.OBJECT,
                properties: {
                  overall_score: { type: Type.NUMBER },
                  consultant_verdict: { type: Type.STRING },
                  key_themes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  growth_areas: { type: Type.ARRAY, items: { type: Type.STRING } },
                  improvement_plan: { type: Type.ARRAY, items: { type: Type.STRING } },
                  job_fit_prediction: { type: Type.STRING },
                  readiness_summary: { type: Type.STRING }
                },
                required: ["overall_score", "consultant_verdict", "key_themes", "growth_areas", "improvement_plan", "job_fit_prediction", "readiness_summary"]
              }
            },
            required: ["analyses", "overall"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");

      if (parsed.analyses && parsed.overall) {
        setAllAnalyses(parsed.analyses);
        setOverallReport(parsed.overall);
        
        if (user) {
          try {
            await sessionService.saveSession(
              user.uid,
              role || 'Unspecified',
              level || 'Beginner',
              finalSession,
              parsed.analyses,
              parsed.overall
            );
          } catch (err) {
            console.error("Failed to save session:", err);
          }
        }
        setStep("question_analysis");
      }
    } catch (e) {
      console.error("Bulk Analysis Error:", e);
      setToast({ message: "Analysis failed. Please try again.", type: 'error' });
      setStep("interview");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const nextReview = () => {
    if (reviewIndex < allAnalyses.length - 1) {
      setReviewIndex(reviewIndex + 1);
    } else {
      setStep("overall_report");
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswer("");
    setSessionData([]);
    setAllAnalyses([]);
    setOverallReport(null);
    setReviewIndex(0);
    setStep("interview");
    setToast({ message: "Session restarted. Good luck!", type: 'success' });
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-0 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-3 border ${
              toast.type === 'error' ? 'bg-red-500 text-white border-red-400' : 'bg-emerald-500 text-white border-emerald-400'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === "interview" && (
          <InterviewRoom 
            key="room"
            question={question}
            answer={answer}
            setAnswer={setAnswer}
            isRecording={isRecording}
            toggleRecording={toggleRecording}
            onSubmit={handleQuestionSubmit}
            role={role}
            currentIndex={currentIndex}
            total={currentQuestions.current.length}
          />
        )}
        {step === "analyzing" && <AnalyzingState key="analyzing" isOverall={isAnalyzing} />}
        {step === "question_analysis" && allAnalyses.length > 0 && (
          <Dashboard 
            key="dash"
            analysis={allAnalyses[reviewIndex]}
            originalAnswer={sessionData[reviewIndex]?.answer}
            onNext={nextReview}
            isLast={reviewIndex >= allAnalyses.length - 1}
            currentReviewIndex={reviewIndex}
            totalReviews={allAnalyses.length}
            onRestart={handleRestart}
          />
        )}
        {step === "overall_report" && overallReport && (
          <OverallReportView 
            report={overallReport} 
            onNext={() => setStep("prediction")} 
          />
        )}
        {step === "prediction" && overallReport && (
          <PredictionView 
            prediction={overallReport.job_fit_prediction}
            summary={overallReport.readiness_summary}
            report={overallReport}
            onReset={handleRestart} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-components ---

function InterviewRoom({ question, answer, setAnswer, isRecording, toggleRecording, onSubmit, role, currentIndex, total }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-4xl mx-auto px-6 py-12 lg:py-24"
    >
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-200 flex items-center justify-center text-neutral-600 font-black text-xs">
            {role?.[0] || '?'}
          </div>
          <div>
            <span className="text-sm font-black text-neutral-400 uppercase tracking-widest">{role} Session</span>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: total }).map((_, i) => (
                <div key={i} className={`h-1 w-4 rounded-full ${i < currentIndex ? 'bg-indigo-600' : i === currentIndex ? 'bg-indigo-300' : 'bg-neutral-200'}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-neutral-400 uppercase">Question {currentIndex + 1} of {total}</span>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3rem] border border-neutral-100 shadow-2xl shadow-neutral-200/30 mb-8 relative">
        <MessageSquareQuote className="absolute top-8 left-8 text-neutral-100" size={80} />
        <div className="relative z-10">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-neutral-900 leading-tight">
            {question}
          </h2>
        </div>
      </div>

      <div className="relative mb-8 group">
        <textarea 
          placeholder="Describe your situation, action, and results..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full h-80 p-10 rounded-[2.5rem] border-2 border-neutral-100 bg-white text-neutral-800 font-medium focus:ring-8 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all resize-none shadow-sm text-xl leading-relaxed"
        />
        
        <div className="absolute bottom-8 right-8 flex items-center gap-4">
          <button 
            onClick={toggleRecording}
            className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200 scale-110' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
          >
            {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={() => window.location.href = '/'}
          className="px-8 py-5 rounded-2xl font-bold bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors"
        >
          Quit session
        </button>
        <button 
          onClick={onSubmit}
          className="flex-1 bg-neutral-900 text-white rounded-2xl py-5 font-bold flex items-center justify-center gap-3 hover:bg-black transition-all text-xl shadow-xl shadow-neutral-200"
        >
          {currentIndex < total - 1 ? "Next Question" : "Finish & Analyze"}
          <ArrowRight size={24} />
        </button>
      </div>
    </motion.div>
  );
}

function AnalyzingState({ isOverall }: any) {
  const steps = isOverall 
    ? ["Aggregating Performance...", "Filtering Noise...", "Identifying Semantic Patterns...", "Predicting Job Fit...", "Calculating Readiness...", "Finalizing Executive Verdict..."]
    : ["Scanning for Fluff...", "Evaluating STAR Format...", "Comparing with Expert Benchmarks...", "Identifying Missing Context...", "Synthesizing Feedback...", "Generating Report..."];
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTextIndex(prev => (prev + 1) % steps.length), 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-900 text-white overflow-hidden">
      <div className="relative mb-12">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="w-48 h-48 rounded-full border border-neutral-800 flex items-center justify-center"
        >
          <div className="w-[90%] h-[90%] rounded-full border border-neutral-700 border-dashed animate-pulse" />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <BrainCircuit className="text-emerald-500" size={60} />
        </div>
        
        <motion.div 
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full border-4 border-emerald-500/20"
        />
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={textIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          className="space-y-4"
        >
          <p className="text-xs font-black uppercase tracking-[0.5em] text-emerald-500 text-center">
            {isOverall ? 'Global Pattern Processor' : 'Neural Engine Active'}
          </p>
          <h3 className="text-3xl font-display font-bold text-center">{steps[textIndex]}</h3>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Dashboard({ analysis, originalAnswer, onNext, isLast, currentReviewIndex, totalReviews, onRestart }: any) {
  const highlightBuzzwords = (text: string, buzzwords: string[]) => {
    if (!buzzwords?.length) return text;
    let parts: (string | React.ReactNode)[] = [text];
    
    buzzwords.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      const newParts: (string | React.ReactNode)[] = [];
      parts.forEach(part => {
        if (typeof part === 'string') {
          const split = part.split(regex);
          split.forEach((s, idx) => {
            if (s.toLowerCase() === word.toLowerCase()) {
              newParts.push(<span key={`${word}-${idx}`} className="bg-red-50 text-red-600 px-1 rounded border border-red-100 font-bold decoration-red-200 underline decoration-wavy">{s}</span>);
            } else if (s !== '') {
              newParts.push(s);
            }
          });
        } else {
          newParts.push(part);
        }
      });
      parts = newParts;
    });
    return parts;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto px-6 py-12 lg:py-24"
    >
      <div className="flex items-center justify-between mb-16">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-display font-black text-neutral-900 tracking-tight">Reviewing Q{currentReviewIndex + 1}</h1>
            <p className="text-sm font-bold text-neutral-400 uppercase tracking-[0.2em]">Step {currentReviewIndex + 1} of {totalReviews} in Session</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onRestart}
            className="px-6 py-4 bg-white border border-neutral-200 text-neutral-500 rounded-2xl font-bold flex items-center gap-2 hover:bg-neutral-50 transition-all"
          >
            <RefreshCcw size={18} />
            Try New Question
          </button>
          <button 
            onClick={onNext}
            className="px-8 py-5 bg-neutral-900 text-white rounded-[1.5rem] font-bold flex items-center gap-3 hover:bg-black transition-all shadow-2xl shadow-neutral-200 group text-lg"
          >
            {isLast ? "View Final Verdict" : "Next Response Analysis"}
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-xl shadow-neutral-100/50 flex flex-col items-center text-center group hover:border-indigo-100 transition-colors">
          <CircularProgress value={analysis.substanceScore || analysis.substance_score} color="#10B981" />
          <h3 className="mt-6 text-sm font-black text-neutral-400 uppercase tracking-widest">Substance Score</h3>
          <p className="text-xs font-bold text-emerald-600 mt-2">Quality of content</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-xl shadow-neutral-100/50 flex flex-col items-center text-center group hover:border-red-100 transition-colors">
          <CircularProgress value={analysis.fluffPercentage || analysis.fluff_percentage} color="#EF4444" />
          <h3 className="mt-6 text-sm font-black text-neutral-400 uppercase tracking-widest">Fluff Percentage</h3>
          <p className="text-xs font-bold text-red-600 mt-2">Generic filler detected</p>
        </div>
        <div className="lg:col-span-2 bg-neutral-900 p-10 rounded-[3rem] text-white overflow-hidden relative">
          <BrainCircuit className="absolute -right-6 -bottom-6 text-white/5" size={200} />
          <div className="relative z-10">
            <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4">Interviewer's Verdict</h3>
            <p className="text-2xl font-bold leading-tight italic">"{analysis.verdict}"</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Original Answer */}
        <div className="bg-white rounded-[3rem] border border-neutral-100 overflow-hidden shadow-2xl shadow-neutral-200/50 group">
          <div className="px-10 py-6 border-b border-neutral-50 flex items-center justify-between">
            <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest">Your Original Answer</h3>
            <div className="px-3 py-1 rounded-full bg-red-50 text-red-500 text-[10px] font-bold border border-red-100 uppercase">
              {(analysis.identifiedBuzzwords || analysis.highlighted_fluff_words)?.length || 0} Flags
            </div>
          </div>
          <div className="p-10 text-lg leading-relaxed text-neutral-700 font-medium">
            {highlightBuzzwords(originalAnswer, analysis.identifiedBuzzwords || analysis.highlighted_fluff_words)}
          </div>
        </div>

        {/* Improved Answer */}
        <div className="bg-indigo-600 rounded-[3rem] overflow-hidden shadow-3xl shadow-indigo-200 relative group">
          <div className="px-10 py-6 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-sm font-black text-white/60 uppercase tracking-widest">AI Optimized (STAR Method)</h3>
            <div className="px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold border border-white/20 uppercase">
              Perfected
            </div>
          </div>
          <div className="p-10 text-lg leading-relaxed text-white font-bold relative group/answer">
            {analysis.improvedAnswer || analysis.improved_answer}
            <button 
              onClick={() => {
                navigator.clipboard.writeText(analysis.improvedAnswer || analysis.improved_answer);
                alert("Copied to clipboard!");
              }}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-opacity md:opacity-0 group-hover/answer:opacity-100"
              title="Copy Answer"
            >
              <Send size={16} className="rotate-[-45deg]" />
            </button>
          </div>
          <div className="px-10 py-6 bg-white/5 border-t border-white/10 flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
               <Zap className="text-amber-400" size={18} />
             </div>
             <p className="text-xs text-indigo-100 font-medium">Try repeating this version in your next mock session for higher impact.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-12 border border-neutral-100 shadow-xl shadow-neutral-100/30">
        <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-8 flex items-center gap-2">
          <AlertCircle size={18} className="text-red-400" />
          Weaknesses & Growth Points
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analysis.weaknesses && analysis.weaknesses.map((w: string, i: number) => (
            <div key={i} className="flex gap-4 p-6 bg-neutral-50 rounded-2xl border border-neutral-100 items-start">
               <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 border border-neutral-200 text-neutral-400 font-bold text-xs">
                 {i + 1}
               </div>
               <p className="text-neutral-700 font-bold leading-snug">{w}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CircularProgress({ value, color }: { value: number, color: string }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="#F4F4F5"
          strokeWidth="8"
        />
        <motion.circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-black text-neutral-900">{value}%</span>
      </div>
    </div>
  );
}

function OverallReportView({ report, onNext }: { report: OverallReport, onNext: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-6xl mx-auto px-6 py-10 lg:py-20"
    >
      <div className="bg-neutral-900 rounded-[4rem] p-16 text-white relative overflow-hidden shadow-[0_50px_120px_-20px_rgba(79,70,229,0.4)]">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col lg:flex-row gap-20 items-center">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-10">
              <Zap size={14} className="fill-white" />
              Executive Prep Assessment
            </div>
            <h2 className="text-6xl font-display font-black leading-none tracking-tight mb-8">
              Your Career <br />
              <span className="text-indigo-400">Roadmap.</span>
            </h2>
            <p className="text-xl font-medium text-neutral-400 leading-relaxed mb-10 italic">
              "{report.consultant_verdict}"
            </p>
            <div className="flex flex-wrap gap-4">
               <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${report.job_fit_prediction === 'High' ? 'bg-emerald-500' : report.job_fit_prediction === 'Medium' ? 'bg-amber-500' : 'bg-red-500'}`} />
                  <span className="text-sm font-bold">{report.job_fit_prediction} Fit Prediction</span>
               </div>
               <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                  <Sparkles size={16} className="text-amber-400" />
                  <span className="text-sm font-bold">{report.growth_areas.length} Insights</span>
               </div>
            </div>
          </div>

          <div className="shrink-0">
             <div className="relative">
                <svg className="w-64 h-64">
                   <circle cx="128" cy="128" r="110" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="20" />
                   <motion.circle 
                      cx="128" cy="128" r="110" fill="none" stroke="#4F46E5" strokeWidth="20"
                      strokeDasharray={691}
                      initial={{ strokeDashoffset: 691 }}
                      animate={{ strokeDashoffset: 691 - (691 * report.overall_score / 100) }}
                      transition={{ duration: 2.5, ease: "easeOut" }}
                      strokeLinecap="round"
                   />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-7xl font-black">{report.overall_score}</span>
                   <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest -mt-2">P-Score</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-20">
         <div className="space-y-8">
            <h3 className="text-2xl font-black text-neutral-900 flex items-center gap-3">
               <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Lightbulb size={24} />
               </div>
               Key Behavioral Patterns
            </h3>
            <div className="grid gap-4">
               {report.key_themes.map((theme, i) => (
                 <div key={i} className="p-8 bg-white rounded-3xl border border-neutral-100 shadow-xl shadow-neutral-100/50 flex items-start gap-5 group hover:border-indigo-100 transition-colors">
                    <span className="w-10 h-10 rounded-xl bg-neutral-50 text-neutral-300 font-black flex items-center justify-center shrink-0">0{i+1}</span>
                    <p className="text-lg font-bold text-neutral-700 leading-tight group-hover:text-neutral-900 transition-colors">{theme}</p>
                 </div>
               ))}
            </div>
         </div>

         <div className="space-y-8">
            <h3 className="text-2xl font-black text-neutral-900 flex items-center gap-3">
               <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Target size={24} />
               </div>
               Growth Areas
            </h3>
            <div className="bg-white p-10 rounded-[3rem] border border-neutral-100 shadow-xl shadow-neutral-100/50">
               <div className="space-y-8">
                  {report.growth_areas.map((area, i) => (
                    <div key={i} className="flex gap-6 items-start">
                       <div className="w-2 h-10 bg-indigo-600 rounded-full shrink-0" />
                       <p className="text-lg font-bold text-neutral-800 leading-relaxed">{area}</p>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      <div className="mt-20 flex flex-col md:flex-row gap-6">
         <button 
           onClick={onNext}
           className="flex-1 py-10 bg-indigo-600 text-white rounded-[3rem] font-black text-4xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-6 group"
         >
            Final Improvement Plan
            <ChevronRight size={40} className="group-hover:translate-x-2 transition-transform" />
         </button>
      </div>
    </motion.div>
  );
}

function PredictionView({ prediction, summary, report, onReset }: { prediction: string, summary: string, report: OverallReport, onReset: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto px-6 py-10 lg:py-20"
    >
      <div className="bg-white rounded-[4rem] p-12 lg:p-24 border border-neutral-100 shadow-4xl relative overflow-hidden text-center">
        <Sparkles className="absolute top-10 left-10 text-indigo-100/50" size={120} />
        <div className="relative z-10">
           <div className="w-24 h-24 bg-neutral-900 rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-10 shadow-2xl">
              <ShieldCheck size={48} />
           </div>
           
           <h4 className="text-sm font-black text-neutral-400 uppercase tracking-[0.4em] mb-4">Strategic Improvement Roadmap</h4>
           <h2 className="text-6xl md:text-8xl font-display font-black text-neutral-900 mb-12 tracking-tight">
              Action <span className="text-indigo-600">Items.</span>
           </h2>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left mb-20">
              <div className="bg-neutral-50 p-10 rounded-[3rem] border border-neutral-100 space-y-8">
                 <h5 className="font-black text-neutral-900 uppercase tracking-widest flex items-center gap-3 text-xs">
                    <Zap size={14} className="text-amber-500" />
                    Immediate Next Steps
                 </h5>
                 <div className="space-y-6">
                    {report.improvement_plan.map((step, i) => (
                       <div key={i} className="flex gap-5 items-start">
                          <div className="w-8 h-8 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-xs font-black text-indigo-600 shrink-0">
                             {i + 1}
                          </div>
                          <p className="text-lg font-bold text-neutral-700 leading-tight">{step}</p>
                       </div>
                    ))}
                 </div>
              </div>
              
              <div className="bg-neutral-900 p-10 rounded-[3rem] text-white flex flex-col justify-center relative overflow-hidden">
                 <BrainCircuit className="absolute -right-6 -bottom-6 text-white/5" size={200} />
                 <h5 className="font-black text-indigo-400 uppercase tracking-widest flex items-center gap-3 text-xs mb-6 relative z-10">
                    <Zap size={14} />
                    Final Readiness Verdict
                 </h5>
                 <p className="text-2xl font-medium leading-relaxed italic relative z-10">
                    "{summary}"
                 </p>
                 <div className="mt-10 flex items-center gap-4 relative z-10">
                    <div className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider ${prediction === 'High' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
                       {prediction} Confidence
                    </div>
                 </div>
              </div>
           </div>

           <div className="flex flex-col md:flex-row gap-6">
              <button 
                 onClick={onReset}
                 className="flex-1 py-10 bg-indigo-600 text-white rounded-[3rem] font-black text-3xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-4 group"
              >
                 New Session
                 <RefreshCcw size={32} className="group-hover:rotate-180 transition-transform duration-700" />
              </button>
              <Link 
                 to="/history"
                 className="px-16 py-10 bg-neutral-900 text-white rounded-[3rem] font-bold text-2xl flex items-center justify-center gap-4 hover:bg-black transition-all"
              >
                 <History size={32} />
                 Review History
              </Link>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
