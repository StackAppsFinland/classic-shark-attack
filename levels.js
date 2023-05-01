import GameLevel from './gameLevel.js';

 const levels = [
    new GameLevel(1, 4, 0, 1, 4, 3000),
    new GameLevel(2, 4, 2, 1.1, 50, 2750),
    new GameLevel(3, 4, 3, 1.2, 60, 2500),
    new GameLevel(4, 4, 4, 1.3, 70, 2250),
    new GameLevel(5, 4, 5, 1.4, 75, 2000),
    new GameLevel(6, 5, 6, 1.5, 75, 1750),
    new GameLevel(7, 5, 7, 1.6, 80, 1500),
    new GameLevel(8, 6, 8, 1.7, 80, 1250),
    new GameLevel(9, 6, 9, 1.8, 80, 1000),
    new GameLevel(10, 6, 10, 1.9, 80, 750)
];

export default levels;