import { motion } from 'motion/react';
import { GameMode, Difficulty, BoardSize, ThemeId } from '../types';
import { THEMES } from '../utils/themes';
import { User, Users, Grip, Award } from 'lucide-react';
import { playToggleSound, playResetSound } from '../utils/sound';

interface GameControlsProps {
  gameMode: GameMode;
  difficulty: Difficulty;
  boardSize: BoardSize;
  themeId: ThemeId;
  onGameModeChange: (mode: GameMode) => void;
  onDifficultyChange: (diff: Difficulty) => void;
  onBoardSizeChange: (size: BoardSize) => void;
  onResetBoard: () => void;
}

export default function GameControls({
  gameMode,
  difficulty,
  boardSize,
  themeId,
  onGameModeChange,
  onDifficultyChange,
  onBoardSizeChange,
  onResetBoard,
}: GameControlsProps) {
  const theme = THEMES[themeId];

  const handleModeChange = (mode: GameMode) => {
    playToggleSound();
    onGameModeChange(mode);
  };

  const handleDiffChange = (diff: Difficulty) => {
    playToggleSound();
    onDifficultyChange(diff);
  };

  const handleSizeChange = (size: BoardSize) => {
    playResetSound();
    onBoardSizeChange(size);
  };

  // Helper to resolve button classes based on active state and selected theme
  const getButtonClass = (isActive: boolean) => {
    switch (themeId) {
      case 'brutalist':
        return isActive
          ? 'bg-[#00ffff] border-4 border-black shadow-[2px_2px_0px_#000000] text-black font-extrabold rounded-none'
          : 'bg-white border-2 border-black text-black font-bold active:translate-x-[1px] active:translate-y-[1px] rounded-none';
      case 'cyberpunk':
        return isActive
          ? 'bg-[#fcee0a]/20 border-2 border-[#fcee0a] text-[#fcee0a] font-black rounded-none shadow-[3px_3px_0px_rgba(252,238,10,0.25)]'
          : 'bg-[#121216] border border-[#fcee0a]/40 text-[#fcee0a] hover:bg-[#fcee0a]/10 hover:border-[#fcee0a] rounded-none';
      case 'synthwave':
        return isActive
          ? 'bg-pink-500/30 border border-pink-500 text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.3)] font-semibold rounded-xl'
          : 'bg-black/50 hover:bg-pink-500/20 border border-pink-500/40 text-pink-400 rounded-xl';
      case 'sakura':
        return isActive
          ? 'bg-rose-100/70 border border-rose-300 text-rose-900 font-semibold rounded-full'
          : 'bg-rose-50/40 hover:bg-rose-50 border border-rose-100 text-rose-700 rounded-full';
      case 'nordic':
        return isActive
          ? 'bg-stone-200 border border-stone-400 text-stone-900 font-semibold rounded-xl'
          : 'bg-stone-100 hover:bg-stone-200/80 border border-stone-200/60 text-stone-700 rounded-xl';
      case 'slate':
      default:
        return isActive
          ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-semibold rounded-xl'
          : 'bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 text-slate-200 rounded-xl';
    }
  };

  const getResetButtonClass = () => {
    switch (themeId) {
      case 'brutalist':
        return 'bg-[#ffff00] border-4 border-black text-black font-black shadow-[4px_4px_0px_#000000] rounded-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none';
      case 'cyberpunk':
        return 'bg-[#fcee0a] text-black border-2 border-[#fcee0a] font-black rounded-none shadow-[4px_4px_0px_rgba(252,238,10,0.3)] hover:bg-[#ffe600] transition-colors';
      case 'synthwave':
        return 'bg-pink-500 hover:bg-pink-600 border border-pink-400/30 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)] rounded-xl';
      case 'sakura':
        return 'bg-rose-500 hover:bg-rose-600 border border-rose-400 text-white shadow-[0_4px_12px_rgba(244,63,94,0.2)] rounded-full';
      case 'nordic':
        return 'bg-[#cc6655] hover:bg-[#b85c4c] border border-[#a84e3e] text-white rounded-xl shadow-[0_4px_12px_rgba(204,102,85,0.15)]';
      case 'slate':
      default:
        return 'bg-emerald-500 hover:bg-emerald-600 border border-emerald-400/20 text-white shadow-[0_4px_12px_rgba(16,185,129,0.2)] rounded-xl';
    }
  };

  const borderStyle = themeId === 'brutalist' 
    ? 'border-4 border-black' 
    : themeId === 'cyberpunk'
    ? 'border-2 border-[#fcee0a]'
    : themeId === 'sakura'
    ? 'border border-pink-100'
    : 'border border-gray-100/10';

  return (
    <div className={`flex flex-col gap-5 w-full p-4 rounded-xl ${theme.containerBg} ${theme.cardShadow} ${borderStyle}`}>
      {/* 1. Play Mode Selector */}
      <div className="flex flex-col gap-2">
        <label className={`text-xs font-semibold tracking-wider uppercase opacity-80 flex items-center gap-1.5 ${theme.fontFamily}`}>
          <Users className="w-3.5 h-3.5 opacity-70" /> Opponent
        </label>
        <div className="flex gap-2 w-full">
          <button
            id="mode-ai-btn"
            onClick={() => handleModeChange('ai')}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-xs flex-grow cursor-pointer select-none transition-all ${getButtonClass(gameMode === 'ai')}`}
          >
            <User className="w-3.5 h-3.5" />
            <span>AI Computer</span>
          </button>
          <button
            id="mode-local-btn"
            onClick={() => handleModeChange('local')}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-xs flex-grow cursor-pointer select-none transition-all ${getButtonClass(gameMode === 'local')}`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Pass & Play</span>
          </button>
        </div>
      </div>

      {/* 2. Board Grid Size Selector */}
      <div className="flex flex-col gap-2">
        <label className={`text-xs font-semibold tracking-wider uppercase opacity-80 flex items-center gap-1.5 ${theme.fontFamily}`}>
          <Grip className="w-3.5 h-3.5 opacity-70" /> Board Dimensions
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
          <button
            id="size-3-btn"
            onClick={() => handleSizeChange(3)}
            className={`flex items-center justify-center gap-1.5 py-2 px-3.5 text-xs flex-grow cursor-pointer select-none transition-all ${getButtonClass(boardSize === 3)}`}
          >
            <span>3 x 3</span>
            <span className="text-[10px] opacity-60 font-mono">(Classic)</span>
          </button>
          <button
            id="size-4-btn"
            onClick={() => handleSizeChange(4)}
            className={`flex items-center justify-center gap-1.5 py-2 px-3.5 text-xs flex-grow cursor-pointer select-none transition-all ${getButtonClass(boardSize === 4)}`}
          >
            <span>4 x 4</span>
            <span className="text-[10px] opacity-60 font-mono">(Tactical)</span>
          </button>
          <button
            id="size-5-btn"
            onClick={() => handleSizeChange(5)}
            className={`flex items-center justify-center gap-1.5 py-2 px-3.5 text-xs flex-grow cursor-pointer select-none transition-all ${getButtonClass(boardSize === 5)}`}
          >
            <span>5 x 5</span>
            <span className="text-[10px] opacity-60 font-mono">(Supreme)</span>
          </button>
        </div>
      </div>

      {/* 3. AI Difficulty Levels (Only shown when mode is AI) */}
      {gameMode === 'ai' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-col gap-2 overflow-hidden"
        >
          <label className={`text-xs font-semibold tracking-wider uppercase opacity-80 flex items-center gap-1.5 ${theme.fontFamily}`}>
            <Award className="w-3.5 h-3.5 opacity-70" /> AI Level
          </label>
          <div className="grid grid-cols-3 gap-1.5 w-full">
            {(['easy', 'medium', 'unbeatable'] as Difficulty[]).map((level) => {
              const labelText = level === 'unbeatable' ? 'Unbeatable' : level.charAt(0).toUpperCase() + level.slice(1);
              return (
                <button
                  id={`diff-${level}-btn`}
                  key={level}
                  onClick={() => handleDiffChange(level)}
                  className={`py-2 px-1 text-center text-xs transition-all capitalize select-none cursor-pointer ${getButtonClass(difficulty === level)}`}
                >
                  {labelText}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Quick Restart trigger */}
      <motion.button
        id="restart-board-btn"
        onClick={onResetBoard}
        whileHover={{ scale: themeId === 'brutalist' ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer select-none ${getResetButtonClass()}`}
      >
        Reset Grid Position
      </motion.button>
    </div>
  );
}
