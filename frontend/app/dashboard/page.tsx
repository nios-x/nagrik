"use client";

import { useEffect, useState } from "react";
import {
  IconArrowUpRight,
  IconAlertTriangle,
  IconTrendingUp,
} from "@tabler/icons-react";

type RecentReport = {
  id: string;
  keyword: string;
  description: string;
  createdAt: string;
  speechStressData?: {
    confidence: number;
    wordsPerSecond: number;
    stressIndicators: string;
  } | null;
};

type SpeechStressStats = {
  averageConfidence: number;
  highStressReports: number;
  averageWordsPerSecond: number;
  totalAnalyzed: number;
  commonIndicators: Array<{ indicator: string; count: number }>;
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
  totalReports: 0,
  criticalAlerts: 0,
  inProgress: 0,
});

const [recent, setRecent] = useState<RecentReport[]>([]);
const [speechStressStats, setSpeechStressStats] = useState<SpeechStressStats>({
  averageConfidence: 0,
  highStressReports: 0,
  averageWordsPerSecond: 0,
  totalAnalyzed: 0,
  commonIndicators: [],
});

    useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      const data = await res.json();

      setStats({
        totalReports: data.totalReports || 0,
        criticalAlerts: data.criticalAlerts || 0,
        inProgress: data.inProgress || 0,
      });

      setRecent(Array.isArray(data.recentReports) ? data.recentReports : []);
      setSpeechStressStats(data.speechStressStats || {
        averageConfidence: 0,
        highStressReports: 0,
        averageWordsPerSecond: 0,
        totalAnalyzed: 0,
        commonIndicators: [],
      });
    } catch (err) {
      console.error("Dashboard fetch failed", err);
    }
  };

  fetchDashboard();
  const interval = setInterval(fetchDashboard, 5000); // realtime-ish

  return () => clearInterval(interval);
}, []);

  return (
    <div className="flex flex-col h-full noth bg-black">
      <div className="p-6 lg:p-8 border-b border-white/10">
        <h1 className="text-3xl font-semibold bg-gradient-to-r from-indigo-400 to-cyan-200 bg-clip-text text-transparent mb-2">Realtime Monitoring Control</h1>
        <p className="text-muted-foreground ">Real-time emergency alert monitoring and response coordination</p>
      </div>

      <div className="flex-1 overflow-auto p-6 lg:p-8 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className=" backdrop-blur-md border border-white/10 rounded-lg p-6 ring ring-indigo-200/40 bg-gradient-to-r from-indigo-700/10 to-cyan-400/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Total Reports</p>
               <p className="text-3xl bg-gradient-to-r from-indigo-400 to-cyan-200 bg-clip-text text-transparent pl-1">
  {stats.totalReports}
</p>

              </div>
              <IconTrendingUp className="w-5 h-5 text-indigo-300 " />
            </div>
            <div className="mt-4 text-xs text-muted-foreground">+ 12 in last hour</div>
          </div>

          <div className="backdrop-blur-md border border-white/10 rounded-lg p-6 ring ring-red-400/40 bg-gradient-to-r from-red-700/10 to-orange-400/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Critical Alerts</p>
                <p className="text-3xl text-red-400">
  {stats.criticalAlerts}
</p>

              </div>
              <IconAlertTriangle className="w-5 h-5 text-red-400 " />
            </div>
            <div className="mt-4 text-xs text-red-400/70">Immediate response required</div>
          </div>

          <div className="backdrop-blur-md border border-white/10 rounded-lg p-6 ring ring-lime-400/40 bg-gradient-to-r from-lime-700/10 to-lime-400/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">In Progress</p>
                <p className="text-3xl text-lime-400">
  {stats.inProgress}
</p>

              </div>
              <IconArrowUpRight className="w-5 h-5 text-lime-400 opacity-50" />
            </div>
            <div className="mt-4 text-xs text-lime-400/70">Currently being handled</div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-6 ring ring-indigo-200/40 bg-gradient-to-r from-indigo-700/10 to-cyan-400/10">
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-200 bg-clip-text text-transparent  mb-4">System Status</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-muted-foreground">Voice Detection Engine</span>
              <div className="flex items-center gap-2">
                <span className="text-green-400">Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3  bg-white/5 rounded-lg">
              <span className="text-muted-foreground">Geolocation Service</span>
              <div className="flex items-center gap-2">
                <span className="text-green-400">Operational</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-muted-foreground">Database Connection</span>
              <div className="flex items-center gap-2">
                <span className="text-green-400">Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Speech Stress Analysis */}
        {speechStressStats.totalAnalyzed > 0 && (
          <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-6 ring ring-indigo-200/40 bg-gradient-to-r from-indigo-700/10 to-cyan-400/10">
            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-200 bg-clip-text text-transparent mb-4">Speech Stress Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Average Confidence</p>
                <p className="text-2xl font-semibold text-indigo-300">
                  {speechStressStats.averageConfidence}%
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">High Stress Reports</p>
                <p className="text-2xl font-semibold text-red-400">
                  {speechStressStats.highStressReports}
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Avg Words/Second</p>
                <p className="text-2xl font-semibold text-cyan-300">
                  {speechStressStats.averageWordsPerSecond}
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Total Analyzed</p>
                <p className="text-2xl font-semibold text-lime-300">
                  {speechStressStats.totalAnalyzed}
                </p>
              </div>
            </div>
            {speechStressStats.commonIndicators.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Common Stress Indicators</p>
                <div className="flex flex-wrap gap-2">
                  {speechStressStats.commonIndicators.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-300"
                    >
                      {item.indicator} ({item.count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg p-6 ring ring-indigo-200/40 bg-gradient-to-r from-indigo-700/10 to-cyan-400/10">
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-200 bg-clip-text text-transparent mb-4">Recent Activity</h2>
         <div className="space-y-2 text-sm">
  {recent.map((r) => {
    let stressIndicators: string[] = [];
    try {
      if (r.speechStressData?.stressIndicators) {
        stressIndicators = JSON.parse(r.speechStressData.stressIndicators);
      }
    } catch (e) {
      // Ignore parse errors
    }

    return (
      <div
        key={r.id}
        className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-muted-foreground">
            {r.keyword.toUpperCase()} — {r.description}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(r.createdAt).toLocaleTimeString()}
          </span>
        </div>
        {r.speechStressData && (
          <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
            <div className="flex items-center gap-4 text-xs">
              <span className="text-muted-foreground">
                Confidence: <span className={(r.speechStressData.confidence || 0) >= 60 ? "text-red-400" : "text-yellow-400"}>
                  {r.speechStressData.confidence || 0}%
                </span>
              </span>
              <span className="text-muted-foreground">
                Speed: {typeof r.speechStressData.wordsPerSecond === 'number' ? r.speechStressData.wordsPerSecond.toFixed(1) : '0.0'} wps
              </span>
            </div>
            {stressIndicators.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {stressIndicators.slice(0, 2).map((indicator, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-300"
                  >
                    {indicator}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  })}

  {recent.length === 0 && (
    <div className="text-muted-foreground text-center text-xs py-4">
      No recent activity
    </div>
  )}
</div>

        </div>
      </div>
    </div>
  )
}
