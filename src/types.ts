export interface Team {
  id: string;
  name: string;
  color: ThemeColor;
  squadSize: number;
}

export interface Match {
  id: string;
  team1Id: string;
  team2Id: string;
  score1: number | null;
  score2: number | null;
  scorers1?: string;
  scorers2?: string;
  isCompleted?: boolean;
}

export interface TableRow {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  cleanSheets: number;
  points: number;
}

export type ThemeColor = 'black' | 'white' | 'red' | 'neon' | 'orange' | 'blue' | 'green' | 'yellow';

export interface Theme {
  id: ThemeColor;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  text: string;
}
