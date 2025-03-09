import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../types';

interface GameBoardProps {
    cards: Card[];
    handleCardClick: (clickedCard: Card) => void;
    getGridColumnsClass: (size: '4x4' | '6x6') => string;
    boardSize: '4x4' | '6x6';
}

const GameBoard: React.FC<GameBoardProps> = ({ cards, handleCardClick, getGridColumnsClass, boardSize }) => {
    return (
        <div className="p-4 md:p-8">
            <div className={`grid ${getGridColumnsClass(boardSize)} gap-2 md:gap-4 max-w-[400px] mx-auto`}>
                {cards.map(card => (
                    <motion.div
                        key={card.id}
                        className="aspect-square cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCardClick(card)}
                    >
                        <div 
                            className={`w-full h-full rounded-lg flex items-center justify-center text-2xl md:text-4xl font-bold transition-all duration-500 ${
                                card.isFlipped || card.isMatched 
                                    ? 'bg-white border-2 border-teal-300 shadow-md' 
                                    : 'bg-teal-600 text-white shadow-lg'
                            }`}
                        >
                            {card.isFlipped || card.isMatched ? card.value : '?'}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default GameBoard; 
