import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, AlertTriangle, ArrowRight, Brain, CheckCircle2, Cpu, 
  Languages, Play, Radio, RotateCcw, Send, ShieldAlert, 
  Sparkles, Speaker, Terminal, TrendingUp, Users, Volume2, Wifi, Zap, Unlock, Lock, HelpCircle,
  Shield, ShieldCheck, Key, Fingerprint, MessageSquare, X
} from 'lucide-react';

// Initial logs
const INITIAL_LOGS = [
  {
    id: 1,
    type: 'CCTV Alert',
    message: 'Warning: Too many people packed together at the North Exit Corridor.',
    status: 'critical',
    timestamp: '22:51:14',
    source: 'CAM-09 (NORTH)',
    badge: 'SURGE'
  },
  {
    id: 2,
    type: 'IoT Failure',
    message: 'Gate 4 Turnstile 2: OFFLINE. Communication link timeout (Code: E-990).',
    status: 'warning',
    timestamp: '22:49:03',
    source: 'IOT-G4-T2',
    badge: 'OFFLINE'
  },
  {
    id: 3,
    type: 'Social Scrape',
    message: "Twitter Update: People stuck near Gate 4 for 20 minutes, getting crowded!",
    status: 'warning',
    timestamp: '22:47:35',
    source: 'SCRAPE-X-04',
    badge: 'PANIC'
  }
];

// Simulated incidents list
const SIMULATED_INCIDENTS = [
  {
    type: 'Sensor Alert',
    message: 'Decibel Sensor DB-12 (North Stand): Spiked to 118dB (Possible crowd cheer peaks/screams).',
    status: 'critical',
    source: 'DB-12 (NORTH-EAST)',
    badge: 'DECIBEL',
    threatLevel: 92,
    prediction: 'Crowd density peak in North Stand exit routes. Rerouting recommended to balance gates.'
  },
  {
    type: 'Structural Scan',
    message: 'Drone-4 structural scan: High load pressure on barricade B-17 (North-East Exit). Rerouting critical.',
    status: 'critical',
    source: 'DRONE-4 (SCAN)',
    badge: 'STRUCTURAL',
    threatLevel: 96,
    prediction: 'Barricade B-17 nearing load threshold. Est. bottleneck in 4 minutes if flow is not diverted.'
  },
  {
    type: 'Hardware Failure',
    message: 'Emergency Gate G4-B: Power surge detected. Gate fails closed, trapping crowd flow.',
    status: 'critical',
    source: 'SYS-MAG-G4',
    badge: 'SYSTEM',
    threatLevel: 99,
    prediction: 'CAPACITY STALL THREAT. North Corridor bottleneck. Initiate physical manual gate override.'
  }
];

// Translations dictionary for Fan Alerts
const FAN_ALERTS = {
  te: {
    lang: 'Telugu',
    script: 'ఉత్తర కారిడార్‌లో విపరీతమైన రద్దీ ఉంది. దయచేసి అందరూ వెంటనే గేట్ 5 వైపునకు వెళ్ళండి. ప్రశాంతంగా ఉండండి, భద్రతా సిబ్బంది సూచనలను పాటించండి.',
    phonetic: 'Uttara kāridārlō viparītamaina raddī undi. Dayacēsi andarū veṇṭanē gēṭ 5 vaipunaku veḷḷaṇḍi. Praśāntan̄gā uṇฎi, bhadratā sibbandi sūcanalanu pāṭincaṇḍi.'
  },
  hi: {
    lang: 'Hindi',
    script: 'उत्तरी कॉरिडोर में अत्यधिक भीड़ है। कृपया तुरंत गेट 5 की ओर प्रस्थान करें। शांत रहें और सुरक्षा कर्मचारियों के निर्देशों का पालन करें।',
    phonetic: 'Uttari corridor mein atyadhik bheed hai. Kripya turant gate 5 ki aur prasthan karein. Shant rahein aur suraksha karmiyon ke nirdeshon ka palan karein.'
  },
  en: {
    lang: 'English',
    script: 'High congestion detected in the North Corridor. Please proceed directly to Gate 5 immediately. Remain calm and follow security personnel directions.',
    phonetic: 'Official Stadium Emergency Alert Broadcast'
  }
};

function App() {
  // Authorization / Clearance State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [operatorId, setOperatorId] = useState('OP-8809');
  const [clearanceLevel, setClearanceLevel] = useState('3'); // '1' = Monitor, '2' = Operator, '3' = Commander
  const [selectedSystemLanguage, setSelectedSystemLanguage] = useState('te'); // 'te', 'hi', 'en'
  const [loginCode, setLoginCode] = useState('••••••••');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginStatusText, setLoginStatusText] = useState('Standby');
  const [biometricScanning, setBiometricScanning] = useState(false);

  // Navigation State
  const [activeDashboardTab, setActiveDashboardTab] = useState('telemetry'); // telemetry, intelligence, broadcast

  // Dynamic Drone Scanning State Overlay
  const [droneScanOverlay, setDroneScanOverlay] = useState(false);

  // Turnstile diagnostics states
  const [turnstileStatus, setTurnstileStatus] = useState('OFFLINE');
  const [turnstileRebooting, setTurnstileRebooting] = useState(false);

  // Floating Chatbot UI state hooks
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const [chatUserQuery, setChatUserQuery] = useState('');
  const [chatThreadHistory, setChatThreadHistory] = useState([
    { 
      sender: 'assistant', 
      text: 'Hi! I am your Stadium Assistant. If you have any questions about how this dashboard works or what to do next, just ask me!' 
    }
  ]);

  // Data/Dashboard State
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [simulationIndex, setSimulationIndex] = useState(0);
  const [threatLevel, setThreatLevel] = useState(89); // Default crowd pressure index
  const [aiPrediction, setAiPrediction] = useState('High risk of localized crowd crush in the North Corridor if directional flow is not modified immediately.');
  
  // Tactical action steps
  const [steps, setSteps] = useState([
    {
      id: 1,
      title: 'Immediate Diversion',
      desc: 'Open Gate 5 and route traffic away from the North Corridor bottleneck.',
      status: 'pending', // pending, executing, completed
      actionText: 'Execute Diversion',
      requiredClearance: 2
    },
    {
      id: 2,
      title: 'Ground Crew Deployment',
      desc: 'Deploy Sector Bravo support officers to manual flow management points.',
      status: 'pending',
      actionText: 'Deploy Squad',
      requiredClearance: 2
    },
    {
      id: 3,
      title: 'Hardware Override',
      desc: 'Send magnetic manual override to override locked Gate 4 turnstiles.',
      status: 'pending',
      actionText: 'Override Gate 4',
      requiredClearance: 3
    }
  ]);

  // Audio/Transmit states
  const [paPlaying, setPaPlaying] = useState(false);
  const [walkieTransmitting, setWalkieTransmitting] = useState(false);
  const [walkieState, setWalkieState] = useState('Standby'); // Standby, Transmitting, Completed
  const [activeTab, setActiveTab] = useState('all'); // all, critical, iot, social
  const [selectedLanguage, setSelectedLanguage] = useState('te'); // te (Telugu), hi (Hindi), en (English)

  // Ref to automatically scroll chatbot thread to the bottom
  const chatEndRef = useRef(null);

  // Styling helpers
  const glassCardStyle = {
    background: 'rgba(24, 24, 27, 0.55)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.07)'
  };

  const premiumButtonStyle = {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  // Sync selected system language with selected translation alert language on load
  useEffect(() => {
    setSelectedLanguage(selectedSystemLanguage);
  }, [selectedSystemLanguage]);

  // Auto-scroll chat bot history
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatThreadHistory]);

  // Handle Speech Synthesis TTS Helper
  const triggerTextToSpeech = (text, langKey) => {
    if (!('speechSynthesis' in window)) {
      console.warn("Speech Synthesis is not supported in this browser.");
      return;
    }

    // Cancel active speech to prevent overlap
    window.speechSynthesis.cancel();

    const speechInstance = new SpeechSynthesisUtterance(text);
    speechInstance.rate = 0.95;
    speechInstance.volume = 1.0;

    let langCode = 'en-US';
    if (langKey === 'te') langCode = 'te-IN';
    else if (langKey === 'hi') langCode = 'hi-IN';
    else if (langKey === 'en') langCode = 'en-US';

    speechInstance.lang = langCode;

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => 
      v.lang.toLowerCase() === langCode.toLowerCase() || 
      v.lang.toLowerCase().includes(langKey.toLowerCase())
    );

    if (matchedVoice) {
      speechInstance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(speechInstance);
  };

  // Play PA Audio Script Handler
  const togglePaAudio = () => {
    if (paPlaying) {
      window.speechSynthesis.cancel();
      setPaPlaying(false);
    } else {
      const scriptText = "Attention all spectators in the North Stand. We are experiencing heavy bottlenecking in the North Corridor exit. Please redirect towards Exit Gates 5 and 6 immediately. Security personnel are on-site to assist. Remain calm and move in an orderly fashion.";
      setPaPlaying(true);
      
      triggerTextToSpeech(scriptText, 'en');

      // Turn off visual waves when speaking ends
      const checkSpeaking = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setPaPlaying(false);
          clearInterval(checkSpeaking);
        }
      }, 500);
    }
  };

  // Play fan alert translation output
  const handlePushTranslationSpeech = () => {
    const translationText = FAN_ALERTS[selectedLanguage].script;
    triggerTextToSpeech(translationText, selectedLanguage);
    alert(`Translation Alert dispatched in ${FAN_ALERTS[selectedLanguage].lang} to Stadium Jumbotrons and Mobile App clients.`);
  };

  // Mock authentication gate
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!operatorId.trim()) {
      alert("Please enter a valid Operator ID.");
      return;
    }

    setLoginLoading(true);
    setLoginStatusText('CONNECTING TO MUMBAI NETWORK...');
    
    setTimeout(() => {
      setLoginStatusText('INITIALIZING DASHBOARD ACCESS...');
      setTimeout(() => {
        setLoginStatusText('ACCESS GRANTED. SECURE PORTAL ONLINE...');
        setTimeout(() => {
          setIsLoggedIn(true);
          setLoginLoading(false);
        }, 800);
      }, 800);
    }, 1000);
  };

  // Mock biometric scanning trigger
  const triggerBiometricScan = () => {
    if (loginLoading) return;
    setBiometricScanning(true);
    setLoginStatusText('SCANNING FINGERPRINT KEY...');
    
    setTimeout(() => {
      setLoginStatusText('BIOMETRICS OK: OPERATOR ACCESS AUTHORIZED');
      setTimeout(() => {
        setIsLoggedIn(true);
        setBiometricScanning(false);
        setLoginStatusText('Standby');
      }, 800);
    }, 1500);
  };

  // Simulation logs trigger handler
  const triggerNextIncident = () => {
    if (parseInt(clearanceLevel) < 2) {
      alert("ACCESS DENIED: Minimum Tier 2 (Operator) clearance required to inject mock telemetry streams.");
      return;
    }

    if (simulationIndex >= SIMULATED_INCIDENTS.length) {
      alert("All simulated emergency events triggered. Dashboard at maximum status capacity.");
      return;
    }

    const nextIncident = SIMULATED_INCIDENTS[simulationIndex];
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const timestampStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newLog = {
      id: Date.now(),
      type: 'Sensor Alert',
      message: nextIncident.message,
      status: nextIncident.status,
      timestamp: timestampStr,
      source: nextIncident.source,
      badge: nextIncident.badge,
      isNew: true
    };

    setLogs(prev => [newLog, ...prev]);
    setThreatLevel(nextIncident.threatLevel);
    setAiPrediction(nextIncident.prediction);
    setSimulationIndex(prev => prev + 1);

    if (simulationIndex === 0) {
      setSteps(prev => prev.map(s => s.id === 1 ? { ...s, status: 'executing' } : s));
    } else if (simulationIndex === 1) {
      setSteps(prev => prev.map(s => s.id === 2 ? { ...s, status: 'executing' } : s));
    } else if (simulationIndex === 2) {
      setSteps(prev => prev.map(s => s.id === 3 ? { ...s, status: 'executing' } : s));
    }

    // Automatically trigger the voice announcement broadcast instantly when clicked
    if (!paPlaying) {
      const scriptText = "Attention all spectators in the North Stand. We are experiencing heavy bottlenecking in the North Corridor exit. Please redirect towards Exit Gates 5 and 6 immediately. Security personnel are on-site to assist. Remain calm and move in an orderly fashion.";
      setPaPlaying(true);
      triggerTextToSpeech(scriptText, 'en');
      const checkSpeaking = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setPaPlaying(false);
          clearInterval(checkSpeaking);
        }
      }, 500);
    }
  };

  // Reset simulation
  const resetSimulation = () => {
    if (parseInt(clearanceLevel) < 2) {
      alert("ACCESS DENIED: Minimum Tier 2 (Operator) clearance required to reset operations telemetry.");
      return;
    }

    setLogs(INITIAL_LOGS);
    setSimulationIndex(0);
    setThreatLevel(89);
    setAiPrediction('High risk of localized crowd crush in the North Corridor if directional flow is not modified immediately.');
    setSteps([
      {
        id: 1,
        title: 'Immediate Diversion',
        desc: 'Open Gate 5 and route traffic away from the North Corridor bottleneck.',
        status: 'pending',
        actionText: 'Execute Diversion',
        requiredClearance: 2
      },
      {
        id: 2,
        title: 'Ground Crew Deployment',
        desc: 'Deploy Sector Bravo support officers to manual flow management points.',
        status: 'pending',
        actionText: 'Deploy Squad',
        requiredClearance: 2
      },
      {
        id: 3,
        title: 'Hardware Override',
        desc: 'Send magnetic manual override to override locked Gate 4 turnstiles.',
        status: 'pending',
        actionText: 'Override Gate 4',
        requiredClearance: 3
      }
    ]);
    setPaPlaying(false);
    setWalkieTransmitting(false);
    setWalkieState('Standby');
    setDroneScanOverlay(false);
    setTurnstileStatus('OFFLINE');
    setTurnstileRebooting(false);
    window.speechSynthesis.cancel();
  };

  // Execute Step
  const executeStep = (id, reqClearance) => {
    if (parseInt(clearanceLevel) < reqClearance) {
      alert(`ACCESS DENIED: Required Clearance Tier ${reqClearance} to execute this action.`);
      return;
    }

    setSteps(prev => prev.map(s => {
      if (s.id === id) {
        return { 
          ...s, 
          status: s.status === 'completed' ? 'pending' : 'completed' 
        };
      }
      return s;
    }));
  };

  // Walkie Talkie Transmit
  const transmitWalkie = () => {
    if (parseInt(clearanceLevel) < 2) {
      alert("ACCESS DENIED: Minimum Tier 2 (Operator) clearance required to transmit Walkie-Talkie dispatches.");
      return;
    }

    if (walkieTransmitting) return;
    setWalkieTransmitting(true);
    setWalkieState('Transmitting');
    setTimeout(() => {
      setWalkieTransmitting(false);
      setWalkieState('Acknowledged');
      setTimeout(() => {
        setWalkieState('Standby');
      }, 3000);
    }, 2500);
  };

  // Turnstile Reboot Action
  const handleRebootTurnstile = () => {
    setTurnstileRebooting(true);
    setTimeout(() => {
      setTurnstileRebooting(false);
      setTurnstileStatus('SECURE');
    }, 1000);
  };

  // Scenario 1: Nominal state simulation
  const triggerNominalScenario = () => {
    setThreatLevel(15);
    setLogs([
      {
        id: Date.now(),
        type: 'System Status',
        message: 'All exit gates reporting normal flow rate. Crowd pressure nominal.',
        status: 'nominal',
        timestamp: new Date().toLocaleTimeString(),
        source: 'CORE-MGMT',
        badge: 'OK'
      }
    ]);
    setSteps(prev => prev.map(s => ({ ...s, status: 'pending' })));
    setTurnstileStatus('SECURE');
    setTurnstileRebooting(false);
    setDroneScanOverlay(false);
    
    // Stop speaking
    window.speechSynthesis.cancel();
    setPaPlaying(false);
  };

  // Scenario 2: Crowd surge critical simulation
  const triggerCrowdSurgeScenario = () => {
    setThreatLevel(89);

    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const timestampStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    const crowdLog = {
      id: Date.now(),
      type: 'Sensor Alert',
      message: 'Warning: Too many people packed together at the North Exit Corridor.',
      status: 'critical',
      timestamp: timestampStr,
      source: 'DB-12 (NORTH-EAST)',
      badge: 'DECIBEL',
      isNew: true
    };
    
    setLogs(prev => [crowdLog, ...prev]);
    setSteps(prev => prev.map(s => s.id === 1 ? { ...s, status: 'executing' } : s));

    // Automatically trigger the initialized voice broadcast handler instantly
    if (!paPlaying) {
      const scriptText = "Attention all spectators in the North Stand. We are experiencing heavy bottlenecking in the North Corridor exit. Please redirect towards Exit Gates 5 and 6 immediately. Security personnel are on-site to assist. Remain calm and move in an orderly fashion.";
      setPaPlaying(true);
      triggerTextToSpeech(scriptText, 'en');
      const checkSpeaking = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setPaPlaying(false);
          clearInterval(checkSpeaking);
        }
      }, 500);
    }
  };

  // Handle chatbot thread submissions
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatUserQuery.trim()) return;

    const userMessage = { sender: 'user', text: chatUserQuery };
    
    // Normalize user query input targets using .toLowerCase().trim()
    const query = chatUserQuery.toLowerCase().trim();
    setChatUserQuery('');

    // Update state tracks arrays loops setChatThreadHistory dynamically
    setChatThreadHistory(prev => [...prev, userMessage]);

    // Simulate AI thinking and response
    setTimeout(() => {
      let botResponse = '';
      if (query.includes('situation') || query.includes('incident') || query.includes('what happened') || query.includes('crowd') || query.includes('crowd status')) {
        botResponse = "Right now, there is a big crowd building up near the North Exit Gate. We need to divert people immediately to avoid a crowd crush.";
      } else if (query.includes('sound') || query.includes('voice') || query.includes('broadcast')) {
        botResponse = "The 'Simulate PA Broadcast' button reads out the emergency announcement out loud through the speakers. It will match the language you chose during login!";
      } else if (query.includes('gate 5') || query.includes('exit') || query.includes('diversion') || query.includes('gate') || query.includes('gates')) {
        botResponse = "We recommend opening Gate 5 right away to safely direct people away from the crowded corridor.";
      } else if (query.includes('language') || query.includes('telugu') || query.includes('hindi')) {
        botResponse = "The dashboard automatically translates the emergency alerts into Telugu or Hindi based on what you picked at the login screen.";
      } else {
        botResponse = "Everything else looks fine! You can ask me about the 'sound system', 'crowd status', 'gate updates', or 'languages' to learn more.";
      }

      setChatThreadHistory(prev => [...prev, { sender: 'assistant', text: botResponse }]);
    }, 500);
  };

  // Get filtered logs
  const filteredLogs = logs.filter(log => {
    if (activeTab === 'all') return true;
    if (activeTab === 'critical') return log.status === 'critical';
    if (activeTab === 'iot') return log.type.includes('IoT') || log.type.includes('Sensor') || log.type.includes('Hardware') || log.type.includes('Status');
    if (activeTab === 'social') return log.type.includes('Social');
    return true;
  });

  /* RENDERING PORTAL: LOGIN OR DASHBOARD */
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-955 text-slate-100 flex flex-col items-center justify-center font-sans p-4 relative overflow-hidden">
        
        {/* Decorative background lights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl animate-pulse" />

        {/* Dynamic header label */}
        <div className="flex items-center gap-2 mb-6 relative z-10">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-450 animate-pulse" />
          <span className="text-[11px] font-hud uppercase tracking-widest text-slate-400">MUMBAI NATIONAL ARENA • LIVE COMMAND CENTER</span>
        </div>

        {/* Consolidated auth layout split card */}
        <div 
          className="w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col md:flex-row relative z-10 shadow-2xl backdrop-blur-xl transition-all duration-300"
          style={glassCardStyle}
        >
          
          {/* Left panel: Cricket action cover */}
          <div className="w-full md:w-1/2 relative bg-slate-955 min-h-[220px] md:min-h-[480px]">
            <img 
              src="/cricket_match_feed.jpg" 
              alt="Cricket Match Live" 
              className="absolute inset-0 w-full h-full object-cover opacity-60" 
            />
            {/* Glassmorphic overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-955 via-slate-955/40 to-transparent flex flex-col justify-end p-8">
              <h2 className="text-2xl font-extrabold uppercase font-hud tracking-tight text-white leading-tight">
                SENTINEL OPERATIONS
              </h2>
              <p className="text-xs text-slate-300 mt-2 font-sans leading-relaxed max-w-sm">
                Unified operations dashboard for crowd planning, real-time telemetry analytics, and multi-language event dispatches.
              </p>
              <div className="flex gap-4 mt-6 text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" /> MATCH 100% ONLINE</span>
                <span>SECURE NODE</span>
              </div>
            </div>
          </div>

          {/* Right panel: Login forms */}
          <div className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-slate-900/40 border-t md:border-t-0 md:border-l border-slate-800">
            <div className="flex items-center gap-2.5 mb-6">
              <Shield className="w-7 h-7 text-indigo-500 animate-status-pulse" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-250 font-hud">Operator Handshake</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Clearance level check-in</p>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              
              {/* Operator ID */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono text-slate-555 uppercase tracking-widest font-semibold">Operator ID</label>
                <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-3 items-center gap-3">
                  <Users className="w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={operatorId} 
                    onChange={(e) => setOperatorId(e.target.value.toUpperCase())}
                    disabled={loginLoading || biometricScanning}
                    className="bg-transparent border-none text-slate-100 text-xs w-full focus:outline-none font-mono font-semibold" 
                    placeholder="OP-8809" 
                  />
                </div>
              </div>

              {/* Clearance credentials */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono text-slate-555 uppercase tracking-widest font-semibold">Security Clearance Level</label>
                <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-3 items-center gap-3">
                  <Key className="w-4 h-4 text-slate-400" />
                  <select 
                    value={clearanceLevel} 
                    onChange={(e) => setClearanceLevel(e.target.value)}
                    disabled={loginLoading || biometricScanning}
                    className="bg-transparent border-none text-slate-300 text-xs w-full focus:outline-none cursor-pointer font-mono select-none"
                  >
                    <option value="1" className="bg-slate-900 text-slate-200 font-mono">Tier 1: Read-Only System Monitor</option>
                    <option value="2" className="bg-slate-900 text-slate-200 font-mono">Tier 2: Tactical Ground Operator</option>
                    <option value="3" className="bg-slate-900 text-slate-200 font-mono">Tier 3: Crisis Response Commander</option>
                  </select>
                </div>
              </div>

              {/* Voice Language select */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono text-slate-555 uppercase tracking-widest font-semibold">Broadcast Language Accent</label>
                <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-3 items-center gap-3">
                  <Languages className="w-4 h-4 text-slate-400" />
                  <select 
                    value={selectedSystemLanguage} 
                    onChange={(e) => setSelectedSystemLanguage(e.target.value)}
                    disabled={loginLoading || biometricScanning}
                    className="bg-transparent border-none text-slate-300 text-xs w-full focus:outline-none cursor-pointer font-mono select-none"
                  >
                    <option value="te" className="bg-slate-900 text-slate-200 font-mono">Telugu (తెలుగు)</option>
                    <option value="hi" className="bg-slate-900 text-slate-200 font-mono">Hindi (हिन्दी)</option>
                    <option value="en" className="bg-slate-900 text-slate-200 font-mono">English (United States)</option>
                  </select>
                </div>
              </div>

              {/* Status display */}
              <div className="flex justify-between items-center text-[9px] font-mono text-slate-555 border-t border-slate-850 pt-2.5">
                <span>Status: <span className={`${loginStatusText !== 'Standby' ? 'text-indigo-400 font-bold animate-pulse' : ''}`}>{loginStatusText}</span></span>
                <span>DB CODE: ONLINE</span>
              </div>

              {/* Submission buttons */}
              <div className="flex flex-col gap-2.5 mt-2">
                <button
                  type="submit"
                  disabled={loginLoading || biometricScanning}
                  style={premiumButtonStyle}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-655 border border-indigo-550/20 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-[0.99] disabled:cursor-not-allowed font-hud shadow-lg shadow-indigo-950/20"
                >
                  {loginLoading ? 'Validating Token...' : 'Initialize Secure Dashboard'}
                </button>

                <button
                  type="button"
                  onClick={triggerBiometricScan}
                  disabled={loginLoading || biometricScanning}
                  style={premiumButtonStyle}
                  className="w-full bg-slate-800 hover:bg-slate-755 disabled:opacity-50 border border-slate-700 text-slate-300 hover:text-white font-bold py-2.5 px-4 rounded-xl text-[10px] uppercase tracking-wider cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-[0.99] flex items-center justify-center gap-1.5 font-hud"
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  Quick Biometric Verification
                </button>
              </div>

            </form>
          </div>

        </div>

        {/* Security watermark */}
        <p className="text-[9px] text-slate-600 font-mono uppercase tracking-widest text-center mt-8">
          Sentinel stadium networks • Cryptographic connection protocol active
        </p>
      </div>
    );
  }

  /* RENDERING PORTAL: SECURITY COMMAND CONSOLE DASHBOARD */
  return (
    <div className="min-h-screen bg-slate-955 text-slate-100 flex flex-col font-sans scanline-effect selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      
      {/* Animated Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none z-0" />

      {/* GLOW DECORATIVE LINE */}
      <div className={`h-1 w-full relative z-50 transition-all duration-1000 ${
        threatLevel > 95 ? 'bg-indigo-500 shadow-[0_0_15px_#6366f1]' : 
        threatLevel > 90 ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'
      }`} />

      {/* TOP HEADER */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-955/45 border border-indigo-800/40 rounded-xl text-indigo-400">
            <ShieldAlert className="w-6 h-6 animate-status-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-100">
                SENTINEL <span className="text-slate-600 font-normal">//</span> <span className="text-slate-400 font-medium">Stadium Operations Command</span>
              </h1>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-955/60 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-emerald-405 font-mono tracking-widest uppercase">LIVE SYSTEM</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">
              Operator: <span className="text-indigo-400 font-semibold">{operatorId}</span> • Clearance Tier: <span className="text-emerald-455 font-semibold">T-{clearanceLevel}</span>
            </p>
          </div>
        </div>

        {/* CONTROLS (TABS & METRICS COMBINED) */}
        <div className="flex flex-wrap items-center gap-5">
          {/* Dashboard Tab Switcher */}
          <div className="flex bg-slate-900 p-1 border border-slate-800 rounded-xl gap-1 shadow-inner">
            <button
              onClick={() => setActiveDashboardTab('telemetry')}
              style={premiumButtonStyle}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md font-hud cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-[0.99] ${
                activeDashboardTab === 'telemetry'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-955/40'
                  : 'text-slate-455 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Telemetry stream
            </button>
            <button
              onClick={() => setActiveDashboardTab('intelligence')}
              style={premiumButtonStyle}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md font-hud cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-[0.99] ${
                activeDashboardTab === 'intelligence'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-955/40'
                  : 'text-slate-455 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              AI commander Engine
            </button>
            <button
              onClick={() => setActiveDashboardTab('broadcast')}
              style={premiumButtonStyle}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md font-hud cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-[0.99] ${
                activeDashboardTab === 'broadcast'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-955/40'
                  : 'text-slate-455 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              Broadcast Dispatch Hub
            </button>
          </div>

          <div className="h-6 w-[1px] bg-slate-800 hidden xl:block" />

          {/* Metric 1 */}
          <div className="px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-lg">
            <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider">Active Match</span>
            <span className="text-xs font-semibold text-slate-205 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block animate-pulse" />
              MI vs RCB (Finals)
            </span>
          </div>

          {/* Metric 2 */}
          <div className="px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-lg">
            <span className="block text-[9px] text-slate-500 font-mono uppercase tracking-wider">Stadium Capacity</span>
            <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-455" />
              84,312 <span className="text-slate-555">/ 85,000</span>
              <span className="text-emerald-455 text-[10px] ml-1">(99.2%)</span>
            </span>
          </div>

          {/* Dynamic Global Threat Pill with stylized severity progress indicator bar */}
          <div className={`px-4 py-1.5 rounded-lg border flex flex-col justify-center gap-1.5 transition-all duration-500 ${
            threatLevel > 95 ? 'bg-indigo-950/80 border-indigo-655 text-indigo-400 animate-pulse' :
            threatLevel > 90 ? 'bg-blue-950/80 border-blue-655 text-blue-400' : 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
          }`}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-current animate-status-pulse" />
              <div>
                <span className="block text-[8px] font-mono uppercase tracking-wider leading-none">CAPACITY LOAD</span>
                <span className="text-xs font-bold font-mono tracking-wider">
                  {threatLevel}% {threatLevel > 95 ? 'PEAK LIMIT' : 'FLOW WARNING'}
                </span>
              </div>
            </div>
            {/* Beautiful glowing horizontal meter bar track container */}
            <div className="w-full h-2 bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full animate-pulse transition-all duration-1000 ease-out" 
                style={{ 
                  width: `${threatLevel}%`, 
                  background: 'linear-gradient(90deg, #eab308 0%, #ef4444 100%)',
                  boxShadow: '0 0 12px rgba(239,68,68,0.4)'
                }}
              />
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-800 hidden xl:block" />

          {/* Profile Status Badge */}
          <div className="flex items-center gap-3 px-3.5 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl shadow-lg relative group overflow-hidden transition-all duration-300 hover:border-indigo-500/40">
            {/* Subtle glow border decoration */}
            <div className="absolute top-0 right-0 w-8 h-8 bg-indigo-500/5 rounded-full filter blur-md" />

            <div className="flex flex-col text-left font-sans">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-100 bg-slate-950 px-2 py-0.5 rounded border border-slate-850 shadow-inner">
                  <span className="text-emerald-555 text-[8px] animate-pulse">🟢</span> {operatorId}
                </span>
                <span className="text-[8px] font-mono font-bold tracking-widest text-indigo-400 bg-slate-950 border border-slate-855 px-1.5 py-0.5 rounded">
                  [SYS: {selectedSystemLanguage.toUpperCase() === 'TE' ? 'TELUGU' : selectedSystemLanguage.toUpperCase() === 'HI' ? 'HINDI' : 'ENGLISH'}]
                </span>
              </div>
              <span className="text-[8.5px] font-sans font-bold text-slate-400 mt-1 uppercase tracking-wider">
                {clearanceLevel === '3' ? 'Tier 3: Crisis Response Commander' : 
                 clearanceLevel === '2' ? 'Tier 2: Tactical Ground Operator' : 'Tier 1: Read-Only System Monitor'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* CORE VIEWPORT PANELS */}
      <main className="flex-1 p-6 max-w-8xl mx-auto w-full flex items-start justify-center relative z-10">
        
        {/* PANEL 1: TELEMETRY STREAM */}
        {activeDashboardTab === 'telemetry' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-6 w-full animate-fade-in">
            {/* Left side: Telemetry Control & Simulator (lg:col-span-4) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Incident Simulation Control Card */}
              <div 
                style={glassCardStyle}
                className="shadow-2xl rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:border-white/10"
              >
                <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-hud">Telemetry Simulation</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Inject event data variables</p>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-855 border border-slate-750 text-slate-405">
                    {simulationIndex} / {SIMULATED_INCIDENTS.length}
                  </span>
                </div>
                
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Inject stadium emergency events sequentially to test automatically generated tactical recommendations, threat level meters, and dispatch alert broadcasts.
                </p>

                {parseInt(clearanceLevel) < 2 && (
                  <div className="bg-slate-955 border border-slate-850 rounded-lg p-2.5 flex items-center gap-2 text-indigo-400">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] font-mono uppercase tracking-wide leading-relaxed">
                      Simulation locked. Requires clearance Tier 2 (Operator).
                    </span>
                  </div>
                )}

                <div className="flex gap-2.5 mt-2">
                  <button
                    onClick={triggerNextIncident}
                    disabled={simulationIndex >= SIMULATED_INCIDENTS.length || parseInt(clearanceLevel) < 2}
                    style={premiumButtonStyle}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-655 disabled:border-slate-855 border border-indigo-555/30 text-white py-2.5 px-4 rounded-lg text-xs font-bold tracking-wide uppercase flex items-center justify-center gap-2 shadow-md shadow-indigo-955/30 cursor-pointer disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-[0.99]"
                  >
                    <Zap className="w-4 h-4" />
                    Trigger Incident
                  </button>
                  
                  {simulationIndex > 0 && (
                    <button
                      onClick={resetSimulation}
                      disabled={parseInt(clearanceLevel) < 2}
                      style={premiumButtonStyle}
                      className="bg-slate-855 hover:bg-slate-800 disabled:opacity-50 border border-slate-700 text-slate-355 hover:text-white p-2.5 rounded-lg flex items-center justify-center cursor-pointer disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-[0.99]"
                      title="Reset System Simulation"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sensor Diagnostics Status Card */}
              <div 
                style={glassCardStyle}
                className="shadow-2xl rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:border-white/10"
              >
                <div className="border-b border-slate-855 pb-3 flex items-center gap-2">
                  <Cpu className="w-4.5 h-4.5 text-slate-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-hud">Active Telemetry Sensors</h3>
                </div>
                
                <div className="flex flex-col gap-2.5 text-xs font-mono">
                  <div className="flex justify-between items-center px-3.5 py-2.5 bg-slate-955/50 border border-slate-900 rounded-lg">
                    <span className="text-slate-400 font-medium">CAM-09 Corridor Live</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${simulationIndex > 0 ? 'bg-indigo-950/80 text-indigo-400 border border-indigo-900/50 animate-pulse' : 'bg-emerald-955/65 text-emerald-400 border border-emerald-900/50'}`}>
                      {simulationIndex > 0 ? 'FLOW LIMIT' : 'SECURE'}
                    </span>
                  </div>

                  {/* Actionable turnstile node with reboot loading animation */}
                  <div className="flex justify-between items-center px-3.5 py-2.5 bg-slate-955/50 border border-slate-900 rounded-lg gap-2">
                    <span className="text-slate-400 font-medium">IOT-G4-T2 Turnstile</span>
                    <div className="flex items-center gap-2">
                      {turnstileStatus === 'OFFLINE' && !turnstileRebooting && (
                        <button
                          onClick={handleRebootTurnstile}
                          style={premiumButtonStyle}
                          className="px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider bg-indigo-955/80 text-indigo-400 border border-indigo-900/40 rounded hover:bg-indigo-900/55 hover:text-white transition-all duration-300 animate-pulse cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-[0.99]"
                        >
                          REBOOT NODE
                        </button>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all duration-300 ${
                        turnstileRebooting ? 'bg-amber-950/85 text-amber-400 border border-amber-900/50 animate-pulse' :
                        turnstileStatus === 'SECURE' ? 'bg-emerald-950 text-emerald-450 border border-emerald-900/50 animate-status-pulse font-bold' :
                        'bg-amber-955/65 text-amber-405 border border-amber-900/50 font-bold'
                      }`}>
                        {turnstileRebooting ? 'REBOOTING...' : turnstileStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-3.5 py-2.5 bg-slate-955/50 border border-slate-900 rounded-lg">
                    <span className="text-slate-400 font-medium">DB-12 Decibel Peak</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${simulationIndex > 0 ? 'bg-indigo-950/80 text-indigo-400 border border-indigo-900/50 animate-pulse' : 'bg-emerald-955/65 text-emerald-400 border border-emerald-900/50'}`}>
                      {simulationIndex > 0 ? '118dB PEAK' : '92dB NORMAL'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-3.5 py-2.5 bg-slate-955/50 border border-slate-900 rounded-lg">
                    <span className="text-slate-400 font-medium">DRONE-4 Structural</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${simulationIndex > 1 ? 'bg-indigo-950/80 text-indigo-400 border border-indigo-900/50 animate-pulse' : 'bg-emerald-955/65 text-emerald-400 border border-emerald-900/50'}`}>
                      {simulationIndex > 1 ? '92% LOAD' : '30% SECURE'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Live Stadium Updates (lg:col-span-8) */}
            <div className="lg:col-span-8 flex flex-col gap-4 h-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-indigo-500 animate-pulse" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-hud">LIVE STADIUM UPDATES</h3>
                </div>
                
                {/* Filter Pills */}
                <div className="flex bg-slate-905 p-0.5 border border-slate-800 rounded-lg">
                  <button 
                    onClick={() => setActiveTab('all')} 
                    className={`px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded font-mono transition-all cursor-pointer ${
                      activeTab === 'all' ? 'bg-slate-800 text-white' : 'text-slate-555 hover:text-slate-200'
                    }`}
                  >
                    All Logs
                  </button>
                  <button 
                    onClick={() => setActiveTab('critical')} 
                    className={`px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded font-mono transition-all cursor-pointer ${
                      activeTab === 'critical' ? 'bg-indigo-955/60 text-indigo-400' : 'text-slate-555 hover:text-indigo-455'
                    }`}
                  >
                    Critical
                  </button>
                  <button 
                    onClick={() => setActiveTab('iot')} 
                    className={`px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded font-mono transition-all cursor-pointer ${
                      activeTab === 'iot' ? 'bg-slate-800 text-white' : 'text-slate-555 hover:text-slate-205'
                    }`}
                  >
                    IoT
                  </button>
                  <button 
                    onClick={() => setActiveTab('social')} 
                    className={`px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded font-mono transition-all cursor-pointer ${
                      activeTab === 'social' ? 'bg-slate-800 text-white' : 'text-slate-555 hover:text-slate-205'
                    }`}
                  >
                    Social
                  </button>
                </div>
              </div>

              {/* Log cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[510px] overflow-y-auto pr-1">
                {filteredLogs.map((log) => (
                  <div 
                    key={log.id} 
                    style={glassCardStyle}
                    className={`relative shadow-2xl rounded-xl p-4.5 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex flex-col gap-2.5 overflow-hidden ${
                      log.isNew ? 'ring-1 ring-indigo-500 animate-status-pulse' : ''
                    }`}
                  >
                    {/* Lateral Status Line */}
                    <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                      log.status === 'critical' ? 'bg-indigo-500' : 'bg-emerald-500'
                    }`} />

                    {/* Top Row Log Card */}
                    <div className="flex justify-between items-start pl-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          log.status === 'critical' 
                            ? 'bg-indigo-955 text-indigo-400 border border-indigo-900/60' 
                            : 'bg-emerald-955 text-emerald-450 border border-emerald-900/60'
                        }`}>
                          {log.badge}
                        </span>
                        <span className="text-[10px] text-slate-505 font-mono">{log.source}</span>
                      </div>
                      <span className="text-[10px] text-slate-550 font-mono">{log.timestamp}</span>
                    </div>

                    {/* Message Body */}
                    <p className="text-xs text-slate-200 leading-relaxed pl-1 font-sans">
                      {log.message}
                    </p>

                    {/* Foot telemetry info */}
                    <div className="flex justify-between items-center text-[9px] text-slate-550 font-mono border-t border-slate-850 pt-2 pl-1">
                      <span>REF: STAD_INGEST_LOG</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        ACTIVE
                      </span>
                    </div>
                  </div>
                ))}

                {filteredLogs.length === 0 && (
                  <div className="col-span-2 text-center py-20 border border-dashed border-slate-800 rounded-xl">
                    <HelpCircle className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-xs text-slate-550 font-mono uppercase tracking-wider">No logs matches filter query</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PANEL 2: AI COMMAND ENGINE */}
        {activeDashboardTab === 'intelligence' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
            {/* Left side: Analytics and Live Scan (lg:col-span-5) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Predictive Risk Assessment - Meter & Heatmap */}
              <div 
                style={glassCardStyle}
                className="shadow-2xl rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:border-white/10"
              >
                <div className="border-b border-slate-850 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-hud">LIVE SAFETY CHECKS</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Visual Threat Gauge */}
                  <div className="bg-slate-955/60 border border-slate-850 p-4 rounded-xl flex flex-col items-center justify-center relative min-h-[220px]">
                    <div className="absolute top-2 left-2 text-[9px] font-mono uppercase text-slate-550 tracking-wider">
                      Capacity Loading
                    </div>
                    
                    {/* SVG Circular Meter */}
                    <div className="relative w-36 h-36 flex items-center justify-center mt-2">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          strokeWidth="5"
                          stroke="rgba(30, 41, 59, 0.4)"
                          fill="transparent"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          strokeWidth="5"
                          stroke={threatLevel > 95 ? '#6366f1' : '#10b981'}
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 - (251.2 * threatLevel) / 100}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-1000 ease-out"
                          style={{
                            filter: `drop-shadow(0 0 8px ${threatLevel > 95 ? '#6366f1' : '#10b981'})`
                          }}
                        />
                      </svg>
                      
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-extrabold font-hud tracking-tight text-white leading-none">
                          {threatLevel}%
                        </span>
                        <span className={`text-[8px] font-bold font-hud tracking-widest uppercase mt-1 px-1.5 py-0.5 rounded ${
                          threatLevel > 95 ? 'bg-indigo-950/85 text-indigo-400 border border-indigo-900/60 animate-pulse' : 'bg-emerald-955/85 text-emerald-455 border border-emerald-900/60'
                        }`}>
                          {threatLevel > 95 ? 'PEAK LOAD' : 'OPTIMAL'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CCTV camera picture with overlays */}
                  <div className="bg-slate-955/60 border border-slate-850 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden min-h-[220px]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[9px] font-mono uppercase text-slate-500 tracking-wider border-b border-slate-900 pb-2 z-10">
                      <span>CCTV LIVE CAM-09</span>
                      <div className="flex items-center gap-1.5">
                        <label className="flex items-center gap-1 cursor-pointer text-slate-455 hover:text-slate-205 text-[8px] select-none font-bold">
                          <input 
                            type="checkbox"
                            checked={droneScanOverlay}
                            onChange={(e) => setDroneScanOverlay(e.target.checked)}
                            className="accent-emerald-500 h-3.5 w-3.5 bg-slate-955 border-slate-855 rounded focus:ring-0 cursor-pointer"
                          />
                          ACTIVATE DRONE SCAN OVERLAY
                        </label>
                        <span className="h-3.5 w-[1px] bg-slate-800" />
                        <span className="text-indigo-400 animate-pulse flex items-center gap-1 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                          BROADCAST
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 my-2 border border-slate-900 rounded bg-slate-955 relative flex items-center justify-center overflow-hidden min-h-[120px]">
                      
                      {/* Actual Cricket Play Image background */}
                      <img 
                        src="/cricket_match_feed.jpg" 
                        alt="Live Cricket Feed" 
                        className="absolute inset-0 w-full h-full object-cover opacity-50 z-0 select-none pointer-events-none" 
                      />

                      <div className="absolute top-1 left-1.5 text-[8px] text-slate-455 font-mono z-10 bg-slate-955/80 px-1 rounded">
                        DEC 22 2026 // LIVE_MATCH_FEED
                      </div>
                      <div className="absolute bottom-1 right-1.5 text-[8px] text-slate-455 font-mono z-10 bg-slate-955/80 px-1 rounded">
                        60 FPS • NORTH STAND
                      </div>

                      {/* Drone Scan Overlay Overlay vectors */}
                      {droneScanOverlay && (
                        <div className="absolute inset-0 bg-emerald-950/10 border border-emerald-500/35 pointer-events-none flex flex-col justify-between p-2.5 text-emerald-400 font-mono text-[8px] animate-fade-in z-20">
                          {/* Corner bracket graphics */}
                          <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-400" />
                          <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-400" />
                          <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-400" />
                          <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-400" />

                          {/* Central Crosshair target indicator */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                            <div className="w-8 h-[1px] bg-emerald-400/80" />
                            <div className="h-8 w-[1px] bg-emerald-400/80 absolute" />
                            <div className="w-4.5 h-4.5 border border-emerald-400/80 rounded-full absolute animate-ping" />
                            <div className="w-3 h-3 border border-emerald-400/80 rounded-full absolute" />
                          </div>

                          {/* Top Mock scanning coordinates variables */}
                          <div className="flex justify-between w-full relative z-30">
                            <span className="bg-slate-955/85 px-1.5 py-0.5 border border-emerald-500/20 rounded">GRID: NC-09-SURGE</span>
                            <span className="bg-slate-955/85 px-1.5 py-0.5 border border-emerald-500/20 rounded">ALT: 42.6m</span>
                          </div>
                          
                          {/* Bottom Coordinates */}
                          <div className="flex justify-between w-full mt-auto relative z-30">
                            <span className="bg-slate-955/85 px-1.5 py-0.5 border border-emerald-500/20 rounded">LAT: 19.1245° N</span>
                            <span className="bg-slate-955/85 px-1.5 py-0.5 border border-emerald-500/20 rounded">LNG: 72.8904° E</span>
                          </div>
                        </div>
                      )}

                      {/* Moving Scanner Overlay Line */}
                      <div className="absolute left-0 right-0 h-[1.5px] bg-emerald-500/40 shadow-[0_0_5px_rgba(16,185,129,0.5)] animate-[scanline_2.5s_linear_infinite] z-10" />
                    </div>

                    <div className="text-[9px] text-slate-405 font-mono flex items-center justify-between z-10">
                      <span>DENSITY: 7.8 pax/m²</span>
                      <span className="text-emerald-400 font-bold">MONITORING FLOW</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Prediction Warning Panel */}
              <div 
                style={glassCardStyle}
                className="shadow-2xl rounded-xl p-5 flex flex-col gap-2.5 relative overflow-hidden transition-all duration-300 hover:border-white/10"
              >
                <div className="flex items-center gap-1.5 text-indigo-400 border-b border-indigo-900/20 pb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[10px] font-bold font-mono uppercase tracking-wider">AI SAFETY PREDICTION</span>
                </div>
                <p className="text-xs text-slate-205 leading-relaxed pl-5 font-semibold italic">
                  "{aiPrediction}"
                </p>
              </div>
            </div>

            {/* Right side: GenAI Tactical Action Plan (lg:col-span-7) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-550" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-205 font-hud">GenAI Tactical Action Plan</h3>
                </div>
                <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest bg-slate-900 px-2 py-0.5 border border-slate-800 rounded">Operator Override Enabled</span>
              </div>

              <div className="flex flex-col gap-4">
                {steps.map((step) => {
                  let statusText = 'text-slate-555';
                  let actionBtnClass = 'bg-slate-805 hover:bg-slate-750 text-slate-200 border border-slate-700';
                  const isRestricted = parseInt(clearanceLevel) < step.requiredClearance;

                  if (step.status === 'executing') {
                    statusText = 'text-emerald-450';
                    actionBtnClass = 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold animate-pulse';
                  } else if (step.status === 'completed') {
                    statusText = 'text-indigo-400';
                    actionBtnClass = 'bg-indigo-950/80 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-900/50';
                  }

                  return (
                    <div 
                      key={step.id} 
                      style={glassCardStyle}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 border rounded-xl transition-all duration-300 ${
                        isRestricted ? 'opacity-70' : ''
                      } ${step.status === 'executing' ? 'border-emerald-500/45 bg-emerald-955/20 animate-glow-warning' : ''}`}
                    >
                      <div className="flex items-start gap-3.5 max-w-[75%]">
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="w-5.5 h-5.5 text-indigo-500 shrink-0 mt-0.5" />
                        ) : step.status === 'executing' ? (
                          <AlertTriangle className="w-5.5 h-5.5 text-emerald-500 shrink-0 mt-0.5 animate-status-pulse" />
                        ) : (
                          <div className="w-5.5 h-5.5 rounded-full border border-slate-800 flex items-center justify-center shrink-0 text-xs font-mono text-slate-550 mt-0.5">
                            {step.id}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-205">{step.title}</h4>
                            <span className={`text-[9px] font-mono uppercase font-black tracking-wider ${statusText}`}>
                              {step.status}
                            </span>
                            {isRestricted && (
                              <span className="text-[8px] font-mono uppercase tracking-wider bg-red-955/60 text-red-405 border border-red-900/50 px-1.5 py-0.25 rounded flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                T-{step.requiredClearance} Req.
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
                            {step.desc}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => executeStep(step.id, step.requiredClearance)}
                        disabled={isRestricted}
                        style={premiumButtonStyle}
                        className={`text-[10px] font-bold uppercase tracking-wider py-2 px-4.5 rounded-lg cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-[0.99] shrink-0 ${actionBtnClass} disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-800`}
                      >
                        {isRestricted ? (
                          <span className="flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Locked
                          </span>
                        ) : (
                          step.status === 'completed' ? 'Revoke Action' : step.actionText
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PANEL 3: BROADCAST DISPATCH HUB */}
        {activeDashboardTab === 'broadcast' && (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto w-full">
            {/* Left side: Script readouts & transmitters (lg:col-span-6) */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              
              {/* Public Address (PA) Audio Panel */}
              <div 
                style={glassCardStyle}
                className="shadow-2xl rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:border-white/10"
              >
                <div className="flex justify-between items-start border-b border-slate-805 pb-3">
                  <div className="flex items-center gap-2">
                    <Speaker className={`w-4 h-4 ${paPlaying ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold uppercase tracking-wider font-hud text-zinc-355">Stadium PA Script Broadcast</span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-850 text-slate-400">AUDIO OUT</span>
                </div>

                <div className="bg-slate-955/80 border border-slate-855 p-4 rounded-lg relative min-h-[110px] flex items-center">
                  <p className="text-xs text-slate-300 italic leading-relaxed font-sans">
                    "Attention all spectators in the North Stand. We are experiencing heavy bottlenecking in the North Corridor exit. Please redirect towards Exit Gates 5 and 6 immediately. Security personnel are on-site to assist. Remain calm and move in an orderly fashion."
                  </p>
                  
                  {paPlaying && (
                    <div className="absolute inset-x-0 bottom-1 flex justify-center items-end gap-0.5 h-6 bg-slate-955/95 py-1 px-4 rounded-b-lg">
                      <span className="text-[8px] text-indigo-400 font-mono absolute left-2 top-1.5 uppercase tracking-wider">Broadcasting live (Web Speech API)...</span>
                      <div className="w-1 bg-indigo-500 animate-[status-pulse_0.5s_infinite_alternate]" style={{height: '80%'}} />
                      <div className="w-1 bg-indigo-405 animate-[status-pulse_0.4s_infinite_alternate_0.1s]" style={{height: '60%'}} />
                      <div className="w-1 bg-indigo-500 animate-[status-pulse_0.6s_infinite_alternate_0.2s]" style={{height: '95%'}} />
                      <div className="w-1 bg-indigo-300 animate-[status-pulse_0.3s_infinite_alternate_0.1s]" style={{height: '40%'}} />
                      <div className="w-1 bg-indigo-505 animate-[status-pulse_0.5s_infinite_alternate_0.3s]" style={{height: '75%'}} />
                      <div className="w-1 bg-indigo-400 animate-[status-pulse_0.4s_infinite_alternate_0.2s]" style={{height: '50%'}} />
                      <div className="w-1 bg-indigo-500 animate-[status-pulse_0.7s_infinite_alternate_0.4s]" style={{height: '90%'}} />
                    </div>
                  )}
                </div>

                {parseInt(clearanceLevel) < 2 && (
                  <div className="bg-red-955/10 border border-red-900/20 rounded-lg p-2 flex items-center gap-2 text-indigo-400 text-[10px]">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Requires Clearance Tier 2 (Operator) to execute audio broadcast triggers.</span>
                  </div>
                )}

                <button
                  onClick={togglePaAudio}
                  disabled={parseInt(clearanceLevel) < 2}
                  style={premiumButtonStyle}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold tracking-wide uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-[0.99] ${
                    paPlaying 
                      ? 'bg-indigo-955/80 text-indigo-400 border border-indigo-500/30 animate-pulse' 
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-205 border border-slate-755'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  {paPlaying ? 'Stop Audio Broadcast' : 'Simulate PA Broadcast'}
                </button>
              </div>

              {/* Volunteer Walkie Talkie Dispatch */}
              <div 
                style={glassCardStyle}
                className="shadow-2xl rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:border-white/10"
              >
                <div className="flex justify-between items-start border-b border-slate-805 pb-3">
                  <div className="flex items-center gap-2">
                    <Radio className={`w-4 h-4 ${walkieState === 'Transmitting' ? 'text-indigo-455 animate-pulse' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold uppercase tracking-wider font-hud text-slate-350">Volunteer Dispatch Script</span>
                  </div>
                  <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase ${
                    walkieState === 'Transmitting' ? 'bg-indigo-955 text-indigo-400 animate-pulse' : 
                    walkieState === 'Acknowledged' ? 'bg-emerald-955 text-emerald-450' : 'bg-slate-950 border border-slate-855 text-slate-400'
                  }`}>
                    {walkieState}
                  </span>
                </div>

                <div className="bg-slate-955/80 border border-slate-855 p-4 rounded-lg font-mono text-[11px] text-slate-455 flex flex-col gap-1.5 min-h-[110px]">
                  <div><span className="text-slate-655">[22:54:11]</span> <span className="text-indigo-405 font-bold">COMMAND:</span> Sector Bravo Squad, redeploy immediately to North Gate 4 Plaza.</div>
                  <div><span className="text-slate-655">[22:54:15]</span> <span className="text-indigo-405 font-bold">COMMAND:</span> Set up physical barriers at intersection G4-East.</div>
                  <div><span className="text-slate-655">[22:54:19]</span> <span className="text-indigo-405 font-bold">COMMAND:</span> Divert incoming queue vectors toward Gate 5 corridor now. Over.</div>
                  {walkieState === 'Transmitting' && (
                    <div className="text-indigo-405 animate-pulse mt-1 font-semibold">&gt;&gt; TRANSMITTING WAVEFORM SECURE...</div>
                  )}
                  {walkieState === 'Acknowledged' && (
                    <div className="text-emerald-405 mt-1 font-semibold">&gt;&gt; SQUAD BRAVO Acknowledged. "En route to G4-East plaza. ETA 90s."</div>
                  )}
                </div>

                {parseInt(clearanceLevel) < 2 && (
                  <div className="bg-red-955/10 border border-red-900/20 rounded-lg p-2 flex items-center gap-2 text-indigo-400 text-[10px]">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Requires Clearance Tier 2 (Operator) to transmit Walkie-Talkie signals.</span>
                  </div>
                )}

                <button
                  onClick={transmitWalkie}
                  disabled={walkieTransmitting || parseInt(clearanceLevel) < 2}
                  style={premiumButtonStyle}
                  className="w-full bg-slate-805 hover:bg-slate-750 text-slate-205 border border-slate-705 py-2.5 px-4 rounded-lg text-xs font-bold tracking-wide uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-[0.99]"
                >
                  <Send className="w-3.5 h-3.5" />
                  {walkieState === 'Transmitting' ? 'Transmitting Over-Air...' : 'Transmit via Walkie-Talkie'}
                </button>

                {/* Walkie Talkie Glowing Audio Waveform block */}
                {walkieState === 'Transmitting' && (
                  <div className="flex justify-center items-end gap-1.5 h-10 bg-slate-955/80 border border-slate-850 p-2.5 rounded-lg mt-1 relative overflow-hidden animate-fade-in">
                    <span className="text-[8px] text-indigo-400 font-mono absolute left-2.5 top-1.5 uppercase tracking-wider animate-pulse">Walkie dispatch active...</span>
                    <div className="w-1 bg-indigo-500 rounded-full animate-[status-pulse_0.4s_infinite_alternate]" style={{height: '90%'}} />
                    <div className="w-1 bg-indigo-400 rounded-full animate-[status-pulse_0.3s_infinite_alternate_0.1s]" style={{height: '60%'}} />
                    <div className="w-1 bg-indigo-500 rounded-full animate-[status-pulse_0.5s_infinite_alternate_0.2s]" style={{height: '100%'}} />
                    <div className="w-1 bg-indigo-300 rounded-full animate-[status-pulse_0.2s_infinite_alternate_0.05s]" style={{height: '40%'}} />
                    <div className="w-1 bg-indigo-500 rounded-full animate-[status-pulse_0.4s_infinite_alternate_0.15s]" style={{height: '80%'}} />
                    <div className="w-1 bg-indigo-400 rounded-full animate-[status-pulse_0.3s_infinite_alternate_0.1s]" style={{height: '50%'}} />
                    <div className="w-1 bg-indigo-505 rounded-full animate-[status-pulse_0.6s_infinite_alternate_0.25s]" style={{height: '95%'}} />
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Multi-Language translation panel (lg:col-span-6) */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              {/* Multi-Language Translation (Telugu Focus) */}
              <div 
                style={glassCardStyle}
                className="shadow-2xl rounded-xl p-5 flex flex-col gap-4 h-full justify-between relative overflow-hidden transition-all duration-300 hover:border-white/10"
              >
                <div className="flex justify-between items-center border-b border-slate-805 pb-3">
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-indigo-550" />
                    <span className="text-xs font-bold uppercase tracking-wider font-hud text-slate-350">Multi-Language Fan Alert</span>
                  </div>
                  
                  {/* Quick Interactive Language Tabs Switcher */}
                  <div className="flex gap-1 bg-slate-955 p-0.5 border border-slate-850 rounded-md">
                    <button
                      onClick={() => setSelectedLanguage('en')}
                      style={premiumButtonStyle}
                      className={`px-2.5 py-1 text-[9px] font-bold rounded uppercase tracking-wider transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                        selectedLanguage === 'en' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/50' : 'text-slate-550 hover:text-slate-300'
                      }`}
                    >
                      [ ENGLISH ]
                    </button>
                    <button
                      onClick={() => setSelectedLanguage('te')}
                      style={premiumButtonStyle}
                      className={`px-2.5 py-1 text-[9px] font-bold rounded uppercase tracking-wider transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                        selectedLanguage === 'te' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/50' : 'text-slate-555 hover:text-slate-300'
                      }`}
                    >
                      [ తెలుగు ]
                    </button>
                    <button
                      onClick={() => setSelectedLanguage('hi')}
                      style={premiumButtonStyle}
                      className={`px-2.5 py-1 text-[9px] font-bold rounded uppercase tracking-wider transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                        selectedLanguage === 'hi' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/50' : 'text-slate-555 hover:text-slate-300'
                      }`}
                    >
                      [ हिंदी ]
                    </button>
                  </div>
                </div>

                {/* Language alert display box */}
                <div className="bg-slate-955/80 border border-slate-855 p-4 rounded-lg flex flex-col gap-3 flex-1 justify-center my-1 font-sans">
                  <div className="flex items-center justify-between text-[8px] font-mono text-slate-555 uppercase tracking-widest border-b border-slate-900 pb-2">
                    <span>Target Broadcast Language: {FAN_ALERTS[selectedLanguage].lang}</span>
                    <span className="text-emerald-505 font-bold">TRANSLATION READY</span>
                  </div>
                  
                  {/* Telugu script rendered cleanly with custom typography size and spacing */}
                  <p className={`text-slate-100 font-medium tracking-wide leading-relaxed leading-extra-loose py-2 ${
                    selectedLanguage === 'te' ? 'text-sm font-sans md:text-base border-l-2 border-indigo-500 pl-4 my-2' : 'text-xs'
                  }`}>
                    {FAN_ALERTS[selectedLanguage].script}
                  </p>

                  {/* Phonetic spelling / translation note */}
                  <div className="mt-3 pt-3 border-t border-slate-900 flex flex-col gap-1">
                    <span className="text-[8px] font-mono uppercase text-slate-650">Phonetic Romanization:</span>
                    <p className="text-[10px] text-slate-550 italic leading-relaxed font-sans">
                      {FAN_ALERTS[selectedLanguage].phonetic}
                    </p>
                  </div>
                </div>

                {parseInt(clearanceLevel) < 2 && (
                  <div className="bg-red-955/10 border border-red-900/20 rounded-lg p-2 flex items-center gap-2 text-indigo-400 text-[10px]">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Requires Clearance Tier 2 (Operator) to dispatch translated broadcast streams.</span>
                  </div>
                )}

                <button
                  onClick={handlePushTranslationSpeech}
                  disabled={parseInt(clearanceLevel) < 2}
                  style={premiumButtonStyle}
                  className="w-full bg-indigo-955/30 hover:bg-indigo-900/30 text-indigo-400 hover:text-indigo-300 border border-indigo-900/60 hover:border-indigo-700/60 py-2.5 px-4 rounded-lg text-xs font-bold tracking-wide uppercase flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-[0.99]"
                >
                  <Send className="w-3.5 h-3.5" />
                  Push & Speak Translation Alert
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* DEMO CONTROLLER PANEL (Bottom-left fixed floating control node wrapper) */}
      <div 
        style={glassCardStyle}
        className="fixed bottom-6 left-6 z-[100] rounded-2xl p-3.5 shadow-2xl flex flex-col gap-2.5 font-sans"
      >
        <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-350 font-hud">DEMO CONTROLLER</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={triggerNominalScenario}
            style={premiumButtonStyle}
            className="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-[0.99] font-hud"
          >
            SCENARIO: NOMINAL STATE
          </button>
          <button
            onClick={triggerCrowdSurgeScenario}
            style={premiumButtonStyle}
            className="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded bg-indigo-650 hover:bg-indigo-600 text-white border border-indigo-555/20 animate-pulse cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] active:scale-[0.99] font-hud"
          >
            SCENARIO: CROWD SURGE CRITICAL
          </button>
        </div>
      </div>

      {/* FLOATING CHATBOT AI COMPONENT */}
      <button
        onClick={() => setIsChatBotOpen(!isChatBotOpen)}
        style={premiumButtonStyle}
        className="fixed bottom-6 right-6 z-[100] bg-indigo-600 hover:bg-indigo-500 text-white p-3.5 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-indigo-400/30 flex items-center justify-center cursor-pointer hover:scale-[1.02] active:scale-[0.99] group"
        title="Open SENTINEL Stadium Agent"
      >
        <MessageSquare className="w-5.5 h-5.5" />
        <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-955 animate-pulse" />
      </button>

      {isChatBotOpen && (
        <div 
          style={glassCardStyle}
          className="fixed bottom-22 right-6 w-80 h-[380px] shadow-2xl rounded-2xl flex flex-col z-[100] animate-fade-in overflow-hidden font-sans"
        >
          {/* Chat Header */}
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-400 animate-pulse" />
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-205 font-hud">SENTINEL STADIUM AGENT</h4>
                <span className="text-[8px] text-emerald-450 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  ONLINE
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsChatBotOpen(false)}
              className="text-slate-500 hover:text-slate-355 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
            {chatThreadHistory.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <span className="text-[7.5px] font-mono text-slate-505 uppercase tracking-widest mb-0.5">
                  {msg.sender === 'user' ? 'Operator' : 'Stadium Agent'}
                </span>
                <div className={`p-2.5 rounded-xl border leading-relaxed text-[11px] font-sans ${
                  msg.sender === 'user'
                    ? 'bg-indigo-950/50 border-indigo-900/60 text-slate-200 rounded-tr-none'
                    : 'bg-slate-900/80 border-slate-850 text-slate-300 rounded-tl-none border-l-2 border-l-indigo-500'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleChatSubmit} className="p-3 border-t border-slate-800 bg-slate-900/50 flex gap-2">
            <input 
              type="text" 
              value={chatUserQuery}
              onChange={(e) => setChatUserQuery(e.target.value)}
              placeholder="Ask about sound, gates, or language..."
              className="flex-1 bg-slate-955 border border-slate-800 rounded-lg py-1.5 px-3 text-[11px] text-slate-205 focus:outline-none focus:border-indigo-500/60 font-sans"
            />
            <button 
              type="submit"
              style={premiumButtonStyle}
              className="bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/20 text-white p-2 rounded-lg cursor-pointer hover:scale-[1.02] hover:shadow-[0_0_10px_rgba(99,102,241,0.3)] active:scale-[0.99] flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* FOOTER DIAGNOSTICS */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-auto relative z-10">
        <div className="flex items-center gap-2 text-[9px] font-mono text-slate-550 uppercase tracking-widest">
          <Terminal className="w-3.5 h-3.5" />
          <span>Sentinel Core v3.0 // Arena Theme • Plus Jakarta Sans Typeface</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[9px] font-mono text-slate-655">
          <span>LATENCY: 11ms</span>
          <span className="text-slate-700">◆</span>
          <span>NODE INTERACTION: CRYPTO SECURE</span>
          <span className="text-slate-700">◆</span>
          <span>STREAM PROTOCOL: WEBRTC ACTIVE</span>
          <span className="text-slate-700">◆</span>
          <span>AUDIT PIPELINE: 0ms DEFERRAL LOGGED</span>
          <span className="text-slate-700">◆</span>
          <span>GPU ENGINE TEMP: 38°C</span>
          <span className="text-slate-700">◆</span>
          <span>INTEGRITY COEF: 99.99%</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
