import GameLevel from './gameLevel.js';

 const levels = [
    new GameLevel(1, 4, 0, 0.75, 40, 2000),
    new GameLevel(2, 4, 2, 0.8, 50, 1750),
    new GameLevel(3, 4, 3, 0.85, 60, 1500),
    new GameLevel(4, 4, 4, 0.9, 70, 1250),
    new GameLevel(5, 4, 5, 0.95, 75, 1000),
    new GameLevel(6, 5, 6, 1.0, 75, 1000),
    new GameLevel(7, 5, 7, 1.1, 80, 1000),
    new GameLevel(8, 6, 8, 1.2, 80, 900),
    new GameLevel(9, 6, 8, 1.3, 80, 800),
    new GameLevel(10, 6, 9, 1.4, 80, 750),
    new GameLevel(11, 6, 10, 1.5, 80, 600)
];

export default levels;