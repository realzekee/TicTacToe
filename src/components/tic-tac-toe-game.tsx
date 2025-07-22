"use client";

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RotateCcw, PartyPopper } from 'lucide-react';

type Player = 'X' | 'O';
type GamePhase = 'setup' | 'playing' | 'roundOver' | 'matchOver';

// Helper function to check for a winner
const calculateWinner = (squares: (Player | null)[]): Player | null => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

export default function TicTacToeGame() {
  const [board, setBoard] = useState<(Player | null)[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const [scores, setScores] = useState<{ X: number; O: number }>({ X: 0, O: 0 });
  const [winningScore, setWinningScore] = useState<number>(3);
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  
  const winner = useMemo(() => calculateWinner(board), [board]);
  const isDraw = useMemo(() => !winner && board.every(Boolean), [board, winner]);

  useEffect(() => {
    if (winner) {
      const newScores = { ...scores };
      newScores[winner]++;
      setScores(newScores);
      if (newScores[winner] >= winningScore) {
        setGamePhase('matchOver');
      } else {
        setGamePhase('roundOver');
      }
    } else if (isDraw) {
      setGamePhase('roundOver');
    }
  }, [winner, isDraw]);

  const handleClick = (i: number) => {
    if (gamePhase !== 'playing' || board[i]) {
      return;
    }
    const newBoard = board.slice();
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const handleStartGame = () => {
    setGamePhase('playing');
  };
  
  const handleNextRound = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setGamePhase('playing');
  };

  const handleResetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setScores({ X: 0, O: 0 });
    setGamePhase('setup');
  };

  const status = useMemo(() => {
    if (gamePhase === 'matchOver') {
      return `Player ${winner} wins the match! 🏆`;
    }
    if (winner) {
      return `Winner: ${winner}! 🎉`;
    }
    if (isDraw) {
      return "It's a Draw!";
    }
    return `Next Player: ${xIsNext ? 'X' : 'O'}`;
  }, [winner, isDraw, xIsNext, gamePhase]);

  if (gamePhase === 'setup') {
    return (
      <Card className="w-full max-w-md shadow-lg rounded-2xl bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-headline">Pastel Tac Toe</CardTitle>
          <CardDescription className="text-xl pt-2 font-body">Game Setup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="winning-score">Points to Win</Label>
            <Input 
              id="winning-score"
              type="number"
              value={winningScore}
              onChange={(e) => setWinningScore(Math.max(1, parseInt(e.target.value, 10) || 1))}
              min="1"
              className="text-center"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartGame} className="w-full rounded-lg" size="lg">
            Start Game
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-lg rounded-2xl bg-card">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-headline">Pastel Tac Toe</CardTitle>
        <div className="flex justify-around pt-2 text-lg">
            <span className="font-bold">Player X: {scores.X}</span>
            <span className="font-bold">Player O: {scores.O}</span>
        </div>
        <CardDescription className="text-xl pt-2 font-body h-7">{status}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 p-4 bg-primary/20 rounded-xl">
          {board.map((value, i) => (
            <Button
              key={i}
              variant="secondary"
              className="w-full aspect-square h-auto text-6xl font-bold rounded-lg shadow-inner bg-background hover:bg-accent/50"
              onClick={() => handleClick(i)}
              aria-label={`Square ${i + 1}, value: ${value || 'empty'}`}
              disabled={gamePhase !== 'playing'}
            >
              <span className="transition-transform duration-300 ease-in-out transform-gpu group-hover:scale-110">
                {value}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        {gamePhase === 'roundOver' && (
          <Button onClick={handleNextRound} className="w-full rounded-lg" size="lg">
            Next Round
          </Button>
        )}
        {gamePhase === 'matchOver' && (
          <Button onClick={handleResetGame} className="w-full rounded-lg bg-green-500 hover:bg-green-600" size="lg">
            <PartyPopper className="mr-2 h-5 w-5" />
            Play Again
          </Button>
        )}
        {gamePhase === 'playing' && (
           <Button onClick={handleResetGame} className="w-full rounded-lg" size="lg">
             <RotateCcw className="mr-2 h-5 w-5" />
             Reset Game
           </Button>
        )}
      </CardFooter>
    </Card>
  );
}
