export type Player = 'X' | 'O';

export type GameMode = 'ai' | 'local';

export type Difficulty = 'easy' | 'medium' | 'unbeatable';

export type BoardSize = 3 | 4 | 5;

export type ThemeId = 'slate' | 'synthwave' | 'nordic' | 'brutalist' | 'cyberpunk' | 'sakura';

export type GlyphPresetId = 'classic' | 'ethereal' | 'retro' | 'fighter';

export interface GlyphPreset {
  id: GlyphPresetId;
  name: string;
  xLabel: string;
  oLabel: string;
}

export interface GameTheme {
  id: ThemeId;
  name: string;
  bodyBg: string;
  containerBg: string;
  gridLineColor: string;
  cellBg: string;
  cellBgHover: string;
  xColor: string;
  xGlow: string;
  oColor: string;
  oGlow: string;
  textColor: string;
  mutedTextColor: string;
  buttonBg: string;
  buttonText: string;
  buttonBorder: string;
  buttonActiveBg: string;
  fontFamily: string;
  accentColor: string;
  cardShadow: string;
}

export interface GameStats {
  xWins: number;
  oWins: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
}

