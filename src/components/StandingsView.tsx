import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Share2, Users, MapPin, Trophy, CheckCircle2, Palette } from 'lucide-react';
import { toPng } from 'html-to-image';
import { Team, Match, TableRow, ThemeColor } from '../types';
import { THEMES } from '../constants';
import { cn } from '../utils';

interface StandingsViewProps {
  eventName: string;
  location: string;
  totalAttendance: number;
  teams: Team[];
  tableData: TableRow[];
  matches: Match[];
  theme: ThemeColor;
  setTheme: (t: ThemeColor) => void;
  isThemeManual: boolean;
  setIsThemeManual: (val: boolean) => void;
  activeTheme: any;
  setStep: (step: 'setup' | 'matches' | 'table') => void;
}

export function StandingsView({
  eventName, location, totalAttendance, teams, tableData, matches,
  theme, setTheme, isThemeManual, setIsThemeManual, activeTheme, setStep
}: StandingsViewProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const standingsRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

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

  return (
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
          {tableData[0]?.played > 0 && (
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
  );
}
