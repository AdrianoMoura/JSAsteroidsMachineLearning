import Asteroid from "../sprites/asteroid";

export default class AsteroidsCollection {
    constructor(total) {
        this.total = total

        this.asteroids = []

        this.createAsteroids()
    }

    createAsteroids() {
        for (let i = 0; i < this.total; i++) {
            this.asteroids.push(new Asteroid())
        }
    }

    draw() {
        for (let i = 0; i < this.asteroids.length; i++) {
            this.asteroids[i].draw()
        }
    }

    addAsteroids(asteroid) {
        this.asteroids.push(...asteroid)
    }

    splitAsteroid(asteroid, newAsteroids) {
        
        newAsteroids && this.addAsteroids(newAsteroids)

        this.asteroids = this.asteroids.filter(a => a !== asteroid)
    }
}