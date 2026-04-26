import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Trophy, Share2, RotateCcw, Save, Users, Calendar, ChevronRight, CheckCircle2, Palette, Moon, Sun, MapPin, Play, Pause, Timer, Plus, Minus, Check, Edit3, X } from 'lucide-react';
import { toPng } from 'html-to-image';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';
import { Team, Match, TableRow, ThemeColor } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const INITIAL_TEAMS: Team[] = [
  { id: '1', name: 'Team A', color: 'black', squadSize: 5 },
  { id: '2', name: 'Team B', color: 'red', squadSize: 5 },
  { id: '3', name: 'Team C', color: 'blue', squadSize: 5 },
  { id: '4', name: 'Team D', color: 'green', squadSize: 5 },
];

const THEMES: Record<ThemeColor, { name: string; primary: string; secondary: string; accent: string; bg: string; shadow: string; text: string }> = {
  black: { 
    name: 'Black', 
    primary: 'bg-black', 
    secondary: 'bg-gray-100', 
    accent: 'text-black dark:text-white', 
    bg: 'black',
    shadow: 'shadow-gray-200',
    text: 'text-white'
  },
  white: { 
    name: 'White', 
    primary: 'bg-white border border-gray-200', 
    secondary: 'bg-gray-50', 
    accent: 'text-gray-900 dark:text-white', 
    bg: 'white',
    shadow: 'shadow-gray-100',
    text: 'text-gray-900'
  },
  red: { 
    name: 'Red', 
    primary: 'bg-red-600', 
    secondary: 'bg-red-50', 
    accent: 'text-red-600', 
    bg: 'red-600',
    shadow: 'shadow-red-100',
    text: 'text-white'
  },
  neon: { 
    name: 'Neon Yellow', 
    primary: 'bg-lime-400', 
    secondary: 'bg-lime-50', 
    accent: 'text-lime-600', 
    bg: 'lime-400',
    shadow: 'shadow-lime-200',
    text: 'text-black'
  },
  orange: { 
    name: 'Orange', 
    primary: 'bg-orange-500', 
    secondary: 'bg-orange-50', 
    accent: 'text-orange-600', 
    bg: 'orange-500',
    shadow: 'shadow-orange-200',
    text: 'text-white'
  },
  yellow: { 
    name: 'Yellow', 
    primary: 'bg-yellow-400', 
    secondary: 'bg-yellow-50', 
    accent: 'text-yellow-600', 
    bg: 'yellow-400',
    shadow: 'shadow-yellow-200',
    text: 'text-black'
  },
  blue: { 
    name: 'Blue', 
    primary: 'bg-blue-600', 
    secondary: 'bg-blue-50', 
    accent: 'text-blue-600', 
    bg: 'blue-600',
    shadow: 'shadow-blue-100',
    text: 'text-white'
  },
  green: { 
    name: 'Green', 
    primary: 'bg-green-600', 
    secondary: 'bg-green-50', 
    accent: 'text-green-600', 
    bg: 'green-600',
    shadow: 'shadow-green-100',
    text: 'text-white'
  },
};

const GENERATE_MATCHES = (teams: Team[]): Match[] => {
  const matches: Match[] = [];
  let matchId = 1;
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        id: String(matchId++),
        team1Id: teams[i].id,
        team2Id: teams[j].id,
        score1: null,
        score2: null,
      });
    }
  }
  return matches;
};

const GET_DEFAULT_EVENT_NAME = () => {
  const date = new Date();
  return `Pickup Soccer ${date.getMonth() + 1}/${date.getDate()}`;
};

const LOCATIONS = [
  "Bertram Field",
  "McGrath Park",
  "Salem Common",
  "Bentley Academy"
];

const CHANGELOG = [
  { 
    version: 'v1.1.0', 
    date: 'April 26, 2026', 
    changes: [
      'PWA support for Add to Home Screen', 
      'Haptic feedback on score taps', 
      'Current match active/completed states', 
      'Filter matches by individual teams', 
      'Squad size & attendance tracking',
      'Unlimited dynamic teams', 
      'Custom themes and colors', 
      'Standings layout and auto-sorting'
    ] 
  },
  { 
    version: 'v1.0.0', 
    date: 'March 21, 2026', 
    changes: [
      'Initialized teams with default colors and theme state',
      'Added GitHub Actions workflow for automated deployment',
      'Enhanced README with application details',
      'Initialized Pickup Soccer Table Generator component'
    ] 
  }
];

export default function App() {
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('soccer-teams');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((t: any) => ({ ...t, squadSize: t.squadSize || 5 }));
      } catch (e) {
        return INITIAL_TEAMS;
      }
    }
    return INITIAL_TEAMS;
  });

  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('soccer-matches');
    return saved ? JSON.parse(saved) : GENERATE_MATCHES(INITIAL_TEAMS);
  });

  const [step, setStep] = useState<'setup' | 'matches' | 'table'>(() => {
    const saved = localStorage.getItem('soccer-step');
    return (saved as any) || 'setup';
  });

  const [theme, setTheme] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem('soccer-theme') as ThemeColor;
    return (saved && THEMES[saved]) ? saved : 'black';
  });

  const [isThemeManual, setIsThemeManual] = useState<boolean>(() => {
    return localStorage.getItem('soccer-theme-manual') === 'true';
  });

  const [eventName, setEventName] = useState<string>(() => {
    const saved = localStorage.getItem('soccer-event-name');
    return saved || GET_DEFAULT_EVENT_NAME();
  });

  const [location, setLocation] = useState<string>(() => {
    const saved = localStorage.getItem('soccer-location');
    return saved || '';
  });

  const [activeFilterTeamId, setActiveFilterTeamId] = useState<string | null>(null);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

  const tableRef = useRef<HTMLDivElement>(null);
  const standingsRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [stopwatchSeconds, setStopwatchSeconds] = useState(() => {
    const saved = localStorage.getItem('soccer-stopwatch');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isStopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStopwatchRunning]);

  useEffect(() => {
    localStorage.setItem('soccer-stopwatch', String(stopwatchSeconds));
  }, [stopwatchSeconds]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const adjustScore = (matchId: string, team: 1 | 2, delta: number) => {
    if (navigator.vibrate) navigator.vibrate(50);
    setMatches(prev => prev.map(m => {
      if (m.id !== matchId) return m;
      const currentScore = team === 1 ? m.score1 : m.score2;
      const val = currentScore === null ? Math.max(0, delta) : Math.max(0, currentScore + delta);
      return { ...m, [team === 1 ? 'score1' : 'score2']: val };
    }));
  };

  const handleAddTeam = () => {
    const newTeamId = String(Date.now());
    const colors: ThemeColor[] = ['orange', 'yellow', 'neon', 'blue', 'green', 'black', 'white', 'red'];
    const usedColors = new Set(teams.map(t => t.color));
    const nextColor = colors.find(c => !usedColors.has(c)) || 'white';
    
    const newTeam: Team = { id: newTeamId, name: `Team ${teams.length + 1}`, color: nextColor, squadSize: 5 };
    
    const newMatches = teams.map((t, idx) => ({
      id: `match_${Date.now()}_${idx}`,
      team1Id: t.id,
      team2Id: newTeamId,
      score1: null,
      score2: null,
    }));
    
    setTeams([...teams, newTeam]);
    setMatches([...matches, ...newMatches]);
  };

  const handleRemoveTeam = (teamId: string) => {
    if (teams.length <= 2) return;
    setTeams(teams.filter(t => t.id !== teamId));
    setMatches(matches.filter(m => m.team1Id !== teamId && m.team2Id !== teamId));
  };

  useEffect(() => {
    localStorage.setItem('soccer-teams', JSON.stringify(teams));
    localStorage.setItem('soccer-matches', JSON.stringify(matches));
    localStorage.setItem('soccer-step', step);
    localStorage.setItem('soccer-theme', theme);
    localStorage.setItem('soccer-theme-manual', String(isThemeManual));
    localStorage.setItem('soccer-event-name', eventName);
    localStorage.setItem('soccer-location', location);
  }, [teams, matches, step, theme, eventName, location]);

  const tableData = useMemo(() => {
    const stats: Record<string, TableRow> = {};
    teams.forEach((team) => {
      stats[team.id] = {
        teamId: team.id,
        teamName: team.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        cleanSheets: 0,
        points: 0,
      };
    });

    matches.forEach((match) => {
      if (match.score1 === null || match.score2 === null) return;

      const t1 = stats[match.team1Id];
      const t2 = stats[match.team2Id];

      t1.played++;
      t2.played++;
      t1.goalsFor += match.score1;
      t1.goalsAgainst += match.score2;
      t2.goalsFor += match.score2;
      t2.goalsAgainst += match.score1;

      if (match.score2 === 0) t1.cleanSheets++;
      if (match.score1 === 0) t2.cleanSheets++;

      if (match.score1 > match.score2) {
        t1.won++;
        t1.points += 3;
        t2.lost++;
      } else if (match.score1 < match.score2) {
        t2.won++;
        t2.points += 3;
        t1.lost++;
      } else {
        t1.drawn++;
        t2.drawn++;
        t1.points += 1;
        t2.points += 1;
      }

      t1.goalDifference = t1.goalsFor - t1.goalsAgainst;
      t2.goalDifference = t2.goalsFor - t2.goalsAgainst;
    });

    return Object.values(stats).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  }, [teams, matches]);

  useEffect(() => {
    if (!isThemeManual && tableData[0].played > 0) {
      const winner = teams.find(t => t.id === tableData[0].teamId);
      if (winner && winner.color !== theme) {
        setTheme(winner.color);
      }
    }
  }, [tableData, isThemeManual, teams, theme]);

  const handleReset = () => {
    setTeams(INITIAL_TEAMS);
    setMatches(GENERATE_MATCHES(INITIAL_TEAMS));
    setEventName(GET_DEFAULT_EVENT_NAME());
    setLocation('');
    setTheme('black');
    setIsThemeManual(false);
    setStep('setup');
    setShowResetConfirm(false);
  };

  const handleShare = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (!ref.current) return;
    try {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const dataUrl = await toPng(ref.current, { 
        backgroundColor: isDark ? '#111827' : '#ffffff', 
        cacheBust: true,
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `${filename}.png`, { type: 'image/png' });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'Pickup Soccer Table',
          text: 'Check out tonight\'s soccer results!',
        });
      } else {
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const updateMatchScore = (matchId: string, team: 1 | 2, score: string) => {
    const parsed = parseInt(score, 10);
    const val = (score === '' || isNaN(parsed)) ? null : Math.max(0, parsed);
    setMatches(prev => prev.map(m => 
      m.id === matchId 
        ? { ...m, [team === 1 ? 'score1' : 'score2']: val } 
        : m
    ));
  };

  const updateMatchScorers = (matchId: string, team: 1 | 2, scorers: string) => {
    setMatches(prev => prev.map(m => 
      m.id === matchId 
        ? { ...m, [team === 1 ? 'scorers1' : 'scorers2']: scorers } 
        : m
    ));
  };

  const toggleMatchCompletion = (matchId: string) => {
    setMatches(prev => prev.map(m => 
      m.id === matchId 
        ? { ...m, isCompleted: !m.isCompleted } 
        : m
    ));
  };

  const updateTeamName = (id: string, name: string) => {
    setTeams(prev => prev.map(t => t.id === id ? { ...t, name } : t));
  };

  const updateTeamColor = (id: string, color: ThemeColor) => {
    setTeams(prev => prev.map(t => t.id === id ? { ...t, color } : t));
  };

  const updateTeamSquadSize = (id: string, size: number) => {
    setTeams(prev => prev.map(t => t.id === id ? { ...t, squadSize: Math.max(1, size) } : t));
  };

  const activeTheme = THEMES[theme] || THEMES.black;
  const totalAttendance = teams.reduce((acc, t) => acc + (t.squadSize || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-emerald-100 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300", activeTheme.primary, activeTheme.text)}>
              <Trophy size={18} />
            </div>
            <h1 className="font-bold text-lg tracking-tight">Pickup Table</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Reset All"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600 mb-6 mx-auto">
                <RotateCcw size={32} />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Reset Everything?</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-8">
                This will clear all teams, scores, and standings. This action cannot be undone.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="py-3 px-4 rounded-xl font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleReset}
                  className="py-3 px-4 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-200 dark:shadow-none"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-2xl mx-auto px-4 py-8 pb-32">
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'setup', label: 'Teams', icon: Users },
            { id: 'matches', label: 'Scores', icon: Calendar },
            { id: 'table', label: 'Standings', icon: Trophy },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                step === s.id 
                  ? cn(activeTheme.primary, activeTheme.text, "shadow-md", activeTheme.shadow) 
                  : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800"
              )}
            >
              <s.icon size={16} />
              {s.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">
                      Event Name
                    </label>
                    <input
                      type="text"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-lg font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      placeholder="e.g. Soccer Friday 3/21"
                    />
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">
                      Field Location (Optional)
                    </label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-lg font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select Location</option>
                      {LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Name Your Teams</h2>
                  <button 
                    onClick={handleAddTeam}
                    className={cn(
                      "text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1",
                      "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
                    )}
                  >
                    + Add Team
                  </button>
                </div>
                <div className="grid gap-6">
                  <AnimatePresence>
                    {teams.map((team, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        key={team.id} 
                        className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            Team {idx + 1}
                            {teams.length > 2 && (
                              <button 
                                onClick={() => handleRemoveTeam(team.id)}
                                className="text-red-400 hover:text-red-600 transition-colors"
                                title="Remove team"
                              >
                                &times;
                              </button>
                            )}
                          </label>
                          <div className="flex flex-wrap items-center justify-end gap-1.5 max-w-[60%]">
                            {(Object.keys(THEMES) as ThemeColor[]).map((c) => (
                              <button
                                key={c}
                                onClick={() => updateTeamColor(team.id, c)}
                                className={cn(
                                  "w-6 h-6 rounded-full border-2 transition-all",
                                  THEMES[c].primary,
                                  team.color === c ? "border-gray-900 dark:border-white scale-110" : "border-transparent opacity-40 hover:opacity-100"
                                )}
                                title={THEMES[c].name}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={team.name}
                            onChange={(e) => updateTeamName(team.id, e.target.value)}
                            className="flex-1 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-gray-900 dark:text-white min-w-0"
                            placeholder={`Team ${idx + 1} Name`}
                          />
                          <div className="relative w-24 shrink-0">
                            <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="number"
                              min="1"
                              value={team.squadSize || ''}
                              onChange={(e) => updateTeamSquadSize(team.id, parseInt(e.target.value) || 0)}
                              className="w-full pl-8 pr-3 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-gray-900 dark:text-white"
                              title="Squad Size"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <button
                onClick={() => setStep('matches')}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all active:scale-[0.98]"
              >
                Start Scoring <ChevronRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 'matches' && (
            <motion.div
              key="matches"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col items-center justify-center shadow-sm relative overflow-hidden mb-6">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                <div className="flex items-center gap-2 mb-2 text-gray-400 dark:text-gray-500">
                  <Timer size={16} />
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Match Timer</span>
                </div>
                <div className="text-6xl font-black tracking-tighter tabular-nums mb-6 text-gray-900 dark:text-white mt-2">
                  {formatTime(stopwatchSeconds)}
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-xl active:scale-95",
                      isStopwatchRunning ? "bg-red-500 hover:bg-red-600 shadow-red-200/50 dark:shadow-none" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200/50 dark:shadow-none"
                    )}
                  >
                    {isStopwatchRunning ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                  </button>
                  <button
                    onClick={() => {
                      setIsStopwatchRunning(false);
                      setStopwatchSeconds(0);
                    }}
                    disabled={stopwatchSeconds === 0}
                    className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <RotateCcw size={20} />
                  </button>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 pt-2 scrollbar-hide mb-2 -mt-4">
                <button
                  onClick={() => setActiveFilterTeamId(null)}
                  className={cn("px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border", activeFilterTeamId === null ? "bg-gray-900 border-gray-900 text-white dark:bg-white dark:border-white dark:text-gray-900 shadow-md" : "bg-white border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-700")}
                >
                  All Matches
                </button>
                {teams.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveFilterTeamId(t.id)}
                    className={cn("px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap flex items-center gap-1.5 transition-all border", activeFilterTeamId === t.id ? cn(THEMES[t.color].primary, THEMES[t.color].text, "border-transparent shadow-md") : "bg-white border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 opacity-70 hover:opacity-100")}
                  >
                   <div className={cn("w-2 h-2 rounded-full", activeFilterTeamId === t.id ? "bg-current opacity-60" : THEMES[t.color].primary)} />
                   {t.name}
                  </button>
                ))}
              </div>

              <div className="grid gap-4">
                {matches.map((match, idx) => {
                  if (activeFilterTeamId && match.team1Id !== activeFilterTeamId && match.team2Id !== activeFilterTeamId) return null;

                  const t1 = teams.find(t => t.id === match.team1Id);
                  const t2 = teams.find(t => t.id === match.team2Id);
                  return (
                    <div key={match.id} className={cn("bg-white dark:bg-gray-900 rounded-2xl border transition-all overflow-hidden", match.isCompleted ? "border-transparent bg-transparent bg-gray-50/50 dark:bg-gray-800/30 p-4" : "border-emerald-200 dark:border-emerald-900/50 p-5 shadow-md")}>
                      {match.isCompleted ? (
                        <div className="flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
                          <div className="flex items-center gap-3 w-full">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-8 shrink-0">M{idx + 1}</div>
                            <div className="flex-1 flex items-center justify-end gap-2 truncate">
                              <span className="font-bold text-sm truncate">{t1?.name}</span>
                              <div className={cn("w-2 h-2 rounded-full shrink-0", THEMES[t1?.color || 'black'].primary)} />
                            </div>
                            <div className="px-2 font-black text-lg shrink-0">
                              <span>{match.score1 ?? '-'}</span>
                              <span className="text-gray-300 mx-1">:</span>
                              <span>{match.score2 ?? '-'}</span>
                            </div>
                            <div className="flex-1 flex items-center justify-start gap-2 truncate">
                              <div className={cn("w-2 h-2 rounded-full shrink-0", THEMES[t2?.color || 'black'].primary)} />
                              <span className="font-bold text-sm truncate">{t2?.name}</span>
                            </div>
                          </div>
                          <button onClick={() => toggleMatchCompletion(match.id)} className="text-gray-400 hover:text-emerald-500 p-2 ml-2 shrink-0">
                            <Edit3 size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-xs font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                              <Play size={12} fill="currentColor"/> Match {idx + 1}
                            </div>
                            <button onClick={() => toggleMatchCompletion(match.id)} className="text-[10px] bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest hover:bg-emerald-200 transition-colors flex items-center gap-1">
                              <Check size={12} /> Finish
                            </button>
                          </div>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 flex flex-col items-end">
                              <div className="flex items-center gap-2 mb-2 w-full justify-end truncate">
                                <div className={cn("w-2 h-2 rounded-full shrink-0", THEMES[t1?.color || 'black'].primary)} />
                                <div className="font-bold text-gray-900 dark:text-white truncate">
                                  {t1?.name} <span className="font-normal opacity-50 text-[10px]">({t1?.squadSize})</span>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <button onClick={() => adjustScore(match.id, 1, -1)} className="w-10 h-16 rounded-l-2xl bg-gray-100 dark:bg-gray-800 border border-r-0 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors active:bg-gray-300 dark:active:bg-gray-600">
                                  <Minus size={20} />
                                </button>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  min="0"
                                  value={match.score1 ?? ''}
                                  onChange={(e) => updateMatchScore(match.id, 1, e.target.value)}
                                  className="w-14 h-16 text-center text-2xl font-black bg-gray-50 dark:bg-gray-800/80 border-y border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white px-0"
                                  placeholder="-"
                                />
                                <button onClick={() => adjustScore(match.id, 1, 1)} className="w-10 h-16 rounded-r-2xl bg-gray-100 dark:bg-gray-800 border border-l-0 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors active:bg-gray-300 dark:active:bg-gray-600">
                                  <Plus size={20} />
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="h-6 mb-2" />
                              <div className="h-16 flex items-center text-gray-300 dark:text-gray-700 font-black text-xl">VS</div>
                            </div>
                            <div className="flex-1 flex flex-col items-start">
                              <div className="flex items-center gap-2 mb-2 w-full justify-start truncate">
                                <div className="font-bold text-gray-900 dark:text-white truncate">
                                  <span className="font-normal opacity-50 text-[10px]">({t2?.squadSize})</span> {t2?.name}
                                </div>
                                <div className={cn("w-2 h-2 rounded-full shrink-0", THEMES[t2?.color || 'black'].primary)} />
                              </div>
                              <div className="flex items-center">
                                <button onClick={() => adjustScore(match.id, 2, -1)} className="w-10 h-16 rounded-l-2xl bg-gray-100 dark:bg-gray-800 border border-r-0 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors active:bg-gray-300 dark:active:bg-gray-600">
                                  <Minus size={20} />
                                </button>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  min="0"
                                  value={match.score2 ?? ''}
                                  onChange={(e) => updateMatchScore(match.id, 2, e.target.value)}
                                  className="w-14 h-16 text-center text-2xl font-black bg-gray-50 dark:bg-gray-800/80 border-y border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white px-0"
                                  placeholder="-"
                                />
                                <button onClick={() => adjustScore(match.id, 2, 1)} className="w-10 h-16 rounded-r-2xl bg-gray-100 dark:bg-gray-800 border border-l-0 border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors active:bg-gray-300 dark:active:bg-gray-600">
                                  <Plus size={20} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="mt-6 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Scorers (Optional)</label>
                              <input
                                type="text"
                                value={match.scorers1 ?? ''}
                                onChange={(e) => updateMatchScorers(match.id, 1, e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="Names (comma separated)..."
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right block">Scorers (Optional)</label>
                              <input
                                type="text"
                                value={match.scorers2 ?? ''}
                                onChange={(e) => updateMatchScorers(match.id, 2, e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="Names (comma separated)..."
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setStep('table')}
                className={cn(
                  "w-full mt-4 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]",
                  activeTheme.primary,
                  activeTheme.text,
                  activeTheme.shadow
                )}
              >
                View Standings <Trophy size={20} />
              </button>
            </motion.div>
          )}

          {step === 'table' && (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Palette size={18} className="text-gray-400" />
                    <h2 className="text-lg font-bold">Match Winner's Theme</h2>
                  </div>
                  {tableData[0].played > 0 && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                      Winner: {tableData[0].teamName}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {(Object.keys(THEMES) as ThemeColor[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTheme(t);
                        setIsThemeManual(true);
                      }}
                      className={cn(
                        "w-12 h-12 rounded-full border-4 transition-all flex items-center justify-center",
                        THEMES[t].primary,
                        theme === t ? "border-gray-900 dark:border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                      title={THEMES[t].name}
                    >
                      {theme === t && <CheckCircle2 size={20} className={THEMES[t].text} />}
                    </button>
                  ))}
                  {isThemeManual && (
                    <button
                      onClick={() => setIsThemeManual(false)}
                      className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-emerald-600 transition-colors"
                    >
                      Reset to Auto
                    </button>
                  )}
                </div>
              </div>

              <div 
                ref={tableRef}
                className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xl"
              >
                <div ref={standingsRef}>
                  <div className={cn("p-6 transition-colors duration-300", activeTheme.primary, activeTheme.text)}>
                    <h2 className="text-2xl font-black tracking-tighter uppercase italic leading-tight">{eventName}</h2>
                    {location && (
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 flex items-center gap-1 mt-1">
                        <MapPin size={10} /> {location}
                      </p>
                    )}
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mt-1 flex items-center gap-1">
                      <Users size={10} /> Total attendance: {totalAttendance}
                    </p>
                    <p className="opacity-70 text-[10px] font-black uppercase tracking-[0.3em] mt-2 border-t border-current/20 pt-2">Standings</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                          <th className="px-4 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Pos</th>
                          <th className="px-4 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Team</th>
                          <th className="px-2 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">P</th>
                          <th className="px-2 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">W</th>
                          <th className="px-2 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">D</th>
                          <th className="px-2 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">L</th>
                          <th className="px-2 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center" title="Clean Sheets">CS</th>
                          <th className="px-2 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">GD</th>
                          <th className="px-4 py-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((row, idx) => (
                          <tr 
                            key={row.teamId} 
                            className={cn(
                              "border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors",
                              idx === 0 ? "bg-emerald-50/30 dark:bg-emerald-900/10" : "hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                            )}
                          >
                            <td className="px-4 py-5 font-black text-gray-400 dark:text-gray-600 text-sm">{idx + 1}</td>
                            <td className="px-4 py-5">
                              <div className="flex items-center gap-2">
                                <div className={cn("w-3 h-3 rounded-full shrink-0", THEMES[teams.find(t => t.id === row.teamId)?.color || 'black'].primary)} />
                                <span className="font-bold text-gray-900 dark:text-white">{row.teamName}</span>
                                {idx === 0 && row.played > 0 && <CheckCircle2 size={14} className={activeTheme.accent} />}
                              </div>
                            </td>
                            <td className="px-2 py-5 text-center font-medium text-gray-500 dark:text-gray-400 text-sm">{row.played}</td>
                            <td className="px-2 py-5 text-center font-medium text-gray-500 dark:text-gray-400 text-sm">{row.won}</td>
                            <td className="px-2 py-5 text-center font-medium text-gray-500 dark:text-gray-400 text-sm">{row.drawn}</td>
                            <td className="px-2 py-5 text-center font-medium text-gray-500 dark:text-gray-400 text-sm">{row.lost}</td>
                            <td className="px-2 py-5 text-center font-medium text-emerald-500 dark:text-emerald-400 text-sm">{row.cleanSheets}</td>
                            <td className={cn(
                              "px-2 py-5 text-center font-bold text-sm",
                              row.goalDifference > 0 ? "text-emerald-600 dark:text-emerald-400" : row.goalDifference < 0 ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"
                            )}>
                              {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                            </td>
                            <td className={cn("px-4 py-5 text-center font-black text-lg", activeTheme.accent)}>{row.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div ref={resultsRef} className="bg-gray-50 dark:bg-gray-800/30 p-6 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Match Results</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {matches.map((m) => {
                      const t1 = teams.find(t => t.id === m.team1Id);
                      const t2 = teams.find(t => t.id === m.team2Id);
                      return (
                        <div key={m.id} className="flex flex-col gap-2 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex-1 flex items-center gap-2 truncate">
                              <div className={cn("w-2 h-2 rounded-full shrink-0", THEMES[t1?.color || 'black'].primary)} />
                              <span className="font-bold text-gray-900 dark:text-white truncate">
                                {t1?.name} <span className="font-normal opacity-50 text-[10px]">({t1?.squadSize})</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-3 px-4 font-black text-gray-900 dark:text-white">
                              <span className={cn(m.score1 !== null && m.score2 !== null && m.score1 > m.score2 ? activeTheme.accent : "")}>
                                {m.score1 ?? '-'}
                              </span>
                              <span className="text-gray-300 dark:text-gray-700">:</span>
                              <span className={cn(m.score1 !== null && m.score2 !== null && m.score2 > m.score1 ? activeTheme.accent : "")}>
                                {m.score2 ?? '-'}
                              </span>
                            </div>
                            <div className="flex-1 flex items-center justify-end gap-2 truncate">
                              <span className="font-bold text-gray-900 dark:text-white truncate">
                                <span className="font-normal opacity-50 text-[10px]">({t2?.squadSize})</span> {t2?.name}
                              </span>
                              <div className={cn("w-2 h-2 rounded-full shrink-0", THEMES[t2?.color || 'black'].primary)} />
                            </div>
                          </div>
                          {(m.scorers1 || m.scorers2) && (
                            <div className="flex justify-between gap-4 mt-1 px-1">
                              <div className="flex-1 text-[10px] text-gray-400 dark:text-gray-500 font-medium italic">
                                {m.scorers1?.split(',').map(s => s.trim()).filter(Boolean).map((s, i) => (
                                  <div key={i} className="truncate">{s}</div>
                                ))}
                              </div>
                              <div className="flex-1 text-right text-[10px] text-gray-400 dark:text-gray-500 font-medium italic">
                                {m.scorers2?.split(',').map(s => s.trim()).filter(Boolean).map((s, i) => (
                                  <div key={i} className="truncate">{s}</div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleShare(standingsRef, 'soccer-standings')}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    <Share2 size={14} /> Standings
                  </button>
                  <button
                    onClick={() => handleShare(resultsRef, 'soccer-results')}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    <Share2 size={14} /> Results
                  </button>
                </div>
                <button
                  onClick={() => handleShare(tableRef, 'soccer-full-report')}
                  className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-xl shadow-gray-200 dark:shadow-none transition-all active:scale-[0.98]"
                >
                  <Share2 size={20} /> Share Full Report
                </button>
                <button
                  onClick={() => setStep('matches')}
                  className="w-full bg-transparent text-gray-400 dark:text-gray-500 py-2 text-xs font-bold hover:text-gray-600 dark:hover:text-gray-300 transition-all"
                >
                  Edit Scores
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showChangelog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Changelog</h3>
                 <button onClick={() => setShowChangelog(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-full p-2 transition-colors">
                   <X size={20} />
                 </button>
              </div>
              <div className="space-y-6">
                {CHANGELOG.map(log => (
                  <div key={log.version}>
                    <div className="flex items-baseline gap-2 mb-2">
                       <span className="font-black text-emerald-500">{log.version}</span>
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{log.date}</span>
                    </div>
                    <ul className="space-y-2">
                      {log.changes.map((c, i) => (
                        <li key={i} className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">•</span> 
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setShowChangelog(false)} 
                className="w-full mt-8 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
          <span>{totalAttendance} Players • {teams.length} Teams</span>
          <button onClick={() => setShowChangelog(true)} className="hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1 active:scale-95">
            {CHANGELOG[0].version} (Changelog)
          </button>
        </div>
      </footer>
    </div>
  );
}
