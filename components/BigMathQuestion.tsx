
import React from 'react';
import { MathQuestion } from '../types';
import { VisualQuestionRenderer } from './VisualQuestionRenderer';
import { useLanguage } from '../context/LanguageContext';

interface BigMathQuestionProps {
  q: MathQuestion | null;
  input: string;
  showCursor: boolean;
  hideTerms: boolean;
  submissionStatus: 'none' | 'correct' | 'incorrect';
}

export const BigMathQuestion: React.FC<BigMathQuestionProps> = React.memo(({ q, input, showCursor, hideTerms, submissionStatus }) => {
  const { t } = useLanguage();
  
  // Helper to translate visual question text
  const getVisualQuestionText = (text: string) => {
    if (!text) return '';
    const lowerText = text.toLowerCase();
    if (lowerText.includes('dots')) return t('howManyDots');
    if (lowerText.includes('triangle')) return t('howManyTriangles');
    if (lowerText.includes('star')) return t('howManyStars');
    return text;
  };

  if (!q) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 md:w-10 md:h-10 border-4 border-theme-accent border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-theme-muted animate-pulse tracking-widest text-[9px] md:text-[10px]">{t('syncingCores')}</span>
      </div>
    );
  }

  const terms = q.text.split(' ');

  return (
    <div className="w-full h-full flex flex-col items-center justify-around py-4 md:py-8 animate-pop overflow-hidden">
      {q.visualQuestion ? (
        <div className="w-full flex flex-col items-center gap-4 flex-grow min-h-0">
          <h2 className="text-base md:text-2xl font-display text-theme-text text-center px-4 leading-tight tracking-wide">
            {getVisualQuestionText(q.visualQuestion.text)}
          </h2>
          <div className="w-full flex-grow min-h-0 px-2">
            <VisualQuestionRenderer shapes={q.visualQuestion.shapes} submissionStatus={submissionStatus} />
          </div>
        </div>
      ) : (
        <div className={`flex flex-wrap items-center justify-center gap-x-3 md:gap-x-6 gap-y-2 md:gap-y-4 px-2 transition-opacity duration-500 ${hideTerms ? 'opacity-0' : 'opacity-100'}`}>
          <span className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-display text-theme-text break-all">{terms[0]}</span>
          <span className="text-xl xs:text-2xl sm:text-4xl lg:text-5xl lg:text-5xl font-display text-theme-muted/50">{terms[1]}</span>
          <span className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-display text-theme-secondary break-all">{terms[2]}</span>
          {terms.length > 3 && (
            <>
              <span className="text-xl sm:text-4xl lg:text-5xl font-display text-theme-muted/50">{terms[3]}</span>
              <span className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-display text-theme-accent break-all">{terms[4]}</span>
            </>
          )}
          {/* Only show = if not already in question text */}
          {!q.text.includes('=') && (
            <span className="text-xl sm:text-4xl lg:text-5xl font-display text-theme-muted/50">=</span>
          )}
        </div>
      )}

      {/* Input Slot */}
      <div className={`relative h-14 md:h-24 lg:h-32 min-w-[80px] md:min-w-[160px] lg:min-w-[200px] flex items-center justify-center border-b-4 transition-all duration-300 mt-4 ${
        submissionStatus === 'correct' ? 'border-brand-success bg-brand-success/10' :
        submissionStatus === 'incorrect' ? 'border-brand-danger bg-brand-danger/10' :
        'border-theme-border'
      }`}>
        <span className={`text-4xl md:text-7xl lg:text-8xl font-display ${
          submissionStatus === 'correct' ? 'text-brand-success' :
          submissionStatus === 'incorrect' ? 'text-brand-danger' :
          'text-theme-accent'
        }`}>
          {input || (showCursor ? '?' : '')}
        </span>
        {showCursor && !input && (
          <div className="absolute inset-0 bg-theme-accent/5 animate-pulse-slow" />
        )}
      </div>
    </div>
  );
});
