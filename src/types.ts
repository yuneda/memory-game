export interface Card {
    id: number;
    value: string;
    isFlipped: boolean;
    isMatched: boolean;
} 
export type BoardSize = '4x4' | '6x6';