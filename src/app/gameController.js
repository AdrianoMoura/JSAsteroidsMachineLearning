import AsteroidsCollection from './collections/AsteroidsCollection';
import Player from './sprites/player';

export default class GameController {
    constructor() {
        this.calledNextLevel = false
    }

    nextLevel() {
        if (!this.calledNextLevel) {
            this.calledNextLevel = true
            setTimeout(() => {
                // Prevent nextLevel to be called many times
                this.calledNextLevel = false

                // Give 1k points
                this.makePoint(0, 1000)

                // Increase the number of asteroids
                totalAsteroids++

                // Restart
                window.asteroidsCollection = new AsteroidsCollection(totalAsteroids)
            }, 1000);
        }
    }

    makePoint(size) {
        switch (size) {
            case 1:
                generation.getActualSpecimen().score += 100
                break
            case 2:
                generation.getActualSpecimen().score += 50
                break
            case 3:
                generation.getActualSpecimen().score += 20
                break
        }
    }
}