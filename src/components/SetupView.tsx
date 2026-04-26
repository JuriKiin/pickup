import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Users } from 'lucide-react';
import { Team, ThemeColor } from '../types';
import { THEMES, LOCATIONS } from '../constants';
import { cn } from '../utils';

interface SetupViewProps {
  eventName: string;
  setEventName: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  teams: Team[];
  handleAddTeam: () => void;
  handleRemoveTeam: (id: string) => void;
  updateTeamColor: (id: string, color: ThemeColor) => void;
  updateTeamName: (id: string, name: string) => void;
  updateTeamSquadSize: (id: string, size: number) => void;
  setStep: (step: 'setup' | 'matches' | 'table') => void;
}

export function SetupView({
  eventName, setEventName, location, setLocation, teams,
  handleAddTeam, handleRemoveTeam, updateTeamColor, updateTeamName, updateTeamSquadSize, setStep
}: SetupViewProps) {
  return (
    <motion.div
      key="setup"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex flex-col md:grid md:grid-cols-2 gap-4 mb-8 min-w-0">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 min-w-0">
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
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 min-w-0">
            <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block truncate">
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
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-bold">Name Your Teams</h2>
          <button 
            onClick={handleAddTeam}
            className={cn(
              "text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap",
              "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40"
            )}
          >
            + Add Team
          </button>
        </div>
        <div className="flex flex-col gap-6 min-w-0">
          <AnimatePresence>
            {teams.map((team, idx) => (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                key={team.id} 
                className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4 min-w-0 w-full overflow-hidden"
              >
                <div className="flex flex-col min-[480px]:flex-row min-[480px]:items-center justify-between gap-3 min-w-0">
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
                  <div className="flex flex-wrap items-center justify-start min-[480px]:justify-end gap-1.5 w-full min-[480px]:w-auto min-[480px]:max-w-[70%]">
                    {(Object.keys(THEMES) as ThemeColor[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => updateTeamColor(team.id, c)}
                        className={cn(
                          "w-6 h-6 rounded-full border-2 transition-all shrink-0",
                          THEMES[c].primary,
                          team.color === c ? "border-gray-900 dark:border-white scale-110" : "border-transparent opacity-40 hover:opacity-100"
                        )}
                        title={THEMES[c].name}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 min-w-0 w-full">
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
  );
}
