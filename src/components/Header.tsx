import React from 'react';
import { Volume2, VolumeX, RefreshCw } from 'lucide-react';

interface HeaderProps {
    isSoundEnabled: boolean;
    toggleSound: () => void;
    initializeGame: () => void;
}

const Header: React.FC<HeaderProps> = ({ isSoundEnabled, toggleSound, initializeGame }) => {
    return (
        <div className="bg-teal-600 text-white p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Memory Card Game</h1>
            <div className="flex items-center gap-2">
                <button 
                    onClick={toggleSound}
                    className="flex items-center gap-2 bg-white text-teal-600 px-4 py-2 rounded-lg font-medium hover:bg-teal-100 transition-colors mr-2"
                    title={isSoundEnabled ? "Turn sound off" : "Turn sound on"}
                >
                    {isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
                <button 
                    onClick={initializeGame}
                    className="flex items-center gap-2 bg-white text-teal-600 px-4 py-2 rounded-lg font-medium hover:bg-teal-100 transition-colors"
                >
                    <RefreshCw size={18} />
                    Restart
                </button>
            </div>
        </div>
    );
};

export default Header;
