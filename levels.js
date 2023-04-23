import GameLevel from './gameLevel.js';

const levels = [
    new GameLevel(1, 2, 0, 1, 25, 4000),
    new GameLevel(2, 4, 0, 1, 50, 3500),
    new GameLevel(3, 4, 0, 1.3, 60, 2500),
    new GameLevel(4, 6, 0, 1, 70, 2500),
    new GameLevel(5, 6, 0, 1.3, 75, 2200),
    new GameLevel(6, 6, 2, 1.3, 75, 2000),
    new GameLevel(7, 8, 4, 1.3, 80, 1800),
    new GameLevel(8, 8, 6, 1.5, 80, 1600),
    new GameLevel(9, 8, 8, 1.5, 80, 1300),
    new GameLevel(10, 8, 8, 1.7, 80, 1000)
];

export default levels;