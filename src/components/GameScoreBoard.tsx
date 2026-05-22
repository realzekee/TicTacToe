import { motion } from 'motion/react';
import { GameStats, ThemeId, GameTheme } from '../types';
import { THEMES } from '../utils/themes';
import { Volume2, VolumeX, RotateCcw, Flame, Trophy } from 'lucide-react';
import { setMuteState, playToggleSound } from '../utils/sound';

interface GameScoreBoardProps {
  stats: GameStats;
  themeId: ThemeId;
  isMuted: boolean;
  onToggleMute: (muted: boolean) => void;
  onResetStats: () => void;
  gameMode: 'ai' | 'local';
}

export default function GameScoreBoard({
  stats,
  themeId,
  isMuted,
  onToggleMute,
  onResetStats,
  gameMode,
}: GameScoreBoardProps) {
  const theme = THEMES[themeId];

  const handleMuteChange = () => {
    onToggleMute(!isMuted);
    // play a small feedback sound immediately if unmuting
    if (isMuted) {
      setTimeout(() => playToggleSound(), 50);
    }
  };

  const borderStyle = themeId === 'brutalist' ? 'border-4 border-black' : 'border border-gray-100/10';

  return (
    <div className={`flex flex-col gap-4 w-full p-4 rounded-xl ${theme.containerBg} ${theme.cardShadow} ${borderStyle}`}>
      {/* Top Banner: Control Actions & Streak counters */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-500/10 pb-3">
        {/* Streak Indicator */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Flame className={`w-4- h-4 text-orange-500 fill-orange-500/20`} />
            <div className="flex flex-col">
              <span className={`text-[10px] uppercase tracking-wider ${theme.mutedTextColor} leading-none`}>
                Streak
              </span>
              <span className={`text-sm font-bold ${theme.textColor}`}>
                {stats.currentStreak}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-yellow-500 fill-yellow-500/10" />
            <div className="flex flex-col">
              <span className={`text-[10px] uppercase tracking-wider ${theme.mutedTextColor} leading-none`}>
                Best Record
              </span>
              <span className={`text-sm font-bold ${theme.textColor}`}>
                {stats.bestStreak}
              </span>
            </div>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle Button */}
          <motion.button
            id="sound-toggle-btn"
            onClick={handleMuteChange}
            whileHover={{ scale: themeId === 'brutalist' ? 1 : 1.08 }}
            whileTap={{ scale: 0.95 }}
            title={isMuted ? 'Unmute game sound' : 'Mute game sound'}
            className={`p-2 rounded-lg cursor-pointer ${theme.buttonBg} ${theme.buttonText} ${themeId === 'brutalist' ? 'border-2 border-black' : 'border border-stone-500/10'}`}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </motion.button>

          {/* Reset Stats button */}
          <motion.button
            id="reset-stats-btn"
            onClick={onResetStats}
            whileHover={{ scale: themeId === 'brutalist' ? 1 : 1.08 }}
            whileTap={{ scale: 0.95 }}
            title="Reset Game Statistics"
            className={`p-2 rounded-lg cursor-pointer hover:text-red-400 transition-colors ${theme.buttonBg} ${theme.buttonText} ${themeId === 'brutalist' ? 'border-2 border-black' : 'border border-stone-500/10'}`}
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Grid: Main Scores */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {/* X Score Card */}
        <div
          className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-lg ${
            themeId === 'brutalist'
              ? 'border-2 border-black bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)]'
              : themeId === 'synthwave'
              ? 'bg-pink-500/5 border border-pink-500/15'
              : 'bg-slate-800/20'
          }`}
        >
          <span className={`text-xs font-bold leading-none mb-1 ${theme.accentColor}`}>
            {gameMode === 'ai' ? 'YOU (X)' : 'PLAYER X'}
          </span>
          <span className={`text-lg sm:text-2xl font-black tracking-tight ${theme.textColor}`}>
            {stats.xWins}
          </span>
        </div>

        {/* Draws Card */}
        <div
          className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-lg ${
            themeId === 'brutalist'
              ? 'border-2 border-black bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)]'
              : 'bg-stone-550/5'
          }`}
        >
          <span className={`text-xs uppercase tracking-wider leading-none mb-1 ${theme.mutedTextColor}`}>
            DRAWS
          </span>
          <span className={`text-lg sm:text-2xl font-black tracking-tight ${theme.textColor}`}>
            {stats.draws}
          </span>
        </div>

        {/* O Score Card */}
        <div
          className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-lg ${
            themeId === 'brutalist'
              ? 'border-2 border-black bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)]'
              : themeId === 'synthwave'
              ? 'bg-cyan-500/5 border border-cyan-500/15'
              : 'bg-slate-800/20'
          }`}
        >
          <span className={`text-xs font-bold leading-none mb-1 text-cyan-400`}>
            {gameMode === 'ai' ? 'CPU (O)' : 'PLAYER O'}
          </span>
          <span className={`text-lg sm:text-2xl font-black tracking-tight ${theme.textColor}`}>
            {stats.oWins}
          </span>
        </div>
      </div>
    </div>
  );
}
