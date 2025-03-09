/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Timer, RefreshCw, Grid2X2, Grid3X3, Volume2, VolumeX } from 'lucide-react';

// Define the card interface
interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// Define board size type
type BoardSize = '4x4' | '6x6';

function App() {
  // Game state
  const [cards, setCards] = useState<Card[]>([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [firstSelection, setFirstSelection] = useState<Card | null>(null);
  const [secondSelection, setSecondSelection] = useState<Card | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [boardSize, setBoardSize] = useState<BoardSize>('4x4');
  // Add sound enabled state - default to false
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('isSoundEnabled');
    return saved ? JSON.parse(saved) : false;
  });

  // Audio refs
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const matchSoundRef = useRef<HTMLAudioElement | null>(null);

  // Card emojis for matching
  const allCardEmojis = [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮',
    '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦉', '🦇', '🐺', '🐗', '🐴',
    '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🦂', '🦕'
  ];

  // Initialize the game
  useEffect(() => {
    initializeGame();
    
    // Create audio elements
    clickSoundRef.current = new Audio('/click.mp3');
    matchSoundRef.current = new Audio('/match.mp3');
    
    // Preload sounds
    if (clickSoundRef.current) clickSoundRef.current.load();
    if (matchSoundRef.current) matchSoundRef.current.load();
    
    // Create audio files if they don't exist
    createAudioFiles();
    
    return () => {
      // Clean up audio elements
      if (clickSoundRef.current) clickSoundRef.current = null;
      if (matchSoundRef.current) matchSoundRef.current = null;
    };
  }, []);

  // Create audio files if they don't exist
  const createAudioFiles = async () => {
    try {
      // Check if click.mp3 exists
      const clickResponse = await fetch('/click.mp3', { method: 'HEAD' });
      if (clickResponse.status === 404) {
        // Create a simple click sound using Web Audio API
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const clickOscillator = audioContext.createOscillator();
        const clickGain = audioContext.createGain();
        
        clickOscillator.type = 'sine';
        clickOscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        clickGain.gain.setValueAtTime(0.5, audioContext.currentTime);
        clickGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        clickOscillator.connect(clickGain);
        clickGain.connect(audioContext.destination);
        
        clickOscillator.start();
        clickOscillator.stop(audioContext.currentTime + 0.1);
        
        // Save the audio as a blob
        const clickBlob = await audioToBlob(audioContext, 0.1);
        clickSoundRef.current = new Audio(URL.createObjectURL(clickBlob));
      }
      
      // Check if match.mp3 exists
      const matchResponse = await fetch('/match.mp3', { method: 'HEAD' });
      if (matchResponse.status === 404) {
        // Create a simple match sound using Web Audio API
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const matchOscillator = audioContext.createOscillator();
        const matchGain = audioContext.createGain();
        
        matchOscillator.type = 'sine';
        matchOscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        matchOscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.1);
        matchGain.gain.setValueAtTime(0.5, audioContext.currentTime);
        matchGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        matchOscillator.connect(matchGain);
        matchGain.connect(audioContext.destination);
        
        matchOscillator.start();
        matchOscillator.stop(audioContext.currentTime + 0.3);
        
        // Save the audio as a blob
        const matchBlob = await audioToBlob(audioContext, 0.3);
        matchSoundRef.current = new Audio(URL.createObjectURL(matchBlob));
      }
    } catch (error) {
      console.error('Error creating audio files:', error);
    }
  };

  // Helper function to convert audio to blob
  const audioToBlob = (audioContext: AudioContext, duration: number): Promise<Blob> => {
    return new Promise((resolve) => {
      const recorder = new MediaRecorder(audioContext.createMediaStreamDestination().stream);
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'audio/mp3' }));
      
      recorder.start();
      setTimeout(() => recorder.stop(), duration * 1000);
    });
  };

  // Save sound preference when it changes
  useEffect(() => {
    localStorage.setItem('isSoundEnabled', JSON.stringify(isSoundEnabled));
  }, [isSoundEnabled]);

  // Play click sound
  const playClickSound = () => {
    if (isSoundEnabled && clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play().catch(err => console.error('Error playing click sound:', err));
    }
  };

  // Play match sound
  const playMatchSound = () => {
    if (isSoundEnabled && matchSoundRef.current) {
      matchSoundRef.current.currentTime = 0;
      matchSoundRef.current.play().catch(err => console.error('Error playing match sound:', err));
    }
  };

  // Toggle sound
  const toggleSound = () => setIsSoundEnabled((prev: boolean) => !prev);

  // Timer effect
  useEffect(() => {
    let interval: number | undefined;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // Check for game completion
  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
      setIsPlaying(false);
    }
  }, [cards]);

  // Check selected cards for a match
  useEffect(() => {
    if (firstSelection && secondSelection) {
      setIsChecking(true);
      
      // Check if the cards match
      if (firstSelection.value === secondSelection.value) {
        // Play match sound
        playMatchSound();
        
        setCards(prevCards => 
          prevCards.map(card => 
            card.id === firstSelection.id || card.id === secondSelection.id
              ? { ...card, isMatched: true }
              : card
          )
        );
        resetSelections();
      } else {
        // If they don't match, flip them back after a delay
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(card => 
              card.id === firstSelection.id || card.id === secondSelection.id
                ? { ...card, isFlipped: false }
                : card
            )
          );
          resetSelections();
        }, 1000);
      }
    }
  }, [firstSelection, secondSelection]);

  // Get the number of pairs based on board size
  const getNumberOfPairs = (size: BoardSize): number => {
    switch (size) {
      case '4x4': return 8;   // 16 cards = 8 pairs
      case '6x6': return 18;  // 36 cards = 18 pairs
      default: return 8;
    }
  };

  // Get grid columns class based on board size
  const getGridColumnsClass = (size: BoardSize): string => {
    switch (size) {
      case '4x4': return 'grid-cols-4';
      case '6x6': return 'grid-cols-6';
      default: return 'grid-cols-4';
    }
  };

  // Initialize the game with shuffled cards
  const initializeGame = () => {
    const numberOfPairs = getNumberOfPairs(boardSize);
    const selectedEmojis = allCardEmojis.slice(0, numberOfPairs);
    
    // Create pairs of cards with the same value
    let cardPairs = [...selectedEmojis, ...selectedEmojis]
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
      }));
    
    // Shuffle the cards
    cardPairs = cardPairs.sort(() => Math.random() - 0.5);
    
    setCards(cardPairs);
    setMoves(0);
    setTimer(0);
    setIsPlaying(false);
    setFirstSelection(null);
    setSecondSelection(null);
    setIsChecking(false);
  };

  // Change board size
  const changeBoardSize = (size: BoardSize) => {
    setBoardSize(size);
  };

  useEffect(() => {
    initializeGame();
  }, [boardSize]);

  // Reset card selections
  const resetSelections = () => {
    setFirstSelection(null);
    setSecondSelection(null);
    setIsChecking(false);
  };

  // Handle card click
  const handleCardClick = (clickedCard: Card) => {
    // Play click sound
    playClickSound();
    
    // Ignore clicks if already checking cards or card is already flipped/matched
    if (
      isChecking || 
      clickedCard.isFlipped || 
      clickedCard.isMatched ||
      (firstSelection && secondSelection)
    ) {
      return;
    }

    // Start the game on first card click
    if (!isPlaying) {
      setIsPlaying(true);
    }

    // Flip the card
    setCards(prevCards => 
      prevCards.map(card => 
        card.id === clickedCard.id
          ? { ...card, isFlipped: true }
          : card
      )
    );

    // Handle card selection
    if (!firstSelection) {
      setFirstSelection(clickedCard);
    } else {
      setSecondSelection(clickedCard);
      setMoves(prevMoves => prevMoves + 1);
    }
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-orange-600 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Game header */}
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
        
        {/* Game stats and board size selector */}
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
                    : 'bg-white text-teal-600 hover:bg-teal-100'
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
        
        {/* Game board */}
        <div className="p-4 md:p-8">
          <div className={`grid ${getGridColumnsClass(boardSize)} gap-2 md:gap-4 max-w-[450px] mx-auto`}>
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
        
        {/* Game completion message */}
        {cards.length > 0 && cards.every(card => card.isMatched) && (
          <div className="bg-orange-100 p-4 text-center text-orange-800 font-semibold">
            Congratulations! You completed the game in {formatTime(timer)} with {moves} moves.
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
