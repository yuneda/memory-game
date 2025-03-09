import React from 'react';

interface CompletionMessageProps {
    timer: number;
    moves: number;
    allCardsMatched: boolean;
}

const CompletionMessage: React.FC<CompletionMessageProps> = ({ timer, moves, allCardsMatched }) => {
    if (!allCardsMatched) return null;

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-orange-100 p-4 text-center text-orange-800 font-semibold">
            Congratulations! You completed the game in {formatTime(timer)} with {moves} moves.
        </div>
    );
};

export default CompletionMessage; 
