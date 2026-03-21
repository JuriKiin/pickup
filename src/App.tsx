import { useState, useEffect, useRef, useMemo } from 'react';
import { Trophy, Share2, RotateCcw, Save, Users, Calendar, ChevronRight, CheckCircle2, Palette, Moon, Sun, MapPin } from 'lucide-react';
import { toPng } from 'html-to-image';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';
import { Team, Match, TableRow, ThemeColor } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const INITIAL_TEAMS: Team[] = [
  { id: '1', name: 'Team A' },
  { id: '2', name: 'Team B' },
  { id: '3', name: 'Team C' },
  { id: '4', name: 'Team D' },
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

export default function App() {
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('soccer-teams');
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
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

  const [eventName, setEventName] = useState<string>(() => {
    const saved = localStorage.getItem('soccer-event-name');
    return saved || GET_DEFAULT_EVENT_NAME();
  });

  const [location, setLocation] = useState<string>(() => {
    const saved = localStorage.getItem('soccer-location');
    return saved || '';
  });

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('soccer-teams', JSON.stringify(teams));
    localStorage.setItem('soccer-matches', JSON.stringify(matches));
    localStorage.setItem('soccer-step', step);
    localStorage.setItem('soccer-theme', theme);
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

  const handleReset = () => {
    setTeams(INITIAL_TEAMS);
    setMatches(GENERATE_MATCHES(INITIAL_TEAMS));
    setEventName(GET_DEFAULT_EVENT_NAME());
    setLocation('');
    setStep('setup');
    setShowResetConfirm(false);
  };

  const handleShare = async () => {
    if (!tableRef.current) return;
    try {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const dataUrl = await toPng(tableRef.current, { 
        backgroundColor: isDark ? '#111827' : '#ffffff', 
        cacheBust: true,
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'soccer-table.png', { type: 'image/png' });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'Pickup Soccer Table',
          text: 'Check out tonight\'s soccer results!',
        });
      } else {
        const link = document.createElement('a');
        link.download = 'soccer-table.png';
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const updateMatchScore = (matchId: string, team: 1 | 2, score: string) => {
    const val = score === '' ? null : parseInt(score, 10);
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

  const updateTeamName = (id: string, name: string) => {
    setTeams(prev => prev.map(t => t.id === id ? { ...t, name } : t));
  };

  const activeTheme = THEMES[theme] || THEMES.black;

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
                <h2 className="text-xl font-bold mb-4">Name Your Teams</h2>
                <div className="grid gap-4">
                  {teams.map((team, idx) => (
                    <div key={team.id} className="relative">
                      <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 block">
                        Team {idx + 1}
                      </label>
                      <input
                        type="text"
                        value={team.name}
                        onChange={(e) => updateTeamName(team.id, e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-gray-900 dark:text-white"
                        placeholder={`Team ${idx + 1} Name`}
                      />
                    </div>
                  ))}
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
              <div className="grid gap-4">
                {matches.map((match, idx) => {
                  const t1 = teams.find(t => t.id === match.team1Id);
                  const t2 = teams.find(t => t.id === match.team2Id);
                  return (
                    <div key={match.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                      <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Match {idx + 1}</div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 text-right">
                          <div className="font-bold text-gray-900 dark:text-white mb-2 truncate">{t1?.name}</div>
                          <input
                            type="number"
                            inputMode="numeric"
                            value={match.score1 ?? ''}
                            onChange={(e) => updateMatchScore(match.id, 1, e.target.value)}
                            className="w-16 h-16 text-center text-2xl font-black bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                            placeholder="-"
                          />
                        </div>
                        <div className="text-gray-300 dark:text-gray-700 font-black text-xl">VS</div>
                        <div className="flex-1 text-left">
                          <div className="font-bold text-gray-900 dark:text-white mb-2 truncate">{t2?.name}</div>
                          <input
                            type="number"
                            inputMode="numeric"
                            value={match.score2 ?? ''}
                            onChange={(e) => updateMatchScore(match.id, 2, e.target.value)}
                            className="w-16 h-16 text-center text-2xl font-black bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                            placeholder="-"
                          />
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
                      onClick={() => setTheme(t)}
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
                </div>
              </div>

              <div 
                ref={tableRef}
                className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xl"
              >
                <div className={cn("p-6 transition-colors duration-300", activeTheme.primary, activeTheme.text)}>
                  <h2 className="text-2xl font-black tracking-tighter uppercase italic leading-tight">{eventName}</h2>
                  {location && (
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-1 flex items-center gap-1">
                      <MapPin size={10} /> {location}
                    </p>
                  )}
                  <p className="opacity-70 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Table Results</p>
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
                              <span className="font-bold text-gray-900 dark:text-white">{row.teamName}</span>
                              {idx === 0 && row.played > 0 && <CheckCircle2 size={14} className={activeTheme.accent} />}
                            </div>
                          </td>
                          <td className="px-2 py-5 text-center font-medium text-gray-500 dark:text-gray-400 text-sm">{row.played}</td>
                          <td className="px-2 py-5 text-center font-medium text-gray-500 dark:text-gray-400 text-sm">{row.won}</td>
                          <td className="px-2 py-5 text-center font-medium text-gray-500 dark:text-gray-400 text-sm">{row.drawn}</td>
                          <td className="px-2 py-5 text-center font-medium text-gray-500 dark:text-gray-400 text-sm">{row.lost}</td>
                          <td className="px-2 py-5 text-center font-bold text-gray-700 dark:text-gray-300 text-sm">
                            {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                          </td>
                          <td className={cn("px-4 py-5 text-center font-black text-lg", activeTheme.accent)}>{row.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/30 p-6 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Table Results</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {matches.map((m) => {
                      const t1 = teams.find(t => t.id === m.team1Id);
                      const t2 = teams.find(t => t.id === m.team2Id);
                      return (
                        <div key={m.id} className="flex flex-col gap-2 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex-1 font-bold text-gray-900 dark:text-white truncate">{t1?.name}</span>
                            <div className="flex items-center gap-3 px-4 font-black text-gray-900 dark:text-white">
                              <span className={cn(m.score1 !== null && m.score2 !== null && m.score1 > m.score2 ? activeTheme.accent : "")}>
                                {m.score1 ?? '-'}
                              </span>
                              <span className="text-gray-300 dark:text-gray-700">:</span>
                              <span className={cn(m.score1 !== null && m.score2 !== null && m.score2 > m.score1 ? activeTheme.accent : "")}>
                                {m.score2 ?? '-'}
                              </span>
                            </div>
                            <span className="flex-1 text-right font-bold text-gray-900 dark:text-white truncate">{t2?.name}</span>
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

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setStep('matches')}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Edit Scores
                </button>
                <button
                  onClick={handleShare}
                  className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-xl shadow-gray-200 dark:shadow-none transition-all active:scale-[0.98]"
                >
                  <Share2 size={20} /> Share Table
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest">
          <span>4 Teams • 6 Matches</span>
          <span>Pickup Soccer Manager</span>
        </div>
      </footer>
    </div>
  );
}
