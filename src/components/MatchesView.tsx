import React from 'react';
import { motion } from 'motion/react';
import { Timer, Trophy, Play, Pause, RotateCcw, Minus, Plus, Check, Edit3 } from 'lucide-react';
import { Match, Team, ThemeColor } from '../types';
import { THEMES } from '../constants';
import { cn, formatTime } from '../utils';

interface MatchesViewProps {
  teams: Team[];
  matches: Match[];
  stopwatchSeconds: number;
  isStopwatchRunning: boolean;
  setIsStopwatchRunning: (val: boolean) => void;
  setStopwatchSeconds: (val: number | ((val: number) => number)) => void;
  adjustScore: (matchId: string, team: 1 | 2, delta: number) => void;
  updateMatchScore: (matchId: string, team: 1 | 2, score: string) => void;
  updateMatchScorers: (matchId: string, team: 1 | 2, scorers: string) => void;
  toggleMatchCompletion: (matchId: string) => void;
  setStep: (step: 'setup' | 'matches' | 'table') => void;
  activeTheme: any;
  activeFilterTeamId: string | null;
  setActiveFilterTeamId: (id: string | null) => void;
}

export function MatchesView({
  teams, matches, stopwatchSeconds, isStopwatchRunning,
  setIsStopwatchRunning, setStopwatchSeconds, adjustScore,
  updateMatchScore, updateMatchScorers, toggleMatchCompletion,
  setStep, activeTheme, activeFilterTeamId, setActiveFilterTeamId
}: MatchesViewProps) {
  return (
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
  );
}
