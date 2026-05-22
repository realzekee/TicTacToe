import { motion, AnimatePresence } from 'motion/react';
import { Player, ThemeId, GlyphPreset } from '../types';
import { THEMES } from '../utils/themes';
import { RefreshCw, Play } from 'lucide-react';

interface MoveRecord {
  step: number;
  player: Player;
  cellIndex: number;
  label: string;
}

interface MoveHistoryProps {
  moves: MoveRecord[];
  themeId: ThemeId;
  glyphPreset: GlyphPreset;
  boardSize: number;
  onJumpToMove?: (stepIndex: number) => void;
}

export default function MoveHistory({ moves, themeId, glyphPreset, boardSize, onJumpToMove }: MoveHistoryProps) {
  const currentTheme = THEMES[themeId];

  // Map 1D board index (0 to 8 or 15) to beautiful human-readable grid coordinates (e.g. Row 1, Col 3)
  const getCellCoordinate = (idx: number) => {
    const row = Math.floor(idx / boardSize) + 1;
    const col = (idx % boardSize) + 1;
    return `R${row} C${col}`;
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between select-none">
        <span className={`text-xs font-semibold tracking-wider uppercase opacity-80 ${currentTheme.fontFamily}`}>
          Round Timeline
        </span>
        <span className="text-[10px] font-mono opacity-60 tracking-wider">
          {moves.length === 0 ? 'No moves yet' : `${moves.length} moves logged`}
        </span>
      </div>

      <div className={`p-3 rounded-xl min-h-[140px] max-h-[160px] overflow-y-auto border flex flex-col gap-2 ${
        themeId === 'brutalist' 
          ? 'border-4 border-black bg-white shadow-[3px_3px_0px_#000000] rounded-none' 
          : 'bg-stone-500/5 border-stone-100/10'
      }`}>
        <AnimatePresence initial={false}>
          {moves.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center py-6 select-none animate-pulse">
              <span className={`text-xs ${currentTheme.mutedTextColor} font-medium`}>
                Deploy a marker onto the arena to begin tracking steps
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 h-full">
              {moves.map((move, index) => {
                const isX = move.player === 'X';
                const charVal = isX ? glyphPreset.xLabel : glyphPreset.oLabel;
                
                // Active stylized label color class
                const markerColor = isX
                  ? (themeId === 'slate' ? 'text-emerald-400' : themeId === 'synthwave' ? 'text-pink-400' : themeId === 'cyberpunk' ? 'text-[#fcee0a]' : themeId === 'sakura' ? 'text-rose-500' : 'text-stone-800')
                  : (themeId === 'slate' ? 'text-cyan-400' : themeId === 'synthwave' ? 'text-cyan-400' : themeId === 'cyberpunk' ? 'text-[#00f0ff]' : themeId === 'sakura' ? 'text-pink-400' : 'text-stone-600');

                return (
                  <motion.div
                    key={move.step}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between text-xs py-1 px-2.5 rounded bg-stone-500/5 hover:bg-stone-500/10 transition-colors group"
                  >
                    <div className="flex items-center gap-2 font-mono">
                      <span className="opacity-40">#{move.step}</span>
                      <span className={`font-black ${markerColor}`}>{charVal}</span>
                      <span className={`${currentTheme.textColor} font-medium`}>
                        placed at <span className="font-bold">{getCellCoordinate(move.cellIndex)}</span>
                      </span>
                    </div>
                    
                    <span className="text-[10px] opacity-50 font-mono scale-95 uppercase tracking-wide">
                      {isX ? 'Player' : 'CPU'}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
