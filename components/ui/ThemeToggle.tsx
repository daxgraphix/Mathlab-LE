

import React from 'react';
import { Icons } from '../Icons';

interface ThemeToggleProps {
  isDark: boolean;
  toggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggle }) => (
  <button
    onClick={toggle}
    className="relative w-14 h-7 rounded-full bg-slate-200 dark:bg-slate-700 shadow-inner transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-neon-blue"
    aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
  >
    <div
      className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
        isDark ? 'translate-x-7 bg-slate-800 text-neon-yellow' : 'translate-x-0 bg-white text-orange-400'
      }`}
    >
      {isDark ? <Icons.Moon className="w-3 h-3" /> : <Icons.Sun className="w-3 h-3" />}
    </div>
  </button>
);
