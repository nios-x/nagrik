"use client";

import Spline from "@splinetool/react-spline";
import { useEffect, useRef, useState } from "react";
import words from "./words";
import { SpeechStressAnalyzer, SpeechMetrics } from "@/utils/speech-stress-analyzer";

type Status =
  | "locked"
  | "idle"
  | "listening"
  | "analyzing"
  | "responding"
  | "error";

export default function Counter() {
  const [splineKey, setSplineKey] = useState(0);
  const recognitionRef = useRef<any>(null);
  const splineRef = useRef<any>(null);
  const sentAlerts = useRef<Set<string>>(new Set());
  const sentEarlyWarnings = useRef<Set<string>>(new Set());
  const unlockedRef = useRef(false);
  const [alerts, setAlerts] = useState<{ word: string; desc: string }[]>([]);
  const stressAnalyzerRef = useRef<SpeechStressAnalyzer>(new SpeechStressAnalyzer());
  const [stressMetrics, setStressMetrics] = useState<SpeechMetrics | null>(null);
  const [earlyWarningActive, setEarlyWarningActive] = useState(false);

  const [status, setStatus] = useState<Status>("locked");
  const [interim, setInterim] = useState("");
  const [finalText, setFinalText] = useState("");
  const splinelock = useRef(false)
  const [location, setLocation] = useState<null | {}>(null);
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error("Error getting location:", error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      console.log("Geolocation not supported");
    }
  }, [alerts])

  useEffect(() => {
    if (typeof window === "undefined") return;
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("error");
      return;
    }
    const recog = new SpeechRecognition();
    recog.lang = "en-IN";
    recog.continuous = true;
    recog.interimResults = true;
    recog.onstart = () => setStatus("listening");
    recog.onresult = (e: any) => {
      let interimText = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interimText += t;
      }
      setInterim(interimText);
      
      // Real-time stress analysis on ALL speech (interim + final)
      const allText = interimText + final;
      if (allText.trim()) {
        const metrics = stressAnalyzerRef.current.analyzeEvent(
          allText,
          final.length > 0
        );
        setStressMetrics(metrics);
        
        // Check for early warning trigger
        if (stressAnalyzerRef.current.shouldTriggerEarlyWarning(metrics)) {
          const warningKey = `early-${Date.now()}`;
          if (!sentEarlyWarnings.current.has(warningKey)) {
            sentEarlyWarnings.current.add(warningKey);
            setEarlyWarningActive(true);
            triggerEarlyWarning(metrics);
          }
        }
      }
      
      if (final) {
        const detected: { word: string; desc: string }[] = [];
        Object.keys(words).forEach((key: any) => {
          if (final.toLowerCase().includes(key.toLowerCase())) {
            detected.push({ word: key, desc: words[key] });
          }
        });
        setAlerts(detected);
        setFinalText((p) => p + final.split(".").join("") + " ");
        setStatus("responding");
        if (splineRef.current && !splinelock.current) {
          splinelock.current = true
          try {
            if (splineRef.current) {
              document.dispatchEvent(new KeyboardEvent("keydown", { key: "r" }))
            }
          } catch { }
          setTimeout(() => {
            setSplineKey((k) => k + 1);
            splinelock.current = false
          }, 33000)
        }
      }
    };
    recog.onspeechend = () => {
      setInterim("");
      setStatus(s => (s === "responding" ? s : "analyzing"));
    };
    recog.onerror = () => setStatus("error");
    recog.onend = () => {
      if (unlockedRef.current) recog.start();
    };

    recognitionRef.current = recog;
  }, []);

  const unlockAudio = () => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;
    recognitionRef.current?.start();
    setStatus("idle");
  };

  const statusText = {
    locked: "Click anywhere to initialize AI",
    idle: "Waiting for voice…",
    listening: "Listening...",
    analyzing: "Analyzing...",
    responding: "Responding...",
    error: "Microphone unavailable",
  };
  const triggerAlert = async (alert: { word: string; desc: string }) => {
    if (!location || !stressMetrics) return;
  
    try {
      await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyword: alert.word,
          description: alert.desc,
  
          category: "OTHER",
          severity: stressMetrics.confidence >= 60 ? "HIGH" : "MEDIUM",
  
          latitude: (location as any).lat,
          longitude: (location as any).lng,
  
          // ✅ THIS IS WHAT BACKEND WANTS
          speechStressData: {
            wordsPerSecond: stressMetrics.wordsPerSecond,
            repeatedWords: stressMetrics.repeatedWords,
            pauseCount: stressMetrics.pauseCount,
            averagePauseDuration: stressMetrics.averagePauseDuration,
            confidence: stressMetrics.confidence,
            stressIndicators: stressMetrics.stressIndicators,
          },
        }),
      });
    } catch (err) {
      console.error("Failed to send report:", err);
    }
  };
  

  const triggerEarlyWarning = async (metrics: SpeechMetrics) => {
    if (!location) return;

    try {
      const response = await fetch("/api/early-warning", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confidence: metrics.confidence,
          stressIndicators: metrics.stressIndicators,
          wordsPerSecond: metrics.wordsPerSecond,
          repeatedWords: metrics.repeatedWords,
          pauseCount: metrics.pauseCount,
          latitude: (location as any).lat,
          longitude: (location as any).lng,
        }),
      });

      if (response.ok) {
        console.log("Early warning sent - Distress detected before explicit threat");
      }
    } catch (err) {
      console.error("Failed to send early warning:", err);
    }
  };

  return (
    <div
      onClick={unlockAudio}
      className="flex noth w-screen min-h-screen relative overflow-hidden bg-black text-white select-none"
    >
      <div
        className="
      absolute 
      top-10 left-10
      h-72 w-114
      rotate-1/2
      rounded-full
      bg-blue-500/40
      blur-3xl
      animate-float
      z-99
    "
      />


      <div
        className={`
      absolute 
      top-1/2 left-3/5
      h-60 w-110

      rotate-1/2
      rounded-full
      z-99
      blur-3xl
      animate-float
      bg-blue-800
    `}
      />


      <div
        className={`
      absolute 
      bottom-0 left-0
      h-30 w-[120vw]
      rotate-1/2
      rounded-full
      z-99
      translate-y-1/2
      -translate-x-40
      blur-3xl
      transition-all
      animate-float
      ${alerts.length > 0 ? "bg-red-600/30" : "bg-blue-800/30"}
    `}
      />


      <div className="text-xs text-gray-500 absolute right-0 p-5 bottom-0 z-50 bg-black space-y-1">
        <div>• Language: English/Hindi (IN)</div>
        <div>• Recognition: Browser-native</div>
        <div>• Mode: Continuous listening</div>
        <div>• Status: {statusText[status].split("...").join("")}</div>
        {stressMetrics && (
          <>
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div className="text-yellow-400 font-semibold">Early Warning System</div>
              <div>Confidence: <span className={stressMetrics.confidence >= 60 ? "text-red-400 font-bold" : "text-gray-400"}>{stressMetrics.confidence}%</span></div>
              {stressMetrics.stressIndicators.length > 0 && (
                <div className="text-orange-400 text-[10px] mt-1">
                  {stressMetrics.stressIndicators[0]}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {/* LEFT */}
      <div className="w-1/2 p-12  gap-6">
        <h1 className="text-7xl font-semibold bg-gradient-to-r from-indigo-700 to-cyan-400 bg-clip-text text-transparent">
          NAGRIK.AI
        </h1>
        <div className="text-sky-400 tracking-wide">
          State: {statusText[status]}
        </div>
        <div className="text-sky-200 text-5xl p-5 mt-10 text-center tracking-wide">
          Analysed Text
        </div>
        <div className="h-1/2 bg-zinc-900 relative z-[9999] px-5 py-3 overflow-y-scroll  rounded-xl border-zinc-600 border ">
          <div className="text-white text-lg">
            {finalText.split(" ").map((word, i) => {
              const alert = alerts.find(a => word.toLowerCase().includes(a.word.toLowerCase()));
              if (alert) {
                const key = `${alert.word}-${finalText.length}`;
                if (!sentAlerts.current.has(key)) {
                  sentAlerts.current.add(key);
                  triggerAlert(alert);
                }

                return (
                  <span key={i} className="text-red-500 font-bold">{word} </span>
                );
              }

              return word + " ";
            })}
          </div>
          {interim && (
            <div className="text-gray-400 italic">
              “{interim}”
            </div>
          )}
        </div>
      </div>

      {earlyWarningActive && stressMetrics && (
        <div className="text-sm text-yellow-400 mt-1 text-center w-2/3 z-50 absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/80 px-4 py-2 rounded-lg border border-yellow-500">
          <div className="font-bold">⚠️ Early Warning: Distress Detected</div>
          <div className="text-xs mt-1">Confidence: {stressMetrics.confidence}% - {stressMetrics.stressIndicators.join(", ")}</div>
        </div>
      )}
      {alerts.length > 0 && (
        <div className="text-sm text-red-400 mt-1 text-center  w-2/3 z-50 absolute bottom-2 left-1/2 -translate-x-1/2">
          {alerts.map((a, i) => (
            <div key={i}>Alert:  {a.desc}</div>
          ))}
        </div>
      )}

      <div className="w-1/2 h-screen pointer-events-none overflow-hidden">
        <div className="h-full w-full scale-110 ">
          <Spline
            key={splineKey}
            scene="https://prod.spline.design/NpviCkltifkWR5lv/scene.splinecode"
            onLoad={(app) => (splineRef.current = app)}
          />
        </div>
      </div>
    </div>
  );
}
