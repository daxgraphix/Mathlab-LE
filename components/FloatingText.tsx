

import React from 'react';
import { FloatingTextData } from '../types';

interface FloatingTextProps {
  text: string;
  x: string;
  y: string;
  color: string;
}

export const FloatingText: React.FC<FloatingTextProps> = React.memo(({ text, x, y, color }) => (
  <div 
    className={`absolute z-50 pointer-events-none font-bold text-2xl animate-float-up ${color}`}
    style={{ left: x, top: y, textShadow: '0 2px 8px rgba(0,0,0,0.2)', transform: 'translate(-50%, -50%)' }}
  >
    {text}
  </div>
));
