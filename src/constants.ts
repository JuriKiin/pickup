import { Team, Match, ThemeColor } from './types';

export const INITIAL_TEAMS: Team[] = [
  { id: '1', name: 'Team A', color: 'black', squadSize: 5 },
  { id: '2', name: 'Team B', color: 'red', squadSize: 5 },
  { id: '3', name: 'Team C', color: 'blue', squadSize: 5 },
  { id: '4', name: 'Team D', color: 'green', squadSize: 5 },
];

export const THEMES: Record<ThemeColor, { name: string; primary: string; secondary: string; accent: string; bg: string; shadow: string; text: string }> = {
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

export const GENERATE_MATCHES = (teams: Team[]): Match[] => {
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

export const GET_DEFAULT_EVENT_NAME = () => {
  const date = new Date();
  return `Pickup Soccer ${date.getMonth() + 1}/${date.getDate()}`;
};

export const LOCATIONS = [
  "Bertram Field",
  "McGrath Park",
  "Salem Common",
  "Bentley Academy"
];

export const CHANGELOG = [
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
