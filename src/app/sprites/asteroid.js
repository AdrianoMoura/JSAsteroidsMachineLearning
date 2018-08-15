import Entity from "./entity";

export default class Asteroid extends Entity {
    constructor(pos, size) {
        super()

        this.size = size || 3
        this.vel = p5.createVector(p5.random(-3, 3), p5.random(-3, 3))
        this.vel.mult(p5.map(this.size, 1, 3, 1, .8))
        this.radius = p5.map(this.size, 1, 3, 10, 50)

        this.pos = pos ? pos.copy() : this.generateRandomPos()

        this.sides = p5.floor(p5.random(8, 15))
        this.shape = Array.from({ length: this.sides }, () => p5.random(-this.radius * .3, this.radius * .3));
    }

    generateRandomPos() {
        let isColliding = true
        let pos
        let dist
        let preventPos 

        // Generate an random position for asteroids, but check if this position collide with players position if so generate a new position until is safe to start the game
        while (isColliding) {
            pos = p5.createVector(p5.random(canvasWidth), p5.random(canvasHeight))

            preventPos = generation.getActualSpecimen().pos.copy()
            
            dist = p5.dist(pos.x, pos.y, preventPos.x, preventPos.y)

            if (dist > this.radius * 2 + 10) {
                isColliding = false
            }
        }
        return pos
    }

    split() {
        let newAsteroids;

        if (this.size > 1)
            newAsteroids = [
                new Asteroid(this.pos, this.size - 1),
                new Asteroid(this.pos, this.size - 1)
            ]

        switch (this.size) {
            case 1:
                soundController.smallExplosion()
                break
            case 2:
                soundController.mediumExplosion()
                break
            case 3:
                soundController.bigExplosion()
                break
        }

        gameController.makePoint(this.size)
        dustCollection.addDust(this.pos, this.radius)
        asteroidsCollection.splitAsteroid(this, newAsteroids);
    }

    hits(laser) {
        const laserPos = laser.pos.copy()

        const dist = p5.dist(laserPos.x, laserPos.y, this.pos.x, this.pos.y)

        if (dist < this.radius + laser.radius) {
            this.split()

            return true
        }

        return false
    }

    render() {
        p5.push()
        p5.noFill()
        p5.stroke(255)

        p5.translate(this.pos.x, this.pos.y)
        p5.beginShape()

        this.shape.forEach((v, i) => {
            let angle = p5.map(i, 0, this.sides, 0, p5.TWO_PI)
            let size = this.radius + v
            p5.vertex(size * p5.cos(angle), size * p5.sin(angle))
        })

        p5.endShape(p5.CLOSE)
        p5.pop()
    }
}