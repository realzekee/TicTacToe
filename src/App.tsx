import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player, GameMode, Difficulty, BoardSize, ThemeId, GameStats, GlyphPresetId } from './types';
import { THEMES } from './utils/themes';
import { checkWinner, isBoardFull, getBestMove } from './utils/ai';
import { setMuteState, playWinSound, playDrawSound, playResetSound, playClickSound } from './utils/sound';
import { GLYPH_PRESETS } from './utils/glyphs';

// Components
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
import GameScoreBoard from './components/GameScoreBoard';
import ThemeSelector from './components/ThemeSelector';
import ParticleEffect from './components/ParticleEffect';
import GlyphSelector from './components/GlyphSelector';
import MoveHistory from './components/MoveHistory';

// Icons
import { Sparkles, Trophy, Cpu, Zap, Volume2, HelpCircle } from 'lucide-react';

const LOCAL_STORAGE_KEY_STATS = 'tictactoe_stats_3_4';
const LOCAL_STORAGE_KEY_SETTINGS = 'tictactoe_settings_3_4';

interface SavedSettings {
  themeId: ThemeId;
  gameMode: GameMode;
  difficulty: Difficulty;
  boardSize: BoardSize;
  isMuted: boolean;
  glyphId: GlyphPresetId;
}

const DEFAULT_STATS: GameStats = {
  xWins: 0,
  oWins: 0,
  draws: 0,
  currentStreak: 0,
  bestStreak: 0,
};

const DEFAULT_SETTINGS: SavedSettings = {
  themeId: 'slate',
  gameMode: 'ai',
  difficulty: 'unbeatable',
  boardSize: 3,
  isMuted: false,
  glyphId: 'classic',
};

export default function App() {
  // --- Game Settings & Configuration States ---
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_SETTINGS.themeId);
  const [gameMode, setGameMode] = useState<GameMode>(DEFAULT_SETTINGS.gameMode);
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_SETTINGS.difficulty);
  const [boardSize, setBoardSize] = useState<BoardSize>(DEFAULT_SETTINGS.boardSize);
  const [isMuted, setIsMuted] = useState<boolean>(DEFAULT_SETTINGS.isMuted);
  const [glyphId, setGlyphId] = useState<GlyphPresetId>(DEFAULT_SETTINGS.glyphId);

  // --- Core Gameplay States ---
  const [board, setBoard] = useState<(Player | null)[]>(() => Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null);
  const [winningPattern, setWinningPattern] = useState<number[] | null>(null);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [startingPlayer, setStartingPlayer] = useState<Player>('X');
  
  // Dynamic step-by-step game move timeline records
  interface MoveRecord {
    step: number;
    player: Player;
    cellIndex: number;
    label: string;
  }
  const [moves, setMoves] = useState<MoveRecord[]>([]);

  // --- Statistics & Streaks ---
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);

  // --- Load Initial Configurations from LocalStorage ---
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem(LOCAL_STORAGE_KEY_STATS);
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }

      const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
      if (savedSettings) {
        const parsed: SavedSettings = JSON.parse(savedSettings);
        setThemeId(parsed.themeId ?? 'slate');
        setGameMode(parsed.gameMode ?? 'ai');
        setDifficulty(parsed.difficulty ?? 'unbeatable');
        setBoardSize(parsed.boardSize ?? 3);
        setIsMuted(parsed.isMuted ?? false);
        setMuteState(parsed.isMuted ?? false);
        setGlyphId(parsed.glyphId ?? 'classic');

        // Adjust board length to match loaded specs
        const size = parsed.boardSize ?? 3;
        setBoard(Array(size * size).fill(null));
      }
    } catch (e) {
      console.error('Error loading config from localStorage:', e);
    }
  }, []);

  // --- Save Configurations to LocalStorage ---
  const saveSettings = useCallback((updates: Partial<SavedSettings>) => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
      const current = saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
      const updated = { ...current, ...updates };
      localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, []);

  // Handle Board Size Modifications
  const handleBoardSizeChange = (size: BoardSize) => {
    setBoardSize(size);
    saveSettings({ boardSize: size });
    resetGame(size, currentPlayer);
  };

  // Handle Game Mode Modifications
  const handleGameModeChange = (mode: GameMode) => {
    setGameMode(mode);
    saveSettings({ gameMode: mode });
    resetGame(boardSize, 'X');
  };

  // Handle Difficulty Level Changes
  const handleDifficultyChange = (diff: Difficulty) => {
    setDifficulty(diff);
    saveSettings({ difficulty: diff });
    resetGame(boardSize, 'X');
  };

  // Handle Theme Preference Changes
  const handleThemeChange = (id: ThemeId) => {
    setThemeId(id);
    saveSettings({ themeId: id });
  };

  // Handle Marker Glyph Changes
  const handleGlyphChange = (id: GlyphPresetId) => {
    setGlyphId(id);
    saveSettings({ glyphId: id });
  };

  // Handle Volume Muting
  const handleMutedToggle = (muted: boolean) => {
    setIsMuted(muted);
    setMuteState(muted);
    saveSettings({ isMuted: muted });
  };

  // --- Clear / Reset Game positions ---
  const resetGame = (sizeValue: BoardSize = boardSize, firstPlayer: Player = startingPlayer) => {
    setBoard(Array(sizeValue * sizeValue).fill(null));
    setCurrentPlayer(firstPlayer);
    setWinner(null);
    setWinningPattern(null);
    setIsThinking(false);
    setMoves([]); // Clear step timeline on new rounds
  };

  // Standard interactive sweep when resetting
  const triggerBoardCleanReset = () => {
    playResetSound();
    // Toggle who starts first occasionally to alternate play advantages
    const nextStart = startingPlayer === 'X' ? 'O' : 'X';
    setStartingPlayer(nextStart);
    resetGame(boardSize, nextStart);
  };

  // --- Reset Entire Scoreboard Memory ---
  const handleResetStatistics = () => {
    playResetSound();
    if (window.confirm('Do you want to clear your global score and streak statistics?')) {
      setStats(DEFAULT_STATS);
      localStorage.setItem(LOCAL_STORAGE_KEY_STATS, JSON.stringify(DEFAULT_STATS));
    }
  };

  // --- Core Game Checking Utilities ---
  const registerGameOutcome = useCallback((result: Player | 'Draw', pattern: number[] | null) => {
    setWinner(result);
    setWinningPattern(pattern);

    // Audio cues
    if (result === 'Draw') {
      playDrawSound();
    } else {
      playWinSound();
    }

    setStats((prev) => {
      let xWins = prev.xWins;
      let oWins = prev.oWins;
      let draws = prev.draws;
      let currentStreak = prev.currentStreak;

      if (result === 'X') {
        xWins += 1;
        // In AI mode, winning increments human streaks. 
        // In local mode, X player victory increments streak.
        currentStreak += 1;
      } else if (result === 'O') {
        oWins += 1;
        // CPU win or Player O win terminates the streak
        currentStreak = 0;
      } else {
        draws += 1;
        // Draws maintain but do not increase streak
      }

      const bestStreak = Math.max(prev.bestStreak, currentStreak);
      const newStats = { xWins, oWins, draws, currentStreak, bestStreak };

      // Save immediately
      localStorage.setItem(LOCAL_STORAGE_KEY_STATS, JSON.stringify(newStats));
      return newStats;
    });
  }, []);

  // Make user placement
  const placeMarker = useCallback((idx: number) => {
    if (board[idx] !== null || winner !== null || isThinking) return;

    const updatedBoard = [...board];
    updatedBoard[idx] = currentPlayer;
    setBoard(updatedBoard);

    // Log move step
    setMoves(prev => [
      ...prev,
      {
        step: prev.length + 1,
        player: currentPlayer,
        cellIndex: idx,
        label: currentPlayer,
      },
    ]);

    // Win analysis
    const resultCheck = checkWinner(updatedBoard, boardSize);
    if (resultCheck.winner) {
      registerGameOutcome(resultCheck.winner, resultCheck.pattern);
      return;
    }

    if (isBoardFull(updatedBoard)) {
      registerGameOutcome('Draw', null);
      return;
    }

    // Pass turn
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  }, [board, boardSize, currentPlayer, winner, isThinking, registerGameOutcome, moves]);

  // --- AI Automated Move Execution Loop ---
  useEffect(() => {
    if (gameMode !== 'ai' || currentPlayer !== 'O' || winner !== null || isThinking) return;

    setIsThinking(true);

    // Instantly compute and place the AI response
    const thinkingLag = 0;

    const timer = setTimeout(() => {
      const aiMove = getBestMove(board, 'O', difficulty, boardSize);
      if (aiMove !== -1) {
        const updatedBoard = [...board];
        updatedBoard[aiMove] = 'O';
        setBoard(updatedBoard);
        playClickSound('O');

        // Log AI move step
        setMoves(prev => [
          ...prev,
          {
            step: prev.length + 1,
            player: 'O',
            cellIndex: aiMove,
            label: 'O',
          },
        ]);

        const resultCheck = checkWinner(updatedBoard, boardSize);
        if (resultCheck.winner) {
          registerGameOutcome(resultCheck.winner, resultCheck.pattern);
        } else if (isBoardFull(updatedBoard)) {
          registerGameOutcome('Draw', null);
        } else {
          setCurrentPlayer('X');
        }
      }
      setIsThinking(false);
    }, thinkingLag);

    return () => clearTimeout(timer);
  }, [board, boardSize, gameMode, currentPlayer, winner, difficulty, isThinking, registerGameOutcome, moves]);

  const activeTheme = THEMES[themeId];

  // Helper labels for active state
  const isUserTurn = gameMode === 'ai' && currentPlayer === 'X' && !winner;
  const isComputerTurn = gameMode === 'ai' && currentPlayer === 'O' && !winner;

  let turnMessage = '';
  if (winner) {
    if (winner === 'Draw') {
      turnMessage = "It's a complete stalemate!";
    } else {
      turnMessage = gameMode === 'ai' 
        ? (winner === 'X' ? 'Victory is Yours!' : 'CPU Outsmarted You!')
        : `Player ${winner} Claims Victory!`;
    }
  } else if (isComputerTurn) {
    turnMessage = 'CPU is computing...';
  } else if (isUserTurn) {
    turnMessage = 'Your Turn (X)';
  } else {
    turnMessage = `Player ${currentPlayer}'s Turn`;
  }

  return (
    <div className={`min-h-screen py-8 px-4 flex flex-col justify-center items-center overflow-x-hidden ${activeTheme.bodyBg}`}>
      
      {/* Celebration Explosions */}
      <ParticleEffect winner={winner} themeId={themeId} />

      {/* Main Responsive Outer Grid */}
      <div className="w-full max-w-[960px] flex flex-col gap-6 md:gap-8 grow justify-center">
        
        {/* Row 1: App Header */}
        <header className="flex flex-col items-center text-center gap-2 select-none">
          <div className="flex items-center gap-2">
            {themeId === 'synthwave' ? (
              <Sparkles className="w-6 h-6 text-pink-500 animate-pulse" />
            ) : themeId === 'slate' ? (
              <Zap className="w-6 h-6 text-emerald-400" />
            ) : gameMode === 'ai' ? (
              <Cpu className="w-6 h-6 opacity-70" />
            ) : (
              <Trophy className="w-6 h-6 text-yellow-500" />
            )}
            <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight md:tracking-tighter ${activeTheme.textColor} ${activeTheme.fontFamily}`}>
              {themeId === 'brutalist' ? 'TIC-TAC-TOE.' : 'Tic Tac Toe'}
            </h1>
          </div>
          <p className={`text-xs max-w-sm font-medium ${activeTheme.mutedTextColor} ${activeTheme.fontFamily} tracking-wide`}>
            {boardSize === 3 
              ? 'Classic 3x3 layout. Form a line of 3 to claim victory.'
              : boardSize === 4
              ? 'Advanced 4x4 layout. Form a continuous line of 4.'
              : 'Supreme 5x5 layout. Form a continuous line of 5.'}
          </p>
        </header>

        {/* Row 2: Interactive Main Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left/Upper Panel: Status and Board (Takes 7 Cols on desktop) */}
          <div className="md:col-span-7 flex flex-col gap-4">
            
            {/* Status indicators */}
            <div className={`flex items-center justify-between px-5 py-3 rounded-xl border ${
              themeId === 'brutalist' 
                ? 'border-4 border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)]' 
                : 'bg-stone-500/5 border-stone-500/10'
            }`}>
              <div className="flex items-center gap-2.5">
                {isComputerTurn && (
                  <div className="flex space-x-1 items-center">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></span>
                  </div>
                )}
                <span className={`text-sm font-bold tracking-wide uppercase ${activeTheme.textColor} ${activeTheme.fontFamily}`}>
                  {turnMessage}
                </span>
              </div>

              {/* Board metadata size tag */}
              <span className="text-[10px] font-mono font-bold opacity-70 px-2.5 py-1 rounded bg-stone-500/10 tracking-widest uppercase">
                {boardSize}x{boardSize}
              </span>
            </div>

            {/* Core Action Grid */}
            <GameBoard
              board={board}
              currentPlayer={currentPlayer}
              onCellClick={placeMarker}
              winningPattern={winningPattern}
              boardSize={boardSize}
              themeId={themeId}
              glyphPreset={GLYPH_PRESETS[glyphId]}
              disabled={winner !== null || isThinking}
            />

            {/* Turn status feedback context */}
            <AnimatePresence mode="wait">
              {winner && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex flex-col items-center gap-3 p-4 text-center rounded-xl ${
                    themeId === 'brutalist'
                      ? 'bg-[#ffff00] border-4 border-black text-black shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                      : themeId === 'synthwave'
                      ? 'bg-gradient-to-r from-pink-500/20 to-cyan-500/20 border border-pink-500'
                      : themeId === 'cyberpunk'
                      ? 'bg-gradient-to-r from-[#fcee0a]/10 to-[#00f0ff]/10 border border-[#fcee0a]'
                      : themeId === 'sakura'
                      ? 'bg-pink-100/50 border border-pink-200'
                      : 'bg-emerald-500/10 border border-emerald-500/25'
                  }`}
                >
                  <p className={`text-sm font-semibold uppercase tracking-wider ${themeId === 'brutalist' ? 'text-black' : activeTheme.textColor}`}>
                    {winner === 'Draw' 
                      ? "A duel of equal minds!" 
                      : winner === 'X' 
                        ? (gameMode === 'ai' ? 'Marvelous victory!' : 'Player X wins the round!')
                        : (gameMode === 'ai' ? 'AI claimed victory. Try again!' : 'Player O wins the round!')
                    }
                  </p>
                  <button
                    id="endgame-reset-btn"
                    onClick={triggerBoardCleanReset}
                    className={`py-1.5 px-4 text-xs font-bold cursor-pointer transition-all uppercase tracking-wider select-none ${
                      themeId === 'brutalist'
                        ? 'rounded-none bg-white border-2 border-black font-extrabold shadow-[2px_2px_0px_#000000]'
                        : themeId === 'cyberpunk'
                        ? 'rounded-none bg-[#121216] text-[#fcee0a] border border-[#fcee0a] hover:bg-[#fcee0a] hover:text-black font-bold'
                        : themeId === 'synthwave'
                        ? 'rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500'
                        : themeId === 'sakura'
                        ? 'rounded-full bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'
                        : themeId === 'nordic'
                        ? 'rounded-xl bg-[#cc6655]/20 hover:bg-[#cc6655]/30 text-[#cc6655] border border-[#cc6655]/30'
                        : 'rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    Play Another Round
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right/Lower Panel: Stats and Controls (Takes 5 Cols on desktop) */}
          <div className="md:col-span-5 flex flex-col gap-5">
            {/* Score Stats Tracker */}
            <GameScoreBoard
              stats={stats}
              themeId={themeId}
              isMuted={isMuted}
              onToggleMute={handleMutedToggle}
              onResetStats={handleResetStatistics}
              gameMode={gameMode}
            />

            {/* Mode & Dims Settings Panel */}
            <GameControls
              gameMode={gameMode}
              difficulty={difficulty}
              boardSize={boardSize}
              themeId={themeId}
              onGameModeChange={handleGameModeChange}
              onDifficultyChange={handleDifficultyChange}
              onBoardSizeChange={handleBoardSizeChange}
              onResetBoard={triggerBoardCleanReset}
            />

            {/* Marker Character Customizer */}
            <GlyphSelector
              currentGlyphId={glyphId}
              onGlyphChange={handleGlyphChange}
              themeId={themeId}
            />

            {/* Step Timeline Moves Tracker */}
            <MoveHistory
              moves={moves}
              themeId={themeId}
              glyphPreset={GLYPH_PRESETS[glyphId]}
              boardSize={boardSize}
            />

            {/* Palette Style Selector */}
            <ThemeSelector
              currentThemeId={themeId}
              onThemeChange={handleThemeChange}
            />

            {/* Humble instructions / manual toggle detail */}
            <footer className="text-center md:text-left mt-1 select-none">
              <span className={`text-[10px] uppercase font-mono tracking-widest flex items-center justify-center md:justify-start gap-1 ${activeTheme.mutedTextColor}`}>
                <HelpCircle className="w-3 h-3" /> Tip: Sound is synthesized in real time!
              </span>
            </footer>
          </div>

        </div>

      </div>
    </div>
  );
}
