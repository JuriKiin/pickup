import React, { useState, useEffect, useMemo } from 'react';
import { Users, Calendar, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Team, Match, TableRow, ThemeColor } from './types';
import { INITIAL_TEAMS, THEMES, GENERATE_MATCHES, GET_DEFAULT_EVENT_NAME, LOCATIONS } from './constants';
import { cn } from './utils';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SetupView } from './components/SetupView';
import { MatchesView } from './components/MatchesView';
import { StandingsView } from './components/StandingsView';

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
      <Header activeTheme={activeTheme} handleReset={handleReset} />

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
            <SetupView
              eventName={eventName}
              setEventName={setEventName}
              location={location}
              setLocation={setLocation}
              teams={teams}
              handleAddTeam={handleAddTeam}
              handleRemoveTeam={handleRemoveTeam}
              updateTeamColor={updateTeamColor}
              updateTeamName={updateTeamName}
              updateTeamSquadSize={updateTeamSquadSize}
              setStep={setStep}
            />
          )}

          {step === 'matches' && (
            <MatchesView
              teams={teams}
              matches={matches}
              stopwatchSeconds={stopwatchSeconds}
              isStopwatchRunning={isStopwatchRunning}
              setIsStopwatchRunning={setIsStopwatchRunning}
              setStopwatchSeconds={setStopwatchSeconds}
              adjustScore={adjustScore}
              updateMatchScore={updateMatchScore}
              updateMatchScorers={updateMatchScorers}
              toggleMatchCompletion={toggleMatchCompletion}
              setStep={setStep}
              activeTheme={activeTheme}
              activeFilterTeamId={activeFilterTeamId}
              setActiveFilterTeamId={setActiveFilterTeamId}
            />
          )}

          {step === 'table' && (
            <StandingsView
              eventName={eventName}
              location={location}
              totalAttendance={totalAttendance}
              teams={teams}
              tableData={tableData}
              matches={matches}
              theme={theme}
              setTheme={setTheme}
              isThemeManual={isThemeManual}
              setIsThemeManual={setIsThemeManual}
              activeTheme={activeTheme}
              setStep={setStep}
            />
          )}
        </AnimatePresence>
      </main>
      
      <Footer totalAttendance={totalAttendance} teamsCount={teams.length} />
    </div>
  );
}
