import React from 'react';
import { Timer, Grid2X2, Grid3X3 } from 'lucide-react';

interface GameStatsProps {
    timer: number;
    moves: number;
    boardSize: '4x4' | '6x6';
    changeBoardSize: (size: '4x4' | '6x6') => void;
}

const GameStats: React.FC<GameStatsProps> = ({ timer, moves, boardSize, changeBoardSize }) => {
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-teal-50 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
                <Timer size={20} className="text-teal-600" />
                <span className="font-mono text-xl font-semibold">{formatTime(timer)}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="font-semibold text-teal-800">Board Size:</span>
                <div className="flex gap-2">
                    <button 
                        onClick={() => changeBoardSize('4x4')}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-colors ${
                            boardSize === '4x4' 
                                ? 'bg-teal-600 text-white' 
                                : 'bg-white text-teal-600 hover:bg-teal-100'
                        }`}
                    >
                        <Grid2X2 size={16} />
                        4x4
                    </button>
                    <button 
                        onClick={() => changeBoardSize('6x6')}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-colors ${
                            boardSize === '6x6' 
                                ? 'bg-teal-600 text-white' 
                                : 'bg-white text-teal600 hover:bg-teal-100'
                        }`}
                    >
                        <Grid3X3 size={16} />
                        6x6
                    </button>
                </div>
            </div>
            <div className="font-semibold text-teal-800">
                Moves: <span className="font-mono text-xl">{moves}</span>
            </div>
        </div>
    );
};

export default GameStats;
