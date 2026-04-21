# GAAS: Gamified Adaptive Arithmetic System

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/React-19-61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-Educational-brightgreen" alt="License">
</p>

An interactive math learning application that makes mastering arithmetic fun through gamified challenges, campaigns, and arcade-style games. GAAS (Gamified Adaptive Arithmetic System) is designed to help users of all ages improve their math skills through engaging game modes with visual questions, timed challenges, and progress tracking.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [Game Modes](#game-modes)
  - [Campaign Mode](#campaign-mode)
  - [Arcade Mode](#arcade-mode)
  - [Practice Mode](#practice-mode)
  - [Core Features](#core-features)
- [Getting Started](#getting-started)
- [How to Play](#how-to-play)
- [Achievements](#achievements)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Settings](#settings)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Firebase Setup](#firebase-setup-optional)
- [License](#license)
- [Support](#support)

---

## Overview

GAAS is a comprehensive math learning platform that transforms traditional arithmetic practice into an engaging gaming experience. Whether you're a beginner learning basic addition or an expert tackling complex operations, GAAS provides a personalized learning experience with:

- **Visual Learning**: Count animated shapes (dots, triangles, stars) with colorful graphics
- **Adaptive Difficulty**: Questions automatically adjust based on your performance
- **Multiple Game Modes**: Campaign, Arcade, and Practice modes for varied gameplay
- **Progress Tracking**: Achievements, high scores, and detailed statistics
- **Bilingual Support**: Full English and Swahili language support
- **Cloud Sync**: Save your progress when logged in

---

## Features

### Game Modes

GAAS offers three main game modes to suit different learning styles and objectives:

---

#### Campaign Mode

Progress through 30 levels across 10 different math operations. Each operation has its own dedicated campaign with progressive difficulty:

| Operation | Description | Difficulty Range |
|-----------|-------------|------------------|
| **Addition** | Basic to advanced addition problems | Single-digit to 3-digit numbers |
| **Subtraction** | Single to multi-digit subtraction | Result 1-10 to 3-digit operations |
| **Multiplication** | Times tables through complex multiplication | 1-5 tables to 12-19 factors |
| **Division** | Basic to long division problems | Single-digit to 12÷20 divisor/dividend |
| **Missing Number** | Find the unknown value (e.g., 5 + ? = 12) | Addition, subtraction, multiplication |
| **Number Bonds** | Number pairs that sum to a target | 5, 10, 15, 20, 30, 50, 100 |
| **Compare Numbers** | Greater than, less than comparisons | 1-10 to 1-500 |
| **Visual Counting - Dots** | Count animated dot shapes | 3-7 to 15-24 shapes |
| **Visual Counting - Triangles** | Count animated triangle shapes | 3-7 to 15-24 shapes |
| **Visual Counting - Stars** | Count animated star shapes | 3-7 to 15-24 shapes |

**Level Progression:**
- Levels 1-5: Easy (Single Digit)
- Levels 6-15: Medium (Double Digit)
- Levels 16-25: Hard (Advanced)
- Levels 26-30: Master (Expert)

---

#### Arcade Mode

Competitive challenges for high scores and intense gameplay:

| Mode | Description | Objective |
|------|-------------|-----------|
| **Score Attack** | 60-second time rush | Score as many points as possible in 60 seconds |
| **Endless Mode** | 3 Lives Survival | Survive as long as possible - 3 lives, game ends when all lost |
| **Duel Mode** | Battle vs CPU | Compete against AI opponent - answer faster and more accurately to win |
| **Flash Mode** | Memory Test | Quick visual questions that test your observation and calculation speed |
| **Marathon** | Stamina Run | Long endurance run across all operations - prove your math stamina |

**Scoring System:**
- Correct answer: +10 points base
- Speed bonus: Extra points for fast answers
- Combo multiplier: Consecutive correct answers increase your multiplier
- Tier rankings: Novice → Bronze → Silver → Gold → Platinum

---

#### Practice Mode

Unlimited practice with adjustable difficulty - no pressure, just learning:

| Difficulty | Number Range | Best For |
|------------|--------------|----------|
| **Easy** | Single digit (1-9) | Beginners learning basics |
| **Medium** | Double digit (10-99) | Intermediate learners |
| **Hard** | Advanced numbers & mixed operations | Advanced practice |

Practice mode allows you to:
- Select any math operation to practice
- Choose your preferred difficulty
- Take your time without timer pressure
- Focus on specific areas needing improvement

---

### Core Features

#### Visual Questions
- Count animated shapes (dots, triangles, stars) with colorful graphics
- Shapes appear in random positions with various sizes and rotations
- Colorful animations make counting fun and engaging

#### Multiple Themes
Choose from 4 beautiful themes:
- **Simulation**: Modern, vibrant colors
- **Paper**: Clean, minimalist aesthetic
- **Midnight**: Dark mode for night gaming
- **Forest**: Nature-inspired green tones

#### Timer Options
Configure game session duration:
- 30 seconds (Quick Challenge)
- 60 seconds (Standard)
- 90 seconds (Extended)
- 120 seconds (Marathon)

#### Bilingual Support
Full interface translation in:
- **English** - Default language
- **Swahili** - Full translation support

#### Character Builder
Create your personalized avatar:
- **Shapes**: Circle, Square, Triangle, Star, Diamond
- **Colors**: Multiple color options
- **Name**: Custom display name

#### Achievements System
12 unlockable achievements to track your progress:
- Campaign completion achievements
- Arcade high score achievements
- Special milestone achievements

#### Built-in Calculator
- Scientific calculator functionality
- Calculation history tracking
- Easy access from dashboard

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. **Clone or download the project**

2. **Navigate to the project directory:**
   ```bash
   cd mathlab
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **(Optional) Configure Firebase for authentication:**
   - Copy `.env.example` to `.env`
   - Add your Firebase project credentials
   ```bash
   cp .env.example .env
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser to the URL shown** (typically http://localhost:5173)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

---

## How to Play

### Starting the App

1. Launch the app to see the splash screen
2. Tap to enter - either login/register or continue as guest
3. Create your character (name, shape, color)
4. Enter the dashboard

### Playing Campaign

1. Select "Campaign" from the dashboard
2. Choose a math operation (Addition, Subtraction, etc.)
3. Select a level (1-30)
4. Answer questions before time runs out
5. Complete 10+ questions correctly to pass each level
6. Unlock new levels as you progress

### Playing Arcade

1. Select "Arcade" from the dashboard
2. Choose a game mode:
   - **Score Attack**: Answer as many as possible in 60s
   - **Endless**: Survive with 3 lives
   - **Duel**: Beat the CPU opponent
   - **Flash**: Quick visual questions
   - **Marathon**: Long endurance test
3. Score points by answering correctly and quickly
4. Beat high scores to unlock achievements

### Playing Practice

1. Select "Practice" from the dashboard
2. Choose difficulty (Easy, Medium, Hard)
3. Select math operation to practice
4. Answer at your own pace
5. No time limit - focus on learning

### Using the Calculator

1. Tap the calculator icon from the dashboard
2. Enter expressions using buttons or keyboard
3. View history by tapping the history icon

---

## Achievements

| Achievement | Requirement | Difficulty |
|-------------|-------------|------------|
| First Steps | Complete Level 1 in any Campaign | ⭐ Easy |
| Addition Master | Complete all 30 Addition levels | ⭐⭐⭐⭐⭐ Hard |
| Subtraction Master | Complete all 30 Subtraction levels | ⭐⭐⭐⭐⭐ Hard |
| Multiplication Master | Complete all 30 Multiplication levels | ⭐⭐⭐⭐⭐ Hard |
| Division Master | Complete all 30 Division levels | ⭐⭐⭐⭐⭐ Hard |
| Speed Demon | Score over 300 in Score Attack | ⭐⭐⭐⭐ Hard |
| Survivor | Reach Round 20 in Endless Mode | ⭐⭐⭐⭐ Hard |
| Zen Master | Complete 10 levels in Zen Mode | ⭐⭐⭐ Medium |
| Marathon Runner | Complete a Marathon session | ⭐⭐⭐⭐ Hard |
| Duelist | Win 5 Duels | ⭐⭐⭐ Medium |
| Sharp Eye | Score 100 in Flash Mode | ⭐⭐⭐ Medium |
| Visual Perfectionist | Complete 10 Visual Counting levels | ⭐⭐⭐ Medium |

---

## Project Structure

```
mathlab/
├── src/                      # Source files
│   ├── components/           # React components
│   │   ├── screens/          # Screen components
│   │   │   ├── Splash.tsx           # Splash screen
│   │   │   ├── CharacterBuilder.tsx # Character creation
│   │   │   ├── Dashboard.tsx        # Main menu/dashboard
│   │   │   ├── LevelMap.tsx         # Campaign level selection
│   │   │   ├── GameArena.tsx        # Main game arena
│   │   │   └── Calculator.tsx       # Built-in calculator
│   │   ├── modals/           # Modal components
│   │   │   ├── SettingsModal.tsx    # Settings menu
│   │   │   ├── AchievementsModal.tsx # Achievements display
│   │   │   ├── ResultModal.tsx      # Game results
│   │   │   ├── PauseMenu.tsx        # Pause menu
│   │   │   ├── ProfileModal.tsx     # User profile
│   │   │   └── HistoryModal.tsx     # Calculator history
│   │   ├── ui/               # UI components
│   │   │   ├── ThemeToggle.tsx      # Theme switcher
│   │   └── Icons.tsx                # Icon components
│   ├── contexts/             # React contexts
│   │   ├── AuthContext.tsx          # Authentication state
│   │   ├── ToastContext.tsx         # Toast notifications
│   │   └── LanguageContext.tsx      # i18n language state
│   ├── services/             # Business logic
│   │   ├── mathEngine.ts            # Question generation
│   │   ├── authService.ts           # Firebase auth
│   │   ├── userService.ts           # User data management
│   │   └── firebase.ts              # Firebase configuration
│   ├── i18n/                 # Translations
│   │   ├── index.ts                  # i18n setup
│   │   ├── en.ts                     # English translations
│   │   └── sw.ts                     # Swahili translations
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── public/                   # Static assets
├── constants.ts              # App constants & config
├── types.ts                  # TypeScript type definitions
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── vite.config.ts            # Vite build config
```

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **TypeScript** | Type safety and better DX |
| **Vite** | Fast build tool and dev server |
| **Tailwind CSS** | Utility-first styling |
| **Tone.js** | Audio/Sound effects |
| **Canvas Confetti** | Victory celebrations |
| **Firebase** | Authentication & cloud storage |
| **i18next** | Internationalization |

---

## Settings

Access settings from the dashboard to configure:

| Setting | Options |
|---------|---------|
| **Timer Duration** | 30s, 60s, 90s, 120s |
| **Theme** | Simulation, Paper, Midnight, Forest |
| **Language** | English, Swahili |
| **Practice Difficulty** | Easy, Medium, Hard |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Enter** | Start game / Confirm |
| **Escape** | Pause / Back |
| **1-9** | Quick answer selection (when enabled) |

---

## Firebase Setup (Optional)

To enable cloud features and authentication:

1. Create a project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication:
   - Go to Build > Authentication > Sign-in method
   - Enable "Email/Password"
3. (Optional) Enable Firestore:
   - Go to Build > Firestore Database
   - Create database in test mode
4. Get your config from Project Settings > Your apps > Web app
5. Update `.env` with your credentials

---

## Game Mechanics

### Adaptive Difficulty System

GAAS uses an intelligent adaptive difficulty system that adjusts question difficulty based on:
- **Response Time**: Faster answers = harder questions
- **Accuracy Rate**: Higher accuracy = progressively harder
- **Streak**: Consecutive correct answers increase difficulty

### Question Generation

- **Campaign**: 500+ unique questions per difficulty level
- **Arcade**: 1000+ questions across all operations
- **Visual Questions**: Randomly generated shapes in various positions
- **No Repetition**: Questions are tracked to avoid repetition within sessions

### Scoring System

**Campaign Mode:**
- Correct answer: Base points
- Time bonus: Extra points for fast answers
- Level completion: Bonus points for passing levels

**Arcade Mode:**
- Base score per correct answer
- Speed multiplier
- Combo system (consecutive correct = higher multiplier)
- Tier rankings based on total score

---

## License

This project is for educational purposes.

## Support

For issues or questions, please open an issue on the project repository.

---

<p align="center">Made with ❤️ for math education</p>