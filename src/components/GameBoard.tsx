import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Player, BoardSize, ThemeId, GlyphPreset } from '../types';
import { THEMES } from '../utils/themes';
import { playClickSound } from '../utils/sound';

interface GameBoardProps {
  board: (Player | null)[];
  onCellClick: (idx: number) => void;
  currentPlayer: Player;
  winningPattern: number[] | null;
  boardSize: BoardSize;
  themeId: ThemeId;
  glyphPreset: GlyphPreset;
  disabled: boolean;
}

// Custom animated marker drawings using motion SVG paths or custom glyph presets
function MarkerX({ themeId, glyphPreset }: { themeId: ThemeId; glyphPreset: GlyphPreset }) {
  const isBrutalist = themeId === 'brutalist';
  
  const colorClass = themeId === 'slate' ? 'text-emerald-400' 
                   : themeId === 'synthwave' ? 'text-pink-500 [text-shadow:0_0_12px_rgba(236,72,153,0.6)]' 
                   : themeId === 'nordic' ? 'text-[#cc6655]' 
                   : themeId === 'cyberpunk' ? 'text-[#fcee0a] [text-shadow:0_0_12px_rgba(252,238,10,0.6)]' 
                   : themeId === 'sakura' ? 'text-rose-500' 
                   : 'text-black';

  if (glyphPreset.id === 'classic') {
    const strokeColor = isBrutalist ? '#000000' 
                      : themeId === 'synthwave' ? '#ec4899' 
                      : themeId === 'cyberpunk' ? '#fcee0a' 
                      : themeId === 'sakura' ? '#f43f5e' 
                      : '#34d399';
    const strokeWidth = isBrutalist ? 12 : 8;

    return (
      <svg viewBox="0 0 100 100" className="w-[65%] h-[65%] select-none pointer-events-none drop-shadow-md">
        <motion.path
          d="M23,23 L77,77"
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap={isBrutalist ? 'square' : 'round'}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        />
        <motion.path
          d="M77,23 L23,77"
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap={isBrutalist ? 'square' : 'round'}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.22, delay: 0.12, ease: 'easeOut' }}
        />
      </svg>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.3, opacity: 0, rotate: -45 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: 'spring', damping: 12, stiffness: 220 }}
      className={`text-4xl sm:text-5xl font-black select-none pointer-events-none ${colorClass}`}
    >
      {glyphPreset.xLabel}
    </motion.div>
  );
}

function MarkerO({ themeId, glyphPreset }: { themeId: ThemeId; glyphPreset: GlyphPreset }) {
  const isBrutalist = themeId === 'brutalist';

  const colorClass = themeId === 'slate' ? 'text-cyan-400' 
                   : themeId === 'synthwave' ? 'text-cyan-400 [text-shadow:0_0_12px_rgba(34,211,238,0.6)]' 
                   : themeId === 'nordic' ? 'text-[#446655]' 
                   : themeId === 'cyberpunk' ? 'text-[#00f0ff] [text-shadow:0_0_12px_rgba(0,240,255,0.6)]' 
                   : themeId === 'sakura' ? 'text-pink-400' 
                   : 'text-black';

  if (glyphPreset.id === 'classic') {
    const strokeColor = isBrutalist ? '#000000' 
                      : themeId === 'synthwave' ? '#22d3ee' 
                      : themeId === 'cyberpunk' ? '#00f0ff' 
                      : themeId === 'sakura' ? '#fbcfe8' 
                      : '#22d3ee';
    const strokeWidth = isBrutalist ? 12 : 8;

    return (
      <svg viewBox="0 0 100 100" className="w-[65%] h-[65%] select-none pointer-events-none drop-shadow-md">
        <motion.circle
          cx="50"
          cy="50"
          r="28"
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap={isBrutalist ? 'square' : 'round'}
          initial={{ pathLength: 0, rotate: -90 }}
          animate={{ pathLength: 1, rotate: 270 }}
          transition={{ duration: 0.32, ease: 'easeInOut' }}
        />
      </svg>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.3, opacity: 0, rotate: 45 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: 'spring', damping: 12, stiffness: 220 }}
      className={`text-4xl sm:text-5xl font-black select-none pointer-events-none ${colorClass}`}
    >
      {glyphPreset.oLabel}
    </motion.div>
  );
}

// Hover indicator showing what would be placed if clicked
function MarkerPreview({ player, themeId, glyphPreset }: { player: Player; themeId: ThemeId; glyphPreset: GlyphPreset }) {
  const isBrutalist = themeId === 'brutalist';
  const label = player === 'X' ? glyphPreset.xLabel : glyphPreset.oLabel;

  if (glyphPreset.id === 'classic') {
    const strokeColor = isBrutalist ? 'rgba(0,0,0,0.15)' : player === 'X' ? 'rgba(16,185,129,0.25)' : 'rgba(34,211,238,0.25)';
    const strokeWidth = isBrutalist ? 8 : 6;

    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all">
        {player === 'X' ? (
          <svg viewBox="0 0 100 100" className="w-[60%] h-[60%] opacity-50 scale-95">
            <path d="M25,25 L75,75 M75,25 L25,75" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 100 100" className="w-[60%] h-[60%] opacity-50 scale-95">
            <circle cx="50" cy="50" r="26" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
          </svg>
        )}
      </div>
    );
  }

  const previewColorClass = themeId === 'slate' ? 'text-slate-500/30' 
                          : themeId === 'synthwave' ? (player === 'X' ? 'text-pink-500/25' : 'text-cyan-500/25')
                          : themeId === 'cyberpunk' ? (player === 'X' ? 'text-[#fcee0a]/25' : 'text-[#00f0ff]/25')
                          : themeId === 'sakura' ? 'text-rose-400/25'
                          : 'text-stone-400/30';

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all">
      <span className={`text-4xl font-extrabold opacity-60 scale-90 ${previewColorClass}`}>
        {label}
      </span>
    </div>
  );
}

export default function GameBoard({
  board,
  onCellClick,
  currentPlayer,
  winningPattern,
  boardSize,
  themeId,
  glyphPreset,
  disabled,
}: GameBoardProps) {
  const theme = THEMES[themeId];

  // Smooth stagger tracking on board size change or game reset
  const [resetKey, setResetKey] = useState(0);
  const prevWasEmpty = useRef(true);
  const isEmptyBoard = board.every(cell => cell === null);

  useEffect(() => {
    if (isEmptyBoard && !prevWasEmpty.current) {
      setResetKey(prev => prev + 1);
    }
    prevWasEmpty.current = isEmptyBoard;
  }, [isEmptyBoard]);

  const handleInteraction = (idx: number) => {
    if (disabled || board[idx] !== null) return;
    playClickSound(currentPlayer);
    onCellClick(idx);
  };

  const gridColsClass = boardSize === 3 ? 'grid-cols-3' : boardSize === 4 ? 'grid-cols-4' : 'grid-cols-5';
  const gridGap = themeId === 'brutalist' ? 'gap-1 bg-black p-1' : `gap-[3.5px] ${theme.gridLineColor} p-[1.5px]`;
  const borderStyle = themeId === 'brutalist' ? 'border-4 border-black bg-black' : 'border border-gray-100/10 p-2';

  return (
    <div
      className={`relative w-full aspect-square max-w-[460px] mx-auto rounded-2xl ${theme.containerBg} ${theme.cardShadow} ${borderStyle} transition-all duration-300`}
    >
      <div 
        key={`${boardSize}-${resetKey}`}
        className={`grid ${gridColsClass} h-full w-full ${gridGap} rounded-xl overflow-hidden`}
      >
        {board.map((cell, idx) => {
          const isWinningCell = winningPattern?.includes(idx);
          const seqIndex = winningPattern ? winningPattern.indexOf(idx) : 0;
          
          // Determine cell backgrounds and textures based on active themes
          let cellStyle = `${theme.cellBg} ${theme.cellBgHover}`;
          let borderOverlay = '';

          if (isWinningCell) {
            if (themeId === 'brutalist') {
              cellStyle = 'bg-black border-4 border-[#ff00ff] z-10';
            } else if (themeId === 'synthwave') {
              cellStyle = 'bg-pink-500/10 border border-pink-500/60 shadow-[0_0_20px_rgba(236,72,153,0.15)] z-10';
            } else if (themeId === 'cyberpunk') {
              cellStyle = 'bg-[#fcee0a]/5 border border-[#fcee0a]/60 shadow-[0_0_20px_rgba(252,238,10,0.15)] z-10';
            } else if (themeId === 'sakura') {
              cellStyle = 'bg-rose-50 border border-rose-300 text-rose-950 scale-[0.98] z-10';
            } else if (themeId === 'nordic') {
              cellStyle = 'bg-[#cc6655]/10 border border-[#cc6655]/50 text-stone-950 scale-[0.98] z-10';
            } else {
              cellStyle = 'bg-emerald-500/10 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] z-10';
            }
          }

          if (themeId === 'brutalist') {
            borderOverlay = 'hover:border-2 hover:border-black';
          }

          return (
            <motion.button
              id={`board-cell-${idx}`}
              key={idx}
              onClick={() => handleInteraction(idx)}
              disabled={disabled || cell !== null}
              initial={{ 
                opacity: 0, 
                scale: themeId === 'brutalist' ? 0.94 : 0.84,
                y: themeId === 'brutalist' ? 0 : 8 
              }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: 0 
              }}
              whileTap={{ scale: themeId === 'brutalist' ? 1 : 0.95 }}
              whileHover={{ scale: themeId === 'brutalist' ? 1 : cell === null ? 1.012 : 1 }}
              transition={{
                default: {
                  type: 'spring',
                  stiffness: themeId === 'brutalist' ? 450 : 220,
                  damping: themeId === 'brutalist' ? 15 : 20,
                  delay: idx * 0.02,
                },
                scale: {
                  type: 'spring',
                  stiffness: 350,
                  damping: 18,
                  delay: idx * 0.02,
                }
              }}
              className={`relative flex items-center justify-center cursor-pointer select-none outline-none focus:outline-none focus:ring-0 ${cellStyle} ${borderOverlay} transition-colors duration-200`}
            >
              {/* Dynamic staggered highlight backdrop layer */}
              {isWinningCell && (
                <motion.div
                  className={`absolute inset-0 z-0 pointer-events-none opacity-30 ${
                    themeId === 'brutalist' ? 'bg-[#ff00ff]' 
                    : themeId === 'synthwave' ? 'bg-gradient-to-tr from-pink-500/30 via-purple-500/10 to-transparent' 
                    : themeId === 'cyberpunk' ? 'bg-gradient-to-r from-[#fcee0a]/30 to-transparent' 
                    : themeId === 'sakura' ? 'bg-gradient-to-tr from-rose-200/50 via-pink-100/30 to-transparent' 
                    : themeId === 'nordic' ? 'bg-gradient-to-tr from-[#cc6655]/30 to-transparent' 
                    : 'bg-gradient-to-tr from-emerald-500/30 via-teal-500/10 to-transparent'
                  }`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ 
                    opacity: [0.3, 0.85, 0.3],
                    scale: themeId === 'brutalist' ? 1 : [0.94, 1.06, 0.94],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    delay: seqIndex * 0.16,
                    ease: 'easeInOut'
                  }}
                />
              )}

              {/* Actual Marker placement wrapper with staggered custom dynamics */}
              {cell !== null && (
                <motion.div
                  className="w-full h-full flex items-center justify-center z-10"
                  animate={isWinningCell ? {
                    scale: [1, 1.25, 1],
                    rotate: themeId === 'brutalist' ? 0 : [0, 4, -4, 0],
                    filter: themeId === 'synthwave' 
                      ? ['drop-shadow(0 0 2px #ec4899)', 'drop-shadow(0 0 15px #ec4899)', 'drop-shadow(0 0 2px #ec4899)']
                      : themeId === 'cyberpunk'
                      ? ['drop-shadow(0 0 2px #fcee0a)', 'drop-shadow(0 0 15px #fcee0a)', 'drop-shadow(0 0 2px #fcee0a)']
                      : themeId === 'slate'
                      ? ['drop-shadow(0 0 2px #10b981)', 'drop-shadow(0 0 12px #10b981)', 'drop-shadow(0 0 2px #10b981)']
                      : themeId === 'sakura'
                      ? ['drop-shadow(0 0 2px #f43f5e)', 'drop-shadow(0 0 10px #fb7185)', 'drop-shadow(0 0 2px #f43f5e)']
                      : ['drop-shadow(0 0 0px rgba(0,0,0,0))', 'drop-shadow(0 0 5px rgba(0,0,0,0.2))', 'drop-shadow(0 0 0px rgba(0,0,0,0))']
                  } : {}}
                  transition={{
                    duration: 1.4,
                    repeat: isWinningCell ? Infinity : 0,
                    repeatType: 'reverse',
                    delay: seqIndex * 0.16,
                    ease: 'easeInOut'
                  }}
                >
                  {cell === 'X' ? (
                    <MarkerX themeId={themeId} glyphPreset={glyphPreset} />
                  ) : (
                    <MarkerO themeId={themeId} glyphPreset={glyphPreset} />
                  )}
                </motion.div>
              )}

              {/* Holographic hover forecast when hover over empty places */}
              {!disabled && cell === null && (
                <div className="opacity-0 hover:opacity-100 transition-opacity duration-150 absolute inset-0">
                  <MarkerPreview player={currentPlayer} themeId={themeId} glyphPreset={glyphPreset} />
                </div>
              )}

              {/* Tiny brutalist geometric grid labels or tech elements */}
              {themeId === 'brutalist' && (
                <span className="absolute top-1.5 left-2 text-[8px] font-mono text-stone-400 select-none">
                  {idx + 1}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
