

import React, { useState, useCallback } from 'react';
import { Icons } from '../Icons';

interface CharacterBuilderProps {
  onCharacterCreated: (name: string, avatarShape: string, avatarColor: string) => void;
}

const AVATAR_SHAPES = ['Circle', 'Square', 'Triangle', 'Hexagon', 'Star']; // Added 'Star'
const AVATAR_COLORS = ['neon-blue', 'neon-pink', 'neon-purple', 'neon-green', 'neon-yellow'];
const MAX_NAME_LENGTH = 15;

export const CharacterBuilder: React.FC<CharacterBuilderProps> = ({ onCharacterCreated }) => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Shape, 2: Color, 3: Name
  const [playerName, setPlayerName] = useState('');
  const [nameError, setNameError] = useState('');
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const validateName = useCallback((name: string) => {
    if (name.trim() === '') {
      return 'Name cannot be empty.';
    }
    if (name.trim().length > MAX_NAME_LENGTH) {
      return `Name too long (max ${MAX_NAME_LENGTH} characters).`;
    }
    return '';
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setPlayerName(newName);
    setNameError(validateName(newName));
  }, [validateName]);

  const handleNext = () => {
    if (currentStep === 1 && !selectedShape) return;
    if (currentStep === 2 && !selectedColor) return;
    if (currentStep === 3) {
      const error = validateName(playerName);
      if (error) {
        setNameError(error);
        return;
      }
      onCharacterCreated(playerName.trim(), selectedShape!, selectedColor!);
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const isNextDisabled =
    (currentStep === 1 && !selectedShape) ||
    (currentStep === 2 && !selectedColor) ||
    (currentStep === 3 && (playerName.trim() === '' || nameError !== ''));

  const RenderIcon = (iconName: string, className: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className={className} /> : null;
  };

  const stepTitle = useCallback(() => {
    switch (currentStep) {
      case 1: return "SELECT AVATAR SHAPE";
      case 2: return "SELECT AVATAR COLOR";
      case 3: return "ENTER YOUR SCIENTIST NAME";
      default: return "";
    }
  }, [currentStep]);

  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden bg-theme-bg safe-top safe-bottom">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-theme-panel/40 via-theme-bg to-theme-bg opacity-80" />
      </div>

      <div className="relative z-10 flex flex-col items-center animate-pop p-4 max-w-md w-full">
        <h1 className="font-display text-2xl md:text-5xl text-theme-text mb-3 md:mb-4 text-center drop-shadow-lg">
          BUILD YOUR CHARACTER
        </h1>
        <p className="font-mono text-theme-accent tracking-widest text-[10px] md:text-sm mb-4 md:mb-6 animate-gradient-pulse">
          STEP {currentStep} OF 3
        </p>

        {/* Avatar Preview */}
        <div className="w-16 h-16 md:w-32 md:h-32 mb-4 md:mb-8 relative">
          <div className={`w-full h-full rounded-2xl md:rounded-3xl p-1 shadow-xl flex items-center justify-center transition-all duration-300
                         ${selectedColor ? `bg-${selectedColor}` : 'bg-theme-panel'}
                         ${selectedShape ? 'border-4 border-white/20' : ''}`}>
            {selectedShape ? (
              RenderIcon(selectedShape, 'w-10 h-10 md:w-20 md:h-20 text-white drop-shadow-md')
            ) : (
              <span className="text-white text-xl md:text-3xl font-bold opacity-50">?</span>
            )}
          </div>
        </div>

        {/* Dynamic Step Content */}
        <div className="w-full">
            <h3 className="font-mono text-[9px] md:text-xs font-bold opacity-70 uppercase tracking-widest text-theme-text mb-2 md:mb-3 text-center">
                {stepTitle()}
            </h3>

            {currentStep === 1 && (
                <div className="grid grid-cols-5 gap-1.5 md:gap-3 animate-slide-up">
                {AVATAR_SHAPES.map(shape => (
                    <button
                    key={shape}
                    onClick={() => setSelectedShape(shape)}
                    className={`btn-press aspect-square rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-theme-accent
                                ${selectedShape === shape
                                    ? 'bg-theme-accent text-white shadow-lg ring-2 ring-white scale-105' 
                                    : 'bg-theme-panel text-theme-muted hover:bg-theme-panel/80 hover:text-theme-text hover:scale-105'
                                }`}
                    aria-label={`Select ${shape} shape`}
                    >
                    {RenderIcon(shape, 'w-5 h-5 md:w-8 md:h-8')}
                    </button>
                ))}
                </div>
            )}

            {currentStep === 2 && (
                <div className="grid grid-cols-5 gap-1.5 md:gap-3 animate-slide-up">
                {AVATAR_COLORS.map(color => (
                    <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`btn-press aspect-square rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-${color}
                                ${selectedColor === color
                                    ? `ring-2 ring-white scale-105 shadow-xl bg-${color}` 
                                    : `hover:scale-105 opacity-80 hover:opacity-100 bg-${color}`
                                }`}
                    aria-label={`Select ${color.replace('neon-', '')} color`}
                    >
                    {selectedColor === color && <Icons.Star className="w-3 h-3 md:w-5 md:h-5 text-white" filled={true} />}
                    </button>
                ))}
                </div>
            )}

            {currentStep === 3 && (
                <div className="animate-slide-up">
                    <input
                    type="text"
                    placeholder="Your Name (max 15 chars)"
                    value={playerName}
                    onChange={handleNameChange}
                    className={`w-full p-2.5 md:p-4 rounded-xl bg-theme-panel text-theme-text font-display text-center text-base md:text-xl placeholder-theme-muted focus:outline-none focus:ring-2
                                ${nameError ? 'ring-brand-danger' : 'focus:ring-theme-accent'}`}
                    maxLength={MAX_NAME_LENGTH}
                    aria-invalid={!!nameError}
                    aria-describedby={nameError ? 'name-error' : undefined}
                    />
                    {nameError && (
                    <p id="name-error" role="alert" className="text-brand-danger text-[10px] md:text-sm mt-1.5 md:mt-2 text-center">{nameError}</p>
                    )}
                </div>
            )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2 md:gap-4 w-full mt-6 md:mt-10">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="btn-press flex-1 bg-theme-panel text-theme-text font-display py-2.5 md:py-4 rounded-xl shadow-lg hover:bg-theme-panel/80 transition-colors focus:outline-none focus:ring-2 focus:ring-theme-muted text-xs md:text-base"
              aria-label="Go back to previous step"
            >
              BACK
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={isNextDisabled}
            className={`btn-press flex-1 bg-theme-accent text-white text-xs md:text-xl font-display py-2.5 md:py-4 px-4 md:px-12 rounded-xl md:rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-theme-accent
                        ${isNextDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={currentStep === 3 ? 'Start GAAS' : 'Go to next step'}
          >
            {currentStep === 3 ? 'START LAB' : 'NEXT'}
          </button>
        </div>
      </div>
    </div>
  );
};
