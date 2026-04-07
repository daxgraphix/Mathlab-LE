

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Icons } from '../Icons';
import { SoundFunctions, CalculationHistoryEntry } from '../../types';
import { HistoryModal } from '../modals/HistoryModal';
import { useLanguage } from '../../context/LanguageContext';

interface CalculatorProps {
  onBack: () => void;
  playSound: (type: keyof SoundFunctions) => void;
}

const MAX_HISTORY_LENGTH = 20;

// Helper functions for input validation
const isOperator = (char: string) => ['+', '-', '×', '÷'].includes(char);
const isDigit = (char: string) => /^\d$/.test(char);

export const Calculator: React.FC<CalculatorProps> = ({ onBack, playSound }) => {
  const { t } = useLanguage();
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [calculationHistory, setCalculationHistory] = useState<CalculationHistoryEntry[]>(() => {
    const savedHistory = localStorage.getItem('math_calculator_history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the end of the input display when input changes
    if (inputRef.current) {
      inputRef.current.scrollLeft = inputRef.current.scrollWidth;
    }
  }, [input]);

  useEffect(() => {
    localStorage.setItem('math_calculator_history', JSON.stringify(calculationHistory));
  }, [calculationHistory]);

  const handleButtonClick = useCallback((value: string) => {
    playSound('click');
    setError(''); // Clear error on any new input

    let newInputValue = input;
    let newOutputValue = output;

    if (value === 'C') {
      newInputValue = '';
      newOutputValue = '';
    } else if (value === 'DEL') {
      if (newInputValue === output && output !== '') { // If current input is the result, clear both
           newInputValue = '';
           newOutputValue = '';
      } else {
           newInputValue = newInputValue.slice(0, -1);
           if (newInputValue === '') newOutputValue = ''; // If input becomes empty, clear output too.
      }
    } else if (value === '=') {
      if (newInputValue === '') {
          setError('Expression cannot be empty.');
          return;
      }
      const lastChar = newInputValue.slice(-1);
      if (isOperator(lastChar) || lastChar === '.') {
          setError('Incomplete expression.');
          return;
      }
      try {
          const result = evaluateExpression(newInputValue);
          const resultString = result.toString();
          setOutput(resultString);
          setInput(resultString); // Set input to result for chained operations

          // Add to history
          setCalculationHistory(prevHistory => {
            const newEntry: CalculationHistoryEntry = {
              input: newInputValue,
              output: resultString,
              timestamp: Date.now(),
            };
            const updatedHistory = [newEntry, ...prevHistory];
            return updatedHistory.slice(0, MAX_HISTORY_LENGTH);
          });

      } catch (e: any) {
          setError(e.message || 'Calculation error.');
          setOutput('');
      }
      return; // Exit after '=' is handled
    } else if (isDigit(value)) {
        if (error || (newInputValue === output && output !== '')) { // Clear previous state if error or chaining from result
            newInputValue = value;
        } else if (newInputValue === '0' && value !== '0' && !isOperator(newInputValue.slice(-1))) { // Replace leading '0' with digit
            newInputValue = value;
        } else if (newInputValue === '0' && value === '0' && (newInputValue.length === 1 || isOperator(newInputValue.slice(-1)))) {
            // Do nothing if input is just '0' and another '0' is pressed, or if it's 'op0' and another '0' is pressed
            return;
        }
        else {
            newInputValue += value;
        }
        newOutputValue = ''; // Clear output when a digit is added (user is building expression)
    } else if (value === '.') {
        if (error || (newInputValue === output && output !== '')) { // Clear previous state if error or chaining from result
            newInputValue = '0.';
        } else if (newInputValue === '' || isOperator(newInputValue.slice(-1))) {
            newInputValue += '0.'; // Start with 0. if input is empty or ends with operator
        } else {
            // Check if the current number part already has a decimal
            const parts = newInputValue.split(/[\+\-×÷]/);
            const lastPart = parts[parts.length - 1];
            if (lastPart.includes('.')) {
                setError('Invalid decimal placement.');
                return;
            }
            newInputValue += value;
        }
        newOutputValue = '';
    } else if (isOperator(value)) { // Value is an operator (+, -, ×, ÷)
        if (error) { // If there's an error, clear it and start fresh with an allowed operator
             if (output !== '') { // If previous output is valid, use it to start new chain
                newInputValue = output + value;
             } else {
                setError('Cannot apply operator after error. Please clear first.');
                return;
             }
        } else if (newInputValue === '') {
            if (value === '-') { // Allow starting with a negative sign
                newInputValue = '-';
            } else {
                setError('Cannot start with this operator.');
                return;
            }
        } else if (newInputValue.slice(-1) === '.') {
             setError('Cannot place operator after decimal point.');
             return;
        } else if (isOperator(newInputValue.slice(-1))) {
            // If current input ends with an operator, replace it
            newInputValue = newInputValue.slice(0, -1) + value;
        } else {
            newInputValue += value;
        }
        newOutputValue = ''; // Clear output when new operator is added
    }

    setInput(newInputValue);
    setOutput(newOutputValue);

  }, [input, output, error, playSound, calculationHistory]);

  // Keyboard input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for calculator-related keys
      if (/^[0-9+\-*/.=]$/.test(e.key) || e.key === 'Enter' || e.key === 'Delete' || e.key === 'Backspace' || e.key === 'Escape') {
        e.preventDefault();
      }
      
      if (e.key >= '0' && e.key <= '9') {
        handleButtonClick(e.key);
      } else if (e.key === '+') {
        handleButtonClick('+');
      } else if (e.key === '-') {
        handleButtonClick('-');
      } else if (e.key === '*') {
        handleButtonClick('×');
      } else if (e.key === '/') {
        handleButtonClick('÷');
      } else if (e.key === '.' || e.key === ',') {
        handleButtonClick('.');
      } else if (e.key === 'Enter' || e.key === '=') {
        handleButtonClick('=');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        handleButtonClick('DEL');
      } else if (e.key === 'Escape') {
        handleButtonClick('C');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleButtonClick]);

  const evaluateExpression = (expression: string): number => {
    expression = expression.trim();

    if (expression === '') {
        throw new Error('Empty expression.');
    }

    // Check for expressions ending in operators or decimal
    const lastChar = expression.slice(-1);
    if (isOperator(lastChar) || lastChar === '.') {
        throw new Error('Incomplete expression.');
    }
    
    // Replace custom operators with standard ones for evaluation
    expression = expression.replace(/×/g, '*').replace(/÷/g, '/');

    // Regex to detect consecutive operators (e.g., "++", "--", "**", "//", "+-", "-+", "*+", "/+")
    // Special handling for negative numbers: allow "*-" or "/-"
    // First, temporarily replace "*-" and "/-" to avoid false positives in consecutive operator check
    const tempExpression = expression.replace(/\*\-/g, '*N').replace(/\/\-/g, '/N');
    if (/[+\-*\/]{2,}/.test(tempExpression)) {
        throw new Error('Invalid syntax (consecutive operators).');
    }

    // Ensure no leading zeros on numbers unless it's "0."
    // This regex looks for a digit not followed by a decimal, preceded by a zero not preceded by a decimal
    if (/\b0\d+\b/.test(expression)) {
        throw new Error('Invalid number format (leading zero).');
    }


    try {
        const tokens = expression.match(/(\d+\.?\d*)|([\+\-\*\/])/g);

        if (!tokens || tokens.length === 0) {
            throw new Error('Invalid expression format.');
        }

        const outputQueue: (number | string)[] = [];
        const operatorStack: string[] = [];
        // Lower precedence for N to allow it to be treated as part of the number after * or /
        const precedence: { [key: string]: number } = { '+': 1, '-': 1, '*': 2, '/': 2 };

        for (const token of tokens) {
            if (!isNaN(parseFloat(token))) {
                outputQueue.push(parseFloat(token));
            } else {
                while (
                    operatorStack.length > 0 &&
                    precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
                ) {
                    outputQueue.push(operatorStack.pop()!);
                }
                operatorStack.push(token);
            }
        }
        while (operatorStack.length > 0) {
            outputQueue.push(operatorStack.pop()!);
        }

        const evalStack: number[] = [];
        for (const token of outputQueue) {
            if (typeof token === 'number') {
                evalStack.push(token);
            } else {
                const b = evalStack.pop();
                const a = evalStack.pop();
                if (a === undefined || b === undefined) {
                    throw new Error('Invalid syntax (missing operand).');
                }
                switch (token) {
                    case '+': evalStack.push(a + b); break;
                    case '-': evalStack.push(a - b); break;
                    case '*': evalStack.push(a * b); break;
                    case '/':
                        if (b === 0) throw new Error('Division by zero.');
                        evalStack.push(a / b);
                        break;
                    default: throw new Error('Unknown operator.');
                }
            }
        }

        if (evalStack.length !== 1) {
            throw new Error('Invalid expression structure.');
        }
        return evalStack[0];
    } catch (err: any) {
        if (err.message.startsWith('Division by zero') || err.message.startsWith('Invalid syntax') || err.message.startsWith('Incomplete expression') || err.message.startsWith('Invalid number format')) {
            throw err; // Re-throw specific errors already caught
        }
        throw new Error('Calculation error.'); // Catch-all for other parsing issues
    }
  };

  const handleSelectHistoryEntry = useCallback((historyInput: string) => {
    setInput(historyInput);
    setOutput(''); // Clear output for editing
    setShowHistoryModal(false);
  }, []);

  const handleClearHistory = useCallback(() => {
    setCalculationHistory([]);
  }, []);

  const handleDeleteHistoryEntry = useCallback((timestampToDelete: number) => {
    setCalculationHistory(prevHistory => 
      prevHistory.filter(entry => entry.timestamp !== timestampToDelete)
    );
  }, []);


  const keypadLayout = [
    ['C', 'DEL', '÷', '×'],
    ['7', '8', '9', '-'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '='], // '=' will be handled by col-span-2 in rendering
    ['0', '.', 'equals_placeholder'], // Placeholder for the second span of '='
  ];

  return (
    <div className="h-full flex flex-col w-full max-w-lg mx-auto p-2 sm:p-3 md:p-4 lg:p-6 safe-top safe-bottom overflow-hidden">
      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        history={calculationHistory}
        onSelectEntry={handleSelectHistoryEntry}
        onClearHistory={handleClearHistory}
        onDeleteEntry={handleDeleteHistoryEntry} // New prop
      />

      <div className="flex items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
        <button
          onClick={onBack}
          className="btn-press p-2 rounded-full glass-panel text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent"
          aria-label={t('calcBack')}
        >
          <Icons.Back className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <h2 className="font-display text-xl md:text-3xl text-theme-text flex-grow text-center">
          {t('calculator_title')}
        </h2>
        <button
          onClick={() => setShowHistoryModal(true)}
          className="btn-press p-2 rounded-full glass-panel text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-accent"
          aria-label={t('calcHistory')}
        >
          <Icons.History className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>

      {/* Professional Gaming Display */}
      <div className="relative mb-3 sm:mb-4 md:mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-theme-accent/20 to-transparent rounded-2xl sm:rounded-3xl blur-xl"></div>
        <div className="relative glass-panel p-3 sm:p-4 md:p-6 rounded-2xl sm:rounded-3xl shadow-2xl border border-theme-accent/30">
          <div 
            ref={inputRef} 
            className="text-right text-theme-text/60 text-base sm:text-xl md:text-2xl lg:text-3xl font-mono overflow-x-auto whitespace-nowrap scrollbar-hide mb-1 h-6 sm:h-8 md:h-10 flex items-center justify-end"
            role="textbox"
            aria-live="polite"
            aria-atomic="true"
            aria-label={t('calcInput')}
          >
            {input || '0'}
          </div>
          <div 
            className="text-right text-theme-accent text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display h-10 sm:h-12 md:h-16 lg:h-20 flex items-center justify-end drop-shadow-lg"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label={t('calcResult')}
          >
            {error ? <span className="text-brand-danger text-sm sm:text-base md:text-xl lg:text-2xl" role="alert">{error}</span> : output || '0'}
          </div>
        </div>
      </div>

      {/* Professional Gaming Keypad */}
      <div className="grid grid-cols-4 gap-1 sm:gap-2 md:gap-2 lg:gap-3 flex-grow min-h-0">
        {keypadLayout.flat().map((key) => {
          // Render only the first '=' and make it span two columns
          if (key === 'equals_placeholder') return null; 
          
          return (
            <button
              key={key}
              onClick={() => handleButtonClick(key)}
              className={`
                relative overflow-hidden rounded-xl sm:rounded-2xl text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold shadow-lg border-b-4 sm:border-b-6
                active:border-b-0 active:translate-y-1 active:shadow-inner transition-all duration-75 focus:outline-none focus:ring-2 focus:ring-theme-accent
                ${['+', '-', '÷', '×'].includes(key)
                  ? 'bg-gradient-to-br from-theme-accent to-theme-accent/80 border-theme-accent/60 text-white hover:from-theme-accent/90 hover:to-theme-accent/70 active:from-theme-accent/70 active:to-theme-accent/60' 
                  : key === '='
                  ? 'col-span-2 bg-gradient-to-br from-brand-success to-brand-success/80 border-brand-success/60 text-white hover:from-brand-success/90 hover:to-brand-success/70 active:from-brand-success/70 active:to-brand-success/60' 
                  : key === 'C'
                  ? 'bg-gradient-to-br from-brand-danger to-brand-danger/80 border-brand-danger/60 text-white hover:from-brand-danger/90 hover:to-brand-danger/70 active:from-brand-danger/70 active:to-brand-danger/60' 
                  : key === 'DEL'
                  ? 'bg-gradient-to-br from-brand-danger/40 to-brand-danger/30 border-brand-danger/40 text-brand-danger hover:from-brand-danger/50 hover:to-brand-danger/40 active:from-brand-danger/30 active:to-brand-danger/20' 
                  : 'bg-gradient-to-br from-theme-panel to-theme-panel/80 border-theme-border/50 text-theme-text hover:from-theme-panel/90 hover:to-theme-panel/70 active:from-theme-panel/70 active:to-theme-panel/60'
                }
              `}
              aria-label={
                key === 'C' ? t('calcClear') :
                key === 'DEL' ? t('calcDelete') :
                key === '×' ? t('calcMultiply') :
                key === '÷' ? t('calcDivide') :
                key === '=' ? t('calcEquals') :
                key
              }
            >
              {key === 'DEL' ? <Icons.Trash className="w-6 h-6 md:w-7 md:h-7 mx-auto" /> : key}
            </button>
          );
        })}
      </div>
    </div>
  );
};
