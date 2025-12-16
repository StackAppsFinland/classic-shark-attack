# Classic Shark Attack

A modern web-based recreation of the classic Shark Attack game, built with PixiJS v7.4.2.

## Game Overview

Navigate your player through the ocean while avoiding sharks and octopuses. Draw nets to create safe paths and score points. The game features multiple levels with increasing difficulty.

## How to Play

### Controls
- **A/Z Keys**: Move up/down
- **,/ . Keys**: Move left/right
- **Arrow Keys**: Alternative movement controls
- **Gamepad Support**: Full controller support with analog sticks
- **R Key**: Retry level when game over
- **Enter Key**: Continue to next level

### Gameplay
1. **Movement**: Your player moves on a grid-based ocean
2. **Drawing Nets**: As you move, you automatically draw nets behind you
3. **Scoring**: 
   - Drawing new nets: 2 points per segment
   - Avoiding sharks and octopuses to survive
4. **Enemies**:
   - **Sharks**: Patrol the ocean and eat your nets over time
   - **Octopuses**: Stationary obstacles that end the game on contact
5. **Levels**: Progress through 11 increasingly difficult levels with more sharks and octopuses

### Game Features
- **Progressive Difficulty**: Each level adds more enemies and increases their speed
- **Visual Effects**: Water splashes, net eating animations, and screen flashes
- **Sound System**: Chomp sounds, splash effects, and background music tracks
- **Responsive Design**: Scales to different screen sizes
- **High Score Tracking**: Saves your progress and scores locally

## Technical Details

### Technologies Used
- **PixiJS v7.4.2**: 2D WebGL rendering engine
- **GSAP**: Animation library for smooth transitions
- **Howler.js**: Audio management system
- **WebFont Loader**: Custom font loading
- **Vanilla JavaScript**: No framework dependencies

### Game Architecture
- **Grid-based movement**: 30x22 grid with 28px tiles
- **Entity system**: Separate classes for Player, Shark, Octopus, and Effects
- **Collision detection**: Precise boundary checking for all entities
- **State management**: Game modes for initialization, playing, game over, and level transitions

### File Structure
```
├── index.html          # Main game page
├── app.js              # Core game logic and initialization
├── gameLevel.js        # Level configuration class
├── levels.js           # All game level definitions
├── shark.js            # Shark enemy AI and behavior
├── octopus.js          # Octopus enemy implementation
├── imageLoader.js      # Asset loading system
├── panels.js           # UI panels and menus
├── score.js            # Score tracking and persistence
└── [Effects classes]   # Visual effects for water splashes, net eating, etc.
```

## Installation & Running

1. **Local Development**: Simply open `index.html` in a web browser
2. **Web Server**: For production, serve from any web server (Apache, Nginx, etc.)
3. **No Build Process**: Runs directly in the browser with no compilation required

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **WebGL Required**: For hardware-accelerated graphics
- **Gamepad API**: Optional for controller support
- **Local Storage**: For saving game progress

## Game Controls Reference

| Action | Keyboard | Gamepad |
|--------|----------|---------|
| Move Up | A | Left Stick Up |
| Move Down | Z | Left Stick Down |
| Move Left | , | Left Stick Left |
| Move Right | . | Left Stick Right |
| Retry | R | Button A |
| Continue | Enter | Button A |

## Tips & Strategies

1. **Plan Your Route**: Think ahead before drawing nets to avoid getting trapped
2. **Watch Shark Patterns**: Learn shark movement patterns to navigate safely
3. **Use the Edges**: Border areas can be safer for net drawing
4. **Speed vs. Safety**: Balance quick movement with careful planning
5. **Level Progression**: Early levels are easier for learning basic mechanics

## Troubleshooting

- **Game Won't Load**: Check browser console for errors, ensure WebGL is enabled
- **No Sound**: Browser may block audio until user interaction
- **Controller Not Working**: Ensure gamepad is connected and browser supports Gamepad API
- **Performance Issues**: Close other browser tabs or update graphics drivers

## Credits

Original game concept inspired by classic arcade games. This modern implementation features enhanced graphics, sound, and gameplay while maintaining the classic feel.

