# GAAS: Gamified Adaptive Arithmetic System

An interactive math learning application that makes mastering arithmetic fun through gamified challenges, campaigns, and arcade-style games.

## Overview

GAAS (Gamified Adaptive Arithmetic System) is designed to help users of all ages improve their math skills through engaging game modes. Whether you're a beginner learning basic addition or an expert tackling complex operations, GAAS provides a personalized learning experience with visual questions, timed challenges, and progress tracking.

## Features

### Game Modes

#### Campaign Mode
Progress through 30 levels across 10 different math operations:
- **Addition** - Basic to advanced addition problems
- **Subtraction** - Single to multi-digit subtraction
- **Multiplication** - Times tables through complex multiplication
- **Division** - Basic to long division problems
- **Missing Number** - Find the unknown value (e.g., 5 + ? = 12)
- **Number Bonds** - Number pairs that sum to a target
- **Compare Numbers** - Greater than, less than, equal to
- **Visual Counting** - Count dots, triangles, and stars

#### Arcade Mode
Competitive challenges for high scores:
- **Score Attack** - 60-second time rush to score as high as possible
- **Endless Mode** - Survive as long as possible with 3 lives
- **Duel Mode** - Battle against the CPU opponent
- **Flash Mode** - Memory test with quick visual questions
- **Marathon** - Long stamina run across all operations

#### Practice Mode
Unlimited practice with adjustable difficulty:
- **Easy** - Single digit numbers (1-9)
- **Medium** - Double digit numbers (10-99)
- **Hard** - Advanced numbers and mixed operations

### Core Features

- **Visual Questions** - Count animated shapes (dots, triangles, stars) with colorful graphics
- **Multiple Themes** - Choose from Simulation, Paper, Midnight, and Forest themes
- **Timer Options** - 30s, 60s, 90s, or 120s game sessions
- **Bilingual Support** - Full English and Swahili language support
- **Character Builder** - Create your avatar with customizable shapes (Circle, Square, Triangle, Star, Diamond) and colors
- **Achievements** - 12 unlockable achievements to track your progress
- **Calculator** - Built-in scientific calculator with calculation history

### User System

- **Guest Mode** - Play immediately without registration
- **Authentication** - Email/password login via Firebase
- **Cloud Sync** - Save progress to the cloud when logged in
- **Profile Management** - Track stats, achievements, and high scores

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. Clone or download the project
2. Navigate to the project directory:
   ```bash
   cd mathlab
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. (Optional) Configure Firebase for authentication:
   - Copy `.env.example` to `.env`
   - Add your Firebase project credentials
   ```bash
   cp .env.example .env
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser to the URL shown (typically http://localhost:5173)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

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
5. Complete 10+ questions to pass each level

### Playing Arcade

1. Select "Arcade" from the dashboard
2. Choose a game mode
3. Score points by answering correctly and quickly
4. Beat high scores to unlock achievements

### Using the Calculator

1. Tap the calculator icon from the dashboard
2. Enter expressions using buttons or keyboard
3. View history by tapping the history icon

## Achievements

| Achievement | Requirement |
|-------------|-------------|
| First Steps | Complete Level 1 in any Campaign |
| Addition Master | Complete all 30 Addition levels |
| Subtraction Master | Complete all 30 Subtraction levels |
| Multiplication Master | Complete all 30 Multiplication levels |
| Division Master | Complete all 30 Division levels |
| Speed Demon | Score over 300 in Score Attack |
| Survivor | Reach Round 20 in Endless Mode |
| Zen Master | Complete 10 levels in Zen Mode |
| Marathon Runner | Complete a Marathon session |
| Duelist | Win 5 Duels |
| Sharp Eye | Score 100 in Flash Mode |
| Visual Perfectionist | Complete 10 Visual Counting levels |

## Project Structure

```
mathlab/
├── src/                      # Source files
│   ├── components/           # React components
│   │   ├── screens/          # Screen components
│   │   ├── modals/           # Modal components
│   │   └── ui/               # UI components
│   ├── contexts/             # React contexts
│   ├── services/             # Business logic
│   ├── i18n/                 # Translations
│   └── *.tsx                 # Main app files
├── public/                   # Static assets
├── constants.ts              # App constants
├── types.ts                  # TypeScript types
└── package.json              # Dependencies
```

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Tone.js** - Audio/Sound effects
- **Canvas Confetti** - Visual effects
- **Firebase** - Authentication & cloud storage
- **i18next** - Internationalization

## Keyboard Shortcuts

- **Enter** - Start game / Confirm
- **Escape** - Pause / Back
- **1-9** - Quick answer selection (when enabled)

## Settings

Access settings from the dashboard to configure:
- **Timer Duration** - 30s, 60s, 90s, or 120s
- **Theme** - Simulation, Paper, Midnight, Forest
- **Language** - English or Swahili
- **Practice Difficulty** - Easy, Medium, Hard

## License

This project is for educational purposes.

## Support

For issues or questions, please open an issue on the project repository.
