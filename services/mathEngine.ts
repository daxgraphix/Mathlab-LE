

import { CampaignOp, MathQuestion, TimerMode, ArcadeMode, VisualShape, VisualShapeType } from '../types';

const VISUAL_COLORS = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];

const TAILWIND_COLOR_TO_HEX: { [key: string]: string } = {
    'bg-red-500': '#ef4444',
    'bg-blue-500': '#3b82f6',
    'bg-green-500': '#22c55e',
    'bg-yellow-500': '#eab308',
    'bg-purple-500': '#a855f7',
    'bg-pink-500': '#ec4899',
    'bg-indigo-500': '#6366f1',
    'bg-teal-500': '#14b8a6',
};

// Kid-friendly difficulty tiers (1-10)
const DIFFICULTY_TIERS = {
    // Easy: single digit operations
    1: { addMax: 5, subMax: 5, mulMax: 3, divMax: 3, visualMax: 5 },
    2: { addMax: 7, subMax: 7, mulMax: 5, divMax: 5, visualMax: 7 },
    3: { addMax: 9, subMax: 9, mulMax: 5, divMax: 5, visualMax: 9 },
    // Medium: double digit operations
    4: { addMax: 15, subMax: 15, mulMax: 7, divMax: 7, visualMax: 12 },
    5: { addMax: 20, subMax: 20, mulMax: 9, divMax: 9, visualMax: 15 },
    6: { addMax: 30, subMax: 30, mulMax: 10, divMax: 10, visualMax: 18 },
    // Hard: larger numbers
    7: { addMax: 50, subMax: 50, mulMax: 12, divMax: 12, visualMax: 22 },
    8: { addMax: 75, subMax: 75, mulMax: 15, divMax: 15, visualMax: 25 },
    9: { addMax: 100, subMax: 100, mulMax: 15, divMax: 15, visualMax: 30 },
    10: { addMax: 150, subMax: 150, mulMax: 20, divMax: 20, visualMax: 35 },
};

export interface AdaptiveState {
    difficulty: number; // 1-10
    avgResponseTime: number; // ms
    recentAccuracy: number; // 0-1
    streak: number;
    totalCorrect: number;
    totalQuestions: number;
}

export const MathEngine = {
    // Generate question based on adaptive difficulty
    generateAdaptive: (state: AdaptiveState, op: CampaignOp): MathQuestion => {
        const tier = DIFFICULTY_TIERS[state.difficulty as keyof typeof DIFFICULTY_TIERS] || DIFFICULTY_TIERS[1];
        return MathEngine.generateFromTier(tier, op, state.difficulty);
    },

    // Generate from specific tier
    generateFromTier: (tier: typeof DIFFICULTY_TIERS[1], op: CampaignOp, level: number): MathQuestion => {
        let n1: number, n2: number, operator: string = '+', answer: number;
        const isVisual = op === CampaignOp.VISUAL_DOTS || op === CampaignOp.VISUAL_TRIANGLES || op === CampaignOp.VISUAL_STARS;

        if (isVisual) {
            const shapeType: VisualShapeType =
                op === CampaignOp.VISUAL_DOTS ? VisualShapeType.DOT :
                op === CampaignOp.VISUAL_TRIANGLES ? VisualShapeType.TRIANGLE :
                VisualShapeType.STAR;
            
            const numShapes = Math.floor(Math.random() * (tier.visualMax - 3)) + 3;
            const shapes: VisualShape[] = [];
            
            for (let i = 0; i < numShapes; i++) {
                shapes.push({
                    id: crypto.randomUUID(),
                    type: shapeType,
                    color: VISUAL_COLORS[Math.floor(Math.random() * VISUAL_COLORS.length)],
                    x: Math.floor(Math.random() * 85) + 7.5,
                    y: Math.floor(Math.random() * 85) + 7.5,
                    size: Math.floor(Math.random() * 5) + 10,
                    rotation: shapeType === VisualShapeType.TRIANGLE ? Math.floor(Math.random() * 360) : undefined,
                });
            }
            
            const questionText = `How many ${shapeType === VisualShapeType.DOT ? 'dots' : shapeType === VisualShapeType.TRIANGLE ? 'triangles' : 'stars'} do you see?`;
            return {
                text: questionText,
                answer: numShapes,
                visualQuestion: {
                    type: shapeType === VisualShapeType.DOT ? 'dots' : shapeType === VisualShapeType.TRIANGLE ? 'triangles' : 'stars',
                    shapes,
                    text: questionText,
                }
            };
        }

        switch (op) {
            case CampaignOp.ADD:
                n1 = Math.floor(Math.random() * tier.addMax) + 1;
                n2 = Math.floor(Math.random() * tier.addMax) + 1;
                answer = n1 + n2;
                operator = '+';
                break;
            case CampaignOp.SUB:
                n1 = Math.floor(Math.random() * tier.subMax) + tier.subMax;
                n2 = Math.floor(Math.random() * Math.min(n1 - 1, tier.subMax)) + 1;
                answer = n1 - n2;
                operator = '-';
                break;
            case CampaignOp.MUL:
                n1 = Math.floor(Math.random() * tier.mulMax) + 1;
                n2 = Math.floor(Math.random() * tier.mulMax) + 1;
                answer = n1 * n2;
                operator = '×';
                break;
            case CampaignOp.DIV:
                n2 = Math.floor(Math.random() * tier.divMax) + 1;
                answer = Math.floor(Math.random() * tier.divMax) + 1;
                n1 = n2 * answer;
                operator = '÷';
                break;
            case CampaignOp.NUMBER_BONDS: {
                // Number Bonds: Find the missing number to make 10, 20, etc.
                const bondTargets = [5, 10, 20, 50, 100];
                const target = bondTargets[Math.min(Math.floor(level / 3), bondTargets.length - 1)];
                n1 = Math.floor(Math.random() * (target - 1)) + 1; // 1 to target-1
                const missingPosition = Math.random() > 0.5; // Randomly hide first or second number
                if (missingPosition) {
                    answer = target - n1;
                    return { text: `? + ${n1} = ${target}`, answer };
                } else {
                    answer = target - n1;
                    return { text: `${n1} + ? = ${target}`, answer };
                }
            }
            case CampaignOp.GREATER_LESS: {
                // Compare Numbers: Which is bigger/smaller?
                // Fun format without confusing notation: "Which is bigger? 7 or 5?"
                const maxNum = tier.addMax * 2;
                n1 = Math.floor(Math.random() * maxNum) + 1;
                n2 = Math.floor(Math.random() * maxNum) + 1;
                
                // Make sure they're different
                while (n1 === n2) {
                    n2 = Math.floor(Math.random() * maxNum) + 1;
                }
                
                // Choose question type: greater or less
                const isGreater = Math.random() > 0.5;
                
                if (isGreater) {
                    answer = n1 > n2 ? 1 : 0;
                    return { 
                        text: n1 > n2 ? `Which is BIGGER? ${n1} or ${n2}? (1=${n1})` : `Which is BIGGER? ${n1} or ${n2}? (1=${n2})`, 
                        answer 
                    };
                } else {
                    answer = n1 < n2 ? 1 : 0;
                    return { 
                        text: n1 < n2 ? `Which is SMALLER? ${n1} or ${n2}? (1=${n1})` : `Which is SMALLER? ${n1} or ${n2}? (1=${n2})`, 
                        answer 
                    };
                }
            }
            case CampaignOp.MISSING_NUMBER: {
                // Missing Number: 5 + ? = 12
                const maxNum = tier.addMax;
                const operations = ['+', '-', '×'];
                const opIndex = Math.floor(Math.random() * operations.length);
                operator = operations[opIndex];
                
                if (operator === '+') {
                    n1 = Math.floor(Math.random() * maxNum) + 1;
                    n2 = Math.floor(Math.random() * maxNum) + 1;
                    answer = n1 + n2;
                    return { text: `${n1} + ? = ${answer}`, answer: n2 };
                } else if (operator === '-') {
                    n1 = Math.floor(Math.random() * maxNum) + maxNum;
                    n2 = Math.floor(Math.random() * n1);
                    answer = n1 - n2;
                    return { text: `${n1} - ? = ${answer}`, answer: n2 };
                } else {
                    n1 = Math.floor(Math.random() * 10) + 1;
                    n2 = Math.floor(Math.random() * 10) + 1;
                    answer = n1 * n2;
                    return { text: `${n1} × ? = ${answer}`, answer: n2 };
                }
            }
            default:
                n1 = Math.floor(Math.random() * 10) + 1;
                n2 = Math.floor(Math.random() * 10) + 1;
                answer = n1 + n2;
                operator = '+';
        }
        return { text: `${n1} ${operator} ${n2}`, answer };
    },

    // Update adaptive state based on performance
    updateAdaptiveState: (state: AdaptiveState, responseTime: number, isCorrect: boolean): AdaptiveState => {
        const newTotalQuestions = state.totalQuestions + 1;
        const newTotalCorrect = isCorrect ? state.totalCorrect + 1 : state.totalCorrect;
        const newStreak = isCorrect ? state.streak + 1 : 0;
        
        // Calculate new average response time (weighted towards recent)
        const newAvgTime = state.totalQuestions === 0 
            ? responseTime 
            : (state.avgResponseTime * 0.7) + (responseTime * 0.3);
        
        // Calculate recent accuracy (last 10 questions)
        const recentWindow = 10;
        // We'll track this via the streak - higher streak = better recent accuracy
        const recentAccuracy = Math.min(1, newStreak / 5); // Caps at 5 streak = 100%

        // Calculate new difficulty
        let newDifficulty = state.difficulty;
        
        // Speed thresholds (in seconds)
        const fastTime = 3;  // < 3 seconds = fast
        const slowTime = 8;  // > 8 seconds = slow
        
        if (isCorrect) {
            if (responseTime < fastTime * 1000 && recentAccuracy > 0.7) {
                // Doing great - increase difficulty
                newDifficulty = Math.min(10, state.difficulty + 1);
            } else if (responseTime > slowTime * 1000) {
                // Correct but slow - stay or slight increase
                newDifficulty = Math.max(1, state.difficulty - 0.5);
            }
        } else {
            // Wrong answer - decrease difficulty
            if (responseTime < fastTime * 1000) {
                // Too fast - random guess, decrease
                newDifficulty = Math.max(1, state.difficulty - 2);
            } else if (responseTime > slowTime * 1000) {
                // Slow and wrong - big decrease
                newDifficulty = Math.max(1, state.difficulty - 3);
            } else {
                newDifficulty = Math.max(1, state.difficulty - 1);
            }
        }

        // Smooth difficulty changes
        newDifficulty = Math.round(newDifficulty * 2) / 2; // Round to nearest 0.5

        return {
            difficulty: newDifficulty,
            avgResponseTime: newAvgTime,
            recentAccuracy,
            streak: newStreak,
            totalCorrect: newTotalCorrect,
            totalQuestions: newTotalQuestions,
        };
    },

    // Get difficulty label for UI
    getDifficultyLabel: (difficulty: number): string => {
        if (difficulty <= 2) return 'Super Easy';
        if (difficulty <= 4) return 'Easy';
        if (difficulty <= 6) return 'Medium';
        if (difficulty <= 8) return 'Hard';
        return 'Expert';
    },

    // Get difficulty color for UI
    getDifficultyColor: (difficulty: number): string => {
        if (difficulty <= 2) return 'text-green-400';
        if (difficulty <= 4) return 'text-blue-400';
        if (difficulty <= 6) return 'text-yellow-400';
        if (difficulty <= 8) return 'text-orange-400';
        return 'text-red-400';
    },

    // Original generate function for campaign mode (unchanged)
    generate: (level: number, op: CampaignOp): MathQuestion => {
        let n1: number, n2: number, operator: string = '+', answer: number;
        const tier = level <= 5 ? 1 : level <= 15 ? 2 : level <= 25 ? 3 : 4;
        const isThreeTerm = op === CampaignOp.ADD && tier > 1 && Math.random() > 0.7;

        if (op === CampaignOp.VISUAL_DOTS || op === CampaignOp.VISUAL_TRIANGLES || op === CampaignOp.VISUAL_STARS) {
            const shapeType: VisualShapeType =
                op === CampaignOp.VISUAL_DOTS ? VisualShapeType.DOT :
                op === CampaignOp.VISUAL_TRIANGLES ? VisualShapeType.TRIANGLE :
                VisualShapeType.STAR; // Default to 'star' for VISUAL_STARS
            let numShapes: number;

            if (level <= 5) numShapes = Math.floor(Math.random() * 5) + 3; // 3-7 shapes
            else if (level <= 15) numShapes = Math.floor(Math.random() * 7) + 6; // 6-12 shapes
            else if (level <= 25) numShapes = Math.floor(Math.random() * 8) + 10; // 10-17 shapes
            else numShapes = Math.floor(Math.random() * 10) + 15; // 15-24 shapes

            const shapes: VisualShape[] = [];
            for (let i = 0; i < numShapes; i++) {
                shapes.push({
                    id: crypto.randomUUID(), // Assign a unique ID
                    type: shapeType,
                    color: VISUAL_COLORS[Math.floor(Math.random() * VISUAL_COLORS.length)],
                    x: Math.floor(Math.random() * 85) + 7.5, // 7.5-92.5% to better spread out
                    y: Math.floor(Math.random() * 85) + 7.5, // 7.5-92.5%
                    size: Math.floor(Math.random() * 5) + 10, // Increased size range for better visibility (10-14)
                    rotation: shapeType === VisualShapeType.TRIANGLE ? Math.floor(Math.random() * 360) : undefined, // Only triangles get rotation
                });
            }
            const questionText = `How many ${shapeType === VisualShapeType.DOT ? 'dots' : shapeType === VisualShapeType.TRIANGLE ? 'triangles' : 'stars'} do you see?`;
            return {
                text: questionText,
                answer: numShapes,
                visualQuestion: {
                    type: shapeType === VisualShapeType.DOT ? 'dots' : shapeType === VisualShapeType.TRIANGLE ? 'triangles' : 'stars',
                    shapes,
                    text: questionText,
                }
            };
        }


        switch (op) {
            case CampaignOp.ADD:
                if (tier === 1) { // 1-9 + 1-9
                    n1 = Math.floor(Math.random() * 9) + 1;
                    n2 = Math.floor(Math.random() * 9) + 1;
                } else if (tier === 2) { // 10-50 + 2-20
                    n1 = Math.floor(Math.random() * 40) + 10;
                    n2 = Math.floor(Math.random() * 20) + 2;
                    if (isThreeTerm) {
                        const n3 = Math.floor(Math.random() * 10) + 1;
                        operator = '+';
                        answer = n1 + n2 + n3;
                        return { text: `${n1} + ${n2} + ${n3}`, answer };
                    }
                } else if (tier === 3) { // 20-99 + 20-99
                    n1 = Math.floor(Math.random() * 80) + 20;
                    n2 = Math.floor(Math.random() * 80) + 20;
                } else { // 100-500 + 100-500
                    n1 = Math.floor(Math.random() * 400) + 100;
                    n2 = Math.floor(Math.random() * 400) + 100;
                }
                answer = n1 + n2;
                operator = '+';
                break;
            case CampaignOp.SUB:
                if (tier === 1) { // Result 1-10
                    n1 = Math.floor(Math.random() * 9) + 2;
                    n2 = Math.floor(Math.random() * (n1 - 1)) + 1;
                } else if (tier === 2) { // 2 digit - 1 digit
                    n1 = Math.floor(Math.random() * 90) + 10;
                    n2 = Math.floor(Math.random() * 9) + 1;
                } else if (tier === 3) { // 2 digit - 2 digit
                    n1 = Math.floor(Math.random() * 80) + 20;
                    n2 = Math.floor(Math.random() * (n1 - 10)) + 5;
                } else { // 3 digit - 2/3 digit
                    n1 = Math.floor(Math.random() * 800) + 100;
                    n2 = Math.floor(Math.random() * (n1 - 50)) + 10;
                }
                answer = n1 - n2;
                operator = '-';
                break;
            case CampaignOp.MUL:
                if (tier === 1) { // 1-5 x 1-5
                    n1 = Math.floor(Math.random() * 5) + 1;
                    n2 = Math.floor(Math.random() * 5) + 1;
                } else if (tier === 2) { // 2-9 x 2-9
                    n1 = Math.floor(Math.random() * 8) + 2;
                    n2 = Math.floor(Math.random() * 8) + 2;
                } else if (tier === 3) { // 3-12 x 2-9
                    n1 = Math.floor(Math.random() * 10) + 3;
                    n2 = Math.floor(Math.random() * 8) + 2;
                } else { // 12-19 x 3-12 (Increased Challenge)
                    n1 = Math.floor(Math.random() * 8) + 12;
                    n2 = Math.floor(Math.random() * 10) + 3;
                }
                answer = n1 * n2;
                operator = '×';
                break;
            case CampaignOp.DIV:
                let d1: number, d2: number;
                if (tier === 1) {
                    d1 = Math.floor(Math.random() * 5) + 1;
                    d2 = Math.floor(Math.random() * 5) + 1;
                } else if (tier === 2) {
                    d1 = Math.floor(Math.random() * 8) + 2;
                    d2 = Math.floor(Math.random() * 8) + 2;
                } else if (tier === 3) {
                    d1 = Math.floor(Math.random() * 10) + 3;
                    d2 = Math.floor(Math.random() * 8) + 2;
                } else { // Increased Challenge
                    d1 = Math.floor(Math.random() * 9) + 12; // 12-20
                    d2 = Math.floor(Math.random() * 10) + 3; // 3-12
                }
                n1 = d1 * d2;
                n2 = d1;
                answer = d2;
                operator = '÷';
                break;
            case CampaignOp.NUMBER_BONDS: {
                // Number Bonds: Find the missing number to make a total (like 10, 20, etc.)
                // Fun kid-friendly format: "? + 5 = 10" or "7 + ? = 10"
                const bondTargets = level <= 5 ? [5, 10] : level <= 15 ? [10, 15, 20] : [20, 30, 50];
                const target = bondTargets[Math.floor(Math.random() * bondTargets.length)];
                
                // Generate two numbers that sum to target, hide one
                n1 = Math.floor(Math.random() * (target - 1)) + 1;
                answer = target - n1;
                
                // Randomly choose format: "? + X = Y" or "X + ? = Y"
                if (Math.random() > 0.5) {
                    return { text: `${answer} + ? = ${target}`, answer: n1 };
                } else {
                    return { text: `? + ${n1} = ${target}`, answer: answer };
                }
            }
            case CampaignOp.GREATER_LESS: {
                // Compare Numbers: Which is bigger/smaller?
                // Fun format without confusing notation: "Which is bigger? 7 or 5?"
                const maxNum = level <= 5 ? 10 : level <= 15 ? 50 : level <= 25 ? 100 : 500;
                n1 = Math.floor(Math.random() * maxNum) + 1;
                n2 = Math.floor(Math.random() * maxNum) + 1;
                
                // Make sure they're different
                while (n1 === n2) {
                    n2 = Math.floor(Math.random() * maxNum) + 1;
                }
                
                // Choose question type: greater or less
                const isGreater = Math.random() > 0.5;
                
                if (isGreater) {
                    answer = n1 > n2 ? 1 : 0;
                    return { 
                        text: n1 > n2 ? `Which is BIGGER? ${n1} or ${n2}? (1=${n1})` : `Which is BIGGER? ${n1} or ${n2}? (1=${n2})`, 
                        answer 
                    };
                } else {
                    answer = n1 < n2 ? 1 : 0;
                    return { 
                        text: n1 < n2 ? `Which is SMALLER? ${n1} or ${n2}? (1=${n1})` : `Which is SMALLER? ${n1} or ${n2}? (1=${n2})`, 
                        answer 
                    };
                }
            }
            case CampaignOp.MISSING_NUMBER: {
                // Missing Number: Find the hidden number in the equation
                // Fun format: "5 + ? = 12" or "12 - ? = 5"
                const maxNum = level <= 5 ? 10 : level <= 15 ? 20 : level <= 25 ? 50 : 100;
                const operations = ['+', '-', '×'];
                
                // Difficulty increases with level - more operations at higher levels
                const numOps = level <= 5 ? 1 : level <= 15 ? 2 : 3;
                
                // Choose operation based on level (multiplication at higher levels only)
                let opIndex = 0;
                if (level > 10 && Math.random() > 0.5) opIndex = 2; // multiplication at level 10+
                else if (level > 5 && Math.random() > 0.5) opIndex = 1; // subtraction at level 5+
                
                operator = operations[opIndex];
                
                if (operator === '+') {
                    // Easy: X + ? = Y (find second addend)
                    n1 = Math.floor(Math.random() * maxNum) + 1;
                    answer = Math.floor(Math.random() * maxNum) + 1;
                    const total = n1 + answer;
                    return { text: `${n1} + ? = ${total}`, answer };
                } else if (operator === '-') {
                    // X - ? = Y (find subtrahend)
                    n1 = Math.floor(Math.random() * maxNum) + maxNum;
                    answer = Math.floor(Math.random() * n1);
                    const result = n1 - answer;
                    return { text: `${n1} - ? = ${result}`, answer };
                } else {
                    // X × ? = Y (find factor)
                    n1 = Math.floor(Math.random() * 10) + 1;
                    answer = Math.floor(Math.random() * 10) + 1;
                    const product = n1 * answer;
                    return { text: `${n1} × ? = ${product}`, answer };
                }
            }
        }
        return { text: `${n1} ${operator} ${n2}`, answer };
    },

    generateArcade: (mode: ArcadeMode, score: number): MathQuestion => {
        const ops: CampaignOp[] = [
            CampaignOp.ADD, CampaignOp.SUB, CampaignOp.MUL, CampaignOp.DIV,
            CampaignOp.VISUAL_DOTS, CampaignOp.VISUAL_TRIANGLES, CampaignOp.VISUAL_STARS // Include new visual count ops
        ];
        // Progressive difficulty based on current score
        let level = 1;
        if (score > 30) level = 6;
        if (score > 80) level = 12;
        if (score > 150) level = 18;
        if (score > 250) level = 25;

        if (mode === ArcadeMode.FLASH) level = Math.min(20, level); // Flash mode caps difficulty slightly

        const op = ops[Math.floor(Math.random() * ops.length)];
        return MathEngine.generate(level, op);
    },

    getTimeLimit: (level: number, timerMode: TimerMode): number => {
        // Specific time modes - return exact time in seconds
        if (timerMode === TimerMode.TIME_30) return 30;
        if (timerMode === TimerMode.TIME_60) return 60;
        if (timerMode === TimerMode.TIME_90) return 90;
        if (timerMode === TimerMode.TIME_120) return 120;
        
        // Default fallback
        return 60;
    },

    getArcadeTier: (score: number) => {
        if (score >= 1000) return { name: 'Platinum', color: 'text-cyan-400' };
        if (score >= 500) return { name: 'Gold', color: 'text-yellow-400' };
        if (score >= 250) return { name: 'Silver', color: 'text-slate-300' };
        if (score >= 100) return { name: 'Bronze', color: 'text-amber-600' };
        return { name: 'Novice', color: 'text-slate-500' };
    },

    tailwindColorToHex: (tailwindColor: string): string => {
        return TAILWIND_COLOR_TO_HEX[tailwindColor] || '#ffffff'; // Default to white
    },

    // ============================================
    // COMPREHENSIVE QUESTION BANK SYSTEM
    // ============================================
    
    // Question pool storage
    questionPools: {
        campaign: {} as Record<number, MathQuestion[]>,
        arcade: [] as MathQuestion[],
        answeredQuestions: new Set<string>() as Set<string>,
    },
    
    // Fisher-Yates shuffle algorithm
    fisherYatesShuffle<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },
    
    // Generate unique question key for tracking
    getQuestionKey(q: MathQuestion): string {
        return `${q.text}-${q.answer}`;
    },
    
    // Initialize campaign question pool for a level (500+ questions per difficulty)
    initCampaignPool: (level: number, op: CampaignOp): MathQuestion[] => {
        const key = `${level}-${op}`;
        if (MathEngine.questionPools.campaign[key]) {
            return MathEngine.questionPools.campaign[key];
        }
        
        const pool: MathQuestion[] = [];
        const targetCount = 500; // 500 questions per difficulty level
        let attempts = 0;
        const maxAttempts = 10000;
        
        // Generate questions until we reach target
        while (pool.length < targetCount && attempts < maxAttempts) {
            attempts++;
            try {
                const q = MathEngine.generate(level, op);
                if (!q || q.answer === undefined) {
                    console.warn('Generated invalid question:', q);
                    continue;
                }
                const keyStr = MathEngine.getQuestionKey(q);
                
                // Use set to track unique questions (deduped)
                const uniqueKey = `campaign_${keyStr}`;
                if (!MathEngine.questionPools.answeredQuestions.has(uniqueKey)) {
                    pool.push(q);
                    MathEngine.questionPools.answeredQuestions.add(uniqueKey);
                }
            } catch (e) {
                console.error('Error generating question:', e);
            }
            
            // Safety: if we've generated too many unique questions, just add more
            if (pool.length < targetCount && MathEngine.questionPools.answeredQuestions.size > 10000) {
                // Reset tracking if we hit the limit
                MathEngine.questionPools.answeredQuestions.clear();
            }
        }
        
        if (pool.length === 0) {
            console.error('Failed to generate any questions for campaign:', level, op);
            // Fallback: generate at least some questions directly
            for (let i = 0; i < 20; i++) {
                pool.push(MathEngine.generate(level, op));
            }
        }
        
        // Shuffle the pool
        MathEngine.questionPools.campaign[key] = MathEngine.fisherYatesShuffle(pool);
        return MathEngine.questionPools.campaign[key];
    },
    
    // Initialize arcade question pool (1000+ questions)
    initArcadePool: (): MathQuestion[] => {
        if (MathEngine.questionPools.arcade.length > 0) {
            return MathEngine.questionPools.arcade;
        }
        
        const pool: MathQuestion[] = [];
        const targetCount = 1000; // 1000+ questions for arcade
        // Arcade mode: only numbers (ADD, SUB, MUL, DIV) and shapes (VISUAL_DOTS, VISUAL_TRIANGLES, VISUAL_STARS)
        const arcadeOps: CampaignOp[] = [
            CampaignOp.ADD, CampaignOp.SUB, CampaignOp.MUL, CampaignOp.DIV,
            CampaignOp.VISUAL_DOTS, CampaignOp.VISUAL_TRIANGLES, CampaignOp.VISUAL_STARS
        ];
        
        // Generate questions across all levels and operations
        for (let level = 1; level <= 30; level++) {
            for (const op of arcadeOps) {
                // Generate more questions at lower levels (easier)
                const questionsPerLevel = level <= 10 ? 50 : level <= 20 ? 30 : 20;
                
                for (let i = 0; i < questionsPerLevel && pool.length < targetCount * 1.5; i++) {
                    const q = MathEngine.generate(level, op);
                    const keyStr = MathEngine.getQuestionKey(q);
                    const uniqueKey = `arcade_${keyStr}`;
                    
                    if (!MathEngine.questionPools.answeredQuestions.has(uniqueKey)) {
                        pool.push(q);
                        MathEngine.questionPools.answeredQuestions.add(uniqueKey);
                    }
                }
            }
        }
        
        // Shuffle the pool
        MathEngine.questionPools.arcade = MathEngine.fisherYatesShuffle(pool);
        return MathEngine.questionPools.arcade;
    },
    
    // Get next question from campaign pool
    getNextCampaignQuestion: (level: number, op: CampaignOp): MathQuestion => {
        const pool = MathEngine.initCampaignPool(level, op);
        
        if (pool.length === 0) {
            // Regenerate if pool is empty
            MathEngine.questionPools.campaign[`${level}-${op}`] = [];
            return MathEngine.getNextCampaignQuestion(level, op);
        }
        
        return pool.pop()!;
    },
    
    // Get next question from arcade pool with progressive difficulty
    getNextArcadeQuestion: (score: number): MathQuestion => {
        // Ensure pool is initialized
        const pool = MathEngine.initArcadePool();
        
        if (pool.length === 0) {
            // Regenerate if pool is empty
            MathEngine.questionPools.arcade = [];
            return MathEngine.getNextArcadeQuestion(score);
        }
        
        // Pop a question from the pool (LIFO - last in, first out)
        // This ensures we use all questions without repetition within a session
        return pool.pop()!;
    },
    
    // Reset question banks (for new sessions)
    resetQuestionBanks: () => {
        MathEngine.questionPools.campaign = {};
        MathEngine.questionPools.arcade = [];
        // Keep answered questions to prevent repetition across sessions
    },
    
    // Get pool statistics
    getPoolStats: () => {
        const campaignCount = Object.values(MathEngine.questionPools.campaign).reduce(
            (sum, pool) => sum + pool.length, 0
        );
        return {
            campaignQuestions: campaignCount,
            arcadeQuestions: MathEngine.questionPools.arcade.length,
            answeredQuestions: MathEngine.questionPools.answeredQuestions.size,
        };
    },
};
