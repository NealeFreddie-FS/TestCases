# Dark Souls: Web Edition

A web-based Dark Souls inspired game experience built with Next.js and TypeScript.

![Game Screenshot](screenshot.png)

## Features

- **Immersive Fullscreen Game Experience**: Completely disables browser controls and navigation for total immersion
- **Dark Souls Themed UI**: Authentic Dark Souls styling for menus, HUD, and game elements
- **In-Game Pause Menu**: Access equipment, stats, map, and options screens
- **Focus Trapping**: Prevents tabbing out of the game for uninterrupted gameplay
- **Custom Controls**: WASD movement, space for jump/roll, mouse for attacks
- **Responsive Design**: Works on all screen sizes
- **Keyboard Navigation**: Full keyboard accessibility for menu navigation

## Technical Features

- **Browser Control Disabling**: Complete disabling of browser shortcuts, context menus, and navigation
- **Custom Cursor**: Sword cursor for gameplay
- **Navigation Hiding**: Completely hides the website navigation when in game
- **Fullscreen Mode**: Support for browser fullscreen API
- **Focus Management**: Sophisticated focus trapping and management
- **React Hooks**: Custom game state management
- **TypeScript**: Strong typing throughout the application

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/dark-souls-web.git
cd dark-souls-web
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Run the development server

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000/game](http://localhost:3000/game) in your browser

## Game Controls

- **WASD**: Movement
- **Space**: Jump/Roll
- **Mouse**: Attack
- **Shift**: Block
- **E**: Use item/Interact
- **ESC**: Open/close pause menu

## Implementation Notes

- The game uses multiple approaches to hide navigation and disable browser controls:

  - CSS-based hiding
  - JavaScript DOM manipulation
  - Custom layout overrides
  - Event listener capturing
  - Focus trapping

- Focus management includes:
  - Automatic focus on game start
  - Custom tab order within the game
  - Prevention of focus leaving the game container

## License

MIT

## Acknowledgments

- Dark Souls for inspiration
- Next.js team for the amazing framework
- React team for the component library
